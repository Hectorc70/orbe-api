import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const dailyRotateTransport = new DailyRotateFile({
  filename: `${logDir}/app-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // .gz para ahorrar espacio
  maxSize: '10m',       // máximo 10MB por archivo
  maxFiles: '14d',      // guarda logs de los últimos 14 días
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    dailyRotateTransport,
    new winston.transports.Console() // solo si estás en desarrollo
  ],
});

export default logger;
