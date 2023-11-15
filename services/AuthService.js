const axios = require('axios');
const pool = require("../utils/db");
const bcrypt = require('bcryptjs')
const moment = require('moment')
const NODEMAILER = require('nodemailer');
const crypto = require('crypto');
const AuditTrailService = require("./AuditTrailService");

const { Constants } = require("../utils");
const { passDecrypt } = require("../utils/auth");
const { limit } = require("../utils/LoginCheck");

const fs = require('fs');
const mustache = require('mustache');
const emailTemplate = fs.readFileSync('emailTemplates/sendTacCode.mustache','utf8')

const login = async filterObj => {
  const { email, password, ip, agent } = filterObj;
  let sqlselect = `
  SELECT
  t.*
  FROM(
    select 
    ${Constants.SCHEMA}.users.*,
    (
      select 
      COALESCE(
        JSON_AGG(t ORDER BY t.roleid ASC) 
      , '[]')
      FROM (
        select 
        ${Constants.SCHEMA}.role.*
        FROM ${Constants.SCHEMA}.role_user
        LEFT JOIN ${Constants.SCHEMA}.role ON ${Constants.SCHEMA}.role_user.roleid = ${Constants.SCHEMA}.role.roleid
        WHERE ${Constants.SCHEMA}.role_user.userid = ${Constants.SCHEMA}.users.id
      ) as t
    ) 
    AS role_list
    from ${Constants.SCHEMA}.users
  ) as t`;
  let strWhere = ``;
  let arrParams = [];

  if (email != null && email != "") {
    if (arrParams.length === 0) strWhere += `WHERE `;
    else strWhere += ` AND `;
    strWhere += `LOWER(t.email) = $${arrParams.length + 1}`;
    arrParams.push(email.toLowerCase());
  } 
  
  sqlselect = `${sqlselect} ${strWhere}`;
  try {
    let rows = [];
    let messages = null
    if(email == null || password == null){
      messages = `Email and password cannot be empty`
    } else {
      const userData = await pool.query(sqlselect,arrParams);
      if (userData.rows.length === 0) {
        messages = `Your credential is not correct, your account will be suspended if you failed 5 times`
      } else {
        let decryptedPassword = passDecrypt(password)
        if(bcrypt.compareSync(decryptedPassword,userData.rows[0].password)){
          if(userData.rows[0].suspended === true){
            messages = `Your account has been suspended, please contact the administrator.`
          } else if (userData.rows[0].active !== true) {
            messages = `User login currently inactive please contact admin.`
          } else {
            rows = [Object.fromEntries(Object.entries(userData.rows[0]).filter(([key]) => !key.includes('password')))]
            messages = `Login success`
            const logValue = JSON.stringify({ agent: agent, ip: ip, remark:"Login Success" });
            AuditTrailService.addToAudit(new Date(), "Authentication", "Login", userData.rows[0].name, ip, null, logValue);
          }
        } else {
          let failedAttemps = await limit(email.toLowerCase())
          if(failedAttemps === 4){
            suspend({email:userData.rows[0].email})
          }
          messages = `Your credential is not correct, your account will be suspended if you failed 5 times`
        }
      }
    }
    return { rows, messages: messages };
  } catch (error) {
    throw error
  }
};

