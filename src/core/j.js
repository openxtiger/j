(function (undefined) {

    var core_rnotwhite = /\S+/g,
        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/,
        rootNodeRE = /^(?:body|html)$/i,
        core_indexOf = [].indexOf,
        toString = Object.prototype.toString,
        oc = Object.prototype.constructor,
        core_push = Array.prototype.push,
        core_slice = Array.prototype.slice,
        core_concat = Array.prototype.concat,
        core_hasOwn = Object.prototype.hasOwnProperty;

    function isArraylike(obj) {
        var length = obj.length,
            type = $.type(obj);

        if ($.isWindow(obj)) {
            return false;
        }

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return type === "array" || type !== "function" &&
            ( length === 0 ||
                typeof length === "number" && length > 0 && ( length - 1 ) in obj );
    }

    /**
     对DOM的封装和一些常用的工具，主要包括dom的获取、样式、位置、模板、HTML创建、数据、事件等
     @main Jclass
     @module DOM_UNIT
     @class Jclass
     */
    var $ = (function () {
        var $, JF, FF,
            class2type = {},
            PARENTNODE = 'parentNode',
            NEXTSIBLING = 'nextSibling',
            PREVIOUSSIBLING = 'previousSibling',
            enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
                'toString', 'constructor'],
            objs = "Boolean Number String Function Array Date RegExp".split(" "),
            docReadyEvent, classSelectorRE = /^\.([\w-]+)$/,
            idSelectorRE = /^#([\w-]*)$/,
            tagSelectorRE = /^[\w-]+$/;

        function fireDocReady() {
            $.isReady = true;
            document.removeEventListener("DOMContentLoaded", fireDocReady, false);
            docReadyEvent.fire();
        }

        function initDocReady() {
            docReadyEvent = {
                listeners: [],
                add: function (fn, scope) {
                    this.listeners.push([fn, scope]);
                },
                fire: function () {
                    var listeners = this.listeners,
                        len = listeners.length,
                        i = 0, l;

                    for (i = 0; i < len; i++) {
                        l = listeners[i];
                        l[0].apply(l[1] || $);
                    }
                    this.listeners = [];
                }
            };
            document.addEventListener("DOMContentLoaded", fireDocReady, false);
        }

        for (var i = 0, l = objs.length; i < l; i++) {
            class2type[ "[object " + objs[i] + "]" ] = objs[i].toLowerCase();
        }

        /**
         * Jclass 私有构造函数，只能由$函数调用 @see $
         * @class Jclass
         * @param [selector] {HTMLElement|String|Object}　
         *  * 空值时，将返回一个空的对象 　
         *  * 为dom时，返回此dom的Jclass对象
         *  * 其他的将合并到新的对象上
         * @param [context]
         * @returns {*} 返回元素为０或多个Jclass对象数组
         * @constructor
         */
        function Jclass(selector, context) {
            if (!selector) {
                return this;
            }
            if (selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;
            }
            return $.merge(this, selector);

        }

        /**
         * 工具类，如果传入的是dom，并需要做为变量继续使用，请采用$.get(),
         * 如果是字符串，可以通过$.qsa优化方式获取;
         * @method $
         * @static
         * @param [selector] {HTMLElement|String|Object|Jclass}　
         *  * $() 空值时，返回 Jclass.prototype　
         *  * $(HTMLElement) 为HTMLElement时，返回一个即时Jclass对象。返回的对象不能存储，因为此对象的dom会被下一次调用时更新　
         *  * 为字符串时，返回通过querySelectorAll方式获取
         *  * $({$:"class"}) 对象含有$属性时，返回 selector类的对象　
         *  * $(function(){}) 为函数时，文档加载完成后，回调此函数
         *  * 其他参考 @see Jclass
         * @param [context]
         * @returns {*} Jclass.prototype或返回元素为０或多个Jclass对象数组
         */

        $ = function (selector, context) {
            if (selector && selector.nodeType) {
                JF[0] = selector;
                return JF;
            }
            if (selector instanceof Jclass) {
                return selector;
            }
            if (selector && selector.$) {
                return $.create(selector, context);
            }
            if (typeof selector === "string") {
                return new Jclass((context || document).querySelectorAll(selector, context));
            }
            if (arguments.length == 0) {
                return Jclass.prototype;
            }
            if ($.isFunction(selector)) {
                return $.ready(selector, context);
            }
            return new Jclass(selector, context);
        };

        JF = new Jclass();
        JF.length = 1;
        FF = new Jclass();
        FF.length = 1;

        $.fn = Jclass.prototype;

        /**
         * $.extend() 对一个对象的扩展
         * @method extend
         * @static
         * @param [1..n]  {Object..}
         *  * 只有一个参数时，是对$进行自身扩展
         *  * 其它依次将所有参数扩展到第一个参数上
         *  @returns {*} 返回扩展后的对象
         */
        /**
         * $().extend() 对一个对象的prototype扩展
         * @method extend
         * @param [1..n] {Object..}
         *  * 只有一个参数时，是对$.prototype进行自身扩展
         *  * 其它依次将所有参数扩展到第一个参数的prototype上
         *  @returns {*} 返回扩展后的prototype对象
         */
        $.extend = $().extend = function () {
            var target = arguments[0],
                i = 1, options,
                length = arguments.length;
            if (typeof target !== "object" && !$.isFunction(target)) {
                target = {};
            }
            if (length == 0) return null;
            // extend $ itself if only one argument is passed
            if (length === i) {
                target = this;
                --i;
            } else if (this == $.prototype) {
                target = arguments[0] ? arguments[0].prototype : {};
            }
            for (; i < length; i++) {
                if ((options = arguments[ i ]) != null) {
                    for (var name in options) {
                        target[name] = options[name];
                    }
                    if (enumerables) {
                        for (var j = enumerables.length; j--;) {
                            name = enumerables[j];
                            if (options.hasOwnProperty(name))target[name] = options[name];
                        }
                    }
                }
            }
            return target;
        };

        $.extend({
            guid: 1,
            jkey: ('J' + parseInt(Math.random() * 100)),
            isReady: false,
            /**
             * 有条件的扩展对象
             * @method extendIf
             * @static
             * @param o {Object} 被扩展的对象
             * @param c {Object} 扩展的对象，且对象中的属性值不为undefind时才扩展进入o对象
             * @returns {Object} 被扩展的对象
             */
            extendIf: function (o, c) {
                if (o) {
                    for (var p in c) {
                        if (!$.isDefined(o[p])) {
                            o[p] = c[p];
                        }
                    }
                }
                return o;
            },
            /**
             * 将second合并到first中
             * @method merge
             * @static
             * @param first {Array|Object}
             * @param second {Array|Object}
             * @returns {Array|Object} 被扩展的对象
             */
            merge: function (first, second) {
                if (!second || !first) return {};

                var l = second.length,
                    i = first.length,
                    j = 0;

                if (typeof l === "number") {
                    for (; j < l; j++) {
                        first[ i++ ] = second[ j ];
                    }

                } else {
                    while (second[j] !== undefined) {
                        first[ i++ ] = second[ j++ ];
                    }
                }
                first.length = i;
                return first;
            },
            /**
             * 从 elems 中查找匹配元素，最终返回新数组
             * @method grep
             * @static
             * @param elems {Array} 被查找的数组
             * @param callback {Function} 回调函数，系统会将 elems的每个元素和索引传入，如果匹配则返回true，或则为false
             * @param inv 如果为true，将转为返回不匹配元素
             * @returns {Array} 返回匹配的数组
             */
            grep: function (elems, callback, inv) {
                var retVal,
                    ret = [],
                    i = 0,
                    length = elems.length;
                inv = !!inv;

                // Go through the array, only saving the items
                // that pass the validator function
                for (; i < length; i++) {
                    retVal = !!callback(elems[ i ], i);
                    if (inv !== retVal) {
                        ret.push(elems[ i ]);
                    }
                }

                return ret;
            },
            /**
             * 将数组或对象经过逐一转换后，成一个新的数组
             * @method map
             * @static
             * @param elems {Array|Object} 被转换的数组或对象
             * @param callback  {Function} 回调函数，系统会将 elems的每个元素、索引和arg传入，返回转化的值
             * @param arg 附加的参数
             * @returns {Array} 返回转换后的数组
             */
            map: function (elems, callback, arg) {
                var value,
                    i = 0,
                    length = elems.length,
                    isArray = isArraylike(elems),
                    ret = [];

                // Go through the array, translating each of the items to their
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback(elems[ i ], i, arg);

                        if (value != null) {
                            ret[ ret.length ] = value;
                        }
                    }

                    // Go through every key on the object,
                } else {
                    for (i in elems) {
                        value = callback(elems[ i ], i, arg);

                        if (value != null) {
                            ret[ ret.length ] = value;
                        }
                    }
                }

                // Flatten any nested arrays
                return core_concat.apply([], ret);
            },
            /**
             * ID优先获取Jclass对象
             * @method get
             * @static
             * @param el {HTMLElement|String|Jclass}　
             *  * 为String时，先判断是否可以做为ID获取DOM,否则做为参数构建一个新的Jclass对象.
             *  * 其他由Jclass构建一个对象
             * @returns {*} Jclass对象
             */
            get: function (el) {
                var elm;
                if ($.isString(el)) { // element id
                    if (elm = document.getElementById(el)) {
                        return new Jclass(elm);
                    }
                    return $.qsa(el)
                }
                return new Jclass(el);
            },
            /**
             * 优化方式获取Jclass对象
             * <a href="http://openxtiger.iteye.com/blog/1893289" target="_blank" class="external">[知识扫盲1]</a>
             * <a href="http://openxtiger.iteye.com/blog/1611723" target="_blank" class="external">[知识扫盲2]</a>
             * @method qsa
             * @static
             * @param el {HTMLElement|String|Jclass}　
             *  * 匹配 "#id"，通过getElementById获取
             *  * 匹配 ".class"，通过getElementsByClassName获取
             *  * 匹配 "tag"，通过getElementsByTagName获取
             *  * 其他通过,querySelectorAll获取
             * @param context
             * @returns {*} Jclass对象
             */
            qsa: function (el, context) {
                context = context || document;
                el = idSelectorRE.test(el) ? context.getElementById(el) :
                    classSelectorRE.test(el) ? context.getElementsByClassName(el) :
                        tagSelectorRE.test(el) ? context.getElementsByTagName(el) :
                            context.querySelectorAll(el);
                return new Jclass(el);
            },

            /**
             * 获取HTMLElement对象
             * @method dom
             * @static
             * @param el {HTMLElement|String|Jclass}　
             *  * 为String时，根据ID获取DOM
             *  * 为Jclass时，返回对象的第一个dom
             *  * 其他返回 el
             * @returns {HTMLElement} HTMLElement对象
             */
            dom: function (el) {
                if (!el) {
                    return null;
                }
                if (el.dom && el.dom()) {
                    return el.dom();
                } else {
                    if ($.isString(el)) {
                        return document.getElementById(el);
                    } else {
                        return el;
                    }
                }
            },
            /**
             * 判断对象是否为函数 @see $.type
             * @method isFunction
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isFunction: function (v) {
                return $.type(v) === 'function';
            },
            /**
             * 判断对象是否为字符串 @see $.type
             * @method isString
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isString: function (v) {
                return $.type(v) === 'string';
            },
            /**
             * 判断对象是否为 boolean @see $.type
             * @method isBoolean
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isBoolean: function (v) {
                return $.type(v) === 'boolean';
            },
            /**
             * 判断对象是否为 HTMLElement
             * @method isElement
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isElement: function (v) {
                return !!v && v.tagName;
            },
            /**
             * 判断对象是定义
             * @method isDefined
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isDefined: function (v) {
                return typeof v !== 'undefined';
            },
            /**
             * 判断对象是否为 object @see $.type
             * @method isObject
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isObject: function (v) {
                return !!v && $.type(v) === 'object';
            },
            /**
             * 判断对象是否为 Window
             * @method isWindow
             * @static
             * @param obj {*} 判断的对象
             * @returns {boolean}
             */
            isWindow: function (obj) {
                return obj != null && obj == obj.window
            },
            /**
             * 判断对象是否为 Date @see $.type
             * @method isDate
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isDate: function (v) {
                return $.type(v) === 'date';
            },
            /**
             * 判断对象是否为基本变量
             * @method isPrimitive
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isPrimitive: function (v) {
                return $.isString(v) || $.isNumber(v) || $.isBoolean(v);
            },
            /**
             * 判断对象是否为数字 @see $.type
             * @method isNumber
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isNumber: function (v) {
                return $.type(v) === 'number';
            },
            /**
             * 判断对象是否为空值，包括 null,undefined,空数组,空字符串
             * @method isEmpty
             * @static
             * @param v {*} 判断的对象
             * @param allowBlank {boolean} 为false时，表示不判断空字符串
             * @returns {boolean}
             */
            isEmpty: function (v, allowBlank) {
                return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
            },
            /**
             * 判断对象是否为数组 @see $.type
             * @method isArray
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isArray: Array.isArray || function (v) {
                return $.type(v) === "array";
            },
            /**
             * 空函数
             * @method noop
             * @static
             */
            noop: function () {
            },
            /**
             * 判断对象是否可迭代
             * @method isIterable
             * @static
             * @param v {*} 判断的对象
             * @returns {boolean}
             */
            isIterable: function (v) {
                //check for array or arguments
                if ($.isArray(v) || v.callee) {
                    return true;
                }
                //check for node list type
                if (/NodeList|HTMLCollection/.test(toString.call(v))) {
                    return true;
                }
                //NodeList has an item and length property
                //IXMLDOMNodeList has nextNode method, needs to be checked first.
                return ((typeof v.nextNode != 'undefined' || v.item) && $.isNumber(v.length));
            },
            /**
             * 判断对象是否为空对象
             * @method isEmptyObject
             * @static
             * @param obj {*} 判断的对象
             * @returns {boolean}
             */
            isEmptyObject: function (obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            },
            /**
             * 获取对象的类型 <a href="http://openxtiger.iteye.com/blog/1893378" target="_blank" class="external">[知识扫盲]</a>
             * @method type
             * @static
             * @param obj {*} 判断的对象
             * @returns {string}
             */
            type: function (obj) {
                return class2type[ toString.call(obj) ] || "object";
            },
            /**
             * 监听文档加载完成的事件，使用DOMContentLoaded监听。
             * @method ready
             * @static
             * @param fn 回调函数
             * @param scope 作用域
             */
            ready: function (fn, scope) {

                if ($.isReady) {
                    docReadyEvent.add(fn, scope);
                    docReadyEvent.fire();
                } else {
                    if (!docReadyEvent) initDocReady();
                    docReadyEvent.add(fn, scope);
                }
            },
            /**
             * 遍历数组或对象，如果是数组则传入值和索引；如果是对象则传入属性和属性值。
             * @method each
             * @static
             * @param obj {Array|Object} 数组或对象
             * @param fn  {Function} 回调处理函数
             * @param scope {Object} 作用域
             * @returns {Object} obj
             */
            each: function (obj, fn, scope) {
                if ($.isEmpty(obj, true)) {
                    return obj;
                }
                var name;

                if (obj.length === undefined && $.isObject(obj)) {
                    for (name in obj) {
                        if (fn.call(scope || obj, name, obj[ name ]) === false) {
                            break;
                        }
                    }
                    return obj;
                }

                for (var i = 0, len = obj.length; i < len; i++) {
                    if (fn.call(scope || obj[i], obj[i], i, obj) === false) {
                        return i;
                    }
                }
                return obj;
            },
            /**
             * 将数组或对象数组转化为数组
             * @method toArray
             * @static
             * @param array {Array|Object}
             * @param start {int} 索引开始
             * @param end {int} 索引结束
             * @returns {Array}
             */
            toArray: function (array, start, end) {
                return core_slice.call(array, start || 0, end || array.length);
            },
            /**
             *
             * @method namespace
             * @static
             * @returns {*}
             */
            namespace: function () {
                var o, d;
                $.each(arguments, function (v) {
                    d = v.split(".");
                    o = window[d[0]] = window[d[0]] || {};
                    $.each(d.slice(1), function (v2) {
                        o = o[v2] = o[v2] || {};
                    });
                });
                return o;
            },
            create: function () {

            }
        });

        //traversal
        $().extend({
            /**
             * @property {int} length
             */
            length: 0,
            /**
             * 创建Jclass对象，并记录创建他的对象。
             * @method create
             * @param elems {HTMLElement} DOM对象
             * @returns {Jclass} Jclass对象
             */
            create: function (elems) {
                var ret = new Jclass(elems || []);
                ret.prev$ = this;
                return ret;
            },
            /**
             * 根据索引获取Jclass对象的dom
             * @method dom
             * @param index {int} 索引号，为空时，返回第一个dom，为负数时，反向获取。
             * @returns {HTMLElement}
             */
            dom: function (index) {
                return this.length == 0 ? null : index < 0 ? this[ this.length + index ] : this[ index || 0 ];
            },
            /**
             * 根据索引获取Jclass对象中dom的新Jclass对象
             * @method get
             * @param i {int} 索引号，为-1时，获取最后一个dom的Jclass对象。
             * @returns {Jclass} Jclass对象
             */
            get: function (i) {
                i = +i;
                return i === -1 ?
                    this.slice(i) :
                    this.slice(i, i + 1);
            },
            /**
             * 截取获取Jclass对象中对应dom成为新Jclass对象
             * @method slice
             * @param start {int} 开始位置
             * @param end {int} 结束位置
             * @returns {Jclass} Jclass对象
             */
            slice: function (start, end) {
                return this.create(core_slice.apply(this, arguments));
            },
            /**
             * 将Jclass对象中对象通过callback处理后成为新Jclass对象
             * @method map
             * @param callback 回调函数
             * @returns {Jclass}
             */
            map: function (callback) {
                return this.create($.map(this, function (elem, i) {
                    return callback.call(elem, i, elem);
                }));
            },
            /**
             * 获取第一个dom的新Jclass对象
             * @method head
             * @returns {Jclass} Jclass对象
             */
            head: function () {
                return this.get(0);
            },
            /**
             * 获取最后一个dom的新Jclass对象
             * @method head
             * @returns {Jclass} Jclass对象
             */
            tail: function () {
                return this.get(-1);
            },
            /**
             * 根据索引获取Jclass的dom元素的即时Jclass对象
             * @method fly
             * @param i {int} 索引号，为-1时，获取最后一个dom的Jclass对象。
             * @returns {Jclass} Jclass对象
             */
            fly: function (i) {
                FF[0] = this.dom(i);
                FF.prev$ = this;
                return FF;
            },
            /**
             * 获取Jclass的第一个dom元素的即时Jclass对象
             * @method begin
             * @returns {Jclass} Jclass对象
             */
            begin: function () {
                return this.fly(0);
            },
            /**
             * 获取Jclass的最后一个dom元素的即时Jclass对象
             * @method end
             * @returns {Jclass} Jclass对象
             */
            end: function () {
                return this.fly(-1);
            },
            /**
             * 获取Jclass的第index个dom的dom或者Jclass
             * @method match
             * @param dir {string} dom的遍历方向，包括:nextSibling,previousSibling,parentNode
             * @param start {string} dom遍历的起始dom,包括:firstChild,lastChild,nextSibling,previousSibling,parentNode,
             * @param index {int} 索引号
             * @param returnDom {boolean}
             *  * true时返回dom
             *  * 其他返回Jclass
             * @returns {Jclass|HTMLElement}
             */
            match: function (dir, start, index, returnDom) {
                var n = this.dom(index)[start];
                while (n) {
                    if (n.nodeType == 1) {
                        return !returnDom ? this.create(n) : n;
                    }
                    n = n[dir];
                }
                return null;
            },
            /**
             * 获取Jclass的第index个dom的第一个子dom或者子dom的Jclass
             * @method first
             * @param index {int} 索引号
             * @param returnDom
             *  * true时返回dom
             *  * 其他返回Jclass
             * @returns {Jclass|HTMLElement}
             */
            first: function (index, returnDom) {
                return this.match(NEXTSIBLING, 'firstChild', index, returnDom);
            },
            /**
             * 获取Jclass的第index个dom的最后一个子dom或者子dom的Jclass
             * @method last
             * @param index {int} 索引号
             * @param returnDom
             *  * true时返回dom
             *  * 其他返回Jclass
             * @returns {Jclass|HTMLElement}
             */
            last: function (index, returnDom) {
                return this.match(PREVIOUSSIBLING, 'lastChild', index, returnDom);
            },
            /**
             * 获取Jclass的第index个dom的前一个相邻dom或者相邻dom的Jclass
             * @method prev
             * @param index {int} 索引号
             * @param returnDom
             *  * true时返回dom
             *  * 其他返回Jclass
             * @returns {Jclass|HTMLElement}
             */
            prev: function (index, returnDom) {
                return this.match(PREVIOUSSIBLING, PREVIOUSSIBLING, index, returnDom);
            },
            /**
             * 获取Jclass的第index个dom的后一个相邻dom或者相邻dom的Jclass
             * @method next
             * @param index {int} 索引号
             * @param returnDom
             *  * true时返回dom
             *  * 其他返回Jclass
             * @returns {Jclass|HTMLElement}
             */
            next: function (index, returnDom) {
                return this.match(NEXTSIBLING, NEXTSIBLING, index, returnDom);
            },
            /**
             * 获取Jclass的第index个dom的父dom或者父dom的Jclass
             * @method parent
             * @param index {int} 索引号
             * @param returnDom
             *  * true时返回dom
             *  * 其他返回Jclass
             * @returns {Jclass|HTMLElement}
             */
            parent: function (index, returnDom) {
                return this.match(PARENTNODE, PARENTNODE, index, returnDom);
            },
            /**
             * 查找dom是否在Jclass对象中，找到返回索引位置，否则为-1
             * @method index
             * @param elem {string|HTMLElement} 要查找的dom
             * @returns {int}
             */
            index: function (elem) {

                // No argument, return index in parent
                if (!elem) {
                    return -1;
                }

                // index in selector
                if (typeof elem === "string") {
                    return core_indexOf.call($(elem), this[ 0 ]);
                }

                // Locate the position of the desired element
                return core_indexOf.call(this, elem);
            },
            /**
             * 对Jclass对象的每个dom进行回调处理
             * @method each
             * @param callback {Function} 回调处理函数
             * @returns {Jclass}
             */
            each: function (callback) {
                for (var i = 0, len = this.length; i < len; i++) {
                    if (callback.call(this[i], this[i], i, this) === false) {
                        return i;
                    }
                }
                return this;
            },
            /**
             * 通过此Jclass对象的每一个dom元素继续查找匹配selector的dom，并重新构成新的Jclass对象
             * @method query
             * @param selector {string}
             * @returns {Jclass}
             */
            query: function (selector) {
                var elem;
                var ret = this.create();
                var rs, r;

                for (var i = 0, l = this.length; i < l; i++) {
                    elem = this[i];
                    rs = elem.querySelectorAll(selector);
                    $.merge(ret, rs);
                }
                for (var n = 0; n < ret.length; n++) {
                    for (r = 0; r < ret.length; r++) {
                        if (r !== n && ret[r] === ret[n]) {
                            ret.splice(n--, 1);
                            break;
                        }
                    }
                }
                return ret;
            },
            /**
             * 获取创建此Jclass对象的创建者的Jclass对象
             * @method back
             * @returns {Jclass}
             */
            back: function () {
                return this.prev$ || new Jclass();
            },
            /**
             *  @param [selector] {HTMLElement|String|Object|Jclass}　
             *  * $() 空值时，返回 第一个dom
             *  * $({$:"class"}) 对象含有$属性时，返回 selector类的对象,并将自己储存在selector类的对象的owner属性　
             *  * $(function(){}) 为函数时，第一个dom加载完成后，回调此函数
             *  * 其他参考 @see $().query
             * @param [context]
             * @returns {*}
             */
            $: function (selector, context) {
                if (arguments.length == 0) {
                    return this[0];
                }
                if (selector instanceof Jclass) {
                    return new Jclass(selector);
                }
                if ($.isFunction(selector)) {
                    var d = this[0];
                    d && (d.onload = d.onreadystatechange = function () {
                        if (this.readyState && this.readyState != 'complete') return;
                        selector.call(context);
                    }) && (d.src = context);

                    return this;
                }
                if (selector && selector.$) {
                    selector['owner'] = this;
                    return $.create(selector, context);
                }
                return this.query(selector);
            },
            push: core_push,
            sort: [].sort,
            splice: [].splice
        });

        $.prototype = Jclass.prototype;
        $.prototype.constructor = Jclass;

        return $;
    })();

