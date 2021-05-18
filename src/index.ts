import * as appRootDir from 'app-root-dir';
import * as debug from 'debug';
import * as fs from 'fs-extra';
import * as JsYaml from 'js-yaml';
import * as _ from 'lodash';
import * as Path from 'path';
const log = debug('n9-node-conf');

export interface N9ConfOptions {
	path?: string;
	extendConfig?: {
		path: {
			absolute?: string;
			/**
			 * Relative path the `path`
			 */
			relative?: string;
		};
		key?: string;
		mergeStrategy?: N9ConfMergeStrategy;
	};
	overridePackageJsonDirPath?: string;
	/**
	 * Override the conf at the end of loading.
	 */
	override?: {
		value: object;
		mergeStrategy?: N9ConfMergeStrategy;
	};
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

export interface N9ConfBaseConf {
	env?: string;
	name?: string;
	version?: string;
}

export enum N9ConfMergeStrategy {
	/**
	 * Merge with lodash merge (_.merge)
	 */
	V1 = 'v1',
	/**
	 * Merge with n9Conf merge customizer
	 */
	V2 = 'v2',
}

function getExtendConfigPath(options: N9ConfOptions, confPath: string): string {
	if (process.env.NODE_CONF_EXTEND_ABSOLUTE_PATH) return process.env.NODE_CONF_EXTEND_ABSOLUTE_PATH;
	if (options.extendConfig?.path?.absolute) return options.extendConfig.path.absolute;
	if (options.extendConfig?.path?.relative) {
		return Path.join(confPath, options.extendConfig.path.relative);
	}
	return;
}

function mergeWithStrategy(
	strategy: N9ConfMergeStrategy = N9ConfMergeStrategy.V2,
	source: object,
	override1: object,
): object {
	switch (strategy) {
		case N9ConfMergeStrategy.V1:
			return _.merge(source, override1);
		case N9ConfMergeStrategy.V2:
			return _.mergeWith(source, override1, customizer);
		default:
			throw new Error(
				`Merge strategy unknown : ${strategy}, supported ones are : ${Object.values(
					N9ConfMergeStrategy,
				).join(' ')}`,
			);
	}
}

function readConfigFile(path: string, type: 'json' | 'yaml'): any {
	log(`Load extension ${path}`);
	switch (type) {
		case 'json':
			return fs.readJSONSync(path);
		case 'yaml':
			return JsYaml.load(fs.readFileSync(path, 'utf8'));
	}
}

function loadExtendConfig(
	extendConfigPath: string,
	extension: string = Path.extname(extendConfigPath),
	deep: number = 3,
): { metadata: { mergeStrategy: N9ConfMergeStrategy } } {
	let type: 'json' | 'yaml';
	switch (extension) {
		case '.json':
			type = 'json';
			break;
		case '.yaml':
		case '.yml':
			type = 'yaml';
			break;
		default:
			throw new Error(
				`Invalid extension configuration extension "${extension}" for file name ${extendConfigPath}`,
			);
	}
	const fileNameWithoutExtension = Path.basename(extendConfigPath, Path.extname(extendConfigPath));
	const dir = Path.dirname(extendConfigPath);
	const path = Path.join(dir, `${fileNameWithoutExtension}${extension}`);
	if (fs.pathExistsSync(path)) {
		return readConfigFile(path, type);
	}
	if (deep > 0) {
		// try if other types exists
		if (extension === '.json') {
			// load yaml
			return loadExtendConfig(extendConfigPath, '.yaml', deep - 1);
		}
		if (extension === '.yaml') {
			// load yml
			return loadExtendConfig(extendConfigPath, '.yml', deep - 1);
		}
		if (extension === '.yml') {
			// load yml
			return loadExtendConfig(extendConfigPath, '.json', deep - 1);
		}
	}
}

export default (options: N9ConfOptions = {}) => {
	const rootDir = appRootDir.get();
	const confPath: string = process.env.NODE_CONF_PATH || options.path || Path.join(rootDir, 'conf');
	const packageJsonDirPath = Path.join(
		options.overridePackageJsonDirPath || rootDir,
		'package.json',
	);
	const extendConfigPath: string = getExtendConfigPath(options, confPath);
	const defaultMergeStrategy: N9ConfMergeStrategy = options.extendConfig?.mergeStrategy;
	const currentEnvironment: string = process.env.NODE_ENV || 'development';
	const app: { name: string; version: string } = require(packageJsonDirPath); // Fetch package.json of the app
	const extendConfigKey: string = options.extendConfig?.key ?? app.name;
	const environments = ['application', `${currentEnvironment}`, 'local']; // Files to load
	const sources: N9ConfBaseConf[] = []; // Sources of each config file
	let extendConfig: { metadata: { mergeStrategy: N9ConfMergeStrategy } };

	if (extendConfigPath) {
		try {
			extendConfig = loadExtendConfig(extendConfigPath);
		} catch (e) {
			throw new Error(
				`Error while loading extendable config (${
					e.message
				}) : ${extendConfigPath} ${JSON.stringify(e)}`,
			);
		}
	}

	// Load each file
	for (const environment of environments) {
		const filePath = Path.join(confPath, environment);
		let fileLoadingError: Error;
		try {
			require(filePath);
		} catch (err) {
			fileLoadingError = err;
			try {
				if (!(environment === 'local' && err.code === 'MODULE_NOT_FOUND')) {
					log(`Error while loading config file '${filePath}' : ${JSON.stringify(err)}`);
				}
			} catch (e) {
				log(`Can't stringify error ${err && err.message}`);
			}
		}
		// If config file does not exists
		if (fileLoadingError) {
			// Ignore for local.js file
			if (environment === 'local') break;
			// throw an error for others
			throw new Error(
				`Could not load config file: ${filePath}, ${fileLoadingError.name}(${
					fileLoadingError.message
				}) details: ${JSON.stringify(fileLoadingError)}`,
			);
		}
		// Load its source
		log(`Loading ${environment} configuration`);
		const loadedSource = require(filePath);
		let source = loadedSource.default || loadedSource;

		if (extendConfig) {
			const strategy: N9ConfMergeStrategy =
				extendConfig.metadata?.mergeStrategy ?? defaultMergeStrategy ?? N9ConfMergeStrategy.V2;
			const extendConfigForThisEnv: object = extendConfig[environment]?.[extendConfigKey];
			if (extendConfigForThisEnv) {
				source = mergeWithStrategy(strategy, source, extendConfigForThisEnv);
			}
		}

		sources.push(source);
	}
	// Add env, name & version to the returned config
	sources.push({
		env: currentEnvironment,
		name: app.name,
		version: app.version,
	});
	// Return merged sources
	let result = _.mergeWith.apply(null, [...sources, customizer]);
	if (options.override?.value) {
		result = mergeWithStrategy(options.override.mergeStrategy, result, options.override.value);
	}
	return result;
};
