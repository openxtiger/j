J.extend(function(J) {
    function jsontohtml(o) {

    }

}(J));

J().extend(function(J) {
    var propCache = {};

    function camelFn(m, a) {
        return a.charAt(1).toUpperCase();
    }

    function evalProp(prop) {
        return propCache[prop] || (propCache[prop] = prop.replace(/(-[a-z])/gi, camelFn));
    }

    return  {
        set : function(o) {
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
        html:function(value) {
            var elem = this[0] || {},i = 0,
                l = this.length;
            if (value === undefined && l) {
                return elem.nodeType === 1 ? elem.innerHTML : undefined;
            }
            if (J.isFunction(value)) {
                return this.html(value.call(this));
            }
            if (J.isString(value)) {
                try {
                    this.each(function(e) {
                        if (e.nodeType === 1) {
                            e.innerHTML = value;
                        }
                    });
                } catch(e) {

                }
            } else {

            }
            return this;

        },

        attr:function(name, value) {
            var elem = this[0] || {},
                l = this.length,nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return undefined;
            }
            if (value === undefined && l) {
                return elem.getAttribute(name);
            }
            if (J.isFunction(value)) {
                return this.attr(name, value.call(this));
            }

            var m = value == null ? "removeAttribute" : "setAttribute";
            return this.each(function() {
                this[m](name, value + "");
            });

        },
        prop:function(name, value) {
            var elem = this[0] || {},
                l = this.length,nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return undefined;
            }

            if (value === undefined && l) {
                return elem[name];
            }
            if (value == null) {
                return this.each(function() {
                    this[name] = undefined;
                    delete this[name];
                });
            } else {
                if (J.isFunction(value)) {
                    return this.prop(name, value.call(this));
                }
                return this.each(function() {
                    this[name] = value;
                });
            }
        },
        css:function(name, value) {
            var l = this.length ,el = this[0] || {};
            if (J.isFunction(value)) {
                return this.css(name, value.call(this));
            }
            if (J.isObject(name)) {
                this.each(function() {
                    J.mixin(this.style, name);
                });
                return this;
            }
            if (value === undefined && l) {
                var m,cs;
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
                return el.style[name] || ((cs = el.currentStyle) ? cs[name] : null);
            }
            if (J.isString(name) && value === true) {
                name = name.trim().split(/\s*(?::|;)\s*/);
                var tmp = {};
                for (var i = 0,len = name.length; i < len;) {
                    tmp[evalProp(name[i++])] = name[i++];
                }
                return this.css(tmp);
            }

            return this.each(function() {
                this.style[evalProp(name)] = value;
            });


        },
        val: function(value) {
            var elem = this[0],l = this.length;
            if (!arguments.length) {
                if (elem) {
                    return elem.value;
                }
            }
            return this.each(function() {
                this.value = value;
            });

        },
        addClass : function(value) {
            var classNames, i, l, elem,
                setClass, c, cl;

            classNames = value.split(/\s+/);
            for (i = 0,l = this.length; i < l; i++) {
                elem = this[ i ];

                if (elem.nodeType === 1) {
                    if (!elem.className && classNames.length === 1) {
                        elem.className = value;

                    } else {
                        setClass = " " + elem.className + " ";

                        for (c = 0,cl = classNames.length; c < cl; c++) {
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
        removeClass: function(value) {
            var removes, className, elem, c, cl, i, l;

            removes = ( value || "" ).split(/\s+/);

            for (i = 0,l = this.length; i < l; i++) {
                elem = this[ i ];
                if (elem.nodeType === 1 && elem.className) {

                    className = (" " + elem.className + " ");

                    for (c = 0,cl = removes.length; c < cl; c++) {
                        while (className.indexOf(" " + removes[ c ] + " ") >= 0) {
                            className = className.replace(" " + removes[ c ] + " ", " ");
                        }
                    }
                    elem.className = value ? className.trim() : "";
                }
            }

            return this;
        },
        toggleClass : function(value) {
            var className = " " + value + " ",i = 0,
                l = this.length,c;

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
        hasClass: function(value) {
            var className = " " + value + " ",
                i = 0,
                l = this.length;

            for (; i < l; i++) {
                if (this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(className) >= 0) {
                    return true;
                }
            }

            return false;
        }
    }
}(J));
