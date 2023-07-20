# @nativescript-community/xml-ui-loader

[![npm](https://img.shields.io/npm/v/@nativescript-community/xml-ui-loader.svg)](https://www.npmjs.com/package/@nativescript-community/xml-ui-loader)
[![npm](https://img.shields.io/npm/dt/@nativescript-community/xml-ui-loader.svg?label=npm%20downloads)](https://www.npmjs.com/package/@nativescript-community/xml-ui-loader)

This loader provides support for using [@nativescript-community/xml-ui-compiler](../compiler) in Webpack.  

## Installation

```
npm install @nativescript-community/xml-ui-loader --save-dev
```

## Usage
`webpack.config.js`
```javascript
const webpack = require('@nativescript/webpack');
const { getEntryDirPath, getPlatformName } = require('@nativescript/webpack/dist/helpers/platform');
const { chainLoaderConfiguration } = require("@nativescript-community/xml-ui-loader/helpers");

module.exports = (env) => {
  webpack.init(env);

  // Learn how to customize:
  // https://docs.nativescript.org/webpack

  webpack.chainWebpack((config) => {
    chainLoaderConfiguration(config, {
      appPath: getEntryDirPath(),
      platform: getPlatformName()
    });
  });

  return webpack.resolveConfig();
};
```

There are also few preprocessing options that are useful for applying output customizations.
```javascript
chainLoaderConfiguration(config, {
  appPath: getEntryDirPath(),
  platform: getPlatformName(),
  useDataBinding: false, // Set this to false if you don't want to use data binding system
  preprocess: {
    // Format attribute value
    attributeValueFormatter: (value, attributeName, tagName, attributes) => value.toUpperCase(),
    // Manage AST result
    transformAst: (ast, generateFunc) => generateFunc(ast).code,
  }
});

```