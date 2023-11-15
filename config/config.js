module.exports = {
    saml: {
        cert: './config/saml.pem',
        entryPoint: 'https://qasso.averis.biz/clp/samlsso',
        issuer: 'http://priceupdateonline-dev.ap-southeast-3.elasticbeanstalk.com',
        options: {
            failureRedirect: '/login',
            failureFlash: true
        }
    },
    server: {
        port: 80
    },
    session: {
        resave: false,
        secret: 'supersecretamazingpassword',
        saveUninitialized: true
    }
};