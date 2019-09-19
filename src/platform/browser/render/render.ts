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
  let vNode = sourceVNode;

  if (isArray(vNode)) {
    vNode = createVirtualNode('TAG', {
      name: 'root',
      id: '0',
      route: [0],
      children: [...vNode],
    });
  } else if (isNull(vNode)) {
    vNode = createCommentNode(EMPTY_REPLACER);
    vNode.route = [0];
  }

  return vNode as VirtualNodeType;
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
    const mountedNode = mount(vNode);
    isArray(mountedNode)
      ? (mountedNode as Array<any>).forEach(node => container.appendChild(node))
      : container.appendChild(mountedNode as any);
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

    nextVNode = createRootVirtualNode(nextVNode);

    console.log('vNode: ', vNode)
    console.log('nextVNode: ', nextVNode)
    const isFragment = vNode.name === 'root' || nextVNode.name === 'root'

    processDOM({ vNode, nextVNode, fragment: isFragment });
  }

  if (!isInternalRenderCall) {
    renderInProcess = false;
  } else {
    isInternalRenderCall = false;
    setUIDActive(prevZoneId);
  }
}

export { renderComponent };
