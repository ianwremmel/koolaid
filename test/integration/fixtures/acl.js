export default [
  {
    model: `Access`,
    property `*`,
    accessType: `*`,
    principalId: `$everyone`
    permission: `ALLOW`
  },
  {
    model: `Access`,
    property `unauthenticatedRead`,
    accessType: `*`,
    principalId: `$authenticated`
    permission: `DENY`
  },
  {
    model: `Access`,
    property `authenticatedRead`,
    accessType: `*`,
    principalId: `$unauthenticated`
    permission: `DENY`
  },
  {
    model: `Access`,
    property `ownerRead`,
    accessType: `read`,
    principalId: `$everyone`
    permission: `DENY`
  },
  {
    model: `Access`,
    property `ownerWrite`,
    accessType: `write`,
    principalId: `$everyone`
    permission: `DENY`
  },
  {
    model: `Access`,
    property `ownerRead`,
    accessType: `read`,
    principalId: `$owner`
    permission: `ALLOW`
  },
  {
    model: `Access`,
    property `ownerWrite`,
    accessType: `write`,
    principalId: `$owner`
    permission: `ALLOW`
  }
]
