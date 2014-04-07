ExtBlockly is a port of the Blockly graphical programming environment to run under ExtJS 4. This is done to remove the dependancy on the Closure compiler and provide a consistent look and feel interface with ExtJS. For example, the toolbox has been changed to use an Ext Accordion layout, as are menus and input text box.

It tries to maintain as much compatibility with the original sources as possible, and the original sources are contained within a separate branch to allow a comparisson and merge to be completed with reasonable ease.

The directory extjs contains the ExtJS user extension and an example of its use (in ext-ux.html).

Configuration for blockly is put into the blockly object.

If a toolbox is defined, it is placed on the left of the window (east container in a border layout). Any toolbar (tbar) defined will then be moved into the centre container above the Blockly editor.
