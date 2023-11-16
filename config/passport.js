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

passport.use(
    new Strategy(
        {
            issuer: config.saml.issuer,
            protocol: 'http://',
            path: '/login/callback',
            entryPoint: config.saml.entryPoint,
            cert: fs.readFileSync(config.saml.cert, 'utf-8'),
        },
        (expressUser, done) => {
            console.log(`expressUser`,expressUser);
            if (!savedUsers.includes(expressUser)) {
                savedUsers.push(expressUser);
            }

            return done(null, expressUser);
        }
    )
);
