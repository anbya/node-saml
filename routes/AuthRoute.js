const authentication = require("../utils/authentication");
const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKEY  = fs.readFileSync('key/private.key', 'utf8');
const publicKEY  = fs.readFileSync('key/public.key', 'utf8');

const AuthValidation = require('../validation/AuthValidation');
const EmailLimitter = require("../utils/EmailLimitter");
const Access = require("../utils/access");

const { AuthController } = require("../controllers");

const router = express.Router();

router.post("/login", Access.details, AuthValidation.loginValidation, (req, res, next) => {
    AuthController.login(req, res, next);
});

router.post("/isprint", Access.details, (req, res, next) => {
    AuthController.isprintLogin(req, res, next);
});

router.get("/keycloak", (req, res, next) => {
    AuthController.userExist(req, res, next);
});

router.get("/access-module", (req, res, next) => {
    AuthController.accessModules(req, res, next);
});

router.post("/reset", EmailLimitter.limit, AuthValidation.resetValidation, (req, res, next) => {
    AuthController.createTac(req, res, next);
});

router.post("/verify", AuthValidation.verifyValidation, (req, res, next) => {
    AuthController.verifyTac(req, res, next);
});

router.post("/change-passwords", AuthValidation.changePasswordValidation, (req, res, next) => {
    AuthController.changePasswords(req, res, next);
});

router.post("/logout", authentication.authenticateToken, (req, res, next) => {
    AuthController.clearSession(req, res, next);
});

router.get("/refresh-token", (req, res, next) => {
    AuthController.refreshToken(req, res, next);
});


module.exports = router;
