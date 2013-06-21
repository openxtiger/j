/**
 * @pakcage junit
 */
'package junit'.j(function () {

    /**
     * @class junit.BaseTemplate
     */
    'class BaseTemplate'.j({
        constructor: function (html, args) {
            var me = this;
            $.extend(me, args);
            me.html = html;
            if (me.compiled) {
                me.compile();
            }
        },

        insertFirst: function (el, values) {
            return this.doInsert('afterBegin', el, values);
        },

        insertBefore: function (el, values) {
            return this.doInsert('beforeBegin', el, values);
        },

        insertAfter: function (el, values) {
            return this.doInsert('afterEnd', el, values);
        },

        append: function (el, values) {
            return this.doInsert('beforeEnd', el, values);
        },

        doInsert: function (where, el, values) {
            el = $.dom(el);
            return $.insertHtml(where, el, this.apply(values));
        },

        overwrite: function (el, values, returnElement) {
            el = $.dom(el);
            el.innerHTML = this.apply(values);
            return returnElement ? $.get(el.firstChild) : el.firstChild;
        }
    });

    /**
     * @class junit.STemplate
     */
    'class STemplate extends BaseTemplate'.j(function (jsuper) {
        var re = /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
            compileARe = /\\/g,
            compileBRe = /(\r\n|\n)/g,
            compileCRe = /'/g;
        //
        jpublic(jsuper, {
            apply: function (values) {
                var me = this;
                if (me.compiled) {
                    return me.compiled.call(this, values);
                }
                function fn(m, name, format, args) {
                    if (format) {
                        if (args) {
                            args = [values[name]].concat(Function.prototype.constructor.apply(Function.prototype,
                                'return [' + args + '];')());
                        } else {
                            args = [values[name]];
                        }
                        if (format.substr(0, 1) == "$") {
                            return $[format.substr(1)].apply($, args);
                        } else {
                            return me[format].apply(me, args);
                        }
                    }
                    else {
                        return values[name] !== undefined ? values[name] : "";
                    }
                }

                return me.html.replace(re, fn);
            },
            set: function (html, compile) {
                var me = this;
                me.html = html;
                me.compiled = null;
                return compile ? me.compile() : me;
            },
            compile: function () {
                var me = this,
                    body, bodyReturn;

                function fn(m, name, format, args) {
                    if (format) {
                        args = args ? ',' + args : "";
                        if (format.substr(0, 1) == "$") {
                            format = "$." + format.substr(1) + '(';
                        } else {
                            format = 'this.' + format + '(';
                        }
                    }
                    else {
                        args = '';
                        format = "(values['" + name + "'] == undefined ? '' : ";
                    }
                    return "'," + format + "values['" + name + "']" + args + ") ,'";
                }

                bodyReturn = me.html.replace(compileARe, '\\\\').replace(compileBRe, '\\n').
                    replace(compileCRe, "\\'").replace(re, fn);
                body = "this.compiled = function(values){ return ['" + bodyReturn + "'];};";
                eval(body);
                return me;
            }
        });


    });

    /**
     * @class junit.Template
     */
    'class Template extends BaseTemplate'.j(function (jsuper) {
        var codeRe = /\{\[((?:\\\]|.|\n)*?)\]\}/g,
            evalRe = /<%((?:\\\]|.|\n)*?)%>/g,
            re = /\{([\w\.#\$\-]+)(?::([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\\]\s?[\d\.\+\-\*\\\(\)]+)?\}/g;

        function applySubTemplate(id, values, parent, xindex, xcount) {
            var me = this,
                len,
                t = me.tpls[id],
                vs,
                buf = [];


            var compiled = t.compiled;
            if ((t.test && !t.test.call(me, values, parent, xindex, xcount)) ||
                (t.exec && t.exec.call(me, values, parent, xindex, xcount))) {
                if (!t.ecompiled) return '';
                compiled = t.ecompiled;
            }

            vs = t.target ? t.target.call(me, values, parent) : values;
            parent = t.target ? values : parent;
            len = vs.length;

            if (t.target && $.isArray(vs)) {
                $.each(vs, function (v, i) {
                    buf[buf.length] = compiled.call(me, v, parent, i + 1, len);
                });
                return buf.join('');
            }
            return compiled.call(me, vs, parent, xindex, xcount);
        }

        function compileTpl(tpl) {
            var body;

            function fn(m, name, format, args, math) {
                if (name.substr(0, 4) == 'xtpl') {
                    return "',applySubTemplate.call(this, " + name.substr(4) + ", values, parent, xindex, xcount),'";
                }
                var v;
                if (name === '.') {
                    v = 'values';
                } else if (name === '#') {
                    v = 'xindex';
                } else if (name === '$') {
                    v = 'xcount';
                } else if (name.substr(0, 2) == "..") {
                    v = 'parent' + name.substr(1);
                }
                else if (name.indexOf('.') != -1) {
                    v = "values." + name;
                } else {
                    v = "values['" + name + "']";
                }
                if (math) {
                    v = '(' + v + math + ')';
                }
                if (format) {
                    args = args ? ',' + args : "";
                    if (format.substr(0, 1) == "$") {
                        format = "$['" + format.substr(1) + "'](";
                    } else {
                        format = "this['" + format + "'](";
                    }
                } else {
                    args = '';
                    format = "(" + v + " === undefined ? '' : ";
                }
                return "'," + format + v + args + "),'";
            }

            function codeFn(m, code) {
                return "',(" + code.replace(/\\'/g, "'") + "),'";
            }

            function evalFn(m, code) {
                return "','" + code.replace(/\\'/g, "'") + "','";
            }

            var sbody = tpl.body.split("<else>");

            body = ["tpl.compiled = function(values, parent, xindex, xcount){ return ['"];
            body.push(sbody[0].replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'")
                .replace(re, fn).replace(codeRe, codeFn));
            body.push("'].join('');};");
            body = body.join('');
            eval(body);
            if (sbody.length > 1) {
                body = ["tpl.ecompiled = function(values, parent, xindex, xcount){ return ['"];
                body.push(sbody[1].replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'")
                    .replace(re, fn).replace(codeRe, codeFn));
                body.push("'].join('');};");
                body = body.join('');

                eval(body);
            }
            return this;
        }

        //
        jpublic(jsuper, {
            constructor: function () {
                this.jsuper();

                var me = this;
                var s = me.html,
                    re = /<tpl\b[^>]*>((?:(?=([^<]+))\2|<(?!tpl\b[^>]*>))*?)<\/tpl>/,
                    nameRe = /^<tpl\b[^>]*?for=['"](.*?)['"]/,
                    ifRe = /^<tpl\b[^>]*?if=['"](.*?)['"]/,
                    execRe = /^<tpl\b[^>]*?exec=['"](.*?)['"]/,
                    m,
                    id = 0,
                    tpls = [],
                    VALUES = 'values',
                    PARENT = 'parent',
                    XINDEX = 'xindex',
                    XCOUNT = 'xcount',
                    RETURN = 'return ',
                    WITHVALUES = 'with(values){ ';

                s = ['<tpl>', s, '</tpl>'].join('');

                while ((m = s.match(re))) {
                    var m2 = m[0].match(nameRe),
                        m3 = m[0].match(ifRe),
                        m4 = m[0].match(execRe),
                        exp = null,
                        fn = null,
                        exec = null,
                        name = m2 && m2[1] ? m2[1] : '';
                    if (m3) {
                        exp = m3 && m3[1] ? m3[1] : null;
                        if (exp) {
                            fn = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + RETURN + ($.htmlDecode(exp)) + '; }');
                        }
                    }
                    if (m4) {
                        exp = m4 && m4[1] ? m4[1] : null;
                        if (exp) {
                            exec = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + ($.htmlDecode(exp)) + '; }');
                        }
                    }
                    if (name) {
                        switch (name) {
                            case '.':
                                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + VALUES + '; }');
                                break;
                            case '..':
                                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + PARENT + '; }');
                                break;
                            default:
                                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + name + '; }');
                        }
                    }
                    tpls.push({
                        id: id,
                        target: name,
                        exec: exec,
                        test: fn,
                        body: m[1] || ''
                    });
                    s = s.replace(m[0], '{xtpl' + id + '}');
                    ++id;
                }
                $.each(tpls, function (t) {
                    compileTpl.call(me, t);
                });

                me.master = tpls[tpls.length - 1];
                me.tpls = tpls;
            },
            apply: function (values) {
                return this.master.compiled.call(this, values, {}, 1, 1);
            },

            compile: function () {
                return this;
            }
        });
    });

    /**
     * @class junit.JTemplate
     */
    'class JTemplate extends BaseTemplate'.j(function (jsuper) {
        var _cache = {};

        var KEYWORDS =
            'break,case,catch,continue,debugger,default,delete,do,else,false'
                + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
                + ',throw,true,try,typeof,var,void,while,with'

                + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
                + ',final,float,goto,implements,import,int,interface,long,native'
                + ',package,private,protected,public,short,static,super,synchronized'
                + ',throws,transient,volatile'

                + ',arguments,let,yield'

                + ',undefined';
        // reg , // ,
        var REMOVE_RE = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[$\w]+(?:\.[\w]+)+|_[$\w]+/g;
        var SPLIT_RE = /[^\w$]+/g;
        var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
        var NUMBER_RE = /\b\d[^,]*/g;
        var BOUNDARY_RE = /^,+|,+$/g;
        var getVariable = function (code) {
            code = code
                .replace(REMOVE_RE, '')
                .replace(SPLIT_RE, ',')
                .replace(KEYWORDS_RE, '')
                .replace(NUMBER_RE, '')
                .replace(BOUNDARY_RE, '');
            code = code ? code.split(/,+/) : [];

            return code;
        };

        var isNewEngine = ''.trim;// '__proto__' in {}
        var replaces = isNewEngine
            ? ["__='';", "__+=", ";", "__"]
            : ["__=[];", "__.push(", ");", "__.join('')"];

        var concat = isNewEngine
            ? "if(content!==undefined){__+=content;return content}"
            : "__.push(content);";

        var print = "function(content){" + concat + "}";

        var include = "function(id,data){"
            + "if(data===undefined){data=jdata};"
            + "var content = jthis.jstatic.apply(id,data);"
            + concat
            + "}";

        function html(code, jthis) {


            if (jthis.jstatic.isCompress) {
                code = code.replace(/[\n\r\t\s]+/g, ' ');
            }

            code = code
                .replace(/('|\\)/g, '\\$1')
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n');

            code = replaces[1] + "'" + code + "'" + replaces[2];

            return code + '\n';
        }

        function logic(code, jthis, getKey) {

            if (jthis.jstatic.parser) {
                code = jthis.jstatic.parser(code);
                if (!$.isArray(code)) {
                    return code[0];
                }
            }

            //#inlude
            if (code.indexOf('#') === 0) {
                code = jthis.jstatic.include(code.substr(1));
                jthis.variables += code[0];
                return code[1] + '\n';
            }
            if (code.indexOf('!') === 0) {
                jthis.variables += code.substr(1) + ",";
                return '';
            }
            if (code.indexOf('@') === 0) {
                return code.substr(1) + '\n';
            }

            //  <%=value%> <%==value%>
            if (code.indexOf('=') === 0) {

                var isEscape = code.indexOf('==') !== 0;

                code = code.replace(/^=*|[\s;]*$/g, '');

                if (isEscape && jthis.jstatic.isEscape) {

                    var name = code.replace(/\s*\([^\)]+\)/, '');
                    code = '_$$(_$(' + code + '))';

                } else {
                    code = '_$(' + code + ')';
                }

                code = replaces[1] + code + replaces[2];

            }
            getKey(code);

            return code + '\n';
        }

        function setValue(name, jthis) {
            var value;
            switch (name) {
                case "$":
                    return;
                case "print":
                    value = print;
                    break;
                case "include":
                    value = include;
                    break;
                default :
                    if (name.indexOf('$') === 0) {
                        value = 'jthis["' + name.substr(1) + '"]';
                    } else {
                        value = 'jdata["' + name + '"]';
                    }
            }

            jthis.variables += name + '=' + value + ',';
        }

        //
        jstatic(jsuper, {
            getHTML: function (id) {
                return document.getElementById(id).innerHTML;
            },
            openTag: "<%", closeTag: "%>", isCompress: false, isEscape: false,
            keywords: {
                'if': function (code) {
                    return 'if(' + code + '){';
                },
                'else': function (code) {
                    code = code.split(' ');

                    if (code.shift() === 'if') {
                        code = ' if(' + code.join(' ') + ')';
                    } else {
                        code = '';
                    }

                    return '}else' + code + '{';
                },

                '/if': function () {
                    return '}';
                },
                'each': function (code) {

                    code = code.split(' ');

                    var object = code[0] || 'jdata';
                    var value = code[1] || '_v';
                    var index = code[2] || '_i';

                    var args = value + ',' + index;

                    return '$.each(' + object + ',function(' + args + '){';
                },

                '/each': function () {
                    return '});';
                }
            },
            parser: function (code) {
                code = code.replace(/^\s/, '');
                var args = code.split(' ');
                var key = args.shift();
                var keywords = this.keywords;
                var fuc = keywords[key];
                if (fuc && keywords.hasOwnProperty(key)) {
                    args = args.join(' ');
                    code = fuc.call(code, args);
                }
                return code;
            },
            get: function (id, check) {
                var c = _cache[id];
                if (!c && !check) {
                    c = new this(this.getHTML(id), {id: id});
                }
                return c;
            },
            apply: function (id, data) {
                return this.get(id).apply(data);
            },
            include: function (id) {
                return this.get(id).get();
            }
        });

        //
        jprotected(jsuper, {
            __$: function (content) {
                return typeof content === 'string'
                    ? content.replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
                    return {
                        "<": "&#60;",
                        ">": "&#62;",
                        '"': "&#34;",
                        "'": "&#39;",
                        "&": "&#38;"
                    }[s];
                })
                    : content;
            },
            _$: function (value) {

                if (typeof value === 'string' || typeof value === 'number') {
                    return value;
                } else if (typeof value === 'function') {
                    return value();
                } else {
                    return '';
                }

            }
        });
        //
        jpublic(jsuper, {
            constructor: function () {
                this.jsuper();
                this.variables = '';
                if (!this.html && this.id) {
                    this.html = this.jstatic.getHTML(this.id);
                }
                this.compile(this.html);
            },
            apply: function (values) {
                return this.compiled.call(this, values);
            },
            get: function () {
                return [this.variables, this.code];
            },
            debug: function () {
                console.log("variables:" + this.variables);
                console.log("code:" + this.code);
                return this;
            },
            compile: function (source) {
                var openTag = this.jstatic.openTag;
                var closeTag = this.jstatic.closeTag;


                var code = source;
                var tempCode = '';
                var jthis = this;

                var uniq = {jthis: true, jdata: true};

                function getKey(code) {
                    code = getVariable(code);
                    //console.log(code);
                    $.each(code, function (name) {
                        if (!uniq.hasOwnProperty(name)) {
                            setValue(name, jthis);
                            uniq[name] = true;
                        }
                    });
                }

                $.each(code.split(openTag), function (code, i) {
                    code = code.split(closeTag);

                    var $0 = code[0];
                    var $1 = code[1];

                    // code: [html]
                    if (code.length === 1) {

                        tempCode += html($0, jthis);

                        // code: [logic, html]
                    } else {

                        tempCode += logic($0, jthis, getKey);

                        if ($1) {
                            tempCode += html($1, jthis);
                        }
                    }


                });


                code = tempCode;

                this.code = code;

                code = "'use strict';var jthis=this,_$=jthis['_$'],__$=jthis['__$'],"
                    + jthis.variables + replaces[0] + code
                    + 'return ' + replaces[3];

                if (this.jstatic.debug) {
                    console.log(code);
                }

                this.compiled = new Function('jdata', code);
                if (this.id) {
                    _cache[this.id] = this;
                }

            }
        });
    });


});