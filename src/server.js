const express = require('express');
const cors = require('cors');
const ankiPackageService = require('./services/ankiPackageService');

const app = express();
const PORT = 4567;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/extract', async (req, res) => {
    try {
        const { apkgPath, outputDir } = req.body;

        if (!apkgPath || !outputDir) {
            return res.status(400).json({
                error: 'Missing required parameters: apkgPath and outputDir'
            });
        }

        const extractedFiles = await ankiPackageService.extractAudioFiles(apkgPath, outputDir);
        
        res.json({
            success: true,
            extractedFiles
        });
    } catch (error) {
        console.error('Error extracting audio files:', error);
        res.status(500).json({
            error: `Failed to extract audio files: ${error.message}`
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app; 