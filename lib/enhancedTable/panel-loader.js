"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var templates_1 = require("./templates");
/**
 * Creates and manages one api panel instance to display the loading indicator before the `enhancedTable` is loaded.
 */
var PanelLoader = /** @class */ (function () {
    function PanelLoader(mapApi, legendBlock) {
        this.mapApi = mapApi;
        this.legendBlock = legendBlock;
        this.panel = this.mapApi.createPanel('enhancedTableLoader');
        this.prepareControls();
        this.prepareBody();
        this.hidden = true;
    }
    PanelLoader.prototype.setSize = function (maximized) {
        if (maximized) {
            this.panel.element[0].classList.add('full');
        }
        else {
            this.panel.element[0].classList.remove('full');
        }
    };
    PanelLoader.prototype.prepareControls = function () {
        this.panel.setControls(this.header);
        this.panel.panelControls.css({
            display: 'flex',
            'align-items': 'center',
            height: '48px',
            padding: '0px 12px 0px 16px',
            'border-bottom': '1px solid lightgray',
            margin: '0 -8px 1px -8px'
        });
    };
    PanelLoader.prototype.open = function () {
        this.panel.open();
        this.hidden = false;
    };
    PanelLoader.prototype.prepareBody = function () {
        this.panel.panelContents.css({
            margin: 0,
            padding: '0 8px 8px'
        });
        this.panel.panelBody.css({
            padding: 0,
            height: 'calc(100% - 47px)'
        });
        this.panel.panelBody.addClass('ag-theme-material');
        this.panel.element[0].setAttribute('type', 'table');
        this.panel.element[0].classList.add('default');
        var template = templates_1.TABLE_LOADING_TEMPLATE(this.legendBlock);
        this.panel.setBody(template);
    };
    PanelLoader.prototype.close = function () {
        this.panel.close();
        this.mapApi.deletePanel('enhancedTableLoader');
    };
    Object.defineProperty(PanelLoader.prototype, "header", {
        get: function () {
            var closeBtn = new this.panel.button('X');
            return ["<div class=\"title-container\"><h3 class=\"md-title table-title\">Features: " + this.legendBlock.name + "</h3></div>", '<span style="flex: 1;"></span>', closeBtn];
        },
        enumerable: true,
        configurable: true
    });
    return PanelLoader;
}());
exports.PanelLoader = PanelLoader;
