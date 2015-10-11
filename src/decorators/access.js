import {getCurrentMethod} from '../lib/routing-table';



export default function access(accessType) {
  if (!accessType) {
    throw new Error('`accessType` is required');
  }

  return function(target, name, descriptor) {
    const method = getCurrentMethod(target, name);
    method.accessType = accessType;
    //
    // const fn = descriptor.value
    // descriptor.value = function(...args) {
    //   // return denodeify(acl.isAllowed)(currentUser(), getResourceName(target), accessType)
    //   //   .then(() => {
    //   //     fn(...args)
    //   //   })
    //   fn(...args)
    // }
    //
    // return descriptor
  };
}

export function getAccessForMethod(target, name, isStatic) {

}
