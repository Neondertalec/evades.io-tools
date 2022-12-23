class GUIEditField{
	/** @type {number} */
	value = null;
	/** @type {string} */
	title = null;
	/** @type {HTMLElement} */
	element = null;
	/** @type {HTMLInputElement} */
	field = null;
	/** @type {any} */
	extraData = null;
	onChange = ()=>{};

	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void}} param0 
	 */
	constructor({title = "", value = null, validity = null, onChange = null}){
		this.title = title;
		this.value = value;
		if(validity) this.validity = validity;
		if(onChange) this.onChange = onChange;
	}

	setDescription(desc){
		this.field.title = desc;
		return this;
	}

	validity(value){return true;}
	normalize(value, final){return value;}

	/**
	 * on code set
	 * @param {string} value 
	 */
	set(value){
		const isCheckbox = this.field.type == "checkbox";
		if(isCheckbox){
			this.field.checked = value;
		}else
		if(this.validity(value)){
			this.value = value;
			this.update();
		}
	}

	/**
	 * on element change
	 */
	change(final){
		const isCheckbox = this.field.type == "checkbox";
		if(isCheckbox || this.validity(this.field.value)){
			this.value = isCheckbox ? this.field.checked : this.normalize(this.field.value, final);
			
			if(this.value != this.field.value) this.field.value = this.value;
			
			this.onChange(this.normalize(this.value, true), this.extraData);
		}
	}

	update(){
		if(this.field.type == "checkbox"){
			this.field.checked = this.value == true;
		}else{
			this.field.value = this.value;
		}
	}
}

class GUIStringEditField extends GUIEditField{
	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void, tag:string}} d 
	 */
	 constructor({title = "", value = null, validity = null, onChange = null, tag = "input"}){
		super(arguments[0] || {});

		this.element = GUI.createElementP("div", {className: "exit-field"}, (element)=>{
			GUI.createElementP("span", {innerText: this.title}, null, element);
			this.field = GUI.createElementP(tag, {value: this.value, ...(tag != "textarea" ? {type:"text"} : {})}, null, element);
			this.field.addEventListener("input", ()=>this.change(false));
			this.field.addEventListener("change", ()=>this.change(true));
		});

		this.field.editField = this;

		this.set(this.value);
	}
}

class GUIColorEditField extends GUIStringEditField{
	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void}} d 
	 */
	 constructor({title =  "", value = null, validity = null, onChange = null}){
		super(arguments[0] || {});
		this.field.type = "color";
	}
}

class GUICheckboxEditField extends GUIStringEditField{
	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void}} d 
	 */
	 constructor({title = "", value = null, validity = null, onChange = null}){
		super(arguments[0] || {});
		this.field.type = "checkbox";
		this.set(this.value);
	}
}

class GUIFileEditField{
	/** @type {number} */
	value = null;
	/** @type {string} */
	title = null;
	/** @type {HTMLElement} */
	element = null;
	/** @type {HTMLInputElement} */
	field = null;
	/** @type {any} */
	onChange = ()=>{};

	/**
	 * 
	 * @param {{title: string, onChange(string)=>void}} param0 
	 */
	constructor({title = "", onChange = null}){
		this.title = title;
		if(onChange) this.onChange = onChange;

		this.element = GUI.createElementP("div", {className: "exit-field"}, (element)=>{
			GUI.createElementP("span", {innerText: this.title}, null, element);
			this.field = GUI.createElementP("input", {value: this.value, type:"file"}, null, element);
			this.field.addEventListener("change", ()=>this.change());
		});

		this.field.editField = this;
	}

	setDescription(desc){
		this.field.title = desc;
		return this;
	}


	/**
	 * on element change
	 */
	change(){
		this.onChange(this.field.files[0]);
	}
}

