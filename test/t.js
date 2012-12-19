var jui = {};

/**
 * @package j.unit
 */
'package j.unit'
    .j(function() {

    /**
     * @class j.unit.Observable
     */
    'class Observable'
        .j(function(jsuper) {
        return {

            constructor:function() {
                console.log("Observable");
            }


        }

    });
});


/**
 * @pakcage jui
 */
'package jui'
    .j(function() {

    'import j.unit.Observable'.j();

    /**
     *@class jui.Component
     */
    'class Component'
        .j({
        constructor:function() {

        },
        show:function() {
            console.log("Component");
        }
    });

    /**
     * @class jui.Container
     * @extends jui.Component
     * @implements j.unit.Observable
     */
    'class Container extends Component implements Observable'
        .j(function(jsuper, ob) {
        var i = 0;
        jstatic(jsuper, {
            a:1
        });

        jpublic(jsuper, {
            _i:0,
            constructor:function() {
                var jthis = this;
                jsuper.constructor.call(this);
                ob.constructor.call(this);
                console.log("public static a=" + jthis.constructor.a++);
                console.log("public static jstatic.a=" + jthis.jstatic.a++);
                console.log("private static i=" + i++);
                console.log("private  i=" + this._i++);
            }
        });


    });
});


var x = jnew("jui.Container");
//console.dir(x);
x = jnew("jui.Container", 1);
//console.dir(x);
x.show();

/*var b = J.get("a").dom();
 console.dir(J.get(b) == J.get(b));*/

J('#a').on("click", function() {
    J(this).toggleClass("c");
});

var a = J("div[id]");
console.log(
    a.attr("xxxx", "bbb").query("div").attr("cccc", "cc").css("color", "#ff0000")
        .css("font-size:20px;color:#0000ff", true)
        .css({'fontSize':"30px",'backgroundColor':"#00ff00"}).attr("style")/*.back().attr("xxxx", null)*/
);

J("input").set({style:"font-size:20px;color:#ff0000",like:1}).val("gggggggg");

