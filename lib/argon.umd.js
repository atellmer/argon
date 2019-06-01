(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Argon", [], factory);
	else if(typeof exports === 'object')
		exports["Argon"] = factory();
	else
		root["Argon"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/helpers.ts
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
    var iniqList = [];
    list.forEach(function (el) {
        if (fn(el)) {
            iniqList.push(el);
        }
    });
    return iniqList;
}
function escapeTags(str) {
    var tagsToReplace = {
        '<': '&lt;',
        '>': '&gt;'
    };
    var replaceTag = function (tag) { return tagsToReplace[tag] || tag; };
    return str.replace(/[<>]/g, replaceTag);
}
function sanitize(o) {
    if (o === void 0) { o = {}; }
    if (typeof o === 'string') {
        return escapeTags(o);
    }
    else if (typeof o === 'object' && o !== null) {
        Object.keys(o).forEach(function (key) {
            if (typeof o[key] === 'string') {
                o[key] = escapeTags(o[key]);
            }
            else if (typeof o[key] === 'object') {
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
function isVDOMNode(node) {
    return typeof node === 'object' && node.isVNode === true;
}
function deepClone(obj) {
    var isObject = typeof obj === 'object';
    var copyObj = isObject
        ? Array.isArray(obj)
            ? __spread(obj) : __assign({}, obj)
        : obj;
    var clonePropsFn = function (prop) { return copyObj[prop] = deepClone(copyObj[prop]); };
    isObject && Object.keys(copyObj).forEach(clonePropsFn);
    return copyObj;
}


// CONCATENATED MODULE: ./src/core/constants.ts
var NODE_SEPARATOR = '@@spider:{{}}';
var NODE_REPLACER = '@@spider:node';
var NODE_LIST_REPLACER = '@@spider:node-list';
var PORTAL_REPLACER = '@@spider:portal';
var COMPONENT_REPLACER = '@@spider:component';
var COMPONENT_LIST_REPLACER = '@@spider:component-list';
var EVENT_HANDLER_REPLACER = '@@spider:{{event-handler}}';
var EMPTY_REPLACER = '@@spider:empty';
var NODE = 'NODE';
var NODE_LIST = 'NODE_LIST';
var COMPONENT = 'COMPONENT';
var COMPONENT_LIST = 'COMPONENT_LIST';
var SNAPSHOT_DIFF = {
    EQUALS: 'EQUALS',
    ADD: 'ADD',
    REMOVE: 'REMOVE'
};
var AUTOGEN_INSTANCE_KEY = '@@spider:autokey';
var ATTR_ROOT_APP = 'data-spiderroot';
var ATTR_COMPONENT_ID = 'data-spiderid';
var ATTR_COMPONENT_NAME = 'data-spidername';
var ATTR_PORTAL_ID = 'data-spiderportalid';
var ATTR_KEY = 'data-key';
var ATTR_REF = 'ref';
var ATTR_IS_NODE = 'is:node';
var ATTR_DONT_UPDATE_NODE = '@@spider:dontUpdateNode';
var VDOM_ELEMENT_TYPES = {
    COMMENT: 'COMMENT',
    TAG: 'TAG',
    TEXT: 'TEXT'
};
var VDOM_ACTIONS = {
    ADD_NODE: 'ADD_NODE',
    REMOVE_NODE: 'REMOVE_NODE',
    REPLACE_NODE: 'REPLACE_NODE',
    ADD_ATTRIBUTE: 'ADD_ATTRIBUTE',
    REMOVE_ATTRIBUTE: 'REMOVE_ATTRIBUTE',
    REPLACE_ATTRIBUTE: 'REPLACE_ATTRIBUTE'
};
var $$name = Symbol('$$name');
var $$prevState = Symbol('$$prevState');
var $$prevProps = Symbol('$$prevProps');
var $$cache = Symbol('$$cache');
var $$elementType = Symbol('$$elementType');
var $$isMounted = Symbol('$$isMounted');
var $$id = Symbol('$$id');
var $$uid = Symbol('$$uidApp');
var $$root = Symbol('$$root');
var $$DOMElement = Symbol('$$DOMElement');
var $$markedIDMap = Symbol('$$markedIDMap');
var $$orderedIDList = Symbol('$$orderedIDList');
var $$getComponentSymbol = Symbol('$$getComponentSymbol');
var $$portal = Symbol('$$portal');
var $$eventHandlers = Symbol('$$eventHandlers');
var $$ref = Symbol('$$ref');

// CONCATENATED MODULE: ./src/core/scope.ts
var scope = createScope();
var getRegistery = function () { return scope.registery; };
var setRegistery = function (changed) { return scope.registery = changed; };
var getUidMounted = function () { return scope.uid.mounted; };
var setUidMounted = function (changed) { return scope.uid.mounted = changed; };
var getUidActive = function () { return scope.uid.active; };
var setUidActive = function (changed) { return scope.uid.active = changed; };
var getCurrMountedComponentId = function () { return scope.currMountedComponentId; };
var setCurrMountedComponentId = function (changed) { return scope.currMountedComponentId = changed; };
function createScope() {
    return {
        registery: new Map(),
        uid: {
            mounted: 0,
            active: 0
        },
        currMountedComponentId: null
    };
}
function unmount() {
    Array
        .from(scope.registery.keys())
        .forEach(function (uid) { return scope.registery.get(uid).node.innerHTML = ''; });
    scope = createScope();
}


// CONCATENATED MODULE: ./src/core/events.ts
var events_read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};



function makeEvents(vNode, instanceID, uid) {
    var app = getRegistery().get(uid);
    var instance = getComponentTree(uid)[instanceID].instance;
    var rootEl = app.node;
    if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
        var filterNodeFn = function (n) { return n.type === VDOM_ELEMENT_TYPES.TAG; };
        var getKey = function (key) { return key; };
        var attrNames = Object.keys(vNode.attrs).map(getKey) || [];
        var chidren = vNode.children.filter(filterNodeFn);
        var mapAttrsFn = function (attrName) {
            if (vNode.attrs[attrName] === EVENT_HANDLER_REPLACER && /^on:/.test(attrName)) {
                var nodeID = vNode.route.join('.');
                var key = instanceID + ":" + nodeID;
                var eventName = attrName.slice(3, attrName.length);
                var savedHandler = instance[$$eventHandlers][0];
                delegateEvent(rootEl, uid, key, nodeID, eventName, savedHandler);
                instance[$$eventHandlers].splice(0, 1);
                delete vNode.attrs[attrName];
            }
        };
        var mapNodesFn = function (vNode) {
            var componentId = vNode.attrs[ATTR_COMPONENT_ID];
            var isComponentNode = Boolean(componentId);
            !isComponentNode && makeEvents(vNode, instanceID, uid);
        };
        attrNames.forEach(mapAttrsFn);
        chidren.forEach(mapNodesFn);
    }
}
function delegateEvent(rootEl, uid, key, nodeID, eventName, handler) {
    var app = getRegistery().get(uid);
    var eventHandler = function (e) {
        var _a = events_read(getDOMElementRoute(rootEl, e.target), 1), route = _a[0];
        route.shift();
        nodeID === route.join('.') && handler(e);
    };
    if (!app.eventHandlers[key]) {
        app.eventHandlers[key] = {};
    }
    if (!app.eventHandlers[key][eventName]) {
        app.eventHandlers[key][eventName] = {
            addEvent: null,
            removeEvent: null
        };
    }
    app.eventHandlers[key][eventName].removeEvent && app.eventHandlers[key][eventName].removeEvent();
    app.eventHandlers[key][eventName] = {
        addEvent: function () { return rootEl.addEventListener(eventName, eventHandler); },
        removeEvent: function () { return rootEl.removeEventListener(eventName, eventHandler); }
    };
    app.eventHandlers[key][eventName].addEvent();
}


// CONCATENATED MODULE: ./src/core/component.ts
var component_assign = (undefined && undefined.__assign) || function () {
    component_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return component_assign.apply(this, arguments);
};




function getInitialState(def) {
    if (isFunction(def.getInitialState)) {
        var initialState = sanitize(def.getInitialState());
        return component_assign({}, initialState);
    }
    return {};
}
function getDefaultProps(def) {
    if (isFunction(def.getDefaultProps)) {
        var defaultProp = sanitize(def.getDefaultProps());
        return component_assign({}, defaultProp);
    }
    return {};
}
function forceUpdate(instance, params) {
    if (params === void 0) { params = { beforeRender: function () { }, afterRender: function () { } }; }
    var beforeRender = params.beforeRender, afterRender = params.afterRender;
    var id = instance[$$id];
    var uid = instance[$$uid];
    instance[$$markedIDMap] = {};
    setCurrMountedComponentId(id);
    setUidActive(instance[$$uid]);
    beforeRender();
    runDOMProcessor(id, uid);
    afterRender();
}
function createComponent(def) {
    var $$component = Symbol(def.displayName);
    var config = def.config || { pure: false };
    var Component = function () {
        var _this = this;
        Object.keys(def).forEach(function (key) { return _this[key] = def[key]; });
        this[$$name] = def.displayName;
        this[$$elementType] = $$component;
        this[$$id] = '';
        this[$$cache] = new Map();
        this[$$markedIDMap] = {};
        this[$$orderedIDList] = [];
        this.state = getInitialState(def);
        this.props = getDefaultProps(def);
        this[$$prevState] = component_assign({}, this.state);
        this[$$prevProps] = component_assign({}, this.props);
        this[$$isMounted] = false;
        this[$$portal] = false;
        this[$$getComponentSymbol] = function () { return $$component; };
        this[$$eventHandlers] = [];
        this.setState = function (state, onRender) {
            if (onRender === void 0) { onRender = function () { }; }
            var mergedState = component_assign({}, _this.state, sanitize(state));
            if (!_this.shouldUpdate(_this.props, component_assign({}, mergedState)))
                return;
            _this[$$prevState] = component_assign({}, _this.state);
            _this.state = component_assign({}, mergedState);
            _this.forceUpdate(onRender);
        };
        this.forceUpdate = function (onRender) {
            if (onRender === void 0) { onRender = function () { }; }
            forceUpdate(_this, {
                beforeRender: function () {
                    _this.willUpdate(_this.props, _this.state);
                },
                afterRender: function () {
                    _this.didUpdate(_this.props, component_assign({}, _this[$$prevState]));
                    onRender();
                }
            });
        },
            this.willMount = this.willMount || (function () { });
        this.didMount = this.didMount || (function () { });
        this.willReceiveProps = this.willReceiveProps || (function () { });
        this.shouldUpdate = this.shouldUpdate || (function () { return true; });
        this.willUpdate = this.willUpdate || (function () { });
        this.didUpdate = this.didUpdate || (function () { });
        this.willUnmount = this.willUnmount || (function () { });
        this.render = this.render || (function () { return error('render method does not exist!'); });
    };
    return function (props) {
        if (props === void 0) { props = {}; }
        var factory = {
            isSpiderComponent: true,
            is: $$component.toString(),
            createInstance: function () { return new Component(); },
            getComponentSymbol: function () { return $$component; },
            uid: 0,
            config: config,
            mountPortal: null,
            props: component_assign({}, getDefaultProps(def), props),
        };
        return factory;
    };
}
function unmountComponent(id, uid, parentInstance) {
    if (parentInstance === void 0) { parentInstance = null; }
    var app = getRegistery().get(uid);
    var componentTree = getComponentTree(uid);
    var vDOMNode = componentTree[id];
    var instance = vDOMNode.instance;
    var elementType = instance[$$getComponentSymbol]();
    var componentCache = null;
    var parentVDOMNode = null;
    instance.props.ref && instance.props.ref(null);
    parentInstance = parentInstance || componentTree[vDOMNode.parentId].instance;
    parentVDOMNode = componentTree[parentInstance[$$id]];
    componentCache = parentInstance[$$cache].get(elementType);
    delete componentTree[id];
    setComponentTree(uid, componentTree);
    var mapCacheFn = function (comparedInstance, key) {
        if (comparedInstance === instance) {
            var idx = parentInstance[$$orderedIDList].findIndex(function (cid) { return cid === id; });
            componentCache.delete(key);
            parentInstance[$$orderedIDList].splice(idx, 1);
        }
    };
    var mapComponentsFn = function (id) { return unmountComponent(id, uid, instance); };
    componentCache.forEach(mapCacheFn);
    parentInstance[$$cache].set(elementType, componentCache);
    Object.keys(vDOMNode.childrenIdMap).forEach(mapComponentsFn);
    if (parentVDOMNode) {
        delete parentVDOMNode.childrenIdMap[id];
    }
    instance.willUnmount();
    var mapHandlersFn = function (key) {
        var comparedId = key.split(':')[0];
        if (comparedId === id) {
            var mapEventsFn = function (eventName) { return app.eventHandlers[key][eventName].removeEvent(); };
            Object.keys(app.eventHandlers[key]).forEach(mapEventsFn);
            delete app.eventHandlers[key];
        }
    };
    Object.keys(app.eventHandlers).forEach(mapHandlersFn);
    if (instance[$$portal]) {
        var portalId = instance[$$uid] + ":" + id;
        var $portalContainer = document.querySelector("[" + ATTR_PORTAL_ID + "=\"" + portalId + "\"]");
        if ($portalContainer) {
            if ($portalContainer.parentElement !== document.body) {
                $portalContainer.removeAttribute(ATTR_PORTAL_ID);
                $portalContainer.innerHTML = '';
            }
            else {
                $portalContainer.parentElement.removeChild($portalContainer);
            }
        }
    }
    getRegistery().set(uid, app);
}


// CONCATENATED MODULE: ./src/core/vdom.ts
var vdom_assign = (undefined && undefined.__assign) || function () {
    vdom_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return vdom_assign.apply(this, arguments);
};
var vdom_read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var vdom_spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(vdom_read(arguments[i]));
    return ar;
};



var commentPattern = /<\!--(.*)-->/;
var attrPattern = /([\w-:]+)|["]{1}([^"]*)["]{1}/ig;
var tagPattern = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/ig;
var textPattern = /^\s*$/;
var voidTagsMap = {
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
var voidAttrsMap = {
    checked: true,
    selected: true,
    disabled: true,
    multiple: true,
    required: true,
    autofocus: true,
    hidden: true
};
function createTextNode(content) {
    return {
        type: VDOM_ELEMENT_TYPES.TEXT,
        isVNode: true,
        void: true,
        attrs: null,
        name: null,
        children: [],
        route: [],
        content: content,
    };
}
function createCommentNode(content) {
    return {
        type: VDOM_ELEMENT_TYPES.COMMENT,
        isVNode: true,
        void: true,
        name: null,
        attrs: null,
        children: [],
        route: [],
        content: content
    };
}
function createElement(tag) {
    var tagReplaced = false;
    var key = '';
    var element = {
        isVNode: true,
        type: VDOM_ELEMENT_TYPES.TAG,
        name: null,
        void: false,
        attrs: {},
        children: [],
        route: []
    };
    var replaceTag = function (match) {
        if (!tagReplaced) {
            if (voidTagsMap[match] || tag[tag.length - 2] === '/') {
                element.void = true;
            }
            element.name = match;
            tagReplaced = true;
        }
        else if (!/["]/g.test(match)) {
            key = match;
            if (voidAttrsMap[key]) {
                element.attrs[key] = true;
            }
        }
        else {
            element.attrs[key] = match.replace(/["]/g, '');
        }
        return '';
    };
    if (commentPattern.test(tag)) {
        var content = tag.match(commentPattern)[1];
        return createCommentNode(content);
    }
    tag.replace(attrPattern, replaceTag);
    return element;
}
;
function createVirtualDOMFromSource(source) {
    var result = [];
    var buffer = [];
    var element = null;
    var level = -1;
    var replaceSource = function (tag, idx) {
        var isOpen = tag[1] !== '/';
        var nextIdx = idx + tag.length;
        var nextChar = source[nextIdx];
        var parent = null;
        if (isOpen) {
            level++;
            element = createElement(tag);
            if (element.void === false && nextChar && nextChar !== '<') {
                var content = source.slice(nextIdx, source.indexOf('<', nextIdx));
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
                var end = source.indexOf('<', nextIdx);
                var content = source.slice(nextIdx, end === -1 ? undefined : end);
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
function getVirtualDOM(uid) {
    return vdom_assign({}, getRegistery().get(uid).vdom);
}
;
function createDiffAction(action, route, oldValue, nextValue, keyRoute) {
    if (route === void 0) { route = []; }
    if (keyRoute === void 0) { keyRoute = []; }
    return {
        action: action,
        route: route,
        keyRoute: keyRoute,
        oldValue: oldValue,
        nextValue: nextValue,
    };
}
function createAttribute(name, value) {
    var _a;
    return _a = {},
        _a[name] = value,
        _a;
}
function getAttribute(vNode, attrName) {
    return vNode && vNode.type === VDOM_ELEMENT_TYPES.TAG && !isEmpty(vNode.attrs[attrName])
        ? vNode.attrs[attrName]
        : null;
}
function setAttribute(vNode, name, value) {
    vNode.type === VDOM_ELEMENT_TYPES.TAG && (vNode.attrs[name] = value);
}
function removeAttribute(vNode, name) {
    vNode.type === VDOM_ELEMENT_TYPES.TAG && (delete vNode.attrs[name]);
}
function getNodeKey(vNode) {
    return getAttribute(vNode, ATTR_KEY);
}
function getParentNodeWithKeyRoute(route, targetVNode) {
    var vNode = targetVNode;
    var mappedRoute = [];
    var keyRoute = [];
    var mapRoute = function (cIdx, idx) {
        if (idx > 0) {
            vNode = vNode.children[cIdx];
        }
        if (getNodeKey(vNode) && idx <= route.length - 1) {
            keyRoute = vdom_spread(mappedRoute);
        }
        mappedRoute[idx] = cIdx;
    };
    route.forEach(mapRoute);
    return keyRoute;
}
function getVDOMDiff(VDOM, nextVDOM, includePortals, targetNextVDOM, prevDiff, prevRoute, level, idx) {
    if (includePortals === void 0) { includePortals = false; }
    if (targetNextVDOM === void 0) { targetNextVDOM = null; }
    if (prevDiff === void 0) { prevDiff = []; }
    if (prevRoute === void 0) { prevRoute = []; }
    if (level === void 0) { level = 0; }
    if (idx === void 0) { idx = 0; }
    var diff = vdom_spread(prevDiff);
    var route = vdom_spread(prevRoute);
    if (isEmpty(targetNextVDOM)) {
        targetNextVDOM = vdom_assign({}, nextVDOM);
    }
    route[level] = idx;
    if (getAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE)) {
        removeAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE);
        return diff;
    }
    if (!VDOM && !nextVDOM)
        return diff;
    if (!includePortals && (Boolean(getAttribute(VDOM, ATTR_PORTAL_ID)) || Boolean(getAttribute(nextVDOM, ATTR_PORTAL_ID)))) {
        return diff;
    }
    if (!VDOM) {
        diff.push(createDiffAction(VDOM_ACTIONS.ADD_NODE, route, null, nextVDOM));
        return diff;
    }
    else if (!nextVDOM) {
        diff.push(createDiffAction(VDOM_ACTIONS.REMOVE_NODE, route, VDOM, null));
        return diff;
    }
    else if (VDOM.type !== nextVDOM.type || VDOM.name !== nextVDOM.name || VDOM.content !== nextVDOM.content) {
        diff.push(createDiffAction(VDOM_ACTIONS.REPLACE_NODE, route, VDOM, nextVDOM));
        return diff;
    }
    else {
        if (VDOM.attrs && nextVDOM.attrs) {
            var mapOldAttr = function (attrName) {
                if (isEmpty(nextVDOM.attrs[attrName])) {
                    diff.push(createDiffAction(VDOM_ACTIONS.REMOVE_ATTRIBUTE, route, createAttribute(attrName, VDOM.attrs[attrName]), null));
                }
                else if (nextVDOM.attrs[attrName] !== VDOM.attrs[attrName]) {
                    var keyRoute = attrName === ATTR_COMPONENT_ID
                        ? getParentNodeWithKeyRoute(route, targetNextVDOM)
                        : [];
                    var diffAction = createDiffAction(VDOM_ACTIONS.REPLACE_ATTRIBUTE, route, createAttribute(attrName, VDOM.attrs[attrName]), createAttribute(attrName, nextVDOM.attrs[attrName]), keyRoute);
                    diff.push(diffAction);
                }
            };
            var mapNewAttr = function (attrName) {
                if (isEmpty(VDOM.attrs[attrName])) {
                    diff.push(createDiffAction(VDOM_ACTIONS.ADD_ATTRIBUTE, route, null, createAttribute(attrName, nextVDOM.attrs[attrName])));
                }
            };
            Object.keys(VDOM.attrs).forEach(mapOldAttr);
            Object.keys(nextVDOM.attrs).forEach(mapNewAttr);
        }
        level++;
        var iterateVDOM = function (vNode, nextVNode) {
            var iterations = Math.max(vNode.children.length, nextVNode.children.length);
            for (var i = 0; i < iterations; i++) {
                var childVNode = VDOM.children[i];
                var childNextVNode = nextVDOM.children[i];
                if (getAttribute(childNextVNode, ATTR_DONT_UPDATE_NODE)) {
                    removeAttribute(nextVDOM, ATTR_DONT_UPDATE_NODE);
                    continue;
                }
                diff = vdom_spread(getVDOMDiff(childVNode, childNextVNode, includePortals, targetNextVDOM, diff, route, level, i));
            }
        };
        var findKeyNode = function (vNode) { return !isEmpty(getNodeKey(vNode)); };
        var enableDiffByKey = VDOM.children && nextVDOM.children
            ? VDOM.children.some(findKeyNode) && VDOM.children.length > nextVDOM.children.length
            : false;
        if (enableDiffByKey) {
            var filterNodeFn = function (vNode) {
                var getDiffKeyFn = function (compareVNode) { return getNodeKey(compareVNode) !== getNodeKey(vNode); };
                return nextVDOM.children.every(getDiffKeyFn);
            };
            var diffNodeByKeyList_1 = VDOM.children.filter(filterNodeFn);
            var mapNodeByKeyFn = function (vNode, idx) {
                var findSameNodeFn = function (compareVNode) { return compareVNode === vNode; };
                var idxNode = VDOM.children.findIndex(findSameNodeFn);
                diff = vdom_spread(getVDOMDiff(vNode, null, includePortals, targetNextVDOM, diff, vdom_spread(route), level, idxNode - idx));
            };
            diffNodeByKeyList_1.forEach(mapNodeByKeyFn);
            var filterDiffNodesFn = function (vNode) {
                var compareNodeFn = function (compareVNode) { return compareVNode !== vNode; };
                return diffNodeByKeyList_1.every(compareNodeFn);
            };
            var immVNode = vdom_assign({}, VDOM, { children: VDOM.children.filter(filterDiffNodesFn) });
            var immNextVNode = vdom_assign({}, nextVDOM, { children: nextVDOM.children.filter(filterDiffNodesFn) });
            iterateVDOM(immVNode, immNextVNode);
            return diff;
        }
        iterateVDOM(VDOM, nextVDOM);
    }
    return diff;
}
function buildNodeWithRoutes(node, prevRoute, level, idx, withExistsRoute) {
    if (prevRoute === void 0) { prevRoute = []; }
    if (level === void 0) { level = 0; }
    if (idx === void 0) { idx = 0; }
    if (withExistsRoute === void 0) { withExistsRoute = false; }
    var iterations = node.children.length;
    node.route = vdom_spread(prevRoute);
    if (!withExistsRoute) {
        node.route[level] = idx;
        if (iterations > 0) {
            level++;
        }
    }
    for (var i = 0; i < iterations; i++) {
        node.children[i] = buildNodeWithRoutes(node.children[i], node.route, level, i);
    }
    return node;
}


// CONCATENATED MODULE: ./src/core/ref.ts


function createRef() {
    var creator = function (elementRef) { return creator.current = elementRef || null; };
    creator[$$ref] = true;
    creator.current = null;
    return creator;
}
function isRef(fn) {
    if (!isFunction(fn))
        return false;
    return fn[$$ref] === true;
}


// CONCATENATED MODULE: ./src/core/dom.ts
var dom_assign = (undefined && undefined.__assign) || function () {
    dom_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return dom_assign.apply(this, arguments);
};
var __values = (undefined && undefined.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var dom_read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var dom_spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(dom_read(arguments[i]));
    return ar;
};







function mount(vdom, parentNode) {
    if (parentNode === void 0) { parentNode = null; }
    var e_1, _a;
    var container = parentNode;
    var uid = getUidActive();
    var mapVDOM = function (vNode) {
        if (!vNode)
            return;
        if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
            var DOMElement_1 = document.createElement(vNode.name);
            var mapAttrs = function (attrName) { return DOMElement_1.setAttribute(attrName, vNode.attrs[attrName]); };
            Object.keys(vNode.attrs).forEach(mapAttrs);
            var refId = DOMElement_1.getAttribute(ATTR_REF);
            if (parseInt(refId) >= 0) {
                var refs = getRegistery().get(uid).refs;
                if (refs[refId]) {
                    refs[refId](DOMElement_1);
                }
                ;
                DOMElement_1.removeAttribute(ATTR_REF);
            }
            if (container) {
                container.appendChild(DOMElement_1);
                !vNode.void && container.appendChild(mount(vNode.children, DOMElement_1));
            }
            else {
                container = DOMElement_1;
                container = mount(vNode.children, container);
            }
        }
        else if (vNode.type === VDOM_ELEMENT_TYPES.TEXT) {
            if (container) {
                container.appendChild(document.createTextNode(vNode.content));
            }
            else {
                container = document.createTextNode(vNode.content);
            }
        }
        else if (vNode.type === VDOM_ELEMENT_TYPES.COMMENT) {
            if (container) {
                container.appendChild(document.createComment(vNode.content));
            }
            else {
                container = document.createComment(vNode.content);
            }
        }
    };
    if (isArray(vdom)) {
        try {
            for (var vdom_1 = __values(vdom), vdom_1_1 = vdom_1.next(); !vdom_1_1.done; vdom_1_1 = vdom_1.next()) {
                var vNode = vdom_1_1.value;
                mapVDOM(vNode);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (vdom_1_1 && !vdom_1_1.done && (_a = vdom_1.return)) _a.call(vdom_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else {
        mapVDOM(vdom);
    }
    return container;
}
var getComponentTree = function (uid) { return (dom_assign({}, getRegistery().get(uid).componentTree)); };
var setComponentTree = function (uid, componentTree) {
    var app = getRegistery().get(uid);
    app.componentTree = dom_assign({}, componentTree);
};
function getVirtualDOMNodeByID(id, vNode) {
    var e_2, _a;
    if (Object.keys(vNode).length === 0)
        return null;
    var compareId = getAttribute(vNode, ATTR_COMPONENT_ID) || '';
    if (Boolean(compareId === id))
        return vNode;
    try {
        for (var _b = __values(vNode.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var vChildNode = _c.value;
            var vNode_1 = getVirtualDOMNodeByID(id, vChildNode);
            if (vNode_1)
                return vNode_1;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return null;
}
function makeComponentTree(instance, parentId) {
    var componentTree = getComponentTree(instance[$$uid]);
    var parentNode = parentId ? componentTree[parentId] : null;
    var idx = parentNode && parentNode.lastChildId
        ? (+(parentNode.lastChildId.replace(parentId + '.', '')) + 1).toString()
        : '0';
    var id = instance[$$id] || (parentNode ? parentId + "." + idx : '0');
    if (id === '0' && componentTree[id] && componentTree[id].instance && componentTree[id].instance[$$isMounted]) {
        return componentTree;
    }
    if (!componentTree[id]) {
        instance[$$root] = !parentNode;
        instance[$$id] = id;
        componentTree[id] = {
            id: id,
            parentId: parentId,
            childrenIdMap: {},
            lastChildId: '',
            instance: instance,
            prevSnapshot: null,
            snapshot: null
        };
        if (parentNode && !parentNode.childrenIdMap[id]) {
            parentNode.childrenIdMap[id] = true;
            parentNode.lastChildId = id;
        }
    }
    return componentTree;
}
function getNodeByRoute($parentNode, action, route) {
    if (route === void 0) { route = []; }
    var $node = $parentNode;
    var mapRoute = function (cIdx, idx, arr) {
        if (idx > 0) {
            if ((action === VDOM_ACTIONS.ADD_NODE) && idx === arr.length - 1)
                return;
            if (action === VDOM_ACTIONS.REMOVE_NODE) {
                $node = ($node.childNodes[cIdx] || $node.childNodes[$node.childNodes.length - 1]);
                return;
            }
            $node = $node.childNodes[cIdx];
        }
    };
    route.forEach(mapRoute);
    return $node;
}
function getComponentId(vNode) {
    var e_3, _a;
    var id = getAttribute(vNode, ATTR_COMPONENT_ID);
    if (id)
        return id;
    if (!vNode.children)
        return null;
    try {
        for (var _b = __values(vNode.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var childVNode = _c.value;
            id = getComponentId(childVNode);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return id;
}
function patchDOM(diff, $node, uid, includePortals) {
    if (includePortals === void 0) { includePortals = false; }
    var mapDiff = function (diffElement) {
        if (includePortals) {
            diffElement.route.unshift(0);
        }
        var node = getNodeByRoute($node, diffElement.action, diffElement.route);
        if (diffElement.action === VDOM_ACTIONS.ADD_NODE) {
            var newNode = mount(diffElement.nextValue);
            node.appendChild(newNode);
        }
        else if (diffElement.action === VDOM_ACTIONS.REMOVE_NODE) {
            var componentId = getComponentId(diffElement.oldValue);
            componentId && unmountComponent(componentId, uid);
            node.parentNode.removeChild(node);
        }
        else if (diffElement.action === VDOM_ACTIONS.REPLACE_NODE) {
            var newNode = mount(diffElement.nextValue);
            var componentId = getComponentId(diffElement.oldValue);
            componentId && unmountComponent(componentId, uid);
            node.replaceWith(newNode);
        }
        else if (diffElement.action === VDOM_ACTIONS.ADD_ATTRIBUTE) {
            var mapAttrs = function (attrName) { return node.setAttribute(attrName, diffElement.nextValue[attrName]); };
            Object.keys(diffElement.nextValue).forEach(mapAttrs);
        }
        else if (diffElement.action === VDOM_ACTIONS.REMOVE_ATTRIBUTE) {
            var mapAttrs = function (attrName) { return node.removeAttribute(attrName); };
            Object.keys(diffElement.oldValue).forEach(mapAttrs);
        }
        else if (diffElement.action === VDOM_ACTIONS.REPLACE_ATTRIBUTE) {
            var mapAttrs = function (attrName) {
                var value = diffElement.nextValue[attrName];
                node.setAttribute(attrName, diffElement.nextValue[attrName]);
                if (node.nodeName === 'INPUT') {
                    var input = node;
                    if (input.type === 'text' && attrName === 'value') {
                        input.value = value;
                    }
                    else if (input.type === 'checkbox' && attrName === 'checked') {
                        input.checked = value;
                    }
                }
            };
            Object.keys(diffElement.nextValue).forEach(mapAttrs);
            var findRemoveDiffFn = function (diffElement) { return diffElement.action === VDOM_ACTIONS.REMOVE_NODE; };
            var removedDiff = diff.find(findRemoveDiffFn);
            if (!removedDiff) {
                var componentId = diffElement.oldValue[ATTR_COMPONENT_ID];
                componentId && unmountComponent(componentId, uid);
            }
            else {
                var immRemoveRoute = dom_spread(removedDiff.route);
                var immElementRoute = dom_spread(diffElement.route);
                immRemoveRoute.pop();
                immElementRoute.pop();
                if (immRemoveRoute.toString() !== immElementRoute.toString() && diffElement.keyRoute.length === 0) {
                    var componentId = diffElement.oldValue[ATTR_COMPONENT_ID];
                    componentId && unmountComponent(componentId, uid);
                }
            }
        }
    };
    diff.forEach(mapDiff);
}
function runDOMProcessor(id, uid, mountedVNode, mountedNextVNode, $container, includePortals) {
    if (mountedVNode === void 0) { mountedVNode = null; }
    if (mountedNextVNode === void 0) { mountedNextVNode = null; }
    if ($container === void 0) { $container = null; }
    if (includePortals === void 0) { includePortals = false; }
    var componentTree = getComponentTree(uid);
    var vdom = getVirtualDOM(uid);
    var componentTreeNode = componentTree[id];
    var instance = componentTreeNode.instance;
    var parentId = instance[$$root] ? null : componentTreeNode.parentId;
    var app = getRegistery().get(uid);
    var $node = $container || (instance[$$root]
        ? app.node.children[0]
        : app.node.querySelector("[" + ATTR_COMPONENT_ID + "=\"" + id + "\"]"));
    var oldVNode = mountedVNode || getVirtualDOMNodeByID(id, vdom);
    var parentVNode = parentId ? getVirtualDOMNodeByID(parentId, vdom) : null;
    var findNodeFn = function (vNode) { return vNode === oldVNode; };
    var idx = parentVNode ? parentVNode.children.findIndex(findNodeFn) : 0;
    var newVNode = mountedNextVNode || instance.render();
    app.queue.push(function () {
        //console.log('callback for', newVNode)
        makeEvents(newVNode, id, uid);
    });
    var prevRoute = dom_spread(oldVNode.route);
    newVNode = buildNodeWithRoutes(newVNode, prevRoute, prevRoute.length, 0, true);
    app.queue.forEach(function (fn) { return fn(); });
    app.queue = [];
    if (newVNode.type === VDOM_ELEMENT_TYPES.TAG) {
        setAttribute(newVNode, ATTR_COMPONENT_ID, id);
        instance.displayName && setAttribute(newVNode, ATTR_COMPONENT_NAME, instance.displayName);
        !isUndefined(instance.props.key) && setAttribute(newVNode, ATTR_KEY, instance.props.key);
    }
    var diff = getVDOMDiff(oldVNode, newVNode, includePortals);
    console.log('[diff]', diff);
    patchDOM(diff, $node, uid, includePortals);
    if (!$container) {
        if (parentVNode) {
            idx > 0 && (parentVNode.children[idx] = newVNode);
        }
        else {
            app.vdom = newVNode;
        }
    }
    instance[$$markedIDMap] = {};
}
function getSnapshotDiff(prevSnapshot, snapshot, immutable, prevDiff) {
    if (immutable === void 0) { immutable = true; }
    if (prevDiff === void 0) { prevDiff = []; }
    var diff = dom_spread(prevDiff);
    if (prevSnapshot && snapshot) {
        var vNode = prevSnapshot.vdom;
        var nextVNode = snapshot.vdom;
        var commentNode_1 = function (vNode) { return vNode.type === VDOM_ELEMENT_TYPES.COMMENT; };
        var emptyReplacer = function (vNode) { return vNode && commentNode_1(vNode) && vNode.content === EMPTY_REPLACER; };
        var componentReplacer = function (vNode) { return vNode && commentNode_1(vNode) && vNode.content === COMPONENT_REPLACER; };
        var oldElements = immutable ? dom_spread(prevSnapshot.elements) : prevSnapshot.elements;
        var newElements = immutable ? dom_spread(snapshot.elements) : snapshot.elements;
        var findIdxComponentFn = function (e) { return e.type === COMPONENT; };
        if (componentReplacer(vNode) && componentReplacer(nextVNode)) {
            var idx = oldElements.findIndex(findIdxComponentFn);
            diff.push({
                type: SNAPSHOT_DIFF.EQUALS,
                element: oldElements[idx]
            });
            oldElements.splice(idx, 1);
            newElements.splice(idx, 1);
        }
        else if (emptyReplacer(vNode) && componentReplacer(nextVNode)) {
            var idx = newElements.findIndex(findIdxComponentFn);
            diff.push({
                type: SNAPSHOT_DIFF.ADD,
                element: newElements[idx]
            });
            newElements.splice(idx, 1);
        }
        else if (componentReplacer(vNode) && emptyReplacer(nextVNode)) {
            var idx = oldElements.findIndex(findIdxComponentFn);
            diff.push({
                type: SNAPSHOT_DIFF.REMOVE,
                element: oldElements[idx]
            });
            oldElements.splice(idx, 1);
        }
        var vNodeChildrenCount = vNode && vNode.children ? vNode.children.length : 0;
        var nextVNodeChildrenCount = nextVNode && nextVNode.children ? nextVNode.children.length : 0;
        var iterations = Math.max(vNodeChildrenCount, nextVNodeChildrenCount);
        for (var i = 0; i < iterations; i++) {
            var childVNode = vNode && vNode.children && vNode.children[i] ? vNode.children[i] : null;
            var childNextVNode = nextVNode && nextVNode.children && nextVNode.children[i] ? nextVNode.children[i] : null;
            var prevSnapsot = createSnapshot(childVNode, oldElements, false);
            var snapshot_1 = createSnapshot(childNextVNode, newElements, false);
            diff = getSnapshotDiff(prevSnapsot, snapshot_1, false, diff);
        }
    }
    return diff;
}
function patchSnapshotDiff(componentTreeNodeForCheck, handlers) {
    if (handlers === void 0) { handlers = {
        onHasKey: function () { },
        onAdd: function () { },
        onEquals: function () { }
    }; }
    var onHasKey = handlers.onHasKey, onAdd = handlers.onAdd, onEquals = handlers.onEquals;
    var instanceForCheck = componentTreeNodeForCheck.instance;
    var hasKey = getAttribute(componentTreeNodeForCheck.snapshot.vdom, ATTR_KEY);
    if (hasKey)
        return onHasKey();
    var snapshotDiff = dom_spread(componentTreeNodeForCheck.snapshotDiff);
    if (!snapshotDiff || snapshotDiff.length === 0)
        return;
    var patch = function (diff) {
        var componentFactory = diff.element.value;
        if (diff.type === SNAPSHOT_DIFF.EQUALS) {
            var instanceMap = instanceForCheck[$$cache].get(componentFactory.getComponentSymbol());
            var instanceList = Array.from(instanceMap.values());
            var orderedIDList = instanceForCheck[$$orderedIDList];
            var id_1 = orderedIDList[0];
            var instance = null;
            instance = id_1
                ? instanceList.find(function (instance) { return instance[$$id] === id_1; })
                : instanceList.find(function (instance) { return !instanceForCheck[$$markedIDMap][instance[$$id]]; });
            if (instance) {
                instanceForCheck[$$markedIDMap][instance[$$id]] = true;
                instanceForCheck[$$orderedIDList].splice(0, 1);
                return onEquals && onEquals(instance);
            }
        }
        else if (diff.type === SNAPSHOT_DIFF.ADD) {
            return onAdd && onAdd();
        }
        else if (diff.type === SNAPSHOT_DIFF.REMOVE) {
            var findRemoveIdxFn = function (d) { return d.type === SNAPSHOT_DIFF.REMOVE; };
            var idx = snapshotDiff.findIndex(findRemoveIdxFn);
            idx !== -1 && instanceForCheck[$$orderedIDList].splice(idx, 1);
            snapshotDiff.splice(0, 1);
            componentTreeNodeForCheck.snapshotDiff = snapshotDiff;
            patchSnapshotDiff(componentTreeNodeForCheck, {
                onHasKey: onHasKey,
                onAdd: onAdd,
                onEquals: onEquals
            });
        }
    };
    patch(snapshotDiff[0]);
    snapshotDiff.splice(0, 1);
    componentTreeNodeForCheck.snapshotDiff = snapshotDiff;
}
function getPublicInstance(uid, initialKey, componentFactory) {
    var componentTree = getComponentTree(uid);
    var parentId = getCurrMountedComponentId();
    var rootComponentTreeNode = componentTree['0'];
    var rootInstance = rootComponentTreeNode ? rootComponentTreeNode.instance : null;
    var parentComponentTreeNode = parentId ? componentTree[parentId] : null;
    var parentInstance = parentComponentTreeNode ? parentComponentTreeNode.instance : null;
    var createAutoKey = function (parentInstance, componentSymbol) {
        var id = 0;
        var instanceList = parentInstance[$$cache].get(componentSymbol)
            ? Array.from(parentInstance[$$cache].get(componentSymbol).values())
            : [];
        var lastInstance = instanceList[instanceList.length - 1];
        if (lastInstance) {
            var splitted = lastInstance[$$id].split('.');
            id = +(splitted[splitted.length - 1]) + 1;
        }
        return AUTOGEN_INSTANCE_KEY + "_" + id;
    };
    var getKey = function (initialKey, parentInstance) { return isEmpty(initialKey) ? createAutoKey(parentInstance, componentFactory.getComponentSymbol()) : initialKey; };
    var getInstance = function (parentInstance, componentFactory, initialKey) {
        if (parentInstance) {
            var key = getKey(initialKey, parentInstance);
            var componentSymbol = componentFactory.getComponentSymbol();
            var cmpMap = null;
            if (!parentInstance[$$cache].get(componentSymbol)) {
                parentInstance[$$cache].set(componentSymbol, new Map());
            }
            cmpMap = parentInstance[$$cache].get(componentSymbol);
            if (!cmpMap.get(key)) {
                cmpMap.set(key, componentFactory.createInstance());
            }
            return cmpMap.get(key);
        }
        return rootInstance || componentFactory.createInstance();
    };
    if (!isEmpty(initialKey)) {
        return getInstance(parentInstance, componentFactory, initialKey);
    }
    var piblicInstance = null;
    if (parentComponentTreeNode && parentComponentTreeNode.snapshot) {
        patchSnapshotDiff(parentComponentTreeNode, {
            onHasKey: function () {
                piblicInstance = getInstance(parentInstance, componentFactory, initialKey);
            },
            onAdd: function () {
                piblicInstance = getInstance(parentInstance, componentFactory, initialKey);
            },
            onEquals: function (instance) {
                piblicInstance = instance;
            }
        });
    }
    if (piblicInstance)
        return piblicInstance;
    return getInstance(parentInstance, componentFactory, initialKey);
}
function wire(componentFactory) {
    var uid = componentFactory.uid;
    var app = getRegistery().get(uid);
    var sanitizedProps = sanitize(componentFactory.props);
    var key = sanitizedProps.key, ref = sanitizedProps.ref;
    var instance = getPublicInstance(uid, key, componentFactory);
    var componentTree = null;
    var vNode = null;
    var id = null;
    instance[$$uid] = uid;
    instance[$$prevProps] = dom_assign({}, instance.props);
    instance[$$eventHandlers] = [];
    if (!instance[$$isMounted]) {
        componentTree = makeComponentTree(instance, getCurrMountedComponentId());
        setComponentTree(uid, componentTree);
        instance.willMount();
    }
    var setId = function (instance) {
        if (!instance[$$root]) {
            var id_2 = instance[$$id].split('.').slice(0, -1).join('.');
            setCurrMountedComponentId(id_2);
        }
    };
    var reduceProps = function (acc, key) { return (acc[key] = sanitizedProps[key], acc); };
    var getProps = function () { return Object.keys(sanitizedProps).reduce(reduceProps, instance.props); };
    id = instance[$$id];
    setCurrMountedComponentId(id);
    if (instance[$$isMounted] && !instance.shouldUpdate(sanitizedProps, instance.state)) {
        var vdom = getVirtualDOM(uid);
        var vNode_2 = getVirtualDOMNodeByID(id, vdom);
        setAttribute(vNode_2, ATTR_DONT_UPDATE_NODE, true);
        instance[$$markedIDMap] = {};
        setId(instance);
        return vNode_2;
    }
    instance.props = getProps();
    instance.willReceiveProps(instance.props);
    instance.willUpdate(instance.props, instance.state);
    vNode = instance.render();
    app.queue.push(function () {
        //console.log('callback for', vNode)
        makeEvents(vNode, id, uid);
    });
    if (instance[$$root]) {
        vNode = buildNodeWithRoutes(vNode);
        app.queue.forEach(function (fn) { return fn(); });
        app.queue = [];
    }
    if (isUndefined(vNode)) {
        error('render method must return dom`` content or null!');
        return null;
    }
    if (isNull(vNode)) {
        vNode = createCommentNode(COMPONENT_REPLACER + ":" + id + (Boolean(instance[$$name]) ? ":" + instance[$$name] : ''));
    }
    if (vNode.type === VDOM_ELEMENT_TYPES.TAG) {
        setAttribute(vNode, ATTR_COMPONENT_ID, id);
        !isUndefined(key) && setAttribute(vNode, ATTR_KEY, key);
        instance.displayName && setAttribute(vNode, ATTR_COMPONENT_NAME, instance.displayName);
    }
    var didUpdateTimeout = setTimeout(function () {
        clearTimeout(didUpdateTimeout);
        instance.didUpdate(dom_assign({}, instance[$$prevProps]), instance.state);
    });
    if (!instance[$$isMounted]) {
        var didMountTimeout_1 = setTimeout(function () {
            clearTimeout(didMountTimeout_1);
            instance.didMount();
            instance[$$isMounted] = true;
        });
    }
    instance[$$markedIDMap] = {};
    setId(instance);
    ref && ref(instance);
    vNode.props = instance.props;
    //setTimeout(() => console.log('componentTree', getComponentTree(uid)))
    return vNode;
}
function mountVirtualDOM(mountedVNode, elements, parentVNode) {
    if (parentVNode === void 0) { parentVNode = null; }
    var isBlockNode = mountedVNode.type === VDOM_ELEMENT_TYPES.TAG;
    var isCommentNode = mountedVNode.type === VDOM_ELEMENT_TYPES.COMMENT;
    var children = isBlockNode ? mountedVNode.children : [];
    if (isCommentNode) {
        var textContent = mountedVNode.content;
        if (textContent === COMPONENT_REPLACER) {
            var findElementFn = function (e) { return e.type === COMPONENT; };
            var findVNodeFn = function (n) { return n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === COMPONENT_REPLACER; };
            var elementIdx = elements.findIndex(findElementFn);
            var vNodeIdx = parentVNode ? parentVNode.children.findIndex(findVNodeFn) : 0;
            var componentFactory = elements[elementIdx].value;
            var nextVNode = wire(componentFactory);
            if (isFunction(componentFactory.mountPortal)) {
                var id = getComponentId(nextVNode);
                elements.splice(elementIdx, 1);
                componentFactory.mountPortal(id, nextVNode);
            }
            else if (parentVNode) {
                elements.splice(elementIdx, 1);
                parentVNode.children[vNodeIdx] = nextVNode;
            }
            else {
                elements.splice(elementIdx, 1);
                mountedVNode = nextVNode;
            }
        }
        else if (textContent === COMPONENT_LIST_REPLACER) {
            var findElementFn = function (e) { return e.type === COMPONENT_LIST; };
            var findVNodeFn = function (n) { return n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === COMPONENT_LIST_REPLACER; };
            var uid = getUidActive();
            var id = getCurrMountedComponentId();
            var vdom = getVirtualDOM(uid);
            var elementIdx = elements.findIndex(findElementFn);
            var vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
            var componentFactoryList_1 = elements[elementIdx].value;
            var instance = componentFactoryList_1
                ? getPublicInstance(uid, componentFactoryList_1[0].props.key, componentFactoryList_1[0])
                : null;
            var getParentPrevVNode_1 = function (id, vNode, parentVNode) {
                if (parentVNode === void 0) { parentVNode = null; }
                var e_4, _a;
                if (getAttribute(vNode, ATTR_COMPONENT_ID) === id) {
                    return parentVNode;
                }
                if (!vNode || !vNode.children)
                    return null;
                try {
                    for (var _b = __values(vNode.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var childVNode = _c.value;
                        parentVNode = getParentPrevVNode_1(id, childVNode, vNode);
                        if (parentVNode)
                            return parentVNode;
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                return null;
            };
            var parentPrevVNode = getParentPrevVNode_1(instance[$$id], getVirtualDOMNodeByID(id, vdom));
            var shift_1 = parentVNode.children.length;
            var filterNodesFn = function (vNode) {
                var hasSameKey = function (componentFactory) { return componentFactory.props.key === getAttribute(vNode, ATTR_KEY); };
                return Boolean(getAttribute(vNode, ATTR_COMPONENT_ID)) && componentFactoryList_1.some(hasSameKey);
            };
            var children_1 = parentPrevVNode && parentPrevVNode.children
                ? parentPrevVNode.children.filter(filterNodesFn)
                : [];
            var mapFactoryList = function (componentFactory, idx) {
                var e_5, _a;
                var runComponent = function () { return parentVNode.children.push(wire(componentFactory)); };
                if (componentFactory.config.pure) {
                    var elementIdx_1 = idx + shift_1;
                    var prevVNode = children_1[idx] || null;
                    var props = prevVNode ? prevVNode.props : null;
                    var nextProps = componentFactory.props;
                    if (Boolean(props)) {
                        var propNames = Array.from(Object.keys(props));
                        var isEquals = true;
                        try {
                            for (var propNames_1 = __values(propNames), propNames_1_1 = propNames_1.next(); !propNames_1_1.done; propNames_1_1 = propNames_1.next()) {
                                var propName = propNames_1_1.value;
                                if (props[propName] !== nextProps[propName]) {
                                    isEquals = false;
                                    break;
                                }
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (propNames_1_1 && !propNames_1_1.done && (_a = propNames_1.return)) _a.call(propNames_1);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                        if (isEquals) {
                            parentVNode.children[elementIdx_1] = prevVNode;
                        }
                        else {
                            runComponent();
                        }
                    }
                    else {
                        runComponent();
                    }
                }
                else {
                    runComponent();
                }
            };
            elements.splice(elementIdx, 1);
            componentFactoryList_1.forEach(mapFactoryList);
            parentVNode.children.splice(vNodeIdx, 1);
        }
        else if (textContent === NODE_REPLACER) {
            var findElementFn = function (e) { return e.type === NODE; };
            var findVNodeFn = function (n) { return n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === NODE_REPLACER; };
            var elementIdx = elements.findIndex(findElementFn);
            var vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
            var nextVNode = elements[elementIdx].value;
            elements.splice(elementIdx, 1);
            parentVNode.children[vNodeIdx] = nextVNode;
        }
        else if (textContent === NODE_LIST_REPLACER) {
            var findElementFn = function (e) { return e.type === NODE_LIST; };
            var findVNodeFn = function (n) { return n.type === VDOM_ELEMENT_TYPES.COMMENT && n.content === NODE_LIST_REPLACER; };
            var elementIdx = elements.findIndex(findElementFn);
            var vNodeIdx = parentVNode.children.findIndex(findVNodeFn);
            var nodeList = elements[elementIdx].value;
            var mapNodesFn = function (n) { return parentVNode.children.push(n); };
            elements.splice(elementIdx, 1);
            nodeList.forEach(mapNodesFn);
            parentVNode.children.splice(vNodeIdx, 1);
        }
    }
    var mapChildNodesFn = function (vNode) { return mountVirtualDOM(vNode, elements, mountedVNode); };
    children.forEach(mapChildNodesFn);
    return mountedVNode;
}
function createSnapshot(vNode, elements, immutable) {
    if (immutable === void 0) { immutable = true; }
    return {
        vdom: deepClone(vNode),
        elements: immutable ? dom_spread(elements) : elements
    };
}
function dom(string) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var uid = getUidActive();
    var app = getRegistery().get(uid);
    var separator = NODE_SEPARATOR;
    var elements = [];
    var componentTree = getComponentTree(uid);
    var id = getCurrMountedComponentId();
    var markup = string.join(separator);
    var sourceVNode = null;
    var vNode = null;
    var needSnapshot = false;
    var componentTreeNode = componentTree[id];
    var instance = componentTreeNode.instance;
    var isComponent = function (o) { return isObject(o) && !isEmpty(o) && o.isSpiderComponent === true; };
    var mapArgsFn = function (arg) {
        var replacer = '';
        if (isComponent(arg)) {
            var componentFactory = arg;
            replacer = "<!--" + COMPONENT_REPLACER + "-->";
            componentFactory.uid = uid;
            elements.push({ type: COMPONENT, value: componentFactory });
        }
        else if (isArray(arg) && isComponent(arg[0])) {
            var mapComponentsFn = function (o) { return (o.uid = uid, o); };
            var componentFactoryList = arg.map(mapComponentsFn);
            replacer = "<!--" + COMPONENT_LIST_REPLACER + "-->";
            elements.push({ type: COMPONENT_LIST, value: componentFactoryList });
        }
        else if (isArray(arg) && isVDOMNode(arg[0])) {
            replacer = "<!--" + NODE_LIST_REPLACER + "-->";
            elements.push({ type: NODE_LIST, value: arg });
        }
        else if (isVDOMNode(arg)) {
            replacer = "<!--" + NODE_REPLACER + "-->";
            elements.push({ type: NODE, value: arg });
        }
        else if (isFunction(arg)) {
            if (!isRef(arg)) {
                replacer = EVENT_HANDLER_REPLACER;
                instance[$$eventHandlers].push(arg);
            }
            else {
                var hasSameRef = function (ref, refs) {
                    var isSameRef = function (comparedRef) { return comparedRef === ref; };
                    return refs.some(isSameRef);
                };
                if (!hasSameRef(arg, app.refs)) {
                    app.refs.push(arg);
                }
                replacer = (app.refs.length - 1).toString();
            }
        }
        else if (isEmpty(arg) || arg === false) {
            replacer = "<!--" + EMPTY_REPLACER + "-->";
        }
        else {
            replacer = arg;
        }
        markup = markup.replace(separator, replacer);
    };
    args.forEach(mapArgsFn);
    sourceVNode = createVirtualDOMFromSource(markup);
    sourceVNode = sourceVNode.length > 1 ? sourceVNode : sourceVNode[0];
    needSnapshot = !Boolean(getAttribute(sourceVNode, ATTR_IS_NODE));
    if (needSnapshot) {
        componentTree[id] = dom_assign({}, componentTree[id], { prevSnapshot: componentTree[id].snapshot || null });
        componentTree[id] = dom_assign({}, componentTree[id], { snapshot: createSnapshot(sourceVNode, elements) });
        componentTree[id] = dom_assign({}, componentTree[id], { snapshotDiff: getSnapshotDiff(componentTree[id].prevSnapshot, componentTree[id].snapshot) });
        setComponentTree(uid, componentTree);
    }
    else {
        removeAttribute(sourceVNode, ATTR_IS_NODE);
    }
    vNode = mountVirtualDOM(sourceVNode, elements);
    var orderedIDList = vNode && vNode.children
        ? vNode.children
            .map(function (n) { return getAttribute(n, ATTR_COMPONENT_ID); })
            .filter(Boolean)
        : [];
    componentTree[id].instance[$$orderedIDList] = orderedIDList;
    return vNode;
}
function findDOMNode(ref) {
    if (!ref)
        return null;
    var uid = ref[$$uid];
    var id = ref[$$id];
    var app = getRegistery().get(uid);
    return app.node.querySelector("[" + ATTR_COMPONENT_ID + "=\"" + id + "\"]");
}
function getDOMElementRoute(sourceDOMElement, targetDOMElement, prevRoute, level, idx, stop) {
    if (prevRoute === void 0) { prevRoute = []; }
    if (level === void 0) { level = 0; }
    if (idx === void 0) { idx = 0; }
    if (stop === void 0) { stop = false; }
    var children = Array.from(sourceDOMElement.childNodes);
    var route = dom_spread(prevRoute);
    route[level] = idx;
    level++;
    if (targetDOMElement === sourceDOMElement) {
        route = route.slice(0, level);
        return [route, true];
    }
    for (var i = 0; i < children.length; i++) {
        var childSourceDOMElement = sourceDOMElement.childNodes[i];
        var _a = dom_read(getDOMElementRoute(childSourceDOMElement, targetDOMElement, route, level, i, stop), 2), nextRoute = _a[0], nextStop = _a[1];
        if (nextStop)
            return [nextRoute, nextStop];
    }
    return [route, stop];
}


// CONCATENATED MODULE: ./src/core/render.ts



function renderComponent(componentFactory, container) {
    var isMounted = Boolean(container.getAttribute(ATTR_ROOT_APP));
    var uidMounted = getUidMounted();
    componentFactory.uid = uidMounted;
    if (!getRegistery().get(uidMounted)) {
        container.innerHTML = '';
        if (!container.getAttribute(ATTR_ROOT_APP)) {
            container.setAttribute(ATTR_ROOT_APP, uidMounted.toString());
        }
        var registry = getRegistery();
        var app = {
            node: container,
            componentTree: {},
            vdom: null,
            eventHandlers: {},
            refs: [],
            queue: []
        };
        registry.set(uidMounted, app);
        setUidActive(uidMounted);
        var vdom = wire(componentFactory);
        var node = mount(vdom);
        app.vdom = vdom;
        container.appendChild(node);
    }
    else if (isMounted) {
        var uid = Number(container.getAttribute(ATTR_ROOT_APP));
        var componentTree = getComponentTree(uid);
        var instance = componentTree['0'].instance;
        setCurrMountedComponentId(null);
        runDOMProcessor(instance[$$id], uid, null, wire(componentFactory));
    }
    else {
        setUidMounted(uidMounted + 1);
        setCurrMountedComponentId(null);
        renderComponent(componentFactory, container);
    }
}


// CONCATENATED MODULE: ./src/core/portal.ts





function createPortal(componentFactory, getContainerNode) {
    var mountPortal = function (id, nextVNode) {
        var uid = getUidActive();
        var timeout = setTimeout(function () {
            clearTimeout(timeout);
            var $container = isFunction(getContainerNode) ? getContainerNode() : null;
            var portalId = uid + ":" + id;
            var componentTree = getComponentTree(uid);
            var componentTreeNode = componentTree[id];
            componentTreeNode && (componentTreeNode.instance[$$portal] = true);
            if (!$container) {
                $container = document.querySelector("[" + ATTR_PORTAL_ID + "=\"" + portalId + "\"]");
                if (!$container) {
                    $container = document.createElement('div');
                    document.body.appendChild($container);
                }
            }
            var isMounted = Boolean($container.getAttribute(ATTR_PORTAL_ID));
            if (!isMounted) {
                $container.innerHTML = '';
                $container.setAttribute(ATTR_PORTAL_ID, portalId);
            }
            var vNode = createVirtualDOMFromSource($container.innerHTML)[0];
            runDOMProcessor(id, uid, vNode, nextVNode, $container, true);
        });
    };
    componentFactory.mountPortal = mountPortal;
    return componentFactory;
}


// CONCATENATED MODULE: ./src/core/context.ts

function createContext(initialValue) {
    var contextValue = initialValue;
    var getValue = function () { return contextValue; };
    var Provider = createComponent({
        displayName: 'Context.Provider',
        willReceiveProps: function (nextProps) {
            contextValue = nextProps.value || contextValue;
        },
        render: function () {
            return this.props.children();
        }
    });
    var Consumer = createComponent({
        displayName: 'Context.Consumer',
        render: function () {
            return this.props.children(contextValue);
        }
    });
    return {
        getValue: getValue,
        Provider: Provider,
        Consumer: Consumer
    };
}


// CONCATENATED MODULE: ./src/core/memo.ts

function memo(fn) {
    var cache = new Map();
    var propMap = {};
    var memoIdMap = {};
    var applyFn = function (props) {
        var hash = '';
        var mapProps = function (propName) {
            var value = props[propName];
            if (propName === 'key')
                return;
            if (!propMap[propName]) {
                propMap[propName] = new Map();
                memoIdMap[propName] = -1;
            }
            if (isUndefined(propMap[propName].get(value))) {
                propMap[propName].set(value, ++memoIdMap[propName]);
            }
            hash += '.' + propMap[propName].get(value);
        };
        Object.keys(props).forEach(mapProps);
        if (!cache.get(hash)) {
            cache.set(hash, fn(props));
        }
        return cache.get(hash);
    };
    return applyFn;
}


// CONCATENATED MODULE: ./src/core/index.ts










// CONCATENATED MODULE: ./src/index.ts
/* concated harmony reexport dom */__webpack_require__.d(__webpack_exports__, "dom", function() { return dom; });
/* concated harmony reexport findDOMNode */__webpack_require__.d(__webpack_exports__, "findDOMNode", function() { return findDOMNode; });
/* concated harmony reexport createComponent */__webpack_require__.d(__webpack_exports__, "createComponent", function() { return createComponent; });
/* concated harmony reexport renderComponent */__webpack_require__.d(__webpack_exports__, "renderComponent", function() { return renderComponent; });
/* concated harmony reexport createPortal */__webpack_require__.d(__webpack_exports__, "createPortal", function() { return createPortal; });
/* concated harmony reexport createContext */__webpack_require__.d(__webpack_exports__, "createContext", function() { return createContext; });
/* concated harmony reexport createRef */__webpack_require__.d(__webpack_exports__, "createRef", function() { return createRef; });
/* concated harmony reexport memo */__webpack_require__.d(__webpack_exports__, "memo", function() { return memo; });
/* concated harmony reexport unmount */__webpack_require__.d(__webpack_exports__, "unmount", function() { return unmount; });




/***/ })
/******/ ]);
});