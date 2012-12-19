/**
 * The J module contains the components required for building the J seed file.
 * opp for the library.
 * @main j
 */

var __cpackage__;
var __npackage__;
var __gclasses__ = {};
var __iclasses__ = {};
var __imports__ = [];
var __importcs__ = {};
var __statics__ = {};

/**
 * The J global namespace object. This is the constructor for all J instances.
 * @class J
 * @constructor
 * @global
 * @param {Object} [selector] * Zero or more optional selector objects
 * @param {Object} [context] * Zero or more optional context objects
 * @return
 * * when zero param return J.prototype
 */
var J = (function() {
    var J,JF,toString = Object.prototype.toString,
        oc = Object.prototype.constructor,
        apush = Array.prototype.push,
        aslice = Array.prototype.slice,
        class2type = {},
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
            'toString', 'constructor'],
        objs = "Boolean Number String Function Array Date RegExp".split(" ");
    for (var i = 0,l = objs.length; i < l; i++) {
        class2type[ "[object " + objs[i] + "]" ] = objs[i].toLowerCase();
    }

    Function.prototype.setter = function() {
        var jthis = this;
        return function(a, b) {
            if (a == null) return this;
            if (typeof a != 'string') {
                for (var k in a) jthis.call(this, k, a[k]);
                if (enumerables) {
                    for (var i = enumerables.length; i--;) {
                        k = enumerables[i];
                        if (a.hasOwnProperty(k)) jthis.call(this, k, a[k]);
                    }
                }
            } else {
                jthis.call(this, a, b);
            }
            return this;
        };
    };

    Function.prototype.getter = function() {
        var jthis = this;
        return function(a) {
            var args, result;
            if (typeof a != 'string') args = a;
            else if (arguments.length > 1) args = arguments;
            if (args) {
                result = {};
                for (var i = 0; i < args.length; i++)
                    result[args[i]] = jthis.call(this, args[i]);
            } else {
                result = jthis.call(this, a);
            }
            return result;
        };
    };

    function Jclass(selector, context) {
        if (!selector) {
            return this;
        }
        if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
        }
        if (typeof selector === "string") {
            var rs = (context || document).querySelectorAll(selector);
            return J.merge(this, rs);


        } else if (J.isFunction(selector)) {
            return J.ready(selector);
        }

        return J.merge(this, selector);

    }


    J = function(selector, context) {
        if (arguments.length == 0) {
            return Jclass.prototype;
        }
        if (selector && selector.nodeType) {
            JF[0] = selector;
            return JF;
        }
        return new Jclass(selector, context);
    };

    JF = new Jclass(null);
    JF.length = 1;

    /**
     * @method extend
     * @static
     */
    /**
     * @method extend
     */
    J.extend = J().extend = function(key, value) {
        this[key] = value;
    }.setter();

    J.extend({
        /**
         * @method mixin
         * @static
         * @param o
         * @param c
         */
        mixin :function(o, c) {
            if (o && c && typeof c == 'object') {
                for (var p in c) {
                    o[p] = c[p];
                }
            }
            return o;
        },
        /**
         * @method mixinIf
         * @static
         * @param o
         * @param c
         */
        mixinIf : function(o, c) {
            if (o) {
                for (var p in c) {
                    if (!J.isDefined(o[p])) {
                        o[p] = c[p];
                    }
                }
            }
            return o;
        },
        /**
         * @method override
         * @static
         * @param origclass
         * @param overrides
         */
        override: function(origclass, overrides) {
            if (overrides) {
                var p = origclass.prototype;
                J.mixin(p, overrides);
            }
        },
        /**
         * @method merge
         * @static
         * @param first
         * @param second
         */
        merge: function(first, second) {
            if (!second || !first) return;

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
         * @method get
         * @static
         * @param el
         */
        get:function(el) {
            var elm;
            if (!el) {
                return null;
            }
            if (J.isString(el)) { // element id
                if (!(elm = document.getElementById(el))) {
                    return null;
                }
                return new Jclass(elm);

            } else if (el.tagName) { // dom element
                return new Jclass(el);
            } else if (el instanceof Jclass) {
                return el;
            }
            return null;
        },
        /**
         * @method dom
         * @static
         * @param el
         */
        dom:function(el) {
            if (!el) {
                return null;
            }
            if (el.dom && el.dom()) {
                return el.dom();
            } else {
                if (J.isString(el)) {
                    return document.getElementById(el);
                } else {
                    return el;
                }
            }
        },
        /**
         * @method isFunction
         * @static
         * @param v
         */
        isFunction : function(v) {
            return J.type(v) === 'function';
        },
        isString : function(v) {
            return J.type(v) === 'string';
        },
        isBoolean : function(v) {
            return J.type(v) === 'boolean';
        },
        isElement : function(v) {
            return !!v && v.tagName;
        },
        isDefined : function(v) {
            return typeof v !== 'undefined';
        },
        isObject : function(v) {
            return !!v && J.type(v) === 'object';
        },
        isDate : function(v) {
            return J.type(v) === 'date';
        },
        isPrimitive : function(v) {
            return J.isString(v) || J.isNumber(v) || J.isBoolean(v);
        },
        isNumber : function(v) {
            return J.type(v) === 'number';
        },
        isEmpty : function(v, allowBlank) {
            return v === null || v === undefined || ((J.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
        },
        isArray :  Array.isArray || function(v) {
            return J.type(v) === "array";
        },
        noop: function() {
        },
        isIterable : function(v) {
            //check for array or arguments
            if (J.isArray(v) || v.callee) {
                return true;
            }
            //check for node list type
            if (/NodeList|HTMLCollection/.test(toString.call(v))) {
                return true;
            }
            //NodeList has an item and length property
            //IXMLDOMNodeList has nextNode method, needs to be checked first.
            return ((typeof v.nextNode != 'undefined' || v.item) && J.isNumber(v.length));
        },
        type: function(obj) {
            return class2type[ toString.call(obj) ] || "object";
        },

        ready:function() {

        },
        each : function(obj, fn, scope) {
            if (J.isEmpty(obj, true)) {
                return obj;
            }
            var name;

            if (obj.length === undefined && J.isObject(obj)) {
                for (name in obj) {
                    if (fn.call(scope || obj, name, obj[ name ]) === false) {
                        break;
                    }
                }
                return obj;
            }

            for (var i = 0,len = obj.length; i < len; i++) {
                if (fn.call(scope || obj[i], obj[i], i, obj) === false) {
                    return i;
                }
            }
            return obj;
        },
        toArray : function(array, start, end) {
            return aslice.call(array, start || 0, end || array.length);
        },
        namespace : function() {
            var o, d;
            J.each(arguments, function(v) {
                d = v.split(".");
                o = window[d[0]] = window[d[0]] || {};
                J.each(d.slice(1), function(v2) {
                    o = o[v2] = o[v2] || {};
                });
            });
            return o;
        },
        nameclass:function(c) {
            if (__gclasses__[c]) return __gclasses__[c];
            var d = c.split(".");
            var o = window[d[0]] = window[d[0]] || {};
            J.each(d.slice(1, d.length - 1), function(v2) {
                o = o[v2] = o[v2] || {};
            });
            return __gclasses__[c] = o[d[d.length - 1]];
        },
        importstatic:function(c, code, args) {
            if (J.isFunction(code)) {
                code._jstatic = c._jstatic = c;
                code.call(c, c);
                delete code._jstatic;
                delete c._jstatic;
            } else {
                J.mixin(c, code);
            }
            if (args && args.length > 0) {
                for (i = 0,l = args.length; i < l; i++) {
                    J.mixinIf(c, J.importclass(args[i]));
                }
            }
        },

        importclass:function(c) {
            if (__statics__[c]) {
                var ip;
                __gclasses__[c] = ip = J.namespace(c);
                ip.shortname = __statics__[c][0];
                ip.classname = c;
                J.importstatic(ip, __statics__[c][1], __statics__[c][2]);
                delete __statics__[c];
                return ip;
            }
            if (__gclasses__[c]) return __gclasses__[c];
            if (__iclasses__[c]) return __iclasses__[c];
            if (__importcs__[c]) return __importcs__[c];

            var d = c.split(".");
            var o = window[d[0]] = window[d[0]] || {};
            var name = d[d.length - 1];
            J.each(d.slice(1, d.length - 1), function(v2) {
                o = o[v2] = o[v2] || {};
            });
            if (o[name]) {
                o = __gclasses__[c] = o[name];
            } else {

                J.each(__imports__, function(i) {
                    if ((o = i[name])) {
                        return false;
                    }
                });

                __iclasses__[c] = o;
            }

            return o;
        }

    });

    J().extend({
        /**
         * @property {Integer} length
         */
        length: 0,
        /**
         * @method create
         * @param elems
         */
        create:function(elems) {
            var ret = J.merge(J(null), elems || []);
            ret.prevJ = this;
            return ret;
        },
        dom: function(num) {
            return this.length == 0 ? null : num < 0 ? this[ this.length + num ] : this[ num || 0 ];
        },
        get: function(i) {
            i = +i;
            return i === -1 ?
                this.slice(i) :
                this.slice(i, i + 1);
        },
        first: function() {
            return this.get(0);
        },

        last: function() {
            return this.get(-1);
        },

        slice: function() {
            return this.create(aslice.apply(this, arguments));
        },

        each: function(callback) {
            for (var i = 0,len = this.length; i < len; i++) {
                if (callback.call(this[i], this[i], i, this) === false) {
                    return i;
                }
            }
            return this;
        },

        back:function() {
            return this.prevJ || J(null);
        },

        query:function(selector) {
            var elem;
            var ret = this.create();
            var rs,r;

            for (var i = 0,l = this.length; i < l; i++) {
                elem = this[i];
                rs = elem.querySelectorAll(selector);
                J.merge(ret, rs);
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
        push: apush,
        sort: [].sort,
        splice: [].splice
    });

    J.prototype = Jclass.prototype;
    J.prototype.constructor = Jclass;

    return J;
})();

/**
 * The global namespace methods,Used to simulate the Java keyword.
 * @class .
 */


/**
 * Simulation of java package
 * @method jpackage
 * @param {String} name package's name
 * @param {String|Object|Class} [imports]* import class or objects
 *
 *      For example:
 *      "foo.Foo;foo.*"
 *      "foo.Foo","foo.*"
 *      foo.Foo
 *
 * @param {function} func(imports)  package body.
 *
 **   imports:According to the incoming imports sequence to make variables
 *
 *
 *@global
 **/
function jpackage() {
    var l = arguments.length,i = 0;
    if (l == 0) return;
    var pkf = arguments[l - 1];
    pkf.$Define = true;

    if (J.isString(arguments[0])) {
        __cpackage__ = J.namespace(arguments[0]);
        __npackage__ = arguments[0];
        i = 1;
    } else {
        __cpackage__ = window;
        __npackage__ = '';
        i = 0;
    }
    var args = [],vs,ip;
    J.each(J.toArray(arguments, i, l - 1), function(v) {
        if (J.isString(v)) {
            vs = v.split(";");
            J.each(vs, function(v2) {
                if (v2.substr(-2) == ".*") {
                    ip = J.namespace(v2.substring(0, v2.length - 2));
                    __imports__.push(ip);
                    args.push(ip);
                } else {
                    args.push(J.importclass(v2));
                }
            });
        } else if (J.isArray(v)) {
            args = args.concat(v);
        } else {
            args.push(v);
        }
    });
    pkf.apply(__cpackage__, args);

    __cpackage__ = null;
    __npackage__ = '';
    __imports__ = [];
    __iclasses__ = {};

}
/**
 * @method jimport
 * @global
 */
function jimport() {
    var args = [],vs,ip;
    __imports__ = [];
    __iclasses__ = {};
    if (jimport.caller) {
        jimport.caller.$Define = true;
    }
    J.each(arguments, function(v) {
        if (J.isString(v)) {
            vs = v.split(";");
            J.each(vs, function(v2) {
                if (!v2) return;
                if (v2.substr(-2) == ".*") {
                    ip = J.namespace(v2.substring(0, v2.length - 2));
                    __imports__.push(ip);
                    args.push(ip);
                } else {
                    ip = J.importclass(v2);
                    args.push(ip);
                    __importcs__[ip.shortname] = ip;
                }
            });
        } else if (J.isArray(v)) {
            args = args.concat(v);
        } else {
            args.push(v);
        }
    });
    if (args.length == 1) return args[0];
    return args;
}
/**
 * @method jextends
 * @global
 */
function jextends() {

    var oc = Object.prototype.constructor;
    var l = arguments.length;
    var sb = arguments[0];
    var sp = arguments[1];
    var mixins = [];
    var coverrides;
    if (l < 2) {
        throw new Error("[jextends] invalid arguments");
    }
    if (l == 2) {
        coverrides = sp;
        sp = sb;
    } else if (J.isArray(arguments[2])) {
        mixins = arguments[2];
        coverrides = sp;
        sp = sb;
        l = 2;
    } else {
        coverrides = arguments[2];
        if (l == 4) {
            mixins = arguments[3];
        }
    }
    if (J.isString(sp)) {
        sp = J.importclass(sp);
    }

    var JClass = function() {
    };

    var sbp,spp = JClass.prototype = sp.prototype;
    if (J.isFunction(coverrides)) {
        coverrides.$Define = true;

        var c = coverrides.apply(this, [spp].concat(mixins));
        if (c) {
            coverrides = c;
        } else {

            if (spp._jpublic) {
                coverrides = spp._jpublic;
                delete spp._jpublic;
            }
            if (!coverrides) coverrides = {};
            if (spp._jstatic) {
                coverrides.jstatic = spp._jstatic;
                delete spp._jstatic;
            }
        }
    }

    if (l == 2) {
        sb = coverrides.constructor != oc ? coverrides.constructor : function() {
            sp.apply(this, arguments);
        };
    }

    sbp = sb.prototype = new JClass();
    sbp.constructor = sbp.jstatic = sb;
    sbp.superclass = sbp.jsuper = sb.superclass = sb.jsuper = spp;

    if (spp.constructor == oc) {
        spp.constructor = sp;
    }
    if (coverrides.jstatic) {
        J.mixin(sb, coverrides.jstatic);
        delete coverrides.jstatic;
    }

    J.override(sb, coverrides);  // extend coverrides

    if (mixins.length) {
        for (var i = 0,len = mixins.length; i < len; i++) {
            J.mixinIf(sbp, mixins[i]);
        }
    }

    return sb;
}
/**
 * @method jprivate
 * @global
 */
function jprivate(origclass, overrides) {
    J.mixin(origclass, overrides);
}
/**
 * @method jpublic
 * @global
 */
function jpublic(origclass, overrides) {
    if (!origclass._jpublic) {
        origclass._jpublic = overrides;
        return;
    }
    J.mixin(origclass._jpublic, overrides);
}
/**
 * @method jprotected
 * @global
 */
function jprotected(origclass, overrides) {
    if (!origclass._jpublic) {
        origclass._jpublic = overrides;
        return;
    }
    J.mixin(origclass._jpublic, overrides);
}
/**
 * @method jstatic
 * @global
 */
function jstatic(origclass, overrides) {
    var l = arguments.length;
    if (l == 1) {
        J.mixin(jstatic.caller._jstatic, origclass);
        return
    }
    if (!origclass._jstatic) {
        origclass._jstatic = overrides;
        return;
    }
    J.mixin(origclass._jstatic, overrides);
}

/**
 * @method joverride
 * @global
 */
function joverride(origclass, overrides) {
    if (J.isString(origclass)) {
        origclass = jclass(origclass);
    }
    if (!origclass) {
        throw new Error("[joverride] unrecognized orig class");
    }
    if (overrides) {
        var op = origclass.prototype;
        if (J.isFunction(overrides)) {
            overrides = overrides.apply(this);
        }

        J.mixin(op, overrides);

        /*if (J.isIE && overrides.hasOwnProperty('toString')) {
         p.toString = overrides.toString;
         }*/
    }

}


/**
 * @method jclass
 * @global
 */
function jclass() {
    var l = arguments.length,i = 0;
    if (l == 0) {
        throw new Error("[jclass] invalid arguments");
    }
    if (!J.isString(arguments[0])) {
        throw new Error("[jclass] class name must be string");
    }
    if (l == 1) {
        return jclass.caller && jclass.caller.$Define ? __cpackage__ && __cpackage__[name] ||
            J.importclass(arguments[0]) : J.nameclass(arguments[0]);
    }

    var clf = arguments[l - 1];


    var p;
    if (l >= 3) {
        var name = arguments[1];
        if (J.isString(name)) {
            p = __cpackage__ && __cpackage__[name] || J.importclass(name);
        } else {
            p = arguments[1];
        }
    } else {
        p = Object;
    }
    if (!p) {
        throw new Error("[jclass] unrecognized parent class");
    }
    var mixins = [];

    if (l >= 4) {
        var vs;
        var mc;
        J.each(J.toArray(arguments, 2, l - 1), function(v) {
            if (J.isString(v)) {
                vs = v.split(",");
                J.each(vs, function(v2) {
                    mc = J.importclass(v2);
                    if (mc) {
                        mixins.push(mc.prototype);
                    }

                });

            } else {
                mixins.push(v.prototype);
            }
        });
    }

    var cls = jextends(p, clf, mixins);


    if (arguments[0]) {
        cls.shortname = arguments[0];
        cls.classname = __npackage__ ? __npackage__ + "." + arguments[0] : arguments[0];
        __cpackage__[arguments[0]] = cls;
    }

    return cls;
}
/**
 * @method jnew
 * @global
 */
function jnew() {
    var l = arguments.length,i = 0;
    if (l == 0) return {};

    var args = J.toArray(arguments, 1);

    var name = arguments[0];

    var cls;
    if (J.isString(name)) {

        cls = jnew.caller && jnew.caller.$Define ?
            __cpackage__ && __cpackage__[name]
                || J.importclass(name) : J.nameclass(name);

        if (!cls) {
            throw new Error("[jnew] unrecognized class,use whole class name");
        }
    } else {
        cls = name;
    }

    if (l == 2) {
        return new cls(arguments[1]);
    }

    var c = cls.prototype.constructor;
    var constructor = function() {
        return c.apply(this, args);
    };

    constructor.prototype = cls.prototype;
    constructor.prototype.constructor = c;

    return new constructor();
}
/**
 * @method j
 * @global
 */
String.prototype.j = function() {
    var def, code;
    var hextends = false,hasclass = false,istatic = false;

    def = this.toString();

    if (arguments.length == 1) {
        code = arguments[0];
    }
    if (J.isArray(def)) {
        def = def.join(' ');
    }
    var defs = def.replace(/\s{1,}/g, ' ').split(/\s/);
    if (defs[0] == "static" && defs[1] == "class") {
        defs.shift();
        istatic = true;
    }
    var l = defs.length;
    if (l % 2 != 0) {
        throw new Error("[j] def error");
    }
    var args = [];

    for (var i = 0; i < l; i += 2) {
        switch (defs[i]) {
            case "package":
                args = J.toArray(arguments);
                args.unshift(defs[i + 1]);
                return jpackage.apply(this, args);
            case "import":
                return jimport.call(this, defs[i + 1]);
            case "static":
                istatic = true;
                args[0] = defs[i + 1];
                break;
            case "class":
                args[0] = defs[i + 1];
                hasclass = true;
                break;
            case "extends":
                hextends = true;
                args[1] = defs[i + 1];
                break;
            case "implements":
                args = args.concat(defs[i + 1].replace(/\s/).split(","));
                break;

        }
    }
    if (istatic && hasclass) {
        var name = args[0];
        if (args.length > 1) args.shift();
        __statics__[__npackage__ + "." + name] = [name,code,args];
        return;
    }
    if (istatic) {
        var c = __cpackage__[args[0]] = {};
        c.shortname = args[0];
        c.classname = __npackage__ ? __npackage__ + "." + args[0] : args[0];
        __gclasses__[c.classname] = c;
        if (args.length > 1) args.shift();
        J.importstatic(c, code, args);
        return c;
    }
    if (!hasclass) {
        args.unshift("");
    }
    if (!hextends && args.length > 1) {
        args.splice(1, 0, Object);
    }
    args.push(code);
    return jclass.apply(this, args);
}

function jsupercall(cls, method, args) {
    var sp = J.isString(cls) ? jsupercall.caller && jsupercall.caller.$Define ? J.importclass(cls) : J.nameclass(cls) : cls;
    return sp.superclass[method].apply(this, args);
}