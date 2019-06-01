
import {
	VDOMNodeType,
	VDOMNodeTypeTagTuple,
	VDOMActionsType,
	VDOMDiffType
} from './types';
import {
	VDOM_ELEMENT_TYPES,
	VDOM_ACTIONS,
	ATTR_KEY,
	ATTR_PORTAL_ID,
	ATTR_COMPONENT_ID,
	ATTR_DONT_UPDATE_NODE
} from './constants';
import { isEmpty } from '../helpers';
import { getRegistery } from './scope';


const commentPattern = /<\!--(.*)-->/;
const attrPattern = /([\w-:]+)|["]{1}([^"]*)["]{1}/ig;
const tagPattern = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/ig;
const textPattern = /^\s*$/;
const voidTagsMap = {
	br: true,
	hr: true,
	img: true,
	input: true,
	link: true,
	meta: true,
	area: true,
	base: true,
	col: true,
	command: true,
	embed: true,
	keygen: true,
	param: true,
	source: true,
	track: true,
	wbr: true
};
const voidAttrsMap = {
	checked: true,
	selected: true,
	disabled: true,
	multiple: true,
	required: true,
	autofocus: true,
	hidden: true
};

function createTextNode(content: string): VDOMNodeType {
	return {
		type: VDOM_ELEMENT_TYPES.TEXT as VDOMNodeTypeTagTuple,
		isVNode: true,
		void: true,
		attrs: null,
		name: null,
		children: [],
		route: [],
		content,
	};
}

function createCommentNode(content: string): VDOMNodeType {
	return {
		type: VDOM_ELEMENT_TYPES.COMMENT as VDOMNodeTypeTagTuple,
		isVNode: true,
		void: true,
		name: null,
		attrs: null,
		children: [],
		route: [],
		content
	};
}

function createElement(tag: string): VDOMNodeType {
	let tagReplaced = false;
	let key = '';
	const element = {
		isVNode: true,
		type: VDOM_ELEMENT_TYPES.TAG as VDOMNodeTypeTagTuple,
		name: null,
		void: false,
		attrs: {},
		children: [],
		route: []
	};

	const replaceTag = (match: string) => {
		if (!tagReplaced) {
			if (voidTagsMap[match] || tag[tag.length - 2] === '/') {
				element.void = true;
			}

			element.name = match;
			tagReplaced = true;
		} else if (!/["]/g.test(match)) {
			key = match;
			if (voidAttrsMap[key]) {
				element.attrs[key] = true;
			}
		} else {
			element.attrs[key] = match.replace(/["]/g, '');
		}

		return '';
	};

	if (commentPattern.test(tag)) {
		const content = tag.match(commentPattern)[1];

		return createCommentNode(content);
	}

	tag.replace(attrPattern, replaceTag);

	return element;
};

function createVirtualDOMFromSource(source: string): Array<VDOMNodeType> {
	const result = [];
	const buffer = [];
	let element = null;
	let level = -1;
	const replaceSource = (tag: string, idx: number) => {
		const isOpen = tag[1] !== '/';
		const nextIdx = idx + tag.length;
		const nextChar = source[nextIdx];
		let parent = null;

		if (isOpen) {
			level++;
			element = createElement(tag);

			if (element.void === false && nextChar && nextChar !== '<') {
				const content = source.slice(nextIdx, source.indexOf('<', nextIdx));

				element.children.push(createTextNode(content));
			}

			if (level === 0) {
				result.push(element);
			}

			parent = buffer[level - 1] || null;

			if (parent) {
				parent.children.push(element);
			}

			buffer[level] = element;
		}

		if (!isOpen || element.void === true) {
			level--;

			if (nextChar !== '<' && nextChar) {
				parent = level === -1 ? result : buffer[level].children;

				const end = source.indexOf('<', nextIdx);
				const content = source.slice(nextIdx, end === -1 ? undefined : end);

				if (!textPattern.test(content)) {
					parent.push(createTextNode(content));
				}
			}
		}

		return '';
	};

	source.replace(tagPattern, replaceSource);

	return result;
}

function getVirtualDOM(uid: number): VDOMNodeType {
	return { ...getRegistery().get(uid).vdom };
};

function createDiffAction(action: string, route: Array<number> = [], oldValue: any, nextValue: any, keyRoute: Array<number> = []): VDOMDiffType {
	return {
		action: action as VDOMActionsType,
		route,
		keyRoute,
		oldValue,
		nextValue,
	};
}

function createAttribute(name: string, value: string | number | boolean) {
	return {
		[name]: value
	};
}

function getAttribute(vNode: VDOMNodeType, attrName: string): string {
	return vNode && vNode.type === VDOM_ELEMENT_TYPES.TAG && !isEmpty(vNode.attrs[attrName])
		? vNode.attrs[attrName]
		: null;
}

function setAttribute(vNode: VDOMNodeType, name: string, value: any) {
	vNode.type === VDOM_ELEMENT_TYPES.TAG && (vNode.attrs[name] = value);
}

function removeAttribute(vNode: VDOMNodeType, name: string) {
	vNode.type === VDOM_ELEMENT_TYPES.TAG && (delete vNode.attrs[name]);
}

function getNodeKey(vNode: VDOMNodeType): string {
	return getAttribute(vNode, ATTR_KEY);
}

function getParentNodeWithKeyRoute(route: Array<number>, targetVNode: VDOMNodeType) {
	let vNode = targetVNode;
	let mappedRoute = [];
	let keyRoute = [];

	const mapRoute = (cIdx: number, idx: number) => {
		if (idx > 0) {
			vNode = vNode.children[cIdx];
		}

		if (getNodeKey(vNode) && idx <= route.length - 1) {
			keyRoute = [...mappedRoute];
		}

		mappedRoute[idx] = cIdx;
	};

	route.forEach(mapRoute);

	return keyRoute;
}

function getVDOMDiff(
	VDOM: VDOMNodeType,
	nextVDOM: VDOMNodeType,
	includePortals: boolean = false,
	targetNextVDOM: VDOMNodeType = null,
	prevDiff: Array<VDOMDiffType> = [],
	prevRoute: Array<number> = [],
	level: number = 0,
	idx: number = 0): Array<VDOMDiffType> {
	let diff = [...prevDiff];
	const route = [...prevRoute];

	if (isEmpty(targetNextVDOM)) {
		targetNextVDOM = {...nextVDOM};
	}

	route[level] = idx;

	if (getAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE)) {
		removeAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE);
		return diff;
	}

	if (!VDOM && !nextVDOM) return diff;

	if (!includePortals && (Boolean(getAttribute(VDOM, ATTR_PORTAL_ID)) || Boolean(getAttribute(nextVDOM, ATTR_PORTAL_ID)))) {
		return diff;
	}

	if (!VDOM) {
		diff.push(createDiffAction(VDOM_ACTIONS.ADD_NODE, route, null, nextVDOM));
		return diff;
	} else if (!nextVDOM) {
		diff.push(createDiffAction(VDOM_ACTIONS.REMOVE_NODE, route, VDOM, null));
		return diff;
	} else if (VDOM.type !== nextVDOM.type || VDOM.name !== nextVDOM.name || VDOM.content !== nextVDOM.content) {
		diff.push(createDiffAction(VDOM_ACTIONS.REPLACE_NODE, route, VDOM, nextVDOM));
		return diff;
	} else {
		if (VDOM.attrs && nextVDOM.attrs) {
			const mapOldAttr = (attrName: string) => {
				if (isEmpty(nextVDOM.attrs[attrName])) {
					diff.push(createDiffAction(VDOM_ACTIONS.REMOVE_ATTRIBUTE, route, createAttribute(attrName, VDOM.attrs[attrName]), null));
				} else if (nextVDOM.attrs[attrName] !== VDOM.attrs[attrName]) {
					const keyRoute = attrName === ATTR_COMPONENT_ID
						? getParentNodeWithKeyRoute(route, targetNextVDOM)
						: [];
					const diffAction = createDiffAction(VDOM_ACTIONS.REPLACE_ATTRIBUTE, route, createAttribute(attrName, VDOM.attrs[attrName]), createAttribute(attrName, nextVDOM.attrs[attrName]), keyRoute);

					diff.push(diffAction);
				}
			};
			const mapNewAttr = (attrName: string) => {
				if (isEmpty(VDOM.attrs[attrName])) {
					diff.push(createDiffAction(VDOM_ACTIONS.ADD_ATTRIBUTE, route, null, createAttribute(attrName, nextVDOM.attrs[attrName])));
				}
			};
	
			Object.keys(VDOM.attrs).forEach(mapOldAttr);
			Object.keys(nextVDOM.attrs).forEach(mapNewAttr);
		}
	
		level++;

		const iterateVDOM = (vNode: VDOMNodeType, nextVNode: VDOMNodeType) => {
			const iterations = Math.max(vNode.children.length, nextVNode.children.length);

			for (let i = 0; i < iterations; i++) {
				const childVNode = VDOM.children[i];
				const childNextVNode = nextVDOM.children[i];

				if (getAttribute(childNextVNode, ATTR_DONT_UPDATE_NODE)) {
					removeAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE);
					continue;
				}

				diff = [...getVDOMDiff(childVNode, childNextVNode, includePortals, targetNextVDOM, diff, route, level, i)];
			}
		};

		const findKeyNode = (vNode: VDOMNodeType) => !isEmpty(getNodeKey(vNode));
		const enableDiffByKey = VDOM.children && nextVDOM.children
			?	VDOM.children.some(findKeyNode) && VDOM.children.length > nextVDOM.children.length
			: false;

		if (enableDiffByKey) {
			const filterNodeFn = (vNode: VDOMNodeType) => {
				const getDiffKeyFn = (compareVNode: VDOMNodeType) => getNodeKey(compareVNode) !== getNodeKey(vNode);
				return nextVDOM.children.every(getDiffKeyFn);
			};
			const diffNodeByKeyList = VDOM.children.filter(filterNodeFn);
			const mapNodeByKeyFn = (vNode: VDOMNodeType, idx: number) => {
				const findSameNodeFn = (compareVNode: VDOMNodeType) => compareVNode === vNode;
				const idxNode = VDOM.children.findIndex(findSameNodeFn);

				diff = [...getVDOMDiff(vNode, null, includePortals, targetNextVDOM, diff, [...route], level, idxNode - idx)]
			};

			diffNodeByKeyList.forEach(mapNodeByKeyFn);

			const filterDiffNodesFn = (vNode: VDOMNodeType) => {
				const compareNodeFn = (compareVNode: VDOMNodeType) => compareVNode !== vNode;
				return diffNodeByKeyList.every(compareNodeFn);
			};
			const immVNode = {
				...VDOM,
				children: VDOM.children.filter(filterDiffNodesFn)
			};
			const immNextVNode = {
				...nextVDOM,
				children: nextVDOM.children.filter(filterDiffNodesFn)
			};

			iterateVDOM(immVNode, immNextVNode);

			return diff;
		}

		iterateVDOM(VDOM, nextVDOM);
	}

	return diff;
}

function buildNodeWithRoutes(node: VDOMNodeType, prevRoute: Array<number> = [], level: number = 0, idx: number = 0, withExistsRoute: boolean = false): VDOMNodeType {
	const iterations = node.children.length;

	node.route = [...prevRoute];

	if (!withExistsRoute) {
		node.route[level] = idx;

		if (iterations > 0) {
			level++;
		}
	}

	for (let i = 0; i < iterations; i++) {
		node.children[i] = buildNodeWithRoutes(node.children[i], node.route, level, i);
	}

	return node;
}


export {
	createTextNode,
	createCommentNode,
	createElement,
	createVirtualDOMFromSource,
	getVirtualDOM,
	getVDOMDiff,
	getAttribute,
	setAttribute,
	removeAttribute,
	buildNodeWithRoutes
}
