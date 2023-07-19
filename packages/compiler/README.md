# @nativescript-community/xml-ui-compiler

[![npm](https://img.shields.io/npm/v/@nativescript-community/xml-ui-compiler.svg)](https://www.npmjs.com/package/@nativescript-community/xml-ui-compiler)
[![npm](https://img.shields.io/npm/dt/@nativescript-community/xml-ui-compiler.svg?label=npm%20downloads)](https://www.npmjs.com/package/@nativescript-community/xml-ui-compiler)

A Node compiler that converts NativeScript XML view content to AST.  

## Installation

```
npm install @nativescript-community/xml-ui-compiler --save-dev
```

## Usage
```js
import fs from 'fs';
import generate from '@babel/generator';
import { compile } from '@nativescript-community/xml-ui-compiler';

const filePath = 'views/home/home.xml';
const content = fs.readFileSync(filePath, 'utf8');

const { output } = compile(content, filePath, 'android');

// Convert AST to JS and print
console.log(generate(output).code);
```