const express = require("express");
const { UploadController } = require("../controllers");
const { submodules, canAccess } = require("../utils/authorization");

const multer = require("../utils/upload");
const awss3 = require("../utils/awss3upload");

const router = express.Router();
router.get("/", canAccess([submodules.view_upload_list]), (req, res, next) => {
    UploadController.get(req, res, next);
});

router.post("/", multer.single('excel_file'), awss3.awsUpload, canAccess([submodules.file_upload]), (req, res, next) => {
    UploadController.add(req, res, next);
});

router.get("/:id/bulk-product", canAccess([submodules.view_bulk_upload]), (req, res, next) => {
    UploadController.getUploadBulkData(req, res, next);
});

router.get("/:id/va-product", canAccess([submodules.view_va_product]), (req, res, next) => {
    UploadController.getVaData(req, res, next);
});

router.delete("/:id", canAccess([submodules.file_upload]), (req, res, next) => {
    UploadController.drop(req, res, next);
});

module.exports = router;
