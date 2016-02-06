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
	prototype.mutations=[];
	prototype.historyCursor=-1;
	prototype.history=[];
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
	prototype.redoChildList=MutationHistory_redoChildList;
	
	prototype.undoAttributes=MutationHistory_undoAttributes;
	prototype.redoAttributes=MutationHistory_redoAttributes;
	
	prototype.undoCharacterData=MutationHistory_undoCharacterData;
	prototype.redoCharacterData=MutationHistory_redoCharacterData;
	
	
	
	prototype.stringsDiff=MutationHistory_stringsDiff;
	prototype.spliceTextNodeTextContent=MutationHistory_spliceTextNodeTextContent;
	
	
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
	//this.historyCursor++;
}
MutationHistory.prototype.reverseMutationBatch=MutationHistory_reverseMutationBatch;
function MutationHistory_reverseMutationBatch(mutationBatch)
{
	var revertedMutationBatch;
	
	revertedMutationBatch={"records": [], "rangeBefore": mutationBatch.rangeAfter,  "rangeAfter": mutationBatch.rangeBefore, "reverted": true};
	
	for(var i=0; i<mutationBatch.records.length; i++)
	{
		revertedMutationBatch.records[i]=this.reverseMutation(mutationBatch.records[i]);
	}

	return revertedMutationBatch;
}
MutationHistory.prototype.reverseMutation=MutationHistory_reverseMutation;
function MutationHistory_reverseMutation(mutation)
{
	var revertedMutation;
	
	revertedMutation={"target": mutation.target, "type": mutation.type};
	
	switch(mutation.type)
	{
		case "characterData":
			//revertedMutation=mutation;
			
			var tmp;
			
			revertedMutation.diff={"offset": mutation.diff.offset, "text1": mutation.diff.text2, "text2": mutation.diff.text1};
			
			
			break;
	}
	
	return revertedMutation;
}
function MutationHistory_onDOMMutations(mutations)
{
	
	var mutationIndex=this.mutations.length;
	var i, j;
	//console.log(mutationIndex);
	this.historyCursor++;
	
	//if(this.history[this.historyCursor])
	if(this.historyCursor<=this.history.length-1)
	{
		
		var iMax=this.history.length-1;
		var lastRevertedIndex;
		
		lastRevertedIndex=this.historyCursor;
		while(this.history[lastRevertedIndex].reverted)
		{
			
			lastRevertedIndex++;
		}
		
		for(i=iMax; i>=lastRevertedIndex; i--)
		{
			if(this.history[i].reversed)
			{
				
				continue;
			}
			this.history[this.history.length]={ "mutation": this.history[i].mutation, "reversed": true, "rtl": true};//this.reverseMutationBatch(this.history[i]);
			//this.history[this.history.length-1].reversed=true;
			//this.history[this.history.length-1].rtl=true;
			this.history[i].reversed=true;
			this.history[i].rtl=false;
			
		}
		this.historyCursor=this.history.length;
	}
	//console.log("this.historyCursor="+this.historyCursor);
	//console.log("---------------------------------------------");
	if(this.historyCursor<this.mutations.length-1)
	{
		
		//this.mutations.splice(this.historyCursor+1, this.mutations.length-this.historyCursor+1);
	}
	
	//if(typeof(this.mutations[this.historyCursor])=="undefined")
	{
		this.mutations[mutationIndex]={"rangeBefore": this.lastRangeBeforeDOMChanges, 
														"rangeAfter": this.getRange(), 
														"records": [],
														"type": this.nextMutationBatchType,
														"message": this.nextMutationBatchMessage,
														"reverted": false	};
		
		this.nextMutationBatchType=-1;
		this.nextMutationBatchMessage="";
	}
	var numExistingMutations=this.mutations[mutationIndex].records.length;
	
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
				
		this.mutations[mutationIndex].records[i+numExistingMutations]=mutation;//mutations[i];
	}
	
	this.history[this.history.length]={"mutation": this.mutations.length-1};
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
MutationHistory.prototype.restoreCurrentMutation=MutationHistory_restoreCurrentMutation;
function MutationHistory_restoreCurrentMutation(undo)
{
	var methodPrefix, methodName, rangeName;
	var mutation;
	
	methodPrefix=undo?"undo":"redo";
	rangeName="range"+(undo?"Before":"After");
	
	mutation=this.mutations[this.history[this.historyCursor].mutation];
	
	//this.undoMutationsBatch(this.historyCursor);
	this.disconnect();
	//for(var i=mutation.records.length-1; i>=0; i--)
	if(undo)
	{
		for(var i=mutation.records.length-1; i>=0; i--)
		{
			methodName=methodPrefix+mutation.records[i].type[0].toUpperCase()+mutation.records[i].type.slice(1);;

			this[methodName](mutation.records[i]);
		}
	}
	else
	{
		for(var i=0; i<mutation.records.length; i++)
		{
			methodName=methodPrefix+mutation.records[i].type[0].toUpperCase()+mutation.records[i].type.slice(1);;

			this[methodName](mutation.records[i]);	
		}
	}
	//console.log(rangeName);
	this.setRange(mutation[rangeName]);
	
	this.observe();
}
function MutationHistory_undo(mutationTypeToSkip)
{	
	
	if(this.historyCursor<0)
	{
		return;//nothing to undo
	}
	/* first stop observing the target*/
	
	
	//var mutation;
	
	//console.log("UNDO "+(this.history[this.historyCursor].rtl?" reverse":""));
	
	this.restoreCurrentMutation(!this.history[this.historyCursor].rtl);
	this.historyCursor--;
	return;
	mutation=this.mutations[this.history[this.historyCursor].mutation];
	
	//this.undoMutationsBatch(this.historyCursor);
	
	//for(var i=mutation.records.length-1; i>=0; i--)
	for(var i=mutation.records.length-1; i>=0; i--)
	{
		switch(mutation.records[i].type)
		{
			case "childList":
				this.undoChildList(mutation.records[i]);
				break;
			case "attributes":
				this.undoAttributes(mutation.records[i]);
				break;
			case "characterData":
				
				this.undoCharacterData(mutation.records[i]);
				break;
		}		
	}
	this.setRange(mutation.rangeBefore);
	
	this.historyCursor--;
	
	/*
	while(true)
	{
		
		this.undoMutationsBatch(this.historyCursor);

		this.historyCursor--;
		
		if(this.mutations[this.historyCursor].type!=mutationTypeToSkip)
		{
			this.undoMutationsBatch(this.historyCursor);

			this.historyCursor--;
			break;
		}
	}
	
	this.target.ownerDocument.defaultView.focus();
	/* restart observing the target*/
	this.observe();
}
function MutationHistory_redo()
{
	if(this.historyCursor>this.historyCursor.length-2)
	{
		return;
	}
	this.historyCursor++;
	this.restoreCurrentMutation(this.history[this.historyCursor].rtl);
	return;
	/* first, stop observing the target*/
	this.disconnect();
	this.historyCursor++;
	
	var mutation;
	
	mutation=this.mutations[this.history[this.historyCursor].mutation];
	
	for(var i=0; i<mutation.records.length; i++)
	{
		switch(mutation.records[i].type)
		{
			case "childList":
				this.redoChildList(mutation.records[i]);
				break;
			case "attributes":
				this.redoAttributes(mutation.records[i]);
				break;
			case "characterData":
				this.redoCharacterData(mutation.records[i]);
				break;
		}		
	}
	this.setRange(mutation.rangeAfter);
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
	
	mutation.target.setAttribute(mutation.attributeName, mutation.oldValue===null?"":mutation.oldValue);
	
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
function MutationHistory_removeLastMutationBatchesByType(mutationBatchType)
{
	
	//console.log("this.historyCursor="+this.historyCursor+"/"+this.mutations.length);
	for(var i=this.mutations.length-1; i>=0; i--)
	{
		//console.log(i+" : "+this.mutations[i].type+"!="+mutationBatchType);
		if(this.mutations[i].type!=mutationBatchType)
		{
			//console.log("break "+i);
			break;
		}
		//console.log("--------");
	}
	return;
	//console.log("i="+i);
	//console.log("remove="+(this.mutations.length-i-1));
	console.log(this.mutations.length);
	this.mutations.splice(i, this.mutations.length-i);
	//this.historyCursor-=(this.mutations.length-i+1);
	this.historyCursor=(this.mutations.length-1);
	console.log("this.historyCursor="+this.historyCursor+" / "+this.mutations.length);
	//console.log(i+"/"+this.mutations.length);
	console.log("------");
}
function MutationHistory_serialize()
{
	var serializedHistory;
	
	this.disconnect();
	
	this.removedNodesContainer=this.target.ownerDocument.createElement("div", true);
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
	
	
	serializedHistory={"mutationBatches": [], };
	
	for(var i=0; i<this.mutations.length; i++)
	{
		serializedHistory.mutationBatches[i]={"mutations": [], "rangeBefore": this.mutations[i].rangeBefore, "rangeAfter": this.mutations[i].rangeAfter};
		
		if(serializedHistory.mutationBatches[i].rangeBefore.startContainer)
		{
			serializedHistory.mutationBatches[i].rangeBefore.startContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeBefore.startContainer);
			serializedHistory.mutationBatches[i].rangeBefore.endContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeBefore.endContainer);
			serializedHistory.mutationBatches[i].rangeAfter.startContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeAfter.startContainer);
			serializedHistory.mutationBatches[i].rangeAfter.endContainer=this.serializeMutationNode(serializedHistory.mutationBatches[i].rangeAfter.endContainer);
		}
		for(var j=0; j<this.mutations[i].records.length; j++)
		{
			serializedHistory.mutationBatches[i].records[j]=this.serializeMutation(this.mutations[i].records[j]);
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
		this.mutations[i]={ "mutations": [], "rangeBefore": serializedHistory.mutationBatches[i].rangeBefore,  "rangeAfter": serializedHistory.mutationBatches[i].rangeAfter };
		
		if(this.mutations[i].rangeBefore)
		{
			this.mutations[i].rangeBefore.startContainer=this.restoreSerializedMutationNode(this.mutations[i].rangeBefore.startContainer);
			this.mutations[i].rangeBefore.endContainer=this.restoreSerializedMutationNode(this.mutations[i].rangeBefore.endContainer);
			this.mutations[i].rangeAfter.startContainer=this.restoreSerializedMutationNode(this.mutations[i].rangeAfter.startContainer);
			this.mutations[i].rangeAfter.endContainer=this.restoreSerializedMutationNode(this.mutations[i].rangeAfter.endContainer);
		}
		for(var j=0; j<serializedHistory.mutationBatches[i].records.length; j++)
		{
		
			this.mutations[i].records[j]=this.restoreSerializedMutation(serializedHistory.mutationBatches[i].records[j]);
		}
	}
	
	this.historyCursor=this.mutations.length-1;

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