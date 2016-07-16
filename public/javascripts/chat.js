/**
 * Created by ASUA on 2016/7/15.
 */

(function () {
    var socket = io();

    function socketBinding() {
        socket.on("users", function (data) {
            console.log(data);
        });
    }

    function DOMBinding() {

    }

    function elInit() {
        socket.emit("activeUser", {
            username: "wcyz666"
        });
    }

    return {
        init: function () {
            DOMBinding();
            socketBinding();
            elInit();
        }
    }

})().init();


