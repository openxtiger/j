/**
 * @package junit
 * @module junit
 */
'package junit'.j(function () {

    /**
     * @class junit.Observable
     */
    'class Observable'.j({
        /**
         * @constructor
         * @param config
         */
        hidden:true,
        constructor: function (config) {
            var jthis = this;
            $.extend(jthis, config);
            if (jthis.listeners) {
                jthis.on(jthis.listeners);
                delete jthis.listeners;
            }
            jthis.events = jthis.events || {};
        },
        fireEvent: function () {
            var a = $.toArray(arguments),
                ename = a[0].toLowerCase(),
                me = this,
                ret = true,
                ce = me.events[ename],
                q,
                c;
            if (me.eventsSuspended === true) {
                if (q = me.eventQueue) {
                    q.push(a);
                }
            }
            else if ($.isObject(ce) && ce.bubble) {
                if (ce.fire.apply(ce, a.slice(1)) === false) {
                    return false;
                }
                c = me.getBubbleTarget && me.getBubbleTarget();
                if (c && c.enableBubble) {
                    if (!c.events[ename] || !Ext.isObject(c.events[ename]) || !c.events[ename].bubble) {
                        c.enableBubble(ename);
                    }
                    return c.fireEvent.apply(c, a);
                }
            }
            else {
                if ($.isObject(ce)) {
                    a.shift();
                    ret = ce.fire.apply(ce, a);
                }
            }
            return ret;
        },
        addEvents: function (o) {
            var me = this;
            me.events = me.events || {};
            if ($.isString(o)) {
                var a = arguments,
                    i = a.length;
                while (i--) {
                    me.events[a[i]] = me.events[a[i]] || true;
                }
            } else {
                J.extendIf(me.events, o);
            }
        }

    });
});