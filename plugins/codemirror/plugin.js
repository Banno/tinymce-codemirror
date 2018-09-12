/**
 * plugin.js
 *
 * Copyright 2013 Web Power, www.webpower.nl
 * @author Arjan Haverkamp
 */

/*jshint unused:false */
/*global tinymce:true */

tinymce.PluginManager.requireLangPack('codemirror');

tinymce.PluginManager.add('codemirror', function(editor, url) {

	function showSourceEditor() {
		// Insert caret marker
		editor.focus();
		editor.selection.collapse(true);
		// Preserve deliberate line-spacing at the caret position
		var bogusChild = editor.selection.getNode().querySelector('br[data-mce-bogus]');
		if (bogusChild) {
			editor.selection.setContent('&nbsp;');
			editor.selection.getNode().removeChild(bogusChild);
		}
		// Resume/finish caret insertion
		if (editor.selection.getNode().nodeName !== "STYLE") {
			editor.selection.setContent('<span class="CmCaReT" style="display:none">&#0;</span>');
		}

		//get original scroll position
		var oldPos = tinymce.DOM.getViewPort();
		//scroll to top of page
		scrollTo(0, 0);

		var config = {
			title: 'HTML source code',
			url: url + '/source.html',
			width: 800,
			height: 550,
			resizable : true,
			maximizable : true,
			fullScreen: editor.settings.codemirror.fullscreen,
			buttons: [
				{ text: 'Ok', subtype: 'primary', onclick: function(){
					var doc = document.querySelectorAll('.mce-container-body>iframe')[0];
					doc.contentWindow.submit();
					win.close();
				}},
				{ text: 'Cancel', onclick: 'close' }
			]
		};

		var win = editor.windowManager.open(config);

		if (editor.settings.codemirror.fullscreen) {
			win.fullscreen(true);
		}

		//scroll back to original position
		scrollTo(oldPos.x, oldPos.y);

	};

	// Add a button to the button bar
	editor.addButton('code', {
		title: 'Source code',
		icon: 'code',
		onclick: showSourceEditor
	});

	// Add a menu item to the tools menu
	editor.addMenuItem('code', {
		icon: 'code',
		text: 'Source code',
		context: 'tools',
		onclick: showSourceEditor
	});
});
