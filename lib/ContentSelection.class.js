function ContentSelection()
{
	this.window=window;
	this.borders=[];
	this.currentBorders=[];
	this.boundaryNodes=[];
	this.selection=window.getSelection();
	this.eventListeners=[];
	
	ContentSelection.prototype.___instance=this;
	
	window.document.addEventListener("selectionchange", new Function("evt", "ContentSelection.prototype.___instance.onSelectionChange(evt, false);"));
}
with(ContentSelection)
{
	prototype.___ranges=[];
	prototype.___instance=null;
	prototype.addSelectionChangeEventListener=ContentSelection_addSelectionChangeEventListener;
	prototype.callEventListeners=ContentSelection_callEventListeners;
	prototype.lock=ContentSelection_lock;
	prototype.onSelectionChange=ContentSelection_onSelectionChange;
	prototype.___takeSnapshot=ContentSelection____takeSnapshot;
	prototype.___getRanges=ContentSelection____getRanges;
	prototype.takeSnapshot=ContentSelection_takeSnapshot;
	prototype.getRanges=ContentSelection_getRanges;
	prototype.removeAllRanges=ContentSelection_removeAllRanges;
	prototype.getRangeBoundaries=ContentSelection_getRangeBoundaries;
	prototype.updateSplittedRanges=ContentSelection_updateSplittedRanges;
	prototype.addBorder=ContentSelection_addBorder;
	prototype.removeBorders=ContentSelection_removeBorders;
	prototype.isSolid=ContentSelection_isSolid;
}
function ContentSelection_addSelectionChangeEventListener(eventHandler)
{
	this.eventListeners[this.eventListeners.length]=eventHandler;
	
	//window.document.addEventListener("selectionchange", eventHandler);
}
function ContentSelection_callEventListeners(evt)
{
	for(var i=0; i<this.eventListeners.length; i++)
	{
		this.eventListeners[i](evt?evt:{});
	}
}
function ContentSelection_lock(lock)
{
	this.locked=lock;
}
function ContentSelection_onSelectionChange(evt, isCustom)
{
	
	if(!isCustom)
	{
		this.locked=false;
	}
	if(this.locked)
	{
		return;
	}
	//console.trace();
	if(!isCustom && window.getSelection().rangeCount>0)
	{
		this.removeBorders();
		ContentSelection.prototype.___ranges=[];
		this.isCustom=false;
		
	}
	
	this.callEventListeners(evt);
}
function ContentSelection____takeSnapshot()
{	
	ContentSelection.prototype.___ranges=[];
	
	for(var i=0; i<window.getSelection().rangeCount; i++)
	{
		ContentSelection.prototype.___ranges[ContentSelection.prototype.___ranges.length]=this.getRangeBoundaries(window.getSelection().getRangeAt(i));
		
	}
	
	return ContentSelection.prototype.___ranges;
}
function ContentSelection____getRanges()
{
	
	return ContentSelection.prototype.___ranges;
}

