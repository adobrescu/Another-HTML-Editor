<html>
	<head>
		<script>
			function EditableContent()
			{
			}
			with(EditableContent)
			{
			}
			function Editor()
			{
			}
			with(Editor)
			{
			}
			////////
			function getWindow()
			{
				return document.getElementById("editor1").contentWindow;
			}
			function getDocument()
			{
				return getWindow().document;
			}
			function getRange()
			{
				var r;
				
				
				try
				{
					r=getWindow().getSelection().getRangeAt(0);
				}
				catch(err)
				{
					r=getDocument().createRange();
				}
				
				return r;
			}
			function test1()
			{
				alert(MutationObserver);
				var r=getRange();
				
				
				r.setStart(getDocument().getElementById("div1"), 0);
				r.setEnd(getDocument().getElementById("par1"), 0)
				
				
				var s=getDocument().createElement("span");
				s.innerHTML="SPAN";
				getDocument().getElementById("div1").insertBefore(s, getDocument().getElementById("par1"));
				
				getWindow().getSelection().addRange(r)
				getWindow().focus();
			}
		</script>
	</head>
	<body>
		<iframe id="editor1" src="template1.html" style="width: 600px; height: 400px;"></iframe>
		<br>
		<a href="#" onclick="test1(); return false;">Make selection and insert a node</a>
	</body>
</html>