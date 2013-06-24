/**
 * @pakcage junit
 * @module junit
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
                if ($.isArray(code)) {
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
            openTag: "[#", closeTag: "#]", isCompress: false, isEscape: false,
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
                return  this.compiled.call(this, values);
            },
            get: function () {
                return [this.variables, this.code];
            },
            toString: function () {
                return this.code;
            },
            debug: function () {
                console.log("variables:" + this.variables);
                console.log("code:" + this.code);
                return this;
            },
            compile: function (source) {
                var openTag = this.jstatic.openTag;
                var closeTag = this.jstatic.closeTag;


                var code = source.replace(/<!--[^~]*?-->/g,"");
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
                    + jthis.variables + replaces[0] + ' try{' + code + '}catch(e){jthis.jstatic.debug && console.error(e.message)}'
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