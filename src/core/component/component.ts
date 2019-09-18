import { error, isEmpty, isFunction, isNull, isObject, isUndefined, sanitize } from '../../helpers';
import { forceUpdate } from '../../platform/browser/dom';
import { makeEvents } from '../../platform/browser/events';
import {
  $$cache,
  $$id,
  $$isMounted,
  $$prevProps,
  $$prevState,
  $$root,
  $$uid,
  ATTR_COMPONENT_NAME,
  ATTR_DONT_UPDATE_NODE,
  ATTR_KEY,
  STATEFULL_COMPONENT_REPLACER,
  VDOM_ELEMENT_TYPES,
} from '../constants';
import { getRegistery, getUIDActive, setCurrentMountedComponentId } from '../scope';
import {
  createCommentNode,
  getComponentVirtualNodeById,
  getVirtualDOM,
  setAttribute,
  VirtualNodeType,
} from '../vdom';


type ComponentDefType = {
  displayName?: string;
  config?: {
    pure?: boolean;
  };
  props?: {
    key?: any;
    ref?: (c: ComponentType) => void;
  };
  state?: {};
  render: () => VirtualNodeType | null;
  getInitialState?: () => any;
  getDefaultProps?: () => any;
  willMount?: () => void;
  didMount?: () => void;
  willReceiveProps?: (p) => void;
  shouldUpdate?: (p, s) => boolean;
  willUpdate?: (p, s) => void;
  didUpdate?: (p, s) => void;
  willUnmount?: () => void;
};

type ComponentOptions = {
  displayName?: string;
  defaultProps?: any;
};

type ComponentType = {
  setState?: (state, cb?) => void;
  forceUpdate?: () => void;
} & ComponentDefType;

type StatefullComponentFactoryType = {
  isStatefullComponent: boolean;
  displayName: string;
  createInstance: () => ComponentType;
  getElementToken: () => Symbol;
  config: {
    pure: boolean;
  };
  props: {
    ref?: any;
    key?: any;
  };
};

type StatelessComponentFactoryType = {
  isStatelessComponent: boolean;
  displayName: string;
  createElement: () => VirtualNodeType;
  props: {
    key?: any;
  };
};

function getInitialState(def: ComponentDefType) {
  if (isFunction(def.getInitialState)) {
    const initialState = sanitize(def.getInitialState());
    return { ...initialState };
  }

  return {};
}

function getDefaultProps(def: ComponentDefType) {
  if (isFunction(def.getDefaultProps)) {
    const defaultProp = sanitize(def.getDefaultProps());
    return { ...defaultProp };
  }

  return {};
}

function createComponent(defObj: ComponentDefType | Function, options: ComponentOptions = null) {
  const def = defObj as ComponentDefType;
  const $$elementToken = Symbol(def.displayName || 'element');
  const config = def.config || { pure: false };
  const reservedPropNames = {
    setState: true,
    forceUpdate: true,
    willMount: true,
    didMount: true,
    willReceiveProps: true,
    shouldUpdate: true,
    willUpdate: true,
    didUpdate: true,
    willUnmount: true,
    render: true,
  };
  const reservedStaticPropNames = {};
  class Component implements ComponentType {
    public state = getInitialState(def);
    public props = getDefaultProps(def);

    constructor() {
      const mapDefKeys = (key: string) => {
        if (isFunction(def[key])) {
          def[key] = def[key].bind(this);

          return !reservedPropNames[def[key].name] && (this[key] = def[key]);
        }

        !reservedStaticPropNames[key] && (this[key] = def[key]);
      };

      Object.keys(def).forEach(mapDefKeys);
      this[$$id] = null;
      this[$$isMounted] = false;
      this[$$cache] = new Map();
      this[$$prevState] = { ...this.state };
      this[$$prevProps] = { ...this.props };
    }

    public setState(state: {}, onRender = () => {}) {
      const mergedState = {
        ...this.state,
        ...sanitize(state),
      };

      if (!this.shouldUpdate(this.props, { ...mergedState })) return;

      this[$$prevState] = { ...this.state };
      this.state = { ...mergedState };

      this.forceUpdate(onRender);
    }

    public forceUpdate(onRender = () => {}) {
      forceUpdate(this, {
        beforeRender: () => {
          this.willUpdate(this.props, this.state);
        },
        afterRender: () => {
          this.didUpdate(this.props, { ...this[$$prevState] });
          onRender();
        },
      });
    }

    public willMount() {
      isFunction(def.willMount) && def.willMount();
    }

    public didMount() {
      isFunction(def.didMount) && def.didMount();
    }

    public willReceiveProps(nextProps) {
      isFunction(def.willReceiveProps) && def.willReceiveProps(nextProps);
    }

    public shouldUpdate(nextProps, nextState) {
      return isFunction(def.shouldUpdate) ? def.shouldUpdate(nextProps, nextState) : true;
    }

    public willUpdate(nextProps, nextState) {
      isFunction(def.willUpdate) && def.willUpdate(nextProps, nextState);
    }

    public didUpdate(prevProps, prevState) {
      isFunction(def.didUpdate) && def.didUpdate(prevProps, prevState);
    }

    public willUnmount() {
      isFunction(def.willUnmount) && def.willUnmount();
    }

    public render() {
      if (isFunction(def.render)) return def.render();
      error('render method does not exist!');
    }
  }

  return (props: {} = {}) => {
    const resolveFactory = def => {
      const isStateless = isFunction(def);
      const displayName = def.displayName || (options ? options.displayName : '');
      const defaultProps = isStateless
        ? options && options.defaultProps
          ? sanitize(options.defaultProps)
          : {}
        : getDefaultProps(def);
      const computedProps = { ...defaultProps, ...sanitize(props) };
      const factory = isStateless
        ? ({
            isStatelessComponent: true,
            displayName,
            createElement: () => def({ ...computedProps }),
            uid: 0,
            props: computedProps,
          } as StatelessComponentFactoryType)
        : ({
            isStatefullComponent: true,
            displayName,
            createInstance: () => new Component(),
            getElementToken: () => $$elementToken,
            uid: 0,
            config,
            props: computedProps,
          } as StatefullComponentFactoryType);

      return factory;
    };

    return resolveFactory(def);
  };
}

