/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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

/***/ 298:
/***/ ((module) => {

module.exports = require("electron");

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const Logger_1 = __webpack_require__(944);
const { ipcRenderer } = __webpack_require__(298);
console.log('hello');
let logger = new Logger_1.Logger('GifExporter', Logger_1.LoggerLevel.DBG);
logger.log('ok');
function goToFirstWindow(test) {
    console.log('omg');
    ipcRenderer.send('TESTING', {});
}
goToFirstWindow(3);
//@ts-ignore
window.goToFirstWindow = goToFirstWindow;

})();

/******/ })()
;