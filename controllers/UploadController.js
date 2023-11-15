const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { UploadService } = require("../services");
const fs = require('fs')
const path = require('path')

class SubModulesController extends BaseController {
    constructor() {
        super();
    }

    async get(req, res, next) {
        const itemList = req.query;
        try {
        const result = await UploadService.get(itemList);
        const resBody = new ResponseController();
        return this.sendSuccess(res, resBody.setPagination({ page: itemList.page ? itemList.page : 1, perPage: itemList.perPage ? itemList.perPage : 10, total: result.total }).setData(result).build());
        } catch (error) {
        next(error)
        }
    }

    async add(req, res, next) {
        const itemList = req.body;
        const file = req.file ? req.file.filename : null
        const user = req.user[0]
        try {
        const result = await UploadService.upload(itemList,file,user);
        const resBody = new ResponseController();
        const filePath = path.join(__dirname,'..','assets/uploads',req.file.filename)
        fs.unlink(filePath,(err)=>{
            if(err){
                console.log(`Error on deleting upload file.`);
            } else {
                console.log(`File removed.`);
            }
        })
        return this.sendSuccess(res, resBody.setData(result).build());
        } catch (error) {
            next(error)
        }
    }

    async getUploadBulkData(req, res, next) {
        const id = req.params.id;
        const itemList = req.query;
        try {
        const result = await UploadService.getUploadBulkData(itemList,id);
        const resBody = new ResponseController();
        return this.sendSuccess(res, resBody.setPagination({ page: itemList.page ? itemList.page : 1, perPage: itemList.perPage ? itemList.perPage : 10, total: result.total }).setData(result).build());
        } catch (error) {
        next(error)
        }
    }

    async getVaData(req, res, next) {
        const id = req.params.id;
        const itemList = req.query;
        try {
        const result = await UploadService.getVaData(itemList,id);
        const resBody = new ResponseController();
        return this.sendSuccess(res, resBody.setPagination({ page: itemList.page ? itemList.page : 1, perPage: itemList.perPage ? itemList.perPage : 10, total: result.total }).setData(result).build());
        } catch (error) {
        next(error)
        }
    }

    async drop(req, res, next) {
        const id = req.params.id;
        const user = req.user[0]
        try {
        const result = await UploadService.drop(id,user);
        const resBody = new ResponseController();
        return this.sendSuccess(res, resBody.setData(result).build());
        } catch (error) {
        next(error)
        }
    }
}

module.exports = SubModulesController;
