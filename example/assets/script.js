jQuery(document).ready(function ($) {

  function getTime () {
    var d = new Date();
    return d.getTime();
  }

  var globalTimer;

  var locationHandler = new LocationHandler({
    locationWillChange: function (changeObj)
    {
      $('<p>- location will change... in changeObj.state we read: ' + $.param(changeObj.state) + '</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});
      return 500;
    },
    nextLocationWillLoad: function (changeObj)
    {
      globalTimer = getTime();
      if (changeObj.fromCache) {
        $('<p>- read content of "' + changeObj.to + '" from cache</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});
        return 0;
      }
      else {
        $('<p>- load "' + changeObj.to + '" from web</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});
        return 500;
      }
    },
    nextLocationIsReady: function (changeObj)
    {
      if (changeObj.fromCache) {
        $('<p>- page content is immediately ready in ' + (getTime() - globalTimer) + ' ms</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});
      }
      else {
        $('<p>- page content is now ready in ' + (getTime() - globalTimer) + ' ms (we add 500 milliseconds in nextLocationWillLoad param)</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});
      }
      $('<p>- here we can remove old page contents and inject new html...</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});

      $("#content").fadeOut(600);

      return 600;
    },
    nextLocationInit: function (changeObj)
    {
      $('<p>- new page is ready, new html is injected, now we can start animations</p>').css('height', 0).appendTo($("#logs")).animate({height: 16});
      var txt = $("#content", $('<div></div>').html(changeObj.data)).html();
      document.title = changeObj.toTitle;

      $("#content").html(txt).fadeIn(600);
      return 600;
    },
    locationDidChange: function (changeObj)
    {

    }
  }, $);


  // bind click on link passing as custom params the class attribute of each link, we'll read it inside hooks in changeObj.state

  $("a").each(function (k, link) {
    $(link).bind({
      click: locationHandler.handleClickWithLocationHandler(locationHandler, {customParam: $(link).attr('class')})
    });
  });

});
