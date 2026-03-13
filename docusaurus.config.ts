import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const {version: appVersion} = require('./package.json');

const baseUrl = '/ocfcrews-docs/';
const siteUrl = 'https://proutyio.github.io';

const config: Config = {
  title: 'OCFCrews Documentation',
  tagline: 'Comprehensive technical documentation for the OCFCrews crew scheduling platform',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl,

  organizationName: 'proutyio',
  projectName: 'ocfcrews-docs',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/proutyio/ocfcrews-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OCFCrews',
      logo: {
        alt: 'OCFCrews Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'html',
          position: 'right',
          value: `<span style="font-size:0.75rem;font-weight:600;padding:2px 8px;border-radius:9999px;background:var(--ifm-color-emphasis-200);color:var(--ifm-color-emphasis-700);">${appVersion.includes('-') ? appVersion.replace(/^(.+?)-(.+)$/, 'beta $1') : 'v' + appVersion}</span>`,
        },
        {
          href: '/',
          label: 'Back to Site',
          position: 'right',
        },
        {
          href: 'https://github.com/proutyio/ocfcrews',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Getting Started',
          items: [
            {label: 'Overview', to: `${baseUrl}getting-started/overview`},
            {label: 'Local Development', to: `${baseUrl}getting-started/local-development`},
            {label: 'Environment Variables', to: `${baseUrl}getting-started/environment-variables`},
          ],
        },
        {
          title: 'Architecture',
          items: [
            {label: 'System Overview', to: `${baseUrl}architecture/system-overview`},
            {label: 'Data Model', to: `${baseUrl}data-model/overview`},
            {label: 'Auth & Access Control', to: `${baseUrl}auth/authentication-flow`},
          ],
        },
        {
          title: 'Features',
          items: [
            {label: 'Scheduling', to: `${baseUrl}features/scheduling/overview`},
            {label: 'Inventory', to: `${baseUrl}features/inventory/overview`},
            {label: 'Recipes', to: `${baseUrl}features/recipes/overview`},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/proutyio/ocfcrews'},
          ],
        },
      ],
      copyright: `Copyright &copy; ${new Date().getFullYear()} OCFCrews. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
    mermaid: {
      theme: {light: 'default', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
