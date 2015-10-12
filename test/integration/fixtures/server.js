import errorhandler from 'errorhandler';
import express from 'express';
import fullKoolaid from '../../..';
import path from 'path';

const app = module.exports = express();
app.use(fullKoolaid({
  models: path.join(__dirname, 'models')
}));

app.use(errorhandler());

const server = app.listen(app.get('port') || process.env.HTTP_PORT || process.env.PORT || 3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.info('app listening at http://%s:%s', host, port);
});
