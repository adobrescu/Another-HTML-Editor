
function String_splice(str2)
{
	
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
		this.target.addEventListener(MutationHistory.prototype.___onSelectionChangeEvents[i], new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChanged(evt)" ));
	}
	
	//this.target.ownerDocument.defaultView.addEventListener("beforeunload", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].sendToServer(evt)" ));
	
	MutationHistory.prototype.___numInstances++;
	
	
}
with(MutationHistory)
{
	prototype.___numInstances=0;
	prototype.___instances=[];
	 prototype.___onSelectionChangeEvents=["mouseup", "keypress", "keyup", "onpaste", "oncut"];
	
	prototype.target=null;
	prototype.mutationObserver=null;
	prototype.mutationObserverConfig=null;
	prototype.mutationBatches=[];
	prototype.mutationsBatchIndex=-1;
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
	prototype.spliceTextNodeTextContent=MutationHistory_spliceTextNodeTextContent;
	prototype.redoCharacterData=MutationHistory_redoCharacterData;
	
	prototype.logMutation=MutationHistory_logMutation;
	prototype.logObject=MutationHistory_logObject;
	
	prototype.logChildNodesMutation=MutationHistory_logChildNodesMutation;
	
	prototype.sendToServer=MutationHistory_sendToServer;
	prototype.serialize=MutationHistory_serialize;
	prototype.setMutationNodeID=MutationHistory_setMutationNodeID;
	
	prototype.restoreSerializedHistory=MutationHistory_restoreSerializedHistory;
	prototype.serializeMutation=MutationHistory_serializeMutation;
	prototype.serializeMutationNode=MutationHistory_serializeMutationNode;
	prototype.restoreSerializedMutation= MutationHistory_restoreSerializedMutation;
	prototype.restoreSerializedMutationNode= MutationHistory_restoreSerializedMutationNode;
	prototype.areMutationsEqual=MutationHistory_areMutationsEqual;
	
	prototype.getRange=MutationHistory_getRange;
	prototype.setRange=MutationHistory_setRange;
	prototype.onSelectionChanged=MutationHistory_onSelectionChanged;
	
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
	
	//console.log("MutationHistory_onDOMMutations");
	var mutationsBatchIndex=this.mutationBatches.length;
	var i, j;
	
	this.mutationsBatchIndex++;
	
	if(this.mutationsBatchIndex<this.mutationBatches.length-1)
	{
		this.mutationBatches.splice(this.mutationsBatchIndex+1, this.mutationBatches.length-this.mutationsBatchIndex+1);
	}
	
	if(typeof(this.mutationBatches[this.mutationsBatchIndex])=="undefined")
	{
		this.mutationBatches[this.mutationsBatchIndex]={"rangeBefore": this.lastRangeBeforeDOMChanges, "rangeAfter": this.getRange(), "mutations": []};		
	}
	var numExistingMutations=this.mutationBatches[this.mutationsBatchIndex].mutations.length;
	
	//find text node mutation duplicates (FF)
	var duplicateTextTargets=[];
	//console.log("mutations.length: "+mutations.length);
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
			
			//console.log(i+", "+j);
			//mutations[j].newText=mutations[i].oldValue;
			mutations.splice(j, 1);
			j--;
			//console.log("mutations.length: "+mutations.length);
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
			//console.log("isInsert: "+mutations[i].isInsert+", insertedText: \""+mutations[i].insertedText+"\", insertedText1: \""+mutations[i].insertedText1+"\", start offset: "+mutations[i].startOffset);
			//console.log("-----------------------------------------");
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
		//console.log("UNDOALL");
		this.undo();
	}
}
function MutationHistory_redoAll()
{
	for(var i=this.mutationsBatchIndex+1; i<this.mutationBatches.length; i++)
	{
		this.redo();
		//console.log("REDOALL");
	}
}
function MutationHistory_undo()
{	
	
	if(this.mutationsBatchIndex<0)
	{
		return;//nothing to undo
	}
	
	/* first stop observing the target*/
	this.disconnect();
		
	for(var i=this.mutationBatches[this.mutationsBatchIndex].mutations.length-1; i>=0; i--)
	{
		this.logMutation(this.mutationBatches[this.mutationsBatchIndex].mutations[i]);
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
	//console.log("MutationHistory_addNodes: "+childNodesListName);
	//for(var i=0; i<mutation[childNodesListName].length; i++)
	{
		//console.logNode(mutation[childNodesListName][i]);
	}
	//console.log("----------------------------");
	//console.log(mutation.type);
	//console.logNode(mutation[childNodesListName][0]);
	//console.logNode(mutation.previousSibling.parentNode, "", false, "mutation.nextSibling: ");
	//console.logNode(mutation.target, "", false, "mutation.target: ");
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
		if(!mutation.target.appendChild)
		{
			//alert(mutation.target)
		}
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
	//console.log("MutationHistory_removeNodes: "+childNodesListName);
	//for(var i=0; i<mutation[childNodesListName].length; i++)
	{
		//console.logNode(mutation[childNodesListName][i]);
	}
	//console.log("----------------------------");
	
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
	//console.log("MutationHistory_undoCharacterData");
	//console.logNode(mutation.target, " -> "+mutation.oldValue, false);
	//console.log("----------------------------");
	//console.log(mutation.diff.offset+" \""+mutation.diff.text1+"\""+"->"+"\""+mutation.diff.text2+"\"");
	this.spliceTextNodeTextContent(mutation.target, mutation.diff.offset, mutation.diff.text2.length, mutation.diff.text1);
	if(mutation.isInsert)
	{
		//this.spliceTextNodeTextContent(mutation.target, mutation.startOffset, mutation.insertedText.length, mutation.insertedText1);
		//mutation.target.textContent=mutation.target.textContent.substr(0, mutation.startOffset)+mutation.target.textContent.substr(mutation.insertedText.length)
	}
	else
	{
		//this.spliceTextNodeTextContent(mutation.target, mutation.startOffset, mutation.insertedText1.length, mutation.insertedText);
		//mutation.target.textContent=mutation.target.textContent.substr(0, mutation.startOffset)+mutation.insertedText+mutation.target.textContent.substr(mutation.startOffset)
	}
	
	//mutation.target.textContent=mutation.oldValue;
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
MutationHistory.prototype.stringsDiff=MutationHistory_stringsDiff;
function MutationHistory_stringsDiff(str1, str2)
{
	var isInsert;
	var string1, string2;
	var startOffset, endOffset, lenDiff;
				
	//console.log("\""+str1+"\"\n->\n\""+str2+"\"");
				
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
			//startOffset--;
			//console.log("\""+string1[startOffset]+"\"!=\""+string1[startOffset]+"\""+lenDiff);
			break;
		}
	}
	for(endOffset=string1.length-1; endOffset>=startOffset; endOffset--)
	{
		//console.log(endOffset+">="+startOffset+"+"+lenDiff);
		//console.log("DA");
		//console.log("\""+string1[endOffset-lenDiff]+"\"==\""+string2[endOffset]+"\"");
		if(string1[endOffset]!=string2[endOffset+lenDiff])
		{
			//console.log("lenDiffrent at "+endOffset);
			
			//endOffset--;
			//startOffset--;
			//console.log("End: \""+string1[endOffset]+"\"!=\""+string2[endOffset]+"\""+lenDiff);
			//endOffset--;//will be increased after the loop
			break;
		}
	}
	//endOffset++;
	//console.log("isInsert: "+isInsert);
	//console.log("lenDiff: "+lenDiff);
	//console.log("startOffset: "+startOffset);
	//console.log("endOffset: "+endOffset);
	//console.log("text 2 diff: \""+string2.substr(startOffset, endOffset-startOffset+1+lenDiff)+"\"");
	//console.log("text 1 diff: \""+string1.substr(startOffset, endOffset-startOffset+1)+"\"");
	//console.log("---------------");
	
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
	//console.log("MutationHistory_redoCharacterData");
	//console.logNode(mutation.target, " -> "+mutation.newValue, false);
	//console.log("----------------------------");
	//mutation.target.textContent=mutation.newValue;
	this.spliceTextNodeTextContent(mutation.target, mutation.diff.offset, mutation.diff.text1.length, mutation.diff.text2);
	if(!mutation.isInsert)
	{
		//this.spliceTextNodeTextContent(mutation.target, mutation.startOffset, mutation.insertedText.length, mutation.insertedText1);
	}
	else
	{
		
		//this.spliceTextNodeTextContent(mutation.target, mutation.startOffset, mutation.insertedText1.length, mutation.insertedText);
		//mutation.target.textContent=mutation.target.textContent.substr(0, mutation.startOffset)+mutation.insertedText+mutation.target.textContent.substr(mutation.startOffset)
	}
	
}
function MutationHistory_logMutation(mutation, msg)
{
	//console.log("------------------------------------------------------");
	//console.log("Log Mutation for: "+this.target.tagName+(this.target.id?" #"+this.target.id:"")+(msg?": "+msg:""));
	//console.log("Target: "+(mutation.target.nodeType==3?"Text":mutation.target.tagName+(mutation.target.id?" #"+mutation.target.id:"")));
	
	if(mutation.type=="characterData")
	{
		//console.log("Text: "+mutation.target.textContent);
		return;
	}
	if(mutation.type=="attributes")
	{
		if(mutation.attributeName=="style")
		{
			//console.log("Style");
			for(var styleAttrName in mutation.oldStyle)
			{
				//console.log(styleAttrName+": "+mutation.oldStyle[styleAttrName]+" -> "+mutation.target.style[styleAttrName]);
			}
		}
		else
		{
			//console.log(mutation.attributeName+": "+(mutation.oldValue===null?"":mutation.oldValue)+" -> "+mutation.target[mutation.attributeName]);
		}
		return;
	}
	var info="";
	
	var listNames=["addedNodes", "removedNodes"];
	
	for(var j=0; j<listNames.length; j++)
	{
		var listName=listNames[j];
		if(mutation[listName].length==0)
		{
			continue;
		}
		
		
		info="";
		
		for(var i=0; i<mutation[listName].length; i++)
		{
			info+=(info?"|\n":"")+(mutation[listName][i].nodeType==3?"Text: "+mutation[listName][i].textContent:(mutation[listName][i].nodeType!=1?mutation[listName][i].nodeType:(mutation[listName][i].tagName+(mutation[listName][i].id?" #"+mutation[listName][i].id:""))+": "+mutation[listName][i].innerHTML));
		}
		//console.log(listName+": "+info);
		
	}
	
}

