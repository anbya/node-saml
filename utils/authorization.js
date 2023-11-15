const pool = require("./db");
const Constants = require("./constant");
const ErrorHandlingController = require("../controllers/ErrorHandlingController");
const { userExist } = require("../services/UsersService");

const getUserPermissions = async (userId, roleId) => {
    let preparedQuery = `
      SELECT 
      ${Constants.SCHEMA}.user_roles.*
      FROM ${Constants.SCHEMA}.user_roles
      WHERE ${Constants.SCHEMA}.user_roles.user_id = $1 AND ${Constants.SCHEMA}.user_roles.role_id = $2
    `;
    try {
        const { rows } = await pool.query(preparedQuery,[userId, roleId]);
        return rows
    } catch (error) {
        return { error };
    }
}

exports.permissions = async (req, res, next) => {
  try {
    const permissions = await getUserPermissions(req.user[0].id,1)
    if (permissions.length > 0) {
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    const intError = new ErrorHandlingController();
    intError.send(res, error.message);
  }
};

exports.canAccess = moduleMustHave => {
  try {
    return async (req, res, next) => {
      let _moduleMustHave = null;
      // console.info('DUMP user => ',req.user);

      if (moduleMustHave && req.user) {
        if (Array.isArray(moduleMustHave)) {
          if (moduleMustHave.length > 0) {
            _moduleMustHave = moduleMustHave;
          } else {
            return res.sendStatus(401);
          }
        } else {
          _moduleMustHave = [moduleMustHave];
        }
      } else {
        return res.sendStatus(401);
      }

      try {
        const findUser = await userExist({ email: req.user?.[0]?.email });
        
        const modules = findUser?.modules ?? [];

        if (modules?.length) {
          const result = modules.some(r => {
            return _moduleMustHave.includes(r.permission);
          });

          if (result) {
            return next();
          }
        }
      } catch (e){
      }
      return res.sendStatus(401);
    };
  } catch (error) {
    const intError = new ErrorHandlingController();
    intError.send(res, error.message);
  }
};

exports.submodules = {
  manage_role: "manage-role",
  file_upload: "file-upload",
  view_upload_list: "view-upload-list",
  access_mobile_application: "access-mobile-application",
  view_bulk_upload: "view-bulk-upload",
  view_va_product: "view-va-product",
  segment_b2b: "segment-b2b",
  segment_b2c: "segment-b2c",
  va_oil_blend_info: "va-oil-blend-info",
  bulk_price: "bulk-price",
  manage_user: "manage-user",
  view_user: "view-user",
};