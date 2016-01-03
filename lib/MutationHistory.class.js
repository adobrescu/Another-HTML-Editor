function MutationHistory(target)
{
	this.target=target;
	this.mutationObserver=new MutationObserver(onDOMChange);
	this.mutationObserverConfig={attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true};
}
with(MutationHistory)
{
	prototype.target=null;
	prototype.mutationObserver=null;
	prototype.mutationObserverConfig=null;
	
	
	prototype.observe=MutationHistory_observe;
	prototype.disconnect=MutationHistory_disconnect;
}
function MutationHistory_observe()
{
}
function MutationHistory_disconnect()
{
}