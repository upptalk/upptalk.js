'use strict';

module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'bower_components/conducto/dist/conducto.js',
          'lib/PhoneNumber/PhoneNumberMetaData.js',
          'lib/PhoneNumber/PhoneNumberNormalizer.js',
          'lib/PhoneNumber/PhoneNumber.js',
          'index.js',
          'lib/actions/*.js',
          'lib/UppTalk.js',
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
