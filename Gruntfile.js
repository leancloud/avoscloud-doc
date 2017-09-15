'use strict';
var axios = require('axios');
var serveStatic = require('serve-static');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var proxySnippet = require("grunt-connect-proxy/lib/utils").proxyRequest;
var mountFolder = function(connect, dir) {
    return serveStatic(require('path').resolve(dir));
  };
module.exports = function(grunt) {

  require("jit-grunt")(grunt, {
    configureProxies: "grunt-connect-proxy",
    useminPrepare: "grunt-usemin",
    "npm-contributors": "grunt-npm"
  });

  require("time-grunt")(grunt);

  var hostMap = {
    'us': 'us-api.leancloud.cn',
    'cn': "{{v2Domain}}",
    'qcloud': 'tab.leancloud.cn'
  }
  console.log('current theme --- '+grunt.option('theme'))

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    JSSDKVersion: undefined,
    clean: {
      html: {
        files: [{
          src: ["dist/*.html"]
        }]
      },
      dist: {
        files: [{
          dot: true,
          src: ["dist/*"]
        }

        ]
      }

    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        compress: {
          drop_console: true
        }
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      options: {
        livereload: 35738
      },
      md: {
        files: ["md/**","md/kb/*.md"],
        tasks: ['copy:md', 'markdown', 'assemble']
      },
      asset: {
        files: ["custom/**", "images/**"],
        tasks: ["copy:asset"]
      },
      less: {
        files: ["custom/less/**"],
        tasks: ["less:server", "postcss", "copy:asset"]
      },
      jst: {
        files: ["templates/template.jst"],
        tasks: ["markdown", "dom_munger"]
      },
      html: {
        files: ["templates/**"],
        tasks: ["clean:html", "markdown", "assemble","comment"]
      },
      nunjucks: {
        files: ["views/**","views/kb/**"],
        tasks: ['nunjucks']
      }
    },
    copy: {
      md: {
        files: [{
          expand: true,
          cwd: "md",
          src: "**",
          dest: "dist/md"
        }]
      },
      asset: {
        files: [{
          expand: true,
          src: "custom/**",
          dest: "dist/"
        }, {
          expand: true,
          src: "images/**",
          dest: "dist/"
        }, {
          expand: true,
          src: "fonts/**/*.*",
          dest: "dist/"
        }

        ]
      }
    },
    assemble: {
      options: {
        engine: 'swig',
        swig: {
          varControls: ["<%=", "%>"],
          cache: false
        },
        layoutdir: 'templates/layouts/',
        layout: ['template.swig'],
        node: grunt.option('theme'),
        flatten: true
      },
      md: {
        src: ['dist/*.html','!dist/md/*.html'],
        dest: 'dist/'
      },/*
      kb: {
        options: {
          layoutdir: 'templates/layouts/',
          layout: 'kb.swig'
        },
        src: ['dist/kb/*.html'],
        dest: 'dist/'
      },*/
      html: {
        src: ['templates/pages/*'],
        dest: 'dist/'
      }
    },
    markdown: {
      all: {
        files: [{
          expand: true,
          cwd: "dist/md",
          src: '*.md',
          dest: 'dist/',
          ext: '.html'
        },{
          expand: true,
          cwd: "dist/md/start",
          src: '*.md',
          dest: 'dist/start',
          ext: '.html'
        },/*
        {
          expand: true,
          cwd: "dist/md/kb",
          src: '*.md',
          dest: 'dist/kb',
          ext: '.html'
        }*/],
        options: {
          template: 'templates/md.jst'
        }
      }
    },
    comment:{
      md: {
        src: ['dist/*.html', '!dist/demo.html']
      }
    },
    less: {
      server: {
        options: {
          dumpLineNumbers: "comments"
        },
        files: {
          "custom/css/app-docs.css": ["custom/less/app-docs.less"]
        }
      },
      dist: {
        files: {
          "custom/css/app-docs.css": ["custom/less/app-docs.less"]
        }
      }
    },
    postcss: {
      server: {
        src: "custom/css/app-docs.css",
        options: {
          processors: [
            require("autoprefixer")({
              browsers: "last 1 versions"
            })
          ]
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          "custom/css/app-docs.css": ["custom/css/app-docs.css"]
        }
      }
    },
    usemin: {
      html:['dist/*.html'],
      options: {
        dest: "dist/",
        root: "dist/"
      }
    },
    useminPrepare: {
      html:['dist/*.html'],
      options: {
        dest: "dist/",
        root: "dist"
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: "0.0.0.0",
        open: {
          target: "http://localhost:9000"
        }
      },
      proxies: [
        {
          context: "/1",
          host: "leancloud.cn",
          port: 443,
          https: true,
          changeOrigin: true
        }
      ],
      livereload: {
        options: {
          middleware: function(connect) {
            return [
            proxySnippet,
            // require('connect-livereload')(), // <--- here
            mountFolder(connect, 'dist')];
          }
        }
      }
    },
    nunjucks: {
      precompile: {
        baseDir: 'views',
        src: ['views/*.md', 'views/start/*.md', 'views/kb/*.md'],
        destDir: 'md',
        options:{
          data:{
            jssdkversion: '<%= JSSDKVersion %>',
            node: grunt.option('theme'),
            appid: '{{appid}}',
            appkey: '{{appkey}}',
            masterkey: '{{masterkey}}',
            sign_masterkey: "{{sign_masterkey}}",
            sign_appkey: '{{sign_appkey}}',
            host: hostMap[grunt.option('theme')] || hostMap['cn']
          }
        }
      }
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: "angular"
        }
      },
      dist: {
        src: "CHANGELOG.md"
      }
    },

    bump: {
      options: {
        files: ["package.json"],
        commitMessage: 'chore: release v%VERSION%',
        commitFiles: ["-a"],
        tagMessage: 'chore: create tag %VERSION%',
        push: false
      }
    },

    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    },
    docmeta: {
      src: ["dist/*.html", "!dist/demo.html"]
    }
  });

  grunt.registerTask("test", ["build"]);

  grunt.registerTask("default", ["build"]);

  grunt.registerTask('ensureSDKVersion', function() {
    var done = this.async();
    if (grunt.config.get('JSSDKVersion')) return done();
    axios.get('http://registry.npm.taobao.org/leancloud-storage/latest').then(function(response){
      grunt.log.oklns(response.data.version);
      grunt.config.set('JSSDKVersion', response.data.version);
      done();
    });
  });

