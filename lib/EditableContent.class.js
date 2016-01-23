const ERR_RANGE_COLLAPSED=500;

function EditableContent(iframe)//always an iframe, need edited doc CSS in their own space
{
	this.window=iframe.contentWindow;
	this.documentContainer=this.window.document.getElementById("EditableContentCanvas");
	this.mutationHistory=new MutationHistory(this.documentContainer, true);
	this.mutationHistory.observe(this.documentContainer);
	this.addScripts();
}

const MUTATION_HISTORY_RANGE_BEFORE=0; //EditableContent.mutationHistoryRanges[0]
const MUTATION_HISTORY_RANGE_AFTER=1; //EditableContent.mutationHistoryRanges[1]

with(EditableContent)
{
	prototype.window=null;
	prototype.documentContainer=null;
	prototype.mutationHistory=null;
	prototype.mutationHistoryRanges=[[],[]];
	prototype.___notBreakableTagNames=["OL", "UL", "LI", "TABLE", "TBODY", "THEAD", "TH", "TR", "TD"];
	
	
	prototype.addScripts=EditableContent_addScripts;
	prototype.getRange=HtmlEditor_getRange;
	prototype.setSelectionBeforeAndAfter=EditableContent_setSelectionBeforeAndAfter;
	prototype.setMutationHistoryRange=EditableContent_setMutationHistoryRange;
	prototype.restoreMutationHistoryRange=EditableContent_restoreMutationHistoryRange;
	prototype.undo=EditableContent_undo;
	prototype.redo=EditableContent_redo;
	prototype.visitSelectedNodes=EditableContent_visitSelectedNodes;
	prototype.isTagBreakable=EditableContent_isTagBreakable;
	prototype.surroundNodes=EditableContent_surroundNodes;
	prototype.getInlineNodesEdges=EditableContent_getInlineNodesEdges;
	prototype.getElementNotAllowedDescendants=EditableContent_getElementNotAllowedDescendants;
	prototype.collectNotAllowedDescendants=EditableContent_collectNotAllowedDescendants;
	prototype.getNotAllowedAncestors=EditableContent_getNotAllowedAncestors;
	prototype.surroundTextNodes=EditableContent_surroundTextNodes;
	EditableContent.prototype.collectTransparentContentEdges=EditableContent_collectTransparentContentEdges;
	prototype.collectContentEdges=EditableContent_collectContentEdges;
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
function EditableContent_setSelectionBeforeAndAfter(startContainer, startOffset, endContainer, endOffset)
{
	var range;
	
	this.window.getSelection().removeAllRanges();
	range=this.getRange();

	
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
	
	this.window.getSelection().addRange(range);
}
function EditableContent_setMutationHistoryRange(index)
{
	var range;
	var mutationBatchIndex;
	
	
	range=this.getRange();
	
	mutationBatchIndex=this.mutationHistory.mutationsBatchIndex+1;
	
	this.mutationHistoryRanges[index][mutationBatchIndex]={"startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset};
}
function EditableContent_restoreMutationHistoryRange(index)
{
	var mutationBatchIndex;
	
	mutationBatchIndex=this.mutationHistory.mutationsBatchIndex+(index==MUTATION_HISTORY_RANGE_AFTER?0:1);
	if(!this.mutationHistoryRanges[index][mutationBatchIndex])
	{
		return;
	}
	
	this.setSelectionBeforeAndAfter(this.mutationHistoryRanges[index][mutationBatchIndex].startContainer, 
									this.mutationHistoryRanges[index][mutationBatchIndex].startOffset,
									this.mutationHistoryRanges[index][mutationBatchIndex].endContainer, 
									this.mutationHistoryRanges[index][mutationBatchIndex].endOffset );
}
function EditableContent_undo()
{	
	this.mutationHistory.undo();
	this.restoreMutationHistoryRange(MUTATION_HISTORY_RANGE_BEFORE);
}
function EditableContent_redo()
{
	this.mutationHistory.redo();
	this.restoreMutationHistoryRange(MUTATION_HISTORY_RANGE_AFTER);
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
			
			callbackArguments.startNode=node;
			callbackArguments.startOffset=offset;
			callbackArguments.endNode=endContainer;
			callbackArguments.endOffset=endOffset;
		}
	}
	
	var closeOffset, endVisit, skipChildNodes=false;
	
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
		try
		{
			callback[0][callback[1]](node, offset, false, false, callbackArguments);
		}
		catch(err)
		{
			if(err.code==ERR_SKIP_CHILD_NODES)
			{
				skipChildNodes=true;
			}
			else
			{
				throw err;
			}
		}
	}
	
	if(!skipChildNodes && node.hasChildNodes())
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
function EditableContent_isTagBreakable(tagName)
{
	for(var i=0; i<EditableContent.prototype.___notBreakableTagNames.length; i++)
	{
		if(tagName==EditableContent.prototype.___notBreakableTagNames[i])
		{
			return false;
		}
	}
	
	return true;
}
EditableContent.prototype.splitNodeAtDescendant=EditableContent_splitNodeAtDescendant;
function EditableContent_splitNodeAtDescendant(node, descendant, offset, toLeft, splitNode)
{
	var splitNodes, newNodePosition;
	
	splitNodes=node.splitChildAtDescendant(descendant, offset, toLeft, splitNode);
	
	newNodePosition=toLeft?"left":"right";
	
	if(splitNodes[newNodePosition] && splitNodes[newNodePosition].isEmpty())
	{
		splitNodes[newNodePosition].parentNode.removeChild(splitNodes[newNodePosition]);
	}
	
	return splitNodes[toLeft?"right":"left"];
}
function EditableContent_surroundNodes(tagName, startNode, startOffset, endNode, endOffset)
{
	var commonAncestorNode, startEdgeNode;
	var endEdgeNode, endEdgeRightNode;
	
	var splitStart, splitStartOffset, splitEnd, splitEndOffset;
	
	commonAncestorNode=startNode.getCommonAncestor(endNode);
		
	if(startNode.isElement() && startNode.parentNode==commonAncestorNode)
	{
		if(startNode.parentNode==commonAncestorNode)
		{
			splitStart=startNode;
			splitStartOffset=startOffset;
		}
		else
		{
			
		}
	}
	else
	{
		if(startNode.isElement())
		{
			splitStart=startNode.parentNode;
			splitStartOffset=startNode.getIndex();
		}
		else
		{
			splitStart=startNode;
			splitStartOffset=startOffset;
		}
		
		splitStart=this.splitNodeAtDescendant(commonAncestorNode, splitStart, splitStartOffset, true, false);
		
	}
	
	if(endNode.isElement() && endNode.parentNode==commonAncestorNode)
	{
		splitEnd=endNode;
		splitEndOffset=endOffset;
	}
	else
	{
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
		splitEnd=this.splitNodeAtDescendant(commonAncestorNode, splitEnd, splitEndOffset, false, false);
		
	}
	var containerElement=this.window.document.createElement(tagName);
	
	commonAncestorNode.insertBefore(containerElement, splitStart);
	
	var startIndex=splitStart.getIndex();

	//for( ; commonAncestorNode.childNodes[startIndex]!=splitEnd; )
	for( ; ; )
	{
		if(commonAncestorNode.childNodes[startIndex]==splitEnd)
		{
			containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
			break;
		}
		containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
	}
	

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
}
function EditableContent_collectNotAllowedDescendants(node, offset, close, endVisit, ca /*callbackArguments*/)
{
	if(!close &&  node!=ca.topNode)
	{
		for(var i=0; i<ca.findTagNames.length; i++)
		{
			if(node.tagName==ca.findTagNames[i])
			{
				ca.notAllowedNodes[ca.notAllowedNodes.length]=node;
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
function EditableContent_getNotAllowedAncestors(element, tagNames)
{
	var ascendant, notAllowedAscendants=[];
	if(typeof tagNames!="object")
	{
		tagNames=[tagNames];
	}
	
	for(ascendant=element.parentNode; ascendant!=this.documentContainer; ascendant=ascendant.parentNode)
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
				break;
			}
		}
	}
	return notAllowedAscendants;
}
function EditableContent_surroundTextNodes(tagName, tagAttributes, select, node, offset, rangeEndContainer, rangeEndOffset)
{
	var args, containers;
	var outerTagCategory;
	var i, j, k;
	
	outerTagCategory=Node.prototype.___getTagCategory(tagName);
	
	try
	{
		args=this.getInlineNodesEdges(node, offset, rangeEndContainer, rangeEndOffset, null, tagName);
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
	
	this.setMutationHistoryRange(MUTATION_HISTORY_RANGE_BEFORE);
	containers=[];
	
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
	var notAllowedChildNodes, notAllowedAncestors;
	
	for(i=0; i<containers.length; i++)
	{
		//continue;
		notAllowedChildNodes=this.getElementNotAllowedDescendants(containers[i], containers[i].tagName);
		
		//for each container remove not allowd child nodes outside them
		// and remove the childnodes
		//eg, after formatting with a <h1>:
		// <h1><p> a paragraph </p></h1> -> <h1> a paragraph </h1>
		for(j=0; j<notAllowedChildNodes.length; j++)
		{
			notAllowedChildNodes[j].moveContentBefore();
			notAllowedChildNodes[j].parentNode.removeChild(notAllowedChildNodes[j]);
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
		notAllowedAncestors=this.getNotAllowedAncestors(containers[i], containers[i].tagName);
		
		
		for(j=0; j<notAllowedAncestors.length; j++)
		{
			//third param of splitChildAtDescendant:
			// when true, hte new node is created at left, so notAllowedAncestors[j] remain at right;
			//when false, the new node is created at right, so notAllowedAncestors[j] remains at left
						
			if(!this.isTagBreakable(notAllowedAncestors[j].tagName))
			{
				continue;
			}
			
			this.splitNodeAtDescendant(notAllowedAncestors[j], containers[i], 0, true, true);
			
			this.splitNodeAtDescendant(notAllowedAncestors[j], containers[i], containers[i].childNodes.length, false, true);
			
			notAllowedAncestors[j].moveContentBefore();
			notAllowedAncestors[j].parentNode.removeChild(notAllowedAncestors[j]);
			
			
		}
	}
	if(select && containers.length>0)
	{
		this.setSelectionBeforeAndAfter(containers[0], 0, containers[containers.length-1], containers[containers.length-1].childNodes.length);
	}
	this.setMutationHistoryRange(MUTATION_HISTORY_RANGE_AFTER);

	return containers;
}

function EditableContent_getInlineNodesEdges(startNode, startOffset, endNode, endOffset, ca/*callback arguments*/, outerTagName)
{
	
	var range=this.getRange();
	if(range.collapsed && !startNode && !endNode)
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
	ca.notClosed=[];
	ca.forceAllow=false;
	
	/*
	if(Node.prototype.___tagHasTransparentContent(outerTagName))
	{
		console.log("Collect transparent content");
		this.visitSelectedNodes([this, "collectTransparentContentEdges"], 
						ca,
						startNode, startOffset, endNode, endOffset);
	}
	else*/
	{
		
		ca.collectNotAllowedNodes=!Node.prototype.___tagIsPhrasingContent(outerTagName);
		this.visitSelectedNodes([this, "collectContentEdges"], 
						ca,
						startNode, startOffset, endNode, endOffset);
	}
	return ca;
}
function EditableContent_collectTransparentContentEdges(node, offset, close, endVisit, ca /*callbackArguments*/)
{
	
	
	//in exemplele de mai jos se foloseste tagul <A>
	//ce noduri NU sint acceptate (in sensul ca vor determina inchiderea linkului si deschiderea altuia nou)
	// - nod ne-phrasabil care nu a fost deschis in interiorul selectiei:
	//ex. selectie: text</SPAN> continuare paragraf</P> text dupa paragraf
	//dupa creare link:  <A><SPAN>text</SPAN> continuare paragraf</A></P><A> text dupa paragraf</A>
	// - nod ne-phrasabil, deschis si inchis in interiorul selectiei, dar care, daca este folosit ca endContent pentru insertie, nu ar fi acceptat
	// - noduri "not breakable" (de ex. UL, LI, TABLE, TD etc)
		
	
}
/**
 * 
 * EditableContent.collectContentEdges
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
EditableContent.prototype.collectNotPhrasingNodes=EditableContent_collectNotPhrasingNodes;
function EditableContent_collectNotPhrasingNodes(node, offset, close, endVisit, ca)
{
	if(!node.isText() && !node.isPhrasingContent())
	{
		ca.notPhrasingNodes[ca.notPhrasingNodes.length]=node;
	}
}
function EditableContent_collectContentEdges(node, offset, close, endVisit, ca )
{
	var numDelimiters, tagAllowed;
	var tagAllowed=false;
	var isBreakable=node.isText() ? true : this.isTagBreakable(node.tagName);
	var skipChildNodes=false;
	//console.logNode(node, "", close);
	
	if(node==this.documentContainer && !close)
	{
		return;
	}
	
	numDelimiters=ca.inlineEdgeNodes.length;
	if(!ca.forceAllow)
	{
		if(Node.prototype.___tagHasTransparentContent(ca.outerTagName))
		{
			ca.collectNotAllowedNodes=false;
			//console.log("Transparent");
			if(!node.isText() && !node.isPhrasingContent())
			{
				var commonAncestor;

				if(!close && offset==0)
				{
					
					if(numDelimiters==0 || !ca.inlineEdgeNodes[numDelimiters-1] || !ca.inlineEdgeNodes[numDelimiters-1].startNode)
					{
						tagAllowed=true;
						console.logNode(node, "", close, "ALLOWED");
						//console.log("Allowed");
					}
					else
					if(node.getCategory() & ALL_CONTENT)
					{
						commonAncestor=ca.inlineEdgeNodes[numDelimiters-1].startNode.getCommonAncestor(node);
						if (tagAllowed=node.isAllowedInNode(commonAncestor))
						{
							if(node.compareDocumentPosition(ca.endNode) & Node.DOCUMENT_POSITION_CONTAINED_BY)
							{
								console.log("Contains");
								tagAllowed=false;
							}
							else
							{
								console.log("Doesn't contain");
								//alert(isBreakable+":"+node.tagName)
								//isBreakable=true;
							}
						}
					}
					if(ca.forceAllow=tagAllowed)
					{
						ca.startOffsetsStack.push(offset);
						throw new CustomError(ERR_SKIP_CHILD_NODES);
					}
					//console.logNode(node);
					//console.log(node.compareDocumentPosition(ca.endNode)+"=="+Node.DOCUMENT_POSITION_CONTAINED_BY);
				}
			}
			else
			{
				tagAllowed=true;
			}
		}
		else
		{
			tagAllowed=node.isAllowedInTag(ca.outerTagName);
		}
	}
	else
	{
		console.logNode(node, "", close, "Force allow: ");
		tagAllowed=true;
		isBreakable=true;
		ca.forceAllow=false;
	}
	//console.log("--------------------------------------");
	
	
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
	//console.log("ca.startOffsetsStack="+ca.startOffsetsStack.length);
	if(isEdge)
	{
		if(!close)
		{
			//ca.openNodes++;
			ca.startOffsetsStack.push(offset);
			//console.log("Open tag");
			//console.log("-------------------------------------------------------------------------------------------------------------------------------------");
			return;
		}
		else
		{
			if(ca.startOffsetsStack.length==0)
			{
				//Close element open outside selection
				//console.log("Close element open outside selection");
			}
			else
			{
				var startOffset=ca.startOffsetsStack.pop();
				//ca.openNodes--;
				//console.log("Close tag");
				if(ca.startOffsetsStack.length<ca.openNodesDepth)
				{
					if(ca.startNewEdge)
					{
						//console.log("Create start");
						ca.inlineEdgeNodes[numDelimiters]={"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastEndNode": null, "lastEndOffset": -1};
						numDelimiters++;
						ca.startNewEdge=false;
					}
					//console.log("Set start");
					ca.inlineEdgeNodes[numDelimiters-1].startNode=node;
					ca.inlineEdgeNodes[numDelimiters-1].startOffset=startOffset;
					ca.openNodesDepth=ca.startOffsetsStack.length;
				}
				//console.log("Set last used: ");
				ca.inlineEdgeNodes[numDelimiters-1].lastEndNode=node;
				ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset=offset;
			}
		}
	}
	if(endVisit || (!tagAllowed && !ca.collectNotAllowedNodes) || !isBreakable)
	{
		if(!ca.startNewEdge)
		{
			//console.log("Set end: "+(endVisit +"||"+ (!tagAllowed && !ca.collectNotAllowedNodes) +"||"+ !isBreakable));
			ca.inlineEdgeNodes[numDelimiters-1].endNode=ca.inlineEdgeNodes[numDelimiters-1].lastEndNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;

			if(!endVisit)
			{
				//console.log("ca.startNewEdge=true;");
				ca.startNewEdge=true;
				ca.startOffsetsStack=[];
				//ca.openNodes=0;
				ca.openNodesDepth=10000;
			}
		}
		//return;
	}
	//console.log("-------------------------------------------------------------------------------------------------------------------------------------");
}
