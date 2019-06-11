import { HashMap } from '../shared';
import {
  $$id,
  STATEFULL_COMPONENT_REPLACER,
  STATEFULL_COMPONENT,
  STATEFULL_COMPONENT_LIST,
  STATEFULL_COMPONENT_LIST_REPLACER,
  STATELESS_COMPONENT_REPLACER,
  STATELESS_COMPONENT,
  STATELESS_COMPONENT_LIST_REPLACER,
  STATELESS_COMPONENT_LIST,
  NODE,
  NODE_REPLACER,
  NODE_LIST,
  NODE_LIST_REPLACER,
  ATTR_COMPONENT_ID,
	ATTR_KEY,
	ATTR_DONT_UPDATE_NODE,
	ATTR_PORTAL_ID,
  VDOM_ELEMENT_TYPES,
  VDOM_ACTIONS,
  QUEUE_EVENTS
} from '../constants';
import { isEmpty, isFunction, deepClone } from '../../helpers';
import {
  getUIDActive,
  getRegistery,
  getCurrentMountedComponentId
} from '../scope';
import {
  StatefullComponentFactoryType,
  StatelessComponentFactoryType,
  ComponentType,
  getComponentId,
  getPublicInstance,
  wire
} from '../component';


type VirtualNodeTagType = 'TAG' | 'TEXT' | 'COMMENT';

type VirtualNodeType = {
  isVirtualNode: boolean;
  type: VirtualNodeTagType;
  name?: string;
  void?: boolean;
  attrs?: HashMap<string>;
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
  oldValue: VirtualNodeType | HashMap<number | string | boolean>;
  nextValue: VirtualNodeType | HashMap<number | string | boolean>;
};

type ElementReplacerType<T> = {
  type:
    | 'NODE'
    | 'NODE_LIST'
    | 'STATEFULL_COMPONENT'
    | 'STATEFULL_COMPONENT_LIST'
    | 'STATELESS_COMPONENT'
    | 'STATELESS_COMPONENT_LIST'
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
  wbr: true
};
const voidAttrsMap = {
  checked: true,
  selected: true,
  disabled: true,
  multiple: true,
  required: true,
  autofocus: true,
  hidden: true
};

function createTextNode(content: string): VirtualNodeType {
  return {
    type: VDOM_ELEMENT_TYPES.TEXT as VirtualNodeTagType,
    isVirtualNode: true,
    void: true,
    attrs: null,
    name: null,
    children: [],
		route: [],
		processed: false,
    content
  };
}

function createCommentNode(content: string): VirtualNodeType {
  return {
    type: VDOM_ELEMENT_TYPES.COMMENT as VirtualNodeTagType,
    isVirtualNode: true,
    void: true,
    name: null,
    attrs: null,
    children: [],
		route: [],
		processed: false,
    content
  };
}

function createElement(tag: string): VirtualNodeType {
  let tagReplaced = false;
  let key = '';
  const element = {
    isVirtualNode: true,
    type: VDOM_ELEMENT_TYPES.TAG as VirtualNodeTagType,
    name: null,
    void: false,
    attrs: {},
    children: [],
		route: [],
		processed: false
  };

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
      element.attrs[key] = match.replace(/["]/g, "");
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

function isVirtualNode(node: VirtualNodeType) {
	return typeof node === 'object' &&  node.isVirtualNode === true; 
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

  return result;
}

function getVirtualDOM(uid: number): VirtualNodeType {
  return { ...getRegistery().get(uid).vdom };
}

function createDiffAction(
  action: string,
  route: Array<number> = [],
  oldValue: any,
  nextValue: any
): VirtualDOMDiffType {
  return {
    action: action as VirtualDOMActionsType,
    route,
    oldValue,
    nextValue
  };
}

function createAttribute(name: string, value: string | number | boolean) {
  return {
    [name]: value
  };
}

function getAttribute(vNode: VirtualNodeType, attrName: string): string {
  return vNode &&
    vNode.type === VDOM_ELEMENT_TYPES.TAG &&
    !isEmpty(vNode.attrs[attrName])
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

function getVirtualDOMDiff(
  VDOM: VirtualNodeType,
  nextVDOM: VirtualNodeType,
  includePortals: boolean = false,
  targetNextVDOM: VirtualNodeType = null,
  prevDiff: Array<VirtualDOMDiffType> = [],
  prevRoute: Array<number> = [],
  level: number = 0,
  idx: number = 0
): Array<VirtualDOMDiffType> {
  let diff = [...prevDiff];
	const route = [...prevRoute];
	const key = getNodeKey(VDOM);
	const nextKey = getNodeKey(nextVDOM);

  if (isEmpty(targetNextVDOM)) {
    targetNextVDOM = { ...nextVDOM };
  }

  route[level] = idx;

  if (getAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE)) {
    removeAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE);
    return diff;
  }

  if (!VDOM && !nextVDOM) return diff;

  if (
    !includePortals &&
    (Boolean(getAttribute(VDOM, ATTR_PORTAL_ID)) ||
      Boolean(getAttribute(nextVDOM, ATTR_PORTAL_ID)))
  ) {
    return diff;
  }

  if (!VDOM) {
    diff.push(createDiffAction(VDOM_ACTIONS.ADD_NODE, route, null, nextVDOM));
    return diff;
  } else if (!nextVDOM || (key !== nextKey)) {
    diff.push(createDiffAction(VDOM_ACTIONS.REMOVE_NODE, route, VDOM, null));
    return diff;
  } else if (
    VDOM.type !== nextVDOM.type ||
    VDOM.name !== nextVDOM.name ||
    VDOM.content !== nextVDOM.content
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
              null
            )
          );
        } else if (nextVDOM.attrs[attrName] !== VDOM.attrs[attrName]) {
          const diffAction = createDiffAction(
            VDOM_ACTIONS.REPLACE_ATTRIBUTE,
            route,
            createAttribute(attrName, VDOM.attrs[attrName]),
            createAttribute(attrName, nextVDOM.attrs[attrName])
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
              createAttribute(attrName, nextVDOM.attrs[attrName])
            )
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

				if (childVNode.processed) continue;

        if (getAttribute(childNextVNode, ATTR_DONT_UPDATE_NODE)) {
          removeAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE);
          continue;
        }

        diff = [
          ...getVirtualDOMDiff(
            childVNode,
            childNextVNode,
            includePortals,
            targetNextVDOM,
            diff,
            route,
            level,
            i
          )
				];

				childVNode.processed = true;

				if (key !== nextKey) {
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
  withExistsRoute: boolean = false
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
    node.children[i] = buildVirtualNodeWithRoutes(
      node.children[i],
      node.route,
      level,
      i
    );
  }

  return node;
}

