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
	prototype.surroundNodes=EditableContent_surroundNodes;
	prototype.getInlineNodesEdges=EditableContent_getInlineNodesEdges;
	prototype.nodeHasContentAtOffset=EditableContent_nodeHasContentAtOffset;
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
function EditableContent_visitSelectedNodes(callback, callbackArguments, node, offset, endContainer, endOffset, visitSiblings, noCallback, depth)
{
	if(!depth)
	{
		depth=0;
	}
	console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz "+depth+" : visitSiblings=	" +visitSiblings);
	if(!node)
	{
		//Visit selection, first call
		var range=this.getRange();
		
		node=range.startContainer;
		offset=range.startOffset;
		
		endContainer=range.endContainer;
		endOffset=range.endOffset;
		
		//console.logNode(node, "("+offset+")", false, "Selection start");
		//console.logNode(endContainer, "("+endOffset+")", false, "Selection end");
	}
	
	if(!this.visitSelectedNodes.endContainer)
	{
		console.log("static");
		this.visitSelectedNodes.endContainer=endContainer;
		this.visitSelectedNodes.endOffset=endOffset;
		
		visitSiblings=true;
		
		if(callback)
		{
			if(typeof(callback)!="object")
			{
				callback=[window, callback];
			}
			if(typeof(callbackArguments)=="undefined")
			{
				callbackArguments=new Object();
			}
		}
	}
	
	var closeOffset, endVisit;
	
	if(node==this.visitSelectedNodes.endContainer)
	{
		//console.log("end atewerde");
		//end container found
		//visit its child nodes starting with offset up to endOffset
		closeOffset=this.visitSelectedNodes.endOffset;
		endVisit=true;
		
		
	}
	else
	{
		closeOffset=(node.isText() ? node.textContent.length : node.childNodes.length);
		endVisit=false;
	}
	
	if(callback && offset<closeOffset )//!noCallback)
	{
		callback[0][callback[1]](node, offset, false, false, callbackArguments);
	}
	
	if(node.hasChildNodes())
	{
		for(var i=offset; i<closeOffset; i++)
		{
			if(this.visitSelectedNodes(callback, callbackArguments, node.childNodes[i], 0, null, null, false, false, depth+10))
			{
				//end container found within a child node, stop visiting
				return true;
			}
		}
	}
	
	if(callback)
	{
		console.log("Before"+endVisit);
		callback[0][callback[1]](node, closeOffset, true, endVisit, callbackArguments);
		console.log("After");
		
	}
	if(endVisit)
	{
		console.log("Visit END");
		this.visitSelectedNodes.endContainer=null;
		this.visitSelectedNodes.endOffset=-1;
		return true;
	}
	if(visitSiblings)
	{
		console.log(visitSiblings);
		for(var nextSibling=node.nextSibling; nextSibling; nextSibling=nextSibling.nextSibling)
		{
			if(this.visitSelectedNodes(callback, callbackArguments, nextSibling, 0, null, null, false, depth+1))
			{
				return true;
			}
		}
		
		return this.visitSelectedNodes(callback, callbackArguments, node.parentNode, node.parentNode.childNodes.length, null, null, true, true, depth+100);
	}
}
/*
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
			offset=range.startOffset;//the offset doesn't matter
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
		//console.logNode(node, "("+offset+")", false, "Start visit:");
		//console.logNode(rangeEndContainer, "("+offset+")", false, "End visit:");
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
*/


