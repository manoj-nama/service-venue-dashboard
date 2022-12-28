import secrets from '@tabdigital/secrets';

import log from './log';
import env from './env';
import pkg from '../package.json';

let secretLoaded = false;

export const load = async () => {
  try {
    if (secretLoaded) return;
    log.info('Loading Secrets', env);
    const res = await secrets.load({
      service: pkg.name,
      env: env,
      skip: ['Dev', 'ci', 'Congo'],
    });
    log.info(res.message, 'Secret loaded successfully');
    secretLoaded = true;
    setTimeout(() => secretLoaded = false, 50000);
  } catch (err) {
    log.error(err, 'Error loading secrets');
    throw err;
  }
};
