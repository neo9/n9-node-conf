import test, { ExecutionContext } from 'ava';
import { join } from 'path';

import src, { N9ConfMergeStrategy } from '../src';

test('Simple use case with override at the end', (t: ExecutionContext) => {
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

test('Array override', (t) => {
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

test('Array override with merge strategy V1', (t) => {
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

for (const mergeStrategy of Object.values(N9ConfMergeStrategy) as N9ConfMergeStrategy[]) {
	test(`Check that original conf is not changed with mergeStrategy ${mergeStrategy}`, (t: ExecutionContext) => {
		delete process.env.NODE_ENV;
		let conf = src({
			path: join(__dirname, './fixtures/conf'),
		});
		t.is(conf.deep.test, true);

		conf = src({
			path: join(__dirname, './fixtures/conf'),
			override: {
				mergeStrategy,
				value: {
					deep: {
						test: false,
					},
				},
			},
		});
		t.is(conf.deep.test, false);

		conf = src({
			path: join(__dirname, './fixtures/conf'),
		});
		t.is(conf.deep.test, true, 'original value is still loaded well without override');
	});
}
