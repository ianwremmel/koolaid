export default [
  {
    roles: [`$everyone`],
    allows: [
      {resources: `NaiveModel`, permissions: [`read`]}
    ]
  },
  {
    roles: [`$authenticated`],
    allows: [
      {resources: `NaiveModel`, permissions: [`write`]},
      {resources: `NaiveModelInstance`, permissions: [`write`]}
    ]
  },
  {
    roles: [`$owner`],
    allows: [
      {resources: `NaiveModelInstance`, permissions: [`read`, `write`]}
    ]
  }
];
