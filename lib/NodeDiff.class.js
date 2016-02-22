function NodeDiff(rootNode)
{
	this.rootNode=rootNode;
	this.rootNodeClone=rootNode.cloneNode(true, true);
	
	this.storeTextNodesReferences=navigator.userAgent.indexOf("Edge")!=-1?true:false;
	this.textNodesReferences=[];
	this.mutations=[];
	
	this.createReferences(this.rootNode, this.rootNodeClone);
}

Object.defineProperty(NodeDiff, "MUTATION_CHARACTER_DATA", { "value": 1 } );
Object.defineProperty(NodeDiff, "MUTATION_ATTRIBUTES", { "value": 2 } );
Object.defineProperty(NodeDiff, "MUTATION_REMOVE_NODE", { "value": 3 } );
Object.defineProperty(NodeDiff, "MUTATION_ADD_NODE", { "value": 4 } );

with(NodeDiff)
{
	prototype.release=NodeDiff_release;
	prototype.releaseReferences=NodeDiff_releaseReferences;
	prototype.createReferences=NodeDiff_createReferences;
	prototype.visit=NodeDiff_visit;
	prototype.cloneNode=NodeDiff_cloneNode;

	prototype.diff=NodeDiff_diff;
	prototype.compare=NodeDiff_compare;
	prototype.compareCharacterData=NodeDiff_compareCharacterData;
	prototype.compareAttributes=NodeDiff_compareAttributes;
	prototype.compareChildList=NodeDiff_compareChildList;
	prototype.recordCharacterDataMutation=NodeDiff_recordCharacterDataMutation;
	prototype.recordAttributeaMutation=NodeDiff_recordAttributeaMutation;
	prototype.recordChildListAddedNodesMutation=NodeDiff_recordChildListAddedNodesMutation;
	prototype.recordChildListRemovedNodesMutation=NodeDiff_recordChildListRemovedNodesMutation;
	prototype.getNodeCloneIndex=NodeDiff_getNodeCloneIndex;
	prototype.getNotMovedChildNodes=NodeDiff_getNotMovedChildNodes;
}

