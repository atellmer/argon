import { VirtualNodeType } from '../../../core/vdom';
import {
	getRegistery,
	getCurrentEventData,
	setCurrentEventData,
} from '../../../core/scope/scope';
import {
	EVENT_HANDLER_REPLACER,
	ATTR_COMPONENT_ID,
	VDOM_ELEMENT_TYPES
} from '../../../core/constants/constants';
import { getDOMElementRoute } from '../dom/dom';


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
				const route = vNode.route;
				const nodeId = route.join('.');
				const key = `${nodeId}`;
				const eventName = attrName.slice(3, attrName.length);
				const handler = app.eventHandlersCache[0];

				delegateEvent(rootEl, uid, key, nodeId, eventName, handler);
				app.eventHandlersCache.splice(0, 1);
				delete vNode.attrs[attrName];
			}
		};
		const mapNodesFn = (vNode: VirtualNodeType) => {
			const componentId = vNode.attrs[ATTR_COMPONENT_ID];
			const isComponentNode = Boolean(componentId);

			!isComponentNode && makeEvents(vNode, uid);
		};

		attrNames.forEach(mapAttrsFn);
		chidren.forEach(mapNodesFn);
	}
}

function delegateEvent(rootEl: HTMLElement, uid: number, key: string, nodeId: string, eventName: string, handler: (e: Event) => void) {
	const app = getRegistery().get(uid);
	const eventHandler = (e: Event) => {
		const target = e.target as HTMLElement;
		let { targetId, handlerIdx } = getCurrentEventData();
		const resetEventData = () => {
			setCurrentEventData({ targetId: null, handlersCount: 0, handlerIdx: 1 });
		}

		if (!targetId && rootEl.contains(target)) {
			const [route] = getDOMElementRoute(rootEl, target);

			route.shift();
			targetId = route.join('.');

			setCurrentEventData({
				eventName,
				targetId,
				handlersCount: Object
					.keys(app.eventHandlers)
					.map(key => app.eventHandlers[key])
					.filter(x => Boolean(x[eventName]))
					.length
			});
		}

		const { handlersCount } = getCurrentEventData();

		if (nodeId === targetId) {
			handler(e);
			resetEventData();
		}

		if (handlerIdx >= handlersCount) { 
			resetEventData();
		} else {
			setCurrentEventData({ handlerIdx: handlerIdx + 1 });
		}
	};

	if (!app.eventHandlers[key]) {
		app.eventHandlers[key] = {};
	}

	if (!app.eventHandlers[key][eventName]) {
		app.eventHandlers[key][eventName] = {
			addEvent: null,
			removeEvent: null
		};
	}

	app.eventHandlers[key][eventName].removeEvent && app.eventHandlers[key][eventName].removeEvent();

	app.eventHandlers[key][eventName] = {
		addEvent: () => rootEl.addEventListener(eventName, eventHandler),
		removeEvent: () => rootEl.removeEventListener(eventName, eventHandler)
	};

	app.eventHandlers[key][eventName].addEvent();
}

export {
	makeEvents,
	delegateEvent
}
