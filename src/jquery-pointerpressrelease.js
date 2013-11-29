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
                        pointerenter: eventSpecial.handlerTouchEnter,
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

                    if(e.target !== e.currentTarget) { return; }

                    if(e.pointerType === 'touch') {
                        var data = $.data(e.relatedTarget, eventName);

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
                if(e.target !== e.currentTarget) { return; }

                var target = e.target,
                    pointerevent;

                // touch
                if(e.pointerType === 'touch') {
                    $.data(target, eventName, {
                        timer: (function() {
                            // if there was no touchmove in 80ms – trigger pointerpress
                            return setTimeout(function() {
                                var data = $.data(target, eventName);

                                if(!data.move) {
                                    pointerevent = new $.PointerEvent(e, eventName);
                                    $(target).trigger(pointerevent);
                                    data.pressed = true;
                                }
                            }, 80);
                        })(),
                        clientX: e.clientX,
                        clientY: e.clientY
                    });
                // mouse – only left button
                } else if(e.which === 1) {
                    pointerevent = new $.PointerEvent(e, eventName);
                    $(target).trigger(pointerevent);
                }
            },

            handlerUp: function(e) {
                if(e.target !== e.currentTarget) { return; }

                if(e.pointerType === 'touch') {
                    var data = $.data(e.target, eventName);

                    // if there is a data – clear current pointerpress timeout
                    if(data) {
                        clearTimeout(data.timer);
                    }
                }
            },

            handlerTouchEnter: function(e) {
                var target = e.target;

                if(target !== e.currentTarget) { return; }

                if(e.pointerType === 'touch' && e.relatedTarget) {
                    var data = $.data(e.relatedTarget, eventName);

                    // if there is a data – clear current pointerpress timeout
                    if(data.pressed) {
                        var pointerevent = new $.PointerEvent(e, eventName);
                        // TODO: targets check
                        $(target).triggerHandler(pointerevent);
                    }
                }
            }
        }

    }

    // init pointer events
    addPointerEvent('press', extendPointerPress);

})(jQuery);
