const pool = require("../utils/db");
const { Constants } = require("../utils");

const getModuleList = async params => {
  try {
    const { perPage, page, sortColumn, sortType } = params;

    const filter = [];
    const bindVal = [];
    const queryFilter = {
      filter_module: [`mo.moduleid = $[?]`, v => v],
    };

    Object.keys(queryFilter).map((v, i) => {
      if (params[v]) {
        filter.push(queryFilter[v][0]?.replace("[?]", filter.length + 1));
        bindVal.push(queryFilter[v][1](params[v]));
      }
    });

    const filterStr = filter.length ? " WHERE " + filter.join(" AND ") : "";

    const sqlSelect = `SELECT 
      ROW_NUMBER() OVER (ORDER BY ${sortColumn ?? "mo.modulename"} ${sortType ?? ""}) AS no, 
      mo.*, 
      (
        SELECT (
              SELECT
                  jsonb_agg(
                      jsonb_build_object(
                          'moduleid', mo.moduleid,
                          'modulename', mo.modulename,
                          'submoduleid',  subm.submoduleid,
                          'sub_module_name', subm.sub_module_name,
                          'sub_module_key', subm.sub_module_key
                      )
                  )
              FROM
                  ${Constants.SCHEMA}.submodule subm
              WHERE
                  mo.moduleid = subm.moduleid
          )
      ) AS "submodules"
    FROM ${Constants.SCHEMA}.module AS mo
    ${filterStr} 
    ${sortType ? ` ORDER BY ${sortColumn} ${sortType}` : ` ORDER BY mo.modulename ASC`} 
    ${perPage ? ` LIMIT ${perPage}` : ``} ${page ? ` OFFSET ${(page - 1) * perPage}` : ``}
  `;

    const sqlTotal = `SELECT COUNT(mo.moduleid) as total 
    FROM ${Constants.SCHEMA}.module AS mo ${filterStr} `;

    const queryTotal = await pool.query(sqlTotal, bindVal);
    const { rows } = await pool.query(sqlSelect, bindVal);

    return { rows, total: queryTotal.rows[0].total, error: null };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const addNewModule = async params => {
  try {
    const { modulename } = params;

    let sqlcheck = `select * from ${Constants.SCHEMA}.module where lower(LTRIM(RTRIM(modulename)))=$1`;
    let sqlinsert = `insert into ${Constants.SCHEMA}.module(modulename) values ($1)`;

    let returnString = {};
    const resultCheck = await pool.query(sqlcheck, [modulename]);
    if (resultCheck.rowCount === 0) {
      await pool.query(sqlinsert, [modulename]);
      returnString = {
        moduleExist: false,
        modulename: modulename,
      };
    } else {
      returnString = {
        moduleExist: true,
        moduleid: resultCheck.rows[0].moduleid,
        modulename: resultCheck.rows[0].modulename,
      };
    }

    return returnString;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateModule = async params => {
  try {
    const { moduleid, submoduleid, submodulename, submodulekey } = params;

    let sqlcheckModule = `select * from ${Constants.SCHEMA}.module where moduleid=$1`;
    const resultCheckModule = await pool.query(sqlcheckModule, [moduleid]);
    if (!resultCheckModule.rowCount) {
      throw "Invalid Module ID";
    }

    if (submoduleid) {
      // update case
      let sqlcheckSubmodule = `select * from ${Constants.SCHEMA}.submodule where submoduleid=$1`;
      const resultCheckSubmodule = await pool.query(sqlcheckSubmodule, [submoduleid]);
      if (!resultCheckSubmodule.rowCount) {
        throw "Invalid submoduleid";
      }

      let sqlupdate =
        `UPDATE ${Constants.SCHEMA}.submodule SET sub_module_name=$1, sub_module_key=$2` + ` WHERE submoduleid = $3`;

      await pool.query(sqlupdate, [submodulename, submodulekey, submoduleid]);

      return {
        submoduleid,
        submodulename,
        submodulekey,
      };
    } else {
      // create new submodule
      let sqlcheck = `select * from ${Constants.SCHEMA}.submodule where lower(LTRIM(RTRIM(sub_module_name)))=$1 or lower(LTRIM(RTRIM(sub_module_key)))=$2`;
      let sqlinsert = `insert into ${Constants.SCHEMA}.submodule(sub_module_name, moduleid, sub_module_key) values ($1,$2,$3)`;

      const resultCheck = await pool.query(sqlcheck, [submodulename, submodulekey]);
      if (!resultCheck.rowCount) {
        await pool.query(sqlinsert, [submodulename, moduleid, submodulekey]);
        return {
          submoduleExist: false,
          moduleid,
          submodulename,
          submodulekey,
        };
      } else {
        const { sub_module_name, sub_module_key } = resultCheck.rows[0];
        return {
          submoduleExist: true,
          moduleid,
          submodulename: sub_module_name,
          submodulekey: sub_module_key,
        };
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getModuleList,
  addNewModule,
  updateModule,
};
