import { VirtualNodeType } from '../../../core/vdom';
import { getRegistery } from '../../../core/scope/scope';
import {
	EVENT_HANDLER_REPLACER,
	ATTR_COMPONENT_ID,
	VDOM_ELEMENT_TYPES
} from '../../../core/constants/constants';
import { getDOMElementByRoute } from '../dom/dom';
import { isFunction } from '../../../helpers';


function makeEvents(vNode: VirtualNodeType, uid: number) {
	const app = getRegistery().get(uid);
	const rootEl = app.nativeElement;

	if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
		const filterNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.TAG;
		const getKey = (key: any) => key;
		const attrNames = Object.keys(vNode.attrs).map(getKey) || [];
		const chidren = vNode.children.filter(filterNodeFn);
		const mapAttrsFn = (attrName: string) => {
			if (vNode.attrs[attrName] === EVENT_HANDLER_REPLACER && /^on:/.test(attrName)) {
				const node = getDOMElementByRoute(rootEl.children[0] as HTMLElement, [...vNode.route]);
				const eventName = attrName.slice(3, attrName.length);
				const handler = app.eventHandlersCache[0];

				delegateEvent(rootEl, uid, node, eventName, handler);
				app.eventHandlersCache.splice(0, 1);
			}
		};
		const mapNodesFn = (vNode: VirtualNodeType) => makeEvents(vNode, uid);

		attrNames.forEach(mapAttrsFn);
		chidren.forEach(mapNodesFn);
	}
}

function delegateEvent(rootEl: HTMLElement, uid: number, node: HTMLElement, eventName: string, handler: (e: Event) => void) {
	const app = getRegistery().get(uid);
	const eventHandler = (e: Event) => node === e.target && handler(e);

	if (!app.eventHandlers.get(node)) {
		app.eventHandlers.set(node, {});
	}

	if (!app.eventHandlers.get(node)[eventName]) {
		app.eventHandlers.get(node)[eventName] = {
			addEvent: null,
			removeEvent: null
		};
	}

	isFunction(app.eventHandlers.get(node)[eventName].removeEvent) && app.eventHandlers.get(node)[eventName].removeEvent();

	app.eventHandlers.get(node)[eventName] = {
		addEvent: () => rootEl.addEventListener(eventName, eventHandler),
		removeEvent: () => rootEl.removeEventListener(eventName, eventHandler)
	};

	app.eventHandlers.get(node)[eventName].addEvent();
}

export {
	makeEvents,
	delegateEvent
}
