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