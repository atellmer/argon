export const $$name = Symbol('argon.name');
export const $$prevState = Symbol('argon.prevState');
export const $$prevProps = Symbol('argon.prevProps');
export const $$cache = Symbol('argon.cache');
export const $$elementType = Symbol('argon.elementType');
export const $$isMounted = Symbol('argon.isMounted');
export const $$id = Symbol('argon.id');
export const $$uid = Symbol('argon.uid');
export const $$root = Symbol('argon.root');
export const $$DOMElement = Symbol('argon.DOMElement');
export const $$markedIDMap = Symbol('argon.markedIDMap');
export const $$orderedIDList = Symbol('argon.orderedIDList');
export const $$getComponentSymbol = Symbol('argon.getComponentSymbol');
export const $$portal = Symbol('argon.portal');
export const $$ref = Symbol('argon.ref');

export const NODE_SEPARATOR = '@argon:value';
export const NODE_REPLACER = '@argon:node';
export const NODE_LIST_REPLACER = '@argon:node-list';
export const STATEFULL_COMPONENT_REPLACER = '@argon:statefull-component';
export const STATEFULL_COMPONENT_LIST_REPLACER = '@argon:statefull-component-list';
export const STATELESS_COMPONENT_REPLACER = '@argon:stateless-component';
export const STATELESS_COMPONENT_LIST_REPLACER = '@argon:stateless-component-list';
export const EVENT_HANDLER_REPLACER = '@argon:event';
export const EMPTY_REPLACER = '@argon:empty';
export const PORTAL_REPLACER = '@argon:portal';

export const NODE = 'NODE';
export const NODE_LIST = 'NODE_LIST';
export const STATEFULL_COMPONENT = 'STATEFULL_COMPONENT';
export const STATEFULL_COMPONENT_LIST = 'STATEFULL_COMPONENT_LIST';
export const STATELESS_COMPONENT = 'STATELESS_COMPONENT';
export const STATELESS_COMPONENT_LIST = 'STATELESS_COMPONENT_LIST';
export const QUEUE_EVENTS = 'QUEUE_EVENTS';

export const ATTR_ROOT_APP = 'data-argonroot';
export const ATTR_COMPONENT_ID = 'data-argonid';
export const ATTR_COMPONENT_NAME = 'data-argonname';
export const ATTR_PORTAL_ID = 'data-argonportalid';
export const ATTR_KEY = 'key';
export const ATTR_REF = 'ref';
export const ATTR_DONT_UPDATE_NODE = 'data-argondontupdate';
export const ATTR_FRAGMENT = 'data-argonfragment';

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
