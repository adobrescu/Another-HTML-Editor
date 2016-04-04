/*
 * Cum functioneaza formatarea (inserarea de taguri in jurul selectiei userului)
 * -----------------------------------------------------------------------------
 * 
 * 1. Se porneste de la nodurile de start si de end ale Range-ului selectiei facute de user. Asta vine de la browser (range.startContainer, startOffset, endContainer, endOffset).
 * 
 * 2. Apoi, pentru taguri transaparent content sau non-phrashing content (in primul cz <A>, <DEL>, <INS>, in al doile element block - <H1>, <P>, <DIV> etc,
 * se incearca extendiere selectiei prin includerea nodurilor adiacente goale. Daca se gasesc astfel de noduri, se seteaza nodul de start si de end mai la 
 * stanga respectiv mai la dreapta pentru a include si nodurile goale gasite.
 * 
 * 3. Apoi se cauta intre nodul de start si cel de end perechi de noduri (insertion boundaries - tot start/end) pentru care toate elementele dintre ele ar fi acceptate
 * intr-un element cu tagName care se vrea inserat. 
 * 
 * Mai pe larg despre cum se cauta perechile de insertion boundaries mai jos.
 * 
 * 4. Dupa ce s-au gasit perechile insertion boundaries, pentru fiecare dintre ele:
 * 
 * a. Se cauta cel mai apropiat common ancestor;
 * b. Acesta este spart de sus in jos la startul si sfarsitul insertion boudanry-ului
 * c. Se creeaza un element cu tagName-ul de inserat
 * d. Si toate elementele dintre sparturile de la b) se insereaza/muta in nou creatul element
 * e. Elementul nou creat este adaugat in common ancestor
 * f. Common ancestorul se normalizeaza (s-ar pute sa nu fie necesar, da rde notat ca NU se normalizeaza nimic imediat dupa ce un nod este spart, pentru ca acesta
 *		ar putea produce noduri text adiacente pe care normalizarea le-ar "lipi" la loc
 *		
 * 5. - Pentru fiecare element nou creat (inserat) se cauta ce descendenti are care nu ar fi permisi in el (de ex. un <DIV> nu este permis intr-un <P>
 *	Pentru fiecare astfel de nod gasit, i se muta continutul in fata si apoi este sters;
 *	
 *	  - Apoi se cauta ancestorii care nu ar permite elementul nou creat in interior si sint sparti in asa fel incat sa se inchida inaintea, respectiv sa se deschida 
 *	  dupa element. De ex, daca dupa insertie avem:
 *	  
 *	  <H1>Acesta<P> este un titlu</p> de articol</H1>
 *	  
 *	  pentru ca <P> nu este premis in <H1>, se sparge H1 astfel:
 *	  
 *	  <H1>Acesta</H1><P> este un titlu</p><H1> de articol</H1>
 *	  
 * 6. De notat ca o imbunatatire ar putea fi ca pentru elementele care permit orice fel de continut (ALL_CONTENT, vezi Node.class.js) nu ar mai fi necesara cautarea de insertion 
 * boundaries si nici de descendenti care n-ar fi permisi.
 *    Asta nu ar fi insa valabil pentru tag-uri care incearca sa includa si taguri nepermise ca apoi sa le stearga.
 *    
 *    De ex.
 *    
 *    Un text <P> cu un paragraf </P> oarecare.
 *    
 *    Formatat cu H1, in prima faza ar fi
 *    
 *    <H1>Un text <P> cu un paragraf </P> oarecare.</H1>
 *    
 *	  Dar poia sterge P-ul:
 *    <H1>Un text  cu un paragraf  oarecare.</H1>
 *    
 *    Desi pare ca s-ar putea face ca pentru ALL_CONTENT (adica sa se foloseasca direct startul si endul selectie) pentru ca oricum va sterge 
 *    tagurile neprmise, exista si situatia:
 *    
 *    Un text
 *    <UL>
 *		<LI>Element lista</LI>
 *	  </UL>
 *	  Iarasi text
 * 
 * 
 *		Care, dupa formatare trebuie sa arate:
 *		
 *	  <H1>Un text</H1>
 *    <UL>
 *		<LI><H1>Element lista</H1></LI>
 *	  </UL>
 *	  <H1>Iarasi text</H1>
 *	  
 *	  Deci ar fi necesara vizitarea descrisa mai jos
 *	  
 * Cum se cauta "insertion boundaries" intre 2 noduri.
 * ---------------------------------------------------
 * 
 * 1. Vizitarea nodurilor.
 * Cautarea se face prin vizitarea tuturor nodurilor dintre start si end, fiecare nod fiind vizitat inainte si dupa vizitarea nodurilor child.
 * 
 * Un nod care a fost deschis inainte de start dar care are inchid intre start si end va fi vizitat doar o data, dupa vizitarea nodurilor child.
 * Un nod care a fost deschis intre start si end dar care se inchide dupa end va fi vizitat si el tot o data, dar inainte de a i se vizita nodurile child.
 * 
 * Cele 2 vizite se pentrec inclusiv pentru noduri text.
 * 
 * La fiecare vizita se poate apela (optional) un callback care primeste mai multe argumente care arata ce nod e vizitat, la ce offset, in ce faza 
 * (inainte sau dupa vizitarea nodurilor child), daca este ultimul nod din vizita si un obiect in care callbac-ul is poate pasa,intre apeluri, diversi parametri. Oricum, in acest obiect 
 * se afl acel putin nodurile si offseturile de start si end.
 * 
 * Callback-ul apelat poate sti in ce punct are loc vizita, la deschiderea nodului sau la inchiderea lui.
 * 
 * 2. Detectarea "insertion boundaries"
 * 
 * La fiecare vizita se apeleaza collectInsertionBoundaries care stringe intr-un array toate perechile de insertion boundary si care, in mare, functioneaza cam asa:
 * 
 * a. Se determina daca nodul vizitat ar fi acceptat inntr-un element cu tagName-ul care se vrea inserat
 * b. Daca nodul nu este acceptat, sau este un nod phrasing content gol (exceptie cele care sint si grouping content ca <BR> si <HR>
 *		se trece direct la e)
 * 
 * c. La deschiderea unui nod acesta este trecut intr-o stiva (practic offset-ul la care a fost vizitat);
 * d. La inchidere unui nod pot fi doua situatii:
 * - Nodul nu a fost pus in stiva la a) si asta se vede prin faptul ca stiva este goala. Asta inseamna si ca nodul a fost deschis inainte de start si se 
 * trece la e).
 * - Nodul a fost deschis la a) (stiva nu este goala).
 * i. Se determina daca nodul ar putea fi start-ul unei perechi de insertion boudaries.
 * 
 * Se foloseste ca.startNewEdge (care la primul apel/vizita este true). 
 * Daca ca.startNewEdge este true (vezi la e) mai multe) atunci inseamna ca trebuie creata o noua intrare in arrayul cu boundaries,
 * si, in cazul asta, nodul este marcat ca inceput de boundary. Se face si ca.startNewEdge=false;
 * Daca este fals, se verifica daca nodul curent este mai jos in ierarhia DOM fata de nodul de stat al boundary-ului curent 
 * (ultimul din array) si daca da atunci il suprascrie pe acesta
 * 
 * ii.
 * Nodul curent este trecut in "ca" ca ultimul care ar putea constitui eventual sfarsitul boundary-ului curent
 * 
 * e. Se verifica daca boundary-ul curent trebuie inchis.
 * Daca nodul curent nu este acceptat sau este ultima vizita sau nodul este "not breakable" (de ex. UL, OL, TABLE, TR etc)
 * atunci:
 * 
 *  se folosete ultimul nod care ar putea constitui sfarsit de boundary si se inchide boundary-ul curent;
 *  Daca nu este sfarit de vizita atunci  ca.startNewEdge=true si se continua vizita
 *  
 *  
 *  
 *  
 */
