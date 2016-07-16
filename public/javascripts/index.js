(function () {

    function socketBinding() {
        $('#signin').click(function (event) {
            $(".btn-sign").addClass("btn-info").removeClass("btn-success");
            $(this).removeClass("btn-info").addClass("btn-success");
            if ($('.signup-area').css("display") === "none" &&
                $('.signin-area').css("display") === "none") {
                $('.signin-area').show();
                $(".button-bottom").animate({bottom : 0}, "normal")
            } else {
                $('.signup-area, .signin-area').hide();
                $('.signin-area').show();
            }
        });
        $('#signup').click(function (event) {
            $(".btn-sign").addClass("btn-info").removeClass("btn-success");
            $(this).removeClass("btn-info").addClass("btn-success");
            if ($('.signup-area').css("display") === "none" &&
                $('.signin-area').css("display") === "none") {
                $('.signup-area').show();
                $(".button-bottom").animate({bottom : 0}, "slow")
            } else {
                $('.signup-area, .signin-area').hide();
                $('.signup-area').show();
            }
        });
    }

    function DOMBinding() {

    }

    function elInit() {
    }

    return {
        init: function () {
            DOMBinding();
            socketBinding();
            elInit();
        }
    }

})().init();



