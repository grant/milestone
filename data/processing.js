var bigjsonblob = {};

# Industry
var aggregate = {};
$.each(bigjsonblob.results,function(i,e) { 
   if (!(e.raw.industry in aggregate)) {
      aggregate[e.raw.industry] = 1;
   } else {
      aggregate[e.raw.industry]++;
   }
});
aggregate;
