const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { ModuleService } = require("../services");

class ModuleController extends BaseController {
  constructor() {
    super();
  }

  async getModuleList(req, res, next) {
    const itemList = req.query;
    try {
      const result = await ModuleService.getModuleList(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(
        res,
        resBody
          .setPagination({
            page: itemList.page ? itemList.page : 1,
            perPage: itemList.perPage ? itemList.perPage : 10,
            total: result.total,
          })
          .setData(result)
          .build()
      );
    } catch (error) {
      next(error);
    }
  }

  async addNewModule(req, res, next) {
    const itemList = req.body;
    try {
      const result = await ModuleService.addNewModule(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }

  async updateModule(req, res, next) {
    const itemList = req.body;
    try {
      const result = await ModuleService.updateModule(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ModuleController;
