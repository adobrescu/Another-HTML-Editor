
Document.prototype.mutationHistoryCreateElement=Document.prototype.createElement;
Document.prototype.mutationHistoryCreateTextNode=Document.prototype.createTextNode;



Document.prototype.createElement=Document_createElement;
Document.prototype.createTextNode=Document_createTextNode;

function Document_createElement(tagName)
{
	
	var element=this.mutationHistoryCreateElement(tagName);
		
	window.parent.ed.mutationHistory.observe(element);
	
	return element;
}
function Document_createTextNode(text)
{
	var textNode=this.mutationHistoryCreateTextNode(text);
	
	window.parent.ed.mutationHistory.observe(textNode);
	
	return textNode;
}
