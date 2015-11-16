import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import express from 'express';
import koolaid from '../../..';
import morgan from 'morgan';
import path from 'path';

const app = module.exports = express();
app.use(morgan(`dev`));
app.use(bodyParser());

app.use((req, res, next) => {
  if (req.headers.authorization) {
    req.user = {
      id: req.headers.authorization
    };
  }

  next();
});

app.use(koolaid({
  models: path.join(__dirname, `models`),
  access: {
    acls: path.join(__dirname, `acls`),
    backend: `memory`
  }
}));

app.use(errorhandler());

const server = app.listen(app.get(`port`) || process.env.HTTP_PORT || process.env.PORT || 3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.info(`app listening at http://%s:%s`, host, port);
});
