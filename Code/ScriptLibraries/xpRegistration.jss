/**
 * Wrapper function which registers a new person on the domino server
 * Person document created in NAB, Group modified or created
 * Email sent to user
 */
function registerNewUser(firstname, lastname, email, password){
	var dbNab:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), controlpanelBean.getRegistrationNAB());
	var nname = session.createName(firstname + " " + lastname + "/" + makeOrganization(email));
	if (addUserToGroup(nname)){
		dbNab.setDelayUpdates(false);
		
		var docPerson = dbNab.createDocument();
		docPerson.replaceItemValue("form", "Person");
		docPerson.replaceItemValue("Type", "Person");
		docPerson.replaceItemValue("LastName", lastname);
		docPerson.replaceItemValue("FirstName", firstname);
		var item = docPerson.replaceItemValue("FullName","");
		item.appendToTextList(nname.getCanonical());
		item.appendToTextList(firstname + " " + lastname);
		item.appendToTextList(email);
		docPerson.replaceItemValue("HTTPPassword", password);
		docPerson.replaceItemValue("accountstatus", "Not Verified");
		docPerson.replaceItemValue("MailSystem", "5");
		docPerson.replaceItemValue("InternetAddress", email);
		
		docPerson.computeWithForm( false, false );
		docPerson.save();
		
		var addviews = new Array();
		addviews.push(dbNab.getView("($LDAPCN)"));
		addviews.push(dbNab.getView("($Users)"));
		addviews.push(dbNab.getView("($ServerAccess)"));
		addviews.push(dbNab.getView("($VIMPeople)"));
		for(var i=0; i<addviews.length; i++)
			addviews[i].refresh();
		
		//Send Notification Email
		try{
			emailBean.setSendTo( email );
			emailBean.setSubject(controlpanelBean.getRegistrationEmailSubject());
			emailBean.setSenderEmail(controlpanelBean.getRegistrationEmailFromEmail());
			emailBean.setSenderName(controlpanelBean.getRegistrationEmailFromName());
			emailBean.addHTML(controlpanelBean.getRegistrationEmailBody())
			emailBean.send();
		}catch(e){}
	}
}

/**
 * Function which adds the new user name to the ACL group specified in Control Panel
 */
var addUserToGroup = function(nname){
	var group = controlpanelBean.getRegistrationUsersGroup();
	var dbMainNab = sessionAsSigner.getDatabase(database.getServer(), "names.nsf");
	var groups = dbMainNab.getView("Groups");
	var docGroup = groups.getDocumentByKey(group, true);
	
	if (docGroup == null){
		docGroup = dbMainNab.createDocument();
		docGroup.replaceItemValue("Form", "Group");
		docGroup.replaceItemValue("ListName", group);
		docGroup.replaceItemValue("Members",  group + " 1");
		docGroup.replaceItemValue("GroupType", "0");
		docGroup.replaceItemValue("ListDescription", "Do NOT edit this group manually, it is updated via an agent!!!");
		docGroup.computeWithForm( false, false );
		docGroup.save();
	}
	
	var groupMainMembers = docGroup.getFirstItem( "Members" );
	var subGroup = "";
	for (var x=groupMainMembers.getValues().length; i>=0; i--){
		if (@Left(groupMainMembers.getValues()[x], @Length( group  )) == group)
			subGroup = groupMainMembers.getValues()[x];
	}
	
	groupNum = 0;
	
	if (subGroup != "")
		groupNum = @TextToNumber( @Right( subGroup, @Length( subGroup ) - @Length( group ) - 1 ) );
	else{
		groupNum = 1
		subGroup = group + " 1";
	}
	
	while(true){
		var groupSubDoc = groups.getDocumentByKey( subGroup, true );
		
		if (groupSubDoc == null){
			groupSubDoc = dbMainNab.createDocument();
			groupSubDoc.replaceItemValue("Form", "Group");
			groupSubDoc.replaceItemValue("ListName", subGroup);
			groupSubDoc.replaceItemValue("GroupType", "0");
			groupSubDoc.computeWithForm( false, false );
			
			if (!groupMainMembers.containsValue( subGroup )){
				try{
					groupMainMembers = docGroup.getFirstItem("Members");
					groupMainMembers.appendToTextList(subGroup);
					saveGroupMainDoc = true;
				}catch(e){
					_dump(e);
				}
			}
		}
		var groupSubMembers = groupSubDoc.getFirstItem( "Members" );
		
		if (groupSubMembers.getValueLength() < 10000)
			break;
		
		groupNum = groupNum + 1;
		subGroup = group + " " + groupNum;
	}
	
	groupSubMembers.appendToTextList(nname.getCanonical());
	groupSubDoc.save( false, true );
	docGroup.save( false, true );
	return true;
}

/**
 * Sanitizes an email address so that it can be used as the new user's Organisation
 */
function makeOrganization(s){
	s = @ReplaceSubstring(s, ["!", "#", "$", "%", "*", "?", "/", "|", "^", "{", "}", "`", "~", "&", "'", "+", "=", "_", "@", "/", "\"", "-"], "");
	return s;
}

/**
 * Generates a unique, temporary key which allows the user to change their password.
 */
function sendForgottenPasswordEmail(email){
	var code = makeid();
	var codes:java.util.Hashtable = null;
	if (applicationScope.containsKey("resetpasswordcodes")){
		codes = applicationScope.resetpasswordcodes;
	}else{
		codes = new java.util.Hashtable();
	}
	codes.put(email, code);
	applicationScope.resetpasswordcodes = codes;
	emailBean.setSendTo(email);
	emailBean.setSubject(controlpanelBean.getForgottenEmailSubject());
	emailBean.setSenderEmail(controlpanelBean.getForgottenEmailFromEmail());
	emailBean.setSenderName(controlpanelBean.getForgottenEmailFromName());
	var body = controlpanelBean.getForgottenEmailBody();
	body = @ReplaceSubstring(body, "@code@", code);
	emailBean.addHTML(body);
	emailBean.send();
}

/**
 * Generates a mixed case 6 character unique key
 */
function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 6; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Changes a user's HTTP Password
 */
function changePassword(email, newpassword){
	var db:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), controlpanelBean.getRegistrationNAB());
	var vwAll:NotesView = db.getView("($Users)");
	var person:NotesDocument = vwAll.getDocumentByKey(email);
	if (person != null){
		person.replaceItemValue("HTTPPassword", session.evaluate("@Password(\"" + newpassword + "\")"));
		person.save();
		person.recycle();
	}
	vwAll.recycle();
	db.recycle();
}