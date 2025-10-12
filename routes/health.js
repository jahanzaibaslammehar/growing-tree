import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
  try {
    const LEAVES_FILE = path.join(__dirname, '..', 'data', 'leaves-data.json');
    let totalLeaves = 0;
    let dataFile = 'missing';
    
    // Check if we're running on Vercel
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // For Vercel, we can't check file system, so just return basic info
      dataFile = 'vercel-memory';
    } else {
      // Try to read leaves count for local development
      try {
        if (fs.existsSync(LEAVES_FILE)) {
          const data = fs.readFileSync(LEAVES_FILE, 'utf8');
          const leaves = JSON.parse(data);
          totalLeaves = leaves.length;
          dataFile = 'exists';
        }
      } catch (error) {
        console.warn('Could not read leaves file for health check:', error.message);
      }
    }

    const healthData = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      platform: isVercel ? 'vercel' : 'local',
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      leaves: {
        total: totalLeaves,
        dataFile: dataFile
      }
    };

    res.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// GET /api/health/ready - Readiness check
router.get('/ready', (req, res) => {
  try {
    const LEAVES_FILE = path.join(__dirname, '..', 'data', 'leaves-data.json');
    const dataDir = path.dirname(LEAVES_FILE);
    
    // Check if data directory is writable
    const isWritable = fs.existsSync(dataDir) && fs.accessSync(dataDir, fs.constants.W_OK);
    
    if (isWritable) {
      res.json({
        status: "READY",
        timestamp: new Date().toISOString(),
        message: "Application is ready to serve requests"
      });
    } else {
      res.status(503).json({
        status: "NOT_READY",
        timestamp: new Date().toISOString(),
        message: "Data directory is not writable"
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "NOT_READY",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// GET /api/health/live - Liveness check
router.get('/live', (req, res) => {
  res.json({
    status: "ALIVE",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
