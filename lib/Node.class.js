const ERR_NODE_INDEX_SIZE=1;
const ERR_WRONG_PARAM_TYPE=2;
const ERR_INNER_TRANSPARENT_CONTENT=3;
const ERR_OUTER_TRANSPARENT_CONTENT=4;
const ERR_NOT_PHRASING_CONTENT=5;
const ERR_SKIP_CHILD_NODES=6;

const ERR_SKIP_CHILD_NODES_VISITS=6;
const ERR_STOP_VISITS=7;
function CustomError(code, message)
{
	this.code=code;
	this.message=message?message:"";
	this.callerName=CustomError.caller.name;
}
with(CustomError)
{
	prototype.code=null;
	prototype.message=null;
	prototype.callerName="";
}
const SECTIONING_ROOT=1;
const SECTIONING_CONTENT=2;
const HEADING_CONTENT=4;
const EMBEDDED_CONTENT=8;
const INTERACTIVE_CONTENT=16;
const PHRASING_CONTENT=32;
const TRANSPARENT_CONTENT=64;
const FLOW_CONTENT=128;
const GROUPING_CONTENT=256;
//
const TD_CONTENT=512;
const TR_CONTENT=1024;
const LI_CONTENT=2048;


const ALL_CONTENT=(FLOW_CONTENT | SECTIONING_ROOT | SECTIONING_CONTENT | HEADING_CONTENT | EMBEDDED_CONTENT | INTERACTIVE_CONTENT | PHRASING_CONTENT);

