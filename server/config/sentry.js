const Sentry = require('@sentry/node');

const SENTRY_DSN = process.env.SENTRY_DSN || '';

function initSentry(app) {
  if (!SENTRY_DSN) {
    console.log('⚠️  SENTRY_DSN not set — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration({ app }),
    ],
  });

  console.log('✅ Sentry error tracking initialized');
}

function sentryErrorHandler() {
  if (!SENTRY_DSN) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.expressErrorHandler();
}

module.exports = { initSentry, sentryErrorHandler };
