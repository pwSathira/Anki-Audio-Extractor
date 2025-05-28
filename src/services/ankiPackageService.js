const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { promisify } = require('util');

class AnkiPackageService {
    constructor() {
        this.AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|m4a)$/i;
    }

    async extractAudioFiles(apkgPath, outputDir) {
        console.log(`Starting extraction from ${apkgPath} to ${outputDir}`);
        const extractedFiles = [];

        try {
            // Create output directory if it doesn't exist
            await promisify(fs.mkdir)(outputDir, { recursive: true });

            // Read the APKG file
            const zip = new AdmZip(apkgPath);
            const zipEntries = zip.getEntries();

            // Find and read the media mapping file
            const mediaEntry = zipEntries.find(entry => entry.entryName === 'media');
            if (!mediaEntry) {
                throw new Error('No media mapping file found in the Anki package');
            }

            // Parse the media mapping
            const mediaContent = mediaEntry.getData().toString('utf8');
            const mediaMap = JSON.parse(mediaContent);

            console.log(`Found ${Object.keys(mediaMap).length} entries in media mapping`);

            // Extract audio files based on the media mapping
            for (const [fileNumber, realName] of Object.entries(mediaMap)) {
                console.log(`Processing entry: ${fileNumber} -> ${realName}`);

                if (this.AUDIO_EXTENSIONS.test(realName)) {
                    console.log(`Found audio file: ${realName}`);
                    const audioEntry = zipEntries.find(entry => entry.entryName === fileNumber);

                    if (audioEntry) {
                        const targetPath = path.join(outputDir, realName);
                        console.log(`Extracting to: ${targetPath}`);

                        // Get the binary data
                        const fileData = audioEntry.getData();
                        
                        // Write the file using fs promises
                        await promisify(fs.writeFile)(targetPath, fileData);
                        
                        extractedFiles.push(targetPath);
                        console.log(`Successfully extracted: ${realName}`);
                    } else {
                        console.warn(`File ${fileNumber} listed in media mapping not found in archive`);
                    }
                } else {
                    console.debug(`Skipping non-audio file: ${realName}`);
                }
            }

            if (extractedFiles.length === 0) {
                console.warn('No audio files found in the archive (via media mapping)');
            } else {
                console.log(`Successfully extracted ${extractedFiles.length} audio files`);
            }

            return extractedFiles;
        } catch (error) {
            console.error('Error during extraction:', error);
            throw error;
        }
    }
}

module.exports = new AnkiPackageService(); 