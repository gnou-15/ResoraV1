import { useState, useEffect } from "react";
import InteractiveAuthPattern from "../components/InteractiveAuthPattern";
import "../css/App.css";
import { supabase } from "../services/supabase";
import { encryptName } from "../services/encryption";

export default function Auth({ user, onNavigate, onSuccessNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    termsAgree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameErrors, setNameErrors] = useState({});
  const [updatingName, setUpdatingName] = useState(false);

  useEffect(() => {
    if (user) {
      let fName = user.user_metadata?.first_name || user.user_metadata?.given_name || "";
      let lName = user.user_metadata?.last_name || user.user_metadata?.family_name || "";

      if (!fName && !lName && user.user_metadata?.full_name) {
        const parts = user.user_metadata.full_name.trim().split(/\s+/);
        if (parts.length > 1) {
          fName = parts.slice(0, -1).join(" ");
          lName = parts[parts.length - 1];
        } else {
          fName = parts[0] || "";
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(fName);
      setLastName(lName);
    }
  }, [user]);
  // Pre-fill email and check for OAuth redirect errors
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }

    // Check for OAuth redirect errors in the URL hash or search params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);

    const errorCode = hashParams.get("error_code") || searchParams.get("error_code");
    const errorDesc = hashParams.get("error_description") || searchParams.get("error_description");
    const errorMsg = hashParams.get("error") || searchParams.get("error");

    if (errorCode || errorDesc || errorMsg) {
      let finalMsg = errorDesc || errorMsg || "An error occurred during authentication.";
      if (errorCode === "identity_already_exists" || finalMsg.toLowerCase().includes("already exists")) {
        finalMsg = "An account with this email already exists using another sign-in method. Please use your original login method.";
      }
      setErrors({ form: decodeURIComponent(finalMsg.replace(/\+/g, " ")) });
      // Clear the hash from the URL to prevent showing the error again on refresh
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setSuccess(true);
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
      }));
    } else {
      setSuccess(false);
      setIsLogin(true); // Reset to Login card on signout/logout
      const savedEmail = localStorage.getItem("rememberedEmail") || "";
      setFormData({
        name: "",
        email: savedEmail,
        password: "",
        confirmPassword: "",
        rememberMe: !!savedEmail,
        termsAgree: false,
      });
      setErrors({});
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Email validate
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validate
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      // Name validate
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required";
      }

      // Confirm password validate
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Terms agreement check
      if (!formData.termsAgree) {
        newErrors.termsAgree = "You must agree to the Terms & Conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          const errMsg = error.message === "Failed to fetch"
            ? "Connection error: Failed to connect to Supabase. Please verify your Supabase credentials in your .env file."
            : error.message;
          setErrors({ form: errMsg });
          setLoading(false);
        } else {
          if (formData.rememberMe) {
            localStorage.setItem("rememberedEmail", formData.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }
          setLoading(false);
          setSuccess(true);
        }
      } else {
        // 1. Call Supabase Auth to register the user
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name, // Plaintext fallback during initial registration
            },
          },
        });

        // 2. Handle errors returned by the signup call
        if (error) {
          const errMsg = error.message === "Failed to fetch"
            ? "Connection error: Failed to connect to Supabase. Please verify your Supabase credentials in your .env file."
            : error.message;
          setErrors({ form: errMsg });
          setLoading(false);
        } else if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          setErrors({ form: "An account with this email address already exists." });
          setLoading(false);
        } else {
          // 3. Signup was successful! Try to encrypt and store the full_name metadata immediately
          if (data?.user) {
            try {
              const encryptedFullName = encryptName(formData.name, data.user.id);
              await supabase.auth.updateUser({
                data: {
                  full_name: encryptedFullName
                }
              });
            } catch (err) {
              // Silently ignore session/auth errors if email confirmation is required first
            }
          }
          setLoading(false);
          setSuccess(true);
        }
      }


    } catch (err) {
      const errMsg = (err && (err.message === "Failed to fetch" || (err.message && err.message.includes("Failed to fetch"))))
        ? "Connection error: Failed to connect to Supabase. Please verify your Supabase credentials in your .env file."
        : "An unexpected error occurred. Please try again.";
      setErrors({ form: errMsg });
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        const errMsg = error.message === "Failed to fetch"
          ? "Connection error: Failed to connect to Supabase. Please verify your Supabase credentials in your .env file."
          : error.message;
        setErrors({ form: errMsg });
        setLoading(false);
      }
    } catch (err) {
      const errMsg = (err && (err.message === "Failed to fetch" || (err.message && err.message.includes("Failed to fetch"))))
        ? "Connection error: Failed to connect to Supabase. Please verify your Supabase credentials in your .env file."
        : "An unexpected error occurred during Google sign-in.";
      setErrors({ form: errMsg });
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";

    const nameRegex = /^[a-zA-Z\s.-]{2,}$/;
    if (firstName.trim() && !nameRegex.test(firstName.trim())) {
      newErrors.firstName = "First name format is invalid";
    }
    if (lastName.trim() && !nameRegex.test(lastName.trim())) {
      newErrors.lastName = "Last name format is invalid";
    }

    if (Object.keys(newErrors).length > 0) {
      setNameErrors(newErrors);
      return;
    }

    setUpdatingName(true);
    setNameErrors({});

    try {
      // Encrypt the First Name, Last Name, and Full Name using user's UUID
      const encryptedFirstName = encryptName(firstName.trim(), user.id);
      const encryptedLastName = encryptName(lastName.trim(), user.id);
      const encryptedFullName = encryptName(`${firstName.trim()} ${lastName.trim()}`, user.id);

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: encryptedFirstName,
          last_name: encryptedLastName,
          full_name: encryptedFullName
        }
      });

      if (error) {
        setNameErrors({ form: error.message });
        setUpdatingName(false);
      } else {
        setUpdatingName(false);
        if (onSuccessNavigate) {
          onSuccessNavigate("landing");
        } else if (onNavigate) {
          onNavigate("landing");
        }
      }
    } catch {
      setNameErrors({ form: "An unexpected error occurred. Please try again." });
      setUpdatingName(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
      termsAgree: false,
    });
    setSuccess(false);
  };



  return (
    <div className="auth-page-container">
      <div className="auth-split-layout">

        {/* Left Side: Form */}
        <div className="auth-form-column">
          <div className="auth-form-wrapper">

            {/* Logo and Back Action */}
            <div className="auth-header-row">
              <div
                className="auth-logo-header"
                style={{ cursor: isLogin ? "pointer" : "default" }}
                onClick={() => isLogin && onNavigate && onNavigate("landing")}
              >
                <svg className="auth-logo-svg" width="36" height="36" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="authHeaderBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>
                  {/* Body */}
                  <circle cx="17" cy="21" r="9.5" fill="url(#authHeaderBodyGrad)" />
                  {/* Hat Brim */}
                  <rect x="6" y="9.5" width="22" height="2.5" rx="0.8" fill="#1e293b" />
                  {/* Hat Ribbon */}
                  <rect x="10" y="8" width="14" height="1.5" fill="#f97316" />
                  {/* Hat Crown */}
                  <rect x="10" y="1" width="14" height="7" rx="1" fill="#1e293b" />
                  {/* Eyes */}
                  <circle cx="13.5" cy="19" r="2.2" fill="#ffffff" />
                  <circle cx="13.5" cy="19" r="1.1" fill="#0f172a" />
                  <circle cx="20.5" cy="19" r="2.2" fill="#ffffff" />
                  <circle cx="20.5" cy="19" r="1.1" fill="#0f172a" />
                  {/* Monocle */}
                  <circle cx="20.5" cy="19" r="3.6" stroke="#f59e0b" strokeWidth="0.9" fill="none" />
                  <path d="M23.5 21.5 C25 24 24 26 22 28.5" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1.2 0.8" fill="none" />
                  {/* Mustache */}
                  <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
                </svg>
                <h1 className="auth-logo-text">Resora</h1>
              </div>

              {isLogin && (
                <button
                  type="button"
                  className="auth-back-link-btn"
                  onClick={() => onNavigate && onNavigate("landing")}
                >
                  ← Back to Home
                </button>
              )}
            </div>

            {success ? (
              <div className="auth-success-screen animate-fade-in">
                {user && (!user.user_metadata?.first_name || !user.user_metadata?.last_name) ? (
                  <form onSubmit={handleNameSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="success-icon-badge">
                      <svg viewBox="0 0 24 24" width="48" height="48">
                        <circle cx="12" cy="12" r="10" fill="#ffedd5" />
                        <path d="M12 6V14M12 18H12.01" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      </svg>
                    </div>
                    <h2 className="success-title" style={{ marginBottom: "0.5rem" }}>
                      Complete Your Profile
                    </h2>
                    <p className="success-desc" style={{ marginBottom: "1.2rem" }}>
                      Please enter your first and last name to complete your registration.
                    </p>

                    <div className="auth-name-notice" style={{
                      padding: "0.85rem",
                      backgroundColor: "#fff7ed",
                      border: "1px solid #ffedd5",
                      color: "#9a3412",
                      fontSize: "0.82rem",
                      borderRadius: "8px",
                      marginBottom: "1.2rem",
                      lineHeight: "1.45",
                      textAlign: "left",
                      width: "100%"
                    }}>
                      <strong>Notice:</strong> Your name will be automatically placed in the resume builder and <strong>cannot be edited later</strong>. Please make sure it is correct.
                    </div>

                    {nameErrors.form && (
                      <div className="auth-error-alert" style={{ padding: "0.8rem", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "0.88rem", borderRadius: "6px", marginBottom: "1.2rem", textAlign: "left", width: "100%" }}>
                        {nameErrors.form}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", width: "100%" }}>
                      <div className="auth-input-group" style={{ flex: 1, marginBottom: 0, textAlign: "left" }}>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (nameErrors.firstName) setNameErrors(prev => ({ ...prev, firstName: "" }));
                          }}
                          placeholder=" "
                          className={`auth-input ${nameErrors.firstName ? "error" : ""}`}
                          disabled={updatingName}
                        />
                        <label className="auth-label">First Name <span className="req">*</span></label>
                        {nameErrors.firstName && <span className="auth-error-msg">{nameErrors.firstName}</span>}
                      </div>
                      <div className="auth-input-group" style={{ flex: 1, marginBottom: 0, textAlign: "left" }}>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (nameErrors.lastName) setNameErrors(prev => ({ ...prev, lastName: "" }));
                          }}
                          placeholder=" "
                          className={`auth-input ${nameErrors.lastName ? "error" : ""}`}
                          disabled={updatingName}
                        />
                        <label className="auth-label">Last Name <span className="req">*</span></label>
                        {nameErrors.lastName && <span className="auth-error-msg">{nameErrors.lastName}</span>}
                      </div>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={updatingName} style={{ marginTop: "0.5rem", width: "100%" }}>
                      {updatingName ? (
                        <span className="auth-spinner"></span>
                      ) : (
                        "Save & Go to Dashboard"
                      )}
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="success-icon-badge">
                      <svg viewBox="0 0 24 24" width="48" height="48">
                        <circle cx="12" cy="12" r="10" fill="#ffedd5" />
                        <path d="M8 12.5 L11 15.5 L16 9" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                    <h2 className="success-title">
                      {isLogin ? "Welcome back!" : "Verify your Email"}
                    </h2>
                    <p className="success-desc">
                      {isLogin
                        ? `Successfully logged in as ${formData.email}. You now have full access to create & edit your resumes.`
                        : `We have sent a confirmation link to ${formData.email}. Please check your inbox and click the link to confirm your email before logging in.`
                      }
                    </p>
                    <button
                      type="button"
                      className="auth-btn-primary"
                      onClick={() => {
                        if (isLogin) {
                          if (onSuccessNavigate) {
                            onSuccessNavigate("landing");
                          } else if (onNavigate) {
                            onNavigate("landing");
                          }
                        } else {
                          setIsLogin(true);
                          setSuccess(false);
                          setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
                        }
                      }}
                    >
                      {isLogin ? "Go to Dashboard" : "Return to Sign In"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="auth-form-content">
                <div className="auth-heading-block">
                  <h2 className="auth-title">
                    {isLogin ? "Welcome back !" : "Create your account"}
                  </h2>
                  <p className="auth-subtitle">
                    {isLogin
                      ? "Enter to get unlimited access to data & information."
                      : "Join us and build a professional, ATS-optimized resume in seconds."
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form-el">
                  {errors.form && (
                    <div className="auth-error-alert" style={{ padding: "0.8rem", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "0.88rem", borderRadius: "6px", marginBottom: "1.2rem" }}>
                      {errors.form}
                    </div>
                  )}
                  {/* Name field (Signup only) */}
                  {!isLogin && (
                    <div className="auth-input-group">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder=" "
                        className={`auth-input ${errors.name ? "error" : ""}`}
                        disabled={loading}
                      />
                      <label className="auth-label">Name <span className="req">*</span></label>
                      {errors.name && <span className="auth-error-msg">{errors.name}</span>}
                    </div>
                  )}

                  {/* Email field */}
                  <div className="auth-input-group">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder=" "
                      className={`auth-input ${errors.email ? "error" : ""}`}
                      disabled={loading}
                    />
                    <label className="auth-label">Email <span className="req">*</span></label>
                    {errors.email && <span className="auth-error-msg">{errors.email}</span>}
                  </div>

                  {/* Password field */}
                  <div className="auth-input-group">
                    <div className="auth-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder=" "
                        className={`auth-input ${errors.password ? "error" : ""}`}
                        disabled={loading}
                      />
                      <label className="auth-label">Password <span className="req">*</span></label>
                      <button
                        type="button"
                        className="auth-password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          /* Open eye */
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          /* Eye with slash */
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <span className="auth-error-msg">{errors.password}</span>}
                  </div>

                  {/* Confirm Password (Signup only) */}
                  {!isLogin && (
                    <div className="auth-input-group">
                      <div className="auth-password-wrapper">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder=" "
                          className={`auth-input ${errors.confirmPassword ? "error" : ""}`}
                          disabled={loading}
                        />
                        <label className="auth-label">Confirm Password <span className="req">*</span></label>
                        <button
                          type="button"
                          className="auth-password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword}</span>}
                    </div>
                  )}

                  {/* Actions line: Checkboxes & links */}
                  <div className="auth-actions-row">
                    {isLogin ? (
                      <>
                        <label className="auth-checkbox-label">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            className="auth-checkbox-input"
                            disabled={loading}
                          />
                          <span className="auth-checkbox-text">Remember me</span>
                        </label>
                        <a href="#" className="auth-forgot-link" onClick={(e) => e.preventDefault()}>
                          Forgot your password ?
                        </a>
                      </>
                    ) : (
                      <div className="auth-checkbox-full">
                        <label className="auth-checkbox-label">
                          <input
                            type="checkbox"
                            name="termsAgree"
                            checked={formData.termsAgree}
                            onChange={handleInputChange}
                            className="auth-checkbox-input"
                            disabled={loading}
                          />
                          <span className="auth-checkbox-text">
                            I certify that I have read, understood, and agree to the <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="auth-inline-link">Terms & Conditions</a> of using Resora, including the collection and usage of my personal data.
                          </span>
                        </label>
                        {errors.termsAgree && <span className="auth-error-msg block">{errors.termsAgree}</span>}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="auth-btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="auth-spinner"></span>
                    ) : (
                      isLogin ? "Log In" : "Sign Up"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                  <span className="auth-divider-text">
                    {isLogin ? "Or, Login with" : "Or, Sign up with"}
                  </span>
                </div>

                {/* Google SSO Button */}
                <button
                  type="button"
                  className="auth-btn-google"
                  onClick={handleGoogleSubmit}
                  disabled={loading}
                >
                  <svg className="google-svg-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </button>

                {/* Toggle Mode footer */}
                <p className="auth-footer-text">
                  {isLogin ? "Don't have an account ?" : "Already have an account ?"}
                  {" "}
                  <button type="button" className="auth-link-btn" onClick={toggleMode}>
                    {isLogin ? "Register here" : "Login here"}
                  </button>
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Interactive SVGs */}
        <div className="auth-pattern-column">
          <InteractiveAuthPattern />
        </div>

      </div>

      {showTermsModal && (
        <div className="auth-gate-modal-overlay" style={{ zIndex: 4000 }}>
          <div className="auth-gate-modal-box" style={{ maxWidth: "550px", textAlign: "left" }}>
            <h2 className="auth-gate-title">Terms & Conditions</h2>
            <div className="terms-content" style={{ maxHeight: "300px", overflowY: "auto", margin: "1.5rem 0", fontSize: "0.88rem", color: "#475569", lineHeight: "1.6", paddingRight: "8px" }}>
              <p style={{ fontWeight: 600, color: "#1e293b", marginTop: 0 }}>Welcome to Resora! By creating an account, you agree to the following terms:</p>

              <h3 style={{ fontSize: "1rem", color: "#0f172a", margin: "1rem 0 0.5rem" }}>1. Acceptance of Terms</h3>
              <p>By creating an account, accessing, or using Resora, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, you must not access or use the platform.</p>

              <h3 style={{ fontSize: "1rem", color: "#0f172a", margin: "1rem 0 0.5rem" }}>2. Purpose of Service</h3>
              <p>Resora provides tools and services to assist users in building, formatting, and storing professional, ATS-optimized resumes. Resora is for personal, non-commercial use only.</p>

              <h3 style={{ fontSize: "1rem", color: "#0f172a", margin: "1rem 0 0.5rem" }}>3. Data Privacy & Storage</h3>
              <p>Your resume data is stored securely in our database. We value your privacy and will never sell, lease, or distribute your personal details or resume data to any third-party marketing services. To guarantee total security, all of your sensitive input data—including your name, email, phone number, and complete resume details—is automatically encrypted client-side on your device using advanced AES-256 encryption before being stored, ensuring your data is completely unreadable to unauthorized parties.</p>

              <h3 style={{ fontSize: "1rem", color: "#0f172a", margin: "1rem 0 0.5rem" }}>4. Disclaimers</h3>
              <p>While Resora strives to provide tools that optimize resume formatting for ATS systems, we do not guarantee job interviews, employment offers, or specific career outcomes.</p>
            </div>
            <button
              type="button"
              className="auth-gate-btn-primary"
              style={{ width: "100%", padding: "0.85rem", borderRadius: "8px" }}
              onClick={() => setShowTermsModal(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