const mockIsprintLogin = async filterObj => {
  const { body, ip, agent } = filterObj;
  try {
  let result = {}
  let data1Fa = {
  "result": {
    "attr.LT": "1697211292837",
    "authenticated": false,
    "sessionIID": "y0BiI5LoAnzEecjJXue3kg",
    "lastAccessTime": 1697182493124,
    "realmId": "AV-OATH",
    "sessionFlags": 0,
    "attr.OathTokenLoginState": "{\"state\":0}",
    "serverId": "HKDC2VMSSO13QA",
    "userId": "anbya_ali",
    "attr.IT": "300",
    "expiresAt": 1697211292,
    "realm.lastLoginSuccessTime": 1697161986000,
    "userParentUUID": "ActiveDirectory:5DB1C533C4AB88448D1C2A3CFE695247",
    "userParentId": "Vendor",
    "sessionToken": `${body.userId}_${body.platform}_${moment().format('YYYMMDDHHMMSS')}`,
    "challenge": {
      "challengeToken": "0001Sb1l5AsiRGzBT6s9gbsGGJBSsnTEXAWzy6fJjGMHPmfFJsPRFoJNA_L0ze323-LIGpOR4Zhktg",
      "authenticationCode": 18888,
      "message": "PAC=7356",
      "params": {
        "expireddate": "Oct 16, 2023",
        "pac": "7356",
        "returnOTPToClient": false,
        "issuetime": "11:41:36 AM",
        "expiredtime": "11:51:36 AM",
        "expiredTimeMilis": "1697428296735",
        "tokenUUID": "MemoryTokenStore:TeST7QUVao",
        "issueTimeMilis": "1697427696735",
        "deliverySearchKey": "MemoryTokenStore:TeST7QUVao",
        "issuedate": "Oct 16, 2023",
        "timeout": "600"
      }
    },
    "responses": {
      "email": `${body.userId}`
    },
    "userParentDN": "OU=Vendor,OU=Users,OU=BU-Averis,OU=Site-BangsarSouth,OU=GLOBALNET,DC=GLOBALNET,DC=LCL",
    "idleTimeOutInSecs": 300,
    "userUUID": "ActiveDirectory:52801A2BC66663419889B21A9F9064E9",
    "loginModuleStates": [
        {
        "authenticated": true,
        "canChangePassword": true,
        "id": "DefaultActiveDirectoryLogin",
        "loginModuleHandlerClass": "LdapLogin"
        },
        {
        "authenticated": false,
        "canChangePassword": false,
        "id": "DefaultOATHTokenLogin",
        "loginModuleHandlerClass": "OATHTokenLogin"
        }
      ],
      "attr.regenerated": "1697182493125"
    },
    "amProcessingTimeMillis": 295
  };

  let data2Fa = {
    "result": {
      "attr.LT": "1697444256555",
      "authenticated": true,
      "sessionIID": "9kcxl71aGjYa7MsqOxaUlg",
      "lastAccessTime": 1697415586756,
      "realmId": "AV-OATH",
      "sessionFlags": 1,
      "attr.OathTokenLoginState": "{\"state\":3,\"tokenUuid\":\"\"}",
      "loginUserAgent": "",
      "serverId": "HKDC2VMSSO13QA",
      "userId": "anbya_ali",
      "attr.IT": "300",
      "expiresAt": 1697444256,
      "realm.lastLoginSuccessTime": 1697182578000,
      "loginTime": 1697415586000,
      "userParentUUID": "ActiveDirectory:5DB1C533C4AB88448D1C2A3CFE695247",
      "userParentId": "Vendor",
      "sessionToken": `${body.userId}_${body.platform}_${moment().format('YYYMMDDHHMMSS')}`,
      "responses": {
        "email": `${body.userId}`
      },
      "userParentDN": "OU=Vendor,OU=Users,OU=BU-Averis,OU=Site-BangsarSouth,OU=GLOBALNET,DC=GLOBALNET,DC=LCL",
      "idleTimeOutInSecs": 300,
      "userUUID": "ActiveDirectory:52801A2BC66663419889B21A9F9064E9",
      "loginModuleStates": [
        {
        "authenticated": true,
        "canChangePassword": true,
        "id": "DefaultActiveDirectoryLogin",
        "loginModuleHandlerClass": "LdapLogin"
        },
        {
        "authenticated": true,
        "canChangePassword": false,
        "id": "DefaultOATHTokenLogin",
        "loginModuleHandlerClass": "OATHTokenLogin"
        }
      ],
      "attr.regenerated": "1697415586759"
    },
    "amProcessingTimeMillis": 240
  }
  if(body.sessionToken === ''){
    result = data1Fa
  } else {
    result = data2Fa
  }
  return result;
  } catch (error) {
    throw error
  }
};
  

