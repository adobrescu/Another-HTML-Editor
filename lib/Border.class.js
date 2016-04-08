function Border(doc)
{
	this.document=doc;
	this.borders=[];
	this.borderWidth=4;
	for(var i=0; i<4; i++)
	{
		this.borders[this.borders.length]=doc.createElement("div", true);
		this.borders[this.borders.length-1].className="border";
	}
	
	this.borders[0].className="border top";
	this.borders[1].className="border right";
	this.borders[2].className="border bottom";
	this.borders[3].className="border left";
}
with(Border)
{
	prototype.surroundElements=Border_surroundElements;
	prototype.show=Border_show;
	prototype.remove=Border_remove;
	prototype.isSolid=Border_isSolid;
}
function Border_surroundElements(element1, element2)
{
	var bcr1, bcr2;
	var top, right, bottom, left;
	
	bcr1=element1.getBoundingClientRect();
	bcr2=element2.getBoundingClientRect();
	
	top=Math.min(bcr1.top, bcr2.top);
	right=Math.max(bcr1.right, bcr2.right);
	bottom=Math.max(bcr1.bottom, bcr2.bottom);
	left=Math.min(bcr1.left, bcr2.left);
	
	
	this.borders[0].style.top=(top+this.document.documentElement.scrollTop+this.document.body.scrollTop-this.borderWidth/2)+"px";
	this.borders[0].style.width=(right-left)+"px";
	this.borders[0].style.height="0px";
	this.borders[0].style.left=(left)+"px";
	
	
	this.borders[1].style.top=this.borders[0].style.top;
	this.borders[1].style.width="0px";
	this.borders[1].style.height=(bottom-top-this.borderWidth)+"px";
	this.borders[1].style.left=(right-this.borderWidth/2)+"px";
	
	
	this.borders[2].style.top=(bottom+this.document.documentElement.scrollTop+this.document.body.scrollTop-this.borderWidth/2)+"px";
	this.borders[2].style.width=(right-left)+"px";
	this.borders[2].style.height="0px";
	this.borders[2].style.left=(left)+"px";
	
	
	
	this.borders[3].style.top=this.borders[0].style.top;
	this.borders[3].style.width="0px";
	this.borders[3].style.height=(bottom-top-this.borderWidth)+"px";
	this.borders[3].style.left=(left-this.borderWidth/2)+"px";
	
	
	for(var i=0; i<this.borders.length; i++)
	{
		this.document.body.appendChild(this.borders[i]);
	}
}
function Border_show(show)
{
}
function Border_remove()
{
	for(var i=0; i<this.borders.length; i++)
	{
		if(!this.borders[i].parentNode)
		{
			continue;
		}
		this.borders[i].parentNode.removeChild(this.borders[i]);
	}
}
function Border_isSolid(solid)
{
	for(var i=0; i<this.borders.length; i++)
	{
		this.borders[i].addClassName("solid");
	}
}