import request from 'supertest';
import app from '../server.js';

describe('Node.js Backend Health API', () => {
  it('GET /health should return 200 and online status', async () => {
    const res = await request(app).get('/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'online');
    expect(res.body).toHaveProperty('service', 'Resora Node.js Backend');
  });
});
