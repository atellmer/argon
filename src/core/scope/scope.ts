import { ComponentTreeType } from '../component';
import { VirtualNodeType } from '../vdom';


type ScopeType = {
	registery: Map<number, AppType>;
	uid: number;
	currentMountedRoute: Array<number>;
  currentMountedComponentId: string | null;
  repeator: {
    idx: number;
    route: Array<number> | null;
  };
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

const scope = createScope();
const getRegistery = () => scope.registery;
const setRegistery = (registery: Map<number, any>) => scope.registery = registery;
const getUIDActive = (): number => scope.uid;
const setUIDActive = (uid: number) => scope.uid = uid;
const getCurrentMountedRoute = (): Array<number> => [...scope.currentMountedRoute];
const setCurrentMountedRoute = (route: Array<number>) => scope.currentMountedRoute = [...route];
const getCurrentMountedComponentId = (): string | null => scope.currentMountedComponentId;
const setCurrentMountedComponentId = (id: string | null) => scope.currentMountedComponentId = id;
const repeatorScope = {
  getRoute: () => [...scope.repeator.route],
  setRoute: (route: Array<number>) => {
    const scopeRoute = scope.repeator.route;

    if (!scopeRoute || scopeRoute[scopeRoute.length - 1] !== route[scopeRoute.length - 1]) {
      scope.repeator.route = [...route];
      scope.repeator.idx = 0;
    }
  },
  getIdx: () => scope.repeator.idx,
  incrementIdx: () => scope.repeator.idx++,
  resetIdx: () => scope.repeator.idx = 0,
  reset: () => {
    scope.repeator.route = null;
    scope.repeator.idx = 0;
  },
}

function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: 0,
		currentMountedComponentId: null,
    currentMountedRoute: [],
    repeator: {
      idx: 0,
      route: null,
    },
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
		queue: [],
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
  repeatorScope,
	createScope,
	createApp,
}
