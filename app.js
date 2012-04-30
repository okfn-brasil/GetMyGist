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
