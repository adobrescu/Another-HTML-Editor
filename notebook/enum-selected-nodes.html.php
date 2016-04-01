<?php
	session_start();
	if(isset($_GET['r']))
	{
		session_destroy();
		header('Location: '.$_SERVER['PHP_SELF']);
		exit();
	}
			
	if($_POST)
	{
		//$_SESSION['test']=$_POST;
		
		//exit();
	}
	//print_r($_SESSION['test']);
	//print_r($_SESSION['test']['mutationHistoryRanges']);
?>
<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<script src="../lib/MutationHistory.class.js"></script>
		<script src="../lib/Node.class.js"></script>
		<script src="../lib/Editor.class.js"></script>
		<script src="../lib/EditableContent.class.js"></script>
		<script src="../lib/PhrasingContent.class.js"></script>
		<script src="../lib/console.js"></script>
		<script src="../lib/Tests.class.js"></script>
		<script src="../lib/NodeDiff.class.js"></script>
		<script src="../lib/Border.class.js"></script>
		<script src="../lib/Table.class.js"></script>
		<link rel="stylesheet" type="text/css" href="default.css">
		<style>
			#ifrm,
			#htmlView
			{
				border: 1px #999999 solid;
				padding: 0;
				width: 500px;
				height: 600px;
				float: left;
			}
			#htmlView
			{
				height: 500px;
			}
			#toolbar
			{
				float: left;
				margin-left: 20px;
			}
			
		</style>
		<script>
			var ed, originalInnerHTML, mh;
			function bodyOnLoad()
			{
				ed=new Editor();
				ed.addEditableContent(document.getElementById("ifrm"), true, <?=$_SESSION['test']['innerHTML']?$_SESSION['test']['innerHTML']:'""'?>,
					<?=$_SESSION['test']['serializedHistory']?$_SESSION['test']['serializedHistory']:'""'?>);
				//ed=new EditableContent(document.getElementById("ifrm"), 
				//	<?=$_SESSION['test']['innerHTML']?$_SESSION['test']['innerHTML']:'""'?>,
				//	<?=$_SESSION['test']['serializedHistory']?$_SESSION['test']['serializedHistory']:'""'?>);
				//mh=new MutationHistory(ed.currentEditableContent.window.document.body, true);
				
				//mh.observe(ed.currentEditableContent.window.document.body);
				
				showHTML();
				
				
				setTimeout("originalInnerHTML=el('EditableContentCanvas').innerHTML; //testsBatch.run()", 300);
				
			}
			
			function visitSelectedNode(node, offset, close, endVisit, callbackMethodArguments)
			{
				//var close;
				
				//close=((node.isText() && offset==node.textContent.length) || (node.isElement() && offset==node.childNodes.length)
				
				console.logNode(node,"("+offset+")", close, "");
			}
			function visitSelection()
			{
				return ed.currentEditableContent.visitContentFragmentNodes("visitSelectedNode", 
						null,
						startNode, startOffset, endNode, endOffset, true, 
						true);
				var ca=ed.currentEditableContent.getInsertionBoundaryNodes(startNode, startOffset, endNode, endOffset, null, "A", true);
				
				
			}
			function surround(tagName, tagAttributes)
			{
				
				console.clear();
				var strTagAttributes
				if(!tagAttributes)
				{
					
					strTagAttributes=document.getElementById("tagAttributes").value;
				}
				else
				{
					strTagAttributes=tagAttributes;
				}
				
				tagAttributes={};
				var arrTagAttributes=strTagAttributes.split(",");
				
				for(var i=0; i<arrTagAttributes.length; i++)
				{
					var attr=arrTagAttributes[i].split("=");
					tagAttributes[attr[0]]=attr[1];
				}
				
				//try
				{
					//ed.currentEditableContent.mutationHistory.startMutationsBatch();
					
					ed.currentEditableContent.surroundSelectedContentFragments(tagName?tagName:document.getElementById("tagName").value, 
									tagAttributes,
									true);
					/*ed.currentEditableContent.surroundContentFragment(tagName?tagName:document.getElementById("tagName").value, 
									tagAttributes,
									true);*/
					//ed.currentEditableContent.mutationHistory.endMutationsBatch();
					//ed.currentEditableContent.mutationHistory.selectMutationsBatchRange(mutationsBatchIndex, after)
				}
				//catch(err)
				{
				//	console.log("Error here: "+err.message);
				}
				showHTML();
			}
			function split(startNodeId, startOffset, endNodeId, endOffset)
			{
				ed.currentEditableContent.surroundContentFragment("strong", ed.currentEditableContent.window.document.getElementById(startNodeId).firstChild, startOffset, ed.currentEditableContent.window.document.getElementById(endNodeId).firstChild, endOffset);
				showHTML();
			}
			function updateHTML()
			{
				
				ed.currentEditableContent.documentContainer.innerHTML=document.getElementById('htmlView').value;
				
			}
			function showHTML()
			{
				document.getElementById('htmlView').value=ed.currentEditableContent.documentContainer.innerHTML;
			}
			function selectElement(elementId, selectNode)
			{
				elementId=document.getElementById("elementId").value;
				var element=ed.currentEditableContent.window.document.getElementById(elementId);
				
				var sel=ed.currentEditableContent.window.getSelection();
				var range;
				
				try
				{
					range=sel.getRangeAt(0);
				}
				catch(err)
				{
					range=ed.currentEditableContent.window.document.createRange();
				}
				if(selectNode)
				{
					range.selectNode(element);
				}
				else
				{
					range.setStart(element, 0);
					range.setEnd(element, element.childNodes.length);
				}
				sel.addRange(range);
			}
			function restoreInnerHTML()
			{
				el("EditableContentCanvas").innerHTML=originalInnerHTML;
				showHTML();
			}
		</script>
		<script>
			var testsBatch=new TestsBatch();
			
			testsBatch.restoreInnerHTML=function()
			{
				ed.currentEditableContent.window.document.body.innerHTML=originalInnerHTML;
			}
			testsBatch.tests=
			[
				function()
				{
					
					
					ed.currentEditableContent.clearSelection();
					ed.currentEditableContent.addSelection(el("par8").firstChild, 10, el("par8").firstChild, 12);
					ed.currentEditableContent.addSelection(el("b2").nextSibling, 6, el("b2").nextSibling, 9);
					ed.currentEditableContent.addSelection(el("span16").nextSibling, 11, el("span16").nextSibling, 17);
					ed.currentEditableContent.addSelection(el("strong1").firstChild, 2, el("strong1").firstChild, 4);
					
				
					
					//this.stop(); return;
				}
				,
				function()
				{
					//return;
					ed.currentEditableContent.clearSelection();
					ed.currentEditableContent.addSelection(el("span4").lastChild, 3, el("span4").lastChild, 10);
					ed.currentEditableContent.addSelection(el("span4").lastChild, 16, el("span4").lastChild, 20);
					ed.currentEditableContent.addSelection(el("span4").lastChild, 24, el("span4").lastChild, 30);
					ed.currentEditableContent.surroundSelectedContentFragments("B");
					//ed.currentEditableContent.documentContainer.focus();
					
					
				}
				,
				function()
				{
					
					
					restoreInnerHTML();
					
					ed.currentEditableContent.surroundContentFragment("P",  null, el("span3").firstChild, 1, el("par5").lastChild, 7);
					
					
				},
				function()
				{
					
					//Tests with phrasing node (B, SSTRONG etc) where start text node == end text node
					var node=el("EditableContentCanvas").firstChild;
					var newNodes;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("B", {"id": "b1"}, node, 4, node, 7);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					
					this.ASSERT_EQUALS(newNodes[0], el("b1"));
					
					this.ASSERT_EQUALS("B", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("b1").firstChild);
					this.ASSERT_EQUALS(3, el("b1").firstChild.textContent.length);
					this.ASSERT_EQUALS("um ", el("b1").firstChild.textContent);
					
					node=el("h11").firstChild;
					newNodes=ed.currentEditableContent.surroundContentFragment("EM", {"id": "em1"},	node, 4, node, 7);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("em1"));
					this.ASSERT_EQUALS("EM", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("em1").firstChild);
					this.ASSERT_EQUALS(3, el("em1").firstChild.textContent.length);
					this.ASSERT_EQUALS("m I", el("em1").firstChild.textContent);
					
					node=el("span3").firstChild;
					newNodes=ed.currentEditableContent.surroundContentFragment("STRONG", {"id": "strong1"},	node, 4, node, 7);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("strong1"));
					this.ASSERT_EQUALS("STRONG", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("strong1").firstChild);
					this.ASSERT_EQUALS(3, el("strong1").firstChild.textContent.length);
					this.ASSERT_EQUALS(" at", el("strong1").firstChild.textContent);
					
					
					var len;
					
					node=el("EditableContentCanvas").firstChild;
					
					len=node.textContent.length;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("B", {"id": "b1"}, node, 0, node, len);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("b1"));
					this.ASSERT_EQUALS("B", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("b1").firstChild);
					this.ASSERT_EQUALS(len, el("b1").firstChild.textContent.length);
					
					node=el("h11").firstChild;
					len=node.textContent.length;
					newNodes=ed.currentEditableContent.surroundContentFragment("EM", {"id": "em1"}, node, 0, node, len);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("em1"));
					this.ASSERT_EQUALS("EM", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("em1").firstChild);
					this.ASSERT_EQUALS(len, el("em1").firstChild.textContent.length);
					
					node=el("span3").firstChild;
					len=node.textContent.length;
					newNodes=ed.currentEditableContent.surroundContentFragment("STRONG", {"id": "strong1"},	node, 0, node, len);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("strong1"));
					this.ASSERT_EQUALS("STRONG", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("strong1").firstChild);
					this.ASSERT_EQUALS(len, el("strong1").firstChild.textContent.length);
					
					
					showHTML();
					
				},
				function()
				{
					
					//Tests with phrasing nodes, where start node different than end node, and both are of type text
					var startNode, endNode, newNodes;
					
					restoreInnerHTML();
					
					startNode=el("span3").firstChild;
					endNode=el("span4").nextSibling;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("B", {"id": "strong1"}, startNode, 1, endNode, 5);
					
					this.ASSERT_EQUALS(2, newNodes.length);
					this.ASSERT_EQUALS(el("par1").lastChild, newNodes[0]);
					this.ASSERT_EQUALS(el("par2").firstChild, newNodes[1]);
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=el("span3");
					endNode=el("span4").nextSibling;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("B", {"id": "strong1"}, startNode, 0, endNode, 5);
					this.ASSERT_EQUALS(2, newNodes.length);
					this.ASSERT_EQUALS(el("par1").lastChild, newNodes[0]);
					this.ASSERT_EQUALS(el("par2").firstChild, newNodes[1]);
					
					showHTML();
					
				}
				,
				function()
				{
					
					//Flow content formatting (<H1>, <P>, etc
					
					restoreInnerHTML();
					
					var startNode, endNode, newNodes;
					var startNodeNextSibling;
					
					endNode=startNode=el("EditableContentCanvas").firstChild;
					startNodeNextSibling=startNode.nextSibling;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("P", {"id": "par3"}, startNode, 0, endNode, startNode.textContent.length);
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS("P", newNodes[0].tagName);
					this.ASSERT_EQUALS("par3", newNodes[0].id);
					this.ASSERT_EQUALS(startNode, newNodes[0].firstChild);
					this.ASSERT_EQUALS(startNodeNextSibling, newNodes[0].nextSibling);
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=el("span3").firstChild;
					endNode=el("span4").nextSibling;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("P", {"id": "par3"}, startNode, 1, endNode, 10);
					
					//par1 got empty so it was removed
					
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS("par3", newNodes[0].id);
					//this.ASSERT_EQUALS(el("h11").nextSibling, newNodes[0].previousSibling);this.stop(); return;
					this.ASSERT_EQUALS("P", newNodes[0].nextSibling.tagName);
					
					//////////////////////////////////////////////////////////////////////
					endNode=startNode=el("par3").nextSibling.firstChild;
					newNodes=ed.currentEditableContent.surroundContentFragment("P", {"id": "par4"}, startNode, 10, endNode, 20);
					
					
					
					this.ASSERT_EQUALS(1, newNodes.length);
					//alert(startNode.textContent);
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=el("span3").firstChild;
					endNode=el("par2");
					
					newNodes=ed.currentEditableContent.surroundContentFragment("P", {"id": "par4"}, startNode, 0, endNode, endNode.childNodes.length-1);
					this.ASSERT_TRUE(newNodes[0].nextSibling.tagName=="P")
					
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=endNode=el("h21").childNodes[1].firstChild.firstChild.firstChild;
					//alert(endNode.textContent);
					newNodes=ed.currentEditableContent.surroundContentFragment("H2", {"id": "h21"}, startNode, 0, endNode, endNode.textContent.length);
					
					this.ASSERT_FALSE(newNodes[0].previousSibling.tagName=="H2");
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=endNode=el("h21").childNodes[1].firstChild.firstChild.firstChild;
					
					newNodes=ed.currentEditableContent.surroundContentFragment("H2", {"id": "h211"}, startNode, 0, endNode, endNode.textContent.length);
					
					this.ASSERT_FALSE(newNodes[0].nextSibling.tagName=="H2");
					
					showHTML();
					
				},
				function()
				{
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					var startNode, endNode, endOffset, newNodes;
					
					startNode=el("EditableContentCanvas").firstChild;
					endNode=el("EditableContentCanvas");
					endOffset=9;
					newNodes=ed.currentEditableContent.surroundContentFragment("P", {"id": "par3"}, startNode, 0, endNode, endOffset);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(el("br4"), newNodes[0].nextSibling.nextSibling);
					//newNodes=ed.currentEditableContent.surroundContentFragment("A", null,	true, startNode, 2, endNode, 10);
					
				},
				function()
				{
					restoreInnerHTML();
					var a=ed.currentEditableContent.window.document.createElement("A");
					a.href="oaresce";
					el("h11").appendChild(a);
					this.ASSERT_TRUE(a.isAllowedInNode(el("h11")));
					restoreInnerHTML();
					showHTML();
					
				},
				function()
				{
					//test expand boundaries for ranges with satrt/end text nodes that don't start at offset 0 but have only spaces at beginnig/end
					restoreInnerHTML();
					
					var newNodes=ed.currentEditableContent.surroundContentFragment("A", {"id": "a101"},	el("span3").firstChild, 1, el("span1").nextSibling, 17);
					
					this.ASSERT_EQUALS(newNodes[0].firstChild, el("par1"));
					
					var testStr=el("span5").firstChild.textContent.substr(4);
					
					newNodes=ed.currentEditableContent.surroundContentFragment("A", {"id": "a102"},	el("par2").firstChild, 7, el("span5").firstChild, 4);
					this.ASSERT_EQUALS(el("par2").firstChild.nextSibling, newNodes[0]);
					this.ASSERT_EQUALS(testStr, newNodes[0].nextSibling.firstChild.firstChild.textContent);
					
				},
				/* 
				 * Trebuie scrise teste pentru tipurile de content:
				 * 
				 * - phrasing content (B, STRONG, SPAN etc)
				 * - transparent content ( A, DEL, INS etc)
				 * - flow content (DIV, P) etc
				 */
				function()
				{
					restoreInnerHTML();
					var n=ed.currentEditableContent.surroundContentFragment("A", {"id": "a103"}, el("li1").firstChild, 1, el("par7").firstChild, 0, true);
					this.ASSERT_EQUALS("LI", n[0].parentNode.tagName);
					this.ASSERT_EQUALS(el("li1").firstChild, n[0]);
					
					n=ed.currentEditableContent.surroundContentFragment("A", {"id": "a103"}, el("span14").firstChild, 3, el("par7").firstChild, 9, true);
					this.ASSERT_EQUALS(2, n.length);
					
					this.ASSERT_FALSE(el("li1").firstChild.isElement() && el("li1").firstChild.tagName=="A");
					this.ASSERT_FALSE(el("li2").firstChild.isElement() && el("li2").firstChild.tagName=="A");
					this.ASSERT_FALSE(el("li3").firstChild.isElement() && el("li3").firstChild.tagName=="A");
					
				}
				,
				function()
				{
					restoreInnerHTML();
					var n=ed.currentEditableContent.surroundContentFragment("A", {"id": "a110"}, el("em2").firstChild, 4, el("par7").firstChild, 10);
					
					
					this.ASSERT_EQUALS(2, n.length);
					this.ASSERT_EQUALS("EM", n[0].firstChild.tagName);
					this.ASSERT_EQUALS(el("ul1").parentNode, n[0]);
					this.ASSERT_EQUALS(el("ul1"), n[0].lastChild);
					
					this.ASSERT_EQUALS(el("par7"), n[1].parentNode);
					this.ASSERT_EQUALS(el("par7").firstChild, n[1]);
					
					
					return;
					var n2=ed.currentEditableContent.surroundContentFragment("DEL", {"id": "del100"});
					
					this.ASSERT_EQUALS(n[0], n2[0].firstChild);
					this.ASSERT_EQUALS(n[0], n2[0].lastChild);
					
					this.ASSERT_EQUALS(n[1], n2[1].firstChild);
					this.ASSERT_EQUALS(n[1], n2[1].lastChild);
					
					this.ASSERT_EQUALS(el("par7"), n2[1].parentNode);
					this.ASSERT_EQUALS(el("par7").firstChild, n2[1]);
					
					
					
				}
				,
				function()
				{
					return;
					var d=el("div500");
					var par1=ed.currentEditableContent.getNodeParagraph(d);
					//ed.currentEditableContent.highlightParagraph(par1);
					
					var s=el("span501");
					var par2=ed.currentEditableContent.getNodeParagraph(s);
					ed.currentEditableContent.highlightParagraph(par1);
					
					this.ASSERT_EQUALS(par1.length, par2.length);
					
					for(var i=0; i<par1.length; i++)
					{
						this.ASSERT_EQUALS(par1[i].length, par2[i].length);
						
						for(var j=0; j<par1[i].length; j++)
						{
							this.ASSERT_EQUALS(par1[i][j], par2[i][j]);
						}
					}
				}			
				
				,
				function()
				{
					
					restoreInnerHTML();
					ed.currentEditableContent.init();
				}
			];
			function el(elId)
			{
				return ed.currentEditableContent.window.document.getElementById(elId);
			}
			function test2()
			{
				el("th3_5").style.backgroundColor="red";
				alert(el("th3_5").cellIndex);
				
			}
			
			function test()
			{
				alert(ed.currentEditableContent.mutationHistory.mutations.length);
			}
			function highlightAdjacentTextNodes(node, offset, close, endVisit, ca)
			{
				
				if(close)
				{
					return;
				}
				if(!node.isText() || !ca.prev.isText() || (ca.prev && ca.prev.parentNode!=node.parentNode ))
				{
					ca.prev=node;
					return;
				}
				node.textContent="|"+node.textContent;
				//ca.prev.textContent+=node.textContent;
				//node.parentNode.removeChild(node);
				
			}
			function showAdjacentTextNodes()
			{
				var ca={};
				ca.prev=null;
				ed.currentEditableContent.visitContentFragmentNodes([this, "highlightAdjacentTextNodes"], 
							ca
							);
			}
			function range()
			{
				var sel=ed.currentEditableContent.window.getSelection();
				var r=sel.getRangeAt(0);
				var startContainer, endContainer;
				
				endContainer=r.endContainer.isElement() ? r.endContainer.childNodes[r.endOffset] : r.endContainer;
				for(var i=0; i<ed.currentEditableContent.getRanges().length; i++)
				{
					r=sel.getRangeAt(i);
					alert(
						("Start range: "+(r.startContainer.nodeType==1?"<"+r.startContainer.tagName+(r.startContainer.id?"#"+r.startContainer.id:"")+"> ":"Text: "+r.startContainer.textContent)+", offset="+r.startOffset)
						+
						"\n"
						+
						("End range: "+(endContainer.nodeType==1?"<"+endContainer.tagName+(endContainer.id?"#"+endContainer.id:"")+"> ":"Text: "+endContainer.textContent)+", offset="+r.endOffset));
					//r.endContainer.textContent="|"
				}
			}
			function logMutations()
			{
				console.logMutation(ed.currentEditableContent.mutationHistory.mutations[ed.currentEditableContent.mutationHistory.mutations.length-1])
			}
			function insertTableRows()
			{
				var table, tableSection;
				
				table=ed.currentEditableContent.getTable();
				tableSection=document.getElementById("insertRowsTo").value;
								
				table.insertRows(document.getElementById("numRows").value, 
						ed.currentEditableContent.getRangeCommonAncestorByTagName('TR'),
						tableSection,
						document.getElementById("insertTableRowsBefore").value);
			}
			function mergeTableCells()
			{
				var table;
				
				table=el("table2");//ed.currentEditableContent.getTable();
				table.mergeSelectedCells();
				
			}
			function splitTableCells()
			{
				var table;
				
				table=el("table2");//ed.currentEditableContent.getTable();
				table.splitSelectedCells();
			}
			function insertTableColumns()
			{
				ed.currentEditableContent.getTable().insertColumns(document.getElementById("numCols").value, 
						ed.currentEditableContent.getRangeCommonAncestorByTagName('TD'),
						document.getElementById("insertTableColsBefore").value);
			}
			function removeTableRows()
			{
				ed.currentEditableContent.getTable().removeRows(1, 
						ed.currentEditableContent.getRangeCommonAncestorByTagName('TR'),
						true);
			}
			function setTableCaption()
			{
					ed.currentEditableContent.getTable().setCaption(document.getElementById("tableCaption").value);
			}
		</script>
	</head>

	<body onload="setTimeout('bodyOnLoad()', 300)">
		<pre>
