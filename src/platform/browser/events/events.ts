import { EVENT_HANDLER_REPLACER, VDOM_ELEMENT_TYPES } from '../../../core/constants/constants';
import { getRegistery } from '../../../core/scope/scope';
import { getVirtualDOM, VirtualNodeType } from '../../../core/vdom';
import { isFunction } from '../../../helpers';
import { getDOMElementByRoute } from '../dom/dom';

function makeEvents(vNode: VirtualNodeType, uid: number) {
  const app = getRegistery().get(uid);
  const rootDOMElement = app.nativeElement;

  if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
    const filterNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.TAG;
    const getKey = (key: any) => key;
    const attrNames = Object.keys(vNode.attrs).map(getKey) || [];
    const chidren = vNode.children.filter(filterNodeFn);
    const mapAttrsFn = (attrName: string) => {
      if (vNode.attrs[attrName] === EVENT_HANDLER_REPLACER && /^on:/.test(attrName)) {
        const node = getDOMElementByRoute(rootDOMElement, [...vNode.route]);
        const eventName = attrName.slice(3, attrName.length);
        const handler = app.eventHandlersCache[0];

        delegateEvent(rootDOMElement, uid, node, eventName, handler);
        app.eventHandlersCache.splice(0, 1);
      }
    };
    const mapNodesFn = (vNode: VirtualNodeType) => makeEvents(vNode, uid);

    attrNames.forEach(mapAttrsFn);
    chidren.forEach(mapNodesFn);
  }
}

function delegateEvent(
  rootDOMElement: HTMLElement,
  uid: number,
  node: HTMLElement,
  eventName: string,
  handler: (e: Event) => void,
) {
  const app = getRegistery().get(uid);
  const eventHandler = (e: Event) => node === e.target && handler(e);

  if (!app.eventHandlers.get(node)) {
    app.eventHandlers.set(node, {});
  }

  if (!app.eventHandlers.get(node)[eventName]) {
    app.eventHandlers.get(node)[eventName] = {
      addEvent: null,
      removeEvent: null,
    };
  }

  isFunction(app.eventHandlers.get(node)[eventName].removeEvent) &&
    app.eventHandlers.get(node)[eventName].removeEvent();

  app.eventHandlers.get(node)[eventName] = {
    addEvent: () => rootDOMElement.addEventListener(eventName, eventHandler),
    removeEvent: () => rootDOMElement.removeEventListener(eventName, eventHandler),
  };

  app.eventHandlers.get(node)[eventName].addEvent();
}

export { makeEvents, delegateEvent };
