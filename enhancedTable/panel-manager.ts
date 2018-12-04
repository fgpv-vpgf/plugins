import { Grid } from 'ag-grid-community';
import { SEARCH_TEMPLATE, MENU_TEMPLATE, CLEAR_FILTERS_TEMPLATE, COLUMN_VISIBILITY_MENU_TEMPLATE } from './templates';
import 'ag-grid-community/dist/styles/ag-grid.css';
import './main.scss';

/**
 * Creates and manages one api panel instance to display the table in the ramp viewer. One panelManager is created for each map instance on the page.
 *
 * This class also contains custom angular controllers to enable searching, printing, exporting, and more from angular material panel controls.
 */
export class PanelManager {

    constructor(mapApi: any) {
        this.mapApi = mapApi;
        this.tableContent = $(`<div rv-focus-exempt></div>`);
        this.panel = this.mapApi.createPanel('enhancedTable');

        this.setSize();
        this.panel.panelBody.addClass('ag-theme-material');
        this.panel.content = new this.panel.container(this.tableContent);
    }

    // gets the updated text to display for the enhancedTable's filter status
    getFilterStatus() {
        let text: string;

        if (this.tableOptions.api && this.tableOptions.api.getDisplayedRowCount() < this.tableOptions.rowData.length) {
            text = `${this.tableOptions.api.getDisplayedRowCount()} records shown (filtered from ${this.tableOptions.rowData.length} records)`;
        }
        else {
            text = `${this.tableOptions.rowData.length} records shown`;
        }

        if (this.panel.panelControls.find('.filterRecords')[0]) {
            this.panel.panelControls.find('.filterRecords')[0].innerHTML = text;
        }
        this.getScrollRange();
        return text;
    }

    // gets the updated row range to get as table is scrolled vertically (example "showing 1-10 of 50 entries")
    getScrollRange() {
        let rowRange: string;
        if (this.tableOptions && this.tableOptions.api) {
            const topPixel = this.tableOptions.api.getVerticalPixelRange().top;
            const bottomPixel = this.tableOptions.api.getVerticalPixelRange().bottom;
            let firstRow;
            let lastRow;
            this.tableOptions.api.getRenderedNodes().forEach(row => {
                //if the top row is greater than the top pixel plus a little (to account rows that are just a little cut off) then broadcast its index in the status
                if (firstRow === undefined && row.rowTop > topPixel - (row.rowHeight / 2)) {
                    firstRow = parseInt(row.rowIndex) + 1;
                }
                //if the bottom row is less than the bottom pixel plus a little (to account rows that are just a little cut off) then broadcast its index in the status
                if ((row.rowTop + row.rowHeight) < bottomPixel + (row.rowHeight / 2)) {
                    lastRow = parseInt(row.rowIndex) + 1;
                }
            });
            if (firstRow === undefined && lastRow === undefined) {
                firstRow = 0;
                lastRow = 0;
            }
            rowRange = firstRow.toString() + " - " + lastRow.toString();
        }
        else {
            rowRange = this.maximized ? '1 - 15' : '1 - 5';
        }
        if (this.panel.panelControls.find('.scrollRecords')[0]) {
            this.panel.panelControls.find('.scrollRecords')[0].innerHTML = rowRange;
        }

        return rowRange;
    }

