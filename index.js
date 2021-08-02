//const streetview = require('streetview-panorama')
//streetview.saveImg( { type:"naver", id:"LBh0lnRYcsQ7hba5R6pXPA", fileName:'./panorama/' } )
//streetview.saveImg( { type:"kakao", id:"1140469432", fileName:'./panorama/' } )
//streetview.saveImg( { type:"google", id:"Ec8-wVGl7_ExksLoefbfOw", fileName:'./panorama/'  } )
//streetview.saveImgPreview( { type:"naver", id:"e75tezRrNRrTbh6k7Nvxsw" } )
//streetview.saveImgPreview( { type:"kakao", id:"1071043104", fileName:'./panorama/' } )
//streetview.saveImgPreview( { type:"google", id:"AF1QipNj7fskmGw14klOjldXQ6WDR4d2OrUJezadVcpi", fileName:'./panorama/aaa6.png'  } )

const { Canvas, Image } = require('canvas')
const fs = require('fs')
const https = require('https')
const fetchA = require('node-fetch')
'use strict';

let streetview = {
	queueImg : [],
	saveImg : async (options) => {
		const vType = options.type
		const vId = options.id

		let vPanoImgInfo = []
		if ( vType == "kakao" ) {
			var json = await streetview.fetch("https://rv.maps.daum.net/roadview-search/searchNodeInfo.do?OUTPUT=json&ID="+vId)
			var vImgPath = json.street_view[1].street[0].img_path
			
			let vUrl = streetview.gvType[vType].imgUrl(vImgPath)
			let vNum = 1, size = 512;
			for ( let y = 0; y < 4; y++ ) {
				for ( let x = 0; x < 8; x++ ) {
					vPanoImgInfo.push( { x:x*size, y:y*size, type:vType
									   , src: vUrl + ("0"+vNum).substr(-2) +".jpg" } )
					vNum++
				}
			}
		} else if ( vType == "naver" ) {
			
			let vUrl = streetview.gvType[vType].imgUrl(vId)
			let size = 512
			let vArr = ['l','f','r','b','d','u']
			for ( let xx = 0; xx < vArr.length; xx++ ) {
				for ( let y = 0; y < 2; y++ ) {
					for ( let x = 0; x < 2; x++ ) {
						vPanoImgInfo.push( { x: x*size + (xx*2)*size , y:y*size, type:vType
										   , src: vUrl + vArr[xx] +"/" + (x+1) + "/" + (y+1) } )
					}
				}
			}
		} else if ( vType == "google" ) {
			
			let vUrl = streetview.gvType[vType].imgUrl(vId)
			let size = 512
			
			for ( let y = 0; y < 4; y++ ) {
				for ( let x = 0; x < 7; x++ ) {
					vPanoImgInfo.push( { x: x*size , y : y*size, type:vType
									   , src: vUrl + "&x=" + x + "&y=" + y } )
				}
			}
		}
		options.panoImgInfo = vPanoImgInfo
		streetview.queueImg.push(options)
		streetview.download()
	},
	gvDownloading : false,
	download : () => {
		if ( streetview.gvDownloading ) return
		streetview.gvDownloading = true
		if ( streetview.queueImg.length == 0) {
			streetview.gvDownloading = false
			return
		}
		const options = streetview.queueImg.shift()
		const vPanoImgInfo = options.panoImgInfo

		streetview.mergeImages(vPanoImgInfo, options.type)
			.then(b64 => {
				const vFilePathNm = streetview.getFileName(options)
				var data = b64.replace(/^data:image\/\w+;base64,/, "");
				var buf = Buffer.from(data, 'base64');

				return fs.writeFile(vFilePathNm, buf, ()=> { 
					console.log("download complete  : " + options.id + " => " + vFilePathNm )
					streetview.gvDownloading = false
					streetview.download()
			})
		})
	},
	mergeImages : (sources, pType) => {
		return new Promise(function (resolve) {

			var images = sources.map(function (source) { return new Promise(function (resolve, reject) {
				var img = new Image();
				img.onerror = function () { return reject(new Error('Couldn\'t load image : ' + img.src)); };
				img.onload  = function () { return resolve(Object.assign({}, source, { img: img })); };
				img.src = source.src;
			}); });

			resolve(Promise.all(images)
				.then(function (images) {
					let canvas = new Canvas()
					canvas.width  = streetview.gvType[pType].width
					canvas.height = streetview.gvType[pType].height
					let ctx = canvas.getContext('2d')
					ctx.fillStyle = 'black'
					ctx.fillRect(0, 0, canvas.width, canvas.height)
					images.forEach(function (image) { 
						return ctx.drawImage(image.img, image.x, image.y)
					})
					return canvas.toDataURL('image/png', 0.92);
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
			} else {
				streetview.makeFolder(vFilePathNm.substr(0, vFilePathNm.lastIndexOf("/")),fs)
			}
		}
		return vFilePathNm
	},
	saveImgPreview : (options) => {
		const vType = options.type
		const vId = options.id
		if ( vType == "kakao" ) {
			streetview.fetch("https://rv.maps.daum.net/roadview-search/searchNodeInfo.do?OUTPUT=json&ID="+vId).then((response)=>{
				let vImgPath = response.street_view[1].street[0].img_path
				options.url = streetview.gvType[vType].imgPreUrl(vImgPath)
				streetview.getImgPreviewDownload(options)
			})
		} else if ( vType == "naver" ) {
			options.url = streetview.gvType[vType].imgPreUrl(vId)
			streetview.getImgPreviewDownload(options)
		} else if ( vType == "google" ) {
			options.url = streetview.gvType[vType].imgPreUrl(vId)
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
	},
	gvType : {
		kakao : {
			width : 4896,
			height : 2304,
			imgUrl : (vImgPath) => "https://map0.daumcdn.net/map_roadview" + vImgPath + vImgPath.substr(vImgPath.lastIndexOf("/")) + "_",
			imgPreUrl : (vImgPath) => "https://map1.daumcdn.net/map_roadview" + vImgPath + ".jpg"
		},
		naver : {
			width : 6144,
			height : 1024,
			imgUrl : (pId) => "https://panorama.pstatic.net/image/" + pId + "/512/M/",
			imgPreUrl : (pId) => "https://panorama.pstatic.net/image/" + pId + "/512/P"
		},
		google : {
			width : 3584,
			height : 1664,
			imgUrl : (pId) => "https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=maps_sv.tactile&zoom=3&panoid=" + pId,
			imgPreUrl : (pId) => "https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=maps_sv.tactile&x=0&y=0&zoom=0&nbt=1&fover=2&panoid=" + pId
		}
	}
}
module.exports = streetview
