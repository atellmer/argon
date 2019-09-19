import { deepClone, flatten, isArray, isEmpty, isFunction, isNull, isUndefined } from '../../helpers';
import {
  ComponentType,
  getPublicInstance,
  isStatefullComponent,
  isStatelessComponent,
  StatefullComponentFactoryType,
  StatelessComponentFactoryType,
  wire,
} from '../component/component';
import {
  ATTR_COMPONENT_ID,
  ATTR_KEY,
  EMPTY_REPLACER,
  EVENT_HANDLER_REPLACER,
  INSERT_DIRECTIVE,
  INSERT_DIRECTIVE_REPLACER,
  LIST,
  LIST_REPLACER,
  NODE_SEPARATOR,
  QUEUE_EVENTS,
  REPEAT_DIRECTIVE,
  REPEAT_DIRECTIVE_REPLACER,
  STATEFULL_COMPONENT,
  STATEFULL_COMPONENT_REPLACER,
  STATELESS_COMPONENT,
  STATELESS_COMPONENT_REPLACER,
  VDOM_ACTIONS,
  VDOM_ELEMENT_TYPES,
} from '../constants';
import {
  InsertDirectiveType,
  isInsertDirective,
  isRepeatDirective,
  RepeatDirectiveType,
} from '../directives/directives';
import {
  getCurrentMountedComponentId,
  getCurrentMountedRoute,
  getRegistery,
  getUIDActive,
  repeatorScope,
  setCurrentMountedRoute,
} from '../scope';


type VirtualNodeTagType = 'TAG' | 'TEXT' | 'COMMENT';

type VirtualNodeType = {
  isVirtualNode: boolean;
  id: string;
  type: VirtualNodeTagType;
  name?: string;
  void?: boolean;
  attrs?: Record<string, string>;
  content?: string;
  children: Array<VirtualNodeType>;
  props?: any;
  route: Array<number>;
  processed: boolean;
};

type VirtualDOMActionsType =
  | 'ADD_NODE'
  | 'REMOVE_NODE'
  | 'REPLACE_NODE'
  | 'ADD_ATTRIBUTE'
  | 'REMOVE_ATTRIBUTE'
  | 'REPLACE_ATTRIBUTE';

type VirtualDOMDiffType = {
  action: VirtualDOMActionsType;
  route: Array<number>;
  oldValue: VirtualNodeType | Record<string, number | string | boolean>;
  nextValue: VirtualNodeType | Record<string, number | string | boolean>;
};

type ElementReplacerType<T> = {
  type:
    | 'STATEFULL_COMPONENT'
    | 'STATELESS_COMPONENT'
    | 'LIST'
    | 'REPEAT_DIRECTIVE'
    | 'INSERT_DIRECTIVE'
    | 'QUEUE_EVENTS';
  value: T;
};

