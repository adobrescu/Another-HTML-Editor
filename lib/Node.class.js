with(Node)
{
	prototype.insertAfter=Node_insertAfter;
	prototype.split=Node_split;
}
function Node_insertAfter(node, afterNode)
{
	if(afterNode && afterNode.nextSibling)
	{
		return this.insertBefore(node, afterNode.nextSibling);
	}
	else
	{
		return this.appendChild(node);
	}
}
/*
 * Node.split
 * 
 * Splits the node at a given offset and returns the left side (which is a new created node)
 * 
 * @param {type} startOffset
 * @returns {undefined}
 */
function Node_split(startOffset, endOffset)
{
	var newNode;
	
	if(this.nodeType==3)
	{
		//split a text node
		if(startOffset>0)
		{
			newNode=this.ownerDocument.createTextNode(this.textContent.substr(0, startOffset));
			this.textContent=this.textContent.substr(startOffset);
			this.parentNode.insertBefore(newNode, this);
			console.log("start");
		}
				
		endOffset-=startOffset;
		
		if(endOffset<this.textContent.length)
		{
			newNode=this.ownerDocument.createTextNode(this.textContent.substr(endOffset));
			this.textContent=this.textContent.substr(0, endOffset);
			this.parentNode.insertAfter(newNode, this);
			console.log("end");
		}
		return newNode;
	}
}
