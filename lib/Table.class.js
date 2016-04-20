

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
	//this.refOnClick=new Function("evt",  "HTMLTableElement.prototype.___instances["+HTMLTableElement.prototype.___instances.length+"].onClick(evt)");
	
	this.addEventListener("mousedown", this.refOnMouseDown);
	this.addEventListener("mousemove", this.refOnMouseMove);
	this.ownerDocument.addEventListener("mouseup", this.refOnMouseUp);
	//this.ownerDocument.addEventListener("click", this.refOnClick);
	
	HTMLTableElement.prototype.___instances[HTMLTableElement.prototype.___instances.length]=this;
}
with(HTMLTableElement)
{
	prototype.___instances=[];
	prototype.___borders=[];
	prototype.___onInitDocument=HTMLTableElement____onInitDocument;
	prototype.onMouseDown=HTMLTableElement_onMouseDown;
	prototype.getCellFromPoint=HTMLTableElement_getCellFromPoint;
	prototype.buildCellsSelection=HTMLTableElement_buildCellsSelection;
	prototype.onMouseMove=HTMLTableElement_onMouseMove;
	prototype.getCellsBetween=HTMLTableElement_getCellsBetween;
	prototype.onMouseUp=HTMLTableElement_onMouseUp;
	prototype.clearSelection=HTMLTableElement_clearSelection;
	prototype.getLogicalMatrix=HTMLTableElement_getLogicalMatrix;
	prototype.getSections=HTMLTableElement_getSections;
	
	prototype.disableContentEditable=HTMLTableElement_disableContentEditable;
	prototype.getChildElementsByTagName=HTMLTableElement_getChildElementsByTagName;
	prototype.createRow=HTMLTableElement_createRow;
	prototype.appendRow=HTMLTableElement_appendRow;
	prototype.getSectionRow=HTMLTableElement_getSectionRow;
	
	prototype.createSection=HTMLTableElement_createSection;
	prototype.insertRows=HTMLTableElement_insertRows;
	prototype.removeRows=HTMLTableElement_removeRows;
	prototype.insertRowCells=HTMLTableElement_insertRowCells;
	prototype.insertRow=HTMLTableElement_insertRow;
	prototype.insertColumn=HTMLTableElement_insertColumn;
	prototype.insertColumns=HTMLTableElement_insertColumns;
	prototype.mergeSelectedCells=HTMLTableElement_mergeSelectedCells;
	prototype.splitCell=HTMLTableElement_splitCell;
	prototype.splitSelectedCells=HTMLTableElement_splitSelectedCells;
	prototype.setCaption=HTMLTableElement_setCaption;
	prototype.getRowNumCells=HTMLTableElement_getRowNumCells;
	prototype.normalizeSpans=HTMLTableElement_normalizeSpans;
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
	
	//this.ownerDocument.defaultView.contentSelection.lock(false);
	//this.ownerDocument.defaultView.getSelection().removeAllRanges();
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
	
	
	this.anchorSelectedCell=this.focusSelectedCell=td;
	this.buildCellsSelection(this.anchorSelectedCell, this.anchorSelectedCell);
	console.log("x", this.ownerDocument.defaultView.contentSelection.locked);
	
}

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

