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
import { createCommentNode, getVirtualDOM, VirtualNodeType } from '../../../core/vdom/vdom';
import { isNull, isUndefined } from '../../../helpers';
import { mount, processDOM } from '../dom/dom';
import { makeEvents } from '../events/events';


const zoneIdByRootNodeMap = new WeakMap();
let renderInProcess = false;
let isInternalRenderCall = false;
let zoneCount = 0;

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

    if (isNull(vNode)) {
      vNode = createCommentNode(EMPTY_REPLACER);
      vNode.route = [0];
    }

    app.queue.push(() => makeEvents(vNode, zoneId));
    app.vdom = vNode;
    container.appendChild(mount(vNode));
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