//format
    $.extend(function ($) {
        return {
            htmlEncode: function (value) {
                return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            },
            htmlDecode: function (value) {
                return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
            }
        }
    }($));

//dom-helper
    $.extend(function ($) {
        var emptyTags = /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
            afterbegin = 'afterbegin',
            afterend = 'afterend',
            beforebegin = 'beforebegin',
            beforeend = 'beforeend',
            hash = {};

        hash[beforebegin] = ['BeforeBegin', 'previousSibling'];
        hash[afterend] = ['AfterEnd', 'nextSibling'];
        hash[afterbegin] = ['AfterBegin', 'firstChild'];
        hash[beforeend] = ['BeforeEnd', 'lastChild'];
        function createHtml(o) {
            var b = '', cn;
            if (!o) {
                return "<div></div>"
            }

            if ($.isString(o)) {
                b = o;
            } else if ($.isArray(o)) {
                for (var i = 0; i < o.length; i++) {
                    if (o[i]) {
                        b += createHtml(o[i]);
                    }
                }
            } else {
                b += '<' + (o.tag = o.tag || 'div');
                $.each(o, function (attr, val) {
                    if (!/tag|children|cn|html$/i.test(attr)) {
                        if ($.isObject(val)) {
                            b += ' ' + attr + '="';
                            $.each(val, function (key, keyVal) {
                                b += key + ':' + keyVal + ';';
                            });
                            b += '"';
                        } else {
                            b += ' ' + ({cls: 'class', htmlFor: 'for'}[attr] || attr) + '="' + val + '"';
                        }
                    }
                });
                if (emptyTags.test(o.tag)) {
                    b += '/>';
                } else {
                    b += '>';
                    if ((cn = o.children || o.cn)) {
                        b += createHtml(cn);
                    } else if (o.html) {
                        b += o.html;
                    }
                    b += '</' + o.tag + '>';
                }
            }
            return b;
        }

        function doInsert(el, o, returnElement, pos) {
            var newNode = pub.insertHtml(pos, $.dom(el), createHtml(o));
            return returnElement ? $.get(newNode) : newNode;
        }

        var pub = {
            insertHtml: function (where, el, html) {
                var hashVal;

                where = where.toLowerCase();

                /*if (tableRe.test(el.tagName) && (rs = insertIntoTable(el.tagName.toLowerCase(), where, el, html))) {
                 return rs;
                 }*/
                // add these two to the hash.

                if ((hashVal = hash[where])) {
                    el.insertAdjacentHTML(hashVal[0], html);
                    return el[hashVal[1]];
                }
                throw 'Illegal insertion point -> "' + where + '"';
            },
            insertBefore: function (el, o, returnElement) {
                return doInsert(el, o, returnElement, beforebegin);
            },
            insertAfter: function (el, o, returnElement) {
                return doInsert(el, o, returnElement, afterend);
            },
            insertFirst: function (el, o, returnElement) {
                return doInsert(el, o, returnElement, afterbegin);
            },
            append: function (el, o, returnElement) {
                return doInsert(el, o, returnElement, beforeend);
            },
            overwrite: function (el, o, returnElement) {
                el = $.dom(el);
                el.innerHTML = createHtml(o);
                return returnElement ? $.get(el.firstChild) : el.firstChild;
            },
            html: createHtml
        };

        return pub;
    }($));

