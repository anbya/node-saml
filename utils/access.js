exports.details = async (req, res, next) => {
  const ip = (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
  req.socket.remoteAddress;
  const agent = req.headers["user-agent"];
  req.ip = ip;
  req.agent = agent;
  next();
};
