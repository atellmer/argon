import {
	ComponentTreeType,
	StatefullComponentFactoryType,
	StatelessComponentFactoryType,
	ComponentType,
	getComponentTree,
	unmountComponent,
	getComponentId
} from '../../../core/component';
import {
	getUIDActive,
	getRegistery,
	getCurrentMountedComponentId,
	setCurrentMountedComponentId,
	setUIDActive
} from '../../../core/scope';
import {
	isObject,
	isEmpty,
	isArray,
	isFunction,
	isUndefined
} from '../../../helpers';
import { isRef } from '../../../core/ref';
import {
	$$root,
	$$eventHandlers,
	$$markedIDMap,
	$$id,
	$$uid,
	NODE_SEPARATOR,
	NODE,
	NODE_REPLACER,
	NODE_LIST,
	NODE_LIST_REPLACER,
	STATEFULL_COMPONENT,
	STATEFULL_COMPONENT_REPLACER,
	STATEFULL_COMPONENT_LIST,
	STATEFULL_COMPONENT_LIST_REPLACER,
	STATELESS_COMPONENT,
	STATELESS_COMPONENT_REPLACER,
	STATELESS_COMPONENT_LIST,
	STATELESS_COMPONENT_LIST_REPLACER,
	EVENT_HANDLER_REPLACER,
	EMPTY_REPLACER,
	VDOM_ELEMENT_TYPES,
	ATTR_REF,
	ATTR_COMPONENT_ID,
	ATTR_COMPONENT_NAME,
	ATTR_KEY,
	VDOM_ACTIONS
} from '../../../core/constants';
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
	isVirtualNode
} from '../../../core/vdom';
import { makeEvents } from '../events';


function dom(string: TemplateStringsArray, ...args: Array<any>) {
	const uid = getUIDActive();
	const app = getRegistery().get(uid);
	const separator = NODE_SEPARATOR;
	const elements: Array<ElementReplacerType<any>> = [];
	const componentTree: ComponentTreeType = getComponentTree(uid);
	const id = getCurrentMountedComponentId();
	let markup = string.join(separator);
	let sourceVNode = null;
	let vNode: VirtualNodeType = null;
	const componentTreeNode = componentTree[id];
	const instance = componentTreeNode.instance;
	const isStatefullComponent = (o: StatefullComponentFactoryType) => isObject(o) && !isEmpty(o) && (o as StatefullComponentFactoryType).isStatefullComponent === true;
	const isStatelessComponent = (o: StatelessComponentFactoryType) => isObject(o) && !isEmpty(o) && (o as StatelessComponentFactoryType).isStatelessComponent === true;
	
	const mapArgsFn = (arg: any) => {
		let replacer = '';

		if (isStatefullComponent(arg)) {
			const componentFactory = arg as StatefullComponentFactoryType;
			replacer = `<!--${STATEFULL_COMPONENT_REPLACER}-->`;
			componentFactory.uid = uid;
			elements.push({ type: STATEFULL_COMPONENT, value: componentFactory });
		} else if (isArray(arg) && isStatefullComponent(arg[0])) {
			const mapComponentsFn = (o: StatefullComponentFactoryType) => (o.uid = uid, o);
			const componentFactoryList = arg.map(mapComponentsFn);
			replacer = `<!--${STATEFULL_COMPONENT_LIST_REPLACER}-->`;
			elements.push({ type: STATEFULL_COMPONENT_LIST, value: componentFactoryList });
		} else if (isStatelessComponent(arg)) {
			const componentFactory = arg as StatelessComponentFactoryType;
			replacer = `<!--${STATELESS_COMPONENT_REPLACER}-->`;
			componentFactory.uid = uid;
			elements.push({ type: STATELESS_COMPONENT, value: componentFactory });
		} else if (isArray(arg) && isStatelessComponent(arg[0])) {
			const mapComponentsFn = (o: StatelessComponentFactoryType) => (o.uid = uid, o);
			const componentFactoryList = arg.map(mapComponentsFn);
			replacer = `<!--${STATELESS_COMPONENT_LIST_REPLACER}-->`;
			elements.push({ type: STATELESS_COMPONENT_LIST, value: componentFactoryList });
		} else if (isVirtualNode(arg)) {
			replacer = `<!--${NODE_REPLACER}-->`;
			elements.push({ type: NODE, value: arg });
		} else if (isArray(arg) && isVirtualNode(arg[0])) {
			replacer = `<!--${NODE_LIST_REPLACER}-->`;
			elements.push({ type: NODE_LIST, value: arg  });
		} else if (isFunction(arg)) {
			if (!isRef(arg)) {
				replacer = EVENT_HANDLER_REPLACER;
				instance[$$eventHandlers].push(arg);
			} else {
				const hasSameRef = (ref: Function, refs: Array<Function>) => {
					const isSameRef = (comparedRef: Function) => comparedRef === ref;
					return refs.some(isSameRef);
				};
				if (!hasSameRef(arg, app.refs)) {
					app.refs.push(arg);
				}
				replacer = (app.refs.length - 1).toString();
			}
		} else if (isEmpty(arg) || arg === false) {
			replacer = `<!--${EMPTY_REPLACER}-->`;
		} else {
			replacer = arg;
		}

		markup = markup.replace(separator, replacer);
	};

	args.forEach(mapArgsFn);

	sourceVNode = createVirtualDOMFromSource(markup);
	sourceVNode = sourceVNode.length > 1 ? sourceVNode : sourceVNode[0];

	vNode = mountVirtualDOM(sourceVNode, elements);

	return vNode;
}

