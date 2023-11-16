module.exports = {
    saml: {
        cert: './config/saml.pem',
        entryPoint: process.env.SAML_ENTRY_POINT,
        issuer: process.env.SAML_ISSUER,
        options: {
            failureRedirect: '/login',
            failureFlash: true
        }
    },
    server: {
        port: 3201
    },
    session: {
        resave: false,
        secret: 'supersecretamazingpassword',
        saveUninitialized: true
    }
};