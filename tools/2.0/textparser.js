class TextPart{
	constructor(){
		this.action = 0;
		this.cmd = "";
		this.text = "";
		this.data = [];
		this.dataState = 0;
		this.empty = true;
	}

	add(c, act = true){
		if(!c)return;
		
		this.empty = false;

		if(this.action == 0){
			this.text += c;
		}else
		if(this.dataState === 0){
			if(act && c == "="){
				this.dataState = 1;
			}else{
				this.cmd += c;
			}
		}else
		if(this.dataState === 1){
			if(act && c == ";"){
				this.dataState = 2;
				this.data.push("");	
			}else
			this.text += c
		}
		else
		if(this.dataState === 2){
			if(act && c == ";"){
				this.data.push("");	
			}else
			this.data.last += c;
		}
	}

	finish(n){
		if(this.action == 1){
			for(let i in this.data){
				this.data[i] = parseText(this.data[i], n+1);
			}
		}
		if(this.action === 0) delete this.action;
		if(this.cmd === "")delete this.cmd;
		if(this.text === "")delete this.text;
		if(this.data.length === 0)delete this.data;
		else{
			for(let i = this.data.length-1; i >= 0; i--){
				for(let j = this.data[i].length - 1; j >= 0; j--){
					if(!this.data[i][j]){
						this.data.splice(i, 1);
					}
					else
					if(!this.data[i][j].action){
						this.data[i][j] = this.data[i][j].text;
					}
				}
			}
		}
		delete this.dataState;
		delete this.empty;
	}

	saves = {};

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 * @param {{}} mutual 
	 * @param {TextRenderer} textRenderer 
	 * @param {(text: string)=>{}} cb 
	 * @param {boolean} render 
	 */
	apply(ctx, mutual, textRenderer, cb, render){
		const defaults = textRenderer.initElement.data;
		let d = {
			false: 0,
			true: 1,
			ifData: 2,
			ifNoData: 3,
		};

		let shouldRestore = d.false;
		let prerender = ()=>{};

		if(this.cmd == "b"){
			this.saves["fontBuilder.bold"] = ctx.fontBuilder.bold;
			ctx.fontBuilder.bold = true;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/b"){
			this.saves["fontBuilder.bold"] = ctx.fontBuilder.bold;
			ctx.fontBuilder.bold = false;
			shouldRestore = d.ifData;
		}else

		if(this.cmd == "i"){
			this.saves["fontBuilder.italic"] = ctx.fontBuilder.italic;
			ctx.fontBuilder.italic = true;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/i"){
			this.saves["fontBuilder.italic"] = ctx.fontBuilder.italic;
			ctx.fontBuilder.italic = false;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "f"){
			cssm.add(new cssm.el(this.text, cssm.consts.font.format(this.text.replace(' ', '+'))));
			
			this.saves["fontBuilder.font"] = ctx.fontBuilder.font;
			ctx.fontBuilder.font = this.text;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/f"){			
			this.saves["fontBuilder.font"] = ctx.fontBuilder.font;
			ctx.fontBuilder.font = defaults.font;
			shouldRestore = d.ifData;
		}else

		if(this.cmd == "fs"){
			this.saves["fontBuilder.fontSize"] = ctx.fontBuilder.fontSize;
			ctx.fontBuilder.fontSize = valueOrDefault(parseFloat(this.text), defaults.size);
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/fs"){
			this.saves["fontBuilder.fontSize"] = ctx.fontBuilder.fontSize;
			ctx.fontBuilder.fontSize = defaults.size;
			shouldRestore = d.ifData;
		}else

		if(this.cmd == "os"){
			this.saves["lineWidth"] = ctx.lineWidth;
			ctx.lineWidth = valueOrDefault(parseFloat(this.text), defaults.outlineSize);
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/os"){
			this.saves["lineWidth"] = ctx.lineWidth;
			ctx.lineWidth = defaults.outlineSize;
			shouldRestore = d.ifData;
		}else

		if(this.cmd == "ss"){
			this.saves["shadowBlur"] = ctx.shadowBlur;
			ctx.shadowBlur = valueOrDefault(parseFloat(this.text), defaults.shadowSize);
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/ss"){
			this.saves["shadowBlur"] = ctx.shadowBlur;
			ctx.shadowBlur = defaults.shadowSize;
			shouldRestore = d.ifData;
		}else

		if(this.cmd == "c"){
			this.saves["fillStyle"] = ctx.fillStyle;
			ctx.fillStyle = this.text || defaults.color;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/c"){
			this.saves["fillStyle"] = ctx.fillStyle;
			ctx.fillStyle = defaults.color;
			shouldRestore = d.ifData;
		}else
		
		if(this.cmd == "oc"){
			this.saves["strokeStyle"] = ctx.strokeStyle;
			ctx.strokeStyle = this.text || defaults.outlineColor;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/oc"){
			this.saves["strokeStyle"] = ctx.strokeStyle;
			ctx.strokeStyle = defaults.outlineColor;
			shouldRestore = d.ifData;
		}else
		
		if(this.cmd == "sc"){
			this.saves["shadowColor"] = ctx.shadowColor;
			ctx.shadowColor = this.text || defaults.shadow;
			shouldRestore = d.ifData;
		}else
		if(this.cmd == "/sc"){
			this.saves["shadowColor"] = ctx.shadowColor;
			ctx.shadowColor = defaults.shadow;
			shouldRestore = d.ifData;
		}else

		if(this.cmd == "wave"){
			let spread = valueOrDefault(parseFloat(this.text), 0);

			prerender = (i, after)=>{
				if(!after){
					if(i == 0){
						mutual.addOffset({offsety: spread/2});
					}else{
						mutual.addOffset({offsety: (i% 2 == 0 ? 1:-1) * spread});
					}
				}else{
					if(this.data.length - 1 == i){
						mutual.addOffset({offsety: (i% 2 == 0 ? -0.5:0.5) * spread});
					}
				}
			}
		}else

		if(this.cmd == "x"){
			if(!this.data){
				mutual.addOffset({offsetx: parseFloat(this.text)});
			}else{
				let spread = valueOrDefault(parseFloat(this.text), 0);
	
				prerender = (i, after)=>{
					if(!after){
						mutual.addOffset({offsetx: spread});
					}else{
						if(this.data.length - 1 == i){
							mutual.addOffset({offsetx: -i * spread});
						}
					}
				}
			}
		}else
		if(this.cmd == "y"){
			if(!this.data){
				mutual.addOffset({offsety: parseFloat(this.text)});
			}else{
				let spread = valueOrDefault(parseFloat(this.text), 0);
	
				prerender = (i, after)=>{
					if(!after){
						mutual.addOffset({offsety: spread});
					}else{
						if(this.data.length - 1 == i){
							mutual.addOffset({offsety: -(i+1) * spread});
						}
					}
				}
			}
		}else
		if(this.cmd == "sx"){
			mutual.addOffset({offsetx: parseFloat(this.text)});
			if(!render) textRenderer.width.last += parseFloat(this.text)
		}

		else
		if(this.cmd == "lx"){
			if(this.data && textRenderer.lables[this.text]){
				if(!render){
					textRenderer.addLable(this.text, [textRenderer.lables[this.text][0], textRenderer.width.last]);
					textRenderer.width.last += textRenderer.lables[this.text][0]-textRenderer.lables[this.text][1]
				}
				mutual.addOffset({offsetx: textRenderer.lables[this.text][0]-textRenderer.lables[this.text][1]});
			}else
			if(!render){
				textRenderer.addLable(this.text, [textRenderer.width.last, 0]);
			}
		}

		if(this.data){
			if(shouldRestore == d.ifData) shouldRestore = d.true;
			for(let i in this.data){
				prerender(parseInt(i), false);
				cb(this.data[i]);
				prerender(parseInt(i), true);
			}
		}else{
			if(shouldRestore == d.ifNoData) shouldRestore = d.true;
		}

		if(shouldRestore == d.true) this.restore(ctx);
	}

	restore(ctx){
		for(let i in this.saves){
			let path = i.split(".");
			let p = ctx;
			for(let j = 0; j < path.length -1; j++){
				p = p[path[j]];
			}
			p[path[path.length-1]] = this.saves[i];
		}
		this.saves = {};
	}
}

