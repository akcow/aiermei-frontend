const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const pathsToClean = [
  path.join(projectRoot, 'unpackage'),
  path.join(projectRoot, 'node_modules'),
  path.join(projectRoot, 'package-lock.json')
];

console.log('Starting cleanup...');

pathsToClean.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`Deleting ${p}...`);
    try {
      if (fs.lstatSync(p).isDirectory()) {
        fs.rmSync(p, { recursive: true, force: true });
      } else {
        fs.unlinkSync(p);
      }
      console.log(`Successfully deleted ${p}`);
    } catch (err) {
      console.error(`Failed to delete ${p}: ${err.message}`);
    }
  } else {
    console.log(`${p} does not exist, skipping.`);
  }
});

console.log('Cleanup finished. Please run "npm install" and restart HBuilderX.');
