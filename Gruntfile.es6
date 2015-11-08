import {Instrumenter} from 'isparta';
import loadGruntTasks from 'load-grunt-tasks';
import pkg from './package';
import timeGrunt from 'time-grunt';

export default function gruntConfig(grunt) {
  loadGruntTasks(grunt);
  timeGrunt(grunt);

  grunt.initConfig({
    clean: {
      doc: {
        src: `doc`
      },
      tmp: {
        src: `.tmp`
      }
    },

    eslint: {
      all: [
        `Gruntfile.js`,
        `src/**/*.js`,
        `test/**/*.js`
      ]
    },

    instrument: {
      files: `src/**/*.js`,
      options: {
        basePath: `.tmp`,
        instrumenter: Instrumenter
      }
    },

    makeReport: {
      src: `reports/coverage/*/coverage*.json`,
      options: {
        type: [
          `cobertura`,
          `lcov`
        ],
        dir: `reports/coverage/all`,
        print: `summary`
      }
    },

    mochaTest: {
      options: {
        reporter: `spec`
      },
      integration: {
        src: [`test/integration/spec/**/*.js`]
      },
      unit: {
        src: [`test/unit/spec/**/*.js`]
      }
    },

    pkg,

    shell: {
      doc: {
        command: `./node_modules/.bin/documentation -f html -o doc`
      }
    },

    storeCoverage: {
      options: {
        dir: `reports/coverage/mocha`
      }
    },

    watch: {
      options: {
        atBegin: true
      },
      files: [
        `node_modules/**/*.js`,
        `src/**/*.{js,eslintrc}`,
        `test/**/*.{js,eslintrc}`,
        `Gruntfile`,
        `.eslintrc`
      ],
      tasks: [
        `test`
      ]
    }
  });

  grunt.registerTask(`test`, [
    `clean`,
    `eslint`,
    `mochaTest`
  ]);

  grunt.register(`doc`, [
    `clean:doc`
    `shell:doc`
  ]);
}