/*
 * ContentFragment = fragment of documentContainer; it has a start node and offset and an end container and offset
 * 
 */

const ERR_RANGE_COLLAPSED=500;

function EditableContent(iframe, innerHTML, serializedHistory)//always an iframe, need edited doc CSS in their own space
{

	EditableContent.prototype.___instances[EditableContent.prototype.___numInstances]=this;
	
	this.window=iframe.contentWindow;
	this.window.contentSelection;//new ContentSelection(this.window);
	
	this.documentContainer=this.window.document.getElementById("EditableContentCanvas");
	if(innerHTML)
	{
		this.documentContainer.innerHTML=innerHTML;
	}
	
	this.mutationHistory=new MutationHistory(this.documentContainer, serializedHistory, [this, "onSelectionChanged"]);
	this.mutationHistory.observe(this.documentContainer);
	this.addScripts();
	
	this.window.addEventListener("beforeunload", new Function("evt", "EditableContent.prototype.___instances["+EditableContent.prototype.___numInstances+"].onBeforeUnload(evt)" ));
	
	this.documentContainer.addEventListener("keypress", new Function("evt", "EditableContent.prototype.___instances["+EditableContent.prototype.___numInstances+"].onKeyPress(evt)" ));
	
	this.currentParagraph=null;
	this.currentPhrasingContent=null;
	
	var editableContainers=this.documentContainer.ownerDocument.querySelectorAll("[contentEditable]");
	for(var i=0; i<editableContainers.length; i++)
	{
		if(!this.documentContainer.contains(editableContainers[i]))
		{
			continue;
		}
		var notEditableContent;
		
		notEditableContent=this.documentContainer.ownerDocument.createElement(editableContainers[i].isPhrasingContent()?"X-PHRASING-CONTENT-NOT-EDITABLE":"X-FLOW-CONTENT-NOT-EDITABLE", true);
		
		notEditableContent.contentEditable=false;
		notEditableContent.style.display=editableContainers[i].getComputedStyle().display;
		notEditableContent.style.border="1px red solid";
		editableContainers[i].parentNode.insertBefore( notEditableContent, editableContainers[i]);
		notEditableContent.appendChild(editableContainers[i]);
		
	}
	EditableContent.prototype.___numInstances++;
	this.init();
}
with(EditableContent)
{
	prototype.___instances=[];
	prototype.___numInstances=0;
	prototype.___notBreakableTagNames=["OL", "UL", "LI", "TABLE", "TBODY", "THEAD", "TH", "TR", "TD"];
	
	prototype.init=EditableContent_init;
	prototype.addScripts=EditableContent_addScripts;
	prototype.getRange=HtmlEditor_getRange;
	prototype.setSelection=EditableContent_setSelection;
	prototype.clearSelection=EditableContent_clearSelection;
	prototype.addSelection=EditableContent_addSelection;
	
	prototype.undo=EditableContent_undo;
	prototype.redo=EditableContent_redo;
	
	prototype.textNodeHasEmptyStart=EditableContent_textNodeHasEmptyStart;
	
	prototype.expandRangeBoundaries=EditableContent_expandRangeBoundaries;
	prototype.visitContentFragmentNodes=EditableContent_visitContentFragmentNodes;
	prototype.isTagBreakable=EditableContent_isTagBreakable;
	
	prototype.surroundInsertionBoundaryNodes=EditableContent_surroundInsertionBoundaryNodes;
	prototype.getInsertionBoundaryNodes=EditableContent_getInsertionBoundaryNodes;
	prototype.getElementNotAllowedDescendants=EditableContent_getElementNotAllowedDescendants;
	prototype.collectNotAllowedDescendants=EditableContent_collectNotAllowedDescendants;
	prototype.getNotAllowedAncestors=EditableContent_getNotAllowedAncestors;
	prototype.removeNotAllowedDescendants=EditableContent_removeNotAllowedDescendants;
	
	prototype.surroundSelectedContentFragments=EditableContent_surroundSelectedContentFragments;
	prototype.surroundContentFragment=EditableContent_surroundContentFragment;
	
	
	prototype.collectInsertionBoundaries=EditableContent_collectInsertionBoundaries;
	
	prototype.onSelectionChanged=EditableContent_onSelectionChanged;
	
	prototype.onBeforeUnload=EditableContent_onBeforeUnload;
	prototype.removeSiblings=EditableContent_removeSiblings;
	prototype.elementsHaveTheSameBasicTextFormatting=EditableContent_elementsHaveTheSameBasicTextFormatting;
	prototype.joinNodes=EditableContent_joinNodes;
	prototype.deleteSelectedContentFragments=EditableContent_deleteSelectedContentFragments;
	prototype.deleteContentFragment=EditableContent_deleteContentFragment;
	prototype.findPhrasingContentNodes=EditableContent_findPhrasingContentNodes;
	
	prototype.onKeyPress=EditableContent_onKeyPress;
}
function EditableContent_init()
{
	HTMLTableElement.prototype.___onInitDocument(this.documentContainer);
}
function EditableContent_addScripts()
{
	var header, script;
	
	header=this.window.document.getElementsByTagName("head")[0];
	
	/*
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/Document.class.js";
	header.appendChild(script);
	
   
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/Node.class.js";
	header.appendChild(script);
	
	script=this.window.document.createElement("script");
	script.src="../../editor/lib/console.js";
	header.appendChild(script);
	*/
}


