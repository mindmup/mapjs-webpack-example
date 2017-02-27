/*global require, document, window, console */
const MAPJS = require('mindmup-mapjs'),
	jQuery = require('jquery'),
	themeProvider = require('./theme'),
	ThemeProcessor = require('mindmup-mapjs-layout').ThemeProcessor,
	buildSvg = require('./build-svg'),
	convertToPng = require('./convert-to-png'),
	testMap = require('./example-map'),
	content = require('mindmup-mapjs-model').content,
	init = function () {
		'use strict';
		const container = jQuery('#container'),
			idea = content(testMap),
			imageInsertController = new MAPJS.ImageInsertController('http://localhost:4999?u='),
			mapModel = new MAPJS.MapModel(MAPJS.DOMRender.layoutCalculator, []);

		jQuery.fn.attachmentEditorWidget = function (mapModel) {
			return this.each(function () {
				mapModel.addEventListener('attachmentOpened', function (nodeId, attachment) {
					mapModel.setAttachment(
							'attachmentEditorWidget',
							nodeId, {
								contentType: 'text/html',
								content: window.prompt('attachment', attachment && attachment.content)
							}
							);
				});
			});
		};
		window.onerror = window.alert;


		jQuery('#themecss').themeCssWidget(themeProvider, new ThemeProcessor(), mapModel);
		container.domMapWidget(console, mapModel, false, imageInsertController);
		jQuery('body').mapToolbarWidget(mapModel);
		jQuery('body').attachmentEditorWidget(mapModel);
		mapModel.setIdea(idea);


		jQuery('#linkEditWidget').linkEditWidget(mapModel);
		window.mapModel = mapModel;
		jQuery('.arrow').click(function () {
			jQuery(this).toggleClass('active');
		});
		imageInsertController.addEventListener('imageInsertError', function (reason) {
			console.log('image insert error', reason);
		});
		container.on('drop', function (e) {
			const dataTransfer = e.originalEvent.dataTransfer;
			e.stopPropagation();
			e.preventDefault();
			if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
				const fileInfo = dataTransfer.files[0];
				if (/\.mup$/.test(fileInfo.name)) {
					const oFReader = new window.FileReader();
					oFReader.onload = function (oFREvent) {
						mapModel.setIdea(content(JSON.parse(oFREvent.target.result)));
					};
					oFReader.readAsText(fileInfo, 'UTF-8');
				}
			}
		});
		jQuery('#makeSvg').on('click', function () {
			const mimeType = 'image/svg+xml',
				content = buildSvg(mapModel.getIdea(), themeProvider, {
					clipRect: { width: 300, height: 300 },
					additionalCss: 'tspan, text {font-family:NotoSans, "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif}'
				}),
				url = window.URL.createObjectURL(new window.Blob([content], {type: mimeType}));
			convertToPng(url).then(function (pngUrl) {
				window.open(pngUrl, 'svg', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
			});
		});
	};
document.addEventListener('DOMContentLoaded', init);
