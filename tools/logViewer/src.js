const fileSellect = document.getElementById("fileSellect");
fileSellect.onchange = imported;
const leaderboard = document.getElementById("leaderboard");
const page = document.getElementById("page");

document.createElementP = function(name, args = null, fnc=null, parent = null){
	const element = document.createElement(name)
	if(parent) parent.appendChild(element);
	if(args != null)Object.assign(element,args);
	if(args && args.style)Object.keys(args.style).forEach(e=>{element.style[e] = args.style[e]});
	if(fnc) fnc(element);
	return element;
}

Object.defineProperty(Array.prototype, "group", {
	value: function(f){
		const result = {};
		for(const value of this){
			const key = f(value);
			if(!result[key]) result[key] = [];
			result[key].push(value);
		}
		return result;

	},
	enumerable: false,
})

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
		this.pi = data.pi;
		this.dead = data.dead || false;

		if(this.type == 1) this.dead = true;
		else if(this.type == 2) this.dead = false;

	}

	clone(){
		return new Sample({...this});
	}

	node(team){
		let className = "row";
		if(this.dead) className += " dead";
		if(team.includes(this.name)) className += " team";

		return document.createElementP("div", {className}, row=>{
			document.createElementP("div", {innerText:this.name}, null, row)
			document.createElementP("div", {innerText:`[AR:${this.area}]`}, null, row)
			document.createElementP("div", {innerText:`[PI:${this.pi}]`}, null, row)
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

	node(team, startTime = 0){
		return document.createElementP("div", {className:"group"}, group=>{
			
			document.createElementP("div", {className:"time", innerText:timeToString(this.time - startTime).str || "0s"}, null, group);

			const groups = Object.values(this.samples).group(e=>e.map);
			for(let i in groups){
				document.createElementP("div", {className:"world", innerText:i}, null, group);
				const sorted = groups[i].sort((v1,v2)=>v2.area-v1.area);
				for(let j in sorted){
					group.appendChild(sorted[j].node(team));
				}
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
	Renderer.renderRows(pics, data.ownTeam);
}

const Renderer = new (class Renderer{
	constructor(){
		this.pics = [];
		this.team = [];
		this.frame = 0;
	}

	renderRows(pics, team = []){
		this.pics = pics;
		this.team = team;
		this.frame = 0;
		this.render();
	}

	nextFrame(){
		this.setFrame(this.frame+1);
	}

	prevFrame(){
		this.setFrame(this.frame-1);
	}

	setFrame(frame){
		const toUpdate = frame != "";

		frame = parseInt(frame);
		if(isNaN(frame)) frame = this.frame;

		this.frame = Math.min(Math.max(0, frame), this.pics.length-1)
		if(toUpdate) page.value = this.frame;
		this.render();
	}

	render(){
		leaderboard.innerHTML="";

		const frame = this.pics[this.frame];
		leaderboard.appendChild(frame.node(this.team, this.pics[0]?.time));
	}
})()

function timeToString(timeFor, ums = false) {
	let s = Math.floor(timeFor / 1000);
	let ms = Math.round((timeFor / 1000 - s) * 1000)
	let m = Math.floor(s / 60);
	let h = Math.floor(m / 60);
	let d = Math.floor(h / 24);
	s = s % 60;
	m = m % 60;
	h = h % 24;
	return {
		d,
		h,
		m,
		s,
		ms,
		str: `${d ? ` ${d}d` : ""}${h ? ` ${h}h` : ""}${m ? ` ${m}m` : ""}${s ? ` ${s}s` : ""}${ums && ms ? ` ${ms}ms` : ""}`
	}
}