    // sets and updates table filters according to layer and symbol visibilities
    setAndUpdateVisibility() {

        this.setLegendBlock(this.currentTableLayer._mapInstance.legendBlocks.entries);

        // change table filters on layer visibility change
        this.legendBlock.visibilityChanged.subscribe(visibility => {
            if (this.tableOptions.api
                && this.currentTableLayer.visibility === visibility
                && visibility !== this.visibility) {
                //code below is only executed when layer visibility changes (not symbology toggles)
                if (!visibility) {
                    //if set to invisible: store current filter, and then filter out all visible rows
                    this.tableOptions.api.validOIDs = undefined;
                    this.storedFilter = this.tableOptions.api.getFilterModel();
                    this.prevQuickFilterText = this.quickFilterText;
                    this.tableOptions.api.setQuickFilter('1=2');
                    this.quickFilterText = '1=2';
                    this.visibility = false;
                    this.tableOptions.api.selectAllFiltered();
                    this.getFilterStatus();
                    this.tableOptions.api.deselectAllFiltered();
                } else {
                    // if set to visibile: show all rows and clear external filter (because all symbologies will be checked in)
                    if (this.prevQuickFilterText !== undefined && this.prevQuickFilterText !== '1=2') {
                        this.tableOptions.api.setQuickFilter(this.prevQuickFilterText);
                        this.quickFilterText = this.prevQuickFilterText;
                    }
                    else {
                        this.tableOptions.api.setQuickFilter('');
                        this.quickFilterText = '';
                    }
                    this.externalFilter = false;
                    this.tableOptions.api.onFilterChanged();
                    if (this.storedFilter !== undefined) {
                        // if any filter was previously stored reset it
                        this.tableOptions.api.setFilterModel(this.storedFilter);
                        this.storedFilter = undefined;
                    }
                    this.visibility = true;
                    this.tableOptions.api.selectAllFiltered();
                    this.getFilterStatus();
                    this.tableOptions.api.deselectAllFiltered();
                }
            }
            else if (this.legendBlock.parent.blockType === 'set' && this.legendBlock.visibility === visibility) {
                // sets don't follow the same logic, the layer visibility changes after the block is selected/unselected so above logic won't work
                if (!visibility) {
                    this.storedFilter = this.tableOptions.api.getFilterModel();
                    this.tableOptions.api.setQuickFilter('1=2');
                    this.quickFilterText = '1=2';
                    this.visibility = false;
                } else {
                    this.tableOptions.api.setQuickFilter('');
                    this.quickFilterText = '';
                    if (this.storedFilter !== undefined) {
                        // if any filter was previously stored reset it
                        this.tableOptions.api.setFilterModel(this.storedFilter);
                        this.storedFilter = undefined;
                    }
                    this.visibility = true;
                }
            }
        });

        const legendBlock = this.legendBlock;

        if (this.tableOptions.api) {
            let panelManager = this;
            // this portion gets called when the table is first opened

            this.tableOptions.isExternalFilterPresent = function () {
                return panelManager.externalFilter && legendBlock.validOIDs !== undefined;
            }

            this.tableOptions.doesExternalFilterPass = function (node) {
                return legendBlock.validOIDs.includes(node.data.OBJECTID);
            }

            if (!this.currentTableLayer.visibility) {
                // if  layer is invisible, table needs to show zero entries
                this.tableOptions.api.setQuickFilter('1=2');
                this.quickFilterText = '1=2';
            } else if (legendBlock.validOIDs !== undefined) {
                // if validOIDs are defined, filter symbologies
                this.externalFilter = true;
                this.tableOptions.api.onFilterChanged();
                this.tableOptions.api.selectAllFiltered();
                this.getFilterStatus();
                this.tableOptions.api.deselectAllFiltered();
            }
        }

        // when one of the symbols are toggled on/off, filter the table
        legendBlock.symbolVisibilityChanged.subscribe(visibility => {
            if (visibility === undefined && this.externalFilter !== false && legendBlock.symbDefinitionQuery === undefined) {
                // this ensures external filter is turned off in the scenario where the last symbology toggle is selected
                this.externalFilter = false;
                this.tableOptions.api.onFilterChanged();
                this.tableOptions.api.selectAllFiltered();
                this.getFilterStatus();
                this.tableOptions.api.deselectAllFiltered();
            } else if (visibility !== undefined) {
                // this ensures proper symbologies are filtered out
                this.externalFilter = true;
                if (this.quickFilterText === '1=2') {
                    // if this is a symbol being toggled on which sets layer visibility to true
                    if (this.prevQuickFilterText === undefined) {
                        //clear the undefined quick filter if no quick filter was stored
                        this.tableOptions.api.setQuickFilter('');
                        this.quickFilterText = '';
                    } else {
                        // clear the undefined quick filter and restore the previous quick filter
                        this.tableOptions.api.setQuickFilter(this.prevQuickFilterText);
                        this.quickFilterText = this.prevQuickFilterText;
                        this.prevQuickFilterText = undefined
                    }

                    if (this.storedFilter !== undefined) {
                        // if any column filters were previously stored, restore them
                        this.tableOptions.api.setFilterModel(this.storedFilter);
                        this.storedFilter = undefined;
                    }
                }
                this.tableOptions.api.onFilterChanged();
                this.tableOptions.api.selectAllFiltered();
                this.getFilterStatus();
                this.tableOptions.api.deselectAllFiltered();
            }
        });
    }

