var github = function(){
  var config = {
    "localhost": {
      clientId: "35263dbf225ca2e14de3",
      clientSecret: "e8761dc7e889893764b1af6f2a3d52f6a6541f58",
      authServer: "http://getmygist.herokuapp.com/token"
    },
    "okfn-br.github.com": {
      clientId: "0fc40d9e0188c351a069",
      clientSecret: "344cef773df669a8fbb5d0ab086d245fab161ba8",
      authServer: "http://getmygist.herokuapp.com/token"
    }
  }[window.location.host];

  return $.extend(config, {
    scope: "user,gist",
    url: function(resource){
      return "https://api.github.com"+ resource +
                "?access_token="+helpers.cookie.read("access_token")
    }
  });
};



