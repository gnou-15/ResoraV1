import { describe, it, expect } from 'vitest';
import { defaultResume, isResumeEmpty } from '../data/defaultResume';

describe('isResumeEmpty', () => {
  it('returns true for the raw defaultResume template (all blank fields)', () => {
    expect(isResumeEmpty(defaultResume)).toBe(true);
  });

  it('returns true for null', () => {
    expect(isResumeEmpty(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isResumeEmpty(undefined)).toBe(true);
  });

  it('returns true when personal fields filled but no content fields', () => {
    const resume = {
      ...defaultResume,
      personal: { fullName: 'Daniel Mapano', email: 'test@test.com', phoneNumber: '09123456789' },
    };
    // Personal-only does not count as having resume content
    expect(isResumeEmpty(resume)).toBe(true);
  });

  it('returns false when headline is set', () => {
    const resume = { ...defaultResume, headline: 'Software Developer' };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when summary is set', () => {
    const resume = { ...defaultResume, summary: 'Experienced full-stack developer.' };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when technicalSkills has at least one entry', () => {
    const resume = {
      ...defaultResume,
      technicalSkills: { languages: ['JavaScript'], frameworks: [], tools: [], databases: [], cloud: [] },
    };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when experience has a real entry', () => {
    const resume = {
      ...defaultResume,
      experience: [{ id: '1', company: 'Acme Corp', title: 'Engineer', bullets: ['Did stuff'] }],
    };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns true when experience entries exist but all are blank', () => {
    const resume = {
      ...defaultResume,
      experience: [{ id: '1', company: '', title: '', bullets: [''] }],
    };
    expect(isResumeEmpty(resume)).toBe(true);
  });

  it('returns false when education has a school name', () => {
    const resume = {
      ...defaultResume,
      education: [{ id: '1', school: 'UP Diliman', degree: 'BS CS', field: '', endDate: '', gpa: '', coursework: '' }],
    };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when projects has a named entry', () => {
    const resume = {
      ...defaultResume,
      projects: [{ id: '1', name: 'My Portfolio', link: '', stack: '', bullets: [''] }],
    };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when certifications has a named entry', () => {
    const resume = {
      ...defaultResume,
      certifications: [{ id: '1', name: 'AWS Solutions Architect', issuer: 'Amazon', date: '' }],
    };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when achievements has a titled entry', () => {
    const resume = {
      ...defaultResume,
      achievements: [{ id: '1', title: "Dean's Lister", organization: 'UP', date: '', distinction: '', bullets: [] }],
    };
    expect(isResumeEmpty(resume)).toBe(false);
  });

  it('returns false when general skills string is non-empty', () => {
    const resume = { ...defaultResume, skills: 'React, Node.js, PostgreSQL' };
    expect(isResumeEmpty(resume)).toBe(false);
  });
});
