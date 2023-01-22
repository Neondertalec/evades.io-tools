const Mouse = new (class Mouse{
	constructor(){
		this.x = 0;
		this.y = 0;
		this.sx = 0;
		this.sy = 0;
		this.isDown = false;
	}

	/** @param {MouseEvent} e */
	down(e){
		this.sx = this.x = e.clientX;
		this.sy = this.y = e.clientY;

		this.isDown = true;
	}

	/** @param {MouseEvent} e */
	up(e){
		this.x = e.clientX;
		this.y = e.clientY;
		
		this.isDown = false;
	}

	/** @param {MouseEvent} e */
	move(e){
		this.x = e.clientX;
		this.y = e.clientY;
	}
})();

class Grid{

	get width(){return this.columns * (this.tileWidth + this.outlineSize*2) + this.outlineSize}
	get height(){return this.rows * (this.tileHeight + this.outlineSize*2) + this.outlineSize}

	constructor(wc, hc, os, w, h){
		this.grid = [];
		this.columns = wc;
		this.rows = hc;
		this.outlineSize = os;
		this.tileWidth = w;
		this.tileHeight = h;
		this.resizeGrid();
	}

	load(data){
		this.grid = data.grid.map(e=>e.map(e2=>new Tile(e2)));
		this.resize(data.wc, data.hc, data.os, data.w, data.h);
	}

	resize(wc = null, hc = null, os = null, w = null, h = null){
		this.columns = wc === null ? this.columns : wc;
		this.rows = hc === null ? this.rows : hc;
		this.outlineSize = os === null ? this.outlineSize : os;
		this.tileWidth = w === null ? this.tileWidth : w;
		this.tileHeight = h === null ? this.tileHeight : h;


		if(wc !== null || wh !== null) this.resizeGrid();
	}

	resizeGrid(){
		this.grid.length = this.rows;
		for(let i = 0; i < this.rows; i++){
			if(!this.grid[i]){
				this.grid[i] = new Array(this.columns).fill().map(e=>new Tile());
			}else{
				if(this.columns < this.grid[i].length)this.grid[i].length = this.columns;
				for(let j = this.grid[i].length; j < this.columns; j++){

					this.grid[i].push(new Tile());
				}
			}
		}
	}

	export(){
		return {
			grid: this.grid.map(e=>e.map(e2=>e2.export())),
			wc: this.columns,
			hc: this.rows,
			os: this.outlineSize,
			w: this.tileWidth,
			h: this.tileHeight
		}
	}

	render(ctx, ox = 0, oy = 0){
		for(let i = 0; i < this.columns; i++){
			for(let j = 0; j < this.rows; j++){
				let x = i * (this.tileWidth + this.outlineSize*2) + this.outlineSize * 2 - this.outlineSize,
					y = j * (this.tileHeight + this.outlineSize*2) + this.outlineSize * 2 - this.outlineSize;
				
				x += ox; y += oy;
				let tile = Canvas.editingLayouts["Tiles"].content[this.grid[j][i].id];

				let data = {
					outlineColor: tile?.data?.outlineColor || "#000000",
					color: tile?.data?.color || "#000000",
					colorVisible: tile?.data?.colorVisible === false ? tile?.data?.colorVisible : true,
					bcolorVisible: tile?.data?.bcolorVisible === false ? tile?.data?.bcolorVisible : true
				}

				if(data.bcolorVisible){
					ctx.beginPath();
					ctx.fillStyle = data.outlineColor;
					ctx.rect(x - this.outlineSize, y - this.outlineSize, this.tileWidth + this.outlineSize*2, this.tileHeight + this.outlineSize*2);
					ctx.fill();
					ctx.closePath();
				}

				if(data.colorVisible){
					ctx.beginPath();
					ctx.fillStyle = data.color;
					ctx.rect(x, y, this.tileWidth, this.tileHeight);
					ctx.fill();
					ctx.closePath();
				}else
				if(data.bcolorVisible){
					let ogco = ctx.globalCompositeOperation;
					ctx.globalCompositeOperation = "destination-out";
					ctx.beginPath();
					ctx.fillStyle = data.color;
					ctx.rect(x, y, this.tileWidth, this.tileHeight);
					ctx.fill();
					ctx.closePath();
					ctx.globalCompositeOperation = ogco;
				}
			}
		}
	}
}

class Tile{
	constructor(data){
		this.import(data);
	}

	import(data){
		data = data || {};

		this.id = data.id || 0;
	}

	export(){
		return {
			id: this.id,
		}
	}
}

class EditingLayout{
	/**
	 * 
	 * @param {{title: string, content: [EditingGroup], classes: [typeof EditingGroup], counter: number, create: boolean}} baseData
	 */
	constructor({title = "", content = {}, classes = [], counter = 0, create = true, contentParams}){
		this.title = title;
		this.buttonData = {create};
		
		this.content = content;
		this.counter = counter;

		this.classes = classes;
		this.element = null;
		this.container = null;
		this.initRender();
	}

	find(fn){
		for(let i in this.content){
			if(fn(this.content[i].data)) return this.content[i];
		}
	}

	initRender(){
		this.element = GUI.createElementP("div", {className: "edit-layout"}, (layout)=>{
			GUI.createElementP("p", {className: "edit-head"}, (header)=>{
				//GUI.createElementP("div", {className: "edit-head"}, (header)=>{}, layout);
				header.append(this.title);
				if(this.buttonData.create) GUI.createElementP("button", {innerText: "+", className:"btn-green"}, (btn)=>{
					btn.addEventListener("click", ()=>this.add());
				}, header)
				if("compressable" in this.buttonData ? this.buttonData.compressable : true) GUI.createElementP("button", {innerText: "V", className:"btn-green "}, (btn)=>{
					btn.addEventListener("click", ()=>{
						layout.classList.toggle("compressed", btn.classList.toggle("btn-orange"));

					});
				}, header)
			}, layout)
			this.container = GUI.createElementP("div", {className: "edit-container"}, (header)=>{
			}, layout)
		});
	}

