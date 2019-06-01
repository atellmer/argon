import { ComponentTreeType } from '../../../core/component';
import { HashMap, VirtualNodeType } from '../../../core/shared';



/*
function dom(string: TemplateStringsArray, ...args: Array<any>) {
	const uid = getUidActive();
	const app = getRegistery().get(uid);
	const separator = NODE_SEPARATOR;
	const elements: Array<ElementReplacerType<any>> = [];
	const componentTree: ComponentTreeType = getComponentTree(uid);
	const id = getCurrMountedComponentId();
	let markup = string.join(separator);
	let sourceVNode = null;
	let vNode: VDOMNodeType = null;
	let needSnapshot = false;
	const componentTreeNode = componentTree[id];
	const instance = componentTreeNode.instance;
	const isComponent = (o: ComponentFactoryType) => isObject(o) && !isEmpty(o) && (o as ComponentFactoryType).isSpiderComponent === true;

	const mapArgsFn = (arg: any) => {
		let replacer = '';

		if (isComponent(arg)) {
			const componentFactory = arg as ComponentFactoryType;
			replacer = `<!--${COMPONENT_REPLACER}-->`;
			componentFactory.uid = uid;
			elements.push({ type: COMPONENT, value: componentFactory });
		} else if (isArray(arg) && isComponent(arg[0])) {
			const mapComponentsFn = (o: ComponentFactoryType) => (o.uid = uid, o);
			const componentFactoryList = arg.map(mapComponentsFn);
			replacer = `<!--${COMPONENT_LIST_REPLACER}-->`;
			elements.push({ type: COMPONENT_LIST, value: componentFactoryList });
		} else if (isArray(arg) && isVDOMNode(arg[0])) {
			replacer = `<!--${NODE_LIST_REPLACER}-->`;
			elements.push({ type: NODE_LIST, value: arg  });
		} else if (isVDOMNode(arg)) {
			replacer = `<!--${NODE_REPLACER}-->`;
			elements.push({ type: NODE, value: arg });
		} else if (isFunction(arg)) {
			if (!isRef(arg)) {
				replacer = EVENT_HANDLER_REPLACER;
				instance[$$eventHandlers].push(arg);
			} else {
				const hasSameRef = (ref: Function, refs: Array<Function>) => {
					const isSameRef = (comparedRef: Function) => comparedRef === ref;
					return refs.some(isSameRef);
				};
				if (!hasSameRef(arg, app.refs)) {
					app.refs.push(arg);
				}
				replacer = (app.refs.length - 1).toString();
			}
		} else if (isEmpty(arg) || arg === false) {
			replacer = `<!--${EMPTY_REPLACER}-->`;
		} else {
			replacer = arg;
		}

		markup = markup.replace(separator, replacer);
	};

	args.forEach(mapArgsFn);

	sourceVNode = createVirtualDOMFromSource(markup);
	sourceVNode = sourceVNode.length > 1 ? sourceVNode : sourceVNode[0];
	needSnapshot = !Boolean(getAttribute(sourceVNode, ATTR_IS_NODE));

	if (needSnapshot) {
		componentTree[id] = {
			...componentTree[id],
			prevSnapshot: componentTree[id].snapshot || null
		};
		componentTree[id] = {
			...componentTree[id],
			snapshot: createSnapshot(sourceVNode, elements)
		};
		componentTree[id] = {
			...componentTree[id],
			snapshotDiff: getSnapshotDiff(componentTree[id].prevSnapshot, componentTree[id].snapshot)
		};

		setComponentTree(uid, componentTree);
	} else {
		removeAttribute(sourceVNode, ATTR_IS_NODE);
	}

	vNode = mountVirtualDOM(sourceVNode, elements);

	const orderedIDList = vNode && vNode.children
		? vNode.children
				.map(n => getAttribute(n, ATTR_COMPONENT_ID))
				.filter(Boolean)
		: [];

	componentTree[id].instance[$$orderedIDList] = orderedIDList;

	return vNode;
}*/