const pool = require("../utils/db");
const XLSX = require('xlsx');
const { Constants } = require("../utils");
const { bulkData, vaData } = require('../utils/Extract')
const moment = require('moment')
const AuditTrailService = require("./AuditTrailService");

const get = async (itemList) => {
    let page = itemList.page ? itemList.page : null
    let perPage = itemList.perPage ? itemList.perPage : null
    let orderData = itemList.orderData ? itemList.orderData : null
    let orderDirection= itemList.orderDirection ? itemList.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let preparedQuery = `
    SELECT
    t.*
    FROM(
        select 
        ${Constants.SCHEMA}.upload.*,
        ${Constants.SCHEMA}.users.name as user_name,
        (
            CASE
                WHEN ${Constants.SCHEMA}.upload.product_type = 'bulk' then
                (
                    SELECT COUNT(id) FROM ${Constants.SCHEMA}.bulk_upload WHERE ${Constants.SCHEMA}.bulk_upload.upload_id = ${Constants.SCHEMA}.upload.id
                )
                ELSE
                (
                    SELECT COUNT(id) FROM ${Constants.SCHEMA}.va_upload WHERE ${Constants.SCHEMA}.va_upload.upload_id = ${Constants.SCHEMA}.upload.id
                )
            END 
        ) as product_count
        FROM ${Constants.SCHEMA}.upload
        JOIN ${Constants.SCHEMA}.users ON ${Constants.SCHEMA}.upload.create_by = ${Constants.SCHEMA}.users.id
    ) as t
    `;
    let strWhere = [];
    let arrParams = [];
    const keys = Object.keys(itemList)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'file_name'){
            strWhere.push(`LOWER(file_name) LIKE $${arrParams.length+1}`)
            arrParams.push(`%${itemList[key].toLowerCase()}%`)
        } else if(key === 'upload_date'){
            strWhere.push(`TO_CHAR(date, 'DD-MM-YYYY') = $${arrParams.length+1}`)
            arrParams.push(itemList[key])
        } else if(key === 'time_filter'){
            let timeParam = itemList[key].split(',')
            if(timeParam.length !== 2){
                for (const time of timeParam) {
                    strWhere.push(`time = $${arrParams.length+1}`)
                    arrParams.push(time.toLowerCase())
                }
            }
        } else {
            strWhere.push(`${key}=$${arrParams.length+1} `)
            arrParams.push(itemList[key])
        }
    });
    if (strWhere.length) {
        preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    try {
        const countData = await pool.query(query,arrParams);
        const { rows } = await pool.query(query_limited,arrParams);
        return { rows, total: countData.rows.length };
    } catch (error) {
        throw error
    }
};

const upload = async (itemList,file,user) => {
    let params = {
        product_type:itemList.uploadType,
        upload_date:itemList.dateUpload
    }
    if(itemList.uploadType === 'bulk'){
        params = {
            ...params,
            time_filter:itemList.timeUpload
        }
    }
    try {
        let rows = [];
        const uploadData = await get(params);
        if (uploadData.rows.length>0){
            await update(itemList,file,user,uploadData.rows[0].id)
        } else {
            await add(itemList,file,user)
        }
        return { rows };
    } catch (error) {
        throw error
    }
};