	add(obj = null){
		if(obj == null){
			if(this.classes.length == 1){
				this.add(new (this.classes[0])());
			}else{
				GUI.prompt({message: "What do you want to create?", cancel:true}, ...this.classes.map(e=>e.PromptName)).then(res=>{
					this.add(new (this.classes.find(e=>e.PromptName == res.text))());
				}).catch(()=>{});
			}
		}else{
			obj.lid = obj.lid || this.counter++;
			obj.parentLayout = this;
			this.content[obj.lid] = obj;
			this.container.appendChild(obj.element);
		}
		Canvas.render();
	}

	remove(lid = -1){
		if(lid !== -1){
			delete this.content[lid];
		}
	}

	export(){
		const res = {counter: this.counter, content: {}};
		for(let i in this.content){
			res.content[i] = {d:this.content[i].export(), t: this.classes.findIndex(e=>e.name == this.content[i].constructor.name)};
		}
		return res;
	}

	import(data){
		for(let i in data.content){
			this.add(new (this.classes[data.content[i].t])(data.content[i].d));
		}
		if(data.counter) this.counter = data.counter;
	}
}

class EditingGroup{
	static PromptName = "*";
	constructor(data = null){
		this.parentLayout = null;
		this.movable = false;
		this.data = {};
		this.fields = {};
		this.element = null;
		this.topBar = null;
		this.container = null;
		this.import(data);
	}
	render({deletable = false, compressable = false, drawable = false, clonable = false, movable = false}){
		this.element = GUI.createElementP("div", {className: "edit-group"}, layout=>{
			this.topBar = GUI.createElementP("p", {className: "edit-group-head"}, (header)=>{
				
				if(deletable) GUI.createElementP("button", {innerText: "x", className:"btn-red"}, (btn)=>{
					btn.addEventListener("click", ()=>this.remove());
				}, header)
				
				if(compressable) GUI.createElementP("button", {innerText: "V", className:"btn-green"}, (btn)=>{
					btn.addEventListener("click", ()=>{
						layout.classList.toggle("compressed", btn.classList.toggle("btn-orange"));
					});
				}, header)
				if(clonable) GUI.createElementP("button", {innerText: "Clone", className:"btn-green"}, (btn)=>{
					btn.addEventListener("click", ()=>{
						this.clone();
					});
				}, header)
				if(drawable) GUI.createElementP("button", {innerText: "Draw", className:"btn-green"}, (btn)=>{
					btn.classList.toggle("btn-orange", !(this.data.render));

					btn.addEventListener("click", ()=>{
						btn.classList.toggle("btn-orange", !(this.data.render = !this.data.render));
						Canvas.render();
					});
				}, header)
				if(movable) GUI.createElementP("button", {innerText: "Move", className:"btn-green"}, (btn)=>{
					btn.classList.toggle("btn-orange", (this.movable));
					console.log(this.movable);

					btn.addEventListener("click", ()=>{
						btn.classList.toggle("btn-orange", (this.movable = !this.movable));
						btn.innerText = this.movable ? "Stop" : "Move";

						if(this.movable){
							Canvas.movables.push(this);
						}else Canvas.movables.splice(Canvas.movables.indexOf(this), 1);
					});
				}, header)
			}, layout)

			this.container = GUI.createElementP("div", {className: "edit-group-container"}, (header)=>{
			}, layout)
		});
	}

	draw(ctx, ox, oy){}
	
	clone(){
		let exportData = this.export();
		
		delete exportData.lid;

		this.parentLayout.import({content:{0:{
			d: exportData,
			t: this.parentLayout.classes.findIndex(e=>e.name == this.constructor.name)
		}}});
	}
	
	hide(){}
	
	remove(){
		this.element.remove();
		this.parentLayout.remove(this.lid);

		if(this.movable) Canvas.movables.splice(Canvas.movables.indexOf(this), 1);
		
		Canvas.render();
	}

	initPack(){
		return [
			["render", "dr", true]
		]
	}
	
	import(data, over = false){
		data = data || {};
		this.lid = data.lid;
		
		let ip = this.initPack();
		for(let p of ip){
			this.data[p[0]] = (p[1] in data) ? data[p[1]] : (over ? this.data[p[0]] : p[2]);
		}
	}
	
	export(loop = true){
		let res = {lid: this.lid};

		if(loop){
			let ip = this.initPack();
			for(let p of ip){
				res[p[1]] = this.data[p[0]];
			}
		}
		return res;
	}
	
	onChange(){}

	move(ox, oy){
		if(!this.movable) return;
		
		if(!objectContainsAll(this.data, ["x", "x_ex", "y", "y_ex"])) return;

		let image = Canvas.editingLayouts["Images"].find(e=>e.name == this.data.image);
		if(image) image = image.image;

		let adds = [transformPosition(ox, "px", this.data["x_ex"], "x", image), transformPosition(oy, "py", this.data["y_ex"], "y", image)];

		
		this.fields["x"].set(this.data["x"] = parseFloat(this.data["x"]) + adds[0]);
		this.fields["y"].set(this.data["y"] = parseFloat(this.data["y"]) + adds[1]);
	}
}

class GridColor extends EditingGroup{
	static PromptName = "Tile Color";
	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({deletable: true, compressable: true, clonable: true});
		this.renderBtns = [];

