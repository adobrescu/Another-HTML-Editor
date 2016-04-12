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
		function showHTML()
			{
				document.getElementById('htmlView').value=ed.currentEditableContent.documentContainer.innerHTML;
			}
		function surround(tagName, tagAttributes)
			{
				
				console.clear();
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
				
				ed.currentEditableContent.surroundSelectedContentFragments(tagName, 
									tagAttributes,
									true);
				
				showHTML();
				ed.currentEditableContent.documentContainer.focus();
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
		<div>
			<a href="#" onclick="updateHTML(); return false;">Update HTML</a>
			<br>
			<textarea style="border: 1px #c9c9c9  solid;" id="htmlView"></textarea>
		</div>
		<div id="toolbox">
			<?php
				include('quick-toolbar.html.php');
			?>
		</div>
	</body>
</html> 