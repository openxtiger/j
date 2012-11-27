J().extend(function(J) {
    var rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
        onespace = /\s{2}/g;

    function add(elem, types, handler, data, selector) {

        var elemData, eventHandle, events,
            t, tns, type, namespaces, handleObj,
            handleObjIn, handlers, special;

        // Don't attach events to noData or text/comment nodes (allow plain objects tho)
        if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler) {
            return;
        }

        // Caller can pass in an object of custom data in lieu of the handler
        if (handler.handler) {
            handleObjIn = handler;
            handler = handleObjIn.handler;
            selector = handleObjIn.selector;
        }

        // Make sure that the handler has a unique ID, used to find/remove it later
        /*if (!handler.guid) {
         handler.guid = jQuery.guid++;
         }*/

        // Init the element's event structure and main handler, if this is the first
        /*events = elemData.events;
         if (!events) {
         elemData.events = events = {};
         }
         eventHandle = elemData.handle;
         if (!eventHandle) {
         elemData.handle = eventHandle = function(e) {
         // Discard the second event of a jQuery.event.trigger() and
         // when an event is called after a page has unloaded
         return dispatch.apply(eventHandle.elem, arguments);
         };
         // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
         eventHandle.elem = elem;
         }*/

        // Handle multiple events separated by a space
        types = types.replace(onespace, ' ').split(' ');
        for (t = 0; t < types.length; t++) {

            tns = rtypenamespace.exec(types[t]) || [];
            type = tns[1];
            namespaces = ( tns[2] || "" ).split(".").sort();

            // If event changes its type, use the special event handlers for the changed type
            //special = jQuery.event.special[ type ] || {};

            // If selector defined, determine special event api type, otherwise given type
            //type = ( selector ? special.delegateType : special.bindType ) || type;

            // Update special based on newly reset type
            //special = jQuery.event.special[ type ] || {};

            // handleObj is passed to all event handlers
            /*handleObj = J.mixin({
                type: type,
                origType: tns[1],
                data: data,
                handler: handler,
                guid: handler.guid,
                selector: selector,
                //needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                namespace: namespaces.join(".")
            }, handleObjIn);*/

            // Init the event handler queue if we're the first
            /*handlers = events[ type ];
            if (!handlers) {
                handlers = events[ type ] = [];
                handlers.delegateCount = 0;

                // Only use addEventListener/attachEvent if the special events handler returns false
                *//*if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                 // Bind the global event handler to the element

                 }*//*


            }*/

            if (elem.addEventListener) {
                elem.addEventListener(type, handler, false);

            } else if (elem.attachEvent) {
                elem.attachEvent("on" + type, handler);
            }

            /*if (special.add) {
             special.add.call(elem, handleObj);

             if (!handleObj.handler.guid) {
             handleObj.handler.guid = handler.guid;
             }
             }

             // Add to the element's handler list, delegates in front
             if (selector) {
             handlers.splice(handlers.delegateCount++, 0, handleObj);
             } else {
             handlers.push(handleObj);
             }

             // Keep track of which events have ever been used, for event optimization
             jQuery.event.global[ type ] = true;*/
        }

        // Nullify elem to prevent memory leaks in IE
        elem = null;
    }


    function dispatch(event) {

        // Make a writable jQuery.Event from the native event object
        event = jQuery.event.fix(event || window.event);

        var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
            handlers = ( (jQuery._data(this, "events") || {} )[ event.type ] || []),
            delegateCount = handlers.delegateCount,
            args = core_slice.call(arguments),
            run_all = !event.exclusive && !event.namespace,
            special = jQuery.event.special[ event.type ] || {},
            handlerQueue = [];

        // Use the fix-ed jQuery.Event rather than the (read-only) native event
        args[0] = event;
        event.delegateTarget = this;

        // Call the preDispatch hook for the mapped type, and let it bail if desired
        if (special.preDispatch && special.preDispatch.call(this, event) === false) {
            return;
        }

        // Determine handlers that should run if there are delegated events
        // Avoid non-left-click bubbling in Firefox (#3861)
        if (delegateCount && !(event.button && event.type === "click")) {

            for (cur = event.target; cur != this; cur = cur.parentNode || this) {

                // Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
                if (cur.disabled !== true || event.type !== "click") {
                    selMatch = {};
                    matches = [];
                    for (i = 0; i < delegateCount; i++) {
                        handleObj = handlers[ i ];
                        sel = handleObj.selector;

                        if (selMatch[ sel ] === undefined) {
                            selMatch[ sel ] = handleObj.needsContext ?
                                jQuery(sel, this).index(cur) >= 0 :
                                jQuery.find(sel, this, null, [ cur ]).length;
                        }
                        if (selMatch[ sel ]) {
                            matches.push(handleObj);
                        }
                    }
                    if (matches.length) {
                        handlerQueue.push({ elem: cur, matches: matches });
                    }
                }
            }
        }

        // Add the remaining (directly-bound) handlers
        if (handlers.length > delegateCount) {
            handlerQueue.push({ elem: this, matches: handlers.slice(delegateCount) });
        }

        // Run delegates first; they may want to stop propagation beneath us
        for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
            matched = handlerQueue[ i ];
            event.currentTarget = matched.elem;

            for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
                handleObj = matched.matches[ j ];

                // Triggered event must either 1) be non-exclusive and have no namespace, or
                // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

                    event.data = handleObj.data;
                    event.handleObj = handleObj;

                    ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                        .apply(matched.elem, args);

                    if (ret !== undefined) {
                        event.result = ret;
                        if (ret === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
        }

        // Call the postDispatch hook for the mapped type
        if (special.postDispatch) {
            special.postDispatch.call(this, event);
        }

        return event.result;
    }

    var _event = {



        global: {},

        // Detach an event or set of events from an element
        remove: function(elem, types, handler, selector, mappedTypes) {

            var t, tns, type, origType, namespaces, origCount,
                j, events, special, eventType, handleObj,
                elemData = jQuery.hasData(elem) && jQuery._data(elem);

            if (!elemData || !(events = elemData.events)) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = (types || "").replace(/\s{2}/, ' ').split(' ');
            for (t = 0; t < types.length; t++) {
                tns = rtypenamespace.exec(types[t]) || [];
                type = origType = tns[1];
                namespaces = tns[2];

                // Unbind all events (on this namespace, if provided) for the element
                /*if (!type) {
                 for (type in events) {
                 jQuery.event.remove(elem, type + types[ t ], handler, selector, true);
                 }
                 continue;
                 }*/

                special = jQuery.event.special[ type ] || {};
                type = ( selector ? special.delegateType : special.bindType ) || type;
                eventType = events[ type ] || [];
                origCount = eventType.length;
                namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

                // Remove matching events
                for (j = 0; j < eventType.length; j++) {
                    handleObj = eventType[ j ];

                    if (( mappedTypes || origType === handleObj.origType ) &&
                        ( !handler || handler.guid === handleObj.guid ) &&
                        ( !namespaces || namespaces.test(handleObj.namespace) ) &&
                        ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector )) {
                        eventType.splice(j--, 1);

                        if (handleObj.selector) {
                            eventType.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if (eventType.length === 0 && origCount !== eventType.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }

                    delete events[ type ];
                }
            }

            // Remove the expando if it's no longer used
            if (jQuery.isEmptyObject(events)) {
                delete elemData.handle;

                // removeData also checks for emptiness and clears the expando if empty
                // so use it instead of delete
                jQuery.removeData(elem, "events", true);
            }
        },

        // Events that are safe to short-circuit if no handlers are attached.
        // Native DOM events should not be added, they may have inline handlers.
        customEvent: {
            "getData": true,
            "setData": true,
            "changeData": true
        },

        trigger: function(event, data, elem, onlyHandlers) {
            // Don't do events on text and comment nodes
            if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
                return;
            }

            // Event object or event type
            var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
                type = event.type || event,
                namespaces = [];

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            if (rfocusMorph.test(type + jQuery.event.triggered)) {
                return;
            }

            if (type.indexOf("!") >= 0) {
                // Exclusive events trigger only for the exact event (no namespaces)
                type = type.slice(0, -1);
                exclusive = true;
            }

            if (type.indexOf(".") >= 0) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }

            if ((!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ]) {
                // No jQuery handlers for this event type, and it can't have inline handlers
                return;
            }

            // Caller can pass in an Event, Object, or just an event type string
            event = typeof event === "object" ?
                // jQuery.Event object
                event[ jQuery.expando ] ? event :
                    // Object literal
                    new jQuery.Event(type, event) :
                // Just the event type (string)
                new jQuery.Event(type);

            event.type = type;
            event.isTrigger = true;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            ontype = type.indexOf(":") < 0 ? "on" + type : "";

            // Handle a global trigger
            if (!elem) {

                // TODO: Stop taunting the data cache; remove global events and always attach to document
                cache = jQuery.cache;
                for (i in cache) {
                    if (cache[ i ].events && cache[ i ].events[ type ]) {
                        jQuery.event.trigger(event, data, cache[ i ].handle.elem, true);
                    }
                }
                return;
            }

            // Clean up the event in case it is being reused
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data != null ? jQuery.makeArray(data) : [];
            data.unshift(event);

            // Allow special events to draw outside the lines
            special = jQuery.event.special[ type ] || {};
            if (special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }

            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            eventPath = [
                [ elem, special.bindType || type ]
            ];
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

                bubbleType = special.delegateType || type;
                cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                for (old = elem; cur; cur = cur.parentNode) {
                    eventPath.push([ cur, bubbleType ]);
                    old = cur;
                }

                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if (old === (elem.ownerDocument || document)) {
                    eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
                }
            }

            // Fire handlers on the event path
            for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {

                cur = eventPath[i][0];
                event.type = eventPath[i][1];

                handle = ( jQuery._data(cur, "events") || {} )[ event.type ] && jQuery._data(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }
                // Note that this is a bare JS function and not a jQuery handler
                handle = ontype && cur[ ontype ];
                if (handle && jQuery.acceptData(cur) && handle.apply && handle.apply(cur, data) === false) {
                    event.preventDefault();
                }
            }
            event.type = type;

            // If nobody prevented the default action, do it now
            if (!onlyHandlers && !event.isDefaultPrevented()) {

                if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) &&
                    !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Can't use an .isFunction() check here because IE6/7 fails that test.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    // IE<9 dies on focus/blur to hidden element (#1486)
                    if (ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {

                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = elem[ ontype ];

                        if (old) {
                            elem[ ontype ] = null;
                        }

                        // Prevent re-triggering of the same event, since we already bubbled it above
                        jQuery.event.triggered = type;
                        elem[ type ]();
                        jQuery.event.triggered = undefined;

                        if (old) {
                            elem[ ontype ] = old;
                        }
                    }
                }
            }

            return event.result;
        },



        // Includes some event props shared by KeyEvent and MouseEvent
        // *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

        fixHooks: {},

        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(event, original) {

                // Add which for key events
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                return event;
            }
        },

        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(event, original) {
                var eventDoc, doc, body,
                    button = original.button,
                    fromElement = original.fromElement;

                // Calculate pageX/Y if missing and clientX/Y available
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                    event.pageY = original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
                }

                // Add relatedTarget, if necessary
                if (!event.relatedTarget && fromElement) {
                    event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                }

                // Add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                if (!event.which && button !== undefined) {
                    event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                }

                return event;
            }
        },

        fix: function(event) {
            if (event[ jQuery.expando ]) {
                return event;
            }

            // Create a writable copy of the event object and normalize some properties
            var i, prop,
                originalEvent = event,
                fixHook = jQuery.event.fixHooks[ event.type ] || {},
                copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

            event = jQuery.Event(originalEvent);

            for (i = copy.length; i;) {
                prop = copy[ --i ];
                event[ prop ] = originalEvent[ prop ];
            }

            // Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
            if (!event.target) {
                event.target = originalEvent.srcElement || document;
            }

            // Target should not be a text node (#504, Safari)
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }

            // For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
            event.metaKey = !!event.metaKey;

            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },

        special: {
            load: {
                // Prevent triggered image.load events from bubbling to window.load
                noBubble: true
            },

            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },

            beforeunload: {
                setup: function(data, namespaces, eventHandle) {
                    // We only want to do this special case on windows
                    if (jQuery.isWindow(this)) {
                        this.onbeforeunload = eventHandle;
                    }
                },

                teardown: function(namespaces, eventHandle) {
                    if (this.onbeforeunload === eventHandle) {
                        this.onbeforeunload = null;
                    }
                }
            }
        },

        simulate: function(type, elem, event, bubble) {
            // Piggyback on a donor event to simulate a different one.
            // Fake originalEvent to avoid donor's stopPropagation, but if the
            // simulated event prevents default then we do the same on the donor.
            var e = jQuery.extend(
                new jQuery.Event(),
                event,
                { type: type,
                    isSimulated: true,
                    originalEvent: {}
                }
            );
            if (bubble) {
                jQuery.event.trigger(e, null, elem);
            } else {
                jQuery.event.dispatch.call(elem, e);
            }
            if (e.isDefaultPrevented()) {
                event.preventDefault();
            }
        }
    };

    return {

        on: function(types, selector, data, fn, /*INTERNAL*/ one) {
            var origFn, type;

            // Types can be a map of types/handlers
            if (typeof types === "object") {
                // ( types-Object, selector, data )
                if (typeof selector !== "string") { // && selector != null
                    // ( types-Object, data )
                    data = data || selector;
                    selector = undefined;
                }
                for (type in types) {
                    this.on(type, selector, data, types[ type ], one);
                }
                return this;
            }

            if (data == null && fn == null) {
                // ( types, fn )
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === "string") {
                    // ( types, selector, fn )
                    fn = data;
                    data = undefined;
                } else {
                    // ( types, data, fn )
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if (fn === false) {
                fn = false;
            } else if (!fn) {
                return this;
            }

            if (one === 1) {
                origFn = fn;
                fn = function(event) {
                    // Can use an empty set, since event contains the info
                    J(null).off(event);
                    return origFn.apply(this, arguments);
                };
                // Use same guid so caller can remove using origFn
                //fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
            }
            return this.each(function() {
                add(this, types, fn, data, selector);
            });
        },
        one: function(types, selector, data, fn) {
            return this.on(types, selector, data, fn, 1);
        },
        off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
                // ( event )  dispatched jQuery.Event
                handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(
                    handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                );
                return this;
            }
            if (typeof types === "object") {
                // ( types-object [, selector] )
                for (type in types) {
                    this.off(type, selector, types[ type ]);
                }
                return this;
            }
            if (selector === false || typeof selector === "function") {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }
            return this.each(function() {
                jQuery.event.remove(this, types, fn, selector);
            });
        }/*,

         bind: function(types, data, fn) {
         return this.on(types, null, data, fn);
         },
         unbind: function(types, fn) {
         return this.off(types, null, fn);
         },

         live: function(types, data, fn) {
         jQuery(this.context).on(types, this.selector, data, fn);
         return this;
         },
         die: function(types, fn) {
         jQuery(this.context).off(types, this.selector || "**", fn);
         return this;
         },

         delegate: function(selector, types, data, fn) {
         return this.on(types, selector, data, fn);
         },
         undelegate: function(selector, types, fn) {
         // ( namespace ) or ( selector, types [, fn] )
         return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
         },

         trigger: function(type, data) {
         return this.each(function() {
         jQuery.event.trigger(type, data, this);
         });
         },
         triggerHandler: function(type, data) {
         if (this[0]) {
         return jQuery.event.trigger(type, data, this[0], true);
         }
         },

         toggle: function(fn) {
         // Save reference to arguments for access in closure
         var args = arguments,
         guid = fn.guid || jQuery.guid++,
         i = 0,
         toggler = function(event) {
         // Figure out which function to execute
         var lastToggle = ( jQuery._data(this, "lastToggle" + fn.guid) || 0 ) % i;
         jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);

         // Make sure that clicks stop
         event.preventDefault();

         // and execute the function
         return args[ lastToggle ].apply(this, arguments) || false;
         };

         // link all the functions, so any of them can unbind this click handler
         toggler.guid = guid;
         while (i < args.length) {
         args[ i++ ].guid = guid;
         }

         return this.click(toggler);
         },

         hover: function(fnOver, fnOut) {
         return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
         }*/
    };


}(J));