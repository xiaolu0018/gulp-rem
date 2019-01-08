var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCss = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync').create();
var server = require('gulp-devserver');
var connect = require('gulp-connect');
var proxy = require('http-proxy-middleware');

gulp.task('sass', function() {
	// sass directory
	return gulp.src('./static/sass/*scss')
		.pipe(plumber())
		.pipe(sass())
		//outputstyle (nested, compact, expanded, compressed)
		.pipe(sass({
			outputStyle: 'compact'
		}).on('error', sass.logError))
		// sourcemaps
		.pipe(sourcemaps.init())
		// sourcemaps output directory
		.pipe(sourcemaps.write(('./maps')))
		// css output directory
		.pipe(gulp.dest('./static/css'));
});

// minify css (merge + autoprefix + rename)
gulp.task('minify-css', function() {
	return gulp.src('./static/css/index.css')
		.pipe(minifyCss())
		// autoprefixer
		.pipe(autoprefixer({
			browsers: ['ios >= 6', 'android >= 4.0'],
			cascade: false
		}))
		// minify css rename
		.pipe(rename('index.min.css'))

		// minify css output directory
		.pipe(gulp.dest('./dist/static/css'))
		.pipe(connect.reload());
});

gulp.task('copy', function() {
	gulp.src('./temp/*.html')
		.pipe(gulp.dest('./dist/temp/'))
		.pipe(connect.reload());
	gulp.src('./static/data/*.json')
		.pipe(gulp.dest('./dist/data'))
		.pipe(connect.reload());
	gulp.src('./static/icon/**')
		.pipe(gulp.dest('./dist/static/icon/'));
	gulp.src('./static/images/*')
		.pipe(gulp.dest('./dist/static/images/'));
	gulp.src('./static/js/**.js')
		.pipe(gulp.dest('./dist/static/js/'))
		.pipe(connect.reload());
});

gulp.task('wa-css', function() {
	gulp.watch(['./static/sass/*.scss', './static/sass/**/*.scss'], ['sass']);
	gulp.watch(['./static/css/index.css'], ['minify-css']);
	gulp.watch(['./temp/*.html', './static/data/*.json', './static/js/**.js'], ['copy']);
});

//gulp.task('devserver', function() {
//	gulp.src('dist')
//		.pipe(server({
//			livereload: {
//				clientConsole: true,
//				filter: function(filename) {
//					return !/\/\.scss\/|\/\.svn\/|\/\.git\/|\/node_modules\//.test(filename);
//				}
//			}
////			,
////			proxy: {
////				enable: true,
////				host: 'http://w3cboy.com',
////				urls: /^\/api\//
////			}
//		}));
//});

gulp.task('connect', function() {
	connect.server({
		host:'127.0.0.1',
		root: 'dist',
		port: '8088',
		livereload: true
//		,
//		middleware: function(connect, opt) {
//			return [
//				proxy('/data/*.json', { // configure proxy middleware
//					// context: '/' will proxy all requests
//					// use: '/api' to proxy request when path starts with '/api'
//					target: 'http://10.30.251.59:8080',
//					pathRewrite: function (path, req) {return( path = '/activity/activeServlet'); },
//					logLevel: 'debug'
//					//,
//					//changeOrigin:true    // for vhosted sites, changes host header to match to target's host
//				})
//			];
//		}
	});
});
gulp.task('connect-proxy', function() {
	connect.server({
		host:'127.0.0.1',
		root: 'dist',
		port: '8088',
		livereload: true,
		middleware: function(connect, opt) {
			return [
				proxy('/data/*.json', { // configure proxy middleware
					// context: '/' will proxy all requests
					// use: '/api' to proxy request when path starts with '/api'
					target: 'http://10.30.251.59:8080',
					pathRewrite: function (path, req) {return( path = '/activeServlet'); },
					logLevel: 'debug'
					//,
					//changeOrigin:true    // for vhosted sites, changes host header to match to target's host
				})
			];
		}
	});
});

// gulp default (sass, minify-css, browser-sync) method
gulp.task('default', ['sass', 'minify-css', 'copy', 'wa-css']);
gulp.task('mock', ['sass', 'minify-css', 'copy', 'connect', 'wa-css']);
gulp.task('prov', ['sass', 'minify-css', 'copy', 'connect-proxy', 'wa-css']);