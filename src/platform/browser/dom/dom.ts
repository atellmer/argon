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
	isRepeator
} from '../../../core/component/component';
import {
	AppType,
	getUIDActive,
	getRegistery,
	getCurrentMountedComponentId,
	setCurrentMountedComponentId,
	setUIDActive,
	getCurrentMountedRoute,
	setCurrentMountedRoute
} from '../../../core/scope/scope';
import {
	isObject,
	isEmpty,
	isArray,
	isFunction,
	isUndefined,
	deepClone,
	flatten
} from '../../../helpers';
import { isRef } from '../../../core/ref';
import {
	$$root,
	$$markedIDMap,
	$$id,
	$$uid,
	NODE_SEPARATOR,
	NODE,
	NODE_REPLACER,
	STATEFULL_COMPONENT,
	STATEFULL_COMPONENT_REPLACER,
	STATELESS_COMPONENT,
	STATELESS_COMPONENT_REPLACER,
	REPEATOR_REPLACER,
	REPEATOR,
	EVENT_HANDLER_REPLACER,
	QUEUE_EVENTS,
	EMPTY_REPLACER,
	VDOM_ELEMENT_TYPES,
	ATTR_ROOT_APP,
	ATTR_REF,
	ATTR_COMPONENT_ID,
	ATTR_COMPONENT_NAME,
	ATTR_KEY,
	ATTR_FRAGMENT,
	VDOM_ACTIONS
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
	removeAttribute
} from '../../../core/vdom/vdom';
import { makeEvents } from '../events/events';
import { defragment } from '../../../core/fragment/fragment';


type ProcessDOMOptionsType = {
	vNode: VirtualNodeType;
	nextVNode: VirtualNodeType;
	container?: HTMLElement;
	fragment?: boolean;
}

function createCommentStr(str: string): string {
	return `<!--${str}-->`;
}

function transformTemplateStringToVirtualDOM(string: TemplateStringsArray, args: Array<any>): VirtualNodeType | Array<VirtualNodeType> {
	const separator = NODE_SEPARATOR;
	let markup = string.join(separator);
	let sourceVNode: VirtualNodeType | Array<VirtualNodeType> = null;
	let vNode: VirtualNodeType | Array<VirtualNodeType> = null;
	const uid = getUIDActive();
	const app = getRegistery().get(uid);
	const elements: Array<ElementReplacerType<any>> = [];
	const eventMap = new Map();
	const currentRoute = getCurrentMountedRoute();
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
		}else if (isVirtualNode(arg)) {
			replacer = createCommentStr(NODE_REPLACER);
			elements.push({ type: NODE, value: arg });
		} else if (isRepeator(arg)) {
			replacer = createCommentStr(REPEATOR_REPLACER);
			elements.push({ type: REPEATOR, value: arg });
		} else if (isFunction(arg)) {
			replacer = EVENT_HANDLER_REPLACER;
			const findFactoryFn = (a: any) => isArray(a) ? isStatelessComponent(a[0]) : isStatelessComponent(a);
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
	sourceVNode = createVirtualDOMFromSource(markup);
	sourceVNode = sourceVNode.length > 1 ? sourceVNode : sourceVNode[0];
	
	if (isArray(sourceVNode)) {
		const transitVNodeList = (sourceVNode as Array<VirtualNodeType>).map(transitVNode => buildVirtualNodeWithRoutes(transitVNode, currentRoute, currentRoute.length, 0, true));
		vNode = mountVirtualDOMList(transitVNodeList, elements);
	} else {
		const transitVNode = sourceVNode as VirtualNodeType;
		sourceVNode = buildVirtualNodeWithRoutes(transitVNode, currentRoute, currentRoute.length, 0, true);
		//console.log('dom', deepClone(sourceVNode))
		vNode = mountVirtualDOM(sourceVNode as VirtualNodeType, elements);
	}

	//console.log('vNode', vNode)

	return vNode;
}

function mountVirtualDOMList(vNode: Array<VirtualNodeType>, elements: Array<ElementReplacerType<any>>): Array<VirtualNodeType> {
	const vNodeList = vNode as  Array<VirtualNodeType>;
	const replacers = [
		NODE_REPLACER,
		STATELESS_COMPONENT_REPLACER,
		STATEFULL_COMPONENT_REPLACER
	];
	const transitList = [...vNodeList];
	const mapVNodeFn = (vNode: VirtualNodeType) => {
		if (vNode.type === VDOM_ELEMENT_TYPES.COMMENT && replacers.includes(vNode.content)) {
			const findContentFn = (comparedVNode: VirtualNodeType) => comparedVNode.content === vNode.content;
			const idx = transitList.findIndex(findContentFn);
			const mountedVNode = mountVirtualDOM(vNode, elements);

			transitList[idx] = mountedVNode;
		}
	};
	const mapTransitVNodeFn = vNode => vNode = mountVirtualDOM(vNode, elements);

	vNodeList.forEach(mapVNodeFn);
	transitList.forEach(mapTransitVNodeFn);

	return transitList;
}

