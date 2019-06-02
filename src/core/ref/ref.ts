import { ComponentType } from '../component';
import { $$ref } from '../constants';
import { isFunction } from '../../helpers';


function createRef() {
	const creator = (elementRef: ComponentType | HTMLElement) => creator.current = elementRef || null;

	creator[$$ref] = true;
	creator.current = null;

	return creator;
}

function isRef(fn: Function) {
	if (!isFunction(fn)) return false;

	return fn[$$ref] === true;
}


export {
	createRef,
	isRef
}