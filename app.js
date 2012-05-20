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
  });
};


(function($){
  var getMyGist = {
    page: {
      pages: {
        homepage: function() {
          $("#content section#homepage").slideDown();
        },
        callback: function(params){
          $("#loading").slideDown();
          var code = params.code,
              redirect_url = window.location.href.split("?")[0]+"?page=gists"

          window.location = github().authServer+
                "?client_id="+ github().clientId+
                "&client_secret="+ github().clientSecret+
                "&code="+ code + "&redirect_url="+ redirect_url;
        },
        gists: function(params){
          $("#loading").slideDown();
          if(params.access_token){
            getMyGist.login(params.access_token, params.token_type);
          }
          $.ajax({
            url: helper.githubUrl("/gists"),
            success: function(gists){
              $.each(gists, function(i, gist){
               var javascriptFiles = helper.javascriptFiles(gist.files);
                  var gist_link = $("<a class='gist_link'></a>")
                              .html("view in gist.github.com")
                              .attr("href", gist.html_url)
                              .attr("target", "_blank"),
                      description = $("<p class='description'></p>")
                              .html(gist.description),
                      edit_link = $("<a class='action edit'> Edit </a>")
                              .attr("href", "?page=gist&id="+ gist.id),
                      run_link = javascriptFiles.length > 0 ? $("<a class='action run'> Run </a>").attr("href", "?page=run&id="+gist.id) : "";

                  $("<li></li>")
                      .html("#"+gist.id )
                      .attr("id", gist.id)
                      .append(description)
                      .append(run_link)
                      .append(edit_link)
                      .append(gist_link)
                      .appendTo("#gists")

              });
              $("#loading").hide();
              $("#content section#getMyGist").slideDown();
            }
          });
        },
        gist: function(params){
          $("#loading").slideDown();
          var id = params.id,
              url = helper.githubUrl("/gists/" + id);
          $("#gistEdit textarea").remove();
          $.ajax({
            url: url,
            dataType: 'jsonp',
            success: function(gist) {
              $.each(gist.data.files, function(key,value) {
                $("<textarea></textarea")
                   .data("filename", key)
                   .val(value.content)
                   .appendTo("#gistEdit form")
              });

              var javascriptFiles = helper.javascriptFiles(gist.data.files);
              if(javascriptFiles.length > 0){
                $("<a class='action'> Run </a>")
                    .attr("href", "?page=run&id="+id)
                    .appendTo("#gistEdit");
              }



              $("<button type='submit'>Salvar</button>").appendTo("#gistEdit form");
              $("#loading").slideUp();
              $("#gistEdit form").attr("id", id);
              $("#gistEdit").slideDown();
            }
          });
        },
        run: function (params) {
          $("#loading").slideDown();
          var id = params.id;
          $.ajax({
            url: helper.githubUrl("/gists/"+id),
            dataType: "jsonp",
            success: function(gist) {
              var javascriptFiles = helper.javascriptFiles(gist.data.files);
              if(javascriptFiles.length > 0){
                $.each(javascriptFiles, function (i, file) {
                  eval(file.content)
                });
              }
              $("#loading").hide();
              $("#done").show();
              setTimeout("$('#done').slideUp();", 2000);
            }
          });
          $('#run').slideDown();
        }
      },
      goTo: function(queryString){
        var page = queryString.page ? queryString.page : "homepage";
        $("#content section:visible, #loading:visible").slideUp();
        getMyGist.updateUserInfo();
        this.pages[page](queryString);
      }
    },
    update: function(e){
      $("#loading").slideDown();
      var gistId = $(this).attr("id"),
          url = helper.githubUrl("/gists/"+gistId),
          data = { "files": {} };

      $(this).find("textarea").each(function() {
        var textarea = $(this);
        data["files"][textarea.data("filename")] = {};
        data["files"][textarea.data("filename")]["content"] = textarea.val();
      });

      $.ajax({
        url: url,
        type: "PATCH",
        data: JSON.stringify(data),
        success: function(gist){
          $("#loading").hide();
          $("#done").show();
          setTimeout("$('#done').slideUp();", 2000);
        }
      });

      e.preventDefault();
    },

    login: function(access_token, token_type){
      if(access_token ==  helper.cookie.read("access_token")){
        return;
      }
      helper.cookie.create("access_token", access_token);
      helper.cookie.create("token_type", token_type);
      $.ajax({
        url: helper.githubUrl("/user"),
        success: function(data){
          helper.cookie.create("current_user", JSON.stringify(data))
          getMyGist.updateUserInfo();
        }
      });
    },
    updateUserInfo: function() {
      var currentUser = JSON.parse(helper.cookie.read("current_user"));
      if(currentUser && currentUser.name){
        $("#current_user img").attr("src", currentUser.avatar_url)
          .attr("title", currentUser.name + " ("+currentUser.login+")")
        $("#current_user").fadeIn(2000);
      }
    }
  };


  var helper = {
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

  $(document).ready(function(){
    var page = helper.parseQueryString(window.location.search);
    getMyGist.page.goTo(page);

    helper.userIsLogged() ? $("a#myGists").show() : $("a#login").show()

    $("#login").click(function(){
      window.location = "https://github.com/login/oauth/authorize?client_id="+ github().clientId +"&scope="+ github().scope;
    });

    $("#gistEdit form.edit").submit(getMyGist.update);
  });
})(jQuery);
