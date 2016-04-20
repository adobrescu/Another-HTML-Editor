function ContentSelection()
{
	this.window=window;
	this.borders=[];
	this.currentBorders=[];
	this.boundaryNodes=[];
	this.selection=window.getSelection();
	this.eventListeners=[];
	this.ranges=[];
	
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
	prototype.takeSnapshot=ContentSelection_takeSnapshot;
	prototype.getRanges=ContentSelection_getRanges;
	prototype.removeAllRanges=ContentSelection_removeAllRanges;
	prototype.getRangeBoundaries=ContentSelection_getRangeBoundaries;
	prototype.updateSplittedRanges=ContentSelection_updateSplittedRanges;
	prototype.addBorder=ContentSelection_addBorder;
	prototype.removeBorders=ContentSelection_removeBorders;
	prototype.isSolid=ContentSelection_isSolid;
	prototype.isCollapsed=ContentSelection_isCollapsed;
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
function ContentSelection_onSelectionChange(evt, forceLocked)
{
	if(evt && window.getSelection().rangeCount>0)
	{
		this.locked=false;
	}
	if(this.locked && !forceLocked)
	{
		return;
	}
	
	if(evt && window.getSelection().rangeCount>0)
	{
		this.removeBorders();
		this.ranges=[];
		this.isCustom=false;	
	}
	
	this.callEventListeners(evt);
}
function ContentSelection_takeSnapshot()
{
	this.ranges=[];
	
	for(var i=0; i<window.getSelection().rangeCount; i++)
	{
		this.ranges[this.ranges.length]=this.getRangeBoundaries(window.getSelection().getRangeAt(i), i==0);
		
	}
	
	return this.ranges;
}
ContentSelection.prototype.addRange=ContentSelection_addRange;
function ContentSelection_addRange(rangeBoundaries, noCreateRange, noTrigger)
{
	var range, range2;
	var startContainer, startOffset, endContainer, endOffset;
	
	if(this.locked)
	{
		return;
	}
	
	if(noCreateRange || rangeBoundaries.isCustom)
	{
		if(rangeBoundaries.isCustom)
		{
			this.isCustom=true;
		}
		this.ranges[this.ranges.length]=rangeBoundaries;
		if(!noTrigger)
		{
			this.onSelectionChange(null, true);
		}
		return;
	}
	
	range2=this.getRangeFromBoundaries(rangeBoundaries);
	
	range=window.document.createRange();
	
	
	
	range.setStart(range2.startContainer, range2.startOffset);
	range.setEnd(range2.endContainer, range2.endOffset);
	
	window.getSelection().addRange(range);
	
	this.ranges[this.ranges.length]=this.getRangeBoundaries(range);
	
	//this.callEventListeners();
}
function ContentSelection_getRangeBoundaries(range)
{//@fixme
	var boundarySide;
	
	var rangeSides=["start", "end"];
	
	var rangeBoundaries={};
	
	return {"startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer":range.endContainer, "endOffset":range.endOffset};
	
	for(var i=0; i<rangeSides.length; i++)
	{
		boundarySide=rangeSides[i];
		
		rangeBoundaries[boundarySide+"Container"]=range[boundarySide+"Container"];
		//rangeBoundaries[boundarySide+"ContainerParent"]=rangeBoundaries[boundarySide+"Container"].parentNode;
		rangeBoundaries[boundarySide+"Offset"]=range[boundarySide+"Offset"];
		rangeBoundaries[boundarySide+"ShiftOffset"]=0;
		
		if(!rangeBoundaries[boundarySide+"Container"].isElement() || rangeBoundaries[boundarySide+"Container"].childNodes.length==0)
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
{//@fixme
	
	return {"startContainer": rangeBoundaries.startContainer, "startOffset": rangeBoundaries.startOffset, "endContainer":rangeBoundaries.endContainer, "endOffset":rangeBoundaries.endOffset};
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
		this.takeSnapshot();
		
	}
	
	return { "ranges": this.ranges, "boundaryNodes": this.boundaryNodes, "locked": this.locked};
}
function ContentSelection_removeAllRanges()
{
	if(this.locked)
	{
		return;
	}
	window.getSelection().removeAllRanges();
	
	this.ranges=[];
	for(var i=0; i<this.currentBorders.length; i++)
	{
		this.currentBorders[i].remove();
	}
	this.currentBorders=[];
	this.boundaryNodes=[];
	this.isCustom=false;
}
/*
ContentSelection.prototype.updateRanges=ContentSelection_updateRanges;
function ContentSelection_updateRanges()
{
	var r=this.getRanges();
	this.removeAllRanges();
	for(var i=0; i<r.ranges.length; i++)
	{
		this.addRange(r.ranges[i]);
	}
}
*/
function ContentSelection_updateSplittedRanges(rangeContainer, newContainer, newContainerToLeft, splitOffset)
{
	var updatedRange=range;
	var leftContainer, rightContainer;
	var range, selectionUpdated;
	
	if(!newContainer)
	{
		return false;
	}
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
	
	for(var i=0; i<this.ranges.length; i++)
	{
		range=this.ranges[i];
		
		if( rangeContainer.isText() && (rangeContainer===range.startContainer || rangeContainer===range.endContainer) )
		{
			selectionUpdated=true;
			if(range.startContainer===rangeContainer)
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
			if(range.endContainer===rangeContainer)
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
			continue;
		}			
		
		if(rangeContainer===range.startContainer.childNodes[range.startOffset])
		{
			range.startOffset=leftContainer.getIndex();
		}
		else
		if(rangeContainer===range.startContainer)
		{
			
			if(splitOffset<range.endOffset)
			{
				range.startContainer=rightContainer;
				range.startOffset=Math.abs(range.startOffset-splitOffset);
				
			}
			else
			{
				range.startContainer=leftContainer;
			}
		}
		
		if(rangeContainer===range.endContainer.childNodes[range.endOffset])
		{
			range.endOffset=rightContainer.getIndex();
		}
		else
		if(rangeContainer===range.endContainer)
		{
			if(splitOffset<range.endOffset)
			{
				range.endContainer=rightContainer;
				range.endOffset==Math.abs(range.endOffset-splitOffset);
			}
			else
			{
				range.endContainer=leftContainer;
			}
		}
	}
	
	return selectionUpdated;
}
function ContentSelection_addBorder(leftTopNode, rightBottomNode, noTrigger)
{
	if(this.locked)
	{
		return;
	}
	
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
		
	if(!noTrigger)
	{
		this.onSelectionChange(null, true);
	}
	return this.currentBorders[this.currentBorders.length-1];
}

function ContentSelection_removeBorders()
{
	if(this.locked)
	{
		return;
	}
	
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
function ContentSelection_isCollapsed()
{
	if(this.ranges.length>1 || this.boundaryNodes.length>0)
	{
		return false;
	}
	var range=window.getSelection().getRangeAt(0);
			
	return range.collapsed;
}
this.contentSelection=new ContentSelection();