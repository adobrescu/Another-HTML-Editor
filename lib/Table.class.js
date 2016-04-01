

HTMLTableElement.prototype.init=function(contentEditable)
{	
	if(this.initialised)
	{
		return;
	}
	
	this.initialised=true;
	this.contentEditable=contentEditable?true:false;
	this.selectedCells=[];
	this.currentBorders=[];
	if(navigator.userAgent.indexOf("Firefox")!=-1)
	{
		this.contentEditable=false;
		this.visitDescendants([this, "disableContentEditable"]);//, ca/*callbackArguments*/, beforeAndAfterChildNodes, visitThis, depth)
	}
	
	this.refOnMouseDown=new Function("evt",  "HTMLTableElement.prototype.___instances["+HTMLTableElement.prototype.___instances.length+"].onMouseDown(evt)");
	this.refOnMouseMove=new Function("evt",  "HTMLTableElement.prototype.___instances["+HTMLTableElement.prototype.___instances.length+"].onMouseMove(evt)");
	this.refOnMouseUp=new Function("evt",  "HTMLTableElement.prototype.___instances["+HTMLTableElement.prototype.___instances.length+"].onMouseUp(evt)");
	this.refOnClick=new Function("evt",  "HTMLTableElement.prototype.___instances["+HTMLTableElement.prototype.___instances.length+"].onClick(evt)");
	
	this.addEventListener("mousedown", this.refOnMouseDown);
	this.addEventListener("mousemove", this.refOnMouseMove);
	this.ownerDocument.addEventListener("mouseup", this.refOnMouseUp);
	this.ownerDocument.addEventListener("click", this.refOnClick);
	
	HTMLTableElement.prototype.___instances[HTMLTableElement.prototype.___instances.length]=this;
}
with(HTMLTableElement)
{
	prototype.___instances=[];
	prototype.___borders=[];
	prototype.___onInitDocument=HTMLTableElement____onInitDocument;
	prototype.onMouseDown=HTMLTableElement_onMouseDown;
	prototype.onMouseMove=HTMLTableElement_onMouseMove;
	prototype.onMouseUp=HTMLTableElement_onMouseUp;
	prototype.onClick=HTMLTableElement_onClick;
	
	prototype.disableContentEditable=HTMLTableElement_disableContentEditable;
	prototype.getChildElementsByTagName=HTMLTableElement_getChildElementsByTagName;
	prototype.createRow=HTMLTableElement_createRow;
	prototype.appendRow=HTMLTableElement_appendRow;
	prototype.getSectionRow=HTMLTableElement_getSectionRow;
	
	prototype.createSection=HTMLTableElement_createSection;
	prototype.insertRows=HTMLTableElement_insertRows;
	prototype.removeRows=HTMLTableElement_removeRows;
	prototype.insertRowCells=HTMLTableElement_insertRowCells;
	prototype.insertColumns=HTMLTableElement_insertColumns;
	prototype.mergeSelectedCells=HTMLTableElement_mergeSelectedCells;
	prototype.splitSelectedCells=HTMLTableElement_splitSelectedCells;
	prototype.setCaption=HTMLTableElement_setCaption;
	prototype.getRowNumCells=HTMLTableElement_getRowNumCells;
}
function HTMLTableElement____onInitDocument(documentContainer)
{
	var tables;
	
	tables=documentContainer.getElementsByTagName("table");
	
	for(var i=0; i<tables.length; i++)
	{
		tables[i].init();
	}
}
function HTMLTableElement_onMouseDown(evt)
{
	if(!evt.altKey)
	{
		return;
	}
	
	this.ownerDocument.defaultView.getSelection().removeAllRanges();
	evt.preventDefault(); 
	this.selectedCells=[];
	for(var i=0; i<HTMLTableElement.prototype.___borders.length; i++)
	{
		HTMLTableElement.prototype.___borders[i].remove();
	}
	var td;
	
	if(!(td=evt.target.getAncestorByTagName("TD")))
	{
		if(!(td=evt.target.getAncestorByTagName("TH")))
		{
			td=this.getCellFromPoint(evt.clientX, evt.clientY);
		}
	}
	
	if(!td)
	{
		return;
	}
	
	//if(!this.anchorSelectedCell)
	{
		this.anchorSelectedCell=td;
		this.anchorBorder=this.focusBorder=HTMLTableElement.prototype.___borders[HTMLTableElement.prototype.___borders.length]=new Border(this.ownerDocument);
		this.currentBorders=[this.anchorBorder];
		this.anchorBorder.surroundElements(this.anchorSelectedCell, this.anchorSelectedCell);
		this.anchorBorder.show();
		this.focusSelectedCellsIndex=this.anchorSelectedCellsIndex=this.selectedCells.length;
	}
	
}
HTMLTableElement.prototype.getCellFromPoint=HTMLTableElement_getCellFromPoint;
function HTMLTableElement_getCellFromPoint(x, y)
{
	var sections, br;
	
	sections=this.getSections();
	
	for(var i=0; i<sections.length; i++)
	{
		for(var j=0; j<sections[i].rows.length; j++)
		{
			for(var k=0; k<sections[i].rows[j].cells.length; k++)
			{
				br=sections[i].rows[j].cells[k].getBoundingClientRect();
				
				if(br.left<=x && x<=br.right && br.top<=y && y<=br.bottom)
				{
					return sections[i].rows[j].cells[k];
				}
			}
		}
	}
}
HTMLTableElement.prototype.buildCellsSelection=HTMLTableElement_buildCellsSelection;
function HTMLTableElement_buildCellsSelection(td1, td2)
{
	var minRow, maxRow, minCol, maxCol;
	this.getLogicalMatrix();
	//this.anchorSelectedCell, td
	if(td1.logicalRowIndex>td2.logicalRowIndex)
	{
		minRow=td2.logicalRowIndex;
		maxRow=td1.logicalRowIndex+(td1.rowSpan-1);
	}
	else
	{
		minRow=td1.logicalRowIndex;
		maxRow=td2.logicalRowIndex+(td2.rowSpan-1);
	}
	
	
	
	
	if(td1.logicalCellIndex>td2.logicalCellIndex)
	{
		minCol=td2.logicalCellIndex;
		maxCol=td1.logicalCellIndex+(td1.colSpan-1);
	}
	else
	{
		minCol=td1.logicalCellIndex;
		maxCol=td2.logicalCellIndex+(td2.colSpan-1);
	}
	
	minRow=Math.min(td1.logicalRowIndex, td2.logicalRowIndex);
	minCol=Math.min(td1.logicalCellIndex, td2.logicalCellIndex);
	
	maxRow=Math.max(td1.logicalRowIndex+td1.rowSpan-1, td2.logicalRowIndex+td2.rowSpan-1);
	maxCol=Math.max(td1.logicalCellIndex+td1.colSpan-1, td2.logicalCellIndex+td2.colSpan-1);
	
	this.selectedCells=this.getCellsBetween(minRow, minCol, maxRow, maxCol);
	
	this.highlightCellsSelection();
}
function HTMLTableElement_onMouseMove(evt)
{
	if(!this.anchorSelectedCell)
	{
		return;
	}
	var td;
	
	
	if(!(td=evt.target.getAncestorByTagName("TD")))
	{
		if(!(td=evt.target.getAncestorByTagName("TH")))
		{
			td=this.getCellFromPoint(evt.clientX, evt.clientY);
		}
	}
	if(!td)
	{
		return;
	}
	
	this.buildCellsSelection(this.anchorSelectedCell, td);
	
	
	
	
	
}
HTMLTableElement.prototype.highlightCellsSelection=HTMLTableElement_highlightCellsSelection;
function HTMLTableElement_highlightCellsSelection()
{
	for(var i=0; i<this.selectedCells.sections.length; i++)
	{
		
		if(i>=this.currentBorders.length)
		{
			this.currentBorders[i]=HTMLTableElement.prototype.___borders[HTMLTableElement.prototype.___borders.length]=new Border(this.ownerDocument);
		}
			
		this.currentBorders[i].surroundElements(
									this.selectedCells.sections[i][2], 
									this.selectedCells.sections[i][3]);
		this.currentBorders[i].show();
		
	}
	
	for(var j=i; j<this.currentBorders.length; j++)
	{
		this.currentBorders[j].remove();
	}
}
HTMLTableElement.prototype.getCellsBetween=HTMLTableElement_getCellsBetween;

