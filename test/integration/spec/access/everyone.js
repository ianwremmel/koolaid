import request from 'supertest';
import app from '../../fixtures/server';

describe(`@access`, () => {
  describe(`$everyone`, () => {
    describe(`GET /`, () => {
      it(`can be accessed by anonymous users`, () => request(app)
        .get(`/everyone`)
        .expect(200));

      it(`can be accessed by authenticated users`, () => request(app)
        .get(`/everyone`)
        .set(`Authorization`, `authenticated`)
        .expect(200));
    });

    describe(`POST /`, () => {
      it(`can be accessed by anonymous users`, () => request(app)
        .post(`/everyone`)
        .expect(200));

      it(`can be accessed by authenticated users`, () => request(app)
        .post(`/everyone`)
        .set(`Authorization`, `authenticated`)
        .expect(200));
    });

  });
});
