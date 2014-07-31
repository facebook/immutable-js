/**
 *
 *   grunt lint      Lint all source javascript
 *   grunt clean     Clean dist folder
 *   grunt build     Build dist javascript
 *   grunt test      Test dist javascript
 *   grunt default   Lint, Build then Test
 *
 */
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        asi: true,
        curly: false,
        eqeqeq: true,
        eqnull: true,
        esnext: true,
        expr: true,
        forin: true,
        freeze: true,
        immed: true,
        indent: 2,
        iterator: true,
        noarg: true,
        node: true,
        noempty: true,
        nonstandard: true,
        trailing: true,
        undef: true,
        unused: 'vars'
      },
      all: ['src/**/*.js']
    },
    clean: {
      build: ['dist/']
    },
    react: {
      options: {
        harmony: true
      },
      build: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['**/*.js'],
            dest: 'dist/'
          }
        ]
      }
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'type-definitions',
            src: ['**/*.d.ts'],
            dest: 'dist/'
          }
        ]
      }
    },
    jest: {
      options: {
        testPathPattern: /.*/
      }
    },
    browserify: {
      standalone: {
        src: ['dist/Immutable.js'],
        dest: 'dist/browserify/<%= pkg.name %>-<%= pkg.version %>.js',
        options: {
          bundleOptions: {
            standalone: 'Immutable'
          }
        }
      }
    },
    uglify: {
      standalone: {
        files: {
          'dist/browserify/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/browserify/<%= pkg.name %>-<%= pkg.version %>.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-jest');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('lint', 'Lint all source javascript', ['jshint']);
  grunt.registerTask('build', 'Build distributed javascript', ['clean', 'react', 'copy', 'browserify', 'uglify']);
  grunt.registerTask('test', 'Test built javascript', ['jest']);
  grunt.registerTask('default', 'Lint, build and test.', ['lint', 'build', 'test']);
};
