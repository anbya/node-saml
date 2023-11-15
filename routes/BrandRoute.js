const express = require("express");
const { BrandController } = require("../controllers");

const router = express.Router();

router.get("/", (req, res, next) => {
    BrandController.get(req, res, next);
});

module.exports = router;
