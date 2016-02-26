<div id="quickToolbar">
			<a href="#" onclick="ed.currentEditableContent.undo(); showHTML(); return false;">Undo</a>
			<br>
			<a href="#" onclick="ed.currentEditableContent.redo(); showHTML(); return false;">Redo</a>
			<br>
			<a href="#" onclick="showHTML(); return false;">View HTML</a>
			<br>
			<a href="#" onclick="restoreInnerHTML(); return false;">Restore HTML</a>
			<br>
			<a href="#" onclick="visitSelection() ; return false;">Visit selection</a>
			<br>
			<a href="#" onclick="ed.currentEditableContent.deleteContentFragment(); showHTML(); return false;">Delete selection</a>
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