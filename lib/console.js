console.logNode=function(node, endMsg, closeTag, startMsg)
{
	if(!node)
	{
		console.log((startMsg?startMsg:"")+"Not a node: "+(endMsg?endMsg+" ":"")+node);
		return;
	}
	this.log((startMsg?startMsg:"")+(node.nodeType==3?(closeTag?"":"> ")+"\""+node.textContent+"\""+(closeTag?" <":""):""+(node.nodeType==1?"<"+(closeTag?"/":"")+(node.tagName+(node.id?"#"+node.id:"")+">"):node.nodeType))+(endMsg?endMsg+" ":""));
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
console.logMutationRecord=function(rec, i)
{
	console.log(i+". "+rec.type);
		console.logNode(rec.target, "", "", "Target: ");
		
		if(rec.previousSibling)
		{
			console.logNode(rec.previousSibling, "", "", "Previous sibling:" );
		}
		if(rec.nextSibling)
		{
			console.logNode(rec.nextSibling, "", "", "Next sibling:" );
		}
		
		switch(rec.type)
		{
			case "characterData":
				console.log("\""+rec.oldValue+"\" -> \""+rec.target.textContent+"\"");
				break;
			case "attributes":
				console.log(rec.attributeName+": "+rec.oldValue+" -> "+rec.target[rec.attributeName]);
				break;
			case "childList":
				if(rec.addedNodes.length>0)
				{
					console.log("addedNodes ("+rec.addedNodes.length+"): ");
					for(var j=0; j<rec.addedNodes.length; j++)
					{
						console.logNode(rec.addedNodes[j]);
					}
				}
				if(rec.removedNodes.length>0)
				{
					console.log("removedNodes ("+rec.removedNodes.length+")");
					for(var j=0; j<rec.removedNodes.length; j++)
					{
						console.logNode(rec.removedNodes[j]);
					}
				}
				break;
		}
		console.log("--------------------------------------------");
}
console.logMutation=function(mutation)
{
	var rec;
	
	for(var i=0; i<mutation.records.length; i++)
	{
		
		rec=mutation.records[i];
		console.logMutationRecord(rec, i);
	}
}