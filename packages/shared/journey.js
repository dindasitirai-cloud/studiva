// Additive root re-export shim so `@studiva/shared/journey` resolves under classic node resolution
// (CRA/webpack). Points to the built runtime barrel. Touches no existing file.
module.exports = require('./dist/journey/runtime');
