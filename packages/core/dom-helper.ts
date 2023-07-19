import { Observable, Trace, Utils, ViewBase, unsetValue } from '@nativescript/core';
import { resolveModuleName } from '@nativescript/core/module-name-resolver';

export class DOMHelper {
  public static addCollectionToParent(propertyName: string, parent: any, items: Observable[]) {
    if (parent._addArrayFromBuilder) {
      parent._addArrayFromBuilder(propertyName, items);
    } else if (parent._addChildFromBuilder) {
      for (const item of items) {
        parent._addChildFromBuilder(propertyName, item);
      }
    } else {
      Trace.write(`Could not add children to view ${parent}`, Trace.categories.ViewHierarchy);
    }
  }

  public static addChildrenToParent(parent: any, children: Observable[]) {
    if (parent._addChildFromBuilder) {
      for (const child of children) {
        if (child) {
          parent._addChildFromBuilder((child as any)._tagName, child);
        }
      }
    }
  }

  public static loadCustomModule(uri: string, ext: string): any {
    if (ext) {
      uri = uri.substring(0, uri.length - (ext.length + 1));
    }
  
    const resolvedModuleName = resolveModuleName(uri, ext);
    return resolvedModuleName ? global.loadModule(resolvedModuleName, true) : null;
  }

  public static setViewPropertyValue(view: ViewBase, propertyName: string, propertyValue: any, isEvent: boolean, notifyForChanges: boolean = true) {
    let propertyOwner: ViewBase = view;
  
    if (propertyName.indexOf('.') !== -1) {
      const properties = propertyName.split('.');
  
      for (let i = 0, length = properties.length - 1; i < length; i++) {
        if (propertyOwner != null) {
          propertyOwner = propertyOwner[properties[i]];
        }
      }
      propertyName = properties[properties.length - 1];
    }
  
    // Use unset value as default if expression result is undefined
    if (Utils.isUndefined(propertyValue)) {
      propertyValue = unsetValue;
    }
    
    if (propertyOwner != null) {
      if (isEvent) {
        const handlerPropertyName: string = `_${propertyName}_handler`;
  
        // Check if old handler is a function and remove it from listeners
        if (Utils.isFunction(propertyOwner[handlerPropertyName])) {
          propertyOwner.off(propertyName, propertyOwner[handlerPropertyName]);
          delete propertyOwner[handlerPropertyName];
        }
        // Check if new handler is a function and add it to listeners
        if (Utils.isFunction(propertyValue)) {
          propertyOwner.on(propertyName, propertyValue);
          propertyOwner[handlerPropertyName] = propertyValue;
        }
      } else if (!notifyForChanges && propertyOwner instanceof Observable) {
        propertyOwner.set(propertyName, propertyValue);
      } else {
        propertyOwner[propertyName] = propertyValue;
      }
    }
  }
}