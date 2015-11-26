import app from '../fixtures/server.js';
import {assert} from 'chai';
import request from 'supertest';
import uuid from 'uuid';

describe(`Models`, () => {
  describe(`NaiveModel`, () => {

    afterEach(() => request(app)
      .delete(`/naive-model`)
      .set(`Authorization`, `Basic 14`)
      .expect(204));

    // POST /
    describe(`.create()`, () => {
      let id;
      beforeEach(() => {
        id = uuid.v4();
        return request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id
          })
          .expect(201);
      });

      it(`creates a model`, () => request(app)
        .post(`/naive-model`)
        .set(`Authorization`, `Basic 14`)
        .send({
          id: uuid.v4()
        })
        .expect(201));

      it(`does not allow duplicates`, () => request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id
          })
          .expect(409));
    });

    // PUT /
    describe(`.upsert()`, () => {
      let id;
      beforeEach(() => {
        id = uuid.v4();
        return request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id
          })
          .expect(201);
      });

      it(`creates a new model`, () => request(app)
        .put(`/naive-model`)
        .set(`Authorization`, `Basic 14`)
        .send({
          id: uuid.v4()
        })
        .expect(201));

      it(`updates an existing model`, () => request(app)
        .put(`/naive-model`)
        .set(`Authorization`, `Basic 14`)
        .send({
          id
        })
        .expect(200));
    });

    // POST /update
    describe(`.update()`, () => {
      let id1, id2, id3;
      beforeEach(() => {
        id1 = uuid.v4();
        id2 = uuid.v4();
        id3 = uuid.v4();
        return Promise.all([id1, id2, id3].map((id, index) => request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id,
            extraData: index
          })
          .expect(201)));
      });

      it(`updates all models`, (done) => {
        request(app)
          .post(`/naive-model/update`)
          .set(`Authorization`, `Basic 14`)
          .send({
            extraData: 5
          })
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }

            return request(app)
              .get(`/naive-model`)
              .set(`Authorization`, `Basic 14`)
              .expect(200, [{
                id: id1,
                extraData: 5
              }, {
                id: id2,
                extraData: 5
              }, {
                id: id3,
                extraData: 5
              }])
              .end((err) => {
                if (err) {
                  return done(err);
                }
                done();
              });
          });
      });

      it(`updates the specified models`, (done) => {
        request(app)
          .post(`/naive-model/update?filter[where][extraData]=2`)
          .set(`Authorization`, `Basic 14`)
          .send({
            extraData: 5
          })
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }

            return request(app)
              .get(`/naive-model`)
              .set(`Authorization`, `Basic 14`)
              .expect(200, [{
                id: id1,
                extraData: 0
              }, {
                id: id2,
                extraData: 1
              }, {
                id: id3,
                extraData: 5
              }])
              .end((err) => {
                if (err) {
                  return done(err);
                }
                done();
              });
          });
      });
    });

    // GET /{?filter}
    describe(`.find()`, () => {
      let id1, id2;
      beforeEach(() => {
        id1 = uuid.v4();
        id2 = uuid.v4();
        return Promise.all([id1, id2].map((id, index) => request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id,
            extraData: index + 1
          })
          .expect(201)));
      });

      it(`retrieves all models`, () => request(app)
        .get(`/naive-model`)
        .set(`Authorization`, `Basic 14`)
        .expect(200, [{
          id: id1,
          extraData: 1
        }, {
          id: id2,
          extraData: 2
        }]));

      it(`retrieves a filtered subset of models `, () => request(app)
        .get(`/naive-model?filter[where][extraData]=2`)
        .set(`Authorization`, `Basic 14`)
        .expect(200, [{
          id: id2,
          extraData: 2
        }]));
    });

    // DELETE /{?filter}
    describe(`.destroyAll()`, () => {
      beforeEach(() => Promise.all([1, 2].map((id) => request(app)
        .post(`/naive-model`)
        .set(`Authorization`, `Basic 14`)
        .send({
          id,
          extraData: id
        })
        .expect(201))));

      describe(`without options`, () => {
        beforeEach(() => request(app)
          .delete(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .expect(204));

        it(`deletes all models`, () => request(app)
          .get(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .expect(200));
      });

      describe(`with options.filter`, () => {
        it(`deletes a filtered subset of all models`, (done) => {
          request(app)
            .delete(`/naive-model?filter[where][extraData]=2`)
            .set(`Authorization`, `Basic 14`)
            .expect(204)
            .end((err) => {
              if (err) {
                return done(err);
              }

              request(app)
                .get(`/naive-model`)
                .set(`Authorization`, `Basic 14`)
                .expect(200)
                .end((err, res) => {
                  if (err) {
                    return done(err);
                  }

                  assert(res.body.length === 1);
                  assert(res.body[0].extraData === 1);
                  done();
                });
            });
        });
      });

    });

    // GET /count
    describe(`.count()`, () => {
      beforeEach(() => Promise.all([1, 2].map((id, index) => request(app)
        .post(`/naive-model`)
        .set(`Authorization`, `Basic 14`)
        .send({
          id,
          extraData: index + 1
        })
        .expect(201))));

      it(`returns the number of existing models`, () => request(app)
        .get(`/naive-model/count`)
        .set(`Authorization`, `Basic 14`)
        .expect(200, {
          count: 2
        }));

      it(`returns the number of existing models matching a given filter`, () => request(app)
        .get(`/naive-model/count`)
        .set(`Authorization`, `Basic 14`)
        .query({filter: {where: {extraData: 2}}})
        .expect(200, {
          count: 1
        }));
    });

    // DELETE /:id
    describe(`#destroy()`, () => {
      let id;
      beforeEach(() => {
        id = uuid.v4();
        return request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id
          })
          .expect(201);
      });

      it(`deletes the specified model`, (done) => {
        request(app)
          .delete(`/naive-model/${id}`)
          .set(`Authorization`, `Basic 14`)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }

            request(app)
              .get(`/naive-model/${id}`)
              .set(`Authorization`, `Basic 14`)
              .expect(404)
              .end((err) => {
                if (err) {
                  done(err);
                }
                done();
              });
          });
      });
    });

    // GET /:id
    describe(`#find()`, () => {
      let id;
      beforeEach(() => {
        id = uuid.v4();
        return request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id
          })
          .expect(201);
      });

      it(`returns the desired model`, () => request(app)
          .get(`/naive-model/${id}`)
          .set(`Authorization`, `Basic 14`)
          .expect(200, {
            id
          }));

      it(`404s if no model can be found`, () => {
        const id = uuid.v4();
        return request(app)
          .get(`/naive-model/${id}`)
          .set(`Authorization`, `Basic 14`)
          .expect(404);
      });

    });

    // PUT /:id
    describe(`#update()`, () => {
      let id;
      beforeEach(() => {
        id = uuid.v4();
        return request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id,
            extraData: 1
          })
          .expect(201);
      });

      it(`updates a model instance`, () => request(app)
        .put(`/naive-model/${id}`)
        .set(`Authorization`, `Basic 14`)
        .send({
          id,
          extraData: 2
        })
        .expect(200, {
          id,
          extraData: 2
        }));
    });

    describe(`.exists()`, () => {
      let id;
      beforeEach(() => {
        id = uuid.v4();
        return request(app)
          .post(`/naive-model`)
          .set(`Authorization`, `Basic 14`)
          .send({
            id
          })
          .expect(201);
      });

      // GET /:id/exists
      describe(`when called with GET`, () => {
        it(`indicates a model was found with {exists: true}`, () => request(app)
          .get(`/naive-model/${id}/exists`)
          .set(`Authorization`, `Basic 14`)
          .expect(200, {
            exists: true
          }));

        it(`indicates a model was not found with {exists: false}`, () => request(app)
          .get(`/naive-model/not-an-id/exists`)
          .set(`Authorization`, `Basic 14`)
          .expect(200, {
            exists: false
          }));
      });

      // HEAD /:id
      describe(`when called with HEAD`, () => {
        it(`indicates a model exists with 204`, () => request(app)
            .head(`/naive-model/${id}`)
            .set(`Authorization`, `Basic 14`)
            .expect(204));

        it(`indicates a model was not found with 404`, () => request(app)
          .head(`/naive-model/not-an-id`)
          .set(`Authorization`, `Basic 14`)
          .expect(404));
      });

    });
  });
});
