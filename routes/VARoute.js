const express = require("express");
const { VAController } = require("../controllers");

const multer = require("../utils/upload");
const { canAccess, submodules } = require("../utils/authorization");

const router = express.Router();

router.get("/", canAccess([submodules.view_va_product]), (req, res, next) => {
    VAController.get(req, res, next);
});

module.exports = router;
