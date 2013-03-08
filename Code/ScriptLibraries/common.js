$(document).ready(function(){
	$('#bricks').masonry({
		  itemSelector: '.thumbnail',
		  // set columnWidth a fraction of the container width
		  columnWidth: 100, 
		  isAnimated: true
		});
	try{
		$('textarea').autogrow();
	}catch(e){}
	try{
		$('.timepicker').timepicker({ 'timeFormat': 'H:i' });
	}catch(e){}
	$('body').scrollspy();
})