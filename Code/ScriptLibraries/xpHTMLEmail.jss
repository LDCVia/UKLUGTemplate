/*
 * Class to generate HTML e-mail messages from SSJS
 * 
 * Author: Mark Leusink (m.leusink@gmail.com)
 * 
 * Version: 2011-07-21
 * 
 * History:
 * 2011-12-07	initial version
 * 2011-12-08	added support for inline images
 * 2011-12-19	fixed wrong method name in usage samples
 *  
 * Usage example (simple):
 * 
 * var mail = new HTMLMail();
 * mail.setTo( "m.leusink@gmail.com")
 * mail.setSubject("Your notification");
 * mail.addHTML("<b>Hello world</b>");
 * mail.send();
 * 
 * Usage example (extended):
 * 
 * var mail = new HTMLMail();
 * mail.setTo( "m.leusink@gmail.com")
 * mail.setCC( ["user@domain.com", "anotheruser@domaino.com"] );
 * mail.setBB( "user3@domaino.com");
 * mail.setSubject("Your notification");
 * mail.addHTML("<h1>Hi!</h1>");
 * mail.addHTML("<table><tbody><tr><td>contents in a table here</td></tr></tbody></table>");
 * mail.addDocAttachment( "DC9126E84C59093FC1257953003C13E6", "jellyfish.jpg")
 * mail.addFileAttachment( "c:/temp/report.pdf");
 * mail.setSender("m.leusink@gmail.com", "Mark Leusink");
 * mail.send();
 */