//template
    $.extend(function ($) {
        return {
            stpl: function (tpl) {
                var buf = [];
                var args = {};
                if ($.isArray(tpl)) {
                    tpl = tpl.join("");
                } else if (arguments.length > 1) {
                    $.each(arguments, function (v) {
                        if ($.isObject(v)) {
                            $.extend(args, v);
                        } else {
                            buf.push(v);
                        }
                    });
                    tpl = buf.join('');
                }
                return new junit.STemplate(tpl, args);
            },
            tpl: function (tpl) {
                var buf = [];
                var args = {};
                if ($.isArray(tpl)) {
                    tpl = tpl.join("");
                } else if (arguments.length > 1) {
                    $.each(arguments, function (v) {
                        if ($.isObject(v)) {
                            $.extend(args, v);
                        } else {
                            buf.push(v);
                        }
                    });
                    tpl = buf.join('');
                }
                return new junit.Template(tpl, args);
            },
            xtpl: function (tpl) {
                var buf = [];
                var args = {};
                if ($.isArray(tpl)) {
                    tpl = tpl.join("");
                } else if (arguments.length > 1) {
                    $.each($.toArray(arguments, 1), function (v) {
                        if ($.isObject(v)) {
                            $.extend(args, v);
                        } else {
                            buf.push(v);
                        }
                    });
                    tpl = buf.join('');
                }
                return new junit.JTemplate(tpl, args);
            },
            jtpl: function (id, tpl) {
                var t;
                if (id && (t = junit.JTemplate.get(id, true))) {
                    return t;
                }
                var buf = [];
                var args = {id: id};
                if ($.isArray(tpl)) {
                    tpl = tpl.join("");
                } else if (arguments.length > 1) {
                    $.each($.toArray(arguments, 1), function (v) {
                        if ($.isObject(v)) {
                            $.extend(args, v);
                        } else {
                            buf.push(v);
                        }
                    });
                    tpl = buf.join('');
                }
                return new junit.JTemplate(tpl, args);
            }
        }

    }($));

