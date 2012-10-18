/**
 * Return a list of all session names in the system
 */
function getSessionList(){
	if (!viewScope.containsKey("sessionlist")){
		viewScope.sessionlist = @DbColumn(@DbName(), "Sessions", 2);
	}
	return viewScope.sessionlist;
}

/**
 * Given the unid of a session, returns an HTML chunk describing the session
 */
function getSessionDetails(unid){
	try{
		if (unid == ""){
			return "<span class=\"agendaemptyroom\">&nbsp;</span>";
		}
		var doc:NotesDocument = database.getDocumentByUNID(unid);
		var out = "<div class=\"agendasession\">";
		if (doc.getItemValueString("Title") != ""){
			out += "<h3>" + doc.getItemValueString("Title") + "</h3>";
			out += "<p>" + doc.getItemValueString("Abstract") + "</p>";
			out += "<blockquote>" + doc.getItemValueString("Presenter");
			out += " / " + doc.getItemValueString("Track") + "</blockquote>";
		}else{
			out += "<h3>Session to be announced</h3>";
		}
		out += "</div>"
		doc.recycle();
		return out;
	}catch(e){
		return "<span class=\"agendaemptyroom\">&nbsp;</span>";
	}
}