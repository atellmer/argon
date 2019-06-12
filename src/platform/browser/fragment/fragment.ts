import { VirtualNodeType, getAttribute } from '../../../core/vdom/vdom';
import { ATTR_FRAGMENT } from '../../../core/constants/constants';
import { dom } from '../dom/dom';


function fragment(nestedContent: VirtualNodeType | Array<VirtualNodeType>) {
	return dom`
		<div ${ATTR_FRAGMENT}="true">
			${nestedContent}
		</div>
	`;
}

function getIsFragment(vNode: VirtualNodeType): boolean {
	return Boolean(getAttribute(vNode as VirtualNodeType, ATTR_FRAGMENT));
};


export {
	fragment,
	getIsFragment
}