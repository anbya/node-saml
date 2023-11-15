const express = require("express");
const { BulkController } = require("../controllers");

const multer = require("../utils/upload");
const { canAccess, submodules } = require("../utils/authorization");

const router = express.Router();

router.get("/", canAccess([submodules.view_bulk_upload]), (req, res, next) => {
    BulkController.get(req, res, next);
});

module.exports = router;
