var sys = require('sys');
var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: [
          'src/**/*.js',
          'test/**/*.*'
        ],
        tasks: ['test'],
        options: { nospawn: true }
      }
    },
    qunit:{
      target: {
        src: ['test/**/*.html']
      },
      options: {
        '--web-security' : false,
        '--local-to-remote-url-access' : true,
        '--ignore-ssl-errors' : true
      }
    },
    clean: {
      test: ['test/converge.js']
    },
    requirejs: {
      compile: {
        options: {
          almond: true,
          name: '../node_modules/almond/almond',
          baseUrl: "src",
          optimize: "uglify",
          out: "./dist/converge.js",
          include: ["converge"],
          wrap: {
            startFile: ["./build/start.frag", "./build/license.frag"],
            endFile: "./build/end.frag"
          }
        }
      },
      compileForTest: {
        options: {
          almond: true,
          name: '../node_modules/almond/almond',
          baseUrl: "src",
          out: "./test/converge.js",
          optimize: 'none',
          include: ["converge"],
          wrap: {
            startFile: ["./build/start.frag"],
            endFile: "./build/end.frag"
          }
        }
      }
    },
    // configure jshint task
    jshint: {
      options: {
        asi: false,
        bitwise: false,
        boss: false,
        browser: true,
        couch: false,
        curly: true,
        debug: false,
        devel: false,
        eqeqeq: true,
        eqnull: false,
        evil: false,
        expr: false,
        forin: false,
        globalstrict: true,
        globals: { "define": true },
        immed: true,
        jquery: true,
        latedef: true,
        laxbreak: false,
        loopfunc: false,
        mootools: false,
        newcap: false,
        noarg: true,
        node: false,
        noempty: false,
        nonew: true,
        nonstandard: true,
        nomen: false,
        onevar: false,
        passfail: false,
        plusplus: false,
        prototypejs: false,
        regexdash: true,
        regexp: false,
        rhino: false,
        undef: true,
        shadow: true,
        strict: false,
        sub: true,
        supernew: false,
        trailing: true,
        white: false,
        wsh: false,
        indent: 2
      },
      target: {
        src: ['src/**/*.js']
      }
    },
    express: {
      testServer: {
        options: {
          server: path.resolve(__dirname, 'test/server.js'),
          port: 8000
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-express');

  grunt.registerTask('test', ['jshint', 'requirejs:compile', 'requirejs:compileForTest', 'qunit', 'clean']);
  grunt.registerTask('build', ['express', 'test']);
  grunt.registerTask('default', ['express', 'watch']);
};
