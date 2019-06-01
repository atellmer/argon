import { HashMap, VirtualNodeType } from '../shared';
import * as constants from '../constants';
import { isFunction, sanitize, error } from '../../helpers';


export type ComponentDefType = {
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

export interface ComponentType extends ComponentDefType {
	setState?: (state, cb?) => void;
	forceUpdate?: () => void;
}

export type ComponentFactoryType = {
	is: string;
	isArgonComponent: boolean;
	createInstance: () => ComponentType;
	getComponentSymbol: () => Symbol;
	config: {
		pure: boolean;
	},
	mountPortal: (id: string, nextVNode: VirtualNodeType) => void | null;
	uid: number;
	props: {
		key?: any;
	};
}

export type ComponentTreeType = HashMap<ComponentTreeNodeType>;

export type ComponentTreeNodeType = {
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

function forceUpdate(instance: ComponentType, params = { beforeRender: () => {}, afterRender: () => {} }) {
	
}

function createComponent(def: ComponentDefType) {
	const {
		$$elementType,
		$$id,
		$$cache,
		$$orderedIDList,
		$$prevState,
		$$prevProps,
		$$isMounted,
		$$portal,
		$$eventHandlers
	} = constants;
	const $$component = Symbol(def.displayName || 'component');
	const config = def.config || { pure: false };
	const reservedMethodNamesMap = {
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
	class Component implements ComponentType {
		static displayName = def.displayName;

		state = getInitialState(def);
		props = getDefaultProps(def);

		constructor() {
			const mapDefKeys = (key: string) => {
				if (isFunction(def[key])) {
					!reservedMethodNamesMap[def[key].name] && (this[key] = def[key]);
				} else {
					this[key] = def[key];
				}
			};

			Object.keys(def).forEach(mapDefKeys);
			this[$$id] = null;
			this[$$isMounted] = false;
			this[$$cache] = new Map();
			this[$$orderedIDList] = [];
			this[$$prevState] = { ...this.state };
			this[$$prevProps] = { ...this.props };
			this[$$eventHandlers] = [];
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

	Component[$$elementType] = $$component;

	return (props: {} = {}) => {
		const factory = {
			isArgonComponent: true,
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


export {
	createComponent
}
