import {
	ComponentDefType,
	ComponentType,
	ComponentFactoryType
} from './types';
import {
	isFunction,
	sanitize,
	error
} from '../helpers';
import {
	$$name,
	$$prevState,
	$$prevProps,
	$$cache,
	$$elementType,
	$$isMounted,
	$$id,
	$$uid,
	$$markedIDMap,
	$$orderedIDList,
	$$getComponentSymbol,
	$$portal,
	$$eventHandlers,
	ATTR_PORTAL_ID
} from './constants';
import {
	getRegistery,
	setUidActive,
	setCurrMountedComponentId
} from './scope';
import {
	runDOMProcessor,
	getComponentTree,
	setComponentTree
} from './dom';


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

function forceUpdate(instance: ComponentType, params = { beforeRender: () => {}, afterRender: () => {} }) {
	const { beforeRender, afterRender } = params;
	const id = instance[$$id];
	const uid = instance[$$uid];

	instance[$$markedIDMap] = {};
	setCurrMountedComponentId(id);
	setUidActive(instance[$$uid]);

	beforeRender();
	runDOMProcessor(id, uid);
	afterRender();
}

function createComponent(def: ComponentDefType) {
	const $$component = Symbol(def.displayName);
	const config = def.config || { pure: false };
	const Component = function() {
		Object.keys(def).forEach(key => this[key] = def[key]);
		this[$$name] = def.displayName;
		this[$$elementType] = $$component;
		this[$$id] = '';
		this[$$cache] = new Map();
		this[$$markedIDMap] = {};
		this[$$orderedIDList] = [];
		this.state = getInitialState(def);
		this.props = getDefaultProps(def);
		this[$$prevState] = { ...this.state };
		this[$$prevProps] = { ...this.props };
		this[$$isMounted] = false;
		this[$$portal] = false;
		this[$$getComponentSymbol] = () => $$component;
		this[$$eventHandlers] = [];
		this.setState = (state: {}, onRender = () => {}) => {
			const mergedState = {
				...this.state,
				...sanitize(state)
			};

			if (!this.shouldUpdate(this.props, { ...mergedState })) return;

			this[$$prevState] = { ...this.state };
			this.state = { ...mergedState };

			this.forceUpdate(onRender);
		};
		this.forceUpdate = (onRender = () => {}) => {
			forceUpdate(this, {
				beforeRender: () => {
					this.willUpdate(this.props, this.state);
				},
				afterRender: () => {
					this.didUpdate(this.props, { ...this[$$prevState] });
					onRender();
				}
			});
		},
		this.willMount = this.willMount || (() => {});
		this.didMount = this.didMount || (() => {});
		this.willReceiveProps = this.willReceiveProps || (() => {});
		this.shouldUpdate = this.shouldUpdate || (() => true);
		this.willUpdate = this.willUpdate || (() => {});
		this.didUpdate = this.didUpdate || (() => {});
		this.willUnmount = this.willUnmount || (() => {});
		this.render = this.render || (() => error('render method does not exist!'));
	};

	return (props: {} = {}) => {
		const factory = {
			isSpiderComponent: true,
			is: $$component.toString(),
			createInstance: () => new Component(),
			getComponentSymbol: () => $$component,
			uid: 0,
			config,
			mountPortal: null,
			props: {
				...getDefaultProps(def),
				...props
			},
		} as ComponentFactoryType

		return factory;
	};
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


export {
	createComponent,
	unmountComponent
}