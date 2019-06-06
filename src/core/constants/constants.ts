export const $$name = Symbol('name');
export const $$prevState = Symbol('prevState');
export const $$prevProps = Symbol('prevProps');
export const $$cache = Symbol('cache');
export const $$elementType = Symbol('elementType');
export const $$isMounted = Symbol('isMounted');
export const $$id = Symbol('id');
export const $$uid = Symbol('uidApp');
export const $$root = Symbol('root');
export const $$DOMElement = Symbol('DOMElement');
export const $$markedIDMap = Symbol('markedIDMap');
export const $$orderedIDList = Symbol('orderedIDList');
export const $$getComponentSymbol = Symbol('getComponentSymbol');
export const $$portal = Symbol('portal');
export const $$eventHandlers = Symbol('eventHandlers');
export const $$ref = Symbol('ref');

export const NODE_SEPARATOR = '@argon:value';
export const NODE_REPLACER = '@argon:node';
export const NODE_LIST_REPLACER = '@argon:node-list';
export const COMPONENT_REPLACER = '@argon:component';
export const STATELESS_COMPONENT_REPLACER = '@argon:stateless-component';
export const COMPONENT_LIST_REPLACER = '@argon:component-list';
export const EVENT_HANDLER_REPLACER = '@argon:event';
export const EMPTY_REPLACER = '@argon:empty';
export const PORTAL_REPLACER = '@argon:portal';

export const NODE = 'NODE';
export const NODE_LIST = 'NODE_LIST';
export const COMPONENT = 'COMPONENT';
export const COMPONENT_LIST = 'COMPONENT_LIST';
export const STATELESS_COMPONENT = 'STATELESS_COMPONENT';

export const ATTR_ROOT_APP = 'data-argonroot';
export const ATTR_COMPONENT_ID = 'data-argonid';
export const ATTR_COMPONENT_NAME = 'data-argonname';
export const ATTR_PORTAL_ID = 'data-argonportalid';
export const ATTR_KEY = 'key';
export const ATTR_REF = 'ref';
export const ATTR_DONT_UPDATE_NODE = 'data-argondontupdate';

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
