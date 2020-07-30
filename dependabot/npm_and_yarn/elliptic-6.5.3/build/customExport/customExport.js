/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./customExport/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./customExport/index.ts":
/*!*******************************!*\
  !*** ./customExport/index.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var CustomExport = /** @class */ (function () {\n    function CustomExport() {\n        this.feature = 'export';\n    }\n    CustomExport.prototype.preInit = function () {\n        console.log('Sample export plugin pre-init check.');\n    };\n    CustomExport.prototype.init = function (api) {\n        this.api = api;\n        CustomExport.instances[this.api.id] = this;\n    };\n    /**\n     * Creates a stack of export images and returns them to RAMP.\n     *\n     * An export plugin should return a collection of promises each resolving with with a graphic and its offset\n     * { graphic: <canvas>, offset: [<left>, <top>] }[]\n     * - the first graphic is considered to be the base graphic and its offset should be [0,0]\n     * - all other graphics will be offset relative to the base graphic\n     * - when all promises have resolved, export is considered to be generated\n     * - if any of the promises fail, the export is considered to have failed and a standard error message will be displayed\n     *\n     * The plugin is free to rearrange `legendBlocks` as it sees fit as long as its structure remains valid.\n     *\n     * @param {ExportPluginOptions} { legendBlocks, mapSize } `legendBlocks` is a hierarchy of legend block representing the current legend; `mapSize` indicates the size of the map image visible on the screen\n     * @returns {Promise<HTMLCanvasElement>[]}\n     * @memberof CustomExport\n     */\n    CustomExport.prototype.generateExportStack = function (_a) {\n        var legendBlocks = _a.legendBlocks, mapSize = _a.mapSize;\n        var promises = [];\n        // create a base image and colour it white\n        var baseImage = RAMP.utils.createCanvas(mapSize.width, mapSize.height);\n        var baseImageCtx = baseImage.getContext('2d');\n        baseImageCtx.fillStyle = '#ffffff';\n        baseImageCtx.fillRect(0, 0, baseImage.width, baseImage.height);\n        // create underlying base canvas\n        promises.push(Promise.resolve({\n            graphic: baseImage\n        }));\n        //\n        var mapImageSize = {\n            width: mapSize.width * 0.8 - 20,\n            height: mapSize.height - 20\n        };\n        var sourceX = (mapSize.width - mapImageSize.width) / 2;\n        var sourceY = (mapSize.height - mapImageSize.height) / 2;\n        // svg export graphic needs to be generated first because generating a server-side map image hides svg layers (unless using local printing)\n        // TODO: prevent map generators from accepting export sizes\n        var apiGenerators = this.api.exportGenerators;\n        var pointsImage = apiGenerators.mapSVG().then(function (data) {\n            var canvas = RAMP.utils.createCanvas(mapImageSize.width, mapImageSize.height);\n            // crop the map image returned by the generator to fit into the layout\n            // https://www.html5canvastutorials.com/tutorials/html5-canvas-image-crop/\n            canvas\n                .getContext('2d')\n                .drawImage(data.graphic, sourceX, sourceY, mapImageSize.width, mapImageSize.height, 0, 0, mapImageSize.width, mapImageSize.height);\n            return { graphic: canvas, offset: [10, 10] };\n        });\n        var mapImage = apiGenerators.mapImage({ backgroundColour: '#bfe8fe' }).then(function (data) {\n            var canvas = RAMP.utils.createCanvas(mapImageSize.width, mapImageSize.height);\n            // crop the map image returned by the generator to fit into the layout\n            // https://www.html5canvastutorials.com/tutorials/html5-canvas-image-crop/\n            canvas\n                .getContext('2d')\n                .drawImage(data.graphic, sourceX, sourceY, mapImageSize.width, mapImageSize.height, 0, 0, mapImageSize.width, mapImageSize.height);\n            return { graphic: canvas, offset: [10, 10] };\n        });\n        var northArrowImage = apiGenerators.northArrow().then(function (data) { return ({\n            graphic: data.graphic,\n            offset: [40, 20]\n        }); });\n        var scaleBarImage = apiGenerators.scaleBar().then(function (data) { return ({\n            graphic: data.graphic,\n            offset: [mapImageSize.width - 10 - 120, mapImageSize.height - 50 - 10]\n        }); });\n        // we can pass in a modified copy of the legendBlocks if needed, in order to include/exclude certain layers from legend generation\n        var legendImage = apiGenerators\n            .legend({\n            columnWidth: mapSize.width * 0.2 - 20 - 10,\n            width: mapSize.width * 0.2 - 20 - 10,\n            height: mapImageSize.height,\n            legendBlocks: legendBlocks\n        })\n            .then(function (data) { return ({\n            graphic: data.graphic,\n            offset: [mapImageSize.width + 30, 10]\n        }); });\n        var titleImage = apiGenerators\n            .htmlMarkup(\"<span style=\\\"font-size: 35px; padding: 8px 14px; display: block; text-align: center;\\\"><b>Interesting Fact</b> | <i>Atomic Engineering Lab</i> is out of \\uD83C\\uDF82</span>\")\n            .then(function (data) { return ({\n            graphic: data.graphic,\n            offset: [mapImageSize.width - 10 - data.graphic.width, 10 + 20]\n        }); });\n        promises.push(mapImage, pointsImage, northArrowImage, scaleBarImage, legendImage, titleImage);\n        return promises;\n    };\n    // A store of the instances of areasOfInterest, 1 per map\n    CustomExport.instances = {};\n    return CustomExport;\n}());\nCustomExport.prototype.translations = {\n    'en-CA': {\n        title: 'Cake Export'\n    },\n    'fr-CA': {\n        title: \"Export la Cake\"\n    }\n};\nwindow.customExport = CustomExport;\n\n\n//# sourceURL=webpack:///./customExport/index.ts?");

/***/ })

/******/ });