//style
    $().extend(function ($) {
        var propCache = {};
        var unitPattern = /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i;


        function camelFn(m, a) {
            return a.charAt(1).toUpperCase();
        }

        function evalProp(prop) {
            return propCache[prop] || (propCache[prop] = prop.replace(/(-[a-z])/gi, camelFn));
        }

        function getStyles(elem) {
            return window.getComputedStyle(elem, null);
        }

        function showHide(elements, show) {
            var display, elem,
                index = 0,
                length = elements.length;

            for (; index < length; index++) {
                elem = elements[ index ];
                if (!elem.style) {
                    continue;
                }
                display = elem.style.display;
                if (show) {
                    if (display === "none") {
                        elem.style.display = "";
                    }
                } else {
                    $(elem).css("display", 'none');
                }
            }
            return elements;
        }

        return  {
            defaultUnit: "px",
            addUnits: function (size) {
                if (size === "" || size == "auto" || size === undefined) {
                    size = size || '';
                } else if (!isNaN(size) || !unitPattern.test(size)) {
                    size = size + (this.defaultUnit || 'px');
                }
                return size;
            },
            set: function (o) {
                var attr,
                    val;

                for (attr in o) {
                    if (o.hasOwnProperty(attr)) {
                        val = o[attr];
                        if (attr == 'style') {
                            this.css(val, true);
                        } else if (attr == 'cls') {
                            this.addClass(val);
                        } else {
                            this.attr(attr, val);
                        }
                    }
                }
                return this;
            },
            html: function (value) {
                var elem = this[0] || {}, i = 0,
                    l = this.length;
                if (value === undefined && l) {
                    return elem.nodeType === 1 ? elem.innerHTML : undefined;
                }
                if ($.isFunction(value)) {
                    return this.html(value.call(this));
                }

                try {
                    value = $.html(value);
                    this.each(function (e) {
                        if (e.nodeType === 1) {
                            e.innerHTML = value;
                        }
                    });
                } catch (e) {

                }

                return this;

            },

            attr: function (name, value) {
                var elem = this[0] || {},
                    l = this.length, nType = elem.nodeType;
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return undefined;
                }
                if (value === undefined && l) {
                    return elem.getAttribute(name);
                }
                if ($.isFunction(value)) {
                    return this.attr(name, value.call(this));
                }

                var m = value == null ? "removeAttribute" : "setAttribute";
                return this.each(function () {
                    this[m](name, value + "");
                });

            },
            prop: function (name, value) {
                var elem = this[0] || {},
                    l = this.length, nType = elem.nodeType;
                if (!elem || nType === 3 || nType === 8 || nType === 2) {
                    return undefined;
                }

                if (value === undefined && l) {
                    return elem[name];
                }
                if (value == null) {
                    return this.each(function () {
                        this[name] = undefined;
                        delete this[name];
                    });
                } else {
                    if ($.isFunction(value)) {
                        return this.prop(name, value.call(this));
                    }
                    return this.each(function () {
                        this[name] = value;
                    });
                }
            },
            css: function (name, value) {
                var l = this.length , el = this[0] || {};
                if ($.isFunction(value)) {
                    return this.css(name, value.call(this));
                }
                if ($.isObject(name)) {
                    this.each(function () {
                        $.extend(this.style, name);
                    });
                    return this;
                }
                if (value === undefined && l) {
                    var m, cs;
                    if (el == document) return null;
                    if (name == 'opacity') {
                        if (el.style.filter.match) {
                            if (m = el.style.filter.match(/alpha\(opacity=(.*)\)/i)) {
                                var fv = parseFloat(m[1]);
                                if (!isNaN(fv)) {
                                    return fv ? fv / 100 : 0;
                                }
                            }
                        }
                        return 1;
                    }
                    name = evalProp(name);
                    var computed = getStyles(el);
                    var ret = computed ? computed.getPropertyValue(name) || computed[ name ] : undefined;

                    return ret || el.style[name] || ((cs = el.currentStyle) ? cs[name] : null);
                }
                if ($.isString(name) && value === true) {
                    name = name.trim().split(/\s*(?::|;)\s*/);
                    var tmp = {};
                    for (var i = 0, len = name.length; i < len;) {
                        tmp[evalProp(name[i++])] = name[i++];
                    }
                    return this.css(tmp);
                }

                return this.each(function () {
                    this.style[evalProp(name)] = value;
                });


            },
            val: function (value) {
                var elem = this[0], l = this.length;
                if (!arguments.length) {
                    if (elem) {
                        return elem.value;
                    }
                }
                return this.each(function () {
                    this.value = value;
                });

            },
            addClass: function (value) {
                var classNames, i, l, elem,
                    setClass, c, cl;

                classNames = value.split(/\s+/);
                for (i = 0, l = this.length; i < l; i++) {
                    elem = this[ i ];

                    if (elem.nodeType === 1) {
                        if (!elem.className && classNames.length === 1) {
                            elem.className = value;

                        } else {
                            setClass = " " + elem.className + " ";

                            for (c = 0, cl = classNames.length; c < cl; c++) {
                                if (setClass.indexOf(" " + classNames[ c ] + " ") < 0) {
                                    setClass += classNames[ c ] + " ";
                                }
                            }
                            elem.className = setClass.trim();
                        }
                    }
                }
                return this;

            },
            removeClass: function (value) {
                var removes, className, elem, c, cl, i, l;

                removes = ( value || "" ).split(/\s+/);

                for (i = 0, l = this.length; i < l; i++) {
                    elem = this[ i ];
                    if (elem.nodeType === 1 && elem.className) {

                        className = (" " + elem.className + " ");

                        for (c = 0, cl = removes.length; c < cl; c++) {
                            while (className.indexOf(" " + removes[ c ] + " ") >= 0) {
                                className = className.replace(" " + removes[ c ] + " ", " ");
                            }
                        }
                        elem.className = value ? className.trim() : "";
                    }
                }

                return this;
            },
            toggleClass: function (value) {
                var className = " " + value + " ", i = 0,
                    l = this.length, c;

                for (; i < l; i++) {
                    if (this[i].nodeType !== 1) continue;

                    c = (" " + this[i].className + " ");
                    if (this[i].nodeType === 1 && c.indexOf(className) >= 0) {
                        this[i].className = (c.replace(className, " ")).trim();
                    } else {
                        this[i].className = (c + value).trim();
                    }

                }
                return this;
            },
            hasClass: function (value) {
                var className = " " + value + " ",
                    i = 0,
                    l = this.length;

                for (; i < l; i++) {
                    if (this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(className) >= 0) {
                        return true;
                    }
                }

                return false;
            },
            show: function () {
                return showHide(this, true);
            },
            hide: function () {
                return showHide(this);
            },
            isShow: function () {
                var show = true;
                this.each(function () {
                    if ($(this).css("display") == "none") {
                        show = false;
                        return false;
                    }
                    return true;
                });
                return show;
            },
            toggle: function (setting) {
                return this.each(function () {
                    var el = $(this);
                    (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
                })
            }

        }
    }($));

