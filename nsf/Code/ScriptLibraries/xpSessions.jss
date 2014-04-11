/**
 * Sets the status of a session to approved and sends a notification email
 */
function approveSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Status", "Approved");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
	emailBean.setSendTo(sessiondoc.getItemValueString("CreatedBy"));
	emailBean.setSubject(controlpanelBean.getSessionEmailAcceptedSubject());
	emailBean.setSenderEmail(controlpanelBean.getSessionEmailFromEmail());
	emailBean.setSenderName(controlpanelBean.getSessionEmailFromName());
	var body = controlpanelBean.getSessionEmailAcceptedBody();
	body = @ReplaceSubstring(body, "@sessiontitle@", sessiondoc.getItemValueString("Title"));
	emailBean.addHTML(body);
	emailBean.send();
}

/**
 * Sets the status of a session to rejected and sends a notification email
 * Also makes sure the session is not published
 */
function rejectSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Status", "Unapproved");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
	emailBean.setSendTo(sessiondoc.getItemValueString("CreatedBy"));
	emailBean.setSubject(controlpanelBean.getSessionEmailRejectedSubject());
	emailBean.setSenderEmail(controlpanelBean.getSessionEmailFromEmail());
	emailBean.setSenderName(controlpanelBean.getSessionEmailFromName());
	var body = controlpanelBean.getSessionEmailRejectedBody();
	body = @ReplaceSubstring(body, "@sessiontitle@", sessiondoc.getItemValueString("Title"));
	emailBean.addHTML(body);
	emailBean.send();
	unpublishSession(sessiondoc);
}

/**
 * Marks a session as published which means that all users can see it
 * Until this point only admins and the creator can see it
 */
function publishSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Published", "Yes");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
}

/**
 * Marks a session as unpublished which means only admins and the creator can see it
 */
function unpublishSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Published", "No");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
}

function getSessionVotingList(){
	var db:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), database.getFilePath());
	var vw:NotesView = db.getView("Sessions");
	var doc:NotesDocument = vw.getFirstDocument();
	var out = new Array();
	while(doc != null){
		var sess = {"unid": doc.getUniversalID(), 
				"title": doc.getItemValueString("Title"), 
				"abstracttext": doc.getItemValueString("Abstract"), 
				"track": doc.getItemValueString("Track"), 
				"score": doc.getItemValueInteger("Score")
			};
		out.push(sess);
		var doctemp:NotesDocument = vw.getNextDocument(doc);
		doc.recycle();
		doc = doctemp;
	}
	vw.recycle();
	//Cache the list of votes that the current user has cast
	var list = @DbLookup(@DbName(), "Votes", @UserName() + "|", 1, "[PARTIALMATCH]");
	sessionScope.sessionvotes = $A(list);
	return out;
}

function promoteSession(unid){
	var db:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), database.getFilePath());
	var votes:NotesView = db.getView("Votes");
	var votedoc:NotesDocument = votes.getDocumentByKey(@UserName() + "|" + unid);
	if (votedoc == null){
		votedoc = db.createDocument();
		votedoc.replaceItemValue("Form", "Vote");
		votedoc.replaceItemValue("UNID", unid);
		votedoc.replaceItemValue("Person", @UserName());
		votedoc.replaceItemValue("Score", 1);
		votedoc.save();
		//Now we also need to increment the score on the session
		var sessiondoc:NotesDocument = db.getDocumentByUNID(unid);
		if (sessiondoc.hasItem("Score")){
			sessiondoc.replaceItemValue("Score", sessiondoc.getItemValueInteger("Score") + 1);
		}else{
			sessiondoc.replaceItemValue("Score", 1);
		}
		sessiondoc.save();
	}
}

function demoteSession(unid){
	var db:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), database.getFilePath());
	var votes:NotesView = db.getView("Votes");
	var votedoc:NotesDocument = votes.getDocumentByKey(@UserName() + "|" + unid);
	if (votedoc == null){
		votedoc = db.createDocument();
		votedoc.replaceItemValue("Form", "Vote");
		votedoc.replaceItemValue("UNID", unid);
		votedoc.replaceItemValue("Person", @UserName());
		votedoc.replaceItemValue("Score", -1);
		votedoc.save();
		//Now we also need to increment the score on the session
		var sessiondoc:NotesDocument = db.getDocumentByUNID(unid);
		if (sessiondoc.hasItem("Score")){
			sessiondoc.replaceItemValue("Score", sessiondoc.getItemValueInteger("Score") - 1);
		}else{
			sessiondoc.replaceItemValue("Score", -1);
		}
		sessiondoc.save();
	}
}

function deleteSession(sessiondoc:NotesDocument){
	sessiondoc.remove(true);
}