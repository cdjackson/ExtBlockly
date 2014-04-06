/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextInput = function (text, opt_changeHandler) {
    Blockly.FieldTextInput.superClass_.constructor.call(this, text);

    this.changeHandler_ = opt_changeHandler;
};
Blockly.inherits(Blockly.FieldTextInput, Blockly.Field);

/**
 * Clone this FieldTextInput.
 * @return {!Blockly.FieldTextInput} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldTextInput.prototype.clone = function () {
    console.log("Text clone");
    return new Blockly.FieldTextInput(this.getText(), this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextInput.prototype.dispose = function () {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.FieldTextInput.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldTextInput.prototype.setText = function (text) {
    if (text === null) {
        // No change if null.
        return;
    }
    if (this.changeHandler_) {
        var validated = this.changeHandler_(text);
        // If the new text is invalid, validation returns null.
        // In this case we still want to display the illegal result.
        if (validated !== null && validated !== undefined) {
            text = validated;
        }
    }
    Blockly.Field.prototype.setText.call(this, text);
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldTextInput.prototype.showEditor_ = function () {
    console.log("Text showeditor");
    /*   if (Ext.is.Phone || Ext.is.Tablet) {
     // Mobile browsers have issues with in-line textareas (focus & keyboards).
     var newValue = window.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_);
     if (this.changeHandler_) {
     var override = this.changeHandler_(newValue);
     if (override !== undefined) {
     newValue = override;
     }
     }
     if (newValue !== null) {
     this.setText(newValue);
     }
     return;
     }*/


    Blockly.FieldTextInput.htmlInput_ = Ext.create("Ext.form.field.Text", {
        block: this,
        border: false,
        floating: true,
        value: this.text_,
        enableKeyEvents: true,
        listeners: {
            keypress: function (panel, e, options) {
                this.block.onHtmlInputChange_(e);
            },
            keyup: function (panel, e, options) {
                this.block.onHtmlInputChange_(e);
            }
        }
    })
    Blockly.WidgetDiv.show(this, this.widgetDispose_());

    var xy = this.resizeEditor_();
    Blockly.FieldTextInput.htmlInput_.show();

    var workspaceSvg = this.sourceBlock_.workspace.getCanvas();
    Blockly.FieldTextInput.htmlInput_.onWorkspaceChangeWrapper_ = Blockly.bindEvent_(workspaceSvg, 'blocklyWorkspaceChange', this, this.resizeEditor_);


    return;
    var div = Blockly.DIV;
    // Create the input.
    var htmlInput = Ext.DomHelper.createDom({tag: 'input', id: 'blocklyHtmlInput' });
    Blockly.FieldTextInput.htmlInput_ = htmlInput;
    div.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.text_;
    htmlInput.oldValue_ = null;
    this.validate_();
    this.resizeEditor_();
    htmlInput.focus();
    htmlInput.select();

    // Bind to keyup -- trap Enter and Esc; resize after every keystroke.
    htmlInput.onKeyUpWrapper_ = Blockly.bindEvent_(htmlInput, 'keyup', this, this.onHtmlInputChange_);
    // Bind to keyPress -- repeatedly resize when holding down a key.
    htmlInput.onKeyPressWrapper_ = Blockly.bindEvent_(htmlInput, 'keypress', this, this.onHtmlInputChange_);
};

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function (e) {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (e.keyCode == 13) {
        // Enter
        Blockly.WidgetDiv.hide();
    } else if (e.keyCode == 27) {
        // Esc
        this.setText(htmlInput.defaultValue);
        Blockly.WidgetDiv.hide();
    } else {
        // Update source block.
        var text = htmlInput.getValue();
        if (text !== htmlInput.oldValue_) {
            htmlInput.oldValue_ = text;
            this.setText(text);
            this.validate_();
        } else if (Ext.isWebKit) {
            // Cursor key.  Render the source block to show the caret moving.
            // Chrome only (version 26, OS X).
            this.sourceBlock_.render();
        }
    }
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.FieldTextInput.prototype.validate_ = function () {
    var valid = true;
    if (typeof(Blockly.FieldTextInput.htmlInput_) != "object")
        console.log("Error");
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (this.changeHandler_) {
        valid = this.changeHandler_(htmlInput.getValue());
    }
    if (valid === null) {
        Blockly.addClass_(htmlInput, 'blocklyInvalidInput');
    } else {
        Blockly.removeClass_(htmlInput, 'blocklyInvalidInput');
    }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function () {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (htmlInput == null)
        return;

//    var div = Blockly.WidgetDiv.DIV;
    var bBox = this.fieldGroup_.getBBox();
//    div.style.width = bBox.width + 'px';
    var xy = Blockly.getAbsoluteXY_(this.borderRect_);
    // In RTL mode block fields and LTR input fields the left edge moves,
    // whereas the right edge is fixed.  Reposition the editor.
//    if (Blockly.RTL) {
//        var borderBBox = this.borderRect_.getBBox();
//        xy.x += borderBBox.width;
//        xy.x -= div.offsetWidth;
//    }
    // Shift by a few pixels to line up exactly.
    xy.x -= 1;
    xy.y += 1;
    if (Ext.isWebKit) {
        xy.y -= 3;
    }
//    div.style.left = xy.x + 'px';
//    div.style.top = xy.y + 'px';

    htmlInput.setPosition(xy.x, xy.y);
    htmlInput.setSize(bBox.width + 2, bBox.height + 2);

//    return xy;
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function () {
    var thisField = this;
    return function () {
        var htmlInput = Blockly.FieldTextInput.htmlInput_;
        // Save the edit (if it validates).
        var text = htmlInput.getValue();
        if (thisField.changeHandler_) {
            text = thisField.changeHandler_(text);
            if (text === null) {
                // Invalid edit.
                text = htmlInput.defaultValue;
            }
        }
        thisField.setText(text);
//        thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
//        Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
//        Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
        Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
        if (htmlInput != null)
            htmlInput.destroy();
        Blockly.FieldTextInput.htmlInput_ = null;
        // Delete the width property.
//        Blockly.WidgetDiv.DIV.style.width = 'auto';
    };
};

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 */
Blockly.FieldTextInput.numberValidator = function (text) {
    // TODO: Handle cases like 'ten', '1.203,14', etc.
    // 'O' is sometimes mistaken for '0' by inexperienced users.
    text = text.replace(/O/ig, '0');
    // Strip out thousands separators.
    text = text.replace(/,/g, '');
    var n = parseFloat(text || 0);
    return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid int, or null if invalid.
 */
Blockly.FieldTextInput.nonnegativeIntegerValidator = function (text) {
    var n = Blockly.FieldTextInput.numberValidator(text);
    if (n) {
        n = String(Math.max(0, Math.floor(n)));
    }
    return n;
};
