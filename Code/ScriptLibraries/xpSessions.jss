function approveSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Status", "Approved");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
	emailBean.setSendTo(sessiondoc.getItemValueString("CreatedBy"));
	emailBean.setSubject(getControlPanelFieldString("SessionEmailAcceptedSubject"));
	emailBean.setSenderEmail(getControlPanelFieldString("SessionEmailFromEmail"));
	emailBean.setSenderName(getControlPanelFieldString("SessionEmailFromName"));
	var body = getControlPanelFieldString("SessionEmailAcceptedBody");
	body = @ReplaceSubstring(body, "@sessiontitle@", sessiondoc.getItemValueString("Title"));
	emailBean.addHTML(body);
	emailBean.send();
}

function rejectSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Status", "Unapproved");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
	emailBean.setSendTo(sessiondoc.getItemValueString("CreatedBy"));
	emailBean.setSubject(getControlPanelFieldString("SessionEmailRejectedSubject"));
	emailBean.setSenderEmail(getControlPanelFieldString("SessionEmailFromEmail"));
	emailBean.setSenderName(getControlPanelFieldString("SessionEmailFromName"));
	var body = getControlPanelFieldString("SessionEmailRejectedBody");
	body = @ReplaceSubstring(body, "@sessiontitle@", sessiondoc.getItemValueString("Title"));
	emailBean.addHTML(body);
	emailBean.send();
	unpublishSession(sessiondoc);
}

function publishSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Published", "Yes");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
}

function unpublishSession(sessiondoc:NotesDocument){
	sessiondoc.replaceItemValue("Published", "No");
	sessiondoc.computeWithForm(false, false);
	sessiondoc.save();
}