<?php

/* 
 Test for an element observed by 2 different MutationObservers;
 1 set on document body.
 The second on the element itself.
 */
?>
<html>
	<head>
		<script>
			
			function bodyOnLoad()
			{
				var mo1=new MutationObserver(logDOMMutation);
				var moConfig={attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true};
				mo1.observe(document.body, moConfig);
				
				var div=document.createElement("div");
				mo1.observe(div, moConfig);
				
				var span=document.createElement("span");
				div.appendChild(span);
				document.body.appendChild(div);
				div.innerHTML+="<p>Oaresce</p>";
				
				
			}
			function logDOMMutation(mutations)
			{
				
				for(var i=0; i<mutations.length; i++)
				{
					console.log(mutations[i].target.nodeType==3?"Text":mutations[i].target.tagName+(mutations[i].target.id?" #"+mutations[i].target.id:""));
				}
			}
		</script>
	</head>
	<body onload="bodyOnLoad()">
		
	</body>
</html>

