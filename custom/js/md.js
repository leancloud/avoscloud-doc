

$("h1,h2,h3,h4,h5,a").removeAttr("id");
gajus.contents.formatId = function(str){
  if(/^[0-9]/.test(str)){
    str = "_"+str;
  }
  return str.replace(/ /g,'_').replace(/[^a-zA-Z_0-9\u4e00-\u9fa5]/g,'_');
};
var tocContents =gajus.contents({
    contents: document.querySelector('#toc-wrapper')
});
$('#toc-wrapper ol').first().attr('id','toc');
$('#toc').addClass('nav');
tocContents.eventProxy.on('ready', function () {
  doSideBar();
});

// Sidebar affix
function doSideBar(){
  $('.sidebar-wrapper').affix({
    offset: {
      top: 80
    , bottom: function () {
        return (this.bottom = $('.footer').outerHeight(true))
      }
    }
  })
  .on('affix.bs.affix', function (e) {
    var tocWidth = $('#left-nav').width();
    $('#toc-wrapper').width(tocWidth);
    $('.sidebar-affix-shadow').removeClass('bottom').addClass('on').attr('data-width', tocWidth);
    $('head').append('<style>.sidebar-affix-shadow:before, .sidebar-affix-shadow:after {width: ' + tocWidth + 'px;}</style>');
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() > $(document).height() - $('.footer').outerHeight(true)) {
        // If window reaches bottom
        $('.sidebar-affix-shadow').addClass('bottom').removeClass('on');
      } else {
        // If user scrolls back
        $('.sidebar-affix-shadow').removeClass('bottom').addClass('on');
      }
    });
  }).on('affix-top.bs.affix', function (e) {
    // If scrolls back to top
    $('#toc-wrapper').removeAttr('style');
    $('.sidebar-affix-shadow').removeClass('bottom on');
  }).on('affix-bottom.bs.affix', function (e) {
    // If window reaches bottom (Affix style)
    $('.sidebar-affix-shadow').addClass('bottom').removeClass('on');
  });
}
$(window).on('resize',function(){
  $('#toc-wrapper').width($('#left-nav').width());
});
// Sidebar ScrollSpy
$.fn.scrollStopped = function(callback) {
  $(this).scroll(function() {
    var self = this, $this = $(self);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback, 250, self));
  });
};

$(window).scrollStopped(function() {
  setTimeout(function() {
    $(".sidebar-affix-shadow.on.sidebar-hover-off .sidebar-wrapper").scrollTo($("#toc > li .active").first(), 800, {offset: -20});
    // console.log("Haven't scrolled in 250ms, fired in 250ms later.");
  }, 250);
});

$(".sidebar-affix-shadow").hover(
  function() {
    $(this).removeClass("sidebar-hover-off");
  }, function() {
    $(this).addClass("sidebar-hover-off");
  }
);




$(function() {
  var arr = $('#toc ul').parents('li');
  angular.forEach(arr, function(v, k) {
    var a = $(v).children('a:first-child');
    a.addClass('has-subdoc-nav');
  });

  $(".sidebar-wrapper #toc").append("<li class=back-to-top><a href=#top>返回顶部</a></li>");
});


