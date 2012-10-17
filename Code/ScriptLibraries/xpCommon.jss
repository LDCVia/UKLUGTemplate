var TOPMENUITEMS = [
	{"title": "Home", "link": "/home.xsp", "controlpanelconfig": null}, 
	{"title": "Registration", "link": "/registration.xsp", "controlpanelconfig": "EnableAgenda"}, 
	{"title": "Agenda", "link": "/agenda.xsp", "controlpanelconfig": "EnableAgenda"}, 
	{"title": "Sessions", "link": "/sessions.xsp", "controlpanelconfig": null}, 
	{"title": "Speakers", "link": "/speakers.xsp", "controlpanelconfig": null}, 
	{"title": "Forum", "link": "http://www.uklug.info/forum", "controlpanelconfig": "EnableForum"}, 
	{"title": "Sponsors", "link": "/sponsors.xsp", "controlpanelconfig": null}, 
	{"title": "FAQ", "link": "/faqs.xsp", "controlpanelconfig": null}, 
	{"title": "Contact Us", "link": "/contact.xsp", "controlpanelconfig": null}
];

var TOPMENUITEMSUSER = [
	{"title": "Home", "link": "/home.xsp", "controlpanelconfig": null}, 
	{"title": "Agenda", "link": "/agenda.xsp", "controlpanelconfig": "EnableAgenda"}, 
	{"title": "Sessions", "link": "/sessions.xsp", "controlpanelconfig": null}, 
	{"title": "Speakers", "link": "/speakers.xsp", "controlpanelconfig": null}, 
	{"title": "Forum", "link": "http://www.uklug.info/forum", "controlpanelconfig": "EnableForum"}, 
	{"title": "Sponsors", "link": "/sponsors.xsp", "controlpanelconfig": null}, 
	{"title": "FAQ", "link": "/faqs.xsp", "controlpanelconfig": null}, 
	{"title": "Contact Us", "link": "/contact.xsp", "controlpanelconfig": null}
];


/**
 * Returns the name of the current XPage so for example
 * http://myserver/mydb.nsf/MyXPage.xsp will return /MyXPage.xsp
 */
function getCurrentXPage() {
	if (!viewScope.containsKey("currentxpage")) {
		var url = context.getUrl();
		url = @Left(url, ".xsp") + ".xsp";
		url = @Right(url, ".nsf/");
		viewScope.currentxpage = "/" + url;
	}
	return viewScope.currentxpage;
}

/**
Cache the dbPath variables in an applicationScope variable
*/
function getDbPath() {
	if (isCacheInvalid("dbpathweb", 600)) {
		synchronized(applicationScope) {
			var dbPath = @Left(context.getUrl(), ".nsf") + ".nsf";
			var pos = (context.isRunningContext("Notes")) ? 4 : 3;
			var secondPathElements = dbPath.split("/");
			var secondPath = "";
			for (pos; pos < secondPathElements.length; pos++) {
				if (secondPath != "") secondPath += "/";
				secondPath += secondPathElements[pos];
			}
			var res: Array = new Array();
			res.push(dbPath);
			res.push(secondPath);
			applicationScope.dbPathWeb = res;
		}
	}
	return applicationScope.dbPathWeb[0];
}
/**
A generic caching mechanism for each key will check to see if it is 'n' seconds
since it was last updated. Use for things that change relatively infrequently  
*/
function isCacheInvalid(key, cacheInterval) {
	var currentTime = new Date().getTime();
	if (!applicationScope.containsKey(key + "_time")) {
		applicationScope.put(key + "_time", currentTime);
		return true;
	}
	var diffInSecs = Math.ceil((currentTime - applicationScope.get(key + "_time")) / 1000);
	if (diffInSecs < cacheInterval) {
		return false;
	} else {
		applicationScope.put(key + "_time", currentTime);
		return true;
	}
}

function getControlPanelUNID(){
	if (isCacheInvalid("controlpanelunid", 600)){
		var controlpanels:NotesView = database.getView("controlPanels");
		var controlpanel:NotesDocument = controlpanels.getFirstDocument();
		if (controlpanel == null){
			controlpanel = database.createDocument();
			controlpanel.replaceItemValue("Form", "ControlPanel");
			controlpanel.computeWithForm(false, false);
			controlpanel.save();
		}
		applicationScope.controlpanelunid = controlpanel.getUniversalID();
		controlpanel.recycle();
		controlpanels.recycle();
	}
	return applicationScope.controlpanelunid;
}

function getControlPanelFieldString(fieldname){
	if (isCacheInvalid("controlpanel" + fieldname, 600)) {
		var controlpanel:NotesDocument = database.getDocumentByUNID(getControlPanelUNID());
		applicationScope.put("controlpanel" + fieldname, controlpanel.getItemValueString(fieldname));
		controlpanel.recycle();
	}
	return applicationScope.get("controlpanel" + fieldname);
}

function getControlPanelFieldArray(fieldname){
	//if (isCacheInvalid("controlpanel" + fieldname, 600)) {
		var controlpanel:NotesDocument = database.getDocumentByUNID(getControlPanelUNID());
		applicationScope.put("controlpanel" + fieldname, controlpanel.getItemValue(fieldname));
		controlpanel.recycle();
	//}
	return applicationScope.get("controlpanel" + fieldname);
}


function getControlPanelFieldInteger(fieldname){
	if (isCacheInvalid("controlpanel" + fieldname, 600)) {
		var controlpanel:NotesDocument = database.getDocumentByUNID(getControlPanelUNID());
		applicationScope.put("controlpanel" + fieldname, controlpanel.getItemValueInteger(fieldname));
		controlpanel.recycle();
	}
	return applicationScope.get("controlpanel" + fieldname);
}

/**
Date Converter code taken from Tommy Valand's blog:
http://dontpanic82.blogspot.com/2010/04/xpages-code-snippet-for-datestring.html
*/
var DateConverter = {
 dateToString: function( date:java.util.Date, pattern:String ){
  try {
   if( !date ){ return ''; }
  
   var formatter = DateConverter.getFormatter( pattern );
   return formatter.format( date );
  } catch( e ){
   // ErrorHandling
  }
 },
 
 stringToDate: function( dateString:String, pattern:String ){
  try {
   if( !dateString ){ return null; }
  
   var formatter = DateConverter.getFormatter( pattern );
   return formatter.parse( dateString );
  } catch( e ){
   // ErrorHandling
  }
 },
 
 getFormatter: function( pattern:String ){
  try {
   var cacheKey = 'dateFormatter' + pattern;
   var dateFormatter = applicationScope[ cacheKey ];
   if( !dateFormatter ){
    dateFormatter = new java.text.SimpleDateFormat( pattern );
    applicationScope[ cacheKey ] = dateFormatter;
   }
   
   return dateFormatter;
  } catch( e ){
   // ErrorHandling
  }
 } 
}