import {
  ComponentType,
  isStatefullComponent,
  isStatelessComponent,
  StatefullComponentFactoryType,
  StatelessComponentFactoryType,
  unmountComponent,
} from '../../../core/component/component';
import {
  $$id,
  $$markedIDMap,
  $$root,
  $$uid,
  ATTR_COMPONENT_ID,
  ATTR_COMPONENT_NAME,
  ATTR_FRAGMENT,
  ATTR_KEY,
  ATTR_REF,
  ATTR_ROOT_APP,
  EVENT_HANDLER_REPLACER,
  VDOM_ACTIONS,
  VDOM_ELEMENT_TYPES,
} from '../../../core/constants/constants';
import { defragment } from '../../../core/fragment/fragment';
import { isRef } from '../../../core/ref';
import {
  AppType,
  getCurrentMountedComponentId,
  getCurrentMountedRoute,
  getRegistery,
  getUIDActive,
  setCurrentMountedComponentId,
  setCurrentMountedRoute,
  setUIDActive,
} from '../../../core/scope/scope';
import {
  buildVirtualNodeWithRoutes,
  createVirtualDOMFromSource,
  ElementReplacerType,
  getAttribute,
  getVirtualDOM,
  getVirtualDOMDiff,
  isTagVirtualNode,
  isVirtualNode,
  mountVirtualDOM,
  removeAttribute,
  setAttribute,
  transformTemplateStringToVirtualDOM,
  VirtualDOMActionsType,
  VirtualDOMDiffType,
  VirtualNodeType,
} from '../../../core/vdom/vdom';
import { deepClone, flatten, isArray, isEmpty, isFunction, isObject, isUndefined } from '../../../helpers';
import { makeEvents } from '../events/events';


type ProcessDOMOptionsType = {
  vNode: VirtualNodeType;
  nextVNode: VirtualNodeType;
  container?: HTMLElement;
  fragment?: boolean;
}

function dom(str: TemplateStringsArray, ...args: any[]): VirtualNodeType | VirtualNodeType[] {
  const vNode = transformTemplateStringToVirtualDOM(str, ...args);

  return vNode;
}

function mount(
  vdom: VirtualNodeType | VirtualNodeType[],
  parentNode: HTMLElement = null,
): HTMLElement | Text | Comment {
  let container: HTMLElement | Text | Comment | null = parentNode || null;
  const attrValueBlackList = [EVENT_HANDLER_REPLACER];
  const mapVDOM = (vNode: VirtualNodeType) => {
    if (!vNode) {
      return;
    }

    const isContainerExists = Boolean(container) && container.nodeType === Node.ELEMENT_NODE;

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
        const node = mount(vNode.children, DOMElement) as HTMLElement;
        container = node;
      }
    } else if (vNode.type === VDOM_ELEMENT_TYPES.TEXT) {
      const textNode = document.createTextNode(vNode.content);
      if (isContainerExists) {
        container.appendChild(textNode);
      } else {
        container = textNode;
      }
    } else if (vNode.type === VDOM_ELEMENT_TYPES.COMMENT) {
      const commentNode = document.createComment(vNode.content);
      if (isContainerExists) {
        container.appendChild(commentNode);
      } else {
        container = commentNode;
      }
    }
  };
  const mapVNodeFn = (vNode: VirtualNodeType) => mapVDOM(vNode);

  if (isArray(vdom)) {
    (vdom as VirtualNodeType[]).forEach(mapVNodeFn);
  } else {
    mapVDOM(vdom as VirtualNodeType);
  }

  return container;
}

function getDOMElementRoute(
  sourceDOMElement: HTMLElement,
  targetDOMElement: HTMLElement,
  prevRoute: number[] = [],
  level: number = 0,
  idx: number = 0,
  stop: boolean = false,
): [number[], boolean] {
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
    const [nextRoute, nextStop] = getDOMElementRoute(childSourceDOMElement, targetDOMElement, route, level, i, stop);

    if (nextStop) {
      return [nextRoute, nextStop];
    }
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

  const mapRoute = (routeId: number, idx: number, arr: number[]) => {
    if (idx > 0) {
      if (action === VDOM_ACTIONS.ADD_NODE && idx === arr.length - 1) {
        return;
      }

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

function getDOMElementByRoute(parentNode: HTMLElement, route: number[] = []): HTMLElement {
  let node = parentNode;
  const mapRoute = (cIdx: number, idx: number) =>
    idx === 0 ? node : (node = node ? (node.childNodes[cIdx] as HTMLElement) : node);

  route.forEach(mapRoute);

  return node;
}

function patchDOM(diff: VirtualDOMDiffType[], $node: HTMLElement, uid: number) {
  const mapDiff = (diffElement: VirtualDOMDiffType) => {
    const node = getNodeByDiffElement($node, diffElement);

    if (diffElement.action === VDOM_ACTIONS.ADD_NODE) {
      const newNode = mount(diffElement.nextValue as VirtualNodeType);
      node.appendChild(newNode);
    } else if (diffElement.action === VDOM_ACTIONS.REMOVE_NODE) {
      node.parentNode.removeChild(node);
    } else if (diffElement.action === VDOM_ACTIONS.REPLACE_NODE) {
      const newNode = mount(diffElement.nextValue as VirtualNodeType);
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

function processDOM({ vNode = null, nextVNode = null, container = null }: ProcessDOMOptionsType) {
  const uid = getUIDActive();
  const app = getRegistery().get(uid);
  const getDOMElement = () => {
    if (container) return container;

    return app.nativeElement as HTMLElement;
  };
  const DOMElement = getDOMElement();
  let diff = [];

  app.queue.push(() => makeEvents(nextVNode, uid));
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
  // processDOM({});
  afterRender();
}

export {
  ElementReplacerType, //
  dom,
  mount,
  getDOMElementRoute,
  getDOMElementByRoute,
  patchDOM,
  processDOM,
  forceUpdate,
};
