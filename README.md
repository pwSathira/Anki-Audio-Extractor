# Anki Audio Extractor

A desktop application that extracts audio files from Anki .apkg packages, built with Node.js and Electron.

## Prerequisites

- Node.js 16 or later
- npm (comes with Node.js)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the application:
   ```bash
   npm start
   ```

## Development

- The Node.js backend is located in `src/services` and `src/server.js`
- The Electron frontend is in `src/main.js` and `src/index.html`
- To modify the UI, edit the files in the `src` directory
- To modify the backend, edit the files in `src/services` and `src/server.js`

## Building for Distribution

To create a distributable package:

```bash
npm run build
```

This will create a distributable package in the `dist` directory.

## License

MIT License
