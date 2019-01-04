module.exports = function (grunt) {
	var pkgJson = require('./package.json'),
		buildXCC = "build/XCC",
		XCCJS = buildXCC + "/js/",
		distXCCDateiablage="dist";
	function createJSBanner() {
		return ['/*! ****************************************************************************',
			' * ICEC - IBM Connections Engagement Center',
			' * CUSTOMIZATION',
			' *',
			' * Build date: <%= grunt.template.today("yyyy-mmm-dd HH:MM:ss") %>',
			' * Version: ' + pkgJson.version,
			' * Project name: ' + pkgJson.name,
			' * Author: ' + pkgJson.author,
			' *',
			' *  Copyright TIMETOACT, <%= grunt.template.today("yyyy") %> All Rights Reserved ',
			' *',
			' **************************************************************************** */',
			''].join("\n");
	}

	grunt.initConfig({
		eslint: { // check JS source code with ESLint
			options: {
				"configFile": 'eslint-config.js',
				fix: true
			},
			target: ["build/XCC/js/**/*.js", "!build/XCC/js/lib/**/*.js"]
		},
		clean: {
			all: ["dist/**/*"]
		},
		uglify: {

			options: {
				banner: createJSBanner(),
				sourceMap: true
			},
			dist: {
				files: [
				{
					expand: true,
					flatten: true,
					src: [ "replacedModules/*.js"],
					dest: distXCCDateiablage,
					cwd: XCCJS,
					rename: function(dst, src) {
						return dst + "/" + src.replace(".js", "-min.js");
					}
				},
				{
					expand: true,
					src: [ "**/*.js", "!**/*-min.js"],
					dest: distXCCDateiablage,
					cwd: distXCCDateiablage
				}]
			}

		},
		copy: {
			jsWithUglify: {
				files: [{
					expand: true,
					flatten: true,
					cwd: XCCJS,
					dest: distXCCDateiablage,
					src: ["otherjs/*.js"] // only copy the stuff that needs to be put to dist 1:1 and then uglified
				}]
			},
			jsNoUglify: {
				files: [{
						expand: true,
						flatten: true,
						cwd: XCCJS,
						dest: distXCCDateiablage,
						src: ["lib/*.js", "replacedModules/*.js"] // copy this stuff after the uglifying was done.
				}]
			}

		},
		cssmin: { // minifies the CSS
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1,
				sourceMap: false
			},
			xcc: {
				files: [{
					expand: true,
					src:["*.css"],
					dest: distXCCDateiablage,
					cwd: distXCCDateiablage,
					ext: ".css"
				}]
			}
		},
		sass: { // parses SASS to CSS
			options: {
				sourceMap: true
			},
			xcc: {
				files: [{
					expand: true,
					cwd: "build/XCC/sass/",
					dest: distXCCDateiablage,
					src: ["**/*.scss"],
					ext: ".css"
				}]
			}
		},
		concat: {
			options: {
				stripBanners: { // remove comments from the source
					block: false, // all block comments but none that start with /*!
					line: false
				},
				separator: '\n\n\n',
				banner: createJSBanner() + "\n",
				process: function (src, filepath) {
					var fileName = filepath.split(/\\|\//).pop(),
						ret;
					ret = [
						('// BEGIN source file: ' + fileName + ' (' + src.length + 'B)'),
						src,
						'',
						('// END source file: ' + fileName + ' (' + src.length + 'B)'),
						''
					].join("\n");
					return ret;
				}
			},
			dist: {
				src: [ XCCJS + "widgetRegister.js", XCCJS + "customEditor.js", XCCJS + "customWidgets/*.js", XCCJS + "custom.js"],
				dest: distXCCDateiablage + "/custom.js"
			}
		},
		sasslint: {
			options: {
				configFile: 'sass-lint.yml',
				exclude: [
					'build/XCC/sass/lib/**.scss'
				]
			},
			target: ['build/XCC/sass/**/*.scss', '!build/XCC/sass/lib/**']
		}
	});

	grunt.registerTask('default', ["clean", 'eslint', 'concat', 'copy:jsWithUglify',  'uglify',"copy:jsNoUglify", 'sasslint', 'sass', "cssmin"]);
	// load ESLint --> validate JS
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-sass-lint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-contrib-concat');
};
