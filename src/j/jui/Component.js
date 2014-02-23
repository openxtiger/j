/**
 * @pakcage jui
 * @module jui
 */
'package jui'.j(function () {

    /**
     * @class jui.Component
     * @extends junit.Observable
     */
    'class Component implements junit.Observable'.j(function (jsuper, ob) {
        jstatic({
            AUTO_ID: 1000
        });

        // project
        jprotected({
            getId: function () {
                return this.id || (this.id = 'jc-' + (++this.jstatic.AUTO_ID));
            }
        });
        // publc vars
        jpublic({
            disabled: false,
            hidden: false,

            disabledClass: 'x-item-disabled',

            allowDomMove: true,
            autoShow: false,
            hideMode: 'display',
            hideParent: false,
            rendered: false,
            tplWriteMode: 'overwrite',

            autoEl: 'div',

            actionMode: 'el',
            boxReady: false,
            deferHeight: false
        });

        // publc method
        jpublic({
            constructor: function (config) {
                $.extend(this, config);
                jcall(ob, this);

                this.addEvents('added', 'disable', 'enable', 'beforeshow', 'show',
                    'beforehide', 'hide', 'removed', 'beforerender', 'render',
                    'afterrender', 'beforedestroy', 'destroy', 'beforestaterestore',
                    'staterestore', 'beforestatesave', 'statesave', 'resize', 'move'
                );

                $.widget(this.getId(), this, true);

                this.initComponent();
                if (this.owner) {
                    this.render(this.owner);
                    delete this.owner;
                } else if (this.applyTo) {
                    this.applyToMarkup(this.applyTo);
                    delete this.applyTo;
                } else if (this.renderTo) {
                    this.render(this.renderTo);
                    delete this.renderTo;
                }
            },
            getActionEl: function () {
                return this[this.actionMode];
            },
            applyToMarkup: function (el) {
                this.allowDomMove = false;
                this.el = $.get(el);
                this.render(this.el.dom().parentNode);
            },
            initComponent: $.noop,
            afterRender: $.noop,
            render: function (container, position) {
                if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                    if (!container && this.el) {
                        this.el = $.get(this.el);
                        container = this.el.dom().parentNode;
                        this.allowDomMove = false;
                    }
                    this.container = $.get(container);
                    if (this.ctCls) {
                        this.container.addClass(this.ctCls);
                    }
                    this.rendered = true;
                    if (position !== undefined) {
                        if ($.isNumber(position)) {
                            position = this.container.dom.childNodes[position];
                        } else {
                            position = $.dom(position);
                        }
                    }
                    this.onRender(this.container, position || null);
                    if (this.autoShow) {
                        this.el.removeClass(['x-hidden', 'x-hide-' + this.hideMode]);
                    }
                    if (this.cls) {
                        this.el.addClass(this.cls);
                        delete this.cls;
                    }
                    if (this.style) {
                        this.el.css(this.style, true);
                        delete this.style;
                    }
                    if (this.overCls) {
                        this.el.addClassOnOver(this.overCls);
                    }
                    this.fireEvent('render', this);


                    // Populate content of the component with html, contentEl or
                    // a tpl.
                    var contentTarget = this.getContentTarget();
                    if (this.html) {
                        contentTarget.html(this.html);
                        delete this.html;
                    }
                    if (this.contentEl) {
                        var ce = $.dom(this.contentEl);
                        $(ce).removeClass(['x-hidden', 'x-hide-display']);
                        contentTarget.appendChild(ce);
                    }
                    if (this.tpl) {
                        if (!this.tpl.compile) {
                            this.tpl = $.tpl(this.tpl);
                        }
                        if (this.data) {
                            this.tpl[this.tplWriteMode](contentTarget, this.data);
                            delete this.data;
                        }
                    }
                    this.afterRender(this.container);

                    this.boxReady = true;

                    this.setSize(this.width, this.height);
                    if (this.x || this.y) {
                        this.setPosition(this.x, this.y);
                    } else if (this.pageX || this.pageY) {
                        this.setPagePosition(this.pageX, this.pageY);
                    }

                    if (this.hidden) {
                        // call this so we don't fire initial hide events.
                        this.doHide();
                    }
                    if (this.disabled) {
                        // pass silent so the event doesn't fire the first time.
                        this.disable(true);
                    }

                    /*if (this.stateful !== false) {
                     this.initStateEvents();
                     }*/

                    this.fireEvent('afterrender', this);
                }
                return this;
            },
            onRender: function (ct, position) {
                if (!this.el && this.autoEl) {
                    if ($.isString(this.autoEl)) {
                        this.el = document.createElement(this.autoEl);
                    } else {
                        var div = document.createElement('div');
                        $.overwrite(div, this.autoEl);
                        this.el = div.firstChild;
                    }
                    if (!this.el.id) {
                        this.el.id = this.getId();
                    }
                }
                if (this.el) {
                    this.el = $.get(this.el);
                    if (this.allowDomMove !== false) {
                        ct.dom().insertBefore(this.el.dom(), position);
                        if (div) {
                            $.removeNode(div);
                            div = null;
                        }
                    }
                }
            },
            destroy: function () {
                if (!this.isDestroyed) {
                    if (this.fireEvent('beforedestroy', this) !== false) {
                        this.destroying = true;
                        this.beforeDestroy();
                        if (this.ownerCt && this.ownerCt.remove) {
                            this.ownerCt.remove(this, false);
                        }
                        if (this.rendered) {
                            this.el.remove();
                            if (this.actionMode == 'container' || this.removeMode == 'container') {
                                this.container.remove();
                            }
                        }
                        // Stop any buffered tasks
                        if (this.focusTask && this.focusTask.cancel) {
                            this.focusTask.cancel();
                        }
                        this.onDestroy();
                        jui.ComponentMgr.unregister(this);
                        this.fireEvent('destroy', this);
                        this.purgeListeners();
                        this.destroying = false;
                        this.isDestroyed = true;
                    }
                }
            },
            beforeDestroy: $.noop,
            onDestroy: $.noop,
            getEl: function () {
                return this.el;
            },
            getPositionEl: function () {
                return this.positionEl || this.el;
            },
            // private
            getContentTarget: function () {
                return this.el;
            },
            focus: function (selectText, delay) {
                /*if (delay) {
                 this.focusTask = new jutil.DelayedTask(this.focus, this, [selectText, false]);
                 this.focusTask.delay($.isNumber(delay) ? delay : 10);
                 return this;
                 }*/
                if (this.rendered && !this.isDestroyed) {
                    this.el.focus();
                    if (selectText === true) {
                        this.el.dom.select();
                    }
                }
                return this;
            },

            // private
            blur: function () {
                if (this.rendered) {
                    this.el.blur();
                }
                return this;
            },

            disable: function (/* private */ silent) {
                if (this.rendered) {
                    this.onDisable();
                }
                this.disabled = true;
                if (silent !== true) {
                    this.fireEvent('disable', this);
                }
                return this;
            },

            // private
            onDisable: function () {
                this.getActionEl().addClass(this.disabledClass);
                this.el.dom().disabled = true;
            },

            enable: function () {
                if (this.rendered) {
                    this.onEnable();
                }
                this.disabled = false;
                this.fireEvent('enable', this);
                return this;
            },

            // private
            onEnable: function () {
                this.getActionEl().removeClass(this.disabledClass);
                this.el.dom().disabled = false;
            },

            setDisabled: function (disabled) {
                return this[disabled ? 'disable' : 'enable']();
            },

            show: function () {
                if (this.fireEvent('beforeshow', this) !== false) {
                    this.hidden = false;
                    if (this.autoRender) {
                        this.render($.isBoolean(this.autoRender) ? $.getBody() : this.autoRender);
                    }
                    if (this.rendered) {
                        this.onShow();
                    }
                    this.fireEvent('show', this);
                }
                return this;
            },

            // private
            onShow: function () {
                this.getVisibilityEl().removeClass('x-hide-' + this.hideMode);
            },

            hide: function () {
                if (this.fireEvent('beforehide', this) !== false) {
                    this.doHide();
                    this.fireEvent('hide', this);
                }
                return this;
            },

            // private
            doHide: function () {
                this.hidden = true;
                if (this.rendered) {
                    this.onHide();
                }
            },

            // private
            onHide: function () {
                this.getVisibilityEl().addClass('x-hide-' + this.hideMode);
            },

            // private
            getVisibilityEl: function () {
                return this.hideParent ? this.container : this.getActionEl();
            },

            setVisible: function (visible) {
                return this[visible ? 'show' : 'hide']();
            },

            isVisible: function () {
                return this.rendered && this.getVisibilityEl().isVisible();
            },

            setSize: function (w, h) {

                // support for standard size objects
                if (typeof w == 'object') {
                    h = w.height;
                    w = w.width;
                }
                if ($.isDefined(w) && $.isDefined(this.boxMinWidth) && (w < this.boxMinWidth)) {
                    w = this.boxMinWidth;
                }
                if ($.isDefined(h) && $.isDefined(this.boxMinHeight) && (h < this.boxMinHeight)) {
                    h = this.boxMinHeight;
                }
                if ($.isDefined(w) && $.isDefined(this.boxMaxWidth) && (w > this.boxMaxWidth)) {
                    w = this.boxMaxWidth;
                }
                if ($.isDefined(h) && $.isDefined(this.boxMaxHeight) && (h > this.boxMaxHeight)) {
                    h = this.boxMaxHeight;
                }
                // not rendered
                if (!this.boxReady) {
                    this.width = w;
                    this.height = h;
                    return this;
                }

                // prevent recalcs when not needed
                if (this.cacheSizes !== false && this.lastSize && this.lastSize.width == w && this.lastSize.height == h) {
                    return this;
                }
                this.lastSize = {width: w, height: h};
                var adj = this.adjustSize(w, h),
                    aw = adj.width,
                    ah = adj.height,
                    rz;
                if (aw !== undefined || ah !== undefined) { // this code is nasty but performs better with floaters
                    rz = this.getResizeEl();
                    if (!this.deferHeight && aw !== undefined && ah !== undefined) {
                        rz.size(aw, ah);
                    } else if (!this.deferHeight && ah !== undefined) {
                        rz.height(ah);
                    } else if (aw !== undefined) {
                        rz.width(aw);
                    }
                    this.onResize(aw, ah, w, h);
                    this.fireEvent('resize', this, aw, ah, w, h);
                }
                return this;
            },
            setWidth: function (width) {
                return this.setSize(width);
            },
            setHeight: function (height) {
                return this.setSize(undefined, height);
            },
            getSize: function () {
                return this.getResizeEl().getSize();
            },
            getWidth: function () {
                return this.getResizeEl().getWidth();
            },
            getHeight: function () {
                return this.getResizeEl().getHeight();
            },
            getPosition: function (local) {
                var el = this.getPositionEl();
                if (local === true) {
                    return [el.getLeft(true), el.getTop(true)];
                }
                return this.xy || el.getXY();
            },
            getBox: function (local) {
                var pos = this.getPosition(local);
                var s = this.getSize();
                s.x = pos[0];
                s.y = pos[1];
                return s;
            },
            updateBox: function (box) {
                this.setSize(box.width, box.height);
                this.setPagePosition(box.x, box.y);
                return this;
            },
            getResizeEl: function () {
                return this.resizeEl || this.el;
            },
            setAutoScroll: function (scroll) {
                if (this.rendered) {
                    this.getContentTarget().setOverflow(scroll ? 'auto' : '');
                }
                this.autoScroll = scroll;
                return this;
            },
            setPosition: function (x, y) {
                if (x && typeof x[1] == 'number') {
                    y = x[1];
                    x = x[0];
                }
                this.x = x;
                this.y = y;
                if (!this.boxReady) {
                    return this;
                }
                var adj = this.adjustPosition(x, y);
                var ax = adj.x, ay = adj.y;

                var el = this.getPositionEl();
                if (ax !== undefined || ay !== undefined) {
                    if (ax !== undefined && ay !== undefined) {
                        el.setLeftTop(ax, ay);
                    } else if (ax !== undefined) {
                        el.setLeft(ax);
                    } else if (ay !== undefined) {
                        el.setTop(ay);
                    }
                    this.onPosition(ax, ay);
                    this.fireEvent('move', this, ax, ay);
                }
                return this;
            },
            setPagePosition: function (x, y) {
                if (x && typeof x[1] == 'number') {
                    y = x[1];
                    x = x[0];
                }
                this.pageX = x;
                this.pageY = y;
                if (!this.boxReady) {
                    return null;
                }
                if (x === undefined || y === undefined) { // cannot translate undefined points
                    return null;
                }
                var p = this.getPositionEl().translatePoints(x, y);
                this.setPosition(p.left, p.top);
                return this;
            },
            adjustSize: function (w, h) {
                if (this.autoWidth) {
                    w = 'auto';
                }
                if (this.autoHeight) {
                    h = 'auto';
                }
                return {width: w, height: h};
            },
            onResize: function (adjWidth, adjHeight, rawWidth, rawHeight) {
            },

            onPosition: function (x, y) {

            },
            // private
            adjustPosition: function (x, y) {
                return {x: x, y: y};
            }
        });

    }, 'component');

});