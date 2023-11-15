const UserController = require("./UserController");
const AuthController = require("./AuthController");
const UploadController = require("./UploadController");
const UsersController = require("./UsersController");
const RoleController = require("./RoleController");
const ModuleController = require("./ModuleController");
const BulkController = require("./BulkController");
const VAController = require("./VAController");
const BrandController = require("./BrandController");
const AuditTrailController = require("./AuditTrailController");

module.exports = {
  UserController: new UserController(),
  AuthController: new AuthController(),
  UploadController: new UploadController(),
  UsersController: new UsersController(),
  RoleController: new RoleController(),
  ModuleController: new ModuleController(),
  BulkController: new BulkController(),
  VAController: new VAController(),
  BrandController: new BrandController(),
  AuditTrailController: new AuditTrailController(),
};