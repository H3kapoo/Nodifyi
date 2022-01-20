/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 174:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const GraphModel_1 = __importDefault(__webpack_require__(984));
const Logger_1 = __webpack_require__(944);
const Configuration_1 = __importDefault(__webpack_require__(698));
const os_1 = __importDefault(__webpack_require__(37));
const path_1 = __importDefault(__webpack_require__(17));
/** Main application entry class*/
class App {
    logger = new Logger_1.Logger('App');
    graphModel;
    constructor() {
        this.initialize();
        this.logger.log('Initialized');
    }
    initialize() {
        const confPath = path_1.default.join(os_1.default.homedir(), '.defaultConf.json');
        if (!Configuration_1.default.get().loadConf(confPath)) {
            this.logger.log(`--- APPLICATION ABORT | CONTACT OWNER ---`, Logger_1.LoggerLevel.ERR);
            return;
        }
        this.initializeAndSubscribeComponents();
        // const graphModel = new GraphModel()
        // const node1 = new CircleNode()
        // const node2 = new CircleNode()
        // graphModel.addNode(node1)
        // graphModel.addNode(node2)
        // graphModel.addConnection(node1.getUniqueId(), node2.getUniqueId())
        // graphModel.addConnection(node1.getUniqueId(), node1.getUniqueId())
        // graphModel.rmNode(node1.getUniqueId())
        // graphModel.rmNode(node1.getUniqueId())
        // console.log(graphModel.getModel())
        // console.log(graphModel.getConnections())
    }
    initializeAndSubscribeComponents() {
        this.graphModel = new GraphModel_1.default();
        Configuration_1.default.get().subscribeReloadable(this.graphModel);
    }
}
exports["default"] = App;


/***/ }),

/***/ 698:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Logger_1 = __webpack_require__(944);
const fs_1 = __importDefault(__webpack_require__(147));
/** Handles loading of configuration file*/
class Configuration {
    logger = new Logger_1.Logger('Configuration');
    static instance;
    reloadablesList;
    conf;
    confPath;
    constructor() {
        this.reloadablesList = [];
        this.conf = {};
        this.confPath = '';
        this.logger.log('Initialized');
    }
    static get() {
        if (!Configuration.instance)
            Configuration.instance = new Configuration();
        return Configuration.instance;
    }
    loadConf(confPath) {
        try {
            const rawResult = fs_1.default.readFileSync(confPath).toString();
            this.conf = JSON.parse(rawResult);
            this.confPath = confPath;
            return true;
        }
        catch (error) {
            this.logger.log(`Fatal error! Could not load conf from ${confPath}`, Logger_1.LoggerLevel.ERR);
            return false;
        }
    }
    updateCurrentConf(subConfObject) {
        try {
            for (const [key, value] of Object.entries(subConfObject))
                this.conf[key] = value;
            const newConf = JSON.stringify(this.conf);
            fs_1.default.writeFileSync(this.confPath, newConf, 'utf-8');
            this.notifyReload();
            return true;
        }
        catch (error) {
            this.logger.log(`Fatal error! Could not update conf!`, Logger_1.LoggerLevel.ERR);
            return false;
        }
    }
    param(paramName) {
        if (this.conf[paramName])
            return this.conf[paramName];
        this.logger.log(`Param '${paramName}' could not be found! `, Logger_1.LoggerLevel.ERR);
        return null;
    }
    subscribeReloadable(reloadable) {
        if (this.reloadablesList.indexOf(reloadable) !== -1) {
            this.logger.log('Trying to subscribe IReloadable that is already subscribbed!', Logger_1.LoggerLevel.ERR);
            return false;
        }
        this.reloadablesList.push(reloadable);
        return true;
    }
    unsubscribeReloadable(reloadable) {
        const index = this.reloadablesList.indexOf(reloadable);
        if (index === -1) {
            this.logger.log('Trying to unsubscribe IReloadable that is not subscribbed!', Logger_1.LoggerLevel.ERR);
            return false;
        }
        this.reloadablesList.splice(index, 1);
        return true;
    }
    notifyReload() {
        this.reloadablesList.forEach(r => r.onConfReload());
    }
}
exports["default"] = Configuration;


/***/ }),

/***/ 490:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Connection {
    static idGiver = 1;
    uniqueId;
    fromNode;
    toNode;
    constructor(fromNode, toNode) {
        this.initialize(fromNode, toNode);
    }
    initialize(fromNode, toNode) {
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.uniqueId = Connection.idGiver++;
    }
    getUniqueId() { return this.uniqueId; }
    getFromNode() { return this.fromNode; }
    getToNode() { return this.toNode; }
    getConnectionId() {
        return Connection.getConnectionId(this.fromNode, this.toNode);
    }
    static getConnectionId(fromNode, toNode) {
        return fromNode.getUniqueId() * 1000 + toNode.getUniqueId();
    }
}
exports["default"] = Connection;


/***/ }),