const commentPattern = /<\!--(.*)-->/;
const attrPattern = /([\w-:]+)|["]{1}([^"]*)["]{1}/gi;
const tagPattern = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/gi;
const textPattern = /^\s*$/;
const voidTagsMap = {
  br: true,
  hr: true,
  img: true,
  input: true,
  link: true,
  meta: true,
  area: true,
  base: true,
  col: true,
  command: true,
  embed: true,
  keygen: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
};
const voidAttrsMap = {
  checked: true,
  selected: true,
  disabled: true,
  multiple: true,
  required: true,
  autofocus: true,
  hidden: true,
};

function createVirtualNode(type: VirtualNodeTagType, config: Record<string, any> = {}) {
  return {
    isVirtualNode: true,
    id: '',
    name: null,
    void: false,
    attrs: {},
    children: [],
    route: [],
    props: {},
    processed: false,
    ...config,
    type,
  };
}

function createTextNode(content: string): VirtualNodeType {
  return createVirtualNode(VDOM_ELEMENT_TYPES.TEXT as VirtualNodeTagType, {
    void: true,
    content,
  });
}

function createCommentNode(content: string): VirtualNodeType {
  return createVirtualNode(VDOM_ELEMENT_TYPES.COMMENT as VirtualNodeTagType, {
    void: true,
    content,
  });
}

function createElement(tag: string): VirtualNodeType {
  let tagReplaced = false;
  let key = '';
  const element = createVirtualNode(VDOM_ELEMENT_TYPES.TAG as VirtualNodeTagType);

  const replaceTag = (match: string) => {
    if (!tagReplaced) {
      if (voidTagsMap[match] || tag[tag.length - 2] === '/') {
        element.void = true;
      }

      element.name = match;
      tagReplaced = true;
    } else if (!/["]/g.test(match)) {
      key = match;
      if (voidAttrsMap[key]) {
        element.attrs[key] = true;
      }
    } else {
      element.attrs[key] = match.replace(/["]/g, '');
    }

    return '';
  };

  if (commentPattern.test(tag)) {
    const content = tag.match(commentPattern)[1];

    return createCommentNode(content);
  }

  tag.replace(attrPattern, replaceTag);

  return element;
}

function createVirtualDOMFromSource(source: string): Array<VirtualNodeType> {
  const result = [];
  const buffer = [];
  let element = null;
  let level = -1;
  const replaceSource = (tag: string, idx: number) => {
    const isOpen = tag[1] !== '/';
    const nextIdx = idx + tag.length;
    const nextChar = source[nextIdx];
    let parent = null;

    if (isOpen) {
      level++;
      element = createElement(tag);

      if (element.void === false && nextChar && nextChar !== '<') {
        const content = source.slice(nextIdx, source.indexOf('<', nextIdx));

        element.children.push(createTextNode(content));
      }

      if (level === 0) {
        result.push(element);
      }

      parent = buffer[level - 1] || null;

      if (parent) {
        parent.children.push(element);
      }

      buffer[level] = element;
    }

    if (!isOpen || element.void === true) {
      level--;

      if (nextChar !== '<' && nextChar) {
        parent = level === -1 ? result : buffer[level].children;

        const end = source.indexOf('<', nextIdx);
        const content = source.slice(nextIdx, end === -1 ? undefined : end);

        if (!textPattern.test(content)) {
          parent.push(createTextNode(content));
        }
      }
    }

    return '';
  };

  source.replace(tagPattern, replaceSource);

  if (source && typeof source === 'string' && result.length === 0) {
    result.push(createTextNode(source));
  }

  return result;
}

function createDiffAction(
  action: string,
  route: Array<number> = [],
  oldValue: any,
  nextValue: any,
): VirtualDOMDiffType {
  return {
    action: action as VirtualDOMActionsType,
    route,
    oldValue,
    nextValue,
  };
}

function getVirtualDOMDiff(
  VDOM: VirtualNodeType,
  nextVDOM: VirtualNodeType,
  prevDiff: Array<VirtualDOMDiffType> = [],
  prevRoute: Array<number> = [],
  level: number = 0,
  idx: number = 0,
): Array<VirtualDOMDiffType> {
  let diff = [...prevDiff];
  const route = [...prevRoute];
  const key = getNodeKey(VDOM);
  const nextKey = getNodeKey(nextVDOM);

  route[level] = idx;

  if (!VDOM && !nextVDOM) return diff;

  if (!VDOM) {
    diff.push(createDiffAction(VDOM_ACTIONS.ADD_NODE, route, null, nextVDOM));
    return diff;
  } else if (!nextVDOM || (!isEmpty(key) && !isEmpty(nextKey) && key !== nextKey)) {
    diff.push(createDiffAction(VDOM_ACTIONS.REMOVE_NODE, route, VDOM, null));
    return diff;
  } else if (
    VDOM.type !== nextVDOM.type ||
    VDOM.name !== nextVDOM.name ||
    VDOM.content !== nextVDOM.content ||
    key !== nextKey
  ) {
    diff.push(createDiffAction(VDOM_ACTIONS.REPLACE_NODE, route, VDOM, nextVDOM));
    return diff;
  } else {
    if (VDOM.attrs && nextVDOM.attrs) {
      const mapOldAttr = (attrName: string) => {
        if (attrName === ATTR_KEY) return;
        if (isEmpty(nextVDOM.attrs[attrName])) {
          diff.push(
            createDiffAction(
              VDOM_ACTIONS.REMOVE_ATTRIBUTE,
              route,
              createAttribute(attrName, VDOM.attrs[attrName]),
              null,
            ),
          );
        } else if (nextVDOM.attrs[attrName] !== VDOM.attrs[attrName]) {
          const diffAction = createDiffAction(
            VDOM_ACTIONS.REPLACE_ATTRIBUTE,
            route,
            createAttribute(attrName, VDOM.attrs[attrName]),
            createAttribute(attrName, nextVDOM.attrs[attrName]),
          );

          diff.push(diffAction);
        }
      };
      const mapNewAttr = (attrName: string) => {
        if (attrName === ATTR_KEY) return;
        if (isEmpty(VDOM.attrs[attrName])) {
          diff.push(
            createDiffAction(
              VDOM_ACTIONS.ADD_ATTRIBUTE,
              route,
              null,
              createAttribute(attrName, nextVDOM.attrs[attrName]),
            ),
          );
        }
      };

      Object.keys(VDOM.attrs).forEach(mapOldAttr);
      Object.keys(nextVDOM.attrs).forEach(mapNewAttr);
    }

    level++;

    const iterateVDOM = (vNode: VirtualNodeType, nextVNode: VirtualNodeType) => {
      const iterations = Math.max(vNode.children.length, nextVNode.children.length);

      for (let i = 0; i < iterations; i++) {
        const childVNode = VDOM.children[i];
        const childNextVNode = nextVDOM.children[i];
        const key = getNodeKey(childVNode);
        const nextKey = getNodeKey(childNextVNode);

        if (childVNode && childVNode.processed) continue;

        diff = [...getVirtualDOMDiff(childVNode, childNextVNode, diff, route, level, i)];

        childVNode && (childVNode.processed = true);

        if (!isEmpty(key) && !isEmpty(nextKey) && key !== nextKey) {
          VDOM.children.splice(i, 1);
          iterateVDOM(VDOM, nextVDOM);
          break;
        }
      }
    };

    iterateVDOM(VDOM, nextVDOM);
  }

  return diff;
}

function buildVirtualNodeWithRoutes(
  node: VirtualNodeType,
  prevRoute: Array<number> = [],
  level: number = 0,
  idx: number = 0,
  withExistsRoute: boolean = false,
): VirtualNodeType {
  const iterations = node.children.length;

  node.route = [...prevRoute];

  if (!withExistsRoute) {
    node.route[level] = idx;

    if (iterations > 0) {
      level++;
    }
  }

  for (let i = 0; i < iterations; i++) {
    node.children[i] = buildVirtualNodeWithRoutes(node.children[i], node.route, level, i);
  }

  return node;
}

let isDirectiveMounted = false;

function transformTemplateStringToVirtualDOM(str: TemplateStringsArray, ...args: Array<any>): VirtualNodeType | Array<VirtualNodeType> {
  const separator = NODE_SEPARATOR;
  let markup = str.join(separator);
  let sourceVNodeList: Array<VirtualNodeType> = null;
  let vNodeList: Array<VirtualNodeType> = null;
  const currentRoute = getCurrentMountedRoute();
  const uid = getUIDActive();
  const app = getRegistery().get(uid);
  const elements: Array<ElementReplacerType<any>> = [];
  const eventMap = new Map();
  const mapArgsFn = (arg: any, argIdx: number) => {
    let replacer = '';

    if (isStatefullComponent(arg)) {
      const componentFactory = arg as StatefullComponentFactoryType;
      replacer = createCommentStr(STATEFULL_COMPONENT_REPLACER);
      elements.push({ type: STATEFULL_COMPONENT, value: componentFactory });
    } else if (isStatelessComponent(arg)) {
      const componentFactory = arg as StatelessComponentFactoryType;
      replacer = createCommentStr(STATELESS_COMPONENT_REPLACER);
      elements.push({ type: STATELESS_COMPONENT, value: componentFactory });
    } else if (isInsertDirective(arg)) {
      replacer = createCommentStr(INSERT_DIRECTIVE_REPLACER);
      elements.push({ type: INSERT_DIRECTIVE, value: arg });
    } else if (isRepeatDirective(arg)) {
      replacer = createCommentStr(REPEAT_DIRECTIVE_REPLACER);
      elements.push({ type: REPEAT_DIRECTIVE, value: arg });
    } else if (isArray(arg)) {
      replacer = createCommentStr(LIST_REPLACER);
      elements.push({ type: LIST, value: arg });
    } else if (isFunction(arg)) {
      replacer = EVENT_HANDLER_REPLACER;
      const findFactoryFn = (a: any) => (isArray(a) ? isStatelessComponent(a[0]) : isStatelessComponent(a));
      const slicedArgs = args.slice(0, argIdx).reverse();
      const stateless = slicedArgs.find(findFactoryFn);

      if (stateless) {
        const fn = isArray(stateless) ? stateless[0] : stateless;
        !eventMap.get(fn) && eventMap.set(fn, []);
        eventMap.get(fn).push(() => app.eventHandlersCache.push(arg));
      } else {
        app.eventHandlersCache.push(arg);
      }
    } else if (isEmpty(arg) || arg === false) {
      replacer = createCommentStr(EMPTY_REPLACER);
    } else {
      replacer = arg;
    }

    markup = markup.replace(separator, replacer);
  };

  args.forEach(mapArgsFn);
  elements.push({ type: QUEUE_EVENTS, value: eventMap });
  sourceVNodeList = createVirtualDOMFromSource(markup);
  const mapNodeRoutes = (vNode: VirtualNodeType, idx: number) =>
    buildVirtualNodeWithRoutes(vNode, currentRoute, currentRoute.length, idx, isDirectiveMounted);
  const mapNodes = (vNode: VirtualNodeType) => mountVirtualDOM(vNode, elements);
  const mapNodeListRoutes = (vNode: VirtualNodeType | Array<VirtualNodeType>, idx: number) => {
    if (isArray(vNode)) {
      const list = (vNode as Array<VirtualNodeType>)
        .map((transitVNode, idx) => buildVirtualNodeWithRoutes(transitVNode, currentRoute, currentRoute.length, idx, isDirectiveMounted));

      return flatten(list);
    }

    return buildVirtualNodeWithRoutes(vNode as VirtualNodeType, currentRoute, currentRoute.length, idx, isDirectiveMounted);
  };

  vNodeList = sourceVNodeList
    .map(mapNodeRoutes)
    .map(mapNodes)
    .map(mapNodeListRoutes) as Array<VirtualNodeType>;

  return vNodeList.length > 1 ? vNodeList : vNodeList[0];
}

function mountVirtualDOM(
  mountedVNode: VirtualNodeType,
  elements: Array<ElementReplacerType<any>>,
  parentVNode: VirtualNodeType = null,
): VirtualNodeType | Array<VirtualNodeType> {
  const isTag = isTagVirtualNode(mountedVNode);
  const isComment = isCommentVirtualNode(mountedVNode);
  const children = isTag ? [...mountedVNode.children] : [];
  const findQueueEventsFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === QUEUE_EVENTS;

  setCurrentMountedRoute(mountedVNode.route);
  mountedVNode.id = getNodeId(mountedVNode.route);

  setTimeout(() => repeatorScope.reset());

  if (isComment) {
    const textContent = mountedVNode.content;

    if (textContent === INSERT_DIRECTIVE_REPLACER) {
      isDirectiveMounted = true;
      const findElementFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === INSERT_DIRECTIVE;
      const findVNodeFn = (vNode: VirtualNodeType) =>
        vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === INSERT_DIRECTIVE_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode && parentVNode.children.findIndex(findVNodeFn);
      const insertDirective = elements[elementIdx].value as InsertDirectiveType;
      const nextVNode = insertDirective.createElement();

      isDirectiveMounted = false;

      if (parentVNode) {
        const list = (isArray(nextVNode) ? [...nextVNode] : [nextVNode]) as Array<VirtualNodeType>;
        parentVNode.children.splice(vNodeIdx, 1, ...list);
      } else {
        return nextVNode as VirtualNodeType;
      }
    } else if (textContent === REPEAT_DIRECTIVE_REPLACER) {
      const findElementFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === REPEAT_DIRECTIVE;
      const findVNodeFn = (vNode: VirtualNodeType) =>
        vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === REPEAT_DIRECTIVE_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode && parentVNode.children.findIndex(findVNodeFn);
      const repeatDirective = elements[elementIdx].value as RepeatDirectiveType;
      const mapRepeatItems = (item: any, idx: number): VirtualNodeType => {
        isDirectiveMounted = true;
        let element = null;
        const route = [...repeatorScope.getRoute(), repeatorScope.getIdx()];
        const nodeId = getNodeId(repeatorScope.getRoute(), repeatorScope.getIdx());

        setCurrentMountedRoute(route);
        element = repeatDirective.createElement(item, idx);

        if (isVirtualNode(element)) {
          const isList = isArray(element);
          if (!isList) {
            element.id = nodeId;
            repeatorScope.incrementIdx();
          }

          isDirectiveMounted = false;

          return element;
        } else if (isStatelessComponent(element)) {
          const componentFactory = element as StatelessComponentFactoryType;
          const key = componentFactory.props[ATTR_KEY];
          const vNode = componentFactory.createElement();
          const isList = isArray(vNode);

          if (!isList) {
            !isEmpty(key) && setAttribute(vNode, ATTR_KEY, key);
            vNode.id = nodeId;
            repeatorScope.incrementIdx();
          }

          isDirectiveMounted = false;

          return vNode;
        }

        isDirectiveMounted = false;

        return element;
      };

      repeatorScope.setRoute(mountedVNode.route);

      const vNodeList = flatten(repeatDirective.items.map(mapRepeatItems));

      elements.splice(elementIdx, 1);

      if (parentVNode) {
        const slicedVNodeListLeft = parentVNode.children.slice(0, vNodeIdx);
        const slicedVNodeListRight = parentVNode.children.slice(vNodeIdx + 1);
        parentVNode.children = [...slicedVNodeListLeft, ...vNodeList, ...slicedVNodeListRight];
      } else {
        return vNodeList;
      }
    } else if (textContent === LIST_REPLACER) {
      isDirectiveMounted = true;
      const findElementFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === LIST;
      const findVNodeFn = (vNode: VirtualNodeType) =>
        vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === LIST_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode && parentVNode.children.findIndex(findVNodeFn);
      const list = elements[elementIdx].value;
      const lastRouteIdx = mountedVNode.route[mountedVNode.route.length - 1];
      const slicedRoute = mountedVNode.route.slice(0, -1);
      const mapListItemFn = (item: any, idx: number) => {
        const route = [...slicedRoute, lastRouteIdx + idx];
        setCurrentMountedRoute(route);
        return transformTemplateStringToVirtualDOM`${item}`;
      };
      const vNodeList = list.map(mapListItemFn);

      isDirectiveMounted = false;
      elements.splice(elementIdx, 1);

      if (parentVNode) {
        const slicedVNodeListLeft = parentVNode.children.slice(0, vNodeIdx);
        const slicedVNodeListRight = parentVNode.children.slice(vNodeIdx + 1);
        const mapVNodeFn = (vNode: VirtualNodeType) => (vNode.route[vNode.route.length - 1] += list.length - 1);

        slicedVNodeListRight.forEach(mapVNodeFn);
        parentVNode.children = [...slicedVNodeListLeft, ...vNodeList, ...slicedVNodeListRight];
      } else {
        return vNodeList;
      }
    } else if (textContent === STATELESS_COMPONENT_REPLACER) {
      isDirectiveMounted = true;
      const findElementFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === STATELESS_COMPONENT;
      const findVNodeFn = (vNode: VirtualNodeType) =>
        vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === STATELESS_COMPONENT_REPLACER;
      const mapFn = (fn: Function) => fn();
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode && parentVNode.children.findIndex(findVNodeFn);
      const factory = elements[elementIdx].value as StatelessComponentFactoryType;
      const queueEventsIdx = elements.findIndex(findQueueEventsFn);
      const queueEvents = elements[queueEventsIdx].value.get(factory) || [];
      let nextVNode = null;
      let isList = false;

      nextVNode = factory.createElement();

      if (isNull(nextVNode)) {
        nextVNode = createCommentNode(EMPTY_REPLACER);
        nextVNode.route = mountedVNode.route;
      } else if (isArray(nextVNode)) {
        isList = true;
      } else {
        nextVNode.route = mountedVNode.route;
      }

      elements.splice(elementIdx, 1);
      queueEvents.forEach(mapFn);
      isDirectiveMounted = false;

      if (parentVNode) {
        if (isList) {
          parentVNode.children.splice(vNodeIdx, 1, ...nextVNode);
        } else {
          parentVNode.children[vNodeIdx] = nextVNode;
        }
      } else {
        return nextVNode;
      }
    }
  }

  const mapChildNodesFn = (vNode: VirtualNodeType) => mountVirtualDOM(vNode, elements, mountedVNode);

  children.forEach(mapChildNodesFn);

  return mountedVNode;
}

function isVirtualNode(node: any) {
  return typeof node === 'object' && node.isVirtualNode === true;
}

function isTagVirtualNode(vNode: VirtualNodeType): boolean {
  return vNode.type === VDOM_ELEMENT_TYPES.TAG;
}

function isCommentVirtualNode(vNode: VirtualNodeType): boolean {
  return vNode.type === VDOM_ELEMENT_TYPES.COMMENT;
}

function createAttribute(name: string, value: string | number | boolean) {
  return {
    [name]: value,
  };
}

function getAttribute(vNode: VirtualNodeType, attrName: string): string {
  return vNode && vNode.type === VDOM_ELEMENT_TYPES.TAG && !isEmpty(vNode.attrs[attrName])
    ? vNode.attrs[attrName]
    : null;
}

function setAttribute(vNode: VirtualNodeType, name: string, value: any) {
  vNode.type === VDOM_ELEMENT_TYPES.TAG && (vNode.attrs[name] = value);
}

function removeAttribute(vNode: VirtualNodeType, name: string) {
  vNode.type === VDOM_ELEMENT_TYPES.TAG && delete vNode.attrs[name];
}

function getNodeKey(vNode: VirtualNodeType): string {
  return getAttribute(vNode, ATTR_KEY);
}

function createCommentStr(str: string): string {
  return `<!--${str}-->`;
}

function getNodeId(route: Array<number>, idx?: number, key?: string): string {
  const base = route.join('.');
  const id = !isEmpty(idx)
    ? !isEmpty(key)
      ? `${base}:${idx}:${key}`
      : `${base}:${idx}`
    : !isEmpty(key)
    ? `${base}:${key}`
    : base;

  return id;
}

function getVirtualDOM(uid: number): VirtualNodeType {
  return { ...getRegistery().get(uid).vdom };
}

export {
  VirtualNodeTagType, //
  VirtualNodeType,
  VirtualDOMActionsType,
  VirtualDOMDiffType,
  ElementReplacerType,
  createVirtualNode,
  createTextNode,
  createCommentNode,
  createElement,
  isVirtualNode,
  createVirtualDOMFromSource,
  getVirtualDOM,
  getVirtualDOMDiff,
  getAttribute,
  setAttribute,
  removeAttribute,
  buildVirtualNodeWithRoutes,
  mountVirtualDOM,
  isTagVirtualNode,
  transformTemplateStringToVirtualDOM,
};
