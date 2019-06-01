import { HashMap, VDOMNodeType } from './types';
import { isUndefined } from '../helpers';


function memo(fn: (props: {}) => VDOMNodeType) {
	const cache: Map<any, VDOMNodeType> = new Map();
	const propMap: HashMap<Map<any, any>> = {};
	const memoIdMap: HashMap<number> = {};
	const applyFn = (props: any) => {
		let hash = '';
		const mapProps = (propName: string) => {
			const value =  props[propName];

			if (propName === 'key') return;

			if (!propMap[propName]) {
				propMap[propName] = new Map();
				memoIdMap[propName] = -1;
			}

			if (isUndefined(propMap[propName].get(value))) {
				propMap[propName].set(value, ++memoIdMap[propName]);
			}

			hash += '.' + propMap[propName].get(value);
		}

		Object.keys(props).forEach(mapProps);

		if (!cache.get(hash)) {
			cache.set(hash, fn(props));
		}

		return cache.get(hash);
	}

	return applyFn;
}


export {
	memo
}
