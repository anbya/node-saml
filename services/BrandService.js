const pool = require("../utils/db");
const { Constants } = require("../utils");

const get = async (itemList) => {
    try {
        let query = `
        SELECT UPPER(brand) as option FROM ${Constants.SCHEMA}.va_upload
        GROUP BY brand
        ORDER BY brand ASC 
        `
        const { rows } = await pool.query(query);
        return { rows };
    } catch (error) {
        throw error
    }
};

module.exports = {
    get,
};
