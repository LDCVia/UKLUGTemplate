/**
*
* The table walker helps to manage collections of multi-value fields
* that form a table inside a notes document
*
**/
var tableWalker = {
	variableName : "variable",
	dataName : "data",
	fieldName : "fields",
	fieldCount : 0,
	fieldArray : new Array(),

	
	// Set the variable names for the variables we use in the context
	// We might get away without them once we can make sure we have stable JSON storage
	setVariableNames : function(vname) {
		this.variableName = vname;
		this.dataName = vname+"_data";
		this.fieldName = vname+"_fields";
	},
	
	// The fields for this datasource
	setFieldList : function(fList:String) {
		if (fList == null || fList == "") {
			this.fieldList = viewScope.get(this.fieldName)
		} else {
			// We overwrite the field list
			viewScope.put(this.fieldName,fList);
			this.fieldList = fList
		}
		this.fieldArray = this.fieldList.split(",");
		this.fieldCount = this.fieldArray.length
	},
	
	
	/**
	* getDataSource retrieves a collection of multivalue fields as datasource
	* If the variable already exists in the viewScope that variable is used
	* otherwise the field values are pulled from the given Domino document
	* doc: the NotesDocument
	* fieldList: a string with all the fieldName
	* variableName: under wich name will that field be stored into the viewScope
	*               there will be 2 variables one [name]_data and one [name]_fields
	*               e.g. if variableName is abc the data is abc_data and the fieldnames is abc_fields
	* if the caller is sure, that the source exists only the variable name is needed
	* same applies if the caller is sure that the fieldList is already in the scope
	*
	**/
	getDataSource : function (variableName:String, doc:NotesXspDocument, fieldList:String) {
	
		// Capture the variables
		this.setVariableNames(variableName);
		
		// Now we need to retrieve the field names
		this.setFieldList(fieldList)
		
		// Try to get valid data from the viewScope
		var theDataWeWant:Array = viewScope.get(this.dataName);
	
		if ( theDataWeWant != null) {
			// We have existing content and are done
			return theDataWeWant
		}
	
		// Now we check if we have a valid document, we would need that
		if (doc == null || typeof doc === "undefined") {
			print("Document was null");
			return null //We don't have data here
		}
	
		// And the data... using an existing function
		return	this.storeDataSourceInViewScope(doc)
	},
	
	/**
	* storeDataSourceInViewScope extracts a set of multi value fields into an array and stores that into
	* the viewContext for later retrieval
	* doc: the NotesDocument
	* fieldList: a string with all the fieldName
	* variableName: under wich name will that field be stored into the viewScope
	*               there will be 2 variables one [name]_data and one [name]_fields
	*               e.g. if variableName is abc the data is abc_data and the fieldnames is abc_fields
	**/

	storeDataSourceInViewScope : function(doc:NotesXspDocument) {
	
		var theDataWeWant = new Array(); // Our matrix with field values
		
		// get a 2 dimensional array with rows=fields, cols=field values
		var fieldValueArray:Array = this.getListWithValues(doc);
		
		var firstFieldSet = fieldValueArray[0]; // The first column, we use to determine row count
		var rowCount = firstFieldSet.length; // How many rows with values
		var colCount = this.fieldCount; // How many unique fields = columns
	
		// now transpose that array to cols = fields and rows= field values
		for (var row = 0; row < rowCount; row++) {
			// Array that holds one value row
			var rowWithValues = new Array();
			// Loop through all properties a.k.a columns
			for (var col = 0; col < colCount; col++) {
				 // remember: in the source array it row and col are mixed up
				rowWithValues.push(fieldValueArray[col][row]);
			}		
			// Assign the new Object to the result
			theDataWeWant.push(rowWithValues);
		}
	
		// Store our results into the viewContext
		viewScope.put(this.dataName,theDataWeWant);
	
		// Return the array for direct use
		return theDataWeWant
	},
	
	// Retrieves a list of field values into an array, one element (row) per field, the
	// elements are arrays (columns) of values
	getListWithValues : function(doc:NotesXspDocument) {
		var result = new Array(); // the resulting array
		for (var i = 0; i < this.fieldCount; i++) {
			// NotesItem values come back as Vectors
			var rawResult = doc.getItemValueArray(this.fieldArray[i]);
			var curResult = new Array();
			// Loop through the resulting values, works for array and vector and is
			// neutral to the data type
			if (rawResult != null) {
				if(@Elements(rawResult) > 0){
					for (curVal in rawResult){
						curResult.push(rawResult[curVal]);
					}
				}else{
					curResult = rawResult;
				}
			}
			// This adds one field
			result.push(curResult);
		}
		return result	
	},
	
	/**
	*
	* addRow adds a row to an existing array that is bound to controls
	* variableName = name of viewScope variable to hold the Array
	* rowNumberToInsertBefore = where to insert, if omitted -> append a row
	**/
	addRow : function (variableName:String, rowNumberToInsertBefore, initialValues) {
		//Get the current array
		var theDataWeWant:Array = this.getDataSource(variableName);

		if (theDataWeWant == null || typeof theDataWeWant != "java.util.Vector") {
			//Nothing to add on
			log("Function addRow: DataArray is empty")
			return null
		}

		var emptyArray = new Array(this.fieldCount);
		if (initialValues != null){
			for(var i=0; i<emptyArray.length; i++){
				if (i<emptyArray.length && i<initialValues.length){
					emptyArray[i] = initialValues[i];
				}else{ //Added to populate numbers into hours cells
					emptyArray[i] = "";
				}
			}
		}	
		//Now append that to the existing array
		if (rowNumberToInsertBefore == null) {
			theDataWeWant.push(emptyArray)
		} else {
			//Splice doesn't seem to work with with two dimensional arrays
			//theDataWeWant.splice(rowNumberToInsertBefore,0,emptyArray)
			var curRowCount = theDataWeWant.length; // How much data do we have
			var insertComplete = false; // To handle too high insert rows
			var newDataWeWant = new Array();
		
			// Move all rows to new array. Insert where appropriate
			for (var i = 0 ; i < curRowCount; i++) {
				if (rowNumberToInsertBefore == i && !insertComplete) {
					newDataWeWant.push(emptyArray);
					insertComplete = true
				}
				newDataWeWant.push(theDataWeWant[i])	
			}
			if (!insertComplete) {
				// We don't have a new line, so we append one
				newDataWeWant.push(emptyArray);
			}
	
			// Store it back
			viewScope.put(this.dataName,newDataWeWant);
			return newDataWeWant
		}
		return theDataWeWant
	},
	
	/**
	*
	* removeRow adds a row to an existing array that is bound to controls
	* variableName = name of viewScope variable to hold the Array
	* rowNumberToDelete = which row needs deletion
	**/
	removeRow : function (variableName:String, rowNumberToDelete) {

		var theDataWeWant:Array = this.getDataSource(variableName);

		if (theDataWeWant == null) {
			//Nothing to add on
			print("Function removeRow: DataArray is empty")
			return null
		}
		
		var curRowCount = theDataWeWant.length;
		
		if (curRowCount > 1) {
			// We only proceed if we have more than one row left		
			// Splice doesn't seem to work with 2 dimensional arrays
			// theDataWeWant.splice(rowNumberToDelete,1)
			if (rowNumberToDelete == (curRowCount - 1)) {
				theDataWeWant.pop() //Last row, just pop it away
			} else {
				// We need to rescue the stack
				var newDataWeWant = new Array();
	
				// Move all rows to the rescue array
				for (var i = 0 ; i < curRowCount; i++) {
					if (!(rowNumberToDelete == i)) {
					newDataWeWant.push(theDataWeWant[i])
					}
				}	
				// Store it back
				viewScope.put(this.dataName,newDataWeWant);
				return newDataWeWant
			}	
		}
		return theDataWeWant
	},
	
	/**
	*
	* updateDocument writes the field value back into the Notes document
	* typically in a QueryDocumentSave event
	*
	*/
	updateDocument : function updateDocument(variableName:String, doc:NotesXspDocument) {
	
		var fieldData:Array = this.getDataSource(variableName);
	
		if ( fieldData == null) {
			// No data in the array, nothing to do
			print("No fieldData found in updateDocument");
			return null
		}
	
		// We need to pick for every field the column value from the array
		// TODO: make this more efficient!
		for (var i = 0; i < this.fieldArray.length; i++) {
			var curFieldName = this.fieldArray[i];
			var curData = new Array();
			// get the field value for
			for(dataRow in fieldData) {
				curData.push(dataRow[i])
			}
			doc.replaceItemValue(curFieldName,curData);
		}
	},
	
	// retrieve the number of rows
	rowCount : function(variableName:String) {
		var fieldData:Array = this.getDataSource(variableName);
	
		if ( fieldData == null) {
			return 0;
		}
		
		return fieldData.length
	}
}
