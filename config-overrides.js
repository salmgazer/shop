const { override, babelInclude, addDecoratorsLegacy, useBabelRc } = require('customize-cra');
const path = require('path');

const addWorkerLoader = () => config => {
	config.output.globalObject = 'this';
	config.module.rules.unshift({ test: /\.worker\.js$/, use: { loader: 'worker-loader' } });
	return config;
};

module.exports = override(
	addWorkerLoader(),
	addDecoratorsLegacy(),
	useBabelRc(),
	babelInclude([
		// tell Babel to include common files
		path.resolve('src'),
	])
);