		GUI.createElementP("div", {className:"exit-field"}, (buttonsContainer)=>{
			buttonsContainer.append("Preview");
			for(let i = 0; i < 2; i++){
				GUI.createElementP("button", {className:"colorPreview"}, (btn)=>{
					this.renderBtns.push(btn);
					
					btn.style.backgroundColor = this.data.color;
					btn.style.borderColor = this.data.outlineColor;

					btn.addEventListener("click", ()=>{
						Canvas.sellectedTileType = this.lid;
					})
				},buttonsContainer);
			}
		}, this.container);


		this.fields["color"] = new GUIColorEditField({title: "color", value:this.data.color, onChange:(v,e)=>this.onChange(v,e, "color")});
		this.fields["outlineColor"] = new GUIColorEditField({title: "background", value:this.data.outlineColor, onChange:(v,e)=>this.onChange(v,e, "outlineColor")});
		this.fields["color visible"] = new GUICheckboxEditField({title: "show color", value:this.data.colorVisible, onChange:(v,e)=>this.onChange(v,e, "colorVisible")});
		this.fields["bcolor visible"] = new GUICheckboxEditField({title: "show bg color", value:this.data.bcolorVisible, onChange:(v,e)=>this.onChange(v,e, "bcolorVisible")});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		if(e) this.data[key+"_ex"] = e;

		if(key == "color") this.renderBtns.forEach(e=>e.style.backgroundColor = v);
		else if(key == "outlineColor") this.renderBtns.forEach(e=>e.style.borderColor = v);
		Canvas.render();
	}

	remove(){
		if(this.lid == 0){
			GUI.prompt({message: "You can't delete this element.", cancel:true}).catch(()=>{});
			return;
		}
		super.remove();
	}

	initPack(){
		return [
			...super.initPack(),
			["color", "c", "#bb0000"],
			["outlineColor", "oc", "#880000"],
			["colorVisible", "cv", true],
			["bcolorVisible", "bcv", true],
		]
	}

	import(data){
		super.import(data);

		this.data.hslColor = hexToHSL(this.data.color);
		this.data.hslOutlineColor = hexToHSL(this.data.outlineColor);
	}
}

class TextGroup extends EditingGroup{
	static PromptName = "Text";

	textRenderer = null;
	parsedText = null;
	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: true, clonable: true, movable:true});

		this.parsedText = parseText(this.data.text);

		this.fields["font"] = new GUIStringEditField({title: "font", value:this.data.font, onChange:(v,e)=>this.onChange(v,e, "font")});
		this.fields["text"] = new GUIStringEditField({title: "text", value:this.data.text, onChange:(v,e)=>this.onChange(v,e, "text"), tag: "textarea"});
		this.fields["color"] = new GUIColorEditField({title: "color", value:this.data.color, onChange:(v,e)=>this.onChange(v,e, "color")});
		this.fields["colorAlpha"] = new GUISliderEditField({title: "background", value:this.data.colorAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "colorAlpha")});
		this.fields["outline"] = new GUIColorEditField({title: "outline", value:this.data.outline, onChange:(v,e)=>this.onChange(v,e, "outline")});
		this.fields["outlineAlpha"] = new GUISliderEditField({title: "outline alpha", value:this.data.outlineAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "outlineAlpha")});
		this.fields["shadow"] = new GUIColorEditField({title: "shadow", value:this.data.shadow, onChange:(v,e)=>this.onChange(v,e, "shadow")});
		this.fields["shadowAlpha"] = new GUISliderEditField({title: "shadow alpha", value:this.data.shadowAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "shadowAlpha")});
		this.fields["x"] = new GUINumberEditField({title: "x", value:this.data.x, onChange:(v,e)=>this.onChange(parseFloat(v), e, "x"), extraData: this.data.x_ex, extension: ["px", "tl", "%"]});
		this.fields["y"] = new GUINumberEditField({title: "y", value:this.data.y, onChange:(v,e)=>this.onChange(parseFloat(v), e, "y"), extraData: this.data.y_ex, extension: ["px", "tl", "%"]});
		this.fields["size"] = new GUINumberEditField({title: "size", value:this.data.size, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "size")});
		this.fields["outlineSize"] = new GUINumberEditField({title: "outline size", value:this.data.outlineSize, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "outlineSize")});
		this.fields["shadowSize"] = new GUINumberEditField({title: "shadow size", value:this.data.shadowSize, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "shadowSize")});
		this.fields["lineHeight"] = new GUINumberEditField({title: "line height", value:this.data.lineHeight, onChange:(v,e)=>this.onChange(parseFloat(v),e, "lineHeight")});
		this.fields["bold"] = new GUICheckboxEditField({title: "bold", value:this.data.bold, onChange:(v,e)=>this.onChange(v,e, "bold")});
		this.fields["italic"] = new GUICheckboxEditField({title: "italic", value:this.data.italic, onChange:(v,e)=>this.onChange(v,e, "italic")});
		this.fields["textAlign"] = new GUIDropDownEditField({title: "text align", value:this.data.textAlign, options: ["center", "left", "right"], onChange:(v,e)=>this.onChange(v,e, "textAlign")});
		this.fields["textBaseline"] = new GUIDropDownEditField({title: "text baseline", value:this.data.textBaseline, options: ["alphabetic", "top", "hanging", "middle", "ideographic", "bottom"], onChange:(v,e)=>this.onChange(v,e, "textBaseline")});
		
		this.fields["text"].element.addEventListener("contextmenu", (e)=>{
			e.preventDefault();			
			ContextMenu.create(e, ContextMenu.DEFAULT_TEXT());
		});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		if(key == "font"){
			cssm.remove(this.data.font)
			cssm.add(new cssm.el(v, cssm.consts.font.format(v.replace(' ', '+'))))
		}

		this.data[key] = v;
		if(e){
			if(key == "x" || key == "y"){
				this.fields[key].set(this.data[key] = transformPosition(this.data[key], this.data[key+"_ex"], e, key));
			}
			this.data[key+"_ex"] = e;
		}

		if(key == "text") this.parsedText = parseText(this.data.text);

		this.textRenderer = new TextRenderer();
		this.textRenderer.setText(this.parsedText, this);

		Canvas.render();
	}

	draw(ctx, ox, oy){
		if(!this.data.render) return;

		if(!this.textRenderer){
			this.parsedText = parseText(this.data.text)
			this.textRenderer = new TextRenderer();
			this.textRenderer.setText(this.parsedText, this);
		}
		let renderPos = parsePosition(this.data.x, this.data.x_ex, this.data.y, this.data.y_ex);
		this.textRenderer.render(ctx, ox + renderPos[0], oy + renderPos[1], this);
		this.restore(ctx);
	}

	remove(){
		super.remove();
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx
	 */
	applyBase(ctx){
		ctx.lineJoin = "round";
		
		ctx.fillStyle = this.data.color + getAlpha(this.data.colorAlpha);
		ctx.strokeStyle = this.data.outline + getAlpha(this.data.outlineAlpha);
		ctx.shadowColor = this.data.shadow + getAlpha(this.data.shadowAlpha);
		ctx.textAlign2 = this.data.textAlign;
		ctx.textBaseline = this.data.textBaseline;
		ctx.lineWidth = this.data.outlineSize;
		ctx.shadowBlur = this.data.shadowSize;

		let font = ctx.fontBuilder = new FontBuilder(ctx);
		font.font = this.data.font;
		font.fontSize = this.data.size;
		font.bold = this.data.bold;
		font.italic = this.data.italic;
	}

	restore(ctx){
		ctx.fillStyle = "#000000";
		ctx.strokeStyle = "#000000";
		ctx.shadowColor = "#000000";
		ctx.textAlign2 = "center";
		ctx.textBaseline = "alphabetic";
		ctx.lineWidth = 1;
		ctx.shadowBlur = 0;
	}

	initPack(){
		return [
			...super.initPack(),
			["font", "f", ""],
			["text", "t", "Text..."],
			["color", "c", "#aaaaaa"],
			["colorAlpha", "ca", 255],
			["outline", "oc", "#777777"],
			["outlineAlpha", "oca", 255],
			["shadow", "sc", "#000000"],
			["shadowAlpha", "sca", 255],
			["x", "x", 270],
			["y", "y", 200],
			["x_ex", "x_ex", "px"],
			["y_ex", "y_ex", "px"],
			["size", "s", 20],
			["outlineSize", "os", 2],
			["shadowSize", "ss", 0],
			["lineHeight", "lh", 20],
			["bold", "b", false],
			["italic", "i", false],
			["textAlign", "ta", "center"],
			["textBaseline", "tb", "alphabetic"],
		]
	}
}