function HtmlEditor_getRange()
{
	var range;
				
	try
	{
		range=this.window.getSelection().getRangeAt(0);
	}
	catch(err)
	{
		range=this.window.document.createRange();
	}
	
	return range;
}
function EditableContent_setSelection(startContainer, startOffset, endContainer, endOffset)
{
	this.clearSelection();
	this.addSelection(startContainer, startOffset, endContainer, endOffset);	
}
function EditableContent_clearSelection()
{
	this.window.contentSelection.removeAllRanges();
	
}
function EditableContent_addSelection(startContainer, startOffset, endContainer, endOffset)
{
	this.window.contentSelection.addRange({ "startContainer": startContainer, "startOffset": startOffset, "endContainer": endContainer, "endOffset": endOffset });
	

}
function EditableContent_undo()
{
	this.mutationHistory.undo(1);
	var scrollTop=this.documentContainer.ownerDocument.body.scrollTop;
	this.documentContainer.focus();
	this.documentContainer.ownerDocument.body.scrollTop=scrollTop;
}
function EditableContent_redo()
{
	var scrollTop;
	
	this.mutationHistory.redo(1);
		
	scrollTop=this.documentContainer.ownerDocument.body.scrollTop;
	
	this.documentContainer.focus();
	this.documentContainer.ownerDocument.body.scrollTop=scrollTop;
}

