$(document).ready(function () {
    "use strict";
    $(".btn-menu").click(function () {
        sidebarTrigger();
    });


    $(".content, .sidebar").click(function () {
        if ($('.wrapper').hasClass("opens")) {
            $('nav.nav').css('margin-left', '-250px');
            $('.wrapper').removeClass('opens').addClass('closes');
            $('.btn-menu').removeClass('active');
            setTimeout(function () {
                $('body, .content').css('overflow', 'auto');
            }, 350);
        }
    });
});

$(window).scroll(function () {
    "use strict";
    $(".fixit").css("top", Math.max(0, 250 - $(this).scrollTop()));
});


function initCarousel() {
    "use strict";
    $('.carousel').carousel({
        interval: 4000
    });
}

function sidebarTrigger() {

    "use strict";

    if ($('.wrapper').hasClass("closes")) {
        $('nav.nav').css('margin-left', '0');
        $('body, .content').css('overflow', 'hidden');
        $('.btn-menu').addClass('active');
        $('.wrapper').removeClass('closes').addClass('opens');
    } else if ($('.wrapper').hasClass("opens")) {
        $('nav.nav').css('margin-left', '-250px');
        $('.wrapper').removeClass('opens').addClass('closes');
        $('.btn-menu').removeClass('active');

        setTimeout(function () {
            $('body, .content').css('overflow', 'auto');
        }, 350);

    }
}

function mediaAudio() {
    "use strict";
    $('audio').mediaelementplayer();
}