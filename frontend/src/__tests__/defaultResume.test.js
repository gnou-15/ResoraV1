import { describe, it, expect } from 'vitest';
import { defaultResume, isResumeEmpty, getResumeFillScore, hasSufficientContent } from '../data/defaultResume';

// ── isResumeEmpty ─────────────────────────────────────────────────────────────
// isResumeEmpty is now true only when score === 0 (no user-identifiable fields).
// Template-seeded fields (headline, summary, skills, degree, coursework) don't count.

describe('isResumeEmpty', () => {
  it('returns true for the raw defaultResume template (score = 0)', () => {
    expect(isResumeEmpty(defaultResume)).toBe(true);
  });

  it('returns true for null', () => {
    expect(isResumeEmpty(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isResumeEmpty(undefined)).toBe(true);
  });

  it('returns true when ONLY template-seeded fields are filled (headline, summary, skills, degree, coursework)', () => {
    // This is the EDUCATION_TEMPLATE scenario — the user has NOT touched anything personal
    const educationTemplateResume = {
      ...defaultResume,
      headline: 'Teacher | Classroom Instruction & Curriculum Development',
      summary: 'Dedicated educator experienced in lesson planning...',
      skills: 'Curriculum Design, Assessment, Classroom Management',
      education: [{ id: '1', school: '', degree: 'B.Ed. / M.Ed.', field: '', endDate: '', coursework: 'Curriculum, Assessment' }],
    };
    expect(isResumeEmpty(educationTemplateResume)).toBe(true);
  });

  it('returns false when email is filled (score > 0)', () => {
    const resume = { ...defaultResume, personal: { ...defaultResume.personal, email: 'daniel@mapano.dev' } };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when phone is filled', () => {
    const resume = { ...defaultResume, personal: { ...defaultResume.personal, phoneNumber: '09171234567' } };
    expect(isResumeEmpty(resume)).toBe(false);
  });
});

// ── getResumeFillScore ────────────────────────────────────────────────────────

describe('getResumeFillScore', () => {
  it('returns 0 for null', () => {
    expect(getResumeFillScore(null)).toBe(0);
  });

  it('returns 0 for the blank defaultResume', () => {
    expect(getResumeFillScore(defaultResume)).toBe(0);
  });

  it('returns 0 for a template-only resume (headline/summary/skills/degree filled by template)', () => {
    const templateResume = {
      ...defaultResume,
      headline: 'Teacher | Classroom Instruction',
      summary: 'Dedicated educator...',
      skills: 'Curriculum Design',
      education: [{ school: '', degree: 'B.Ed.', coursework: 'Curriculum' }],
    };
    expect(getResumeFillScore(templateResume)).toBe(0);
  });

  it('scores 10 pts for a real email address', () => {
    const resume = { ...defaultResume, personal: { ...defaultResume.personal, email: 'daniel@test.com' } };
    expect(getResumeFillScore(resume)).toBe(10);
  });

  it('scores 8 pts for a phone number', () => {
    const resume = { ...defaultResume, personal: { ...defaultResume.personal, phoneNumber: '09171234567' } };
    expect(getResumeFillScore(resume)).toBe(8);
  });

  it('scores 7 pts for city/province in location', () => {
    const resume = {
      ...defaultResume,
      personal: { ...defaultResume.personal, location: { ...defaultResume.personal.location, city: 'Manila' } }
    };
    expect(getResumeFillScore(resume)).toBe(7);
  });

  it('scores 10 pts for linkedin/github/portfolio', () => {
    const resume = { ...defaultResume, personal: { ...defaultResume.personal, linkedin: 'linkedin.com/in/daniel' } };
    expect(getResumeFillScore(resume)).toBe(10);
  });

  it('scores 20 pts for 1 real experience entry (company + title both filled)', () => {
    const resume = {
      ...defaultResume,
      experience: [{ id: '1', company: 'Acme Corp', title: 'Engineer', location: '', startDate: '', endDate: '', current: false, bullets: [''] }],
    };
    expect(getResumeFillScore(resume)).toBe(20);
  });

  it('does NOT score experience entry when company OR title is blank (template default)', () => {
    // Healthcare template has title='Registered Nurse' but company=''
    const resume = {
      ...defaultResume,
      experience: [{ id: '1', company: '', title: 'Registered Nurse', location: '', startDate: '', endDate: '', current: false, bullets: ['Provided care'] }],
    };
    expect(getResumeFillScore(resume)).toBe(0);
  });

  it('scores 30 pts for 2+ real experience entries', () => {
    const resume = {
      ...defaultResume,
      experience: [
        { id: '1', company: 'Acme Corp', title: 'Engineer', bullets: [''] },
        { id: '2', company: 'Beta Inc', title: 'Senior Engineer', bullets: [''] },
      ],
    };
    expect(getResumeFillScore(resume)).toBe(30);
  });

  it('scores 15 pts for a real school name in education', () => {
    const resume = {
      ...defaultResume,
      education: [{ id: '1', school: 'UP Diliman', degree: 'BS CS', field: '' }],
    };
    expect(getResumeFillScore(resume)).toBe(15);
  });

  it('does NOT score education when school is blank (template default behavior)', () => {
    // Education template leaves school = ''
    const resume = {
      ...defaultResume,
      education: [{ id: '1', school: '', degree: 'B.Ed. / M.Ed.', coursework: 'Curriculum, Assessment' }],
    };
    expect(getResumeFillScore(resume)).toBe(0);
  });

  it('scores 10 pts for a real project name', () => {
    const resume = {
      ...defaultResume,
      projects: [{ id: '1', name: 'Portfolio Site', link: '', stack: 'React', bullets: [''] }],
    };
    expect(getResumeFillScore(resume)).toBe(10);
  });

  it('scores 10 pts for a real certification name', () => {
    const resume = {
      ...defaultResume,
      certifications: [{ id: '1', name: 'AWS Solutions Architect', issuer: 'Amazon', date: '' }],
    };
    expect(getResumeFillScore(resume)).toBe(10);
  });

  it('caps at 100', () => {
    // A very complete resume
    const resume = {
      ...defaultResume,
      personal: {
        fullName: 'Daniel Mapano',
        email: 'daniel@mapano.dev',
        phoneNumber: '09171234567',
        phoneCountry: 'PH',
        location: { country: 'PH', state: 'NCR', city: 'Manila', barangay: '', street: '' },
        linkedin: 'linkedin.com/in/daniel',
        github: 'github.com/daniel',
        portfolio: '',
      },
      experience: [
        { id: '1', company: 'Acme Corp', title: 'Engineer', bullets: ['Built things'] },
        { id: '2', company: 'Beta Inc', title: 'Senior Engineer', bullets: ['Led team'] },
      ],
      education: [{ id: '1', school: 'UP Diliman', degree: 'BS CS', field: '' }],
      projects: [{ id: '1', name: 'Portfolio', link: '', stack: 'React', bullets: [''] }],
      certifications: [{ id: '1', name: 'AWS', issuer: 'Amazon', date: '' }],
    };
    expect(getResumeFillScore(resume)).toBeLessThanOrEqual(100);
    expect(getResumeFillScore(resume)).toBeGreaterThanOrEqual(40);
  });
});

// ── hasSufficientContent ──────────────────────────────────────────────────────

describe('hasSufficientContent (≥40 threshold)', () => {
  it('returns false for blank defaultResume (score = 0)', () => {
    expect(hasSufficientContent(defaultResume)).toBe(false);
  });

  it('returns false for a template-only resume (Education template with no user data)', () => {
    const educationTemplateResume = {
      ...defaultResume,
      headline: 'Teacher | Classroom Instruction & Curriculum Development',
      summary: 'Dedicated educator...',
      skills: 'Curriculum Design, Assessment, Classroom Management',
      education: [{ school: '', degree: 'B.Ed. / M.Ed.', coursework: 'Curriculum, Assessment' }],
    };
    expect(hasSufficientContent(educationTemplateResume)).toBe(false);
  });

  it('returns false when only email + phone filled (score = 18, below 40)', () => {
    const resume = {
      ...defaultResume,
      personal: { ...defaultResume.personal, email: 'daniel@test.com', phoneNumber: '09171234567' },
    };
    // score = 10 (email) + 8 (phone) = 18
    expect(hasSufficientContent(resume)).toBe(false);
  });

  it('returns true when email + phone + city + 1 real experience entry (score = 45)', () => {
    const resume = {
      ...defaultResume,
      personal: {
        ...defaultResume.personal,
        email: 'daniel@test.com',
        phoneNumber: '09171234567',
        location: { ...defaultResume.personal.location, city: 'Manila' },
      },
      experience: [{ id: '1', company: 'Acme Corp', title: 'Engineer', bullets: [''] }],
    };
    // score = 10 + 8 + 7 + 20 = 45
    expect(hasSufficientContent(resume)).toBe(true);
  });

  it('returns true for a properly filled resume', () => {
    const resume = {
      ...defaultResume,
      personal: {
        fullName: 'Daniel Mapano',
        email: 'daniel@mapano.dev',
        phoneNumber: '09171234567',
        phoneCountry: 'PH',
        location: { country: 'PH', state: 'NCR', city: 'Manila', barangay: '', street: '' },
        linkedin: 'linkedin.com/in/daniel',
        github: '',
        portfolio: '',
      },
      education: [{ id: '1', school: 'UP Diliman', degree: 'BS CS', field: '' }],
    };
    // score = 10 + 8 + 7 + 10 + 15 = 50
    expect(hasSufficientContent(resume)).toBe(true);
  });
});
