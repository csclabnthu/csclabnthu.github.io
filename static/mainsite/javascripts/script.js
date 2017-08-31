// $('.profile-pic').hover(function(){
// 	$(this).siblings('.talk-buble').addClass('showing-buble');
// }, function(){
// 	$(this).siblings('.talk-buble').removeClass('showing-buble');
// });

(function(){
    // remove layerX and layerY
    var all = $.event.props,
        len = all.length,
        res = [];
    while (len--) {
      var el = all[len];
      if (el != 'layerX' && el != 'layerY') res.push(el);
    }
    $.event.props = res;
}());

/* smooth scroll */
$(function() {
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            $('a[href*=#]:not([href=#])').removeClass('active');
            $(this).addClass('active');
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 400);
                return false;
            }
        }
    });
});

$(document).scroll(function(e) {
    var scrollPos = $(document).scrollTop();
    $('#nav-bar a').each(function() {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));
        if (refElement.position().top-50 <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            currLink.addClass("active");
        }
        else{
            currLink.removeClass("active");
        }
    });
});

$('#discover-btn').click(function() {
    var newHeight = -2*$(window).height();
    $('header').animate({top: newHeight+"px"}, 400, "easeInCubic", function(){
        $('#nav-bar').animate({marginTop:'0'}, 500);
    });
});

var getRecords = function(access_key, callback_function) {

    $.getJSON('https://spreadsheets.google.com/feeds/list/'+ access_key +'/od6/public/values?alt=json', function(data){        
        var items = [];
        var pattern = /^gsx/;
        data.feed.entry.map(function(record) {

            var fields = Object.keys(record).filter(function(key){
                return pattern.test(key);
            });

            var item = {};
            fields.forEach(function(field) {
                // TODO: replace-string need to be consistent with pattern.
                var field_name = field.replace('gsx$', '');
                item[field_name] = record[field]['$t'];
            });
            items.push(item);
        });

        if (callback_function && (typeof callback_function) === 'function') {
            callback_function(items);
        }
    });
};

var sanitized = function(raw_string) {
    var lt = /</g,
        gt = />/g,
        ap = /'/g,
        ic = /"/g;
    var sanitized_string = raw_string.replace(lt, "&lt;")
                                     .replace(gt, "&gt;")
                                     .replace(ap, "&#39;")
                                     .replace(ic, "&#34;");
    return sanitized_string;
}

var urlify = function(text) {
   var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
   return text.replace(exp,"<a href='$1' target='_blank'>$1</a>");
}

$('.project').click(function() {
    if ($('.project-drawer').hasClass('showing-project-drawer')) {
        $('.project-drawer').removeClass('showing-project-drawer');	
        $('.project-drawer').removeClass('long');
    } else {
        var pid = $(this).data('pid');
        prepareDrawer(pid);	
        var row = Math.floor(pid/4);
        if ($(this).hasClass('long')) {
            $('.project-drawer[data-row='+ row +']').addClass('long');	
        }
        $('.project-drawer[data-row='+ row +']').addClass('showing-project-drawer');
    }
});

var prepareDrawer = function(pid) {
    var project = $('[data-pid='+pid+']');
    var left = $(project).offset().left;
    var width = $(project).width();
    var title = $(project).data('title');

    var content = $(project).children('.project-content').html();
    var src = $(project).find('.project-img img').attr('src');
    src = (undefined === src)?'#':src;
    var row = Math.floor(pid/4);
    $('.project-drawer[data-row='+ row +'] .project-arrow').css('left', left + (width-18)/2);
    $('.project-drawer[data-row='+ row +'] .project-title').text(title);

    $('.project-drawer[data-row='+ row +'] .project-text').html(content);
    $('.project-drawer[data-row='+ row +'] .project-img').attr('src', src);
}

var toggle = -1;
var timer = setInterval(function(){
    toggle *= -1;
    if (toggle == 1) {

        $('.current-profile').children('.profile-pic').addClass('activated');
        $('.current-profile').children('.talk-buble').addClass('showing-buble');

    } else {

        $('.current-profile').children('.profile-pic').removeClass('activated');
        $('.current-profile').children('.talk-buble').removeClass('showing-buble');

        var next_profile = $('.current-profile').next();
        if(next_profile.length == 0){
            next_profile = $('.current-profile').prevAll().last();
        }
        $('.current-profile').removeClass('current-profile');
        $(next_profile).addClass('current-profile');
    }
}, 3000);

$('.partner').hover(function() {
    var location = $(this).data('location');
    var partner = $(this).data('partner');

    var svg = $('#svg')[0].contentDocument
    svg.getElementById('anim_'+location).beginElement();
    svg.getElementById('anim2_'+location).beginElement();
    $(svg.getElementById('circle_'+location)).css('fill', '#f1c40f');
    $(svg.getElementById('line_'+partner)).css('stroke', '#f1c40f');

}, function() {
    var location = $(this).data('location');
    var partner = $(this).data('partner');

    var svg = $('#svg')[0].contentDocument
    svg.getElementById('anim_'+location).endElement();
    svg.getElementById('anim2_'+location).endElement();
    $(svg.getElementById('circle_'+location)).css('fill', '#AAA');
    $(svg.getElementById('line_'+partner)).css('stroke', '#AAA');
});

getRecords('0AqidxoMMnkQhdEF5QnltY2x3V1lwa1B1YktPSmxOdmc', function(murmurs){
    murmurs.forEach(function(murmur){
        var name = sanitized(murmur['name']);
        var mm = sanitized(murmur['murmur']);
        var timestamp = murmur['timestamp'];
        var feeling = sanitized(murmur['feeling']);

        $('.profile[data-name='+ name +']').find('.murmur-timestamp>span').attr('data-livestamp', timestamp);

        mm = $.trim(mm);
        mm = urlify(mm);
        if (mm === '') return;

        if (feeling !== '') {
            var span = $('<span></span>').addClass('murmur-feeling').text(feeling);
            mm += span.get(0).outerHTML;
        }

        $('.profile[data-name='+ name +']').find('.murmur-text').html(mm);
    });
});


