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

function x$(idTag, param, jd){
	idTag=idTag.replace(/:/gi, "\\:")+(param ? param : "");
	return( jd=="d" ? "#"+idTag : $("#"+idTag));
}