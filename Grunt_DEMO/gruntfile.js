'use strict';

var today = new Date();
var hh = today.getHours();
var mm = today.getMinutes() ; //January is 0!
var ss = today.getSeconds() ;
var today = "_"+hh + mm + ss ;


module.exports = function (grunt) {

    // Configure `curl` with URLs
    // If you would like to download multiple files
    // to the same directory, there is `curl-dir`
    grunt.initConfig({
       // curl : {
        //    'dev/data.js': 'http://maven.qa.ampf.com/artifactory/simple/npm-local/data.js'
//
        //       }
/****************** E2
        curl: {
            'task-name': {
                src: {
                    url: 'http://maven.qa.ampf.com/artifactory/npm-local/data.js',
                    username:'nolio',
                    password:'nolio123'
                },
                dest: 'dev/data.js'
            }
        }
    });
    */

    curl: {
        'GetArtifactory': {
            src: {
                url: 'http://maven.ampf.com/artifactory/npm-local/data2.0.1.js'
                        
            },
            dest: 'JSScripts' + today+'/data.js'
        }
    }
});


    // Load in `grunt-curl`
    grunt.loadNpmTasks('grunt-curl');
};