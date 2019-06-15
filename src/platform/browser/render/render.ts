import { ATTR_ROOT_APP } from '../../../core/constants/constants';
import {
	createApp,
	getRegistery,
	getUIDMounted,
	setUIDMounted,
	setUIDActive,
	setCurrentMountedComponentId
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
import { getVirtualDOM, buildVirtualNodeWithRoutes, VirtualNodeType } from '../../../core/vdom/vdom';
import { makeEvents } from '../events/events';
import { defragment, getIsFragment } from '../../../core/fragment/fragment';


function renderComponent(componentFactory: StatefullComponentFactoryType | StatelessComponentFactoryType, container: HTMLElement) {
	const isMounted = Boolean(container.getAttribute(ATTR_ROOT_APP));
	const uidMounted = getUIDMounted();
	const statelessComponentFactory = componentFactory as StatelessComponentFactoryType;
	const statefullComponentFactory = componentFactory as StatefullComponentFactoryType;

	if (!getRegistery().get(uidMounted)) {
		container.innerHTML = '';
		let vNode: VirtualNodeType = null;

		if (!container.getAttribute(ATTR_ROOT_APP)) {
			container.setAttribute(ATTR_ROOT_APP, uidMounted.toString());
		}

		const registry = getRegistery();
		const app = createApp(container);

		registry.set(uidMounted, app);
		setUIDActive(uidMounted);

		if (statelessComponentFactory.isStatelessComponent) {
			vNode = statelessComponentFactory.createElement();
		}

		if (statefullComponentFactory.isStatefullComponent) {
			vNode = wire(statefullComponentFactory);
		}

		vNode = defragment(vNode);
		app.queue.push(() => makeEvents(vNode, uidMounted));
		vNode = buildVirtualNodeWithRoutes(vNode);
		app.vdom = vNode;

		if (getIsFragment(vNode)) {
			const mountNodesFn = (vNode: VirtualNodeType) => container.appendChild(mount(vNode));
			vNode.children.forEach(mountNodesFn);
		} else {
			container.appendChild(mount(vNode));
		}

		app.queue.forEach(fn => fn());
		app.queue = [];
	} else if (isMounted) {
		const uid = Number(container.getAttribute(ATTR_ROOT_APP));
		const vNode = getVirtualDOM(uid);
		let nextVNode = null;

		setUIDActive(uid);
		setCurrentMountedComponentId(null);

		if (statelessComponentFactory.isStatelessComponent) {
			nextVNode = statelessComponentFactory.createElement();
		}

		if (statefullComponentFactory.isStatefullComponent) {
			nextVNode = wire(statefullComponentFactory);
		}

		vNode.route = [0];
		nextVNode = defragment(nextVNode);
		processDOM({ vNode, nextVNode, fragment: getIsFragment(nextVNode) });
	} else {
		setUIDMounted(uidMounted + 1);
		setCurrentMountedComponentId(null);
		renderComponent(componentFactory, container);
	}
}

export {
	renderComponent
}