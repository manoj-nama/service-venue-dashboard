/* eslint-disable no-undef */

module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js',
		'tsx',
		'json'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: [
		'**/test/**/*.test.(ts|js|tsx)'
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: ["<rootDir>/src/env.ts"]

};
