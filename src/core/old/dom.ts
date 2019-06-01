import {
	ComponentFactoryType,
	ComponentType,
	ComponentTreeType,
	ElementReplacerType,
	ComponentTreeNodeType,
	SnapshotType,
	SnapshotDiffType,
	VDOMNodeType,
	VDOMDiffType,
	VDOMActionsType
} from './types';
import {
	isFunction,
	isUndefined,
	isObject,
	isArray,
	isNull,
	isEmpty,
	error,
	sanitize,
	isVDOMNode,
	deepClone
} from '../helpers';
import {
	VDOM_ELEMENT_TYPES,
	COMPONENT_REPLACER,
	NODE_REPLACER,
	NODE_LIST_REPLACER,
	COMPONENT_LIST,
	NODE,
	NODE_LIST,
	COMPONENT,
	COMPONENT_LIST_REPLACER,
	EMPTY_REPLACER,
	NODE_SEPARATOR,
	EVENT_HANDLER_REPLACER,
	ATTR_COMPONENT_ID,
	ATTR_COMPONENT_NAME,
	ATTR_KEY,
	ATTR_REF,
	ATTR_IS_NODE,
	ATTR_DONT_UPDATE_NODE,
	AUTOGEN_INSTANCE_KEY,
	SNAPSHOT_DIFF,
	VDOM_ACTIONS,
	$$uid,
	$$id,
	$$root,
	$$prevProps,
	$$isMounted,
	$$name,
	$$cache,
	$$markedIDMap,
	$$orderedIDList,
	$$eventHandlers
} from './constants';
import {
	getRegistery,
	getUidActive,
	getCurrMountedComponentId,
	setCurrMountedComponentId
} from './scope';
import { makeEvents } from './events';
import { unmountComponent } from './component';
import {
	createVirtualDOMFromSource,
	createCommentNode,
	getVirtualDOM,
	getVDOMDiff,
	getAttribute,
	setAttribute,
	removeAttribute,
	buildNodeWithRoutes
} from './vdom';
import { isRef } from './ref';


function mount(vdom: VDOMNodeType | Array<VDOMNodeType>, parentNode: HTMLElement = null): HTMLElement | Text | Comment {
	let container: HTMLElement | Text | Comment = parentNode;
	const uid = getUidActive();
	const mapVDOM = (vNode: VDOMNodeType) => {
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
		mapVDOM(vdom as VDOMNodeType);
	}

	return container;
}

const getComponentTree = (uid: number): ComponentTreeType => ({ ...getRegistery().get(uid).componentTree });
const setComponentTree = (uid: number, componentTree: ComponentTreeType) => {
	const app = getRegistery().get(uid);

	app.componentTree = { ...componentTree };
};

function getVirtualDOMNodeByID(id: string, vNode: VDOMNodeType): VDOMNodeType {
	if (Object.keys(vNode).length === 0) return null;

	const compareId = getAttribute(vNode, ATTR_COMPONENT_ID) || '';

	if (Boolean(compareId === id)) return vNode;

	for (let vChildNode of vNode.children) {
		const vNode = getVirtualDOMNodeByID(id, vChildNode);

		if (vNode) return vNode;
	}

	return null;
}

function makeComponentTree(instance: ComponentType, parentId: string | null) {
	const componentTree = getComponentTree(instance[$$uid]);
	const parentNode = parentId ? componentTree[parentId] : null;
	const idx = parentNode && parentNode.lastChildId
		? (+(parentNode.lastChildId.replace(parentId + '.', '')) + 1).toString()
		: '0';
	const id = instance[$$id] || (parentNode ? `${parentId}.${idx}` : '0');

	if (id === '0' && componentTree[id] && componentTree[id].instance && componentTree[id].instance[$$isMounted]) {
		return componentTree;
	}

	if (!componentTree[id]) {
		instance[$$root] = !parentNode;
		instance[$$id] = id;

		componentTree[id] = {
			id,
			parentId,
			childrenIdMap: {},
			lastChildId: '',
			instance,
			prevSnapshot: null,
			snapshot: null
		};
	
		if (parentNode && !parentNode.childrenIdMap[id]) {
			parentNode.childrenIdMap[id] = true;
			parentNode.lastChildId = id;
		}
	}

	return componentTree;
}

