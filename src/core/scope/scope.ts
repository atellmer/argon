import { ComponentTreeType } from '../component';
import { VirtualNodeType } from '../vdom';


type ScopeType = {
	registery: Map<number, AppType>;
	uid: {
		mounted: number;
		active: number;
	},
	currentMountedComponentId: string | null;
}

type AppType = {
	nativeElement: HTMLElement;
	componentTree: ComponentTreeType;
	vdom: VirtualNodeType;
	eventHandlersCache: Array<(e) => void>;
	eventHandlers: WeakMap<any, {
		addEvent?: Function;
		removeEvent?: Function;
	}>;
	refs: Array<Function>;
	queue: Array<Function>;
};

let scope = createScope();
const getRegistery = () => scope.registery;
const setRegistery = (registery: Map<number, any>) => scope.registery = registery;
const getUIDMounted = (): number => scope.uid.mounted;
const setUIDMounted = (uid: number) => scope.uid.mounted = uid;
const getUIDActive = (): number => scope.uid.active;
const setUIDActive = (uid: number) => scope.uid.active = uid;
const getCurrentMountedComponentId = (): string | null => scope.currentMountedComponentId;
const setCurrentMountedComponentId = (id: string | null) => scope.currentMountedComponentId = id;

function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: {
			mounted: 0,
			active: 0
		},
		currentMountedComponentId: null,
	};
}

function createApp(nativeElement: HTMLElement): AppType {
	return {
		nativeElement,
		componentTree: {},
		vdom: null,
		eventHandlersCache: [],
		eventHandlers: new WeakMap(),
		refs: [],
		queue: []
	}
}

export {
	ScopeType,
	AppType,
	getRegistery,
	setRegistery,
	getUIDMounted,
	setUIDMounted,
	getUIDActive,
	setUIDActive,
	getCurrentMountedComponentId,
	setCurrentMountedComponentId,
	createScope,
	createApp
}
