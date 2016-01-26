
function MutationHistory(target, serializedHistory, removedNodesContainerInnerHTML, selectionChangeObserver)
{
	
	MutationHistory.prototype.___instances[MutationHistory.prototype.___numInstances]=this;
	
	this.target=target;
	
	if(serializedHistory)
	{
		this.restoreSerializedHistory(serializedHistory, removedNodesContainerInnerHTML);
	}
	
	
	this.mutationObserver=new MutationObserver(new Function("mutations", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onDOMMutations(mutations)" ));
	this.mutationObserverConfig={attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true};
	this.selectionChangeObserver=selectionChangeObserver;
	
	
	this.target.addEventListener("mouseup", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChanged(evt)" ));
	this.target.addEventListener("keypress", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChanged(evt)" ));
	this.target.addEventListener("onpaste", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChanged(evt)" ));
	this.target.addEventListener("oncut", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onSelectionChanged(evt)" ));
	
	//this.target.ownerDocument.defaultView.addEventListener("beforeunload", new Function("evt", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].sendToServer(evt)" ));
	
	MutationHistory.prototype.___numInstances++;
	
	
}
with(MutationHistory)
{
	prototype.___numInstances=0;
	prototype.___instances=[];
	
	prototype.target=null;
	prototype.mutationObserver=null;
	prototype.mutationObserverConfig=null;
	prototype.mutations=[];
	prototype.mutationsBatchIndex=-1;
	prototype.numIDs=0;
	prototype.removedNodesContainer=null;
	prototype.selectionChangeObserver=null;
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
	
	prototype.startMutationsBatch=MutationHistory_startMutationsBatch;
	prototype.onDOMMutations=MutationHistory_onDOMMutations;
	
	
	prototype.setStyleAttribute=MutationHistory_setStyleAttribute;
	
	
	prototype.undo=MutationHistory_undo;
	prototype.redo=MutationHistory_redo;
	
	prototype.addNodes=MutationHistory_addNodes;
	prototype.removeNodes=MutationHistory_removeNodes;
	
	prototype.undoChildList=MutationHistory_undoChildList;
	prototype.undoAttributes=MutationHistory_undoAttributes;
	prototype.undoCharacterData=MutationHistory_undoCharacterData;
	
	prototype.redoChildList=MutationHistory_redoChildList;
	prototype.redoAttributes=MutationHistory_redoAttributes;
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
	var mutationsBatchIndex=this.mutations.length;
	
	this.mutationsBatchIndex++;
	
	if(this.mutationsBatchIndex<this.mutations.length-1)
	{
		this.mutations.splice(this.mutationsBatchIndex+1, this.mutations.length-this.mutationsBatchIndex+1);
	}
	
	if(typeof(this.mutations[this.mutationsBatchIndex])=="undefined")
	{
		this.mutations[this.mutationsBatchIndex]=[];		
	}
	var numExistingMutations=this.mutations[this.mutationsBatchIndex].length;

	for(var i=0; i<mutations.length; i++)
	{
		if(mutations[i].type=="characterData")
		{
			mutations[i].newValue=mutations[i].target.textContent;
		}
		else
		if(mutations[i].type=="attributes")
		{
			if(mutations[i].attributeName!="style")
			{
				mutations[i].newValue=mutations[i].target[mutations[i].attributeName];
			}
			else
			{
				/*
				 * Save oldStyle property set by setStyleAttribute, and its current style values
				 * Then wipeout oldStyle so next bunch of setStyleAttribute will set only those style changes
				 */
				mutations[i].oldStyle={};
				mutations[i].oldStyle=mutations[i].target.oldStyle;
				mutations[i].target.oldStyle={};
				
				mutations[i].newStyle={};
				for(var styleAttributeName in mutations[i].oldStyle)
				{
					mutations[i].newStyle[styleAttributeName]=mutations[i].target.style[styleAttributeName];
				}
			}
		}
				
		this.mutations[this.mutationsBatchIndex][i+numExistingMutations]=mutations[i];
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
function MutationHistory_undo()
{	
	
	if(this.mutationsBatchIndex<0)
	{
		return;//nothing to undo
	}
	
	/* first stop observing the target*/
	this.disconnect();
		
	for(var i=this.mutations[this.mutationsBatchIndex].length-1; i>=0; i--)
	{
		switch(this.mutations[this.mutationsBatchIndex][i].type)
		{
			case "childList":
				this.undoChildList(this.mutations[this.mutationsBatchIndex][i]);
				break;
			case "attributes":
				this.undoAttributes(this.mutations[this.mutationsBatchIndex][i]);
				break;
			case "characterData":
				this.undoCharacterData(this.mutations[this.mutationsBatchIndex][i]);
				break;
		}		
	}
	
	this.mutationsBatchIndex--;
	/* restart observing the target*/
	this.observe();
}
function MutationHistory_redo()
{
	if(this.mutationsBatchIndex>this.mutations.length-2)
	{
		return;
	}
	
	/* first, stop observing the target*/
	this.disconnect();
	this.mutationsBatchIndex++;
	
	for(var i=0; i<this.mutations[this.mutationsBatchIndex].length; i++)
	{
		switch(this.mutations[this.mutationsBatchIndex][i].type)
		{
			case "childList":
				this.redoChildList(this.mutations[this.mutationsBatchIndex][i]);
				break;
			case "attributes":
				this.redoAttributes(this.mutations[this.mutationsBatchIndex][i]);
				break;
			case "characterData":
				this.redoCharacterData(this.mutations[this.mutationsBatchIndex][i]);
				break;
		}		
	}
	
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
	if(mutation.nextSibling)
	{
		mutation.target.insertBefore(mutation[childNodesListName][0], mutation.nextSibling);
	}
	else
	if(mutation.previousSibling)
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
	mutation.target.textContent=mutation.oldValue;
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
function MutationHistory_redoCharacterData(mutation)
{
	//console.log("MutationHistory_redoCharacterData");
	//console.logNode(mutation.target, " -> "+mutation.newValue, false);
	//console.log("----------------------------");
	mutation.target.textContent=mutation.newValue;
}
function MutationHistory_logMutation(mutation, msg)
{
	console.log("------------------------------------------------------");
	//console.log("Log Mutation for: "+this.target.tagName+(this.target.id?" #"+this.target.id:"")+(msg?": "+msg:""));
	console.log("Target: "+(mutation.target.nodeType==3?"Text":mutation.target.tagName+(mutation.target.id?" #"+mutation.target.id:"")));
	
	if(mutation.type=="characterData")
	{
		console.log("Text: "+mutation.target.textContent);
		return;
	}
	if(mutation.type=="attributes")
	{
		if(mutation.attributeName=="style")
		{
			console.log("Style");
			for(var styleAttrName in mutation.oldStyle)
			{
				console.log(styleAttrName+": "+mutation.oldStyle[styleAttrName]+" -> "+mutation.target.style[styleAttrName]);
			}
		}
		else
		{
			console.log(mutation.attributeName+": "+(mutation.oldValue===null?"":mutation.oldValue)+" -> "+mutation.target[mutation.attributeName]);
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
		console.log(listName+": "+info);
		
	}
	
}

function MutationHistory_logObject(obj)
{
	console.log("------------------------------------------------------");
	console.log("Log Object: ");
	for(var str in obj)
	{
		if(typeof(obj[str])=="function")
		{
			continue;
		}
		console.log(str+" :" +typeof(obj[str]));
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
			console.log(info);
			k++;
		}
		
	}
	
}
function MutationHistory_sendToServer()
{
	var xmlHttp, serializedHistory, postData;
	
	
	postData="serializedHistory="+JSON.stringify(this.serialize())+"&innerHTML="+this.target.innerHTML+"&removedNodesContainerInnerHTML="+this.removedNodesContainer.innerHTML;
	
	console.log(this.target.ownerDocument.defaultView.parent.location+"?message=test123axxa");
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
	
	
	serializedHistory=[];
	
	for(var i=0; i<this.mutations.length; i++)
	{
		serializedHistory[i]=[];
		for(var j=0; j<this.mutations[i].length; j++)
		{
			serializedHistory[i][j]=this.serializeMutation(this.mutations[i][j]);
		}
	}
	//alert(this.removedNodesContainer.innerHTML);
	return serializedHistory;
	
}

function MutationHistory_serializeMutation(mutation)
{
	var serializedMutation, i;
	
	serializedMutation={
		"type": mutation.type,
		"target": this.serializeMutationNode(mutation.target),
		"addedNodes": [],
		"removedNodes": [],
		"previousSibling": this.serializeMutationNode(mutation.previousSibling),
		"nextSibling": this.serializeMutationNode(mutation.nextSibling),
		"attributeName": mutation.attributeName?mutation.attributeName:"",
		"attributeNamespace": mutation.attributeNamespace?mutation.attributeNamespace:"",
		"oldValue": mutation.oldValue?mutation.oldValue:"",
		"newValue": mutation.newValue?mutation.newValue:""
	};
	
	for(i=0; i<mutation.addedNodes.length; i++)
	{
		serializedMutation.addedNodes[serializedMutation.addedNodes.length]=this.serializeMutationNode(mutation.addedNodes[i]);
	}
	for(i=0; i<mutation.removedNodes.length; i++)
	{
		
		serializedMutation.removedNodes[serializedMutation.removedNodes.length]=this.serializeMutationNode(mutation.removedNodes[i]);
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
function MutationHistory_restoreSerializedHistory(serializedHistory, removedNodesContainerInnerHTML)
{
	
	this.removedNodesContainer=this.target.ownerDocument.createElement("div", true);
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
	this.removedNodesContainer.innerHTML=removedNodesContainerInnerHTML;
	this.removedNodesContainer.style.border="10px red solid";
	this.target.ownerDocument.body.appendChild(this.removedNodesContainer);
	
	//alert(this.target.ownerDocument.getElementById("mhid_SPAN_7"));
	serializedHistory=JSON.parse(serializedHistory);
	//console.log(serializedHistory.length);
	for(var i=0; i<serializedHistory.length; i++)
	{
		this.mutations[i]=[];
		for(var j=0; j<serializedHistory[i].length; j++)
		{
			this.mutations[i][j]=this.restoreSerializedMutation(serializedHistory[i][j]);
			//alert(serializedHistory[i][j].target.textParentID);
		}
	}
	this.mutationsBatchIndex=this.mutations.length-1;
	//this.removedNodesContainer.innerHTML="";
	//alert(removedNodesContainerInnerHTML);
	//this.target.ownerDocument.body.removeChild(this.removedNodesContainer);
	console.log("removed nodes continer removed");
}

 function MutationHistory_restoreSerializedMutation(serializedMutation)
 {
	 var mutation, i;
	 
	 
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
	 
	 for(i=0; i<serializedMutation.addedNodes.length; i++)
	 {
		 mutation.addedNodes[mutation.addedNodes.length]=this.restoreSerializedMutationNode(serializedMutation.addedNodes[i], "addedNodes");
		 if(!mutation.addedNodes[mutation.addedNodes.length-1])
		 {
			 //alert("DA"+mutation.target.tagName+"#"+mutation.target.id);
		 }
	 }
	 for(i=0; i<serializedMutation.removedNodes.length; i++)
	 {
		 mutation.removedNodes[mutation.removedNodes.length]=this.restoreSerializedMutationNode(serializedMutation.removedNodes[i], "removedNodes");
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
		 console.log("MutationHistory.restoreSerializedMutationNode: node not found ("+serializedMutationNode.ID+")"+(serializedMutationNode.hasOwnProperty("index")?", index="+serializedMutationNode.index:""));
	 }
	 
	 return node;
	 
	 
 }
 
 
 function MutationHistory_areMutationsEqual(mutation1, mutation2)
 {
	 var equals=true;
	if(mutation1.type!=mutation2.type)
	{
		console.log("MutationHistory.areMutationsEqual, different types : "+mutation1.type+"!="+mutation2.type);
		equals=false;
	}
	if(mutation1.attributeName!=mutation2.attributeName)
	{
		console.log("MutationHistory.areMutationsEqual, different attributeNames : "+mutation1.attributeName+"!="+mutation2.attributeName);
		equals=false;
	}
	if(mutation1.attributeNamespace!=mutation2.attributeNamespace)
	{
		console.log("MutationHistory.areMutationsEqual, different attributeNamespaces : "+mutation1.attributeNamespace+"!="+mutation2.attributeNamespace);
		equals=false;
	}
	
	if(mutation1.target!=mutation2.target)
	{
		console.log("MutationHistory.areMutationsEqual, different targets: ");
		console.logNode(mutation1.target);
		console.logNode(mutation2.target);
		equals=false;
	}
	
	if(mutation1.previousSibling!=mutation2.previousSibling)
	{
		console.log("MutationHistory.areMutationsEqual, different previousSiblings: ");
		console.logNode(mutation1.previousSibling);
		console.logNode(mutation2.previousSibling);
		equals=false;
	}
	if(mutation1.nextSibling!=mutation2.nextSibling)
	{
		console.log("MutationHistory.areMutationsEqual, different nextSiblings: ");
		console.logNode(mutation1.nextSibling);
		console.logNode(mutation2.nextSibling);
		equals=false;
	}
	
	for(var i=0; i<mutation1.addedNodes.length; i++)
	{
		if(mutation1.addedNodes[i]!=mutation2.addedNodes[i])
		{
			console.log("MutationHistory.areMutationsEqual, different addedNodes["+i+"]: ");
			console.logNode(mutation1.addedNodes[i]);
			console.logNode(mutation2.addedNodes[i]);
			equals=false;
		}
	}
	for(var i=0; i<mutation1.removedNodes.length; i++)
	{
		if(mutation1.removedNodes[i]!=mutation2.removedNodes[i])
		{
			console.log("MutationHistory.areMutationsEqual, different removedNodes["+i+"]: ");
			console.logNode(mutation1.removedNodes[i]);
			console.logNode(mutation2.removedNodes[i]);
			equals=false;
		}
	}
	
	return equals;
 }
 function MutationHistory_onSelectionChanged(evt)
 {
	 console.log("MutationHistory.onSelectionChanged: "+evt.type);
	 
	 if(this.selectionChangeObserver)
	 {
		 this.selectionChangeObserver[0][this.selectionChangeObserver[1]](evt);
	 }
	 alert("DA");
 }