import ava, { ExecutionContext } from 'ava';
import { join } from 'path';

import src from '../src';

ava('Simple use case with extendable conf', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf: { textValue: string; array: string[] } = src({
		path: join(__dirname, './fixtures/extend-conf-1'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-1/env.json'),
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

ava('Extendable conf does not exists is ignored', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	process.env.NODE_CONF_EXTEND_ABSOLUTE_PATH = join(__dirname, './fixtures/wrong-path/env.json');
	t.notThrows(() => {
		src({
			path: join(__dirname, './fixtures/extend-conf-1'),
			extendConfig: {
				path: {},
			},
			overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-1'),
		});
	}, 'should not throw error due to wrong path, file is ignored');
	delete process.env.NODE_CONF_EXTEND_ABSOLUTE_PATH;
});

ava('Extendable conf error due to invalid json', (t: ExecutionContext) => {
	const error = t.throws(
		() => {
			src({
				path: join(__dirname, './fixtures/extend-conf-1'),
				extendConfig: {
					path: {
						absolute: join(__dirname, './fixtures/extend-conf-invalid/env.json'),
					},
				},
				overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-1'),
			});
		},
		null,
		'should not throw error due to wrong conf file',
	);

	t.true(
		error.message.includes('Error while loading extendable config'),
		'Error is due to extendable config wrong json file format',
	);
	t.true(error.message.includes('extend-conf-invalid'), 'Error include wrong path for debug');
});

ava('Extendable conf error unknown mergeStrategy', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const error = t.throws(
		() => {
			src({
				path: join(__dirname, './fixtures/extend-conf-3'),
				extendConfig: {
					path: {
						absolute: join(__dirname, './fixtures/extend-conf-3/env.json'),
					},
				},
				overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-3'),
			});
		},
		null,
		'should throw error due to wrong merge strategy',
	);

	t.true(
		error.message.includes('Merge strategy unknown : v42'),
		'Error is due to extendable config wrong strategy',
	);
});

ava('Extendable conf error unknown mergeStrategy forced', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const error = t.throws(
		() => {
			src({
				path: join(__dirname, './fixtures/extend-conf-3'),
				extendConfig: {
					path: {
						absolute: join(__dirname, './fixtures/extend-conf-3/env.json'),
					},
					mergeStrategy: 'V4' as any,
				},
				overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-3'),
			});
		},
		null,
		'should throw error due to wrong merge strategy',
	);

	t.true(
		error.message.includes('Merge strategy unknown : v42'),
		'Error is due to extendable config wrong strategy',
	);
});

ava('Simple use case with extendable conf with merge strategy 1', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf: { textValue: string; array: string[]; arrayOfObjects: { key: number }[] } = src({
		path: join(__dirname, './fixtures/extend-conf-2'),
		extendConfig: {
			path: {
				relative: './env.json',
			},
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-2'),
	});

	t.is(conf.textValue, 'text override', 'value is overridden');
	t.deepEqual(
		conf.array,
		['some values', 'override second cell only', '2', '3', '4'],
		'Only second element is replaced',
	);
	t.deepEqual(
		conf.arrayOfObjects,
		[
			{
				key: 1,
			},
			{
				key: 0,
			},
			{
				key: 3,
			},
			{
				key: 4,
			},
		],
		'Only second element is replaced',
	);
});
