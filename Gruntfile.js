var exec = require('child_process').exec;
var fs = require('fs');
var rollup = require('rollup');
var uglify = require('uglify-js');

var declassify = require('./resources/declassify');
var stripCopyright = require('./resources/stripCopyright');

/**
 *
 *   grunt clean     Clean dist folder
 *   grunt build     Build dist javascript
 *   grunt default   Build then Test
 *
 */
module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      build: ['dist/*']
    },
    bundle: {
      build: {
        files: [{
          src: 'src/Immutable.js',
          dest: 'dist/immutable'
        }]
      }
    },
    copy: {
      build: {
        files: [{
          src: 'type-definitions/Immutable.d.ts',
          dest: 'dist/immutable.d.ts'
        },{
          src: 'type-definitions/immutable.js.flow',
          dest: 'dist/immutable.js.flow'
        }]
      }
    },
  });

  grunt.registerMultiTask('bundle', function () {
    var done = this.async();

    this.files.map(function (file) {
      rollup.rollup({
        entry: file.src[0],
        plugins: [
          {
            transform: function(source) {
              return declassify(stripCopyright(source));
            }
          }
        ]
      }).then(function (bundle) {
        var copyright = fs.readFileSync('resources/COPYRIGHT');

        var bundled = bundle.generate({
          format: 'umd',
          banner: copyright,
          moduleName: 'Immutable'
        }).code;

        var es6 = require('es6-transpiler');

        var transformResult = require("es6-transpiler").run({
          src: bundled,
          disallowUnknownReferences: false,
          environments: ["node", "browser"],
          globals: {
            define: false,
            Symbol: false,
          },
        });

        if (transformResult.errors && transformResult.errors.length > 0) {
          throw new Error(transformResult.errors[0]);
        }

        var transformed = transformResult.src;

        fs.writeFileSync(file.dest + '.js', transformed);

        var minifyResult = uglify.minify(transformed, {
          fromString: true,
          mangle: {
            toplevel: true
          },
          compress: {
            comparisons: true,
            pure_getters: true,
            unsafe: true
          },
          output: {
            max_line_len: 2048,
          },
          reserved: ['module', 'define', 'Immutable']
        });

        var minified = minifyResult.code;

        fs.writeFileSync(file.dest + '.min.js', copyright + minified);
      }).then(function(){ done(); }, function(error) {
        grunt.log.error(error.stack);
        done(false);
      });
    });
  });

  grunt.registerTask('typedefs', function () {
    var fileContents = fs.readFileSync('type-definitions/Immutable.d.ts', 'utf8');
    var nonAmbientSource = fileContents
      .replace(
        /declare\s+module\s+Immutable\s*\{/,
        '')
      .replace(
        /\}[\s\n\r]*declare\s+module\s*.immutable.[\s\n\r]*{[\s\n\r]*export\s*=\s*Immutable[\s\n\r]*\}/m,
      '');
    fs.writeFileSync('dist/immutable-nonambient.d.ts', nonAmbientSource);
  });

  function execp(cmd) {
    return new Promise((resolve, reject) =>
      exec(cmd, (error, out) => error ? reject(error) : resolve(out))
    );
  }

  grunt.registerTask('stats', function () {
    Promise.all([
      execp('cat dist/immutable.js | wc -c'),
      execp('git show master:dist/immutable.js | wc -c'),
      execp('cat dist/immutable.min.js | wc -c'),
      execp('git show master:dist/immutable.min.js | wc -c'),
      execp('cat dist/immutable.min.js | gzip -c | wc -c'),
      execp('git show master:dist/immutable.min.js | gzip -c | wc -c'),
    ]).then(results => {
      results = results.map(result => parseInt(result));

      var rawNew = results[0];
      var rawOld = results[1];
      var minNew = results[2];
      var minOld = results[3];
      var zipNew = results[4];
      var zipOld = results[5];

      function space(n, s) {
        return Array(Math.max(0, 10 + n - (s||'').length)).join(' ') + (s||'');
      }

      function bytes(b) {
        return b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' bytes';
      }

      function diff(n, o) {
        var d = n - o;
        return d === 0 ? '' : d < 0 ? (' ' + bytes(d)).green : (' +' + bytes(d)).red;
      }

      function pct(s, b) {
        var p = Math.floor(10000 * (1 - (s / b))) / 100;
        return (' ' + p + '%').grey;
      }

      console.log('  Raw: ' +
        space(14, bytes(rawNew).cyan) + '       ' + space(15, diff(rawNew, rawOld))
      );
      console.log('  Min: ' +
        space(14, bytes(minNew).cyan) + pct(minNew, rawNew) + space(15, diff(minNew, minOld))
      );
      console.log('  Zip: ' +
        space(14, bytes(zipNew).cyan) + pct(zipNew, rawNew) + space(15, diff(zipNew, zipOld))
      );

    }).then(this.async()).catch(
      error => setTimeout(() => { throw error; }, 0)
    );
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('build', 'Build distributed javascript', ['clean', 'bundle', 'copy', 'typedefs']);
  grunt.registerTask('default', 'Build.', ['build', 'stats']);
}
