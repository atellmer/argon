import { HashMap } from '../shared';
import {
	$$uid,
	$$id,
	$$cache,
	$$orderedIDList,
	$$prevState,
	$$prevProps,
	$$isMounted,
	$$portal,
	$$root,
	$$markedIDMap,
	$$getComponentSymbol,
	ATTR_COMPONENT_ID,
	ATTR_KEY,
	ATTR_COMPONENT_NAME,
	ATTR_DONT_UPDATE_NODE,
	ATTR_PORTAL_ID,
	STATEFULL_COMPONENT_REPLACER,
	VDOM_ELEMENT_TYPES
} from '../constants';
import {
	isFunction,
	sanitize,
	error,
	isUndefined,
	isNull,
	isObject,
	isEmpty,
	deepClone
} from '../../helpers';
import {
	getUIDActive,
	getRegistery,
	getCurrentMountedComponentId,
	setCurrentMountedComponentId
} from '../scope';
import {
	VirtualNodeType,
	getAttribute,
	setAttribute,
	getVirtualDOM,
	getComponentVirtualNodeById,
	buildVirtualNodeWithRoutes,
	createCommentNode
} from '../vdom';
import { makeEvents } from '../../platform/browser/events';
import { forceUpdate } from '../../platform/browser/dom';


type ComponentDefType = {
	displayName?: string;
	config?: {
		pure?: boolean;
	};
	props?: {
		key?: any;
		ref?: (c: ComponentType) => void;
	};
	state?: {};
	render: () => VirtualNodeType | null;
	getInitialState?: () => any;
	getDefaultProps?: () => any;
	willMount?: () => void;
	didMount?: () => void;
	willReceiveProps?: (p) => void;
	shouldUpdate?: (p, s) => boolean;
	willUpdate?: (p, s) => void;
	didUpdate?: (p, s) => void;
	willUnmount?: () => void;
}

type ComponentOptions = {
	displayName?: string;
	defaultProps?: any;
}

interface ComponentType extends ComponentDefType {
	setState?: (state, cb?) => void;
	forceUpdate?: () => void;
}

type StatefullComponentFactoryType = {
	isStatefullComponent: boolean;
	displayName: string;
	createInstance: () => ComponentType;
	getElementToken: () => Symbol;
	config: {
		pure: boolean;
	},
	mountPortal: (id: string, nextVNode: VirtualNodeType) => void | null;
	props: {
		ref?: any;
		key?: any;
	};
}

type StatelessComponentFactoryType = {
	isStatelessComponent: boolean;
	displayName: string;
	createElement: () => VirtualNodeType;
	props: {
		key?: any;
	};
}

type RepeatorType = {
	isRepeator: boolean;
	items: Array<any>;
	createElement: (item: any, idx: number) => VirtualNodeType | Array<VirtualNodeType> | StatelessComponentFactoryType | StatefullComponentFactoryType;
}

type ComponentTreeType = HashMap<ComponentNodeType>;

type ComponentNodeType = {
	id: string;
	instance: ComponentType;
	childrenIdMap: HashMap<boolean>;
	lastChildId: string;
	parentId: string;
}

function getInitialState(def: ComponentDefType) {
	if (isFunction(def.getInitialState)) {
		const initialState = sanitize(def.getInitialState());
		return { ...initialState };
	}

	return {};
}

function getDefaultProps(def: ComponentDefType) {
	if (isFunction(def.getDefaultProps)) {
		const defaultProp = sanitize(def.getDefaultProps());
		return { ...defaultProp };
	}

	return {};
}

function getComponentTree(uid: number): ComponentTreeType {
	return { ...getRegistery().get(uid).componentTree };
}

function setComponentTree(uid: number, componentTree: ComponentTreeType) {
	const app = getRegistery().get(uid);

	app.componentTree = { ...componentTree };
};

