module.exports = {
    saml: {
        cert: './config/saml.pem',
        entryPoint: process.env.SAML_ENTRY_POINT,
        optionsWeb: {
            failureRedirect: '/login',
            failureFlash: true
        },
        optionsPwa: {
            failureRedirect: '/login-pwa',
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