class CircleGroup extends EditingGroup{
	static PromptName = "Circle";

	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: true, clonable: true, movable:true});

		this.fields["overText"] = new GUICheckboxEditField({title: "over text", value:this.data.overText, onChange:(v,e)=>this.onChange(v,e, "overText")});
		this.fields["color"] = new GUIColorEditField({title: "color", value:this.data.color, onChange:(v,e)=>this.onChange(v,e, "color")});
		this.fields["colorAlpha"] = new GUISliderEditField({title: "background", value:this.data.colorAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "colorAlpha")});
		this.fields["outline"] = new GUIColorEditField({title: "outline", value:this.data.outline, onChange:(v,e)=>this.onChange(v,e, "outline")});
		this.fields["outlineAlpha"] = new GUISliderEditField({title: "outline alpha", value:this.data.outlineAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "outlineAlpha")});
		this.fields["shadow"] = new GUIColorEditField({title: "shadow", value:this.data.shadow, onChange:(v,e)=>this.onChange(v,e, "shadow")});
		this.fields["shadowAlpha"] = new GUISliderEditField({title: "shadow alpha", value:this.data.shadowAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "shadowAlpha")});
		this.fields["x"] = new GUINumberEditField({title: "x", value:this.data.x, onChange:(v,e)=>this.onChange(parseFloat(v), e, "x"), extraData: this.data.x_ex, extension: ["px", "tl", "%"]});
		this.fields["y"] = new GUINumberEditField({title: "y", value:this.data.y, onChange:(v,e)=>this.onChange(parseFloat(v), e, "y"), extraData: this.data.y_ex, extension: ["px", "tl", "%"]});
		this.fields["radius"] = new GUINumberEditField({title: "radius", value:this.data.radius, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "radius")});
		this.fields["outerRadius"] = new GUINumberEditField({title: "outer radius", value:this.data.outerRadius, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "outerRadius")});
		this.fields["shadowSize1"] = new GUINumberEditField({title: "shadow size i.", value:this.data.shadowSize1, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "shadowSize1")});
		this.fields["shadowSize2"] = new GUINumberEditField({title: "shadow size o.", value:this.data.shadowSize2, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "shadowSize2")});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		if(e && this.data[key+"_ex"] != e){
			if(key == "x" || key == "y"){
				this.fields[key].set(this.data[key] = transformPosition(this.data[key], this.data[key+"_ex"], e, key));
			}
			this.data[key+"_ex"] = e;
		}

		Canvas.render();
	}

	draw(ctx, ox, oy, extras){
		if(!this.data.render) return;
		if((extras == 1 && !this.data.overText) || (extras == 0 && this.data.overText)) return;
		
		this.applyBase(ctx);
		
		let renderPos = parsePosition(this.data.x, this.data.x_ex, this.data.y, this.data.y_ex);

		if(this.data.outerRadius > 0){
			ctx.beginPath();
			ctx.arc(ox + renderPos[0], oy + renderPos[1], (+(this.data.radius)+ +(this.data.outerRadius)/2-1), 0, Math.PI*2);
			ctx.shadowBlur = this.data.shadowSize2;
			ctx.stroke();
			ctx.closePath();
		}
		
		ctx.shadowBlur = this.data.shadowSize1;
		
		ctx.beginPath();
		ctx.arc(ox + renderPos[0], oy + renderPos[1], this.data.radius, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();

		this.restore(ctx);
	}

	remove(){
		super.remove();
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx
	 */
	applyBase(ctx){
		ctx.fillStyle = this.data.color + getAlpha(this.data.colorAlpha);
		ctx.strokeStyle = this.data.outline + getAlpha(this.data.outlineAlpha);
		ctx.shadowColor = this.data.shadow + getAlpha(this.data.shadowAlpha);
		ctx.lineWidth = this.data.outerRadius;
		ctx.shadowBlur = this.data.shadowSize2;
	}

	restore(ctx){
		ctx.fillStyle = "#000000";
		ctx.strokeStyle = "#000000";
		ctx.shadowColor = "#000000";
		ctx.lineWidth = 1;
		ctx.shadowBlur = 0;
	}

	initPack(){
		return [
			...super.initPack(),
			["overText", "ot", false],
			["color", "c", "#aaaaaa"],
			["colorAlpha", "ca", 255],
			["outline", "oc", "#777777"],
			["outlineAlpha", "oca", 255],
			["shadow", "sc", "#000000"],
			["shadowAlpha", "sca", 255],
			["x", "x", 270],
			["y", "y", 200],
			["x_ex", "x_ex", "px"],
			["y_ex", "y_ex", "px"],
			["radius", "r", 20],
			["outerRadius", "or", 2],
			["shadowSize1", "ss1", 0],
			["shadowSize2", "ss2", 0],
		]
	}
}

class RectGroup extends EditingGroup{
	static PromptName = "Rectangle";

	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: true, clonable: true, movable:true});

		this.fields["overText"] = new GUICheckboxEditField({title: "over text", value:this.data.overText, onChange:(v,e)=>this.onChange(v,e, "overText")});
		this.fields["color"] = new GUIColorEditField({title: "color", value:this.data.color, onChange:(v,e)=>this.onChange(v,e, "color")});
		this.fields["colorAlpha"] = new GUISliderEditField({title: "color alpha", value:this.data.colorAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "colorAlpha")});
		this.fields["outline"] = new GUIColorEditField({title: "outline", value:this.data.outline, onChange:(v,e)=>this.onChange(v,e, "outline")});
		this.fields["outlineAlpha"] = new GUISliderEditField({title: "outline alpha", value:this.data.outlineAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "outlineAlpha")});
		this.fields["shadow"] = new GUIColorEditField({title: "shadow", value:this.data.shadow, onChange:(v,e)=>this.onChange(v,e, "shadow")});
		this.fields["shadowAlpha"] = new GUISliderEditField({title: "shadow alpha", value:this.data.shadowAlpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "shadowAlpha")});
		this.fields["x"] = new GUINumberEditField({title: "x", value:this.data.x, onChange:(v,e)=>this.onChange(parseFloat(v), e, "x"), extraData: this.data.x_ex, extension: ["px", "tl", "%"]});
		this.fields["y"] = new GUINumberEditField({title: "y", value:this.data.y, onChange:(v,e)=>this.onChange(parseFloat(v), e, "y"), extraData: this.data.y_ex, extension: ["px", "tl", "%"]});
		this.fields["width"] = new GUINumberEditField({title: "width", value:this.data.width, onChange:(v,e)=>this.onChange(parseFloat(v), e, "width"), extraData: this.data.width_ex, extension: ["px", "tl", "%"]});
		this.fields["height"] = new GUINumberEditField({title: "height", value:this.data.height, onChange:(v,e)=>this.onChange(parseFloat(v), e, "height"), extraData: this.data.height_ex, extension: ["px", "tl", "%"]});
		this.fields["angle"] = new GUINumberEditField({title: "angle", value:this.data.angle, onChange:(v,e)=>this.onChange(parseFloat(v), e, "angle")});
		this.fields["outerRadius"] = new GUINumberEditField({title: "outer radius", value:this.data.outerRadius, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "outerRadius")});
		this.fields["outerEdges"] = new GUIDropDownEditField({title: "outer edges", value:this.data.outerEdges, options: ["round", "miter"], onChange:(v,e)=>this.onChange(v,e, "outerEdges")});
		this.fields["shadowSize1"] = new GUINumberEditField({title: "shadow size i.", value:this.data.shadowSize1, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "shadowSize1")});
		this.fields["shadowSize2"] = new GUINumberEditField({title: "shadow size o.", value:this.data.shadowSize2, min: 0, onChange:(v,e)=>this.onChange(parseFloat(v),e, "shadowSize2")});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		if(e && this.data[key+"_ex"] != e){
			if(key == "x" || key == "y" || key == "width" || key == "height"){
				this.fields[key].set(this.data[key] = transformPosition(this.data[key], this.data[key+"_ex"], e, key));
			}
			this.data[key+"_ex"] = e;
		}

		Canvas.render();
	}

	draw(ctx, ox, oy, extras){
		if(!this.data.render) return;
		if((extras == 1 && !this.data.overText) || (extras == 0 && this.data.overText)) return;
		
		this.applyBase(ctx);
		
		let renderPos = parsePosition(this.data.x, this.data.x_ex, this.data.y, this.data.y_ex);
		let renderSize = parsePosition(this.data.width, this.data.width_ex, this.data.height, this.data.height_ex);

		let x = (ox + renderPos[0]) - +renderSize[0]/2,
			y = (oy + renderPos[1]) - +renderSize[1]/2,
			w = +renderSize[0],
			h = +renderSize[1],
			angle = this.data.angle / 180 * Math.PI;
		ctx.translate(x+w/2, y+h/2)
		ctx.rotate(angle);
		
		if(this.data.outerRadius > 0){
			ctx.beginPath();
			ctx.rect(-w/2 - this.data.outerRadius/2, -h/2 - this.data.outerRadius/2, w + this.data.outerRadius, h + this.data.outerRadius);
			ctx.lineWidth = this.data.outerRadius;
			ctx.lineJoin = this.data.outerEdges;
			ctx.shadowBlur = this.data.shadowSize2;
			ctx.stroke();
			ctx.closePath();
		}
		ctx.beginPath();
		ctx.rect(-w/2, -h/2, w, h);
		ctx.shadowBlur = this.data.shadowSize1;

		ctx.fill();
		ctx.closePath();

		ctx.rotate(-angle);
		ctx.translate(-x-w/2, -y-h/2);

		this.restore(ctx);
	}

	remove(){
		super.remove();
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx
	 */
	applyBase(ctx){
		ctx.fillStyle = this.data.color + getAlpha(this.data.colorAlpha);
		ctx.strokeStyle = this.data.outline + getAlpha(this.data.outlineAlpha);
		ctx.shadowColor = this.data.shadow + getAlpha(this.data.shadowAlpha);
		ctx.lineWidth = this.data.outerRadius;
		ctx.shadowBlur = this.data.shadowSize2;
	}

	restore(ctx){
		ctx.fillStyle = "#000000";
		ctx.strokeStyle = "#000000";
		ctx.shadowColor = "#000000";
		ctx.lineWidth = 1;
		ctx.shadowBlur = 0;
	}

	initPack(){
		return [
			...super.initPack(),
			["overText", "ot", false],
			["color", "c", "#aaaaaa"],
			["colorAlpha", "ca", 255],
			["outline", "oc", "#777777"],
			["outlineAlpha", "oca", 255],
			["shadow", "sc", "#000000"],
			["shadowAlpha", "sca", 255],
			["x", "x", 270],
			["y", "y", 200],
			["x_ex", "x_ex", "px"],
			["y_ex", "y_ex", "px"],
			["angle", "a", 0],
			["width", "wi", 20],
			["height", "he", 20],
			["width_ex", "wi_ex", "px"],
			["height_ex", "he_ex", "px"],
			["outerRadius", "or", 2],
			["outerEdges", "oe", "round"],
			["shadowSize1", "ss1", 0],
			["shadowSize2", "ss2", 0],
		]
	}
}


