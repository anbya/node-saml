/**
 * properties module. Store the properties constant of the system.
 */

exports.properties = {
  allowOrigin: ["https://ics-dev.acedigitalplatform.com"],
  date: {
    fullDate: "YYYY-MM-DD",
    stringDate: "DD MMM YYYY",
    stringDateTime: "DD MMM YYYY hh:mm:ss a",
  },
  error: {
    Unauthorized: "Invalid credentials",
    MissingRequiredField: "Missing required field",
    InternalServerError:
      "Unexpected error occurred, please try again later. If the error persists, please contact our support.",
  },
  locale: "en-US",
};
