const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { AuditTrailService } = require("../services");
const { Constants } = require("../utils");

class AuditTrailController extends BaseController {
  constructor() {
    super();
  }

  async getListModule(req, res, next) {
    try {
      const { rows } = await AuditTrailService.getListModule();
      res.status(200).json(rows);
    } catch (error) {
      next(error)
    }
  }

  async getAuditByFilter(req, res, next) {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const module = req.body.module;
    const username = req.body.username;
    const page = req.body.page;
    const countPerPage = req.body.countPerPage;

    try {
      const result = await AuditTrailService.filterAuditTrail({
        startDate,
        endDate,
        module,
        username,
        page,
        countPerPage,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  async getListUsername(req, res, next) {
    try {
      const { rows } = await AuditTrailService.getListUsername();
      res.status(200).json(rows);
    } catch (error) {
      next(error)
    }
  }

  async getAllDataAudit(req, res, next) {
    try {
      const month = req.params.month;
      const rows = await AuditTrailService.allDataAudit(month);
      res.status(200).json(rows);
    } catch (error) {
      next(error)
    }
  }

  async updateAddAudit(req, res, next) {
    //console.log("audittttt")
    const username = req.params.username;
    const pagename = req.params.pagename;
    const remarks = req.params.remarks;
    const action = req.params.action;
    const remoteAddress = req.connection.remoteAddress;
    try {
      const results = await AuditTrailService.updateAudit(username, pagename, remarks, action, remoteAddress);
      res.status(200).json(results);
    } catch (error) {
      next(error)
    }
  }
  
  async getAuditTrailData(req, res, next) {
    const itemList = req.query;
    try {
      const rows = await AuditTrailService.getAuditTrailData(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData({
        moduleData:rows.moduleData,
        tableData:rows.rows
      }).setPagination({ page: itemList.page ? itemList.page : 1, perPage: itemList.perPage ? itemList.perPage : 10, total: rows.total }).build());
    } catch (error) {
      next(error)
    }
  }
}

module.exports = AuditTrailController;
