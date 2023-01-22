Object.defineProperty(Array.prototype, "last", {
	get: function() { return this[this.length-1]; },
	set: function(v) { this[this.length-1] = v; },
	enumerable: false,
	configurable: false
});

/**
 * 
 * @param {Object} obj 
 * @param {[string]} keys 
 * @returns {boolean} 
 */
function objectContainsAll(obj, keys){
	for(let i in keys){
		if(!(keys[i] in obj)) return false;
	}
	return true;
}


if (!String.prototype.format) {
	String.prototype.format = function() {
		let args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
		});
	};
}
if(!String.prototype.insertAt){
	String.prototype.insertAt = function(v,n=-1){
		if(n == -1) n = this.length;
		return this.slice(0,n)+v+this.slice(n);
	}
}

function hexToHSL(H) {
	// Convert hex to RGB first
	let r = 0, g = 0, b = 0;
	if (H.length == 4) {
		r = "0x" + H[1] + H[1];
		g = "0x" + H[2] + H[2];
		b = "0x" + H[3] + H[3];
	} else if (H.length == 7) {
		r = "0x" + H[1] + H[2];
		g = "0x" + H[3] + H[4];
		b = "0x" + H[5] + H[6];
	}
	// Then to HSL
	r /= 255;
	g /= 255;
	b /= 255;
	let cmin = Math.min(r,g,b),
		cmax = Math.max(r,g,b),
		delta = cmax - cmin,
		h = 0,
		s = 0,
		l = 0;

	if (delta == 0)
		h = 0;
	else if (cmax == r)
		h = ((g - b) / delta) % 6;
	else if (cmax == g)
		h = (b - r) / delta + 2;
	else
		h = (r - g) / delta + 4;

	h = Math.round(h * 60);

	if (h < 0)
		h += 360;

	l = (cmax + cmin) / 2;
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return [h,s,l,"hsl(" + h + "," + s + "%," + l + "%)"];
}

function HSLToHex(h,s,l) {
	if(h < 0) h = 360-Math.abs(h)
	s /= 100;
	l /= 100;

	let c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m = l - c/2,
		r = 0,
		g = 0, 
		b = 0; 

	if (0 <= h && h < 60) {
		r = c; g = x; b = 0;
	} else if (60 <= h && h < 120) {
		r = x; g = c; b = 0;
	} else if (120 <= h && h < 180) {
		r = 0; g = c; b = x;
	} else if (180 <= h && h < 240) {
		r = 0; g = x; b = c;
	} else if (240 <= h && h < 300) {
		r = x; g = 0; b = c;
	} else if (300 <= h && h < 360) {
		r = c; g = 0; b = x;
	}
	// Having obtained RGB, convert channels to hex
	r = Math.round((r + m) * 255).toString(16);
	g = Math.round((g + m) * 255).toString(16);
	b = Math.round((b + m) * 255).toString(16);

	// Prepend 0s, if necessary
	if (r.length == 1)
		r = "0" + r;
	if (g.length == 1)
		g = "0" + g;
	if (b.length == 1)
		b = "0" + b;

	return "#" + r + g + b;
}

function parsePosition(x, x_ex, y, y_ex, img){
	x = parseFloat(x);
	y = parseFloat(y);
	
	let res = [x,y];
	switch(x_ex){
		case "tl":
			res[0] = (x) * ((Canvas.grid.width - Canvas.grid.outlineSize * 2) / Canvas.grid.columns)
			break;
		case "%":
			res[0] = (x) * ((Canvas.grid.width - Canvas.grid.outlineSize * 2) / 100)
			break;
		case "i%":
			if(img) res[0] = (x) * ((img.width) / 100)
			break;
	}
	switch(y_ex){
		case "tl":
			res[1] = (y) * ((Canvas.grid.height - Canvas.grid.outlineSize * 2) / Canvas.grid.rows)
			break;
		case "%":
			res[1] = (y) * ((Canvas.grid.height - Canvas.grid.outlineSize * 2) / 100)
			break;
		case "i%":
			if(img) res[1] = (y) * ((img.height) / 100)
			break;
	}
	return res;
}

function transformPosition(x, x_ex, x_oex, axis, img){
	if(x_ex == x_oex)return x;

	if(axis == "x" || axis == "width")
	return parseFloat((parsePosition(1, x_ex, null, null, img)[0] / parsePosition(1, x_oex, null, null, img)[0] * x).toFixed(2));
	if(axis == "y" || axis == "height")
	return parseFloat((parsePosition(0,0,1, x_ex, null, null, img)[1] / parsePosition(0,0,1, x_oex, null, null, img)[1] * x).toFixed(2));
}

function valueOrDefault(v, def){
	if(v !== null && v !== undefined)return v;
	return def;
}

function getAlpha(nr){
	nr = parseInt(nr).toString(16);
	return nr.length > 1 ? nr : "0" + nr;
}

const localResources = {
	images:['100-gem', '1000-gem', '250-gem', '50-gem', '500-gem', '750-gem', 'area-50',
		'atonement', 'attract', 'autumn-wreath', 'backtrack', 'bandages', 'barrier', 'black_hole',
		'bloom', 'blue-flames', 'blue-santa-hat', 'bronze-crown', 'charge', 'crumble', 'decay',
		'depart', 'distort', 'earthquake', 'ember', 'energize', 'flames', 'flashlight_item',
		'flashlight', 'flow', 'fusion', 'gold-crown', 'gold-wreath', 'halo', 'harden', 'latch',
		'lightning', 'magnetism', 'minimize', 'mortar', 'night', 'obscure', 'olympics-wreath',
		'orbit-ring', 'orbit', 'paralysis', 'pollinate', 'pumpkin_off_healing', 'pumpkin_off',
		'pumpkin_on_healing', 'pumpkin_on', 'radioactive_gloop', 'reanimate', 'repel',
		'resurrection', 'reverse', 'rewind', 'santa-hat', 'shadow', 'shatter', 'shift', 'shriek',
		'silver-crown', 'snowball_projectile', 'snowball', 'spark', 'spring-wreath', 'stars',
		'sticky_coat', 'sticky-coat', 'stomp', 'stream', 'sugar_rush', 'summer-wreath', 'supernova',
		'sweet_tooth_item', 'sweet_tooth', 'torch', 'toxic-coat', 'vengeance_projectile',
		'vengeance', 'vigor', 'warp', 'wildfire', 'winter-wreath', 'wormhole']
}