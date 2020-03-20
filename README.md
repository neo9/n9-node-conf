# n9-node-conf

Conf node module loader.

[![npm version](https://img.shields.io/npm/v/@neo9/n9-node-conf.svg)](https://www.npmjs.com/package/@neo9/n9-node-conf)
[![Travis](https://img.shields.io/travis/neo9/n9-node-conf/master.svg)](https://travis-ci.org/neo9/n9-node-conf)
[![Coverage](https://img.shields.io/codecov/c/github/neo9/n9-node-conf/master.svg)](https://codecov.io/gh/neo9/n9-node-conf)
[![license](https://img.shields.io/github/license/neo9/n9-node-conf.svg)](https://github.com/neo9/n9-node-conf/blob/master/LICENSE)

## Installation

```bash
yarn add @neo9/n9-node-conf
```

or

```bash
npm install --save @neo9/n9-node-conf
```

## Usage

`n9NodeConf([options])`

Options:

- path: `String`, default: `process.env.NODE_CONF_PATH || './conf/'`

Example:

```typescript
import n9NodeConf from '@neo9/n9-node-conf';
import { join } from 'path';

const conf = n9NodeConf({
	path: join(__dirname, 'conf'),
});
```

### Options :

[N9ConfOptions](./src/index.ts#L8) :

#### path

Type: `string`\
Required \
Path to the folder containing the configuration files. See the [structure](#structure) for more details.

#### extendConfig

Type: `object`\
Default: undefined
To describe extension configuration.

##### path

Type: `object`\
Required \
To describe where to find extension configuration. One of `absolute` or `relative` is required.

###### absolute

Type: `string`\
Required if `relative` is not filled \
Absolute path to the extension configuration.\
Example : `Path.join(__dirname, 'conf/env.json')`

###### relative

Type: `string`\
Required if `absolute` is not filled \
Relative path to the conf folder `path` \
Example : `'./env.json'`

##### key

Type: `string`\
Default the app name from `package.json`.`name`\
The key to use in configuration extension. The path to load the conf will be `{env}.{app name}`

##### mergeStrategy

Type: `N9ConfMergeStrategy` (`v1` or `v2`)\
Default: `v2`\
The merge strategy to use to merge extension configuration with the other.

- v1 : Use lodash merge function. Mainly, merge deeper in arrays\
  [a, b] + [c, d] → [merge(a, c), merge(b, d)]
- v2 : Use built in mechanism. It replace array is any\
  [a, b] + [c, d] → [c, d]

#### overridePackageJsonDirPath

Type: `string`\
Default: `undefined`, use npm module [app-root-dir](https://www.npmjs.com/package/app-root-dir) to find `package.json`
Used to load `package.json`, to find app name, app version and with app name to build the path to load the conf extension.

#### override

Type: `object`\
Default undefined, no override
Override the conf at the end of loading.

##### value

Type: `object`\
Default: undefined, not applied\
Value to override the conf at the end of loading. Merge strategy used is defined bellow. Useful for tests.

##### mergeStrategy

Type: `N9ConfMergeStrategy`\
Default : N9ConfMergeStrategy.V2\
Merge strategy to use to merge override.

## Structure

```bash
conf/
  application.ts
  development.ts
  integration.ts
  local.ts # should be in .gitignore
  preproduction.ts
  production.ts
  staging.ts
package.json
```

The module will load these files, every file overwrites the one before:

`application.js + ${process.env.NODE_ENV}.js + local.js`

1. If `process.env.NODE_ENV` is not defined, default to `'development'`
2. If `local.js` does not exists, it will be ignored.
3. It will also fetch the `package.json` of the app to fill its `name` & `version`

This module can use a configuration extension, see [here](./documentation/extendable-configuration.md) for more information.

## Example

`package.json`

```json
{
	"name": "my-app",
	"version": "0.1.2"
}
```

`conf/application.ts`

```js
export default {
	http: {
		port: 6686,
	},
};
```

`conf/development.ts`

```js
export default {};
```

`conf/production.ts`

```js
export default {
	http: {
		port: 80,
	},
};
```

`loadConf.ts`

```js
import n9NodeConf from '@neo9/n9-node-conf';

const conf = n9NodeConf();
console.log('const conf =', conf);
```

`node loadConf.ts`

```typescript
const conf = {
	name: 'my-app',
	version: '0.1.2',
	env: 'development',
	http: {
		port: 5000,
	},
};
```

`NODE_ENV=production node loadConf.ts`

```typescript
const conf = {
	name: 'my-app',
	version: '0.1.2',
	env: 'production',
	http: {
		port: 80,
	},
};
```

## Logs

To display the logs of the module, you can use `DEBUG=n9-node-conf`.
