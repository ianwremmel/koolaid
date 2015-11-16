import request from 'supertest';
import app from '../../fixtures/server';

describe(`@access`, () => {
  describe(`$authenticatd`, () => {
    describe(`GET /`, () => {
      it(`cannot be accessed by anonymous users`, () => request(app)
        .get(`/authenticated`)
        .expect(403));

      it(`can be accessed by authenticated users`, () => request(app)
        .get(`/authenticated`)
        .set(`Authorization`, `authenticated`)
        .expect(200));
    });

    describe(`POST /`, () => {
      it(`cannot be accessed by anonymous users`, () => request(app)
        .get(`/authenticated`)
        .expect(403));

      it(`can be accessed by authenticated users`, () => request(app)
        .post(`/authenticated`)
        .set(`Authorization`, `authenticated`)
        .expect(200));
    });

  });
});
