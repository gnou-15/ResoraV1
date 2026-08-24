import { describe, it, expect } from 'vitest';
import { analyzeResume, getCachedAnalysis, setCachedAnalysis, getResumeSignature } from '../services/aiScorer';

describe('AI Scorer Service', () => {
  it('should return a score object with valid properties when given candidate data', () => {
    const resumeData = {
      fullName: 'Jane Doe',
      experience: [
        { title: 'Software Engineer', description: 'Developed React app and optimized performance by 40%' }
      ],
      skills: ['React', 'JavaScript', 'Node.js']
    };

    const profession = 'it';

    const result = analyzeResume(resumeData, profession);
    
    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.acceptancePercentage).toBeDefined();
  });

  it('should store and retrieve cached analysis when resume signature matches', () => {
    const resumeData = {
      personal: { fullName: 'John Smith' },
      experience: [],
      skills: ['Python']
    };
    const profession = 'it';
    const fakeAnalysis = { score: 95, placement: 'Top 5%' };

    setCachedAnalysis(profession, resumeData, fakeAnalysis);

    const cached = getCachedAnalysis(profession, resumeData);
    expect(cached).toEqual(fakeAnalysis);
  });

  it('should return null when cached resume signature does not match modified resume', () => {
    const originalResume = { personal: { fullName: 'Original' } };
    const modifiedResume = { personal: { fullName: 'Modified' } };
    const profession = 'it';

    setCachedAnalysis(profession, originalResume, { score: 80 });

    const cached = getCachedAnalysis(profession, modifiedResume);
    expect(cached).toBeNull();
  });
});
