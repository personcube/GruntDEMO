module.exports = function (grunt) {
    // Configure `curl` with URLs
    // If you would like to download multiple files
    // to the same directory, there is `curl-dir`
    grunt.initConfig({
        curl: {
            'task-name': {
                src: {
                    url: formatURL('http://maven.qa.ampf.com/artifactory/npm-local/data.js'),                               
                },
                dest: 'JSScripts/data.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-curl');
};

function formatURL(url) {
    var user = 'nolio';
    var password = 'nolio123';
    var userAndPW = 'http://' + user + ':' + password + '@';
    var afterHTTP = url.slice(7, url.length);
    
    return userAndPW + afterHTTP;
}
  