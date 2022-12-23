const fs = require("fs");
let map = [];
fs.readdirSync("tools/images").forEach(e=>{
	if(e != "imageMap.js"){
		map.push(e);
	}
});

fs.writeFileSync("tools/images/imageMap.js","const imageMap = "+ JSON.stringify(map));
