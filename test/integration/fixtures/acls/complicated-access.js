export default [
  {
    roles: [`$everyone`],
    allows: [
      {resources: `ComplicatedAccess`, permissions: [`read`]}
    ]
  },
  {
    roles: [`$authenticated`],
    allows: [
      {resources: `ComplicatedAccess`, permissions: [`write`]}
    ]
  },
  {
    roles: [`$owner`],
    allows: [
      {resources: `ComplicatedAccess#update`, permissions: [`read`, `write`]}
    ]
  }
];
