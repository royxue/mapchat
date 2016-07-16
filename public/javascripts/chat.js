/**
 * Created by ASUA on 2016/7/15.
 */

(function () {
    var socket = io();


    function socketBinding() {

    }

    function DOMBinding() {

    }

    function elInit() {
        //socket.emit("join", {"hello": "world"})
    }

    return {
        init: function () {
            DOMBinding();
            socketBinding();
            elInit();
        }
    }

})().init();


