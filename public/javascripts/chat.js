/**
 * Created by ASUA on 2016/7/15.
 */

(function () {
    var talkToUserName;

    var lastTime = new Date(),
        width = $("#chatbox").width() * 0.3;

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

        getWordsTemplate : function (words){
            var wordsToHtml = ""
            return wordsToHtml +
                '</div><div class="media-body word-content pull-right"><p class="bubble-self words col-xs-12">' + words.replace(/\n/g, "<br>") +
                '</p></div><div class="clearfix"></div>';
        },
        getOtherWordsTemplate : function (words){
            return '</div><div class="media-body"><p class="words bubble-other">' + words.replace(/\n/g, "<br>") +
                '</p></div><div class="clearfix"></div>';
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
        
        socket.on("sendmsg", function (data) {
            var otherWords = utils.getOtherWordsTemplate(data.msg);
            $("#chatbox").append(otherWords).animate(
                {
                    scrollTop:$("#chatbox")[0].scrollHeight
                }, 500);
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


            if (word.trim() === "")
                return false;
            $("#my-word").val("");
            
            socket.emit("sendmsgfor2people", {
                sender: utils.getUserName(),
                receiver: talkToUserName,
                msg: word
            });
            
            word = utils.getWordsTemplate(word);
            $("#chatbox").append(word).animate(
                {
                    scrollTop:$("#chatbox")[0].scrollHeight
                }, 500);

        });
    }

    function elInit() {
        socket.emit("init", {
            username: utils.getUserName()
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


