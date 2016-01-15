
Document.prototype.mutationHistoryCreateElement=Document.prototype.createElement;
Document.prototype.mutationHistoryCreateTextNode=Document.prototype.createTextNode;



Document.prototype.createElement=Document_createElement;
Document.prototype.createTextNode=Document_createTextNode;

function Document_createElement(tagName)
{
	
	var element=this.mutationHistoryCreateElement(tagName);
		
	window.parent.mh.observe(element);
	console.log("createElement");
	return element;
}
function Document_createTextNode(text)
{
	var element=this.mutationHistoryCreateTextNode(text);
	
	window.parent.mh.observe(element);
	console.log("createTextNode");
	return element;
}
