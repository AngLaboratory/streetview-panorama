# streetview-panorama
get street view images for google map, naver map, kakao map

```
const streetview = require('streetview-panorama')

streetview.saveImg( { id:"LBh0lnRYcsQ7hba5R6pXPA", type:"naver", fileName:'./panorama/' } )
streetview.saveImg( { id:"1140469432", type:"kakao", fileName:'./panorama/' } )
streetview.saveImg( { id:"Ec8-wVGl7_ExksLoefbfOw", type:"google", fileName:'./panorama/'  } )

streetview.saveImgPreview( { id:"e75tezRrNRrTbh6k7Nvxsw", type:"naver" } )
streetview.saveImgPreview( { id:"1071043104", type:"kakao", fileName:'./panorama/' } )
streetview.saveImgPreview( { id:"AF1QipNj7fskmGw14klOjldXQ6WDR4d2OrUJezadVcpi", type:"google", fileName:'./panorama/aaa6.png'  } )
```

# saveImg
* naver(6144*1024)   
![Alt text](/example/naver.png "naver streetview image")
* kakao(4896*2304)   
![Alt text](/example/kakao.png "kakao streetview image")
* google(3584*1664)   
![Alt text](/example/google.png "google streetview image")

# saveImgPreview
* naver   
![Alt text](/example/naverPreview.png "naver streetview preview image")
* kakao   
![Alt text](/example/kakaoPreview.png "kakao streetview preview image")
* google   
![Alt text](/example/googlePreview.png "google streetview preview image")