function mount(vdom: VirtualNodeType | Array<VirtualNodeType>, parentNode: HTMLElement = null): HTMLElement | Text | Comment {
	let container: HTMLElement | Text | Comment = parentNode;
	const uid = getUIDActive();
	const mapVDOM = (vNode: VirtualNodeType) => {
		if (!vNode) return;

		if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
			const DOMElement = document.createElement(vNode.name);
			const mapAttrs = (attrName: string) => DOMElement.setAttribute(attrName, vNode.attrs[attrName]);

			Object.keys(vNode.attrs).forEach(mapAttrs);

			const refId = DOMElement.getAttribute(ATTR_REF);

			if (parseInt(refId) >= 0) {
				const refs = getRegistery().get(uid).refs;

				if (refs[refId]) {
					refs[refId](DOMElement);
				};

				DOMElement.removeAttribute(ATTR_REF);
			}

			if (container) {
				container.appendChild(DOMElement);
				!vNode.void && container.appendChild(mount(vNode.children, DOMElement));
			} else {
				container = DOMElement;
				container = mount(vNode.children, container);
			}
		} else if (vNode.type === VDOM_ELEMENT_TYPES.TEXT) {
			if (container) {
				container.appendChild(document.createTextNode(vNode.content));
			} else {
				container = document.createTextNode(vNode.content);
			}
		} else if (vNode.type === VDOM_ELEMENT_TYPES.COMMENT) {
			if (container) {
				container.appendChild(document.createComment(vNode.content));
			} else {
				container = document.createComment(vNode.content);
			}
		}
	}

	if (isArray(vdom)) {
		for(let vNode of vdom) {
			mapVDOM(vNode);
		}
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

function patchDOM(diff: Array<VirtualDOMDiffType>, $node: HTMLElement, uid: number, includePortals = false) {
	const mapDiff = (diffElement: VirtualDOMDiffType) => {
		if (includePortals) {
			diffElement.route.unshift(0);
		}

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
			const mapAttrs = (attrName: string) => node.setAttribute(attrName, diffElement.nextValue[attrName]);
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

function processDOM(id: string, uid: number, mountedVNode: VirtualNodeType = null, mountedNextVNode: VirtualNodeType = null, $container: HTMLElement = null, includePortals: boolean = false) {
	const componentTree = getComponentTree(uid);
	const vdom = getVirtualDOM(uid);
	const componentTreeNode = componentTree[id];
	const instance = componentTreeNode.instance;
	const parentId = instance[$$root] ? null : componentTreeNode.parentId;
	const app = getRegistery().get(uid);
	const $node = $container || (instance[$$root]
		? app.nativeElement.children[0] as HTMLElement
		: app.nativeElement.querySelector(`[${ATTR_COMPONENT_ID}="${id}"]`) as HTMLElement);
	const oldVNode = mountedVNode || getComponentVirtualNodeById(id, vdom);
	const parentVNode = parentId ? getComponentVirtualNodeById(parentId, vdom) : null;
	const findNodeFn = (vNode: VirtualNodeType) => vNode === oldVNode;
	const idx = parentVNode ? parentVNode.children.findIndex(findNodeFn) : 0;

	let newVNode = mountedNextVNode || instance.render();

	app.queue.push(() => {
		makeEvents(newVNode, id, uid);
	});

	const prevRoute = [...oldVNode.route];

	newVNode = buildVirtualNodeWithRoutes(newVNode, prevRoute, prevRoute.length, 0, true);
	app.queue.forEach(fn => fn());

	app.queue = [];

	if (newVNode.type === VDOM_ELEMENT_TYPES.TAG) {
		setAttribute(newVNode, ATTR_COMPONENT_ID, id);
		instance.displayName && setAttribute(newVNode, ATTR_COMPONENT_NAME, instance.displayName);
		!isUndefined(instance.props.key) && setAttribute(newVNode, ATTR_KEY, instance.props.key);
	}

	const diff = getVirtualDOMDiff(oldVNode, newVNode, includePortals);

	console.log('[diff]', diff)

	patchDOM(diff, $node, uid, includePortals);

	if (!$container) {
		if (parentVNode) {
			idx > 0 && (parentVNode.children[idx] = newVNode);
		} else {
			app.vdom = newVNode;
		}
	}

	instance[$$markedIDMap] = {};
}

function forceUpdate(instance: ComponentType, params = { beforeRender: () => {}, afterRender: () => {} }) {
	const { beforeRender, afterRender } = params;
	const id = instance[$$id];
	const uid = instance[$$uid];

	instance[$$markedIDMap] = {};
	setCurrentMountedComponentId(id);
	setUIDActive(instance[$$uid]);

	beforeRender();
	processDOM(id, uid);
	afterRender();
}


export {
	ElementReplacerType,
	dom,
	mount,
	getDOMElementRoute,
	patchDOM,
	processDOM,
	forceUpdate
}