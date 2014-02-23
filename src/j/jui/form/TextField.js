/**
 * @pakcage jui.form
 */
'package jui.form'.j(function () {
    /**
     * @class jui.form.Text
     * @extends jui.form.Base
     */
    'class Text extends Base'.j(function (jsuper) {
        jprivate({
            size: 20,
            growMin: 30,
            growMax: 800,
            growAppend: 'W',
            allowBlank: true,
            validateBlank: false,
            allowOnlyWhitespace: true,
            minLength: 0,
            maxLength: Number.MAX_VALUE,
            minLengthText: 'The minimum length for this field is {0}',
            maxLengthText: 'The maximum length for this field is {0}',
            blankText: 'This field is required',
            regexText: '',
            emptyCls: $.baseCSSPrefix + 'form-empty-field',

            requiredCls: $.baseCSSPrefix + 'form-required-field',
            valueContainsPlaceholder: false

        });
        // publc vars
        jpublic({

        });

        // publc method
        jpublic({
            constructor: function () {
                this.jsuper();
            },
            initComponent: function () {
                var me = this;

                if (me.allowOnlyWhitespace === false) {
                    me.allowBlank = false;
                }

                me.jsuper('initComponent');

                me.addEvents(
                    'autosize',
                    'keydown',
                    'keyup',
                    'keypress'
                );
                me.addStateEvents('change');
                me.setGrowSizePolicy();
            },
            setGrowSizePolicy: function () {
                if (this.grow) {
                    this.shrinkWrap |= 1; // width must shrinkWrap
                }
            },

            // private
            initEvents: function () {
                var me = this,
                    el = me.inputEl;

                me.jsuper();
                if (me.selectOnFocus || me.emptyText) {
                    me.mon(el, 'mousedown', me.onMouseDown, me);
                }
                if (me.maskRe || (me.vtype && me.disableKeyFilter !== true && (me.maskRe = Ext.form.field.VTypes[me.vtype + 'Mask']))) {
                    me.mon(el, 'keypress', me.filterKeys, me);
                }

                if (me.enableKeyEvents) {
                    me.mon(el, {
                        scope: me,
                        keyup: me.onKeyUp,
                        keydown: me.onKeyDown,
                        keypress: me.onKeyPress
                    });
                }
            },

            /**
             * @private
             * Override. Treat undefined and null values as equal to an empty string value.
             */
            isEqual: function (value1, value2) {
                return this.isEqualAsString(value1, value2);
            },

            /**
             * @private
             * If grow=true, invoke the autoSize method when the field's value is changed.
             */
            onChange: function () {
                this.jsuper();
                this.autoSize();
            },

            getSubTplData: function () {
                var me = this,
                    value = me.getRawValue(),
                    isEmpty = me.emptyText && value.length < 1,
                    maxLength = me.maxLength,
                    placeholder;

                // We can't just dump the value here, since MAX_VALUE ends up
                // being something like 1.xxxxe+300, which gets interpreted as 1
                // in the markup
                if (me.enforceMaxLength) {
                    if (maxLength === Number.MAX_VALUE) {
                        maxLength = undefined;
                    }
                } else {
                    maxLength = undefined;
                }

                if (isEmpty) {
                    if (Ext.supports.Placeholder) {
                        placeholder = me.emptyText;
                    } else {
                        value = me.emptyText;
                        me.valueContainsPlaceholder = true;
                    }
                }

                return $.apply(me.jsuper(), {
                    maxLength: maxLength,
                    readOnly: me.readOnly,
                    placeholder: placeholder,
                    value: value,
                    fieldCls: me.fieldCls + ((isEmpty && (placeholder || value)) ? ' ' + me.emptyCls : '') + (me.allowBlank ? '' : ' ' + me.requiredCls)
                });
            },

            afterRender: function () {
                this.autoSize();
                this.jsuper();
            },

            onMouseDown: function (e) {
                var me = this;
                if (!me.hasFocus) {
                    me.mon(me.inputEl, 'mouseup', Ext.emptyFn, me, { single: true, preventDefault: true });
                }
            },

            processRawValue: function (value) {
                var me = this,
                    stripRe = me.stripCharsRe,
                    newValue;

                if (stripRe) {
                    newValue = value.replace(stripRe, '');
                    if (newValue !== value) {
                        me.setRawValue(newValue);
                        value = newValue;
                    }
                }
                return value;
            },

            //private
            onDisable: function () {
                this.jsuper();
                if (Ext.isIE) {
                    this.inputEl.dom.unselectable = 'on';
                }
            },

            //private
            onEnable: function () {
                this.jsuper();
            },

            onKeyDown: function (e) {
                this.fireEvent('keydown', this, e);
            },

            onKeyUp: function (e) {
                this.fireEvent('keyup', this, e);
            },

            onKeyPress: function (e) {
                this.fireEvent('keypress', this, e);
            },

            reset: function () {
                this.jsuper();
                this.applyEmptyText();
            },

            applyEmptyText: function () {
                var me = this,
                    emptyText = me.emptyText,
                    isEmpty;

                if (me.rendered && emptyText) {
                    isEmpty = me.getRawValue().length < 1 && !me.hasFocus;

                    me.inputEl.dom.placeholder = emptyText;
                    if (isEmpty) {
                        me.inputEl.addCls(me.emptyCls);
                    }

                    me.autoSize();
                }
            },

            afterFirstLayout: function () {
                this.jsuper();
            },

            // private
            beforeFocus: function () {
                var me = this,
                    inputEl = me.inputEl,
                    emptyText = me.emptyText,
                    isEmpty;

                me.jsuper(arguments);
                me.inputEl.removeCls(me.emptyCls);

                if (me.selectOnFocus || isEmpty) {
                    /*// see: http://code.google.com/p/chromium/issues/detail?id=4505
                    if (Ext.isWebKit) {
                        if (!me.inputFocusTask) {
                            me.inputFocusTask = new Ext.util.DelayedTask(me.focusInput, me);
                        }
                        me.inputFocusTask.delay(1);
                    } else {

                    }*/
                    inputEl.dom.select();
                }
            },

            focusInput: function () {
                var input = this.inputEl;
                if (input) {
                    input = input.dom;
                    if (input) {
                        input.select();
                    }
                }
            },

            onFocus: function () {
                var me = this;
                me.jsuper(arguments);
                if (me.emptyText) {
                    me.autoSize();
                }
            },

            // private
            postBlur: function () {
                this.jsuper(arguments);
                this.applyEmptyText();
            },

            // private
            filterKeys: function (e) {
                if (e.ctrlKey && !e.altKey) {
                    return;
                }
                var key = e.getKey(),
                    charCode = String.fromCharCode(e.getCharCode());

                /*if ((Ext.isGecko || Ext.isOpera) && (e.isNavKeyPress() || key === e.BACKSPACE || (key === e.DELETE && e.button === -1))) {
                    return;
                }

                if ((!Ext.isGecko && !Ext.isOpera) && e.isSpecialKey() && !charCode) {
                    return;
                }*/
                if (!this.maskRe.test(charCode)) {
                    e.stopEvent();
                }
            },

            getState: function () {
                return this.addPropertyToState(this.jsuper(), 'value');
            },

            applyState: function (state) {
                this.jsuper();
                if (state.hasOwnProperty('value')) {
                    this.setValue(state.value);
                }
            },

            getRawValue: function () {
                var me = this,
                    v = me.jsuper();
                if (v === me.emptyText && me.valueContainsPlaceholder) {
                    v = '';
                }
                return v;
            },
            setValue: function (value) {
                var me = this,
                    inputEl = me.inputEl;

                if (inputEl && me.emptyText && !$.isEmpty(value)) {
                    inputEl.removeCls(me.emptyCls);
                    me.valueContainsPlaceholder = false;
                }

                me.jsuper();

                me.applyEmptyText();
                return me;
            },

            getErrors: function (value) {
                var me = this,
                    errors = me.jsuper(),
                    validator = me.validator,
                    vtype = me.vtype,
                    vtypes = Ext.form.field.VTypes,
                    regex = me.regex,
                    format = Ext.String.format,
                    msg, trimmed, isBlank;

                value = value || me.processRawValue(me.getRawValue());

                if (Ext.isFunction(validator)) {
                    msg = validator.call(me, value);
                    if (msg !== true) {
                        errors.push(msg);
                    }
                }

                trimmed = me.allowOnlyWhitespace ? value : Ext.String.trim(value);

                if (trimmed.length < 1 || (value === me.emptyText && me.valueContainsPlaceholder)) {
                    if (!me.allowBlank) {
                        errors.push(me.blankText);
                    }
                    // If we are not configured to validate blank values, there cannot be any additional errors
                    if (!me.validateBlank) {
                        return errors;
                    }
                    isBlank = true;
                }

                // If a blank value has been allowed through, then exempt it dfrom the minLength check.
                // It must be allowed to hit the vtype validation.
                if (!isBlank && value.length < me.minLength) {
                    errors.push(format(me.minLengthText, me.minLength));
                }

                if (value.length > me.maxLength) {
                    errors.push(format(me.maxLengthText, me.maxLength));
                }

                if (vtype) {
                    if (!vtypes[vtype](value, me)) {
                        errors.push(me.vtypeText || vtypes[vtype + 'Text']);
                    }
                }

                if (regex && !regex.test(value)) {
                    errors.push(me.regexText || me.invalidText);
                }

                return errors;
            },

            /**
             * Selects text in this field
             * @param {Number} [start=0] The index where the selection should start
             * @param {Number} [end] The index where the selection should end (defaults to the text length)
             */
            selectText: function (start, end) {
                var me = this,
                    v = me.getRawValue(),
                    doFocus = true,
                    el = me.inputEl.dom,
                    undef,
                    range;

                if (v.length > 0) {
                    start = start === undef ? 0 : start;
                    end = end === undef ? v.length : end;
                    if (el.setSelectionRange) {
                        el.setSelectionRange(start, end);
                    }
                    else if (el.createTextRange) {
                        range = el.createTextRange();
                        range.moveStart('character', start);
                        range.moveEnd('character', end - v.length);
                        range.select();
                    }
                    //doFocus = Ext.isGecko || Ext.isOpera;
                }
                if (doFocus) {
                    me.focus();
                }
            },
            autoSize: function () {
                var me = this;
                if (me.grow && me.rendered) {
                    me.autoSizing = true;
                    me.updateLayout();
                }
            },

            afterComponentLayout: function () {
                var me = this,
                    width;

                me.jsuper();
                if (me.autoSizing) {
                    width = me.inputEl.getWidth();
                    if (width !== me.lastInputWidth) {
                        me.fireEvent('autosize', me, width);
                        me.lastInputWidth = width;
                        delete me.autoSizing;
                    }
                }
            },

            onDestroy: function () {
                var me = this;
                me.jsuper();

                if (me.inputFocusTask) {
                    me.inputFocusTask.cancel();
                    me.inputFocusTask = null;
                }
            }
        });

    });
});