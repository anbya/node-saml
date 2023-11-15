const pool = require("../utils/db");
const { Constants } = require("../utils");
const AuditTrailService = require("./AuditTrailService");

const getRoleList = async params => {
  try {
    const { perPage, page, sortColumn, sortType } = params;

    const filter = [];
    const bindVal = [];
    const queryFilter = {
      filter_role: [`ro.roleid = $[?]`, v => v],
      filter_module: [`(SELECT COUNT(r.id) FROM ${Constants.SCHEMA}.role_module r WHERE ro.roleid = r.roleid AND r.moduleid = $[?]) > 1`, v => v],
      filter_submobule: [`(SELECT COUNT(r.id) FROM ${Constants.SCHEMA}.role_module r WHERE ro.roleid = r.roleid AND r.submoduleid = $[?]) > 1`, v => v],
    };

    Object.keys(queryFilter).map((v, i) => {
      if (params[v]) {
        filter.push(queryFilter[v][0]?.replace('[?]', filter.length + 1));
        bindVal.push(queryFilter[v][1](params[v]));
      }
    });

    const filterStr = filter.length ? " WHERE " + filter.join(" AND ") : "";

    const sqlSelect = `SELECT 
            ROW_NUMBER() OVER (ORDER BY ${sortColumn ?? "ro.rolename"} ${sortType ?? ""}) AS no, 
            ro.*,
            (
                SELECT json_agg(json_build_object(
                    'roleid', rom.roleid,
                    'moduleid', m.moduleid,
                    'modulename', m.modulename,
                    'submoduleid', sm.submoduleid,
                    'sub_module_name', sm.sub_module_name,
                    'sub_module_key', sm.sub_module_key
                ))
                FROM ${Constants.SCHEMA}.role_module AS rom
                JOIN ${Constants.SCHEMA}.module AS m ON rom.moduleid = m.moduleid
                JOIN ${Constants.SCHEMA}.submodule AS sm ON rom.submoduleid = sm.submoduleid
                WHERE rom.roleid = ro.roleid
            ) AS "moduleSubmoduleData"  
      FROM ${Constants.SCHEMA}.role AS ro 
      ${filterStr} 
      ${sortType ? ` ORDER BY ${sortColumn} ${sortType}` : ` ORDER BY ro.rolename ASC`} 
      ${perPage ? ` LIMIT ${perPage}` : ``} ${page ? ` OFFSET ${(page - 1) * perPage}` : ``}`;

    const sqlTotal = `SELECT COUNT(ro.roleid) as total 
      FROM ${Constants.SCHEMA}.role AS ro 
      ${filterStr} `;

    const queryTotal = await pool.query(sqlTotal, bindVal);
    const { rows } = await pool.query(sqlSelect, bindVal);

    return { rows, total: queryTotal.rows[0].total, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const deleteRole = async (params, user) => {
  try {
    const queryFind = `      
            SELECT roleid, rolename
            FROM ${Constants.SCHEMA}.role
            WHERE roleid = $1;
        `;

    const resultFind = await pool.query(queryFind, [params.roleid]);

    if (!resultFind.rowCount) {
      throw `Role not exist`;
    }

    const queryDelete = `      
            DELETE FROM ${Constants.SCHEMA}.role
            WHERE roleid = $1`;

    const resultDelete = await pool.query(queryDelete, [params.roleid]);

    // Delete Role Module
    const queryDrm = `      
            DELETE FROM ${Constants.SCHEMA}.role_module
            WHERE roleid = $1`;

    await pool.query(queryDrm, [params.roleid]);

    
    const logValue = JSON.stringify({
      agent: user.agent,
      ip: user.ip,
      ...resultFind?.rows?.[0]
    });

    AuditTrailService.addToAudit(new Date(), "User Management", "Delete Role", user.name, user.ip, 3, logValue);

    return { rows: resultDelete.rows, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const addNewRole = async (params, user) => {
  try {
    const { rolename, priority, modules } = params;

    let role_priority = 0;
    if (priority) {
      role_priority = priority;
    }

    let sqlcheck = `select * from ${Constants.SCHEMA}.role where lower(LTRIM(RTRIM(rolename)))=$1`;
    let sqlinsert = `insert into ${Constants.SCHEMA}.role(rolename, role_priority) 
      values ($1,$2) RETURNING roleid`;

    let returnString = {};
    const resultCheck = await pool.query(sqlcheck, [rolename]);

    if (resultCheck.rowCount === 0) {
      const runInsert = await pool.query(sqlinsert, [rolename, role_priority]);
      const roleid = runInsert.rows[0].roleid;

      if (modules.length) {
        // to assign new modules for user
        for (const module of modules) {
          const queryAnmfu = `INSERT INTO ${Constants.SCHEMA}.role_module (roleid, moduleid, submoduleid)
             VALUES ($1,$2,$3)`;

          const resultAnmfu = await pool.query(queryAnmfu, [roleid, module.moduleid, module.submoduleid]);
        }
      }

      const logValue = JSON.stringify({
        agent: user.agent,
        ip: user.ip,
        roleId: roleid,
        rolename,
        modulesId: JSON.stringify(modules),
      });
  
      AuditTrailService.addToAudit(new Date(), "User Management", "Add Role", user.name, user.ip, 3, logValue);

      returnString = {
        roleExist: false,
        rolename: rolename,
        role_priority: parseInt(role_priority),
      };
    } else {
      returnString = {
        roleExist: true,
        roleid: resultCheck.rows[0].roleid,
        rolename: resultCheck.rows[0].rolename,
        role_priority: parseInt(resultCheck.rows[0].role_priority),
      };
    }

    return returnString;
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

const updateRole = async (params, user) => {
  try {
    // update
    const queryUpdate = `      
          UPDATE ${Constants.SCHEMA}.role SET role_priority=$1
          WHERE roleid = $2 RETURNING *`;

    const { rows } = await pool.query(queryUpdate, [params.priority, params.roleid]);

    // Delete Role Module
    const queryDrm = `DELETE FROM ${Constants.SCHEMA}.role_module WHERE roleid = $1`;
    await pool.query(queryDrm, [params.roleid]);

    if (params.modules.length) {
      // Assign new modules for roles

      for (const v of params.modules) {
        const queryAnmfu = `INSERT INTO ${Constants.SCHEMA}.role_module(roleid, 
            moduleid, submoduleid) VALUES ($1,$2,$3)`;

        await pool.query(queryAnmfu, [params.roleid, v.moduleid, v.submoduleid]);
      }
    }

    const logValue = JSON.stringify({
      agent: user.agent,
      ip: user.ip,
      ...rows?.[0],
      modulesId:  JSON.stringify(params?.modules),
    });

    AuditTrailService.addToAudit(new Date(), "User Management", "Update Role", user.name, user.ip, 3, logValue);

    return { rows, error: null };
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
};

module.exports = {
  getRoleList,
  deleteRole,
  addNewRole,
  updateRole,
};