    // recursively find and set the legend block for the layer
    setLegendBlock(legendEntriesList: any) {
        legendEntriesList.forEach(entry => {
            if (entry.proxyWrapper !== undefined && this.currentTableLayer._layerProxy === entry.proxyWrapper.proxy) {
                this.legendBlock = entry;
            }
            else if (entry.children || entry.entries) {
                this.setLegendBlock(entry.children || entry.entries);
            }
        });
    }

    setFilterandScrollWatch() {
        let that = this;
        this.tableOptions.onFilterChanged = function (event) {
            if (that.tableOptions && that.tableOptions.api) {
                that.tableOptions.api.selectAllFiltered();
                that.getFilterStatus();
                that.tableOptions.api.deselectAllFiltered();
            }
        }
        this.tableOptions.onBodyScroll = function (event) {
            that.getScrollRange();
        }
    }

    open(tableOptions: any, layer: any) {
        if (this.currentTableLayer === layer) {
            this.close();
        } else {
            this.tableOptions = tableOptions;
            this.setFilterandScrollWatch();

            let controls = this.header;
            controls = [new this.panel.container('<span style="flex: 1;"></span>'), ...controls];
            controls = [new this.panel.container(`<div style="padding-bottom :30px"><h2><b>Features: ${layer.name}</b></h2><br><p><span class="scrollRecords">${this.getScrollRange()}</span> of <span class="filterRecords">${this.getFilterStatus()}</span></div>`), ...controls];
            this.panel.controls = controls;
            this.panel.panelBody.css('padding-top', '16px');
            this.panel.panelControls.css('display', 'flex');
            this.panel.panelControls.css('align-items', 'center');
            this.currentTableLayer = layer;
            this.tableContent.empty();
            new Grid(this.tableContent[0], tableOptions);
            this.getScrollRange();

            this.tableOptions.onGridReady = () => {
                this.autoSizeToMaxWidth();
                this.sizeColumnsToFitIfNeeded();
                let colApi = this.tableOptions.columnApi
                colApi.getDisplayedColAfter(colApi.getColumn('rvInteractive')).setSort("asc");
            };
            this.setAndUpdateVisibility();
            this.panel.open();
        }
    }

    close() {
        this.panel.close();
        this.currentTableLayer = undefined;
    }

    onBtnExport() {
        this.tableOptions.api.exportDataAsCsv();
    }

    onBtnPrint() {
        this.panel.panelBody.css({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: this.tableOptions.api.getPreferredWidth() + 2,
            'z-index': '5',
            height: 'auto'
        });

        this.tableOptions.api.setGridAutoHeight(true);
        this.panel.panelBody.prependTo('body');

        setTimeout(() => {
            window.print();
            this.panel.panelBody.appendTo(this.panel.panelContents);
            this.panel.panelBody.css({
                position: '',
                top: '',
                left: '',
                width: '',
                'z-index': '',
                height: 'calc(100% - 38px)'
            });
            this.setSize();
            this.tableOptions.api.setGridAutoHeight(false);
        }, 650);
    }

    setSize() {
        this.panel.panelContents.css({
            top: '0px',
            left: '410px',
            right: '0px',
            bottom: this.maximized ? '0px' : '50%',
            padding: '0px 16px 16px 16px'
        });
    }

    /**
     * Auto size all columns but check the max width
     * Note: Need a custom function here since setting maxWidth prevents
     *       `sizeColumnsToFit()` from filling the entire panel width
    */
    autoSizeToMaxWidth(columns?: Array<any>) {
        const maxWidth = 400;
        columns = columns ? columns : this.tableOptions.columnApi.getAllColumns();
        this.tableOptions.columnApi.autoSizeColumns(columns);
        columns.forEach(c => {
            if (c.actualWidth > maxWidth) {
                this.tableOptions.columnApi.setColumnWidth(c, maxWidth);
            }
        });
    };

