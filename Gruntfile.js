module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    meta: {
      banner: "/*!\n * <%= pkg.title %> v<%= pkg.version %> - " +
      "<%= grunt.template.today('yyyy-mm-dd') %> - <%= pkg.description %>\n" +
      " *\n" +
      " * <%= pkg.homepage %>\n" +
      " *\n" +
      " * Copyright <%= grunt.template.today('yyyy') %> <%= pkg.author %>\n" +
      " * Released under the <%= pkg.license %> license.\n */\n\n"
    },
    browserify: {
      dev: {
        src: ['src/ui.js'],
        dest: 'dist/main.js',
        options: {
          watch: true,
          transform: ['node-underscorify'],
          bundleOptions: {
            debug: true
          }
        }
      },
      prod: {
        src: ['src/*.js'],
        dest: 'dist/main.js',
        options: {
          transform: ['node-underscorify']
        }
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      dist: {
        src: ['dist/main.js', 'vendors/benchmark.js'],
        dest: 'dist/main.js',
      }
    },

    watch: {
      browserify: {
        files: ['src/**/*.js', 'src/**/*.html'],
        tasks: ['browserify:dev', 'concat']
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['browserify:prod', 'concat']);
};
