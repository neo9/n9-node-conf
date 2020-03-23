import ava, { ExecutionContext } from 'ava';
import { join } from 'path';

import src from '../src';

ava('Simple use case with extendable conf', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-yaml-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-yaml-1/env.yaml'),
			},
			key: 'appName',
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

ava('Can call extending file env.yaml', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-yaml-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-yaml-1/env.json'),
			},
			key: 'appName',
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

ava('Can call extending file env.yml', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-yaml-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-yml-1/env.json'),
			},
			key: 'appName',
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

ava('Can call extending file env.json', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-1/env.yaml'),
			},
			key: 'appName',
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

ava("Can't load unknown file type", (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
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
		null,
		'should not throw error due to wrong conf file',
	);

	t.true(
		error.message.includes('Invalid extension configuration extension'),
		'Error is due to wrong file name extension',
	);
});

ava('Extendable conf does not exists is ignored', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
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

ava('Extendable conf error due to invalid yaml', (t: ExecutionContext) => {
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
		null,
		'should not throw error due to wrong conf file',
	);

	t.true(
		error.message.includes('Error while loading extendable config'),
		'Error is due to extendable config  wrong format',
	);
	t.true(error.message.includes('extend-conf-yaml-invalid'), 'Error include wrong path for debug');
});
