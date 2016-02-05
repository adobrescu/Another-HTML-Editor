function SimpleRange(startContainer, startOffset, endContainer, endOffset)
{
	this.startContainer=startContainer;
	this.startOffset=startOffset;
	this.endContainer=endContainer;
	this.endOffset=endOffset;
}
with(SimpleRange)
{
	prototype.startContainer=null;
	prototype.startOffset=null;
	prototype.endContainer=null;
	prototype.endOffset=null;
}
function MutationHistory(target, serializedHistory, selectionChangeObserver)
{
	
	MutationHistory.prototype.___instances[MutationHistory.prototype.___numInstances]=this;
	
	this.target=target;
	
	if(serializedHistory)
	{
		this.restoreSerializedHistory(serializedHistory);
	}
	
	
	this.mutationObserver=new MutationObserver(new Function("mutations", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onDOMMutations(mutations)" ));
	this.mutationObserverConfig={attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true};
	this.selectionChangeObserver=selectionChangeObserver;
	
	
	for(var i=0; i<MutationHistory.prototype.___onSelectionChangeEvents.length; i++)
	{
		this.target.addEventListener(MutationHistory.prototype.___onSelectionChangeEvents[i], new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChanged(evt)" ), false);
	}
	
	this.target.addEventListener("mousedown", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onMouseDown(evt)" ), false);
	
	this.instanceNum=MutationHistory.prototype.___numInstances;
	
	MutationHistory.prototype.___numInstances++;
	
	
}
with(MutationHistory)
{
	prototype.___numInstances=0;
	prototype.___instances=[];
	prototype.___onSelectionChangeEvents=["dragend", "mouseup", "keypress", "keyup", "paste", "cut", "drop"];
	
	prototype.instanceNum=-1;
	prototype.target=null;
	prototype.mutationObserver=null;
	prototype.mutationObserverConfig=null;
	prototype.mutationBatches=[];
	prototype.mutationsBatchIndex=-1;
	prototype.nextMutationBatchType=-1;
	prototype.nextMutationBatchMessage="";
	prototype.numIDs=0;
	prototype.removedNodesContainer=null;
	prototype.selectionChangeObserver=null;
	prototype.lastRangeBeforeDOMChanges={"startContainer": null, "startOffset": -1, "endContainer": null, "endOffset": -1};
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
	
	prototype.startMutationsBatch=MutationHistory_startMutationsBatch;
	prototype.onDOMMutations=MutationHistory_onDOMMutations;
	
	
	prototype.setStyleAttribute=MutationHistory_setStyleAttribute;
	
	prototype.undoAll=MutationHistory_undoAll;
	prototype.redoAll=MutationHistory_redoAll;
	
	prototype.undo=MutationHistory_undo;
	prototype.redo=MutationHistory_redo;
	
	prototype.addNodes=MutationHistory_addNodes;
	prototype.removeNodes=MutationHistory_removeNodes;
	
	prototype.undoChildList=MutationHistory_undoChildList;
	prototype.undoAttributes=MutationHistory_undoAttributes;
	prototype.undoCharacterData=MutationHistory_undoCharacterData;
	
	prototype.redoChildList=MutationHistory_redoChildList;
	prototype.redoAttributes=MutationHistory_redoAttributes;
	MutationHistory.prototype.stringsDiff=MutationHistory_stringsDiff;
	prototype.spliceTextNodeTextContent=MutationHistory_spliceTextNodeTextContent;
	prototype.redoCharacterData=MutationHistory_redoCharacterData;
	
	prototype.setNextMutationBatchType=MutationHistory_setNextMutationBatchType;
	prototype.removeLastMutationBatchesByType=MutationHistory_removeLastMutationBatchesByType;
	
	prototype.serialize=MutationHistory_serialize;
	prototype.setMutationNodeID=MutationHistory_setMutationNodeID;
	
	prototype.restoreSerializedHistory=MutationHistory_restoreSerializedHistory;
	prototype.serializeMutation=MutationHistory_serializeMutation;
	prototype.serializeMutationNode=MutationHistory_serializeMutationNode;
	prototype.restoreSerializedMutation= MutationHistory_restoreSerializedMutation;
	prototype.restoreSerializedMutationNode= MutationHistory_restoreSerializedMutationNode;
		
	prototype.getRange=MutationHistory_getRange;
	prototype.setRange=MutationHistory_setRange;
	prototype.handleOnSelectionChanged=MutationHistory_handleOnSelectionChanged;
	prototype.onSelectionChanged=MutationHistory_onSelectionChanged;
	prototype.onMouseDown=MutationHistory_onMouseDown;
	
}
function MutationHistory_observe(target)
{
	this.mutationObserver.observe(target?target:this.target, this.mutationObserverConfig);
}
function MutationHistory_disconnect()
{
	this.mutationObserver.disconnect();
}
function MutationHistory_startMutationsBatch()
{
	//this.mutationsBatchIndex++;
}

function MutationHistory_onDOMMutations(mutations)
{
	
	var mutationsBatchIndex=this.mutationBatches.length;
	var i, j;
	
	this.mutationsBatchIndex++;
	
	if(this.mutationsBatchIndex<this.mutationBatches.length-1)
	{
		this.mutationBatches.splice(this.mutationsBatchIndex+1, this.mutationBatches.length-this.mutationsBatchIndex+1);
	}
	
	if(typeof(this.mutationBatches[this.mutationsBatchIndex])=="undefined")
	{
		this.mutationBatches[this.mutationsBatchIndex]={"rangeBefore": this.lastRangeBeforeDOMChanges, 
														"rangeAfter": this.getRange(), 
														"mutations": [],
														"type": this.nextMutationBatchType,
														"message": this.nextMutationBatchMessage};
		
		this.nextMutationBatchType=-1;
		this.nextMutationBatchMessage="";
	}
	var numExistingMutations=this.mutationBatches[this.mutationsBatchIndex].mutations.length;
	
	//find text node mutation duplicates (FF)
	var duplicateTextTargets=[];
	
	for(i=0; i<mutations.length; i++)
	{
		if(mutations[i].type!="characterData")
		{
			continue;
		}
		
		for(j=i+1; j<mutations.length; j++)
		{
			if(mutations[j].type!="characterData" || mutations[i].target!=mutations[j].target)
			{
				continue;
			}
			
			//mutations[j].newText=mutations[i].oldValue;
			mutations.splice(j, 1);
			j--;
		}
	}
	var mutation;
	for(i=0; i<mutations.length; i++)
	{
		
		mutation={
			"type": mutations[i].type,
			"target": mutations[i].target
			};
		
		if(mutation.type=="characterData")
		{

			mutation.diff=this.stringsDiff(mutations[i].oldValue, mutations[i].target.textContent);
			//mutations[i].newValue=mutations[i].target.textContent;

		}
		else
		if(mutation.type=="attributes")
		{
			mutation.attributeName=mutations[i].attributeName;
			mutation.attributeNamespace=mutations[i].attributeNamespace;
			
			
			if(mutation.attributeName!="style")
			{
				mutation.oldValue=mutations[i].oldValue;
				mutation.newValue=mutation.target[mutation.attributeName];
			}
			else
			{
				/*
				 * Save oldStyle property set by setStyleAttribute, and its current style values
				 * Then wipeout oldStyle so next bunch of setStyleAttribute will set only those style changes
				 */
				mutation.oldStyle={};
				mutation.oldStyle=mutation.target.oldStyle;
				mutation.target.oldStyle={};
				
				mutation.newStyle={};
				for(var styleAttributeName in mutation.oldStyle)
				{
					mutation.newStyle[styleAttributeName]=mutation.target.style[styleAttributeName];
				}
			}
		}
		else
		{//childList
			mutation.addedNodes=mutations[i].addedNodes;
			mutation.removedNodes=mutations[i].removedNodes;
			mutation.previousSibling=mutations[i].previousSibling;
			mutation.nextSibling=mutations[i].nextSibling;
		}
				
		this.mutationBatches[this.mutationsBatchIndex].mutations[i+numExistingMutations]=mutation;//mutations[i];
	}
	
}

function MutationHistory_setStyleAttribute(element, styleAttributeName, styleAttributeValue)
{
	if(!element.oldStyle)
	{
		element.oldStyle={};
	}
	/*
	 * Check if element style attribute was changed in the current bunch of changes
	 * If yes, then don't overide it
	 * (Actually it's if no then save it)
	 */
	if(!element.oldStyle.hasOwnProperty(styleAttributeName))
	{
		try
		{
			element.oldStyle[styleAttributeName]=element.style[styleAttributeName];
		}
		catch(err)
		{
		}
	}
	try
	{
		element.style[styleAttributeName]=styleAttributeValue;
	}
	catch(err)
	{
	}
}
function MutationHistory_undoAll()
{
	for (var i=this.mutationsBatchIndex; i>=0; i--)
	{
		this.undo();
	}
}
function MutationHistory_redoAll()
{
	for(var i=this.mutationsBatchIndex+1; i<this.mutationBatches.length; i++)
	{
		this.redo();
	}
}
/**
 * MutationHistory.undo
 * 
 * Last mutations of type mutationTypeToSkip are not actually skipped.
 * They are undone as any other mutation, and when the first mutation with a different type is found, it is undone and undo stops
 * It's usefull for example in an editor where the current text is highlighted, but when the user clicks undo, such a mutation must not be considered
 * an operation that must be undone
 * 
 * @param {type} mutationTypeToSkip
 * @returns {undefined}
 */
MutationHistory.prototype.undoMutationsBatch=MutationHistory_undoMutationsBatch;
function MutationHistory_undoMutationsBatch(mutationsBatchIndex)
{
	
}
function MutationHistory_undo(mutationTypeToSkip)
{	
	
	if(this.mutationsBatchIndex<0)
	{
		return;//nothing to undo
	}
	/* first stop observing the target*/
	this.disconnect();
	
	//this.undoMutationsBatch(this.mutationsBatchIndex);
	
	for(var i=this.mutationBatches[this.mutationsBatchIndex].mutations.length-1; i>=0; i--)
	{
		switch(this.mutationBatches[this.mutationsBatchIndex].mutations[i].type)
		{
			case "childList":
				this.undoChildList(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
				break;
			case "attributes":
				this.undoAttributes(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
				break;
			case "characterData":
				this.undoCharacterData(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
				break;
		}		
	}
	this.setRange(this.mutationBatches[this.mutationsBatchIndex].rangeBefore);
	
	this.mutationsBatchIndex--;
	
	/*
	while(true)
	{
		
		this.undoMutationsBatch(this.mutationsBatchIndex);

		this.mutationsBatchIndex--;
		
		if(this.mutationBatches[this.mutationsBatchIndex].type!=mutationTypeToSkip)
		{
			this.undoMutationsBatch(this.mutationsBatchIndex);

			this.mutationsBatchIndex--;
			break;
		}
	}
	
	this.target.ownerDocument.defaultView.focus();
	/* restart observing the target*/
	this.observe();
}
function MutationHistory_redo()
{
	if(this.mutationsBatchIndex>this.mutationBatches.length-2)
	{
		return;
	}
	
	/* first, stop observing the target*/
	this.disconnect();
	this.mutationsBatchIndex++;
	
	for(var i=0; i<this.mutationBatches[this.mutationsBatchIndex].mutations.length; i++)
	{
		switch(this.mutationBatches[this.mutationsBatchIndex].mutations[i].type)
		{
			case "childList":
				this.redoChildList(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
				break;
			case "attributes":
				this.redoAttributes(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
				break;
			case "characterData":
				this.redoCharacterData(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
				break;
		}		
	}
	this.setRange(this.mutationBatches[this.mutationsBatchIndex].rangeAfter);
	/* restart observing the target*/
	this.observe();
}
function MutationHistory_addNodes(mutation, childNodesListName)
{
	if(mutation.nextSibling && mutation.nextSibling.parentNode)
	{
		mutation.target.insertBefore(mutation[childNodesListName][0], mutation.nextSibling);
	}
	else
	if(mutation.previousSibling && mutation.previousSibling.parentNode)
	{
		mutation.target.insertAfter(mutation[childNodesListName][0], mutation.previousSibling);
	}
	else
	{
		mutation.target.appendChild(mutation[childNodesListName][0]);
	}
		
	var previousSibling=mutation[childNodesListName][0];
		
	for(var i=1; i<mutation[childNodesListName].length; i++)
	{
		mutation.target.insertAfter(mutation[childNodesListName][i], previousSibling);
		previousSibling=mutation[childNodesListName][i];
	}
}
function MutationHistory_removeNodes(mutation, childNodesListName)
{
	for(var i=0; i<mutation[childNodesListName].length; i++)
	{		
		
		if(!mutation[childNodesListName][i].parentNode)
		{
			var found;
			for(var j=0; j<i; j++)
			{
				if(mutation[childNodesListName][i]==mutation[childNodesListName][j])
				{
					found=true;
					break;
				}
			}
			if(!found)
			{
				continue;
			}
		}
	
		try
		{
			mutation.target.removeChild(mutation[childNodesListName][i]);
		}
		catch(err)
		{
		}

	}
}
function MutationHistory_undoChildList(mutation)
{
	if(mutation.addedNodes.length>0)
	{
		this.removeNodes(mutation, "addedNodes");
	}
	if(mutation.removedNodes.length>0)
	{
		this.addNodes(mutation, "removedNodes");
	}
}
function MutationHistory_undoAttributes(mutation)
{
	if(mutation.attributeName=="style")
	{
		for(var styleAttributeName in mutation.oldStyle)
		{
			mutation.target.style[styleAttributeName]=mutation.oldStyle[styleAttributeName];
		}
		
		return;
	}
	
	mutation.target.setAttribute(mutation.attributeName, mutation.oldValue===null?"":mutation.oldValue);
	
}

function MutationHistory_undoCharacterData(mutation)
{
	this.spliceTextNodeTextContent(mutation.target, mutation.diff.offset, mutation.diff.text2.length, mutation.diff.text1);
}
function MutationHistory_redoChildList(mutation)
{
	
	if(mutation.addedNodes.length>0)
	{
		this.addNodes(mutation, "addedNodes");
	}
	if(mutation.removedNodes.length>0)
	{
		this.removeNodes(mutation, "removedNodes");
	}
}
function MutationHistory_redoAttributes(mutation)
{	
	if(mutation.attributeName=="style")
	{
		for(var styleAttributeName in mutation.newStyle)
		{
			mutation.target.style[styleAttributeName]=mutation.newStyle[styleAttributeName];
		}
		
		return;
	}
	
	mutation.target[mutation.attributeName]=mutation.newValue===null?"":mutation.newValue;
}

function MutationHistory_stringsDiff(str1, str2)
{
	var isInsert;
	var string1, string2;
	var startOffset, endOffset, lenDiff;
				
	if(str1.length<str2.length)
	{
		isInsert=true;
		string1=str1;
		string2=str2;
	}
	else
	{
		isInsert=false;
		string2=str1;
		string1=str2;
	}
	lenDiff=string2.length-string1.length;
		
	for(startOffset=0; startOffset<string1.length; startOffset++)
	{
		if(string1[startOffset]!=string2[startOffset])
		{
			break;
		}
	}
	for(endOffset=string1.length-1; endOffset>=startOffset; endOffset--)
	{
		if(string1[endOffset]!=string2[endOffset+lenDiff])
		{
			break;
		}
	}
	
	return {"offset": startOffset, 
			"text1": isInsert ? string1.substr(startOffset, endOffset-startOffset+1) : string2.substr(startOffset, endOffset-startOffset+1+lenDiff),
			"text2": !isInsert ? string1.substr(startOffset, endOffset-startOffset+1) : string2.substr(startOffset, endOffset-startOffset+1+lenDiff)};
}
function MutationHistory_spliceTextNodeTextContent(textNode, offset, len, replacement)
{
	return textNode.textContent=textNode.textContent.substr(0, offset)+(replacement?replacement:"")+textNode.textContent.substr(offset+len);
}
function MutationHistory_redoCharacterData(mutation)
{
	this.spliceTextNodeTextContent(mutation.target, mutation.diff.offset, mutation.diff.text1.length, mutation.diff.text2);
}
function MutationHistory_setNextMutationBatchType(type, message)
{
	this.nextMutationBatchType=type;
	this.nextMutationBatchMessage=message;
}
function MutationHistory_removeLastMutationBatchesByType(mutationBatchType)
{
	
	//console.log("this.mutationsBatchIndex="+this.mutationsBatchIndex+"/"+this.mutationBatches.length);
	for(var i=this.mutationBatches.length-1; i>=0; i--)
	{
		//console.log(i+" : "+this.mutationBatches[i].type+"!="+mutationBatchType);
		if(this.mutationBatches[i].type!=mutationBatchType)
		{
			//console.log("break "+i);
			break;
		}
		//console.log("--------");
	}
	return;
	//console.log("i="+i);
	//console.log("remove="+(this.mutationBatches.length-i-1));
	console.log(this.mutationBatches.length);
	this.mutationBatches.splice(i, this.mutationBatches.length-i);
	//this.mutationsBatchIndex-=(this.mutationBatches.length-i+1);
	this.mutationsBatchIndex=(this.mutationBatches.length-1);
	console.log("this.mutationsBatchIndex="+this.mutationsBatchIndex+" / "+this.mutationBatches.length);
	//console.log(i+"/"+this.mutationBatches.length);
	console.log("------");
}
function MutationHistory_serialize()
{
	var serializedHistory;
	
	this.disconnect();
	
	this.removedNodesContainer=this.target.ownerDocument.createElement("div", true);
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
	
	
	serializedHistory={"mutationBatches": [], };
	
	for(var i=0; i<this.mutationBatches.length; i++)
	{
		serializedHistory.mutationBatches[i]={"mutations": [], "rangeBefore": this.mutationBatches[i].rangeBefore, "rangeAfter": this.mutationBatches[i].rangeAfter};
		
		if(serializedHistory.mutationBatches[i].rangeBefore.startContainer)
		{
			serializedHistory.mutationBatches[i].rangeBefore.startContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeBefore.startContainer);
			serializedHistory.mutationBatches[i].rangeBefore.endContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeBefore.endContainer);
			serializedHistory.mutationBatches[i].rangeAfter.startContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeAfter.startContainer);
			serializedHistory.mutationBatches[i].rangeAfter.endContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeAfter.endContainer);
		}
		for(var j=0; j<this.mutationBatches[i].mutations.length; j++)
		{
			serializedHistory.mutationBatches[i].mutations[j]=this.serializeMutation(this.mutationBatches[i].mutations[j]);
		}
	}
	
	serializedHistory.removedNodesContainerInnerHTML=encodeURIComponent(this.removedNodesContainer.innerHTML);
	
	return JSON.stringify(serializedHistory);
	
}

function MutationHistory_serializeMutation(mutation)
{
	var serializedMutation;
	
	serializedMutation={ "type": mutation.type, 
		"target": this.serializeMutationNode(mutation.target),
		"diff": mutation.diff,
		"addedNodes": [],
		"removedNodes": [],
		"previousSibling": this.serializeMutationNode(mutation.previousSibling),
		"nextSibling": this.serializeMutationNode(mutation.nextSibling),
		"attributeName": mutation.attributeName, 
		"attributeNamespace": mutation.attributeNamespace, 
		"oldValue": mutation.oldValue };
			
	
	for(var i=0; i<=1; i++)
	{
		var listName=(i==0?"addedNodes":"removedNodes");
		if(mutation[listName] && mutation[listName].length>0)
		{
			serializedMutation[listName]=[];
			for(var i=0; i<mutation[listName].length; i++)
			{
				serializedMutation[listName][i]=this.serializeMutationNode(mutation[listName][i]);
			}
		}
	}	
	
	return serializedMutation;
}

function MutationHistory_serializeMutationNode(node)
{
	if(!node)
	{
		return;
	}
	if(!node.parentNode)
	{
		if(node.isText())
		{
			var spanTextHolder=this.target.ownerDocument.createElement("span");
			this.setMutationNodeID(spanTextHolder);
			
			spanTextHolder.appendChild(node);
			
			this.removedNodesContainer.appendChild(spanTextHolder);
		}
		else
		{
			this.removedNodesContainer.appendChild(node);
		}
	}
	var ret;
	if(node.isText())
	{
		this.setMutationNodeID(node.parentNode);	
		return {"ID": node.parentNode.id, "index": node.getIndex() };
	}
	else
	{
		this.setMutationNodeID(node);
		return {"ID": node.id};
	}
}

function MutationHistory_setMutationNodeID(node)
{
	var idPrefix="mhid_";
	if(!node)
	{
		return;
	}
	if(node.isElement())
	{
		if(!node.id)
		{
			this.numIDs++;
			if(this.target.ownerDocument.getElementById(idPrefix+node.tagName+"_"+this.numIDs))
			{
			}
			node.id=idPrefix+node.tagName+"_"+this.numIDs;
		}
	}
}
function MutationHistory_restoreSerializedHistory(serializedHistory)
{
	this.removedNodesContainer=this.target.ownerDocument.createElement("div", true);
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
	this.removedNodesContainer.innerHTML=decodeURIComponent(serializedHistory.removedNodesContainerInnerHTML);
	
	this.removedNodesContainer.style.border="10px red solid";
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
		
	for(var i=0; i<serializedHistory.mutationBatches.length; i++)
	{
		this.mutationBatches[i]={ "mutations": [], "rangeBefore": serializedHistory.mutationBatches[i].rangeBefore,  "rangeAfter": serializedHistory.mutationBatches[i].rangeAfter };
		
		if(this.mutationBatches[i].rangeBefore)
		{
			this.mutationBatches[i].rangeBefore.startContainer=this.restoreSerializedMutationNode(this.mutationBatches[i].rangeBefore.startContainer);
			this.mutationBatches[i].rangeBefore.endContainer=this.restoreSerializedMutationNode(this.mutationBatches[i].rangeBefore.endContainer);
			this.mutationBatches[i].rangeAfter.startContainer=this.restoreSerializedMutationNode(this.mutationBatches[i].rangeAfter.startContainer);
			this.mutationBatches[i].rangeAfter.endContainer=this.restoreSerializedMutationNode(this.mutationBatches[i].rangeAfter.endContainer);
		}
		for(var j=0; j<serializedHistory.mutationBatches[i].mutations.length; j++)
		{
		
			this.mutationBatches[i].mutations[j]=this.restoreSerializedMutation(serializedHistory.mutationBatches[i].mutations[j]);
		}
	}
	
	this.mutationsBatchIndex=this.mutationBatches.length-1;

}

function MutationHistory_restoreSerializedMutation(serializedMutation)
{
	var mutation, i;
	 
	mutation=serializedMutation;
	
	mutation.target=this.restoreSerializedMutationNode(mutation.target);
	if(mutation.previousSibling)
	{
		mutation.previousSibling=this.restoreSerializedMutationNode(mutation.previousSibling);
	}
	if(mutation.nextSibling)
	{
		mutation.nextSibling=this.restoreSerializedMutationNode(mutation.nextSibling);
	}
	for(var i=0; i<=1; i++)
	{
		var listName=(i==0?"addedNodes":"removedNodes");
		
		for(var j=0; j<mutation[listName].length; j++)
		{
			mutation[listName][j]=this.restoreSerializedMutationNode(mutation[listName][j]);
		}
	}
	
	return mutation;
}
function MutationHistory_restoreSerializedMutationNode(serializedMutationNode, type)
{
	if(!serializedMutationNode)
	{
		return;
	}
	 
	var node, removeNoded;
	 
	node=this.target.ownerDocument.getElementById(serializedMutationNode.ID);
	
	
	if(serializedMutationNode.hasOwnProperty("index"))// text node
	{
		node=node.childNodes[serializedMutationNode.index];
	}
	 
	return node;
}
function MutationHistory_getRange()
{
	var range;
	
	try
	{
		range=this.target.ownerDocument.defaultView.getSelection().getRangeAt(0);
	}
	catch(err)
	{
		return null;
	}
	return new SimpleRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
	//{"startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset};
}
function MutationHistory_setRange(range)
{
	var docRange, docSelection;
	
	docSelection=this.target.ownerDocument.defaultView.getSelection();
	docSelection.removeAllRanges();
	
	docRange=this.target.ownerDocument.defaultView.document.createRange();
	
	try
	{
		docRange.setStart(range.startContainer, range.startOffset);
		docRange.setEnd(range.endContainer, range.endOffset);

		docSelection.addRange(docRange);
	}
	catch(err)
	{
	}
}
function MutationHistory_handleOnSelectionChanged(evt)
{
	if(evt)
	{
		if( ( evt.type=="keyup" && evt.keyCode!=37 && evt.keyCode!=38 && evt.keyCode!=39 && evt.keyCode!=40 && evt.keyCode!=9/*TAB*/)
			||
			(evt.type=="keypress" && ( evt.keyCode==37 || evt.keyCode==38 || evt.keyCode==39 || evt.keyCode==40) ) )
		{
			return;
		}
	}
	
	this.lastRangeBeforeDOMChanges=this.getRange();
	
	if(!this.lastRangeBeforeDOMChanges ||
			
		(
		this.onMouseDownRange && 
		
		this.lastRangeBeforeDOMChanges.startContainer==this.onMouseDownRange.startContainer &&
		this.lastRangeBeforeDOMChanges.startOffset==this.onMouseDownRange.startOffset &&
		this.lastRangeBeforeDOMChanges.endContainer==this.onMouseDownRange.endContainer &&
		this.lastRangeBeforeDOMChanges.endOffset==this.onMouseDownRange.endOffset) )
	{	
		
		
		setTimeout( "MutationHistory.prototype.___instances["+this.instanceNum+"].handleOnSelectionChanged();", 10);
		
		return;
	}
	
	if(this.selectionChangeObserver)
	{
		this.selectionChangeObserver[0][this.selectionChangeObserver[1]](evt);
	}
}
function MutationHistory_getRangeBoundaryNode(range, left)
{
	var boundaryName;
	
	boundaryName=left ? "start":"end";
	
	if(!range[boundaryName+"Container"].isElement())
	{
		return range[boundaryName+"Container"];
	}
	
	return range[boundaryName+"Container"].childNodes[range[boundaryName+"Offset"]];
}
function MutationHistory_onSelectionChanged(evt)
{
	//console.log(evt.type);
	
	if(evt.type=="drop")// || evt.type=="mouseup")
	{
		setTimeout( "MutationHistory.prototype.___instances["+this.instanceNum+"].handleOnSelectionChanged();", 10);
		return;
	}
	this.handleOnSelectionChanged(evt);	
}
function MutationHistory_onMouseDown(evt)
{
	this.onMouseDownRange=this.getRange();
}