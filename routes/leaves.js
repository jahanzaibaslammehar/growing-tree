import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side storage for leaves
const LEAVES_FILE = path.join(__dirname, '..', 'data', 'leaves-data.json');

// In-memory storage for Vercel (serverless functions)
let inMemoryLeaves = [];

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1';

// Ensure data directory exists (only for local development)
if (!isVercel) {
  const dataDir = path.dirname(LEAVES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Function to read leaves
function readLeaves() {
  if (isVercel) {
    // Use in-memory storage on Vercel
    return inMemoryLeaves;
  } else {
    // Use file storage for local development
    try {
      if (fs.existsSync(LEAVES_FILE)) {
        const data = fs.readFileSync(LEAVES_FILE, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error reading leaves file:', error);
      return [];
    }
  }
}

// Function to save leaves
function saveLeaves(leaves) {
  if (isVercel) {
    // Use in-memory storage on Vercel
    inMemoryLeaves = [...leaves];
    console.log(`✅ Saved ${leaves.length} leaves to memory (Vercel)`);
    return true;
  } else {
    // Use file storage for local development
    try {
      fs.writeFileSync(LEAVES_FILE, JSON.stringify(leaves, null, 2));
      console.log(`✅ Saved ${leaves.length} leaves to file (local)`);
      return true;
    } catch (error) {
      console.error('Error saving leaves file:', error);
      return false;
    }
  }
}

// GET /api/leaves - Get all grown leaves
router.get('/', (req, res) => {
  try {
    const leaves = readLeaves();
    res.json({ 
      success: true, 
      leaves,
      count: leaves.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting leaves:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get leaves',
      message: 'An error occurred while retrieving leaves data'
    });
  }
});

// POST /api/leaves - Add a new leaf
router.post('/', (req, res) => {
  try {
    const { index, position, source } = req.body;
    
    // Validation
    if (typeof index !== 'number' || index < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid leaf index',
        message: 'Leaf index must be a non-negative number'
      });
    }

    const leaves = readLeaves();
    
    // Check if leaf already exists
    const existingLeaf = leaves.find(leaf => leaf.index === index);
    if (existingLeaf) {
      return res.json({ 
        success: true, 
        message: 'Leaf already exists', 
        leaf: existingLeaf,
        totalLeaves: leaves.length
      });
    }

    // Create new leaf data
    const newLeaf = {
      index,
      timestamp: new Date().toISOString(),
      source: source || 'manual',
      position: position || {
        left: `${20 + (index * 2)}%`,
        top: `${30 + (index * 1.5)}%`,
        rotation: `${index * 45}deg`
      }
    };

    leaves.push(newLeaf);
    
    if (saveLeaves(leaves)) {
      console.log(`✅ New leaf added: index ${index} from ${newLeaf.source}`);
      res.status(201).json({ 
        success: true, 
        leaf: newLeaf, 
        totalLeaves: leaves.length,
        message: 'Leaf added successfully'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save leaf',
        message: 'An error occurred while saving the leaf data'
      });
    }
  } catch (error) {
    console.error('Error adding leaf:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add leaf',
      message: 'An unexpected error occurred'
    });
  }
});

// DELETE /api/leaves - Clear all leaves
router.delete('/', (req, res) => {
  try {
    if (saveLeaves([])) {
      console.log('✅ All leaves cleared');
      res.json({ 
        success: true, 
        message: 'All leaves cleared successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to clear leaves',
        message: 'An error occurred while clearing leaves data'
      });
    }
  } catch (error) {
    console.error('Error clearing leaves:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear leaves',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/leaves/stats - Get leaves statistics
router.get('/stats', (req, res) => {
  try {
    const leaves = readLeaves();
    const stats = {
      totalLeaves: leaves.length,
      sources: {},
      recentLeaves: leaves
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5),
      oldestLeaf: leaves.length > 0 
        ? leaves.reduce((oldest, leaf) => 
            new Date(leaf.timestamp) < new Date(oldest.timestamp) ? leaf : oldest
          )
        : null,
      newestLeaf: leaves.length > 0 
        ? leaves.reduce((newest, leaf) => 
            new Date(leaf.timestamp) > new Date(newest.timestamp) ? leaf : newest
          )
        : null
    };

    // Count leaves by source
    leaves.forEach(leaf => {
      stats.sources[leaf.source] = (stats.sources[leaf.source] || 0) + 1;
    });

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting leaves stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaves statistics',
      message: 'An error occurred while retrieving statistics'
    });
  }
});

export default router;
