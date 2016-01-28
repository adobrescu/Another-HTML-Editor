console.logNode=function(node, endMsg, closeTag, startMsg)
{
	if(!node)
	{
		console.log((startMsg?startMsg:"")+"Not a node: "+(endMsg?endMsg+" ":"")+node);
		return;
	}
	this.log((startMsg?startMsg:"")+(node.nodeType==3?(closeTag?"":"> ")+node.textContent+(closeTag?" <":""):""+(node.nodeType==1?"<"+(closeTag?"/":"")+(node.tagName+(node.id?"#"+node.id:"")+">"):node.nodeType))+(endMsg?endMsg+" ":""));
}
console.logNode2=function(node, offset, msg, closeTag)
{
	this.logNode(node, " ("+offset+")", closeTag, msg);
}
