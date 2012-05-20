  var helpers = {
    // Parse a URL query string (?xyz=abc...) into a dictionary.
    parseQueryString: function(q) {
      if (!q) {
        return {};
      }
      var urlParams = {},
        e, d = function (s) {
          return unescape(s.replace(/\+/g, " "));
        },
        r = /([^&=]+)=?([^&]*)/g;

      if (q && q.length && q[0] === '?') {
        q = q.slice(1);
      }
      while (e = r.exec(q)) {
        // TODO: have values be array as query string allow repetition of keys
        urlParams[d(e[1])] = d(e[2]);
      }
      return urlParams;
    },
    cookie: {
      create: function(name,value,days) {
        if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
      },

      read: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      },

      erase: function(name) {
        this.create(name,"",-1);
      }
    },
    githubUrl: function(resource, params){
      params = params ? params : "";
      return "https://api.github.com"+ resource +
                "?access_token="+this.cookie.read("access_token")+
                params;
    },
    userIsLogged: function(){
      return !!this.cookie.read("access_token");
    },
    javascriptFiles: function(files) {
      return $.map(files, function(file){
               return file.filename.match(/\.js$/) ? file : null;
             });
    }
  }

