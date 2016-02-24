
Document.prototype.mutationHistoryCreateElement=Document.prototype.createElement;
Document.prototype.mutationHistoryCreateTextNode=Document.prototype.createTextNode;



Document.prototype.createElement=Document_createElement;
Document.prototype.createTextNode=Document_createTextNode;

function Document_createElement(tagName, noObserver)
{
	
	var element=this.mutationHistoryCreateElement(tagName);
	
	if(!noObserver)
	{
		window.parent.ed.currentEditableContent.mutationHistory.observe(element);
	}
	return element;
}
function Document_createTextNode(text, noObserver)
{
	var textNode=this.mutationHistoryCreateTextNode(text);
	
	if(!noObserver)
	{
		window.parent.ed.currentEditableContent.mutationHistory.observe(textNode);
	}
	return textNode;
}
