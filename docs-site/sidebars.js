/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'introduction',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/communities',
        'features/job-boards',
        'features/analytics',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/authentication',
        {
          type: 'category',
          label: 'Endpoints',
          items: [
            'api/endpoints/communities',
            'api/endpoints/jobs',
            'api/endpoints/users',
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