grunt.registerMultiTask('docmeta', '增加 Title、文档修改日期、设置首页内容分类导航', function() {
    grunt.task.requires('assemble');
    const cheerio = require('cheerio');
    const path = require('path');
    const fs = require('fs');
    const crypto = require('crypto');
    const moment = require('moment');
    moment.locale('zh-cn');
    //require('moment/locale/zh-cn');
    //const done = this.async();
    const sourceDir = 'views/';
    const files = this.filesSrc;

    files.forEach(function(filePath) {
      let changes = [];
      let file = path.parse(filePath); 
      // filePath: "dist/realtime_guide-js.html"
      //   root: ''
      //   dir: 'dist'
      //   base: 'realtime_guide-js.html'
      //   ext: '.html'
      //   name: 'realtime_guide-js'
      let content = grunt.file.read(filePath);
      let $ = cheerio.load(content, { decodeEntities: false });
      const version = crypto.createHash('md5').update($.html(), 'utf8').digest('hex');
 
      // 首页：内容分类导航 scrollspy
      if ( file.base.toLowerCase() === 'index.html' ){
        let $sectionNav = $('#section-nav').find('ul');
        $('#tab-docs').find('.section-title').each(function(index, el) {
          let $el = $(el);
          let id = $el.text().replace(/ /g,'-').replace(/[^a-zA-Z_0-9\u4e00-\u9fa5]/g,'-');
          $el.attr('id',id);
          $sectionNav.append('<li><a href="#' + id + '">' + $el.html() + '</a></li>');
        });
        changes.push('scrollspy');

      } // 更新标题更新为「h1 - LeanCloud 文档」（首页除外）
      else {
        // 2017-02-06 如果 h1 不存在就不更新 title，如 start.html
        let h1 = $('.doc-content h1');
        if ( h1.length ){
          $('title').text(function(){
            // do not use html()
            return h1.first().text() + ' - ' + $(this).text();
          });
          changes.push('title');
        } 
      }

      // 文档修改日期 ----------------------  
      // 例如 dist/realtime_guide-js.html => views/realtime_guide-js.md
      const sourceFilePath = sourceDir + file.name + '.md';
      var modifiedTime = "";

      if ( grunt.file.exists(sourceFilePath) ){
        modifiedTime = fs.lstatSync(path.resolve(sourceFilePath)).mtime;
        // 查找是否有对应的主模板（.tmpl）
        // dist/realtime_guide-js.html => views/realtime_guide.tmpl
        let tmplFilePath = file.name.lastIndexOf('-') > -1?path.join(sourceDir,file.name.substr(0, file.name.lastIndexOf('-')) + '.tmpl'):'';

        // 如果有主模板，取回其修改日期
        if ( tmplFilePath.length && grunt.file.exists(tmplFilePath) ){
          let tmplModifiedTime = fs.lstatSync(path.resolve(tmplFilePath)).mtime;
          //console.log(tmplModifiedTime, modifiedTime);
          // 如果 tmpl 修改日期新于子文档，子文档使用 tmpl 的修改日期
          if ( tmplModifiedTime && modifiedTime && tmplModifiedTime.getTime() > modifiedTime.getTime() ){
            modifiedTime = tmplModifiedTime;
            changes.push('tmpl-newer');
          }
        }

        if ( modifiedTime ){
          //$('.docs-meta').find('.doc-mdate').remove().end()
          $('.docs-meta').append('<span class="doc-mdate" data-toggle="tooltip" title="'+ moment(modifiedTime).format('lll') + '">更新于 <time datetime="' + moment(modifiedTime).format() + '">' + moment(modifiedTime).format('l') + '</time></span>');
          changes.push('modified');
        }

      }
      else {
        changes.push('no-md');
      }

      // 如果文档内容有改动，重新生成
      if ( version !== crypto.createHash('md5').update($.html(), 'utf8').digest('hex') ){
        grunt.file.write(filePath, $.html());
      }
      // 打印所有文件及所执行的操作
      grunt.log.writeln(filePath + ' (' + changes.join(',') + ')');

    });
  });

  grunt.registerTask("build", "Main build", function() {
    grunt.task.run([
      "clean", "ensureSDKVersion", "nunjucks", "copy:md", "markdown", "assemble", "docmeta"
    ]);
    if (!grunt.option("no-comments")) {
      grunt.task.run(["comment"]);
    }
    grunt.task.run([
      "less:dist", "postcss", "cssmin", "copy:asset",
      "useminPrepare", 'concat:generated', "uglify:generated", "usemin"
    ]);
  });

  grunt.registerTask("localBuild",[
    "clean", "ensureSDKVersion", "nunjucks", "copy:md", "markdown", "assemble",
    "less:dist", "postcss", "copy:asset","docmeta"
  ]);

  // leave out ensureSDKVersion in case of internet disconnection
  // also not generating docmeta for faster rendering
  grunt.registerTask("dev",[
    "clean", "nunjucks", "copy:md", "markdown", "assemble",
    "less:dist", "postcss", "copy:asset",
    "less:server","configureProxies", "connect:livereload", "watch"
  ]);

  grunt.registerTask("serve", ["localBuild", "less:server","configureProxies", "connect:livereload", "watch"]);

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` instead.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('release', 'bump, changelog and release', function(type) {
    grunt.task.run([
      'npm-contributors',
      'bump:' + (type || 'patch') + ':bump-only',
      'conventionalChangelog',
      'bump-commit'
    ]);
  });

  grunt.registerMultiTask('comment','add version info',function(){
    grunt.task.requires('assemble');
    var Promise = require('bluebird');
    var comment = require('./comment');
    var docEnv = process.env.DOC_ENV || 'default';
    grunt.log.writeln('Doc site: ', docEnv);
    var done = this.async();
    var self = this;

    comment.release(docEnv)
    .then(function(release) {
      return Promise.map(self.filesSrc, function(filepath) {
        grunt.log.writeln(filepath);
        var fileName = filepath.slice(filepath.lastIndexOf('/') + 1);
        var content = grunt.file.read(filepath);
        return comment.addCommentIdToDoc(fileName, content, release)
        .then((newContent) => {
          grunt.file.write(filepath, newContent);
        })
        .catch(function(err) {
          grunt.log.error('err: %s', err.message, filepath);
        })
      }, {concurrency: 4})
    })
    .then(done)
    .catch(function(err) {
      grunt.log.error('err: %s', err.stack || err.message || err);
      done();
    })
  });

};
