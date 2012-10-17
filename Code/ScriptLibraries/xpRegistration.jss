import xpHTMLEmail;

function registerNewUser(firstname, lastname, email, password){
	var dbNab:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), getControlPanelFieldString("RegistrationNAB"));
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
		//print("Saving new person doc: " + docPerson.getUniversalID() + " in " + dbNab.getTitle());
		docPerson.save();
		
		var addviews = new Array();
		addviews.push(dbNab.getView("($LDAPCN)"));
		addviews.push(dbNab.getView("($Users)"));
		addviews.push(dbNab.getView("($ServerAccess)"));
		addviews.push(dbNab.getView("($VIMPeople)"));
		for(var i=0; i<addviews.length; i++)
			addviews[i].refresh();
		//print("Refreshed views");
		
		//Send Notification Email
		try{
			emailBean.setSendTo( email );
			emailBean.setSubject(getControlPanelFieldString("RegistrationEmailSubject"));
			emailBean.setSenderEmail(getControlPanelFieldString("RegistrationEmailFromEmail"));
			emailBean.setSenderName(getControlPanelFieldString("RegistrationEmailFromName"));
			emailBean.addHTML(getControlPanelFieldString("RegistrationEmailBody"))
			emailBean.send();
		}catch(e){}
	}
}

var addUserToGroup = function(nname){
	var group = getControlPanelFieldString("RegistrationUsersGroup");
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

function makeOrganization(s){
	s = @ReplaceSubstring(s, ["!", "#", "$", "%", "*", "?", "/", "|", "^", "{", "}", "`", "~", "&", "'", "+", "=", "_", "@", "/", "\""], "");
	return s;
}

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
	emailBean.setSubject(getControlPanelFieldString("ForgottenEmailSubject"));
	emailBean.setSenderEmail(getControlPanelFieldString("ForgottenEmailFromEmail"));
	emailBean.setSenderName(getControlPanelFieldString("ForgottenEmailFromName"));
	var body = getControlPanelFieldString("ForgottenEmailBody");
	body = @ReplaceSubstring(body, "@code@", code);
	emailBean.addHTML(body);
	emailBean.send();
}

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 6; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function changePassword(email, newpassword){
	var db:NotesDatabase = sessionAsSigner.getDatabase(database.getServer(), getControlPanelFieldString("RegistrationNAB"));
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