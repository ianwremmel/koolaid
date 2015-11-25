import request from 'supertest';
import app from '../../fixtures/server';

describe(`@access`, () => {
  describe(`complicated access`, () => {
    describe(`GET /`, () => {
      it(`can be accessed by anonymous users`, () => request(app)
        .get(`/complicated-access`)
        .expect(200));

      it(`can be accessed by authenticated users`, () => request(app)
        .get(`/complicated-access`)
        .set(`Authorization`, `authenticated`)
        .expect(200));
    });

    describe(`POST /`, () => {
      it(`cannot be accessed by anonymous users`, () => request(app)
        .post(`/complicated-access`)
        .expect(403));

      it(`can be accessed by authenticated users`, () => request(app)
        .post(`/complicated-access`)
        .set(`Authorization`, `authenticated`)
        .expect(200));
    });

    describe(`PUT /:id`, () => {
      it(`cannot be accessed by anonymous users`, () => request(app)
        .put(`/complicated-access/mine`)
        .expect(403));

      it(`cannot be accessed by authenticated users`, () => request(app)
        .put(`/complicated-access/mine`)
        .set(`Authorization`, `authenticated`)
        .expect(403));

      it(`can be accessed by its owner`, () => request(app)
        .put(`/complicated-access/mine`)
        .set(`Authorization`, `Basic 14`)
        .expect(403));
    });
  });
});