const isprintLogin = async filterObj => {
  const { body, ip, agent } = filterObj;

  let params = {...body}
  delete params['platform']

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.ISPRINT_URL,
    headers: { 
      'Content-Type': 'application/json'
    },
    data : params
  };
  
  let result = await axios.request(config)
  .then((response) => {
    return response.data;
  })
  .catch((error) => {
    return error.response.data;
  });
  return result
};

const suspend = async (itemList) => {
  let suspendQuery = `UPDATE ${Constants.SCHEMA}.users SET suspended=true WHERE email=$1;`;
  try {
    const { rows } = {rows:[]};
    await pool.query(suspendQuery, [itemList.email])
    return { rows };
  } catch (error) {
    throw error
  }
};

const checkSessions = async (itemList) => {
  let strWhere = [];
  let arrParams = [];
  let preparedQuery = `select * from ${Constants.SCHEMA}.session_token`;
  const keys = Object.keys(itemList)
  keys.forEach((key,index) => {
    strWhere.push(`${key}=$${arrParams.length+1} `)
    arrParams.push(itemList[key])
  });
  if (strWhere.length) {
    preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
  }
  try {
    const { rows } = await pool.query(preparedQuery, arrParams);
    return { rows };
  } catch (error) {
    return { error };
  }
};

const setSessions = async (userId,sessionToken,platform) => {
  let sqlAddQuery = `INSERT INTO ${Constants.SCHEMA}.session_token (user_id, session_token, platform) VALUES ($1,$2,$3);`;
  let sqlUpdateQuery = `UPDATE ${Constants.SCHEMA}.session_token SET session_token=$3 WHERE user_id=$1 AND platform=$2;`;
  try {
    let rows = [];
    const tokenData = await checkSessions({user_id:userId,platform:platform});
    if (tokenData.rows.length>0){
      await pool.query(sqlUpdateQuery, [userId,platform,sessionToken])
    } else {
      await pool.query(sqlAddQuery, [userId,sessionToken,platform]);
    }
    return { rows };
  } catch (error) {
    return { error };
  }
};

const updateSessions = async (oldAccessToken, accessToken, ip) => {
  let createDate = moment().format("YYYYMMDD HH:mm:ss.SSS")
  let expiredDate = moment().add(30, "minutes").format("YYYYMMDD HH:mm:ss.SSS")
  let sessionQ = `SELECT id, session_id, user_id, ip, created_at, expired_at FROM ${Constants.SCHEMA}.session WHERE session_id =$1;`;
  let query = `UPDATE ${Constants.SCHEMA}.session SET session_id=$2, created_at=$3, expired_at=$4, ip=$5 WHERE id=$1;`;
  try {
    const sessionData = await (await pool.query(sessionQ, [oldAccessToken])).rows;
    if(sessionData.length > 0 ){
      await pool.query(query, [sessionData[0].id,accessToken,createDate,expiredDate, ip])
    }
    return true;
  } catch (error) {
    throw error
  }
};

const sendTacEmail = async (email,code) => {
  try {
    let mailTransporter = NODEMAILER.createTransport(Constants.MAIL_TRANSPORTER);
    const sendMailer = {
      from: 'apical.mpu@aceresource.biz',
      to: `${email}`,
      subject: `Apical SFA TAC Code`,
      html: mustache.render(emailTemplate,{
        message: `Your TAC code is ${code}. Please use the code within 5 minutes.`
      })
    };
    await mailTransporter.sendMail(sendMailer);
  } catch (error) {
    throw error
  }
}

const createTac = async (email) => {
  let userCheckQuery = `select * from ${Constants.SCHEMA}.users WHERE email=$1`;
  let userData = await (await pool.query(userCheckQuery,[email])).rows;
  let sqlQuery = `INSERT INTO ${Constants.SCHEMA}.tac_code ( email, code, created_at, expired_at ) VALUES ($1,$2,$3,$4);`;

  try {
    if(userData.length>0){
      let code = crypto.randomInt(100000, 999999)
      let createDate = moment().format("YYYYMMDD HH:mm:ss.SSS")
      let expiredDate = moment().add(5, "minutes").format("YYYYMMDD HH:mm:ss.SSS")
      await sendTacEmail(email,code)
      const { rows } = await pool.query(sqlQuery, [email, code, createDate, expiredDate]);
      
      return { rows, error: 0 , message:'TAC code send successfully.' };
    } else {
      const { rows } = {rows:[]}
      return { rows, error: 1, message:'Your email is not listed in our database' };
    }
  } catch (error) {
    throw error
  }
};

