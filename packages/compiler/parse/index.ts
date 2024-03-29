import * as t from '@babel/types';
import { Parser } from 'htmlparser2';
import { ComponentBuilder } from '../builders/component-builder';
import { BindingBuilder } from '../builders/binding-builder';
import { AttributeValueFormatter } from '../builders/base-builder';
import { LocationTracker, setCurrentLocationTracker } from './location-tracker';

function getAstForRawXML(content: string): t.Program {
  return t.program([
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier('RAW_XML_CONTENT'),
          t.stringLiteral(content)
        )
      ]
    ),
    t.exportDefaultDeclaration(
      t.identifier('RAW_XML_CONTENT')
    )
  ], [], 'module');
}

export function compile(content: string, moduleRelativePath: string, platform: string, useDataBinding: boolean = true, attributeValueFormatter?: AttributeValueFormatter): { output: t.Program; pathsToResolve: Array<string> } {
  const componentBuilder = new ComponentBuilder(moduleRelativePath, platform);
  let compilationResult;
  let needsCompilation = true;

  if (useDataBinding) {
    componentBuilder.setBindingBuilder(new BindingBuilder());
  }
  if (attributeValueFormatter) {
    componentBuilder.setAttributeValueFormatter(attributeValueFormatter);
  }

  const xmlParser = new Parser({
    onopentagname(tagName) {
      componentBuilder.onTagOpening(tagName);
    },
    onattribute(name, value) {
      componentBuilder.onAttribute(name, value);
    },
    onopentag(tagName, attributes) {
      componentBuilder.onTagOpened(tagName, attributes);
    },
    onprocessinginstruction(name) {
      if (name == '?xml') {
        needsCompilation = false;
        xmlParser.reset();
      }
    },
    onclosetag(tagName) {
      componentBuilder.onTagClosing(tagName);
    },
    onerror(err) {
      throw err;
    }
  }, {
    xmlMode: true
  });

  const tracker = new LocationTracker(content, xmlParser);
  setCurrentLocationTracker(tracker);

  xmlParser.write(content);
  xmlParser.end();

  if (needsCompilation) {
    compilationResult = {
      output: componentBuilder.getModuleAst(),
      pathsToResolve: componentBuilder.getPathsToResolve()
    };
  } else {
    compilationResult = {
      output: getAstForRawXML(content),
      pathsToResolve: []
    };
  }

  return compilationResult;
}