function HTMLTableElement_getCellsBetween(minRow, minCol, maxRow, maxCol)
{	
	var sections;
	
	sections=this.getSections();
	//return;
	var cell, cellIndex, logicalRowIndex;
	var extend=false;
	var selectedCells=[], selectedSections=[];
	var rowCellFound, rowIndex;
	var section;
	var min1, min2, max1, max2
	
	rowIndex=-1;
	
	for(var i=0; i<sections.length; i++)
	{
		section=null;
	
		
		for(var j=0; j<sections[i].rows.length; j++)
		{
			rowCellFound=false;
			for(var k=0; k<sections[i].rows[j].cells.length; k++)
			{
				
				cell=sections[i].rows[j].cells[k];
				//cell.style.backgroundColor="transparent";
				
				min1=Math.min(cell.logicalCellIndex, minCol);
				max1=Math.max(cell.logicalCellIndex+cell.colSpan-1, maxCol);
				
				min2=Math.min(cell.logicalRowIndex, minRow);
				max2=Math.max(cell.logicalRowIndex+cell.rowSpan-1, maxRow);
				
				if(max1-min1<(maxCol-minCol)+cell.colSpan
					&&
					max2-min2<(maxRow-minRow)+cell.rowSpan)
				
				/*
				if( ( (cell.logicalCellIndex>=minCol && cell.logicalCellIndex<=maxCol)  || (cell.logicalCellIndex+cell.colSpan-1>=minCol && cell.logicalCellIndex+cell.colSpan-1<=maxCol) ) 
					&&
					( (cell.logicalRowIndex>=minRow && cell.logicalRowIndex<=maxRow) || (cell.logicalRowIndex+cell.rowSpan-1>=minRow && cell.logicalRowIndex+cell.rowSpan-1<=maxRow ) )
					)
				*/
				{
					
					if(cell.logicalRowIndex<minRow)
					{
						minRow=cell.logicalRowIndex;
						extend=true;
					}
					
					if(cell.logicalRowIndex+cell.rowSpan-1>maxRow)
					{
						maxRow=cell.logicalRowIndex+cell.rowSpan-1;
						extend=true;
					}
					if(cell.logicalCellIndex+cell.colSpan-1>maxCol)
					{
						maxCol=cell.logicalCellIndex+cell.colSpan-1;
						extend=true;
					}
					if(cell.logicalCellIndex<minCol)
					{
						minCol=cell.logicalCellIndex;
						extend=true;
					}
					if(extend)
					{
						return this.getCellsBetween(minRow, minCol, maxRow, maxCol);
					}
					
					
					
					if(!rowCellFound)
					{
						rowIndex++;
						rowCellFound=true;
					}
					
					selectedCells[selectedCells.length]=cell;
					
					if(section===null)
					{
						section=selectedSections[selectedSections.length]=[];
						section[0]=selectedCells.length-1;
					}
					section[1]=selectedCells.length-1;
				}
			}
			
			if(section===null)
			{
				continue;
			}
			
			section[2]=section[3]=selectedCells[section[0]];
			//section[2].style.backgroundColor="green";
			var maxRight=section[2].logicalCellIndex+section[2].colSpan;
			
			for(var l=section[0]; l<=section[1]; l++)
			{
				if(selectedCells[l].logicalCellIndex+selectedCells[l].colSpan>=maxRight)
				{
					section[3]=selectedCells[l];
					maxRight=selectedCells[l].logicalCellIndex+selectedCells[l].colSpan;
				}
			}
			//section[3].style.backgroundColor="blue";
		}
		
		//if(sectionIndex!==null)
		{
			
		}
	}
	
	return {"cells": selectedCells, "sections": selectedSections};	
}
function HTMLTableElement_onMouseUp(evt)
{
	this.anchorSelectedCell=null;
	
	for(var i=0; i<this.currentBorders.length; i++)
	{
		this.currentBorders[i].isSolid(true);
	}
}
function HTMLTableElement_onClick(evt)
{
	this.anchorSelectedCell=null;
	for(var i=0; i<HTMLTableElement.prototype.___borders.length; i++)
	{
		HTMLTableElement.prototype.___borders[i].remove();
	}
}

