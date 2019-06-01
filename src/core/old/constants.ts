export const NODE_SEPARATOR = '@@spider:{{}}';
export const NODE_REPLACER = '@@spider:node';
export const NODE_LIST_REPLACER = '@@spider:node-list';
export const PORTAL_REPLACER = '@@spider:portal';
export const COMPONENT_REPLACER = '@@spider:component';
export const COMPONENT_LIST_REPLACER = '@@spider:component-list';
export const EVENT_HANDLER_REPLACER = '@@spider:{{event-handler}}';
export const EMPTY_REPLACER = '@@spider:empty';
export const NODE = 'NODE';
export const NODE_LIST = 'NODE_LIST';
export const COMPONENT = 'COMPONENT';
export const COMPONENT_LIST = 'COMPONENT_LIST';

export const SNAPSHOT_DIFF = {
	EQUALS: 'EQUALS',
	ADD: 'ADD',
	REMOVE: 'REMOVE'
};

export const AUTOGEN_INSTANCE_KEY = '@@spider:autokey';

export const ATTR_ROOT_APP = 'data-spiderroot';
export const ATTR_COMPONENT_ID = 'data-spiderid';
export const ATTR_COMPONENT_NAME = 'data-spidername';
export const ATTR_PORTAL_ID = 'data-spiderportalid';
export const ATTR_KEY = 'data-key';
export const ATTR_REF = 'ref';
export const ATTR_IS_NODE = 'is:node';
export const ATTR_DONT_UPDATE_NODE = '@@spider:dontUpdateNode';

export const VDOM_ELEMENT_TYPES = {
	COMMENT: 'COMMENT',
	TAG: 'TAG',
	TEXT: 'TEXT'
};

export const VDOM_ACTIONS = {
	ADD_NODE: 'ADD_NODE',
	REMOVE_NODE: 'REMOVE_NODE',
	REPLACE_NODE: 'REPLACE_NODE',
	ADD_ATTRIBUTE: 'ADD_ATTRIBUTE',
	REMOVE_ATTRIBUTE: 'REMOVE_ATTRIBUTE',
	REPLACE_ATTRIBUTE: 'REPLACE_ATTRIBUTE'
};

export const $$name = Symbol('$$name');
export const $$prevState = Symbol('$$prevState');
export const $$prevProps = Symbol('$$prevProps');
export const $$cache = Symbol('$$cache');
export const $$elementType = Symbol('$$elementType');
export const $$isMounted = Symbol('$$isMounted');
export const $$id = Symbol('$$id');
export const $$uid = Symbol('$$uidApp');
export const $$root = Symbol('$$root');
export const $$DOMElement = Symbol('$$DOMElement');
export const $$markedIDMap = Symbol('$$markedIDMap');
export const $$orderedIDList = Symbol('$$orderedIDList');
export const $$getComponentSymbol = Symbol('$$getComponentSymbol');
export const $$portal = Symbol('$$portal');
export const $$eventHandlers = Symbol('$$eventHandlers');
export const $$ref = Symbol('$$ref');
