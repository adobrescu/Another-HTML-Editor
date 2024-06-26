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
	
	//print_r($_SESSION['test']['mutationHistoryRanges']);
?>
<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<script src="../lib/MutationHistory.class.js"></script>
		<script src="../lib/Node.class.js"></script>
		<script src="../lib/EditableContent.class.js"></script>
		<script src="../lib/console.js"></script>
		<style>
			#ifrm,
			#htmlView
			{
				border: 1px #999999 solid;
				padding: 0;
				width: 600px;
				height: 1100px;
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
			#quickToolbar
			{
				position: fixed;
				top: 10px;
				right: 10px;
				width: 200px;
				border: 1px #777777 solid;
				padding: 12px;
				background-color: #ffffff;
			}
			.clearfix:before,
			.clearfix:after {
				content: "";
				display: table;
			}
			.clearfix:after {
				clear: both;
			}
		</style>
		<script>
			var ed, originalInnerHTML, mh;
			function bodyOnLoad()
			{
				ed=new EditableContent(document.getElementById("ifrm"), 
					<?=$_SESSION['test']['innerHTML']?$_SESSION['test']['innerHTML']:'""'?>,
					<?=$_SESSION['test']['serializedHistory']?$_SESSION['test']['serializedHistory']:'""'?>);
				//mh=new MutationHistory(ed.window.document.body, true);
				
				//mh.observe(ed.window.document.body);
				
				showHTML();
				
				
				
				setTimeout("originalInnerHTML=el('EditableContentCanvas').innerHTML; testsBatch.run()", 300);
				
			}
			
			function visitSelectedNode(node, offset, close, endVisit, callbackMethodArguments)
			{
				//var close;
				
				//close=((node.isText() && offset==node.textContent.length) || (node.isElement() && offset==node.childNodes.length)
				
				console.logNode(node,"("+offset+")", close, "");
			}
			function visitSelection()
			{
				
				return ed.visitSelectedNodes("visitSelectedNode", 
						null,
						startNode, startOffset, endNode, endOffset, true, 
						true);
				var ca=ed.getInsertionBoundaryNodes(startNode, startOffset, endNode, endOffset, null, "A", true);
				return;
				console.clear();
				var sel=ed.window.getSelection();
				var range;
				
				try
				{
					range=sel.getRangeAt(0);
				}
				catch(err)
				{
					range=ed.window.document.createRange();
				}
				
				var startNode, startOffset;
				var endNode, endOffset;
				
				if(range.collapsed)
				{
					startNode=ed.window.document.getElementById("par1");
					startOffset=4;
					endNode=ed.window.document.getElementById("em1");
					endOffset=0;
				}
				/*ed.visitSelectedNodes("visitSelectedNode", null, 
					ed.window.document.getElementById("par1").firstChild, 3, 
					ed.window.document.getElementById("sp3").firstChild, 4 );
				ed.visitSelectedNodes("visitSelectedNode", null, 
					ed.window.document.getElementById("par1"), 4, 
					ed.window.document.getElementById("b1").firstChild, 0 );
				*/
				var ca=ed.getInsertionBoundaryNodes(startNode, startOffset, endNode, endOffset, null, "del");
				
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
					//ed.mutationHistory.startMutationsBatch();
					ed.surroundContentFragment(tagName?tagName:document.getElementById("tagName").value, 
									tagAttributes,
									true);
					//ed.mutationHistory.endMutationsBatch();
					//ed.mutationHistory.selectMutationsBatchRange(mutationsBatchIndex, after)
				}
				//catch(err)
				{
				//	console.log("Error here: "+err.message);
				}
				showHTML();
			}
			function split(startNodeId, startOffset, endNodeId, endOffset)
			{
				ed.surroundContentFragment("strong", ed.window.document.getElementById(startNodeId).firstChild, startOffset, ed.window.document.getElementById(endNodeId).firstChild, endOffset);
				showHTML();
			}
			function updateHTML()
			{
				
				ed.documentContainer.innerHTML=document.getElementById('htmlView').value;
				
			}
			function showHTML()
			{
				document.getElementById('htmlView').value=ed.documentContainer.innerHTML;
			}
			function selectElement(elementId, selectNode)
			{
				elementId=document.getElementById("elementId").value;
				var element=ed.window.document.getElementById(elementId);
				
				var sel=ed.window.getSelection();
				var range;
				
				try
				{
					range=sel.getRangeAt(0);
				}
				catch(err)
				{
					range=ed.window.document.createRange();
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
			function TestsBatch()
			{
			}
			with(TestsBatch)
			{
				prototype.tests=null;
				prototype.numAssertions=0;
				prototype.numFailedAssertions=0;
				prototype.failedAssertions=[];
				prototype.currentTest=null;
				prototype.break=false;
				
				prototype.run=TestsBatch_run;
				prototype.stop=TestsBatch_stop;
				/* Assertion methods*/
				prototype.ASSERT=TestsBatch_ASSERT;
				prototype.ASSERT_TRUE=TestsBatch_ASSERT_TRUE;
				prototype.ASSERT_FALSE=TestsBatch_ASSERT_FALSE;
				prototype.ASSERT_EQUALS=TestsBatch_ASSERT_EQUALS;
			}
			var testsBatch=new TestsBatch();
			
			function TestsBatch_run()
			{
				for(var methodName in this.tests)
				{
					if(typeof(this.tests[methodName])!="function")
					{
						continue;
					}
					this.currentTest=this.tests[methodName];
					this.currentTest();
					if(this.break)
					{
						break;
					}
				}
				
				console.log("Tests: "+this.tests.length);
				console.log("Assertions "+this.numAssertions);
				console.log("Failed assertions "+this.numFailedAssertions);
				for(var i=0; i<=this.numAssertions; i++)
				{
					if(!this.failedAssertions[i])
					{
						continue;
					}
					
					console.log("Expected: "+this.failedAssertions[i].expected+"; Received:"+this.failedAssertions[i].received);
				}
			}
			function TestsBatch_stop()
			{
				this.break=true;
			}
			function TestsBatch_ASSERT(cond, expectedValue, receivedValue)
			{
				this.numAssertions++;
				if(!cond)
				{
					this.numFailedAssertions++;
					this.failedAssertions[this.numAssertions]={"expected": expectedValue, "received" : receivedValue };
				}
			}
			function TestsBatch_ASSERT_TRUE(receivedValue)
			{
				return this.ASSERT(receivedValue==true, true, receivedValue);
			}
			function TestsBatch_ASSERT_FALSE(receivedValue)
			{
				return this.ASSERT(receivedValue==false, false, receivedValue);
			}
			function TestsBatch_ASSERT_EQUALS(val1, val2)
			{
				this.ASSERT(val1==val2, val1, val2);
			}
			testsBatch.restoreInnerHTML=function()
			{
				ed.window.document.body.innerHTML=originalInnerHTML;
			}
			testsBatch.tests=
			[
				function()
				{
					//this.stop();
					//test node splitting
					var si;//split info
					var p, d;//parent, descendant
					
					p=el("par5");
					d=p.lastChild;
					
					si=p.splitAtDescendant(d, d.textContent.length, false, true);
					
					this.ASSERT_EQUALS(0, si[SPLIT_NODE_INDEX]);
					this.ASSERT_EQUALS(p, si[si[SPLIT_NODE_INDEX]]);
				}
				,
				function()
				{
					
					
					restoreInnerHTML();
					
					ed.surroundContentFragment("P",  null, true, el("span3").firstChild, 1, el("par5").lastChild, 7);
					
					
				},
				function()
				{
					
					//Tests with phrasing node (B, SSTRONG etc) where start text node == end text node
					var node=el("EditableContentCanvas").firstChild;
					var newNodes;
					
					newNodes=ed.surroundContentFragment("B", {"id": "b1"},	true, node, 4, node, 7);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("b1"));
					this.ASSERT_EQUALS("B", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("b1").firstChild);
					this.ASSERT_EQUALS(3, el("b1").firstChild.textContent.length);
					this.ASSERT_EQUALS("um ", el("b1").firstChild.textContent);
					
					node=el("h11").firstChild;
					newNodes=ed.surroundContentFragment("EM", {"id": "em1"},	true, node, 4, node, 7);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("em1"));
					this.ASSERT_EQUALS("EM", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("em1").firstChild);
					this.ASSERT_EQUALS(3, el("em1").firstChild.textContent.length);
					this.ASSERT_EQUALS("m I", el("em1").firstChild.textContent);
					
					node=el("span3").firstChild;
					newNodes=ed.surroundContentFragment("STRONG", {"id": "strong1"},	true, node, 4, node, 7);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("strong1"));
					this.ASSERT_EQUALS("STRONG", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("strong1").firstChild);
					this.ASSERT_EQUALS(3, el("strong1").firstChild.textContent.length);
					this.ASSERT_EQUALS(" at", el("strong1").firstChild.textContent);
					
					
					var len;
					
					node=el("EditableContentCanvas").firstChild;
					
					len=node.textContent.length;
					
					newNodes=ed.surroundContentFragment("B", {"id": "b1"},	true, node, 0, node, len);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("b1"));
					this.ASSERT_EQUALS("B", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("b1").firstChild);
					this.ASSERT_EQUALS(len, el("b1").firstChild.textContent.length);
					
					node=el("h11").firstChild;
					len=node.textContent.length;
					newNodes=ed.surroundContentFragment("EM", {"id": "em1"},	true, node, 0, node, len);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(newNodes[0], el("em1"));
					this.ASSERT_EQUALS("EM", newNodes[0].tagName);
					this.ASSERT_EQUALS(node, el("em1").firstChild);
					this.ASSERT_EQUALS(len, el("em1").firstChild.textContent.length);
					
					node=el("span3").firstChild;
					len=node.textContent.length;
					newNodes=ed.surroundContentFragment("STRONG", {"id": "strong1"},	true, node, 0, node, len);
					
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
					
					newNodes=ed.surroundContentFragment("B", {"id": "strong1"},	true, startNode, 1, endNode, 5);
					
					this.ASSERT_EQUALS(2, newNodes.length);
					this.ASSERT_EQUALS(el("par1").lastChild, newNodes[0]);
					this.ASSERT_EQUALS(el("par2").firstChild, newNodes[1]);
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=el("span3");
					endNode=el("span4").nextSibling;
					
					newNodes=ed.surroundContentFragment("B", {"id": "strong1"},	true, startNode, 0, endNode, 5);
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
					
					newNodes=ed.surroundContentFragment("P", {"id": "par3"},	true, startNode, 0, endNode, startNode.textContent.length);
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS("P", newNodes[0].tagName);
					this.ASSERT_EQUALS("par3", newNodes[0].id);
					this.ASSERT_EQUALS(startNode, newNodes[0].firstChild);
					this.ASSERT_EQUALS(startNodeNextSibling, newNodes[0].nextSibling);
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=el("span3").firstChild;
					endNode=el("span4").nextSibling;
					
					newNodes=ed.surroundContentFragment("P", {"id": "par3"},	true, startNode, 1, endNode, 10);
					
					//par1 got empty so it was removed
					
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS("par3", newNodes[0].id);
					this.ASSERT_EQUALS(el("h11").nextSibling, newNodes[0].previousSibling);
					this.ASSERT_EQUALS("P", newNodes[0].nextSibling.tagName);
					
					//////////////////////////////////////////////////////////////////////
					endNode=startNode=el("par3").nextSibling.firstChild;
					newNodes=ed.surroundContentFragment("P", {"id": "par4"},	true, startNode, 10, endNode, 20);
					
					
					
					this.ASSERT_EQUALS(1, newNodes.length);
					//alert(startNode.textContent);
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=el("span3").firstChild;
					endNode=el("par2");
					
					newNodes=ed.surroundContentFragment("P", {"id": "par4"},	true, startNode, 0, endNode, endNode.childNodes.length-1);
					this.ASSERT_FALSE(newNodes[0].nextSibling.tagName=="P")
					
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=endNode=el("h21").childNodes[1].firstChild.firstChild.firstChild;
					//alert(endNode.textContent);
					newNodes=ed.surroundContentFragment("H2", {"id": "h21"},	true, startNode, 0, endNode, endNode.textContent.length);
					
					this.ASSERT_FALSE(newNodes[0].previousSibling.tagName=="H2");
					
					//////////////////////////////////////////////////////////////////////
					restoreInnerHTML();
					
					startNode=endNode=el("h21").childNodes[1].firstChild.firstChild.firstChild;
					
					newNodes=ed.surroundContentFragment("H2", {"id": "h211"},	true, startNode, 0, endNode, endNode.textContent.length);
					
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
					newNodes=ed.surroundContentFragment("P", {"id": "par3"},	true, startNode, 0, endNode, endOffset);
					
					this.ASSERT_EQUALS(1, newNodes.length);
					this.ASSERT_EQUALS(el("br4"), newNodes[0].nextSibling.nextSibling);
					//newNodes=ed.surroundContentFragment("A", null,	true, startNode, 2, endNode, 10);
				},
				function()
				{
					restoreInnerHTML();
					var a=ed.window.document.createElement("A");
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
					
					var newNodes=ed.surroundContentFragment("A", {"id": "a101"},	true, el("span3").firstChild, 1, el("span1").nextSibling, 17);
					
					this.ASSERT_EQUALS(newNodes[0].firstChild, el("par1"));
					
					var testStr=el("span5").firstChild.textContent.substr(4);
					
					newNodes=ed.surroundContentFragment("A", {"id": "a102"},	true, el("par2").firstChild, 7, el("span5").firstChild, 4);
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
					var n=ed.surroundContentFragment("A", {"id": "a103"},	true, el("li1").firstChild, 1, el("par7").firstChild, 0, true);
					this.ASSERT_EQUALS("LI", n[0].parentNode.tagName);
					this.ASSERT_EQUALS(el("li1").firstChild, n[0]);
					
					n=ed.surroundContentFragment("A", {"id": "a103"},	true, el("span14").firstChild, 3, el("par7").firstChild, 9, true);
					this.ASSERT_EQUALS(2, n.length);
					
					this.ASSERT_FALSE(el("li1").firstChild.isElement() && el("li1").firstChild.tagName=="A");
					this.ASSERT_FALSE(el("li2").firstChild.isElement() && el("li2").firstChild.tagName=="A");
					this.ASSERT_FALSE(el("li3").firstChild.isElement() && el("li3").firstChild.tagName=="A");
					
				}
				,
				function()
				{
					restoreInnerHTML();
					var n=ed.surroundContentFragment("A", {"id": "a110"}, true, el("em2").firstChild, 4, el("par7").firstChild, 10);
					
					
					this.ASSERT_EQUALS(2, n.length);
					this.ASSERT_EQUALS("EM", n[0].firstChild.tagName);
					this.ASSERT_EQUALS(el("ul1").parentNode, n[0]);
					this.ASSERT_EQUALS(el("ul1"), n[0].lastChild);
					
					this.ASSERT_EQUALS(el("par7"), n[1].parentNode);
					this.ASSERT_EQUALS(el("par7").firstChild, n[1]);
					
					
					var n2=ed.surroundContentFragment("DEL", {"id": "del100"}, true);
					this.ASSERT_EQUALS(n[0], n2[0].firstChild);
					this.ASSERT_EQUALS(n[0], n2[0].lastChild);
					
					this.ASSERT_EQUALS(n[1], n2[1].firstChild);
					this.ASSERT_EQUALS(n[1], n2[1].lastChild);
					
					this.ASSERT_EQUALS(el("par7"), n2[1].parentNode);
					this.ASSERT_EQUALS(el("par7").firstChild, n2[1]);
					
					
					
				}
			];
			function el(elId)
			{
				return ed.window.document.getElementById(elId);
			}
			function test2()
			{
				ed.onBeforeUnload();
			}
			
			function test()
			{
				restoreInnerHTML();
					
				var a =ed.window.document.createElement("A");
				el("par1").insertBefore(a, el("par1").firstChild);
				
				a.appendChild(el("par1").removeChild(el("par1").childNodes[1]));
				
				showHTML();
				//ed.mutationHistory.stringsDiff("1abcedfgh2", "3abf12gh4");
				//ed.mutationHistory.stringsDiff("abcedfgh", "abf12gh");
				//ed.mutationHistory.stringsDiff(" Aculum edice. ", " edice. ");
				return;
				//console.logNode(el("h21"));
				var b=el("a1").isAllowedInNode(el("div1"));
				console.log(b);
				//ed.surroundContentFragment("H3", {"id": "h31"},	true, el("h21"), 0, el("h21"), el("h21").childNodes.length);
				
				//showHTML();
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
				ed.visitSelectedNodes([this, "highlightAdjacentTextNodes"], 
							ca
							);
			}
			function range()
			{
				var sel=ed.window.getSelection();
				var r=sel.getRangeAt(0);
				var startContainer, endContainer;
				
				endContainer=r.endContainer.isElement() ? r.endContainer.childNodes[r.endOffset] : r.endContainer;
				
				alert(
					("Start range: "+(r.startContainer.nodeType==1?"<"+r.startContainer.tagName+(r.startContainer.id?"#"+r.startContainer.id:"")+"> ":"Text: "+r.startContainer.textContent)+", offset="+r.startOffset)
					+
					"\n"
					+
					("End range: "+(endContainer.nodeType==1?"<"+endContainer.tagName+(endContainer.id?"#"+endContainer.id:"")+"> ":"Text: "+endContainer.textContent)+", offset="+r.endOffset));
				//r.endContainer.textContent="|"
			}
			function logMutations()
			{
				var idx=mh.mutations.length-1;
				
				for(var i=0; i<mh.mutations[idx].length; i++)
				{
					mh.logMutation(mh.mutations[idx][i])
				}
			}
		</script>
	</head>

	<body onload="setTimeout('bodyOnLoad()', 300)">
		<pre>