class ImageGroup extends EditingGroup{
	static PromptName = "Image";

	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: true, clonable: true, movable:true});

		this.fields["overText"] = new GUICheckboxEditField({title: "over text", value:this.data.overText, onChange:(v,e)=>this.onChange(v,e, "overText")});
		this.fields["image"] = new GUIStringEditField({title: "image", value:this.data.image, onChange:(v,e)=>this.onChange(v,e, "image")});
		this.fields["filter"] = new GUIStringEditField({title: "filter", value:this.data.filter, onChange:(v,e)=>this.onChange(v,e, "filter")})
		.setDescription("hue-rotate(100deg)\nbrightness(0.5)\ncontrast(0.5)\ndrop-shadow(0px 0px 10px white)\ngrayscale(0.5)\ninvert(1)\nsaturate(1.5)\nsepia(1)");
		this.fields["alpha"] = new GUISliderEditField({title: "Alpha", value:this.data.alpha, min: 0, max: 255, step: 1, onChange:(v,e)=>this.onChange(v,e, "alpha")});
		this.fields["x"] = new GUINumberEditField({title: "x", value:this.data.x, onChange:(v,e)=>this.onChange(parseFloat(v), e, "x"), extraData: this.data.x_ex, extension: ["px", "tl", "%"]});
		this.fields["y"] = new GUINumberEditField({title: "y", value:this.data.y, onChange:(v,e)=>this.onChange(parseFloat(v), e, "y"), extraData: this.data.y_ex, extension: ["px", "tl", "%"]});
		this.fields["width"] = new GUINumberEditField({title: "width", value:this.data.width, onChange:(v,e)=>this.onChange(parseFloat(v), e, "width"), extraData: this.data.width_ex, extension: ["px", "tl", "%", "i%"]});
		this.fields["height"] = new GUINumberEditField({title: "height", value:this.data.height, onChange:(v,e)=>this.onChange(parseFloat(v), e, "height"), extraData: this.data.height_ex, extension: ["px", "tl", "%", "i%"]});
		this.fields["angle"] = new GUINumberEditField({title: "angle", value:this.data.angle, onChange:(v,e)=>this.onChange(parseFloat(v), e, "angle")});
		this.fields["flip"] = new GUICheckboxEditField({title: "flip", value:this.data.flip, onChange:(v,e)=>this.onChange(v,e, "flip")});
		this.fields["flop"] = new GUICheckboxEditField({title: "flop", value:this.data.flop, onChange:(v,e)=>this.onChange(v,e, "flop")});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		if(e && this.data[key+"_ex"] != e){
			if(key == "x" || key == "y" || key == "width" || key == "height"){
				let image = Canvas.editingLayouts["Images"].find(e=>e.name == this.data.image);
				if(image) image = image.image;
				this.fields[key].set(this.data[key] = transformPosition(this.data[key], this.data[key+"_ex"], e, key, image));
			}
			this.data[key+"_ex"] = e;
		}

		Canvas.render();
	}

	draw(ctx, ox, oy, extras){
		if(!this.data.render) return;
		if((extras == 1 && !this.data.overText) || (extras == 0 && this.data.overText)) return;
		
		this.applyBase(ctx);
		
		let image = Canvas.editingLayouts["Images"].find(e=>e.name == this.data.image);
		if(image) image = image.image;
		
		let renderPos = parsePosition(this.data.x, this.data.x_ex, this.data.y, this.data.y_ex);
		let renderSize = parsePosition(this.data.width, this.data.width_ex, this.data.height, this.data.height_ex, image);

		let x = (ox + renderPos[0]) - +renderSize[0]/2,
			y = (oy + renderPos[1]) - +renderSize[1]/2,
			w = +renderSize[0],
			h = +renderSize[1],
			angle = this.data.angle / 180 * Math.PI;
		ctx.translate(x+w/2, y+h/2)
		ctx.rotate(angle);
		ctx.scale(this.data.flip ? -1:1, this.data.flop ? -1:1);

		ctx.beginPath();
		if(image){
			try{
				ctx.drawImage(image, -w/2, -h/2, w, h);
			}catch{}
		}


		ctx.fill();
		ctx.closePath();

		ctx.scale(this.data.flip ? -1:1, this.data.flop ? -1:1);
		ctx.rotate(-angle);
		ctx.translate(-x-w/2, -y-h/2);

		this.restore(ctx);
	}

	remove(){
		super.remove();
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	applyBase(ctx){
		ctx.shadowBlur = 0;
		ctx.globalAlpha = this.data.alpha/255;
		ctx.filter = this.data.filter;
	}

	restore(ctx){
		ctx.lineWidth = 1;
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
		ctx.filter = "none";
	}

	initPack(){
		return [
			...super.initPack(),
			["overText", "ot", false],
			["image", "i", ""],
			["filter", "fi", ""],
			["alpha", "al", 255],
			["x", "x", 270],
			["y", "y", 200],
			["x_ex", "x_ex", "px"],
			["y_ex", "y_ex", "px"],
			["angle", "a", 0],
			["width", "wi", 100],
			["height", "he", 100],
			["width_ex", "wi_ex", "i%"],
			["height_ex", "he_ex", "i%"],
			["flip", "fli", false],
			["flop", "flo", false],
		]
	}
}