function getPublicInstance(componentFactory) {
  return null;
}

function wire(componentFactory: StatefullComponentFactoryType): VirtualNodeType {
  const uid = getUIDActive();
  const app = getRegistery().get(uid);
  const sanitizedProps = sanitize(componentFactory.props);
  const { key, ref } = sanitizedProps as any;
  const instance: ComponentType = getPublicInstance(componentFactory);
  let vNode: VirtualNodeType = null;
  let id = null;

  instance[$$uid] = uid;
  instance[$$prevProps] = { ...instance.props };

  if (!instance[$$isMounted]) {
    instance.willMount();
  }

  const reduceProps = (acc, key) => ((acc[key] = sanitizedProps[key]), acc);
  const getProps = () => Object.keys(sanitizedProps).reduce(reduceProps, instance.props);

  id = instance[$$id];
  setCurrentMountedComponentId(id);

  if (instance[$$isMounted] && !instance.shouldUpdate(sanitizedProps, instance.state)) {
    const vdom = getVirtualDOM(uid);
    const vNode = getComponentVirtualNodeById(id, vdom);

    setAttribute(vNode, ATTR_DONT_UPDATE_NODE, true);

    return vNode;
  }

  instance.props = getProps();
  instance.willReceiveProps(instance.props);
  instance.willUpdate(instance.props, instance.state);

  vNode = instance.render();

  if (isUndefined(vNode)) {
    error('render method must return dom`` content or null!');
    return null;
  }

  if (isNull(vNode)) {
    vNode = createCommentNode(
      `${STATEFULL_COMPONENT_REPLACER}:${id}${Boolean(instance.displayName) ? `:${instance.displayName}` : ''}`,
    );
  }

  app.queue.push(() => makeEvents(vNode, uid));

  if (instance[$$root]) {
    app.queue.forEach(fn => fn());
    app.queue = [];
  }

  if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
    !isUndefined(key) && setAttribute(vNode, ATTR_KEY, key);
    instance.displayName && setAttribute(vNode, ATTR_COMPONENT_NAME, instance.displayName);
  }

  const didUpdateTimeout = setTimeout(() => {
    clearTimeout(didUpdateTimeout);
    instance.didUpdate({ ...instance[$$prevProps] }, instance.state);
  });

  if (!instance[$$isMounted]) {
    const didMountTimeout = setTimeout(() => {
      clearTimeout(didMountTimeout);
      instance.didMount();
      instance[$$isMounted] = true;
    });
  }

  ref && ref(instance);
  vNode.props = instance.props;

  return vNode;
}

function unmountComponent(id: string, uid: number, parentInstance = null) {

}

function isStatefullComponent(o: any) {
  return isObject(o) && !isEmpty(o) && o.isStatefullComponent === true;
}

function isStatelessComponent(o: any) {
  return isObject(o) && !isEmpty(o) && o.isStatelessComponent === true;
}

export {
  ComponentDefType, //
  ComponentType,
  StatefullComponentFactoryType,
  StatelessComponentFactoryType,
  createComponent,
  wire,
  getPublicInstance,
  unmountComponent,
  isStatefullComponent,
  isStatelessComponent,
};
