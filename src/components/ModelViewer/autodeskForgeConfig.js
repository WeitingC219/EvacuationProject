const clientId = 'gKDDVrGzcvKDbFddHAz0SsJoYEYPzeWJ';
const clientSecret = 'GzWnGd2NcSerGU8P';
const grantType = 'client_credentials';
const scope = 'data:read data:write data:create bucket:read bucket:create';
const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZXZhY3VhdGlvbnByb2plY3QvY2l2aWxidWlsZGluZzIwMTgtNkZfdjIucnZ0';
// old dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZXZhY3VhdGlvbnByb2plY3QvY2l2aWxidWlsZGluZzIwMTgtNkYucnZ0

const autodeskForgeConfig = {
  clientId,
  clientSecret,
  grantType,
  scope,
  urn,
};

export default autodeskForgeConfig;