var HTMLMail = function() {
	
	this._to = [];
	this._cc = [];
	this._bcc = [];
	
	this._fromEmail = null;
	this._fromName = null;
	
	this._subject = "";
	this._contentsHTML = [];
	this._contentsText = [];
	
	this._attachments = [];
		
	/*
	 * set "to", "CC" and/ or "BCC" addresses
	 * to = string or array of strings containing either e-mail addresses or Notes names
	 */
	this.setTo = function( to:String ) {
		if (typeof to === "string") { to = [to] };
		this._to = to;
	};
	this.setCC = function( to:String ) {
		if (typeof to === "string") { to = [to] };
		this._cc = to;		
	}
	this.setBCC = function( to:String ) {
		if (typeof to === "string") { to = [to] };
		this._bcc = to;		
	}
	
	//set the subject of the message
	this.setSubject = function( subject:String ) {
		this._subject = subject;
	}
	
	this.addHTML = function( content:String ) {
		this._contentsHTML.push(content);
		
		//create a plain text representation of the HTML contents:
		//remove all HTML tags and add a line break
		var plainText = content.replace( /<[a-zA-Z\/][^>]*>/g, "");
		this._contentsText.push( plainText + "\n" );		
	}
	
	this.addText = function( content:String ) {
		this._contentsText.push( content );
		
		//add html part by replacing all line breaks with a <br /> tag
		var htmlText = @ReplaceSubstring(content, @Char(13), "<br />");
		this._contentsHTML.push(htmlText);
	}
	
	
	//set the sender of the message
	//fromEmail is required, fromName is optional
	this.setSender = function( fromEmail:String, fromName:String ) {
		if ( fromEmail.length > 0 ) {
			this._fromEmail = fromEmail;
			this._fromName = fromName;
		}
	}
	
	/*
	 * add an attachment on a document to the mail message
	 * 
	 * unid (string) = unid of the document in the current database that contains the file to be send
	 * fileName (string) = well... guess...
	 * inlineImage (boolean, defaults to false): if set to true, this image is marked as "inline" (used in the content)
	 */ 
	this.addDocAttachment = function( unid:String , fileName:String, inlineImage:boolean) {
		var contentId = @Unique().toLowerCase();
		if (typeof inlineImage=="undefined") { inlineImage = false; }
		this._attachments.push( { type : "document", unid: unid, fileName : fileName, contentId : contentId, inline : inlineImage } );
		return "cid:" + contentId;
	}
	
	/* 
	 * add an OS file to the mail message
	 * 
	 * path (string): path of the file on the server
	 * fileName (string): fileName of the file
	 * inlineImage (boolean, defaults to false): if set to true, this image is marked as "inline" (used in the content)
	 */ 
	this.addFileAttachment = function( path:String, fileName:String, inlineImage:boolean  ) {
		var contentId = @Unique().toLowerCase();
		if (typeof inlineImage=="undefined") { inlineImage = false; }
		this._attachments.push( { type : "file", path : path, fileName : fileName, contentId : contentId, inline : inlineImage } );
		return "cid:" + contentId;
	}
	
	this.send = function() {
		
		session.setConvertMime(false);
		
		var doc:NotesDocument = database.createDocument();
		
		doc.replaceItemValue("RecNoOutOfOffice", "1");		//no replies from out of office agents
		
		var mimeRoot:NotesMIMEEntity = doc.createMIMEEntity("Body");
		var mimeHeader:NotesMIMEHeader;
		
		//set to
		if (this._to.length>0) {
			mimeHeader = mimeRoot.createHeader("To");
			mimeHeader.setHeaderVal( this._to.join(","));
		}
		//set cc
		if (this._cc.length>0) {
			mimeHeader = mimeRoot.createHeader("CC");
			mimeHeader.setHeaderVal( this._cc.join(","));
		}
		//set bcc
		if (this._bcc.length>0) {
			mimeHeader = mimeRoot.createHeader("BCC");
			mimeHeader.setHeaderVal( this._bcc.join(","));
		}
		
		//set subject
		mimeHeader = mimeRoot.createHeader("Subject");
		mimeHeader.setHeaderVal( this._subject);

		var mimeBoundary = doc.getUniversalID().toLowerCase();
		var stream:NotesStream;
		var mimeEntity:NotesMIMEEntity;
		
		//create text/alternative directive: text/plain and text/html part will be childs of this entity
		var mimeRootChild = mimeRoot.createChildEntity();
		mimeHeader = mimeRootChild.createHeader("Content-Type");
		mimeHeader.setHeaderVal( "multipart/alternative; boundary=\"" + mimeBoundary + "\"" );

		//create plain text part
		mimeEntity = mimeRootChild.createChildEntity();
		stream = session.createStream();
		stream.writeText(this._contentsText.join(""));
		mimeEntity.setContentFromText(stream, "text/plain; charset=\"UTF-8\"", NotesMIMEEntity.ENC_NONE);
		stream.close();
		
		//create HTML part
		mimeEntity = mimeRootChild.createChildEntity();
		stream = session.createStream();
		stream.writeText(this._contentsHTML.join("\n"));
		mimeEntity.setContentFromText(stream, "text/html; charset=\"UTF-8\"", NotesMIMEEntity.ENC_NONE);
		stream.close();
		
		//add attachments
		this._addAttachments(mimeRoot);
		
		//set the sender
		this._setSender(mimeRoot);
		
		//send the e-mail	
		doc.send();
		
		session.setConvertMime(true);
	};

	//retrieve a file from a document that should be added to the message
	this._addAttachments = function( mimeRoot:NotesMIMEEntity ) {
		
		var streamFile:NotesStream = null;
		
		//process document attachments
		for (var i=0; j=this._attachments.length, i<j; i++) {
			var att = this._attachments[i];
			
			is = null;
			
			//get content type for file
			var contentType = "application/octet-stream";
			var extension = @LowerCase(@RightBack( att.fileName, "."));
			if (extension=="gif") {
				contentType = "image/gif";
			} else if (extension=="jpg" || extension=="jpeg") {
				contentType = "image/jpeg";
			} else if (extension=="png") {
				contentType = "image/png";
			}
			
			contentType += "; name=\"" + att.fileName + "\"";
			
			var eo:NotesEmbeddedObject = null;
			var is = null;
			
			try {
			
				if ( att.type.equals("document")) {
				
					//retrieve the document containing the attachment to send from the current database
					var docFile:NotesDocument = database.getDocumentByUNID( att.unid );
					if (null != docFile) {

						eo = docFile.getAttachment(att.fileName);
						is = eo.getInputStream();
					} 
				
				} else {
					
					is = new java.io.FileInputStream( att.path + att.fileName );
					
				}
				
				if (is != null) {
					
					var mimeChild = mimeRoot.createChildEntity();
					var mimeHeader = mimeChild.createHeader("Content-Disposition");
					
					if (att.inline) {
						mimeHeader.setHeaderVal("inline; filename=\"" + att.fileName + "\"");
					} else {
						mimeHeader.setHeaderVal("attachment; filename=\"" + att.fileName + "\"");
					}
					
					mimeHeader = mimeChild.createHeader("Content-ID");
					mimeHeader.setHeaderVal( "<" + att.contentId + ">" );

					streamFile = session.createStream();
					streamFile.setContents(is);
					mimeChild.setContentFromBytes(streamFile, contentType, NotesMIMEEntity.ENC_IDENTITY_BINARY);
				
				}
				
			
			} catch (e) {
				print("error while adding attachment: " + e.toString());
			} finally {
				if (is != null) { is.close(); }
				if (eo != null) { eo.recycle(); }
			}

		}	
	
	}
	
	//change the sender of an e-mail
	this._setSender = function( mimeRoot:NotesMIMEEntity ) {
		
		if (this._fromEmail==null) {
			return;
		}
		
		var mimeHeader:NotesMIMEHeader = null;
		
		mimeHeader = mimeRoot.createHeader("Reply-To");
		mimeHeader.setHeaderVal(this._fromEmail);
		
		mimeHeader = mimeRoot.createHeader("Return-Path");
		mimeHeader.setHeaderVal(this._fromEmail);
		
		if (this._fromName==null) {
			
			mimeHeader = mimeRoot.createHeader("From");
			mimeHeader.setHeaderVal(this._fromEmail);
			mimeHeader = mimeRoot.createHeader("Sender");
			mimeHeader.setHeaderVal(this._fromEmail);
		
		} else {
			
			mimeHeader = mimeRoot.createHeader("From");
			mimeHeader.setHeaderVal( "\"" + this._fromName + "\" <" + this._fromEmail + ">" );
			mimeHeader = mimeRoot.createHeader("Sender");
			mimeHeader.setHeaderVal( "\"" + this._fromName + "\" <" + this._fromEmail + ">" );
			
		}
		
	};
		
}
