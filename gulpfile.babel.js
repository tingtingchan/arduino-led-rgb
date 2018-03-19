import gulp from 'gulp';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import autoprefixer from 'autoprefixer';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';
import nodemon from 'gulp-nodemon';
import cssnano from 'cssnano';
import uglify from 'gulp-uglify';
import useref from 'gulp-useref';
import gutil from 'gulp-util';
import gulpIf from 'gulp-if';
import replace from 'gulp-replace';
import runSequence from 'run-sequence';

const reload = browserSync.reload;

const source = 'src/';
const dest = 'public/';

const serverWatchFiles = [
    'server.js'
];

const clientWatchFiles = [
    './public/**/*',
];

// Development
gulp.task('html', () => {
    return gulp.src(source + '*.html')
        .pipe(gulp.dest(dest));
});

gulp.task('css', () => {
    const plugins = [
        autoprefixer({ browsers: ['last 1 version'] })
    ];

    return gulp.src(source + 'scss/styles.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest(dest + 'css'));
});

gulp.task('babel', () => {
    return gulp.src(source + 'js/client.js')
        .pipe(babel())
        .pipe(gulp.dest(dest + 'js'));
});

gulp.task('copy', () => {
    return gulp.src([
            source + 'lib/**/*.js'
        ])
        .pipe(gulp.dest(dest + 'lib'));
});

gulp.task('watch', ['copy'], () => {
    gulp.watch([source + '**/*.html'], ['html']).on('change', reload);
    gulp.watch([source + '**/*.scss'], ['css']).on('change', reload);
    gulp.watch([source + '**/*.js'], ['babel']).on('change', reload);
});

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init(null, {
        proxy: 'http://localhost:3000',
        files: clientWatchFiles,
        browser: 'google chrome',
        port: 4000,
        online: false
    });
});

gulp.task('nodemon', (cb) => {
    var running = false;
    return  nodemon({
                script: 'server.js',
                watch: serverWatchFiles,
                ignore: [
                    'gulpfile.babel.js',
                    'node_modules/**',
                    'public/lib/**',
                ]
            })
            .on('start', () => {
                if (!running) { 
                    cb(); 
                    running = true;
                }
            })
});

gulp.task('default', () => {
    runSequence(['html', 'css', 'babel', 'copy'], ['browser-sync'], ['watch']);
});



// Production
// gulp.task('clean:dist', () => {
//     return del.sync('dist');
// });

// gulp.task('useref', () => {
//     return gulp.src(source + '*.html')
//         .pipe(useref())
//         .pipe(gulpIf('*.js', uglify()))
//         .pipe(gulpIf('*.css', cssnano()))
//         .pipe(replace('../../', '../'))
//         .pipe(gulp.dest(dest));
// });

// gulp.task('build', () => {
//     runSequence('clean:dist', 'babel', 'html', 'css', ['useref', 'images', 'fonts', 'copy'], 'htmlmin');
// });



