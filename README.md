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