function EditableContent_surroundNodes(tagName, startNode, startOffset, endNode, endOffset)
{
	var commonAncestorNode, startEdgeNode;
	var endEdgeNode, endEdgeRightNode;
	
	var splitStart, splitStartOffset, splitEnd, splitEndOffset;
	//console.clear();
	commonAncestorNode=startNode.getCommonAncestor(endNode);
	//console.logNode(startNode, "", false, "Surround start, offset "+startOffset+", ");
	//console.logNode(endNode, "", false,  "Surround end, offset "+endOffset+", ");
	//console.logNode(commonAncestorNode, "commonAncestorNode ");
	
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
	//console.logNode(splitStart, "", false, "Start split at");
	
	if(splitStart==splitEnd)
	{
		splitEndOffset-=splitStartOffset;
	}
	
	if(!(splitEnd=commonAncestorNode.splitChildAtDescendant(splitEnd, splitEndOffset, false)))//returns he new created node(s) which are at right
	{
		splitEnd=endNode.nextSibling;
	}
	//console.logNode(splitEnd, "", false, "End split at");
	
	var startIndex=splitStart.getIndex();
		
	//console.log("startIndex:"+startIndex);
	var containerElement=this.window.document.createElement(tagName);
	
	//return;
	
	for( ; commonAncestorNode.childNodes[startIndex]!=splitEnd; )
	{
		containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
	}
	commonAncestorNode.insertBefore(containerElement, splitEnd);
	
	return containerElement;
}
function EditableContent_surroundTextNodes(tagName, tagAttributes, select, node, offset, rangeEndContainer, rangeEndOffset)
{
	var args, containers;
	
	args=this.getInlineNodesEdges(node, offset, rangeEndContainer, rangeEndOffset, null, [tagName]);
	
	containers=[];
	
	for(var i=0; i<args.inlineEdgeNodes.length; i++)
	{	
		containers[containers.length]=this.surroundNodes(tagName, args.inlineEdgeNodes[i].startNode, 
						args.inlineEdgeNodes[i].startOffset,
						args.inlineEdgeNodes[i].endNode, 
						args.inlineEdgeNodes[i].endOffset);
		if(!tagAttributes)
		{
			continue;
		}
		
		for(var tagAttributeName in tagAttributes)
		{
			containers[containers.length-1][tagAttributeName]=tagAttributes	[tagAttributeName];
		}
	}
	//console.log("args.foundTagNames.length="+args.foundTagNames.length);
	for(var i=0; i<args.foundTagNames.length; i++)
	{
		args.foundTagNames[i].moveContentBefore();
		args.foundTagNames[i].parentNode.removeChild(args.foundTagNames[i]);
	}
	
	if(select)
	{
		this.setSelectionBeforeAndAfter(containers[0], containers[containers.length-1]);
	}
	return containers;
}

