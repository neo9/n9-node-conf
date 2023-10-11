import test, { ExecutionContext } from 'ava';
import { join } from 'path';

import src from '../src';

test.beforeEach(() => {
	delete process.env.NODE_ENV;
});

test('Simple use case with extendable conf in yaml', (t: ExecutionContext) => {
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-yaml-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-yaml-1/env.yaml'),
			},
			key: { name: 'appName' },
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-yaml-1'),
	});

	t.is(conf.textValue, 'text override', 'value is overridden');
	t.deepEqual(
		conf.array,
		['replace all array'],
		'All array is replace due to mergeStrategy default to V2',
	);
});

test('Can call extending file env.yaml', (t: ExecutionContext) => {
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-yaml-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-yaml-1/env.json'),
			},
			key: { name: 'appName' },
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-yaml-1'),
	});

	t.is(conf.textValue, 'text override', 'value is overridden');
	t.deepEqual(
		conf.array,
		['replace all array'],
		'All array is replace due to mergeStrategy default to V2',
	);
});

test('Can call extending file env.yml', (t: ExecutionContext) => {
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-yaml-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-yml-1/env.json'),
			},
			key: { name: 'appName' },
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-yaml-1'),
	});

	t.is(conf.textValue, 'text override', 'value is overridden');
	t.deepEqual(
		conf.array,
		['replace all array'],
		'All array is replace due to mergeStrategy default to V2',
	);
});

test('Can call extending file env.json', (t: ExecutionContext) => {
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-1/env.yaml'),
			},
			key: { name: 'appName' },
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-1'),
	});

	t.is(conf.textValue, 'text override', 'value is overridden');
	t.deepEqual(
		conf.array,
		['replace all array'],
		'All array is replace due to mergeStrategy default to V2',
	);
});

test("Can't load unknown file type", (t: ExecutionContext) => {
	const error = t.throws(
		() => {
			src({
				path: join(__dirname, './fixtures/extend-conf-yaml-1'),
				extendConfig: {
					path: {
						absolute: join(__dirname, './fixtures/extend-conf-yaml-invalid/env.wrongExtension'),
					},
				},
				overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-yaml-1'),
			});
		},
		undefined,
		'should not throw error due to wrong conf file',
	);

	t.true(
		error.message.includes('Invalid extension configuration extension'),
		'Error is due to wrong file name extension',
	);
});

test('Extendable conf does not exists is ignored', (t: ExecutionContext) => {
	process.env.NODE_CONF_EXTEND_ABSOLUTE_PATH = join(__dirname, './fixtures/wrong-path/env.yaml');
	t.notThrows(() => {
		src({
			path: join(__dirname, './fixtures/extend-conf-yaml-1'),
			extendConfig: {
				path: {},
			},
			overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-yaml-1'),
		});
	}, 'should not throw error due to wrong path, file is ignored');
	delete process.env.NODE_CONF_EXTEND_ABSOLUTE_PATH;
});

test('Extendable conf error due to invalid yaml', (t: ExecutionContext) => {
	const error = t.throws(
		() => {
			src({
				path: join(__dirname, './fixtures/extend-conf-yaml-1'),
				extendConfig: {
					path: {
						absolute: join(__dirname, './fixtures/extend-conf-yaml-invalid/env.yaml'),
					},
				},
				overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-yaml-1'),
			});
		},
		undefined,
		'should not throw error due to wrong conf file',
	);

	t.true(
		error.message.includes('Error while loading extendable config'),
		'Error is due to extendable config  wrong format',
	);
	t.true(error.message.includes('extend-conf-yaml-invalid'), 'Error include wrong path for debug');
});
