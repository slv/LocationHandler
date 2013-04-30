LocationHandler
===============

Javascript Library for manage url changes in browser. jQuery needed

## Reference

### How to use

* on document ready, instantiate 'LocationHandler' and pass it the hooks you want and the jQuery object

        jQuery(document).ready(function () {
            var locationHandler = new LocationHandler({
                locationWillChange: function (changeObj)
                {
                    // called before start changing procedure, return false to cancel change
                },
                nextLocationWillLoad: function (changeObj)
                {
                    // called before start ajax call to next location
                    // if you return an integer the lib wait for that number of milliseconds to continue
                },
                nextLocationIsReady: function (changeObj)
                {
                    // called when next location content is available,
                    // here you can inject new html, and/or remove old...
                    // if you return an integer the lib wait for that number of milliseconds to continue
                },
                nextLocationInit: function (changeObj)
                {
                    // called after 'nextLocationIsReady', with delay if an integer is returned in that method,
                    // it's called before re-activation of LocationHandler
                    // if you return an integer the lib wait for that number of milliseconds to continue
                },
                locationDidChange: function (changeObj)
                {
                    // called at the end of cycle when LocationHandler is re-activated
                    // ...
                },
                nextLocationThrowsException: function (changeObj)
                {
                    // handle here errors
                }
            });
        }, jQuery);

* now you have 'locationHandler' object with some methods:

>    'changeLocation' will change location through the LocationHandler (with relative checks and hooks)
>
>        locationHandler.changeLocation('http://localhost/LocationHandler/first.html');
>
>
>    'handleClickWithLocationHandler' will return a function to attach at the html "a" tag, it parses href and call appropriate 'changeLocation' method automatically.
>    you must pass 'locationHandler' object as first param and optionally an object that LocationHandler will pass inside the changeObj.state property
>    example:
>
>        $("a").bind({
>            click: locationHandler.handleClickWithLocationHandler(locationHandler, {aParam: 'a value', anotherParam: 'another value'})
>        });

* every time you want to change location using the lib, you have to call appropriate methods.

* change Object 'changeObj'

>    changeObj contains some properties useful in hooks:
>
>        {
>            from: "http://localhost/LocationHandler/third.html",
>            to: "http://localhost/LocationHandler/second.html",
>            fromCache: true/false, // if content comes from cache
>            data: "some html content...", // the content of tag "body" of ajax response
>            fromTitle: "Third Page - Test Location Handler",
>            toTitle: "Second Page - Test Location Handler",
>            state: {aParam: 'a value', anotherParam: 'another value'},
>        }


* If you want to pass smaller part of the next page inside changeObj.data, simply prepare all pages with these comments:

>    ...
>    <body>
>    <div id="content">
>        <div id="inner-content">
>
>            <!--LocationHandlerStart-->
>            <div id="async-content">
>                <p>some contents....</p>
>            </div>
>            <!--LocationHandlerEnd-->
>
>        </div>
>    </div>
>    ...
>
>    and in changeObj you'll find only the contents between <!--LocationHandlerStart--> and <!--LocationHandlerEnd-->


### Full Example

    jQuery(document).ready(function () {

        var locationHandler = new LocationHandler({

            nextLocationWillLoad: function (changeObj)
            {
                // here we can read from changeObj.state if there is custom params

                if (changeObj.state && changeObj.state.fadeOut) {
                    // ex. here we can fade out the page
                }
                else {
                    // default animation
                }
            },
            nextLocationIsReady: function (changeObj)
            {
                // suppose to get the content of div with id="content" of next page and inject into the div with id="content"
                // in current page
                var newContent = $("#content", $('<div></div>').html(changeObj.data).html());

                // fade out container div
            $("#content").fadeOut(600);

                // return integer (milliseconds) to wait for finish fadeOut
                return 600;
            },
            nextLocationInit: function (changeObj)
            {
                // inject newContent and fade in
                $("#content").html(newContent).fadeIn(600);

                // return integer (milliseconds) to wait for finish fadeOut
                return 600;
            }
        });


        // bind click on ALL "a" tags
        $("a").bind({
            click: locationHandler.handleClickWithLocationHandler(locationHandler)
        });

    }, jQuery);
