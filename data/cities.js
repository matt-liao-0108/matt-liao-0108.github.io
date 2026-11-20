// 所有照片暂为占位，可通过 photos 数组替换；story 为该城市的文案。
export const cities = [
 {id:'takamatsu',name:'高松',en:'Takamatsu',country:'japan',region:'日本 · 香川',lat:34.3428,lon:134.0466,landmark:'栗林公园',model:'garden',image:'images/takamatsu-station.jpg',
  photos:['images/takamatsu-station.jpg', 'images/takamatsu-airport-bus.jpg', 'images/takamatsu-railway.jpg'],
  livePhotos:{
   'images/takamatsu-station.jpg':'images/takamatsu-station-live.mp4',
   'images/takamatsu-airport-bus.jpg':'images/takamatsu-airport-bus-live.mp4'
  },
  story:'从高松机场的呆呆兽巴士，到高松站外的笑脸和铁轨。'},
 {id:'teriberka',name:'捷里别尔卡',en:'Teriberka',country:'russia',region:'俄罗斯 · 巴伦支海',lat:69.1692,lon:35.1220,landmark:'沉船遗迹',model:'ship',image:'images/teriberka-boat.jpg',
  photos:['images/teriberka-boat.jpg', 'images/teriberka-fishing-boat.jpg'],
  livePhotos:{
   'images/teriberka-boat.jpg':'images/teriberka-boat-live.mp4',
   'images/teriberka-fishing-boat.jpg':'images/teriberka-fishing-boat-live.mp4'
  },
  story:'为巴伦支海边的捷里别尔卡留下一页，从一张船舱里的照片开始。'},
 {id:'sapporo',name:'札幌',en:'Sapporo',together:true,country:'japan',region:'日本 · 北海道',lat:43.0621,lon:141.3544,landmark:'札幌钟楼',model:'clock',image:'images/sapporo-3447.jpg',photos:['images/sapporo-3447.jpg', 'images/sapporo-3428.jpg', 'images/sapporo-3425.jpg', 'images/sapporo-3705.jpg'],livePhotos:{'images/sapporo-3447.jpg':'images/sapporo-3447-live.mp4','images/sapporo-3428.jpg':'images/sapporo-3428-live.mp4','images/sapporo-3425.jpg':'images/sapporo-3425-live.mp4','images/sapporo-3705.jpg':'images/sapporo-3705-live.mp4'},story:'札幌，是北海道旅程里亮起的一束光。关于街道、风景和路上的小事，我想在这里慢慢记下。'},
 {id:'hakodate',name:'函馆',en:'Hakodate',together:true,country:'japan',region:'日本 · 北海道',lat:41.7687,lon:140.7288,landmark:'五棱郭塔',model:'observation',image:'images/hakodate-tram.jpg',
  photos:[
   'images/hakodate-tram.jpg', 'images/hakodate-window-mountain.jpg', 'images/hakodate-window-station.jpg',
   'images/hakodate-hot-spring-monkeys.jpg', 'images/hakodate-goryokaku-tower.jpg', 'images/hakodate-goryokaku-window.jpg',
   'images/hokkaido-snow-panorama.jpg', 'images/hakodate-mount-night.jpg', 'images/hakodate-station.jpg'
  ],
  livePhotos:{
   'images/hakodate-tram.jpg':'images/hakodate-tram-live.mp4',
   'images/hakodate-window-mountain.jpg':'images/hakodate-window-mountain-live.mp4',
   'images/hakodate-window-station.jpg':'images/hakodate-window-station-live.mp4',
   'images/hakodate-hot-spring-monkeys.jpg':'images/hakodate-hot-spring-monkeys-live.mp4',
   'images/hakodate-goryokaku-tower.jpg':'images/hakodate-goryokaku-tower-live.mp4',
   'images/hakodate-goryokaku-window.jpg':'images/hakodate-goryokaku-window-live.mp4',
   'images/hokkaido-snow-panorama.jpg':'images/hokkaido-snow-panorama-live.mp4',
   'images/hakodate-mount-night.jpg':'images/hakodate-mount-night-live.mp4',
   'images/hakodate-station.jpg':'images/hakodate-station-live.mp4'
  },
  story:'北海道的另一站，函馆。从市电车窗望出去，街边还留着积雪。'},
 {id:'biei',name:'美瑛',en:'Biei',country:'japan',region:'日本 · 北海道',lat:43.5882,lon:142.467,landmark:'白须瀑布',model:'waterfall',image:'images/biei-waterfall.jpg',
  photos:['images/biei-waterfall.jpg'],
  livePhotos:{'images/biei-waterfall.jpg':'images/biei-waterfall-live.mp4'},
  story:'白金温泉旁，水从覆雪的岩壁落下，汇进蓝绿色的美瑛川。'},
 {id:'otaru',name:'小樽',en:'Otaru',together:true,country:'japan',region:'日本 · 北海道',lat:43.1907,lon:140.9947,landmark:'小樽运河仓库',model:'warehouse',image:'images/otaru-3491.jpg',
  photos:['images/otaru-3491.jpg', 'images/otaru-3670.jpg', 'images/otaru-3689.jpg', 'images/otaru-3677.jpg', 'images/otaru-penguin.jpg', 'images/otaru-dolphin.jpg'],
  livePhotos:{
   'images/otaru-3491.jpg':'images/otaru-3491-live.mp4',
   'images/otaru-3670.jpg':'images/otaru-3670-live.mp4',
   'images/otaru-3689.jpg':'images/otaru-3689-live.mp4',
   'images/otaru-3677.jpg':'images/otaru-3677-live.mp4',
   'images/otaru-penguin.jpg':'images/otaru-penguin-live.mp4',
   'images/otaru-dolphin.jpg':'images/otaru-dolphin-live.mp4'
  },
  story:'把小樽放进记忆的地图里。走过的街角、停留的片刻，会在这里慢慢展开。'},
 {id:'tokyo',name:'东京',en:'Tokyo',country:'japan',region:'日本 · 关东',lat:35.6762,lon:139.6503,landmark:'东京塔',model:'tower',image:'images/tokyo-tower-park.jpg',
  photos:['images/tokyo-tower-park.jpg', 'images/tokyo-zojoji.jpg', 'images/tokyo-meiji-jingu.jpg', 'images/tokyo-yoyogi-park.jpg',
   'images/tokyo-yoyogi-path.jpg', 'images/tokyo-ginza-installation.jpg', 'images/tokyo-coffee-beans.jpg', 'images/tokyo-coffee-tasting.jpg'],
  livePhotos:{
   'images/tokyo-tower-park.jpg':'images/tokyo-tower-park-live.mp4',
   'images/tokyo-zojoji.jpg':'images/tokyo-zojoji-live.mp4',
   'images/tokyo-meiji-jingu.jpg':'images/tokyo-meiji-jingu-live.mp4',
   'images/tokyo-yoyogi-park.jpg':'images/tokyo-yoyogi-park-live.mp4',
   'images/tokyo-yoyogi-path.jpg':'images/tokyo-yoyogi-path-live.mp4',
   'images/tokyo-ginza-installation.jpg':'images/tokyo-ginza-installation-live.mp4',
   'images/tokyo-coffee-beans.jpg':'images/tokyo-coffee-beans-live.mp4',
   'images/tokyo-coffee-tasting.jpg':'images/tokyo-coffee-tasting-live.mp4'
  },
  story:'从芝公园的树间望见东京塔，也拍下了明治神宫和代代木公园的绿意。'},
 {id:'matsudo',name:'松户',en:'Matsudo',country:'japan',region:'日本 · 千叶',lat:35.7876,lon:139.9032,landmark:'常盘平',model:'neighborhood',image:'images/matsudo-tokiwadaira.jpg',
  photos:['images/matsudo-tokiwadaira.jpg'],
  livePhotos:{'images/matsudo-tokiwadaira.jpg':'images/matsudo-tokiwadaira-live.mp4'},
  story:'松户常盘平，树影落在住宅旁的草地上。'},
 {id:'osaka',name:'大阪',en:'Osaka',country:'japan',region:'日本 · 关西',lat:34.6937,lon:135.5023,landmark:'大阪城',model:'castle',image:'images/osaka-takoyaki.jpg',
  photos:['images/osaka-takoyaki.jpg', 'images/osaka-tollgate.jpg', 'images/osaka-underground-passage.jpg'],
  story:'从指向大阪的路牌，到夜里亮着红色章鱼招牌的小店。'},
 {id:'kyoto',name:'京都',en:'Kyoto',country:'japan',region:'日本 · 关西',lat:35.0116,lon:135.7681,landmark:'清水寺三重塔',model:'pagoda',image:'images/kyoto-kiyomizu.jpg',
  photos:['images/kyoto-kiyomizu.jpg', 'images/kyoto-inari.jpg', 'images/kyoto-kiyomizu-gate.jpg', 'images/kyoto-kiyomizu-view.jpg'],
  livePhotos:{
   'images/kyoto-kiyomizu.jpg':'images/kyoto-kiyomizu-live.mp4',
   'images/kyoto-inari.jpg':'images/kyoto-inari-live.mp4'
  },
  story:'在京都拍下清水寺的朱红屋檐、伏见稻荷的灯笼，还有从山门望出去的城市。'},
 {id:'fukuoka',name:'福冈',en:'Fukuoka',together:true,country:'japan',region:'日本 · 九州',lat:33.5902,lon:130.4017,landmark:'福冈塔',model:'glass',image:'images/fukuoka.jpg',story:'一页属于福冈的旅行手记。从看过的风景开始，慢慢整理值得分享的路线和故事。'},
 {id:'kumamoto',name:'熊本',en:'Kumamoto',country:'japan',region:'日本 · 九州',lat:32.8032,lon:130.7073,landmark:'熊本城',model:'castle',image:'images/fukuoka.jpg',story:'在九州的旅行地图上标记熊本。照片和游记待整理。'},
 {id:'takamori',name:'高森',en:'Takamori',country:'japan',region:'日本 · 熊本',lat:32.8545,lon:131.1587,landmark:'上色见熊野座神社',model:'temple',image:'images/takamori-shrine-gate.jpg',
  photos:['images/takamori-shrine-gate.jpg', 'images/takamori-shrine-hall.jpg'],
  story:'雨雾里，石灯笼沿着参道排开，走过鸟居就是上色见熊野座神社的拜殿。'},
 {id:'takachiho',name:'高千穗',en:'Takachiho',country:'japan',region:'日本 · 宫崎',lat:32.7020,lon:131.3010,landmark:'高千穗峡',model:'waterfall',image:'images/takachiho-gorge.jpg',
  photos:['images/takachiho-gorge.jpg', 'images/takachiho-iwato-river.jpg'],
  livePhotos:{
   'images/takachiho-gorge.jpg':'images/takachiho-gorge-live.mp4',
   'images/takachiho-iwato-river.jpg':'images/takachiho-iwato-river-live.mp4'
  },
  story:'从岩户的急流走到高千穗峡，看瀑布沿着雨中的岩壁落下。'},
 {id:'minamiaso',name:'南阿苏',en:'Minamiaso',country:'japan',region:'日本 · 熊本',lat:32.8846,lon:131.0568,landmark:'草千里',model:'garden',image:'images/minamiaso-kusasenri.jpg',
  photos:['images/minamiaso-kusasenri.jpg'],
  livePhotos:{'images/minamiaso-kusasenri.jpg':'images/minamiaso-kusasenri-live.mp4'},
  story:'草千里的风吹过草坡，云影落在水面上。'},
 {id:'minamioguni',name:'南小国',en:'Minamioguni',country:'japan',region:'日本 · 熊本',lat:33.0766,lon:131.1507,landmark:'满愿寺地区',model:'neighborhood',image:'images/minamioguni-mountain-window.jpg',
  photos:['images/minamioguni-mountain-window.jpg'],
  livePhotos:{'images/minamioguni-mountain-window.jpg':'images/minamioguni-mountain-window-live.mp4'},
  story:'南小国满愿寺地区，窗前排着一列酒瓶，窗外是被阳光照亮的山坡。'},
 {id:'murmansk',name:'摩尔曼斯克',en:'Murmansk',country:'russia',region:'俄罗斯 · 北极圈',lat:68.9585,lon:33.0827,landmark:'阿廖沙纪念碑',model:'monument',image:'images/murmansk-square.jpg',
  photos:[
   'images/murmansk-square.jpg', 'images/murmansk-square-night.jpg',
   'images/murmansk-lenin.jpg', 'images/murmansk-port-sign.jpg',
   'images/murmansk-aurora-forest.jpg', 'images/murmansk-aurora-road.jpg'
  ],
  livePhotos:{
   'images/murmansk-square.jpg':'images/murmansk-square-live.mp4',
   'images/murmansk-square-night.jpg':'images/murmansk-square-night-live.mp4',
   'images/murmansk-lenin.jpg':'images/murmansk-lenin-live.mp4',
   'images/murmansk-port-sign.jpg':'images/murmansk-port-sign-live.mp4'
  },
  story:'68° N，旅程向北延伸到摩尔曼斯克。白天看雪中的广场和港口，夜里到科拉区拍下极光。'},
 {id:'moscow',name:'莫斯科',en:'Moscow',country:'russia',region:'俄罗斯 · 莫斯科',lat:55.7558,lon:37.6173,landmark:'圣瓦西里大教堂',model:'cathedral',image:'images/moscow-red-square.jpg',
  photos:['images/moscow-red-square.jpg', 'images/moscow-kremlin-guards.jpg'],
  livePhotos:{
   'images/moscow-red-square.jpg':'images/moscow-red-square-live.mp4',
   'images/moscow-kremlin-guards.jpg':'images/moscow-kremlin-guards-live.mp4'
  },
  story:'在莫斯科留下脚印。雪后的红场、圣瓦西里大教堂，还有克里姆林宫墙边走过的卫兵。'},
 {id:'saint-petersburg',name:'圣彼得堡',en:'St. Petersburg',country:'russia',region:'俄罗斯 · 涅瓦河畔',lat:59.9311,lon:30.3609,landmark:'圣以撒大教堂',model:'dome',image:'images/petersburg-kazan.jpg',
  photos:['images/petersburg-kazan.jpg', 'images/petersburg-museum-lion.jpg', 'images/petersburg-spilled-blood.jpg'],
  livePhotos:{
   'images/petersburg-kazan.jpg':'images/petersburg-kazan-live.mp4',
   'images/petersburg-museum-lion.jpg':'images/petersburg-museum-lion-live.mp4',
   'images/petersburg-spilled-blood.jpg':'images/petersburg-spilled-blood-live.mp4'
  },
  story:'从喀山大教堂走到博物馆的拱廊，最后在积雪的运河边望见滴血救世主教堂。'},
 {id:'bangkok',name:'曼谷',en:'Bangkok',country:'thailand',region:'泰国 · 曼谷',lat:13.7563,lon:100.5018,landmark:'郑王庙',model:'temple',image:'images/bangkok-riverside.jpg',
  photos:['images/bangkok-riverside.jpg'],
  story:'清晨的湄南河边，云层透出一点阳光，照亮了河面。'},
 {id:'pattaya',name:'芭提雅',en:'Pattaya',country:'thailand',region:'泰国 · 东部海岸',lat:12.9236,lon:100.8825,landmark:'真理寺',model:'woodtemple',image:'images/pattaya-harbor.jpg',
  photos:['images/pattaya-harbor.jpg'],
  story:'港湾里停着船，山坡上的 PATTAYA CITY 字样从树梢间露出来。'},
 {id:'phuket',name:'普吉岛',en:'Phuket',together:true,country:'thailand',region:'泰国 · 安达曼海',lat:7.8804,lon:98.3923,landmark:'普吉老城骑楼',model:'shophouse',image:'images/phuket.jpg',photos:[
   'images/phuket.jpg', 'images/phuket-6293.jpg', 'images/phuket-6313.jpg',
   'images/phuket-6112.jpg', 'images/phuket-6136.jpg', 'images/phuket-surin.jpg',
   'images/phuket-6260.jpg', 'images/phuket-6270.jpg'
 ],story:'把海岛放进这颗小星球。先把这趟普吉岛的照片收进相册，旅行路线和故事会慢慢补上。'}
];
