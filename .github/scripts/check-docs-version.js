const fs = require('fs');
const path = require('path');

// Read the main project analysis file
const projectAnalysisPath = path.join(__dirname, '../../docs/PROJECT_ANALYSIS.md');
const content = fs.readFileSync(projectAnalysisPath, 'utf8');

// Extract current version
const versionMatch = content.match(/Version: (\d+\.\d+\.\d+)/);
if (!versionMatch) {
  console.error('❌ No version found in PROJECT_ANALYSIS.md');
  process.exit(1);
}

const currentVersion = versionMatch[1];

// Check last git commit that modified the file
const { execSync } = require('child_process');
const lastCommitDate = execSync(
  `git log -1 --format=%cd --date=short -- ${projectAnalysisPath}`
).toString().trim();

// Extract last updated date from the file
const lastUpdatedMatch = content.match(/Last Updated: (\d{4}-\d{2}-\d{2})/);
if (!lastUpdatedMatch) {
  console.error('❌ No last updated date found in PROJECT_ANALYSIS.md');
  process.exit(1);
}

const documentDate = lastUpdatedMatch[1];

// Check if the document date matches the last commit date
if (documentDate !== lastCommitDate) {
  console.error('❌ Document "Last Updated" date does not match last commit date');
  console.error(`Document date: ${documentDate}`);
  console.error(`Last commit: ${lastCommitDate}`);
  process.exit(1);
}

// Check changelog
const changelogMatch = content.match(/## Document Changelog([\s\S]*?)(?=\n#|$)/);
if (!changelogMatch) {
  console.error('❌ No changelog section found');
  process.exit(1);
}

const changelog = changelogMatch[1];
if (!changelog.includes(currentVersion)) {
  console.error('❌ Current version not found in changelog');
  process.exit(1);
}

console.log('✅ Documentation version check passed');
console.log(`Current version: ${currentVersion}`);
console.log(`Last updated: ${documentDate}`);