function EditableContent_textNodeHasEmptyStart(textNode, offset)
{
	if(!textNode.isText())
	{
		return false;
	}
	
	for(var i=0; i<offset; i++)
	{
		if(textNode.textContent[i]!=" " && textNode.textContent[i]!="\n" && textNode.textContent[i]!="\r" && textNode.textContent[i]!="\t")
		{
			return false;
		}
	}
	return true;
}
function EditableContent_expandRangeBoundaries(range)
{
	var startContainer, startOffset, endContainer, endOffset;
	
	
	startContainer=range.startContainer;
	startOffset=range.startOffset;
	endContainer=range.endContainer;
	endOffset=range.endOffset;
	
	if(startOffset==0 || this.textNodeHasEmptyStart(startContainer, startOffset) )
	{
		var previousSibling=startContainer;
		var lastPreviousSibling;

		while(true)
		{
			lastPreviousSibling=previousSibling;
			
			for(previousSibling=previousSibling.previousSibling; 
				previousSibling && previousSibling.isEmpty() && previousSibling.isPhrasingContent() && !previousSibling.isGroupingContent();
				previousSibling=previousSibling.previousSibling )
			{
				lastPreviousSibling=previousSibling;
			}
			if(!previousSibling)
			{
				if(!lastPreviousSibling.parentNode.isPhrasingContent() || lastPreviousSibling.parentNode.isGroupingContent())
				{
					startContainer=lastPreviousSibling.parentNode;
					startOffset=0;
					break;
				}
				previousSibling=lastPreviousSibling.parentNode;

				continue;
			}
			break;
		}
	}
	
	if(  (endContainer.isText() && endOffset==endContainer.textContent.length) || (endContainer.isElement() && endOffset==endContainer.childNodes.length) )
	{
		var nextSibling=endContainer;
		var lastNextSibling;

		while(true)
		{
			lastNextSibling=nextSibling;
			for(nextSibling=nextSibling.nextSibling; 
				nextSibling && nextSibling.isEmpty() && nextSibling.isPhrasingContent() && !nextSibling.isGroupingContent();
				nextSibling=nextSibling.nextSibling)
			{
				lastNextSibling=nextSibling;
			}
			if(!nextSibling)
			{
				if(!lastNextSibling.parentNode.isPhrasingContent() || lastNextSibling.parentNode.isGroupingContent())
				{
					endContainer=lastNextSibling.parentNode;
					//endOffset=0;
					//endContainer=startContainer;
					endOffset=endContainer.childNodes.length;
					break;
				}
				nextSibling=lastNextSibling.parentNode;

				continue;
			}

			break;
		}
	}
	
	return {"startContainer": startContainer, "startOffset": startOffset, "endContainer": endContainer, "endOffset": endOffset};
}
function EditableContent_visitContentFragmentNodes(callback, callbackArguments, node, offset, endContainer, endOffset, visitSiblings, expand)
{	
	if(!this.visitContentFragmentNodes.endContainer)
	{
		//first call
		var rangeBoundaries;
		
		rangeBoundaries={"startContainer": node, "startOffset": offset, "endContainer": endContainer, "endOffset": endOffset};
			
		if(expand)
		{
			rangeBoundaries=this.expandRangeBoundaries(rangeBoundaries);
		}
		

		node=rangeBoundaries.startContainer;
		offset=rangeBoundaries.startOffset;

		endContainer=rangeBoundaries.endContainer;
		endOffset=rangeBoundaries.endOffset;
		
	
		this.visitContentFragmentNodes.endContainer=endContainer;
		this.visitContentFragmentNodes.endOffset=endOffset;
		
		visitSiblings=true;
		
		if(callback)
		{
			if(typeof(callback)!="object")
			{
				callback=[window, callback];
			}
			if(typeof(callbackArguments)=="undefined")
			{
				callbackArguments=new Object();
				
			}
			if(!callbackArguments)
			{
				callbackArguments={};
			}
			callbackArguments.startNode=node;
			callbackArguments.startOffset=offset;
			callbackArguments.endNode=endContainer;
			callbackArguments.endOffset=endOffset;
		}
	}
	
	var closeOffset, endVisit, skipChildNodes=false;
	
	if(this.visitContentFragmentNodes.endContainer.isElement() && 
			node==this.visitContentFragmentNodes.endContainer.childNodes[this.visitContentFragmentNodes.endOffset])
	{
		//stop visiting
		//callback the parent and return true;
		if(callback)
		{
			
			
			try
			{
				callback[0][callback[1]](this.visitContentFragmentNodes.endContainer, this.visitContentFragmentNodes.endOffset, true, true, callbackArguments);
			}
			catch(err)
			{
				switch(err.code)
				{
					case ERR_SKIP_CHILD_NODES_VISITS:
						skipChildNodes=true;
						break;
					case ERR_STOP_VISITS:
						this.visitContentFragmentNodes.endContainer=null;
						this.visitContentFragmentNodes.endOffset=-1;
						return true;
					default: 
						throw err;
				}
			}
		}
		
		this.visitContentFragmentNodes.endContainer=null;
		this.visitContentFragmentNodes.endOffset=-1;
		return true;
	}
	
	if(node==this.visitContentFragmentNodes.endContainer)
	{
		//end container found
		//visit its child nodes starting with offset up to endOffset
		closeOffset=this.visitContentFragmentNodes.endOffset;
		endVisit=true;
		
		
	}
	else
	{
		closeOffset=(node.isText() ? node.textContent.length : node.childNodes.length);
		endVisit=false;
	}
	
	if(callback && ( offset<closeOffset || ( node.isElement() && node.childNodes.length==0) ) )
	{
		try
		{
			callback[0][callback[1]](node, offset, false, false, callbackArguments);
		}
		catch(err)
		{
			switch(err.code)
			{
				case ERR_SKIP_CHILD_NODES_VISITS:
					skipChildNodes=true;
					break;
				case ERR_STOP_VISITS:
					this.visitContentFragmentNodes.endContainer=null;
					this.visitContentFragmentNodes.endOffset=-1;
					return true;
				default: 
					throw err;
			}
		}
	}
	
	if(!skipChildNodes && node.hasChildNodes())
	{
		for(var i=offset; i<closeOffset; i++)
		{
			if(this.visitContentFragmentNodes(callback, callbackArguments, node.childNodes[i], 0, null, null, false, false))
			{
				//end container found within a child node, stop visiting
				return true;
			}
		}
	}
	
	if(callback)
	{
		
		try
		{
			callback[0][callback[1]](node, closeOffset, true, endVisit, callbackArguments);	
		}
		catch(err)
		{
			switch(err.code)
			{
				case ERR_SKIP_CHILD_NODES_VISITS:
					skipChildNodes=true;
					break;
				case ERR_STOP_VISITS:
					this.visitContentFragmentNodes.endContainer=null;
					this.visitContentFragmentNodes.endOffset=-1;
					return true;
				default: 
					throw err;
			}
		}
	}
	if(endVisit)
	{
		this.visitContentFragmentNodes.endContainer=null;
		this.visitContentFragmentNodes.endOffset=-1;
		return true;
	}
	if(visitSiblings)
	{
		for(var nextSibling=node.nextSibling; nextSibling; nextSibling=nextSibling.nextSibling)
		{
			if(this.visitContentFragmentNodes(callback, callbackArguments, nextSibling, 0, null, null, false))
			{
				return true;
			}
		}
		
		return this.visitContentFragmentNodes(callback, callbackArguments, node.parentNode, node.parentNode.childNodes.length, null, null, true, true);
	}
}
function EditableContent_isTagBreakable(tagName)
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
function EditableContent_surroundInsertionBoundaryNodes(tagName, startNode, startOffset, endNode, endOffset, modifiedNodes)
{
	var commonAncestorNode, startEdgeNode;
	var endEdgeNode, endEdgeRightNode;
	
	var splitStart, splitStartOffset, splitEnd, splitEndOffset;
	var splitInfo, removeIfEmptyNodes=[];
	
	commonAncestorNode=startNode.getCommonAncestor(endNode);
		
	if(startNode.isElement() && startNode.parentNode==commonAncestorNode)
	{
		//if(startNode.parentNode==commonAncestorNode)
		//{
			splitStart=startNode;
			splitStartOffset=startOffset;
		//}
		//else
		//{
		//	
		//}
	}
	else
	{
		if(startNode.isElement())
		{
			splitStart=startNode.parentNode;
			splitStartOffset=startNode.getIndex();
		}
		else
		{
			splitStart=startNode;
			splitStartOffset=startOffset;
		}
		
		splitInfo=commonAncestorNode.splitAtDescendant(splitStart, splitStartOffset, true, false);
		splitInfo=splitInfo[splitInfo.length-1];
		splitStart=splitInfo[splitInfo[SPLIT_NODE_INDEX]];//splitInfo.right;
		/*
		if(splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]])
		{
			removeIfEmptyNodes[removeIfEmptyNodes.length]=splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]];//splitInfo.left;
		}
		*/
	}
	
	if(endNode.isElement() && endNode.parentNode==commonAncestorNode)
	{
		splitEnd=endNode;
		splitEndOffset=endOffset;
	}
	else
	{
		if(endNode.isElement())
		{
			splitEnd=endNode.parentNode;
			splitEndOffset=endNode.getIndex()+1;//+1 to split AFTER endNode
		}
		else
		{
			splitEnd=endNode;
			splitEndOffset=endOffset;
		}
		if(splitStart==splitEnd)
		{
			splitEndOffset-=splitStartOffset;
		}

		splitInfo=commonAncestorNode.splitAtDescendant(splitEnd, splitEndOffset, false, false);
		splitInfo=splitInfo[splitInfo.length-1];
		splitEnd=splitInfo[splitInfo[SPLIT_NODE_INDEX]];
		/*
		if(splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]])
		{
			removeIfEmptyNodes[removeIfEmptyNodes.length]=splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]];
		}
		*/
	}
	var containerElement=this.window.document.createElement(tagName);
	
	commonAncestorNode.insertBefore(containerElement, splitStart);
	
	var startIndex=splitStart.getIndex();
	
	//for( ; commonAncestorNode.childNodes[startIndex]!=splitEnd; )
	for( ; ; )
	{
		if(commonAncestorNode.childNodes[startIndex]==splitEnd)
		{
			containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
			break;
		}
		containerElement.appendChild(commonAncestorNode.childNodes[startIndex]);
	}
	/*
	for(var i=0; i<removeIfEmptyNodes.length; i++)
	{
		if(removeIfEmptyNodes[i].isEmpty())
		{
			removeIfEmptyNodes[i].parentNode.removeChild(removeIfEmptyNodes[i]);
		}
	}
	*/
   
	return containerElement;
}
function EditableContent_getElementNotAllowedDescendants(element, tagNames, checkOnlyTagNames)
{
	var ca;
	if(!ca)
	{
		ca={};
	}
	ca.notAllowedNodes=[];
	ca.topNode=element;
	ca.outerTagName=element.tagName;//outerTagName.toUpperCase();
	ca.findTagNames=typeof tagNames!="object" ? [tagNames]:tagNames;
	ca.checkOnlyTagNames=checkOnlyTagNames;
	
	this.visitContentFragmentNodes([this, "collectNotAllowedDescendants"], 
						ca,
						element, 0, element, element.childNodes.length);
						
	return ca.notAllowedNodes;
}
function EditableContent_collectNotAllowedDescendants(node, offset, close, endVisit, ca /*callbackArguments*/)
{
	if(!ca.checkOnlyTagNames && !close && ca.topNode.hasTransparentContent() && !node.isText() && !Node.prototype.isTagBreakable(node.tagName))
	{
		
		throw new CustomError(ERR_SKIP_CHILD_NODES_VISITS);
	}
	
	
	if(!close &&  node!=ca.topNode)
	{
		for(var i=0; i<ca.findTagNames.length; i++)
		{
			if(node.tagName==ca.findTagNames[i])
			{
				ca.notAllowedNodes[ca.notAllowedNodes.length]=node;
				return;
			}
		}
	}
	if(ca.checkOnlyTagNames)
	{
		return;
	}
	if(close || node==ca.topNode || (node.getContentCategory() & TRANSPARENT_CONTENT ) || node.isAllowedInNode(ca.topNode))
	{
		return;
	}
	
	ca.notAllowedNodes[ca.notAllowedNodes.length]=node;
}
function EditableContent_getNotAllowedAncestors(element, tagNames)
{
	var ascendant, notAllowedAscendants=[];
	
	if(typeof tagNames!="object")
	{
		tagNames=[tagNames];
	}
	
	for(ascendant=element.parentNode; ascendant!=this.documentContainer; ascendant=ascendant.parentNode)
	{
		if(!element.isAllowedInNode(ascendant))
		{
			notAllowedAscendants[notAllowedAscendants.length]=ascendant;
			continue;
		}
		
		for(var i=0; i<tagNames.length; i++)
		{	
			if(ascendant.tagName==tagNames[i])
			{
				notAllowedAscendants[notAllowedAscendants.length]=ascendant;
				break;
			}
		}
	}
	return notAllowedAscendants;
}

