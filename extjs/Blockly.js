/**
 * This file contains ax ExtJS user extension for Blockly library
 * Note that this doesn't use the standard Blockly library since this
 * requires the google closure compiler. Instead an Ext port is required.
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

    initComponent: function () {
        var me = this;

        var toolboxStore = null;

        /*
         function initializeBlockDragZone(v) {
         v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {

         //      On receipt of a mousedown event, see if it is within a draggable element.
         //      Return a drag data object if so. The data object can contain arbitrary application
         //      data, but it should also contain a DOM element in the ddel property to provide
         //      a proxy to drag.
         getDragData: function (e) {
         var sourceEl = e.getTarget("svg", 10);
         if (sourceEl) {
         var d = sourceEl.cloneNode(true);
         d.id = Ext.id();
         return v.dragData = {
         sourceEl: sourceEl,
         repairXY: Ext.fly(sourceEl).getXY(),
         ddel: d,
         patientData: v.record.get("block")
         };
         }
         },

         //      Provide coordinates for the proxy to slide back to on failed drag.
         //      This is the original XY coordinates of the draggable element.
         getRepairXY: function () {
         return this.dragData.repairXY;
         }
         });


         //        grid.dropZone =
         Ext.create('Ext.dd.DropZone', "blocklyHere", {

         //      If the mouse is over a target node, return that node. This is
         //      provided as the "target" parameter in all "onNodeXXXX" node event handling functions
         getTargetFromEvent: function (e) {
         console.log("node in");
         //    var xx = win.getItems();
         win.fireEvent("mousemove", {clientX: e.xy[0], clientY: e.xy[1]});
         //                    Blockly.fireUiEvent(document, 'mousemove');
         //                    Blockly.onMouseMove_();
         return e.getTarget('#blocklyHere');
         },

         //      While over a target node, return the default drop allowed class which
         //      places a "tick" icon into the drag proxy.
         //               onNodeOver: function (target, dd, e, data) {
         //                 console.log("can we drop?");
         //               return Ext.dd.DropZone.prototype.dropAllowed;
         //         },

         //      On node drop, we can interrogate the target node to find the underlying
         //      application object that is the real target of the dragged data.
         //      In this case, it is a Record in the GridPanel's Store.
         //      We can use the data set up by the DragZone's getDragData method to read
         //      any data we decided to attach.
         onNodeDrop: function (target, dd, e, data) {
         //                var rowBody = Ext.fly(target).findParent('.x-grid-rowbody-tr', null, false),
         //                        mainRow = rowBody.previousSibling,
         //                        h = gridView.getRecord(mainRow),
         //                        targetEl = Ext.get(target);

         //                targetEl.update(data.patientData.name + ', ' + targetEl.dom.innerHTML);
         //                        Ext.Msg.alert('Drop gesture', 'Dropped patient ' + data.patientData.name +
         //                        ' on hospital ' + h.data.name);
         Ext.Msg.alert('Drop gesture', 'Dropped block');

         if (record == null)
         return;

         var cc = Blockly.Xml.textToDom(data.patientData);
         Blockly.Xml.domToBlock(Blockly.mainWorkspace, cc.childNodes[0]);

         return true;
         }
         });
         }

         */






        if (this.toolbox != null) {
            // Create the toolbox store
            var toolboxStore = Ext.create('Ext.data.ArrayStore', {
                fields: [
                    {name: 'category'},
                    {name: 'block'},
                    {name: 'svg'},
                    {name: 'name'}
                ]
            });
            // Load the data
            toolboxStore.loadData(this.toolbox);
/*

            // Create the accordion for navigation
            var navigation = Ext.create('Ext.Panel', {
                split: true,
                border: true,
                region: 'west',
                flex: 1,
                preventHeader: true,
                layout: {
                    type: 'accordion',
                    hideCollapseTool: true
                },
                items: []
            });

*/

                        // Create the separate lists for the accordion panels
                        var panel1 = Ext.create('Ext.grid.Panel', {
                            title:"x",
                            hideHeaders: true,
                            store: toolboxStore,
                            collapsible: false,
                            multiSelect: false,
                            disableSelection: true,
                            layout:'fit',
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
            //                    render: initializeBlockDragZone,
                                itemdblclick: function (grid, record) {
                                    if (record == null)
                                        return;

                                    var cc = Blockly.Xml.textToDom(record.get("block"));
                                    Blockly.Xml.domToBlock(Blockly.mainWorkspace, cc.childNodes[0]);
                                }
                            }
                        });


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
                items: [panel1]
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
            var id = blocklyPanel.getId() + "-body";
            // Initialise Blockly
            Blockly.inject(document.getElementById(id), {path: '../', trashcan: me.trashcan});

            if (this.toolbox != null) {
                // Loop through all records in the toolbox and create the SVG graphic
                toolboxStore.each(function (record, id) {
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
                }, me)
            }

            // Load the design into the workspace
            Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, document.getElementById('go'));
        }
    }
});