function HTMLTableElement_buildCellsSelection(td1, td2)
{
	var minRow, maxRow, minCol, maxCol;
	this.ownerDocument.defaultView.contentSelection.lock(false);
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
	
	
	this.ownerDocument.defaultView.contentSelection.removeAllRanges();
	this.ownerDocument.defaultView.contentSelection.isCustom=true;
	
	for(var i=0; i<this.selectedCells.cells.length; i++)
	{
		this.ownerDocument.defaultView.contentSelection.addRange(
				{ "startContainer": this.selectedCells.cells[i], 
				"startOffset": 0, 
				"endContainer": this.selectedCells.cells[i], 
				"endOffset": this.selectedCells.cells[i].childNodes.length,
				"isCustom": true } , true, true);
	}
			
	this.ownerDocument.defaultView.contentSelection.removeBorders();
	
	for(var i=0; i<this.selectedCells.sections.length; i++)
	{
		this.ownerDocument.defaultView.contentSelection.addBorder(this.selectedCells.sections[i][2], this.selectedCells.sections[i][3], true);	
	}
	this.ownerDocument.defaultView.contentSelection.lock(true);
	this.ownerDocument.defaultView.contentSelection.onSelectionChange(null, true);
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
	
	if(this.focusSelectedCell===td)
	{
		return;
	}
	
	this.focusSelectedCell=td;
	this.buildCellsSelection(this.anchorSelectedCell, td);
}



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
	
	if(!this.selectedCells.cells)
	{
		return;
	}
	this.ownerDocument.defaultView.contentSelection.isSolid(true);
}

function HTMLTableElement_clearSelection()
{
	
	this.selectedCells=[];
	this.ownerDocument.defaultView.contentSelection.removeAllRanges();
}




function HTMLTableElement_getLogicalMatrix(tr)
{
	var cell, sections, logicalRowIndex=0;
	//var matrix=[];
	var i, j, k, l, m, n;
	var numLogicalCols, numLogicalRows;
	var rowColSpan; //sum of row's cells colspan (its length)
	var rowMaxRowSpan; //maxRow of a row
	
	
	sections=this.getSections();
	
	numLogicalCols=numLogicalRows=0;
	logicalRowIndex=0;
	for(i=0; i<sections.length; i++)
	{
		for(j=0; j<sections[i].rows.length; j++)
		{
			rowMaxRowSpan=1;
			rowColSpan=0;
			
			for(k=0; k<sections[i].rows[j].cells.length; k++)
			{
				if(rowMaxRowSpan<sections[i].rows[j].cells[k].rowSpan)
				{
					rowMaxRowSpan=sections[i].rows[j].cells[k].rowSpan;
				}
				rowColSpan+=sections[i].rows[j].cells[k].colSpan;
			}
			
			if(numLogicalRows<logicalRowIndex+rowMaxRowSpan)
			{
				numLogicalRows=logicalRowIndex+rowMaxRowSpan;
			}
			if(numLogicalCols<rowColSpan)
			{
				numLogicalCols=rowColSpan;
			}
			logicalRowIndex++;
		}		
	}
	this.logicalMatrix=new Array(numLogicalRows);
	for(i=0; i<numLogicalRows; i++)
	{
		this.logicalMatrix[i]={"cells": new Array(numLogicalCols), "logicalRow": null};
	}
	
	
	logicalRowIndex=0;
	for(i=0; i<sections.length; i++)
	{
		for(j=0; j<sections[i].rows.length; j++)
		{
			//if(typeof(this.logicalMatrix[logicalRowIndex])=="undefined")
			//{
			//	this.logicalMatrix[logicalRowIndex]={"cells": [], "logicalRow": sections[i].rows[j]};
			//}
			this.logicalMatrix[logicalRowIndex].logicalRow=sections[i].rows[j];
			sections[i].rows[j].logicalRowIndex=logicalRowIndex;
			for(k=0; k<sections[i].rows[j].cells.length; k++)
			{
				cell=sections[i].rows[j].cells[k];
				//cell.innerHTML="";
				cell.logicalRowIndex=logicalRowIndex;
								
				l=0;
				for(l=0; l<this.logicalMatrix[logicalRowIndex].cells.length; l++)
				{
					if(typeof(this.logicalMatrix[logicalRowIndex].cells[l])=="undefined")
					{
						break;
					}
				}
				
				for(m=logicalRowIndex; m<logicalRowIndex+cell.rowSpan; m++)
				{
					//if(typeof(this.logicalMatrix[m])=="undefined")
					{
						this.logicalMatrix[m].logicalRow=sections[i].rows[j+m-logicalRowIndex];//{"cells": [], "logicalRow": sections[i].rows[j+m-logicalRowIndex]};
					}
					for(n=l; n<l+cell.colSpan; n++)
					{
						this.logicalMatrix[m].cells[n]=cell;//{"cell": cell, "sectionIndex": i};
						//cell.innerHTML+=m+"x"+n+" | ";
					}
				}
				cell.logicalCellIndex=l;
				//cell.innerHTML=cell.logicalRowIndex+", "+cell.logicalCellIndex;
				
			}
			logicalRowIndex++;
		}
	}
}



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

