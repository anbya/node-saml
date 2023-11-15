const pool = require("../utils/db");
const XLSX = require('xlsx');
const moment = require('moment')

const bulkData = async (file,uploadId) => {
  try {
    const workbook = XLSX.readFile(`assets/uploads/${file}`);
    const worksheet = workbook.Sheets['Bulk Dashboard'];
    let startList = []
    let productList = []
    let excelDateRaw = worksheet[`D2`] ? worksheet[`D2`].v : null
    let excelDate = new Date((excelDateRaw - 25569) * 86400 * 1000)
    let priceDate = moment(excelDate).format("YYYY-MM-DD HH:mm:ss.SSS")
    let currencyRate = worksheet[`D4`] === undefined ? '' : parseFloat(worksheet[`D4`].v)
    for (let i = 1; i < 80; i++) {
        if(worksheet[`B${i}`] !== undefined && worksheet[`B${i}`].v.toLowerCase() == 'product'){
            startList.push(i)
        }
    }
    for (let i = 0; i < startList.length; i++) {
        let startData = startList[i]+2
        for (let j = 0; j < 1000; j++) {
            if(worksheet[`B${startData+j}`] === undefined){
                j = 1000
            } else {
                productList.push({
                    upload_id:uploadId,
                    price_date:priceDate,
                    currency_rate:currencyRate,
                    product_name:worksheet[`B${startData+j}`] ? worksheet[`B${startData+j}`].v : null,
                    month:i,
                    fob_msia:worksheet[`D${startData+j}`] ? worksheet[`D${startData+j}`].v : null,
                    discount:worksheet[`E${startData+j}`] ? worksheet[`E${startData+j}`].v : null,
                    fob_indo:worksheet[`F${startData+j}`] ? worksheet[`F${startData+j}`].v : null,
                    levy:worksheet[`G${startData+j}`] ? worksheet[`G${startData+j}`].v : null,
                    duty:worksheet[`H${startData+j}`] ? worksheet[`H${startData+j}`].v : null,
                    local:worksheet[`I${startData+j}`] ? worksheet[`I${startData+j}`].v : null,
                    local_excl:worksheet[`J${startData+j}`] ? worksheet[`J${startData+j}`].v : null,
                    local_incl:worksheet[`K${startData+j}`] ? worksheet[`K${startData+j}`].v : null,
                    active_state:true
                })
            }
        }
    }
    return productList
  } catch (error) {
    throw Error(error);
  }
};

const vaData = async (file,uploadId) => {
    try {
    const workbook = XLSX.readFile(`assets/uploads/${file}`);
    const worksheet = workbook.Sheets['VA Dashboard'];
    let productList = []
    let excelDateRaw = worksheet[`C2`] ? worksheet[`C2`].v : null
    let excelDate = new Date((excelDateRaw - 25569) * 86400 * 1000)
    let priceDate = moment(excelDate).format("YYYY-MM-DD HH:mm:ss.SSS")
    let currencyRate = worksheet[`C4`] ? parseFloat(worksheet[`C4`].v) : null
    let week = worksheet[`E2`] ? parseFloat(worksheet[`E2`].v) : null
    let startData = 9
    for (let i = 0; i < 9999999; i++) {
        if(worksheet[`B${startData+i}`] === undefined){
                i = 9999999
        } else {
            productList.push({
                upload_id:uploadId,
                price_date:priceDate,
                currency_rate:currencyRate,
                week:week,
                material_id:worksheet[`B${startData+i}`] ? worksheet[`B${startData+i}`].v : null,
                description:worksheet[`C${startData+i}`] ? worksheet[`C${startData+i}`].v : null,
                brand:worksheet[`D${startData+i}`] ? worksheet[`D${startData+i}`].v : null,
                product_group:worksheet[`E${startData+i}`] ? worksheet[`E${startData+i}`].v : null,
                segment:worksheet[`F${startData+i}`] ? worksheet[`F${startData+i}`].v : null,
                conv_cost:worksheet[`G${startData+i}`] ? worksheet[`G${startData+i}`].v : null,
                oil_prdt:worksheet[`H${startData+i}`] ? worksheet[`H${startData+i}`].v : null,
                blend:worksheet[`I${startData+i}`] ? worksheet[`I${startData+i}`].v : null,
                oil_cost_0:worksheet[`K${startData+i}`] ? worksheet[`K${startData+i}`].v : null,
                oil_price_0:worksheet[`L${startData+i}`] ? worksheet[`L${startData+i}`].v : null,
                oil_cost_1:worksheet[`N${startData+i}`] ? worksheet[`N${startData+i}`].v : null,
                oil_price_1:worksheet[`O${startData+i}`] ? worksheet[`O${startData+i}`].v : null,
                oil_cost_2:worksheet[`Q${startData+i}`] ? worksheet[`Q${startData+i}`].v : null,
                oil_price_2:worksheet[`R${startData+i}`] ? worksheet[`R${startData+i}`].v : null,
                active_state:true
            })
        }
    }
    return productList
    } catch (error) {
      throw Error(error);
    }
};

module.exports = {
    bulkData,
    vaData,
};