function createComponent(defObj: ComponentDefType | Function, options: ComponentOptions = null) {
	const def = defObj as ComponentDefType;
	const $$elementToken = Symbol(def.displayName || 'element');
	const config = def.config || { pure: false };
	const reservedPropNames = {
		'setState': true,
		'forceUpdate': true,
		'willMount': true,
		'didMount': true,
		'willReceiveProps': true,
		'shouldUpdate': true,
		'willUpdate': true,
		'didUpdate': true,
		'willUnmount': true,
		'render': true
	};
	const reservedStaticPropNames = {};
	class Component implements ComponentType {
		state = getInitialState(def);
		props = getDefaultProps(def);

		constructor() {
			const mapDefKeys = (key: string) => {
				if (isFunction(def[key])) {
					def[key] = def[key].bind(this);

					return !reservedPropNames[def[key].name] && (this[key] = def[key]);
				} 
				
				!reservedStaticPropNames[key] && (this[key] = def[key]);
			};

			Object.keys(def).forEach(mapDefKeys);
			this[$$id] = null;
			this[$$isMounted] = false;
			this[$$cache] = new Map();
			this[$$orderedIDList] = [];
			this[$$prevState] = { ...this.state };
			this[$$prevProps] = { ...this.props };
			this[$$portal] = false;
		}

		setState(state: {}, onRender = () => {}) {
			const mergedState = {
				...this.state,
				...sanitize(state)
			};

			if (!this.shouldUpdate(this.props, { ...mergedState })) return;

			this[$$prevState] = { ...this.state };
			this.state = { ...mergedState };

			this.forceUpdate(onRender);
		}

		forceUpdate(onRender = () => {}) {
			forceUpdate(this, {
				beforeRender: () => {
					this.willUpdate(this.props, this.state);
				},
				afterRender: () => {
					this.didUpdate(this.props, { ...this[$$prevState] });
					onRender();
				}
			});
		}

		willMount() {
			isFunction(def.willMount) && def.willMount();
		}

		didMount() {
			isFunction(def.didMount) && def.didMount();
		}

		willReceiveProps(nextProps) {
			isFunction(def.willReceiveProps) && def.willReceiveProps(nextProps);
		}

		shouldUpdate(nextProps, nextState) {
			return isFunction(def.shouldUpdate) ? def.shouldUpdate(nextProps, nextState) : true;
		}

		willUpdate(nextProps, nextState) {
			isFunction(def.willUpdate) && def.willUpdate(nextProps, nextState);
		}

		didUpdate(prevProps, prevState) {
			isFunction(def.didUpdate) && def.didUpdate(prevProps, prevState);
		}

		willUnmount() {
			isFunction(def.willUnmount) && def.willUnmount();
		}

		render() {
			if (isFunction(def.render)) return def.render();
			error('render method does not exist!');
		}
	}

	return (props: {} = {}) => {
		const resolveFactory = (def) => {
			const isStateless = isFunction(def);
			const displayName = def.displayName || (options ? options.displayName : '');
			const defaultProps = isStateless
				? options && options.defaultProps ? sanitize(options.defaultProps) : {}
				: getDefaultProps(def);
			const computedProps = { ...defaultProps, ...sanitize(props) };
			const factory = isStateless
				? {
						isStatelessComponent: true,
						displayName,
						createElement: () => def(computedProps),
						uid: 0,
						props: computedProps,
					} as StatelessComponentFactoryType
				: {
						isStatefullComponent: true,
						displayName,
						createInstance: () => new Component(),
						getElementToken: () => $$elementToken,
						uid: 0,
						config,
						mountPortal: null,
						props: computedProps,
					} as StatefullComponentFactoryType;

			return factory;
		}

		return resolveFactory(def);
	};
}

function getComponentId(vNode: VirtualNodeType) {
	let id = getAttribute(vNode, ATTR_COMPONENT_ID);

	if (id) return id;

	if (!vNode.children) return null;

	for(const childVNode of vNode.children) {
		id = getComponentId(childVNode);
	}

	return id;
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
			instance
		};
	
		if (parentNode && !parentNode.childrenIdMap[id]) {
			parentNode.childrenIdMap[id] = true;
			parentNode.lastChildId = id;
		}
	}

	return componentTree;
}

function getPublicInstance(uid: number, key: any, componentFactory: StatefullComponentFactoryType) {

	if (getComponentTree(uid)['0']) {
		return getComponentTree(uid)['0'].instance;
	}

	return componentFactory.createInstance();
}

