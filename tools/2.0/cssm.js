const cssm = new(class Cssm{
	element = null;

	el = class dataPref{
		id = -1;
		enabled = true;

		constructor(key, value){
			this.key = key;
			this.value = value;
		}
	}

	els = [];
	
	consts = {
		font: `@import url('https://fonts.googleapis.com/css2?family={0}&display=swap');`
	}

	constructor(){
		this.element = document.createElement("style");
		document.head.appendChild(this.element);
	}

	add(data){
		if(this.els.some((e)=>e.key == data.key)) return;
		this.els.push(data);
		data.id = this.els.length-1;
		this.recalc();
	}

	remove(key){
		console.log("rm", key);
		if(!key)return;

		let i = this.els.findIndex((e)=>e.key == key);
		if(i >= 0){
			this.els.splice(i,1);
			this.recalc();
		}
	}

	recalc(){
		if(this.element){
			let newIHTML = ``;

			
			for(let key in this.els){
				let e = this.els[key];

				if(e.enabled){
					newIHTML += e.value + `\n`;
				}
			}

			this.element.innerHTML = newIHTML;
		}
	}
})();