class HeroCircleGroup extends EditingGroup{
	static PromptName = "Hero circle";

	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: true, clonable: true, movable:true});

		this.fields["hero"] = new GUIDropDownEditField({title: "hero", value:this.data.hero, options: Object.keys(prefabs.heroCircles), onChange:(v,e)=>this.onChange(v,e, "hero")});

		this.fields["overText"] = new GUICheckboxEditField({title: "over text", value:this.data.overText, onChange:(v,e)=>this.onChange(v,e, "overText")});
		this.fields["x"] = new GUINumberEditField({title: "x", value:this.data.x, onChange:(v,e)=>this.onChange(parseFloat(v), e, "x"), extraData: this.data.x_ex, extension: ["px", "tl", "%"]});
		this.fields["y"] = new GUINumberEditField({title: "y", value:this.data.y, onChange:(v,e)=>this.onChange(parseFloat(v), e, "y"), extraData: this.data.y_ex, extension: ["px", "tl", "%"]});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		if(e && this.data[key+"_ex"] != e){
			if(key == "x" || key == "y"){
				this.fields[key].set(this.data[key] = transformPosition(this.data[key], this.data[key+"_ex"], e, key));
			}
			this.data[key+"_ex"] = e;
		}
		if(key == "hero"){
			this.import(prefabs.heroCircles[v], true);
		}

		Canvas.render();
	}

	draw(ctx, ox, oy, extras){
		if(!this.data.render) return;
		if((extras == 1 && !this.data.overText) || (extras == 0 && this.data.overText)) return;
		
		this.applyBase(ctx);
		
		let renderPos = parsePosition(this.data.x, this.data.x_ex, this.data.y, this.data.y_ex);

		if(this.data.outerRadius > 0){
			ctx.beginPath();
			ctx.arc(ox + renderPos[0], oy + renderPos[1], (+(this.data.radius)+ +(this.data.outerRadius)/2-1), 0, Math.PI*2);
			ctx.stroke();
			ctx.closePath();
		}
				
		ctx.beginPath();
		ctx.arc(ox + renderPos[0], oy + renderPos[1], this.data.radius, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();

		ctx.textBaseline = "middle";
		ctx.textAlign = "center";

		ctx.beginPath();

		ctx.fillStyle = this.data.tcolor;
		ctx.strokeStyle = this.data.toutline;
		ctx.lineWidth = this.data.toutlineWidth;

		ctx.strokeText(this.data.text, ox + renderPos[0] + this.data.offsetx, oy + renderPos[1] + this.data.offsety);
		ctx.fillText(this.data.text, ox + renderPos[0] + this.data.offsetx, oy + renderPos[1] + this.data.offsety);

		ctx.closePath();

		this.restore(ctx);
	}

	remove(){
		super.remove();
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx
	 */
	applyBase(ctx){
		ctx.fillStyle = this.data.color;
		ctx.strokeStyle = this.data.outline;
		ctx.lineWidth = this.data.outerRadius;

		let font = ctx.fontBuilder = new FontBuilder(ctx);
		font.font = "Comic Sans MS";
		font.fontSize = this.data.tfontSize;
		font.bold = false;
		font.italic = false;
	}

	restore(ctx){
		ctx.fillStyle = "#000000";
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
	}

	initPack(){
		return [
			...super.initPack(),
			["overText", "ot", false],
			["text", "t", ""],
			["tcolor", "tc", "#aaaaaa"],
			["toutline", "toc", "#777777"],
			["tfontSize", "tfs", 21],
			["toutlineWidth", "tow", 4],

			["color", "c", "#aaaaaa"],
			["outline", "oc", "#777777"],
			["x", "x", 270],
			["y", "y", 200],
			["x_ex", "x_ex", "px"],
			["y_ex", "y_ex", "px"],

			["radius", "ra", 20],
			["outerRadius", "ora", 2],
			
			["offsetx", "ofx", 0],
			["offsety", "ofy", 0],
			
		]
	}
}

const imagem = new(class Imagem{
	getImg(file, cb, img = null){//e.target.files[0]
		if(typeof file != "string") file = URL.createObjectURL(file);
		let image = img || new Image();
		image.onload = ()=>{
			cb(this.imageUrl(image), image);
		}
		image.src = file;

		image.onerror = ()=>{
			cb("", null);
		}
	}

	imageUrl(img){

		let saveCanvas = document.createElement("canvas");
		saveCanvas.width = img.width;
		saveCanvas.height = img.height;
		let tCtx = saveCanvas.getContext("2d");
		tCtx.drawImage(img,0,0);
		return saveCanvas.toDataURL("image/png");
	}
})()

class ImageFileGroup extends EditingGroup{
	static PromptName = "Image";

	constructor(data){
		super(data);
		this.image = new Image();
		this.image.onload = ()=>{
			Canvas.render();
			this.image.onload = null;
		}
		this.setImage();
		this.render();
	}

	setImage(){
		this.image.src = this.data.url;
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: false, clonable: true, movable:false});

		this.fields["name"] = new GUIStringEditField({title: "name", value:this.data.name, onChange:(v,e)=>this.onChange(v,e, "name")});
		this.fields["file"] = new GUIFileEditField({title: "file", onChange:(v,e)=>this.onChange(v,e, "file")});
		
		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		
		if(key == "file"){
			imagem.getImg(v, (url)=>{
				this.data.url = url;
				//this.setImage();
				Canvas.render();
			}, this.image)
		}

		Canvas.render();
	}

	remove(){
		super.remove();
	}

	initPack(){
		return [
			...super.initPack(),
			["name", "n", ""],
			["url", "u", ""],
		]
	}
}

