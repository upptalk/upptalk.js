'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: [
      'yuilop.js',
      'yuilop.min.js'
    ],
    concat: {
      dist: {
        src: [
          'PhoneNumber.js/PhoneNumberMetaData.js',
          'PhoneNumber.js/PhoneNumberNormalizer.js',
          'PhoneNumber.js/PhoneNumber.js',
          'node_modules/wolfy87-eventemitter/EventEmitter.js',
          'node_modules/request.js/lib/index.js',
          'node_modules/conducto/lib/utils.js',
          'node_modules/conducto/lib/Connection.js',
          'node_modules/conducto/lib/Client.js',
          'lib/index.js',
        ],
        dest: 'yuilop.js'
      }
    },
    uglify: {
      my_target: {
        files: {
          'yuilop.min.js': ['yuilop.js']
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
            'lib/**/*.js',
            'test/**/*.js',
          ]
        }
      }
    },
    jshint: {
      files:[
        'package.json',
        'Gruntfile.js',
        'lib/**/*.js',
        'test/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
        ignores: ['node_modules/**.js']
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
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('mocha', ['mochaTest']);
  grunt.registerTask('syntax', ['jsvalidate', 'jshint']);
  grunt.registerTask('test', ['jsvalidate', 'mocha', 'jshint']);
  grunt.registerTask('default', 'test');

  grunt.registerTask('build', ['concat', 'uglify']);
};
