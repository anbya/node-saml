class BaseController {
  constructor(service) {
    this.service = service;
  }

  sendSuccess(res, body = {}) {
    res.status(200).json(body);
  }

  sendBadRequest(res, body = {}) {
    res.status(400).json(body);
  }

  sendNotFound(res, body = {}) {
    res.status(400).json(body);
  }

  sendInvalidPayload(res, body = {}) {
    res.status(422).json(body);
  }

  sendResourceAlreadyExists(res, body = {}) {
    res.status(409).json(body);
  }

  sendInternalServerError(res, body = {}) {
    res.status(500).json(body);
  }
}

module.exports = BaseController;
