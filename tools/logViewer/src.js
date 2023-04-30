const fileSellect = document.getElementById("fileSellect");
fileSellect.onchange = imported;
const leaderboard = document.getElementById("leaderboard");

document.createElementP = function(name, args = null, fnc=null, parent = null){
	const element = document.createElement(name)
	if(parent) parent.appendChild(element);
	if(args != null)Object.assign(element,args);
	if(args && args.style)Object.keys(args.style).forEach(e=>{element.style[e] = args.style[e]});
	if(fnc) fnc(element);
	return element;
}

async function imported(){
	let file = fileSellect.files.item(0);
	if(file){
		text = await file.text();
		let json = {};
		try{
			json = JSON.parse(text);
		}catch{
			console.log("incorrect file");
			return;
		};
		constructRows(json);
	}
}

class Sample{
	constructor(data){
		this.id = data.id;
		this.time = data.time;
		this.map = data.map;
		this.area = data.area;
		this.type = data.type;
		this.name = data.name;
		this.dead = data.dead || false;

		if(this.type == 1) this.dead = true;
		else if(this.type == 2) this.dead = false;

	}

	clone(){
		return new Sample({...this});
	}

	node(){
		return document.createElementP("div", {className:"row" + (this.dead? " dead" : "")}, row=>{
			document.createElementP("div", {innerText:this.name}, null, row)
			document.createElementP("div", {innerText:`[${this.area}]`}, null, row)
		})
	}
}

class SampleGroup{
	constructor(data){
		this.samples = data.samples;
		this.time = data.time;
	}

	add(sample){
		this.time = sample.time;
		if(this.samples[sample.name]){
			if(sample.type == 6){
				delete this.samples[sample.name];
				return;
			}
		}
		this.samples[sample.name] = sample;
	}

	clone(){
		let res = {...this};
		res.samples = {};
		for(let i in this.samples){
			console.log(this.samples[i]);
			res.samples[i] = this.samples[i].clone();
		}
		return res;
	}

	node(){
		return document.createElementP("div", {className:"group"}, group=>{
			document.createElementP("div", {className:"time", innerText:new Date(this.time).toLocaleTimeString()}, null, group);
			for(let i in this.samples){
				group.appendChild(this.samples[i].node());
			}
		})
	}
}

function constructRows(data){
	const pics = [new SampleGroup({})];
	for(let i in data.travels){
		let newData = new SampleGroup(pics[pics.length-1].clone());
		pics.push(newData);
		newData.add(new Sample(data.travels[i]));
	}

	pics.splice(0,1);
	console.log(pics);
	Renderer.renderRows(pics);
}

const Renderer = new (class Renderer{
	constructor(){
		this.pics = [];
		this.frame = 0;
	}

	renderRows(pics){
		this.pics = pics;
		this.frame = 0;
		this.render();
	}

	nextFrame(){
		this.frame = Math.min(this.pics.length-1, this.frame+1);
		this.render();
	}

	prevFrame(){
		this.frame = Math.max(0, this.frame-1);
		this.render();
	}

	render(){
		leaderboard.innerHTML="";

		const frame = this.pics[this.frame];
		leaderboard.appendChild(frame.node());
	}
})()