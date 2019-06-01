function isFunction(o) {
	return typeof o === 'function';
}

function isUndefined(o) {
	return typeof o === 'undefined';
}

function isNumber(o) {
	return typeof o === 'number';
}

function isObject(o) {
	return typeof o === 'object';
}

function isArray(o) {
	return Array.isArray(o);
}

function isNull(o) {
	return o === null;
}

function isEmpty(o) {
	return isNull(o) || isUndefined(o);
}

function getUniqList(list, fn) {
	const iniqList = [];

	list.forEach(el => {
		if (fn(el)) {
			iniqList.push(el);
		}
	});

	return iniqList;
}

function escapeTags(str) {
	const tagsToReplace = {
		'<': '&lt;',
		'>': '&gt;'
	};
	const replaceTag = (tag) => tagsToReplace[tag] || tag;

	return str.replace(/[<>]/g, replaceTag);
}

function sanitize(o = {}) {
	if (typeof o === 'string') {
		return escapeTags(o);
	} else if (typeof o === 'object' && o !== null) {
		Object.keys(o).forEach(key => {
			if (typeof o[key] === 'string') {
				o[key] = escapeTags(o[key]);
			} else if (typeof o[key] === 'object') {
				sanitize(o[key]);
			}
		});
	}

	return o;
}

function error(errStr) {
	throw new Error(errStr);
}

function isDOMElement(element) {
	return element instanceof Element || element instanceof HTMLDocument;  
}

function isVDOMNode(node: any) {
	return typeof node === 'object' &&  node.isVNode === true; 
}

function deepClone(obj: any) {
	const isObject = typeof obj === 'object';
	const copyObj = isObject
		? Array.isArray(obj)
			? [...obj]
			:	{...obj}
		: obj;
	const clonePropsFn = (prop: string) => copyObj[prop] = deepClone(copyObj[prop]);

	isObject && Object.keys(copyObj).forEach(clonePropsFn);

	return copyObj;
}


export {
	isFunction,
	isUndefined,
	isNumber,
	isObject,
	isArray,
	isNull,
	isEmpty,
	getUniqList,
	escapeTags,
	sanitize,
	error,
	isDOMElement,
	isVDOMNode,
	deepClone
}