function EditableContent_removeNotAllowedDescendants(element)
{
	var notAllowedChildNodes, i;
	
	notAllowedChildNodes=this.getElementNotAllowedDescendants(element, element.tagName);
	
	for(i=0; i<notAllowedChildNodes.length; i++)
	{
		notAllowedChildNodes[i].moveContentBefore();
		//notAllowedChildNodes[j].parentNode.removeChild(notAllowedChildNodes[j]);
	}
}
function EditableContent_surroundSelectedContentFragments(tagName, tagAttributes, select)
{
	var ranges, containers=[], i;
	
	ranges=this.window.contentSelection.getRanges();//this.getRanges();
	
	for(i=0; i<ranges.length; i++)
	{
		containers[containers.length]=this.surroundContentFragment(tagName, tagAttributes,
																	ranges[i].startIsChildNode ? 
																		ranges[i].startContainer.parentNode : ranges[i].startContainer, 
																		ranges[i].startIsChildNode ? 
																			 ranges[i].startContainer.getIndex()+ranges[i].startShiftOffset : ranges[i].startOffset,
																	ranges[i].endIsChildNode ? 
																		ranges[i].endContainer.parentNode : ranges[i].endContainer, 
																		ranges[i].endIsChildNode ? ranges[i].endContainer.getIndex() +ranges[i].endShiftOffset : ranges[i].endOffset, 
																	true);
		
		
	}
	
	if(!select)
	{
		return;
	}
	
	this.clearSelection();
	
	for(i=0; i<containers.length; i++)
	{
		this.addSelection(containers[i][0], 0, 
			containers[i][containers[i].length-1], 
			containers[i][containers[i].length-1].childNodes.length);
	}
	
	
}
function EditableContent_surroundContentFragment(tagName, tagAttributes, node, offset, rangeEndContainer, rangeEndOffset, expand)
{
	var args, containers;
	var outerTagCategory, outerTagContentCategory;
	var i, j, k;
	var splitInfo={"modifiedNodes": []};
	var sibn;
	var container, containers=[];
	
	outerTagCategory=Node.prototype.___getTagCategory(tagName);
	outerTagContentCategory=Node.prototype.___getTagContentCategory(tagName);
	
	args=this.getInsertionBoundaryNodes(node, offset, rangeEndContainer, rangeEndOffset, null, tagName, expand);
	
	for(i=0; i<args.inlineEdgeNodes.length; i++)
	{	
		containers[containers.length]=this.surroundInsertionBoundaryNodes(tagName, args.inlineEdgeNodes[i].startNode, 
						args.inlineEdgeNodes[i].startOffset,
						args.inlineEdgeNodes[i].endNode, 
						args.inlineEdgeNodes[i].endOffset,
						splitInfo);
		
		if(!tagAttributes)
		{
			continue;
		}

		for(var tagAttributeName in tagAttributes)
		{
			containers[containers.length-1][tagAttributeName]=tagAttributes[tagAttributeName];
		}
	}
	
	var notAllowedChildNodes, notAllowedAncestors;
	
	for(i=0; i<containers.length; i++)
	{
		container=containers[i];
		notAllowedChildNodes=this.getElementNotAllowedDescendants(container, container.tagName, outerTagContentCategory & TRANSPARENT_CONTENT);
		
		//for each container remove not allowd child nodes outside them
		// and remove the childnodes
		//eg, after formatting with a <h1>:
		// <h1><p> a paragraph </p></h1> -> <h1> a paragraph </h1>
		for(j=0; j<notAllowedChildNodes.length; j++)
		{
			notAllowedChildNodes[j].moveContentBefore();//it also remove notAllowedChildNodes[j] from its parent
		}
		
		
		//split ascedants that are not allowed and remove the part that surrounds new created node
		//after splittings
		//eg, initial:
		// <h2>Some <b>bold</b> heading</h2>
		//Then create a <h1> around "ol":
		// <h2>Some <b>b<h1>ol</h1>d</b> heading</h2>
		// First split the <h2> and <b> tags:
		// <h2>Some <b>b</b></h2><h2><b><h1>ol</h1></b></h2><h2><b>d</b> heading</h2>
		// Then, remove the <h2> and <B> that sorrounds the <H1>:
		// <h2>Some <b>b</b></h2><h1>ol</h1><h2><b>d</b> heading</h2>
		notAllowedAncestors=this.getNotAllowedAncestors(container, container.tagName);
		
		
		for(j=0; j<notAllowedAncestors.length; j++)
		{
			//third param of splitAtDescendant:
			// when true, hte new node is created at left, so notAllowedAncestors[j] remain at right;
			//when false, the new node is created at right, so notAllowedAncestors[j] remains at left
			
			if(!Node.prototype.isTagBreakable(notAllowedAncestors[j].tagName))
			{
				continue;
			}
			
			var splitInfo;
			
			splitInfo=notAllowedAncestors[j].splitAtDescendant(container, 0, true, true);
			splitInfo=splitInfo[splitInfo.length-1];
			
			if(splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]] && splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]].isEmpty())
			{
				splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]].parentNode.removeChild(splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]]);
			}
			
			splitInfo=notAllowedAncestors[j].splitAtDescendant(container, container.childNodes.length, false, true);
			splitInfo=splitInfo[splitInfo.length-1];
			
			if(splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]] && splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]].isEmpty())
			{
				splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]].parentNode.removeChild(splitInfo[splitInfo[SPLIT_NEW_NODE_INDEX]]);
			}
			//return;
			notAllowedAncestors[j].moveContentBefore();
					
		}
	}
	
	this.documentContainer.normalize();
	
	return containers;
}

