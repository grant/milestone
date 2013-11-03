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
		// .animate({
		// 	marginBottom: 0
		// }, fadeTime);

		// Scroll search to top
		$('.searchArea').animate({
			top: 0
		}, fadeTime);
	});
});