function HTMLTableElement_insertRow(logicalRowIndex)
{
	var tr, td, sections;
	
	this.getLogicalMatrix();
	
	tr=this.ownerDocument.createElement("TR");
	
	if(logicalRowIndex<this.logicalMatrix.length)
	{
		this.logicalMatrix[logicalRowIndex].cells[0].parentNode.parentNode.insertBefore(tr, this.logicalMatrix[logicalRowIndex].cells[0].parentNode);
	}
	else
	{
		sections=this.getSections();
		sections[sections.length-1].appendChild(tr);
		logicalRowIndex--;
	}
	
	for(var i=0; i<this.logicalMatrix[logicalRowIndex].cells.length; i++)
	{
		if(logicalRowIndex>0 && this.logicalMatrix[logicalRowIndex].cells[i]==this.logicalMatrix[logicalRowIndex-1].cells[i])
		{
			this.logicalMatrix[logicalRowIndex].cells[i].rowSpan++;
			this.logicalMatrix[logicalRowIndex].cells[i].style.backgrondColor="red";
			
			for(var j=0; j<this.logicalMatrix[logicalRowIndex].cells[i].colSpan-1; j++)
			{
				i++;
			}
		}
		else
		{
			td=this.ownerDocument.createElement(this.logicalMatrix[logicalRowIndex].cells[i].tagName);
			td.appendChild(this.ownerDocument.createTextNode("\u00A0"));
			td.style.backgroundColor="green";
			td.contentEditable=true;
			tr.appendChild(td);
			//td.innerHTML=i+"/ "+tr.cells.length;
		}
	}
	//this.getLogicalMatrix();
}

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
			//td.innerHTML=i+", "+logicalCellIndex;
			
			//this.logicalMatrix[i][logicalCellIndex].cell.style.border="1px red solid";
			
			if(logicalCellIndex>0 && logicalCellIndex<this.logicalMatrix[i].cells.length && this.logicalMatrix[i].cells[logicalCellIndex-1]==this.logicalMatrix[i].cells[logicalCellIndex])
			{
				this.logicalMatrix[i].cells[logicalCellIndex].colSpan++;
				this.logicalMatrix[i].cells[logicalCellIndex].style.border="1px green solid";
				
				for(var j=0; j<this.logicalMatrix[i].cells[logicalCellIndex].rowSpan-1; j++)
				{
					i++;
				}
				
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
						j<this.logicalMatrix[i].cells.length;
						j++)
					{
						if(this.logicalMatrix[i].cells[j]!=this.logicalMatrix[i-1].cells[j])
						{
							break;
						}
					}
				}
				var t;
				
				if(j<this.logicalMatrix[i].cells.length)
				{
					t=this.logicalMatrix[i].cells[j].parentNode.insertBefore(td, this.logicalMatrix[i].cells[j]);
					
				}
				else
				{
					t=this.logicalMatrix[i].cells[this.logicalMatrix[i].cells.length-1].parentNode.appendChild(td);
				}
			//	t.style.border="1px green solid";
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
			
		sectionFirstCell.colSpan=sectionLastCell.logicalCellIndex-sectionFirstCell.logicalCellIndex+sectionLastCell.colSpan;
		sectionFirstCell.rowSpan=sectionLastCell.logicalRowIndex-sectionFirstCell.logicalRowIndex+sectionLastCell.rowSpan;
		
		if(sectionFirstCell.rowSpan==1)
		{
			sectionFirstCell.removeAttribute("rowSpan");
		}
		
		for(var j=this.selectedCells.sections[i][0]+1; j<=this.selectedCells.sections[i][1]; j++)
		{
			if(sectionFirstCell.logicalRowIndex<this.selectedCells.cells[j].logicalRowIndex)
			{
				sectionFirstCell.appendChild(this.ownerDocument.createElement("BR"));
			}
			else
			{
				sectionFirstCell.appendChild(this.ownerDocument.createTextNode("\u00A0"));
			}
			
			sectionFirstCell.appendNodeContent(this.selectedCells.cells[j]);//also removes this.selectedCells.cells[j]
		}

	}
	this.buildCellsSelection(this.anchorSelectedCell, sectionLastCell);
	this.anchorSelectedCell=null;
		
	this.normalizeSpans();
	
}