function EditableContent_getInsertionBoundaryNodes(startNode, startOffset, endNode, endOffset, ca/*callback arguments*/, outerTagName, expand)
{
	
	var range=this.getRange();
	if(range.collapsed && !startNode && !endNode)
	{
		throw new CustomError(ERR_RANGE_COLLAPSED);
	}
	if(!ca)
	{
		ca={};
	}
	ca.inlineEdgeNodes=[];
	ca.openNodes=0;
	ca.openNodesDepth=10000;
	ca.outerTagName=outerTagName.toUpperCase();
	//ca.notAllowedNodes=[];
	ca.startNewEdge=true;
	ca.startOffsetsStack=[];
	ca.notClosed=[];
	ca.forceAllow=false;
	
	ca.collectNotAllowedNodes=!Node.prototype.___tagIsPhrasingContent(outerTagName);
	
	this.visitContentFragmentNodes([this, "collectInsertionBoundaries"], 
						ca,
						startNode, startOffset, endNode, endOffset, true, 
						typeof expand=="undefined" ? !Node.prototype.___tagIsPhrasingContent(outerTagName) || Node.prototype.___tagHasTransparentContent(outerTagName) : expand);
	
	return ca;
}
/**
 * 
 * EditableContent.collectInsertionBoundaries
 * 
 * Nodurile care deschid si se inchid in interiorul selectiei sint vizitate de 2 ori, inainte de vizitarea primului child si dupa vizitarea ultimului child;
 * Cele  care se deschid inaintea selectiei si se inchid in interior sint vizitate doar dupa ultimul child;
 * Cele care se deschid in selectie si se inchid dupa ea sint vizitatea doar inainte primului child
 * 
 * 
 * @param {type} node - nodul vizitat
 * @param {type} close - false daca vizita este inaintea vizitarii childrenilor, true daca acestia au fost vizitati
 * @param {type} endVisit - nodul vizitat este ultimul care este vizitat, este ultimul apel al callback-ului
 * @param {type} ca - argumente, se plimba de la un apel la altul si este returnat de catre functia de vizitare
 * @param {type} startOffset - pentru nod text cu close=false, este indexul la care s-a inceput vizita (la ce caracter); pentru close=true este ultimul caracter "vizitat"
 * @param {type} endOffset - pentru text node la fel ca startOffset cu close tratat invers 
 * @returns {undefined}
 */

function EditableContent_collectInsertionBoundaries(node, offset, close, endVisit, ca )
{
	var numDelimiters, tagAllowed;
	var tagAllowed=false;
	var isBreakable=node.isText() ? true : Node.prototype.isTagBreakable(node.tagName);
	var skipChildNodes=false;
	
	if(node==this.documentContainer && !close)
	{
		return;
	}
	
	numDelimiters=ca.inlineEdgeNodes.length;
	if(!ca.forceAllow)
	{
		if(Node.prototype.___tagHasTransparentContent(ca.outerTagName))
		{
			ca.collectNotAllowedNodes=false;
			
			if(!node.isText() && !node.isPhrasingContent())
			{
				var commonAncestor;

				if(!close && offset==0)
				{
					
					if(node.getCategory() & ALL_CONTENT)
					{
						tagAllowed=true;
						if(numDelimiters>0)//!ca.inlineEdgeNodes[numDelimiters-1] || !ca.inlineEdgeNodes[numDelimiters-1].startNode)
						{
							commonAncestor=ca.inlineEdgeNodes[numDelimiters-1].startNode.getCommonAncestor(node);
							tagAllowed=node.isAllowedInNode(commonAncestor);
						}
						
						tagAllowed=tagAllowed && !(node.compareDocumentPosition(ca.endNode) & Node.DOCUMENT_POSITION_CONTAINED_BY);
					}
					if(ca.forceAllow=tagAllowed)
					{
						ca.startOffsetsStack.push(offset);
						throw new CustomError(ERR_SKIP_CHILD_NODES_VISITS);
					}
				}
			}
			else
			{
				tagAllowed=true;
			}
		}
		else
		{
			tagAllowed=node.isAllowedInTag(ca.outerTagName);
		}
	}
	else
	{
		tagAllowed=true;
		isBreakable=true;
		ca.forceAllow=false;
	}
	
	var isEdge; 
	
	if((node.isPhrasingContent() && !node.isGroupingContent() && node.isEmpty()) || !tagAllowed )
	{
		isEdge=false;
	}
	else
	{
		if(node.isText())
		{
			isEdge=(!close && offset<node.textContent.length) || (close && offset>0);
		}
		else
		{
			isEdge=(!close && offset==0) || (close && offset==node.childNodes.length);
		}
	}

	if(isEdge)
	{
		if(!close)
		{
			//ca.openNodes++;
			ca.startOffsetsStack.push(offset);
			return;
		}
		else
		{
			if(ca.startOffsetsStack.length==0)
			{
				//Close element open outside selection
			}
			else
			{
				var startOffset=ca.startOffsetsStack.pop();
				//ca.openNodes--;
				if(ca.startOffsetsStack.length<ca.openNodesDepth)
				{
					if(ca.startNewEdge)
					{
						ca.inlineEdgeNodes[numDelimiters]={"startNode": null, "startOffset": -1, "endNode": null, "endOffset":-1, "lastEndNode": null, "lastEndOffset": -1};
						numDelimiters++;
						ca.startNewEdge=false;
					}

					ca.inlineEdgeNodes[numDelimiters-1].startNode=node;
					ca.inlineEdgeNodes[numDelimiters-1].startOffset=startOffset;
					ca.openNodesDepth=ca.startOffsetsStack.length;
				}

				ca.inlineEdgeNodes[numDelimiters-1].lastEndNode=node;
				ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset=offset;
			}
		}
	}
	if(endVisit || (!tagAllowed && !ca.collectNotAllowedNodes) || !isBreakable)
	{
		if(!ca.startNewEdge)
		{
			ca.inlineEdgeNodes[numDelimiters-1].endNode=ca.inlineEdgeNodes[numDelimiters-1].lastEndNode;
			ca.inlineEdgeNodes[numDelimiters-1].endOffset=ca.inlineEdgeNodes[numDelimiters-1].lastEndOffset;

			if(!endVisit)
			{
				ca.startNewEdge=true;
				ca.startOffsetsStack=[];
				//ca.openNodes=0;
				ca.openNodesDepth=10000;
			}
		}
	}
}
/**
 * 
 * EditableContent.getNodeParagraphFragment
 * 
 * Given a node, it find the first and the last nodes of the paragraph fragment the node belongs to 
 * 
 * Paragraph:
 * 
 * A paragraph is typically a run of phrasing content that forms a block of text ...
 * https://www.w3.org/html/wg/drafts/html/master/single-page.html#paragraphs
 * 
 * Paragraphs in flow content are defined relative to what the document looks like without the a, ins, del, and map elements complicating matters, since those elements, 
 * with their hybrid content models, can straddle paragraph boundaries, as shown in the first two examples below.
 * 
 * Pargraph fragment:
 * A continuos (nodes are siblings) piece of paragraph. A paragraph can be splitted in pargraph fragments by transparent content (A, DEL, INS, MAP)
 * 
 * Ex.:
 * 
 * This is a fragment <A> of a paragraph
 * 
 * <UL>
 *	<LI>List item</LI>
 * </UL>
 * </A>
 * 
 * First paragraph start at "This is..." and ends with "..of a paragraph".
 * Because the A tag contains the UL element it can't be entirely included in the paragraph, but its first node can.
 * 
 * So there is one paragraph with 2 paragraph fragments ("This is a fragment " and " of a paragraph").
 * 
 */
