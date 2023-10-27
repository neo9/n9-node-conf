# Extend a configuration

Example, you have an app, you would like to have a configuration override for user A and another for user B.
The idea is to link a file (usually `env.json`) to the configuration loading to extend/override the configuration.

## Example

```bash
application.ts :
```

```typescript
const conf = {
	url: 'http://an-url.com',
};

export default conf;
```

to override is locally you can add a `development.ts` or `local.ts`

```typescript
const conf = {
	url: 'http://a-local-url.lan',
};

export default conf;
```

to override it for user a, create a file `env.json` or `env.yaml` :

`env.json` : (remove comments)

```json5
{
	application: {
		// choose which environment you want to override, you can overide all with one file
		'app-name': {
			// your application name, so you can share this env.json for all your apis for instance
			url: 'http://user-a.com',
		},
	},
}
```

`env.yaml` :

```yaml
application: # choose which environment you want to override, you can overide all with one file
  app-name: # your application name, so you can share this env.json for all your apis for instance
    url: http://user-a.com
```

### Result :

- in integration for instance : `url === http://user-a.com` from `env.json`
- in development : url is `http://a-local-url.lan` from `development.ts` or `local.ts` which are loaded over `application.ts`

## Usage :

```typescript
import n9NodeConf from '@neo9/n9-node-conf';
import { join } from 'path';

const conf = n9NodeConf({
	path: join(__dirname, 'conf'),
	extendConfig: {
		path: {
			relative: './conf/env.json',
		},
	},
});
```
