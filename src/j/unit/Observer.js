/**
 * @pakcage j.unit
 */
'package j.unit'
    .j(function() {

    /**
     * @static
     * @class Observer
     */
    'static class Observer'
        .j(function(jthis) {
        jstatic({
            addObserver:function(eventType, handler) {
                eventType = "on" + eventType;
                if (!this._events) {
                    this._events = {};
                }
                if (!this._events[eventType]) {
                    this._events[eventType] = [];
                }

                var handlers = this._events[eventType];
                var length = handlers.length;
                var index = -1;

                for (var i = 0; i < length; i++) {
                    if (handlers[i] === handler) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) {
                    handlers.push(handler);
                }
            },
            removeObserver:function(eventType, handler) {
                var i,
                    j,
                    handlers,
                    length,
                    events = this._events;
                if (handler) {
                    if (events) {
                        eventType = "on" + eventType;
                        handlers = events[eventType];
                        if (handlers) {
                            length = handlers.length;
                            for (i = 0; i < length; i++) {
                                if (handlers[i] == handler) {
                                    handlers[i] = null;
                                    handlers.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                } else if (eventType) {
                    if (events) {
                        eventType = "on" + eventType;
                        handlers = events[eventType];
                        if (handlers) {
                            length = handlers.length;
                            for (i = 0; i < length; i++) {
                                handlers[i] = null;
                            }
                            delete events[eventType];
                        }

                    }
                }
            },
            notifyObserver:function(eventType) {
                var handlers,i,args = J.toArray(arguments);

                eventType = "on" + eventType;

                if (this._events && this._events[eventType]) {
                    handlers = this._events[eventType];
                    if (handlers.length > 0) {
                        for (i = 0; i < handlers.length; i++) {
                            handlers[i].apply(this, args);
                        }
                        return true;
                    }
                } else {
                    return false;
                }
            }
        });

    });
});