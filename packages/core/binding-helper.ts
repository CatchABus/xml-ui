import { Application, addWeakEventListener, Observable, removeWeakEventListener, Utils, ViewBase, PropertyChangeData } from '@nativescript/core';

export interface BindingHandler {
  addChangeListener: (source: any, target: ViewBase, propertyNames: string[], changeCallback: (args: PropertyChangeData) => void) => void;
  removeChangeListener: (source: any, target: ViewBase, propertyNames: string[], changeCallback: (args: PropertyChangeData) => void) => void;
  isCompatible: (source: any, target: ViewBase) => boolean;
  setValue: (source: any, target: ViewBase, propertyName: string, propertyValue: string) => void;
}

const observableBindingHandler: BindingHandler = {
  addChangeListener(source: any, target: ViewBase, propertyNames: string[], changeCallback) {
    addWeakEventListener(source, Observable.propertyChangeEvent, changeCallback, target);
  },
  removeChangeListener(source: any, target: ViewBase, propertyNames: string[], changeCallback) {
    removeWeakEventListener(source, Observable.propertyChangeEvent, changeCallback, target);
  },
  isCompatible(source: any) {
    return source instanceof Observable;
  },
  setValue(source: any, target: ViewBase, propertyName: string, propertyValue: string) {
    source.set(propertyName, propertyValue);
  }
};

let bindingHandler: BindingHandler = observableBindingHandler;

function notifyViewBindingContextChange(args) {
  const view = args.object;
  view.notify(<PropertyChangeData>{
    object: view,
    eventName: 'bindingContextChange',
    propertyName: 'bindingContext',
    value: view.bindingContext,
    oldValue: view.bindingContext,
  });
}

export function onBindingSourcePropertyChange(args) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const view: ViewBase = this;

  BindingHelper.startViewModelToViewUpdate(view, view.bindingContext, viewModel => {
    const $value = viewModel;
    const $parent = view.parent ? view.parent.bindingContext : null;

    if (args.propertyName in (view as any)._bindingSourceCallbackPairs) {
      (view as any)._bindingSourceCallbackPairs[args.propertyName](view, viewModel, {
        $value,
        $parent
      });
    }
  });
}

export class BindingHelper {
  static getDataBindingHandler(): BindingHandler {
    return bindingHandler;
  }

  static setDataBindingHandler(handler: BindingHandler) {
    bindingHandler = handler;
  }

  public static createParentsBindingInstance(view: ViewBase, cssTypes: string[]) {
    const instance = {};
    
    let parent: ViewBase = view.parent;
    while (parent && cssTypes.length) {
      const index: number = cssTypes.findIndex(cssType => cssType.toLowerCase() === parent.typeName);
      if (index >= 0) {
        const cssType: string[] = cssTypes.splice(index, 1);
        instance[cssType[0]] = parent.bindingContext;
      }
      parent = parent.parent;
    }
  
    // Some parents are not available soon enough, so a retry is done when view gets loaded
    if (cssTypes.length && !view.isLoaded) {
      view.off(ViewBase.loadedEvent, notifyViewBindingContextChange);
      view.once(ViewBase.loadedEvent, notifyViewBindingContextChange);
    }
    return instance;
  }

  public static startViewToViewModelUpdate(view: ViewBase, bindingContext, callback) {
    callback(bindingContext);
  }

  public static startViewModelToViewUpdate(view: ViewBase, bindingContext, callback) {
    const bindingResources = Application.getResources();
    const addedBindingContextProperties: string[] = [];
    let source;
  
    // Ensure source is an object
    if (bindingContext == null) {
      source = {};
    } else {
      const type = typeof bindingContext;
      if (type === 'number') {
        source = new Number(bindingContext);
      } else if (type === 'boolean') {
        source = new Boolean(bindingContext);
      } else if (type === 'string') {
        source = new String(bindingContext);
      } else {
        source = bindingContext;
      }
    }
  
    // Addition of application resources
    for (const propertyName in bindingResources) {
      if (!(propertyName in source)) {
        source[propertyName] = bindingResources[propertyName];
        addedBindingContextProperties.push(propertyName);
      }
    }
  
    callback(source);
  
    // Finally, perform a cleanup for view model
    for (const propertyName of addedBindingContextProperties) {
      delete source[propertyName];
    }
  }

  public static runConverterCallback(context, converter, args: [], toModelDirection: boolean = false) {
    let callback;
    if (!Utils.isNullOrUndefined(converter) && Utils.isObject(converter)) {
      callback = (toModelDirection ? converter.toModel : converter.toView);
    } else {
      callback = converter;
    }
    return Utils.isFunction(callback) ? callback.apply(context, args) : undefined;
  }
}