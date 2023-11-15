const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { RoleService } = require("../services");

class RoleController extends BaseController {
  constructor() {
    super();
  }

  async getRoleList(req, res, next) {
    const itemList = req.query;
    try {
      const result = await RoleService.getRoleList(itemList);
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

  async addNewRole(req, res, next) {
    const itemList = req.body;
    const user = req.user[0];
    try {
      const result = await RoleService.addNewRole(itemList, user);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    const itemList = req.body;
    const user = req.user[0];
    try {
      const result = await RoleService.updateRole(itemList, user);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    const itemList = req.body;
    const user = req.user[0];
    try {
      const result = await RoleService.deleteRole(itemList, user);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoleController;
