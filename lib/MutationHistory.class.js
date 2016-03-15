
function MutationHistory(target, serializedHistory, selectionChangeObserver, DOMChangeObserver)
{
	MutationHistory.prototype.___instances[MutationHistory.prototype.___numInstances]=this;
	
	this.target=target;
		
	this.nodeDiff=null;
	this.mutations=[];
	this.historyCursor=-1;
	this.history=[];
	this.nextMutationBatchType=-1;
	this.nextMutationBatchMessage="";
	this.numIDs=0;
	this.removedNodesContainer=null;
	this.numIDs=1;
	this.idPrefix="mhid_";
	this.lastRangeBeforeDOMChanges2=[{"startContainer": null, "startOffset": -1, "endContainer": null, "endOffset": -1}];
	this.instanceNum=MutationHistory.prototype.___numInstances;
	
	this.mutationObserver=new MutationObserver(new Function("mutations", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onDOMMutations(mutations)" ));
	this.mutationObserverConfig={attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true};
	this.selectionChangeObserver=selectionChangeObserver;
	this.DOMChangeObserver=DOMChangeObserver;
	
	
	this.onSelectionChangeHandler=new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChange(evt)" );
	
	//if(this.target.ownerDocument.onselectionchange || this.target.ownerDocument.onselectionchange===null)
	{
		this.target.ownerDocument.addEventListener("selectionchange", this.onSelectionChangeHandler);
		
		var event = new Event('selectionchange');
		event.test=true;
		this.target.ownerDocument.dispatchEvent(event);
		
		
		
	}
	if(this.supportSelectionChangeEvent)
	{
		this.refOnDOMModifiedOutside=new Function ("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onDOMModifiedOutside(evt)" );
		for(var i=0; i<	MutationHistory.prototype.___DOMModifiedOutsideEvents.length; i++)
		{
			this.target.addEventListener(MutationHistory.prototype.___DOMModifiedOutsideEvents[i], this.refOnDOMModifiedOutside);
		}
	}
	
	if(serializedHistory)
	{
		this.target.setAttribute("hid",this.idPrefix+this.target.tagName+"_0");
		this.restoreSerializedHistory(serializedHistory);
	}
	
	MutationHistory.prototype.___numInstances++;
}
with(MutationHistory)
{
	prototype.___numInstances=0;
	prototype.___instances=[];
		
	prototype.___DOMModifiedOutsideEvents=["paste", "cut", "drop"];//
	
	prototype.release=MutationHistory_release;
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
	
	prototype.startMutationsBatch=MutationHistory_startMutationsBatch;
	prototype.onDOMMutations=MutationHistory_onDOMMutations;
	prototype.recordMutations=MutationHistory_recordMutations;
		
	prototype.setStyleAttribute=MutationHistory_setStyleAttribute;
	
	prototype.undoAll=MutationHistory_undoAll;
	prototype.redoAll=MutationHistory_redoAll;
	
	prototype.restoreCurrentMutation=MutationHistory_restoreCurrentMutation;
	
	prototype.undo=MutationHistory_undo;
	prototype.redo=MutationHistory_redo;
	
	prototype.addNodes=MutationHistory_addNodes;
	prototype.removeNodes=MutationHistory_removeNodes;
	
	prototype.undoChildList=MutationHistory_undoChildList;
	prototype.redoChildList=MutationHistory_redoChildList;
	
	prototype.undoAttributes=MutationHistory_undoAttributes;
	prototype.redoAttributes=MutationHistory_redoAttributes;
	
	prototype.undoCharacterData=MutationHistory_undoCharacterData;
	prototype.redoCharacterData=MutationHistory_redoCharacterData;
	
	
	
	prototype.stringsDiff=MutationHistory_stringsDiff;
	prototype.spliceTextNodeTextContent=MutationHistory_spliceTextNodeTextContent;
		
	prototype.setNextMutationBatchType=MutationHistory_setNextMutationBatchType;
	prototype.removeMutationsFromHistoryCursor=MutationHistory_removeMutationsFromHistoryCursor;
	
	prototype.serialize=MutationHistory_serialize;
	prototype.setMutationNodeID=MutationHistory_setMutationNodeID;
	
	prototype.restoreSerializedHistory=MutationHistory_restoreSerializedHistory;
	prototype.serializeMutation=MutationHistory_serializeMutation;
	prototype.serializeMutationNode=MutationHistory_serializeMutationNode;
	prototype.restoreSerializedMutation= MutationHistory_restoreSerializedMutation;
	prototype.restoreSerializedMutationNode= MutationHistory_restoreSerializedMutationNode;
		
	prototype.getRanges=MutationHistory_getRanges;
	prototype.setRanges=MutationHistory_setRanges;
	
	
	
	
	prototype.onMouseDown=MutationHistory_onMouseDown;
	prototype.onSelectionChange=MutationHistory_onSelectionChange;
	prototype.onDOMModifiedOutside=MutationHistory_onDOMModifiedOutside;
}
function MutationHistory_release()
{
	
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
	//this.historyCursor++;
}



function MutationHistory_onDOMMutations(mutations)
{
	if(!this.nodeDiff)
	{
		this.recordMutations(mutations);
		return;
	}
	
	//this.mirrorUndoneMutations=true;
	this.nodeDiff.diff();
	
	this.recordMutations(this.nodeDiff.mutations);
	this.nodeDiff.release();
	this.nodeDiff=null;
	//this.observe();
}
function MutationHistory_recordMutations(mutations)
{
	var mutationIndex=this.mutations.length;
	var i, j;
	
	if(/*this.mirrorUndoneMutations && */this.historyCursor<=this.history.length-1)
	{
		var historyStep;
	
		historyStep=this.history.length-1;
		
		if(historyStep>=this.historyCursor)//+1)
		{
			var mirroredHistorySequence=[];
			for(i=historyStep; i>=this.historyCursor+1; i--)
			{
				if(this.history[i].reversed)
				{
					continue;
				}
				mirroredHistorySequence[mirroredHistorySequence.length]={ "mutation": this.history[i].mutation, "reversed": true, "rtl": true/*, "history_step": this.mirrorUndoneMutations*/};
				//this.history[this.history.length]={ "mutation": this.history[i].mutation, "reversed": true, "rtl": true, "history_step": this.mirrorUndoneMutations};
				//this.history[this.history.length-1].reversed=true;
				//this.history[this.history.length-1].rtl=true;
				this.history[i].reversed=true;
				this.history[i].rtl=false;
			}
			//this.history.splice(historyStep+1, 0, mirroredHistorySequence);
			this.history=this.history.slice(0, historyStep+1).concat(mirroredHistorySequence).concat(this.history.slice(historyStep+1));
		}

	}
	
	this.mutations[mutationIndex]={	"rangesBefore": this.lastRangeBeforeDOMChanges2, 
									"rangesAfter": this.getRanges(), 
									"records": [],
									"type": this.nextMutationBatchType,
									"message": this.nextMutationBatchMessage,
									"reverted": false,
									"split": false};
		
	
	
	var numExistingMutations=this.mutations[mutationIndex].records.length;
	
	//find text node mutation duplicates (FF)	
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
				mutation.newValue=mutation.target.getAttribute(mutation.attributeName);
				//mutation.newValue=mutation.target[mutation.attributeName];
				//console.log(mutation.attributeName+":"+mutation.target.getAttribute(mutation.attributeName));
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
				
		this.mutations[mutationIndex].records[i+numExistingMutations]=mutation;//mutations[i];
	}
	
	this.history[this.history.length]={"mutation": this.mutations.length-1, "reversed": false, "rtl": false};
	
	this.historyCursor=this.history.length-1;
	
	this.nextMutationBatchType=-1;
	this.nextMutationBatchMessage="";
	
	this.lastRangeBeforeDOMChanges2=this.getRanges();
	
	if(this.DOMChangeObserver)
	{
		this.DOMChangeObserver[0][this.DOMChangeObserver[1]]();
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
	for (var i=this.historyCursor; i>=0; i--)
	{
		this.undo();
	}
}
function MutationHistory_redoAll()
{
	for(var i=this.historyCursor+1; i<this.mutations.length; i++)
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

function MutationHistory_restoreCurrentMutation(historyIndex, undo)
{
	var methodPrefix, methodName, rangeName;
	var mutation;
	
	methodPrefix=undo?"undo":"redo";
	rangeName="ranges"+(undo?"Before":"After");
	
	mutation=this.mutations[this.history[historyIndex].mutation];
	
	//this.undoMutationsBatch(historyIndex);
	// first stop observing the target
	this.disconnect();
	//for(var i=mutation.records.length-1; i>=0; i--)
	if(undo)
	{
		for(var i=mutation.records.length-1; i>=0; i--)
		{
			methodName=methodPrefix+mutation.records[i].type[0].toUpperCase()+mutation.records[i].type.slice(1);

			this[methodName](mutation.records[i]);
		}
	}
	else
	{
		for(var i=0; i<mutation.records.length; i++)
		{
			methodName=methodPrefix+mutation.records[i].type[0].toUpperCase()+mutation.records[i].type.slice(1);

			this[methodName](mutation.records[i]);	
		}
	}
	
	this.setRanges(mutation[rangeName]);
	// restart observing the target
	this.observe();
}

function MutationHistory_undo(mutationTypeToSkip)
{	
	
	if(this.historyCursor<0)
	{
		return;//nothing to undo
	}
	console.log("Undo: "+this.historyCursor+" / "+this.history.length);
	this.restoreCurrentMutation(this.historyCursor, !this.history[this.historyCursor].rtl);
	this.historyCursor--;
	
}
function MutationHistory_redo(mutationTypeToSkip)
{
	if(this.historyCursor>this.history.length-2)
	{
		return;
	}
	
	this.historyCursor++;
	this.restoreCurrentMutation(this.historyCursor, this.history[this.historyCursor].rtl);
	
}
function MutationHistory_addNodes(mutation, childNodesListName)
{
	if(mutation.nextSibling && mutation.nextSibling.parentNode==mutation.target)
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
	if(mutation.oldValue===null)
	{
		mutation.target.removeAttribute(mutation.attributeName);
	}
	else
	{
		mutation.target.setAttribute(mutation.attributeName, mutation.oldValue);
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
	//mutation.target[mutation.attributeName]=mutation.newValue===null?"":mutation.newValue;
	mutation.target.setAttribute(mutation.attributeName, mutation.newValue===null?"":mutation.newValue);
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

function MutationHistory_undoCharacterData(mutation)
{
	
	this.spliceTextNodeTextContent(mutation.target, mutation.diff.offset, mutation.diff.text2.length, mutation.diff.text1);
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
function MutationHistory_removeMutationsFromHistoryCursor(mutationBatchType)
{
	
	if(this.history.length==0)
	{
		return;
	}
	
	this.mutations.splice(this.history[this.historyCursor+1].mutation);
	this.history.splice(this.historyCursor+1);
}
function MutationHistory_serialize()
{
	var serializedHistory;
	
	this.disconnect();
	
	this.removedNodesContainer=this.target.ownerDocument.createElement("div", true);
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
	
	
	serializedHistory={ "history": this.history, "historyCursor": this.historyCursor, "mutations": []};
	
	for(var i=0; i<this.mutations.length; i++)
	{
		serializedHistory.mutations[i]={"records": [], "rangesBefore": this.mutations[i].rangesBefore, "rangesAfter": this.mutations[i].rangesAfter};
		
		for(var j=0; j<serializedHistory.mutations[i].rangesBefore.length; j++)
		{
			
			if(serializedHistory.mutations[i].rangesBefore[j].startContainer)
			{
				serializedHistory.mutations[i].rangesBefore[j].startContainer=this.serializeMutationNode(serializedHistory.mutations[i].rangesBefore[j].startContainer);
				serializedHistory.mutations[i].rangesBefore[j].endContainer=this.serializeMutationNode(serializedHistory.mutations[i].rangesBefore[j].endContainer);
				serializedHistory.mutations[i].rangesAfter[j].startContainer=this.serializeMutationNode(serializedHistory.mutations[i].rangesAfter[j].startContainer);
				serializedHistory.mutations[i].rangesAfter[j].endContainer=this.serializeMutationNode(serializedHistory.mutations[i].rangesAfter[j].endContainer);
			}
		}
		for(var j=0; j<this.mutations[i].records.length; j++)
		{
			serializedHistory.mutations[i].records[j]=this.serializeMutation(this.mutations[i].records[j]);
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
		return null;
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
	
	if(node.isText())
	{
		this.setMutationNodeID(node.parentNode);
		
		return {"HID": node.parentNode.getAttribute("HID"), "index": node.getIndex() };
	}
	else
	{
		this.setMutationNodeID(node);
		return {"HID": node.getAttribute("HID")};
	}
}

function MutationHistory_setMutationNodeID(node)
{
	
	if(!node)
	{
		return;
	}
	if(node.isElement())
	{
		this.numIDs++;
		
		if(!node.hasAttribute("hid"))
		{
			//node.id=this.idPrefix+node.tagName+"_"+this.numIDs;
			node.setAttribute("hid", this.idPrefix+node.tagName+"_"+(node==this.target?"0":this.numIDs));
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
	this.history=serializedHistory.history;
	this.historyCursor=serializedHistory.historyCursor;
	
	
	for(var i=0; i<serializedHistory.mutations.length; i++)
	{
		
		this.mutations[i]={ "records": [], 
			"rangesBefore": serializedHistory.mutations[i].rangesBefore,  
			"rangesAfter": serializedHistory.mutations[i].rangesAfter };
		for(var j=0; j<this.mutations[i].rangesBefore.length; j++)
		{
			if(this.mutations[i].rangesBefore[j].startContainer)
			{
				
				this.mutations[i].rangesBefore[j].startContainer=this.restoreSerializedMutationNode(this.mutations[i].rangesBefore[j].startContainer);
				
				this.mutations[i].rangesBefore[j].endContainer=this.restoreSerializedMutationNode(this.mutations[i].rangesBefore[j].endContainer);
				this.mutations[i].rangesAfter[j].startContainer=this.restoreSerializedMutationNode(this.mutations[i].rangesAfter[j].startContainer);
				this.mutations[i].rangesAfter[j].endContainer=this.restoreSerializedMutationNode(this.mutations[i].rangesAfter[j].endContainer);
			}
		}
		for(var j=0; j<serializedHistory.mutations[i].records.length; j++)
		{
			this.mutations[i].records[j]=this.restoreSerializedMutation(serializedHistory.mutations[i].records[j]);
		}
	}
	
	var nodes=this.target.ownerDocument.querySelectorAll("[hid]");

	for(var i=0; i<nodes.length; i++)
	{
		nodes[i].removeAttribute("hid");
	}

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
	
	//node=this.target.ownerDocument.getElementById(serializedMutationNode.ID);
	node=this.target.ownerDocument.querySelectorAll("[hid=\""+serializedMutationNode.HID+"\"]");
	
	node=node[0];
	if(serializedMutationNode.hasOwnProperty("index"))// text node
	{
		node=node.childNodes[serializedMutationNode.index];
	}
	 
	return node;
}
function MutationHistory_getRanges(dbg)
{
	var range, ranges=[];
	
	for(var i=0; i<this.target.ownerDocument.defaultView.getSelection().rangeCount; i++)
	{
		range=this.target.ownerDocument.defaultView.getSelection().getRangeAt(i);
		
		ranges[i]={ "startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset };
		
	}
	
	return ranges;
}
function MutationHistory_setRanges(ranges)
{
	var docRange, docSelection;
	
	docSelection=this.target.ownerDocument.defaultView.getSelection();
	docSelection.removeAllRanges();
		
	for(var i=0; i<ranges.length; i++)
	{
		docRange=this.target.ownerDocument.defaultView.document.createRange();
		
		docRange.setStart(ranges[i].startContainer, ranges[i].startOffset);
		docRange.setEnd(ranges[i].endContainer, ranges[i].endOffset);

		docSelection.addRange(docRange);
	}
	
	this.lastRangeBeforeDOMChanges2=this.getRanges();
}
function MutationHistory_onMouseDown(evt)
{
	this.onMouseDownRange2=this.getRanges();
}
function MutationHistory_onSelectionChange(evt)
{
	
	
	if(evt.test)
	{
		this.supportSelectionChangeEvent=true;
		return;
	}
	this.lastRangeBeforeDOMChanges2=this.getRanges();
		
	if(this.selectionChangeObserver)
	{
		this.selectionChangeObserver[0][this.selectionChangeObserver[1]](evt);
	}
}
function MutationHistory_onDOMModifiedOutside(evt)
{
	
	
	this.nodeDiff=new NodeDiff(this.target);
	
	//this.disconnect();
	//evt.preventDefault();
}