function HTMLTableElement_splitCell(td)
{
	var newTd, cellIndex;
	var i, j;
	
	//td.style.backgroundColor="red";
	
	for(i=td.logicalRowIndex; i<td.logicalRowIndex+td.rowSpan; i++)
	{
		
		if(i==td.logicalRowIndex)
		{
			cellIndex=td.cellIndex;
		}
		else
		{
			cellIndex=-1;
			for(j=0; j<td.logicalCellIndex; j++)
			{
				if(this.logicalMatrix[i].cells[j].parentNode==this.logicalMatrix[i].logicalRow)
				{
					cellIndex=this.logicalMatrix[i].cells[j].cellIndex;
				}
			}
		}
		for(var j=0; j<td.colSpan; j++)
		{
			if(i==td.logicalRowIndex && j==0)
			{
				continue;
			}
			newTd=this.ownerDocument.createElement(td.tagName);			
			newTd=this.logicalMatrix[i].logicalRow.insertCell(cellIndex+1);
			newTd.contentEditable=true;
			//newTd.innerHTML="Axxa";
		}
	}
	td.colSpan=1;
	td.rowSpan=1;
	
}
function HTMLTableElement_splitSelectedCells()
{
	//coordonatele logice ale capetelor (stanga sus si dreapta jos) selectiei inainte de split
	//sint folosite dupa split a determina noua selectie pentru ca TD-urile initiale pot fi sparte 
	//(de fapt e vorba doar de cel din dreapta jos pentru ca cel din stanga sus ramane acelasi)
	var startTD, endTD, endLogicalRowIndex, endLogicalCellIndex;
		
	startTD=this.selectedCells.sections[0][2];
	
	endTD=this.selectedCells.sections[this.selectedCells.sections.length-1][3];
	endLogicalRowIndex=endTD.logicalRowIndex+endTD.rowSpan-1;
	endLogicalCellIndex=endTD.logicalCellIndex+endTD.colSpan-1;
	
	for(var i=0; i<this.selectedCells.cells.length; i++)
	{
		this.splitCell(this.selectedCells.cells[i]);
	}
		
	this.getLogicalMatrix();
	
	this.buildCellsSelection(startTD, this.logicalMatrix[endLogicalRowIndex].cells[endLogicalCellIndex]);
	
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
/**
 * 
 * HTMLTableElement.normalizeSpans
 * 
 * "Normalize" a table:
 * 
 * - decrease colspan/rowspan where needed
 * - removes empty TRs
 * - adds empty cells where needed
 * 
 * Una din operatii este detectarea casetelor suprapuse cu colSpan>1 are formeaza o stiva incepand din susul tabelei ( de la linia logica 0)
 * si pana jos la ultima linie. Daca aceste casetete au (tot de sus pana jos) suprapuse mai mult de 2 casete logice (sau spatii goale) atunci pentru fiecare dintre ele 
 * se decrementeaza corespunzator colSpan cu numarul de casete logice suprapuse.
 * 
 * Ex:
 *			-------------
 *			|	| x	| x	|		colSpan=3 
 *			-----------------
 *				| x	| x	|	|	colSpan=3
 *			-----------------
 *			|	| x	| x	|		colSpan=3
 *			-------------
 * Ajunge:
 *			---------
 *			|	| x	|			colSpan=2
 *			-----------------
 *				| x	|	|		colSpan=2
 *			-----------------
 *			|	| x	|			colSpan=2
 *			-------------
 * 
 * Operatiunea se face numai daca style.tableLayout este diferit de "fixed". Pentru "fixed" latimea casetelor este determinata numarul de casete logice (colSpan)
 * si modificarea lui colSpan duce la alterarea vizuala a casetei. Deci, pentru "fixed"tot ce se face este ca in locurile goale din matricea logica sa se adauge o caseta noua. 
 * 
 * Aceeasi operatiune, dar pe coloane si fara sa tina cont de tableLayout, se face si pentru coloane.
 * 
 * 
 */
function HTMLTableElement_normalizeSpans()
{	
	var hasFixedLayout;
	
	hasFixedLayout=(this.getComputedStyle().tableLayout=="fixed");
	
	this.getLogicalMatrix();
	/*
	console.log("hasFixedLayout="+hasFixedLayout);
	
	for(var i=0; i<this.logicalMatrix.length; i++)
	{
		console.log("Row ", i, this.logicalMatrix[i].logicalRow);
		for(var j=0; j<this.logicalMatrix[i].cells.length; j++)
		{
			console.log("Cell ", j, ": ", this.logicalMatrix[i].cells[j]);
		}
		console.log("----------------------------------------");
	}
	*/
	//1. Remove empty rows
	var intMin, intMax;
	var collapseRow;
	var newTd;
	
	for(var i=0; i<this.logicalMatrix.length-1; i++)
	{
		if(!(collapseRow=(!this.logicalMatrix[i].logicalRow || this.logicalMatrix[i].logicalRow.cells.length==0)))
		{
			
			collapseRow=true;
			for(var j=0; j<this.logicalMatrix[i].cells.length; j++)
			{
				if(this.logicalMatrix[i].cells[j]!==this.logicalMatrix[i+1].cells[j] || this.logicalMatrix[i].cells[j].logicalRowIndex===i)
				{
					collapseRow=false;
					break;
				}
			}
		}
		
		if(this.logicalMatrix[i].logicalRow && this.logicalMatrix[i].logicalRow.cells.length==0)
		{
			this.logicalMatrix[i].logicalRow.parentNode.removeChild(this.logicalMatrix[i].logicalRow);
		}
		
		if(!collapseRow)
		{
			continue;
		}
		
		for(var j=0; j<this.logicalMatrix[i].cells.length; j++)
		{
			if(!this.logicalMatrix[i].cells[j])
			{
				continue;
			}
			this.logicalMatrix[i].cells[j].rowSpan--;
			if(this.logicalMatrix[i].cells[j].rowSpan==1)
			{
				this.logicalMatrix[i].cells[j].removeAttribute("rowSpan");
				
			}
			j+=(this.logicalMatrix[i].cells[j].colSpan-1);
		}		
	}
	
	this.getLogicalMatrix();
	
	if(hasFixedLayout)
	{
		for(var i=0; i<this.logicalMatrix.length; i++)
		{
			for(var j=0; j<this.logicalMatrix[i].cells.length; j++)
			{
				if(this.logicalMatrix[i].cells[j])
				{
					continue;
				}
				for(var k=j-1; k>=0; k--)
				{
					if(this.logicalMatrix[i].cells[k] && this.logicalMatrix[i].cells[k].logicalRowIndex==i)
					{
						break;
					}
				}
				
				newTd=this.ownerDocument.createElement("TD");
				newTd.contentEditable=true;
								
				this.logicalMatrix[i].logicalRow.insertAfter( newTd, this.logicalMatrix[i].cells[k]);
				
			}
		}
	}
	
}