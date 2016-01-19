const ERR_RANGE_COLLAPSED=500;

function EditableContent(iframe)//always an iframe, need edited doc CSS in their own space
{
	this.window=iframe.contentWindow;
	this.mutationHistory=new MutationHistory(this.window.document.body, true);
	this.mutationHistory.observe(this.window.document.body);
	this.addScripts();
}

with(EditableContent)
{
	prototype.window=null;
	prototype.mutationHistory=null;
	prototype.addScripts=EditableContent_addScripts;
	prototype.getRange=HtmlEditor_getRange;
	prototype.setSelectionBeforeAndAfter=EditableContent_setSelectionBeforeAndAfter;
	prototype.surroundNode=EditableContent_surroundNode;
	
	
	
	prototype.visitSelectedNodes=EditableContent_visitSelectedNodes;
	prototype.surroundNodes=EditableContent_surroundNodes;
	prototype.getInlineNodesEdges=EditableContent_getInlineNodesEdges;
	prototype.nodeHasContentAtOffset=EditableContent_nodeHasContentAtOffset;
	prototype.getElementNotAllowedDescendants=EditableContent_getElementNotAllowedDescendants;
	prototype.collectNotAllowedDescendants=EditableContent_collectNotAllowedDescendants;
	prototype.getNotAllowedAscendants=EditableContent_getNotAllowedAscendants
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
	
	if(!node)
	{
		//Visit selection, first call
		var range=this.getRange();
		
		node=range.startContainer;
		offset=range.startOffset;
		
		endContainer=range.endContainer;
		endOffset=range.endOffset;
	}
	
	if(!this.visitSelectedNodes.endContainer)
	{
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
		callback[0][callback[1]](node, closeOffset, true, endVisit, callbackArguments);		
	}
	if(endVisit)
	{
		this.visitSelectedNodes.endContainer=null;
		this.visitSelectedNodes.endOffset=-1;
		return true;
	}
	if(visitSiblings)
	{
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
function EditableContent_surroundNodes(tagName, startNode, startOffset, endNode, endOffset)
{
	var commonAncestorNode, startEdgeNode;
	var endEdgeNode, endEdgeRightNode;
	
	var splitStart, splitStartOffset, splitEnd, splitEndOffset;
	
	commonAncestorNode=startNode.getCommonAncestor(endNode);
		
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
		
	if(splitStart==splitEnd)
	{
		splitEndOffset-=splitStartOffset;
	}
	
	if(!(splitEnd=commonAncestorNode.splitChildAtDescendant(splitEnd, splitEndOffset, false)))//returns he new created node(s) which are at right
	{
		splitEnd=endNode.nextSibling;
	}
		
	var startIndex=splitStart.getIndex();
	var containerElement=this.window.document.createElement(tagName);
	
	//return;
	
	for( ; commonAncestorNode.childNodes[startIndex]!=splitEnd; )
	{
		containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
	}
	commonAncestorNode.insertBefore(containerElement, splitEnd);
	
	return containerElement;
}
function EditableContent_getElementNotAllowedDescendants(element, tagNames)
{
	var ca;
	if(!ca)
	{
		ca={};
	}
	ca.notAllowedNodes=[];
	ca.topNode=element;
	ca.outerTagName=element.tagName;//outerTagName.toUpperCase();
	ca.findTagNames=typeof tagNames!="object" ? [tagNames]:tagNames;
	
	this.visitSelectedNodes([this, "collectNotAllowedDescendants"], 
						ca,
						element, 0, element, element.childNodes.length);
						
	return ca.notAllowedNodes;
	
	for(var i=0; i<ca.notAllowedNodes.length; i++)
	{
		console.logNode(ca.notAllowedNodes[i]);
	}
	
	return ca;
	
	var elementNotAllowedChildNodes=[];
	
	for(var i=0; i<element.childNodes.length; i++)
	{
		if(element.childNodes[i].isText())
		{
			continue;
		}
		//console.log("Allow "+element.childNodes[i].tagName+" in "+element.tagName+" ? ");//+element.childNodes[i].isAllowedInNode(element));
		if(!element.childNodes[i].isAllowedInNode(element))
		{
			elementNotAllowedChildNodes[elementNotAllowedChildNodes.length]=element.childNodes[i];
		}
	}
	return elementNotAllowedChildNodes;
}
function EditableContent_collectNotAllowedDescendants(node, offset, close, endVisit, ca /*callbackArguments*/)
{
	console.logNode(node);
	if(!close &&  node!=ca.topNode)
	{
		for(var i=0; i<ca.findTagNames.length; i++)
		{
			if(node.tagName==ca.findTagNames[i])
			{
				ca.notAllowedNodes[ca.notAllowedNodes.length]=node;
				//console.logNode(node, "", close, "AXXAtor "+ca.findTagNames[i]);
				return;
			}
		}
	}
	if(close || node==ca.topNode || (node.getContentCategory() & TRANSPARENT_CONTENT ) || node.isAllowedInNode(ca.topNode))
	{
		return;
	}
	
	ca.notAllowedNodes[ca.notAllowedNodes.length]=node;
}
function EditableContent_getNotAllowedAscendants(element, tagNames)
{
	var ascendant, notAllowedAscendants=[];
	if(typeof tagNames!="object")
	{
		tagNames=[tagNames];
	}
	
	for(ascendant=element.parentNode; ascendant!=element.ownerDocument.body; ascendant=ascendant.parentNode)
	{
		if(!element.isAllowedInNode(ascendant))
		{
			notAllowedAscendants[notAllowedAscendants.length]=ascendant;
			continue;
		}
		for(var i=0; i<tagNames.length; i++)
		{
			
			if(ascendant.tagName==tagNames[i])
			{
				notAllowedAscendants[notAllowedAscendants.length]=ascendant;
				continue;
			}
		}
	}
	return notAllowedAscendants;
}
function EditableContent_surroundTextNodes(tagName, inline, tagAttributes, select, node, offset, rangeEndContainer, rangeEndOffset)
{
	var args, containers;
	var outerTagCategory;
	var i, j;
	
	outerTagCategory=Node.prototype.___getTagCategory(tagName);
	
	//console.log(tagName+" category: "+outerTagCategory);
	
	try
	{
		args=this.getInlineNodesEdges(node, offset, rangeEndContainer, rangeEndOffset, null, tagName, inline);
	}
	catch(err)
	{
		switch(err.code)
		{
			case ERR_RANGE_COLLAPSED:
				return;
			default:
				throw err;
		}
	}
	containers=[];
	
	if((outerTagCategory & PHRASING_CONTENT)==0)
	{
		args.inlineEdgeNodes=[{ "startNode": args.inlineEdgeNodes[0].startNode, "startOffset": args.inlineEdgeNodes[0].startOffset, "endNode": args.inlineEdgeNodes[args.inlineEdgeNodes.length-1].endNode,"endOffset": args.inlineEdgeNodes[args.inlineEdgeNodes.length-1].endOffset}];
	}
	
	for(i=0; i<args.inlineEdgeNodes.length; i++)
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
			containers[containers.length-1][tagAttributeName]=tagAttributes[tagAttributeName];
		}
	}
	var notAllowedChildNodes, notAllowedAscendants;
	
	for(i=0; i<containers.length; i++)
	{
		
		notAllowedChildNodes=this.getElementNotAllowedDescendants(containers[i], containers[i].tagName);
			
		//for each container remove not allowd child nodes outside them
		// and remove the childnodes
		//eg, after formatting with a <h1>:
		// <h1><p> a paragraph </p></h1> -> <h1> a paragraph </h1>
		for(j=0; j<notAllowedChildNodes.length; j++)
		{
			console.log("Remove "+notAllowedChildNodes[i].tagName+" from "+containers[i].tagName);
		//	try
			{
				notAllowedChildNodes[j].moveContentBefore();
				notAllowedChildNodes[j].parentNode.removeChild(notAllowedChildNodes[j]);
			}
		//	catch(err)
			{
				//the child node was not a direct child of container, but a descendant (chidl of a child)
			}
		}
		
		
		//split ascedants that are not allowed and remove the part that surrounds new created node
		//after splittings
		//eg, initial:
		// <h2>Some <b>bold</b> heading</h2>
		//Then create a <h1> around "ol":
		// <h2>Some <b>b<h1>ol</h1>d</b> heading</h2>
		// First split the <h2> and <b> tags:
		// <h2>Some <b>b</b></h2><h2><b><h1>ol</h1></b></h2><h2><b>d</b> heading</h2>
		// Then, remove the <h2> and <B> that sorrounds the <H1>:
		// <h2>Some <b>b</b></h2><h1>ol</h1><h2><b>d</b> heading</h2>
		notAllowedAscendants=this.getNotAllowedAscendants(containers[i], containers[i].tagName);
		
		for(j=0; j<notAllowedAscendants.length; j++)
		{
			//console.log("Remove "+containers[i].tagName+" from "+notAllowedAscendants);
			//consoleL.logNode(notAllowedAscendants[j], "", false, "Not allowed ascendant: ");
			//third param of splitChildAtDescendant:
			// when true, hte new node is created at left, so notAllowedAscendants[j] remain at right;
			//when false, the new node is created at right, so notAllowedAscendants[j] remains at left
			console.logNode(notAllowedAscendants[j], "", false, "AICI:");
			if(notAllowedAscendants[j].isPhrasingContent())
			{
				notAllowedAscendants[j].moveContentBefore();
				notAllowedAscendants[j].parentNode.removeChild(notAllowedAscendants[j]);
			}
			else
			{
				notAllowedAscendants[j].splitChildAtDescendant(containers[i], 0, true, true);
				notAllowedAscendants[j].splitChildAtDescendant(containers[i], containers[0].childNodes.length, false, true);
				notAllowedAscendants[j].moveContentBefore();
				notAllowedAscendants[j].parentNode.removeChild(notAllowedAscendants[j]);
			}
			console.log("--------------------------");
		}
	}
	if(select)
	{
		this.setSelectionBeforeAndAfter(containers[0], containers[containers.length-1]);
	}
	return containers;
}