//position
    $().extend(function ($) {
        return {
            width: function (w) {
                var me = this;
                if (w == undefined) {
                    var dom = me.dom();
                    w = Math.max(dom.offsetWidth, dom.clientWidth) || 0;
                    //w = !contentWidth ? w : w - me.getBorderWidth("lr") - me.getPadding("lr");
                    return w < 0 ? 0 : w;
                }
                this.each(function () {
                    this.style.width = me.addUnits(w);
                });
                return this;
            },
            height: function (h) {
                var me = this;
                if (h == undefined) {
                    var dom = me.dom();
                    h = Math.max(dom.offsetHeight, dom.clientHeight) || 0;
                    //w = !contentWidth ? w : w - me.getBorderWidth("lr") - me.getPadding("lr");
                    return h < 0 ? 0 : h;
                }
                this.each(function () {
                    this.style.height = me.addUnits(h);
                });
                return this;
            },
            size: function (width, height) {
                var me = this;
                if (width == undefined) {
                    return {width: me.width(), height: me.height()};
                }
                if ($.isObject(width)) {
                    height = width.height;
                    width = width.width;
                }

                this.each(function () {
                    this.style.width = me.addUnits(width);
                    this.style.height = me.addUnits(height);

                });
                return this;

            },
            offset: function (options) {
                if (arguments.length) {
                    return options === undefined ?
                        this :
                        this.each(function (index) {
                            var me = $(this),
                                curOffset = me.offset(),
                                props = {}, position = me.css("position"), curTop, curLeft;
                            var curCSSTop = me.css("top");
                            var curCSSLeft = me.css("left");
                            var calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;
                            // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
                            if (calculatePosition) {
                                var curPosition = me.position();
                                curTop = curPosition.top;
                                curLeft = curPosition.left;

                            } else {
                                curTop = parseFloat(curCSSTop) || 0;
                                curLeft = parseFloat(curCSSLeft) || 0;
                            }
                            if ($.isFunction(options)) {
                                options = options.call(this, index, curOffset);
                            }
                            if (options.top != null) {
                                props.top = ( options.top - curOffset.top ) + curTop;
                            }
                            if (options.left != null) {
                                props.left = ( options.left - curOffset.left ) + curLeft;
                            }

                            if (me.css('position') == 'static') props['position'] = 'relative';
                            me.css(props);
                        });
                }
                var box = { top: 0, left: 0 }, elem = this[0];
                if (this.length == 0) return null;
                if (typeof elem.getBoundingClientRect !== undefined) {
                    box = elem.getBoundingClientRect();
                }
                var docElem = document.documentElement;
                return {
                    top: box.top + window.pageYOffset - docElem.clientTop,
                    left: box.left + window.pageXOffset - docElem.clientLeft
                }
            },
            position: function (options) {
                if (!this.length) return [0, 0];

                var elem = this[0],
                    offsetParent = this.offsetParent(),
                    offset = this.offset(),
                    parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } :
                        offsetParent.offset();
                offset.top -= parseFloat($(elem).css('margin-top')) || 0;
                offset.left -= parseFloat($(elem).css('margin-left')) || 0;
                parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
                parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

                // Subtract the two offsets
                return {
                    top: offset.top - parentOffset.top,
                    left: offset.left - parentOffset.left
                }
            },
            offsetParent: function () {
                return this.map(function () {
                    var parent = this.offsetParent || document.body;
                    while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                        parent = parent.offsetParent;
                    return parent
                })
            }
        }
    }($));

