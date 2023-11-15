const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { BrandService } = require("../services");

class SubModulesController extends BaseController {
    constructor() {
        super();
    }

    async get(req, res, next) {
        let itemList = req.query;
        try {
        const result = await BrandService.get(itemList);
        const resBody = new ResponseController();
        return this.sendSuccess(res, resBody.setData(result).build());
        } catch (error) {
        next(error)
        }
    }
}

module.exports = SubModulesController;
