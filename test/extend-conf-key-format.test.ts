/* eslint-disable @typescript-eslint/naming-convention */
import test, { ExecutionContext } from 'ava';
import { join } from 'path';

import src, { ExtendConfigKeyFormat } from '../src';

test.beforeEach(() => {
	delete process.env.NODE_ENV;
});

const formatToExpectedValues: Record<ExtendConfigKeyFormat, string> = {
	[ExtendConfigKeyFormat.DROMEDARY_CASE]: 'dromedaryCase',
	[ExtendConfigKeyFormat.PASCAL_CASE]: 'PascalCase',
	[ExtendConfigKeyFormat.KEBAB_CASE]: 'kebab-case',
	[ExtendConfigKeyFormat.UPPER_KEBAB_CASE]: 'UPPER-KEBAB-CASE',
	[ExtendConfigKeyFormat.SNAKE_CASE]: 'snake_case',
	[ExtendConfigKeyFormat.UPPER_SNAKE_CASE]: 'UPPER_SNAKE_CASE',
};

for (const [name, expectedValue] of Object.entries(formatToExpectedValues)) {
	test(`Extendable conf with key format : ${name}`, (t: ExecutionContext) => {
		const conf: { textValue: string } = src({
			path: join(__dirname, './fixtures/extend-conf-key-format'),
			extendConfig: {
				path: {
					absolute: join(__dirname, './fixtures/extend-conf-key-format/env.yaml'),
				},
				key: { format: name as ExtendConfigKeyFormat },
			},
			overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-key-format'),
		});

		t.is(conf.textValue, `text override ${expectedValue}`, `value is overridden`);
	});
}

const formatToExpectedValuesWithPrefix: Record<ExtendConfigKeyFormat, Record<string, string>> = {
	[ExtendConfigKeyFormat.DROMEDARY_CASE]: {
		'prefix1': 'dromedaryCase',
		'prefix-': 'dromedaryCase',
		'useless-prefix': 'dromedaryCase',
	},
	[ExtendConfigKeyFormat.PASCAL_CASE]: {
		'prefix1': 'PascalCase',
		'prefix-': 'PascalCase',
		'useless-prefix': 'PascalCase',
	},
	[ExtendConfigKeyFormat.KEBAB_CASE]: {
		'prefix1': 'kebab-case',
		'prefix-': 'kebab-case',
		'useless-prefix': 'kebab-case',
	},
	[ExtendConfigKeyFormat.UPPER_KEBAB_CASE]: {
		'prefix1': 'UPPER-KEBAB-CASE',
		'prefix-': 'UPPER-KEBAB-CASE',
		'useless-prefix': 'UPPER-KEBAB-CASE',
	},
	[ExtendConfigKeyFormat.SNAKE_CASE]: {
		'prefix1': 'snake_case',
		'prefix-': 'snake_case',
		'useless-prefix': 'snake_case',
	},
	[ExtendConfigKeyFormat.UPPER_SNAKE_CASE]: {
		'prefix1': 'UPPER_SNAKE_CASE',
		'prefix-': 'UPPER_SNAKE_CASE',
		'useless-prefix': 'UPPER_SNAKE_CASE',
	},
};

for (const [name, mapxOfPrefixToExpectedValue] of Object.entries(
	formatToExpectedValuesWithPrefix,
)) {
	for (const [prefix, expectedValue] of Object.entries(mapxOfPrefixToExpectedValue)) {
		test(`Extendable conf with key format : ${name} and prefixToAvoid ${prefix}`, (t: ExecutionContext) => {
			const conf: { textValue: string } = src({
				path: join(__dirname, './fixtures/extend-conf-key-format'),
				extendConfig: {
					path: {
						absolute: join(__dirname, `./fixtures/extend-conf-key-format/with-${prefix}/env.yaml`),
					},
					key: { format: name as ExtendConfigKeyFormat, prefixToAvoid: prefix },
				},
				overridePackageJsonDirPath: join(
					__dirname,
					`./fixtures/extend-conf-key-format/with-${prefix}`,
				),
			});

			t.is(conf.textValue, `text override ${expectedValue}`, `value is overridden`);
		});

		test(`Extendable conf with key format : ${name} and prefixToAvoid ${prefix} without format`, (t: ExecutionContext) => {
			const conf: { textValue: string } = src({
				path: join(__dirname, './fixtures/extend-conf-key-format'),
				extendConfig: {
					path: {
						absolute: join(__dirname, `./fixtures/extend-conf-key-format/with-${prefix}/env.yaml`),
					},
					key: { name: 'APP-NAME', prefixToAvoid: prefix },
				},
				overridePackageJsonDirPath: join(
					__dirname,
					`./fixtures/extend-conf-key-format/with-${prefix}`,
				),
			});

			t.is(conf.textValue, `text override UPPER-KEBAB-CASE`, `value is overridden`);
		});
	}
}

test(`Extendable conf with key format : unknown format`, (t: ExecutionContext) => {
	t.throws(
		() =>
			src({
				path: join(__dirname, './fixtures/extend-conf-key-format'),
				extendConfig: {
					path: {
						absolute: join(__dirname, './fixtures/extend-conf-key-format/env.yaml'),
					},
					key: { format: 'wrong-format-name' as ExtendConfigKeyFormat },
				},
				overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-key-format'),
			}),
		{ message: 'unknown-extend-config-key-format-wrong-format-name' },
	);
});
test(`Extendable conf with key format. Name is used if defined.`, (t: ExecutionContext) => {
	const conf: { textValue: string } = src({
		path: join(__dirname, './fixtures/extend-conf-key-format'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-key-format/env.yaml'),
			},
			key: { format: ExtendConfigKeyFormat.DROMEDARY_CASE, name: 'APP_NAME' },
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-key-format'),
	});

	t.is(
		conf.textValue,
		`text override UPPER_SNAKE_CASE`,
		`value is overridden with UPPER_SNAKE_CASE, format key is ignored`,
	);
});

test(`Extendable conf without telling the name or format. PackageJSON.name is used.`, (t: ExecutionContext) => {
	let conf: { textValue: string } = src({
		path: join(__dirname, './fixtures/extend-conf-key-format'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-key-format/env.yaml'),
			},
			key: {},
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-key-format'),
	});

	t.is(
		conf.textValue,
		`text override kebab-case`,
		`value is overridden with kebab-case, key is app-name`,
	);

	conf = src({
		path: join(__dirname, './fixtures/extend-conf-key-format'),
		extendConfig: {
			path: {
				absolute: join(__dirname, './fixtures/extend-conf-key-format/env.yaml'),
			},
		},
		overridePackageJsonDirPath: join(__dirname, './fixtures/extend-conf-key-format'),
	});

	t.is(
		conf.textValue,
		`text override kebab-case`,
		`value is overridden with kebab-case, key is app-name 2`,
	);
});
