const s = require('strummer');

module.exports = s({
  serverPort: new s.number(),
  publicUrl: new s.url(),
  basePath: new s.string(),
  mongoose: {
    url: new s.url(),
    dbName: new s.string(),
  }
});
