const pool = require("../utils/db");

const applyValueRangeQuery = (columnName, minValue, maxValue) => {
  let ret = "";
  let whereClauses = [];

  if (columnName) {
    if (minValue !== undefined && !isNaN(minValue)) {
      whereClauses.push(`${columnName} >= ${minValue}`);
    }
    if (maxValue !== undefined && !isNaN(maxValue)) {
      whereClauses.push(`${columnName} <= ${maxValue}`);
    }
  }

  if (whereClauses.length) {
    ret = `${whereClauses.join(" AND ")}`;
  }

  return ret;
};

const applyDateRangeQuery = (columnName, minValue, maxValue) => {
  let ret = "";
  let whereClauses = [];

  if (columnName) {
    if (minValue !== undefined) {
      whereClauses.push(`${columnName} >='${minValue}'`);
    }
    if (maxValue !== undefined) {
      whereClauses.push(`${columnName} <= '${maxValue}'`);
    }
  }

  if (whereClauses.length) {
    ret = `${whereClauses.join(" AND ")}`;
  }
  return ret;
};

const getTotalData = async (model, whereQuery) => {
  try {
    let query = `SELECT COUNT(*) FROM ${model}`;

    if (whereQuery) {
      query = query.concat(` WHERE ${whereQuery}`);
    }

    const result = await pool.query(query);

    if (result) {
      return Number(result.rows[0].count);
    }

    return Error("Fail to total data");
  } catch (error) {
    throw Error(error);
  }
};

const applyPaginationQuery = (query, page, limit) => {
  let ret = query;

  if (page) {
    let countPerPage = Number(limit);
    let pageNum = page ? Number(page) : 1;
    ret = `${ret} LIMIT ${countPerPage} OFFSET ${(pageNum - 1) * countPerPage}`;
  }

  return ret;
};

module.exports = {
  applyValueRangeQuery,
  applyDateRangeQuery,
  applyPaginationQuery,
  getTotalData,
};