function MutationHistory_logObject(obj)
{
	//console.log("------------------------------------------------------");
	//console.log("Log Object: ");
	for(var str in obj)
	{
		if(typeof(obj[str])=="function")
		{
			continue;
		}
		//console.log(str+" :" +typeof(obj[str]));
	}
}
function MutationHistory_logChildNodesMutation(mutation, msg)
{
	if(mutation.type!="childList")
	{
		return;
	}
	//console.log((msg?msg:"")+" --------------------------------------------------");
	
	var listNames=["addedNodes", "removedNodes"];
	var listName="";
	var k=1;
	var info="";
	
	for(var i=0; i<listNames.length; i++)
	{
		listName=listNames[i];
		if(mutation[listName].length==0)
		{
			continue;
		}
		for(var j=0; j<mutation[listName].length; j++)
		{
			info=(msg?msg:"")+". Target: "+mutation.target.tagName+(mutation.target.id?" #"+mutation.target.id:"")+", "+listName+", ";
			if(mutation[listName][j].nodeType==3)
			{
				info+="Text";
			}
			else
			if(mutation[listName][j].nodeType==1)
			{
				info+="child node: ";
				info+=mutation[listName][j].tagName+(mutation[listName][j].id?" #"+mutation[listName][j].id:"");
			}
			else
			{
				info+=" type="+mutation[listName][j].nodeType;
			}
			//console.log(info);
			k++;
		}
		
	}
	
}
function MutationHistory_sendToServer()
{
	var xmlHttp, serializedHistory, postData;
	
	
	postData="serializedHistory="+JSON.stringify(this.serialize())+"&innerHTML="+this.target.innerHTML+"&removedNodesContainerInnerHTML="+this.removedNodesContainer.innerHTML;
	
	//console.log(this.target.ownerDocument.defaultView.parent.location+"?message=test123axxa");
	xmlHttp = new XMLHttpRequest();
	
	xmlHttp.open("POST", this.target.ownerDocument.defaultView.parent.location+"?message=test123", false);
	xmlHttp.setRequestHeader("Content-type", "multipart/form-data");
	xmlHttp.send(postData);
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
	
	//alert(this.removedNodesContainer.innerHTML);
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
			
	//}
	
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
		
		ret= {"ID": node.parentNode.id, "index": node.getIndex() };
	}
	else
	{
		this.setMutationNodeID(node);
		ret= {"ID": node.id};
	}
	if(!ret.ID)
	{
		
	}
	
	
	return ret;
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
	//return;
	//alert(this.target.ownerDocument.getElementById("mhid_SPAN_7"));
	//serializedHistory=JSON.parse(serializedHistory);
	//console.log(serializedHistory.length);
	
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
			//alert(serializedHistory[i][j].target.textParentID);
		}
	}
	
	this.mutationsBatchIndex=this.mutationBatches.length-1;
	//alert(this.mutationsBatchIndex);
	//this.removedNodesContainer.innerHTML="";
	//alert(removedNodesContainerInnerHTML);
	//this.target.ownerDocument.body.removeChild(this.removedNodesContainer);
	//console.log("removed nodes continer removed");
}

 function MutationHistory_restoreSerializedMutation(serializedMutation)
 {
	 var mutation, i;
	 
	 /*
	 mutation={
		"type":serializedMutation.type,
		"target": this.restoreSerializedMutationNode(serializedMutation.target, "target"),
		"addedNodes": [],
		"removedNodes": [],
		"previousSibling":  this.restoreSerializedMutationNode(serializedMutation.previousSibling, "previousSibling"),
		"nextSibling":  this.restoreSerializedMutationNode(serializedMutation.nextSibling, "nextSibling"),
		"attributeName": serializedMutation.attributeName,
		"attributeNamespace": serializedMutation.attributeNamespace, 
		"oldValue": serializedMutation.oldValue,
		"newValue": serializedMutation.newValue
		 
	 };
	 */
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
		
		//if(mutation[listName])
		{
			for(var j=0; j<mutation[listName].length; j++)
			{
				mutation[listName][j]=this.restoreSerializedMutationNode(mutation[listName][j]);
			}
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
	 
	 if(!node)
	 {
		 //console.log("MutationHistory.restoreSerializedMutationNode: node not found ("+serializedMutationNode.ID+")"+(serializedMutationNode.hasOwnProperty("index")?", index="+serializedMutationNode.index:""));
	 }
	 
	 return node;
	 
	 
 }
 
 
 function MutationHistory_areMutationsEqual(mutation1, mutation2)
 {
	 var equals=true;
	if(mutation1.type!=mutation2.type)
	{
		//console.log("MutationHistory.areMutationsEqual, different types : "+mutation1.type+"!="+mutation2.type);
		equals=false;
	}
	if(mutation1.attributeName!=mutation2.attributeName)
	{
		//console.log("MutationHistory.areMutationsEqual, different attributeNames : "+mutation1.attributeName+"!="+mutation2.attributeName);
		equals=false;
	}
	if(mutation1.attributeNamespace!=mutation2.attributeNamespace)
	{
		//console.log("MutationHistory.areMutationsEqual, different attributeNamespaces : "+mutation1.attributeNamespace+"!="+mutation2.attributeNamespace);
		equals=false;
	}
	
	if(mutation1.target!=mutation2.target)
	{
		//console.log("MutationHistory.areMutationsEqual, different targets: ");
		//console.logNode(mutation1.target);
		//console.logNode(mutation2.target);
		equals=false;
	}
	
	if(mutation1.previousSibling!=mutation2.previousSibling)
	{
		//console.log("MutationHistory.areMutationsEqual, different previousSiblings: ");
		//console.logNode(mutation1.previousSibling);
		//console.logNode(mutation2.previousSibling);
		equals=false;
	}
	if(mutation1.nextSibling!=mutation2.nextSibling)
	{
		//console.log("MutationHistory.areMutationsEqual, different nextSiblings: ");
		//console.logNode(mutation1.nextSibling);
		//console.logNode(mutation2.nextSibling);
		equals=false;
	}
	
	for(var i=0; i<mutation1.addedNodes.length; i++)
	{
		if(mutation1.addedNodes[i]!=mutation2.addedNodes[i])
		{
			//console.log("MutationHistory.areMutationsEqual, different addedNodes["+i+"]: ");
			//console.logNode(mutation1.addedNodes[i]);
			//console.logNode(mutation2.addedNodes[i]);
			equals=false;
		}
	}
	for(var i=0; i<mutation1.removedNodes.length; i++)
	{
		if(mutation1.removedNodes[i]!=mutation2.removedNodes[i])
		{
			//console.log("MutationHistory.areMutationsEqual, different removedNodes["+i+"]: ");
			//console.logNode(mutation1.removedNodes[i]);
			//console.logNode(mutation2.removedNodes[i]);
			equals=false;
		}
	}
	
	return equals;
 }
 function MutationHistory_getRange()
 {
	var range;
				
	range=this.target.ownerDocument.defaultView.getSelection().getRangeAt(0);
		
	return {"startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset};
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
		//console.log("MutationHistory.setRange: "+err.message);
	}
}
function MutationHistory_onSelectionChanged(evt)
 {
	
	var range;
	
	if( ( evt.type=="keyup" && evt.keyCode!=37 && evt.keyCode!=38 && evt.keyCode!=39 && evt.keyCode!=40 )
		||
		(evt.type=="keypress" && ( evt.keyCode==37 || evt.keyCode==38 || evt.keyCode==39 || evt.keyCode==40) ) )
	{
		return;
	}
	//console.log(evt.type);
	//range=this.getRange();
	
	this.lastRangeBeforeDOMChanges=this.getRange();//{"startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset};
	
	 
	if(this.selectionChangeObserver)
	{
		this.selectionChangeObserver[0][this.selectionChangeObserver[1]](evt);
	}
	
 }