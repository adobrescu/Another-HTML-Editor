function EditableContent(iframe)//always an iframe, need edited doc CSS in their own space
{
	this.window=iframe.contentWindow;
	
}

with(EditableContent)
{
	prototype.window=null;
	
	prototype.getRange=HtmlEditor_getRange;
	prototype.setSelectionBeforeAndAfter=EditableContent_setSelectionBeforeAndAfter;
	prototype.visitSelectedNodes=EditableContent_visitSelectedNodes;
function HtmlEditor_getRange()
{
	var range;
				
	try
	{
		range=this.window.getSelection().getRangeAt(0);
	}
	catch(err)
	{
		range=this.window.getSelection().createRange();
	}
	
	return range;
}
function EditableContent_setSelectionBeforeAndAfter(startContainer, endContainer)
{
	var range;
	
	range=this.getRange();
	
	range.setStartBefore(startContainer);
	range.setEndAfter(endContainer);
	
	this.window.getSelection().addRange(range);
}
}
function EditableContent_visitSelectedNodes(node, offset, rangeEndContainer, rangeEndOffset, callbackMethod, callbackMethodArguments)
{
	if(!node)
	{
		//first call
		var range;
				
		try
		{
			range=this.window.getSelection().getRangeAt(0);
		}
		catch(err)
		{
			range=this.window.getSelection().createRange();
		}
		node=range.startContainer;
		offset=range.startOffset;
		rangeEndContainer=range.endContainer;
		rangeEndOffset=range.endOffset;
		if(callbackMethod)
		{
			callbackMethodArguments=new Object();
		}
	}
	console.log("visit node: "+(node.nodeType==3?"Text: "+node.textContent:node.tagName));
	if(callbackMethod)
	{
		this[callbackMethod](node, offset);
	}
	if(node==rangeEndContainer)
	{
		//all nodes in selection visited, end the visit
		return true;
	}
	
	//visit child nodes
	if(node.nodeType==1 && node.childNodes.length)
	{
		if(this.visitSelectedNodes(node.childNodes[offset], 0, rangeEndContainer, rangeEndOffset))
		{
			return true;
		}
	}
	
	//visit next siblings
	for(var nextSibling=node.nextSibling; nextSibling; nextSibling=nextSibling.nextSibling)
	{
		if(this.visitSelectedNodes(nextSibling, 0, rangeEndContainer, rangeEndOffset))
		{
			return true;
		}
	}
	
	//visit the doc down to node parent next sibling
	for(var ancestor=node.parentNode; ancestor; ancestor=ancestor.parentNode)
	{
		if(ancestor.nextSibling)
		{
			return this.visitSelectedNodes(ancestor.nextSibling, 0, rangeEndContainer, rangeEndOffset);
		}
	}
	
}