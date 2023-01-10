const ApiServer = require('@tabdigital/api-server');
const get = require('./config');
const pkg = require('../package.json');
const log = require('./log');
const routes = require('./routes');

const createServer = () => {
  const cfg = get();

  const server = new ApiServer({
    basePath: cfg.basePath,
    swagger: {
      title: pkg.name,
      version: pkg.version,
    },
    defaultCacheAge: 0,
    port: cfg.serverPort,
    publicUrl: cfg.publicUrl,
    enableDiscovery: false,
    showStackTrace: false,
  });

  server.before((restifyServer) => {
    const corsMiddleware = require('restify-cors-middleware');
    const cors = corsMiddleware({
      preflightMaxAge: 5, //Optional
      origins: ['*'],
      allowHeaders: ['x-auth-token'],
      exposeHeaders: ['API-Token-Expiry']
    });

    restifyServer.pre(cors.preflight);
    restifyServer.use(cors.actual);
  });

  server.route(routes);
  server.uncaughtExceptions(
    (req, res, route, err) => {
      log.error("UncaughtException Error:", err);
      res.send(503, err);
    }
  );

  server.status((version) => {
    return {
      statusCode: 200,
      response: {
        status: 200,
        application: pkg.name,
        version,
      },
    };
  });

  server.statusDetails((version, hostname) => {
    return {
      statusCode: 200,
      response: {
        status: 200,
        application: pkg.name,
        version,
        hostname,
      },
    };
  });

  return server;
};

module.exports = createServer;
