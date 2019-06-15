import { VirtualNodeType, getAttribute } from '../../../core/vdom/vdom';
import { ATTR_FRAGMENT, ATTR_FRAGMENT_CHILD } from '../../../core/constants/constants';
import { dom } from '../dom/dom';
import { isArray, isNull, isEmpty, isObject } from '../../../helpers';
import { setAttribute } from '../../../core/vdom/vdom';


function fragment(nestedContent: VirtualNodeType | Array<VirtualNodeType>) {
	const list = (isArray(nestedContent) ? nestedContent : [nestedContent]) as Array<VirtualNodeType>;

	list.forEach(vNode => setAttribute(vNode, ATTR_FRAGMENT_CHILD, true));

	return dom`<fragment ${ATTR_FRAGMENT}="true">${list}</fragment>`;
}

function defragment(vNode: VirtualNodeType): VirtualNodeType {
	const defragmented = [];
	const mapChildrenFn = (vNode: VirtualNodeType) => vNode = defragment(vNode);
	const mapTransitChildrenFn = (vNode: VirtualNodeType) => {
		defragmented.push(...getIsFragment(vNode) ? vNode.children : [vNode]);
		defragmented.forEach(mapChildrenFn);
	};

	if (isNull(vNode)) return null;

	vNode.children.forEach(mapTransitChildrenFn);
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