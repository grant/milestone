$(function() {
	var $body = $('body');
	$body.click(function() {
		throwOutCard('right');
	});
	Hammer($body).on("swipeleft", function() {
		throwOutCard('left');
	});
	Hammer($body).on("swiperight", function() {
		throwOutCard('right');
	});

	// Throws out the card
	var throwOutSpeed = 400;
	var throwOutDistance = '300px';
	var throwing = false;
	function throwOutCard(direction) {
		if (!throwing) {
			// Add new card underneath
			var $oldCard = $('.card:last');



			// Throw out card
			throwing = true;
			var throwOutProps = {
				opacity: 0,
				marginLeft: (direction === 'right') ? throwOutDistance : '-' + throwOutDistance
			};
			var rotateName = 'rotate' + direction;
			$oldCard.addClass('rotate' + direction).animate(throwOutProps, throwOutSpeed, function () {
				throwing = false;
				$(this).remove();
			});
		}
	};
});