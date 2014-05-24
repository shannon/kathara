var path      = require('path')  
  , gulp      = require('gulp')  
  , gutil     = require('gulp-util')  
  , clean     = require('gulp-clean')  
  , concat    = require('gulp-concat')  
  , less      = require('gulp-less')  
  , watch     = require('gulp-watch')
  , inject    = require('gulp-inject')
  , rename    = require('gulp-rename')
  , ngHtml2Js = require('gulp-ng-html2js')
  , package   = require('./package.json');
;

gulp.task('html', function(){
  return gulp.src('./src/**/*.tpl.html')
    .pipe(ngHtml2Js({
        moduleName: 'kathara.templates'
    }))
     .pipe(concat('templates-' + package.version + '.js'))
    .pipe(gulp.dest('./build/assets/'));
});

gulp.task('js', function(){
  return gulp.src('./src/**/*.js')
    .pipe(gulp.dest('./build'));
});

gulp.task('less', function () {  
  return gulp.src('./src/less/main.less')
    .pipe(less())
    .pipe(rename('kathara-' + package.version + '.css'))
    .pipe(gulp.dest('./build/assets/'))
    .on('error', gutil.log);
});

gulp.task('assets', function(){
  return gulp.src('./src/assets/**/*.*')
    .pipe(gulp.dest('./build/assets'));
});

gulp.task('vendor', function(){
  return gulp.src('./vendor/**/*.js')
    .pipe(gulp.dest('./build/vendor'));
});

gulp.task('index', function(){
  return gulp.src('./src/index.html')
  .pipe(inject(gulp.src(["./build/**/*.js", "./build/**/*.css"], { read: false }), { ignorePath: 'build' }))
  .pipe(gulp.dest("./build"));
})

gulp.task('build', ['html', 'js', 'less', 'assets', 'vendor', 'index']);

gulp.task('watch', function () { 
  watch({ glob: './src/**/*.tpl.html' },  ['html', 'index']);
  watch({ glob: './src/**/*.js' },        ['js', 'index']);
  watch({ glob: './src/**/*.less' },      ['less', 'index']);
  watch({ glob: './src/assets/**/*.*' },  ['assets']);
  watch({ glob: './vendor/**/*.js' },     ['vendor', 'index']);
  watch({ glob: './src/index.html' },     ['index']);
});

gulp.task('clean', function () {  
  return gulp.src('build', { read: false })
    .pipe(clean());
});