const add = async (itemList,file,user) => {
    let params = {
        file_name:file,
        product_type:itemList.uploadType,
        date:itemList.dateUpload ? moment(itemList.dateUpload,'DD-MM-YYYY').format("YYYYMMDD HH:mm:ss.SSS") : null,
        time:itemList.timeUpload,
        create_at:moment().format("YYYYMMDD HH:mm:ss.SSS"),
        create_by:user.id,
        active_state:true
    }
    let sqlQuery = ``;
    let keyList = [];
    let valueList = [];
    let arrParams = [];
    const keys = Object.keys(params)
    keys.forEach((key,index) => {
        if(params[key] != null && params[key] != ''){
            keyList.push(`${key}`)
            valueList.push(`$${arrParams.length+1}`)
            arrParams.push(params[key])
        }
    });
    if (keyList.length) {
        sqlQuery = `INSERT INTO ${Constants.SCHEMA}.upload (${keyList.join(",")}) VALUES (${valueList.join(",")}) RETURNING *;`;
    }
    try {
        const uploadData = await pool.query(sqlQuery, arrParams);
        let excelData = []
        let table = null
        if(itemList.uploadType === 'bulk'){
            excelData = await bulkData(file,uploadData.rows[0].id)
            table = 'bulk_upload'
        } else if (itemList.uploadType === 'va'){
            excelData = await vaData(file,uploadData.rows[0].id)
            table = 'va_upload'
        }
        for (const data of excelData) {
            if(table!==null){
                let dataQuery = ``;
                let keyListData = [];
                let valueListData = [];
                let arrParamsData = [];
                let paramsData = data
                const keys = Object.keys(paramsData)
                keys.forEach((key,index) => {
                    if(paramsData[key] != null && paramsData[key] != ''){
                        keyListData.push(`${key}`)
                        valueListData.push(`$${arrParamsData.length+1}`)
                        arrParamsData.push(paramsData[key])
                    }
                });
                if (keyListData.length) {
                    dataQuery = `INSERT INTO ${Constants.SCHEMA}.${table} (${keyListData.join(",")}) VALUES (${valueListData.join(",")});`;
                }
                await pool.query(dataQuery, arrParamsData)
            }
        }
        let logList = {
            product_type:itemList.uploadType ? itemList.uploadType.toUpperCase()  : '-',
            file_name:file,
            date_upload:itemList.dateUpload,
            time:itemList.timeUpload ? itemList.timeUpload.toUpperCase()  : '-',
            upload_by:user.name
        }
        const logValue = JSON.stringify({ agent: user.agent, ip: user.ip, ...logList });
        AuditTrailService.addToAudit(new Date(), "Upload Management", "Add", user.name, user.ip, 4, logValue);
        return { rows:uploadData.rows };
    } catch (error) {
        throw error
    }
};

const update = async (itemList,file,user,uploadId) => {
    let params = {
        file_name:file,
        product_type:itemList.uploadType,
        date:itemList.dateUpload ? moment(itemList.dateUpload,'DD-MM-YYYY').format("YYYYMMDD HH:mm:ss.SSS") : null,
        time:itemList.timeUpload,
        create_at:moment().format("YYYYMMDD HH:mm:ss.SSS"),
        create_by:user.id,
        active_state:true
    }
    let sqlQuery = ``;
    let keyList = [];
    let valueList = [];
    let arrParams = [uploadId];
    const keys = Object.keys(params)
    keys.forEach((key,index) => {
        if(params[key] != null && params[key] != ''){
            keyList.push(`${key}=$${arrParams.length+1}`)
            valueList.push(`$${arrParams.length+1}`)
            arrParams.push(params[key])
        }
    });
    if (keyList.length) {
        sqlQuery = `UPDATE ${Constants.SCHEMA}.upload SET ${keyList.join(",")} WHERE id=$1 RETURNING *;`;
    }
    try {
        const uploadData = await pool.query(sqlQuery, arrParams);
        let tableFrom = itemList.uploadType === 'bulk' ? `bulk_upload` : `va_upload`
        let sqlDeleteSurveyMillsQuery = `DELETE FROM ${Constants.SCHEMA}.${tableFrom} WHERE upload_id=$1;`;
        await pool.query(sqlDeleteSurveyMillsQuery, [uploadId])
        let excelData = []
        let table = null
        if(itemList.uploadType === 'bulk'){
            excelData = await bulkData(file,uploadData.rows[0].id)
            table = 'bulk_upload'
        } else if (itemList.uploadType === 'va'){
            excelData = await vaData(file,uploadData.rows[0].id)
            table = 'va_upload'
        }
        for (const data of excelData) {
            if(table!==null){
                let dataQuery = ``;
                let keyListData = [];
                let valueListData = [];
                let arrParamsData = [];
                let paramsData = data
                const keys = Object.keys(paramsData)
                keys.forEach((key,index) => {
                    if(paramsData[key] != null && paramsData[key] != ''){
                        keyListData.push(`${key}`)
                        valueListData.push(`$${arrParamsData.length+1}`)
                        arrParamsData.push(paramsData[key])
                    }
                });
                if (keyListData.length) {
                    dataQuery = `INSERT INTO ${Constants.SCHEMA}.${table} (${keyListData.join(",")}) VALUES (${valueListData.join(",")});`;
                }
                await pool.query(dataQuery, arrParamsData)
            }
        }
        let logList = {
            product_type:itemList.uploadType ? itemList.uploadType.toUpperCase()  : '-',
            file_name:file,
            date_upload:itemList.dateUpload,
            time:itemList.timeUpload ? itemList.timeUpload.toUpperCase()  : '-',
            upload_by:user.name
        }
        const logValue = JSON.stringify({ agent: user.agent, ip: user.ip, ...logList });
        AuditTrailService.addToAudit(new Date(), "Upload Management", "Add", user.name, user.ip, 4, logValue);
        return { rows:uploadData.rows };
    } catch (error) {
        throw error
    }
};

