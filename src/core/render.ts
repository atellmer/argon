import { AppType, ComponentFactoryType } from './types';
import {
	ATTR_ROOT_APP,
	$$id
} from './constants';
import {
	getRegistery,
	getUidMounted,
	setUidMounted,
	setUidActive,
	setCurrMountedComponentId
} from './scope';
import {
	wire,
	getComponentTree,
	runDOMProcessor,
	mount
} from './dom';


function renderComponent(componentFactory: ComponentFactoryType, container: HTMLElement) {
	const isMounted = Boolean(container.getAttribute(ATTR_ROOT_APP));
	const uidMounted = getUidMounted();

	componentFactory.uid = uidMounted;

	if (!getRegistery().get(uidMounted)) {
		container.innerHTML = '';

		if (!container.getAttribute(ATTR_ROOT_APP)) {
			container.setAttribute(ATTR_ROOT_APP, uidMounted.toString());
		}

		const registry = getRegistery();
		const app: AppType = {
			node: container,
			componentTree: {},
			vdom: null,
			eventHandlers: {},
			refs: [],
			queue: []
		};

		registry.set(uidMounted, app);
		setUidActive(uidMounted);

		const vdom = wire(componentFactory);
		const node = mount(vdom);

		app.vdom = vdom;
		container.appendChild(node);
	} else if (isMounted) {
		const uid = Number(container.getAttribute(ATTR_ROOT_APP));
		const componentTree = getComponentTree(uid);
		const instance = componentTree['0'].instance;

		setCurrMountedComponentId(null);
		runDOMProcessor(instance[$$id], uid, null, wire(componentFactory));
	} else {
		setUidMounted(uidMounted + 1);
		setCurrMountedComponentId(null);
		renderComponent(componentFactory, container);
	}
}


export {
	renderComponent
}