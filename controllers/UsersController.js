const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { UsersService } = require("../services");

class UsersController extends BaseController {
  constructor() {
    super();
  }

  async getUserList(req, res, next) {
    const itemList = req.query;
    try {
      const result = await UsersService.getUserList(itemList);
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

  async createUser(req, res, next) {
    const itemList = req.body;
    const user = req.user[0];
    try {
      const result = await UsersService.createUser(itemList, user);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    const itemList = req.body;
    const user = req.user[0];
    try {
      const result = await UsersService.updateUser(itemList, user);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    const itemList = req.body;
    const user = req.user[0];
    try {
      const result = await UsersService.deleteUser(itemList, user);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }

  async userExist(req, res, next) {
    const itemList = req.body;
    try {
      const result = await UsersService.userExist(itemList);
      const resBody = new ResponseController();
      return this.sendSuccess(res, resBody.setData(result).build());
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
