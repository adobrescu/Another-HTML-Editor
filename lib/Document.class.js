
Document.prototype.mutationHistoryCreateElement=Document.prototype.createElement;

Document.prototype.createElement=Document_createElement;

function Document_createElement(tagName)
{
	var element=this.mutationHistoryCreateElement(tagName);
		
	window.parent.mh.observe(element);
	
	return element;
}