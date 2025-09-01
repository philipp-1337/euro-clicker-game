
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['dev-dist/**'], // <-- top-level ignores, nicht innerhalb files
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
        globals: {
            ...globals.browser,
        },
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    plugins: {
        'react': reactPlugin,
        'react-hooks': hooksPlugin,
        'jsx-a11y': jsxA11y,
    },
    rules: {
        ...js.configs.recommended.rules,
        ...reactPlugin.configs.recommended.rules,
        ...reactPlugin.configs['jsx-runtime'].rules,
        ...jsxA11y.configs.recommended.rules,
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    }
  }
];
