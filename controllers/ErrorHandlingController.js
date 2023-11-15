const ResponseController = require("./ResponseController");
const BaseController = require("./BaseController");

class ErrorHandlingController extends BaseController {
  constructor() {
    super();
  }

  send(res, error) {
    const resBody = new ResponseController();
    return this.sendInternalServerError(
      res,
      resBody.setStatus(500).setSuccess(false).setPagination(null).setMessage('Something error in the app').build()
    );
  }
}

module.exports = ErrorHandlingController;
