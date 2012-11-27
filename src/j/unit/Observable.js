/**
 * package j.unit
 */
'pakcage j.unit'
    .j(function() {

    /**
     * @class j.unit.Observable
     */
    'class Observable'
        .j({
        /**
         * @constructor
         * @param config
         */
        constructor:function(config) {
            var jthis = this;

            J.mixin(jthis, config);
            if (jthis.listeners) {
                jthis.on(jthis.listeners);
                delete jthis.listeners;
            }
            jthis.events = jthis.events || {};
        }

    });
});