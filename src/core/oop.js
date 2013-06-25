(function ($) {

    function JClass() {
    }

    JClass.prototype = {
        jsuper: function (method, args) {
            if ($.isArray(method)) {
                args = method;
                method = 'constructor';
            }
            return this.superclass[method || 'constructor'].apply(this,
                args || $.toArray(this.jsuper.caller.arguments));
        }
    };
    var jclasses = {}, jwidgets = {}, jctrls = {}, jmodels = {}, jlogics = {};

    $.extend({
        nameclass: function (c) {
            if (__gclasses__[c]) return __gclasses__[c];
            var d = c.split(".");
            var o = window[d[0]] = window[d[0]] || {};
            $.each(d.slice(1, d.length - 1), function (v2) {
                o = o[v2] = o[v2] || {};
            });
            return __gclasses__[c] = o[d[d.length - 1]];
        },
        importstatic: function (c, code, args) {
            if ($.isFunction(code)) {
                code.$Static = c.$Static = c;
                code.call(c, c);
                delete code.$Static;
                delete c.$Static;
            } else {
                $.extend(c, code);
            }
            if (args && args.length > 0) {
                for (var i = 0, l = args.length; i < l; i++) {
                    $.extendIf(c, $.importclass(args[i]));
                }
            }
        },

        importclass: function (c) {
            if (__statics__[c]) {
                var ip;
                __gclasses__[c] = ip = $.namespace(c);
                ip.shortname = __statics__[c][0];
                ip.classname = c;
                $.importstatic(ip, __statics__[c][1], __statics__[c][2]);
                delete __statics__[c];
                return ip;
            }
            if (__gclasses__[c]) return __gclasses__[c];
            if (__iclasses__[c]) return __iclasses__[c];
            if (__importcs__[c]) return __importcs__[c];

            var d = c.split(".");
            var o = window[d[0]] = window[d[0]] || {};
            var name = d[d.length - 1];
            $.each(d.slice(1, d.length - 1), function (v2) {
                o = o[v2] = o[v2] || {};
            });
            if (o[name]) {
                o = __gclasses__[c] = o[name];
            } else {

                $.each(__imports__, function (i) {
                    return (!(o = i[name]));
                });

                __iclasses__[c] = o;
            }

            return o;
        },
        define: function (jclass, cls) {
            jclasses[jclass] = cls;
        },
        widget: function (id, c, defined) {
            if (defined) {
                return jwidgets[id] = c;
            }
            return new jwidgets[id](c);
        },
        create: function (config, defaultType) {
            var jclass = config.$;
            delete config.$;
            var c = jclasses[jclass || defaultType] || $.importclass(jclass);
            return new c(config);
        },
        ctrl: function (id, c) {
            if (arguments.length == 1) {
                return jctrls[id];
            }
            return jctrls[id] || (jctrls[id] = jclasses[id] && new jclasses[id]($.extend(c || {}, {id: id})));
        },
        model: function (id, c) {
            if (arguments.length == 1) {
                return jmodels[id];
            }
            return $.extend(jmodels[id] || {}, c);
        },
        logic: function (id, c) {
            if (arguments.length == 1) {
                return jlogics[id];
            }
            return $.extend(jlogics[id] || {}, c);
        }
    });

    var __cpackage__;  // current package object
    var __npackage__;  // current package name

    var __gclasses__ = {}; // save all class when be use

    var __iclasses__ = {};  // save then import class,when leave the package will be clean
    var __imports__ = [];   // save then import package/class,when leave the package will be clean

    var __importcs__ = {};  // save then import class

    var __statics__ = {}; // save the static class, when then first use class,will removed


    /**
     * The global namespace methods,Used to simulate the Java keyword.<br/>
     * 模拟Java的面向对象功能，在此次分别模拟了 package,class,extends,public,private,protected,static,import
     * 可以用以下形式定义类

     'class C extends P implements I'.j(function(jsuper){

           jstatic({
               a:1
           });

           jpublic({
               constructor: function () {
                   this.jsuper();
               },
               echo:function(){
                   console.log(this.jstatic.a);
               }
           });

           jprotected({

           });

           jprivate({

           });
      },'alias class name');

     * @module OOP
     * @class Opp
     */


    /**
     * Simulation of java package
     * @method jpackage
     * @static
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
        var l = arguments.length, i = 0;
        if (l == 0) return;
        var pkf = arguments[l - 1];
        pkf.$Define = true;

        if ($.isString(arguments[0])) {
            __cpackage__ = $.namespace(arguments[0]);
            __npackage__ = arguments[0];
            i = 1;
        } else {
            __cpackage__ = window;
            __npackage__ = '';
            i = 0;
        }
        var args = [], vs, ip;
        $.each($.toArray(arguments, i, l - 1), function (v) {
            if ($.isString(v)) {
                vs = v.split(";");
                $.each(vs, function (v2) {
                    if (v2.substr(-2) == ".*") {
                        ip = $.namespace(v2.substring(0, v2.length - 2));
                        __imports__.push(ip);
                        args.push(ip);
                    } else {
                        args.push($.importclass(v2));
                    }
                });
            } else if ($.isArray(v)) {
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

    window.jpackage = jpackage;
    /**
     * Simulation of java import
     * @method jimport
     * @static
     * @param {String|Object|Class} [imports]* import class or objects
     *
     *      For example:
     *      "foo.Foo;foo.*"
     *      "foo.Foo","foo.*"
     *      foo.Foo
     * @static
     * @global
     */
    function jimport() {
        var args = [], vs, ip;
        __imports__ = [];
        __iclasses__ = {};
        if (jimport.caller) {
            jimport.caller.$Define = true;
        }
        $.each(arguments, function (v) {
            if ($.isString(v)) {
                vs = v.split(";");
                $.each(vs, function (v2) {
                    if (!v2) return;
                    if (v2.substr(-2) == ".*") {
                        ip = $.namespace(v2.substring(0, v2.length - 2));
                        __imports__.push(ip);
                        args.push(ip);
                    } else {
                        ip = $.importclass(v2);
                        args.push(ip);
                        __importcs__[ip.shortname] = ip;
                    }
                });
            } else if ($.isArray(v)) {
                args = args.concat(v);
            } else {
                args.push(v);
            }
        });
        if (args.length == 1) return args[0];
        return args;
    }

    window.jimport = jimport;
    /**
     * Simulation of java extends
     * @method jextends
     * @static
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
        } else if ($.isArray(arguments[2])) {
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

        if ($.isString(sp)) {
            sp = $.importclass(sp);
        }
        var JClass = function () {
        };
        var sbp, spp = JClass.prototype = sp.prototype;
        if ($.isFunction(coverrides)) {
            var cc = coverrides;
            //
            cc.$Define = true;
            cc.$Public = {};
            cc.$Static = {};

            var c = cc.apply(this, [spp].concat(mixins));
            if (c) {
                coverrides = c;
            } else {
                coverrides = cc.$Public;
                coverrides.jstatic = cc.$Static;
            }

            delete cc.$Define;
            delete cc.$Public;
            delete cc.$Static;
            cc = null;
        }

        if (l == 2) {
            sb = coverrides.constructor != oc ? coverrides.constructor : function () {
                sp.apply(this, arguments);
            };
        }


        sbp = sb.prototype = new JClass();
        sbp.constructor = sbp.jstatic = sb;

        sbp.superclass = sb.superclass = sb.jsuper = spp;

        if (spp.constructor == oc) {
            spp.constructor = sp;
        }
        if (coverrides.jstatic) {
            $.extend(sb, coverrides.jstatic);
            delete coverrides.jstatic;
        }

        $.fn.extend(sb, coverrides);  // extend coverrides
        if (mixins.length) {
            for (var i = 0, len = mixins.length; i < len; i++) {
                $.extendIf(sbp, mixins[i]);
            }
        }

        return sb;
    }

    window.jextends = jextends;
    /**
     * Simulation of java priate
     * 模拟java的private关键字，J像c++的类定义一样，将类分为private:,public:等方块。方块定义的变量和方法对应相应的类作用域

      For example:
      jprivate({
          _i:100
      });

     * @method jprivate
     * @static
     * @param overrides {Object} 定义体，可以定义方法或变量
     * @global
     */
    function jprivate(overrides) {
        $.extend(jprivate.caller.$Public, overrides);
    }

    window.jprivate = jprivate;

    /**
     * Simulation of java public
     * 模拟java的public关键字，J像c++的类定义一样，将类分为private:,public:等方块。方块定义的变量和方法对应相应的类作用域

       For example:
       jpublic({
           i:100
       });

     * @method jpublic
     * @static
     * @param overrides {Object} 定义体，可以定义方法或变量
     * @global
     */
    function jpublic(overrides) {
        $.extend(jpublic.caller.$Public, overrides);
    }

    window.jpublic = jpublic;
    /**
     * Simulation of java protected
     * 模拟java的protected关键字，J像c++的类定义一样，将类分为private:,public:等方块。方块定义的变量和方法对应相应的类作用域

       For example:
       jprotected({
           i:100
       });

     * @method jprotected
     * @static
     * @param overrides {Object} 定义体，可以定义方法或变量
     * @global
     */
    function jprotected(overrides) {
        $.extend(jprotected.caller.$Public, overrides);
    }

    window.jprotected = jprotected;
    /**
     * Simulation of java static
     * 模拟java的static关键字，J像c++的类定义一样，将类分为private:,public:等方块。方块定义的变量和方法对应相应的类作用域

       For example:
       jstatic({
           I:100
       });

     * @method jstatic
     * @static
     * @param overrides {Object} 定义体，可以定义方法或变量
     * @global
     */
    function jstatic(overrides) {
        $.extend(jstatic.caller.$Static, overrides);
    }

    window.jstatic = jstatic;
    /**
     * @method joverride
     * @static
     * @global
     */
    function joverride(origclass, overrides) {
        if ($.isString(origclass)) {
            origclass = jclass(origclass);
        }
        if (!origclass) {
            throw new Error("[joverride] unrecognized orig class");
        }
        if (overrides) {
            var op = origclass.prototype;
            if ($.isFunction(overrides)) {
                overrides = overrides.apply(this);
            }

            $.extend(op, overrides);

            /*if ($.isIE && overrides.hasOwnProperty('toString')) {
             p.toString = overrides.toString;
             }*/
        }

    }

    window.joverride = joverride;

    /**
     * p1:String ==>class name
     * p2,String ==>same package;Object
     * p3,function ==>
     */
    /**
     * @method jclass
     * @static
     * @global
     */
    function jclass() {
        var l = arguments.length, i = 0;
        if (l == 0) {
            throw new Error("[jclass] invalid arguments");
        }
        if (!$.isString(arguments[0])) {
            throw new Error("[jclass] class name must be string");
        }
        if (l == 1) {
            return jclass.caller && jclass.caller.$Define ? __cpackage__ && __cpackage__[name] ||
                $.importclass(arguments[0]) : $.nameclass(arguments[0]);
        }

        var clf = arguments[l - 1];


        var p;
        if (l >= 3) {
            var name = arguments[1];
            if ($.isString(name)) {
                p = __cpackage__ && __cpackage__[name] || $.importclass(name);
            } else {
                p = arguments[1];
            }
        } else {
            p = JClass;
        }
        if (!p) {
            throw new Error("[jclass] unrecognized parent class");
        }
        var mixins = [];

        if (l >= 4) {
            var vs;
            var mc;
            $.each($.toArray(arguments, 2, l - 1), function (v) {
                if ($.isString(v)) {
                    vs = v.split(",");
                    $.each(vs, function (v2) {
                        mc = __cpackage__ && __cpackage__[v2] || $.importclass(v2);
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

    window.jclass = jclass;
    /**
     * @method jnew
     * @static
     * @global
     */
    function jnew() {
        var l = arguments.length, i = 0;
        if (l == 0) return {};

        var args = $.toArray(arguments, 1);

        var name = arguments[0];

        var cls;
        if ($.isString(name)) {
            cls = jnew.caller && jnew.caller.$Define ?
                __cpackage__ && __cpackage__[name]
                    || $.importclass(name) : $.nameclass(name);
            if (!cls) {
                throw new Error("[jnew] unrecognized class,use whole class name");
            }
        } else {
            cls = name;
        }

        switch (l) {
            case 1:
                return new cls();
            case 2:
                return new cls(arguments[1]);
            case 3:
                return new cls(arguments[1], arguments[2]);
        }


        var c = cls.prototype.constructor;
        var constructor = function () {
            return c.apply(this, args);
        };

        constructor.prototype = cls.prototype;
        constructor.prototype.constructor = c;

        return new constructor();
    }

    window.jnew = jnew;

    /**
     * 模拟Java的语法，用 'class C extends E implements I'.j() 实现。
     * @method j
     * @param fuc {Function} 类实现体
     * @param paras {String|Function} 如果是字符串，为类的别名，如果是函数，将会被定义成功后调用
     *
     * @global
     */
    String.prototype.j = function () {
        var def, code;
        var hextends = false, hasclass = false, istatic = false, isinner = false;

        def = this.toString();

        if (arguments.length >= 1) {
            code = arguments[0];
        }
        if ($.isArray(def)) {
            def = def.join(' ');
        }
        var defs = def.replace(/\s{1,}/g, ' ').split(/\s/);

        var l = defs.length;
        /*if (l % 2 != 0) {
         throw new Error("[$] def error");
         }*/
        var args = [];

        for (var i = 0; i < l; i += 2) {
            switch (defs[i]) {
                case "package":
                    args = $.toArray(arguments);
                    args.unshift(defs[i + 1]);
                    return jpackage.apply(this, args);
                case "import":
                    return jimport.call(this, defs[i + 1]);
                case "static":
                    istatic = true;
                    if (defs[i + 1] != "class") {
                        args[0] = defs[i + 1];
                    } else {
                        i--;
                    }
                    break;
                case "inner":
                    isinner = true;
                    i--;
                    break;
                case "app":
                    defs[i + 1].split(",").forEach(function (n) {
                        __apps__[n] = code;
                    });
                    return null;
                case "class":
                    if (!isinner && l > 1 && defs[i + 1] != 'extends' && defs[i + 1] != 'implements') {
                        args[0] = defs[i + 1];
                        hasclass = true;
                    } else {
                        i--;
                    }
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
            __statics__[__npackage__ + "." + name] = [name, code, args];
            return null;
        }
        if (istatic) {
            var c = __cpackage__[args[0]] = {};
            c.shortname = args[0];
            c.classname = __npackage__ ? __npackage__ + "." + args[0] : args[0];
            __gclasses__[c.classname] = c;
            if (args.length > 1) args.shift();
            $.importstatic(c, code, args);
            return c;
        }
        if (!hasclass) {
            args.unshift("");
        }
        if (!hextends && args.length > 1) {
            args.splice(1, 0, JClass);
        }
        args.push(code);
        var cls = jclass.apply(this, args);
        if (arguments.length > 1) {
            if ($.isFunction(arguments[1])) {
                arguments[1].call(cls, cls.prototype);
            } else {
                $.define(arguments[1], cls);
            }

        }
        return cls;
    };

    function jcall(jobject, method, scope, args) {
        if (jobject == scope) return null;
        if ($.isObject(method)) {
            args = scope;
            scope = method;
            method = 'constructor';
        }
        return jobject[method || 'constructor'].apply(scope || jobject,
            args || $.toArray(jcall.caller.arguments));
    }

    window.jcall = jcall;

})($);