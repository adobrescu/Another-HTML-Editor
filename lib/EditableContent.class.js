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
function EditableContent_visitSelectedNodes(callbackMethod, callbackMethodArguments, node, offset, rangeEndContainer, rangeEndOffset, close)
{
	
	if(!node)
	{
		//first call
		var range=this.getRange();
		node=range.startContainer;
		offset=range.startOffset;
		rangeEndContainer=range.endContainer;
		rangeEndOffset=range.endOffset;
		if(callbackMethod)
		{
			callbackMethodArguments=new Object();
		}
	}
	
	if(callbackMethod)
	{
		this[callbackMethod](node, offset, node==rangeEndContainer?rangeEndOffset : (node.nodeType==3?node.textContent.length:node.childNodes.length), callbackMethodArguments, close);
	}
	
	
	if(node==rangeEndContainer)
	{
		//all nodes in selection visited, end the visit
		return callbackMethodArguments?callbackMethodArguments:true;
	}
	
	//visit child nodes
	if(node.nodeType==1)
	{
		if(node.childNodes.length>offset)
		{
			if(this.visitSelectedNodes(callbackMethod, callbackMethodArguments, node.childNodes[offset], 0, rangeEndContainer, rangeEndOffset))
			{
				return callbackMethodArguments?callbackMethodArguments:true;
			}
		}
		if(node.childNodes.length==0 && callbackMethod)
		{
			this[callbackMethod](node, offset, node==rangeEndContainer?rangeEndOffset : (node.nodeType==3?node.textContent.length:node.childNodes.length), callbackMethodArguments, close);
		}
	}
	//visit next sibling	
	if(node.nextSibling)
	{
		return this.visitSelectedNodes(callbackMethod, callbackMethodArguments, node.nextSibling, 0, rangeEndContainer, rangeEndOffset)
	}
	else
	//visit the doc down to first ancestor node that has a next sibling
	if(node.parentNode)
	{
		return this.visitSelectedNodes(callbackMethod, callbackMethodArguments, node.parentNode, node.parentNode.childNodes.length, rangeEndContainer, rangeEndOffset, true);
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