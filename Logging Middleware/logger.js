import https from 'https';
import winston from 'winston';
import morgan from 'morgan';

// Configuration for the external logging API
const LOGGING_CONFIG = {
  apiUrl: 'http://20.244.56.144/evaluation-service/logs',
  authUrl: 'http://20.244.56.144/evaluation-service/auth',
  credentials: {
    email: '22l31a05l9@vignaniit.edu.in',
    name: 'thandra jaideep',
    rollNo: '22l31a05l9',
    accessCode: 'YzuJeU',
    clientID: '7baf1af9-9bbe-411c-bc09-bf17ae331e1b',
    clientSecret: 'ppHytJcpWdAftQYs'
  }
};

let authToken = null;
let tokenExpiry = null;

// Function to get authentication token
async function getAuthToken() {
  // Use the provided token and expiry time
  if (!authToken) {
    authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMmwzMWEwNWw5QHZpZ25hbmlpdC5lZHUuaW4iLCJleHAiOjE3NTY5NjI5MDUsImlhdCI6MTc1Njk2MjAwNSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6Ijc2MzFiYjY4LWI1MjYtNGQ1ZS04NzM4LTY4OWI4NGQwYjdmOCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InRoYW5kcmEgamFpZGVlcCIsInN1YiI6IjdiYWYxYWY5LTliYmUtNDExYy1iYzA5LWJmMTdhZTMzMWUxYiJ9LCJlbWFpbCI6IjIybDMxYTA1bDlAdmlnbmFuaWl0LmVkdS5pbiIsIm5hbWUiOiJ0aGFuZHJhIGphaWRlZXAiLCJyb2xsTm8iOiIyMmwzMWEwNWw5IiwiYWNjZXNzQ29kZSI6Ill6dUplVSIsImNsaWVudElEIjoiN2JhZjFhZjktOWJiZS00MTFjLWJjMDktYmYxN2FlMzMxZTFiIiwiY2xpZW50U2VjcmV0IjoicHBIeXRKY3BXZEFmdFFZcyJ9.EF-ME8U9IgkxEc-ztI1LFqeBzO82cWdKW1Y8GekYfkg';
    tokenExpiry = new Date(1756962905 * 1000); // Convert Unix timestamp to Date
  }

  if (tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  // If token has expired, we should request a new one
  try {
    const response = await fetch(LOGGING_CONFIG.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(LOGGING_CONFIG.credentials)
    });

    if (response.ok) {
      const data = await response.json();
      authToken = data.access_token;
      tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      console.log('Authentication token obtained successfully');
      return authToken;
    } else {
      console.error('Failed to get auth token:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    return null;
  }
}

// Main Log function - reusable across the application
async function Log(stack, level, packageName, message) {
  try {
    // Validate inputs
    const validStacks = ['backend', 'frontend'];
    const validLevels = ['info', 'error', 'fatal'];
    const validBackendPackages = ['cache', 'controller', 'cron_job', 'domain', 'handler', 'repository', 'service'];
    const validFrontendPackages = ['api'];

    if (!validStacks.includes(stack)) {
      console.error('Invalid stack. Must be "backend" or "frontend"');
      return;
    }

    if (!validLevels.includes(level)) {
      console.error('Invalid level. Must be "info", "error", or "fatal"');
      return;
    }

    const validPackages = stack === 'backend' ? validBackendPackages : validFrontendPackages;
    if (!validPackages.includes(packageName)) {
      console.error(`Invalid package "${packageName}" for stack "${stack}"`);
      return;
    }

    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      console.error('Unable to authenticate with logging service');
      return;
    }

    // Prepare log data
    const logData = {
      stack: stack,
      level: level,
      package: packageName,
      message: message
    };

    // Send log to external API
    const response = await fetch(LOGGING_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(logData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Log sent successfully:', result.logId);
    } else {
      console.error('Failed to send log:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('Error in Log function:', error.message);
  }
}

// Create Winston logger instance for local logging as backup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'url-shortener' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Morgan middleware for HTTP request logging
const httpLogger = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
      // Also send to external API
      Log('backend', 'info', 'handler', `HTTP Request: ${message.trim()}`);
    }
  }
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const logMessage = `${req.method} ${req.url} from ${req.ip}`;
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Send to external API
  Log('backend', 'info', 'handler', logMessage);
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorMessage = `Error in ${req.method} ${req.url}: ${err.message}`;
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Send to external API
  Log('backend', 'error', 'handler', errorMessage);
  next(err);
};

export {
  Log,
  logger,
  httpLogger,
  requestLogger,
  errorLogger
};