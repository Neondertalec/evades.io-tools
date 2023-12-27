GUI.prompt({message:"What do you want to do?"}, "New card", {text:"Import card", tag:"input", type:"file", validiser:async (v)=>await isValidFile(v.files) != false}).then(async res=>{
	if(res.text == "New card"){
		Canvas.init();
	}else
	if(res.text == "Import card"){
		Canvas.init(await isValidFile(res.element.files));
	}
}).catch(()=>{})

async function isValidFile(files){
	if(!files) return false;
	
	let file = files.item(0);
	
	if(!file)return;

	let text = await file.text();

	try{
		return JSON.parse(text);
	}catch{
		return false;
	}
}

document.addEventListener("keydown", (e)=>{
	if(document.activeElement.tagName.toLowerCase() == "body"){
		if(e.code == "KeyU"){
			saves.undo(-1);
		}
		if(e.code == "KeyI"){
			saves.undo(1);
		}
	}
})

const saves = new(class Saves{
	Field = class Field{
		act = "none";
		element = null;
		ov = -1;
		nv = -1;
		constructor(act, data = {element:null, ov: -1, nv: -1}){
			this.act = act;
			Object.assign(this, data || {});
		}
	}

	fields = [];
	currentId = -1;
	lastDir = -1;

	constructor(){
	}

	add(field){
		if(this.currentId != -1){
			this.fields.splice(this.lastDir == +1 ? this.currentId+1 : this.currentId);
			this.currentId = -1;
			this.lastDir = -1;
		}
		let prevF = this.fields[this.fields.length-1];
		if(prevF && prevF.act == field.act && prevF.element == field.element && prevF.nv == field.nv && field.ov == field.nv)return;
		
		this.fields.push(field);
	}
	
	undo(dir = -1){
		if(this.currentId == -1) this.currentId = this.fields.length;

		if(this.lastDir == (this.lastDir = dir)) this.currentId = Math.max(0,Math.min(this.currentId + dir, this.fields.length-1));

		let last = this.fields[this.currentId == -1 ? this.fields.length-1 : this.currentId];
		if(last){
			switch(last.act){
				case "tile":
					last.element.undo(dir == -1 ? last.ov : last.nv);
				default:
					break;
			}
			Canvas.render();
		}
	}
})();

const Gifs = new (class Gifs{
	constructor(){
		this.running = false;
		this.storage = [];
		this.fps = 30;
		this.chfr = "";
		const container = this.container = document.body.querySelector("#gifTools");
		this.title = container.querySelector("[vv='title']");
		(this.beginBtn = container.querySelector("[vv='beginBtn']")).onclick = ()=>{this.onBeginBtn()};
		(this.chfrInput = container.querySelector("[vv='chfr']")).onchange = ()=>{this.onChfr()};
		(this.addBtn = container.querySelector("[vv='add']")).onclick = ()=>{this.onAddFrame(false)};
		(this.changeBtn = container.querySelector("[vv='change']")).onclick = ()=>{this.onAddFrame(true)};
		(this.fpsInput = container.querySelector("[vv='fps']")).onchange = ()=>{this.onFps()};
		(this.repeatInput = container.querySelector("[vv='repeatCnt']")).onchange = ()=>{this.onRepeatCnt()};
		(this.saveBtn = container.querySelector("[vv='save']")).onclick = ()=>{this.onSave()};
	}

	show(bool = true){
		this.container.style.display = bool ? "flex" : "none";
	}

	onBeginBtn(){
		this.storage = [];
		this.title.innerText = "[E]Gif (0)";
	}

	onAddFrame(replace = false){
		if(this.chfr != "" && +this.chfr > 0 && +this.chfr <= this.storage.length){
			if(replace){
				this.storage[+this.chfr-1] = Canvas.saveImage(false).ctx;
			}else this.storage.splice(+this.chfr,0, Canvas.saveImage(false).ctx);
		}else
		if(replace){
			this.storage[this.storage.length-1] = Canvas.saveImage(false).ctx;
		}else this.storage.push(Canvas.saveImage(false).ctx);
		
		this.title.innerText = `[E]Gif (${this.storage.length})`;
	}

	onFps(){this.fps = Math.max(Math.min(this.fpsInput.value, 60), 1);}
	onChfr(){this.chfr = this.chfrInput.value;}
	onRepeatCnt(){this.repeatCnt = Math.max(this.repeatInput.value, 0);}

	onSave(){
		var encoder = new GIFEncoder();
		encoder.setRepeat(this.repeatCnt < 0 ? null : this.repeatCnt);
		encoder.setDelay(1000/this.fps);
		encoder.start();
		
		for(let i = 0; i < this.storage.length; i++){
			encoder.addFrame(this.storage[i]);
		}
		encoder.finish();

		encoder.download(`${Canvas.editingLayouts["File"].content[0].data.fileName}.gif`);
	}
})()