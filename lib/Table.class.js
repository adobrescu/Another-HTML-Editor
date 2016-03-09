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
	
	Table.prototype.___instances[Table.prototype.___instances.length]=this;
	if(navigator.userAgent.indexOf("Firefox")!=-1)
	{
		this.element.contentEditable=false;
		this.element.visitDescendants([this, "disableContentEditable"]);//, ca/*callbackArguments*/, beforeAndAfterChildNodes, visitThis, depth)
	}
}
with(Table)
{
	prototype.___instances=[];
	prototype.disableContentEditable=Table_disableContentEditable;
	prototype.getChildElementsByTagName=Table_getChildElementsByTagName;
	prototype.createRow=Table_createRow;
	prototype.appendRow=Table_appendRow;
	prototype.getSectionRow=Table_getSectionRow;
	prototype.createSection=Table_createSection;
	prototype.insertRows=Table_insertRows;
	prototype.removeRows=Table_removeRows;
	prototype.insertRowCells=Table_insertRowCells;
	prototype.insertColumns=Table_insertColumns;
	prototype.mergeCellsInBetweenCells=Table_mergeCellsInBetweenCells;
	prototype.setCaption=Table_setCaption;
	prototype.getRowNumCells=Table_getRowNumCells;
}
function Table_disableContentEditable(node)
{
	if(node.isElement())
	{
		if(node.tagName=="TD" || node.tagName=="TH")
		{
			node.contentEditable=true;
		}
		else
		if(node.tagName=="TABLE")
		{
			node.contentEditable=false;
		}
	}
}
function Table_getChildElementsByTagName(tagName)
{
	var childElements=[];
	
	tagName=tagName.toUpperCase();
	
	for(var i=0; i<this.element.childNodes.length; i++)
	{
		if(!this.element.childNodes[i].isElement() || this.element.childNodes[i].tagName!=tagName)
		{
			continue;
		}
		childElements[childElements.length]=this.element.childNodes[i];
	}
	return childElements;
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

function Table_getSectionRow(section, rowIndex)
{
	var i, j=0;
	
	for(i=0; i<section.childNodes.length; i++)
	{
		if(!section.childNodes[i].isElement() || section.childNodes[i].tagName!="TR")
		{
			continue;
		}
		
		if(j==rowIndex)
		{
			return section.childNodes[i];
		}
		
		j++;
	}
}

function Table_createSection(sectionTagName)
{
	sectionTagName=sectionTagName.toUpperCase();
	if(sectionTagName=="TFOOT")
	{
		for(var i=this.element.childNodes.length-1; i>=0; i--)
		{
			if(!this.element.childNodes[i].isElement() || (this.element.childNodes[i].tagName!="TBODY" && this.element.childNodes[i].tagName!="TR"))
			{
				continue;
			}
			break;
		}
		
		return this.element.insertAfter(this.doc.createElement("TFOOT"), this.element.childNodes[i]);
	}
	if(sectionTagName=="THEAD")
	{
		for(var i=0; i<this.element.childNodes.length; i++)
		{
			if(!this.element.childNodes[i].isElement() || (this.element.childNodes[i].tagName!="TBODY" && this.element.childNodes[i].tagName!="TR"))
			{
				continue;
			}
			break;
		}
		
		return this.element.insertBefore(this.doc.createElement("THEAD"), this.element.childNodes[i]);
	}
}
function Table_insertRows(rows, tr, sectionTagName, beforeRow)
{
	
	if(!tr)
	{
		return;
	}
	var cols, cellTagName, section;
	
	cols=this.getRowNumCells(tr);
	
	if(sectionTagName)
	{
		section=this.getChildElementsByTagName(sectionTagName);
		if(section.length==0)
		{
			section=this.createSection(sectionTagName);
			tr=null;
		}
		else
		{
			section=section[0];
			tr=this.getSectionRow(section, beforeRow?0:-1);
		}
		
		
	}
	else
	{
		section=tr.parentNode;
	}
	cellTagName=section.tagName=="THEAD" ? "th":"td";
	
	for(var i=0; i<rows; i++)
	{
		if(!tr)
		{
			section.appendChild(this.createRow(cols, cellTagName));
		}
		else
		{
			if(beforeRow)
			{
				section.insertBefore(this.createRow(cols, cellTagName), tr)
			}
			else
			{
				section.insertAfter(this.createRow(cols, cellTagName), tr);
			}
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
Table.prototype.getCellIndex=Table_getCellIndex;
function Table_getCellIndex(td)
{
	var index=0;
	for(var i=0; i<td.parentNode.childNodes.length; i++)
	{
		if(!td.parentNode.childNodes[i].isElement() || (td.parentNode.childNodes[i].tagName!="TD" && td.parentNode.childNodes[i].tagName!="TH"))
		{
			continue;
		}
		
		if(td.parentNode.childNodes[i]==td)
		{
			return index;
		}
		
		index++;
	}
}
function Table_mergeCellsInBetweenCells(startTD, endTD)
{
	if(startTD.parentNode.parentNode!=endTD.parentNode.parentNode)
	{
		throw new CustomError(0, "Cannont merge cells from different table sections");
	}
	
	var startIndex, endIndex, index;
	var mergeTDs=[];
	var mergeNumRows=0;
	
	startIndex=this.getCellIndex(startTD);
	endIndex=this.getCellIndex(endTD);
	
	console.log("startIndex="+startIndex);
	console.log("endIndex="+endIndex);
	
	for(var tr=startTD.parentNode; tr!=endTD.parentNode.nextSibling; tr=tr.nextSibling)
	{
		if(!tr.isElement() || tr.tagName!="TR")
		{
			continue;
		}
		index=-1;
		
		for(var i=0; i<tr.childNodes.length; i++)
		{
			if(!tr.childNodes[i].isElement())
			{
				continue;
			}
			
			index++;
			
			if(index<startIndex)
			{
				continue;
			}
			if(index>endIndex)
			{
				break;
			}
			mergeTDs[mergeTDs.length]=tr.childNodes[i];
		}
		console.log("DA");
		mergeNumRows++;
	}
	if(mergeTDs.length<=1)
	{
		return;
	}
	if(mergeNumRows>1)
	{
		mergeTDs[0].rowSpan=mergeNumRows;
	}
	if(endIndex-startIndex+1>1)
	{
		mergeTDs[0].colSpan=endIndex-startIndex+1;
	}
	
	if(mergeTDs[1].parentNode==mergeTDs[0].parentNode)
	{
		mergeTDs[0].appendChild(this.doc.createTextNode(" "));
	}
	else
	{
		mergeTDs[0].appendChild(this.doc.createElement("BR"));
	}
	var appendBR;
	for(var i=1; i<mergeTDs.length; i++)
	{
		if(i<mergeTDs.length-1)
		{
			if(mergeTDs[i].parentNode==mergeTDs[i+1].parentNode)
			{
				appendBR=false;
			}
			else
			{
				appendBR=true;
			}
		}
		mergeTDs[0].appendNodeContent(mergeTDs[i]);
		if(appendBR)
		{
			mergeTDs[0].appendChild(this.doc.createElement("BR"));
		}
		else
		{
			mergeTDs[0].appendChild(this.doc.createTextNode(" "));
		}
		//mergeTDs[i].style.backgroundColor="red";
		//mergeTDs[i].parentNode.removeChild(mergeTDs[i]);
	}
	console.log("mergeNumRows="+((endIndex-startIndex)+1));
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