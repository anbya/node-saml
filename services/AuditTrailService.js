const pool = require("../utils/db");
const { Constants } = require("../utils");

const { applyPaginationQuery, getTotalData } = require("../utils/queryBuildHelper");

const getListModule = async filterObj => {
  let sqlselect = `select distinct on (module) module
                  from audit order by module asc`;

  try {
    const { rows } = await pool.query(sqlselect);
    return { rows, error: null };
  } catch (error) {
    throw error
  }
};

const filterAuditTrail = async filterObj => {
  const startDate = filterObj.startDate;
  const endDate = filterObj.endDate;
  const module = filterObj.module;
  const username = filterObj.username;
  const page = filterObj.page;
  const countPerPage = filterObj.countPerPage;

  let whereClauses = [];
  let dynamicQueryWhere = "";

  if (startDate && endDate) {
    whereClauses.push(`to_char(entry_date ,'YYYY-MM-DD') between '${startDate}' and '${endDate}'`);
  } else if (startDate) {
    whereClauses.push(`to_char(entry_date ,'YYYY-MM-DD') >= '${startDate}'`);
  } else if (endDate) {
    whereClauses.push(`to_char(entry_date ,'YYYY-MM-DD') <= '${endDate}'`);
  }

  if (username) {
    whereClauses.push(`username='${username}'`);
  }
  if (module) {
    whereClauses.push(`module='${module}'`);
  }

  if (whereClauses.length) {
    dynamicQueryWhere = whereClauses.join(" and ");
  }

  let sqlselect = `SELECT * FROM audit where username !='null' ${
    dynamicQueryWhere.length > 0 ? "AND " + dynamicQueryWhere : ""
  } ORDER BY entry_date DESC`;

  if (countPerPage) {
    sqlselect = applyPaginationQuery(sqlselect, page, countPerPage);
  }

  const totalCount = await getTotalData(
    `${Constants.SCHEMA}.audit`,
    `username !='null' ${dynamicQueryWhere.length > 0 ? "AND " + dynamicQueryWhere : ""}`
  );

  try {
    const { rows } = await pool.query(sqlselect);
    return { rows, error: null, totalCount, page, countPerPage };
  } catch (error) {
    throw error
  }
};

const getListUsername = async filterObj => {
  let sqlselect = `select distinct on (username) username
  from audit where username is not null  and username!='null' order by username asc`;

  try {
    const { rows } = await pool.query(sqlselect);

    return { rows, error: null };
  } catch (error) {
    throw error
  }
};

async function allDataAudit(month) {
  try {
    const sqlselect = `SELECT * FROM ${Constants.SCHEMA}.audit where to_char(entry_date ,'MM') = $1 and username !='null' order by entry_date desc`;

    const { rows } = await pool.query(sqlselect, [month]);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function addToAudit(date, module, action, username, ip, id_module, remarks) {
  const sqlInsert = `INSERT INTO ${Constants.SCHEMA}.audit (entry_date,module,action, username, user_ip, module_id, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
  try {
    const { rows } = await pool.query(sqlInsert, [date, module, action, username, ip, id_module, remarks]);
    return rows;
  } catch (error) {
    return "";
  }
}

async function getLocationName(id) {
  let sqlselect = `select name from ${Constants.SCHEMA}.location where id=$1`;
  try {
    const { rows } = await pool.query(sqlselect, [id]);
    return rows.length ? rows[0].name : "";
  } catch (error) {
    return "";
  }
}

async function addBatchToAudit(module, action, username, ip, location_id, itemList) {
  const promises = [];
  let locationName = await getLocationName(location_id);
  itemList.forEach(row => {
    let id = row.id || null;
    delete row.id;
    let remark = "";
    if (action === Constants.ACTION_CREATE) {
      remark = `Created ${module}, location: ${locationName}, Detail: ${JSON.stringify(row)}`;
    } else if (action === Constants.ACTION_EDIT) {
      remark = `Updated ${module}, location: ${locationName}, id: ${id}, Detail: ${JSON.stringify(row)}`;
    } else if (action === Constants.ACTION_DELETE) {
      remark = `Deleted ${module}, location: ${locationName}, id: ${id}`;
    } else if (action === Constants.ACTION_FORECAST) {
      remark = `Forcasted ${module}, location: ${locationName}, Detail: ${JSON.stringify(row)}`;
    } else {
      remark = `${action} ${module}, location: ${locationName}, id: ${id}, Detail: ${JSON.stringify(row)}`;
    }

    promises.push(addToAudit(new Date(), module, action, username, ip, id, remark));
  });
  await Promise.all(promises);
}

function updateAudit(username, pagename, remarks, action, remoteAddress) {
  const sqlInsert = `INSERT INTO ${Constants.SCHEMA}.audit (entry_date,module,action, username, user_ip, module_id, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
  //(reqedit.statusid = $1 OR reqedit.statusid = $2)
  try {
    pool.query(sqlInsert, [new Date(), pagename, action, username, remoteAddress, 0, remarks], (errorR, resultsR) => {
      if (errorR) {
        throw errorR;
      }
    });
  } catch (errorR) {
    console.log(errorR);
  }
}
const getAuditTrailData = async (itemList) => {
  let page = itemList.page ? itemList.page : null
  let perPage = itemList.perPage ? itemList.perPage : null
  let filteredPagination = ['page','perPage','reportYear']
  let year = itemList['reportYear'] ? itemList['reportYear'] : moment().format("YYYY")
  itemList = {
    ...itemList,
    year:year
  }

  let preparedQuery = `
  SELECT
  t.*
  FROM 
  (
      select 
      ${Constants.SCHEMA}.audit.*
      FROM ${Constants.SCHEMA}.audit
  ) as t
  `;

  let moduleQuery = `
  select 
  ${Constants.SCHEMA}.audit.module
  FROM ${Constants.SCHEMA}.audit
  GROUP BY module
  `;
  let strWhere = [];
  let arrParams = [];
  const keys = Object.keys(itemList)
  keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
      if(itemList[key] != null && itemList[key] != ''){
          if(key === 'year'){
              strWhere.push(`extract(year from t.entry_date) = $${arrParams.length+1} `)
              arrParams.push(itemList[key])
          } else if (key === 'month') {
              strWhere.push(`extract(month from t.entry_date) = $${arrParams.length+1} `)
              arrParams.push(itemList[key])
          } else if (key === 'loginType') {
              strWhere.push(`LOWER(t.remarks) LIKE $${arrParams.length+1} `)
              arrParams.push(`%${itemList[key].toLowerCase()}%`)
          } else {
              strWhere.push(`t.${key}=$${arrParams.length+1} `)
              arrParams.push(itemList[key])
          }
      }
  });
  if (strWhere.length) {
    preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
  }
  let query = `${preparedQuery} ORDER BY t.entry_date DESC`;
  let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
  try {
      const countData = await pool.query(query,arrParams);
      const moduleData = await pool.query(moduleQuery);
      const { rows } = await pool.query(query_limited,arrParams);
      return { rows, total: countData.rows.length, moduleData:moduleData.rows };
  } catch (error) {
    throw error
  }
};

module.exports = {
  getListModule,
  filterAuditTrail,
  getListUsername,
  allDataAudit,
  addToAudit,
  updateAudit,
  addBatchToAudit,
  getAuditTrailData
};
