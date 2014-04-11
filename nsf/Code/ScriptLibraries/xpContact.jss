/**
 * Sends an email to the address specified in Control Panel
 * No document is saved in the current database
 */
function sendFeedback(){
	emailBean.setSendTo( controlpanelBean.getFeedbackSendTo() );
	emailBean.setSubject("New Feedback from " + database.getTitle());
	emailBean.setSenderEmail(controlpanelBean.getRegistrationEmailFromEmail());
	emailBean.setSenderName(controlpanelBean.getRegistrationEmailFromName());
	emailBean.addHTML(viewScope.contactname + "<br />" + viewScope.contactemail + "<br />" + viewScope.contactbody);
	emailBean.send();
}