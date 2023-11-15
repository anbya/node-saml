const { format, createLogger, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
require("winston-daily-rotate-file");

// Label
const types = ['info', 'error'];
const CATEGORY = "SERVER";

// Logs
const customFormat = printf(({ timestamp, label, level, message }) => {
    return `| ${timestamp} | ${label} | ${level}: ${message}`
})

const fileTransport = types.reduce((memo, type) => {
    memo[type] = createLogger({
        level: `${type}`,
        format: combine(
            label({ label: CATEGORY }),
            timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            customFormat
        ),
        transports: [
            new transports.DailyRotateFile({
                filename: `logs/${type}-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                maxFiles: "30d"
            }),
            new transports.Console(),
        ],
    });
    return memo;
}, {})

const apiLogger = (level, message) => {
    fileTransport[level].log(level, message)
}

module.exports = apiLogger;