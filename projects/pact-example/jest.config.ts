import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  maxWorkers: 4,
  globalSetup: 'jest-preset-angular/global-setup',
};
export default config;
