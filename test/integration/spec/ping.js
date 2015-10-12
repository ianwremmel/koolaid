import request from 'supertest';
import app from '../fixtures/server';

describe('Models', () => {
  describe('Ping', () => {
    describe('GET /', () => {
      it('responds', () => {
        return request(app)
          .get('/ping')
          .expect(200, {
            success: true
          });
      });
    });
  });
});
