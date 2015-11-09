import access from './decorators/access';
import method from './decorators/method';
import param from './decorators/param';
import resource from './decorators/resource';
import router from './router';

Object.assign(router, {
  access,
  method,
  param,
  resource
});

export default router;
