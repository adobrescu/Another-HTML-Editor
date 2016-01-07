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
	prototype.splitToNode=Node_splitToNode;
	prototype.getIndex=Node_getIndex;
	
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
 * Splits the node at a given offset and returns the new created node.
 * 
 * @param {integer} offset - where to split; for text nodes is char offset, for elements if child node index or a child node element
 * @params (boolean} toLeft - where to create the new node; false/undefined -> before this node, true -> after this node
 * @returns {Node}
 */
function Node_split(offset, toLeft)
{
	var newNode;
	
	if(this.isText())
	{
		//split a text node
		if(offset>0 && offset<this.textContent.length)
		{
			newNode=this.ownerDocument.createTextNode(this.textContent.substr(toLeft?0:offset, toLeft?offset:this.textContent.length-offset));
			
			this.textContent=this.textContent.substr(toLeft?offset:0, toLeft ?this.textContent.length-offset :offset);
			
			this.parentNode[toLeft?"insertBefore":"insertAfter"](newNode, this);
		}

		return newNode;
	}
	
	if(typeof(offset)=="number")
	{
		offset=this.childNodes[offset];
	}
	newNode=this.cloneNode(false); //do not clone child nodes
	
	if(toLeft)
	{
		for(var childNode=this.firstChild; childNode!=offset; childNode=this.firstChild)
		{
			newNode.appendChild(this.removeChild(childNode));
		}
		this.removeAttribute("id");
		this.parentNode.insertBefore(newNode, this);
	}
	else
	{
		newNode.removeAttribute("id");
		for(var childNode=offset.nextSibling; childNode; childNode=offset.nextSibling)
		{
			newNode.appendChild(this.removeChild(childNode));
		}
		this.parentNode.insertAfter(newNode, this);
	}
	return newNode;
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
/**
 * 
 * Node.splitToNode
 * 
 * Splits the node at a given child node and offset
 * 
 * @returns {undefined}
 */
function Node_splitToNode(childNode, offset, toLeft)
{
	if(childNode.isElement())
	{
		childNode=childNode.childNodes[offset];
	}
	var newNode;
	
	for(; childNode!=this; childNode=childNode.parentNode)
	{
		newNode=childNode.split(offset, toLeft);
		
		offset=childNode;
	}
	return toLeft?offset:newNode;
}
/**
 * Node.getIndex
 * 
 * returns the index in parent.childNodes
 * 
 * @returns {undefined}
 */
function Node_getIndex()
{
	for(var i=0; i<this.parentNode.childNodes.length; i++)
	{
		if(this.parentNode.childNodes[i]==this)
		{
			return i;
		}
	}
}