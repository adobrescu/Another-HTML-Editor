Node.prototype.insertAfter=Node_insertAfter;
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