function PhrasingContent(editableContent)
{
	//alert(rootNode.ownerDocument.defaultView.getSelection());
	this.crtHighlightElements=[];
	this.highlightElements=[];
	this.editableContent=editableContent;
	var ranges;
	
	ranges=this.editableContent.contentSelection.getRanges();
	console.logNode(ranges[0].startContainer);
	
	
	
	//this.documentContainer=documentContainer;
	var n=this.getLeftBoundary(ranges[0].startContainer);
	
	this.par=this.getFragments(n);
	
	for(var i=0; i<ranges.length; i++)
	{
		if(!this.containsRange(ranges[i]))
		{
			throw new CustomError(0, "Range outside phrasing content");
		}
	}
}
with(PhrasingContent)
{
	prototype.visitContentFragmentNodes=EditableContent.prototype.visitContentFragmentNodes;
	
	
	prototype.isEqualPhrasingContent=PhrasingContent_isEqualPhrasingContent;
	prototype.containsRange=PhrasingContent_containsRange;
	
	prototype.isTagBreakable=PhrasingContent_isTagBreakable;
	prototype.highlight=PhrasingContent_highlight;
	prototype.getNotTransparentBackgroundDescendants=PhrasingContent_getNotTransparentBackgroundDescendants;
	prototype.highlightFragment=PhrasingContent_highlightFragment;
	prototype.removeHighlight=PhrasingContent_removeHighlight;
	prototype.restoreRange=PhrasingContent_restoreRange;
	prototype.removeFragmentHighlight=PhrasingContent_removeFragmentHighlight;
	prototype.getLeftBoundary=PhrasingContent_getLeftBoundary;
	prototype.getFragments=PhrasingContent_getFragments;
	prototype.collectFragmentBoundaries=PhrasingContent_collectFragmentBoundaries;
}
function PhrasingContent_isEqualPhrasingContent(par2)
{
	if(this.par.length!=par2.par.length)
	{
		return false;
	}
	for(var i=0; i<this.par.length; i++)
	{
		if(this.par[i].length!=par2.par[i].length)
		{
			return false;
		}
		for(var j=0; j<this.par[i].length; j++)
		{
			if(this.par[i][j]!=par2.par[i][j])
			{
				return false;
			}
		}
	}
	return true;
}
function PhrasingContent_containsRange(range)
{
	var rsb, reb;
	
	//rsb=this.getRangeBoundary(range, true);
	//reb=this.getRangeBoundary(range, false);
	
	return ( (range.startContainer==this.par[0][0]) || (range.startContainer.compareDocumentPosition(this.par[0][0]) & ( Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS ) ) ) &&
		( (range.endContainer==this.par[this.par.length-1][this.par[this.par.length-1].length-1]) || (range.endContainer.compareDocumentPosition(this.par[this.par.length-1][this.par[this.par.length-1].length-1]) & ( Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINS ) ) );
		
		
}
function PhrasingContent_isTagBreakable(tagName)
{
	for(var i=0; i<EditableContent.prototype.___notBreakableTagNames.length; i++)
	{
		if(tagName==EditableContent.prototype.___notBreakableTagNames[i])
		{
			return false;
		}
	}
	
	return true;
}
function PhrasingContent_highlight()
{
	var i;
	var ranges=this.editableContent.contentSelection.getRanges();//this.getRanges();
			
	for(i=0; i<this.par.length; i++)
	{
		this.highlightFragment(this.par[i]);
	}
	
	this.editableContent.clearSelection();
	for(i=0; i<ranges.length; i++)
	{
		this.restoreRange(ranges[i]);
	}
	
	//this.setSelection(startContainer, startOffset, endContainer, endOffset);
	
}
function PhrasingContent_getNotTransparentBackgroundDescendants(node, ca, close)
{
	var style;
	
	if(node.isText())
	{
		return;
	}
	
	style=node.getComputedStyle();
	if(style.backgroundColor!="transparent")
	{
		ca.nodes[ca.nodes.length]={"node": node, "backgroundColor": style.backgroundColor};
	}
}
function PhrasingContent_highlightFragment(phrasingContentNodes)
{

	if(this.crtHighlightElements.length==this.highlightElements.length)
	{
		this.highlightElements[this.highlightElements.length]=this.editableContent.documentContainer.ownerDocument.createElement("X-HIGHLIGHT");
	}
	
	this.crtHighlightElements[this.crtHighlightElements.length]={"marker": this.highlightElements[this.crtHighlightElements.length], "backgroundChangedNodes": []};
		
	phrasingContentNodes[0].parentNode.insertBefore(this.crtHighlightElements[this.crtHighlightElements.length-1].marker, phrasingContentNodes[0]);
	
	var ca;
	
	ca={"nodes": []};
	
	for(var i=0; i<phrasingContentNodes.length; i++)
	{
		this.crtHighlightElements[this.crtHighlightElements.length-1].marker.appendChild(phrasingContentNodes[i]);
		this.crtHighlightElements[this.crtHighlightElements.length-1].marker.className="";
		
		if(phrasingContentNodes[i].isBlock())
		{
			this.crtHighlightElements[this.crtHighlightElements.length-1].marker.addClassName("block");
		}
		if(!phrasingContentNodes[i].isPhrasingContent())
		{
			this.crtHighlightElements[this.crtHighlightElements.length-1].marker.addClassName("not-phrasing-content");
		}
		
		phrasingContentNodes[i].visitDescendants([this, "getNotTransparentBackgroundDescendants"], ca, false, true);
		
		this.crtHighlightElements[this.crtHighlightElements.length-1].backgroundChangedNodes=ca.nodes;
		
		if(this.crtHighlightElements[this.crtHighlightElements.length-1].backgroundChangedNodes.length==0)
		{
			continue;
		}
		
		for(var j=0; j<ca.nodes.length; j++)
			{
				var arrRGB=ca.nodes[j].backgroundColor.split(",");
				var newBackgroundColor="";
				
				for(var k=0; k<3; k++)
				{
					newBackgroundColor+=arrRGB[k]+",";
				}
				newBackgroundColor=newBackgroundColor.replace(")", "");
				newBackgroundColor+=" 0.2)";
				if(newBackgroundColor.indexOf("rgba")!=-1)
				{
				}
				else
				{
					newBackgroundColor=newBackgroundColor.replace("rgb", "rgba");
				}
				
				
				ca.nodes[j].node.style.backgroundColor=newBackgroundColor;
				
			}
	}
}
function PhrasingContent_removeHighlight()
{
	var rs/*ranges*/
	var i;
	
	//r=this.getRange();
	rs=this.editableContent.contentSelection.getRanges();//this.getRanges();
	
	//compareDocumentPosition
	if(this.crtHighlightElements.length>0)
	{
		for(i=0; i<this.crtHighlightElements.length; i++)
		{
			this.removeFragmentHighlight(this.crtHighlightElements[i]);
		}
		this.crtHighlightElements=[];
	}
	this.editableContent.clearSelection();
	for(i=0; i<rs.length; i++)
	{
		this.restoreRange(rs[i]);
	}
}
function PhrasingContent_restoreRange(rb/*rangeBoundaries*/)
{
	
	
	var sc/*startContainer*/, so/*startOffset*/, ec/*endContainer*/, eo/*endOffset*/;
	
	sc=rb.startIsChildNode ? rb.startContainer.parentNode : rb.startContainer;
	so=rb.startIsChildNode ? rb.startContainer.getIndex()+rb.startShiftOffset : rb.startOffset;
	ec=rb.endIsChildNode ? rb.endContainer.parentNode : rb.endContainer;
	eo=rb.endIsChildNode ? rb.endContainer.getIndex()+rb.endShiftOffset : rb.endOffset;
   
	this.editableContent.addSelection(sc, so, ec, eo);
}
function PhrasingContent_removeFragmentHighlight(highlightElement)
{
	if(highlightElement.marker.parentNode)
	{
		while(highlightElement.marker.firstChild)
		{
			highlightElement.marker.parentNode.insertBefore(highlightElement.marker.firstChild, highlightElement.marker);
		}
		highlightElement.marker.parentNode.removeChild(highlightElement.marker);
		if(highlightElement.backgroundChangedNodes.length>0)
		{
			for(var i=0; i<highlightElement.backgroundChangedNodes.length; i++)
			{
				highlightElement.backgroundChangedNodes[i].node.style.backgroundColor="";
			}
		}
	}
	else
	{
		highlightElement.marker.removeChildren();	
	}
}
function PhrasingContent_getLeftBoundary(node)
{
	var spcn/*startPhrasingContentNode*/, phrashingContentNodes=[];
	var ancestors;
	
	//spcn=node;
	
	ancestors=node.getAncestors();
	
	if(!node.isPhrasingContent())
	{
		//find incorrect phrasing content ancestors
		for(var i=0; i<ancestors.length; i++)
		{
			if(ancestors[i].isPhrasingContent())
			{
				spcn=ancestors[i];
				break;
			}
		}
		//no incorrect ancestors, find first phrasing content ascendant
		if(!spcn)
		{
			for(var cn=node.firstChild;
					cn;
					cn=cn.firstChild)
			{
				if(cn.isPhrasingContent())
				{
					spcn=cn;
					break;
				}
			}
		}
		return spcn;
	}
	
	for(var i=0; i<ancestors.length; i++)
	{
		if(!Node.prototype.isTagBreakable(ancestors[i].tagName))
		{
			continue;
		}
		if(ancestors[i].isPhrasingContent() || ( ancestors[i].hasTransparentContent() && ancestors[i].hasOnlyPhrasingContent(node)) )
		{
			spcn=ancestors[i];
			break;
		}
	}
	
	for( ;
		spcn.previousSibling && 
		( spcn.previousSibling.isPhrasingContent() || 
			( spcn.previousSibling.hasTransparentContent() && spcn.previousSibling.hasOnlyPhrasingContent() ) 
		);
		spcn=spcn.previousSibling)
	{
	}
	
	return spcn;
}
/**
 * EditableContent.getFragments
 * 
 * Given a node, it finds and return the paragraph the node belongs to.
 * The returned paragraph is a list of paragraph fragments each of them containing an array of consecutive phrasing content node
 * 
 *
 * Paragraphs in flow content are defined relative to what the document looks like without the a, ins, del, and map elements 
 * complicating matters, since those elements, with their hybrid content models, can straddle paragraph boundaries, as shown in the 
 * first two examples below.
 * 
 */
