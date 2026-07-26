-- Safe migration query to update the CHECK constraint if the table already exists
ALTER TABLE public.gcash_payments DROP CONSTRAINT IF EXISTS gcash_payments_status_check;
ALTER TABLE public.gcash_payments ADD CONSTRAINT gcash_payments_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'rejected_notified', 'completed'));

-- Create GCash Payments Table
CREATE TABLE IF NOT EXISTS public.gcash_payments (
    reference_number text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    amount numeric,
    plan_name text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'rejected_notified', 'completed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gcash_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Users can insert their own payment requests
DROP POLICY IF EXISTS "Users can insert own payments" ON public.gcash_payments;
CREATE POLICY "Users can insert own payments" ON public.gcash_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Users can read their own payment records
DROP POLICY IF EXISTS "Users can read own payments" ON public.gcash_payments;
CREATE POLICY "Users can read own payments" ON public.gcash_payments
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Users can update their own payments (to claim/complete them or acknowledge rejections)
DROP POLICY IF EXISTS "Users can update own payments" ON public.gcash_payments;
CREATE POLICY "Users can update own payments" ON public.gcash_payments
    FOR UPDATE USING (auth.uid() = user_id AND status IN ('approved', 'rejected'))
    WITH CHECK (status IN ('completed', 'rejected_notified'));

-- 4. Public/Anonymous can search payments by reference number (specifically for checking verification status)
DROP POLICY IF EXISTS "Allow selecting status by reference number" ON public.gcash_payments;
CREATE POLICY "Allow selecting status by reference number" ON public.gcash_payments
    FOR SELECT USING (true);

-- 5. Admin users can update any payment submission (to approve or reject)
DROP POLICY IF EXISTS "Admins can update payments" ON public.gcash_payments;
CREATE POLICY "Admins can update payments" ON public.gcash_payments
    FOR UPDATE USING (auth.jwt() ->> 'email' = 'nezer.resora@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'nezer.resora@gmail.com');


-- =========================================================================
-- RPC 1: Webhook called by Phone SMS Gateway
-- Matches and pre-approves or approves transactions automatically from SMS text
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_gcash_sms(sender text, message text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ref_no text;
    v_amount numeric;
    v_plan_name text;
    v_user_id uuid;
    v_email text;
BEGIN
    -- Only process messages from GCash or 2882
    IF sender NOT IN ('GCash', '2882', '2882-GCASH') THEN
        RETURN json_build_object('success', false, 'error', 'Invalid sender: ' || sender);
    END IF;

    -- Extract amount using regex.
    -- Covers: "You have received 199.00 of GCash", "You have received PHP 179.00", "received Php 199.00"
    v_amount := substring(message from 'received\s+(?:Php|PHP\s*)?([0-9,]+\.[0-9]{2})');
    IF v_amount IS NULL THEN
        v_amount := substring(message from 'received\s+([0-9,]+\.[0-9]{2})');
    END IF;

    -- Extract reference number (13 digits)
    -- Covers: "Ref. No. 5012345678901", "Ref No. 5012345678901", "Ref: 5012345678901"
    v_ref_no := substring(message from '(?i)Ref\s*(?:\.|:)?\s*No\s*(?:\.|:)?\s*(\d{13})');
    IF v_ref_no IS NULL THEN
        v_ref_no := substring(message from '\d{13}');
    END IF;

    -- Check parsed values
    IF v_ref_no IS NULL OR v_amount IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Could not parse amount or reference number');
    END IF;

    -- Map GCash amount to corresponding plans
    IF v_amount >= 119.00 THEN
        v_plan_name := 'premium_pro';
    ELSE
        RETURN json_build_object('success', false, 'error', 'Insufficient amount: ₱' || v_amount);
    END IF;

    -- Match against existing pending payment inserted by client
    UPDATE public.gcash_payments
    SET status = 'approved', amount = v_amount, plan_name = v_plan_name
    WHERE reference_number = v_ref_no
    RETURNING user_id, email INTO v_user_id, v_email;

    -- If the row did NOT exist (phone registered SMS before client submitted),
    -- pre-approve the reference number so it can be claimed by the client later.
    IF NOT FOUND THEN
        INSERT INTO public.gcash_payments (reference_number, user_id, email, amount, plan_name, status)
        VALUES (v_ref_no, NULL, 'pre-approved', v_amount, v_plan_name, 'approved');
    END IF;

    RETURN json_build_object(
        'success', true, 
        'reference_number', v_ref_no, 
        'amount', v_amount, 
        'plan', v_plan_name
    );
END;
$$;


-- =========================================================================
-- RPC 2: Verifier called by Vite frontend client
-- Claims an approved transaction and updates status to completed
-- =========================================================================
CREATE OR REPLACE FUNCTION public.verify_and_claim_payment(ref_no text, current_user_id uuid, current_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_plan text;
    v_amount numeric;
BEGIN
    -- Lookup transaction
    SELECT status, plan_name, amount INTO v_status, v_plan, v_amount
    FROM public.gcash_payments
    WHERE reference_number = ref_no;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'not_found');
    END IF;

    IF v_status = 'completed' THEN
        RETURN json_build_object('success', false, 'error', 'already_used');
    END IF;

    IF v_status IN ('rejected', 'rejected_notified') THEN
        RETURN json_build_object('success', false, 'error', 'rejected');
    END IF;

    -- Transition approved payment to completed and claim it
    IF v_status = 'approved' THEN
        UPDATE public.gcash_payments
        SET status = 'completed', user_id = current_user_id, email = current_email
        WHERE reference_number = ref_no;
        
        RETURN json_build_object('success', true, 'plan_name', v_plan, 'amount', v_amount);
    END IF;

    -- Still awaiting SMS
    IF v_status = 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'pending');
    END IF;

    RETURN json_build_object('success', false, 'error', 'invalid_state');
END;
$$;
