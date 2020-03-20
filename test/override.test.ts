import ava, { ExecutionContext } from 'ava';
import { join } from 'path';

import src, { N9ConfMergeStrategy } from '../src';

ava('Simple use case with override at the end', (t: ExecutionContext) => {
	delete process.env.NODE_ENV;
	const conf = src({
		path: join(__dirname, './fixtures/conf'),
		override: {
			value: {
				test: false,
			},
		},
	});
	t.is(conf.test, false);
});

ava('Array override', (t) => {
	// Set NODE_ENV to 'test'
	process.env.NODE_ENV = 'test';
	const conf = src({
		path: join(__dirname, './fixtures/conf-2'),
		override: {
			value: {
				array: [7, 8],
			},
			// default merge strategy is V2
		},
	});
	t.deepEqual(conf.array, [7, 8]);
	// Remove NODE_ENV
	delete process.env.NODE_ENV;
});

ava('Array override with merge strategy V1', (t) => {
	// Set NODE_ENV to 'test'
	process.env.NODE_ENV = 'test';
	const conf = src({
		path: join(__dirname, './fixtures/conf-2'),
		override: {
			value: {
				array: [7, 8],
			},
			mergeStrategy: N9ConfMergeStrategy.V1,
		},
	});
	t.deepEqual(conf.array, [7, 8, 3]);
	// Remove NODE_ENV
	delete process.env.NODE_ENV;
});
