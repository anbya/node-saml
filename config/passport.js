const fs = require('fs');
const passport = require('passport');
const { Strategy } = require('passport-saml');
const config = require('./config');
const logging = require('./logging');

const savedUsers = [];

passport.serializeUser((expressUser, done) => {
    logging.info(expressUser, 'Serialize User');
    done(null, expressUser);
});

passport.deserializeUser((expressUser, done) => {
    logging.info(expressUser, 'Deserialize User');
    done(null, expressUser);
});

const samlStrategyWeb = new Strategy(
    {
        issuer: process.env.SAML_ISSUER_WEB,
        protocol: 'http://',
        path: '/login/callback',
        entryPoint: config.saml.entryPoint,
        cert: fs.readFileSync(config.saml.cert, 'utf-8'),
    },
    (expressUser, done) => {
        if (!savedUsers.includes(expressUser)) {
            savedUsers.push(expressUser);
        }

        return done(null, expressUser);
    }
);

const samlStrategyPwa = new Strategy(
    {
        issuer: process.env.SAML_ISSUER_PWA,
        protocol: 'http://',
        path: '/login-pwa/callback',
        entryPoint: config.saml.entryPoint,
        cert: fs.readFileSync(config.saml.cert, 'utf-8'),
    },
    (expressUser, done) => {
        if (!savedUsers.includes(expressUser)) {
            savedUsers.push(expressUser);
        }

        return done(null, expressUser);
    }
);

passport.use('saml-strategy-web', samlStrategyWeb);
passport.use('saml-strategy-pwa', samlStrategyPwa);
