const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
const initRoutes = require("./routes");
const pool = require("./utils/db");
const apiLogger = require('./utils/logger');
const { handleError, convertToApiError } = require('./utils/apiError')
const http = require('http');
const passport = require('passport');
const logging = require('./config/logging');
const config = require('./config/config');
require('./config/passport');

const fs = require('fs')
const path = require('path')
const multer = require('./utils/upload')
const awss3 = require("./utils/awss3upload");

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.disable("x-powered-by");

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.header('origin'));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.use(
  cors(
    {
      origin: process.env.NODE_ENV !== "production"? [`http://localhost:3000`,`http://localhost:3010`,`http://172.25.121.70:3010`] : [`https://${process.env.CLIENT_URL}`,`https://${process.env.CLIENT_URL1}`],
      credentials: true, 
    }
  )
);

app.get('/', async (req, res) => {  
  res.status(200).send(`Apical Mobile Price Update v0.0.1`);    
});

app.get('/health', async (req, res) => {  
  try {    
    const client = await pool.connect();    
    res.status(200).send('Connected to PostgreSQL database!');    
    client.release();  
  } 
  catch (err) {    
    console.error(err);    
    res.status(500).send('Failed to connect to PostgreSQL database'); 
  }}
);

/** Passport & SAML Routes */
app.get('/login', passport.authenticate('saml', config.saml.options), (req, res, next) => {
    return res.redirect('http://localhost:3000');
});

app.post('/login/callback', passport.authenticate('saml', config.saml.options), (req, res, next) => {
    return res.redirect('http://localhost:3000');
});

app.get('/whoami', (req, res, next) => {
    if (!req.isAuthenticated()) {
        logging.info('User not authenticated');

        return res.status(401).json({
            message: 'Unauthorized'
        });
    } else {
        logging.info('User authenticated');
        logging.info(req.user);

        return res.status(200).json({ user: req.user });
    }
});


initRoutes(app);

app.use(convertToApiError);
app.use((err, req, res, next) => {
  handleError(err, res)
})

const port = process.env.PORT || 443;
app.listen(port, () => {
  apiLogger('info', `Server is running on port ${port}`)
  console.log(`Server apical-mpu has started on the port ${port}`);
});


const httpServer = http.createServer(app);
httpServer.listen(3022, () => logging.info(`Server is running on port ${3022}`));