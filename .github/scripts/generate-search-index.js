const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const DOCS_DIR = path.join(__dirname, '../../docs/generated');
const OUTPUT_FILE = path.join(DOCS_DIR, 'search-index.json');

// Helper to extract content from markdown
function extractFromMarkdown(content) {
  // Remove code blocks
  content = content.replace(/```[\s\S]*?```/g, '');
  // Remove HTML tags
  content = content.replace(/<[^>]*>/g, '');
  // Remove markdown links but keep text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return content.trim();
}

// Generate search index
async function generateSearchIndex() {
  const searchIndex = [];
  
  // Process TypeScript docs
  const tsFiles = glob.sync('**/*.md', {
    cwd: path.join(DOCS_DIR, 'typescript'),
    ignore: ['**/node_modules/**']
  });

  tsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(DOCS_DIR, 'typescript', file), 'utf8');
    const title = content.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md');
    
    searchIndex.push({
      title,
      type: 'typescript',
      path: `/typescript/${file}`,
      content: extractFromMarkdown(content),
      tags: ['typescript', 'code']
    });
  });

  // Process API docs
  const apiContent = fs.readFileSync(path.join(DOCS_DIR, 'api', 'api.md'), 'utf8');
  const apiSections = apiContent.split(/(?=^#{2}\s+)/m);

  apiSections.forEach(section => {
    const title = section.match(/^#{2}\s+(.+)$/m)?.[1];
    if (title) {
      searchIndex.push({
        title,
        type: 'api',
        path: `/api/api.md#${title.toLowerCase().replace(/\s+/g, '-')}`,
        content: extractFromMarkdown(section),
        tags: ['api', 'endpoint']
      });
    }
  });

  // Add metadata
  const searchData = {
    version: '1.0',
    generated: new Date().toISOString(),
    index: searchIndex
  };

  // Ensure directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  // Write search index
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(searchData, null, 2));
  console.log(`✅ Search index generated with ${searchIndex.length} entries`);
}

generateSearchIndex().catch(console.error);
