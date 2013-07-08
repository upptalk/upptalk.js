'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        '*.js',
        '*.json',
      ]
    },
    jsvalidate: {
      files: ['*.js', 'src/**/*.js']
    },
    clean: {
      build: {
        src: ['build']
      }
    },
    concat: {
      dist: {
        src: ['bower_components/lightstring/lightstring.js', 'src/yuilop.js'],
        dest: 'build/yuilop.js'
      }
    },
    uglify: {
      my_target: {
        files: {
          'build/yuilop.min.js': ['build/yuilop.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsvalidate');

  grunt.registerTask('build', ['clean', 'concat', 'uglify']);
};
