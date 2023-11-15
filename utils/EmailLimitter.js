const rateLimit = require("express-rate-limit")

exports.limit = rateLimit({
 windowMs: 5 * 60 * 1000,
 max: 1,
 message: "Already send an TAC code to this email within 5 minute.",
 keyGenerator: (req) => {
    return req.body.email
 }
});