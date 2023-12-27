class ContextMenu{
	static DEFAULT_TEXT = ()=> [
		{
			name:"Color",
			content:[
				{
					name:"Text color",
					finals:["<c={V0}>{T}"],
					final:["<c={V0};{T}>"],
					input:[{type:"color"}],
					title: "Sets the color of the text"
					//options: Object.values(varsC.dataC).map(e=>"@"+e.k)
				},
				{
					name:"Text color restore",
					finals:["</c>{T}"],
					final:["</c=;{T}>"],
					input:[],
					title: "Restores the color of the text"
				},

				{
					name:"Outline color",
					finals:["<oc={V0}>{T}"],
					final:["<oc={V0};{T}>"],
					input:[{type:"color"}],
					title: "Sets the outline color of the text"
					//options: Object.values(varsC.dataC).map(e=>"@"+e.k)
				},
				{
					name:"Outline color restore",
					finals:["</oc>{T}"],
					final:["</oc=;{T}>"],
					input:[],
					title: "Restores the outline color of the text"
				},

				{
					name:"Shadow color",
					finals:["<sc={V0}>{T}"],
					final:["<sc={V0};{T}>"],
					input:[{type:"color"}],
					title: "Sets the shadow color of the text"
					//options: Object.values(varsC.dataC).map(e=>"@"+e.k)
				},
				{
					name:"Shadow color restore",
					finals:["</sc>{T}"],
					final:["</sc=;{T}>"],
					input:[],
					title: "Restores the shadow color of the text"
				},
			]
		},
		{
			name:"Size",
			content:[
				{
					name:"Text size",
					finals:["<fs={V0}>{T}"],
					final:["<fs={V0};{T}>"],
					input:[{type:"number"}],
					title: "Sets the font size of the text"
				},
				{
					name:"Text size restore",
					finals:["</fs>{T}"],
					final:["</fs=;{T}>"],
					input:[],
					title: "Restores the font size of the text"
				},

				{
					name:"Outline size",
					finals:["<os={V0}>{T}"],
					final:["<os={V0};{T}>"],
					input:[{type:"number"}],
					title: "Sets the outline size of the text"
				},
				{
					name:"Outline size restore",
					finals:["</os>{T}"],
					final:["</os=;{T}>"],
					input:[],
					title: "Restores the outline size of the text"
				},

				{
					name:"Shadow size",
					finals:["<ss={V0}>{T}"],
					final:["<ss={V0};{T}>"],
					input:[{type:"number"}],
					title: "Sets the shadow size of the text"
				},
				{
					name:"Shadow size restore",
					finals:["</ss>{T}"],
					final:["</ss=;{T}>"],
					input:[],
					title: "Restores the shadow size of the text"
				},
			]
		},
		{
			name:"Font decorations",
			content:[
				{
					name:"Bold",
					finals:["<b>{T}"],
					final:["<b;{T}>"],
					input:[],
					title: "Makes the text bold"
				},
				{
					name:"UnBold",
					finals:["</b>{T}"],
					final:["</b=;{T}>"],
					input:[],
					title: "Makes the text not bold"
				},

				{
					name:"Italic",
					finals:["<i>{T}"],
					final:["<i;{T}>"],
					input:[],
					title: "Makes the text italic"
				},
				{
					name:"UnItalic",
					finals:["</i>{T}"],
					final:["</i=;{T}>"],
					input:[],
					title: "Makes the text not italic"
				},
			]
		},
		{
			name:"Position",
			content:[
				{
					name:"Space X",
					finals:["<sx={V0}>{T}"],
					final:["<sx={V0}>{T}"],
					input:[{type:"number"}],
					title: "Adds a spacing as if its filled with spaces"
				},
				{
					name:"X",
					finals:["<x={V0}>{T}"],
					final:["<x={V0};{T}>"],
					input:[{type:"number"}],
					title: "Moves the text after it to the right"
				},
				{
					name:"LX create",
					finals:["<lx={V0}>{T}"],
					final:["<lx={V0}>{T}"],
					input:[{type:"text"}],
					title: "Create an offset X lable."
				},
				{
					name:"LX use",
					finals:["<lx={V0};>{T}"],
					final:["<lx={V0};>{T}"],
					input:[{type:"text"}],
					title: "Use an offset X lable."
				},
				{
					name:"Y",
					finals:["<y={V0}>{T}"],
					final:["<y={V0};{T}>"],
					input:[{type:"number"}],
					title: "Moves the text after it to the bottom"
				},
				{
					name:"Wave",
					finals:["<wave={V0};>{T}"],
					final:["<wave={V0};{T}>"],
					input:[{type:"number"}],
					title: "Wave, every argument (seperated by ;) will be in the seperate Y\n"+
					"e.g. <wave=10;e;x;a;m;p;l;e> where 10 is the amplitude\n"+
					"Note: if you do <wave=10;;> instead of <wave=10;>, the text will start from the oposide side"
				},
			]
		},
		/*{
			name:"Variable",
			content:[
				{
					name:"Builtin",
					final:["<var={V0};{T}>"],
					//options: Object.keys(varsC.varsp)
				},
				{
					name:"Custom",
					final:["<var={V0};{T}>"],
					//options: [...Object.values(varsC.data).map(e=>e.k),...Object.values(varsC.dataC).map(e=>"@"+e.k)]
				},
			]
		}*/
	];
	static bg = null;
	static contextMenu = null;

	static close(){
		if(ContextMenu.contextMenu) ContextMenu.contextMenu.popup.remove();
		ContextMenu.bg.style.display = "none";
	}
	
	static create(event, data){
		ContextMenu.close();
		ContextMenu.bg.style.display = "unset";
		return ContextMenu.contextMenu = new ContextMenu(event, data);
	}

	static init(){
		let bg = ContextMenu.bg = document.createElement("div");
		bg.style.width = bg.style.height = "100%";
		bg.style.position = "absolute";
		bg.style.left = bg.style.top = "0";
		bg.style.display = "none";
		bg.addEventListener("click", ()=>{
			ContextMenu.close();
		});
		document.body.appendChild(bg);
	}


	constructor(event, data){
		//pageX: 961 pageY: 290 window.innerHeight
		this.data = data;
		
		this.targetInput = event.target;
		this.selection = [event.target.value, event.target.selectionStart, event.target.selectionEnd];

		this.popup = GUI.createElementP("div", {style:{right: event.pageX}, className:"contextMenu"}, (popup)=>{
			popup.style.right = (window.innerWidth - event.pageX) + "px";

			if(event.pageY < window.innerHeight/2){
				popup.style.top = event.pageY + "px";
			}else{
				popup.style.bottom = (window.innerHeight - event.pageY) + "px";
			}
		}, document.body);
		this.fillContent(this.data);
	}

	fillContent(data){
		this.popup.innerHTML = "";
		for(let i in data){
			let d = data[i];
			GUI.createElementP("button", {className:"contextMenuBtn"}, (btn)=>{
				btn.innerText = d.name;
				btn.title = d.title || "";
				if(d.content) btn.classList.add("extensive");

				btn.addEventListener("click", (e)=>{
					if(d.content){
						this.fillContent(d.content);
					}else{
						this.popup.innerHTML = "";
						if(d.input){
							this.fillInputs(d.input);
							this.onFinalizeD = d;
							//this.onFinalize = (result)=>{}
						}
						if(d.options){
							this.fillOptions(d.options);
							this.onFinalizeD = d;
						}
					}
				})
			}, this.popup);
		}
	}

	fillInputs(data){
		let res = {};
		for(let i in data){
			let d = data[i];
			GUI.createElementP("input", {className:"contextMenuBtn", type: d.type}, (input)=>{
				input.innerText = d.name;
				res[i] = "#0000";
				input.addEventListener("input", (e)=>{
					res[i] = input.value;
					/*if(input.type == "color"){
						input.type = "";
						input.type = "color";
					}*/
				})
			}, this.popup);
		}

		GUI.createElementP("button", {className:"contextMenuBtn"}, (btn)=>{
			btn.innerText = "Submit";

			btn.addEventListener("click", (e)=>{
				this.onFinalize(res);
				ContextMenu.close();
			})
		}, this.popup);
	}

	fillOptions(data){
		let res = {};
		for(let i in data){
			let d = data[i];
			GUI.createElementP("button", {className:"contextMenuBtn"}, (btn)=>{
				btn.innerText = d;

				btn.addEventListener("click", (e)=>{
					this.onFinalize({0:d});
					ContextMenu.close();
				})
			}, this.popup);
		}
	}

	onFinalize(result){
		this.selection;
		let res = this.selection[0].slice(0,this.selection[1]);
		let finalKey = this.selection[1] == this.selection[2] ? "finals" : "final";
		
		let sumstr = this.onFinalizeD[finalKey][0];

		for(let i in result){
			sumstr = sumstr.replace(`{V${i}}`, result[i])
		}
		let lenDiff1 = res.length;
		res += sumstr.replace("{T}", this.selection[0].slice(this.selection[1],this.selection[2]));
		lenDiff1 = res.length - lenDiff1;

		if(this.selection[1] != this.selection[2] && this.onFinalizeD[finalKey].length > 1){
			sumstr = this.onFinalizeD[finalKey][0];
			for(let i in result){
				sumstr = sumstr.replace(`{V${i}}`, result[i])
			}
			res += sumstr;
		}
		res += this.selection[0].slice(this.selection[2],this.selection[0].length);

		//let lenDiff2 = res.length - this.targetInput.value.length;
		this.targetInput.value = res;
		if(this.targetInput.oninput) this.targetInput.oninput()
		
		console.log(this.targetInput);
		if(this.targetInput.editField){
			this.targetInput.editField.set(res);
			this.targetInput.editField.change(true);
		}


		if(this.selection[1] != this.selection[2]){
			this.targetInput.select();
			let index = res.indexOf(this.selection[0].slice(this.selection[1],this.selection[2]), this.selection[1]);
			this.targetInput.selectionStart = index;
			this.targetInput.selectionEnd = index - this.selection[1] + this.selection[2];
		}else{
			this.targetInput.select();
			this.targetInput.selectionEnd = this.targetInput.selectionStart = this.selection[1] + lenDiff1; 
		}
	}
}
ContextMenu.init();