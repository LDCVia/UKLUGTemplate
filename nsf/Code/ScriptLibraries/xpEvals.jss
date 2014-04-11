var SessionDetails = function(){
	var title = "title";
	var scores = new Array(); 
	var comments = new Array();
	var speakers = new Array();
	 
	function setTitle(newtitle){
		title = newtitle;
	}
	
	function getTitle(){
		return title;
	}
	
	function addScore(score){
		print("adding score " + score);
		if (score > 0)
			scores.push(score);
	}
	
	function getAverageScore(){
		var av = 0;
		var cnt = 0;
		var len = scores.length;
		for (var i = 0; i < len; i++) {
			var e = + scores[i];
			if(!e && scores[i] !== 0 && scores[i] !== '0') e--;
			if (scores[i] == e) {av += e; cnt++;}
		}
		return @Round(av/cnt);
	}
	
	function getEvalCount(){
		return @Round(scores.length);
	}
	
	function addComment(comment){
		print("adding comment " + comment);
		comments.push(comment);
	}
	
	function getComments(){
		return comments;
	}
	
	function addSpeaker(speaker){
		//print("Adding speaker " + speaker);
		if (speaker != null && speaker != "")
			speakers.push(speaker);
	}
	
	function getSpeakers(){
		return speakers;
	}
	
	return {

		// public methods
		setTitle: setTitle, 
		getTitle: getTitle, 
		addScore: addScore, 
		getAverageScore: getAverageScore, 
		getEvalCount: getEvalCount, 
		addComment: addComment, 
		getComments: getComments, 
		addSpeaker: addSpeaker, 
		getSpeakers: getSpeakers
	}
}

var getSessionDetails = function(title){
	var details = new SessionDetails();
	details.setTitle(title);
	var alldocs:NotesView = database.getView("All Documents");
	var evals:NotesDocumentCollection = alldocs.getAllDocumentsByKey("Evaluation");
	var eval:NotesDocument = evals.getFirstDocument();
	while (eval != null){
		if (title == "Overall"){
			sessionScope.overalldetails.setTitle("Overall");
			sessionScope.overalldetails.addScore(@TextToNumber(eval.getItemValueString("overallscore")));
			sessionScope.overalldetails.addComment(eval.getItemValueString("overallcomments"));
		}else{
			print("Processing " + title);
			var pos = @Member(title, eval.getItemValue("Sessions"));
			print("pos = " + pos);
			if (pos > 0){
				pos = pos - 1;
				pos = new java.lang.Double(pos).doubleValue();
				var scores:java.util.Vector = eval.getItemValue("scores");
				print("Scores = " + scores);
				if (scores.size() > 0){
					try{
						details.addScore(scores.elementAt(pos));
						var comment = eval.getItemValue("Comments").elementAt(pos);
						print("Comment = " + comment)
						if (comment != ""){
							details.addComment(comment);
						}
					}catch(e){
						print("Error: " + e);
						_dump(e);
					}
				}else{
					print("There are no scores for " + title);
				}
			}else{
				print("Couldn't find " + title + " in " + eval.getUniversalID());
			}
		}
		print("Moving to next eval");
		evaltemp = evals.getNextDocument(eval);
		eval.recycle();
		eval = evaltemp;
		_dump(eval);
		if (eval == null){
			return details;
		}
	}
	return details;
}

var getAllSessionDetails = function(){
	var allsessions:NotesView = database.getView("Sessions By Status");
	var sessions:NotesViewEntryCollection = allsessions.getAllEntriesByKey("Approved");
	
	var details = new Array();
	sessionScope.overalldetails = new SessionDetails();
	getSessionDetails("Overall");
	var entry:NotesViewEntry = sessions.getFirstEntry();
	while(entry != null){
		var sessiondoc:NotesDocument = entry.getDocument();
		var sessiondetails = getSessionDetails(sessiondoc.getItemValueString("title"));
		sessiondetails.addSpeaker(sessiondoc.getItemValueString("Speaker"));
		sessiondetails.addSpeaker(sessiondoc.getItemValueString("OtherSpeakersDisp"));
		details.push(sessiondetails);
		entry = sessions.getNextEntry(entry);
	}
	return details;
}