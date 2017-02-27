/*global require, module, document */
const MMSVG = require('mindmup-svg'),
	MMLAYOUT = require('mindmup-mapjs-layout'),
	sizeCache = { },
	abstractWidth = function (text, fontWeight) {
		'use strict';
		const basicSize = 10,
			themeProcessor = new MMLAYOUT.ThemeProcessor(),
			fontInfo = {
				fontSize: basicSize,
				fontWeight: fontWeight
			},
			cssFont = themeProcessor.cssFont(fontInfo),
			canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			measures = ctx.measureText(text);
		ctx.font = cssFont;
		return measures.width / basicSize;
	},
	txWidth = function (text, fontWeight) {
		'use strict';
		fontWeight = fontWeight || 'bold';
		if (!sizeCache[fontWeight]) {
			sizeCache[fontWeight] = {};
		}
		if (!sizeCache[fontWeight].hasOwnProperty(text)) {
			sizeCache[fontWeight][text] = abstractWidth(text, fontWeight);
		}
		return sizeCache[fontWeight][text];
	};
module.exports = function buildSvg(content, themeProvider, options) {
	'use strict';
	const themeName = content.getAttr('theme'),
		themeJSON = themeProvider && themeName  && themeProvider[themeName],
		theme = new MMLAYOUT.Theme(themeJSON || MMLAYOUT.Themes.default);

	return '<?xml version="1.0" encoding="UTF-8"?>\n' +
		MMSVG.generateSvg (
			theme,
			content,
			MMSVG.createTextSizer(txWidth, MMSVG.NaiveLineBreak),
			MMSVG.createTspanTextWriter(txWidth, MMSVG.NaiveLineBreak),
			options
		);
};


/**
 * TODO:
 * - lineSpacing vs linespacing (who's putting in both, which one is used)
 * - purge MMLAYOUT.Themes.default
 * - package mindmup-svg so it doesn't depend on linewrap (eg move linewrap and wordwrap to svg-export)
 */
