import {
	VirtualNodeType,
} from '../vdom';
import {
  StatelessComponentFactoryType,
  StatefullComponentFactoryType
} from '../component';
import { isObject, isEmpty } from '../../helpers';


type RepeatDirectiveType = {
	isRepeatDirective: boolean;
	items: Array<any>;
	createElement: (item: any, idx: number) => VirtualNodeType | Array<VirtualNodeType> | StatelessComponentFactoryType | StatefullComponentFactoryType;
}

type InsertDirectiveType = {
	isInsertDirective: boolean;
	createElement: () => VirtualNodeType | Array<VirtualNodeType> | StatelessComponentFactoryType | StatefullComponentFactoryType;
}

function repeat(items, createElement: (item: any, idx: number) => VirtualNodeType | Array<VirtualNodeType> | StatelessComponentFactoryType | StatefullComponentFactoryType): RepeatDirectiveType {
	return {
		isRepeatDirective: true,
		items,
		createElement
	};
}

function insert(createElement: () => VirtualNodeType | Array<VirtualNodeType> | StatelessComponentFactoryType | StatefullComponentFactoryType): InsertDirectiveType {
  return {
    isInsertDirective: true,
    createElement
  };
}

function isRepeatDirective(o: any) {
  return isObject(o) && !isEmpty(o) && o.isRepeatDirective === true;
}

function isInsertDirective(o: any) {
  return isObject(o) && !isEmpty(o) && o.isInsertDirective === true;
}


export {
  RepeatDirectiveType,
  InsertDirectiveType,
  repeat,
  insert,
  isRepeatDirective,
  isInsertDirective,
}