function EditableContent_getInlineNodesEdges(startNode, startOffset, endNode, endOffset, ca/*callback arguments*/, outerTagName, inline)
{
	var range=this.getRange();
	if(range.collapsed)
	{
		throw new CustomError(ERR_RANGE_COLLAPSED);
	}
	if(!ca)
	{
		ca={};
	}
	ca.inlineEdgeNodes=[];
	ca.openNodes=0;
	ca.openNodesDepth=10000;
	ca.outerTagName=outerTagName.toUpperCase();
	//ca.notAllowedNodes=[];
	ca.startNewEdge=true;
	ca.startOffsetsStack=[];
	ca.allowSameTag=false;
	
	this.visitSelectedNodes([this, "collectTextNodes"], 
						ca,
						startNode, startOffset, endNode, endOffset);
	//console.log("--------------------");
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
	var numDelimiters, tagAllowed;
	var tagAllowed=false;
	
	
	try
	{
		//console.log(ca.outerTagName);
		/*
		if(!ca.allowSameTag && node.isElement() && node.tagName==ca.outerTagName)
		{
			
			tagAllowed=false;
		}
		else
		{
			tagAllowed=node.isAllowedInTag(ca.outerTagName);
		}
		*/
	   //node.hasTransparentContent()
		tagAllowed=Node.prototype.___tagHasTransparentContent(ca.outerTagName) || node.isAllowedInTag(ca.outerTagName);
	}
	catch(err)
	{
		if(err.code==ERR_INNER_TRANSPARENT_CONTENT)
		{
			tagAllowed=true; //<A>, <DEL>, <INS> if they contain elements that are not allowd within outerTagName, these elements will be removed anyway by EditableContent.surroundTextNodes
		}
	}
	
	console.logNode(node, "", close, "AICI: "+tagAllowed+", ");
	numDelimiters=ca.inlineEdgeNodes.length;
	
	var isEdge; 
	
	if(node.isEmpty() || !tagAllowed )
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
				//Close element open outside selection
			}
			else
			{
				var startOffset=ca.startOffsetsStack.pop();
				ca.openNodes--;
				
				if(ca.openNodes<ca.openNodesDepth)
				{
					if(ca.startNewEdge)
					{
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
			}
		}
	}
	
	if(endVisit || !tagAllowed)
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
			}
		}
		return;
	}
}