import { HashMap, VirtualNodeType } from '../shared';
import { ComponentTreeType } from '../component';


export type ScopeType = {
	registery: Map<number, AppType>;
	uid: {
		mounted: number;
		active: number;
	},
	currentMountedComponentId: string | null;
}

export type AppType = {
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

function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: {
			mounted: 0,
			active: 0
		},
		currentMountedComponentId: null
	};
}


export {
	getRegistery,
	setRegistery,
	getUIDMounted,
	setUIDMounted,
	getUIDActive,
	setUIDActive,
	getCurrentMountedComponentId,
	setCurrentMountedComponentId,
	createScope
}
