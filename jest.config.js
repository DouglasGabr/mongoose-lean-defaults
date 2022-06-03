module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/(*.)+spec.ts'],
  verbose: true,
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target: 'es2019',
        },
        sourceMaps: 'inline',
      },
    ],
  },
};
