const express = require("express");
const { submodules, canAccess } = require("../utils/authorization");
const router = express.Router();
const { ModuleController, RoleController, UsersController } = require("../controllers");

// users
router.post("/create-user", canAccess([submodules.manage_user]), (req, res, next) => {
  UsersController.createUser(req, res, next);
});

router.get("/getUserList", canAccess([submodules.view_user]), (req, res, next) => {
  UsersController.getUserList(req, res, next);
});

router.post("/update-user", canAccess([submodules.manage_user]), (req, res, next) => {
  UsersController.updateUser(req, res, next);
});

router.post("/delete-user", canAccess([submodules.manage_user]), (req, res, next) => {
  UsersController.deleteUser(req, res, next);
});

router.post("/check-user", canAccess([submodules.manage_user]), (req, res, next) => {
  UsersController.userExist(req, res, next);
});

// role
router.post("/addNewRole", canAccess([submodules.manage_role]), (req, res, next) => {
  RoleController.addNewRole(req, res, next);
});

router.get("/getRoleList", canAccess([submodules.manage_role]), (req, res, next) => {
  RoleController.getRoleList(req, res, next);
});

router.post("/updateRole", canAccess([submodules.manage_role]), (req, res, next) => {
  RoleController.updateRole(req, res, next);
});

router.post("/deleteRole", canAccess([submodules.manage_role]), (req, res, next) => {
  RoleController.deleteRole(req, res, next);
});

// module
router.post("/addNewModule", canAccess([submodules.manage_role]), (req, res, next) => {
  ModuleController.addNewModule(req, res, next);
});

router.put("/updateModule", canAccess([submodules.manage_role]), (req, res, next) => {
  ModuleController.updateModule(req, res, next);
});

router.get("/getModuleList", canAccess([submodules.manage_role]), (req, res, next) => {
  ModuleController.getModuleList(req, res, next);
});

module.exports = router;
