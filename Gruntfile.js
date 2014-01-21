'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: [
      'upptalk.js',
      'upptalk.min.js'
    ],
    concat: {
      dist: {
        src: [
          'PhoneNumber.js/PhoneNumberMetaData.js',
          'PhoneNumber.js/PhoneNumberNormalizer.js',
          'PhoneNumber.js/PhoneNumber.js',
          'node_modules/wolfy87-eventemitter/EventEmitter.js',
          'node_modules/conducto-client/node_modules/httpclient/lib/xhr.js',
          'node_modules/conducto-client/node_modules/httpclient/index.js',
          'node_modules/conducto-client/node_modules/httpclient/lib/utils.js',
          'node_modules/conducto-client/node_modules/conducto-core/index.js',
          'node_modules/conducto-client/node_modules/conducto-core/lib/utils.js',
          'node_modules/conducto-client/node_modules/conducto-core/lib/Connection.js',
          'node_modules/conducto-client/lib/Client.js',
          'lib/index.js',
        ],
        dest: 'upptalk.js'
      }
    },
    uglify: {
      my_target: {
        files: {
          'upptalk.min.js': ['upptalk.js']
        }
      }
    },
    jsvalidate: {
      options:{
        globals: {},
        esprimaOptions: {},
        verbose: true
      },
      targetName:{
        files:{
          src:[
            'PhoneNumber.js/**/*.js',
            'Gruntfile.js',
            // 'bin/upptalk', FIXME no support for shebang in esprima
            'lib/**/*.js',
            'test/**/*.js',
          ]
        }
      }
    },
    jshint: {
      files:[
        'package.json',
        'bower.json',
        'Gruntfile.js',
        'bin/upptalk',
        'lib/**/*.js',
        'test/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          ui: 'tdd',
          bail: true,
          timeout: 20000,
          'check-leaks': true
        },
        src: ['test/**/*.js']
      }
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
    githooks: {
      all: {
        'pre-commit': 'syntax'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-githooks');

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('syntax', ['jsvalidate', 'jshint']);
  grunt.registerTask('test', ['jsvalidate', 'jshint',  'mocha']);
  grunt.registerTask('default', 'test');

  grunt.registerTask('build', ['concat', 'uglify']);
};
