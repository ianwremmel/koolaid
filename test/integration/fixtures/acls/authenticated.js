export default [
  {
    roles: [`$authenticated`],
    allows: [
      {resources: `Authenticated`, permissions: [`read`, `write`]}
    ]
  }
];
