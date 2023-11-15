const pool = require("../utils/db");
const { Constants } = require("../utils");
const AuditTrailService = require("./AuditTrailService");

const createUser = async (params, user) => {
  try {

    const queryResult = `      
      INSERT INTO ${Constants.SCHEMA}.users (
        name,
        fullname, 
        email, 
        active, 
        created_at, 
        updated_at
      ) 
      VALUES(
        $1,
        $2,
        $3,
        $4,
        NOW(),
        NOW()
      ) RETURNING *`;
    const { rows } = await pool.query(queryResult, [
      params?.fullname,
      params?.fullname,
      params?.email,
      params?.active,
    ]);

    const userid = rows[0].id;

    const insertRoleUser = `
          INSERT INTO ${Constants.SCHEMA}.role_user (userid, roleid)
          VALUES ($1, $2)`;
    await pool.query(insertRoleUser, [userid, params?.roles]);
    const logValue = JSON.stringify({
      agent: user.agent,
      ip: user.ip,
      fullname: params?.fullname,
      email: params?.email,
      roleId: params?.roles,
    });

    AuditTrailService.addToAudit(new Date(), "User Management", "Add", user.name, user.ip, 3, logValue);
    return { rows, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const getUserList = async params => {
  try {
    const { perPage, page, sortColumn, sortType } = params;

    const filter = [];
    const bindVal = [];
    const queryFilter = {
      filter_email: [`PU.email LIKE $`, v => `%${v}%`],
      filter_role: [`RU.roleid = $`, v => v],
    };

    Object.keys(queryFilter).map((v, i) => {
      if (params[v]) {
        filter.push(queryFilter[v][0] + (filter.length + 1));
        bindVal.push(queryFilter[v][1](params[v]));
      }
    });

    const filterStr = filter.length ? " WHERE " + filter.join(" AND ") : "";

    const sqlSelect = `
    SELECT
      ROW_NUMBER() OVER (ORDER BY ${sortColumn ?? "fullname"} ${sortType ?? ""}) AS no,
      PU.id AS "userId",
      PU.fullname,
      PU.active,
      PU.email AS email,
      (
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
    FROM ${Constants.SCHEMA}.users PU 
    LEFT JOIN ${Constants.SCHEMA}.role_user RU ON RU.userid = PU.id 
    ${filterStr} 
    ${sortType ? ` ORDER BY ${sortColumn} ${sortType}` : ` ORDER BY fullname ASC`} 
    ${perPage ? ` LIMIT ${perPage}` : ``} ${page ? ` OFFSET ${(page - 1) * perPage}` : ``}
    `;

    const sqlTotal = `SELECT COUNT(PU.id) as total 
    FROM ${Constants.SCHEMA}.users PU
    LEFT JOIN ${Constants.SCHEMA}.role_user RU ON RU.userid = PU.id   
    ${filterStr} `;

    const queryTotal = await pool.query(sqlTotal, bindVal);
    const { rows } = await pool.query(sqlSelect, bindVal);
    return { rows, total: queryTotal.rows[0].total, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const userExist = async params => {
  try {
    const findUser = async email => {
      const query = `
          SELECT PU.id "userId", 
          PU.fullname fullname,
          PU.email email, 
          PU.active active,
              (
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
            FROM ${Constants.SCHEMA}.users PU
            WHERE email= $1
          `;
      const result = await pool.query(query,[email]);
      return result;
    };

    const userData = await findUser(params?.email);

    if (!userData.rowCount) {
      return [];
    } else {
      return userData.rows[0];
    }
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const updateUser = async (params, user) => {
  try {
    const queryFindUserResult = `      
        SELECT id "userId", fullname
        FROM ${Constants.SCHEMA}.users 
        WHERE id = $1
      `;

    const resultFindUser = await pool.query(queryFindUserResult, [params.userId]);

    if (!resultFindUser.rowCount) {
      throw `User not exist [185]`;
    }

    let updateString = "";

    if (typeof params.active != "undefined") {
      updateString = updateString + `, active = ${params.active ? true : false}`;
    }

    const queryResult = `      
        UPDATE ${Constants.SCHEMA}.users
          SET updated_at = NOW() ${updateString}
        WHERE id = $1 RETURNING * `;

    const { rows } = await pool.query(queryResult, [params.userId]);

    // TODO remove all roles from user = rarfu
    const queryRarfu = `      
        DELETE FROM ${Constants.SCHEMA}.role_user 
        WHERE userid = $1`;

    await pool.query(queryRarfu, [params.userId]);

    if (params.roles.length) {
      // TODO assign new roles for user
      const rolesToAssign = params.roles.map(v => [params.userId, v]);
      for (const bindVal of rolesToAssign) {
        const queryAnrfu = `
        INSERT INTO ${Constants.SCHEMA}.role_user (userid, roleid)
        VALUES ($1, $2);`;

        await pool.query(queryAnrfu, bindVal);
      }
    }

    const logValue = JSON.stringify({
      agent: user.agent,
      ip: user.ip,
      ...rows?.[0],
      roleId: params?.roles[0],
    });

    AuditTrailService.addToAudit(new Date(), "User Management", "Update", user.name, user.ip, 3, logValue);

    return { rows, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const deleteUser = async (params, user) => {
  try {
    const queryFindUserResult = `      
        SELECT id "userId", fullname
        FROM ${Constants.SCHEMA}.users 
        WHERE id = $1;
      `;

    const resultFindUser = await pool.query(queryFindUserResult, [params.userId]);

    if (!resultFindUser.rowCount) {
      throw `User not exist [247]`;
    }

    const queryResult = `DELETE FROM ${Constants.SCHEMA}.users WHERE id = $1 RETURNING * ;`;

    const { rows } = await pool.query(queryResult, [params.userId]);

    const logValue = JSON.stringify({
      agent: user.agent,
      ip: user.ip,
      ...rows?.[0],
    });

    AuditTrailService.addToAudit(new Date(), "User Management", "Delete", user.name, user.ip, 3, logValue);

    return { rows, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

module.exports = {
  createUser,
  getUserList,
  userExist,
  updateUser,
  deleteUser,
};
