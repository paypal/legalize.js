/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 PayPal                                                 │
 │                                                                            │
 │  Licensed under the Apache License, Version 2.0 (the "License");           │
 │  you may not use this file except in compliance with the License.          │
 │  You may obtain a copy of the License at                                   │
 │                                                                            │
 │    http://www.apache.org/licenses/LICENSE-2.0                              │
 │                                                                            │
 │  Unless required by applicable law or agreed to in writing, software       │
 │  distributed under the License is distributed on an "AS IS" BASIS,         │
 │  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │  See the License for the specific language governing permissions and       │
 │  limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/

var coverageCommand =
    "node_modules/.bin/istanbul cover node_modules/.bin/_mocha -- -u exports -R spec";

var minifiedBanner =
    "/*! <%= pkg.name %> <%= grunt.template.today('dd-mm-yyyy') %>\n" +
    "    Copyright (C) 2014 PayPal\n" +
    "    Licensed under the Apache License, Version 2.0. */\n";

var buildDir = ".build";

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        jshint: {
            src: [
                "src/**/*.js"
            ],
            gruntfile: [
                "Gruntfile.js"
            ],
            test: [
                "test/**/*.js"
            ],
            options: {
                jshintrc: true
            }
        },

        preprocess: {
            files: {
                src: "src/legalize-browser.js",
                dest: "legalize.js"
            }
        },

        uglify: {
            dist: {
                files: {
                    "dist/legalize.min.js": [
                        "legalize.js"
                    ]
                },
                options: {
                    compress: { warnings: false },
                    report: "gzip",
                    preserveComments: "some",
                    banner: minifiedBanner,
                    sourceMap: true,
                    beautify: false
                }
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: "spec"
                },
                src: [
                    "test/**/*.js"
                ]
            },
            devel: {
                options: {
                    reporter: "spec",
                    grep: "@devel"
                },
                src: [
                    "test/**/*.js"
                ]
            }
        },

        mkdir: {
            coverage: {
                options: {
                    create: [ "coverage" ]
                }
            }
        },

        exec: {
            coverage: {
                command: coverageCommand,
                stdout: true,
                stderr: false
            }
        },

        coverage: {
            options: {
                thresholds: {
                    statements: 90,
                    branches: 90,
                    lines: 90,
                    functions: 90
                },
                dir: "coverage"
            }
        },

        clean: [
            buildDir,
            "dist",
            "coverage"
        ]
    });

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.registerTask("lint",
        ["jshint"]);

    grunt.registerTask("test",
        ["lint", "mochaTest:test"]);

    grunt.registerTask("check",
        ["mkdir:coverage", "exec:coverage", "coverage"]);

    grunt.registerTask("build",
        ["lint", "check", "preprocess"]);

    grunt.registerTask("dist",
        ["build", "uglify:dist"]);

    grunt.registerTask("default",
        ["check-modules", "dist"]);
};
