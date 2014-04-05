/**
 * This file contains an ExtJS user extension for Blockly library
 * Note that this doesn't use the standard Blockly library since this
 * requires the google closure compiler. Instead an Ext port is provided.
 * @author Chris Jackson
 */


Ext.define('Ext.ux.Blockly', {
    extend: 'Ext.panel.Panel',
    closable: true,
    layout: 'border',
    toolbox: null,
    trashcan: true,
    header: false,
    items: [],
    selectedRecord: null,

    initComponent: function () {
        var me = this;

        var toolboxGrids = [];


        if (me.toolbox == true) {
            // Create an array of category grids.
            for (var i = 0; i < me.toolboxCategories.length; i++) {
                // (Unfortunately!) We need to use separate stores with an accordion.
                // If we just use a filter, there is a problem as for a short
                // time two grids are in view and we then see the same view.
                var store = Ext.create('Ext.data.ArrayStore', {
                    fields: [
                        {name: 'category'},
                        {name: 'block'},
                        {name: 'svg'},
                        {name: 'name'}
                    ]
                });

                // Load the data
                for (var t = 0; t < me.toolboxTools.length; t++) {
                    if (me.toolboxTools[t].category === me.toolboxCategories[i].name) {
                        store.add(me.toolboxTools[t]);
                    }
                }

                // Create the separate lists for the accordion panels
                var cat = Ext.create('Ext.grid.Panel', {
                    title: me.toolboxCategories[i].name,
                    icon: me.toolboxCategories[i].icon,
                    tooltip: me.toolboxCategories[i].tooltip,
                    category: me.toolboxCategories[i].name,
                    hideHeaders: true,
                    store: store,
                    collapsible: false,
                    multiSelect: false,
                    disableSelection: true,
                    layout: 'fit',
                    viewConfig: {
                        stripeRows: true,
                        enableTextSelection: false,
                        markDirty: false
                    },
                    columns: [
                        {
                            flex: 1,
                            dataIndex: 'svg'
                        }
                    ],
                    listeners: {
                        render: function (grid) {
                            // TODO: This doesn't work!
                            Ext.create('Ext.tip.ToolTip', {
                                target: grid.getHeader(),
                                html: grid.tooltip
                            });

                            grid.dragZone = Ext.create('Ext.dd.DragZone', grid.getEl(), {
                                // On receipt of a mousedown event, see if it is within a draggable element.
                                // Return a drag data object if so. The data object can contain arbitrary application
                                // data, but it should also contain a DOM element in the ddel property to provide
                                // a proxy to drag.
                                getDragData: function (e) {
                                    console.log("drag data");
                                    var sourceEl = e.getTarget("svg", 10);
                                    if (sourceEl) {
                                        var d = sourceEl.cloneNode(true);
                                        d.id = Ext.id();
                                        return grid.dragData = {
                                            sourceEl: sourceEl,
                                            repairXY: Ext.fly(sourceEl).getXY(),
                                            ddel: d,
                                            block: me.selectedRecord.get("block")
                                        };
                                    }
                                },

                                // Provide coordinates for the proxy to slide back to on failed drag.
                                // This is the original XY coordinates of the draggable element.
                                getRepairXY: function () {
                                    return this.dragData.repairXY;
                                }
                            });
                        },
                        beforecellmousedown: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                            console.log("select");
                            me.selectedRecord = record;
                        },
                        itemdblclick: function (grid, record) {
                            if (record == null)
                                return;

                            var cc = Blockly.Xml.textToDom(record.get("block"));
                            Blockly.Xml.domToBlock(Blockly.mainWorkspace, cc.childNodes[0]);
                        }
                    }
                });

                toolboxGrids.push(cat);
            }

            // Create the toolbox accordion and add all the grids
            var accordion = Ext.create('Ext.Panel', {
                split: true,
                border: true,
                region: 'west',
                flex: 1,
                preventHeader: true,
                layout: {
                    type: 'accordion',
                    hideCollapseTool: true
                },
                listeners: {
                    expand: function (panel, eOpts) {

                    }
                },
                items: toolboxGrids
            });
            this.items.push(accordion);
        }

        // Create the panel to hold the Blockly editor
        var blocklyPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            layout: 'fit',
            flex: 4,
            listeners: {
                afterrender: function () {
                    renderBlockly();
                },
                resize: function (panel, width, height, oldWidth, oldHeight, eOpts) {
                    Blockly.resizeWindow(width, height);
                },
                move: function (panel, x, y) {
                    Blockly.setClientPosition(x, y);
                }
            }
        });
        this.items.push(blocklyPanel);

        this.callParent();

        function renderBlockly() {
            var blocklyId = blocklyPanel.getId() + "-body";
            // Initialise Blockly
            Blockly.inject(document.getElementById(blocklyId), {path: '../', trashcan: me.trashcan});


            if (me.toolbox == true) {


                blocklyPanel.dropZone = Ext.create('Ext.dd.DropZone', Blockly.DIV, {
                    // If the mouse is over a target node, return that node. This is
                    // provided as the "target" parameter in all "onNodeXXXX" node event handling functions
                    getTargetFromEvent: function (e) {
                        console.log("node in");
                        //    var xx = win.getItems();
                        //win.fireEvent("mousemove", {clientX: e.xy[0], clientY: e.xy[1]});
                        //                    Blockly.fireUiEvent(document, 'mousemove');
                        //                    Blockly.onMouseMove_();
                        return e.getTarget("#" + blocklyId);
                    },

                    // While over a target node, return the default drop allowed class which
                    // places a "tick" icon into the drag proxy.
                    onNodeOver: function (target, dd, e, data) {
                        return Ext.dd.DropZone.prototype.dropAllowed;
                    },
                    // On node drop, we can interrogate the target node to find the underlying
                    // application object that is the real target of the dragged data.
                    // We can use the data set up by the DragZone's getDragData method to read
                    // any data we decided to attach.
                    onNodeDrop: function (target, dd, e, data) {
                        if (data.block == null)
                            return false;

                        var cc = Blockly.Xml.textToDom(data.block);
                        Blockly.Xml.domToBlock(Blockly.mainWorkspace, cc.childNodes[0]);

                        return true;
                    }
                });


                // Loop through all records in the toolbox and create the SVG graphic
                for (var i = 0; i < toolboxGrids.length; i++) {
                    toolboxGrids[i].store.each(function (record, id) {
                        var blockXml = Blockly.Xml.textToDom(record.get("block"));
                        if (blockXml == null || blockXml.hasChildNodes() == false) {
                            console.log("Unable to load block '" + record.get("block") + "'.");
                        }
                        else {
                            var block = Blockly.Xml.domToBlock(Blockly.mainWorkspace, blockXml.childNodes[0]);

                            var svg = '<svg height="' + block.getHeightWidth().height + '">' + block.getSvgRoot().outerHTML + "</svg>";
                            record.set('svg', svg);

                            Blockly.mainWorkspace.clear();
                        }
                    }, me);
                }
            }

            // Load the design into the workspace
            if (me.blocks != null)
                me.setBlocks(me.blocks);
        }
    },
    setBlocks: function (blocks) {
        Blockly.mainWorkspace.clear();
        var xml = Blockly.Xml.textToDom(blocks);
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    },
    getBlocks: function (readable) {
        var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        if (readable == true)
            return Blockly.Xml.domToPrettyText(xml);
        else
            return Blockly.Xml.domToText(xml);
    }
});
