const fs = require('fs');
const path = require('path');

// Path to Docusaurus config
const configPath = path.join(__dirname, '../../preview/docusaurus.config.js');

// Read existing config
let config = require(configPath);

// Update configuration
config = {
  ...config,
  title: 'Terrarium Documentation',
  tagline: 'Documentation Preview',
  url: 'https://docs.terrarium.dev',
  baseUrl: '/',
  organizationName: 'terrarium',
  projectName: 'terrarium',
  
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/terrarium/terrarium/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Terrarium Docs',
      logo: {
        alt: 'Terrarium Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'typescript/index',
          position: 'left',
          label: 'TypeScript',
        },
        {
          type: 'doc',
          docId: 'api/api',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://github.com/terrarium/terrarium',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'TypeScript',
              to: '/docs/typescript',
            },
            {
              label: 'API',
              to: '/docs/api',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/terrarium/terrarium',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Terrarium. Preview Build.`,
    },
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'terrarium',
      contextualSearch: true,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
  },
};

// Write updated config
fs.writeFileSync(
  configPath,
  `module.exports = ${JSON.stringify(config, null, 2)};`
);
