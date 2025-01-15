const fs = require('fs-extra');
const path = require('path');

// Source and destination paths
const sourceFile = path.join(__dirname, '../../openapi.yaml');
const destDir = path.join(__dirname, '../static');
const destFile = path.join(destDir, 'openapi.yaml');

// Ensure the destination directory exists
fs.ensureDirSync(destDir);

// Copy the OpenAPI spec
fs.copyFileSync(sourceFile, destFile);

console.log('OpenAPI spec copied successfully!');
