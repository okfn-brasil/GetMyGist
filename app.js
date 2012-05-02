var github = {
  clientId: "0fc40d9e0188c351a069",
  scope: "user,gist",
  clientSecret: "344cef773df669a8fbb5d0ab086d245fab161ba8",
  authServer: "http://getmygist.herokuapp.com/token"
};

jQuery(document).ready(function() {
  var qs = parseQueryString(window.location.search);
  if (qs) {
    loadGist(qs.gist_id || qs.gist_url);
  }
})

function loadGist(gistIdOrUrl) {
  var gistId = gistIdOrUrl;
  if (gistIdOrUrl.indexOf('http') != -1) {
    var parts = gistIdOrUrl.split('/');
    gistId = parts[parts.length-1];
  }
  var url = 'https://api.github.com/gists/' + gistId;
  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: function(data) {
      $.each(data.data.files, function(key,value) {
        $('.js-data').val(value.content);
        eval(value.content);
        return false;
      });
    }
  });
}

// Parse a URL query string (?xyz=abc...) into a dictionary.
parseQueryString = function(q) {
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
};

function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else var expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}