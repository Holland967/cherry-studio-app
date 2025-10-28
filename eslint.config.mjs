import expo from 'eslint-config-expo/flat.js'
import unusedImports from 'eslint-plugin-unused-imports'

const ignores = [
  'node_modules/**',
  '.yarn/**',
  'packages/*/node_modules/**',
  'dist/**',
  'build/**',
  '.expo/**',
  'web-build/**',
  'ios/**',
  'android/**',
  'expo-env.d.ts',
  '**/*.tsbuildinfo',
  '.cache/**',
  '.next/**',
  '.turbo/**',
  '.parcel-cache/**',
  '.DS_Store',
  '.DS_Store?/**',
  '._*',
  '.Spotlight-V100',
  '.Trashes',
  'ehthumbs.db',
  'Thumbs.db',
  '.vscode/**',
  '.idea/**',
  '**/*.swp',
  '**/*.swo',
  '*~',
  '**/*.tmp',
  '**/*.temp',
  '.tmp/**',
  'logs/**',
  '**/*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'coverage/**',
  '**/*.lcov',
  '**/*.db',
  '**/*.sqlite',
  '**/*.sqlite3',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.svg',
  '**/*.ico',
  '**/*.pdf',
  '**/*.zip',
  '**/*.tar',
  '**/*.gz',
  '**/*.tgz',
  '.metro/**',
  'metro.config.js',
  'ios/Pods/**',
  'android/app/build/**'
]

export default [
  { ignores },
  ...expo,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ]
    }
  }
]
