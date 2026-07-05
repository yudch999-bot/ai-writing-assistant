import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'src/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: [],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  collectCoverageFrom: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

export default config;