function EditableContent_onSelectionChanged(evt)
{
	//this.documentContainer.ownerDocument.defaultView.ContentSelection.prototype.___takeSnapshot(this.documentContainer.ownerDocument.defaultView);
	//this.window.contentSelection.takeSnapshot();
}
function EditableContent_onBeforeUnload(evt)
{
	var xmlHttp, serializedHistory, postData, mutationHistoryRanges;
	return;
	serializedHistory=this.mutationHistory.serialize();
	
	postData="serializedHistory="+encodeURIComponent(serializedHistory)+
				"&innerHTML="+encodeURIComponent(JSON.stringify(this.documentContainer.innerHTML));
	
	xmlHttp = new XMLHttpRequest();
	
	xmlHttp.open("POST", window.location+"?message=test123", false);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.send(postData);
}
function EditableContent_restoreSerializedMutationHistoryRanges(serializedMutationHistoryRanges)
{
	
	var startContainer, startOffset, endContainer, endOffset;
	var startIndex, endIndex;
	if(!serializedMutationHistoryRanges)
	{
		return;
	}
	
	serializedMutationHistoryRanges=JSON.parse(serializedMutationHistoryRanges);
	
	for(var j=0; j<=1; j++) 
	{
		for(var i=0; i<serializedMutationHistoryRanges[j].length; i++)
		{
		
			startContainer=this.documentContainer.ownerDocument.getElementById(serializedMutationHistoryRanges[j][i].startContainer);
			
			if(serializedMutationHistoryRanges[j][i].startIndex!=-1)//text node
			{
				
				startContainer=startContainer.childNodes[serializedMutationHistoryRanges[j][i].startIndex];
			}
			endContainer=this.documentContainer.ownerDocument.getElementById(serializedMutationHistoryRanges[j][i].endContainer);
			
			if(serializedMutationHistoryRanges[j][i].endIndex!=-1)//text node
			{
				endContainer=endContainer.childNodes[serializedMutationHistoryRanges[j][i].endIndex];
			}
			
			this.mutationHistoryRanges[j][i]={"startContainer": startContainer, 
												"startOffset": serializedMutationHistoryRanges[j][i].startOffset,
												"endContainer": endContainer, 
												"endOffset": serializedMutationHistoryRanges[j][i].endOffset};
		}
	}
}

function EditableContent_removeSiblings(startSibling, endSibling)
{
	var startSiblingIndex;
	var siblingsParent=startSibling.parentNode;
	
	startSiblingIndex=startSibling.getIndex();
	
	while(true)
	{
		if(siblingsParent.removeChild(siblingsParent.childNodes[startSiblingIndex])==endSibling)
		{
			break;
		}
	}
}


function EditableContent_elementsHaveTheSameBasicTextFormatting(element1, element2)
{
	var styleProperties;
	var style1, style2;
	
	styleProperties=["fontFamily", "fontSize", "color"];
	
	style1=element1.getComputedStyle();
	style2=element2.getComputedStyle();
	
	for(var i=0; i<styleProperties.length; i++)
	{
		if(style1[styleProperties[i]]!=style2[styleProperties[i]])
		{
			return false;
		}
	}
	
	return true;
}


function EditableContent_joinNodes(left, right, includeEmptyTextNodes, includeEmptyElements)
{
	/* Lipeste nodurile left si right prin mutarea continutului lui right in left;
	 * - nodurile trebuie sa fie siblinguri (acelasi parent)
	 * - trebuie sa fie de acelsi tip iar daca sint elemente sa aiba acelasi tagName si simpla formatare (culoare text, culoare background etc)
	 * 
	 * De fapt nu se lipesc left si right. Ele sint doar puncte de pornire in cautarea
	 * de noduri compatibile.
	 * 
	 * De la left (incluzandu-l) se merge spre stanga pana se gaseste primul nod ne-gol.
	 * Evident, trebuie ca macar unul dintre includeEmptyTextNodes si includeEmptyElements sa fie true.
	 * 
	 * Daca doua astfel de noduri sint gasite atunci se lipesc cum e descris la inceputul commentului.
	 * Inainte de lipire, se salveaza lastChild-ului nodului stang si firstChild-ul celui drept.
	 * Se reapeleaza metoda pentru a lipi aceste 2 noduri;
	 */
	
	
	for( left; 
		left.isEmpty() && ( (includeEmptyTextNodes && left.isText()) || (includeEmptyElements && left.isElement()) ); 
		left=left.previousSibling)
	{
	}
	for( right; 
		right.isEmpty() && ( (includeEmptyTextNodes && right.isText()) || (includeEmptyElements && right.isElement()) ); 
		right=right.nextSibling)
	{
	}
	
	if(left && right)
	{
		if(left.isText() && right.isText())
		{
			left.textContent+=right.textContent;
			right.parentNode.removeChild(right);
		}
		else
		if(left.isElement() && right.isElement() && left.tagName==right.tagName && this.elementsHaveTheSameBasicTextFormatting(left, right) )
		{
			var leftLastChild, rightFirstChild;
			
			leftLastChild=left.lastChild;
			rightFirstChild=right.firstChild;
			left.appendNodeContent(right);//it also removes right
			
			this.joinNodes(leftLastChild, rightFirstChild, includeEmptyTextNodes, includeEmptyElements);
		}
	}
	
	return true;
}

