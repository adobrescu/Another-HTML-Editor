with(Node)
{
	prototype.isText=Node_isText;
	prototype.isElement=Node_isElement;
	prototype.isEmpty=Node_isEmpty;
	prototype.insertAfter=Node_insertAfter;
	prototype.split=Node_split;
	prototype.getComputedStyle=Node_getComputedStyle;
	prototype.isInline=Node_isInline;
	prototype.getCommonAncestor=Node_getCommonAncestor;
	prototype.getAncestors=Node_getAncestors;
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
function Node_getComputedStyle()
{
	return this.ownerDocument.defaultView.getComputedStyle(this);
}
function Node_isInline()
{
	return this.nodeType==3 || (this.getComputedStyle().display=="inline");
}
function Node_isText()
{
	return this.nodeType==3;
}
function Node_isElement()
{
	return this.nodeType==1;
}
function Node_isEmpty()
{
	if(this.isText())
	{
		return !this.textContent.match(/[^\s]{1}/)
	}
	return true;
}

/**
 * 
 * Node.getAncestors
 * 
 * Returns an array containing all node's ancestors starting with the BODY element
 * 
 * @returns {undefined}
 */
function Node_getAncestors()
{
	var ancestors=[];
	for(var ancestor=this; ancestor; ancestor=ancestor.parentNode)
	{
		ancestors[ancestors.length]=ancestor;
		if(ancestor==this.ownerDocument.body)
		{
			break;
		}
	}
	
	ancestors.reverse();
	
	return ancestors;
}
/**
 * 
 * Node.getCommonAncestor
 * 
 * Finds common ancestor of the node and an other node
 * 
 * @param {type} node
 * @returns {undefined}
 */
function Node_getCommonAncestor(node)
{
	var ancestors, nodeAncestors;
	
	if(this==node)
	{
		return this.parentNode;
	}
	
	ancestors=this.getAncestors();
	nodeAncestors=node.getAncestors();
	
	for(var i=0; i<ancestors.length; i++)
	{
		if(ancestors[i]!=nodeAncestors[i])
		{
			//the previous ancestors is the last the 2 nodes have in comon
			return ancestors[i-1];
		}
	}	
}
}