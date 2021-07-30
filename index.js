//const streetview = require('streetview-panorama')
//streetview.saveImg( { type:"naver", id:"LBh0lnRYcsQ7hba5R6pXPA", fileName:'./panorama/' } )
//streetview.saveImg( { type:"kakao", id:"1140469432", fileName:'./panorama/' } )
//streetview.saveImg( { type:"google", id:"Ec8-wVGl7_ExksLoefbfOw", fileName:'./panorama/'  } )
//streetview.getImgPreview( { type:"naver", id:"e75tezRrNRrTbh6k7Nvxsw" } )
//streetview.getImgPreview( { type:"kakao", id:"1071043104", fileName:'./panorama/' } )
//streetview.getImgPreview( { type:"google", id:"AF1QipNj7fskmGw14klOjldXQ6WDR4d2OrUJezadVcpi", fileName:'./panorama/aaa6.png'  } )

// let ccc = await streetview.getImg( { type:"kakao", id:"1071043104"} )
 
const { Canvas, Image } = require('canvas')
const fs = require('fs')
const https = require('https')
const fetchA = require('node-fetch')
'use strict';

let streetview = {
	saveImg : async (options) => {
		const b64 = await streetview.getImg(options)
		const vFilePathNm = streetview.getFileName(options)

		return fs.writeFile(vFilePathNm, b64, ()=> { 
			console.log("download complete  : " + options.id + " => " + vFilePathNm )
		})
	},
	getImg : async (options) => {
		const vType = options.type
		let vId = options.id

		let vPanoImgInfo = []
		if ( vType == "kakao" ) {
			var json = await streetview.fetch("https://rv.maps.daum.net/roadview-search/searchNodeInfo.do?OUTPUT=json&ID="+vId)
			var vImgPath = json.street_view[1].street[0].img_path
			let vUrl = "https://map0.daumcdn.net/map_roadview" + vImgPath + vImgPath.substr(vImgPath.lastIndexOf("/")) + "_"
			let vNum = 1, size = 512;
			for ( let y = 0; y < 4; y++ ) {
				for ( let x = 0; x < 8; x++ ) {
					vPanoImgInfo.push( { "x": x * size, "y" : y*size
									   , "src": vUrl + ("0"+vNum).substr(-2) +".jpg" } )
					vNum++
				}
			}
		} else if ( vType == "naver" ) {
			let vUrl = "https://panorama.pstatic.net/image/" + vId + "/512/M/"
			let size = 512
			let vArr = ['l','f','r','b','d','u']
			for ( let xx = 0; xx < vArr.length; xx++ ) {
				for ( let y = 0; y < 2; y++ ) {
					for ( let x = 0; x < 2; x++ ) {
						vPanoImgInfo.push( { x: x*size + (xx*2)*size , y : y*size
										   , src: vUrl + vArr[xx] +"/" + (x+1) + "/" + (y+1) } )
					}
				}
			}
		} else if ( vType == "google" ) {
			let vUrl = "https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=maps_sv.tactile&zoom=3&panoid=" + vId
			let size = 512
			for ( let y = 0; y < 4; y++ ) {
				for ( let x = 0; x < 7; x++ ) {
					vPanoImgInfo.push( { x: x*size , y : y*size
									   , src: vUrl + "&x=" + x + "&y=" + y } )
				}
			}
		}

		return await streetview.mergeImages(vPanoImgInfo, vType)
			.then(b64 => {
				var data = b64.replace(/^data:image\/\w+;base64,/, "");
				var buf = Buffer.from(data, 'base64');
				return buf } )
	},
	mergeImages : (sources, pType) => {
		return new Promise(function (resolve) {
			let options = {
				format: 'image/png',
				quality: 0.92
			}
			
			let canvas = new Canvas()
			if ( pType == "kakao" ) {
				canvas.width  = 4096
				canvas.height = 2304
			} else if ( pType == "naver" ) {
				canvas.width  = 1024 * 6
				canvas.height = 1024
			} else if ( pType == "google" ) {
				canvas.width  = 3584
				canvas.height = 1664
			}

			var ctx = canvas.getContext('2d');
			ctx.fillStyle = 'black'; 
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			var images = sources.map(function (source) { return new Promise(function (resolve, reject) {
				var img = new Image();
				img.crossOrigin = options.crossOrigin;
				img.onerror = function () { return reject(new Error('Couldn\'t load image : ' + img.src)); };
				img.onload  = function () { return resolve(Object.assign({}, source, { img: img })); };
				img.src = source.src;
			}); });

			resolve(Promise.all(images)
				.then(function (images) {
					images.forEach(function (image) { // 개개 이미지 로드
						return ctx.drawImage(image.img, image.x || 0, image.y || 0)
					})
					return canvas.toDataURL(options.format, options.quality);
				}));
			});
	},
	getFileName : (options) => {
		let vFilePathNm = options.fileName
		if ( vFilePathNm == undefined || vFilePathNm == "") {
			vFilePathNm = "./" + options.id + ".png"
		} else {
			if ( vFilePathNm.substr(-1) == "/" ) {
				streetview.makeFolder(vFilePathNm,fs)
				vFilePathNm += options.id + ".png"
			}
		}
		return vFilePathNm
	},
	getImgPreview : (options) => {
		const vType = options.type
		let vId = options.id
		if ( vType == "kakao" ) {
			streetview.fetch("https://rv.maps.daum.net/roadview-search/searchNodeInfo.do?OUTPUT=json&ID="+vId).then((response)=>{
				let vImgPath = response.street_view[1].street[0].img_path
				options.url = "https://map1.daumcdn.net/map_roadview" + vImgPath + ".jpg"
				streetview.getImgPreviewDownload(options)
			})
		} else if ( vType == "naver" ) {
			options.url = "https://panorama.pstatic.net/image/" + vId + "/512/P"
			streetview.getImgPreviewDownload(options)
		} else if ( vType == "google" ) {
			options.url = "https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=maps_sv.tactile&x=0&y=0&zoom=0&nbt=1&fover=2&panoid=" + vId
			streetview.getImgPreviewDownload(options)
		}
	},
	getImgPreviewDownload : (options) => {
		let vFilePathNm = streetview.getFileName(options)
		let vUrl = options.url
		https.get( vUrl
				 , function(resp) {
						console.log("preview download complete  : " + options.id + " => " + vFilePathNm )
						resp.pipe(fs.createWriteStream(vFilePathNm))
					}
				);
	},
    fetch : async (pUrl) => fetchA(pUrl).then(response => response.json()),
	makeFolder: (pPath,fs) =>{
		const dir = pPath.split("/");
		let vDir = ""
		for ( let i = 0; i < dir.length; i++ ) {
			vDir += ((i==0)?"":"/") + dir[i]
			if ( !fs.existsSync(vDir) ) {
				fs.mkdirSync(vDir);
			}
		}
	}
}
module.exports = streetview