class ImageFileBuiltGroup extends EditingGroup{
	static PromptName = "Builtin image";

	constructor(data){
		super(data);
		this.image = new Image();
		this.image.onload = ()=>{
			Canvas.render();
		}
		this.setImage();
		this.render();
	}

	setImage(){
		this.image.src = `../images/${this.data.url}.png`;
	}

	render(){
		super.render({deletable: true, compressable: true, drawable: false, clonable: true, movable:false});

		this.fields["name"] = new GUIStringEditField({title: "name", value:this.data.name, onChange:(v,e)=>this.onChange(v,e, "name")});
		this.fields["url"] = new GUIDropDownEditField({title: "file", value:this.data.url, options: localResources.images, onChange:(v,e)=>this.onChange(v,e, "url")});

		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e, key);

		this.data[key] = v;
		
		if(key == "url"){
			this.setImage()
		}

		Canvas.render();
	}

	remove(){
		super.remove();
	}

	initPack(){
		return [
			...super.initPack(),
			["name", "n", ""],
			["url", "u", ""],
		]
	}
}

class FileManagement extends EditingGroup{
	static PromptName = "File manage data";
	constructor(data){
		super(data);
		this.render();
	}

	render(){
		super.render({compressable: true});
		this.fields["fileName"] = new GUIStringEditField({title: "file name", value:this.data.fileName, onChange:(v,e)=>this.onChange(v,e, "fileName")});
		this.fields["rows"] = new GUINumberEditField({title: "rows", value:this.data.rows, onChange:(v,e)=>this.onChange(parseFloat(v),e, "rows"), min:0, max:1000});
		this.fields["cols"] = new GUINumberEditField({title: "cols", value:this.data.cols, onChange:(v,e)=>this.onChange(parseFloat(v),e, "cols"), min:0, max:1000});
		this.fields["outlineSize"] = new GUINumberEditField({title: "outline size", value:this.data.outlineSize, onChange:(v,e)=>this.onChange(parseFloat(v),e, "outlineSize"), min:0});
		this.fields["width"] = new GUINumberEditField({title: "width", value:this.data.width, onChange:(v,e)=>this.onChange(parseFloat(v),e, "width"), min:0});
		this.fields["height"] = new GUINumberEditField({title: "height", value:this.data.height, onChange:(v,e)=>this.onChange(parseFloat(v),e, "height"), min:0});
		
		Object.values(this.fields).forEach(e=>this.container.appendChild(e.element));
	}

