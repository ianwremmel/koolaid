import {default as access} from './decorators/access';
import HttpError from './lib/http-error';
import method from './decorators/method';
import param from './decorators/param';
import resource from './decorators/resource';
import RestModel from './rest-model';
import router from './router';

Object.assign(router, {
  access,
  HttpError,
  method,
  param,
  resource,
  RestModel
});

export default router;