class TextRenderer{
	width = [0];
	parsedText = null;
	initElement = null;
	widthRenderIndex = 0;
	lables = {};

	addLable(name, val){
		this.lables[name] = val;
	}

	constructor(parsedText, initElement){
		this.setText(parsedText, initElement);
	}

	setText(parsedText = null, initElement = null){
		if(!parsedText || !initElement) return;
		this.parsedText = parsedText;
		this.initElement = initElement;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		
		this.initElement.applyBase(ctx);

		
		this.recurse(this.parsedText, ctx, 0, 0, false);
	}

	render(ctx, x, y, initElement = null){
		this.widthRenderIndex = 0;
		
		this.initElement = initElement;
		this.initElement.applyBase(ctx);
		
		let ox = 0;
		if(ctx.textAlign2 == "center"){
			ox = -this.width[this.widthRenderIndex]/2;
		}else
		if(ctx.textAlign2 == "right"){
			ox = -this.width[this.widthRenderIndex];
		}

		this.recurse(this.parsedText, ctx, x + ox, y, true);
	}

	/**
	 * 
	 * @param {any} parsedText 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	recurse(parsedText, ctx, x, y, render = false){
		let mutual = {
			offsetx: 0,
			offsety: 0,
			addOffset: function(o){
				this.offsetx += (o.offsetx || 0)
				this.offsety += (o.offsety || 0)
			},
		}

		if(ctx.textAlign2 == "center"){
			
		}

		

		for(let i in parsedText){
			if(typeof parsedText[i] == "string"){
				if(!render){
					let arr = parsedText[i].split("\n");
					for(let j = 0; j < arr.length; j++){
						this.width.last += ctx.measureText(arr[j]).width;
						if(j+1 < arr.length){
							this.width.push(0);
						}
					}
				}
				else{
					let arr = parsedText[i].split("\n");
					for(let j = 0; j < arr.length; j++){
						ctx.beginPath();
						ctx.strokeText(arr[j], x + mutual.offsetx,y + mutual.offsety);
						ctx.fillText(arr[j], x + mutual.offsetx,y + mutual.offsety);
						ctx.closePath();
						mutual.addOffset({offsetx: ctx.measureText(arr[j]).width});
						if(j+1 < arr.length){
							let owidth = this.width[this.widthRenderIndex];
							this.widthRenderIndex++;
							mutual.addOffset({offsety: this.initElement.data.lineHeight});

							if(ctx.textAlign2 == "center"){
								mutual.addOffset({offsetx: -owidth/2 -this.width[this.widthRenderIndex]/2});
							}else
							if(ctx.textAlign2 == "right"){
								mutual.addOffset({offsetx: -this.width[this.widthRenderIndex]});
							}else{
								mutual.addOffset({offsetx: -owidth});
							}
						}
					}
					
				}
			}else{
				if(parsedText[i]){
					parsedText[i].apply(ctx, mutual, this, res => {
						mutual.addOffset(this.recurse(res, ctx, x + mutual.offsetx, y + mutual.offsety, render));
					}, render)

					/*for(let j in parsedText[i].data || []){
						addOffset(this.recurse(parsedText[i].data[j] || [], ctx, x + offset, y, render));
					}*/
				}
			}
		}
		return mutual;
	}

	applyData(data, ctx){

	}
}

