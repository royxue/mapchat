/**
 * Created by ASUA on 2016/7/15.
 */

var socket = io();

(function () {
    var talkToUserName;
    
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
        },
    };

    function socketBinding() {
        socket.on("users", function (data) {
            $("#user-list").html(utils.getTemplate(data.users));
            $("#user-list a").click(function () {
                talkToUserName = $(this).text();
                $('#hint').text(talkToUserName);
            });
        });
    }

    function DOMBinding() {
        $(".btn-add").click(function () {
            socket.emit("activeUser", {
                username: "wcyz666"
            });
        });
        
        $("#btn-send").click(function () {
            var word = $("#my-word").val();
            $("#my-word").val("");
            socket.emit("sendmsgfor2people", {
                sender: utils.getUserName(),
                receiver: talkToUserName,
                msg: word
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


