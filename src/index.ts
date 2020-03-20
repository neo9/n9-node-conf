import * as appRootDir from 'app-root-dir';
import * as debug from 'debug';
import { isArray, isObject, isRegExp, isUndefined, mergeWith } from 'lodash';
import { join } from 'path';

const log = debug('n9-node-conf');

export interface N9ConfOptions {
	path?: string;
}

// Customizer method to merge sources
function customizer(objValue: any, srcValue: any): any {
	if (isUndefined(objValue) && !isUndefined(srcValue)) return srcValue;
	if (isArray(objValue) && isArray(srcValue)) return srcValue;
	if (isRegExp(objValue) || isRegExp(srcValue)) return srcValue;
	if (isObject(objValue) || isObject(srcValue)) return mergeWith(objValue, srcValue, customizer);
}

export interface BaseConf {
	env: string;
	name: string;
	version: string;
}

export default (options: N9ConfOptions = {}) => {
	const rootDir = appRootDir.get();
	const confPath: string = process.env.NODE_CONF_PATH || options.path || join(rootDir, 'conf');
	// Environment
	const env: string = process.env.NODE_ENV || 'development';
	// Fetch package.json of the app
	const app = require(join(rootDir, 'package.json'));
	// Files to load
	const files = ['application', `${env}`, 'local'];
	// Sources of each config file
	const sources: BaseConf[] = [];
	// Load each file
	files.forEach((filename) => {
		const filePath = join(confPath, filename);
		let fileLoadingError: Error;
		try {
			require(filePath);
		} catch (err) {
			fileLoadingError = err;
			try {
				log(`Error while loading config file '${filePath}' : ${JSON.stringify(err)}`);
			} catch (e) {
				log(`Can't stringify error ${err && err.message}`);
			}
		}
		// If config file does not exists
		if (fileLoadingError) {
			// Ignore for local.js file
			if (filename === 'local') return;
			// throw an error for others
			throw new Error(
				`Could not load config file: ${filePath}, ${fileLoadingError.name}(${
					fileLoadingError.message
				}) details: ${JSON.stringify(fileLoadingError)}`,
			);
		}
		// Load its source
		log(`Loading ${filename} configuration`);
		const source = require(filePath);
		sources.push(source.default ? source.default : source);
	});
	// Add env, name & version to the returned config
	sources.push({
		env,
		name: app.name,
		version: app.version,
	});
	// Return merged sources
	return mergeWith.apply(null, [...sources, customizer]);
};
