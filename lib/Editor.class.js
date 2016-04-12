function Editor()
{
	this.editableContents=[];
	this.currentEditableContent=null;
	Editor.prototype.___instance=this;
	this.onFocusHandler=new Function ("evt", "Editor.prototype.___instance.onFocus(evt)");
}
with(Editor)
{
	prototype.___instance=null;
	prototype.addEditableContent=Editor_addEditableContent;
	prototype.getEditableContentByDocumentContainer=Editor_getEditableContentByDocumentContainer;
	prototype.onFocusHandler=null;
	prototype.onFocus=Editor_onFocus;
}
function Editor_addEditableContent(iframe, setAsCurrent, innerHTML, serializedHistory)
{
	var editableContent;
	
	editableContent=new EditableContent(iframe, innerHTML, serializedHistory);
	
	var c=editableContent.documentContainer.ownerDocument.getElementsByTagName("X-FLOW-CONTENT-NOT-EDITABLE");
	
	for(var i=0; i<c.length; i++)
	{
		c[i].firstChild.addEventListener("focus", this.onFocusHandler);
	}
	this.editableContents[this.editableContents.length]=editableContent;
	if(setAsCurrent)
	{
		this.currentEditableContent=this.editableContents[this.editableContents.length-1];
	}
	
	
}
function Editor_getEditableContentByDocumentContainer(node)
{
	for(var i=0; i<this.editableContents.length; i++)
	{
		if(this.editableContents[i].documentContainer.contains(node))
		{
			return this.editableContents[i];
		}
	}
}
function Editor_onFocus(evt)
{
	if(this.currentEditableContent)
	{
		this.currentEditableContent.window.frameElement.style.outline="none";
	}
	this.currentEditableContent=this.getEditableContentByDocumentContainer(evt.target);
	this.currentEditableContent.window.frameElement.style.outline="4px red solid";
}