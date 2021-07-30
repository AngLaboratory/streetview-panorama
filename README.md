# streetview-panorama
get street view images for google map, naver map, kakao map

```
const streetview = require('streetview-panorama')

streetview.saveImg( { id:"LBh0lnRYcsQ7hba5R6pXPA", type:"naver", fileName:'./panorama/' } )
streetview.saveImg( { id:"1140469432", type:"kakao", fileName:'./panorama/' } )
streetview.saveImg( { id:"Ec8-wVGl7_ExksLoefbfOw", type:"google", fileName:'./panorama/'  } )

streetview.getImgPreview( { id:"e75tezRrNRrTbh6k7Nvxsw", type:"naver" } )
streetview.getImgPreview( { id:"1071043104", type:"kakao", fileName:'./panorama/' } )
streetview.getImgPreview( { id:"AF1QipNj7fskmGw14klOjldXQ6WDR4d2OrUJezadVcpi", type:"google", fileName:'./panorama/aaa6.png'  } )
```

