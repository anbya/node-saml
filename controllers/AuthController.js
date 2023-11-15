const jwt = require("jsonwebtoken");
const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { AuthService } = require("../services");
const fs = require("fs");
const { passDecrypt } = require("../utils/auth");

const privateKEY  = fs.readFileSync('key/private.key', 'utf8');
const publicKEY  = fs.readFileSync('key/public.key', 'utf8');

class AuthController extends BaseController {
  constructor() {
    super();
  }

  async login(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const ip = req.ip;
    const agent = req.agent;
    try {
      const result = await AuthService.login({ email, password, ip, agent });
      const resBody = new ResponseController();
      if(result.messages !== 'Login success'){
        res.status(400).json({
          ErrorMessage: result.messages,
        });
      } else {
        if(result.rows.length>0){
          let payload = {
            user: [{...result.rows[0],ip:ip,agent:agent}]
          };
          const accessToken = jwt.sign(payload, privateKEY, {algorithm: 'RS256',expiresIn: "30m"});
          const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
          res.setHeader("content-type", "application/json");
          res.cookie("accessToken", accessToken, {
            maxAge: 30 * 60 * 1000,
            secure: true,
            httpOnly: true
          });
          res.cookie("refreshToken", refreshToken, {
            maxAge: 5 * 24 * 60 * 60 * 1000,
            secure: true,
            httpOnly: true
          });
        }
        return this.sendSuccess(res, resBody.setData(result).setDataMessage(result.messages).build());
      }
    } catch (error) {
      next(error)
    }
  }

  async isprintLogin(req, res, next) {
    const body = req.body
    body.password = passDecrypt(body.password);
    const ip = req.ip;
    const agent = req.agent;
    try {
      const loginData = await AuthService.mockIsprintLogin({ body, ip, agent });
      const resBody = new ResponseController();
      if(body.sessionToken !== '' && loginData.result){
        const email = loginData.result.responses.email;
        const username = null;
        const rows = await AuthService.existUser({ email, username, ip, agent });
        if(rows.existornot.length>0 && rows.existornot[0].userData.length>0){
          let payload = {
            user: [{...rows.existornot[0].userData[0],ip:ip,agent:agent}]
          };
          const accessToken = jwt.sign(payload, privateKEY, {algorithm: 'RS256',expiresIn: "30m"});
          const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
          const sessionToken = loginData.result.sessionToken;
          let userId = rows.existornot[0].userData[0].id
          await AuthService.setSessions(userId, sessionToken, body.platform)
          res.setHeader("content-type", "application/json");
          res.cookie("accessToken", accessToken, {
            maxAge: 30 * 60 * 1000,
            // secure: true,
            httpOnly: true
          });
          res.cookie("refreshToken", refreshToken, {
            maxAge: 5 * 24 * 60 * 60 * 1000,
            // secure: true,
            httpOnly: true
          });
          res.cookie("sessionToken", sessionToken, {
            maxAge: 5 * 24 * 60 * 60 * 1000,
            // secure: true,
            httpOnly: true
          });
        }
        return this.sendSuccess(res, loginData);
      } else {
        return this.sendSuccess(res, loginData);
      }
    } catch (error) {
      next(error)
    }
  }

  async suspend(req, res, next) {
    const itemList = req.body;
    try {
      const result = await AuthService.suspend(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(
        {
          error:result.error,
          message:result.message
        }
      ).build());
    } catch (error) {
      next(error)
    }
  }

  async createTac(req, res, next) {
    const email = req.body.email;
    try {
      const result = await AuthService.createTac(email);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(
        {
          error:result.error,
          message:result.message
        }
      ).build());
    } catch (error) {
      next(error)
    }
  }

  async verifyTac(req, res, next) {
    const code = req.body.code;
    const email = req.body.email;
    try {
      const result = await AuthService.verifyTac({ code, email });
      if(result.existornot.length > 0){
        if(result.existornot[0].exist === false || result.existornot[0].verified === false){
          res.status(400).json({
            ErrorMessage: 'Gagal memverifikasi TAC code',
          });
        } else {
          const resBody = new ResponseController();
          return this.sendSuccess(res, resBody.setData({result:[]}).build());
        }
      } else {
        res.status(400).json({
          ErrorMessage: 'Gagal memverifikasi TAC code',
        });
      }
    } catch (error) {
      next(error)
    }
  }

  async changePasswords(req, res, next) {
    const itemList = req.body;
    try {
      const result = await AuthService.changePasswords(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(
        {
          error:result.error,
          message:result.message
        }
      ).build());
    } catch (error) {
      next(error)
    }
  }

  async clearSession(req, res, next) {
    const userId = req.user[0].id;
    try {
      const result = await AuthService.clearSession(userId);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error)
    }
  }

  async updateSessions(oldAccessToken, accessToken, ip) {
    await AuthService.updateSessions(oldAccessToken, accessToken, ip)
  }

  async userExist(req, res, next) {
    const email = req.query.email;
    const username = req.query.username;
    const ip = (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.socket.remoteAddress;
    const agent = req.headers["user-agent"];
    try {
      const rows = await AuthService.existUser({ email, username, ip, agent });
      if(rows.existornot.length>0 && rows.existornot[0].userData.length>0){
        let payload = {
          user: [{...rows.existornot[0].userData[0],ip:ip,agent:agent}]
        };
        const accessToken = jwt.sign(payload, privateKEY, {algorithm: 'RS256',expiresIn: "30m"});
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
        res.setHeader("content-type", "application/json");
        res.cookie("accessToken", accessToken, {
          maxAge: 30 * 60 * 1000,
          secure: true,
          httpOnly: true
        });
        res.cookie("refreshToken", refreshToken, {
          maxAge: 5 * 24 * 60 * 60 * 1000,
          secure: true,
          httpOnly: true
        });
      }
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(rows).build());
    } catch (error) {
      next(error)
    }
  }

  async accessModules(req, res, next) {
    const email = req.query.email;
    const username = req.query.username;
    const ip = (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.socket.remoteAddress;
    const agent = req.headers["user-agent"];
    try {
      const rows = await AuthService.existUser({ email, username, ip, agent });
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(rows).build());
    } catch (error) {
      next(error)
    }
  }

  async refreshToken(req, res, next) {
    try {
      const ip = req.ip;
      const agent = req.agent;
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken == null) {
          return res.sendStatus(403)
      } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
          if (data && data.user.length > 0) {
              let payload = { user: [{...data.user[0],ip:ip,agent:agent}] };
              const accessToken = jwt.sign(payload, privateKEY, {algorithm: 'RS256',expiresIn: "30m"});
              res.cookie("accessToken", accessToken, {
                maxAge: 30 * 60 * 1000,
                secure: true,
                httpOnly: true, 
              });
              res.json({ success: true });
          } else {
              res.json({ success: false });
          }
        });
      }
    } catch (error) {
      next(error)
    }
  }
}

module.exports = AuthController;
