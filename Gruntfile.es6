import {Instrumenter} from 'isparta';
import loadGruntTasks from 'load-grunt-tasks';
import pkg from './package';
import timeGrunt from 'time-grunt';

/**
 * Grunt config
 * @param {Object} grunt grunt object
 * @private
 * @returns {undefined}
 */
export default function gruntConfig(grunt) {
  loadGruntTasks(grunt);
  timeGrunt(grunt);

  grunt.initConfig({
    clean: {
      doc: {
        src: `<%= config.doc %>`
      },
      tmp: {
        src: `<%= config.tmp %>`
      },
      reports: {
        src: `<%= config.reports %>`
      }
    },

    config: {
      doc: `doc`,
      reports: `reports`,
      src: `src`,
      test: `test`,
      tmp: `.tmp`
    },

    copy: {
      coverage: {
        files: [{
          expand: true,
          cwd: `.`,
          src: `<%= config.test %>/**/*`,
          dest: `<%= config.tmp %>`
        }, {
          src: `<%= config.test %>/index.js`,
          dest: `<%= config.tmp %>/index.js`
        }]
      }
    },

    coveralls: {
      coverage: {
        src: `<%= config.reports %>/coverage/all/lcov.info`
      }
    },

    eslint: {
      all: [
        `Gruntfile.js`,
        `<%= config.src %>/**/*.js`,
        `<%= config.test %>/**/*.js`
      ]
    },

    instrument: {
      files: `<%= config.src %>/**/*.js`,
      options: {
        basePath: `<%= config.tmp %>`,
        instrumenter: Instrumenter
      }
    },

    makeReport: {
      src: `<%= config.reports %>/coverage/*/coverage*.json`,
      options: {
        type: [
          `cobertura`,
          `lcov`
        ],
        dir: `<%= config.reports %>/coverage/all`,
        print: `summary`
      }
    },

    mochaTest: {
      options: {
        reporter: `spec`
      },
      integration: {
        src: [`<%= config.test %>/integration/spec/**/*.js`]
      },
      unit: {
        src: [`<%= config.test %>/unit/spec/**/*.js`]
      }
    },

    pkg,

    shell: {
      doc: {
        command: `./node_modules/.bin/documentation -f html -o <%= config.doc %>`
      }
    },

    storeCoverage: {
      options: {
        dir: `<%= config.reports %>/coverage/mocha`
      }
    },

    watch: {
      options: {
        atBegin: true
      },
      refactor: {
        files: [
          `node_modules/**/*.js`,
          `<%= config.src %>/**/*.{js,eslintrc}`,
          `<%= config.test %>/**/*.{js,eslintrc}`,
          `Gruntfile.*`
        ],
        tasks: [
          `test`
        ]
      },
      debug: {
        files: [
          `node_modules/**/*.js`,
          `<%= config.src %>/**/*.{js,eslintrc}`,
          `<%= config.test %>/**/*.{js,eslintrc}`,
          `Gruntfile.*`
        ],
        tasks: [
          `mochaTest`
        ]
      }
    }
  });

  if (grunt.option(`coverage`)) {
    configureCoverage();
  }

  /**
   * @private
   * @returns {undefined}
   */
  function configureCoverage() {
    const mochaTest = grunt.config(`mochaTest`);
    if (mochaTest) {
      Object.keys(mochaTest).forEach((key) => {
        if (key === `options`) {
          return;
        }

        mochaTest[key].src[0] = `${grunt.config(`config`).tmp}/${mochaTest[key].src[0]}`;
      });

      grunt.config(`mochaTest`, mochaTest);
    }
  }

  grunt.registerTask(`test`, () => {
    const tasks = [
      `clean`,
      `eslint`
    ];

    if (grunt.option(`coverage`)) {
      tasks.push(`copy:coverage`);
      tasks.push(`instrument`);
    }

    tasks.push(`mochaTest`);

    if (grunt.option(`coverage`)) {
      tasks.push(`storeCoverage`);
      tasks.push(`makeReport`);
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask(`doc`, [
    `clean:doc`,
    `shell:doc`
  ]);
}
