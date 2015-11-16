export default [
  {
    roles: [`$everyone`],
    allows: [
      {resources: `NaiveModel`, permissions: [`read`, `write`]}
    ]
  }
];
