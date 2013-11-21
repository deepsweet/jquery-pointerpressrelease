(function($) {

    /*global jQuery:true*/
    'use strict';

    // TODO: pointerpress on pointerenter

    // nothing to do without jquery-ppinterevents
    if(!('PointerEvent') in $) {
        return;
    }

    /**
     * Create new $.event.special wrapper with some default behavior.
     *
     * @param {string} type event type
     * @param {object} toExtend object to extend default wrapper
     */
    function addPointerEvent(type, toExtend) {

        var eventName = 'pointer' + type,

            eventSpecial = $.event.special[eventName] = {
                // bind
                setup: function() {
                    $(this).on({
                        pointerdown: eventSpecial.handlerDown,
                        pointermove: eventSpecial.handlerMove,
                        pointerup: eventSpecial.handlerUp,
                        pointerleave: eventSpecial.handlerLeave
                    });
                },

                // unbind
                teardown: function() {
                    $(this).off({
                        pointerdown: eventSpecial.handlerDown,
                        pointermove: eventSpecial.handlerMove,
                        pointerup: eventSpecial.handlerUp,
                        pointerleave: eventSpecial.handlerLeave
                    });
                },

                handlerMove: function(e) {

                    if(e.pointerType === 'touch') {
                        var data = $.data(e.currentTarget, eventName);

                        // if there is a touch move
                        if(
                           Math.abs(e.clientX - data.clientX) > 5 ||
                           Math.abs(e.clientY - data.clientY) > 5
                        ) {
                            // save that
                            data.move = true;
                        }
                    }
                }
            };

        // extend this $.event.special wrapper
        if(toExtend) {
            $.extend(eventSpecial, toExtend(eventName));
        }

    }

    /**
     * Object to extend $.event.special to handle pointerpress.
     *
     * @param {sring} eventName event name
     * @return {object}
     */
    function extendPointerPress(eventName) {

        return {
            handlerDown: function(e) {
                var target = e.currentTarget,
                    pointerevent;

                // touch
                if(e.pointerType === 'touch') {
                    $.data(target, eventName, {
                        timer: (function() {
                            // if there was no touchmove in 80ms – trigger pointerpress
                            return setTimeout(function() {
                                if(!$.data(target, eventName).move) {
                                    pointerevent = new $.PointerEvent(e, eventName);
                                    pointerevent.dispatch(target);
                                }
                            }, 80);
                        })(),
                        clientX: e.clientX,
                        clientY: e.clientY
                    });
                // mouse – only left button
                } else if(e.which === 1) {
                    pointerevent = new $.PointerEvent(e, eventName);
                    pointerevent.dispatch(target);
                }
            },

            handlerUp: function(e) {
                if(e.pointerType === 'touch') {
                    var data = $.data(e.currentTarget, eventName);

                    // if there is a data – clear current pointerpress timeout
                    if(data) {
                        clearTimeout(data.timer);
                    }
                }
            }
        }

    }

    /**
     * Object to extend $.event.special to handle pointerrelease.
     *
     * @param {sring} eventName event name
     * @return {object}
     */
    function extendPointerRelease(eventName) {

        return {
            handlerDown: function(e) {
                var target = e.currentTarget;

                if(e.pointerType === 'touch') {
                    $.data(target, eventName, {
                        timer: (function() {
                            // if there was no touchmove in 80ms – save that
                            return setTimeout(function() {
                                var data = $.data(target, eventName);

                                if(!data.move) {
                                    data.pressed = true;
                                }
                            }, 80);
                        })(),
                        clientX: e.clientX,
                        clientY: e.clientY
                    });
                }
            },

            handlerUp: function(e) {
                var pointerevent;

                // touch
                if(e.pointerType === 'touch') {
                    var data = $.data(e.currentTarget, eventName);

                    if(data) {
                        // clear current pointerrelease timeout
                        clearTimeout(data.timer);

                        // if pointer was pressed for 80ms – trigger pointerrelease
                        if(data.pressed) {
                            pointerevent = new $.PointerEvent(e, eventName);
                            pointerevent.dispatch(pointerevent.currentTarget);
                            data.pressed = false;
                        }
                    }
                // mouse – only left button
                } else if(e.which === 1) {
                    pointerevent = new $.PointerEvent(e, eventName);
                    pointerevent.dispatch(pointerevent.currentTarget);
                }
            },

            handlerLeave: function(e) {

                var data = $.data(e.currentTarget, eventName);

                if(data && data.pressed) {
                    var pointerevent = new $.PointerEvent(e, eventName);
                    pointerevent.dispatch(pointerevent.currentTarget);
                    data.pressed = false;
                }

            }
        }

    }

    // init pointer events
    addPointerEvent('press', extendPointerPress);
    addPointerEvent('release', extendPointerRelease);

})(jQuery);
