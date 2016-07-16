/**
 * Created by ASUA on 2016/7/15.
 */

(function () {
    var talkToObj = {},
        talkToUserName,
        curToken;

    var lastTime = new Date(),
        width = $("#chatbox").width() * 0.3,
        waitingRooms = {
        };

    var utils = {
        getRandomNumber: function () {
            return Math.floor(Math.random() * 10000);    
        },
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
        }
    };

    function socketBinding() {
        socket.on("users", function (data) {
            $("#user-list").html(utils.getTemplate(data.users));
            $("#user-list a").click(function () {
                talkToUserName = $(this).text();
                $('#hint').text("Talking to " + talkToUserName);
                if (!(talkToUserName in waitingRooms)) {
                    curToken = utils.getRandomNumber();
                    talkToObj[talkToUserName] = curToken;
                    socket.emit("initTalk", {
                        token: curToken,
                        sender: utils.getUserName(),
                        receiver: talkToUserName
                    });
                } 
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
                token: curToken,
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


