/**
 * Created by ASUA on 2016/7/15.
 */

(function () {
    var talkToObj = {},
        talkToUserName,
        curToken,
        waitingRoom = {},
        isBadgeAppearing = false;

    var lastTime = new Date(),
        width = $("#chatbox").width() * 0.3;

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
            $("#user-list a").each(function (element) {
                if ($(this).text() in waitingRoom) {
                    $(this).append('<span class="badge pull-right"> '
                        + waitingRoom[$(this).text()].reminder + '</span>');
                }
                $(this).click(function () {
                    $(this).children("span").remove();
                    talkToUserName = $(this).text();
                    $('#hint').text("Talking to " + talkToUserName);
                    if (!(talkToUserName in waitingRoom)) {
                        curToken = utils.getRandomNumber();
                        talkToObj[talkToUserName] = curToken;
                        socket.emit("initTalk", {
                            token: curToken,
                            sender: utils.getUserName(),
                            receiver: talkToUserName
                        });
                    } else {
                        socket.emit("enterRoom", {
                            token: waitingRoom[$(this).text()].token,
                            receiver: utils.getUserName()
                        });
                        curToken = waitingRoom[$(this).text()].token;
                        delete waitingRoom[$(this).text()];
                    }
                });
            });
        });
        
        socket.on("sendmsg", function (data) {
            var otherWords = utils.getOtherWordsTemplate(data.msg);
            $("#chatbox").append(otherWords).animate(
                {
                    scrollTop:$("#chatbox")[0].scrollHeight
                }, 500);
        });

        socket.on("remindMsg", function (data) {
            waitingRoom[data.sender] = {
                token: data.token,
                reminder: data.stashCount
            }
        })
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

        setInterval(function () {
            var total = 0;
            for (var key in waitingRoom) {
                if (waitingRoom.hasOwnProperty(key)) {
                    total += waitingRoom[key].reminder;
                }
            }
            $(".navbar-header").children(".badge").remove();
            if (total > 0) {
                $(".navbar-header").prepend('<span class="badge unread"> '
                    + total + '</span>');
            }
        }, 1000)
    }

    return {
        init: function () {
            DOMBinding();
            socketBinding();
            elInit();
        }
    }

})().init();


