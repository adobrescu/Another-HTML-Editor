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
	
	/*
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/Document.class.js";
	header.appendChild(script);
	
   
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/Node.class.js";
	header.appendChild(script);
	
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/console.js";
	header.appendChild(script);
	*/
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
		range=this.window.document.createRange();
	}
	
	return range;
}
function EditableContent_setSelectionBeforeAndAfter(startContainer, endContainer)
{
	var range;
	
	this.window.getSelection().removeAllRanges();
	range=this.getRange();

	
	range.setStart(startContainer, 0);
	range.setEnd(endContainer, endContainer.childNodes.length);
	
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
function EditableContent_visitSelectedNodes(callback, callbackMethodArguments, node, offset, rangeEndContainer, rangeEndOffset, close)
{
	var endVisit;
		
	if(!node)
	{
		//first call
		
		var range=this.getRange();
		
		if(range.startContainer.isElement())
		{
			node=range.startContainer.childNodes[range.startOffset];
			//offset=range.startOffset;//the offset doesn't matter
		}
		else
		{
			node=range.startContainer;
			offset=range.startOffset;
		}
		if(range.endContainer.isElement())
		{
			rangeEndContainer=range.endContainer.childNodes[range.endOffset-1];
			//alert(range.endOffset+"/"+range.endContainer.childNodes.length);
		}
		else
		{
			rangeEndContainer=range.endContainer;
			rangeEndOffset=range.endOffset;
		}
		
		//console.log("range");
		//console.logNode(node, "offset="+offset);
		//console.logNode(rangeEndContainer, "offset="+rangeEndOffset);
		//console.log("end range");
		if(callback)
		{
			if(typeof(callback)!="object")
			{
				callback=[window, callback];
			}
			if(typeof(callbackMethodArguments)=="undefined")
			{
				callbackMethodArguments=new Object();
			}
		}
	}
	
	
	
	endVisit=(node==rangeEndContainer);
		
	if(callback)
	{
		if(endVisit && node.isText())
		{
			//visit first the node as opening
			callback[0][callback[1]](node, false, false, callbackMethodArguments, offset, rangeEndOffset);
			callback[0][callback[1]](node, true, true, callbackMethodArguments, rangeEndOffset, offset);
		}
		else
		{
			callback[0][callback[1]](node, close, endVisit, callbackMethodArguments, offset);
		}
	}

	if(endVisit)
	{
		//all nodes in selection visited, end the visit
		return callbackMethodArguments?callbackMethodArguments:true;
	}
	//visit child nodes
	if(node.nodeType==1)
	{
		if(node.childNodes.length>offset)
		{
			if(this.visitSelectedNodes(callback, callbackMethodArguments, node.childNodes[offset], 0, rangeEndContainer, rangeEndOffset))
			{
				return callbackMethodArguments?callbackMethodArguments:true;
			}
		}
		if(node.childNodes.length==0 && callback)
		{
			callback[0][callback[1]](node, true, endVisit, callbackMethodArguments, offset);
		}
	}
	else // if( node.isText() )
	{
		if(!node.textContent)
		{
			alert(node);
		}
		callback[0][callback[1]](node, true, endVisit, callbackMethodArguments, node.textContent.length, offset);
	}
	
	
	//visit next sibling	
	if(node.nextSibling)
	{
		return this.visitSelectedNodes(callback, callbackMethodArguments, node.nextSibling, 0, rangeEndContainer, rangeEndOffset)
	}
	else
	//visit the doc down to first ancestor node that has a next sibling
	if(node.parentNode)
	{
		return this.visitSelectedNodes(callback, callbackMethodArguments, node.parentNode, node.parentNode.childNodes.length, rangeEndContainer, rangeEndOffset, true);
	}
}
EditableContent.prototype.surroundNodes=EditableContent_surroundNodes;


function EditableContent_surroundNodes(tagName, startNode, startOffset, endNode, endOffset)
{
	var commonAncestorNode, startEdgeNode;
	var endEdgeNode, endEdgeRightNode;
	
	var splitStart, splitStartOffset, splitEnd, splitEndOffset;
	//console.clear();
	commonAncestorNode=startNode.getCommonAncestor(endNode);
	console.logNode(startNode, "", false, "Surround start, offset "+startOffset+", ");
	console.logNode(endNode, "", false,  "Surround end, offset "+endOffset+", ");
	console.logNode(commonAncestorNode, "commonAncestorNode ");
	
	if(startNode.isElement())
	{
		splitStart=startNode.parentNode;
		splitStartOffset=startNode.getIndex();
	}
	else
	{
		splitStartOffset=startOffset;
		splitStart=startNode;
	}
	if(!(splitStart=commonAncestorNode.splitChildAtDescendant(splitStart, splitStartOffset, true)))
	{
		splitStart=startNode;
	}
	else
	{
		splitStart=splitStart.nextSibling;
	}
	if(endNode.isElement())
	{
		splitEnd=endNode.parentNode;
		splitEndOffset=endNode.getIndex()+1;//+1 to split AFTER endNode
	}
	else
	{
		splitEnd=endNode;
		splitEndOffset=endOffset;
	}
	console.logNode(splitStart, "", false, "Start split at");
	
	if(!(splitEnd=commonAncestorNode.splitChildAtDescendant(splitEnd, splitEndOffset, false)))//returns he new created node(s) which are at right
	{
		splitEnd=endNode.nextSibling;
	}
	console.logNode(splitEnd, "", false, "End split at");
	
	var startIndex=splitStart.getIndex();
	//console.log("startIndex: "+startIndex);
	//console.log("startIndex: "+startIndex);
	
	console.log("startIndex:"+startIndex);
	var containerElement=this.window.document.createElement(tagName);
	
	//return;
	
	for( ; commonAncestorNode.childNodes[startIndex]!=splitEnd; )
	{
		console.log("DA");
		containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
	}
	commonAncestorNode.insertBefore(containerElement, splitEnd);
	
	return containerElement;
}
function EditableContent_surroundTextNodes(tagName, select, node, offset, rangeEndContainer, rangeEndOffset)
{
/*
	var args=this.visitSelectedNodes([this, "collectTextNodes"], 
						{"inlineEdgeNodes":[{"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastNode": null, "lastEndOffset": -1}]},
						node, offset, rangeEndContainer, rangeEndOffset);
*/
	var args=this.getInlineNodesEdges(node, offset, rangeEndContainer, rangeEndOffset, null, [tagName]);
	var container, startNode, endNode;
	var containers=[];
	//return;
	for(var i=0; i<args.inlineEdgeNodes.length; i++)
	{		
		
		//console.logNode(args.inlineEdgeNodes[i].startNode, "Surround start offset "+args.inlineEdgeNodes[i].startOffset);
		//console.logNode(args.inlineEdgeNodes[i].endNode, "Surround end offset "+args.inlineEdgeNodes[i].endOffset);
		
		containers[containers.length]=this.surroundNodes(tagName, args.inlineEdgeNodes[i].startNode, 
						args.inlineEdgeNodes[i].startOffset,
						args.inlineEdgeNodes[i].endNode, 
						args.inlineEdgeNodes[i].endOffset);
		if(i==0)
		{
			startNode=containers[containers.length-1];
		}
	}
	
	endNode=containers[containers.length-1];
	
	if(select)
	{
		this.setSelectionBeforeAndAfter(startNode, endNode);
	}
	return containers;
}
EditableContent.prototype.getInlineNodesEdges=EditableContent_getInlineNodesEdges;
function EditableContent_getInlineNodesEdges(startNode, startOffset, endNode, endOffset, ca/*callback arguments*/, findTagNames)
{
	if(!ca)
	{
		ca={};
	}
	ca.inlineEdgeNodes=[];//{"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastEndNode": null, "lastEndOffset": -1}];
	//ca.stack=[];
	ca.openNodes=0;
	ca.openNodesDepth=10000;
	ca.findTagNames=findTagNames;
	ca.foundTagNames=[];
	ca.startNewEdge=true;
	
	return this.visitSelectedNodes([this, "collectTextNodes"], 
						ca,
						startNode, startOffset, endNode, endOffset);
}
EditableContent.prototype.nodeHasContentAtOffset=EditableContent_nodeHasContentAtOffset;
function EditableContent_nodeHasContentAtOffset(node, offset, rightSide)
{
	if(node.isEmpty()
		||
		(	
			node.isText() && 
			(
				(rightSide && offset>node.textContent.length-1)
				||
				(!rightSide && offset==0)
				||
				(!rightSide && !node.textContent.substr(0, offset).match(/[^\s]{1}/ ) )
				||
				(rightSide && !node.textContent.substr(offset, node.textContent.length-offset).match(/[^\s]{1}/ ) )
			)
		) 
		)
	{
		return false;
	}
	
	return true;
}
/**
 * 
 * EditableContent.collectTextNodes
 * 
 * Nodurile care deschid si se inchid in interiorul selectiei sint vizitate de 2 ori, inainte de vizitarea primului child si dupa vizitarea ultimului child;
 * Cele  care se deschid inaintea selectiei si se inchid in interior sint vizitate doar dupa ultimul child;
 * Cele care se deschid in selectie si se inchid dupa ea sint vizitatea doar inainte primului child
 * 
 * 
 * @param {type} node - nodul vizitat
 * @param {type} close - false daca vizita este inaintea vizitarii childrenilor, true daca acestia au fost vizitati
 * @param {type} endVisit - nodul vizitat este ultimul care este vizitat, este ultimul apel al callback-ului
 * @param {type} ca - argumente, se plimba de la un apel la altul si este returnat de catre functia de vizitare
 * @param {type} startOffset - pentru nod text cu close=false, este indexul la care s-a inceput vizita (la ce caracter); pentru close=true este ultimul caracter "vizitat"
 * @param {type} endOffset - pentru text node la fel ca startOffset cu close tratat invers 
 * @returns {undefined}
 */
function EditableContent_collectTextNodes(node, close, endVisit, ca /*callbackArguments*/, startOffset, endOffset)
{	
	var numDelimiters, isInlineNode;
	
	if(ca.findTagNames && node.isElement() )
	{
		for(var i=0; i<ca.findTagNames.length; i++)
		{
			if(node.tagName.toUpperCase()==ca.findTagNames[i].toUpperCase())
			{
				ca.foundTagNames[ca.foundTagNames.length]=node;
				break;
			}
		}
		
	}
	
	numDelimiters=ca.inlineEdgeNodes.length;
	
	console.log("------------------------------------");
	/*
	if(!node.isInline())
	{
		if(close)
		{
			console.logNode(node, "", true, "Close block element");
			ca.inlineEdgeNodes[numDelimiters-1].endNode=ca.inlineEdgeNodes[numDelimiters-1].lastNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;

			ca.inlineEdgeNodes[numDelimiters]={"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastNode": null, "lastEndOffset": -1};
			ca.openNodes=0;
			ca.openNodesDepth=10000;
		
		}
		
		return;
	}*/
	if(!node.isInline() && !close)
	{
		//return;
	}
	
	if(node.isInline() && this.nodeHasContentAtOffset(node, startOffset, !close))
	{
		
		//console.logNode(node, (endVisit?", finish ":"")+"("+startOffset+")", close);
		console.logNode(node, "("+startOffset+")", close);
		console.log("Stack: "+ca.openNodes+" / "+ca.openNodesDepth);


		if(!close)
		{
			console.log("Open");
			ca.openNodes++;

			return;
		}
		if(ca.openNodes<=0)
		{
			console.log("Close element open outside selection");
			return;
		}
		//else
		{
			ca.openNodes--;

			if(ca.openNodes<ca.openNodesDepth)
			{
				console.log("Set as Start");
				if(ca.startNewEdge)
				{
					ca.inlineEdgeNodes[numDelimiters]={"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastEndNode": null, "lastEndOffset": -1};
					numDelimiters++;
					ca.startNewEdge=false;
				}
				ca.inlineEdgeNodes[numDelimiters-1].startNode=node;
				ca.inlineEdgeNodes[numDelimiters-1].startOffset=endOffset;
				ca.openNodesDepth=ca.openNodes;
			}
		}

		ca.inlineEdgeNodes[numDelimiters-1].lastEndNode=node;
		ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset=startOffset;
		console.log("Last used offset="+ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset);
	}
	
	if(endVisit || !node.isInline() )
	{
		/*if(!ca.inlineEdgeNodes[numDelimiters-1].startNode)
		{
			ca.inlineEdgeNodes[numDelimiters-1].startNode=node;
			ca.inlineEdgeNodes[numDelimiters-1].startOffset=endOffset;
		}
		
		if(this.nodeHasContentAtOffset(node, startOffset, false))
		{
			ca.inlineEdgeNodes[numDelimiters-1].endNode=node;//ca.inlineEdgeNodes[numDelimiters-1].lastNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=startOffset;//ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;
		}
		else*/
		{
			ca.inlineEdgeNodes[numDelimiters-1].endNode=ca.inlineEdgeNodes[numDelimiters-1].lastEndNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;
		}
		if(!endVisit)
		{
			ca.startNewEdge=true;
			ca.openNodes=0;
			ca.openNodesDepth=10000;
			console.log("Start new eddge");
		}
		console.log("End edge: "+numDelimiters);
		console.logNode(ca.inlineEdgeNodes[numDelimiters-1].startNode, "("+ca.inlineEdgeNodes[numDelimiters-1].startOffset+")", true, "Start edge node:" );
		console.logNode(ca.inlineEdgeNodes[numDelimiters-1].endNode, "("+ca.inlineEdgeNodes[numDelimiters-1].endOffset+")", true, "End edge node:" );
		return;
	}
}