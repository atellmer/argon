import { StatefullComponentFactoryType, StatelessComponentFactoryType, wire } from '../../../core/component/component';
import { EMPTY_REPLACER } from '../../../core/constants/constants';
import {
  createApp,
  getRegistery,
  getUIDActive,
  setCurrentMountedComponentId,
  setCurrentMountedRoute,
  setUIDActive,
} from '../../../core/scope/scope';
import { createCommentNode, createVirtualNode, getVirtualDOM, VirtualNodeType } from '../../../core/vdom/vdom';
import { isArray, isNull, isUndefined } from '../../../helpers';
import { mount, processDOM } from '../dom/dom';
import { makeEvents } from '../events/events';

const zoneIdByRootNodeMap = new WeakMap();
let renderInProcess = false;
let isInternalRenderCall = false;
let zoneCount = 0;

function createRootVirtualNode(sourceVNode: VirtualNodeType | Array<VirtualNodeType> | null): VirtualNodeType {
  let vNode = null;

  if (isNull(sourceVNode)) {
    sourceVNode = createCommentNode(EMPTY_REPLACER);
    sourceVNode.route = [0, 0];
  }

  vNode = createVirtualNode('TAG', {
    name: 'root',
    id: '0',
    route: [0],
    children: isArray(sourceVNode) ? [...sourceVNode] : [sourceVNode],
  });

  return vNode;
}

function renderComponent(
  componentFactory: StatefullComponentFactoryType | StatelessComponentFactoryType,
  container: HTMLElement,
) {
  const isMounted = !isUndefined(zoneIdByRootNodeMap.get(container));
  const statelessComponentFactory = componentFactory as StatelessComponentFactoryType;
  const statefullComponentFactory = componentFactory as StatefullComponentFactoryType;
  const prevZoneId = getUIDActive();
  let zoneId = 0;

  if (!renderInProcess) {
    renderInProcess = true;
  } else {
    isInternalRenderCall = true;
  }

  if (!isMounted) {
    zoneIdByRootNodeMap.set(container, zoneCount);
    zoneCount++;
  }

  zoneId = zoneIdByRootNodeMap.get(container);

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

    vNode = createRootVirtualNode(vNode);
    app.queue.push(() => makeEvents(vNode, zoneId));
    app.vdom = vNode;
    Array.from(mount(vNode).childNodes).forEach(node => container.appendChild(node));
    app.queue.forEach(fn => fn());
    app.queue = [];
    console.log('vNode: ', vNode)
  } else {
    const vNode = getVirtualDOM(zoneId);
    let nextVNode: VirtualNodeType = null;

    if (statelessComponentFactory.isStatelessComponent) {
      nextVNode = statelessComponentFactory.createElement();
    } else if (statefullComponentFactory.isStatefullComponent) {
      nextVNode = wire(statefullComponentFactory);
    }

    nextVNode = createRootVirtualNode(nextVNode);
    processDOM({ vNode, nextVNode });
  }

  if (!isInternalRenderCall) {
    renderInProcess = false;
  } else {
    isInternalRenderCall = false;
    setUIDActive(prevZoneId);
  }
}

export { renderComponent };