HTMLTableElement.prototype.getLogicalMatrix=HTMLTableElement_getLogicalMatrix;

function HTMLTableElement_getLogicalMatrix(tr)
{
	var cell, sections, logicalRowIndex=0;
	//var matrix=[];
	
	
	this.logicalMatrix=[];
	sections=this.getSections();
	
	for(var i=0; i<sections.length; i++)
	{
		for(var j=0; j<sections[i].rows.length; j++)
		{
			if(typeof(this.logicalMatrix[logicalRowIndex])=="undefined")
			{
				this.logicalMatrix[logicalRowIndex]=[];
			}

			for(var k=0; k<sections[i].rows[j].cells.length; k++)
			{
				cell=sections[i].rows[j].cells[k];
				cell.logicalRowIndex=logicalRowIndex;
								
				var l=0;
				for(l=0; l<this.logicalMatrix[logicalRowIndex].length; l++)
				{
					if(typeof(this.logicalMatrix[logicalRowIndex][l])=="undefined")
					{
						break;
					}
				}
				
				for(var m=logicalRowIndex; m<logicalRowIndex+cell.rowSpan; m++)
				{
					if(typeof(this.logicalMatrix[m])=="undefined")
					{
						this.logicalMatrix[m]=[];
					}
					for(var n=l; n<l+cell.colSpan; n++)
					{
						this.logicalMatrix[m][n]={"cell": cell, "sectionIndex": i};
					}
				}
				cell.logicalCellIndex=l;
				//cell.innerHTML=cell.logicalRowIndex+", "+cell.logicalCellIndex;
				
			}
			logicalRowIndex++;
		}
	}
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
HTMLTableElement.prototype.insertColumn=HTMLTableElement_insertColumn;
function HTMLTableElement_insertColumn(logicalCellIndex)
{
	var td;
	this.getLogicalMatrix();
	for(var i=0; i<this.logicalMatrix.length; i++)
	{
		//for(var j=0; j<this.logicalMatrix[i].length; j++)
		{
			td=this.ownerDocument.createElement("TD");
			td.contentEditable=true;
			td.innerHTML=i+", "+logicalCellIndex;
			
			//this.logicalMatrix[i][logicalCellIndex].cell.style.border="1px red solid";
			
			if(logicalCellIndex>0 && logicalCellIndex<this.logicalMatrix[i].length && this.logicalMatrix[i][logicalCellIndex-1].cell==this.logicalMatrix[i][logicalCellIndex].cell)
			{
				this.logicalMatrix[i][logicalCellIndex].cell.colSpan++;
				this.logicalMatrix[i][logicalCellIndex].cell.style.border="1px green solid";
				
				for(var j=0; j<this.logicalMatrix[i][logicalCellIndex].cell.rowSpan-1; j++)
				{
					i++;
				}
				console.log("skip to: "+i);
			}
			else
			{
				/**
				 * find first next TD in the logical row that starts in the row (its not started in a previous row and has a rowSpan>1
				 */
				var j, b=false;
				if(i==0)
				{
					j=logicalCellIndex;
					b=true;
				}
				else
				{
					for(j=logicalCellIndex; 
						j<this.logicalMatrix[i].length;
						j++)
					{
						if(this.logicalMatrix[i][j].cell!=this.logicalMatrix[i-1][j].cell)
						{
							break;
						}
					}
				}
				var t;
				console.log("i, j="+i+", "+j);
				if(j<this.logicalMatrix[i].length)
				{
					t=this.logicalMatrix[i][j].cell.parentNode.insertBefore(td, this.logicalMatrix[i][j].cell);
					
				}
				else
				{
					t=this.logicalMatrix[i][this.logicalMatrix[i].length-1].cell.parentNode.appendChild(td);
				}
				t.style.border="1px green solid";
			}
			
		}
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

function HTMLTableElement_mergeSelectedCells(startTD, endTD)
{
	var sectionFirstCell, sectionLastCell;
	
	this.anchorSelectedCell=null;
	
	for(var i=0; i<this.selectedCells.sections.length; i++)
	{
		sectionFirstCell=this.selectedCells.sections[i][2];
		
		if(!this.anchorSelectedCell)
		{
			this.anchorSelectedCell=sectionFirstCell;
		}
		
		sectionLastCell=this.selectedCells.sections[i][3];
		
		sectionLastCell.style.backgroundColor=sectionFirstCell.style.backgroundColor="red";
		
			
		sectionFirstCell.colSpan=sectionLastCell.logicalCellIndex-sectionFirstCell.logicalCellIndex+sectionLastCell.colSpan;
		sectionFirstCell.rowSpan=sectionLastCell.logicalRowIndex-sectionFirstCell.logicalRowIndex+sectionLastCell.rowSpan;
		
		for(var j=this.selectedCells.sections[i][0]+1; j<=this.selectedCells.sections[i][1]; j++)
		{
			this.selectedCells.cells[j].parentNode.removeChild(this.selectedCells.cells[j]);
		}
		
		
	}
	this.buildCellsSelection(this.anchorSelectedCell, sectionLastCell);
	this.anchorSelectedCell=null;
}
HTMLTableElement.prototype.splitCell=HTMLTableElement_splitCell;
function HTMLTableElement_splitCell(td)
{
	var newTd;
	var cells=[];
	
	//td.style.backgroundColor="red";
	
	for(var i=td.parentNode.sectionRowIndex; i<td.parentNode.sectionRowIndex+td.rowSpan; i++)
	{
		for(var j=0; j<td.colSpan; j++)
		{
			if(i==td.parentNode.sectionRowIndex && j==0)
			{
				cells[0]=td;
				continue;
			}
			//newTd=this.ownerDocument.createElement("TD");
			newTd=td.parentNode.parentNode.rows[i].insertCell(td.cellIndex+j);
			//newTd.innerHTML=i+", "+(td.cellIndex+"+"+j);
			cells[cells.length]=newTd;
			cells[cells.length-1].contentEditable=true;
		}
	}
	td.colSpan=1;
	td.rowSpan=1;
	return cells;
}
function HTMLTableElement_splitSelectedCells()
{
	var cells;
	
	this.anchorSelectedCell=null;
	
	for(var i=0; i<this.selectedCells.cells.length; i++)
	{
		cells=this.splitCell(this.selectedCells.cells[i]);
		if(!this.anchorSelectedCell)
		{
			this.anchorSelectedCell=cells[0];
		}
	}
	
	this.buildCellsSelection(this.anchorSelectedCell, cells[cells.length-1]);
	this.anchorSelectedCell=null;
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