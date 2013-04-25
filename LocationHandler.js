//
// LocationHandler
//
// author: Michele Salvini [ @slvdj ]
// company: Nerocreativo s.r.l.
//
// dependencies: jQuery 1.7

function LocationHandler (params, jQuery)
{
  if (!this.check()) return;

  var self = this;
      self.$ = jQuery || $,
      self.active = true,
      self.attributes = {},
      self.hooks = {},
      self.cache = {},
      params = params || {};

  // Hooks
  var hooks = [
    "locationWillChange",
    "nextLocationWillLoad",
    "nextLocationIsReady",
    "nextLocationInit",
    "locationDidChange",
    "nextLocationThrowsException"
  ];

  self.$.each(hooks, function (k, hook) {
    self.hooks[hook] = (typeof params[hook] != "function") ? function () {} : params[hook];
  });

  var attributes = {
    hostname: location.host
  };

  self.$.each(attributes, function (attribute, value) {
    if (typeof params[attribute] != "undefined") self.attributes[attribute] = params[attribute]; else self.attributes[attribute] = value;
  });

  self.set('location', location.href);

  window.onpopstate = function (historyObj) {
    if (historyObj && historyObj.state && historyObj.state.url)
      self.changeLocation(historyObj.state.url, true, historyObj.state.customParams);
  };

}


//
// Checks


LocationHandler.prototype.check = function ()
{
  return (typeof window.history != "undefined" && typeof window.history.pushState != "undefined");
}


//
// Data


LocationHandler.prototype.getCache = function (location)
{
  if (typeof this.cache[location] != "undefined")
    return this.cache[location];

  return false;
}


LocationHandler.prototype.setCache = function (location, data)
{
  this.cache[location] = data;

  return this;
}


//
// Loading


LocationHandler.prototype.locationDidChange = function (changeObj)
{
  var self = this;

  self.active = true;
  self.hooks.locationDidChange(changeObj);
}


LocationHandler.prototype.nextLocationInit = function (changeObj)
{
  var self = this;

  var timer = self.hooks.nextLocationInit(changeObj);
  if (typeof timer != "number") timer = 0;

  setTimeout(function () {

    self.locationDidChange(changeObj);
  }, timer);
}


LocationHandler.prototype.nextLocationThrowsException = function (changeObj)
{
  this.active = true;
}


LocationHandler.prototype.nextLocationLoad = function (changeObj)
{
  var self = this;

  var timer = self.hooks.nextLocationWillLoad(changeObj);
  if (typeof timer != "number") timer = 0;

  setTimeout(function () {

    if (changeObj.fromCache) {

      var timer = self.hooks.nextLocationIsReady(changeObj);
      if (typeof timer != "number") timer = 0;

      setTimeout(function () {

        self.nextLocationInit(changeObj);
      }, timer);
    }
    else {

      self.$.ajax({
        url: changeObj.to,
        method: 'get',
        dataType: 'text',
        error: function () {

          var timer = self.hooks.nextLocationThrowsException(changeObj);
          if (typeof timer != "number") timer = 0;

          setTimeout(function () {

            self.nextLocationThrowsException(changeObj);
          }, timer);
        },
        success: function (response) {

          var patternCustom = /<!--LocationHandlerStart-->((.|[\n\r])*)<!--LocationHandlerEnd-->/im,
              patternBody = /<body[^>]*>((.|[\n\r])*)<\/body>/im,
              mCustom = patternCustom.exec(response),
              mBody = patternBody.exec(response),
              data = '';

          if (mCustom.length && typeof mCustom[1] != "undefined") {
            data = mCustom[1];
          }
          else if (mBody.length && typeof mBody[1] != "undefined") {
            data = mBody[1];
          }

          var patternTitle = /<title[^>]*>((.|[\n\r])*)<\/title>/im;
              mTitle = patternTitle.exec(response),
              title = mTitle.length && typeof mTitle[1] != "undefined" ? mTitle[1] : '';

          changeObj.fromTitle = document.title;
          changeObj.toTitle = title;
          changeObj.data = data;

          self.setCache(changeObj.to, data);

          var timer = self.hooks.nextLocationIsReady(changeObj);
          if (typeof timer != "number") timer = 0;

          setTimeout(function () {

            self.nextLocationInit(changeObj);
          }, timer);
        }
      });
    }

  }, timer);
}


LocationHandler.prototype.changeLocation = function (newLocation, isFromHistory, customParams)
{
  var self = this;
  if (!self.active) return;

  if (!(new RegExp('https?://' + this.get('hostname'), 'gi').test(newLocation))) {
    location.href = newLocation;
    return;
  }

  if (self.get('location') != newLocation) {
    self.active = false;

    var changeObj = {
      from: self.get('location'),
      to: newLocation,
      state: customParams
    };

    var timer = self.hooks.locationWillChange(changeObj);
    if (timer === false) {
      self.active = true;
      return
    }

    if (typeof timer != "number") timer = 0;

    setTimeout(function () {

      self.set('location', newLocation);

      if (!isFromHistory) window.history.pushState({url: newLocation, customParams: customParams}, '', newLocation);

      changeObj.data = self.getCache(changeObj.to);
      changeObj.fromCache = !(!changeObj.data);

      self.nextLocationLoad(changeObj);
    }, timer);
  }
}


LocationHandler.prototype.handleClickWithLocationHandler = function (locationHandler, customParams)
{
  if (!locationHandler.check()) return function () {};

  return function (event)
  {
    event && event.preventDefault && event.preventDefault();

    var newLocation = this.href; // `this` is the clicked element

    locationHandler.changeLocation(newLocation, false, customParams);
  }
}


//
// Utilities, getter, setter


LocationHandler.prototype.get = function (attr)
{
  if (typeof this.attributes[attr] != "undefined")
    return this.attributes[attr];

  return false;
}


LocationHandler.prototype.set = function (attr, value)
{
  var self = this,
      attributes = {};

  if (typeof attr == "string") {
    attributes[attr] = value;
  }
  else if (typeof attr == "object") {
    attributes = attr;
  }

  self.$.each(attributes, function (att, value)
  {
    if (typeof value == "function") {

      self.attributes[attr] = value(self.attributes[attr]);
    }
    else if (typeof value != "undefined") {

      self.attributes[attr] = value;
    }
  });

  return self;
}