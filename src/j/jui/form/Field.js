/**
 * @pakcage jui.form
 */
'package jui.form'.j(function () {
    /**
     * @class jui.form.Field
     */
    'class Field'.j(function () {
        jprivate({
            suspendCheckChange: 0
        });
        jprotected({
            isFormField: true,
            initField: function () {
                this.addEvents(
                    'change',
                    'validitychange',
                    'dirtychange'
                );

                this.initValue();
            },
            initValue: function () {
                var me = this;

                me.value = me.transformOriginalValue(me.value);
                me.originalValue = me.lastValue = me.value;

                me.suspendCheckChange++;
                me.setValue(me.value);
                me.suspendCheckChange--;
            }

        });

        // publc vars
        jpublic({
            disabled: false,
            submitValue: true,
            validateOnChange: true
        });

        // publc method
        jpublic({
            transformOriginalValue: $.identityFn,
            getName: function () {
                return this.name;
            },
            getValue: function () {
                return this.value;
            },
            setValue: function (value) {
                var me = this;
                me.value = value;
                me.checkChange();
                return me;
            },
            isEqual: function (value1, value2) {
                return String(value1) === String(value2);
            },
            /*isEqualAsString: function (value1, value2) {
             return String(Ext.value(value1, '')) === String(Ext.value(value2, ''));
             },*/
            getSubmitData: function () {
                var me = this,
                    data = null;
                if (!me.disabled && me.submitValue && !me.isFileUpload()) {
                    data = {};
                    data[me.getName()] = '' + me.getValue();
                }
                return data;
            },
            getModelData: function () {
                var me = this,
                    data = null;
                if (!me.disabled && !me.isFileUpload()) {
                    data = {};
                    data[me.getName()] = me.getValue();
                }
                return data;
            },
            reset: function () {
                var me = this;

                me.beforeReset();
                me.setValue(me.originalValue);
                me.clearInvalid();
                // delete here so we reset back to the original state
                delete me.wasValid;
            },
            beforeReset: $.noop,
            resetOriginalValue: function () {
                this.originalValue = this.getValue();
                this.checkDirty();
            },
            checkChange: function () {
                if (!this.suspendCheckChange) {
                    var me = this,
                        newVal = me.getValue(),
                        oldVal = me.lastValue;
                    if (!me.isEqual(newVal, oldVal) && !me.isDestroyed) {
                        me.lastValue = newVal;
                        me.fireEvent('change', me, newVal, oldVal);
                        me.onChange(newVal, oldVal);
                    }
                }
            },
            onChange: function (newVal, oldVal) {
                if (this.validateOnChange) {
                    this.validate();
                }
                this.checkDirty();
            },
            isDirty: function () {
                var me = this;
                return !me.disabled && !me.isEqual(me.getValue(), me.originalValue);
            },
            checkDirty: function () {
                var me = this,
                    isDirty = me.isDirty();
                if (isDirty !== me.wasDirty) {
                    me.fireEvent('dirtychange', me, isDirty);
                    me.onDirtyChange(isDirty);
                    me.wasDirty = isDirty;
                }
            },
            onDirtyChange: $.noop,
            getErrors: function (value) {
                return [];
            },
            isValid: function () {
                var me = this;
                return me.disabled || $.isEmpty(me.getErrors());
            },
            validate: function () {
                var me = this,
                    isValid = me.isValid();
                if (isValid !== me.wasValid) {
                    me.wasValid = isValid;
                    me.fireEvent('validitychange', me, isValid);
                }
                return isValid;
            },
            batchChanges: function (fn) {
                try {
                    this.suspendCheckChange++;
                    fn();
                } catch (e) {
                    throw e;
                } finally {
                    this.suspendCheckChange--;
                }
                this.checkChange();
            },
            isFileUpload: function () {
                return false;
            },
            extractFileInput: function () {
                return null;
            },
            markInvalid: $.noop,
            clearInvalid: $.noop
        });

    });
    /**
     * @class jui.form.Base
     * @extends jui.Component
     * @implements jui.form.Field
     */
    'class Base extends jui.Component implements Field'.j(function (jsuper, f) {
        jprivate({

        });
        // publc vars
        jpublic({
            fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available
                '<input id="{id}" type="{type}" {inputAttrTpl}',
                ' size="1"', // allows inputs to fully respect CSS widths across all browsers
                '<tpl if="name"> name="{name}"</tpl>',
                '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
                '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
                '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
                '<tpl if="readOnly"> readonly="readonly"</tpl>',
                '<tpl if="disabled"> disabled="disabled"</tpl>',
                '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
                '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
                ' class="{fieldCls} {typeCls} {editableCls} {inputCls}" autocomplete="off"/>',
                {
                    disableFormats: true
                }
            ],
            inputType: 'text',
            invalidText: 'The value in this field is invalid',
            fieldCls: $.baseCSSPrefix + 'form-field',
            focusCls: 'form-focus',
            dirtyCls: $.baseCSSPrefix + 'form-dirty',
            readOnly: false,
            readOnlyCls: $.baseCSSPrefix + 'form-readonly',
            validateOnBlur: true,
            hasFocus: false,
            baseCls: $.baseCSSPrefix + 'field'
        });

        // publc method
        jpublic({
            constructor: function () {
                var me = this;
                me.jsuper();
            },
            initComponent: function () {
                var me = this;
                me.jsuper();

                me.subTplData = me.subTplData || {};

                me.addEvents(
                    'specialkey',
                    'writeablechange'
                );

                // Init mixins
                //me.initLabelable();
                me.initField();

                // Default name to inputId
                if (!me.name) {
                    me.name = me.getInputId();
                }
                // Add to protoEl before render
                if (me.readOnly) {
                    me.addCls(me.readOnlyCls);
                }
            },
            getInputId: function () {
                return this.inputId || (this.inputId = this.id + '-inputEl');
            },
            getSubTplData: function () {
                var me = this,
                    type = me.inputType,
                    inputId = me.getInputId(),
                    data;

                data = $.apply({
                    id: inputId,
                    cmpId: me.id,
                    name: me.name || inputId,
                    disabled: me.disabled,
                    readOnly: me.readOnly,
                    value: me.getRawValue(),
                    type: type,
                    fieldCls: me.fieldCls,
                    fieldStyle: me.getFieldStyle(),
                    tabIdx: me.tabIndex,
                    inputCls: me.inputCls,
                    typeCls: Ext.baseCSSPrefix + 'form-' + (type === 'password' ? 'text' : type)
                }, me.subTplData);

                me.getInsertionRenderData(data, me.subTplInsertions);

                return data;
            },
            /*applyRenderSelectors: function () {
             var me = this;

             me.callParent();

             // This is added here rather than defined in Ext.form.Labelable since inputEl isn't related to Labelable.
             // It's important to add inputEl to the childEls so it can be properly destroyed.
             me.addChildEls('inputEl');

             *//**
             * @property {Ext.Element} inputEl
             * The input Element for this Field. Only available after the field has been rendered.
             *//*
             me.inputEl = me.el.getById(me.getInputId());
             },
             setFieldStyle: function (style) {
             var me = this,
             inputEl = me.inputEl;
             if (inputEl) {
             inputEl.applyStyles(style);
             }
             me.fieldStyle = style;
             },
             */
            /*getFieldStyle: function () {
             return $.isObject(this.fieldStyle) ? Ext.DomHelper.generateStyles(this.fieldStyle) : this.fieldStyle || '';
             },*/

            // private
            onRender: function () {
                this.jsuper();
                this.renderActiveError();
            },

            getFocusEl: function () {
                return this.inputEl;
            },

            isFileUpload: function () {
                return this.inputType === 'file';
            },

            // private override to use getSubmitValue() as a convenience
            getSubmitData: function () {
                var me = this,
                    data = null,
                    val;
                if (!me.disabled && me.submitValue && !me.isFileUpload()) {
                    val = me.getSubmitValue();
                    if (val !== null) {
                        data = {};
                        data[me.getName()] = val;
                    }
                }
                return data;
            },
            getSubmitValue: function () {
                return this.processRawValue(this.getRawValue());
            },

            getRawValue: function () {
                var me = this,
                    v = (me.inputEl ? me.inputEl.getValue() : Ext.value(me.rawValue, ''));
                me.rawValue = v;
                return v;
            },
            setRawValue: function (value) {
                var me = this;
                value = me.transformRawValue(value);
                me.rawValue = value;

                // Some Field subclasses may not render an inputEl
                if (me.inputEl) {
                    me.inputEl.dom.value = value;
                }
                return value;
            },

            transformRawValue: $.identityFn,


            valueToRaw: function (value) {
                return value;
            },


            rawToValue: $.identityFn,

            processRawValue: $.identityFn,

            getValue: function () {
                var me = this,
                    val = me.rawToValue(me.processRawValue(me.getRawValue()));
                me.value = val;
                return val;
            },

            setValue: function (value) {
                var me = this;
                me.setRawValue(me.valueToRaw(value));
                return f.setValue.call(me, value);
            },

            onBoxReady: function () {
                var me = this;
                me.jsuper();
                if (me.setReadOnlyOnBoxReady) {
                    me.setReadOnly(me.readOnly);
                }

            },

            //private
            onDisable: function () {
                var me = this,
                    inputEl = me.inputEl;

                me.jsuper('onDisable');
                if (inputEl) {
                    inputEl.dom.disabled = true;
                    if (me.hasActiveError()) {
                        // clear invalid state since the field is now disabled
                        me.clearInvalid();
                        me.needsValidateOnEnable = true;
                    }
                }
            },

            //private
            onEnable: function () {
                var me = this,
                    inputEl = me.inputEl;

                me.jsuper();
                if (inputEl) {
                    inputEl.dom.disabled = false;
                    if (me.needsValidateOnEnable) {
                        delete me.needsValidateOnEnable;
                        // will trigger errors to be shown
                        me.forceValidation = true;
                        me.isValid();
                        delete me.forceValidation;
                    }
                }
            },
            setReadOnly: function (readOnly) {
                var me = this,
                    inputEl = me.inputEl;
                readOnly = !!readOnly;
                me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
                me.readOnly = readOnly;
                if (inputEl) {
                    inputEl.dom.readOnly = readOnly;
                } else if (me.rendering) {
                    me.setReadOnlyOnBoxReady = true;
                }
                me.fireEvent('writeablechange', me, readOnly);
            },

            // private
            fireKey: function (e) {
                if (e.isSpecialKey()) {
                    this.fireEvent('specialkey', this, new $.event(e));
                }
            },

            // private
            initEvents: function () {
                var me = this,
                    inputEl = me.inputEl,
                    onChangeTask,
                    onChangeEvent,
                    events = me.checkChangeEvents,
                    e,
                    eLen = events.length,
                    event;

                // standardise buffer across all browsers + OS-es for consistent event order.
                // (the 10ms buffer for Editors fixes a weird FF/Win editor issue when changing OS window focus)
                if (me.inEditor) {
                    me.onBlur = Ext.Function.createBuffered(me.onBlur, 10);
                }
                if (inputEl) {
                    me.mon(inputEl, Ext.EventManager.getKeyEvent(), me.fireKey, me);

                    // listen for immediate value changes
                    onChangeTask = new Ext.util.DelayedTask(me.checkChange, me);
                    me.onChangeEvent = onChangeEvent = function () {
                        onChangeTask.delay(me.checkChangeBuffer);
                    };

                    for (e = 0; e < eLen; e++) {
                        event = events[e];

                        if (event === 'propertychange') {
                            me.usesPropertychange = true;
                        }

                        me.mon(inputEl, event, onChangeEvent);
                    }
                }
                me.jsuper();
            },

            onDirtyChange: function (isDirty) {
                this[isDirty ? 'addCls' : 'removeCls'](this.dirtyCls);
            },
            isValid: function () {
                var me = this,
                    disabled = me.disabled,
                    validate = me.forceValidation || !disabled;


                return validate ? me.validateValue(me.processRawValue(me.getRawValue())) : disabled;
            },
            validateValue: function (value) {
                var me = this,
                    errors = me.getErrors(value),
                    isValid = $.isEmpty(errors);
                if (!me.preventMark) {
                    if (isValid) {
                        me.clearInvalid();
                    } else {
                        me.markInvalid(errors);
                    }
                }

                return isValid;
            },
            markInvalid: function (errors) {
                // Save the message and fire the 'invalid' event
                var me = this,
                    oldMsg = me.getActiveError(),
                    active;

                me.setActiveErrors($.toArray(errors));
                active = me.getActiveError();
                if (oldMsg !== active) {
                    me.setError(active);
                }
            },
            clearInvalid: function () {
                // Clear the message and fire the 'valid' event
                var me = this,
                    hadError = me.hasActiveError();

                delete me.needsValidateOnEnable;
                me.unsetActiveError();
                if (hadError) {
                    me.setError('');
                }
            },
            setError: function (active) {
                var me = this,
                    msgTarget = me.msgTarget,
                    prop;

                if (me.rendered) {
                    if (msgTarget == 'title' || msgTarget == 'qtip') {
                        if (me.rendered) {
                            prop = msgTarget == 'qtip' ? 'data-errorqtip' : 'title';
                        }
                        me.getActionEl().dom.setAttribute(prop, active || '');
                    } else {
                        me.updateLayout();
                    }
                }
            },

            renderActiveError: function () {
                var me = this,
                    hasError = me.hasActiveError();
                if (me.inputEl) {
                    // Add/remove invalid class
                    me.inputEl[hasError ? 'addCls' : 'removeCls'](me.invalidCls + '-field');
                }
            },
            getActionEl: function () {
                return this.inputEl || this.el;
            }
        });

    });
});