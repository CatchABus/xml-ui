import generate from '@babel/generator';
import { highlight } from 'cli-highlight';
import fs from 'fs';
import { compile } from '@nativescript-community/xml-ui-compiler';

if (process.argv.length < 3) {
  throw new Error(`
  # Usage:
    npm run convert <value>
    npm run convert -- --param1 --param2 <value>
  
  # Parameters
    --inline: Allows parsing inline XML string
    --ast: Returns AST output instead of generated code`);
}

const parameter: string = process.argv[process.argv.length - 1];
const content: string = process.argv.includes('--inline') ? parameter : fs.readFileSync(parameter, 'utf8');

const { output } = compile(content, 'views/test/test.xml', 'android');

if (output) {
  // eslint-disable-next-line no-console
  console.log(process.argv.includes('--ast') ? highlight(JSON.stringify(output, null, 2), {
    language: 'json'
  }) : highlight(generate(output).code, {
    language: 'js'
  }));
}