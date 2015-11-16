export default [];

// export default([
//   {
//     roles: [`$owner`],
//     allows: [
//       {resources: `Access.ownerRead`, permissions: [`read`]},
//       {resources: `Access.ownerWrite`, permissions: [`write`]}
//     ]
//   },
//   {
//     roles: [`$authenticated`],
//     allows: [
//       {resources: `Access.authenticatedRead`, permissions: [`read`]},
//       {resources: `Access.authenticatedWrite`, permissions: [`write`]}
//     ]
//   },
//   {
//     roles: [`$unauthenticated`],
//     allows: [
//       {resources: `Access.unauthenticatedRead`, permissions: [`read`]},
//       {resources: `Access.unauthenticatedWrite`, permissions: [`write`]}
//     ]
//   },
//   {
//     roles: [`$everyone`],
//     allows: [
//       {resources: `Access.everyoneRead`, permissions: [`read`]},
//       {resources: `Access.everyoneWrite`, permissions: [`write`]}
//     ]
//   }
// ]);
//
//
// //
// // Access: {
// //   *: {
// //     *: {
// //       $everyone: `ALLOW`
// //     }
// //   }
// //   unauthenticatedRead: {
// //     *: {
// //       $authenticated: `DENY`
// //     }
// //   },
// //   authenticatedRead: {
// //     *: {
// //       $unauthenticated: `DENY`
// //     }
// //   },
// //   ownerRead: {
// //     read: {
// //       $everyone: `DENY`,
// //       $owner: `ALLOW`
// //     }
// //   },
// //   ownerWrite: {
// //     write: {
// //       $everyone: `DENY`
// //       $owner: `ALLOW`
// //     }
// //   }
// // }
// //
// //
// // export default [
// //   {
// //     model: `Access`,
// //     property: `*`,
// //     accessType: `*`,
// //     principalId: `$everyone`,
// //     permission: `ALLOW`
// //   },
// //   {
// //     model: `Access`,
// //     property: `unauthenticatedRead`,
// //     accessType: `*`,
// //     principalId: `$authenticated`,
// //     permission: `DENY`
// //   },
// //   {
// //     model: `Access`,
// //     property: `authenticatedRead`,
// //     accessType: `*`,
// //     principalId: `$unauthenticated`,
// //     permission: `DENY`
// //   },
// //   {
// //     model: `Access`,
// //     property: `ownerRead`,
// //     accessType: `read`,
// //     principalId: `$everyone`,
// //     permission: `DENY`
// //   },
// //   {
// //     model: `Access`,
// //     property: `ownerWrite`,
// //     accessType: `write`,
// //     principalId: `$everyone`,
// //     permission: `DENY`
// //   },
// //   {
// //     model: `Access`,
// //     property: `ownerRead`,
// //     accessType: `read`,
// //     principalId: `$owner`,
// //     permission: `ALLOW`
// //   },
// //   {
// //     model: `Access`,
// //     property: `ownerWrite`,
// //     accessType: `write`,
// //     principalId: `$owner`,
// //     permission: `ALLOW`
// //   }
// // ];
