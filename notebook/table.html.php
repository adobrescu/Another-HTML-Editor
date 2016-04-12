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
			function surround(tagName, tagAttributes)
			{
				
				console.clear();
				var strTagAttributes;
				
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
				
				ed.currentEditableContent.surroundSelectedContentFragments(tagName?tagName:document.getElementById("tagName").value, 
									tagAttributes,
									true);
				
				showHTML();
			}
			function showHTML()
			{
				document.getElementById('htmlView').value=ed.currentEditableContent.documentContainer.innerHTML;
			}
			function updateHTML()
			{
				ed.currentEditableContent.documentContainer.innerHTML=document.getElementById('htmlView').value;	
			}
			function getCurrentTable()
			{
				var table;
				
				if(!ed.currentEditableContent.window.contentSelection.locked)
				{
					return;
				}
				//assume it's a table cells selection
				var ranges=ed.currentEditableContent.window.contentSelection.getRanges();
				table=ranges.ranges[0].startContainer.parentNode.parentNode.parentNode;
				
				
				return table;
				
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
			];
			function el(elId)
			{
				return ed.currentEditableContent.window.document.getElementById(elId);
			}
			function test2()
			{
				var t=el("test");
				
				
				t.normalizeSpans();
				//ed.currentEditableContent.preWrap();
				/*var brs=ed.currentEditableContent.window.document.querySelectorAll("br[type]");
				
				for(var i=0; i<brs.length; i++)
				{
					brs[i].parentNode.removeChild(brs[i]);
				}
				*/
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
			<iframe src="table.tpl.html" id="ifrm"></iframe>
			<br>
			<div contenteditable="true" style="border: 1px red solid; height: 200px; width: 500px; float: left"></div>
		</div>
<?php
	include('quick-toolbar.html.php');
?>
		<div id="toolbar">
			<a href="#" onclick="getCurrentTable().mergeSelectedCells() ; return false;">Merge Table Cells</a>
			<br>
			<a href="#" onclick="updateHTML(); return false;">Update HTML</a>
			<br>
			<textarea style="border: 1px #c9c9c9  solid;" id="htmlView"></textarea>
		</div>
		
	</body>
</html> 