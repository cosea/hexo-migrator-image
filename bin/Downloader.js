// Generated by CoffeeScript 1.6.3
var Downloader, Path, Url, colors, crypto, defaultFileName, file, fs, http, isLocalUrl, isRemoteUrl;

fs = require('fs');

Url = require('url');

Path = require('path');

crypto = require('crypto');

http = require('http');

colors = require('colors');

file = hexo.file;

isRemoteUrl = function(url) {
  return url.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/) != null;
};

isLocalUrl = function(url) {
  return fs.existsSync(url);
};

defaultFileName = function(path) {
  var digest, ext, shasum, u;
  u = Url.parse(path);
  shasum = crypto.createHash('sha1').update(u.href);
  ext = Path.extname(u.path);
  digest = shasum.digest('hex');
  return digest + ext;
};

module.exports = Downloader = (function() {
  function Downloader(imageFolder) {
    this.imageFolder = imageFolder;
  }

  Downloader.prototype.download = function(img, callback) {
    var fileName, isLocal, isRemote, to, url;
    url = img.url;
    fileName = defaultFileName(url);
    to = this.imageFolder + fileName;
    console.log("FILE ".blue + "GET".yellow + " %s", url);
    if (fs.existsSync(to)) {
      console.log("SKIP".green + " %s", fileName);
      if (typeof callback === "function") {
        callback(null, to);
      }
      return;
    }
    isRemote = isRemoteUrl(url);
    isLocal = isLocalUrl(url);
    if (isRemote) {
      return this.downloadRemoteImage(url, to, function(err, succ) {
        img.localPath = succ;
        return typeof callback === "function" ? callback(err, succ) : void 0;
      });
    } else {
      return this.copyLocalImage(url, to, function(err, succ) {
        img.localPath = succ;
        return typeof callback === "function" ? callback(err, succ) : void 0;
      });
    }
  };

  Downloader.prototype.downloadRemoteImage = function(from, to, callback) {
    var request;
    return request = http.get(from, (function(response) {
      var ws;
      if (response.statusCode === 200) {
        console.log("HTTP ".blue + "%d ".green + "%s", response.statusCode, from);
        ws = fs.createWriteStream(to).on("error", function(err) {
          return typeof callback === "function" ? callback(err, to) : void 0;
        }).on("close", (function(err) {
          console.log("SAVE".green + " %s", to);
          return typeof callback === "function" ? callback(null, to) : void 0;
        }));
        return response.pipe(ws);
      } else {
        console.log("HTTP ".blue + "%d ".red.blue + "%s", response.statusCode, from);
        return typeof callback === "function" ? callback(new Error("HTTP " + response.statusCode), to) : void 0;
      }
    })).on("error", function(err) {
      console.log(err.message);
      return callback(err, to);
    });
  };

  Downloader.prototype.copyLocalImage = function(from, to, callback) {
    var rs, ws;
    console.log("COPY ".blue + "FROM ".yellow + "%s", from);
    ws = fs.createWriteStream(to).on("error", (function(err) {
      console.log("COPY ".blue + "ErrW ".green + "%s", to);
      return typeof callback === "function" ? callback(err, to) : void 0;
    })).on("close", (function(err) {
      console.log("COPY ".blue + "DONE ".green + "%s", to);
      return typeof callback === "function" ? callback(null, to) : void 0;
    }));
    return rs = fs.createReadStream(from).on("error", (function(err) {
      console.log("COPY ".blue + "ErrR ".green + "%s", from);
      return typeof callback === "function" ? callback(err, to) : void 0;
    })).pipe(ws);
  };

  return Downloader;

})();
