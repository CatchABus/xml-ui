# NativeScript XML UI

[![GitHub forks](https://img.shields.io/github/forks/nativescript-community/xml-ui.svg)](https://github.com/nativescript-community/xml-ui/network)
[![GitHub stars](https://img.shields.io/github/stars/nativescript-community/xml-ui.svg)](https://github.com/nativescript-community/xml-ui/stargazers)

- [@nativescript-community/xml-ui-compiler](packages/compiler/README.md)
- [@nativescript-community/xml-ui-core](packages/core/README.md)
- [@nativescript-community/xml-ui-loader](packages/loader/README.md)

This is an alternate version of NativeScript Core JS/TS flavor.  
It's a new approach that uses an ahead-of-time (AOT) compiler to turn XML content along with data bindings into a JavaScript module during the build phase, in order for developers to use the same code for a more optimized result (more or less).  
It also comes with the flexibility of using data binding alternatives in markup (e.g. mobx).  

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
  - [Code](#code)
  - [TypeScript Configuration](#typescript-configuration)
  - [Webpack](#webpack)
- [Usage](#usage)
  - [Import as a module](#import-as-a-module)
  - [Import as plain XML](#import-as-plain-xml)
- [Features](#features)
  - [Data binding](#data-binding)
  - [Custom components](#custom-components)
  - [Script and Style](#script-and-style)
  - [Slots](#slots)
    - [Declaration](#declaration)
    - [Targeting slots](#targeting-slots)
    - [Slot fallback](#slot-fallback)
    - [Using slots in JS/TS components](#using-slots-in-jsts-components)
- [License](#license)


## Installation

```
npm install @nativescript-community/xml-ui-core && npm install @nativescript-community/xml-ui-loader --save-dev
```


## Setup

### Code

In your app/main.ts, append the following import:
```js
import '@nativescript-community/xml-ui-core';
```

### TypeScript configuration

Add XML module declaration to your types:

`references.d.ts`
```ts
/// <reference path="./node_modules/@nativescript/types/index.d.ts" />

declare module '*.xml';
```

### Webpack

This loader requires a new configuration:

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


## Usage

### Import as a module

One can easily import an XML component just like any regular JS module using either a default or a named import.  
Example:
```javascript
// Default import
import MyActionBar123 from "./components/my-action-bar.xml";
// Named import
import { MyActionBar } from "./components/my-action-bar.xml";
```

### Import as plain XML

To import the raw content of an XML file, append an XML declaration to it.  
Example:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<list>
  ...
</list>
```
This will make sure import will resolve to plain XML string content.


## Features

### Data binding

Data bindings are supported using MVVM pattern by setting view's `bindingContext` property on JS side.
```xml
<!-- Property binding -->
<Page>
  <GridLayout>
    <Label text="{{ myTextProp }}"/>
  </GridLayout>
</Page>

<!-- Event binding -->
<Page>
  <GridLayout>
    <Label text="Hello world!" on:tap="{{ onHelloWorldTap }}"/>
  </GridLayout>
</Page>

<!-- Property converters -->
<Page>
  <GridLayout>
    <Label text="{{ myTextProp | toUpperCaseConverter }}"/>
  </GridLayout>
</Page>
```

Note: Two-way binding is enabled by default. However, events, sub-properties and expressions that make use of `$value`, `$parent`, or `$parents` callers do not support it.

### Custom components

Regarding custom components, they can be used in markup by declaring namespaces.  
A namespace works just like a named import.

A correct approach, supposing caller directory path is `app/views/home` and components directory path is `app/components`
```xml
<Page xmlns:myxml="../../components/my-xml-component.xml" xmlns:myjs="../../components/my-js-component">
  <myjs:MyJsComponent/>
  <!-- OR -->
  <myjs:default/><!-- in case module has a default export -->
</Page>
```

### Script and Style

In general, one is able to create script and style files for an XML component provided that they use the same filename.  
The first contains useful entities like events used by XML and the latter applies all CSS to it.  

There is also a forgotten method to bind scripts or styles to XML.  
It's `codeFile` and `cssFile` properties. These properties are assigned to top element inside an XML file and are especially useful when one wishes to bind a single script or style file with multiple components.  

```xml
<!-- Script -->
<Page codeFile="~/views/common/myscript">
</Page>

<!-- CSS -->
<Page cssFile="~/views/common/mystyle">
</Page>
```

### Slots

Custom components can make one's code reusable but there is always the need to have total control over view nesting as they can be quite complex at times.  
Here comes the concept of `slots`. Inspired from the web component [slot](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) element, slots ensure that custom components can be extremely flexible on reusing at different cases that demand different view content.  
For more information, see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot  

#### Declaration

A plain slot that behaves as default
```xml
<!-- my-custom-view.xml -->
<StackLayout>
  <slot/>
</StackLayout>
```

A named slot
```xml
<!-- my-custom-view.xml -->
<StackLayout>
  <slot name="page-content"/>
</StackLayout>
```

#### Targeting slots

In order to target slots and keep NativeScript existing nesting behaviour intact at the same time, one must declare slot views inside a `slotContent` element.
```xml
<!-- my-page.xml -->
<Page xmlns:mcv="../my-custom-view.xml">
  <mcv:MyCustomView>
    <slotContent>
      <Label text="Hello"/>
    </slotContent>
  </mcv:MyCustomView>
</Page>
```

Named slots can be targeted using the `slot` attribute.
```xml
<!-- my-page.xml -->
<Page xmlns:mcv="../my-custom-view.xml">
  <mcv:MyCustomView>
    <slotContent>
      <Label slot="page-content" text="Hello"/>
    </slotContent>
  </mcv:MyCustomView>
</Page>
```

There is also the option of targeting a slot using multiple views.
```xml
<!-- my-page.xml -->
<Page xmlns:mcv="../my-custom-view.xml">
  <mcv:MyCustomView>
    <slotContent>
      <Label text="Hello"/>
      <Label text="there"/>
    </slotContent>
  </mcv:MyCustomView>
</Page>
```
or
```xml
<!-- my-page.xml -->
<Page xmlns:mcv="../my-custom-view.xml">
  <mcv:MyCustomView>
    <slotContent>
      <Label slot="page-content" text="Hello"/>
      <Label slot="page-content" text="there"/>
    </slotContent>
  </mcv:MyCustomView>
</Page>
```

Apart from views, slots can also target other slots.
```xml
<!-- my-page.xml -->
<Page xmlns:mcv="../my-custom-view.xml">
  <mcv:MyCustomView>
    <slotContent>
      <slot name="the-other-slot" slot="page-content"/>
    </slotContent>
  </mcv:MyCustomView>
</Page>
```

#### Slot fallback

Fallback refers to the content (one or more views) that is rendered when no view(s) target the slot.
```xml
<!-- my-custom-view.xml -->
<StackLayout>
  <slot>
    <Label text="Not found!"/>
    <Label text="Really?"/>
  </slot>
</StackLayout>
```

#### Using slots in JS/TS components

There is also the possibility of making use of slot functionality into script components.
```js
import { StackLayout } from '@nativescript/core';

class MyCustomView extends StackLayout {
  // Constructor has sole access to slot views
  constructor() {
    super();

    // $slotViews is an array of views
    if (this.$slotViews['default']) {
      for (const view of this.$slotViews['default']) {
        this.addChild(view);
      }
    }
  }
}

export {
  MyCustomView
}
```

```xml
<!-- my-page.xml -->
<Page xmlns:mcv="../my-custom-view">
  <mcv:MyCustomView>
    <slotContent>
      <Label text="Hello"/>
    </slotContent>
  </mcv:MyCustomView>
</Page>
```


## License

Apache-2.0