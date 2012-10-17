function sendFeedback(){
	emailBean.setSendTo( getControlPanelFieldString("FeedbackSendTo") );
	emailBean.setSubject("New Feedback from " + database.getTitle());
	emailBean.setSenderEmail(viewScope.contactname);
	emailBean.setSenderName(viewScope.contactemail);
	emailBean.addHTML(viewScope.contactbody);
	emailBean.send();
}