function parseText(s, n = 0){
	if(n == 20) return;
	let res = [new TextPart()];

	let l = 0;

	for(let i = 0; i < s.length; i++){
		let canAdd = true;
		let char = s[i];

		if(char == "\\"){
			char = s[++i];

			res.last.add(char, false);
			continue;
		}

		if(char == "<"){
			l++;
			if(l == 1){
				if(!res.last.empty){
					res.last.finish(n);
					res.push(new TextPart());
				}
				res.last.action = 1;
				canAdd = false;
			}
		}else
		if(char == ">" && res.last.action == 1){
			l--;
			if(l == 0){
				//res.last.add(char);
				
				
				if(s.length - 1 != i){
					res.last.finish(n);
					res.push(new TextPart());
				}
				continue
				//char = s[++i]
			}
		}

		if(canAdd) res.last.add(char, l <= 1);
		

	}
	res.last.finish();

	return n != 0 ? res : res.map(e=>"action" in e ? e : e.text);
}

class FontBuilder{
	_font = "Comic Sans MS";
	get font(){return this._font}
	set font(value){
		this._font = value || "Comic Sans MS";
		this.build();
	}

	_italic = "";
	get italic(){return this._italic}
	set italic(value){
		this._italic = value ? "italic" : "";
		this.build();
	}

	_bold = "";
	get bold(){return this._bold}
	set bold(value){
		this._bold = value ? "bold" : "";
		this.build();
	}

	_fontSize = "";
	get fontSize(){return parseFloat(this._fontSize)}
	set fontSize(value){
		this._fontSize = value ? value + "pt" : "";
		this.build();
	}

	constructor(ctx){
		this.ctx = ctx;
	}

	build(){
		let s = [this.italic, this.bold, this._fontSize, this.font].join(" ");
		if(this.ctx) this.ctx.font = s;
		return s;
	}
}