<?php
			//print_r(htmlentities($_SESSION['test']['innerHTML']));
			//echo 'End';
			//print_r($_SESSION['test']['serializedHistory']);
			//print_r($_SESSION['test']);
			
			//echo 'Received: '.$_SESSION['message'].', '.$_SESSION['var'];
?>
		</pre>
		<div class="clearfix" style="float: left;">
			<iframe src="enum-selected-nodes.tpl.html" id="ifrm"></iframe>
			<br>
			
		</div>
		<div id="quickToolbar">
			<a href="#" onclick="ed.undo(); showHTML(); return false;">Undo</a>
			<br>
			<a href="#" onclick="ed.redo(); showHTML(); return false;">Redo</a>
			<br>
			<a href="#" onclick="showHTML(); return false;">View HTML</a>
			<br>
			<a href="#" onclick="restoreInnerHTML(); return false;">Restore HTML</a>
			<br>
			<a href="#" onclick="visitSelection() ; return false;">Visit selection</a>
			<br>
			<a href="#" onclick="ed.deleteContentFragment(); showHTML(); return false;">Delete selection</a>
			<br>
			<a href="#" onclick="surround(document.getElementById('selectTagName').value, document.getElementById('selectTagAttributes').value) ; return false;">Surround with </a>
			<select id="selectTagName">
				<optgroup label="Sectioning">
					<option value="ADDRESS">ADDRESS</option>
					<option value="ARTICLE">ARTICLE</option>
					<option value="ASIDE">ASIDE</option>
					<option value="FOOTER">FOOTER</option>
					<option value="H1">H1</option>
					<option value="H2">H2</option>
					<option value="H3">H3</option>
					<option value="H4">H4</option>
					<option value="H5">H5</option>
					<option value="H6">H6</option>
					<option value="HEADER">HEADER</option>
					<option value="NAV">NAV</option>
					<option value="SECTION">SECTION</option>
				</optgroup>
				<optgroup label="Grouping">
					<option value="BLOCKQUOTE">BLOCKQUOTE</option>
					<option value="P" selected>P</option>
					<option value="HR">HR</option>
					<option value="BR">BR</option>
					<option value="PRE">PRE</option>
					<option value="DIALOG">DIALOG</option>
					<option value="OL">OL</option>
					<option value="UL">UL</option>
					<option value="LI">LI</option>
					<option value="DL">DL</option>
					<option value="DT">DT</option>
					<option value="DD">DD</option>
				</optgroup>
				<optgroup label="Text-Level Semantics">
					<option value="A">A</option>
					<option value="ABBR">ABBR</option>
					<option value="B" >B</option>
					<option value="BDO">BDO</option>
					<option value="CITE">CITE</option>
					<option value="CODE">CODE</option>
					<option value="DFN">DFN</option>
					<option value="EM">EM</option>
					<option value="I">I</option>
					<option value="KBD">KBD</option>
					<option value="MARK">MARK</option>
					<option value="METER">METER</option>
					<option value="PROGRESS">PROGRESS</option>
					<option value="RP">RP</option>
					<option value="RT">RT</option>
					<option value="RUBY">RUBY</option>
					<option value="Q">Q</option>
					<option value="SAMP">SAMP</option>
					<option value="SMALL">SMALL</option>
					<option value="SPAN">SPAN</option>
					<option value="STRONG">STRONG</option>
					<option value="SUB">SUB</option>
					<option value="SUP">SUP</option>
					<option value="TIME">TIME</option>
					<option value="VAR">VAR</option>
				</optgroup>
				<optgroup label="Edits">
					<option value="DEL">DEL</option>
					<option value="INS">INS</option>
				</optgroup>
				<optgroup label="None">
					<option value="DIV">DIV</option>
				</optgroup>
			</select>
			, attributes <input type="text" id="selectTagAttributes" size="26" value="id=axxa">
		</div>
		<div id="toolbar">
			
			<a href="#" onclick="surround() ; return false;">Surround with </a><input type="text" id="tagName" size="10">, attributes <input type="text" id="tagAttributes" size="16">
			<br>
			<a href="#" onclick="ed.mutationHistory.undoAll(); showHTML(); return false;">Undo all</a>
			<br>
			<a href="#" onclick="ed.mutationHistory.redoAll(); showHTML(); return false;">Redo all</a>
			<br>
			
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
			<a href="#" onclick="ed.window.document.execCommand(document.getElementById('command').value); return false;">execCommand</a>
			<input type="text" id="command" size="16" value="">
			<br>
			<br>
			<a href="#" onclick="logMutations(); return false;">Log last mutation</a>
			<br>
			<a href="#" onclick="test(); return false;">Test</a>
			<br>
			<a href="#" onclick="ed.onBeforeUnload(); showHTML(); return false;">Serialize mutations history</a>
			<br>
			<a href="#" onclick="window.location='<?=$_SERVER['PHP_SELF']?>?r=1'; return false;">Reload</a>
			<br>
			<a href="#" onclick="alert(ed.mutationHistory.mutations.length); return false;">Len</a>
			<br>
			<a href="#" onclick="updateHTML(); return false;">Update HTML</a>
			<br>
			<textarea style="border: 1px #c9c9c9  solid;" id="htmlView"></textarea>
		</div>
		
	</body>
</html> 