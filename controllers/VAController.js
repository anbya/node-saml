const BaseController = require("./BaseController");
const ResponseController = require("./ResponseController");
const ErrorHandlingController = require("./ErrorHandlingController");
const { VAService } = require("../services");

class SubModulesController extends BaseController {
    constructor() {
        super();
    }

    async get(req, res, next) {
        let itemList = req.query;
        try {
        const result = await VAService.get(itemList);
        const resBody = new ResponseController();
        return this.sendSuccess(res, resBody.setData({
            item:result.rows,
            currency_rate:result.currency_rate
          }).build());
        } catch (error) {
        next(error)
        }
    }
}

module.exports = SubModulesController;
