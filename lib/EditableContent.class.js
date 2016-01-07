function EditableContent(iframe)//always an iframe, need edited doc CSS in their own space
{
	this.window=iframe.contentWindow;
	this.addScripts();
}

with(EditableContent)
{
	prototype.window=null;
	
	prototype.addScripts=EditableContent_addScripts;
	prototype.getRange=HtmlEditor_getRange;
	prototype.setSelectionBeforeAndAfter=EditableContent_setSelectionBeforeAndAfter;
	prototype.surroundNode=EditableContent_surroundNode;
	
	prototype.visitSelectedNodes=EditableContent_visitSelectedNodes;
	prototype.surroundTextNodes=EditableContent_surroundTextNodes;
	prototype.collectTextNodes=EditableContent_collectTextNodes;
}
function EditableContent_addScripts()
{
	var header, script;
	
	header=this.window.document.getElementsByTagName("head")[0];
	
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/Document.class.js";
	header.appendChild(script);
	
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/Node.class.js";
	header.appendChild(script);
	
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/console.js";
	header.appendChild(script);
}
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
function EditableContent_surroundNode(node, tagName, startOffset, endOffset)
{
	var parentNode;
	
	node.split(startOffset, endOffset);
	
	parentNode=this.window.document.createElement(tagName);
	
	node.parentNode.insertBefore(parentNode, node);
	
	parentNode.appendChild(node.parentNode.removeChild(node));
	
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
function EditableContent_surroundTextNodes(tagName)
{
	var callbackMethodArguments=this.visitSelectedNodes("collectTextNodes");
	
	for(var i=0; i<callbackMethodArguments.textNodes.length; i++)
	{
		this.surroundNode(callbackMethodArguments.textNodes[i].node, tagName, callbackMethodArguments.textNodes[i].startOffset, callbackMethodArguments.textNodes[i].endOffset);
	}
	
	this.setSelectionBeforeAndAfter(callbackMethodArguments.textNodes[0].node.parentNode,
		callbackMethodArguments.textNodes[callbackMethodArguments.textNodes.length-1].node.parentNode);
}
function EditableContent_collectTextNodes(node, startOffset, endOffset, callbackMethodArguments, start)
{	
	if(node.nodeType==3)
	{
		if(!callbackMethodArguments.textNodes)
		{
			callbackMethodArguments.textNodes=[];
		}
		callbackMethodArguments.textNodes[callbackMethodArguments.textNodes.length]={node: node, startOffset: startOffset, endOffset:endOffset};
	}
}