function mountVirtualDOM(
  mountedVNode: VirtualNodeType,
  elements: Array<ElementReplacerType<any>>,
  parentVNode: VirtualNodeType = null
): VirtualNodeType {
  const uid = getUIDActive();
  const isBlockNode = mountedVNode.type === VDOM_ELEMENT_TYPES.TAG;
  const isCommentNode = mountedVNode.type === VDOM_ELEMENT_TYPES.COMMENT;
  const children = isBlockNode ? mountedVNode.children : [];

  if (isCommentNode) {
    const textContent = mountedVNode.content;

    if (textContent === NODE_REPLACER) {
      const findElementFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === NODE;
      const findVNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === NODE_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
      const nextVNode = elements[elementIdx].value;

      elements.splice(elementIdx, 1);
      parentVNode.children[vNodeIdx] = nextVNode;
    } else if (textContent === NODE_LIST_REPLACER) {
      const findElementFn = (e: ElementReplacerType<Array<HTMLElement>>) => e.type === NODE_LIST;
      const findVNodeFn = (vNode: VirtualNodeType) =>
        vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === NODE_LIST_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
      const nodeList = elements[elementIdx].value;
      const mapNodesFn = (vNode: VirtualNodeType) => parentVNode.children.push(vNode);

      elements.splice(elementIdx, 1);
      nodeList.forEach(mapNodesFn);
      parentVNode.children.splice(vNodeIdx, 1);
    } else if (textContent === STATEFULL_COMPONENT_REPLACER) {
      const findElementFn = (e: ElementReplacerType<StatefullComponentFactoryType>) =>  e.type === STATEFULL_COMPONENT;
      const findVNodeFn = (n: VirtualNodeType) => n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === STATEFULL_COMPONENT_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode ? parentVNode.children.findIndex(findVNodeFn) : 0;
      const componentFactory = elements[elementIdx].value as StatefullComponentFactoryType;
      const nextVNode = wire(componentFactory);

      if (isFunction(componentFactory.mountPortal)) {
        const id = getComponentId(nextVNode);
        elements.splice(elementIdx, 1);
        componentFactory.mountPortal(id, nextVNode);
      } else if (parentVNode) {
        elements.splice(elementIdx, 1);
        parentVNode.children[vNodeIdx] = nextVNode;
      } else {
        elements.splice(elementIdx, 1);
        mountedVNode = nextVNode;
      }
    } else if (textContent === STATEFULL_COMPONENT_LIST_REPLACER) {
      const findElementFn = (e: ElementReplacerType<Array<StatefullComponentFactoryType>>) => e.type === STATEFULL_COMPONENT_LIST;
      const findVNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === STATEFULL_COMPONENT_LIST_REPLACER;
      const id = getCurrentMountedComponentId();
      const vdom = getVirtualDOM(uid);
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
      const componentFactoryList = elements[elementIdx].value;
      const instance: ComponentType = componentFactoryList
        ? getPublicInstance(
            uid,
            componentFactoryList[0].props.key,
            componentFactoryList[0]
          )
        : null;
      const parentPrevVNode = getRootParentVirtualNode(
        instance[$$id],
        getComponentVirtualNodeById(id, vdom)
      );
      const shift = parentVNode.children.length;
      const filterNodesFn = (vNode: VirtualNodeType) => {
        const hasSameKey = (componentFactory: StatefullComponentFactoryType) =>
          componentFactory.props.key === getAttribute(vNode, ATTR_KEY);
        return (
          Boolean(getAttribute(vNode, ATTR_COMPONENT_ID)) &&
          componentFactoryList.some(hasSameKey)
        );
      };
      const children =
        parentPrevVNode && parentPrevVNode.children
          ? parentPrevVNode.children.filter(filterNodesFn)
          : [];
      const mapFactoryList = (
        componentFactory: StatefullComponentFactoryType,
        idx: number
      ) => {
        const runComponent = () =>
          parentVNode.children.push(wire(componentFactory));

        if (componentFactory.config.pure) {
          const elementIdx = idx + shift;
          const prevVNode = children[idx] || null;
          const props = prevVNode ? prevVNode.props : null;
          const nextProps = componentFactory.props;

          if (Boolean(props)) {
            const propNames = Array.from(Object.keys(props));
            let isEquals = true;

            for (const propName of propNames) {
              if (props[propName] !== nextProps[propName]) {
                isEquals = false;
                break;
              }
            }

            if (isEquals) {
              parentVNode.children[elementIdx] = prevVNode;
            } else {
              runComponent();
            }
          } else {
            runComponent();
          }
        } else {
          runComponent();
        }
      };

      elements.splice(elementIdx, 1);
      componentFactoryList.forEach(mapFactoryList);
      parentVNode.children.splice(vNodeIdx, 1);
    } else if (textContent === STATELESS_COMPONENT_REPLACER) {
      const findElementFn = (e: ElementReplacerType<VirtualNodeType>) => e.type === STATELESS_COMPONENT;
      const findVNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === STATELESS_COMPONENT_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
      const factory = elements[elementIdx].value as StatelessComponentFactoryType;
      const nextVNode = factory.createElement();
      const queueEventsIdx = elements.findIndex(e => e.type === QUEUE_EVENTS);
      const queueEvents = elements[queueEventsIdx].value.get(factory) || [];

      elements.splice(elementIdx, 1);
      parentVNode.children[vNodeIdx] = nextVNode;
      queueEvents.forEach(fn => fn());
    } else if (textContent === STATELESS_COMPONENT_LIST_REPLACER) {
      const findElementFn = (e: ElementReplacerType<Array<HTMLElement>>) => e.type === STATELESS_COMPONENT_LIST;
      const findVNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.COMMENT && vNode.content === STATELESS_COMPONENT_LIST_REPLACER;
      const elementIdx = elements.findIndex(findElementFn);
      const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
      const factoryList = elements[elementIdx].value;
      const mapFactoryFn = (componentFactory: StatelessComponentFactoryType) => {
				const createdVNode = componentFactory.createElement();
				const key = componentFactory.props[ATTR_KEY];

				!isEmpty(key) && setAttribute(createdVNode, ATTR_KEY, key);
				parentVNode.children.push(createdVNode);
			};
      const queueEventsIdx = elements.findIndex(e => e.type === QUEUE_EVENTS);
      const queueEvents = elements[queueEventsIdx].value.get(factoryList[0]) || [];

      elements.splice(elementIdx, 1);
      factoryList.forEach(mapFactoryFn);
      queueEvents.forEach(fn => fn());
      parentVNode.children.splice(vNodeIdx, 1);
    }
  }

	const mapChildNodesFn = (vNode: VirtualNodeType) => mountVirtualDOM(vNode, elements, mountedVNode);

  children.forEach(mapChildNodesFn);

  return mountedVNode;
}

function getRootParentVirtualNode(
  id: string,
  vNode: VirtualNodeType,
  parentVNode: VirtualNodeType = null
): VirtualNodeType {
  if (getAttribute(vNode, ATTR_COMPONENT_ID) === id) {
    return parentVNode;
  }

  if (!vNode || !vNode.children) return null;

  for (let childVNode of vNode.children) {
    parentVNode = getRootParentVirtualNode(id, childVNode, vNode);

    if (parentVNode) return parentVNode;
  }

  return null;
}

function getComponentVirtualNodeById(
  id: string,
  vNode: VirtualNodeType
): VirtualNodeType {
  if (Object.keys(vNode).length === 0) return null;

  const compareId = getAttribute(vNode, ATTR_COMPONENT_ID) || '';

  if (Boolean(compareId === id)) return vNode;

  for (let vChildNode of vNode.children) {
    const vNode = getComponentVirtualNodeById(id, vChildNode);

    if (vNode) return vNode;
  }

  return null;
}

export {
  VirtualNodeTagType,
  VirtualNodeType,
  VirtualDOMActionsType,
  VirtualDOMDiffType,
  ElementReplacerType,
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
  getComponentVirtualNodeById,
  mountVirtualDOM
}