/***/ 984:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Logger_1 = __webpack_require__(944);
const Connection_1 = __importDefault(__webpack_require__(490));
/** Class handling the insert/remove/update of graph objects */
class GraphModel {
    logger = new Logger_1.Logger('GraphModel');
    model;
    connections;
    constructor() {
        this.initialize();
        this.logger.log('Initialized');
    }
    initialize() {
        this.model = {};
        this.connections = {};
    }
    addNode(node) {
        this.model[node.getUniqueId()] = { graphNode: node, inIds: new Set(), outIds: new Set() };
        return true;
    }
    findNode(id) {
        if (this.model[id])
            return this.model[id].graphNode;
        this.logger.log(`Node ${id} was not found!`, Logger_1.LoggerLevel.WRN);
        return null;
    }
    rmNode(id) {
        if (!this.model[id]) {
            this.logger.log(`Could not delete invisible node id ${id}!`, Logger_1.LoggerLevel.WRN);
            return false;
        }
        // delete all out going connections
        for (const toNode of [...this.model[id].outIds]) {
            if (!this.rmConnection(id, toNode)) {
                this.logger.log(`Failed removing connection between node ${id} and ${toNode}!`, Logger_1.LoggerLevel.ERR);
                return false;
            }
        }
        // delete all ingoing connections
        for (const fromNode of [...this.model[id].inIds]) {
            if (!this.rmConnection(fromNode, id)) {
                this.logger.log(`Failed removing connection between node ${fromNode} and ${id}!`, Logger_1.LoggerLevel.ERR);
                return false;
            }
        }
        // delete the graph node itself
        delete this.model[id];
        return true;
    }
    addConnection(fromId, toId) {
        const fromNode = this.model[fromId];
        const toNode = this.model[toId];
        if (fromNode && toNode) {
            const conn = new Connection_1.default(fromNode.graphNode, toNode.graphNode);
            this.connections[conn.getConnectionId()] = conn;
            fromNode.outIds.add(toId);
            toNode.inIds.add(fromId);
            return true;
        }
        this.logger.log('Could not connect nodes, one of it doesnt exist!', Logger_1.LoggerLevel.WRN);
        return false;
    }
    findConnection(fromId, toId) {
        const fromNode = this.model[fromId];
        const toNode = this.model[toId];
        if (fromNode && toNode) {
            if (!fromNode.outIds.has(toId)) {
                this.logger.log(`Connection not found between nodes ${fromId} and ${toId}!`, Logger_1.LoggerLevel.WRN);
                return null;
            }
            const connId = Connection_1.default.getConnectionId(fromNode.graphNode, toNode.graphNode);
            if (this.connections[connId])
                return this.connections[connId];
            this.logger.log(`Connection not found between nodes ${fromId} and ${toId} in Set!`, Logger_1.LoggerLevel.ERR);
        }
        this.logger.log('Could not find base nodes, at least one of it doesnt exist!', Logger_1.LoggerLevel.WRN);
        return null;
    }
    rmConnection(fromId, toId) {
        const conn = this.findConnection(fromId, toId);
        if (!conn) {
            this.logger.log(`Connection doesnt exist between node ${fromId} and ${toId}!`, Logger_1.LoggerLevel.WRN);
            return false;
        }
        // remove connection from->to from graphSet
        this.model[fromId].outIds.delete(toId);
        // remove connection to<-from from graphSet
        this.model[toId].inIds.delete(fromId);
        // remove connection from connectionSet
        delete this.connections[conn.getConnectionId()];
        return true;
    }
    onConfReload() {
    }
    getModel() { return this.model; }
    getConnections() { return this.connections; }
}
exports["default"] = GraphModel;


/***/ }),

/***/ 944:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = exports.LoggerLevel = void 0;
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel["DBG"] = "DBG";
    LoggerLevel["INFO"] = "INFO";
    LoggerLevel["WRN"] = "WRN";
    LoggerLevel["ERR"] = "ERR";
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
var LoggerColor;
(function (LoggerColor) {
    LoggerColor["DBG"] = "#999";
    LoggerColor["INFO"] = "#00ff00";
    LoggerColor["WRN"] = "#00aadd";
    LoggerColor["ERR"] = "#ff2200";
})(LoggerColor || (LoggerColor = {}));
class Logger {
    context;
    defaultLevel;
    static loggingActive = true;
    constructor(context, defaultLevel = LoggerLevel.INFO) {
        this.context = context;
        this.defaultLevel = defaultLevel;
    }
    log(msg, level) {
        if (!Logger.loggingActive)
            return;
        if (level)
            console.log(`%c[${level}][${this.context}] ${msg}`, this.getLoggerLevelColor(level));
        else
            console.log(`%c[${this.defaultLevel}][${this.context}] ${msg}`, this.getLoggerLevelColor(this.defaultLevel));
    }
    raw(msg) {
        console.log(`[${this.context}] printed ->`);
        console.log(msg);
    }
    getContext() {
        return `[${this.context}]`;
    }
    getLoggerLevelColor(lvl) {
        let color = 'color: ';
        switch (lvl) {
            case LoggerLevel.DBG:
                return color + LoggerColor.DBG;
            case LoggerLevel.INFO:
                return color + LoggerColor.INFO;
            case LoggerLevel.WRN:
                return color + LoggerColor.WRN;
            case LoggerLevel.ERR:
                return color + LoggerColor.ERR;
        }
    }
}
exports.Logger = Logger;


/***/ }),

/***/ 607:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// console.log('ceggggg');
// import { Logger, LoggerLevel } from './Logger/Logger'
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// const { ipcRenderer } = require('electron')
// ipcRenderer.on('TESTING', () => console.log('am primit'))
// // console.log('hello');
// // let logger = new Logger('App', LoggerLevel.DBG)
// // logger.log('dd')
const App_1 = __importDefault(__webpack_require__(174));
const app = new App_1.default();


/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 37:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 17:
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(607);
/******/ 	
/******/ })()
;