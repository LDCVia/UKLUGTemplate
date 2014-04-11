/**
 * Builds a URL to reference a presenter headshot photo
 */
function getPresenterPhoto(sessiondoc:NotesDocument, presentername){
	try{
		var out = "/person.png";
		var rtitem:NotesRichTextItem = null;
		if (sessiondoc.getItemValueString("Presenter") == presentername){
			rtitem = sessiondoc.getFirstItem("Photo");
		}else if(sessiondoc.getItemValueString("Presenter2") == presentername){
			rtitem = sessiondoc.getFirstItem("Photo2");
		}
		if (rtitem != null){
			var objects:java.util.Vector = rtitem.getEmbeddedObjects();
			if (objects.size() > 0){
				var object:NotesEmbeddedObject = objects.elementAt(0);
				out = getDbPath() + "/0/" + sessiondoc.getUniversalID() + "/$FILE/" + object.getName();
			}
		}
		return out;
	}catch(e){
		return "/person.png";
	}
}