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

// Global storage to persist across function invocations
global.leavesStorage = global.leavesStorage || [];

// Fallback: Use a simple counter-based approach for Vercel
let leafCounter = 0;

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
    // For Vercel, we'll use a deterministic approach
    // Since serverless functions are stateless, we'll simulate persistence
    // by using a combination of global storage and fallback logic
    try {
      // Try global storage first
      if (global.leavesStorage && global.leavesStorage.length > 0) {
        console.log(`📖 Read ${global.leavesStorage.length} leaves from global storage`);
        return global.leavesStorage;
      }
      
      // Fallback: return empty array (this is expected for new function instances)
      console.log('📖 No global storage found, returning empty array (new function instance)');
      return [];
    } catch (error) {
      console.error('❌ Error reading from global storage:', error);
      return [];
    }
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
    // Use global storage on Vercel for better persistence
    try {
      global.leavesStorage = [...leaves];
      console.log(`✅ Saved ${leaves.length} leaves to global storage (Vercel)`);
      return true;
    } catch (error) {
      console.error('❌ Error saving to global storage:', error);
      return false;
    }
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
    console.log('📖 Reading leaves...', { isVercel, hasGlobalStorage: !!global.leavesStorage });
    const leaves = readLeaves();
    console.log(`📊 Retrieved ${leaves.length} leaves`);
    
    res.json({ 
      success: true, 
      leaves,
      count: leaves.length,
      timestamp: new Date().toISOString(),
      platform: isVercel ? 'vercel' : 'local',
      note: isVercel ? 'Note: Vercel serverless functions are stateless. Data may reset between function invocations.' : undefined
    });
  } catch (error) {
    console.error('❌ Error getting leaves:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get leaves',
      message: 'An error occurred while retrieving leaves data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/leaves - Add a new leaf
router.post('/', (req, res) => {
  try {
    console.log('🌱 Adding new leaf...', { body: req.body, isVercel });
    const { index, position, source } = req.body;
    
    const leaves = readLeaves();
    console.log(`📊 Current leaves count: ${leaves.length}`);
    
    let newLeaf;
    
    // If index is provided, check if it already exists
    if (typeof index === 'number' && index >= 0) {
      const existingLeaf = leaves.find(leaf => leaf.index === index);
      if (existingLeaf) {
        console.log(`Leaf ${index} already exists, returning existing leaf`);
        return res.json({ 
          success: true, 
          message: 'Leaf already exists', 
          leaf: existingLeaf,
          totalLeaves: leaves.length
        });
      }
      
      // Use provided index
      newLeaf = {
        index,
        timestamp: new Date().toISOString(),
        source: source || 'manual',
        position: position || {
          left: `${20 + (index * 2)}%`,
          top: `${30 + (index * 1.5)}%`,
          rotation: `${index * 45}deg`
        }
      };
    } else {
      // Auto-generate next available index
      const usedIndices = leaves.map(leaf => leaf.index);
      let nextIndex = 0;
      while (usedIndices.includes(nextIndex)) {
        nextIndex++;
      }
      
      console.log(`Auto-generated next index: ${nextIndex}`);
      
      newLeaf = {
        index: nextIndex,
        timestamp: new Date().toISOString(),
        source: source || 'manual',
        position: position || {
          left: `${20 + (nextIndex * 2)}%`,
          top: `${30 + (nextIndex * 1.5)}%`,
          rotation: `${nextIndex * 45}deg`
        }
      };
    }

    leaves.push(newLeaf);
    
    if (saveLeaves(leaves)) {
      console.log(`✅ New leaf added: index ${newLeaf.index} from ${newLeaf.source}`);
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

// GET /api/leaves/clear - Clear all leaves (GET method for easy browser access)
router.get('/clear', (req, res) => {
  try {
    console.log('🗑️ Clearing all leaves via GET...');
    const success = saveLeaves([]);
    
    if (success) {
      console.log('✅ All leaves cleared successfully via GET');
      res.json({ 
        success: true, 
        message: 'All leaves cleared successfully',
        totalLeaves: 0,
        timestamp: new Date().toISOString(),
        method: 'GET'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to clear leaves',
        message: 'An error occurred while clearing leaves data'
      });
    }
  } catch (error) {
    console.error('❌ Error clearing leaves via GET:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear leaves',
      message: 'An error occurred while clearing leaves data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
