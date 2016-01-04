
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
	
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
	
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
	
}
function MutationHistory_observe()
{
	this.mutationObserver.observe(this.target, this.mutationObserverConfig);
}
function MutationHistory_disconnect()
{
	this.mutationObserver.disconnect();
}
function MutationHistory_onDOMMutations(mutations)
{
	var mutationsBatchIndex=this.mutations.length;
	
	if(this.mutationsBatchIndex<this.mutations.length-1)
	{
		this.mutations.splice(this.mutationsBatchIndex+1, this.mutations.length-this.mutationsBatchIndex+1);
	}
	this.mutationsBatchIndex++;
	this.mutations[this.mutationsBatchIndex]=[];
	
	for(var i=0; i<mutations.length; i++)
	{
		this.logMutation(mutations[i]);
		
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
		
		this.mutations[this.mutationsBatchIndex][i]=mutations[i];
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
		catch(Err)
		{
			this.logObject(element)
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
	console.log("Undo "+this.mutationsBatchIndex+" from "+(this.mutations.length-1));
	console.log("Undo length: "+(this.mutations[this.mutationsBatchIndex].length)+"("+")");
	/* first stop observing the target*/
	this.disconnect();
	
	for(var i=this.mutations[this.mutationsBatchIndex].length-1; i>=0; i--)
	{
		this.logMutation(this.mutations[this.mutationsBatchIndex][i], i);
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
	console.log("Redo "+this.mutationsBatchIndex+" from "+(this.mutations.length-1));
	console.log("Redo length: "+(this.mutations[this.mutationsBatchIndex].length)+"("+")");
	for(var i=0; i<this.mutations[this.mutationsBatchIndex].length; i++)
	{
		this.logMutation(this.mutations[this.mutationsBatchIndex][i], i);
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
	console.log("End redo");
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
			alert(mutation[childNodesListName][i].tagName+": "+mutation[childNodesListName][i].innerHTML);
			alert(this.target.innerHTML);
		}
		mutation.target.removeChild(mutation[childNodesListName][i]);
		
		//mutation[childNodesListName][i].parentNode.removeChild(mutation[childNodesListName][i]);
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
	
	mutation.target[mutation.attributeName]=mutation.oldValue===null?"":mutation.oldValue;
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
	console.log("Log Mutation"+(msg?": "+msg:""));
	console.log("Target: "+(mutation.target.nodeType==3?"Text":mutation.target.tagName+(mutation.target.id?" #"+mutation.target.id:"")));
	
	if(mutation.type=="characterData")
	{
		console.log("Text: "+mutation.target.textContent);
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
			info+=(info?"\n":"")+mutation[listName][i].nodeType==3?"Text: "+mutation[listName][i].textContent:(mutation[listName][i].tagName+(mutation[listName][i].id?" #"+mutation[listName][i].id:""))+": "+mutation[listName][i].innerHTML;
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