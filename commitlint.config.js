/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // apps
        'api',
        'web',
        // packages
        'api-types',
        'database',
        'ui',
        'utils',
        'config',
        // domains
        'auth',
        'users',
        'factories',
        'production',
        'work-orders',
        'bom',
        'inventory',
        'qc',
        'reports',
        'notifications',
        'sync',
        // infra/misc
        'infra',
        'docker',
        'ci',
        'deps',
      ],
    ],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
  },
};
