
function MutationHistory(target)
{
	
	MutationHistory.prototype.___instances[MutationHistory.prototype.___numInstances]=this;
	
	this.target=target;
	this.mutationObserver=new MutationObserver(new Function("mutations", "MutationHistory.prototype.___instances["+MutationHistory.prototype.___numInstances+"].onDOMMutations(mutations)" ));
	this.mutationObserverConfig={attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true};
	
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
	prototype.ranges=[];
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
	
	prototype.getRange=MutationHistory_getRange;
	prototype.setRange=MutationHistory_setRange;
	
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
	
}
function MutationHistory_observe(target)
{
	this.mutationObserver.observe(target?target:this.target, this.mutationObserverConfig);
}
function MutationHistory_disconnect()
{
	this.mutationObserver.disconnect();
}
/**
 * 
 * MutationHistory.getRange
 * 
 * Returns current target window text range only if not empty
 * 
 * @returns {undefined}
 */
function MutationHistory_getRange()
{
	var range;
	
	range=this.target.ownerDocument.defaultView.getSelection().getRangeAt(0);
	
	return range.collapsed ? null : range;
}
function MutationHistory_setRange(startContainer, startOffset, endContainer, endOffset)
{
	var selection, range;
	
	try
	{
		selection=this.target.ownerDocument.defaultView.getSelection();
		range=selection.getRangeAt(0);
	}
	catch(err)
	{
		range=this.target.ownerDocument.createRange();
	}
	
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
	
	selection.addRange(range);
}
function MutationHistory_startMutationsBatch()
{
	this.mutationsBatchIndex++;
	
	var range=this.getRange();
		
	this.ranges[this.mutationsBatchIndex]=range?{"startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset}:null;

}
function MutationHistory_onDOMMutations(mutations)
{
	var mutationsBatchIndex=this.mutations.length;
	
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
	
	console.log("Undo "+this.mutationsBatchIndex+ "("+this.mutations.length+")");
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
	if(this.ranges[this.mutationsBatchIndex])
	{
		this.setRange(this.ranges[this.mutationsBatchIndex].startContainer, this.ranges[this.mutationsBatchIndex].startOffset, this.ranges[this.mutationsBatchIndex].endContainer, this.ranges[this.mutationsBatchIndex].endOffset);
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
	
	console.log("Redo "+this.mutationsBatchIndex+ "("+this.mutations.length+")");
	
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
	if(this.ranges[this.mutationsBatchIndex])
	{
		this.setRange(this.ranges[this.mutationsBatchIndex].startContainer, this.ranges[this.mutationsBatchIndex].startOffset, this.ranges[this.mutationsBatchIndex].endContainer, this.ranges[this.mutationsBatchIndex].endOffset);
	}
	/* restart observing the target*/
	this.observe();
}
function MutationHistory_addNodes(mutation, childNodesListName)
{
	if(mutation.nextSibling)
	{
		mutation.target.insertBefore(mutation[childNodesListName][0], mutation.nextSibling);
	}
	else
	{
		mutation.target.insertAfter(mutation[childNodesListName][0], mutation.previousSibling);
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