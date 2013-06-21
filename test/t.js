/*
'class Container extends Component implements Observable'
    .j(function (jsuper, ob) {
        var i = 0;
        jstatic(jsuper, {
            a: 1
        });

        jpublic(jsuper, {
            _i: 0,
            constructor: function () {
                var jthis = this;
                jsuper.constructor.call(this);
                ob.constructor.call(this);
                console.log("public static a=" + jthis.constructor.a++);
                console.log("public static jstatic.a=" + jthis.jstatic.a++);
                console.log("private static i=" + i++);
                console.log("private  i=" + this._i++);
            }
        });


    });*/
