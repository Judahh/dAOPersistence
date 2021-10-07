import type { Config } from '@jest/types';
import { Utils } from './source/utils';
import { readInfo1 } from './test/integration/databaseInfos';
import { MSSQL } from '@flexiblepersistence/mssql';
import { PersistenceInfo } from 'flexiblepersistence';
import { Journaly, SenderReceiver } from 'journaly';

export default async (): Promise<Config.InitialOptions> => {
  console.log('Init Tests...');
  const journaly = Journaly.newJournaly() as SenderReceiver<unknown>;
  const database = new PersistenceInfo(readInfo1, journaly);
  // console.log('database:', readInfo1);
  await Utils.create(new MSSQL(database));
  console.log('Init done!');
  return {
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
};