class GUINumberEditField extends GUIStringEditField{
	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void, min: number, max: number, extraData: string, extension: [string]}} d 
	 */
	 constructor({title = "", value = null, validity = null, onChange = null, min = null, max = null, extraData = null, extension=null}){
		super(arguments[0] || {});
		this.extraData = extraData;
		this.field.type = "number";
		this.normalize = (v, f)=>{
			if(f){
				v = parseFloat(v);
				if(min !== null) v = Math.max(v, min);
				if(max !== null) v = Math.min(v, max);
	
			}
			return v;
		}

		if(extension){
			this.element.classList.add("extended");

			this.dropDown = GUI.createElementP("select", {value: this.value, className:"extension"}, (select)=>{
				for(let i in extension){
					GUI.createElementP("option", {value: extension[i], innerText: extension[i]}, (option)=>{option.selected = extension[i] == this.extraData}, select);
				}
			});

			this.element.insertBefore(this.dropDown, this.field);

			this.dropDown.addEventListener("input", ()=>{this.extraData = this.dropDown.value; this.change(false)});
			this.dropDown.addEventListener("change", ()=>{this.extraData = this.dropDown.value; this.change(true)});
		}
	}
}

class GUISliderEditField extends GUIStringEditField{
	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void, min: number, max: number, step: number}} d
	 */
	 constructor({title = "", value = null, validity = null, onChange = null, min = null, max = null, step = null}){
		super(arguments[0] || {});
		this.field.type = "range";
		this.field.step = step;
		this.field.min = min;
		this.field.max = max;
		this.field.value = value;
	}
}

class GUIDropDownEditField extends GUIEditField{
	/**
	 * 
	 * @param {{title: string, value: string, validity: (string)=>boolean, onChange(string)=>void, options:[string]}} d 
	 */
	constructor({title = "", value = null, validity = null, onChange = null, options = []}){
		super(arguments[0] || {});

		this.element = GUI.createElementP("div", {className: "exit-field"}, (element)=>{
			GUI.createElementP("span", {innerText: this.title}, null, element);

			this.field = GUI.createElementP("select", {value: this.value}, (select)=>{
				for(let i in options){
					GUI.createElementP("option", {value: options[i], innerText: options[i]}, (option)=>{option.selected = options[i] == this.value}, select);
				}
			}, element);
			
			this.field.addEventListener("input", ()=>this.change(false));
			this.field.addEventListener("change", ()=>this.change(true));
		});

		this.field.editField = this;

		this.set(this.value);
	}
}


class GUI{
	static editingLayouts = [];

	/**
	 * @param {string} name
	 * @param {HTMLElement} args 
	 * @param {(cheto:HTMLElement)=>} fnc 
	 * @param {HTMLElement} parent 
	 * @returns {HTMLElement}
	 */
	static createElementP(name, args = null, fnc=null, parent = null){
		const element = document.createElement(name)
		if(parent) parent.appendChild(element);
		if(args != null)Object.assign(element,args);
		if(args && args.style)Object.keys(args.style).forEach(e=>{element.style[e] = args.style[e]});
		if(fnc) fnc(element);
		return element;
	}

	/**
	 * 
	 * @param {{message:string, cancel:boolean}} param0 
	 * @param  {...string|{text:string, tag:string, type:string, validiser:(val)=>boolean}} buttons 
	 * @returns 
	 */
	static prompt({message = "", cancel = false}, ...buttons){
		let resolve,reject;
		var promise = new Promise((res, rej)=>{resolve=res; reject=rej});

		GUI.createElementP("div", {className: "prompt center"}, (popup)=>{
			if(cancel){
				GUI.createElementP("button", {className: "btn-red", innerText: "X", style:{position:"absolute", top:"5px", right:"5px"}}, (btn)=>{
					btn.addEventListener("click", ()=>{
						reject();
						popup.remove();
					});
				}, popup);
			}
			GUI.createElementP("div", {className: "prompt-title", innerText: message, ...(cancel ? {style:{marginTop:"20px"}} : {})}, null, popup);
			GUI.createElementP("div", {className: "prompt-buttons"}, (layout)=>{
				for(let i in buttons){
					let btnData = {text:"", tag:"button", type:"", validiser: (v)=>true};

					if(typeof buttons[i] == "string"){
						btnData.text = buttons[i];
					}else{
						btnData = Object.assign(btnData, buttons[i]);
					}

					GUI.createElementP(btnData.tag, {className: `prompt-${btnData.tag} btn-white`, innerText: btnData.text, type:btnData.type}, (el)=>{
						if(btnData.tag == "button"){
							el.addEventListener("click", ()=>{
								resolve({text: btnData.text, value: el.value});
								popup.remove();
							});
						}else{
							el.addEventListener("change", async ()=>{
								if(await btnData.validiser(el)){
									resolve({text: btnData.text, element: el, value: el.value});
									popup.remove();
								}
							});
						}
					}, layout);
				}			
			}, popup);
		}, document.body);

		return promise;
	}

