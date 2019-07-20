import {
  ComponentTreeType,
  StatefullComponentFactoryType,
  StatelessComponentFactoryType,
  ComponentType,
  getComponentTree,
  unmountComponent,
  getComponentId,
  isStatefullComponent,
  isStatelessComponent,
} from '../../../core/component/component';
import {
  AppType,
  getUIDActive,
  getRegistery,
  getCurrentMountedComponentId,
  setCurrentMountedComponentId,
  setUIDActive,
  getCurrentMountedRoute,
  setCurrentMountedRoute,
} from '../../../core/scope/scope';
import { isObject, isEmpty, isArray, isFunction, isUndefined, deepClone, flatten } from '../../../helpers';
import { isRef } from '../../../core/ref';
import {
  $$root,
  $$markedIDMap,
  $$id,
  $$uid,
  EVENT_HANDLER_REPLACER,
  VDOM_ELEMENT_TYPES,
  ATTR_ROOT_APP,
  ATTR_REF,
  ATTR_COMPONENT_ID,
  ATTR_COMPONENT_NAME,
  ATTR_KEY,
  ATTR_FRAGMENT,
  VDOM_ACTIONS,
} from '../../../core/constants/constants';
import {
  VirtualNodeType,
  VirtualDOMActionsType,
  VirtualDOMDiffType,
  ElementReplacerType,
  createVirtualDOMFromSource,
  mountVirtualDOM,
  getVirtualDOM,
  getComponentVirtualNodeById,
  buildVirtualNodeWithRoutes,
  setAttribute,
  getVirtualDOMDiff,
  isVirtualNode,
  getAttribute,
  removeAttribute,
	isTagVirtualNode,
	transformTemplateStringToVirtualDOM,
} from '../../../core/vdom/vdom';
import { makeEvents } from '../events/events';
import { defragment } from '../../../core/fragment/fragment';


type ProcessDOMOptionsType = {
  vNode: VirtualNodeType;
  nextVNode: VirtualNodeType;
  container?: HTMLElement;
  fragment?: boolean;
}

function dom(string: TemplateStringsArray, ...args: Array<any>): VirtualNodeType | Array<VirtualNodeType> {
  const vNode = transformTemplateStringToVirtualDOM(string, ...args);

  return vNode;
}

function mount(
  vdom: VirtualNodeType | Array<VirtualNodeType>,
  parentNode: HTMLElement = null
): HTMLElement | Text | Comment {
  let container: HTMLElement | Text | Comment = parentNode;
  const attrValueBlackList = [EVENT_HANDLER_REPLACER];
  const mapVDOM = (vNode: VirtualNodeType) => {
    if (!vNode) return;

    const isContainerExists = container && container.nodeType === Node.ELEMENT_NODE;

    if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
      const DOMElement = document.createElement(vNode.name);
      const mapAttrs = (attrName: string) =>
        !attrValueBlackList.includes(vNode.attrs[attrName]) && DOMElement.setAttribute(attrName, vNode.attrs[attrName]);

      Object.keys(vNode.attrs).forEach(mapAttrs);

      if (isContainerExists) {
        container.appendChild(DOMElement);
        if (!vNode.void) {
          const node = mount(vNode.children, DOMElement) as HTMLElement;
          container.appendChild(node);
        }
      } else {
        container = DOMElement;
        container = mount(vNode.children, container);
      }
    } else if (vNode.type === VDOM_ELEMENT_TYPES.TEXT) {
      if (isContainerExists) {
        container.appendChild(document.createTextNode(vNode.content));
      } else {
        container = document.createTextNode(vNode.content);
      }
    } else if (vNode.type === VDOM_ELEMENT_TYPES.COMMENT) {
      if (isContainerExists) {
        container.appendChild(document.createComment(vNode.content));
      } else {
        container = document.createComment(vNode.content);
      }
    }
  };

  if (isArray(vdom)) {
    const mapVNodeFn = (vNode: VirtualNodeType) => mapVDOM(vNode);
    (vdom as Array<VirtualNodeType>).forEach(mapVNodeFn);
  } else {
    mapVDOM(vdom as VirtualNodeType);
  }

  return container;
}

function getDOMElementRoute(
  sourceDOMElement: HTMLElement,
  targetDOMElement: HTMLElement,
  prevRoute: Array<number> = [],
  level: number = 0,
  idx: number = 0,
  stop: boolean = false
): [Array<number>, boolean] {
  const children = Array.from(sourceDOMElement.childNodes);
  let route = [...prevRoute];

  route[level] = idx;
  level++;

  if (targetDOMElement === sourceDOMElement) {
    route = route.slice(0, level);

    return [route, true];
  }

  for (let i = 0; i < children.length; i++) {
    const childSourceDOMElement = sourceDOMElement.childNodes[i] as HTMLElement;
    let [nextRoute, nextStop] = getDOMElementRoute(childSourceDOMElement, targetDOMElement, route, level, i, stop);

    if (nextStop) return [nextRoute, nextStop];
  }

  return [route, stop];
}

