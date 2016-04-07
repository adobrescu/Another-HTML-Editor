function ContentSelection()
{
	this.window=window;
	this.selection=window.getSelection();
}
with(ContentSelection)
{
	prototype.___ranges=[];
	prototype.___takeSnapshot=ContentSelection____takeSnapshot;
	prototype.___getRanges=ContentSelection____getRanges;
	prototype.takeSnapshot=ContentSelection_takeSnapshot;
	prototype.getRanges=ContentSelection_getRanges;
	prototype.removeAllRanges=ContentSelection_removeAllRanges;
	prototype.getRangeBoundaries=ContentSelection_getRangeBoundaries;
	prototype.updateSplittedRanges=ContentSelection_updateSplittedRanges;
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
	
	if(noCreateRange)
	{
		
		ContentSelection.prototype.___ranges[ContentSelection.prototype.___ranges.length]=rangeBoundaries;
		return;
	}
	
	range2=this.getRangeFromBoundaries(rangeBoundaries);
	
	range=window.document.createRange();
	
	range.setStart(range2.startContainer, range2.startOffset);
	range.setEnd(range2.endContainer, range2.endOffset);
	
	window.getSelection().addRange(range);
	
	ContentSelection.prototype.___ranges[ContentSelection.prototype.___ranges.length]=this.getRangeBoundaries(range);
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
		window.ContentSelection.prototype.___takeSnapshot();
	}
	return window.ContentSelection.prototype.___ranges;
	if(!shift)
	{
		//return this.window.ContentSelection.prototype.___ranges;
	}
	
	ranges=[];
	
	for(var i=0; i<window.ContentSelection.prototype.___ranges.length; i++)
	{
		ranges[i]=this.getRangeFromBoundaries(window.ContentSelection.prototype.___ranges[i]);
		
	}
	
	return ranges;
}
function ContentSelection_removeAllRanges()
{
	
	window.getSelection().removeAllRanges();
	ContentSelection.prototype.___ranges=[];
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
this.contentSelection=new ContentSelection(this);