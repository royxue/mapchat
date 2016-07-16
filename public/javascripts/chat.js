/**
 * Created by ASUA on 2016/7/15.
 */

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
                username: utils.getUserName()
            });
        });
        
        $("#btn-send").click(function () {
            var word = $("#my-word").val();
            $("#my-word").val("");
            var msg = "<div class='chatmsg'>" + word +"</div>"
            $("#chatbox")[0].innerHTML += msg;
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


