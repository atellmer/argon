import {
	ATTR_ROOT_APP,
	$$id
} from '../../../core/constants';
import {
	createApp,
	getRegistery,
	getUIDMounted,
	setUIDMounted,
	setUIDActive,
	setCurrentMountedComponentId
} from '../../../core/scope';
import {
	ComponentFactoryType,
	wire,
	getComponentTree
} from '../../../core/component';
import {
	processDOM,
	mount
} from '../dom';


function renderComponent(componentFactory: ComponentFactoryType, container: HTMLElement) {
	const isMounted = Boolean(container.getAttribute(ATTR_ROOT_APP));
	const uidMounted = getUIDMounted();

	componentFactory.uid = uidMounted;

	if (!getRegistery().get(uidMounted)) {
		container.innerHTML = '';

		if (!container.getAttribute(ATTR_ROOT_APP)) {
			container.setAttribute(ATTR_ROOT_APP, uidMounted.toString());
		}

		const registry = getRegistery();
		const app = createApp(container);

		registry.set(uidMounted, app);
		setUIDActive(uidMounted);

		const vdom = wire(componentFactory);
		const node = mount(vdom);

		app.vdom = vdom;
		container.appendChild(node);
	} else if (isMounted) {
		const uid = Number(container.getAttribute(ATTR_ROOT_APP));
		const componentTree = getComponentTree(uid);
		const instance = componentTree['0'].instance;

		setCurrentMountedComponentId(null);
		processDOM(instance[$$id], uid, null, wire(componentFactory));
	} else {
		setUIDMounted(uidMounted + 1);
		setCurrentMountedComponentId(null);
		renderComponent(componentFactory, container);
	}
}


export {
	renderComponent
}