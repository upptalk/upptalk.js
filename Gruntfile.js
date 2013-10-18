'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // jshint: {
    //   all: [
    //     '*.js',
    //     '*.json',
    //   ]
    // },
    // jsvalidate: {
    //   files: ['*.js', 'src/**/*.js']
    // },
    // clean: {
    //   build: {
    //     src: ['build']
    //   }
    // },
    concat: {
      dist: {
        src: [
          'node_modules/conducto/node_modules/wolfy87-eventemitter/EventEmitter.js',
          'node_modules/conducto/lib/utils.js',
          'node_modules/conducto/lib/Connection.js',
          'node_modules/conducto/lib/Client.js',
          'lib/index.js',
        ],
        dest: 'yuilop.js'
      }
    },
    // uglify: {
    //   my_target: {
    //     files: {
    //       'build/yuilop.min.js': ['build/yuilop.js']
    //     }
    //   }
    // }
  });

  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.registerTask('concat')
  // grunt.registerTask('build', ['clean', 'concat', 'uglify']);
};
