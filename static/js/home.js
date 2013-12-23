$(function() {
	// Start
	loadTemplates();
	window.setup = {};// setup functions
	$('.dataContent').hide();
  // $(".searchArea").show();

	function loadTemplates() {
		window.templates = {};

		// Education
		$.get('hbs/edu.hbs', function(data) {
			window.templates.edu = Handlebars.compile(data);
		});

		// Work
		$.get('hbs/work.hbs', function(data) {
			window.templates.work = Handlebars.compile(data);
		});

		// People
		$.get('hbs/personCard.hbs', function(data) {
			window.templates.personCard = Handlebars.compile(data);
		});
		
		// Carpe Diem
		$.get('hbs/carpeDiem.hbs', function(data) {
			window.templates.carpeDiem = Handlebars.compile(data);
		});
	}

	// Search bar
	var lastQuery = '';
	$('.searchbar').click(function() {
		// Remove headers
		var fadeTime = 300;
		$('.homeHeader').fadeOut(fadeTime, function() {
			$(this).remove();
		});
		$('.searchbarHeader').fadeOut(fadeTime, function() {
			$(this).remove();
			$('.dataContent').fadeIn();
		});



		// Scroll search to top
		$('.searchArea').animate({
			top: 0
		}, fadeTime);
	}).change(function () {
		searchApi($(this).val());
	});

	$(".emergency-wrapper").click(function() {
		searchApi($('.searchbar').val());
	});

	$('.searchButton').click(function() {
		searchApi($('.searchbar').val());
	});

	// Search
	function searchApi(query) {
		// Make API call
		var curr = $(".curr");
		curr.html($(".searchbar").val());
		
		var data = {
			query: query
		};
		if (query && query !== lastQuery) {
			lastQuery = query;
			$.get('/api', data, function(apiData) {
			    showCuration(apiData.curation);
				showResults(apiData.searchResults);
			});
		}

		IN.API.PeopleSearch()
        .fields("id", "firstName", "lastName", "headline", "industry", "positions", "picture-url", "summary")
        .params({
          "title": $('.searchbar').val(),
          "count": 3
        })
        .result(function(result, metadata) {
        	window.clearPeopleData();
        	window.addPeopleData(result.people.values);
        	window.setup.person();
        	setTimeout(function () { window.setup.person(); }, 5000);
        });
	}
	
	function showCuration(curation) {
		$('#curation').html(curation);
	}

	function showResults(apiData) {
		apiData = fixData(apiData);
		// Education
		$('#edu').html(window.templates.edu(apiData));
		window.setup.edu(apiData);
		
		// Work
		$('#work').html(window.templates.work(apiData));
		// window.setup.work(apiData);	
		
		// Carpe Diem
        var topSkill = apiData.skills[0].name.split(" ")[0];
        console.log(topSkill);
        
        var carpeDiemData = {keyword: topSkill};
        
        $.get('api/coursera/search?keyword=' + topSkill, function(data) {
    		carpeDiemData.course = data[0];
		    $('#carpeDiem').html(window.templates.carpeDiem(carpeDiemData));
    	});
		
		// People
		$('.cards').html(window.templates.personCard(apiData));
		window.setup.person(apiData);
		var curr = $(".curr");
		curr.html($(".searchbar").val());
	}
	
	function fixData(apiData) {
		//majors
		var maxmajorCount = 0;
		for (var i in apiData.majors) {
			maxmajorCount = Math.max(maxmajorCount, apiData.majors[i].count);
		}
		for (var i in apiData.majors) {
			apiData.majors[i].percent = (apiData.majors[i].count / maxmajorCount) * 100;
		}

		//skill
		var maxskillCount = 0;
		for (var i in apiData.skills) {
			maxskillCount = Math.max(maxskillCount, apiData.skills[i].count);
		}
		for (var i in apiData.skills) {
			apiData.skills[i].percent = (apiData.skills[i].count / maxskillCount) * 100;
		}

		//title
		var maxTitleCount = 0;
		for (var i in apiData.titles) {
			maxTitleCount = Math.max(maxTitleCount, apiData.titles[i].count);
		}
		for (var i in apiData.titles) {
			apiData.titles[i].percent = (apiData.titles[i].count / maxTitleCount) * 100;
		}

		return apiData;
	}

});