function EditableContent_deleteSelectedContentFragments()
{
	var ranges, i, containers=[];
	
	ranges=this.window.contentSelection.getRanges();//this.getRanges();
	
	for(i=0; i<ranges.length; i++)
	{
		containers[containers.length]=this.deleteContentFragment(ranges[i].startIsChildNode ? 
																		ranges[i].startContainer.parentNode : ranges[i].startContainer, 
																		ranges[i].startIsChildNode ? 
																			 ranges[i].startContainer.getIndex()+ranges[i].startShiftOffset : ranges[i].startOffset,
																	ranges[i].endIsChildNode ? 
																		ranges[i].endContainer.parentNode : ranges[i].endContainer, 
																		ranges[i].endIsChildNode ? ranges[i].endContainer.getIndex() +ranges[i].endShiftOffset : ranges[i].endOffset);
		
	}
	
	this.clearSelection();
}
function EditableContent_deleteContentFragment(startContainer, startOffset, endContainer, endOffset)
{
	var range, commonAncestor;
	var leftSplitInfo, rightSplitInfo, rightSplitInfo2;
	var lastLeftNode, lastLeftNode2, firstLeftNode;
	var ca;
	
	if(!startContainer)
	{
		range=this.getRange();
		var startContainer, startOffset, endContainer, endOffset;

		startContainer=range.startContainer;
		startOffset=range.startOffset;
		endContainer=range.endContainer;
		endOffset=range.endOffset;
	}
	
	if(startContainer==endContainer && startContainer.isText())
	{
		startContainer.textContent=startContainer.textContent.substr(0, startOffset)+startContainer.textContent.substr(endOffset);
		return;
	}
	
	commonAncestor=startContainer.getCommonAncestor(endContainer);
	
	//first split the nodes at start and end of selection
	leftSplitInfo=commonAncestor.splitAtDescendant(startContainer, startOffset, false, false, true);
	leftSplitInfo=leftSplitInfo[leftSplitInfo.length-1];
	
	if(!leftSplitInfo[SPLIT_RIGHT_NODE])
	{
		leftSplitInfo[SPLIT_RIGHT_NODE]=leftSplitInfo[SPLIT_LEFT_NODE].nextSibling;
		
	}
	
	rightSplitInfo=commonAncestor.splitAtDescendant(endContainer, endOffset, true, false);
	rightSplitInfo=rightSplitInfo[rightSplitInfo.length-1];
	if(!rightSplitInfo[SPLIT_LEFT_NODE])
	{
		rightSplitInfo[SPLIT_LEFT_NODE]=rightSplitInfo[SPLIT_RIGHT_NODE].previousSibling;
	}
	
	this.removeSiblings(leftSplitInfo[SPLIT_RIGHT_NODE], rightSplitInfo[SPLIT_LEFT_NODE]);
	
	ca={"node": leftSplitInfo[SPLIT_LEFT_NODE], "startNode": endContainer, "stopSearchingOnFirstNowAllowedNode": false, "allowedNodes": []};
	
	rightSplitInfo[SPLIT_RIGHT_NODE].visitDescendants([this, "findPhrasingContentNodes"], ca, true, true);
	
	/* find the topmost descendand of the left fragment that allows phrasing content but
	 * it's not phrasing content itself
	 */
	for( lastLeftNode=leftSplitInfo[SPLIT_LEFT_NODE]; 
		lastLeftNode.lastChild && lastLeftNode.lastChild.allowsPhrasingContent() && !lastLeftNode.lastChild.isPhrasingContent(); 
		lastLeftNode=lastLeftNode.lastChild )
	{
	}
	
	if(lastLeftNode)
	{
		lastLeftNode=lastLeftNode.isPhrasingContent() ? lastLeftNode : lastLeftNode.lastChild;
	}
	var lastParentNode;

	for(var i=0; i<ca.allowedNodes.length; i++)
	{
		lastParentNode=ca.allowedNodes[i].parentNode;

		if(lastLeftNode)
		{
			lastLeftNode.parentNode.insertAfter(ca.allowedNodes[i], lastLeftNode);
			
			this.joinNodes(lastLeftNode, ca.allowedNodes[i], true, true);
			
			if(ca.allowedNodes[i].parentNode)
			{
				lastLeftNode=ca.allowedNodes[i];
			}
		}
		else
		{
			lastLeftNode=commonAncestor.insertBefore(ca.allowedNodes[i], rightSplitInfo[SPLIT_RIGHT_NODE]);
		}
		
		if(lastParentNode.isEmpty())
		{
			lastParentNode.parentNode.removeChild(lastParentNode);
		}
	}
	
}



function EditableContent_findPhrasingContentNodes(node, ca, close)
{	
	if(!close && node==ca.startNode)
	{
		if(node.isPhrasingContent(ca.node))
		{
			ca.allowedNodes[ca.allowedNodes.length]=node;
		}
		ca.stopSearchingOnFirstNowAllowedNode=true;
		return;
	}
		
	if(node.isPhrasingContent())
	{
		if(close)
		{
			return;
		}

		ca.allowedNodes[ca.allowedNodes.length]=node;
		if(node.compareDocumentPosition(ca.startNode) & Node.DOCUMENT_POSITION_CONTAINED_BY)
		{
			ca.stopSearchingOnFirstNowAllowedNode=true;
		}
		throw new CustomError(ERR_SKIP_CHILD_NODES_VISITS);
	}
	
	if(ca.stopSearchingOnFirstNowAllowedNode)
	{
		throw new CustomError(ERR_STOP_VISITS);
		return;
	}
}
function EditableContent_onKeyPress(evt)
{
	if(evt.key=="z" && evt.metaKey)
	{
		evt.preventDefault();
		if(evt.shiftKey)
		{
			this.redo();
		}
		else
		{
			this.undo();
		}
	}
	
}