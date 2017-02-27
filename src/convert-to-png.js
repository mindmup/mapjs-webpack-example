/*global module, document, window*/
module.exports = function convertToPng(url, scaledWidth, scaledHeight) {
	'use strict';
	return new Promise(function (resolve, reject) {
		const toCanvas = function (img) {
				const width = scaledWidth || img.width,
					height =  scaledHeight || img.height,
					canvas = document.createElement('canvas');
				canvas.setAttribute('width', width);
				canvas.setAttribute('height', height);
				canvas.getContext('2d').drawImage(img, 0, 0, width, height);
				return canvas;
			},
			onTimeout = function () {
				reject('network-error');
			},
			image = new window.Image(),
			timeoutId = window.setTimeout(onTimeout, 20000),
			onLoad = function () {
				window.clearTimeout(timeoutId);
				resolve(toCanvas(this).toDataURL('image/png'));
			},
			onError = function (e) {
				window.clearTimeout(timeoutId);
				reject(e);
			};


		image.addEventListener('load', onLoad);
		image.addEventListener('error', onError);
		if (!/^data:/.test(url)) {
			image.setAttribute('crossOrigin', 'anonymous');
		}
		image.src = url;
	});
};
