$(function(){
    prettyPrepare();
    refactDom();
    prettyPrint();
    glueCopy();
    // $(body).html($com)
    function refactDom(){
        $("pre.prettyprint code").each(function(index, ele) {
          $(ele).after("<div class='doc-example-action'><button class='copybtn'><span class='icon icon-clipboard'></span></button></div>");
          var appsStr = " <div class='doc-example-selector' ng-show='apps.length' ><span>选择应用 <select ng-model='currentApp' ng-options='app.app_name for app in apps'></select></span>";
          if($(ele).text().indexOf('{{appid}}')>-1){
            $(ele).after(appsStr);
          }
        });
        // code pretty
    }

    function prettyPrepare(){
        var pres = document.getElementsByTagName("pre");
        for (var i = 0; i < pres.length; i++) {
            pres[i].className = "prettyprint";

        }


    }
    function glueCopy(){
        $(function() {
          var clip = new ZeroClipboard();
          clip.glue($(".copybtn"));
          clip.on("mousedown", function(client, args) {
            $(this).parents("pre.prettyprint").removeClass("active")
            clip.setText($(this).parents("pre").find("code").text());
          });
          clip.on("complete", function() {
            $(this).parents("pre.prettyprint").addClass("active");
          });
          clip.on('noflash', function() {
            $(".copybtn").hide();
          });
        });
    }
});

