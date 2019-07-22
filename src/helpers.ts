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

function escapeTags(str: string) {
	const map = {
		'<': '\u02c2',
		'>': '\u02c3',
		'/': '\u002f',
		'&': '\u0026',
		//'"': '\u02ba',
		'\'': '\u02b9',
	};

	return str.replace(/(.)/gm, (char: string) => map[char] || char);
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

function flatten(arr: Array<any>): Array<any> {
	const list = arr.reduce((acc, el) => {
		if (isArray(el)) {
			acc.push(...(el as any));
		} else {
			acc.push(el);
		}

		return acc;
	}, []);

	return list;
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
	deepClone,
	flatten
}