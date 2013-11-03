$(function() {
	$('.searchbar').click(function() {
		// Remove headers
		var fadeTime = 300;
		$('.homeHeader').fadeOut(fadeTime, function() {
			$(this).remove();
		});
		$('.searchbarHeader').fadeOut(fadeTime, function() {
			$(this).remove();
		});

		// Scroll search to top
		$('.searchArea').animate({
			top: 0
		}, fadeTime);
	}).change(function () {
		// Make API call
		var query = $(this).val();
		var data = {
			query: query
		};
		$.get('/api', data, function(apiData) {
			console.log(apiData);
		});
	});
});