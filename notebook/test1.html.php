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
		<script src="../lib/ContentSelection.class.js"></script>
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
			#ifrm1
			{
				width: 100%;
				border: 1px #c9c9c9 solid;
				float: left;
			}
			#ifrm2
			{
				width: 25%;
				border: 1px #c9c9c9 solid;
				float: right;
			}
			#toolbox
			{
				position: fixed;right: 10px;
				width: 25%;
				min-height: 120px;
				border: 1px #c9c9c9 solid;
				padding: 12px;
			}
			
		</style>
			
		<script>
			var ed;
		function bodyOnLoad()
		{
			ed=new Editor();
			ed.addEditableContent(document.getElementById("ifrm1"));
			ed.addEditableContent(document.getElementById("ifrm2"));
		}
		function surround(tagName, tagAttributes)
			{
				if(!ed.currentEditableContent)
				{
					return;
				}
				var strTagAttributes
				if(!tagAttributes)
				{
					
					strTagAttributes=document.getElementById("selectTagAttributes").value;
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

				ed.currentEditableContent.surroundContentFragment(tagName?tagName:document.getElementById("tagName").value, 
									tagAttributes,
									true);
				
				
			}
		</script>
	</head>

	<body onload="setTimeout('bodyOnLoad()', 300)">
		<div class="clearfix" style="float: left; width: 70%; border: 1px #c9c9c9 solid; padding: 10px;" contenteditable="true">
			<div style="float: left; width: 70%;">
				<p>Text care nu se poate modifica</p>
				<iframe src="template1.html" id="ifrm1"></iframe>
			</div>
			
			<iframe src="template2.html" id="ifrm2"></iframe>
		</div>
		<div id="toolbox">
			<a href="#" onclick="if(ed.currentEditableContent){ed.currentEditableContent.undo()}; return false;">Undo</a>
			<br>
			<a href="#" onclick="if(ed.currentEditableContent){ed.currentEditableContent.redo()}; return false;">Redo</a>
			<br>
			<a href="#" onclick="surround(document.getElementById('selectTagName').value, document.getElementById('selectTagAttributes').value) ; return false;">Surround with </a>
			<select id="selectTagName" onchange="if(!ed.currentEditableContent.getRange().collapsed){surround(document.getElementById('selectTagName').value, document.getElementById('selectTagAttributes').value) ;}">
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
					<option value="P">P</option>
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
					<option value="B" selected>B</option>
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
			, attributes <input type="text" id="selectTagAttributes" size="26" value="">
		</div>
		<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
		<div contenteditable="true" style="border: 1px red solid; height: 100px;"></div>
	</body>
</html> 