function EditableContent_getInlineNodesEdges(startNode, startOffset, endNode, endOffset, ca/*callback arguments*/, findTagNames)
{
	if(!ca)
	{
		ca={};
	}
	ca.inlineEdgeNodes=[];
	ca.openNodes=0;
	ca.openNodesDepth=10000;
	ca.findTagNames=findTagNames;
	ca.foundTagNames=[];
	ca.startNewEdge=true;
	ca.startOffsetsStack=[];
	
	this.visitSelectedNodes([this, "collectTextNodes"], 
						ca,
						startNode, startOffset, endNode, endOffset);
	return ca;
}

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
function EditableContent_collectTextNodes(node, offset, close, endVisit, ca /*callbackArguments*/)
{
	var numDelimiters;
	
	if(ca.findTagNames && node.isElement() )
	{
		for(var i=0; i<ca.findTagNames.length; i++)
		{
			if(node.tagName.toUpperCase()==ca.findTagNames[i].toUpperCase())
			{
				for(var j=0; j<ca.foundTagNames.length; j++)
				{
					if(ca.foundTagNames[j]==node)
					{
						break;
					}
				}
				if(j==ca.foundTagNames.length)
				{
					ca.foundTagNames[ca.foundTagNames.length]=node;
					break;
				}
			}
		}
		
	}
	
	numDelimiters=ca.inlineEdgeNodes.length;
	
	var isEdge; 
	console.log("------------------------------------------------------------------------");
	if(node.isEmpty() || !node.isInline() )
	{
		isEdge=false;
	}
	else
	{
		if(node.isText())
		{
			isEdge=(!close && offset<node.textContent.length) || (close && offset>0);
		}
		else
		{
			isEdge=(!close && offset==0) || (close && offset==node.childNodes.length);
		}
	}
	
	console.logNode(node,"("+offset+")", close, "Callback "+(isEdge?"edge ":"")+(endVisit?" end visit ":"")+" "+ca.openNodes+", ");
	
	if(isEdge)
	{
		if(!close)
		{
			ca.openNodes++;
			ca.startOffsetsStack.push(offset);
			return;
		}
		else
		{
			if(ca.openNodes<=0)
			{
				console.log("Close element open outside selection");
			}
			else
			{
				var startOffset=ca.startOffsetsStack.pop();
				ca.openNodes--;
				
				if(ca.openNodes<ca.openNodesDepth)
				{
					console.log("Set as START "+startOffset);
					if(ca.startNewEdge)
					{
						console.log("Set null START to something");
						ca.inlineEdgeNodes[numDelimiters]={"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastEndNode": null, "lastEndOffset": -1};
						numDelimiters++;
						ca.startNewEdge=false;
					}
					ca.inlineEdgeNodes[numDelimiters-1].startNode=node;
					ca.inlineEdgeNodes[numDelimiters-1].startOffset=startOffset;
					ca.openNodesDepth=ca.openNodes;
				}

				ca.inlineEdgeNodes[numDelimiters-1].lastEndNode=node;
				ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset=offset;
				console.log("Set as LAST "+offset);
				//console.log("Last used offset="+ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset);
			}
		}
	}
	
	if(endVisit || !node.isInline() )
	{
		if(!ca.startNewEdge)
		{
			ca.inlineEdgeNodes[numDelimiters-1].endNode=ca.inlineEdgeNodes[numDelimiters-1].lastEndNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;
			console.log("Set as END");
			if(!endVisit)
			{
				ca.startNewEdge=true;
				ca.openNodes=0;
				ca.openNodesDepth=10000;
				//console.log("Start new eddge");
			}
			console.log("End edge: "+numDelimiters);
			console.logNode(ca.inlineEdgeNodes[numDelimiters-1].startNode, "("+ca.inlineEdgeNodes[numDelimiters-1].startOffset+")", true, "Start edge node:" );
			console.logNode(ca.inlineEdgeNodes[numDelimiters-1].endNode, "("+ca.inlineEdgeNodes[numDelimiters-1].endOffset+")", true, "End edge node:" );
		}
		return;
	}
}
/*
function EditableContent_collectTextNodes(node, close, endVisit, ca, startOffset, endOffset)
{	
	var numDelimiters, isInlineNode;
	
	if(ca.findTagNames && node.isElement() )
	{
		for(var i=0; i<ca.findTagNames.length; i++)
		{
			if(node.tagName.toUpperCase()==ca.findTagNames[i].toUpperCase())
			{
				for(var j=0; j<ca.foundTagNames.length; j++)
				{
					if(ca.foundTagNames[j]==node)
					{
						break;
					}
				}
				if(j==ca.foundTagNames.length)
				{
					ca.foundTagNames[ca.foundTagNames.length]=node;
					break;
				}
			}
		}
		
	}
	
	numDelimiters=ca.inlineEdgeNodes.length;
	
	//console.log("------------------------------------");
		
	if(node.isInline() && this.nodeHasContentAtOffset(node, startOffset, !close))
	{
		//console.logNode(node, "("+startOffset+")", close);
		//console.log("Stack: "+ca.openNodes+" / "+ca.openNodesDepth);


		if(!close)
		{
			//console.log("Open");
			ca.openNodes++;

			return;
		}
		if(ca.openNodes<=0)
		{
			//console.log("Close element open outside selection");
			return;
		}
		
		ca.openNodes--;

		if(ca.openNodes<ca.openNodesDepth)
		{
			//console.log("Set as Start");
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

		ca.inlineEdgeNodes[numDelimiters-1].lastEndNode=node;
		ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset=startOffset;
		//console.log("Last used offset="+ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset);
	}
	
	if(endVisit || !node.isInline() )
	{
		if(!ca.startNewEdge)
		{
			ca.inlineEdgeNodes[numDelimiters-1].endNode=ca.inlineEdgeNodes[numDelimiters-1].lastEndNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;
		
			if(!endVisit)
			{
				ca.startNewEdge=true;
				ca.openNodes=0;
				ca.openNodesDepth=10000;
				//console.log("Start new eddge");
			}
			//console.log("End edge: "+numDelimiters);
			//console.logNode(ca.inlineEdgeNodes[numDelimiters-1].startNode, "("+ca.inlineEdgeNodes[numDelimiters-1].startOffset+")", true, "Start edge node:" );
			//console.logNode(ca.inlineEdgeNodes[numDelimiters-1].endNode, "("+ca.inlineEdgeNodes[numDelimiters-1].endOffset+")", true, "End edge node:" );
		}
		return;
	}
}
*/