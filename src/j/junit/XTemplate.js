/**
 * @pakcage junit
 * @module junit
 */
'package junit'.j(function () {

    /**
     * @class junit.STemplate
     */
    'class STemplate extends BaseTemplate'.j(function (jsuper) {
        var re = /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
            compileARe = /\\/g,
            compileBRe = /(\r\n|\n)/g,
            compileCRe = /'/g;
        //
        jpublic({
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
        jpublic({
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

});