const pool = require("../utils/db");
const { Constants } = require("../utils");
const UploadService = require("./UploadService");
const { log } = require("winston");

const get = async (itemList) => {
    try {
        let latestParams = []
        let latestWhere = [];
        if(itemList.date){
            latestWhere.push(`TO_CHAR(date, 'DD-MM-YYYY') = $${latestParams.length+1}`)
            latestParams.push(itemList.date)
        }
        let latestQuery = `
        SELECT
            id,
            (
                SELECT
                currency_rate
                FROM 
                ${Constants.SCHEMA}.va_upload
                WHERE upload_id = ${Constants.SCHEMA}.upload.id
                GROUP BY currency_rate
                LIMIT 1
            ) as currency_Rate
        FROM ${Constants.SCHEMA}.upload WHERE product_type = 'va'
        `
        if (itemList.date) {
            latestQuery = `${latestQuery} AND ${latestWhere.join(" AND ")}`;
        }
        latestQuery = `${latestQuery} ORDER BY date DESC, time DESC LIMIT 1 OFFSET 0
        `

        const latestData = await pool.query(latestQuery,latestParams);

        let currency_rate = null
        if(latestData.rows.length > 0){
            currency_rate = latestData.rows[0]['currency_rate']
        }

        let vaParams = {}
        vaParams = {
            ...vaParams,
            upload_id: latestData.rows.length > 0 ? latestData.rows[0].id : null
        }
        if(itemList.description){
            vaParams = {
                ...vaParams,
                description:itemList.description
            }
        }
        if(itemList.product_group){
            vaParams = {
                ...vaParams,
                product_group:itemList.product_group
            }
        }
        if(itemList.brand){
            vaParams = {
                ...vaParams,
                brand:itemList.brand
            }
        }
        if(itemList.segment){
            if(itemList.segment !== 'all'){
                vaParams = {
                    ...vaParams,
                    segment:itemList.segment
                }
            }
        }
        const { rows } = await UploadService.getVaData(vaParams);
        return { rows, currency_rate:rows.length>0 ? currency_rate : null };
    } catch (error) {
        throw error
    }
};

module.exports = {
    get,
};
