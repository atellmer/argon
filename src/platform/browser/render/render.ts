import { EMPTY_REPLACER } from '../../../core/constants/constants';
import {
	createApp,
	getRegistery,
	getUIDActive,
	setUIDActive,
	setCurrentMountedComponentId,
	setCurrentMountedRoute
} from '../../../core/scope/scope';
import {
	StatefullComponentFactoryType,
	StatelessComponentFactoryType,
	wire
} from '../../../core/component/component';
import {
	processDOM,
	mount
} from '../dom/dom';
import { getVirtualDOM, VirtualNodeType, createCommentNode } from '../../../core/vdom/vdom';
import { makeEvents } from '../events/events';
import { defragment, getIsFragment } from '../../../core/fragment/fragment';
import { isNull } from '../../../helpers';


let renderInProcess = false;
let isInternalRenderCall = false;
let zoneCount = 0;
const zoneIdByRootNodeMap = new WeakMap();

function renderComponent(componentFactory: StatefullComponentFactoryType | StatelessComponentFactoryType, container: HTMLElement) {
	const isMounted = typeof zoneIdByRootNodeMap.get(container) !== 'undefined';
	const statelessComponentFactory = componentFactory as StatelessComponentFactoryType;
	const statefullComponentFactory = componentFactory as StatefullComponentFactoryType;

	if (!renderInProcess) {
		renderInProcess = true;
	} else {
		isInternalRenderCall = true;
	}
	
	if (!isMounted) {
		zoneIdByRootNodeMap.set(container, zoneCount);
		zoneCount++;
	}

	const prevZoneId = getUIDActive();
	const zoneId = zoneIdByRootNodeMap.get(container);

	setCurrentMountedRoute([0]);
	setCurrentMountedComponentId(null);
	setUIDActive(zoneId);
	
	if (!isMounted) {
		let vNode: VirtualNodeType = null;
		const registry = getRegistery();
		const app = createApp(container);
		container.innerHTML = '';

		registry.set(zoneId, app);

		if (statelessComponentFactory.isStatelessComponent) {
			vNode = statelessComponentFactory.createElement();
		} else if (statefullComponentFactory.isStatefullComponent) {
			vNode = wire(statefullComponentFactory);
		}
		
		if (isNull(vNode)) {
			vNode = createCommentNode(EMPTY_REPLACER);
			vNode.route = [0];
		}

		vNode = defragment(vNode);
		app.queue.push(() => makeEvents(vNode, zoneId));
		app.vdom = vNode;

		if (getIsFragment(vNode)) {
			const mountNodesFn = (vNode: VirtualNodeType) => container.appendChild(mount(vNode));
			vNode.children.forEach(mountNodesFn);
		} else {
			container.appendChild(mount(vNode));
		}

		app.queue.forEach(fn => fn());
		app.queue = [];
	} else {
		const vNode = getVirtualDOM(zoneId);
		let nextVNode: VirtualNodeType = null;

		if (statelessComponentFactory.isStatelessComponent) {
			nextVNode = statelessComponentFactory.createElement();
		} else if (statefullComponentFactory.isStatefullComponent) {
			nextVNode = wire(statefullComponentFactory);
		} 
		
		if (isNull(nextVNode)) {
			nextVNode = createCommentNode(EMPTY_REPLACER);
			nextVNode.route = [0];
		}

		processDOM({ vNode, nextVNode, fragment: getIsFragment(nextVNode) });
	}

	if (!isInternalRenderCall) {
		renderInProcess = false;
	} else {
		isInternalRenderCall = false;
		setUIDActive(prevZoneId);
	}
}

export {
	renderComponent
}