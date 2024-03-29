import { Program } from '@babel/types';
import { AttributeValueFormatter } from '@nativescript-community/xml-ui-compiler';

export interface LoaderOptions {
  appPath: string;
  platform: string;
  compileWithMarkupErrors?: boolean;
  useDataBinding?: boolean;
  preprocess?: {
    attributeValueFormatter?: AttributeValueFormatter;
    transformAst?: (ast: Program, generateFunc) => string;
  };
}

export function chainLoaderConfiguration(config, options: LoaderOptions) {
  const defaults: LoaderOptions = {
    appPath: '/',
    platform: null,
    useDataBinding: true
  };

  // Apply user-defined options on top of defaults
  options = Object.assign(defaults, options);

  config.module.rules.delete('xml');

  // Update HMR supported extensions
  config.module.rules.has('hmr-core') && config.module.rules.get('hmr-core').test(/\.(js|ts|xml)$/);

  config.module
    .rule('xml')
    .test(/\.xml$/i)
    .use('@nativescript-community/xml-ui-loader')
    .loader('@nativescript-community/xml-ui-loader')
    .options(options);

  config.plugin('DefinePlugin').tap(args => {
    Object.assign(args[0], {
      '__UI_USE_XML_PARSER__': false,
      '__UI_USE_EXTERNAL_RENDERER__': true
    });
    return args;
  });
}