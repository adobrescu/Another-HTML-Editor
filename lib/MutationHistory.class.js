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
	
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
	
	prototype.onDOMMutations=MutationHistory_onDOMMutations;
	
	prototype.setStyleAttribute=MutationHistory_setStyleAttribute;
	
	prototype.undo=MutationHistory_undo;
	prototype.redo=MutationHistory_redo;
	
	prototype.undoChildList=MutationHistory_undoChildList;
	prototype.undoAttributes=MutationHistory_undoAttributes;
	prototype.undoCharacterData=MutationHistory_undoCharacterData;
	
	prototype.redoChildList=MutationHistory_redoChildList;
	prototype.redoAttributes=MutationHistory_redoAttributes;
	prototype.redoCharacterData=MutationHistory_redoCharacterData;
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
	
	this.mutations[mutationsBatchIndex]=[];
	
	for(var i=0; i<mutations.length; i++)
	{
		//console.log(mutations[i].type);
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
		
		this.mutations[mutationsBatchIndex][i]=mutations[i];
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
		element.oldStyle[styleAttributeName]=element.style[styleAttributeName];
	}
	
	element.style[styleAttributeName]=styleAttributeValue;
}
function MutationHistory_undo()
{	
	/* first stop observing the target*/
	this.disconnect();
	for(var mutationsBatchIndex=this.mutations.length-1; mutationsBatchIndex>=0; mutationsBatchIndex--)
	{
		for(var i=this.mutations[mutationsBatchIndex].length-1; i>=0; i--)
		{			
			switch(this.mutations[mutationsBatchIndex][i].type)
			{
				case "childList":
					this.undoChildList(this.mutations[mutationsBatchIndex][i]);
					break;
				case "attributes":
					this.undoAttributes(this.mutations[mutationsBatchIndex][i]);
					break;
				case "characterData":
					this.undoCharacterData(this.mutations[mutationsBatchIndex][i]);
					break;
			}
			
			
		}
	}
	/* restart observing the target*/
	this.observe();
}
function MutationHistory_redo()
{
	var mutationsBatchIndex=0;
	
	for(var i=0; i<this.mutations[mutationsBatchIndex].length; i++)
	{
		switch(this.mutations[mutationsBatchIndex][i].type)
		{
			case "childList":
				this.redoChildList(this.mutations[mutationsBatchIndex][i]);
				break;
			case "attributes":
				this.redoAttributes(this.mutations[mutationsBatchIndex][i]);
				break;
			case "characterData":
				this.redoCharacterData(this.mutations[mutationsBatchIndex][i]);
				break;
		}		
	}
}
function MutationHistory_undoChildList(mutation)
{
	console.log("undo childList");
	if(mutation.addedNodes)
	{
		for(var i=0; i<mutation.addedNodes.length; i++)
		{
			mutation.target.removeChild(mutation.addedNodes[i]);
			console.log(mutation.addedNodes[i].tagName);
		}
	}
}
function MutationHistory_undoAttributes(mutation)
{
	//console.log("undo attributes");
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
	//console.log("undo characterData");
}
function MutationHistory_redoChildList(mutation)
{
	console.log("redo childList");
}
function MutationHistory_redoAttributes(mutation)
{
}
function MutationHistory_redoCharacterData(mutation)
{
	console.log("redo characterData");
}