function NodeDiff_releaseReferences(node, nodeClone)
{
	node.refClone=null;
	nodeClone.refOriginal=null;
}
function NodeDiff_release()
{
	this.visit(this.rootNode, this.rootNodeClone, [this, "releaseReferences"]);
	this.rootNode=null;
	this.rootNodeClone=null;
	this.mutations=[];
}
function NodeDiff_createReferences(node, nodeClone)
{
	node.refClone=nodeClone;
	nodeClone.refOriginal=node;
	
	if(this.storeTextNodesReferences)// && node.isText() )
	{
		this.textNodesReferences[this.textNodesReferences.length]=[node, nodeClone];
	}
	if(!node.hasChildNodes())
	{
		return;
	}
	
	for(var i=0; i<node.childNodes.length; i++)
	{
		this.createReferences(node.childNodes[i], nodeClone.childNodes[i]);
	}
}
function NodeDiff_visit(node, nodeClone, callback, ca)
{
	
	callback[0][callback[1]](node, nodeClone, ca);
	
	if(!node.hasChildNodes())
	{
		return;
	}
	
	for(var i=0; i<node.childNodes.length; i++)
	{
		this.visit(node.childNodes[i], nodeClone.childNodes[i], callback, ca);
	}
}
function NodeDiff_cloneNode(node, ca)
{
	var nodeClone, ca;
	
	nodeClone=node.cloneNode(false, true);
	
	nodeClone.refOriginal=node;
	node.refClone=nodeClone;
	
	if(this.storeTextNodesReferences)// && node.isText() )
	{
		this.textNodesReferences[this.textNodesReferences.length]=[node, nodeClone];
	}
	
	if(node.hasChildNodes())
	{
		for(var i=0; i<node.childNodes.length; i++)
		{
			if(node.childNodes[i].refClone)
			{
				ca.modifiedNodes[ca.modifiedNodes.length]={"node": node.childNodes[i], "type": NodeDiff.MUTATION_REMOVE_NODE};
				ca.modifiedNodes[ca.modifiedNodes.length]={"node": node.childNodes[i], "type": NodeDiff.MUTATION_ADD_NODE};
				continue;
			}
			nodeClone.appendChild(this.cloneNode(node.childNodes[i], ca));
		}
	}
	
	return nodeClone;
}
function NodeDiff_diff()
{
	var ca;
	
	ca={"modifiedNodes": []};
	
	this.compare(this.rootNodeClone, ca);
	
	for(var i=0; i<ca.modifiedNodes.length; i++)
	{
		switch(ca.modifiedNodes[i].type)
		{
			case NodeDiff.MUTATION_CHARACTER_DATA:
				this.recordCharacterDataMutation(ca.modifiedNodes[i].node);
				break;
			case NodeDiff.MUTATION_ATTRIBUTES:
				this.recordAttributeaMutation(ca.modifiedNodes[i].node, ca.modifiedNodes[i].attributeIndex);	
				break;
			case NodeDiff.MUTATION_REMOVE_NODE:
				this.recordChildListRemovedNodesMutation(ca.modifiedNodes[i].node);
				break;
			case NodeDiff.MUTATION_ADD_NODE:
				this.recordChildListAddedNodesMutation(ca.modifiedNodes[i].node, true);
				break;
		}
	}
}
function NodeDiff_compare(nodeClone, ca)
{
	if(nodeClone.isText())
	{
		this.compareCharacterData(nodeClone, ca);
		return;
	}
	
	this.compareAttributes(nodeClone, ca);
		
	this.compareChildList(nodeClone, ca);
	
	for(var i=0; i<nodeClone.childNodes.length; i++)
	{
		this.compare(nodeClone.childNodes[i], ca);
	}
}
function NodeDiff_compareCharacterData(nodeClone, ca)
{
	if(nodeClone.textContent!=nodeClone.refOriginal.textContent)
	{
		ca.modifiedNodes[ca.modifiedNodes.length]={"node": nodeClone.refOriginal, "type": NodeDiff.MUTATION_CHARACTER_DATA};
	}
}
function NodeDiff_compareAttributes(nodeClone, ca)
{
	var node, i;
	
	node=nodeClone.refOriginal;
	
	for(i=0; i<node.attributes.length; i++)
	{
		if(!nodeClone.hasAttribute(node.attributes[i].name) || node.attributes[i].value!=nodeClone.attributes[i].value)
		{
			ca.modifiedNodes[ca.modifiedNodes.length]={"node": nodeClone.refOriginal, "type": NodeDiff.MUTATION_ATTRIBUTES, "attributeIndex": i};
		}
    }
}
function NodeDiff_compareChildList(nodeClone, ca)
{
	var node;
	
	node=nodeClone.refOriginal;
	
	/*
	 * Se cauta ce noduri child au ramas "la locul lor".
	 *  -""- cea mai lunga lista de noduri child care apar si in nodul originar si care au ramas in
	 *  aceeasi succesiune. Chiar daca intre ele au aparut alte noduri sau noduri originale au fost sterse.
	 *  
	 *  De ex.:
	 *  
	 *  original: n1 n2 n3 n4 n5 n6
	 *  
	 *  dupa ce se fac modificari: n2 x x n1 xx n3 x x x n4 x x n6 n5
	 *  
	 *  Secventa cautata ar fi: n1 n3 n4
	 *  
	 *  Lista asta nu trebuie sa fie prea sofisticata, singura chestie e ca nodurile gasite (n1 n3 n4) nu sint trecute 
	 *  ca facand parte dintr-o mutatie de tip childList
	 *  
	 *  
	 *  vezi NodeDiff.getNotMovedChildNodes
	 */
	
	var notMovedChildNodes=this.getNotMovedChildNodes(nodeClone);
	var i, j, notMoved=false;
	
	/* removed nodes */
	for(i=0; i<nodeClone.childNodes.length; i++)
	{
		if(!this.rootNode.contains(nodeClone.childNodes[i].refOriginal))
		{
			ca.modifiedNodes[ca.modifiedNodes.length]={"node": nodeClone.childNodes[i].refOriginal, "type": NodeDiff.MUTATION_REMOVE_NODE};
		}
	}
	
	for(i=0; i<node.childNodes.length; i++)
	{	
		
		notMoved=false;
		if(node.childNodes[i].refClone)
		{//the has a reference to a clone, it's not a new added node
			for(j=0; j<notMovedChildNodes.length; j++)
			{
				if(node.childNodes[i]==notMovedChildNodes[j])
				{
					notMoved=true;
					break;
				}
			}
			if(notMoved)
			{
				
				continue;
			}
		}
		
		if(node.childNodes[i].refClone)
		{//first add a remove node mutation
			if(node.childNodes[i].refClone.parentNode)
			{
				ca.modifiedNodes[ca.modifiedNodes.length]={"node": node.childNodes[i], "type": NodeDiff.MUTATION_REMOVE_NODE};
			}
		}
		else
		{
			this.cloneNode(node.childNodes[i], ca);
		}
		
		ca.modifiedNodes[ca.modifiedNodes.length]={"node": node.childNodes[i], "type": NodeDiff.MUTATION_ADD_NODE};
	}
	
}
function NodeDiff_recordCharacterDataMutation(originalNode)
{
	this.mutations[this.mutations.length]={"target": originalNode,
					"type": "characterData",
					"addedNodes": [],
					"removedNodes": [],
					"previousSibling": originalNode.refClone.previousSibling?originalNode.refClone.previousSibling.refOriginal:null,
					"nextSibling": originalNode.refClone.nextSibling?originalNode.refClone.nextSibling.refOriginal:null,
					"attributeName": null,
					"attributeNamespace": null,
					"oldValue": originalNode.refClone.textContent
					};
	originalNode.refClone.textContent=originalNode.textContent;
}
function NodeDiff_recordAttributeaMutation(originalNode, attributeIndex)
{
	this.mutations[this.mutations.length]={"target": originalNode,
					"type": "attributes",
					"addedNodes": [],
					"removedNodes": [],
					"previousSibling": originalNode.refClone.previousSibling?originalNode.refClone.previousSibling.refOriginal:null,
					"nextSibling": originalNode.refClone.nextSibling?originalNode.refClone.nextSibling.refOriginal:null,
					"attributeName": originalNode.attributes[attributeIndex].name,
					"attributeNamespace": null,
					"oldValue": originalNode.refClone.hasAttribute(originalNode.attributes[attributeIndex].name) ? originalNode.refClone.attributes[attributeIndex].value:null
					};
	
	originalNode.refClone.setAttribute(originalNode.attributes[attributeIndex].name, originalNode.attributes[attributeIndex].value);
}
function NodeDiff_recordChildListAddedNodesMutation(originalNode, createMutation)
{
	/*
	 * All operations from the left/beginning of originalNode parentNode are recorded.
	 * So its previous siblings wont change (they wont' be deleted or moved).
	 * So its safe to use originalNode previousSibling to determine its position.
	 * If there is a previousSibling, then node is in front of it.
	 * If there is no previousSibling, then the originalNode is its parentNode firstChild
	 */
	if(originalNode.previousSibling)
	{
		originalNode.parentNode.refClone.insertAfter(originalNode.refClone, originalNode.previousSibling.refClone);
	}
	else
	{
		originalNode.parentNode.refClone.prependChild(originalNode.refClone);
	}
	if(!createMutation)
	{
		//just update the clone, do not record the mutation
		return;
	}
	this.mutations[this.mutations.length]={"target": originalNode.parentNode,
					"type": "childList",
					"addedNodes": [originalNode],
					"removedNodes": [],
					"previousSibling": originalNode.refClone.previousSibling?originalNode.refClone.previousSibling.refOriginal:null,
					"nextSibling": originalNode.refClone.nextSibling?originalNode.refClone.nextSibling.refOriginal:null,
					"attributeName": null,
					"attributeNamespace": null,
					"oldValue": null
					};
}
function NodeDiff_recordChildListRemovedNodesMutation(originalNode)
{
	this.mutations[this.mutations.length]={"target":originalNode.refClone.parentNode.refOriginal,
					"type": "childList",
					"addedNodes": [],
					"removedNodes": [originalNode],
					"previousSibling":originalNode.refClone.previousSibling?originalNode.refClone.previousSibling.refOriginal:null,
					"nextSibling":originalNode.refClone.nextSibling?originalNode.refClone.nextSibling.refOriginal:null,
					"attributeName": null,
					"attributeNamespace": null,
					"oldValue": null
					};
	originalNode.refClone.parentNode.removeChild(originalNode.refClone);	
}
function NodeDiff_getNodeCloneIndex(node)
{
	var parentNodeClone;
	
	parentNodeClone=node.parentNode.refClone;
	
	for(var i=0; i<parentNodeClone.childNodes.length; i++)
	{
		if(parentNodeClone.childNodes[i].refOriginal==node)
		{
			return i;
		}
	}
	return -1;
}
function NodeDiff_getNotMovedChildNodes(nodeClone)
{
	var node, seq=[], prevSeq=[];
	var pos, prevPos=null;
	var notMovedChildNodes=[];
	
	node=nodeClone.refOriginal;
	
	for(var i=0; i<node.childNodes.length; i++)
	{
		pos=this.getNodeCloneIndex(node.childNodes[i]);
		
		if(pos==-1)
		{
			continue;
		}
		
		if(prevPos===null || pos>prevPos)
		{
			seq[seq.length]=i;
		}
		else
		{
			if(prevSeq.length<seq.length)
			{
				prevSeq=seq;
			}
			seq=[i];
		}
		
		prevPos=pos;
	}
	if(prevSeq.length<seq.length && seq)
	{
		prevSeq=seq;
	}
	for(var k=0; k<prevSeq.length; k++)
	{
		notMovedChildNodes[notMovedChildNodes.length]=node.childNodes[prevSeq[k]];
	}
	
	return notMovedChildNodes;
}
