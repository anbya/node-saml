module.exports = {
  SCHEMA: "mpu",
  // SCHEMA: "ics", // on prod need to change to this
  ACTION_EDIT: "Edit",
  ACTION_CREATE: "Create",
  ACTION_DELETE: "Delete",
  ACTION_FORECAST: "Forecast",
  MAIL_TRANSPORTER: {
    host: `${process.env.SMTP_RELAY}`,
    port: 25,
    secure: false,
    ignoreTLS: true
  }
};