function dom(string: TemplateStringsArray, ...args: Array<any>): VirtualNodeType | Array<VirtualNodeType> {
	const vNode = transformTemplateStringToVirtualDOM(string, args);

	return vNode;
}

function mount(vdom: VirtualNodeType | Array<VirtualNodeType>, parentNode: HTMLElement = null): HTMLElement | Text | Comment {
	let container: HTMLElement | Text | Comment = parentNode;
	const attrValueBlackList = [EVENT_HANDLER_REPLACER];
	const mapVDOM = (vNode: VirtualNodeType) => {
		if (!vNode) return;

		const isContainerExists = container && container.nodeType === Node.ELEMENT_NODE;

		if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
			const DOMElement = document.createElement(vNode.name);
			const mapAttrs = (attrName: string) => !attrValueBlackList.includes(vNode.attrs[attrName]) && DOMElement.setAttribute(attrName, vNode.attrs[attrName]);

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
	}

	if (isArray(vdom)) {
		const mapVNodeFn = (vNode: VirtualNodeType) => mapVDOM(vNode);
		(vdom as Array<VirtualNodeType>).forEach(mapVNodeFn);
	} else {
		mapVDOM(vdom as VirtualNodeType);
	}

	return container;
}

function getDOMElementRoute(sourceDOMElement: HTMLElement, targetDOMElement: HTMLElement, prevRoute: Array<number> = [], level: number = 0, idx: number = 0, stop: boolean = false): [Array<number>, boolean] {
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


function getNodeByRoute($parentNode: HTMLElement, action: VirtualDOMActionsType, route: Array<number> = []) {
	let $node = $parentNode;
	const mapRoute = (cIdx: number, idx: number, arr: Array<number>) => {
		if (idx > 0) {
			if ((action === VDOM_ACTIONS.ADD_NODE) && idx === arr.length - 1) return;

			if (action === VDOM_ACTIONS.REMOVE_NODE) {
				$node = ($node.childNodes[cIdx] || $node.childNodes[$node.childNodes.length - 1]) as HTMLElement;
				return;
			}

			$node = $node.childNodes[cIdx] as HTMLElement;
		}
	};

	route.forEach(mapRoute);

	return $node;
}

function getDOMElementByRoute(parentNode: HTMLElement, route: Array<number> = []): HTMLElement {
	let node = parentNode;
	const mapRoute = (cIdx: number, idx: number) => idx === 0
		? node
		: node = node
			? node.childNodes[cIdx] as HTMLElement
			: node;

	route.forEach(mapRoute);

	return node;
}

function patchDOM(diff: Array<VirtualDOMDiffType>, $node: HTMLElement, uid: number) {
	const mapDiff = (diffElement: VirtualDOMDiffType) => {

		const node = getNodeByRoute($node, diffElement.action, diffElement.route);

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
			const mapAttrs = (attrName: string) => !attrValueBlackList.includes(diffElement.nextValue[attrName]) && node.setAttribute(attrName, diffElement.nextValue[attrName]);
			Object.keys(diffElement.nextValue).forEach(mapAttrs);
		} else if (diffElement.action === VDOM_ACTIONS.REMOVE_ATTRIBUTE) {
			const mapAttrs = (attrName: string) => node.removeAttribute(attrName);
			Object.keys(diffElement.oldValue).forEach(mapAttrs);
		} else if (diffElement.action === VDOM_ACTIONS.REPLACE_ATTRIBUTE) {
			const mapAttrs = (attrName: string) => {
				const value = diffElement.nextValue[attrName];

				node.setAttribute(attrName, diffElement.nextValue[attrName]);

				if (node.nodeName === 'INPUT') {
					const input = node as HTMLInputElement;

					if (input.type === 'text' && attrName === 'value') {
						input.value = value;
					} else if (input.type === 'checkbox' && attrName === 'checked') {
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
	const DOMElement = container || (fragment ? app.nativeElement : app.nativeElement.children[0]) as HTMLElement;
	let diff = [];

	app.queue.push(() => makeEvents(nextVNode, uid));
	nextVNode = defragment(nextVNode);
	diff = getVirtualDOMDiff(vNode, nextVNode);

	console.log('[diff]', diff);

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
}