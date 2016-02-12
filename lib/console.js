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
console.logNodes=function(nodes, msg)
{
	var str="";
	
	for(var i=0; i<nodes.length; i++)
	{
		if(!nodes[i])
		{
			str+="Null";
		}
		else
		if(nodes[i].isText())
		{
			str+="Text ("+nodes[i].textContent.length+"): "+nodes[i].textContent;
		}
		else
		{
			str+="<"+nodes[i].tagName+(nodes[i].id?"#"+nodes[i].id:"")+">";
		}
		
		str+=" | ";
	}
	
	console.log((msg?msg+": ":"")+str);
}
console.logMutation=function(mutation)
{
	var rec;
	
	for(var i=0; i<mutation.records.length; i++)
	{
		console.log(i+": ");
		rec=mutation.records[i];
		console.log(rec.type);
		switch(rec.type)
		{
			case "childList":
				if(rec.addedNodes.length>0)
				{
					console.log("addedNodes: ");
					for(var j=0; j<rec.addedNodes.length; j++)
					{
						console.logNode(rec.addedNodes[j]);
					}
				}
				if(rec.removedNodes.length>0)
				{
					console.log("removedNodes");
					for(var j=0; j<rec.removedNodes.length; j++)
					{
						console.logNode(rec.removedNodes[j]);
					}
				}
				break;
		}
		
	}
}