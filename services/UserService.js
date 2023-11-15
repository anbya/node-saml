const pool = require("../utils/db");
const { Constants } = require("../utils");

const get = async (itemList) => {
  let page = itemList.page
  let perPage = itemList.perPage
  let filteredPagination = ['page','perPage']

  let preparedQuery = `select * FROM ${Constants.SCHEMA}.users`;
  let strWhere = [];
  let arrParams = [];
  const keys = Object.keys(itemList)
  keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
    strWhere.push(`${key}=$${arrParams.length+1} `)
    arrParams.push(itemList[key])
  });
  if (strWhere.length) {
    preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
  }
  let query = `${preparedQuery} ORDER BY id ASC`;
  let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
  try {
    const countData = await pool.query(query,arrParams);
    const { rows } = await pool.query(query_limited,arrParams);
    return { rows, total: countData.rows.length };
  } catch (error) {
    throw error
  }
};

module.exports = {
    get,
};
