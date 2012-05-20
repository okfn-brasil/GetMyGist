(function($){
  var getMyGist = {
    currentUser: {
      info: function(){
        return JSON.parse(helpers.cookie.read("current_user"));
      },
      login: function(access_token, token_type){
        if(access_token == helpers.cookie.read("access_token")){
          return;
        }
        helpers.cookie.create("access_token", access_token);
        helpers.cookie.create("token_type", token_type);
        $.ajax({
          url: github().url("/user"),
          success: function(data){
            helpers.cookie.create("current_user", JSON.stringify(data))
            getMyGist.currentUser.updateInfo();
          }
        });
      },
      isLogged: function() {
        return !!helpers.cookie.read("access_token");
      },
      updateInfo: function() {
        var currentUser = this.info();
        if(currentUser && currentUser.name){
          $("#current_user img").attr("src", currentUser.avatar_url)
            .attr("title", currentUser.name + " ("+currentUser.login+")")
          $("#current_user").fadeIn(2000);
        }
      }
    },
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
            getMyGist.currentUser.login(params.access_token, params.token_type);
          }
          $.ajax({
            url: github().url("/gists"),
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
              url = github().url("/gists/" + id);
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
            url: github().url("/gists/"+id),
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
        getMyGist.currentUser.updateInfo();
        this.pages[page](queryString);
      }
    },
    update: function(e){
      $("#loading").slideDown();
      var gistId = $(this).attr("id"),
          url = github().url("/gists/"+gistId),
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
    }
  };

  $(document).ready(function(){
    var page = helpers.parseQueryString(window.location.search);
    getMyGist.page.goTo(page);

    getMyGist.currentUser.isLogged() ? $("a#myGists").show() : $("a#login").show()

    $("#login").click(function(){
      window.location = "https://github.com/login/oauth/authorize?client_id="+ github().clientId +"&scope="+ github().scope;
    });

    $("#gistEdit form.edit").submit(getMyGist.update);
  });
})(jQuery);
