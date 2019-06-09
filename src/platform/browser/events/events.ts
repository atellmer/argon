import { VirtualNodeType } from '../../../core/vdom';
import {
	getRegistery,
	getCurrentEventTargetId,
	setCurrentEventTargetId,
} from '../../../core/scope';
import {
	EVENT_HANDLER_REPLACER,
	ATTR_COMPONENT_ID,
	VDOM_ELEMENT_TYPES,
	$$eventHandlers
} from '../../../core/constants';
import { getComponentTree } from '../../../core/component';
import { getDOMElementRoute } from '../dom';


function makeEvents(vNode: VirtualNodeType, instanceID: string, uid: number) {
	const app = getRegistery().get(uid);
	const instance = getComponentTree(uid)[instanceID].instance;
	const rootEl = app.nativeElement;

	if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
		const filterNodeFn = (vNode: VirtualNodeType) => vNode.type === VDOM_ELEMENT_TYPES.TAG;
		const getKey = (key: any) => key;
		const attrNames = Object.keys(vNode.attrs).map(getKey) || [];
		const chidren = vNode.children.filter(filterNodeFn);
		const mapAttrsFn = (attrName: string) => {
			if (vNode.attrs[attrName] === EVENT_HANDLER_REPLACER && /^on:/.test(attrName)) {
				const nodeID = vNode.route.join('.');
				const key = `${instanceID}:${nodeID}`;
				const eventName = attrName.slice(3, attrName.length);
				const savedHandler = instance[$$eventHandlers][0];

				delegateEvent(rootEl, uid, key, nodeID, eventName, savedHandler);
				instance[$$eventHandlers].splice(0, 1);
				delete vNode.attrs[attrName];
			}
		};
		const mapNodesFn = (vNode: VirtualNodeType) => {
			const componentId = vNode.attrs[ATTR_COMPONENT_ID];
			const isComponentNode = Boolean(componentId);

			!isComponentNode && makeEvents(vNode, instanceID, uid);
		};

		attrNames.forEach(mapAttrsFn);
		chidren.forEach(mapNodesFn);
	}
}

function delegateEvent(rootEl: HTMLElement, uid: number, key: string, nodeID: string, eventName: string, handler: (e: Event) => void) {
	const app = getRegistery().get(uid);
	const eventHandler = (e: Event) => {
		let currentEventTargetId = getCurrentEventTargetId();

		if (!currentEventTargetId) {
			const [route] = getDOMElementRoute(rootEl, e.target as HTMLElement);

			route.shift();
			currentEventTargetId = route.join('.');
			setCurrentEventTargetId(currentEventTargetId);
		} 

		if (nodeID === currentEventTargetId) {
			setCurrentEventTargetId(null);
			handler(e);
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
