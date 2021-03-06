/**
 * Example Gruntfile for Mocha setup
 */

'use strict';

module.exports = function(grunt) {

  var port = 8981;

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js', ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      // If you want to watch files and run tests automatically on change
      test: {
        files: [
          'example/js/**/*.js',
          'example/test/spec/**/*.js',
          'phantomjs/*',
          'tasks/*',
          'Gruntfile.js'
        ],
        tasks: 'test'
      }
    },
    mocha: {
      // runs all html files (except test2.html) in the test dir
      // In this example, there's only one, but you can add as many as
      // you want. You can split them up into different groups here
      // ex: admin: [ 'test/admin.html' ]
      all: ['example/test/**/!(test2|testBail|testPage|testCoverage).html'],

      // Runs 'test/test2.html' with specified mocha options.
      // This variant auto-includes 'bridge.js' so you do not have
      // to include it in your HTML spec file. Instead, you must add an
      // environment check before you run `mocha.run` in your HTML.
      test2: {

        // Test files
        src: ['example/test/test2.html'],
        options: {
          // mocha options
          mocha: {
            ignoreLeaks: false,
            grep: 'food'
          },

          reporter: 'Spec',

          // Indicates whether 'mocha.run()' should be executed in
          // 'bridge.js'
          run: true,

          timeout: 10000
        }
      },

      // Runs the same as test2 but with URL's
      testUrls: {
        options: {
          // mocha options
          mocha: {
            ignoreLeaks: false,
            grep: 'food'
          },

          reporter: 'Nyan',

          // URLs passed through as options
          urls: ['http://localhost:' + port + '/example/test/test2.html'],

          // Indicates whether 'mocha.run()' should be executed in
          // 'bridge.js'
          run: true
        }
      },

      // Test using a custom reporter
      testReporter: {
        src: ['example/test/test.html', 'example/test/test2.html'],
        options: {
          mocha: {
            ignoreLeaks: false,
            grep: 'food'
          },
          reporter: './example/test/reporter/simple',
          run: true
        }
      },

      // Test log option
      testLog: {
        src: ['example/test/test.html'],
        options: {
          mocha: {
            ignoreLeaks: false,
            grep: 'food'
          },
          log: true
        }
      },

      testDest1: {
        // Test files
        src: ['example/test/test2.html'],
        dest: 'example/test/results/spec.out',
        options: {
          reporter: 'Spec',
          run: true
        }
      },

      // Same as above, but with URLS + Xunit
      testDest2: {
        options: {
          reporter: 'XUnit',

          // URLs passed through as options
          urls: ['http://localhost:' + port + '/example/test/test2.html'],

          run: true
        },
        dest: 'example/test/results/xunit.out'
      },

      // Test a failing test with bail: true
      testBail: {
        src: ['example/test/testBail.html'],
        // Bail option
        options: {
          run: true,
          bail: true
        }
      },

      // This test should never run
      neverTest: {
        src: ['example/test/test.html'],
        // Bail option
        options: {
          run: true
        }
      },

      // Test page options
      testPage: {
        src: ['example/test/testPage.html'],
        options: {
          page: {
            settings: {
              userAgent: 'grunt-mocha-agent'
            }
          }
        }
      },

      // Test Istanbul integration.
      testCoverage: {
        src: ['example/test/testCoverage.html'],
        options: {
          run: true,
          coverage: {
            htmlReport: 'example/test/results/coverage.out/html',
            coberturaReport: 'example/test/results/coverage.out/cobertura',
            lcovReport: 'example/test/results/coverage.out/lcov',
            cloverReport: 'example/test/results/coverage.out/clover',
            jsonReport: 'example/test/results/coverage.out/json'
          }
        }
      }
    },

    connect: {
      testUrls: {
        options: {
          port: port,
          base: '.'
        }
      },
      testDest: {
        options: {
          port: port + 1,
          base: '.'
        }
      }
    }
  });

  grunt.registerTask('verifyDestResults', function () {
    var expected = ['spec', 'xunit'];

    expected.forEach(function (reporter) {
      var output = 'example/test/results/' + reporter + '.out';

      // simply check if the file is non-empty since verifying if the output is
      // correct based on the spec is kind of hard due to changing test running
      // times and different ways to report this time in reporters.
      if (!grunt.file.read(output, 'utf8'))
        grunt.fatal('Empty reporter output: ' + reporter);

      // Clean-up
      grunt.file.delete(output);
      grunt.log.ok('Reporter output non-empty for %s', reporter);
    });

    // Check for Coverage Reports.
    var expectedCoverage = [
      'cobertura/cobertura-coverage.xml',
      'lcov/lcov.info',
      'clover/clover.xml',
      'json/coverage.json',
      'html/index.html'
    ];

    expectedCoverage.forEach(function (reporter) {
      var output = 'example/test/results/coverage.out/' + reporter;

      if (!grunt.file.read(output, 'utf8')) {
        grunt.fatal('Empty reporter output: ' + reporter);
      }

      grunt.log.ok('Reporter output non-empty for %s', reporter);
    });

    // Clean-up.
    grunt.file.delete('example/test/results/coverage.out');
  });

  // IMPORTANT: Actually load this plugin's task(s).
  // To use grunt-mocha, replace with grunt.loadNpmTasks('grunt-mocha')
  grunt.loadTasks('tasks');
  // grunt.loadNpmTasks('grunt-mocha');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');


  grunt.task.registerTask('testUrls', ['connect:testUrls', 'mocha:testUrls']);
  grunt.task.registerTask('testLog', ['mocha:testLog']);
  grunt.task.registerTask('testReporter', ['mocha:testReporter']);
  grunt.task.registerTask('testDest', [
    'mocha:testDest1',
    'connect:testDest',
    'mocha:testDest2',
    'mocha:testCoverage',
    'verifyDestResults'
  ]);
  grunt.task.registerTask('testPage', ['mocha:testPage']);
  // WARNING: Running this test will cause grunt to fail after mocha:testBail
  grunt.task.registerTask('testBail', ['mocha:testBail', 'mocha:neverTest']);
  grunt.task.registerTask('test', [
    'mocha:all',
    'testUrls',
    'testLog',
    'testReporter',
    'testDest',
    'testPage',
    'testBail',
  ]);

  // By default, lint and run all tests.
  grunt.task.registerTask('default', ['jshint', 'test']);
};
