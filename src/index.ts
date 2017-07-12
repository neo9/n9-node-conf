import { existsSync } from 'fs'
import { join } from 'path'
import * as debug from 'debug'
import { noop, isArray, isObject, isRegExp, mergeWith, isUndefined } from 'lodash'
import * as appRootDir from 'app-root-dir'

const log = debug('n9-node-conf')

export interface N9ConfOptions {
	path?: string
}

// Customizer method to merge sources
function customizer(objValue, srcValue) {
	if (isUndefined(objValue) && !isUndefined(srcValue)) return srcValue
	if (isArray(objValue) && isArray(srcValue)) return srcValue
	if (isRegExp(objValue) || isRegExp(srcValue)) return srcValue
	if (isObject(objValue) || isObject(srcValue)) return mergeWith(objValue, srcValue, customizer)
}

export default function(options?: N9ConfOptions) {
	// Options default
	options = options || {}
	const rootDir = appRootDir.get()
	const confPath: string = process.env.NODE_CONF_PATH || options.path || join(rootDir, 'conf')
	// Environement
	const env: string = process.env.NODE_ENV || 'development'
	// Fetch package.json of the app
	const app = require(join(rootDir, 'package.json'))
	// Files to load
	const files = [
		'application',
		`${env}`,
		'local'
	]
	// Sources of each config file
	const sources = []
	// Load each file
	files.forEach((filename) => {
		const filePath = join(confPath, filename)
		let fileExists = true
		try { require(filePath) } catch (err) { fileExists = false }
		// If config file does not exists
		if (!fileExists) {
			// Ignore for local.js file
			if (filename === 'local') return
			// throw an error for others
			throw new Error(`Could not load config file: ${filePath}`)
		}
		// Load its source
		log(`Loading ${filename} configuration`)
		const source = require(filePath)
		sources.push(source.default ? source.default : source)
	})
	// Add env, name & version to the returned config
	sources.push({
		env,
		name: app.name,
		version: app.version
	})
	// Return merged sources
	return mergeWith.apply(null, [ ...sources, customizer ])
}
