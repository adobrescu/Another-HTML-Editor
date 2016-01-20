const ERR_NODE_INDEX_SIZE=1;
const ERR_WRONG_PARAM_TYPE=2;
const ERR_INNER_TRANSPARENT_CONTENT=3;
const ERR_OUTER_TRANSPARENT_CONTENT=4;
const ERR_NOT_PHRASING_CONTENT=5;

function CustomError(code, message)
{
	this.code=code;
	this.message=message;
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

//
const TD_CONTENT=256;
const TR_CONTENT=512;
const LI_CONTENT=1024;


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
		"P": {"category": FLOW_CONTENT, "contentCategory": PHRASING_CONTENT},
		"HR": {"category": FLOW_CONTENT, "contentCategory": 0},
		"BR": {"category": FLOW_CONTENT, "contentCategory": 0},
		"PRE": {"category": FLOW_CONTENT, "contentCategory": PHRASING_CONTENT},
		"DIALOG": {"category": FLOW_CONTENT, "contentCategory": 0 /*Zero or more pairs of one dt element followed by one dd element.*/},
		"BLOCKQUOTE": {"category": SECTIONING_ROOT, "contentCategory": ALL_CONTENT},
		"OL": {"category": FLOW_CONTENT, "contentCategory": LI_CONTENT/*Zero or more li elements.*/},
		"UL": {"category": FLOW_CONTENT, "contentCategory": LI_CONTENT/*Zero or more li elements.*/},
		"LI": {"category": LI_CONTENT, "contentCategory": ALL_CONTENT},
		"DL": {"category": FLOW_CONTENT, "contentCategory": 0/*Zero or more groups each consisting of one or more dt elements followed by one or more dd elements.*/},
		"DT": {"category": null, "contentCategory": PHRASING_CONTENT/*     Before dd or dt elements inside dl elements. 
    Before a dd element inside a dialog element. */},
		"DD": {"category": null, "contentCategory": PHRASING_CONTENT /*    After dt or dd elements inside dl elements.
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
		"IMG": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT /*If the element has an usemap attribute: Interactive content.*/, "contentCategory": 0},
		"IFRAME": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": []},
		"EMBED": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": 0},
		"OBJECT": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": []/*Zero or more param elements, then, transparent.*/},
		// "PARAM": {"category": [], "contentCategory": []},
		"VIDEO": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT/*If the element has a controls attribute: Interactive content.*/, "contentCategory": []/* 	

    If the element has a src attribute: transparent.
    If the element does not have a src attribute: one or more source elements, then, transparent.*/},
	
	
		"AUDIO": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT/*If the element has a controls attribute: Interactive content.*/, "contentCategory": []/* 	

    If the element has a src attribute: transparent.
    If the element does not have a src attribute: one or more source elements, then, transparent.*/},
	
		/*
		 * "source": {"category": [], "contentCategory": []},
		 */
		"CANVAS": {"category": PHRASING_CONTENT | EMBEDDED_CONTENT, "contentCategory": TRANSPARENT_CONTENT},
		
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
		"TD": {"category": TD_CONTENT, "contentCategory": FLOW_CONTENT},
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
	prototype.___getTagCategory=Node____getTagCategory;
	prototype.___getTagContentCategory=Node____getTagContentCategory;
	prototype.___tagHasTransparentContent=Node____tagHasTransparentContent;
	prototype.getContentCategory=Node_getContentCategory;
	prototype.hasTransparentContent=Node_hasTransparentContent;
	prototype.isPhrasingContent=Node_isPhrasingContent;
	prototype.___isTagAllowedInTag=Node____isTagAllowedInTag;
	prototype.isAllowedInTag=Node_isAllowedInTag;
	prototype.isAllowedInNode=Node_isAllowedInNode;
	prototype.___transparentTags=["a", "del", "ins", "map" ];
		//<a> - Transparent, but there must be no interactive content descendant.
	
	prototype.isText=Node_isText;
	prototype.isElement=Node_isElement;
	prototype.isEmpty=Node_isEmpty;
	prototype.insertAfter=Node_insertAfter;
	prototype.prependChild=Node_prependChild;
	prototype.split=Node_split;
	prototype.getComputedStyle=Node_getComputedStyle;
	prototype.isInline=Node_isInline;
	prototype.getCommonAncestor=Node_getCommonAncestor;
	prototype.getAncestors=Node_getAncestors;
	prototype.splitChildAtDescendant=Node_splitChildAtDescendant;
	prototype.getIndex=Node_getIndex;
	
}
function Node____getTagCategory(tagName)
{
	tagName=tagName.toUpperCase();
	
	return Node.prototype.__html5Tags.hasOwnProperty(tagName) ? Node.prototype.__html5Tags[tagName].category : PHRASING_CONTENT; /* what type of content the parent allows*/
}
function Node____getTagContentCategory(tagName)
{
	tagName=tagName.toUpperCase();
	
	return Node.prototype.__html5Tags.hasOwnProperty(tagName) ? Node.prototype.__html5Tags[tagName].contentCategory : PHRASING_CONTENT;
}
function Node____tagHasTransparentContent(tagName)
{
	return (Node.prototype.___getTagContentCategory(tagName) & TRANSPARENT_CONTENT) ? true : false;
}
function Node_getContentCategory()
{
	return this.isText() ? PHRASING_CONTENT : (Node.prototype.__html5Tags.hasOwnProperty(this.tagName) ? Node.prototype.__html5Tags[this.tagName].contentCategory : PHRASING_CONTENT);
}
function Node_hasTransparentContent()
{
	return (this.getContentCategory() & PHRASING_CONTENT ? true : false);
}
function Node_isPhrasingContent()
{
	return this.isElement() && (this.getContentCategory() & TRANSPARENT_CONTENT);
}
function Node____isTagAllowedInTag(innerTagName, outerTagName, innerIsText )
{
	var innerType, innerContentCategory;
	var outerContentCategory;
	//console.log("outerTagName: "+outerTagName);
	outerTagName=outerTagName.toUpperCase();
	outerContentCategory=Node.prototype.__html5Tags.hasOwnProperty(outerTagName) ? Node.prototype.__html5Tags[outerTagName].contentCategory : PHRASING_CONTENT; /* what type of content the parent allows*/
	
	if(outerContentCategory & TRANSPARENT_CONTENT)
	{
		//console.log(outerContentCategory);
		throw new CustomError(ERR_OUTER_TRANSPARENT_CONTENT, "Transparent content");//outerTagName is not enough, need outer node parent to detect what tags it may allow
	}
	//console.log("Type for <"+innerTagName+"> ="+innerType);
	//console.log("Content type for <"+outerTagName+"> ="+outerContentCategory);
	//console.log("Is <"+innerTagName+"> allowed in <"+outerTagName+"> "+((innerType & outerContentCategory)!=0));
	//console.log("Allowed:" +((innerType & outerContentCategory)!=0));
	if(innerIsText)
	{
		innerType=PHRASING_CONTENT;
	}
	else
	{
		innerContentCategory=Node.prototype.__html5Tags.hasOwnProperty(innerTagName) ? Node.prototype.__html5Tags[innerTagName].contentCategory : PHRASING_CONTENT; /* what type of content the parent allows*/

		if(innerContentCategory & TRANSPARENT_CONTENT)
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
		console.log("AXXXA > "+this.tagName+" "+outerTagName);
		return false;
	}
}
Node.prototype.visitDescendants=Node_visitDescendants;
Node.prototype.isPhrasingContentNode=Node_isPhrasingContentNode;
Node.prototype.hasOnlyPhrasingContent=Node_hasOnlyPhrasingContent;
function Node_visitDescendants(callback, depth)
{
	if(!depth)
	{
		depth=0;
	}
	if(depth>0)
	{
		callback[0][callback[1]](this);
	}
	for(var i=0; i<this.childNodes.length; i++)
	{
		this.childNodes[i].visitDescendants(callback, depth+1);
	}
}
function Node_isPhrasingContentNode(node)
{
	//console.logNode(node);
	var category;
			
	category=node.isText() ? PHRASING_CONTENT : (Node.prototype.__html5Tags.hasOwnProperty(node.tagName) ? Node.prototype.__html5Tags[node.tagName].category : PHRASING_CONTENT);
	
	if(!(category & PHRASING_CONTENT))
	{
		throw new CustomError(ERR_NOT_PHRASING_CONTENT);
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
		//console.log("TRANSPARENT: "+outerNode.tagName);
		return this.isAllowedInNode(outerNode.parentNode);
	}
	
	return this.isAllowedInTag(outerNode.tagName);
	
	//console.log("Node.isAllowedInNode: "+(this.isText()?"Text":this.tagName)+" in "+outerNode.tagName+" "+v);
	
	//return v;
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
			throw new CustomError(ERR_NODE_INDEX_SIZE);
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
 * The split starts a the given descendant and goes down until the descendant is a child of the curreont node (it doesn't slit the node itself)
 * 
 * @returns {undefined}
 */

function Node_splitChildAtDescendant(childNode, offset, toLeft, splitNode)
{
	var newNode;
	
	if(typeof(offset)!="number")
	{
		throw new CustomError(ERR_WRONG_PARAM_TYPE, "Node.splitChildAtDescendant: offset must be a number");
	}
	for(; childNode!=(splitNode?this.parentNode:this); childNode=childNode.parentNode)
	{
		if(newNode=childNode.split(offset, toLeft))
		{
			offset=toLeft?newNode.nextSibling:newNode;
		}
		else
		{
			offset=childNode.nextSibling && !toLeft?childNode.nextSibling:childNode;
		}
		
	}
	return newNode;//toLeft?offset:newNode;
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
Node.prototype.moveContentBefore=Node_moveContentBefore;
function Node_moveContentBefore()
{
	for(; this.firstChild; )
	{
		this.parentNode.insertBefore(this.removeChild(this.firstChild), this);
	}
}