	static renderTools(){
		GUI.createElementP("div", {className: "tools-lay"}, (toolsLay)=>{
			GUI.createElementP("div", {className: "act-mode-lay"}, (actMode)=>{
				let modes = ["Edit tiles", "Move objects"];
				for(let i = 0; i < modes.length; i++){
					GUI.createElementP("button", {className: "act-mode", innerText: modes[i]}, (btn)=>{
						btn.onclick = ()=>{Canvas.setActMode(btn)};
						btn.actMode = modes[i];
					}, actMode);
				}
			}, toolsLay);
			
			GUI.createElementP("div", {className: "act-mode-lay"}, (actMode)=>{
				GUI.createElementP("button", {className: "act-mode", innerText: "Save image"}, (btn)=>{
					btn.onclick = ()=>{Canvas.saveImage()};
				}, actMode);

				GUI.createElementP("button", {className: "act-mode", innerText: "Save file"}, (btn)=>{
					btn.onclick = ()=>{Canvas.saveFile()};
				}, actMode);
			}, toolsLay);

			Canvas.editingLayouts = {
				"Tiles": new EditingLayout({title:"Tiles", classes: [GridColor]}),
				"Text": new EditingLayout({title:"Texts", classes: [TextGroup]}),
				"Shapes": new EditingLayout({title:"Shapes", classes: [CircleGroup, RectGroup, ImageGroup]}),
				"Images": new EditingLayout({title:"Images", classes: [ImageFileGroup, ImageFileBuiltGroup]}),
				"File": new EditingLayout({title:"File data", classes: [FileManagement], create: false}),
			};

			Canvas.editingLayoutsRender = [
				["Tiles"],
				["Shapes", 0],
				["Text"],
				["Shapes", 1],
			];

			Object.values(Canvas.editingLayouts).forEach(e=>toolsLay.appendChild(e.element));
			
		}, document.body);
	}
}

class Canvas{
	/**@type {Grid} */
	static grid = null;
	static editingLayoutsRender = [];
	static editingLayouts = {};
	static movables = [];
	static actMode = "Edit tiles";

	/**@type {HTMLCanvasElement} */
	static displayCanvas = null;
	/**@type {HTMLCanvasElement} */
	static saveCanvas = null; 

	static init(content = null){
		Canvas.grid
		Canvas.saveCanvas = GUI.createElementP("canvas");
		Canvas.saveCanvas.ctx = Canvas.saveCanvas.getContext("2d");

		Canvas.displayCanvas = GUI.createElementP("canvas", {width: window.innerWidth, height: window.innerHeight}, (canvas)=>{
			canvas.addEventListener("mousedown", (e)=>Canvas.mouseDown(e));
			canvas.addEventListener("mousemove", (e)=>Canvas.mouseMove(e));
			canvas.addEventListener("mouseup", (e)=>Canvas.mouseUp(e));
			canvas.ctx = canvas.getContext("2d");
		}, document.body)
		window.onresize = ()=>{
			Canvas.displayCanvas.width = window.innerWidth;
			Canvas.displayCanvas.height = window.innerHeight;
			Canvas.render(Canvas.displayCanvas);
		}

		GUI.renderTools();
		
		Canvas.grid = new Grid(0,0,0,0,0);

		if(content){
			Canvas.import(content);
			//Canvas.editingLayouts = content.objects;
			//Canvas.grid.load(content.grid);
		}else{
			Canvas.loadDefault();
		}
		window.onresize();
		Canvas.render();

		window.onbeforeunload = function() {
            return "Data will be lost if you leave the page, are you sure?";
        };
	}

	static loadDefault(){
		Canvas.editingLayouts["Tiles"].add(new Canvas.editingLayouts["Tiles"].classes[0]);
		Canvas.editingLayouts["File"].add(new Canvas.editingLayouts["File"].classes[0]);
		//Canvas.grid.resize(12,9,2,46,46);
	}

	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 * @param {number} ox 
	 * @param {number} oy 
	 */
	static render(canvas = null, ox = 10, oy = 10){
		if(!canvas) canvas = Canvas.displayCanvas;
		
		canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);


