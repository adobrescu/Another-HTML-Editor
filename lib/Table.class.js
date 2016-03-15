

HTMLTableElement.prototype.init=function(contentEditable)
{	
	if(this.initialised)
	{
		return;
	}
	
	this.initialised=true;
	this.contentEditable=contentEditable?true:false;
	this.selectedCells=[];
	
	if(navigator.userAgent.indexOf("Firefox")!=-1)
	{
		this.contentEditable=false;
		this.visitDescendants([this, "disableContentEditable"]);//, ca/*callbackArguments*/, beforeAndAfterChildNodes, visitThis, depth)
	}
	
	this.refOnClickCell=new Function("evt",  "HTMLTableElement.prototype.___instances["+HTMLTableElement.prototype.___instances.length+"].onClickCell(evt)");
	this.addEventListener("click", this.refOnClickCell);
	
	HTMLTableElement.prototype.___instances[HTMLTableElement.prototype.___instances.length]=this;
	return;
	if(table)
	{
		this.element=table;
		
		this.element.addEventListener("mouseup", function(){alert('daxxa')} );
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
with(HTMLTableElement)
{
	
	prototype.___instances=[];
	prototype.onClickCell=HTMLTableElement_onClickCell;
	prototype.selectCells=HTMLTableElement_selectCells;
	prototype.disableContentEditable=HTMLTableElement_disableContentEditable;
	prototype.getChildElementsByTagName=HTMLTableElement_getChildElementsByTagName;
	prototype.createRow=HTMLTableElement_createRow;
	prototype.appendRow=HTMLTableElement_appendRow;
	prototype.getSectionRow=HTMLTableElement_getSectionRow;
	prototype.getRowIndex=HTMLTableElement_getRowIndex;
	prototype.createSection=HTMLTableElement_createSection;
	prototype.insertRows=HTMLTableElement_insertRows;
	prototype.removeRows=HTMLTableElement_removeRows;
	prototype.insertRowCells=HTMLTableElement_insertRowCells;
	prototype.insertColumns=HTMLTableElement_insertColumns;
	prototype.mergeCellsInBetweenCells=HTMLTableElement_mergeCellsInBetweenCells;
	prototype.setCaption=HTMLTableElement_setCaption;
	prototype.getRowNumCells=HTMLTableElement_getRowNumCells;
}
function HTMLTableElement_onClickCell(evt)
{
	var td;
	if(!evt.altKey)
	{
		return;
	}
	if(!(td=evt.target.getAncestorByTagName("TD")))
	{
		td=evt.target.getAncestorByTagName("TH");
	}
	
	if(!this.anchorSelectedCell)
	{
		this.anchorSelectedCell=td;
		return;
	}
	//this.selectionFocusCell=td;
	
	this.selectedCells[this.selectedCells.length]=this.getCellsBetween(this.anchorSelectedCell, td);
	this.anchorSelectedCell=null;
	var sections, section;
	
	sections=this.getSections();
	
	var startSectionIndex=this.selectedCells[0][0].sectionIndex;
	var endSectionIndex=this.selectedCells[0][this.selectedCells[0].length-1].sectionIndex;
	
	for(var i=0; i<sections.length; i++)
	{
		if(i<startSectionIndex || i>endSectionIndex)
		{
			for(var j=0; j<sections[i].rows.length; j++)
			{
				for(var k=0; k<sections[i].rows[j].cells.length; k++)
				{
					sections[i].rows[j].cells[k].removeClassName("selected");
				}
			}
			
			continue;
		}
	}
	for(var i=0; i<this.selectedCells.length; i++)
	{
		for(var j=0; j<this.selectedCells[i].length; j++)
		{
			section=sections[this.selectedCells[i][j].sectionIndex];
			var border=new Border(this.ownerDocument);

			border.surroundElements(section.rows[this.selectedCells[i][j].startRow].cells[this.selectedCells[i][j].startCol],
									section.rows[this.selectedCells[i][j].endRow].cells[this.selectedCells[i][j].endCol]);
			border.show();
		}
	}
}
HTMLTableElement.prototype.getCellsBetween=HTMLTableElement_getCellsBetween;

function HTMLTableElement_getCellsBetween(startTD, endTD)
{
	var selectedCells=[];
	var startSectionIndex, endSectionIndex;
	var startTDIndex, endTDIndex;
	var tmp;
	var startRow, startCol, endRow, endCol;
	
	startSectionIndex=this.getCellSectionIndex(startTD);
	endSectionIndex=this.getCellSectionIndex(endTD);
		
	startTDIndex=this.getCellIndex(startTD);
	endTDIndex=this.getCellIndex(endTD);
		
	if(startSectionIndex>endSectionIndex)
	{
		tmp=startSectionIndex;
		startSectionIndex=endSectionIndex;
		endSectionIndex=tmp;
		
		tmp=startTDIndex;
		startTDIndex=endTDIndex;
		endTDIndex=tmp;
	}
	else
	if(startSectionIndex==endSectionIndex && startTDIndex.row>endTDIndex.row)
	{
		tmp=startTDIndex;
		startTDIndex=endTDIndex;
		endTDIndex=tmp;
	}
	console.log("startSectionIndex="+startSectionIndex);
	console.log("endSectionIndex="+endSectionIndex);
	
	console.log("startTDIndex.row="+startTDIndex.row);
	console.log("endTDIndex.row="+endTDIndex.row);
	
	var sections;
	
	sections=this.getSections();
	console.log("sections.length="+sections.length);
	startCol=Math.min(startTDIndex.col, endTDIndex.col);
	endCol=Math.max(startTDIndex.col, endTDIndex.col);
	
	for(var i=0; i<sections.length; i++)
	{
		if(i<startSectionIndex)
		{
			continue;
		}
		
		selectedCells[selectedCells.length]={
				"sectionIndex": i,
				"startCol": startCol,
				"endCol": endCol
			};
		
		if(i==startSectionIndex)
		{
			console.log("i==startSectionIndex: "+i+"=="+startSectionIndex);
			selectedCells[selectedCells.length-1].startRow=startTDIndex.row;
			selectedCells[selectedCells.length-1].endRow=(endSectionIndex-startSectionIndex>0 ? sections[i].rows.length-1 : endTDIndex.row);
		}
		else
		if(i<endSectionIndex)
		{
			console.log("i<endSectionIndex: "+i+"<"+endSectionIndex);
			selectedCells[selectedCells.length-1].startRow=0;
			selectedCells[selectedCells.length-1].endRow=sections[i].rows.length-1;
		}
		else
		{
			console.log("End row");
			selectedCells[selectedCells.length-1].startRow=(endSectionIndex-startSectionIndex==0 ? startTDIndex.row : 0);
			selectedCells[selectedCells.length-1].endRow=endTDIndex.row;
		}
		console.log(selectedCells[selectedCells.length-1]);
		if(i==endSectionIndex)
		{
			break;
		}
	}
	console.log(selectedCells);
	return selectedCells;
	return {"start": {"section": startSection, "index": startIndex}, "end": {"section": endSection, "index": endIndex} };
	
	
}

HTMLTableElement.prototype.getRowSectionIndex=HTMLTableElement_getRowSectionIndex;
HTMLTableElement.prototype.getCellSectionIndex=HTMLTableElement_getCellSectionIndex;

function HTMLTableElement_getRowSectionIndex(tr)
{
	var sections;
	
	sections=this.getSections();
	
	for(var i=0; i<sections.length; i++)
	{
		if(sections[i]==tr.parentNode)
		{
			return i;
		}
	}
}
function HTMLTableElement_getCellSectionIndex(td)
{
	return this.getRowSectionIndex(td.parentNode);
}
HTMLTableElement.prototype.getRowIndex=HTMLTableElement_getRowIndex;
function HTMLTableElement_getRowIndex(tr)
{
	for(var i=0; i<tr.parentNode.rows; i++)
	{
		if(tr.parentNode.rows[i]==tr)
		{
			return i;
		}
	}
}
HTMLTableElement.prototype.getCellIndex=HTMLTableElement_getCellIndex;
function HTMLTableElement_getCellIndex(td)
{
	for(var i=0; i<td.parentNode.cells.length; i++)
	{
		if(td.parentNode.cells[i]==td)
		{
			break;
		}
	}
	
	return {"row": this.getRowIndex(td.parentNode), "col": i};
}

HTMLTableElement.prototype.getSections=HTMLTableElement_getSections;
function HTMLTableElement_getSections()
{
	var sections=[];
	
	for(var childNode=this.firstChild; childNode; childNode=childNode.nextSibling)
	{
		if(!childNode.isElement() || (childNode.tagName!="THEAD" && childNode.tagName!="TBODY" && childNode.tagName!="TFOOT"))
		{
			continue;
		}
		sections[sections.length]=childNode;
	}
	
	return sections;
}
function HTMLTableElement_selectCells(selection)
{
	var startSection, endSection, tds;
	
	
	var sections=this.getSections();
	
	var minRow, maxRow, minCol, maxCol;
	
	if(selection.end.section==selection.start.section)
	{
		minRow=Math.min(selection.end.index.row, selection.start.index.row);
		maxRow=Math.max(selection.end.index.row, selection.start.index.row);
	}
	else
	{
	}
	minCol=Math.min(selection.end.index.col, selection.start.index.col);
	maxCol=Math.max(selection.end.index.col, selection.start.index.col);
	
	
	
	for(var i=0; i<sections.length; i++)
	{
		
		for(var row=0; row<sections[i].rows.length; row++)
		{
			for(var col=0; col<sections[i].rows[row].cells.length; col++)
			{
				if(sections[i]!=selection.start.section)
				{
					sections[i].rows[row].cells[col].removeClassName("selected");
				}
				else
				{
					if(row<minRow || row>maxRow || col < minCol || col>maxCol)
					{
						sections[i].rows[row].cells[col].removeClassName("selected");
					}
					else
					{
						sections[i].rows[row].cells[col].addClassName("selected");
					}
				}
			}
		}
	}
}
function HTMLTableElement_disableContentEditable(node)
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
function HTMLTableElement_getChildElementsByTagName(tagName)
{
	var childElements=[];
	
	tagName=tagName.toUpperCase();
	
	for(var i=0; i<this.childNodes.length; i++)
	{
		if(!this.childNodes[i].isElement() || this.childNodes[i].tagName!=tagName)
		{
			continue;
		}
		childElements[childElements.length]=this.childNodes[i];
	}
	return childElements;
}
function HTMLTableElement_createRow(cols, cellTagName)
{
	var tr, td;
	
	if(!cellTagName)
	{
		cellTagName="TD";
	}
	tr=this.ownerDocument.createElement("TR");
	
	for(var i=0; i<cols; i++)
	{
		td=this.ownerDocument.createElement(cellTagName);
		if(!this.contentEditable)
		{
			td.contentEditable=true;
		}
		tr.appendChild(td);
	}
	
	return tr;
}
function HTMLTableElement_appendRow(cols)
{
	this.firstChild.appendChild(this.createRow(cols));
}

function HTMLTableElement_getSectionRow(section, rowIndex)
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
function HTMLTableElement_getRowIndex(tr)
{
	var index=-1;
	
	for(var childNode=tr.parentNode.firstChild; childNode; childNode=childNode.nextSibling)
	{
		if(!childNode.isElement() || childNode.tagName!="TR")
		{
			continue;
		}
		
		index++;
		if(childNode==tr)
		{
			return index;
		}
	}
	
}
function HTMLTableElement_createSection(sectionTagName)
{
	sectionTagName=sectionTagName.toUpperCase();
	if(sectionTagName=="TFOOT")
	{
		for(var i=this.childNodes.length-1; i>=0; i--)
		{
			if(!this.childNodes[i].isElement() || (this.childNodes[i].tagName!="TBODY" && this.childNodes[i].tagName!="TR"))
			{
				continue;
			}
			break;
		}
		
		return this.insertAfter(this.ownerDocument.createElement("TFOOT"), this.childNodes[i]);
	}
	if(sectionTagName=="THEAD")
	{
		for(var i=0; i<this.childNodes.length; i++)
		{
			if(!this.childNodes[i].isElement() || (this.childNodes[i].tagName!="TBODY" && this.childNodes[i].tagName!="TR"))
			{
				continue;
			}
			break;
		}
		
		return this.insertBefore(this.ownerDocument.createElement("THEAD"), this.childNodes[i]);
	}
}
function HTMLTableElement_insertRows(rows, tr, sectionTagName, beforeRow)
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
			
			if(!tr || !section.contains(tr))
			{
				tr=this.getSectionRow(section, beforeRow?0:-1);
			}
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
function HTMLTableElement_removeRows(rows, tr, beforeRow)
{
	var trParent;
	
	trParent=tr.parentNode;
	
	tr.parentNode.removeChild(tr);
	
	if(trParent.tagName=="THEAD" || trParent.tagName=="TFOOT")
	{
		trParent.parentNode.removeChild(trParent);
	}
}

function HTMLTableElement_insertRowCells(row, cellIndex, numCells, beforeIndex)
{
	for(var i=0; i<numCells; i++)
	{
		row.insertCell(beforeIndex?cellIndex:cellIndex+1);
	}
}
function HTMLTableElement_insertColumns(cols, td, beforeCol)
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
	
	for(var i=0; i<this.childNodes.length; i++)
	{
		if(!this.childNodes[i].isElement())
		{
			continue;
		}
		
		if(this.childNodes[i].tagName=="TR")
		{
			this.insertRowCells(this.childNodes[i], tdIndex, cols, beforeCol);
			continue;
		}
		
		for(var j=0; j<this.childNodes[i].childNodes.length; j++)
		{
			if(!this.childNodes[i].childNodes[j].isElement())
			{
				continue;
			}
			if(this.childNodes[i].childNodes[j].tagName!="TR")
			{
				continue;
			}
			
			this.insertRowCells(this.childNodes[i].childNodes[j], tdIndex, cols, beforeCol);
		}
	}
}
/*
HTMLTableElement.prototype.getCellIndex=HTMLTableElement_getCellIndex;
function HTMLTableElement_getCellIndex(td)
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
}*/
function HTMLTableElement_mergeCellsInBetweenCells(startTD, endTD)
{
	var sections, mergedTD, appendBR, appendSpace;
	
	sections=this.getSections();
	
	for(var l=0; l<this.selectedCells.length; l++)
	{
		for(var i=0; i<this.selectedCells[l].length; i++)
		{
			appendBR=false;
			mergedTD=sections[this.selectedCells[l][i].sectionIndex].rows[this.selectedCells[l][i].startRow].cells[this.selectedCells[l][i].startCol];
			mergedTD.style.backgroundColor="#f7f7f7";
			mergedTD.colSpan=this.selectedCells[l][i].endCol-this.selectedCells[l][i].startCol+1;
			mergedTD.rowSpan=this.selectedCells[l][i].endRow-this.selectedCells[l][i].startRow+1;
			mergedTD.contentEditable=true;

			for(var j=this.selectedCells[l][i].startRow; j<=this.selectedCells[l][i].endRow; j++)
			{
				appendSpace=false;
				for(var k=this.selectedCells[l][i].startCol; k<=this.selectedCells[l][i].endCol; k++)
				{
					if(j==this.selectedCells[l][i].startRow && k==this.selectedCells[l][i].startCol)
					{
						appendSpace=true;
						continue;
					}
					var td=sections[this.selectedCells[l][i].sectionIndex].rows[j].cells[this.selectedCells[l][i].startCol+(j==this.selectedCells[l][i].startRow?1:0)];

					if(td.isEmpty())
					{
						td.parentNode.removeChild(td);
						continue;
					}

					if(appendSpace)
					{
						mergedTD.appendChild(this.ownerDocument.createTextNode(" "));
					}
					else
					if(appendBR)
					{
						mergedTD.appendChild(this.ownerDocument.createElement("br"));
					}
					mergedTD.appendNodeContent(td);
					//td.style.backgroundColor="red";
					//td.parentNode.removeChild(td);
					appendSpace=true;
					//sections[this.selectedCells[0][i].sectionIndex].rows[j].removeChild(sections[this.selectedCells[0][i].sectionIndex].rows[j].cells[this.selectedCells[0][i].endCol+1]);
				}
				appendBR=true;
			}

		}
	}
}
function HTMLTableElement_setCaption(caption)
{
	for(var i=0; i<this.childNodes.length; i++)
	{
		if(this.childNodes[i].isElement() && this.childNodes[i].tagName=="CAPTION")
		{
			if(!caption)
			{
				this.removeChild(this.childNodes[i]);
				return;
			}
			if(!this.childNodes[i].firstChild || !this.childNodes[i].firstChild.isText())
			{
				this.childNodes[i].prependChild(this.ownerDocument.createTextNode(caption));
			}
			if(this.childNodes[i].isEmpty())
			{
				this.removeChild(this.childNodes[i]);
			}
			return;
		}
	}

	if(!caption)
	{
		return;
	}
	
	this.prependChild(this.ownerDocument.createElement("caption"));
	this.firstChild.appendChild(this.ownerDocument.createTextNode(caption))
}
function HTMLTableElement_getRowNumCells(tr)
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
	
	table=new HTMLTableElement(this.documentContainer.ownerDocument, null, rows, cols);
	var range=this.getRange();
	
	range.startContainer.parentNode.insertBefore(table.element, range.startContainer);
}
function EditableContent_getTable()
{
	var table;
	
	table=this.getRangeCommonAncestorByTagName('TABLE');
	table.init();
	return table;
	if(table)
	{
		return new HTMLTableElement(this.documentContainer.ownerDocument, table);
	}
	
}
function EditableContent_getRangeCommonAncestorByTagName(tagName)
{
	var ranges, startRange, endRange, commonAncestor;
	
	tagName=tagName.toUpperCase();
	ranges=this.contentSelection.getRanges();
	//startRange=this.getRangeBoundary(range, true);
	//endRange=this.getRangeBoundary(range, false);
	commonAncestor=ranges[0].startContainer.getCommonAncestor(ranges[ranges.length-1].endContainer);
	
	while(commonAncestor)
	{
		if(commonAncestor.isElement() && commonAncestor.tagName==tagName)
		{
			break;
		}
		commonAncestor=commonAncestor.parentNode;
	}
	
	
	return commonAncestor;
}