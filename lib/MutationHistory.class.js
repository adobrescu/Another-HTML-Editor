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
		if(mutations[i].type=="attributes" && mutations[i].attributeName=="style")
		{
			/*
			 * Save oldStyle property set by setStyleAttribute, and its current style values
			 * Then wipeout oldStyle so next bunch of setStyleAttribute will set only those style changes
			 */
			mutations[i].oldStyle={};
			mutations[i].oldStyle=mutations[i].target.oldStyle;
			mutations[i].target.oldStyle={};
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
}
function MutationHistory_undoChildList(mutation)
{
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
}