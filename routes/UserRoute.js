const express = require("express");
const { UserController } = require("../controllers");
const { submodules, canAccess } = require("../utils/authorization");

const router = express.Router();

router.get("/", canAccess([submodules.view_user]), (req, res, next) => {
    UserController.get(req, res, next);
});

module.exports = router;
