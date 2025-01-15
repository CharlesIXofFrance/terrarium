const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API routes in the codebase
function findAPIRoutes() {
  const routes = new Set();
  const apiFiles = glob.sync('src/**/api/**/*.{ts,js}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match route definitions (customize based on your routing setup)
    const routeMatches = content.match(/['"]\/api\/v\d+\/[^'"]+['"]/g);
    if (routeMatches) {
      routeMatches.forEach(route => routes.add(route.replace(/['"]/g, '')));
    }
  });

  return routes;
}

// Find all documented APIs
function findDocumentedAPIs() {
  const documented = new Set();
  const apiDocs = glob.sync('docs/api/**/*.md');

  apiDocs.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match API endpoint documentation (customize based on your documentation format)
    const endpointMatches = content.match(/## `[A-Z]+ \/api\/v\d+\/[^`]+`/g);
    if (endpointMatches) {
      endpointMatches.forEach(endpoint => {
        const route = endpoint.match(/\/api\/v\d+\/[^`]+/)[0];
        documented.add(route);
      });
    }
  });

  return documented;
}

// Main check
const implementedRoutes = findAPIRoutes();
const documentedRoutes = findDocumentedAPIs();

// Find undocumented routes
const undocumented = new Set(
  [...implementedRoutes].filter(route => !documentedRoutes.has(route))
);

if (undocumented.size > 0) {
  console.error('❌ Found undocumented API routes:');
  undocumented.forEach(route => console.error(`  - ${route}`));
  process.exit(1);
}

// Find documented but not implemented routes
const notImplemented = new Set(
  [...documentedRoutes].filter(route => !implementedRoutes.has(route))
);

if (notImplemented.size > 0) {
  console.warn('⚠️ Found documented but not implemented API routes:');
  notImplemented.forEach(route => console.warn(`  - ${route}`));
}

console.log('✅ API documentation coverage check completed');
console.log(`Total routes: ${implementedRoutes.size}`);
console.log(`Documented routes: ${documentedRoutes.size}`);
