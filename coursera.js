var _ = require('underscore'),
 request = require('request');
 
 var courseraCourseList

module.exports = {
 fetchCourseList: function(github) {
    request({
        url: 'https://www.coursera.org/maestro/api/topic/list?full=1',
        timeout: 10000
    },
    function (err, response, body) {
        if (err) throw err;
        courseraCourseList = JSON.parse(body);
        // Create gist
        github.gists.edit({
            id: "b11301b7f6fdfc16de2d",
            description: "Coursera Course List",
            files: {
                'coursera': {
                    "content": body
                }
            }
        }, function (err, gist) {
            if (err) console.log(err);
        });
    });
 },
 // search engine to find the correct course to recommend
 searchCourse: function(keyword) {
     var matches = [];
     keyword = keyword.toLowerCase();
     courseraCourseList.forEach(function(course) {
         if (course.name.toLowerCase().indexOf(keyword) !== -1 || course.short_description.toLowerCase().indexOf(keyword) !== -1) {
             matches.push(course);
         }
     });
     return matches;
 }
}