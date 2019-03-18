import { TABLE_LOADING_TEMPLATE } from './templates';

/**
 * Creates and manages one api panel instance to display the loading indicator before the `enhancedTable` is loaded.
 */
export class PanelLoader {

    constructor(mapApi: any, legendBlock) {
        this.mapApi = mapApi;
        this.legendBlock = legendBlock;
        this.panel = this.mapApi.createPanel('enhancedTableLoader');
        this.prepareControls();
        this.prepareBody();
        this.hidden = true;
    }

    setSize(maximized) {
        if (maximized) {
            this.panel.element[0].classList.add('full');
        } else {
            this.panel.element[0].classList.remove('full');
        }
    }

    prepareControls() {
        this.panel.setControls(this.header);
        this.panel.panelControls.css({
            display: 'flex',
            'align-items': 'center',
            height: '48px',
            padding: '0px 12px 0px 16px',
            'border-bottom': '1px solid lightgray',
            margin: '0 -8px 1px -8px'
        });
    }

    open() {
        this.panel.open();
        this.hidden = false;
    }

    prepareBody() {
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
        let template = TABLE_LOADING_TEMPLATE(this.legendBlock);
        this.panel.setBody(template);
    }

    close() {
        this.panel.close();
        this.mapApi.deletePanel('enhancedTableLoader')
    }

    get header(): any[] {
        const closeBtn = new this.panel.button('X');
        return [`<div class="title-container"><h3 class="md-title table-title">Features: ${this.legendBlock.name}</h3></div>`, '<span style="flex: 1;"></span>', closeBtn];
    }
}

export interface PanelLoader {
    mapApi: any;
    panel: any;
    hidden: boolean;
    legendBlock: any;
}
