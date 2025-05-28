const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = {
    mac: [16, 32, 64, 128, 256, 512, 1024],
    windows: [16, 32, 48, 64, 128, 256],
    linux: [16, 32, 48, 64, 128, 256, 512]
};

async function generateIcons() {
    const buildDir = path.join(__dirname, '..', 'build');
    const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');

    // Create build directory if it doesn't exist
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    // Generate macOS icons
    console.log('Generating macOS icons...');
    const macIcons = await Promise.all(
        ICON_SIZES.mac.map(size => 
            sharp(svgPath)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );

    // Generate Windows icons
    console.log('Generating Windows icons...');
    const windowsIcons = await Promise.all(
        ICON_SIZES.windows.map(size => 
            sharp(svgPath)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );

    // Generate Linux icons
    console.log('Generating Linux icons...');
    const linuxIcons = await Promise.all(
        ICON_SIZES.linux.map(size => 
            sharp(svgPath)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );

    // Save individual PNG files for Linux
    console.log('Saving Linux icons...');
    await Promise.all(
        ICON_SIZES.linux.map((size, i) =>
            fs.promises.writeFile(
                path.join(buildDir, `icon-${size}.png`),
                linuxIcons[i]
            )
        )
    );

    // Save the largest PNG as the main Linux icon
    await fs.promises.writeFile(
        path.join(buildDir, 'icon.png'),
        linuxIcons[linuxIcons.length - 1]
    );

    // Save the largest PNG as the main macOS icon
    await fs.promises.writeFile(
        path.join(buildDir, 'icon.icns'),
        macIcons[macIcons.length - 1]
    );

    // Save the largest PNG as the main Windows icon
    await fs.promises.writeFile(
        path.join(buildDir, 'icon.ico'),
        windowsIcons[windowsIcons.length - 1]
    );

    console.log('Icon generation complete!');
}

generateIcons().catch(console.error); 