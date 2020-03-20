import * as appRootDir from 'app-root-dir';
import ava from 'ava';
import { join } from 'path';

import src from '../src';
// tslint:disable-next-line:no-var-requires
const app = require(join(appRootDir.get(), 'package.json'));

ava('Simple use case', (t) => {
	delete process.env.NODE_ENV;
	const conf = src({ path: join(__dirname, './fixtures/conf') });
	t.is(conf.env, 'development');
	t.is(conf.name, app.name);
	t.is(conf.version, app.version);
	t.is(conf.test, true);
});

ava('Custom path with custom NODE_ENV', (t) => {
	// Set NODE_ENV to 'test'
	process.env.NODE_ENV = 'test';
	const conf = src({ path: join(__dirname, './fixtures/conf-2') });
	t.is(conf.env, 'test');
	t.deepEqual(conf.arr, ['a', 'b']);
	t.deepEqual(conf.array, [1, 2, 3]);
	t.deepEqual(conf.object, {
		key1: 'string',
		key2: 23,
	});
	t.is(String(conf.regexp), '/test-2/');
	t.is(conf.other, 'yes');
	// Remove NODE_ENV
	delete process.env.NODE_ENV;
});

ava('Simple work with process.env.NODE_CONF_PATH', (t) => {
	process.env.NODE_CONF_PATH = join(__dirname, './fixtures/conf');
	const conf = src();
	t.is(conf.env, 'development');
	t.is(conf.name, app.name);
	t.is(conf.version, app.version);
	t.is(conf.test, true);
	delete process.env.NODE_CONF_PATH;
});

ava('Should throw and error with bad path', (t) => {
	const error = t.throws(() => {
		src();
	});
	t.true(error.message.includes('Could not load config file'));
});