const getBulkData = async (itemList) => {
    let page = itemList.page ? itemList.page : null
    let perPage = itemList.perPage ? itemList.perPage : null
    let orderData = itemList.orderData ? itemList.orderData : null
    let orderDirection= itemList.orderDirection ? itemList.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let preparedQuery = `
    SELECT
    t.*
    FROM(
        select 
        ${Constants.SCHEMA}.bulk_upload.*
        FROM ${Constants.SCHEMA}.bulk_upload
    ) as t
    `;
    let strWhere = [];
    let arrParams = [];
    const keys = Object.keys(itemList)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'product_name'){
            strWhere.push(`LOWER(product_name) LIKE $${arrParams.length+1}`)
            arrParams.push(`%${itemList[key].toLowerCase()}%`)
        } else {
            strWhere.push(`${key}=$${arrParams.length+1} `)
            arrParams.push(itemList[key])
        }
    });
    if (strWhere.length) {
        preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    try {
        const countData = await pool.query(query,arrParams);
        const { rows } = await pool.query(query_limited,arrParams);
        return { rows, total: countData.rows.length };
    } catch (error) {
        throw error
    }
};

const getVaData = async (itemList,id) => {
    let page = itemList.page ? itemList.page : null
    let perPage = itemList.perPage ? itemList.perPage : null
    let orderData = itemList.orderData ? itemList.orderData : null
    let orderDirection= itemList.orderDirection ? itemList.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']
    if(id){
        itemList={
            ...itemList,
            upload_id:id
        }
    }

    let preparedQuery = `
    SELECT
    t.*
    FROM(
        select 
        ${Constants.SCHEMA}.va_upload.*,
        ${Constants.SCHEMA}.upload.date as data_date
        FROM ${Constants.SCHEMA}.va_upload
        JOIN ${Constants.SCHEMA}.upload ON ${Constants.SCHEMA}.va_upload.upload_id = ${Constants.SCHEMA}.upload.id
    ) as t
    `;
    let strWhere = [];
    let arrParams = [];
    const keys = Object.keys(itemList)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'description'){
            strWhere.push(`LOWER(description) LIKE $${arrParams.length+1}`)
            arrParams.push(`%${itemList[key].toLowerCase()}%`)
        } else if(key === 'segment'){
            strWhere.push(`LOWER(segment) LIKE $${arrParams.length+1}`)
            arrParams.push(`%${itemList[key].toLowerCase()}%`)
        } else if(key === 'product_group'){
            strWhere.push(`LOWER(product_group) LIKE $${arrParams.length+1}`)
            arrParams.push(`%${itemList[key].toLowerCase()}%`)
        } else if(key === 'brand'){
            strWhere.push(`LOWER(brand) = $${arrParams.length+1}`)
            arrParams.push(`${itemList[key].toLowerCase()}`)
        } else {
            strWhere.push(`${key}=$${arrParams.length+1} `)
            arrParams.push(itemList[key])
        }
    });
    if (strWhere.length) {
        preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    try {
        const countData = await pool.query(query,arrParams);
        const { rows } = await pool.query(query_limited,arrParams);
        return { rows, total: countData.rows.length };
    } catch (error) {
        throw error
    }
};

