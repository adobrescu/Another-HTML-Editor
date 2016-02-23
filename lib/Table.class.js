function Table(doc, table, rows, cols)
{
	this.doc=doc;
	
	if(table)
	{
		this.element=table;
	}
	else
	{
		this.element=this.doc.createElement("table");
		this.element.appendChild(this.doc.createElement("tbody"));
		for(var i=0; i<rows; i++)
		{
			this.appendRow(cols);
		}
	}
}
with(Table)
{
	prototype.createRow=Table_createRow;
	prototype.appendRow=Table_appendRow;
	prototype.insertRows=Table_insertRows;
	prototype.removeRows=Table_removeRows;
	prototype.insertColumns=Table_insertColumns;
	prototype.setCaption=Table_setCaption;
	prototype.getRowNumCells=Table_getRowNumCells;
}
function Table_createRow(cols, cellTagName)
{
	var tr;
	
	if(!cellTagName)
	{
		cellTagName="TD";
	}
	tr=this.doc.createElement("TR");
	
	for(var i=0; i<cols; i++)
	{
		tr.appendChild(this.doc.createElement(cellTagName));
	}
	
	return tr;
}
function Table_appendRow(cols)
{
	this.element.firstChild.appendChild(this.createRow(cols));
}
function Table_insertRows(rows, tr, beforeRow)
{
	
	if(!tr)
	{
		return;
	}
	var cols, cellTagName;
	
	cols=this.getRowNumCells(tr);
	cellTagName=tr.parentNode.tagName=="THEAD" ? "th":"td";
	for(var i=0; i<rows; i++)
	{
		if(beforeRow)
		{
			tr.parentNode.insertBefore(this.createRow(cols, cellTagName), tr)
		}
		else
		{
			tr.parentNode.insertAfter(this.createRow(cols, cellTagName), tr);
		}
	}
}
function Table_removeRows(rows, tr, beforeRow)
{
	var trParent;
	
	trParent=tr.parentNode;
	
	tr.parentNode.removeChild(tr);
	
	if(trParent.tagName=="THEAD" || trParent.tagName=="TFOOT")
	{
		trParent.parentNode.removeChild(trParent);
	}
}
Table.prototype.insertRowCells=Table_insertRowCells;
function Table_insertRowCells(row, cellIndex, numCells, beforeIndex)
{
	for(var i=0; i<numCells; i++)
	{
		row.insertCell(beforeIndex?cellIndex:cellIndex+1);
	}
}
function Table_insertColumns(cols, td, beforeCol)
{
	var tdIndex=0;
	
	for(var i=0; i<td.parentNode.childNodes.length; i++)
	{
		if(!td.parentNode.childNodes[i].isElement() || (td.parentNode.childNodes[i].tagName!="TD" && td.parentNode.childNodes[i].tagName!="TH"))
		{
			continue;
		}
		
		if(td.parentNode.childNodes[i]==td)
		{
			break;
		}
		
		tdIndex++;
	}
	alert(tdIndex);
	for(var i=0; i<this.element.childNodes.length; i++)
	{
		if(!this.element.childNodes[i].isElement())
		{
			continue;
		}
		
		if(this.element.childNodes[i].tagName=="TR")
		{
			this.insertRowCells(this.element.childNodes[i], tdIndex, cols, beforeCol);
			continue;
		}
		
		for(var j=0; j<this.element.childNodes[i].childNodes.length; j++)
		{
			if(!this.element.childNodes[i].childNodes[j].isElement())
			{
				continue;
			}
			if(this.element.childNodes[i].childNodes[j].tagName!="TR")
			{
				continue;
			}
			
			this.insertRowCells(this.element.childNodes[i].childNodes[j], tdIndex, cols, beforeCol);
		}
	}
}
function Table_setCaption(caption)
{
	for(var i=0; i<this.element.childNodes.length; i++)
	{
		if(this.element.childNodes[i].isElement() && this.element.childNodes[i].tagName=="CAPTION")
		{
			if(!caption)
			{
				this.element.removeChild(this.element.childNodes[i]);
				return;
			}
			if(!this.element.childNodes[i].firstChild || !this.element.childNodes[i].firstChild.isText())
			{
				this.element.childNodes[i].prependChild(this.doc.createTextNode(caption));
			}
			if(this.element.childNodes[i].isEmpty())
			{
				this.element.removeChild(this.element.childNodes[i]);
			}
			return;
		}
	}

	if(!caption)
	{
		return;
	}
	
	this.element.prependChild(this.doc.createElement("caption"));
	this.element.firstChild.appendChild(this.doc.createTextNode(caption))
}
function Table_getRowNumCells(tr)
{
	var cols;
	
	cols=0;
	
	for(var i=0; i<tr.childNodes.length; i++)
	{
		if(tr.childNodes[i].isElement() && (tr.childNodes[i].tagName=="TD" ||tr.childNodes[i].tagName=="TH"))
		{
			cols++;
		}
	}	
	return cols;
}
////////////////////////////////////////////////
with(EditableContent)
{
	prototype.insertTable=EditableContent_insertTable;
	prototype.getTable=EditableContent_getTable;
	prototype.getRangeCommonAncestorByTagName=EditableContent_getRangeCommonAncestorByTagName;
}
function EditableContent_insertTable(rows, cols)
{
	var table;
	
	table=new Table(this.documentContainer.ownerDocument, null, rows, cols);
	var range=this.getRange();
	
	range.startContainer.parentNode.insertBefore(table.element, range.startContainer);
}
function EditableContent_getTable()
{
	var table;
	
	table=this.getRangeCommonAncestorByTagName('TABLE');
	
	if(table)
	{
		return new Table(this.documentContainer.ownerDocument, table);
	}
	
}
function EditableContent_getRangeCommonAncestorByTagName(tagName)
{
	var range, startRange, endRange, commonAncestor;
	
	tagName=tagName.toUpperCase();
	range=this.getRange();
	startRange=this.getRangeBoundary(range, true);
	endRange=this.getRangeBoundary(range, false);
	commonAncestor=startRange.container.getCommonAncestor(endRange.container);
	
	while(commonAncestor)
	{
		if(commonAncestor.isElement() && commonAncestor.tagName==tagName)
		{
			return commonAncestor;
		}
		commonAncestor=commonAncestor.parentNode;
	}
}