//$()-helper
    $().extend(function ($) {
        var GETDOM = $.dom;
        return {
            appendChild: function (el) {
                return $(el).appendTo(this);
            },
            appendTo: function (el) {
                GETDOM(el).appendChild(this.dom());
                return this;
            },

            insertBefore: function (el) {
                (el = GETDOM(el)).parentNode.insertBefore(this.dom(), el);
                return this;
            },
            insertAfter: function (el) {
                (el = GETDOM(el)).parentNode.insertBefore(this.dom(), el.nextSibling);
                return this;
            },

            insertFirst: function (el, returnDom) {
                el = el || {};
                if (el.nodeType || el.dom || typeof el == 'string') { // element
                    el = GETDOM(el);
                    this.dom().insertBefore(el, this.dom().firstChild);
                    return !returnDom ? $.get(el) : el;
                } else { // dh config
                    return this.createChild(el, this.dom().firstChild, returnDom);
                }
            },

            replace: function (el) {
                el = $.get(el);
                this.insertBefore(el);
                el.html("");
                return this;
            },

            createChild: function (config, insertBefore, returnDom) {
                config = config || {tag: 'div'};
                return insertBefore ?
                    $.insertBefore(insertBefore, config, returnDom !== true) :
                    $[!this.dom().firstChild ? 'overwrite' : 'append'](this.dom(), config, returnDom !== true);
            },

            wrap: function (config, returnDom) {
                var newEl = $.insertBefore(this.dom(), config || {tag: "div"}, !returnDom);
                returnDom ? newEl.appendChild(this.dom()) : newEl.dom().appendChild(this.dom());
                return newEl;
            },

            insertHtml: function (where, html, returnEl) {
                var el = $.insertHtml(where, this.dom(), html);
                return returnEl ? $.get(el) : el;
            }

        }
    }($));