with(Node)
{
	//Mutation history
	prototype.mutationHistorycloneNode=prototype.cloneNode;
	prototype.cloneNode=Node_cloneNode;
	//End mutation history
	
	prototype.__html5Tags={
		// ----Sections
		"BODY": {"category": SECTIONING_ROOT, "contentCategory": ALL_CONTENT},
		"SECTION": {"category": SECTIONING_ROOT, "contentCategory": ALL_CONTENT},
		"NAV": {"category": SECTIONING_ROOT, "contentCategory": ALL_CONTENT},
		"ARTICLE": {"category": SECTIONING_ROOT, "contentCategory": ALL_CONTENT},
		"ASIDE": {"category": SECTIONING_ROOT, "contentCategory": ALL_CONTENT},
		"H1": {"category": HEADING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"H2": {"category": HEADING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"H3": {"category": HEADING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"H4": {"category": HEADING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"H5": {"category": HEADING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"H6": {"category": HEADING_CONTENT, "contentCategory": PHRASING_CONTENT},
		
		"HEADER": {"category": HEADING_CONTENT, "contentCategory": ALL_CONTENT},
		/* header: Flow content, including at least one descendant that is heading content, but no sectioning content descendants, 
		 * no header element descendants, and no footer element descendants. */
		
		"FOOTER": {"category": FLOW_CONTENT, "contentCategory": ALL_CONTENT},
		/* footer: Flow content, but with no heading content descendants, no sectioning content descendants, and no footer element descendants.*/
		
		
		"ADDRESS": {"category": FLOW_CONTENT, "contentCategory": ALL_CONTENT},
		/* address:  Flow content, but with no heading content descendants, no sectioning content descendants, no footer element descendants, 
		 * and no address element descendants. */
		
		//----Grouping content
		"P": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"HR": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": 0},
		"BR": {"category": FLOW_CONTENT | PHRASING_CONTENT | GROUPING_CONTENT, "contentCategory": 0},
		"PRE": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": PHRASING_CONTENT},
		"DIALOG": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": 0 /*Zero or more pairs of one dt element followed by one dd element.*/},
		"BLOCKQUOTE": {"category": SECTIONING_ROOT | GROUPING_CONTENT, "contentCategory": ALL_CONTENT},
		"OL": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": LI_CONTENT/*Zero or more li elements.*/},
		"UL": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": LI_CONTENT/*Zero or more li elements.*/},
		"LI": {"category": LI_CONTENT | GROUPING_CONTENT, "contentCategory": ALL_CONTENT},
		"DL": {"category": FLOW_CONTENT | GROUPING_CONTENT, "contentCategory": 0/*Zero or more groups each consisting of one or more dt elements followed by one or more dd elements.*/},
		"DT": {"category":  GROUPING_CONTENT, "contentCategory": PHRASING_CONTENT/*     Before dd or dt elements inside dl elements. 
    Before a dd element inside a dialog element. */},
		"DD": {"category":  GROUPING_CONTENT, "contentCategory": PHRASING_CONTENT /*    After dt or dd elements inside dl elements.
    After a dt element inside a dialog element.*/},
		
		
		/*Text*/
		"A": {"category": INTERACTIVE_CONTENT, "contentCategory": TRANSPARENT_CONTENT/*Transparent, but there must be no interactive content descendant.*/},
		
		
		/*
		 * "q": {"category": [], "contentCategory": []},
		 * "cite": {"category": [], "contentCategory": []},
		 * "em": {"category": [], "contentCategory": []},
		 * "strong": {"category": [], "contentCategory": []},
		 * "small": {"category": [], "contentCategory": []},
		 * "mark": {"category": [], "contentCategory": []},
		 * "dfn": {"category": [], "contentCategory": []},
		 * "abbr": {"category": [], "contentCategory": []},
		 * "time": {"category": [], "contentCategory": []},
		 * "progress": {"category": [], "contentCategory": []},
		 * "meter": {"category": [], "contentCategory": []},
		 * "code": {"category": [], "contentCategory": []},
		 * "var": {"category": [], "contentCategory": []},
		 * "samp": {"category": [], "contentCategory": []},
		 * "kbd": {"category": [], "contentCategory": []},
		 * "sub": {"category": [], "contentCategory": []},
		 * "sup": {"category": [], "contentCategory": []},
		 * "span": {"category": [], "contentCategory": []},
		 * "i": {"category": [], "contentCategory": []},
		 * "b": {"category": [], "contentCategory": []},
		 * "bdo": {"category": [], "contentCategory": []},
		 * "ruby": {"category": [], "contentCategory": []},One or more groups of: phrasing content followed either by a single rt element, or an rp element, an rt element, and another rp element.
		 * "rt": {"category": null, "contentCategory": []},As a child of a ruby element.
		 * "rp": {"category": null, "contentCategory": []},     As a child of a ruby element, either immediately before or immediately after an rt element.

				Content Model: 	

					If the rp element is immediately after an rt element that is immediately preceded by another rp element: a single character from Unicode character class Pe.
					Otherwise: a single character from Unicode character class Ps.
		 */
		
		//---Edits
		"INS": {"category": FLOW_CONTENT /*When the element only contains phrasing content: phrasing content.*/, "contentCategory": TRANSPARENT_CONTENT},
		"DEL": {"category": FLOW_CONTENT /*When the element only contains phrasing content: phrasing content.*/, "contentCategory": TRANSPARENT_CONTENT},
		
		//----Embedded Content
		"FIGURE": {"category": SECTIONING_ROOT, "contentCategory": []/*    Either: one legend element followed by flow content.
																			Or: Flow content followed by one legend element.
																			Or: Flow content.*/},
		"IMG": {"category": FLOW_CONTENT | PHRASING_CONTENT | EMBEDDED_CONTENT /*If the element has an usemap attribute: Interactive content.*/, "contentCategory": 0},
		"IFRAME": {"category": FLOW_CONTENT | PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": []},
		"EMBED": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": 0},
		"OBJECT": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": []/*Zero or more param elements, then, transparent.*/},
		// "PARAM": {"category": [], "contentCategory": []},
		"VIDEO": {"category": FLOW_CONTENT | PHRASING_CONTENT | EMBEDDED_CONTENT/*If the element has a controls attribute: Interactive content.*/, "contentCategory": []/* 	

    If the element has a src attribute: transparent.
    If the element does not have a src attribute: one or more source elements, then, transparent.*/},
	
	
		"AUDIO": {"category": FLOW_CONTENT | PHRASING_CONTENT | EMBEDDED_CONTENT/*If the element has a controls attribute: Interactive content.*/, "contentCategory": []/* 	

    If the element has a src attribute: transparent.
    If the element does not have a src attribute: one or more source elements, then, transparent.*/},
	
		/*
		 * "source": {"category": [], "contentCategory": []},
		 */
		"CANVAS": {"category": FLOW_CONTENT | PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": TRANSPARENT_CONTENT},
		
		/*
		"map": {"category": [], "contentCategory": []},
		"area": {"category": [], "contentCategory": []},
		*/
		
		//----Tabular data
		"TABLE": {"category": FLOW_CONTENT, "contentCategory": TR_CONTENT},
		"CAPTION": {"category": 0, "contentCategory": PHRASING_CONTENT},
		//"COLGROUP": {"category": [], "contentCategory": []},
		//"COL": {"category": [], "contentCategory": []},
		//"TBODY": {"category": [], "contentCategory": []},
		//"THEAD": {"category": [], "contentCategory": []},
		//"TFOOT": {"category": [], "contentCategory": []},
		"TR": {"category": TR_CONTENT, "contentCategory": TD_CONTENT},
		"TD": {"category": TD_CONTENT, "contentCategory": ALL_CONTENT},
		//"TH": {"category": [], "contentCategory": []},
		
		
		//----Forms
		//"FORM": {"category": [], "contentCategory": []},
		//"FIELDSET": {"category": [], "contentCategory": []},
		//"LABEL": {"category": [], "contentCategory": []},
		//"INPUT": {"category": [], "contentCategory": []},
		//"BUTTON": {"category": [], "contentCategory": []},
		//"SELECT": {"category": [], "contentCategory": []},
		//"DATALIST": {"category": [], "contentCategory": []},
		//"OPTGROUP": {"category": [], "contentCategory": []},
		//"OPTION": {"category": [], "contentCategory": []},
		//"TEXTAREA": {"category": [], "contentCategory": []},
		//"OUTPUT": {"category": [], "contentCategory": []},
		
		
		//----Interactive Elements
		//"DETAILS": {"category": [], "contentCategory": []},
		//"COMMAND": {"category": [], "contentCategory": []},
		//"BB": {"category": [], "contentCategory": []},
		//"MENU": {"category": [], "contentCategory": []},
		
		
		//----Miscellaneous Elements
		//"LEGEND": {"category": [], "contentCategory": []},
		"DIV": {"category": FLOW_CONTENT, "contentCategory": ALL_CONTENT},
		
		//----Obsolete Elements
		/*
		"s": {"category": [], "contentCategory": []},
		"u": {"category": [], "contentCategory": []},
		"wbr": {"category": [], "contentCategory": []},
		*/
	   
	   //----???
	   /*
		
		
		"data": {"category": [], "contentCategory": []},	
		"keygen": {"category": [], "contentCategory": []},		
		"math": {"category": [], "contentCategory": []},
		"noscript": {"category": [], "contentCategory": []},
		
		"script": {"category": [], "contentCategory": []},
		"svg": {"category": [], "contentCategory": []},		
		"template": {"category": [], "contentCategory": []},
		
		

		*/
	}
	/**
	 * Category and content category "static" methods
	 * 
	 * Given a tag name, they give informatio  about what category of content the node with that tag name is, 
	 * what type of tag names they allow inside etc
	 * 
 	 */
	prototype.___transparentTags=["a", "del", "ins", "map" ];//<A> - Transparent, but there must be no interactive content descendant.
	prototype.___getTagCategory=Node____getTagCategory;
	prototype.___getTagContentCategory=Node____getTagContentCategory;
	prototype.___tagHasTransparentContent=Node____tagHasTransparentContent;
	prototype.___tagIsPhrasingContent=Node____tagIsPhrasingContent;
	prototype.___isTagAllowedInTag=Node____isTagAllowedInTag;
	/**
	 * Category and content category methods, based on the "static" methods, they give information about nodes
	 */
	prototype.getCategory=Node_getCategory;
	prototype.getContentCategory=Node_getContentCategory;
	prototype.hasTransparentContent=Node_hasTransparentContent;
	prototype.isPhrasingContent=Node_isPhrasingContent;
	prototype.isGroupingContent=Node_isGroupingContent;
	prototype.isAllowedInTag=Node_isAllowedInTag;
	prototype.isPhrasingContentNode=Node_isPhrasingContentNode;
	prototype.hasOnlyPhrasingContent=Node_hasOnlyPhrasingContent;
	prototype.isAllowedInNode=Node_isAllowedInNode;
	
	/* Child nodes visiting*/
	prototype.visitDescendants=Node_visitDescendants;
	
	/* Node type info */
	prototype.isText=Node_isText;
	prototype.isElement=Node_isElement;
	
	prototype.isEmpty=Node_isEmpty;
	
	/* Node manipulation methods*/	
	prototype.insertAfter=Node_insertAfter;
	prototype.prependChild=Node_prependChild;
	prototype.moveContentBefore=Node_moveContentBefore;
	prototype.split=Node_split;
	prototype.splitChildAtDescendant=Node_splitChildAtDescendant;
	
	
	/* Ancestors info methods*/
	prototype.getCommonAncestor=Node_getCommonAncestor;
	prototype.getAncestors=Node_getAncestors;
	prototype.isAncestorOf=Node_isAncestorOf;
	
	/* Node info relative to its parent*/
	prototype.getIndex=Node_getIndex;	
	
	/* CSS methods*/
	prototype.getComputedStyle=Node_getComputedStyle;
	prototype.isInline=Node_isInline;
}
/**
 * 
 * Node.prototype.___getTagCategory
 * 
 * Given a tag name, it returns the content category the tag belongs to (eg. SPAN is a phrasing content, H1 heding content etc)
 * 
 * @param {string} tagName
 * @returns {integer}
 */
function Node____getTagCategory(tagName)
{
	tagName=tagName.toUpperCase();
	
	return Node.prototype.__html5Tags.hasOwnProperty(tagName) ? Node.prototype.__html5Tags[tagName].category : PHRASING_CONTENT; /* what type of content the parent allows*/
}
/**
 * 
 * Node.prototype.___getTagContentCategory
 * 
 * Given a tag name, it returns what type of content it may contain (eg P allows only phrasing content, UL only LI content, DIV allows angy kind of content)
 * 
 * @param {string} tagName
 * @returns {integer}
 */
function Node____getTagContentCategory(tagName)
{
	tagName=tagName.toUpperCase();
	
	return Node.prototype.__html5Tags.hasOwnProperty(tagName) ? Node.prototype.__html5Tags[tagName].contentCategory : PHRASING_CONTENT;
}
/*
 *  Node.prototype.___tagHasTransparentContent 
 * 
 * Returns true if the tag allows transparent content inside, false otherwise.
 * 
 * Some elements have transparent content models, meaning that their allowed content depends upon the parent element. 
 * They may contain any content that their parent element may contain, in addition to any other allowances or exceptions described for the element.
 * When the element has no parent, then the content model defaults to flow content.
 * 
 * @param {string} tagName
 * @returns {Boolean}
 */
function Node____tagHasTransparentContent(tagName)
{
	return (Node.prototype.___getTagContentCategory(tagName) & TRANSPARENT_CONTENT) ? true : false;
}
/*
 * Node.prototype.___tagIsPhrasingContent
 * 
 * Returns true if the tag name is phrasing content.
 * 
 * @param {type} tagName
 * @returns {Boolean}
 */
function Node____tagIsPhrasingContent(tagName)
{
	return Node.prototype.___getTagCategory(tagName) & PHRASING_CONTENT ? true : false;
}
function Node_getCategory()
{
	return this.isText() ? PHRASING_CONTENT : Node.prototype.___getTagCategory(this.tagName);
}
function Node_getContentCategory()
{
	return this.isText() ? PHRASING_CONTENT : (Node.prototype.__html5Tags.hasOwnProperty(this.tagName) ? Node.prototype.__html5Tags[this.tagName].contentCategory : PHRASING_CONTENT);
}
function Node_hasTransparentContent()
{
	return (this.getContentCategory() & TRANSPARENT_CONTENT ? true : false);
}
function Node_isPhrasingContent()
{
	return (this.getCategory() & PHRASING_CONTENT) ? true : false;
}
function Node_isGroupingContent()
{
	return (this.getCategory() & GROUPING_CONTENT) ? true : false;
}
function Node____isTagAllowedInTag(innerTagName, outerTagName, innerIsText )
{
	var innerType, innerContentCategory;
	var outerContentCategory;
	
	outerTagName=outerTagName.toUpperCase();
	outerContentCategory=Node.prototype.__html5Tags.hasOwnProperty(outerTagName) ? Node.prototype.__html5Tags[outerTagName].contentCategory : PHRASING_CONTENT; /* what type of content the parent allows*/
	
	if(outerContentCategory & TRANSPARENT_CONTENT)
	{
		throw new CustomError(ERR_OUTER_TRANSPARENT_CONTENT, "Transparent content");//outerTagName is not enough, need outer node parent to detect what tags it may allow
	}
	
	if(innerIsText)
	{
		innerType=PHRASING_CONTENT;
	}
	else
	{
		innerContentCategory=Node.prototype.__html5Tags.hasOwnProperty(innerTagName) ? Node.prototype.__html5Tags[innerTagName].contentCategory : PHRASING_CONTENT; /* what type of content the parent allows*/
		
		if( ( innerContentCategory & TRANSPARENT_CONTENT) && outerContentCategory!=ALL_CONTENT )
		{
			throw new CustomError(ERR_INNER_TRANSPARENT_CONTENT,  "Transparent content 2"+innerTagName);//outerTagName is not enough, need outer node parent to detect what tags it may allow
		}
	
		innerType=Node.prototype.__html5Tags.hasOwnProperty(innerTagName) ? Node.prototype.__html5Tags[innerTagName].category : PHRASING_CONTENT;
	}
	
	
	
	return (innerType & outerContentCategory)!=0;
}
function Node_isAllowedInTag(outerTagName)
{
	try
	{	
		return Node.prototype.___isTagAllowedInTag(this.tagName, outerTagName, this.isText());
	}
	catch(err)
	{
		if(err.code!=ERR_INNER_TRANSPARENT_CONTENT)
		{
			throw err;
		}
		
		if(this.hasOnlyPhrasingContent())
		{
			return true;
		}
		
		return false;
	}
}

function Node_visitDescendants(callback, ca/*callbackArguments*/, beforeAndAfterChildNodes, visitThis, depth)
{
	if(!depth)
	{
		depth=0;
	}
	if(depth>0 || visitThis)
	{
		try
		{
			callback[0][callback[1]](this, ca, false);
		}
		catch(err)
		{
			switch(err.code)
			{
				case ERR_STOP_VISITS:
					return true;
				case ERR_SKIP_CHILD_NODES_VISITS:
					return;
				default:
					throw err;
			}
		}
	}
	for(var i=0; i<this.childNodes.length; i++)
	{
		if(this.childNodes[i].visitDescendants(callback, ca, beforeAndAfterChildNodes, visitThis, depth+1))
		{
			return true;
		}
	}
	if(beforeAndAfterChildNodes && ( depth>0 || visitThis ))
	{
		try
		{
			callback[0][callback[1]](this, ca, true);
		}
		catch(err)
		{
			switch(err.code)
			{
				case ERR_STOP_VISITS:
					return true;
				default:
					throw err;
			}
		}
	}
}
function Node_isPhrasingContentNode(node)
{
	var category;
			
	category=node.isText() ? PHRASING_CONTENT : (Node.prototype.__html5Tags.hasOwnProperty(node.tagName) ? Node.prototype.__html5Tags[node.tagName].category : PHRASING_CONTENT);
	
	if(!(category & PHRASING_CONTENT))
	{
		throw new CustomError(ERR_NOT_PHRASING_CONTENT, "Node.isPhrasingContentNode");
	}
}
function Node_hasOnlyPhrasingContent()
{
	try
	{
		this.visitDescendants([this, "isPhrasingContentNode"], 0);
		return true;
	}
	catch(err)
	{
		if(err.code==ERR_NOT_PHRASING_CONTENT)
		{
			return false;
		}
		throw(err);
	}
}
function Node_isAllowedInNode(outerNode)
{
	
	
	var outerContentCategory;
	
	outerContentCategory=Node.prototype.__html5Tags.hasOwnProperty(outerNode.tagName) ? 
							Node.prototype.__html5Tags[outerNode.tagName].contentCategory : 
							PHRASING_CONTENT;/* where tagName is allowed*/

	if(outerContentCategory & TRANSPARENT_CONTENT)
	{
		return this.isAllowedInNode(outerNode.parentNode);
	}
	
	return this.isAllowedInTag(outerNode.tagName);
}
function Node_cloneNode(cloneChildNodes)
{
	var clone=this.mutationHistorycloneNode(cloneChildNodes);
		
	window.parent.ed.mutationHistory.observe(clone);
	
	return clone;
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
function Node_prependChild(node)
{
	if(this.firstChild)
	{
		this.insertBefore(node, this.firstChild);
	}
	else
	{
		this.appendChild(node);
	}
}

/*
 * Node.split
 * 
 * Splits the node at a given offset and returns the new created node.
 * 
 * @param {integer} offset - where to split; for text nodes is char offset, for elements if child node index or a child node element
 * @param {boolean} toLeft - where to create the new node; false/undefined -> before this node, true -> after this node
 * @returns {Object} containing left and right nodes as properties
 */
function Node_split(offset, toLeft)
{
	var newNode=null;
	
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
		if(offset>this.childNodes.length || offset<0)
		{
			throw new CustomError(ERR_NODE_INDEX_SIZE, "Node.split: wrong index: "+offset);
		}
		offset=this.childNodes[offset];
	}
	if(offset==this.firstChild || !offset)
	{
		return null;
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
		
		if(offset)
		{
			var offsetPreviousSibling=offset.previousSibling;
			
			for(var childNode=offset; childNode; childNode=offsetPreviousSibling?offsetPreviousSibling.nextSibling:this.firstChild)
			{
				newNode.appendChild(this.removeChild(childNode));
			}
		}
		this.parentNode.insertAfter(newNode, this);
	}
	return newNode;
}
/**
 * 
 * Node.splitChildAtDescendant
 * 
 * Splits the node at a given descendant node and offset.
 * The split starts a the given descendant and goes down until the descendant is a child of the current node (it doesn't split the node itself if splitNode is false)
 * 
 * @returns {Node} - returns last splitted node (which is a child of the current node). If toLeft==true (the new nodes were created before splitted nodes) the returned 
 * child is the right of the split point. If false (the new nodes are created after the splitted nodes) then the returned node is at the split point
 */

function Node_splitChildAtDescendant(childNode, offset, toLeft, splitNode)
{
	//console.log("--------");
	var newNode;
	
	if(typeof(offset)!="number")
	{
		throw new CustomError(ERR_WRONG_PARAM_TYPE, "Node.splitChildAtDescendant: offset must be a number");
	}
	var i=0, prevChildNode;
	prevChildNode=childNode;
	for(; childNode!=(splitNode?this.parentNode:this); childNode=childNode.parentNode)
	{
		
		if(newNode=childNode.split(offset, toLeft))
		{
			
			offset=toLeft?newNode.nextSibling:newNode;
			
		}
		else
		{
			if(childNode.isFirstChild() && !toLeft)
			{
				//the child was not splitted because the index is zero
				//it is the first child or character of its parent
				offset=childNode.previousSibling && !toLeft?childNode.previousSibling:childNode;
				//console.logNode(childNode, "", "", "First: ");
			}
			else
			{
				//the node was not splitted because the offset is after last child or character
				offset=childNode.nextSibling && !toLeft?childNode.nextSibling:childNode;
			}
		}
		//console.logNode(childNode);
		//console.log("No newNode");
		//console.logNode(newNode, "", false, "New node after split: ");
		prevChildNode=childNode;
	}
	
	return toLeft ? { "left": newNode, "right": prevChildNode} : { "left": prevChildNode, "right": newNode};
	
}
Node.prototype.isFirstChild=Node_isFirstChild;
function Node_isFirstChild()
{
	return this===this.parentNode.firstChild;
}
/**
 * Node.getComputedStyle
 * 
 * @returns {Node_getComputedStyle@pro;ownerDocument@pro;defaultView@call;getComputedStyle}
 */
function Node_getComputedStyle()
{
	return this.ownerDocument.defaultView.getComputedStyle(this);
}
/*
 * Node.isInline
 * 
 * Returns true if current node is text or is an element that has css display: inline
 * 
 * @returns {Boolean}
 */
function Node_isInline()
{
	return this.nodeType==3 || (this.getComputedStyle().display=="inline");
}
/** 
 * Node.isText
 * 
 * @returns {Boolean}
 */
function Node_isText()
{
	return this.nodeType==3;
}
/**
 * Node.isElement
 * 
 * @returns {Boolean}
 */
function Node_isElement()
{
	return this.nodeType==1;
}
/*
 * Node.isEmpty
 * 
 * Returns true if the node is empty, otherwise false.
 * 
 * A text node is empty when its textContent property contains only space characters (spaces, new lines, tabs etc)
 * An element is empty when all its descendants are empty (all the text nodes they contain are empty)
 * 
 * @returns {Boolean}
 */
function Node_isEmpty()
{
	if(this.isText())
	{
		return !this.textContent.match(/[^\s]{1}/)
	}
	
	if(!this.hasChildNodes())
	{
		return true;
	}
	
	for(var i=0; i<this.childNodes.length; i++)
	{
		if(!this.childNodes[i].isEmpty())
		{
			return false;
		}
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
	
	return this.parentNode;
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
/**
 * 
 * Node.moveContentBefore
 * 
 * Move node's child nodesin front of it and (if keepNode is false) removes the node itself
 * 
 * @param {boolean} keepNode
 * @returns {undefined}
 */
function Node_moveContentBefore(keepNode)
{
	for(; this.firstChild; )
	{
		this.parentNode.insertBefore(this.removeChild(this.firstChild), this);
	}
	if(!keepNode)
	{
		this.parentNode.removeChild(this);
	}
}
/**
 * Node.isAncestorOf
 * 
 * Return true if current node is an  ancestor of the give node
 * 
 * @param {node} node
 * @returns {Boolean}
 */
function Node_isAncestorOf(node)
{
	for(var ascendant=node.parentNode; ascendant; ascendant=ascendant.parentNode)
	{
		if(ascendant==this)
		{
			return true;
		}
	}
	
	return false;
}