function getNodeByDiffElement(parentNode: HTMLElement, diffElement: VirtualDOMDiffType) {
  let node = parentNode;
  const { action, route, oldValue, nextValue } = diffElement;
  const isRoot = route.length === 1;

  if (isRoot) {
    const isVNodeTag = isTagVirtualNode(oldValue as VirtualNodeType);
    const isNextVNodeTag = isTagVirtualNode(nextValue as VirtualNodeType);

    if ((!isVNodeTag && isNextVNodeTag) || (!isVNodeTag && !isNextVNodeTag)) {
      node = node.childNodes[0] as HTMLElement;
    }

    return node;
  }

  const mapRoute = (routeId: number, idx: number, arr: Array<number>) => {
    if (idx > 0) {
      if (action === VDOM_ACTIONS.ADD_NODE && idx === arr.length - 1) return;

      if (action === VDOM_ACTIONS.REMOVE_NODE) {
        node = (node.childNodes[routeId] || node.childNodes[node.childNodes.length - 1]) as HTMLElement;
        return;
      }

      node = node.childNodes[routeId] as HTMLElement;
    }
  };

  route.forEach(mapRoute);

  return node;
}

function getDOMElementByRoute(parentNode: HTMLElement, route: Array<number> = []): HTMLElement {
  let node = parentNode;
  const mapRoute = (cIdx: number, idx: number) =>
    idx === 0 ? node : (node = node ? (node.childNodes[cIdx] as HTMLElement) : node);

  route.forEach(mapRoute);

  return node;
}

function patchDOM(diff: Array<VirtualDOMDiffType>, $node: HTMLElement, uid: number) {
  const mapDiff = (diffElement: VirtualDOMDiffType) => {
    const node = getNodeByDiffElement($node, diffElement);

    if (diffElement.action === VDOM_ACTIONS.ADD_NODE) {
      const newNode = mount(diffElement.nextValue as VirtualNodeType);
      node.appendChild(newNode);
    } else if (diffElement.action === VDOM_ACTIONS.REMOVE_NODE) {
      const componentId = getComponentId(diffElement.oldValue as VirtualNodeType);
      componentId && unmountComponent(componentId, uid);
      node.parentNode.removeChild(node);
    } else if (diffElement.action === VDOM_ACTIONS.REPLACE_NODE) {
      const newNode = mount(diffElement.nextValue as VirtualNodeType);
      const componentId = getComponentId(diffElement.oldValue as VirtualNodeType);
      componentId && unmountComponent(componentId, uid);
      node.replaceWith(newNode);
    } else if (diffElement.action === VDOM_ACTIONS.ADD_ATTRIBUTE) {
      const attrValueBlackList = [EVENT_HANDLER_REPLACER];
      const mapAttrs = (attrName: string) =>
        !attrValueBlackList.includes(diffElement.nextValue[attrName]) &&
        node.setAttribute(attrName, diffElement.nextValue[attrName]);
      Object.keys(diffElement.nextValue).forEach(mapAttrs);
    } else if (diffElement.action === VDOM_ACTIONS.REMOVE_ATTRIBUTE) {
      const mapAttrs = (attrName: string) => node.removeAttribute(attrName);
      Object.keys(diffElement.oldValue).forEach(mapAttrs);
    } else if (diffElement.action === VDOM_ACTIONS.REPLACE_ATTRIBUTE) {
      const mapAttrs = (attrName: string) => {
        const value = diffElement.nextValue[attrName];

        node.setAttribute(attrName, diffElement.nextValue[attrName]);

        if (node.nodeName.toLowerCase() === 'input') {
          const input = node as HTMLInputElement;

          if (input.type.toLowerCase() === 'text' && attrName === 'value') {
            input.value = value;
          } else if (input.type.toLowerCase() === 'checkbox' && attrName === 'checked') {
            input.checked = value;
          }
        }
      };

      Object.keys(diffElement.nextValue).forEach(mapAttrs);
    }
  };

  diff.forEach(mapDiff);
}

function processDOM({ vNode = null, nextVNode = null, container = null, fragment = false }: ProcessDOMOptionsType) {
  const uid = getUIDActive();
  const app = getRegistery().get(uid);
  const isRoot = nextVNode.route.length === 1;
  const getDOMElement = () => {
    if (container) return container;
    if (fragment) return app.nativeElement;

    const isVNodeTag = isTagVirtualNode(vNode);
    const isNextVNodeTag = isTagVirtualNode(nextVNode);

    if (isRoot && ((!isVNodeTag && isNextVNodeTag) || (!isVNodeTag && !isNextVNodeTag))) {
      return app.nativeElement;
    }

    return app.nativeElement.children[0] as HTMLElement;
  };
  const DOMElement = getDOMElement();
  let diff = [];

  app.queue.push(() => makeEvents(nextVNode, uid));
  nextVNode = defragment(nextVNode);
  diff = getVirtualDOMDiff(vNode, nextVNode);

  patchDOM(diff, DOMElement, uid);

  app.queue.forEach(fn => fn());
  app.queue = [];
  app.vdom = nextVNode;
}

function forceUpdate(instance: ComponentType, params = { beforeRender: () => {}, afterRender: () => {} }) {
  const { beforeRender, afterRender } = params;
  const id = instance[$$id];
  const uid = instance[$$uid];

  instance[$$markedIDMap] = {};
  setCurrentMountedComponentId(id);
  setUIDActive(instance[$$uid]);

  beforeRender();
  //processDOM({});
  afterRender();
}

export {
	ElementReplacerType,
	dom,
	mount,
	getDOMElementRoute,
	getDOMElementByRoute,
	patchDOM,
	processDOM,
	forceUpdate
};