    /**
     * Check if columns don't take up entire grid width. If not size the columns to fit.
     */
    sizeColumnsToFitIfNeeded() {
        const columns = this.tableOptions.columnApi.getAllDisplayedColumns();
        const panel = this.tableOptions.api.gridPanel;
        const availableWidth = panel.getWidthForSizeColsToFit();
        const usedWidth = panel.columnController.getWidthOfColsInList(columns);
        if (usedWidth < availableWidth) {
            this.tableOptions.api.sizeColumnsToFit();
        }
    }

    get id(): string {
        this._id = this._id ? this._id : 'fancyTablePanel-' + Math.floor(Math.random() * 1000000 + 1) + Date.now();
        return this._id;
    }

    get header(): any[] {
        this.angularHeader();

        const menuBtn = new this.panel.container(MENU_TEMPLATE);

        const closeBtn = new this.panel.button('X');

        const searchBar = new this.panel.container(SEARCH_TEMPLATE);

        const clearFiltersBtn = new this.panel.container(CLEAR_FILTERS_TEMPLATE);

        const columnVisibilityMenuBtn = new this.panel.container(COLUMN_VISIBILITY_MENU_TEMPLATE);

        return [searchBar, columnVisibilityMenuBtn, clearFiltersBtn, menuBtn, closeBtn];
    }

    angularHeader() {
        const that = this;
        this.mapApi.agControllerRegister('SearchCtrl', function () {
            this.searchText = '';
            this.updatedSearchText = function () {
                that.tableOptions.api.setQuickFilter(this.searchText);
                that.quickFilterText = this.searchText;
                that.tableOptions.api.selectAllFiltered();
                that.getFilterStatus();
                that.tableOptions.api.deselectAllFiltered();
            };
            this.clearSearch = function () {
                this.searchText = '';
                this.updatedSearchText();
            };
        });

        this.mapApi.agControllerRegister('MenuCtrl', function () {
            this.appID = that.mapApi.id;
            this.maximized = that.maximized ? 'true' : 'false';
            this.showFilter = !!that.tableOptions.floatingFilter;

            // sets the table size, either split view or full height
            this.setSize = function (value) {
                that.maximized = value === 'true' ? true : false;
                that.setSize();
                that.getScrollRange();
            };

            // print button has been clicked
            this.print = function () {
                that.onBtnPrint();
            };

            // export button has been clicked
            this.export = function () {
                that.onBtnExport();
            };

            // Hide filters button has been clicked
            this.toggleFilters = function () {
                that.tableOptions.floatingFilter = this.showFilter;
                that.tableOptions.api.refreshHeader();
            };
        });

        this.mapApi.agControllerRegister('ClearFiltersCtrl', function () {
            // clear all column filters
            this.clearFilters = function () {
                that.tableOptions.api.setFilterModel(null);
            };

            // determine if any column filters are present
            this.anyFilters = function () {
                return that.tableOptions.api.isAdvancedFilterPresent();
            };
        });

        this.mapApi.agControllerRegister('ColumnVisibilityMenuCtrl', function () {
            this.columns = that.tableOptions.columnDefs;
            this.columnVisibilities = this.columns
                .filter(element => element.headerName)
                .map(element => ({ id: element.field, title: element.headerName, visibility: true }));

            // toggle column visibility
            this.toggleColumn = function (col) {
                col.visibility = !col.visibility;
                that.tableOptions.columnApi.setColumnVisible(col.id, col.visibility);

                // on showing a column resize to autowidth then shrink columns that are too wide
                if (col.visibility) {
                    that.autoSizeToMaxWidth();
                }

                // fit columns widths to table if there's empty space
                that.sizeColumnsToFitIfNeeded();
            };
        });
    }
}

export interface PanelManager {
    panel: any;
    mapApi: any;
    tableContent: JQuery<HTMLElement>;
    _id: string;
    currentTableLayer: any;
    maximized: boolean;
    tableOptions: any;
    storedFilter: any;
    legendBlock: any;
    externalFilter: boolean;
    quickFilterText: any;
    prevQuickFilterText: any;
    visibility: boolean;
}
