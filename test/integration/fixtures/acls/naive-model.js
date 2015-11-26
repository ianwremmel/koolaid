export default [
  {
    roles: [`$everyone`],
    allows: [
      {resources: `NaiveModel.*`, permissions: [`read`]}
    ]
  },
  {
    roles: [`$authenticated`],
    allows: [
      {resources: `NaiveModel.*`, permissions: [`write`]},
      {resources: `NaiveModel#*`, permissions: [`read`]}
    ]
  },
  {
    roles: [`$owner`],
    allows: [
      {resources: `NaiveModel#*`, permissions: [`read`, `write`]}
    ]
  }
];
