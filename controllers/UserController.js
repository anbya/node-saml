const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { UserService } = require("../services");

class SubModulesController extends BaseController {
  constructor() {
    super();
  }

  async get(req, res, next) {
    const itemList = req.query;
    try {
      const result = await UserService.get(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setPagination({ page: itemList.page ? itemList.page : 1, perPage: itemList.perPage ? itemList.perPage : 10, total: result.total }).setData(result).build());
    } catch (error) {
      next(error)
    }
  }
}

module.exports = SubModulesController;
