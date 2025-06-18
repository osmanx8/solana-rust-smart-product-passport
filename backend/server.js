const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
app.post('/api/nft/create', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate a mock NFT address (in a real implementation, this would be a Solana NFT mint address)
    const mockNftAddress = 'mock' + Math.random().toString(36).substring(2, 15);
    
    // Return the NFT address and file information
    res.json({
      nftAddress: mockNftAddress,
      imageUrl: `/uploads/${req.file.filename}`,
      message: 'NFT created successfully'
    });
  } catch (error) {
    console.error('Error creating NFT:', error);
    res.status(500).json({ error: 'Failed to create NFT' });
  }
});

app.get('/api/nft/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // In a real implementation, this would fetch NFT data from the Solana blockchain
    // For now, return mock data
    res.json({
      address,
      serialNumber: 'MOCK-' + Math.random().toString(36).substring(2, 8),
      productionDate: new Date().toISOString().split('T')[0],
      deviceModel: 'Mock Device Model',
      warrantyPeriod: '12 months',
      countryOfOrigin: 'Mock Country',
      manufacturerId: 'mock-manufacturer-id',
      imageUrl: '/mock-image.jpg'
    });
  } catch (error) {
    console.error('Error fetching NFT:', error);
    res.status(500).json({ error: 'Failed to fetch NFT data' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 