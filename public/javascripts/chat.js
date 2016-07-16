/**
 * Created by ASUA on 2016/7/15.
 */

var socket = io();

(function () {
    var utils = {
        getTemplate: function (users) {
            var i = 0,
                res = "";
            for (; i < users.length; i++) {
                res += '<li><a href="#">' + users[i] + '</a></li>';
            }
            return res;
        },
        getUserName: function () {
            return $('#username')[0].innerHTML;
        }
    };

    function socketBinding() {
        socket.on("users", function (data) {
            $("#user-list").html(utils.getTemplate(data.users));
            $("#user-list a").click(function (event) {
                console.log($(this).text());
            });
        });
    }

    function DOMBinding() {
        $(".btn-add").click(function () {
            socket.emit("activeUser", {
                username: "wcyz666"
            });
        });
    }

    function elInit() {
        socket.emit("init", {
            username: utils.getUserName()
        })
    }

    return {
        init: function () {
            DOMBinding();
            socketBinding();
            elInit();
        }
    }

})().init();