function ContentSelection_takeSnapshot()
{
	window.ContentSelection.prototype.___takeSnapshot();
}
ContentSelection.prototype.addRange=ContentSelection_addRange;
function ContentSelection_addRange(rangeBoundaries, noCreateRange)
{
	
	var range, range2;
	var startContainer, startOffset, endContainer, endOffset;
	
	if(noCreateRange || rangeBoundaries.isCustom)
	{
		if(rangeBoundaries.isCustom)
		{
			this.isCustom=true;
		}
		ContentSelection.prototype.___ranges[ContentSelection.prototype.___ranges.length]=rangeBoundaries;
		this.onSelectionChange(null, true);
		return;
	}
	
	range2=this.getRangeFromBoundaries(rangeBoundaries);
	
	range=window.document.createRange();
	
	range.setStart(range2.startContainer, range2.startOffset);
	range.setEnd(range2.endContainer, range2.endOffset);
	
	window.getSelection().addRange(range);
	
	ContentSelection.prototype.___ranges[ContentSelection.prototype.___ranges.length]=this.getRangeBoundaries(range);
	
	//this.callEventListeners();
}
function ContentSelection_getRangeBoundaries(range)
{
	var boundarySide;
	
	var rangeSides=["start", "end"];
	
	var rangeBoundaries={};
	
	for(var i=0; i<rangeSides.length; i++)
	{
		boundarySide=rangeSides[i];
		
		rangeBoundaries[boundarySide+"Container"]=range[boundarySide+"Container"];
		rangeBoundaries[boundarySide+"Offset"]=range[boundarySide+"Offset"];
		rangeBoundaries[boundarySide+"ShiftOffset"]=0;
		
		if(!rangeBoundaries[boundarySide+"Container"].isElement())
		{
			continue;
		}
		
		rangeBoundaries[boundarySide+"IsChildNode"]=true;
			
		switch(rangeBoundaries[boundarySide+"Offset"])
		{
			case 0:
				
				rangeBoundaries[boundarySide+"ShiftOffset"]=0;
				rangeBoundaries[boundarySide+"Container"]=rangeBoundaries[boundarySide+"Container"].childNodes[rangeBoundaries[boundarySide+"Offset"]];
				
				break;
			case rangeBoundaries[boundarySide+"Container"].childNodes.length:
				
				rangeBoundaries[boundarySide+"ShiftOffset"]=1;
				rangeBoundaries[boundarySide+"Container"]=rangeBoundaries[boundarySide+"Container"].childNodes[rangeBoundaries[boundarySide+"Offset"]-1];
				
				break;
			default:
				
				rangeBoundaries[boundarySide+"ShiftOffset"]=0;
				rangeBoundaries[boundarySide+"Container"]=rangeBoundaries[boundarySide+"Container"].childNodes[rangeBoundaries[boundarySide+"Offset"]];
				
				break;
			}
			
	}
	return rangeBoundaries;
}
ContentSelection.prototype.getRangeFromBoundaries=ContentSelection_getRangeFromBoundaries;
function ContentSelection_getRangeFromBoundaries(rangeBoundaries)
{
	var boundarySide;
	
	var rangeSides=["start", "end"];
	var range={};
	
	for(var i=0; i<rangeSides.length; i++)
	{
		boundarySide=rangeSides[i];
		if(!rangeBoundaries[boundarySide+"IsChildNode"])
		{
			
			range[boundarySide+"Container"]=rangeBoundaries[boundarySide+"Container"];
			range[boundarySide+"Offset"]=rangeBoundaries[boundarySide+"Offset"];
			continue;
		}
		
		range[boundarySide+"Offset"]=rangeBoundaries[boundarySide+"Container"].getIndex()+rangeBoundaries[boundarySide+"ShiftOffset"];
		range[boundarySide+"Container"]=rangeBoundaries[boundarySide+"Container"].parentNode;
		
	}
	
	return range;
}
function ContentSelection_getRanges(noRefresh)
{
	var ranges;
	
	if(!noRefresh && !this.isCustom)
	{
		
		this.boundaryNodes=[];
		window.ContentSelection.prototype.___takeSnapshot();
	}
	
	return { "ranges": window.ContentSelection.prototype.___ranges, "boundaryNodes": this.boundaryNodes};
}
function ContentSelection_removeAllRanges()
{
	
	window.getSelection().removeAllRanges();
	
	ContentSelection.prototype.___ranges=[];
	for(var i=0; i<this.currentBorders.length; i++)
	{
		this.currentBorders[i].remove();
	}
	this.currentBorders=[];
	this.boundaryNodes=[];
	this.isCustom=false;
}
function ContentSelection_updateSplittedRanges(rangeContainer, newContainer, newContainerToLeft, splitOffset)
{
	var updatedRange=range;
	var leftContainer, rightContainer;
	var range, selectionUpdated;
	
	for(var i=0; i<ContentSelection.prototype.___ranges.length; i++)
	{
		range=ContentSelection.prototype.___ranges[i];
		
		if(rangeContainer!=range.startContainer && rangeContainer!=range.endContainer)
		{
			continue;
		}			
			
		selectionUpdated=true;
	
		if(newContainerToLeft)
		{
			leftContainer=newContainer;
			rightContainer=rangeContainer;
		}
		else
		{
			leftContainer=rangeContainer;
			rightContainer=newContainer;
		}
		if(range.startContainer==rangeContainer)
		{
			if(splitOffset<=range.startOffset)
			{
				range.startContainer=rightContainer;
				range.startOffset=range.startOffset-splitOffset;
			}
			else
			{
				range.startContainer=leftContainer;
				//range.endOffset=range.startOffset-splitOffset;
			}
		}
		//else
		if(range.endContainer==rangeContainer)
		{
			if(splitOffset>=range.endOffset)
			{
				range.endContainer=leftContainer;
			}
			else
			{
				range.endContainer=rightContainer;
				range.endOffset=range.endOffset-splitOffset;
			}
		}

		
	}
	
	return selectionUpdated;
}

function ContentSelection_addBorder(leftTopNode, rightBottomNode)
{
	if(this.currentBorders.length==this.borders.length)
	{
		this.borders[this.borders.length]=HTMLTableElement.prototype.___borders[HTMLTableElement.prototype.___borders.length]=new Border(window.document);
	}
	
	this.currentBorders[this.currentBorders.length]=this.borders[this.currentBorders.length];
		
	this.currentBorders[this.currentBorders.length-1].surroundElements(
								leftTopNode, 
								rightBottomNode);
	this.currentBorders[this.currentBorders.length-1].show();
	
	
	this.boundaryNodes[this.boundaryNodes.length]=[leftTopNode, rightBottomNode];
	
	//this.callEventListeners();
	
	this.onSelectionChange(null, true);
	return this.currentBorders[this.currentBorders.length-1];
}

function ContentSelection_removeBorders()
{
	for(var i=0; i<this.currentBorders.length; i++)
	{
		this.currentBorders[i].remove();
	}
	this.boundaryNodes=[];
}

function ContentSelection_isSolid()
{
	for(var i=0; i<this.currentBorders.length; i++)
	{
		this.currentBorders[i].isSolid(true);
	}
}
this.contentSelection=new ContentSelection();