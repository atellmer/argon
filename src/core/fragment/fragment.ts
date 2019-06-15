import { VirtualNodeType, getAttribute } from '../vdom/vdom';
import { ATTR_FRAGMENT, VDOM_ELEMENT_TYPES } from '../constants/constants';
import { isArray, isNull, isEmpty, isObject } from '../../helpers';
import { VirtualNodeTagType, setAttribute, createVirtualNode } from '../vdom/vdom';


function fragment(nestedContent: VirtualNodeType | Array<VirtualNodeType>) {
	const list = (isArray(nestedContent) ? nestedContent : [nestedContent]) as Array<VirtualNodeType>;

	//list.forEach(vNode => setAttribute(vNode, ATTR_FRAGMENT_CHILD, true));

	const vNode = createVirtualNode(VDOM_ELEMENT_TYPES.TAG as VirtualNodeTagType, {
		attrs: { [ATTR_FRAGMENT]: true },
		name: 'fragment',
		children: list
	});

	return vNode;
}

function defragment(vNode: VirtualNodeType): VirtualNodeType {
	const defragmented = [];
	const mapChildrenFn = (vNode: VirtualNodeType) => vNode = defragment(vNode);
	const mapTransitChildrenFn = (vNode: VirtualNodeType) => defragmented.push(...getIsFragment(vNode) ? vNode.children : [vNode]);

	if (isNull(vNode)) return null;

	vNode.children.forEach(mapTransitChildrenFn);
	defragmented.forEach(mapChildrenFn);
	vNode.children = defragmented;

	return vNode;
}

function getIsFragment(vNode: VirtualNodeType): boolean {
	return !isEmpty(vNode) && isObject(vNode) && Boolean(getAttribute(vNode as VirtualNodeType, ATTR_FRAGMENT));
}

export {
	fragment,
	defragment,
	getIsFragment
}