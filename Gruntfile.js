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
    'cn': 'api.leancloud.cn',
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
        files: ["md/**"],
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
        files: ["views/**"],
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
      },
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
        }],
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
        src: ['views/*.md', 'views/start/*.md'],
        destDir: 'md',
        options:{
          data:{
            jssdkversion: '<%= JSSDKVersion %>',
            node: grunt.option('theme'),
            appid: '{{appid}}',
            appkey: '{{appkey}}',
            masterkey: '{{masterkey}}',
            host: hostMap[grunt.option('theme')] || 'api.leancloud.cn'
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

  grunt.registerTask("build", "Main build", function() {
    grunt.task.run([
      "clean", "ensureSDKVersion", "nunjucks", "copy:md", "markdown", "assemble",
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
    "less:dist", "postcss", "copy:asset"
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
    // console.log('comment task',this.files,this.filesSrc);
    var cheerio = require('cheerio');
    var crypto = require('crypto');
    var _ = require('underscore');
    var AV = require('avoscloud-sdk').AV;
    AV.initialize("749rqx18p5866h0ajv0etnq4kbadodokp9t0apusq98oedbb", "axxq0621v6pxkya9qm74lspo00ef2gq204m5egn7askjcbib");
    // test project
    //AV.initialize("0siycem2w0l2zem2z5crxl7602zkf1r2a8qsooigq2my1al1", "4ipiwns1939nw2cgist4s49li89dvadrlrgthfvqmgzcaax5");
    var Doc = AV.Object.extend('Doc');
    var Snippet = AV.Object.extend('Snippet');
    var commentDoms = ['p','pre'];
    var done = this.async();

    function initDocVersion(filepath, allSnippetsVersion){
      var file = filepath;
      var content = grunt.file.read(filepath);
      var $ = cheerio.load(content);
      var docVersion = crypto.createHash('md5').update($('#content').text()).digest('hex');
      // console.log(docVersion)
      $('html').first().attr('version', docVersion);

      //以 docversion 为唯一标识，当文档内容发生变化，docversion 相应变化，
      var query = new AV.Query(Doc);
      query.equalTo('version', docVersion);
      return query.first().then(function(doc) {
        if (doc) {
          // 如果 doc 已经存在，则直接返回
          return AV.Promise.as();
        }
        doc = new Doc();
        doc.set('version', docVersion);
        var snippets = [];
        commentDoms.forEach(function(dom) {
          $('#content ' + dom).each(function() {
            if($(this).text().trim().length > 0) {
              var version = crypto.createHash('md5').update($(this).text()).digest('hex');
              snippets.push({version: version});
            }
          });
        });
        doc.set('snippets', snippets);
        //文件名，以及段落 snippet 信息更新
        doc.set('file', file.split('/').pop());
        grunt.log.writeln('save new Doc: %s', file);
        return doc.save();
      }).then(function() {
        // 在文档中添加 version 标记
        commentDoms.forEach(function(dom) {
          $('#content ' + dom).each(function() {
            if($(this).text().trim().length > 0) {
              var version = crypto.createHash('md5').update($(this).text()).digest('hex');
              $(this).attr('id', version);
              $(this).attr('version', version);
            }
          });
        });
        grunt.file.write(filepath, $.html());
        return AV.Promise.as();
      }).then(function() {
        var promises = [];
        // 保存 snippet version 和 content 的关联
        commentDoms.forEach(function(dom) {
          $('#content ' + dom).each(function() {
            var version = crypto.createHash('md5').update($(this).text()).digest('hex');
            if(_.contains(allSnippetsVersion, version)) {
              return;
            }
            if($(this).text().trim().length === 0) {
              return;
            }
            grunt.log.writeln('save new Snippet: %s', $(this).text().substr(0, 20) + '...');
            promises.push(new Snippet().save({
              snippetVersion: version,
              content: $(this).text(),
              file: filepath.split('/').pop()
            }));
          });
        });
        return AV.Promise.all(promises);
      });
    }
    var self = this;
    // 查询所有已存在的 snippet version，
    // 用来判断哪些是新的 snippet，然后将其 version 和 content 添加到数据库
    var snippetsVersion = [];
    var getSnippetsVersion = function(skip) {
      return AV.Query.doCloudQuery('select snippetVersion from Snippet limit ?, ?', [skip, 1000]).then(function(result) {
        if(result.results.length === 0) {
          return AV.Promise.as();
        }
        _.each(result.results, function(snippet) {
          snippetsVersion.push(snippet.get('snippetVersion'));
        });
        return getSnippetsVersion(snippetsVersion.length);
      });
    };
    getSnippetsVersion(0).then(function() {
      grunt.log.writeln('current snippets count:', snippetsVersion.length);
      var allPromise = [];
      self.filesSrc.forEach(function(filepath) {
        allPromise.push(initDocVersion(filepath, snippetsVersion));
      });
      return AV.Promise.all(allPromise);
    }).then(function() {
      //保证所有文档都处理完再进行任务完成回调
      grunt.log.writeln('version build allcompleted');
      done();
    }).catch(function(err){
      grunt.log.error('err: %s', err.stack || err.message || err);
      done();
    });
  });


};