<?php
			//echo htmlentities($_SESSION['test']['innerHTML']);
			//print_r(htmlentities($_SESSION['test']['innerHTML']));
			//echo 'End';
			//print_r($_SESSION['test']['serializedHistory']);
			//print_r($_SESSION['test']);
			
			//echo 'Received: '.$_SESSION['message'].', '.$_SESSION['var'];
?>
		</pre>
		
		<div class="clearfix" style="float: left;">
			<input>
			<iframe src="enum-selected-nodes.tpl.html" id="ifrm"></iframe>
			<br>
			<div contenteditable="true" style="border: 1px red solid; height: 200px; width: 500px; float: left"></div>
		</div>
<?php
	include('quick-toolbar.html.php');
?>
		<div id="toolbar">
			Table
			<br>
			<a href="#" onclick="ed.currentEditableContent.insertTable( 2, 5) ; return false;">Insert Table</a>
			<br>
			<a href="#" onclick="insertTableRows(); return false;">Insert </a>
			<input type="text" size="4" id="numRows" value="2">
			Table
			<select id="insertRowsTo">
				<option value="TBODY">Body</option>
				<option value="THEAD">Header</option>
				<option value="TFOOT">Footer</option>
				<option value="">Current Selection</option>
			</select>
			 Rows 
			<select id="insertTableRowsBefore">
					<option value="1">Before</option>
					<option value="">After</option>
			</select>
			<br>
			<a href="#" onclick="removeTableRows(); return false;">Remove Table Row </a>
			<br>
			<a href="#" onclick="setTableCaption(); return false;">Set Table Caption:</a> <input id="tableCaption" size="15">
			<br>
			<a href="#" onclick="insertTableColumns(); return false;">Insert </a><input type="text" size="4" id="numCols">Table Columns <select id="insertTableColsBefore"><option value="1">Before</option><option value="">After</option></select>
			<br>
			<a href="#" onclick="mergeTableCells(); return false;">Merge Table Cells:</a> <input id="tableCaption" size="15">
			<br>
			<a href="#" onclick="splitTableCells(); return false;">Split Table Cells:</a> 
			<hr>
			<a href="#" onclick="surround() ; return false;">Surround with </a><input type="text" id="tagName" size="10">, attributes <input type="text" id="tagAttributes" size="16">
			<br>
			<a href="#" onclick="ed.currentEditableContent.mutationHistory.undoAll(); showHTML(); return false;">Undo all</a>
			<br>
			<a href="#" onclick="ed.currentEditableContent.mutationHistory.redoAll(); showHTML(); return false;">Redo all</a>
			<br>
			<a href="#" onclick="logHistory(); return false;">Log history</a>
			<br>
			<a href="#" onclick="selectElement() ; return false;">Select element#</a><input type="text" id="elementId" size="10">
			<br>
			<a href="#" onclick="split('em2', 2, 'em1', 5) ; return false;">Split</a>
			
			<br>
			<a href="#" onclick="showAdjacentTextNodes(); return false;">Show adjacent text nodes</a>
			
			<br>
			<a href="#" onclick="range(); return false;">Range</a>
			<br>
			<a href="#" onclick="test2(); return false;">Test2</a>
			<br>
			<a href="#" onclick="ed.currentEditableContent.window.document.execCommand(document.getElementById('command').value); return false;">execCommand</a>
			<input type="text" id="command" size="16" value="">
			<br>
			<br>
			<a href="#" onclick="logMutations(); return false;">Log last mutation</a>
			<br>
			<a href="#" onclick="test(); return false;">Test</a>
			<br>
			<a href="#" onclick="ed.currentEditableContent.onBeforeUnload(); showHTML(); return false;">Serialize mutations history</a>
			<br>
			<a href="#" onclick="window.location='<?=$_SERVER['PHP_SELF']?>?r=1'; return false;">Reload</a>
			<br>
			<a href="#" onclick="alert(ed.currentEditableContent.mutationHistory.mutations.length); return false;">Len</a>
			<br>
			<a href="#" onclick="updateHTML(); return false;">Update HTML</a>
			<br>
			<textarea style="border: 1px #c9c9c9  solid;" id="htmlView"></textarea>
		</div>
		
	</body>
</html> 