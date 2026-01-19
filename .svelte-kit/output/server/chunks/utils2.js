function extractDomain(entityId) {
  return entityId.split(".")[0];
}
function isToggleable(domain) {
  return ["light", "switch", "cover", "lock", "input_boolean", "automation", "script"].includes(domain);
}
export {
  extractDomain as e,
  isToggleable as i
};
