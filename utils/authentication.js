const jwt = require("jsonwebtoken");
const pjson = require("../package.json");
const fs = require("fs");

const privateKEY  = fs.readFileSync('key/private.key', 'utf8');
const publicKEY  = fs.readFileSync('key/public.key', 'utf8');
const AuthService = require("../services/AuthService");

exports.authenticateToken = async (req, res, next) => {
  const token = req.cookies.accessToken;
  const ip = req.ip;
  if (token == null || token == undefined) {
    return res.sendStatus(401);
  }
  jwt.verify(token, publicKEY,{algorithm: ["RS256"]}, (err, data) => {
    if (data && data.user) {
      req.user = data.user;
      req.ip = ip;
      next();
    } else {
      res.sendStatus(401);
    }
  });
};

exports.authenticateIsprintToken = async (req, res, next) => {
  const token = req.cookies.sessionToken;
  if (token == null || token == undefined) {
    return res.sendStatus(403);
  } else {
    const tokenData = await AuthService.checkSessions({user_id:req.user[0].id,session_token:token});
    if (tokenData.rows.length>0){
      next();
    } else {
      return res.sendStatus(403);
    }
  }
};

exports.ping = (req, res, next) => {
  res.json({
    name: "API server",
    status: "OK",
    port: `${process.env.PORT}`,
    version: pjson.version,
  });
};

exports.authToken = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const ip = req.ip;
  if (token == null || token == undefined) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (data && data.user) {
      req.user = data.user;
      req.ip = ip;
      next();
    } else {
      res.sendStatus(403);
    }
  });
};
