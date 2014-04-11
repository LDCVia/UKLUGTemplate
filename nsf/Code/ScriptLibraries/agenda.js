$(document).ready(function(){
	if (getURLParameter("action") == "editDocument"){
		//Initialise the modal dialog
		$('#mymodal').modal('show');
	}
});

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}