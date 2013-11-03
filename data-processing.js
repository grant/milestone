var _ = require('underscore');

module.exports = {
 process: function(arkResponse) {
    var results = arkResponse.results;
    var topHits = {};
    topHits["industries"] = extractTopValues("raw.industry",results);
    topHits["locations"] = extractTopValues("raw.location",results);
    topHits["schools"] = extractTopValues("raw.schools.*.name",results);
    topHits["majors"] = extractTopValues("raw.schools.*.major",results);
    topHits["degrees"] = extractTopValues("raw.schools.*.degree",results);
    topHits["titles"] = extractTopValues("raw.experience.*.title",results);
    topHits["companies"] = extractTopValues("raw.experience.*.company",results);
    topHits["skills"] = extractTopValues("raw.skills.*",results);
    
    return topHits;
 }   
}


function getPropByString(obj, propString) {
  var returnValue = [];

  if (!propString) return obj;

  var prop, props = propString.split('.');

  for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
    prop = props[i];
    if (prop == "skills") {
        if (obj.skills.length > 0) {
            obj.skills.forEach(function(element,i) {
                returnValue.push(element);
            })
        }
    } else if (prop == "*") {
        _.each(obj, function(element, key) {
                returnValue.push(element[props[i+1]]);
        });
    } else {
        if (typeof obj == 'object' && obj !== null && prop in obj) {
            obj = obj[prop];
        } else {
            break;
        }
    }
  }
  if (typeof obj == 'object' && obj !== null && props[i] in obj) {
    returnValue.push(obj[props[i]]);
  }
  return returnValue;
}

function extractTopValues(jsonPath,bigjsonblob) {
    var aggregate = {};
    _.each(bigjsonblob,function(result, key) { 
       var values = getPropByString(result,jsonPath);
       _.each(values, function(value, key) {
           if (typeof value !== 'undefined' && value !== '') {
                value = value.replace("&amp;","and");
                if (!(value.toLowerCase() in aggregate)) {
                      aggregate[value.toLowerCase()] = 1;
                   } else {
                      aggregate[value.toLowerCase()] ++;
                   }
            }
       });
    });
    
    var topValues = [];
    _.each(aggregate,function(e,i) { 
       topValues.push({name: i, count: e});
    });
    
    topValues = topValues.sort(function(a,b) { return b.count - a.count});
    
    return topValues.slice(0,5);
}
