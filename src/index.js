import {default as access, create, destroy} from './decorators/access';
import HttpError from './lib/http-error';
import method from './decorators/method';
import param from './decorators/param';
import resource from './decorators/resource';
import RestModel from './rest-model';
import router from './router';

Object.assign(router, {
  access,
  create,
  destroy,
  HttpError,
  method,
  param,
  resource,
  RestModel
});

export default router;