const verifyTac = async filterObj => {
  const { email, code } = filterObj;

  let nowDate = moment().format("YYYYMMDD HH:mm:ss.SSS")

  let existornot = [];
  let sqlselect = `select * from ${Constants.SCHEMA}.tac_code`;
  let strWhere = ``;
  let arrParams = [];

  if (email != null && email != "") {
    if (arrParams.length === 0) strWhere += `WHERE `;
    else strWhere += ` AND `;
    strWhere += `LOWER(email) = $${arrParams.length + 1}`;
    arrParams.push(email.toLowerCase());
  }
  
  sqlselect = `${sqlselect} ${strWhere} ORDER BY created_at DESC`;
  try {
    if(code == null || email == null){
        existornot.push({
          exist: false,
          verified : false
        });
    } else {
        const { rows } = await pool.query(sqlselect,arrParams);
        if (rows.length === 0) {
            existornot.push({
              exist: false,
              verified : false
            });
        } else {
          let index = rows.findIndex(x => x.code == code)
          if (index === -1) {
            existornot.push({
              exist: false,
              verified : false
            });
          } else if (index > 0) {
            existornot.push({
              exist: true,
              verified : false
            });
          } else {
            let expiredDate = moment(rows[0].expired_at).format("YYYYMMDD HH:mm:ss.SSS")
            let diff = moment(nowDate, "YYYYMMDD HH:mm:ss.SSS").diff(
                moment(moment(expiredDate, "YYYYMMDD HH:mm:ss.SSS"), "YYYYMMDD HH:mm:ss.SSS"),
                "minutes"
            )
            if(diff > 0){
                existornot.push({ 
                    exist: true,
                    verified : false
                });
            } else {
                existornot.push({ 
                    exist: true,
                    verified : true
                });
            }
          }
        }
    }
    return { existornot, error: null };
  } catch (error) {
    throw error
  }
};

const changePasswords = async (itemList) => {
  let updateeDate = moment().format("YYYYMMDD HH:mm:ss.SSS")
  let saltRounds = 10;
  let salt = bcrypt.genSaltSync(saltRounds)
  let hassedPassword = bcrypt.hashSync(itemList.password, salt)
  let sqlQuery = `UPDATE ${Constants.SCHEMA}.users SET password=$2 WHERE email=$1;`;
  let insertPassQ = `INSERT INTO ${Constants.SCHEMA}.user_password_histories(user_id, old_password, updated_at) VALUES ($1, $2, $3);`;
  let userQuery = `SELECT id, password FROM ${Constants.SCHEMA}.users WHERE email=$1;`;
  let passwordHistoryQuery = `
  SELECT 
  a.id, a.user_id, a.old_password, a.updated_at 
  FROM ${Constants.SCHEMA}.user_password_histories as a
  LEFT JOIN ${Constants.SCHEMA}.users as b ON a.user_id = b.id
  WHERE b.email=$1 ORDER BY a.id DESC LIMIT 11;`;

  try {
    let tacCodeChecking = await verifyTac({email:itemList.email, code:itemList.code})

    if(tacCodeChecking.existornot.length>0){
      if(tacCodeChecking.existornot[0].exist === false || tacCodeChecking.existornot[0].verified === false){
        const { rows } = {rows:[]}
        return { rows, error: 1 , message:'Failed to change the password' };
      } else{
        let passwordMatchCount = 0
        const userData = await (await pool.query(userQuery, [itemList.email])).rows;
        const passwordHistoryData = await (await pool.query(passwordHistoryQuery, [itemList.email])).rows;
        for (let i = 0; i < passwordHistoryData.length; i++) {
          if(bcrypt.compareSync(itemList.password,passwordHistoryData[i].old_password)){
            passwordMatchCount = passwordMatchCount +1
          }
        }
        for (let i = 0; i < userData.length; i++) {
          if(bcrypt.compareSync(itemList.password,userData[i].password)){
            passwordMatchCount = passwordMatchCount +1
          }
        }
        if(passwordMatchCount>0){
          const { rows } = {rows:[]}
          return { rows, error: 1 , message:'cannot use old password.' };
        } else {
          const { rows } = await pool.query(sqlQuery, [itemList.email,hassedPassword]);
          await pool.query(insertPassQ, [userData[0].id,hassedPassword,updateeDate])
          return { rows, error: 0 , message:'Password has been successfully changed!' };
        }
      }
    } else {
      const { rows } = {rows:[]}
      return { rows, error: 1 , message:'Failed to change the password' };
    }
  } catch (error) {
    throw error
  }
};