function PhrasingContent_getFragments(node)
{
	var spcn=this.getLeftBoundary(node);
	
	var ca={};//callbackArguments
	ca.pfb=[];//pargraphFragmentBoundaries
	ca.stack=[];
	ca.notClosedElements=[];
	ca.depth=0;
	
	this.visitContentFragmentNodes([this, "collectFragmentBoundaries"], ca, spcn, 0, this.editableContent.documentContainer, this.editableContent.documentContainer.childNodes.length);
	
	return ca.pfb;
}
function PhrasingContent_collectFragmentBoundaries(node, offset, close, endVisit, ca )
{
	if(node.isElement() && node.tagName=="X-HIGHLIGHT")
	{
		return;
	}
	
	if(ca.stack.length==0)
	{
		ca.stack.push([null]);
		
	}
	if(!ca.notPhrasingContentFragment)
	{
		ca.notPhrasingContentFragment=[];
	}
	
	var isParagraphContent=node.isPhrasingContent() || node.hasTransparentContent();
	
	if(!isParagraphContent)
	{
		if(ca.stack.length==1)
		{
			if(ca.stack[0].length>1)
			{
				ca.pfb[ca.pfb.length]=ca.stack[0].splice(1);	
			}
			throw new CustomError(ERR_STOP_VISITS);
		}
		if(!close)
		{
			var allOpenElementsHaveTransparentContent=true;
			for(var i=0; i<ca.stack.length; i++)
			{
				
				{
					//first element in each fragment is an open and not closed element
					//the other nodes are valid paragraph fragments
					//extract them and add them to cs.pfb but leave the open element there
					if(ca.stack[i].length>1)
					{
						ca.pfb[ca.pfb.length]=ca.stack[i].splice(1);
					
					}
					
					if(i>0 && ca.stack[i][0] && !ca.stack[i][0].hasTransparentContent())
					{
						allOpenElementsHaveTransparentContent=false;
					}
					ca.stack[i][0]=null;
				}
			}
			if(allOpenElementsHaveTransparentContent)
			{
				throw new CustomError(ERR_STOP_VISITS);
			}
			//now push the not phrasing node in the stack and skip its child nodes and its closing call
			ca.notPhrasingContentFragment.push(node);

			throw new CustomError(ERR_SKIP_CHILD_NODES_VISITS);
		}
	}
	else
	{
		if(ca.notPhrasingContentFragment.length>0)
		{
			ca.pfb[ca.pfb.length]=ca.notPhrasingContentFragment;
			
			ca.notPhrasingContentFragment=[];
		}

		if(!close)
		{
			//if not phrasing:
			//copy all the valid fragments from the stack to result array
			//if a fragment have only one non text node it means that the tag is still open
			//wipe out the stack 

			//if offset==0 push a new frament to the stack
			ca.stack.push([]);
			ca.stack[ca.stack.length-1].push(node);
			
			//add the node to the fragemnt from the top of the stack
			
			
			//if not phrasing:
			// skip child nodes
			//else just return;
		}
		else
		{
			
			if(ca.stack[ca.stack.length-1][0]===null)
			{
				if(ca.stack[ca.stack.length-1].length>1)
				{
					ca.pfb[ca.pfb.length]=ca.stack[ca.stack.length-1].splice(1);
					
				}
				ca.stack.pop();
				
				
			}
			else
			{
				ca.stack.pop();
				
				if(ca.stack.length>0)
				{
					ca.stack[ca.stack.length-1].push(node);
				}
			}
		}
	}
}