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
	images:imageMap.map(e=>e.replace(".png", ""))
}

const prefabs = {
	heroCircles:{
		"Magmax": {
			"t": "M",
			"tc": "#f50000",
			"toc": "#990000",
			"tfs": 21,
			"tow": 4,
			"c": "#f00f0f",
			"oc": "#9e0000",
			"ofx": 0,
			"ofy": 2.5,
			"ra": 21,
			"ora": 3
		},
		"Rime": {
			"t": "R",
			"tc": "#006eff",
			"toc": "#0b4da2",
			"tfs": 24,
			"tow": 4,
			"c": "#0066db",
			"oc": "#032fb5",
			"ofx": 1,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Morfe": {
			"t": "M",
			"tc": "#1adb00",
			"toc": "#0f8500",
			"tfs": 21,
			"tow": 4,
			"c": "#00ff1e",
			"oc": "#00c217",
			"ofx": 0,
			"ofy": 2.3999999999999986,
			"ra": 21,
			"ora": 3
		},
		"Aurora": {
			"t": "A",
			"tc": "#ff9500",
			"toc": "#c25e00",
			"tfs": 23,
			"tow": 4,
			"c": "#ff7300",
			"oc": "#b35600",
			"ofx": -0.29999999999999716,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Necro": {
			"t": "N",
			"tc": "#ee00ff",
			"toc": "#ad0096",
			"tfs": 20,
			"tow": 4,
			"c": "#ff00d0",
			"oc": "#b300a4",
			"ofx": 0,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Brute": {
			"t": "B",
			"tc": "#7c1b03",
			"toc": "#451003",
			"tfs": 23,
			"tow": 4,
			"c": "#7a1800",
			"oc": "#421105",
			"ofx": 0.5,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Chrono": {
			"t": "C",
			"tc": "#00bd5b",
			"toc": "#0d7246",
			"tfs": 23,
			"tow": 4,
			"c": "#00bd5b",
			"oc": "#0a8545",
			"ofx": -1,
			"ofy": 5,
			"ra": 21,
			"ora": 3
		},
		"Reaper": {
			"t": "R",
			"tc": "#4d4d4d",
			"toc": "#212121",
			"tfs": 22,
			"tow": 4,
			"c": "#3b3b3b",
			"oc": "#303030",
			"ofx": 0.29999999999999716,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Rameses": {
			"t": "R",
			"tc": "#ae9b56",
			"toc": "#605839",
			"tfs": 22,
			"tow": 4,
			"c": "#9c8944",
			"oc": "#706333",
			"ofx": 0.5999999999999943,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Mortuus": {
			"t": "M",
			"tc": "#30842e",
			"toc": "#215520",
			"tfs": 21,
			"tow": 4,
			"c": "#397a38",
			"oc": "#1a4319",
			"ofx": -0.20000000000000284,
			"ofy": 2,
			"ra": 21,
			"ora": 3
		},
		"Cybot": {
			"t": "?",
			"tc": "#9957b7",
			"toc": "#5c2f75",
			"tfs": 26,
			"tow": 4,
			"c": "#a75bcd",
			"oc": "#573965",
			"ofx": 2.700000000000003,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Echelon": {
			"t": "E",
			"tc": "#5db0fd",
			"toc": "#366e91",
			"tfs": 22,
			"tow": 4,
			"c": "#55a6fc",
			"oc": "#3d799e",
			"ofx": -0.19999999999998863,
			"ofy": 5,
			"ra": 21,
			"ora": 3
		},
		"Nexus": {
			"t": "N",
			"tc": "#00f5f1",
			"toc": "#00adab",
			"tfs": 20,
			"tow": 4,
			"c": "#00f5f1",
			"oc": "#00b8b5ff",
			"ofx": 0,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Shade": {
			"t": "S",
			"tc": "#856f51",
			"toc": "#5a4830",
			"tfs": 24,
			"tow": 4,
			"c": "#81645a",
			"oc": "#4e3c36",
			"ofx": -0.7000000000000028,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Euclid": {
			"t": "E",
			"tc": "#794e79",
			"toc": "#432d43",
			"tfs": 21,
			"tow": 4,
			"c": "#734474",
			"oc": "#422d43",
			"ofx": -0.5,
			"ofy": 4.5,
			"ra": 21,
			"ora": 3
		},
		"Cent": {
			"t": "C",
			"tc": "#d6d6d6",
			"toc": "#8a8a8a",
			"tfs": 23,
			"tow": 4,
			"c": "#bababa",
			"oc": "#6e6e6e",
			"ofx": -1,
			"ofy": 5,
			"ra": 21,
			"ora": 3
		},
		"Ghoul": {
			"t": "G",
			"tc": "#afc7da",
			"toc": "#7b8f9d",
			"tfs": 22,
			"tow": 4,
			"c": "#adc5d8",
			"oc": "#738491",
			"ofx": 0,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Jolt": {
			"t": "J",
			"tc": "#f4ed25",
			"toc": "#b4a82d",
			"tfs": 23,
			"tow": 4,
			"c": "#e3fb32",
			"oc": "#afb92d",
			"ofx": 0.20000000000000284,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Mirage": {
			"t": "M",
			"tc": "#3c16fe",
			"toc": "#250ca7",
			"tfs": 21,
			"tow": 4,
			"c": "#1c029c",
			"oc": "#11025a",
			"ofx": -0.19999999999998863,
			"ofy": 2,
			"ra": 21,
			"ora": 3
		},
		"Candy": {
			"t": "C",
			"tc": "#fe8bd9",
			"toc": "#b474a3",
			"tfs": 23,
			"tow": 4,
			"c": "#ffa8e4",
			"oc": "#ba82ab",
			"ofx": -0.9000000000000057,
			"ofy": 5,
			"ra": 21,
			"ora": 3
		},
		"Jotunn": {
			"t": "J",
			"tc": "#34cbfe",
			"toc": "#1791ba",
			"tfs": 23,
			"tow": 4,
			"c": "#00b0eb",
			"oc": "#067093",
			"ofx": 0.29999999999999716,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Magno": {
			"t": "M",
			"tc": "#ed0255",
			"toc": "#aa1339",
			"tfs": 21,
			"tow": 4,
			"c": "#fa006c",
			"oc": "#930629",
			"ofx": -0.19999999999998863,
			"ofy": 2,
			"ra": 21,
			"ora": 3
		},
		"Glob": {
			"t": "G",
			"tc": "#008509",
			"toc": "#10520f",
			"tfs": 22,
			"tow": 4,
			"c": "#0b9e00",
			"oc": "#1b6a15",
			"ofx": 0.20000000000000284,
			"ofy": 4,
			"ra": 21,
			"ora": 3
		},
		"Boldrock": {
			"t": "B",
			"tc": "#a38d00",
			"toc": "#6f4c01",
			"tfs": 23,
			"tow": 4,
			"c": "#ae9809",
			"oc": "#77690e",
			"ofx": 0.3999999999999986,
			"ofy": 5,
			"ra": 21,
			"ora": 3
		},
		"Viola": {
			"t": "V",
			"tc": "#dbac00",
			"toc": "#997a0b",
			"tfs": 22,
			"tow": 4,
			"c": "#d6b300",
			"oc": "#a58309",
			"ofx": -0.5999999999999943,
			"ofy": 5,
			"ra": 21,
			"ora": 3
		},
		"Stella": {
			"t": "S",
			"tc": "#dfdc77",
			"toc": "#a7a552",
			"tfs": 24,
			"tow": 4,
			"c": "#dfdc77",
			"oc": "#a6a23a",
			"ofx": -0.5,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		},
		"Ignis": {
			"t": "I",
			"tc": "#db2100",
			"toc": "#932501",
			"tfs": 24,
			"tow": 4,
			"c": "#c92f08",
			"oc": "#8f1a05",
			"ofx": 1,
			"ofy": 3,
			"ra": 21,
			"ora": 3
		}
	}
}