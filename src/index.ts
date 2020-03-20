import * as appRootDir from 'app-root-dir';
import * as debug from 'debug';
import * as _ from 'lodash';
import * as Path from 'path';

const log = debug('n9-node-conf');

export interface N9ConfOptions {
	path?: string;
	extendConfigPath?: string;
}

// Customizer method to merge sources
function customizer(objValue: any, srcValue: any): any {
	if (_.isUndefined(objValue) && !_.isUndefined(srcValue)) return srcValue;
	if (_.isArray(objValue) && _.isArray(srcValue)) return srcValue;
	if (_.isRegExp(objValue) || _.isRegExp(srcValue)) return srcValue;
	if (_.isObject(objValue) || _.isObject(srcValue)) {
		return _.mergeWith(objValue, srcValue, customizer);
	}
}

export interface BaseConf {
	env: string;
	name: string;
	version: string;
}

export default (options: N9ConfOptions = {}) => {
	const rootDir = appRootDir.get();
	const confPath: string = process.env.NODE_CONF_PATH || options.path || Path.join(rootDir, 'conf');
	const environment: string = process.env.NODE_ENV || 'development';
	const app = require(Path.join(rootDir, 'package.json')); // Fetch package.json of the app
	const filenames = ['application', `${environment}`, 'local']; // Files to load
	const sources: BaseConf[] = []; // Sources of each config file

	// Load each file
	for (const filename of filenames) {
		const filePath = Path.join(confPath, filename);
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
			if (filename === 'local') break;
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
		sources.push(source.default || source);
	}
	// Add env, name & version to the returned config
	sources.push({
		env: environment,
		name: app.name,
		version: app.version,
	});
	// Return merged sources
	return _.mergeWith.apply(null, [...sources, customizer]);
};
