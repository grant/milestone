$(function() {
  var colors = ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#34495E", "#F1C40F", "#E67E22", "#E74C3C", "#ECF0F1"];
  function getRandomColor() {
    return colors[Math.floor(Math.random()*colors.length)];
  }

  /* Work */
  var skillsChartData = {
    labels : ["Node","C#","Java","Scala","Python"],
    datasets : [{
        fillColor : getRandomColor(),
        strokeColor : "rgba(220,220,220,1)",
        pointColor : "rgba(220,220,220,1)",
        pointStrokeColor : "#fff",
        labelColor: "white",
        scaleFontSize: "14",
        data : [65,59,90,81,56]
      }]
  };
  var titlesChartData = {
    labels : ["Software Engineer","SDE II","TPM","QA"],
    datasets : [{
      fillColor : getRandomColor(),
      strokeColor : "rgba(220,220,220,1)",
      pointColor : "rgba(220,220,220,1)",
      scaleFontSize: "14",
      data: [91,77,50,41]
    }]
  };

  window.setup.work = function(apiData) {
    // skills
    var skills = apiData.skills;
    var skillLabels = [];
    var skillData = [];
    for (var i in skills) {
      skillLabels.push(skills[i].name);
      skillData.push(skills[i].count);
    }
    skillsChartData.labels = skillLabels;
    skillsChartData.datasets[0].data = skillData;

    // // position
    // var titles = apiData.titles;
    // var titleLabels = [];
    // var titleData = [];
    // for (var i in titles) {
    //   titleLabels.push(titles[i].name);
    //   titleData.push(titles[i].count);
    // }
    // titlesChartData.labels = titleLabels;
    // titlesChartData.datasets[0].data = titleData;

    var myskills = new Chart(document.getElementById("skills").getContext("2d")).Bar(skillsChartData);
    // var mypie = new Chart(document.getElementById("titles").getContext("2d")).Bar(titlesChartData);
  };
});