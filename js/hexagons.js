var hexagon_radius = 50;
var hexagon_max_speed = 0.04;
var hexagon_min_speed = 0.0004;
var hexagon_color = '#353C42';
var hexagon_color = '#fff';
var hexagon_space_between = 0;
var hexagon_line_width = 2;

var changing_colors = false;
var changing_solors_speed = 0.5;

var fancy_graphics = true;

var inView = true;
var resizing = false;

var canvas, ctx;

var hexagons;

var s3p3 = Math.sqrt(3);

var h = 0;

function init() {
	hexagons = [];

	canvas = document.getElementById('hexagons');

	let w = canvas.parentNode.offsetWidth;
	let h = canvas.parentNode.offsetHeight;
	canvas.width = w;
	canvas.height = h;
	canvas.style.width = w + 'px';
	canvas.style.height = h + 'px';
	ctx = canvas.getContext('2d');

	var hw = Math.ceil( canvas.width / (1.5 * hexagon_radius + hexagon_space_between * 2)) + 1;
	var hh = Math.ceil( canvas.height / (s3p3 * hexagon_radius + hexagon_space_between * 2)) + 1;

	for (var x = -1; x < hw; x++)
		for (var y = 0; y < hh; y++)
			addHexagon(
				hexagon_radius +
					hexagon_space_between +
					(1.5 * hexagon_radius + hexagon_space_between * 2) * x,
				s3p3 * hexagon_radius / 2 +
					hexagon_space_between +
					(s3p3 * hexagon_radius + hexagon_space_between * 2) * y -
					(x % 2 ? s3p3 * hexagon_radius / 2 : 0),
				{x: x, y: y}
			);

	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	loop();
}

function loop() {
	requestAnimFrame(loop);

	if (!inView || resizing) return;

	ctx.globalCompositeOperation = 'source-over';

	//ctx.fillStyle = 'rgba(0, 0, 0, 0)';
	//ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.globalCompositeOperation = 'lighter';

	for (var i = 0; i < hexagons.length; i++) {
		ctx.beginPath();

		ctx.lineWidth = hexagons[i].lineWidth;

		drawHexagonPath(i);

		if (changing_colors)
			ctx.shadowColor = ctx.strokeStyle = 'hsl(' + h + ', 100%, 50%)';
		else ctx.shadowColor = ctx.strokeStyle = hexagon_color;

		ctx.shadowBlur = 20;
		ctx.stroke();
	}

	if (changing_colors) h += changing_solors_speed;
}

function addHexagon(x, y, opts) {
	var l = Math.floor(Math.random() * 6),
		p = Math.random();

	if (!opts) opts = {};

	hexagons.push({
		sl: opts.l || opts.l === 0 ? opts.l : l,
		p: opts.p || opts.p === 0 ? opts.p : p,
		x: x,
		y: y,
		lineWidth: Math.random()*5+0.15,
		speed:
			opts.speed || opts.speed === 0
				? opts.speed
				: hexagon_min_speed + Math.random() * hexagon_max_speed
	});
}

function drawHexagonPath(hex_index) {
	var hex = hexagons[hex_index];

	ctx.save();
	ctx.translate(hex.x, hex.y);
	ctx.rotate(hex.a);

	ctx.moveTo(
		Math.cos(Math.PI / 3 * hex.sl) * hexagon_radius +
			Math.cos(Math.PI / 3 * (hex.sl + 2)) * hexagon_radius * hex.p,
		Math.sin(Math.PI / 3 * hex.sl) * hexagon_radius +
			Math.sin(Math.PI / 3 * (hex.sl + 2)) * hexagon_radius * hex.p
	);

	//ctx.moveTo(hex.x, hex.y);

	ctx.lineTo(
		Math.cos(Math.PI / 3 * (hex.sl + 1)) * hexagon_radius,
		Math.sin(Math.PI / 3 * (hex.sl + 1)) * hexagon_radius
	);

	ctx.lineTo(
		Math.cos(Math.PI / 3 * (hex.sl + 2)) * hexagon_radius,
		Math.sin(Math.PI / 3 * (hex.sl + 2)) * hexagon_radius
	);

	ctx.lineTo(
		Math.cos(Math.PI / 3 * (hex.sl + 3)) * hexagon_radius,
		Math.sin(Math.PI / 3 * (hex.sl + 3)) * hexagon_radius
	);

	ctx.lineTo(
		Math.cos(Math.PI / 3 * (hex.sl + 3)) * hexagon_radius +
			Math.cos(Math.PI / 3 * (hex.sl + 5)) * hexagon_radius * hex.p,
		Math.sin(Math.PI / 3 * (hex.sl + 3)) * hexagon_radius +
			Math.sin(Math.PI / 3 * (hex.sl + 5)) * hexagon_radius * hex.p
	);

	ctx.restore();

	hex.p += hex.speed;

	if (hex.p > 1 || hex.p < 0) {
		hex.p = hex.speed < 0 ? 1 : 0;
		hex.sl += hex.speed < 0 ? -1 : 1;
		hex.sl = hex.sl % 6;
		hex.sl = hex.sl < 0 ? 4 - hex.sl : hex.sl;
	}

	hexagons[hex_index] = hex;
}

window.onload = function() {
	init();

	let timeout;

	window.addEventListener(
		'resize',
		throttle(function(event) {
			if (inView) init();
			resizing = true;
			clearTimeout(timeout);
			timeout = setTimeout(() => (resizing = false));
		}, 550)
	);

	window.addEventListener(
		'scroll',
		throttle(function(event) {
			inView = isInViewport(canvas);
		}),
		250
	);
};

function isInViewport(element) {
	let rect = element.getBoundingClientRect();
	return (
		rect.bottom >= 0 &&
		rect.top <= window.innerHeight &&
		rect.right >= 0 &&
		rect.left <= window.innerWidth
	);
}

function throttle(fn, threshhold, scope) {
	threshhold || (threshhold = 250);
	var last, deferTimer;
	return function() {
		var context = scope || this;

		var now = +new Date(),
			args = arguments;
		if (last && now < last + threshhold) {
			// hold on to it
			clearTimeout(deferTimer);
			deferTimer = setTimeout(function() {
				last = now;
				fn.apply(context, args);
			}, threshhold);
		} else {
			last = now;
			fn.apply(context, args);
		}
	};
}

window.requestAnimFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		}
	);
})();
