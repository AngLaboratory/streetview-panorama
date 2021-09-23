# streetview-panorama
get street view images for google map, naver map, kakao map
(without any api-key)

```
const streetview = require('streetview-panorama')

// Large size
streetview.saveImg( { id:"LBh0lnRYcsQ7hba5R6pXPA", type:"naver", fileName:'./panorama/' } )
streetview.saveImg( { id:"1140469432", type:"kakao", fileName:'./panorama/' } )
streetview.saveImg( { id:"Ec8-wVGl7_ExksLoefbfOw", type:"google", fileName:'./panorama/'  } )

// Small size
streetview.saveImgPreview( { id:"e75tezRrNRrTbh6k7Nvxsw", type:"naver" } )
streetview.saveImgPreview( { id:"1071043104", type:"kakao", fileName:'./panorama/' } )
streetview.saveImgPreview( { id:"Ec8-wVGl7_ExksLoefbfOw", type:"google", fileName:'./panorama/aaa6.png'  } )
```

# saveImg
* naver(6144 * 1024)   
![](/example/naver.png "naver streetview image")   
* kakao(4896 * 2304)   
![](/example/kakao.png "kakao streetview image")   
* google(3328 * 1872)   
![](/example/google.png "google streetview image")   

# saveImgPreview
* naver(1536 * 256)   
![](/example/naverPreview.png "naver streetview preview image")   
* kakao(1280 * 640)   
![](/example/kakaoPreview.png "kakao streetview preview image")   
* google(512 * 512)   
![](/example/googlePreview.png "google streetview preview image")   


# fileName options
* null => id.png
  > { id:"e75tezRrNRrTbh6k7Nvxsw", type:"naver" } => ./e75tezRrNRrTbh6k7Nvxsw.png
* ./dir/ => ./dir/id.png
  > { id:"1071043104", type:"kakao", fileName:'./panorama/' } => ./panorama/1071043104.png
* ./dir/filename.png => ./dir/filename.png 
  > { id:"Ec8-wVGl7_ExksLoefbfOw", type:"google", fileName:'./panorama/aaa6.png' } => ./panorama/aaa6.png

# You can make something like this (Youtube link)
[![엄청난 하늘. 충주시.소태면.조금 Chungju-si. Sotae-myeon. A little (223 steps)](http://img.youtube.com/vi/zb7CIqYtLT0/maxresdefault.jpg)](https://youtu.be/zb7CIqYtLT0)
