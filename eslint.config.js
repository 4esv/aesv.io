import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['src/static/js/**/*.js', 'src/static/sw.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        navigator: 'readonly',
        NodeFilter: 'readonly',
        htmx: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        self: 'readonly',
        caches: 'readonly',
        location: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        getComputedStyle: 'readonly',
        ResizeObserver: 'readonly',
        Intl: 'readonly',
      },
    },
    rules: {
      'no-var': 'off',
      'prefer-const': 'off',
    },
  },
  {
    ignores: ['node_modules/'],
  },
]
