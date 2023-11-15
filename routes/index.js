const authentication = require("../utils/authentication");
const authorization = require("../utils/authorization");
const Access = require("../utils/access");
// NEW ROUTE //
const UserRoute = require("./UserRoute");
const AuthRoute = require("./AuthRoute");
const UploadRoute = require("./UploadRoute");
const UserManagementRoute = require("./UserManagementRoute");
const BulkRoute = require("./BulkRoute");
const VARoute = require("./VARoute");
const BrandRoute = require("./BrandRoute");
const AuditTrailRoute = require("./AuditTrailRoute");

module.exports = function (app) {
  app.use("/auth", Access.details, AuthRoute);
  app.use("/users", Access.details, authentication.authenticateToken, authorization.permissions, UserRoute);
  app.use("/upload", Access.details, authentication.authenticateToken, authentication.authenticateIsprintToken, UploadRoute);
  app.use("/access-management", Access.details, authentication.authenticateToken, authentication.authenticateIsprintToken, UserManagementRoute);
  app.use("/bulk", Access.details, authentication.authenticateToken, authentication.authenticateIsprintToken, BulkRoute);
  app.use("/va", Access.details, authentication.authenticateToken, authentication.authenticateIsprintToken, VARoute);
  app.use("/brand", Access.details, authentication.authenticateToken, authentication.authenticateIsprintToken, BrandRoute);
  app.use("/audit-trail", Access.details, authentication.authenticateToken, authentication.authenticateIsprintToken, AuditTrailRoute);
};
