import request from 'supertest';
import app from '../fixtures/server';

describe.only(`@access`, () => {
  describe(`GET /everyone`, () => {
    it(`can be accessed by anonymous users`, () => request(app)
      .get(`/access/everyone`)
      .expect(200));

    it(`can be accessed by authenticated users`, () => request(app)
      .get(`/access/everyone`)
      .set(`Authorization`, `authenticated`)
      .expect(200));
  });

  describe(`GET /unauthenticated`, () => {
    it(`can be accessed by anonymous users`, () => request(app)
      .get(`/access/unauthenticated`)
      .expect(200));

    it(`cannot be accessed by authenticated users`, () => request(app)
      .get(`/access/unauthenticated`)
      .set(`Authorization`, `authenticated`)
      .expect(401));
  });

  describe(`GET /authenticated`, () => {
    it(`cannot be accessed by anonymous users`, () => request(app)
      .get(`/access/authenticated`)
      .expect(401));

    it(`can be accessed by authenticated users`, () => request(app)
      .get(`/access/authenticated`)
      .set(`Authorization`, `authenticated`)
      .expect(200));
  });

  describe(`GET /owner`, () => {
    it(`cannot be accessed by anonymous users`, () => request(app)
      .get(`/access/owner`)
      .expect(401));

    it(`cannot be accessed by authenticated users`, () => request(app)
      .get(`/access/owner`)
      .set(`Authorization`, `authenticated`)
      .expect(401));

    it(`can be accessed by its owner`, () => request(app)
      .get(`/access/owner`)
      .set(`Authorization`, `owner`)
      .expect(200));
  });

  describe(`POST /everyone`, () => {
    it(`can be accessed by anonymous users`, () => request(app)
      .post(`/access/everyone`)
      .expect(200));

    it(`can be accessed by authenticated users`, () => request(app)
      .post(`/access/everyone`)
      .set(`Authorization`, `authenticated`)
      .expect(200));
  });

  describe(`POST /unauthenticated`, () => {
    it(`can be accessed by anonymous users`, () => request(app)
      .post(`/access/unauthenticated`)
      .expect(200));

    it(`cannot be accessed by authenticated users`, () => request(app)
      .post(`/access/unauthenticated`)
      .set(`Authorization`, `authenticated`)
      .expect(401));
  });

  describe(`POST /authenticated`, () => {
    it(`cannot be accessed by anonymous users`, () => request(app)
      .post(`/access/authenticated`)
      .expect(401));

    it(`can be accessed by authenticated users`, () => request(app)
      .post(`/access/authenticated`)
      .set(`Authorization`, `authenticated`)
      .expect(200));
  });

  describe(`POST /owner`, () => {
    it(`cannot be accessed by anonymous users`, () => request(app)
      .post(`/access/owner`)
      .expect(401));

    it(`cannot be accessed by authenticated users`, () => request(app)
      .post(`/access/owner`)
      .set(`Authorization`, `authenticated`)
      .expect(401));

    it(`can be accessed by its owner`, () => request(app)
      .post(`/access/owner`)
      .set(`Authorization`, `owner`)
      .expect(200));
  });
});
