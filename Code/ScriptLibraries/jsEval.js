function buildSlider(id){
/*	document.write("<div id=\"slider_" + id + "_score\" style=\"float: right;\"></div>");
	document.write("<div id=\"slider_" + id + "\" style=\"display: inline; width: 200px;\"><div dojoType=\"dijit.form.HorizontalRule\" container=\"bottomDecoration\" style=\"height:5px;\">");
    document.write("</div><ol dojoType=\"dijit.form.HorizontalRuleLabels\" container=\"bottomDecoration\" style=\"height:1em;font-size:75%;color:gray;\">");
    document.write("<li>0%</li><li>25%</li><li>50%</li><li>75%</li><li>100%</li></ol></div><br />");
	dojo.addOnLoad(function() {
	    var slider = new dijit.form.HorizontalSlider({
	        name: "slider_" + id,
	        value: 0,
	        minimum: 0,
	        maximum: 100,
	        intermediateChanges: true,
	        style: "width:300px;",
	        onChange: function(value) {
	            dojo.byId(id).value = value;
	            displayScore(id, value);
	        }
	    },
	    "slider_" + id);
	    displayScore(id, 0);
	    dojo.byId(id).value = 0;
	});
*/
	var select = x$( id );
    var slider = $( "<div id='slider" + id + "'></div>" ).insertAfter( select ).slider({
      min: 0,
      max: 100,
      range: "min",
      value: 0,
      slide: function( event, ui ) {
        select.val(ui.value);
        displayScore(select.attr('id'), ui.value);
      }
    });
    var dispscore = $("<div id=\"slider_" + id + "_score\" class=\"badge\" style=\"float: right;\" />").insertAfter(select);
    displayScore(select.attr('id'), 0)
}

function displayScore(id, value){
	var out = "";
	var thediv = dojo.byId("slider_" + id + "_score");
	if (value == 0){
		out = "Did Not Attend";
		thediv.style.background = "white";
	}else if (value < 25){
		out = "Poor";
		thediv.style.background = "#FA9191";
	}else if(value <= 50){
		out = "Average";
		thediv.style.background = "#FAC06E";
	}else if(value < 75){
		out = "Good";
		thediv.style.background = "#EFF57A";
	}else{
		out = "Excellent";
		thediv.style.background = "#72E851";
	}
	thediv.style.color = "black";
	thediv.innerHTML = out;
}