const getUploadBulkData = async (itemList,id) => {
    let page = itemList.page ? itemList.page : null
    let perPage = itemList.perPage ? itemList.perPage : null
    let orderData = itemList.orderData ? itemList.orderData : null
    let orderDirection= itemList.orderDirection ? itemList.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']
    if(id){
        itemList={
            ...itemList,
            upload_id:id
        }
    }

    let preparedQuery = `
        SELECT 
        ${Constants.SCHEMA}.bulk_upload.product_name, 
        ${Constants.SCHEMA}.bulk_upload.id
        FROM ${Constants.SCHEMA}.bulk_upload
    `;
    let strWhere = [];
    let arrParams = [];
    const keys = Object.keys(itemList)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'product_name'){
            strWhere.push(`LOWER(product_name) LIKE $${arrParams.length+1}`)
            arrParams.push(`%${itemList[key].toLowerCase()}%`)
        } else {
            strWhere.push(`${key}=$${arrParams.length+1} `)
            arrParams.push(itemList[key])
        }
    });
    if (strWhere.length) {
        preparedQuery = `${preparedQuery} WHERE month is null AND ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} GROUP BY product_name, id ORDER BY id ASC`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    try {
        const countData = await pool.query(query,arrParams);
        const { rows } = await pool.query(query_limited,arrParams);
        for (const row of rows) {
            let rowData = await(await getBulkData({
                upload_id:id,
                product_name:row.product_name
            })).rows
            row.data = rowData.length > 0 ? rowData : []
        }
        return { rows, total: countData.rows.length };
    } catch (error) {
        throw error
    }
};

const drop = async (id,user) => {
    let uploadQuery = `SELECT * FROM ${Constants.SCHEMA}.upload WHERE id = $1;`;
    let sqlQueryUpload = `DELETE FROM ${Constants.SCHEMA}.upload WHERE id = $1;`;
    let sqlQueryBulk = `DELETE FROM ${Constants.SCHEMA}.bulk_upload WHERE upload_id = $1;`;
    let sqlQueryVA = `DELETE FROM ${Constants.SCHEMA}.va_upload WHERE upload_id = $1;`;
    try {
        const uploadData = await pool.query(uploadQuery, [id]);
        const bulkDelete = await pool.query(sqlQueryBulk, [id]);
        const vaDelete = await pool.query(sqlQueryVA, [id]);
        const { rows } = await pool.query(sqlQueryUpload, [id]);
        let logList = {
            product_type:uploadData.rows[0].product_type ? uploadData.rows[0].product_type.toUpperCase() : '-',
            file_name:uploadData.rows[0].file_name,
            date_upload:moment(uploadData.rows[0].date).format('DD-MM-YYYY'),
            time:uploadData.rows[0].time ? uploadData.rows[0].time.toUpperCase() : '-',
            delete_by:user.name
        }
        const logValue = JSON.stringify({ agent: user.agent, ip: user.ip, ...logList });
        AuditTrailService.addToAudit(new Date(), "Upload Management", "Delete", user.name, user.ip, 4, logValue);
        return { rows };
    } catch (error) {
        throw error
    }
};

module.exports = {
    get,
    upload,
    add,
    update,
    getBulkData,
    getVaData,
    getUploadBulkData,
    drop,
};