const clearSession = async (userId) => {
  let suspendQuery = `DELETE FROM ${Constants.SCHEMA}.session_token WHERE user_id = $1;`;
  try {
    const { rows } = await pool.query(suspendQuery, [userId]);
    return { rows };
  } catch (error) {
    throw error
  }
};

const existUser = async filterObj => {
  const { email, username, ip, agent } = filterObj;
  let whereClauses = [];

  let sqlselect = `select *, (
    SELECT json_agg(json_build_object(
        'module', M.modulename,
        'permission', SM.sub_module_key
    ))
    FROM ${Constants.SCHEMA}.users U
    LEFT JOIN ${Constants.SCHEMA}.role_user RU ON RU.userid = U.id
    LEFT JOIN ${Constants.SCHEMA}.role_module RM ON RM.roleid = RU.roleid
    LEFT JOIN ${Constants.SCHEMA}.module M ON M.moduleid = RM.moduleid
    LEFT JOIN ${Constants.SCHEMA}.submodule SM ON SM.submoduleid = RM.submoduleid
    WHERE U.id = PU.id
    ) AS modules,
    (
        SELECT json_agg(json_build_object(
            'rolename', R.rolename,
            'roleid', R.roleid
        ))
        FROM ${Constants.SCHEMA}.users U
        LEFT JOIN ${Constants.SCHEMA}.role_user RU ON RU.userid = U.id
        LEFT JOIN ${Constants.SCHEMA}.role R ON R.roleid = RU.roleid
        WHERE U.id = PU.id
    ) AS roles
 from ${Constants.SCHEMA}.users PU`;

  if (username) {
    whereClauses.push(`username ilike '${username}'`);
  }
  if (email) {
    whereClauses.push(`email ilike '${email}'`);
  }

  let existornot = [];

  if (whereClauses.length === 0) {
    existornot.push({ userexist: true, userData: [] });
    return { existornot, error: null };
  }
  sqlselect = `${sqlselect} WHERE ${whereClauses.join(" OR ")}`;
  try {
    const { rows } = await pool.query(sqlselect);
    if (rows.length === 0) {
      existornot.push({ userexist: false, userData: [] });
    } else {
      existornot.push({
        userexist: true,
        username: username && rows[0].username ? username.toLowerCase() === rows[0].name.toLowerCase() : false,
        email: email ? email.toLowerCase() === rows[0].email.toLowerCase() : false, 
        userData: [{
          id:rows[0].id,
          name:rows[0].name,
          email:rows[0].email,
          modules:rows[0].modules,
          roles:rows[0].roles,
        }]
      });
      const logValue = JSON.stringify({ agent: agent, ip: ip, remark:"Login Success" });
      AuditTrailService.addToAudit(new Date(), "Authentication", "Login", rows[0].name.toLowerCase() , ip, null, logValue);
    }
    return { existornot, error: null };
  } catch (error) {
    throw error
  }
};

module.exports = {
  login,
  mockIsprintLogin,
  isprintLogin,
  suspend,
  checkSessions,
  setSessions,
  updateSessions,
  createTac,
  verifyTac,
  changePasswords,
  clearSession,
  existUser,
};