	onChange(v, e, key){
		super.onChange(v, e);

		this.data[key] = v;
		if(e) this.data[key+"_ex"] = e;

		let d = this.data;
		Canvas.grid.resize(d.cols, d.rows, d.outlineSize, d.width, d.height);
		Canvas.render();
	}

	remove(){
		super.remove();
	}

	initPack(){
		return [
			...super.initPack(),
			["fileName", "fn", `tile-${Date.now()}`],
			/*["cols", "wc", 12],
			["rows", "hc", 9],
			["outlineSize", "os", 2],
			["width", "w", 46],
			["height", "h", 46],*/
		]
	}

	import(data){
		data = data || {};
		data.grid = data.grid || {};
		data.grid.grid = data.grid.grid || [];
		super.import(data);

		//this.data.fileName = data.fn || `tile-${Date.now()}`;
		this.data.cols = ("wc" in data.grid) ? data.grid.wc : 12;
		this.data.rows = ("hc" in data.grid) ? data.grid.hc : 9;
		this.data.outlineSize = ("os" in data.grid) ? data.grid.os : 2;
		this.data.width = ("w" in data.grid) ? data.grid.w : 46;
		this.data.height = ("h" in data.grid) ? data.grid.h : 46;

		Canvas.grid.load({
			grid: data.grid.grid,
			wc: this.data.cols,
			hc: this.data.rows,
			os: this.data.outlineSize,
			w: this.data.width,
			h: this.data.height
		});
	}

	export(){
		return {
			...super.export(false),
			fn: this.data.fileName,
			grid: Canvas.grid.export()
		}
	}
}