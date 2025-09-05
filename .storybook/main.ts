import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: ['@storybook/addon-a11y', "@storybook/addon-docs"],

  framework: {
    name: '@storybook/nextjs',
    options: {
      builder: {
        useSWC: false,
      },
    },
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  webpackFinal: async (config) => {
    // Ensure path aliases work in Storybook
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../'),
        '@/components': path.resolve(__dirname, '../components'),
        '@/lib': path.resolve(__dirname, '../lib'),
        '@/app': path.resolve(__dirname, '../app'),
      };

      // Add webpack 5 fallbacks to prevent Node.js polyfill errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "path": false,
        "stream": false,
        "util": false,
        "assert": false,
        "crypto": false,
        "os": false,
        "url": false,
        "zlib": false,
        "http": false,
        "https": false,
        "querystring": false,
        "child_process": false,
        "net": false,
        "cluster": false,
        "dgram": false,
        "module": false,
      };
    }

    return config;
  },

  staticDirs: ['../public'],

  core: {
    disableTelemetry: true,
  }
};

export default config;