//data

    function Data() {
        Object.defineProperty(this.cache = {}, 0, {
            get: function () {
                return {};
            }
        });

        this.jkey = $.jkey + parseInt(Math.random() * 100);
    }

    Data.uid = 1;

    Data.accepts = function (owner) {
        return owner.nodeType ?
            owner.nodeType === 1 || owner.nodeType === 9 : true;
    };

    Data.prototype = {
        key: function (owner) {
            if (!Data.accepts(owner)) {
                return 0;
            }

            var descriptor = {},
            // Check if the owner object already has a cache key
                unlock = owner[ this.jkey ];

            // If not, create one
            if (!unlock) {
                unlock = Data.uid++;
                // Secure it in a non-enumerable, non-writable property
                try {
                    descriptor[ this.jkey ] = { value: unlock };
                    Object.defineProperties(owner, descriptor);
                } catch (e) {
                    descriptor[ this.jkey ] = unlock;
                    $.extend(owner, descriptor);
                }
            }

            // Ensure the cache object
            if (!this.cache[ unlock ]) {
                this.cache[ unlock ] = {};
            }

            return unlock;
        },
        set: function (owner, data, value) {
            var unlock = this.key(owner),
                cache = this.cache[ unlock ];

            // Handle: [ owner, key, value ] args
            if (typeof data === "string") {
                cache[ data ] = value;
            } else {  // Handle: [ owner, { properties } ] args
                $.extend(cache, data);
            }
            return cache;
        },
        get: function (owner, key) {
            var cache = this.cache[ this.key(owner) ];
            return key === undefined ?
                cache : cache[ key ];
        },
        access: function (owner, key, value) {
            if (key === undefined ||
                ((key && typeof key === "string") && value === undefined)) {
                return this.get(owner, key);
            }
            this.set(owner, key, value);
            return value !== undefined ? value : key;
        },
        remove: function (owner, key) {
            var i, name, camel,
                unlock = this.key(owner),
                cache = this.cache[ unlock ];
            // remove all
            if (key === undefined) {
                this.cache[ unlock ] = {};

            } else {
                // Support array or space separated string of keys
                if (!$.isArray(key)) {
                    name = [key];
                }
                i = name.length;
                while (i--) {
                    delete cache[ name[ i ] ];
                }
            }
        },
        hasData: function (owner) {
            return !$.isEmptyObject(
                this.cache[ owner[ this.jkey ] ] || {}
            );
        },
        discard: function (owner) {
            if (owner[ this.jkey ]) {
                delete this.cache[ owner[ this.jkey ] ];
            }
        }
    };

    var data_user = new Data();
    var data_priv = new Data();

    $.extend({
        acceptData: Data.accepts,
        hasData: function (elem) {
            return data_user.hasData(elem) || data_priv.hasData(elem);
        },
        data: function (elem, name, data) {
            return data_user.access(elem, name, data);
        },
        removeData: function (elem, name) {
            data_user.remove(elem, name);
        }
    });

    function dataAttr(elem, key) {
        var name, data = undefined;
        if (elem.nodeType === 1) {
            if (elem.dataset) {
                data = elem.dataset[key];
            } else {
                name = "data-" + key.toLowerCase();
                data = elem.getAttribute(name);
            }
            if (typeof data === "string") {
                try {
                    data = data === "true" ? true :
                        data === "false" ? false :
                            data === "null" ? null :
                                // Only convert to a number if it doesn't change the string
                                +data + "" === data ? +data :
                                    rbrace.test(data) ? JSON.parse(data) :
                                        data;
                } catch (e) {
                }

                //Make sure we set the data so it isn't changed later
                //data_user.set(elem, key, data);
            }
        }
        return data;
    }

    $().extend({
        data: function (key, value) {
            var attrs, name,
                elem = this[ 0 ],
                i = 0,
                data = null;

            // Gets all values
            if (key === undefined) {
                if (this.length) {

                    data = $.extend({}, data_user.get(elem));

                    if (elem.nodeType === 1) {
                        attrs = elem.attributes;
                        for (; i < attrs.length; i++) {
                            name = attrs[ i ].name;
                            if (name.indexOf("data-") === 0) {
                                name = name.slice(5);
                                data[name] || (data[name] = dataAttr(elem, name));
                            }
                        }
                    }
                }
                return data;
            }
            // Sets multiple values
            if (typeof key === "object") {
                return this.each(function () {
                    data_user.set(this, key);
                });
            }

            if (elem && value === undefined) {
                data = data_user.get(elem, key);
                if (data !== undefined) {
                    return data;
                }
                data = dataAttr(elem, key);
                if (data !== undefined) {
                    return data;
                }
                return null;
            }

            // Set the data...
            return this.each(function () {
                var data = data_user.get(this, key);
                data_user.set(this, key, value);
            });

        },

        removeData: function (key) {
            return this.each(function () {
                data_user.remove(this, key);
            });
        }
    });

