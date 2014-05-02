'use strict';

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'node_modules/wolfy87-eventemitter/EventEmitter.js',
          'node_modules/conducto-client/node_modules/httpclient/lib/browser.js',
          'node_modules/conducto-client/node_modules/httpclient/index.js',
          'node_modules/conducto-client/node_modules/httpclient/lib/utils.js',
          'node_modules/conducto-client/node_modules/conducto-core/index.js',
          'node_modules/conducto-client/node_modules/conducto-core/lib/utils.js',
          'node_modules/conducto-client/node_modules/conducto-core/lib/Connection.js',
          'node_modules/conducto-client/lib/Client.js',
          'lib/PhoneNumber/PhoneNumberMetaData.js',
          'lib/PhoneNumber/PhoneNumberNormalizer.js',
          'lib/PhoneNumber/PhoneNumber.js',
          'lib/index.js',
          'lib/webrtc.js',
        ],
        dest: 'dist/upptalk.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'dist/upptalk.min.js': ['dist/upptalk.js']
        },
        options: {
          sourceMap: true
        }
      }
    },

    jshint: {
      files:[
        '*.json',
        '*.js',
        'bin/upptalk',
        'lib/*.js',
        'test/**/*.js',
        'example/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec',
        ui: 'tdd',
        bail: true,
        timeout: 20000,
        'check-leaks': true
      },
      src: ['test/**/*.js']
    },

    watch: {
      scripts: {
        files: "<%= concat.dist.src %>",
        tasks: ['jsvalidate', 'build'],
        options: {
          spawn: false,
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('syntax', ['jshint']);
  grunt.registerTask('test', ['mocha', 'jshint']);
  grunt.registerTask('default', 'test');

  grunt.registerTask('build', ['concat', 'uglify']);
};
