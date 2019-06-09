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
	currentEventTargetId: string | null;
}

type AppType = {
	nativeElement: HTMLElement;
	componentTree: ComponentTreeType;
	vdom: VirtualNodeType,
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
const getCurrentEventTargetId = () => scope.currentEventTargetId;
const setCurrentEventTargetId = (id: string | null) => scope.currentEventTargetId = id;


function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: {
			mounted: 0,
			active: 0
		},
		currentMountedComponentId: null,
		currentEventTargetId: null
	};
}

function createApp(nativeElement: HTMLElement): AppType {
	return {
		nativeElement,
		componentTree: {},
		vdom: null,
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
	getCurrentEventTargetId,
	setCurrentEventTargetId,
	createScope,
	createApp
}