function getNodeByRoute($parentNode: HTMLElement, action: VDOMActionsType, route: Array<number> = []) {
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

function getComponentId(vNode: VDOMNodeType) {
	let id = getAttribute(vNode, ATTR_COMPONENT_ID);

	if (id) return id;

	if (!vNode.children) return null;

	for(const childVNode of vNode.children) {
		id = getComponentId(childVNode);
	}

	return id;
}

function patchDOM(diff: Array<VDOMDiffType>, $node: HTMLElement, uid: number, includePortals = false) {
	const mapDiff = (diffElement: VDOMDiffType) => {
		if (includePortals) {
			diffElement.route.unshift(0);
		}

		const node = getNodeByRoute($node, diffElement.action, diffElement.route);
	
		if (diffElement.action === VDOM_ACTIONS.ADD_NODE) {
			const newNode = mount(diffElement.nextValue as VDOMNodeType);
			node.appendChild(newNode);
		} else if (diffElement.action === VDOM_ACTIONS.REMOVE_NODE) {
			const componentId = getComponentId(diffElement.oldValue as VDOMNodeType);
			componentId && unmountComponent(componentId, uid);
			node.parentNode.removeChild(node);
		} else if (diffElement.action === VDOM_ACTIONS.REPLACE_NODE) {
			const newNode = mount(diffElement.nextValue as VDOMNodeType);
			const componentId = getComponentId(diffElement.oldValue as VDOMNodeType);
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

			const findRemoveDiffFn = (diffElement: VDOMDiffType) => diffElement.action === VDOM_ACTIONS.REMOVE_NODE;
			const removedDiff = diff.find(findRemoveDiffFn);

			if (!removedDiff) {
				const componentId = diffElement.oldValue[ATTR_COMPONENT_ID];
				componentId && unmountComponent(componentId, uid);
			} else {
				const immRemoveRoute = [...removedDiff.route];
				const immElementRoute = [...diffElement.route];
	
				immRemoveRoute.pop();
				immElementRoute.pop();
	
				if (immRemoveRoute.toString() !== immElementRoute.toString() && diffElement.keyRoute.length === 0) {
					const componentId = diffElement.oldValue[ATTR_COMPONENT_ID];
					componentId && unmountComponent(componentId, uid);
				}
			}
		} 
	};

	diff.forEach(mapDiff);
}

function runDOMProcessor(id: string, uid: number, mountedVNode: VDOMNodeType = null, mountedNextVNode: VDOMNodeType = null, $container: HTMLElement = null, includePortals: boolean = false) {
	const componentTree = getComponentTree(uid);
	const vdom = getVirtualDOM(uid);
	const componentTreeNode = componentTree[id];
	const instance = componentTreeNode.instance;
	const parentId = instance[$$root] ? null : componentTreeNode.parentId;
	const app = getRegistery().get(uid);
	const $node = $container || (instance[$$root]
		? app.node.children[0] as HTMLElement
		: app.node.querySelector(`[${ATTR_COMPONENT_ID}="${id}"]`) as HTMLElement);
	const oldVNode = mountedVNode || getVirtualDOMNodeByID(id, vdom);
	const parentVNode = parentId ? getVirtualDOMNodeByID(parentId, vdom) : null;
	const findNodeFn = (vNode: VDOMNodeType) => vNode === oldVNode;
	const idx = parentVNode ? parentVNode.children.findIndex(findNodeFn) : 0;

	let newVNode = mountedNextVNode || instance.render();

	app.queue.push(() => {
		//console.log('callback for', newVNode)
		makeEvents(newVNode, id, uid);
	});

	const prevRoute = [...oldVNode.route];

	newVNode = buildNodeWithRoutes(newVNode, prevRoute, prevRoute.length, 0, true);
	app.queue.forEach(fn => fn());

	app.queue = [];

	if (newVNode.type === VDOM_ELEMENT_TYPES.TAG) {
		setAttribute(newVNode, ATTR_COMPONENT_ID, id);
		instance.displayName && setAttribute(newVNode, ATTR_COMPONENT_NAME, instance.displayName);
		!isUndefined(instance.props.key) && setAttribute(newVNode, ATTR_KEY, instance.props.key);
	}

	const diff = getVDOMDiff(oldVNode, newVNode, includePortals);

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

function getSnapshotDiff(prevSnapshot: SnapshotType, snapshot: SnapshotType, immutable: boolean = true, prevDiff: Array<SnapshotDiffType> = []): Array<SnapshotDiffType> {
	let diff: Array<SnapshotDiffType> = [...prevDiff];

	if (prevSnapshot && snapshot) {
		const { vdom: vNode } = prevSnapshot;
		const { vdom: nextVNode } = snapshot;
		const commentNode = (vNode: VDOMNodeType) => vNode.type === VDOM_ELEMENT_TYPES.COMMENT;
		const emptyReplacer = (vNode: VDOMNodeType) => vNode && commentNode(vNode) && vNode.content === EMPTY_REPLACER;
		const componentReplacer = (vNode: VDOMNodeType) => vNode && commentNode(vNode) && vNode.content === COMPONENT_REPLACER;
		const oldElements = immutable ? [...prevSnapshot.elements] : prevSnapshot.elements;
		const newElements = immutable ? [...snapshot.elements] : snapshot.elements;
		const findIdxComponentFn = (e: ElementReplacerType<any>) => e.type === COMPONENT;

		if (componentReplacer(vNode) && componentReplacer(nextVNode)) {
			const idx = oldElements.findIndex(findIdxComponentFn);

			diff.push({
				type: SNAPSHOT_DIFF.EQUALS,
				element: oldElements[idx]
			});
			oldElements.splice(idx, 1);
			newElements.splice(idx, 1);
		} else if (emptyReplacer(vNode) && componentReplacer(nextVNode)) {
			const idx = newElements.findIndex(findIdxComponentFn);

			diff.push({
				type: SNAPSHOT_DIFF.ADD,
				element: newElements[idx]
			});
			newElements.splice(idx, 1);
		} else if (componentReplacer(vNode) && emptyReplacer(nextVNode)) {
			const idx = oldElements.findIndex(findIdxComponentFn);

			diff.push({
				type: SNAPSHOT_DIFF.REMOVE,
				element: oldElements[idx]
			});
			oldElements.splice(idx, 1);
		}

		const vNodeChildrenCount = vNode && vNode.children ? vNode.children.length : 0;
		const nextVNodeChildrenCount = nextVNode && nextVNode.children ? nextVNode.children.length : 0;
		const iterations = Math.max(vNodeChildrenCount, nextVNodeChildrenCount);

		for (let i = 0; i < iterations; i++) {
			const childVNode = vNode && vNode.children && vNode.children[i] ? vNode.children[i] : null;
			const childNextVNode = nextVNode && nextVNode.children && nextVNode.children[i] ? nextVNode.children[i] : null;
			const prevSnapsot = createSnapshot(childVNode, oldElements, false);
			const snapshot = createSnapshot(childNextVNode, newElements, false);

			diff = getSnapshotDiff(prevSnapsot, snapshot, false, diff);
		}
	}

	return diff;
}

function patchSnapshotDiff(
	componentTreeNodeForCheck: ComponentTreeNodeType,
	handlers: {
		onHasKey?: () => void,
		onAdd?: () => void,
		onEquals?: (instance: ComponentType) => void
	} = {
		onHasKey: () => {},
		onAdd: () => {},
		onEquals: () => {}
	}) {
		const {
			onHasKey,
			onAdd,
			onEquals
		} = handlers;
		const instanceForCheck = componentTreeNodeForCheck.instance;
		const hasKey = getAttribute(componentTreeNodeForCheck.snapshot.vdom, ATTR_KEY);

		if (hasKey) return onHasKey();

		const snapshotDiff = [...componentTreeNodeForCheck.snapshotDiff];

		if (!snapshotDiff || snapshotDiff.length === 0) return;

		const patch = (diff: SnapshotDiffType) => {
			const componentFactory = diff.element.value;

			if (diff.type === SNAPSHOT_DIFF.EQUALS) {
				const instanceMap = instanceForCheck[$$cache].get(componentFactory.getComponentSymbol());
				const instanceList: Array<ComponentType> = Array.from(instanceMap.values());
				const orderedIDList = instanceForCheck[$$orderedIDList];
				const id = orderedIDList[0];
				let instance: ComponentType = null;

				instance = id
					? instanceList.find(instance => instance[$$id] === id)
					: instanceList.find(instance => !instanceForCheck[$$markedIDMap][instance[$$id]]);

				if (instance) {
					instanceForCheck[$$markedIDMap][instance[$$id]] = true;
					instanceForCheck[$$orderedIDList].splice(0, 1);

					return onEquals && onEquals(instance);
				}
			} else if (diff.type === SNAPSHOT_DIFF.ADD) {
				return onAdd && onAdd();
			} else if (diff.type === SNAPSHOT_DIFF.REMOVE) {
				const findRemoveIdxFn = (d: SnapshotDiffType) => d.type === SNAPSHOT_DIFF.REMOVE;
				const idx = snapshotDiff.findIndex(findRemoveIdxFn);

				idx !== -1 && instanceForCheck[$$orderedIDList].splice(idx, 1);
				snapshotDiff.splice(0, 1);
				componentTreeNodeForCheck.snapshotDiff = snapshotDiff;
				patchSnapshotDiff(componentTreeNodeForCheck, {
					onHasKey,
					onAdd,
					onEquals
				});
			}
		};

		patch(snapshotDiff[0]);
		snapshotDiff.splice(0, 1);
		componentTreeNodeForCheck.snapshotDiff = snapshotDiff;
}

function getPublicInstance(uid: number, initialKey: any, componentFactory: ComponentFactoryType) {
	const componentTree = getComponentTree(uid);
	const parentId = getCurrMountedComponentId();
	const rootComponentTreeNode = componentTree['0'];
	const rootInstance = rootComponentTreeNode ? rootComponentTreeNode.instance : null;
	const parentComponentTreeNode = parentId ? componentTree[parentId] : null;
	const parentInstance = parentComponentTreeNode ? parentComponentTreeNode.instance : null;
	const createAutoKey = (parentInstance: ComponentType, componentSymbol: Symbol) => {
		let id = 0;
		const instanceList = parentInstance[$$cache].get(componentSymbol)
			? Array.from(parentInstance[$$cache].get(componentSymbol).values())
			: [];
		const lastInstance = instanceList[instanceList.length - 1];

		if (lastInstance) {
			const splitted = lastInstance[$$id].split('.');

			id = +(splitted[splitted.length - 1]) + 1;
		}

		return `${AUTOGEN_INSTANCE_KEY}_${id}`;
	};
	const getKey = (initialKey: any, parentInstance: ComponentType) => isEmpty(initialKey) ? createAutoKey(parentInstance, componentFactory.getComponentSymbol()) : initialKey;
	const getInstance = (parentInstance: ComponentType, componentFactory: ComponentFactoryType, initialKey: any) => {
		if (parentInstance) {
			const key = getKey(initialKey, parentInstance);
			const componentSymbol = componentFactory.getComponentSymbol();
			let cmpMap = null;
	
			if (!parentInstance[$$cache].get(componentSymbol)) {
				parentInstance[$$cache].set(componentSymbol, new Map());
			}
	
			cmpMap = parentInstance[$$cache].get(componentSymbol);
	
			if (!cmpMap.get(key)) {
				cmpMap.set(key, componentFactory.createInstance());
			}
	
			return cmpMap.get(key);
		}
	
		return rootInstance || componentFactory.createInstance();
	}

	if (!isEmpty(initialKey)) {
		return getInstance(parentInstance, componentFactory, initialKey);
	}

	let piblicInstance = null;

	if (parentComponentTreeNode && parentComponentTreeNode.snapshot) {
		patchSnapshotDiff(parentComponentTreeNode, {
			onHasKey: () => {
				piblicInstance = getInstance(parentInstance, componentFactory, initialKey);
			},
			onAdd: () => {
				piblicInstance = getInstance(parentInstance, componentFactory, initialKey);
			},
			onEquals: (instance: ComponentType) => {
				piblicInstance = instance;
			}
		});
	}

	if (piblicInstance) return piblicInstance;
	
	return getInstance(parentInstance, componentFactory, initialKey);
}

function wire(componentFactory: ComponentFactoryType): VDOMNodeType {
	const uid = componentFactory.uid;
	const app = getRegistery().get(uid);
	const sanitizedProps = sanitize(componentFactory.props);
	const { key, ref } = sanitizedProps;
	const instance: ComponentType = getPublicInstance(uid, key, componentFactory);
	let componentTree = null;
	let vNode: VDOMNodeType = null;
	let id = null;

	instance[$$uid] = uid;
	instance[$$prevProps] = { ...instance.props };
	instance[$$eventHandlers] = [];

	if (!instance[$$isMounted]) {
		componentTree = makeComponentTree(instance, getCurrMountedComponentId());
		setComponentTree(uid, componentTree);
		instance.willMount();
	}

	const setId = (instance: ComponentType) => {
		if (!instance[$$root]) {
			const id = instance[$$id].split('.').slice(0, -1).join('.');
	
			setCurrMountedComponentId(id);
		}
	};
	const reduceProps = (acc, key) => (acc[key] = sanitizedProps[key], acc);
	const getProps = () => Object.keys(sanitizedProps).reduce(reduceProps, instance.props);

	id = instance[$$id];
	setCurrMountedComponentId(id);

	if (instance[$$isMounted] && !instance.shouldUpdate(sanitizedProps, instance.state)) {
		const vdom = getVirtualDOM(uid);
		const vNode = getVirtualDOMNodeByID(id, vdom);

		setAttribute(vNode, ATTR_DONT_UPDATE_NODE, true);
		instance[$$markedIDMap] = {};
		setId(instance);

		return vNode;
	}

	instance.props = getProps();
	instance.willReceiveProps(instance.props);
	instance.willUpdate(instance.props, instance.state);

	vNode = instance.render();

	app.queue.push(() => {
		//console.log('callback for', vNode)
		makeEvents(vNode, id, uid);
	});

	if (instance[$$root]) {
		vNode = buildNodeWithRoutes(vNode);
		app.queue.forEach(fn => fn());
		app.queue = [];
	}

	if (isUndefined(vNode)) {
		error('render method must return dom`` content or null!');
		return null;
	}

	if (isNull(vNode)) {
		vNode = createCommentNode(`${COMPONENT_REPLACER}:${id}${Boolean(instance[$$name]) ? `:${instance[$$name]}` : ''}`);
	}

	if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
		setAttribute(vNode, ATTR_COMPONENT_ID, id);
		!isUndefined(key) && setAttribute(vNode, ATTR_KEY, key);
		instance.displayName && setAttribute(vNode, ATTR_COMPONENT_NAME, instance.displayName);
	}

	const didUpdateTimeout = setTimeout(() => {
		clearTimeout(didUpdateTimeout);
		instance.didUpdate({ ...instance[$$prevProps] }, instance.state);
	});

	if (!instance[$$isMounted]) {
		const didMountTimeout = setTimeout(() => {
			clearTimeout(didMountTimeout);
			instance.didMount();
			instance[$$isMounted] = true;
		});
	}

	instance[$$markedIDMap] = {};
	setId(instance);
	ref && ref(instance);

	vNode.props = instance.props;

	//setTimeout(() => console.log('componentTree', getComponentTree(uid)))

	return vNode;
}

function mountVirtualDOM(mountedVNode: VDOMNodeType, elements: Array<ElementReplacerType<any>>, parentVNode: VDOMNodeType = null): VDOMNodeType {
	const isBlockNode = mountedVNode.type === VDOM_ELEMENT_TYPES.TAG;
	const isCommentNode = mountedVNode.type === VDOM_ELEMENT_TYPES.COMMENT;
	const children = isBlockNode ? mountedVNode.children : [];

	if (isCommentNode) {
		const textContent = mountedVNode.content;

		if (textContent === COMPONENT_REPLACER) {
			const findElementFn = (e: ElementReplacerType<ComponentFactoryType>) => e.type === COMPONENT;
			const findVNodeFn = (n: VDOMNodeType) => n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === COMPONENT_REPLACER;
			const elementIdx = elements.findIndex(findElementFn);
			const vNodeIdx = parentVNode ? parentVNode.children.findIndex(findVNodeFn) : 0;
			const componentFactory = elements[elementIdx].value as ComponentFactoryType;
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
		} else if (textContent === COMPONENT_LIST_REPLACER) {
			const findElementFn = (e: ElementReplacerType<Array<ComponentFactoryType>>) => e.type === COMPONENT_LIST;
			const findVNodeFn = (n: VDOMNodeType) => n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === COMPONENT_LIST_REPLACER;
			const uid = getUidActive();
			const id = getCurrMountedComponentId();
			const vdom = getVirtualDOM(uid);
			const elementIdx = elements.findIndex(findElementFn);
			const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
			const componentFactoryList = elements[elementIdx].value;
			const instance: ComponentType = componentFactoryList
				? getPublicInstance(uid, componentFactoryList[0].props.key, componentFactoryList[0])
				: null;
			const getParentPrevVNode = (id: string, vNode: VDOMNodeType, parentVNode: VDOMNodeType = null): VDOMNodeType => {
				if (getAttribute(vNode, ATTR_COMPONENT_ID) === id) {
					return parentVNode;
				}

				if (!vNode || !vNode.children) return null;

				for (let childVNode of vNode.children) {
					parentVNode = getParentPrevVNode(id, childVNode, vNode);

					if (parentVNode) return parentVNode;
				}

				return null;
			};
			const parentPrevVNode = getParentPrevVNode(instance[$$id], getVirtualDOMNodeByID(id, vdom));
			const shift = parentVNode.children.length;
			const filterNodesFn = (vNode: VDOMNodeType) => {
				const hasSameKey = (componentFactory: ComponentFactoryType) => componentFactory.props.key === getAttribute(vNode, ATTR_KEY);
				return Boolean(getAttribute(vNode, ATTR_COMPONENT_ID)) && componentFactoryList.some(hasSameKey);
			};
			const children = parentPrevVNode && parentPrevVNode.children
				? parentPrevVNode.children.filter(filterNodesFn)
				: [];
			const mapFactoryList = (componentFactory: ComponentFactoryType, idx: number) => {
				const runComponent = () => parentVNode.children.push(wire(componentFactory));

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
		} else if (textContent === NODE_REPLACER) {
			const findElementFn = (e: ElementReplacerType<VDOMNodeType>) => e.type === NODE;
			const findVNodeFn = (n: VDOMNodeType) => n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === NODE_REPLACER;
			const elementIdx = elements.findIndex(findElementFn);
			const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
			const nextVNode = elements[elementIdx].value;

			elements.splice(elementIdx, 1);
			parentVNode.children[vNodeIdx] = nextVNode;
		} else if (textContent === NODE_LIST_REPLACER) {
			const findElementFn = (e: ElementReplacerType<Array<HTMLElement>>) => e.type === NODE_LIST;
			const findVNodeFn = (n: VDOMNodeType) => n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === NODE_LIST_REPLACER;
			const elementIdx = elements.findIndex(findElementFn);
			const vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
			const nodeList = elements[elementIdx].value;
			const mapNodesFn = (n: VDOMNodeType) => parentVNode.children.push(n);

			elements.splice(elementIdx, 1);
			nodeList.forEach(mapNodesFn);
			parentVNode.children.splice(vNodeIdx, 1);
		}
	}

	const mapChildNodesFn = (vNode: VDOMNodeType) => mountVirtualDOM(vNode, elements, mountedVNode);
	children.forEach(mapChildNodesFn);

	return mountedVNode;
}

function createSnapshot(vNode: VDOMNodeType, elements: Array<ElementReplacerType<any>>, immutable: boolean = true): SnapshotType {
	
	return {
		vdom: deepClone(vNode),
		elements: immutable ? [...elements] : elements
	};
}

function dom(string: TemplateStringsArray, ...args: Array<any>) {
	const uid = getUidActive();
	const app = getRegistery().get(uid);
	const separator = NODE_SEPARATOR;
	const elements: Array<ElementReplacerType<any>> = [];
	const componentTree: ComponentTreeType = getComponentTree(uid);
	const id = getCurrMountedComponentId();
	let markup = string.join(separator);
	let sourceVNode = null;
	let vNode: VDOMNodeType = null;
	let needSnapshot = false;
	const componentTreeNode = componentTree[id];
	const instance = componentTreeNode.instance;
	const isComponent = (o: ComponentFactoryType) => isObject(o) && !isEmpty(o) && (o as ComponentFactoryType).isSpiderComponent === true;

	const mapArgsFn = (arg: any) => {
		let replacer = '';

		if (isComponent(arg)) {
			const componentFactory = arg as ComponentFactoryType;
			replacer = `<!--${COMPONENT_REPLACER}-->`;
			componentFactory.uid = uid;
			elements.push({ type: COMPONENT, value: componentFactory });
		} else if (isArray(arg) && isComponent(arg[0])) {
			const mapComponentsFn = (o: ComponentFactoryType) => (o.uid = uid, o);
			const componentFactoryList = arg.map(mapComponentsFn);
			replacer = `<!--${COMPONENT_LIST_REPLACER}-->`;
			elements.push({ type: COMPONENT_LIST, value: componentFactoryList });
		} else if (isArray(arg) && isVDOMNode(arg[0])) {
			replacer = `<!--${NODE_LIST_REPLACER}-->`;
			elements.push({ type: NODE_LIST, value: arg  });
		} else if (isVDOMNode(arg)) {
			replacer = `<!--${NODE_REPLACER}-->`;
			elements.push({ type: NODE, value: arg });
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
	needSnapshot = !Boolean(getAttribute(sourceVNode, ATTR_IS_NODE));

	if (needSnapshot) {
		componentTree[id] = {
			...componentTree[id],
			prevSnapshot: componentTree[id].snapshot || null
		};
		componentTree[id] = {
			...componentTree[id],
			snapshot: createSnapshot(sourceVNode, elements)
		};
		componentTree[id] = {
			...componentTree[id],
			snapshotDiff: getSnapshotDiff(componentTree[id].prevSnapshot, componentTree[id].snapshot)
		};

		setComponentTree(uid, componentTree);
	} else {
		removeAttribute(sourceVNode, ATTR_IS_NODE);
	}

	vNode = mountVirtualDOM(sourceVNode, elements);

	const orderedIDList = vNode && vNode.children
		? vNode.children
				.map(n => getAttribute(n, ATTR_COMPONENT_ID))
				.filter(Boolean)
		: [];

	componentTree[id].instance[$$orderedIDList] = orderedIDList;

	return vNode;
}

function findDOMNode(ref: ComponentType) {
	if (!ref) return null;

	const uid = ref[$$uid];
	const id = ref[$$id];
	const app = getRegistery().get(uid);

	return app.node.querySelector(`[${ATTR_COMPONENT_ID}="${id}"]`);
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


export {
	wire,
	runDOMProcessor,
	patchDOM,
	getComponentTree,
	setComponentTree,
	dom,
	findDOMNode,
	mount,
	getVirtualDOMNodeByID,
	getDOMElementRoute
}