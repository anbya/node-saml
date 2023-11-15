const pool = require("../utils/db");
const { Constants } = require("../utils");
const UploadService = require("./UploadService");

const get = async (itemList) => {
    try {
        let latestParams = []
        let latestWhere = [];
        if(itemList.date1){
            latestWhere.push(`TO_CHAR(date, 'DD-MM-YYYY') = $${latestParams.length+1}`)
            latestParams.push(itemList.date1)
        }
        if(itemList.time1){
            latestWhere.push(`time = $${latestParams.length+1}`)
            latestParams.push(itemList.time1.toLowerCase())
        }
        let latestQuery = `
        SELECT 
        id, 
        TO_CHAR(date, 'DD-MM-YYYY') as formatted_date, 
        time,
        (
            SELECT
            currency_rate
            FROM 
            ${Constants.SCHEMA}.bulk_upload
            WHERE upload_id = ${Constants.SCHEMA}.upload.id
            GROUP BY currency_rate
            LIMIT 1
        ) as currency FROM ${Constants.SCHEMA}.upload WHERE product_type = 'bulk'
        `
        if (itemList.date1 || itemList.time1) {
            latestQuery = `${latestQuery} AND ${latestWhere.join(" AND ")} ORDER BY time DESC`;
        } else {
            latestQuery = `${latestQuery} ORDER BY date DESC, time DESC LIMIT 1 OFFSET 0
            `
        }

        let previousParams = []
        let previousWhere = [];
        if(itemList.date2){
            previousWhere.push(`TO_CHAR(date, 'DD-MM-YYYY') = $${previousParams.length+1}`)
            previousParams.push(itemList.date2)
        }
        if(itemList.time2){
            previousWhere.push(`time = $${previousParams.length+1}`)
            previousParams.push(itemList.time2.toLowerCase())
        }
        let previousQuery = `
        SELECT 
        id, 
        TO_CHAR(date, 'DD-MM-YYYY') as formatted_date, 
        time,
        (
            SELECT
            currency_rate
            FROM 
            ${Constants.SCHEMA}.bulk_upload
            WHERE upload_id = ${Constants.SCHEMA}.upload.id
            GROUP BY currency_rate
            LIMIT 1
        ) as currency FROM mpu.upload WHERE product_type = 'bulk'
        `
        if (itemList.date2 || itemList.time2) {
            previousQuery = `${previousQuery} AND ${previousWhere.join(" AND ")} ORDER BY time DESC`;
        } else {
            previousQuery = `${previousQuery} ORDER BY date DESC, time DESC LIMIT 1 OFFSET 1
            `
        }

        const latestData = await pool.query(latestQuery,latestParams);
        const previousData = await pool.query(previousQuery,previousParams);

        let idList = []
        let latestDataID = null
        let previousDataID = null
        let latestDataDate = null
        let previousDataDate = null
        let latestDataTime = null
        let previousDataTime = null
        let latestDataCurrency = null
        let previousDataCurrency = null
        if(latestData.rows.length > 0){
            latestDataID = latestData.rows[0].id
            latestDataDate = latestData.rows[0].formatted_date
            latestDataTime = latestData.rows[0].time
            latestDataCurrency = latestData.rows[0].currency
            idList.push(latestData.rows[0].id)
        }
        if(previousData.rows.length > 0){
            previousDataID = previousData.rows[0].id
            previousDataDate = previousData.rows[0].formatted_date
            previousDataTime = previousData.rows[0].time
            previousDataCurrency = previousData.rows[0].currency
            idList.push(previousData.rows[0].id)
        }
        itemList={
            ...itemList,
            list_id:idList
        }

        let page = itemList.page ? itemList.page : null
        let perPage = itemList.perPage ? itemList.perPage : null
        let orderData = itemList.orderData ? itemList.orderData : null
        let orderDirection= itemList.orderDirection ? itemList.orderDirection : null
        let filteredPagination = ['page','perPage','orderData','orderDirection','date1','time1','date2','time2']
    
        let preparedQuery = `
            SELECT 
            ${Constants.SCHEMA}.bulk_upload.product_name, 
            MIN(${Constants.SCHEMA}.bulk_upload.id) as min_id
            FROM ${Constants.SCHEMA}.bulk_upload
        `;
        let strWhere = [];
        let arrParams = [];
        const keys = Object.keys(itemList)
        keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
            if(key === 'product_name'){
                strWhere.push(`LOWER(product_name) LIKE $${arrParams.length+1}`)
                arrParams.push(`%${itemList[key].toLowerCase()}%`)
            } else if(key === 'list_id'){
                strWhere.push(`bulk_upload.upload_id = ANY($${arrParams.length+1})`)
                arrParams.push(itemList[key])
            } else {
                strWhere.push(`${key}=$${arrParams.length+1} `)
                arrParams.push(itemList[key])
            }
        });
        if (strWhere.length) {
            preparedQuery = `${preparedQuery} WHERE month is null AND ${strWhere.join(" AND ")}`;
        }
        let query = `${preparedQuery} GROUP BY product_name ORDER BY min_id ASC`;
        let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
        const countData = await pool.query(query,arrParams);
        const { rows } = await pool.query(query_limited,arrParams);
        for (const row of rows) {
            row.latestDataDate = latestDataDate
            row.previousDataDate = previousDataDate
            row.latestDataTime = latestDataTime
            row.previousDataTime = previousDataTime
            row.latestDataCurrency = latestDataCurrency
            row.previousDataCurrency = previousDataCurrency
            let latestProductData = await(await UploadService.getBulkData({
                upload_id:latestDataID,
                product_name:row.product_name
            })).rows
            row.latestData = latestProductData.length > 0 ? latestProductData : []
            let previousProductData = await(await UploadService.getBulkData({
                upload_id:previousDataID,
                product_name:row.product_name
            })).rows
            row.previousData = previousProductData.length > 0 ? previousProductData : []
        }
        return { rows, total: countData.rows.length };
    } catch (error) {
        throw error
    }
};

module.exports = {
    get,
};