//event

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    $.event = function (src, props) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof $.event)) {
            return new $.event(src, props);
        }

        // Event object
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = ( src.defaultPrevented ||
                src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

            // Event type
        } else {
            this.type = src;
        }
        var me = this;
        if (src) {
            // normalize buttons
            me.button = src.button;
            if (src.type == 'click' && me.button == -1) {
                me.button = 1;
            }
            me.type = src.type;
            me.shiftKey = src.shiftKey;
            // mac metaKey behaves like ctrlKey
            me.ctrlKey = src.ctrlKey || src.metaKey || false;
            me.altKey = src.altKey;
            // in getKey these will be normalized for the mac
            me.keyCode = src.keyCode;
            me.charCode = src.charCode;
            // cache the target for the delayed and or buffered events
            me.target = src.target;
            // same for XY
            //me.xy = E.getXY(src);
        } else {
            me.button = -1;
            me.shiftKey = false;
            me.ctrlKey = false;
            me.altKey = false;
            me.keyCode = 0;
            me.charCode = 0;
            me.target = null;
            me.xy = [0, 0];
        }

        // Put explicitly provided properties onto the event object
        if (props) {
            $.extend(this, props);
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || Date.now();

        this[$.jkey] = true;

        return this;
    };

    $.extend($.event, {
        add: function (elem, types, handler, data, selector, scope) {

            var handleObjIn, eventHandle, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = data_priv.get(elem);

            // Don't attach events to noData or text/comment nodes (but allow plain objects)
            if (!elemData) {
                return;
            }
            // Caller can pass in an object of custom data  of the handler
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            // Make sure that the handler has a unique ID, used to find/remove it later
            if (!handler.guid) {
                handler.guid = $.guid++;
            }

            // Init the element's event structure and main handler, if this is the first
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function (e) {
                    return $.event.triggered !== e.type ?
                        $.event.dispatch.apply(eventHandle.elem, arguments) :
                        undefined;
                };
                // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
                eventHandle.elem = elem;
            }

            // Handle multiple events separated by a space
            types = ( types || "" ).match(core_rnotwhite) || [""];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = ( tmp[2] || "" ).split(".").sort();

                // There *must* be a type, no attaching namespace-only handlers
                if (!type) {
                    continue;
                }

                // If event changes its type, use the special event handlers for the changed type
                special = $.event.special[ type ] || {};

                // If selector defined, determine special event api type, otherwise given type
                type = ( selector ? special.delegateType : special.bindType ) || type;


                // handleObj is passed to all event handlers
                handleObj = $.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    scope: scope,
                    namespace: namespaces.join(".")
                }, handleObjIn);

                // Init the event handler queue if we're the first
                if (!(handlers = events[ type ])) {
                    handlers = events[ type ] = [];
                    handlers.delegateCount = 0;

                    // Only use addEventListener if the special events handler returns false
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);
                        }
                    }
                }

                if (special.add) {
                    special.add.call(elem, handleObj);

                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add to the element's handler list, delegates in front
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }
            }
            // Nullify elem to prevent memory leaks in IE
            elem = null;
        },
        remove: function (elem, types, handler, selector, mappedTypes) {

            var j, origCount, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = data_priv.hasData(elem) && data_priv.get(elem);

            if (!elemData || !(events = elemData.events)) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = ( types || "" ).match(core_rnotwhite) || [""];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = ( tmp[2] || "" ).split(".").sort();

                // Unbind all events (on this namespace, if provided) for the element
                if (!type) {
                    for (type in events) {
                        $.event.remove(elem, type + types[ t ], handler, selector, true);
                    }
                    continue;
                }

                special = $.event.special[ type ] || {};
                type = ( selector ? special.delegateType : special.bindType ) || type;
                handlers = events[ type ] || [];
                tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

                // Remove matching events
                origCount = j = handlers.length;
                while (j--) {
                    handleObj = handlers[ j ];

                    if (( mappedTypes || origType === handleObj.origType ) &&
                        ( !handler || handler.guid === handleObj.guid ) &&
                        ( !tmp || tmp.test(handleObj.namespace) ) &&
                        ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector )) {
                        handlers.splice(j, 1);

                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if (origCount && !handlers.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        elem.removeEventListener(type, elemData.handle, false);
                    }

                    delete events[ type ];
                }
            }

            // Remove the expando if it's no longer used
            if ($.isEmptyObject(events)) {
                delete elemData.handle;
                data_priv.remove(elem, "events");
            }
        },
        trigger: function (event, data, elem, onlyHandlers) {

            var i, cur, tmp, bubbleType, ontype, handle, special,
                eventPath = [ elem || document ],
                type = core_hasOwn.call(event, "type") ? event.type : event,
                namespaces = core_hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

            cur = tmp = elem = elem || document;

            // Don't do events on text and comment nodes
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return null;
            }

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            /*if (rfocusMorph.test(type + $.event.triggered)) {
             return;
             }*/

            if (type.indexOf(".") >= 0) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;

            // Caller can pass in a $.Event object, Object, or just an event type string
            event = event[ $.jkey ] ? event : new $.event(type, typeof event === "object" && event);

            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ?
                new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") :
                null;

            // Clean up the event in case it is being reused
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data == null ?
                [ event ] :
                isArraylike(data) ? $.merge([ event ], data) : [event, data];

            // Allow special events to draw outside the lines
            special = $.event.special[ type ] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                return null;
            }

            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            if (!onlyHandlers && !special.noBubble && !$.isWindow(elem)) {

                bubbleType = special.delegateType || type;
                if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                }
                for (; cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                }

                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                }
            }

            // Fire handlers on the event path
            i = 0;

            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {


                event.type = i > 1 ?
                    bubbleType :
                    special.bindType || type;

                // $ handler
                handle = ( data_priv.get(cur, "events") || {} )[ event.type ] && data_priv.get(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }

                // Native handler
                handle = ontype && cur[ ontype ];
                if (handle && $.acceptData(cur) && handle.apply && handle.apply(cur, data) === false) {
                    event.preventDefault();
                }
            }
            event.type = type;

            // If nobody prevented the default action, do it now
            if (!onlyHandlers && !event.isDefaultPrevented()) {

                if ((!special._default || special._default.apply(eventPath.pop(), data) === false) &&
                    $.acceptData(elem)) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    if (ontype && $.isFunction(elem[ type ]) && !$.isWindow(elem)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        tmp = elem[ ontype ];
                        if (tmp) {
                            elem[ ontype ] = null;
                        }
                        $.event.triggered = type;
                        elem[ type ]();
                        $.event.triggered = undefined;
                        if (tmp) {
                            elem[ ontype ] = tmp;
                        }
                    }
                }
            }

            return event.result;
        },
        dispatch: function (event) {
            // Make a writable $.event from the native event object
            event = $.event.fix(event);

            var i, j, ret, matched, handleObj,
                handlerQueue = [],
                args = $.toArray(arguments),
                handlers = ( data_priv.get(this, "events") || {} )[ event.type ] || [];

            args[0] = event;
            event.delegateTarget = this;

            // Determine handlers
            handlerQueue = $.event.handlers.call(this, event, handlers);
            // Run delegates first; they may want to stop propagation beneath us
            i = 0;

            while ((matched = handlerQueue[ i++ ]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped()) {

                    // Triggered event must either 1) have no namespace, or
                    // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                    if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {

                        event.handleObj = handleObj;
                        event.data = handleObj.data;

                        ret = ( ($.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                            .apply(handleObj.scope || matched.elem, args);

                        if (ret !== undefined) {
                            if ((event.result = ret) === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }
            return event.result;
        },
        handlers: function (event, handlers) {
            var i, matches, sel, handleObj,
                handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;
            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {

                for (; cur !== this; cur = cur.parentNode || this) {

                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (cur.disabled !== true || event.type !== "click") {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[ i ];

                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + " ";

                            if (matches[ sel ] === undefined) {
                                matches[ sel ] = $(sel, this).index(cur) >= 0;
                            }
                            if (matches[ sel ]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({ elem: cur, handlers: matches });
                        }
                    }
                }
            }

            // Add the remaining (directly-bound) handlers
            if (delegateCount < handlers.length) {
                handlerQueue.push({ elem: this, handlers: handlers.slice(delegateCount) });
            }

            return handlerQueue;
        },
        fix: function (event) {
            if (event[ $.jkey ]) {
                return event;
            }
            var originalEvent = event;

            return new $.event(event);

        },
        special: {}
    });

    $().extend($.event, {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,

        preventDefault: function () {
            var e = this.originalEvent;

            this.isDefaultPrevented = returnTrue;

            if (e && e.preventDefault) {
                e.preventDefault();
            }
        },
        stopPropagation: function () {
            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
    });

    $().extend({
        on: function (types, selector, data, fn, scope, /*INTERNAL*/ one) {
            var origFn, type;

            // Types can be a map of types/handlers
            if (typeof types === "object") {
                // ( types-Object, selector, data )
                if (typeof selector !== "string") {
                    // ( types-Object, data )
                    data = selector;
                    selector = undefined;
                }
                scope = types.scope;
                for (type in types) {
                    this.on(type, selector, data, types[ type ], one);
                }
                return this;
            }

            if (data == null && fn == null && scope == null) { // 2 args
                // (types, fn )
                fn = selector;
                data = selector = scope = undefined;
            } else if (fn == null && scope == null) {  // 3 args
                //(types,fn,scope)
                if ($.isFunction(selector)) {
                    fn = selector;
                    scope = data;
                    selector = data = undefined;
                } else if (typeof selector === "string") {
                    // ( types, selector, fn )
                    fn = data;
                    data = scope = undefined;
                } else {
                    // ( types, data, fn )
                    fn = data;
                    data = selector;
                    selector = scope = undefined;
                }
            } else if (scope == null) {   // 4 args
                if (typeof selector === "string") {
                    // ( types, selector, fn ,scope)
                    scope = fn;
                    fn = data;
                    data = undefined;
                } else {
                    //(types,data,fn,scope)
                    scope = fn;
                    fn = data;
                    data = selector;
                    selector = undefined;
                }

            }

            if (fn === false) {
                fn = returnFalse;
            } else if (!fn) {
                return this;
            }

            if (one === 1) {
                origFn = fn;
                fn = function (event) {
                    // Can use an empty set, since event contains the info
                    $(null).off(event);
                    return origFn.apply(this, arguments);
                };
                // Use same guid so caller can remove using origFn
                fn.guid = origFn.guid || ( origFn.guid = $.guid++ );
            }
            return this.each(function () {
                $.event.add(this, types, fn, data, selector, scope);
            });
        },
        one: function (types, selector, data, fn, scope) {
            return this.on(types, selector, data, fn, scope, 1);
        },
        off: function (types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
                handleObj = types.handleObj;
                $(types.delegateTarget).off(
                    handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                );
                return this;
            }
            if (typeof types === "object") {
                // ( types-object [, selector] )
                for (type in types) {
                    this.off(type, selector, types[ type ]);
                }
                return this;
            }
            if (selector === false || typeof selector === "function") {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }
            return this.each(function () {
                $.event.remove(this, types, fn, selector);
            });
        },

        trigger: function (type, data) {
            return this.each(function () {
                $.event.trigger(type, data, this);
            });
        },
        fire: function (type, data) {
            var elem = this[0];
            if (elem) {
                return $.event.trigger(type, data, elem, true);
            }
            return null;
        },

        bind: function (types, data, fn) {
            return this.on(types, null, data, fn);
        },
        unbind: function (types, fn) {
            return this.off(types, null, fn);
        },
        delegate: function (selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function (selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
        }

    });

    $.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function (name) {

        // Handle event binding
        $.fn[ name ] = function (data, fn) {
            return arguments.length > 0 ?
                this.on(name, null, data, fn) :
                this.trigger(name);
        };
    });


    window.$ = $;

})(undefined);



