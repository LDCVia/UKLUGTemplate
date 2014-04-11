/**
 * Builds a URL to reference a sponsor logo image
 */
function getSponsorPhoto(sponsordoc:NotesDocument){
	try{
		var out = "/blank.gif";
		var rtitem:NotesRichTextItem = null;
		rtitem = sponsordoc.getFirstItem("Files");
		if (rtitem != null){
			var objects:java.util.Vector = rtitem.getEmbeddedObjects();
			if (objects.size() > 0){
				var object:NotesEmbeddedObject = objects.elementAt(0);
				out = getDbPath() + "/0/" + sponsordoc.getUniversalID() + "/$FILE/" + object.getName();
			}
		}
		return out;
	}catch(e){
		return "/blank.gif";
	}
}