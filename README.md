ExtBlockly is a port of the Blockly graphical programming environment to run under ExtJS 4. This is done to remove the dependancy on the Closure compiler and provide a consistent look and feel interface with ExtJS. For example, the toolbox has been changed to use an Ext Accordion layout, as are menus and input text box.

It tries to maintain as much compatibility with the original sources as possible, and the original sources are contained within a separate branch to allow a comparisson and merge to be completed with reasonable ease.

The directory extjs contains the ExtJS user extension and an example of its use (in ext-ux.html).

Configuration for blockly is put into the blockly object.

If a toolbox is defined, it is placed on the left of the window (east container in a border layout). Any toolbar (tbar) defined will then be moved into the centre container above the Blockly editor.

Initialisation options as follows -:
```
        var blockly = Ext.create('Ext.ux.blockly.Blockly', {
            tbar: toolbar,
            border:false,
            blockly: {
                toolbox: true,
                collapse: true,
                toolboxCategories: categoryArray,
                toolboxTools: toolArray,
                trashcan: true,
                blocks: "<xml>" + document.getElementById('go').innerHTML + "</xml>",
                path:"../",
                listeners: {
                    workspacechanged: function() {
                        console.log("It changed");
                    }
                }
            }
        });
```

```blocks``` can be either an XML string, or a javascript object tree.

Use the method ```getBlocks``` to get the current workspace. If no parameter is provided, the return format will be a javascript object tree. Alternatively, a format can be provided - specify 'json' or 'xml'.

