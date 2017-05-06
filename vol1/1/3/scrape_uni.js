// scrape.js
var casper = require('casper').create({
    verbose: true,
    pageSettings: {
      webSecurityEnabled: false
    }
});
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36');

var LINK_LEVEL = 2;
var TARGET_URL = "http://www.uniqlo.com/jp/stylingbook/pc/";
var list = {};

casper.start();

function getLinks() {
  var links = document.querySelectorAll('a');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('href');
  });
}

function getImages() {
  var links = document.querySelectorAll('img.ng-isolate-scope');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('src');
  });
}

casper.then(function() {
  casper.emit('crawl', TARGET_URL, 0);
});

casper.run();

casper.on('crawl', function (url, level){
  var links = [];
  if (level >= LINK_LEVEL) return;
  if (list[url]) return;
  list[url] = true;

  var us = TARGET_URL.split("/");
  us.pop();
  var base = us.join("/");
  if (url.indexOf(base) < 0) return;

  casper.open(url).then(function () {
    links = casper.evaluate(getLinks);

    Array.prototype.map.call(links, function (href) {
      var absolutePath = casper.evaluate(function (path) {
        var e = document.createElement('span');
        e.innerHTML = '<a href="' + path + '" />';
        return e.firstChild.href;
      }, href);
      if (!absolutePath) return;
      absolutePath = absolutePath.replace(/\#.+$/, "");
      casper.emit('crawl', absolutePath, level + 1);
    });

    casper.open(url).then(function () {
      this.scrollToBottom();
      casper.wait(5000, function() {
        images = casper.evaluate(getImages);
        Array.prototype.map.call(images, function (src) {
          var savepath = src.split("/").slice(2).join("/");
          casper.download(src, savepath);
        });
      });
    });
  });
});