function wire(componentFactory: StatefullComponentFactoryType): VirtualNodeType {
	const uid = getUIDActive();
	const app = getRegistery().get(uid);
	const sanitizedProps = sanitize(componentFactory.props);
	const { key, ref } = sanitizedProps as any;
	const instance: ComponentType = getPublicInstance(uid, key, componentFactory);
	let componentTree = null;
	let vNode: VirtualNodeType = null;
	let id = null;

	instance[$$uid] = uid;
	instance[$$prevProps] = { ...instance.props };

	if (!instance[$$isMounted]) {
		componentTree = makeComponentTree(instance, getCurrentMountedComponentId());
		setComponentTree(uid, componentTree);
		instance.willMount();
	}

	const setId = (instance: ComponentType) => {
		if (!instance[$$root]) {
			const id = instance[$$id].split('.').slice(0, -1).join('.');
	
			setCurrentMountedComponentId(id);
		}
	};
	const reduceProps = (acc, key) => (acc[key] = sanitizedProps[key], acc);
	const getProps = () => Object.keys(sanitizedProps).reduce(reduceProps, instance.props);

	id = instance[$$id];
	setCurrentMountedComponentId(id);

	if (instance[$$isMounted] && !instance.shouldUpdate(sanitizedProps, instance.state)) {
		const vdom = getVirtualDOM(uid);
		const vNode = getComponentVirtualNodeById(id, vdom);

		setAttribute(vNode, ATTR_DONT_UPDATE_NODE, true);
		instance[$$markedIDMap] = {};
		setId(instance);

		return vNode;
	}

	instance.props = getProps();
	instance.willReceiveProps(instance.props);
	instance.willUpdate(instance.props, instance.state);

	vNode = instance.render();

	if (isUndefined(vNode)) {
		error('render method must return dom`` content or null!');
		return null;
	}

	if (isNull(vNode)) {
		vNode = createCommentNode(`${STATEFULL_COMPONENT_REPLACER}:${id}${Boolean(instance.displayName) ? `:${instance.displayName}` : ''}`);
	}

	app.queue.push(() => makeEvents(vNode, uid));

	if (instance[$$root]) {
		//vNode = buildVirtualNodeWithRoutes(vNode);
		app.queue.forEach(fn => fn());
		app.queue = [];
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

function unmountComponent(id: string, uid: number, parentInstance = null) {
	const app = getRegistery().get(uid);
	const componentTree = getComponentTree(uid);
	const vDOMNode = componentTree[id];
	const instance = vDOMNode.instance;
	const elementType = instance[$$getComponentSymbol]();
	let componentCache = null;
	let parentVDOMNode = null;

	instance.props.ref && instance.props.ref(null);
	parentInstance = parentInstance || componentTree[vDOMNode.parentId].instance;
	parentVDOMNode = componentTree[parentInstance[$$id]];
	componentCache = parentInstance[$$cache].get(elementType);

	delete componentTree[id];
	setComponentTree(uid, componentTree);

	const mapCacheFn = (comparedInstance, key) => {
		if (comparedInstance === instance) {
			const idx = parentInstance[$$orderedIDList].findIndex(cid => cid === id);

			componentCache.delete(key);
			parentInstance[$$orderedIDList].splice(idx, 1);
		}
	};
	const mapComponentsFn = (id: string) => unmountComponent(id, uid, instance);

	componentCache.forEach(mapCacheFn);
	parentInstance[$$cache].set(elementType, componentCache);
	Object.keys(vDOMNode.childrenIdMap).forEach(mapComponentsFn);

	if (parentVDOMNode) {
		delete parentVDOMNode.childrenIdMap[id];
	}

	instance.willUnmount();

	const mapHandlersFn = (key: string) => {
		const comparedId = key.split(':')[0];

		if (comparedId === id) {
			const mapEventsFn = (eventName: string) => app.eventHandlers[key][eventName].removeEvent();
			Object.keys(app.eventHandlers[key]).forEach(mapEventsFn);
			delete app.eventHandlers[key];
		}
	};
	Object.keys(app.eventHandlers).forEach(mapHandlersFn);

	if (instance[$$portal]) {
		const portalId = `${instance[$$uid]}:${id}`;
		const $portalContainer = document.querySelector(`[${ATTR_PORTAL_ID}="${portalId}"]`);

		if ($portalContainer) {
			if ($portalContainer.parentElement !== document.body) {
				$portalContainer.removeAttribute(ATTR_PORTAL_ID);
				$portalContainer.innerHTML = '';
			} else {
				$portalContainer.parentElement.removeChild($portalContainer);
			}
		} 
	}

	getRegistery().set(uid, app);
}

function repeat(items, createElement: (item: string, idx: number) => VirtualNodeType | Array<VirtualNodeType> | StatelessComponentFactoryType | StatefullComponentFactoryType): RepeatorType {
	return {
		isRepeator: true,
		items,
		createElement
	};
}

function isStatefullComponent(o: any) {
	return isObject(o) && !isEmpty(o) && o.isStatefullComponent === true;
}

function isStatelessComponent(o: any) {
	return isObject(o) && !isEmpty(o) && o.isStatelessComponent === true;
}

function isRepeator(o: RepeatorType) {
	return isObject(o) && !isEmpty(o) && o.isRepeator === true;
}


export {
	ComponentDefType,
	ComponentType,
	StatefullComponentFactoryType,
	StatelessComponentFactoryType,
	RepeatorType,
	ComponentTreeType,
	ComponentNodeType,
	createComponent,
	getComponentTree,
	getComponentId,
	wire,
	getPublicInstance,
	unmountComponent,
	isStatefullComponent,
	isStatelessComponent,
	repeat,
	isRepeator
}
