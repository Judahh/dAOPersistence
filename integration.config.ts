import type { Config } from '@jest/types';
// import { Utils } from './source/utils';
// import { readInfo2 } from './test/integration/databaseInfos';
// import { MSSQL } from '@flexiblepersistence/mssql';
// import { PersistenceInfo } from 'flexiblepersistence';
// import { Journaly, SenderReceiver } from 'journaly';

export default async (): Promise<Config.InitialOptions> => {
  const config = {
    verbose: true,
    testTimeout: 500000,
    testEnvironment: 'node',
    roots: ['<rootDir>/test/integration'],
    testMatch: ['**/__test__/**/*.+(ts|tsx)', '**/?(*.)+(spec|test).+(ts|tsx)'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['source/**'],
    coverageDirectory: 'test/integration/coverage',
    setupFilesAfterEnv: ['./test/integration/setup.ts'],
  };
  return config;
};
