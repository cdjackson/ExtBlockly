/**
 * Created by chris on 20/02/2014.
 */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                drop_console: true,
                compress: true
            },
            core: {
                expand: false,
                flatten: true,
                src: ['core/blockly.js', 'core/block.js', 'core/block_svg.js', 'core/blocks.js', 'core/icon.js',
                    'core/bubble.js',
                    'core/comment.js', 'core/connection.js', 'core/contextmenu.js', 'core/css.js', 'core/field.js',
                    'core/field_textinput.js',
                    'core/field_angle.js', 'core/field_checkbox.js', 'core/field_colour.js', 'core/field_dropdown.js',
                    'core/field_image.js',
                    'core/field_label.js', 'core/field_variable.js', 'core/flyout.js', 'core/generator.js',
                    'core/inject.js', 'core/input.js',
                    'core/msg.js', 'core/mutator.js', 'core/names.js', 'core/procedures.js', 'core/scrollbar.js',
                    'core/tooltip.js',
                    'core/trashcan.js', 'core/utils.js', 'core/variables.js', 'core/warning.js', 'core/widgetdiv.js',
                    'core/workspace.js',
                    'core/json.js'
                ],
                dest: 'build/core.js'
            },
            blocks: {
                expand: false,
                flatten: true,
                src: ['blocks/*.js'],
                dest: 'build/blocks.js'
            }
        },
        copy: {

            msg: {
                expand: true,
                flatten: true,
                src: ['msg/js/*.js'],
                dest: 'build/msg/'
            },
            media: {
                expand: true,
                src: ['media/**'],
                dest: 'build/'
            },

            blockly: {
                expand: true,
                flatten: true,
                src: ['extjs/Blockly.js'],
                dest: 'build/'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-minify');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'copy']);

};
