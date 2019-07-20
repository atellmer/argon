import { ComponentTreeType } from '../component';
import { VirtualNodeType } from '../vdom';


type ScopeType = {
	registery: Map<number, AppType>;
	uid: number;
	currentMountedRoute: Array<number>;
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
const getUIDActive = (): number => scope.uid;
const setUIDActive = (uid: number) => scope.uid = uid;
const getCurrentMountedRoute = (): Array<number> => [...scope.currentMountedRoute];
const setCurrentMountedRoute = (route: Array<number>) => scope.currentMountedRoute = [...route];
const getCurrentMountedComponentId = (): string | null => scope.currentMountedComponentId;
const setCurrentMountedComponentId = (id: string | null) => scope.currentMountedComponentId = id;

function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: 0,
		currentMountedComponentId: null,
		currentMountedRoute: []
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
	getUIDActive,
	setUIDActive,
	getCurrentMountedRoute,
	setCurrentMountedRoute,
	getCurrentMountedComponentId,
	setCurrentMountedComponentId,
	createScope,
	createApp,
}
