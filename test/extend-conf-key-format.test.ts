import test, { ExecutionContext } from 'ava';
import { join } from 'path';

import src, { ExtendConfigKeyFormat } from '../src';

test.beforeEach(() => {
	delete process.env.NODE_ENV;
});

const formatWithExpectedValues: Record<ExtendConfigKeyFormat, string> = {
	[ExtendConfigKeyFormat.DROMEDARY_CASE]: 'dromedaryCase',
	[ExtendConfigKeyFormat.PASCAL_CASE]: 'PascalCase',
	[ExtendConfigKeyFormat.KEBAB_CASE]: 'kebab-case',
	[ExtendConfigKeyFormat.UPPER_KEBAB_CASE]: 'UPPER-KEBAB-CASE',
	[ExtendConfigKeyFormat.SNAKE_CASE]: 'snake_case',
	[ExtendConfigKeyFormat.UPPER_SNAKE_CASE]: 'UPPER_SNAKE_CASE',
};

for (const [name, expectedSuffix] of Object.entries(formatWithExpectedValues)) {
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

		t.is(conf.textValue, `text override ${expectedSuffix}`, `value is overridden`);
	});
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
