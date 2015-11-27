import app from '../fixtures/server.js';
import request from 'supertest';
import uuid from 'uuid';

describe(`Models`, () => {
  describe(`RestModel`, () => {
    describe(`@access`, () => {
      const id = uuid.v4();
      before(() => request(app)
        .post(`/naive-model`)
        .set(`Authorization`, `Basic 2`)
        .send({
          id
        })
        .expect(201));

      it(`prevents non-authenticated users from creating a resource`, () => request(app)
        .post(`/naive-model`)
        .expect(403));

      it(`allows authenticated users to create a resource`, () => request(app)
        .post(`/naive-model`)
        .set(`Authorization`, `Basic 1`)
        .expect(201));

      it(`prevents unauthenticated users from updating the resource`, () => request(app)
        .put(`/naive-model/${id}`)
        .send({extra: 2})
        .expect(403));

      it(`prevents authenticated users from updating the resource`, () => request(app)
        .put(`/naive-model/${id}`)
        .set(`Authorization`, `Basic 1`)
        .send({
          extra: 2,
          id
        })
        .expect(403));

      it(`allows the owner to update a resource`, () => request(app)
        .put(`/naive-model/${id}`)
        .set(`Authorization`, `Basic 2`)
        .send({
          extra: 2,
          id
        })
        .expect(200));
    });

    describe(`per-method access control`, () => {
      it(`prevents non-admins from counting all instances`, () => request(app)
        .get(`/naive-model/count-all`)
        .set(`Authorization`, `Basic 2`)
        .expect(403));

      it(`allows admins to count all instances`, () => request(app)
        .get(`/naive-model/count-all`)
        .set(`Authorization`, `Basic Admin`)
        .expect(200));
    });


  });
});
