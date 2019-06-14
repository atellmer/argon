import { HashMap } from '../shared';
import { ComponentTreeType } from '../component';
import { VirtualNodeType } from '../vdom';


type ScopeType = {
	registery: Map<number, AppType>;
	uid: {
		mounted: number;
		active: number;
	},
	currentMountedComponentId: string | null;
	currentEventData: {
		eventName?: string | null;
		targetId?: string | null;
		handlerIdx?: number;
		handlersCount?: number;
	}
}

type AppType = {
	nativeElement: HTMLElement;
	componentTree: ComponentTreeType;
	vdom: VirtualNodeType;
	eventHandlersCache: Array<(e) => void>;
	eventHandlers: HashMap<{
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
const getCurrentEventData = () => scope.currentEventData;
const setCurrentEventData = (data: ScopeType['currentEventData']) => scope.currentEventData = { ...scope.currentEventData, ...data };

function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: {
			mounted: 0,
			active: 0
		},
		currentMountedComponentId: null,
		currentEventData: {
			eventName: null,
			targetId: null,
			handlerIdx: 1,
			handlersCount: 0
		}
	};
}

function createApp(nativeElement: HTMLElement): AppType {
	return {
		nativeElement,
		componentTree: {},
		vdom: null,
		eventHandlersCache: [],
		eventHandlers: {},
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
	getCurrentEventData,
	setCurrentEventData,
	createScope,
	createApp
}
