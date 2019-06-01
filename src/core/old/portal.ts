
import { ComponentFactoryType, VDOMNodeType } from './types';
import { ATTR_PORTAL_ID , $$portal } from './constants';
import { getComponentTree, runDOMProcessor } from './dom';
import { createVirtualDOMFromSource } from './vdom';
import { getUidActive } from './scope';
import { isFunction } from '../helpers';


function createPortal(componentFactory: ComponentFactoryType, getContainerNode?: () => HTMLElement) {
	const mountPortal = (id: string, nextVNode: VDOMNodeType) => {
		const uid = getUidActive();
		const timeout = setTimeout(() => {
			clearTimeout(timeout);
			let $container = isFunction(getContainerNode) ? getContainerNode() : null;
			const portalId = `${uid}:${id}`;
			const componentTree = getComponentTree(uid);
			const componentTreeNode = componentTree[id];

			componentTreeNode && (componentTreeNode.instance[$$portal] = true);

			if (!$container) {
				$container = document.querySelector(`[${ATTR_PORTAL_ID}="${portalId}"]`);
				
				if (!$container) {
					$container = document.createElement('div');
					document.body.appendChild($container);
				}
			}

			const isMounted = Boolean($container.getAttribute(ATTR_PORTAL_ID));

			if (!isMounted) {
				$container.innerHTML = '';
				$container.setAttribute(ATTR_PORTAL_ID, portalId);
			}

			const vNode = createVirtualDOMFromSource($container.innerHTML)[0];

			runDOMProcessor(id, uid, vNode, nextVNode, $container, true);
		});
	}

	componentFactory.mountPortal = mountPortal;

	return componentFactory;
}


export {
	createPortal
}