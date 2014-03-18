module.exports = function(grunt) {
    var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        specs = "spec/*Spec.js",
        helpers = "spec/*Helpers.js";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                banner: banner
            },                
            dist: {
                src: ['src/vendor/*.js', 
                    'src/Ads.js', 

                    'src/loaders/*.js',
                    'src/units/*.js'
                    ],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        jshint: {
            ignore_warning: {
                options: {
                    '-W083': true,
                },
                src: ['onion-ads.js', specs],
            }, 
        },
        uglify: {
            options: {
                banner: banner
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jasmine: {
            src: 'build/onion-ads.js',
            options: {
                specs: specs,
                helpers: helpers,
                vendor: [
                    "http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js",
                ]
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'src/*/*.js'],
                tasks: ['concat','jshint','jasmine'],
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['concat','jshint','jasmine']);

};