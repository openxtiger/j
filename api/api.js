YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Jclass",
        "Opp",
        "jui.Component",
        "junit.BaseTemplate",
        "junit.JTemplate",
        "junit.MixedCollection",
        "junit.Observable",
        "junit.Observer",
        "junit.STemplate",
        "junit.Template"
    ],
    "modules": [
        "DOM_UNIT",
        "OOP",
        "jui",
        "junit"
    ],
    "allModules": [
        {
            "displayName": "DOM_UNIT",
            "name": "DOM_UNIT",
            "description": "对DOM的封装和一些常用的工具，主要包括dom的获取、样式、位置、模板、HTML创建、数据、事件等"
        },
        {
            "displayName": "jui",
            "name": "jui"
        },
        {
            "displayName": "junit",
            "name": "junit"
        },
        {
            "displayName": "OOP",
            "name": "OOP",
            "description": "The global namespace methods,Used to simulate the Java keyword.<br/>\n模拟Java的面向对象功能，在此次分别模拟了 package,class,extends,public,private,protected,static,import\n可以用以下形式定义类\n\n    'class C extends P implements I'.j(function(jsuper){\n\n          jstatic({\n              a:1\n          });\n\n          jpublic({\n              constructor: function () {\n                  this.jsuper();\n              },\n              echo:function(){\n                  console.log(this.jstatic.a);\n              }\n          });\n\n          jprotected({\n\n          });\n\n          jprivate({\n\n          });\n     },'alias class name');"
        }
    ]
} };
});