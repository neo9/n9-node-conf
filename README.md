# n9-node-conf

Neo9 conf loader.

## Installation

```bash
npm install --save n9-node-conf
```

## Usage

`n9Conf([path] [, options])`

Arguments:

- path: `String`, default: `process.env.CONF_PATH || './conf/'`
- options: `Object`, default: `{}`

Example:

```ts
import n9Conf from 'n9-node-conf'

const conf = n9Conf('../conf')
```

Options:

- log: `Function`, method to log the output, useful to debug

Example:

```ts
const conf = n9Conf('../conf', { log: console.log })
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
    port: 6686
  }
}
```

`conf/development.ts`

```js
export default {}
```

`conf/production.ts`

```js
export default {
  http: {
    port: 80
  }
}
```

`loadConf.ts`

```js
import n9Conf from 'n9-node-conf'

const conf = n9Conf()
console.log('conf =', conf)
```

`node loadConf.ts`
```bash
conf = {
  name: 'my-app',
  version: '0.1.2',
  env: 'development',
  http: {
    port: 5000
  }
}
```

`NODE_ENV=production node loadConf.ts`
```bash
conf = {
  name: 'my-app',
  version: '0.1.2',
  env: 'production',
  http: {
    port: 80
  }
}
```
