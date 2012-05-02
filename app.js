var github = {
  clientId: "0fc40d9e0188c351a069",
  scope: "user,gist",
  clientSecret: "344cef773df669a8fbb5d0ab086d245fab161ba8",
  authServer: "http://getmygist.herokuapp.com/token"
};

jQuery(document).ready(function() {
  var qs = parseQueryString(window.location.search);
  if (qs) {
    if(qs.gist_id || qs.gist_url){
      loadGist(qs.gist_id || qs.gist_url);
    } else if(qs.code){
      authGithub(qs.code);
    } else if(qs.access_token){
      storeGithubToken(qs.access_token, qs.token_type);
    }
  }

  jQuery("#login").click(function(){
    window.location = "https://github.com/login/oauth/authorize?client_id="+ github.clientId +"&scope="+ github.scope;
  });

  if(readCookie("access_token")){
    jQuery("#login").hide();
  }

  jQuery(".js-gist-edit").submit(function(e){
    var body = jQuery(".js-data").val()
      , gistId = jQuery(".gist-id").val()
      , gist_content = {
          "files": {
              "application.js": {
                  "content": body
              }
          }
      };


    var url = 'https://api.github.com/gists/' + gistId + '?access_token='+ readCookie("access_token")
    $.ajax({
      url: url,
      type: "PATCH",
      data: JSON.stringify(gist_content),
      success: function(gist){
        console.log(" ==== Saved! ====");
        loadAndRunGist(gist.files["application.js"].content);
      }
    });
    e.preventDefault();
  });

})

var authGithub = function(code){
  window.location = github.authServer+"?client_id="+ github.clientId+ "&client_secret="+ github.clientSecret +"&code="+ code +"&redirect_url="+window.location.href.split("?")[0];
};

var storeGithubToken = function(token, type){
  createCookie("access_token", token);
  createCookie("token_type", type);
  jQuery("#login").hide();
};

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
        if(key.match("application.js")){
          loadAndRunGist(value.content)
          return false;
        }
      });
    }
  });
  jQuery(".gist-id").val(gistId);
}

var loadAndRunGist = function(data){
  eval(data);
  $('.js-data').val(data);
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