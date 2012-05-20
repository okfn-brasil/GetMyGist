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
            url: helpers.githubUrl("/gists"),
            success: function(gists){
              $.each(gists, function(i, gist){
               var javascriptFiles = helpers.javascriptFiles(gist.files);
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
              url = helpers.githubUrl("/gists/" + id);
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

              var javascriptFiles = helpers.javascriptFiles(gist.data.files);
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
            url: helpers.githubUrl("/gists/"+id),
            dataType: "jsonp",
            success: function(gist) {
              var javascriptFiles = helpers.javascriptFiles(gist.data.files);
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
          url = helpers.githubUrl("/gists/"+gistId),
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
      if(access_token ==  helpers.cookie.read("access_token")){
        return;
      }
      helpers.cookie.create("access_token", access_token);
      helpers.cookie.create("token_type", token_type);
      $.ajax({
        url: helpers.githubUrl("/user"),
        success: function(data){
          helpers.cookie.create("current_user", JSON.stringify(data))
          getMyGist.updateUserInfo();
        }
      });
    },
    updateUserInfo: function() {
      var currentUser = JSON.parse(helpers.cookie.read("current_user"));
      if(currentUser && currentUser.name){
        $("#current_user img").attr("src", currentUser.avatar_url)
          .attr("title", currentUser.name + " ("+currentUser.login+")")
        $("#current_user").fadeIn(2000);
      }
    }
  };

  $(document).ready(function(){
    var page = helpers.parseQueryString(window.location.search);
    getMyGist.page.goTo(page);

    helpers.userIsLogged() ? $("a#myGists").show() : $("a#login").show()

    $("#login").click(function(){
      window.location = "https://github.com/login/oauth/authorize?client_id="+ github().clientId +"&scope="+ github().scope;
    });

    $("#gistEdit form.edit").submit(getMyGist.update);
  });
})(jQuery);