		Canvas.grid.render(canvas.ctx, ox, oy);
		for(let i in Canvas.editingLayoutsRender){
			let d = Canvas.editingLayoutsRender[i];
			for(let j in Canvas.editingLayouts[d[0]].content){
				Canvas.editingLayouts[d[0]].content[j].draw(canvas.ctx, ox, oy, d[1]);
			}
		}
	}

	static mouseDown(e){
		Mouse.down(e);
		Canvas.mouseAny(e);
	}
	static mouseMove(e){
		Mouse.move(e);
		Canvas.mouseAny(e);
	}
	static mouseUp(e){
		Mouse.up(e);
		Canvas.mouseAny(e);
	}

	static mouseAny(e){
		if(Canvas.actMode == "Edit tiles"){
			if(Mouse.isDown) Canvas.repaintTile(e);
		}else
		if(Canvas.actMode == "Move objects"){
			if(Mouse.isDown) Canvas.moveObjects(e);
		}
	}

	static saveImage(sendFile = true){
		Canvas.saveCanvas.width = Canvas.grid.width - Canvas.grid.outlineSize;
		Canvas.saveCanvas.height = Canvas.grid.height - Canvas.grid.outlineSize;
		Canvas.render(Canvas.saveCanvas, 0, 0);

		if(sendFile){
			let link = document.createElement("a");
			link.setAttribute('download', Canvas.editingLayouts["File"].content[0].data.fileName + ".png");
			link.setAttribute('href', Canvas.saveCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
			link.click();
		}
		return Canvas.saveCanvas;
	}

	static saveFile(b){
		const res = {};

		for(let i in Canvas.editingLayouts){
			res[i] = Canvas.editingLayouts[i].export();
		}


		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(res)));
		element.setAttribute('download', Canvas.editingLayouts["File"].content[0].data.fileName + ".txt");
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		
		return res;
	}

	static import(data){
		for(let i in data){
			Canvas.editingLayouts[i].import(data[i]);
		}
	}

	static setActMode(btn){
		Canvas.actMode = btn.actMode;
	}

	static sellectedTileType = null;
	/** @param {MouseEvent} e */
	static repaintTile(e, ox = 10, oy = 10){
		if(Canvas.sellectedTileType === null) return;

		let tx = Math.floor((Mouse.x - ox) / ((Canvas.grid.width - Canvas.grid.outlineSize * 2) / Canvas.grid.columns));
		let ty = Math.floor((Mouse.y - oy) / ((Canvas.grid.height - Canvas.grid.outlineSize * 2) / Canvas.grid.rows));
		
		if(Canvas.grid.columns-1 < tx || Canvas.grid.rows-1 < ty || tx < 0 || ty < 0)return;

		Canvas.grid.grid[ty][tx].id = Canvas.sellectedTileType;
		Canvas.render();
	}

	/** @param {MouseEvent} e */
	static moveObjects(e){
		if(Canvas.movables.length == 0) return;

		for(let i in Canvas.movables){
			Canvas.movables[i].move(e.movementX, e.movementY);
		}
		Canvas.render();
	}
}

class ImageStorage{
	
	static bg = null;
	static element = null;

	static close(){
		if(ImageStorage.element) ImageStorage.element.popup.remove();
		ImageStorage.bg.style.display = "none";
	}
	
	static create(data){
		ImageStorage.close();
		ImageStorage.bg.style.display = "unset";
		return ImageStorage.element = new ImageStorage(data);
	}

	static init(){
		let bg = ImageStorage.bg = document.createElement("div");
		bg.style.width = bg.style.height = "100%";
		bg.style.position = "absolute";
		bg.style.left = bg.style.top = "0";
		bg.style.display = "none";
		bg.style.background = "#00000055";
		bg.addEventListener("click", ()=>{
			//Paint.close();
		});
		document.body.appendChild(bg);
	}

	constructor(data){
		document.createElementP("div", {className: "center"}, (popup)=>{
			this.element = popup;
			
		}, ImageStorage.bg);
	}
}