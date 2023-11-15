const express = require("express");
const { AuditTrailController } = require("../controllers");
const { submodules, canAccess } = require("../utils/authorization");

const router = express.Router();

router.get("/", canAccess([submodules.manage_user]), (req, res, next) => {
  AuditTrailController.getAuditTrailData(req, res, next);
});

module.exports = router;
