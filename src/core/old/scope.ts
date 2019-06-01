import { ScopeType } from './types';


let scope = createScope();
const getRegistery = () => scope.registery;
const setRegistery = (changed: Map<number, any>) => scope.registery = changed;
const getUidMounted = (): number => scope.uid.mounted;
const setUidMounted = (changed: number) => scope.uid.mounted = changed;
const getUidActive = (): number => scope.uid.active;
const setUidActive = (changed: number) => scope.uid.active = changed;
const getCurrMountedComponentId = (): string | null => scope.currMountedComponentId;
const setCurrMountedComponentId = (changed: string | null) => scope.currMountedComponentId = changed;

function createScope(): ScopeType {
	return {
		registery: new Map(),
		uid: {
			mounted: 0,
			active: 0
		},
		currMountedComponentId: null
	};
}

function unmount() {
	Array
		.from(scope.registery.keys())
		.forEach(uid => scope.registery.get(uid).node.innerHTML = '');
	scope = createScope();
}


export {
	getRegistery,
	setRegistery,
	getUidMounted,
	setUidMounted,
	getUidActive,
	setUidActive,
	getCurrMountedComponentId,
	setCurrMountedComponentId,
	unmount
}
