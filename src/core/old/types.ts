
export type HashMap<T> = {
	[prop: string]: T;
}

export type ScopeType = {
	registery: Map<number, AppType>;
	uid: {
		mounted: number;
		active: number;
	},
	currMountedComponentId: string | null;
}

export type AppType = {
	node: HTMLElement;
	componentTree: ComponentTreeType;
	vdom: VDOMNodeType,
	eventHandlers: HashMap<{
		addEvent?: Function;
		removeEvent?: Function;
	}>;
	refs: Array<Function>;
	queue: Array<Function>;
};

export type ComponentTreeType = HashMap<ComponentTreeNodeType>;

export type ComponentTreeNodeType = {
	id: string;
	instance: ComponentType;
	childrenIdMap: HashMap<boolean>;
	lastChildId: string;
	parentId: string;
	snapshot?: SnapshotType | null;
	prevSnapshot?: SnapshotType | null;
	snapshotDiff?: Array<SnapshotDiffType>;
}

export type ComponentDefType = {
	displayName?: string;
	config?: {
		pure?: boolean;
	},
	props?: {
		key?: any;
		ref?: (c: ComponentType) => void;
	};
	state?: {};
	render: () => VDOMNodeType | null;
	getInitialState?: () => any;
	getDefaultProps?: () => any;
	willMount?: () => void;
	didMount?: () => void;
	willReceiveProps?: (p) => void;
	shouldUpdate?: (p, s) => boolean;
	willUpdate?: (p, s) => void;
	didUpdate?: (p, s) => void;
	willUnmount?: () => void;
	setState?: (state, cb?) => void;
	forceUpdate?: () => void;
}

export type ComponentType = ComponentDefType & {}
export type ComponentFactoryType = {
	is: string;
	isSpiderComponent: boolean;
	createInstance: () => ComponentType;
	getComponentSymbol: () => Symbol;
	config: {
		pure: boolean;
	},
	mountPortal: (id: string, nextVNode: VDOMNodeType) => void | null;
	uid: number;
	props: {
		key?: any;
	};
}

export type ElementReplacerType<T> = {
	type: 'NODE' | 'NODE_LIST' | 'COMPONENT' | 'COMPONENT_LIST';
	value: T;
}

export type VDOMNodeTypeTagTuple = 'TAG' | 'TEXT' | 'COMMENT';
export type VDOMActionsType = 'ADD_NODE' | 'REMOVE_NODE' | 'REPLACE_NODE' | 'ADD_ATTRIBUTE' | 'REMOVE_ATTRIBUTE' | 'REPLACE_ATTRIBUTE';
export type VDOMDiffType = {
	action: VDOMActionsType;
	route: Array<number>;
	keyRoute: Array<number>;
	oldValue: VDOMNodeType | HashMap<number | string | boolean>;
	nextValue: VDOMNodeType | HashMap<number | string | boolean>;
}

export type VDOMNodeType = {
	isVNode: boolean;
	type: VDOMNodeTypeTagTuple;
	name?: string;
	void?: boolean;
	attrs?: HashMap<string>;
	content?: string;
	children: Array<VDOMNodeType>;
	props?: any;
	route: Array<number>;
};

export type SnapshotType = {
	vdom: VDOMNodeType | null;
	elements: Array<ElementReplacerType<any>>;
}

export type SnapshotDiffType = {
	type: string;
	element: ElementReplacerType<ComponentFactoryType>;
}