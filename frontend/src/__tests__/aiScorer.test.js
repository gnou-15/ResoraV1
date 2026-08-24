import { describe, it, expect } from 'vitest';
import { analyzeResume } from '../services/aiScorer';

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
});
