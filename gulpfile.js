var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    stylelint = require('gulp-stylelint'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    postcss = require('gulp-postcss'),
    browserSync = require('browser-sync').create();
    cp = require('child_process');

gulp.task('watch', ['browserSync'], function() {
    gulp.watch('Private/StyleSheets/**/*.scss', ['stylelint', 'css']);
    gulp.watch('Private/JavaScripts/**/*.js', ['jshint', 'uglify']);
    gulp.watch('*html');
});

gulp.task('jshint', function() {
    return gulp
    .src('Private/JavaScripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
    return gulp
    .src([
        'Private/JavaScripts/*.js'
    ])
    .pipe(concat('combined.min.js'))
    .pipe(uglify({
        mangle: true,
        compress: true
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('Public/JavaScripts/'));
});

gulp.task('stylelint', function() {
    return gulp
    .src('Private/StyleSheets/**/*.scss')
    .pipe(stylelint({
        reporters: [{
            formatter: 'string',
            console: true
        }]
    }));
});

gulp.task('css', function() {
    cp.exec('rm -r Public/StyleSheets/*');

    return gulp
    .src('Private/StyleSheets/Styles.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .on('error', swallowError)
    .pipe(autoprefixer({
        browsers: ['last 4 versions']
    }))
    .pipe(postcss([ require('postcss-object-fit-images') ]))
    .pipe(rename('combined.min.css'))
    .pipe(gulp.dest('Public/StyleSheets/'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('imagemin', function() {

    gulp
    .src('Private/Images/*')
    .pipe(imagemin([
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.svgo({plugins: [{removeViewBox: false}]})
    ]))
    .pipe(gulp.dest('Public/Images'))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'Public/'
    },
  })
});

gulp.task('default', [
    'jshint', 'uglify', 'stylelint', 'css'
]);

// Function that catch errors and will therefore prevent gulp to exit the watch task
// as long as an on listener is set.
function swallowError(error) {
    console.log(error.toString());
}
