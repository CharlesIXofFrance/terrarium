// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Terrarium Documentation',
  tagline: 'Build and grow your community platform',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.terrarium.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'CharlesIXofFrance',
  projectName: 'terrarium',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/CharlesIXofFrance/terrarium/tree/main/docs-site/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          // Remove versioning for now
          disableVersioning: true,
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            require.resolve('./src/css/swagger-ui.css'),
          ],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      metadata: [
        {name: 'keywords', content: 'terrarium, documentation, api, community platform'},
        {name: 'description', content: 'Official documentation for the Terrarium community platform'},
      ],
      navbar: {
        title: 'Terrarium',
        logo: {
          alt: 'Terrarium Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/api-playground',
            label: 'API Playground',
            position: 'left',
          },
          {
            to: '/status',
            label: 'System Status',
            position: 'right',
          },
          {
            href: 'https://github.com/CharlesIXofFrance/terrarium',
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
                label: 'Getting Started',
                to: '/docs/getting-started/installation',
              },
              {
                label: 'API Reference',
                to: '/docs/api/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/terrarium',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/terrariumdev',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                href: 'https://blog.terrarium.dev',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/CharlesIXofFrance/terrarium',
              },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} Terrarium. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

module.exports = config;
