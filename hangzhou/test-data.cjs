const assert=require("node:assert/strict"),fs=require("node:fs"),data=require("./data.json");
const by=s=>data.items.filter(x=>x.status===s);
assert.equal(by("active").length,78);assert.equal(by("permanent").length,29);assert.equal(by("archived").length,44);assert.equal(by("pending").length,11);
assert.equal(new Set(data.items.map(x=>x.id)).size,data.items.length);
const iCityExpected={fl4ptxk:"zhejiang-museum-taipingnian",'0tr04g3':"liangzhu-museum-cong-spectrum",cxt8v0q:"yujia-museum-zhili",nvgi53u:"west-lake-museum-ten-scenes",erbi2jd:"zhejiang-natural-ammonite",dc7r0l8:"kuahuqiao-wenjing-liuguang",e2wivc0:"zhejiang-natural-seashells",'3sbal6m':"zhejiang-museum-jinshi-shuhua-8",'4rscg2x':"china-tea-museum-fengwu-changxin",xo5u03k:"design-museum-montage",ipaflke:"zhejiang-museum-gushan-timin",kdxnbhz:"zju-art-museum-zhizhi-shangxiang",'76blk2w':"yujia-museum-permanent",'3i4p0zl':"zhejiang-museum-gushan-huangbinhong",iqq50li:"wuyue-culture-museum-permanent",'7mk8h6d':"caa-shadow-puppetry",lbcq0kf:"zhejiang-museum-zhijiang-permanent",ffcytxo:"zhejiang-museum-gushan-lacquer",u9j01pb:"southern-song-kiln-permanent",'6rm4n3a':"china-silk-museum-permanent",q8jz0dg:"zhejiang-natural-wildlife-permanent",b1jgmmi:"hangzhou-museum-history",'9afymnl':"zhejiang-museum-gushan-leifeng",wln16mp:"hangzhou-museum-stamps",xov94g8:"hangzhou-museum-excavated-relics",'4rh84eq':"hangzhou-museum-heritage",bhs23ss:"hangzhou-museum-scholars-objects",xern6rm:"zhejiang-natural-permanent",dtdqbw5:"zjam-october-exhibitions"};
const iCityTopLevel=data.items.filter(x=>x.sources?.some(s=>s[1]?.includes("art.icity.ly/events/")));assert.equal(iCityTopLevel.length,29);for(const [sourceId,stableId] of Object.entries(iCityExpected)){const x=data.items.find(x=>x.id===stableId);assert(x,`missing stable ID for iCity ${sourceId}`);assert(x.sources.some(s=>s[1].endsWith('/'+sourceId)),`missing iCity source ${sourceId}`)}assert.equal(Object.keys(iCityExpected).length,29);
for(const id of ["yu-xiangyu-minimum-unit","ashida-all-sounds-concert"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"archived");assert.equal(x.dateStart,"2026-10-18")}
assert.equal(data.items.find(x=>x.id==="yu-xiangyu-minimum-unit").sources[0][1],"https://detail.damai.cn/item.htm?id=1080414047097");
assert(data.items.find(x=>x.id==="ashida-all-sounds-concert").sources[0][1].startsWith("https://weibo.com/2/detail/"));
const drama=data.items.find(x=>x.id==="inter-alia-hangzhou");assert.equal(drama.status,"archived");assert.equal(drama.dateEnd,"2026-10-18");assert.equal(drama.sources.length,2);
const zjam=data.items.find(x=>x.id==="zjam-october-exhibitions");assert.equal(zjam.images.length,3);assert.equal(new Set(zjam.images.map(x=>x.src)).size,3);assert.equal(zjam.exhibitions.length,6);assert.deepEqual(zjam.exhibitions.map(x=>x[1]),["09/22–10/24（已结束）","10/01–10/25（已结束）","10/17–10/30（已结束）","10/17–10/30（已结束）","10/18–11/18","10/17–10/30（已结束）"]);assert(zjam.summary.includes("10/24 结束"));assert(zjam.summary.includes("10/25 结束"));for(const image of zjam.images)assert(image.source.includes("ExbitionDetail.aspx"));
for(const [id,count] of [["zhejiang-museum-taipingnian",5],["liangzhu-museum-cong-spectrum",5],["west-lake-museum-ten-scenes",5],["zhejiang-natural-ammonite",5]]){const x=data.items.find(x=>x.id===id);assert.equal(x.images.length,count);assert.equal(new Set(x.images.map(i=>i.src)).size,count);for(const image of x.images)assert(image.source.startsWith("https://"))}
for(const [id,count,source] of [["zhejiang-natural-seashells",4,"https://www.zmnh.com/web/findImgs?id=28834&page=1&limit=20"],["china-tea-museum-fengwu-changxin",1,"https://www.teamuseum.cn/mobile/information/tempDetail.htm?id=8436"],["zju-art-museum-wumen",1,"https://zjumaa.zju.edu.cn/_s186/main.psp"]]){const x=data.items.find(x=>x.id===id);assert.equal(x.images.length,count);for(const image of x.images){assert(image.src.startsWith("./images/"));assert.equal(image.source,source);const asset=__dirname+"/"+image.src.slice(2);assert(fs.existsSync(asset));assert(fs.statSync(asset).size>10000)}}
const frankie=data.items.find(x=>x.id==="frankie-akil-live-hangzhou");assert.equal(frankie.status,"archived");assert.equal(frankie.dateStart,"2026-10-17");assert.equal(frankie.sources[0][1],"https://www.showstart.com/event/311138");
const fiber=data.items.find(x=>x.id==="pending-tianmuli-fiber-festival");assert.equal(fiber.status,"archived");assert.equal(fiber.schedule,"10/16–10/18 · 每日 12:00–21:00（潮新闻现场报道）");assert.equal(fiber.price,"费用未知（潮新闻报道未披露）");assert.equal(fiber.booking,"预约/入场规则未知（潮新闻报道未披露）");assert.deepEqual(fiber.map.location,[120.098901,30.266540]);assert.equal(fiber.sources[0][1],"https://tidenews.com.cn/news.html?id=3587534");
for(const id of ["pending-ideal-islands-art-market","pending-qincheng-reuse-market-sports"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"pending");assert.equal(x.dateStart,null);assert(x.sources[0][1].includes("6ad088e6000000001802b695"))}
for(const x of data.items){assert(x.id&&x.kind&&x.venue&&x.price&&x.checkedAt);assert(x.sources.length)}
for(const x of by("pending")){assert(x.sourceNoteId&&x.imagePage&&x.itemIndex)}
assert.equal(data.foodItems.length,32);assert.equal(new Set(data.foodItems.map(x=>x.id)).size,data.foodItems.length);
for(const id of ["food-xiangyuandao-gudun","food-wanjiu-shangtang","food-huqia-jingdezhen","food-yangyouxi-xixi"]){const x=data.foodItems.find(x=>x.id===id);assert(x);assert.equal(x.label,"候选");assert.equal(x.checkedAt,"2026-10-17")}const xiangyuan=data.foodItems.find(x=>x.id==="food-xiangyuandao-gudun");assert.equal(xiangyuan.menuTags.length,8);assert(xiangyuan.conditions.includes("近期口碑证据为 0"));assert.equal(xiangyuan.map.poiId,"B023B1DGVZ");assert.deepEqual(xiangyuan.map.location,[120.100487,30.278416]);assert(xiangyuan.sources[1][0].includes("2024-09-13"));
for(const x of data.foodItems){assert(x.id&&x.cuisine&&x.area&&x.title&&x.venue&&x.address&&x.price&&x.conditions&&x.sources.length);assert(!["萧山区","临平区","滨江区"].includes(x.area));for(const source of x.sources)assert(!source[1]?.includes("xiaohongshu.com/search_result/"));assert(x.map||x.mapSearch,"每张美食卡均须有高德入口");if(x.mapSearch){assert(!x.map);assert(x.mapSearch.query);assert(x.mapSearch.url.startsWith("https://www.amap.com/search?query="))}}
for(const id of ["food-xiangfei-tianmuli","food-xiangyuandao-gudun","food-wanjiu-shangtang","food-huqia-jingdezhen","food-yangyouxi-xixi"]){const x=data.foodItems.find(x=>x.id===id);assert(x.dianping?.url.includes("dianping.com/shop/"));assert(["点评菜图","点评店页"].includes(x.dianping.label))}assert(!data.foodItems.find(x=>x.id==="food-luyaoliu-gudun").dianping);
assert.equal(data.foodItems.filter(x=>x.map).length,29);for(const id of ["food-luyaoliu-gudun","food-xiangfei-tianmuli","food-wanjiu-shangtang","food-huqia-jingdezhen","food-xiangyuandao-gudun","food-lanxiangzi-baolong","food-wangshengli-laifushi","food-juchui-xizi","food-chuanxiangguan-youdian","food-xunxiangji-xixi","food-xinfeiteng-huanggu","food-yangyouxi-xixi","food-feidachu-hubin","food-chuanba-qiantang","food-xiaojiangxi-chengbei","food-shihuishi-jializhongxin","food-pho-fun-pingfeng","food-zhuxiaoxing-guangfu","food-henlei-eac","food-now-thaia-tianmuli","food-dian-dou-de-hubin","food-tanggong-mixc","food-yueshun-zancheng","food-xinyaoji-yile","food-dian-dou-de-chengxi","food-fat-pho-mixc"]){const x=data.foodItems.find(x=>x.id===id);assert(x.map?.poiId&&x.map.url.includes("/place/"))}for(const id of ["food-banbudian-hubin","food-dachuan-xinyifang","food-mahongxing-hubin"]){const x=data.foodItems.find(x=>x.id===id);assert(x.mapSearch?.url.includes("amap.com/search?query="))}for(const [id,type] of [["food-dongtian-vietnamese-xixi","building"],["food-sawadsee-wyndham","venue"]]){const x=data.foodItems.find(x=>x.id===id);assert.equal(x.map?.navigation_target_type,type);assert(x.map.url.includes("uri.amap.com/marker"));assert(Array.isArray(x.map.location))}
for(const id of ["zju-art-museum-plum","zhejiang-museum-taipingnian","liangzhu-museum-cong-spectrum","yujia-museum-zhili","west-lake-museum-ten-scenes","zhejiang-natural-ammonite","shye-return-hangzhou","inter-alia-hangzhou"]){const x=data.items.find(x=>x.id===id);assert(x.map?.poiId&&x.map.url.startsWith("https://www.amap.com/place/"))}const inter=data.items.find(x=>x.id==="inter-alia-hangzhou");assert.equal(inter.images.length,1);assert.equal(inter.images[0].src,"./images/inter-alia-tour.jpg");assert.equal(inter.images[0].source,"https://www.sina.cn/news/detail/5336144482140904.html");const localInter=fs.readFileSync(__dirname+"/images/inter-alia-tour.jpg");assert(localInter.length>40000&&localInter.subarray(0,3).toString("hex")==="ffd8ff");
for(const [id,poi,location] of [["zjam-october-exhibitions","B023B0BMJ6",[120.156894,30.231049]],["kuahuqiao-wenjing-liuguang","B023B17X6U",[120.222341,30.141590]],["china-tea-museum-fengwu-changxin","B023B13PFT",[120.120532,30.232381]],["design-museum-montage","B0FFHG8EPA",[120.080129,30.152022]],["zhejiang-museum-gushan-timin","B023B06XVX",[120.143778,30.251243]]]){const x=data.items.find(x=>x.id===id);assert.equal(x.map?.poiId,poi);assert.equal(x.map?.url,`https://www.amap.com/place/${poi}`);assert.deepEqual(x.map?.location,location);assert.equal(x.map?.checkedAt,"2026-10-18");assert(x.map?.note.startsWith("高德 Web Service POI："))}
for(const id of ["food-luyaoliu-gudun","food-xiangfei-tianmuli","food-wanjiu-shangtang"]){const x=data.foodItems.find(x=>x.id===id);assert(x.sources.some(s=>s[1]?.includes("xiaohongshu.com/explore/")));assert(!x.conditions.includes("待补"))}
for(const x of data.foodItems)assert(x.note);
for(const id of ['food-banbudian-hubin','food-dachuan-xinyifang','food-mahongxing-hubin'])assert.equal(data.foodItems.find(x=>x.id===id).note,'图片：未查；'+(id==='food-banbudian-hubin'?'品牌官网菜图不能视为分店实拍。':'未核固定 POI。'));
const page=fs.readFileSync(require.resolve("./index.html"),"utf8");assert(page.includes('class="source-action"'));assert(page.includes("查看原帖 · "));assert(page.includes("data.json?v=hangzhou-official-gallery-20261018-v12"));assert(page.includes("navigation_target_type"));assert(page.includes("高德查看楼宇（非餐厅 POI）"));assert(page.includes("function addDianpingButtons"));assert(page.includes("source-action map-action"));assert(page.includes("来源、菜品与证据边界"));assert(!page.includes('id="foodMap"'));assert(page.includes("data-candidate-id"));assert(page.includes("饭后去哪"));assert(page.includes("gcjToWgs"));assert(page.includes("const foodPoiPhotos"));assert(page.includes("B0ID4YM1YA"));assert(page.includes("activityPoiLocations"));assert(page.includes("activityVenueMaps"));assert(page.includes("function amapActions"));assert(page.includes("function amapSearchUrl"));assert(!page.includes("博主实发海报：好好织时节"));
assert(page.includes("图片：已展示"));assert(page.includes("const key=x=>'hz:'+x.id+':swipe'"));assert(page.includes("function amapAndroidIntent"));assert(page.includes("intent://poi/detail?"));assert(page.includes("intent://viewMap?"));assert(!page.includes("intent://navi?"));assert(page.includes("scheme=amapuri;package=com.autonavi.minimap"));assert(page.includes("scheme=androidamap;package=com.autonavi.minimap"));assert(page.includes("S.browser_fallback_url="));assert(page.includes("dev=0"));assert(page.includes("data-amap-app"));assert(page.includes("网页地点兜底"));
assert(page.includes("after-banshan-hanggang"));assert(page.includes("半山国家森林公园旅游咨询中心（南门附近）"));assert(page.includes("同一南门"));assert(page.includes("B0FFHB2SGB"));assert(page.includes("街道路由为步行 2.42 km／约32分钟"));assert(page.includes("驾车 3.31 km／约10分钟"));assert(page.includes("未核实望宸阁当天是否可入阁"));assert(page.includes("gsb.qybk.cn"));assert(page.includes("ori.hangzhou.com.cn/ornews/content/2024-06/14"));
assert(page.includes("hiking-banshan-hanggang"));assert(page.includes("桃源街站 A 口"));assert(page.includes("BX09905796"));assert(page.includes("B0FFIIMUWQ"));assert(page.includes("山内只标已核地标，不绘制未经核实的山径"));assert(page.includes('class="hiking-amap-overview"'));assert(page.includes("./images/banshan-hanggang-transfer.png"));assert(!page.includes("function renderHikingMap"));assert(!page.includes("hikingMapCanvas"));assert(page.includes("高德步行路线图：咨询中心 → 杭钢南出入口，2.42 km／约 32 分钟。"));for(const id of ["hiking-niangniangmiao-short","hiking-taoyuan-c-short","hiking-jinniu-long"])assert(page.includes(id));assert(page.includes("双宝环游记《半山2KM》"));assert(page.includes("苏苏大王耶《3公里懒人路线》"));assert(page.includes("橙子好吃"));
assert(page.includes('id="hiking-hanggang-photo-positions"'));assert(page.includes("Alex带你看世界"));assert(page.includes("空中连廊／皮带通廊"));assert(page.includes("焦炉水景倒影"));assert(page.includes("图片不转载"));assert(page.includes("6aca3f18000000001303f233"));
assert(page.includes("秋日中的连廊和转运站"));assert(page.includes("淬火倒影池"));assert(page.includes("被回收红砖包裹的秘密花园"));assert(page.includes("868129665_100098692"));assert(page.includes("2128ce79ebdc42c5bf7621a3496276ec.jpeg"));assert(page.includes("de5d69b7207e43e9b0021db64d386d09.jpeg"));assert(page.includes("b17c9e53742f49f39c6958b228d61512.jpeg"));
for(const venue of ["浙江美术馆","跨湖桥遗址博物馆","杭州剧院","中国湿地博物馆","西溪湿地·周家村入口","良渚古城遗址公园","中国茶叶博物馆（双峰馆区）","中国国际设计博物馆","浙江省博物馆（孤山馆区）","中国丝绸博物馆","杭州博物馆"])assert(page.includes(`'${venue}'`));
assert(page.indexOf('<section id="foodPanel"')<page.indexOf('id="foodCards"'));assert(page.indexOf('id="foodCards"')>page.indexOf('</section>\n<section id="foodPanel"'));
const foodCardCode=page.slice(page.indexOf("function foodCard"),page.indexOf("function focusFood"));const foodCard=new Function("localStorage","navigator","document","location",foodCardCode+";return foodCard")({getItem:()=>null},{userAgent:"Mozilla/5.0 (Linux; Android 15) Chrome/130"},{querySelectorAll:()=>[]},{href:"https://example.test/"});const luyaoliu=foodCard(data.foodItems.find(x=>x.id==="food-luyaoliu-gudun"));assert(luyaoliu.includes('class="source-action"'));assert(luyaoliu.includes('查看原帖 · 桥桥瞧世界'));assert(luyaoliu.includes('href="https://www.xiaohongshu.com/explore/6a65d041000000000a0386d7?xsec_token=ABGIK2PayN28TURANkxOsqupjSmb2mw2QOywbgOa4OPAg=&xsec_source=pc_search&source=web_search_result_notes"'));assert(luyaoliu.includes('intent://poi/detail?poiname='));assert(luyaoliu.includes('lat=30.294116&lon=120.09931&poiid=B0LKYB434Y'));assert(luyaoliu.includes('package=com.autonavi.minimap'));assert(luyaoliu.includes('网页地点兜底'));assert(luyaoliu.includes('https://uri.amap.com/marker?poiid=B0LKYB434Y&src=HangzhouGuide&callnative=0'));assert(!luyaoliu.includes('intent://navi?'));for(const x of data.foodItems){const html=foodCard(x);assert(html.includes('map-action'));assert(html.includes(x.map?(['building','venue'].includes(x.map.navigation_target_type)?'高德查看':'高德查看地点'):'App 搜店（待确认）'));assert(html.indexOf('map-action')<html.indexOf('<details>'));assert(html.includes(`data-candidate-id="${x.id}"`));if(!x.map){assert(html.includes('intent://poi?sourceApplication=HangzhouGuide'));assert(html.includes('网页搜索兜底'))}}
const cardCode=page.slice(page.indexOf("function card"),page.indexOf("function foodCard"));const card=new Function("localStorage","eventVisual","const type=()=>'',bucket=()=>'',dateLabel=()=>'';"+cardCode+";return card")({getItem:()=>null},x=>`<p class="research-status">图片：${x.imageNote||"未记录"}</p>`);const yujia=data.items.find(x=>x.id==="yujia-museum-zhili"),yujiaCard=card(yujia);assert.equal(yujia.map.poiId,"B0JGVA5ULY");assert.equal(yujia.map.url,"https://www.amap.com/place/B0JGVA5ULY");assert(yujiaCard.includes("iCity 页面图不可转载"));assert(yujiaCard.includes('href="https://www.amap.com/place/B0JGVA5ULY"'));assert(yujiaCard.includes("打开高德地点"));assert(card(data.items.find(x=>x.id==="liangzhu-museum")).includes("高德搜索（未定点）"));assert(foodCard(data.foodItems.find(x=>x.id==="food-luyaoliu-gudun")).includes('https://uri.amap.com/marker?poiid=B0LKYB434Y'));assert(foodCard(data.foodItems.find(x=>x.id==="food-xiangyuandao-gudun")).includes("https://uri.amap.com/marker?poiid=B023B1DGVZ"));
for(const id of ["zhejiang-museum-taipingnian","liangzhu-museum-cong-spectrum","yujia-museum-zhili","west-lake-museum-ten-scenes","zhejiang-natural-ammonite","kuahuqiao-wenjing-liuguang"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,x.id==="zhejiang-museum-taipingnian"?"archived":"active");assert(x.exhibitionType);assert(x.sources[0][1].startsWith("https://art.icity.ly/events/"))}
assert.equal(data.meta.weekLabel,"本周 · 11月23日–11月29日");assert.equal(data.meta.weather.validThrough,"2026-11-29");assert.equal(data.meta.weather.days.length,2);
for(const id of ["zhejiang-natural-seashells","zhejiang-museum-jinshi-shuhua-8","charlie-puth-whatevers-clever-hangzhou","zhejiang-museum-liujiang-donation","hangzhou-traditional-village-market-20261023-25","nuancun-farmers-market-20261023-25","watcha-ai-expo-hangzhou-20261024-25","pending-bread","pending-feiren"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"archived");assert.equal(x.dateEnd,"2026-10-25")}
const charlie=data.items.find(x=>x.id==="charlie-puth-whatevers-clever-hangzhou");assert.equal(charlie.map.poiId,"B023B0283F");assert(charlie.price.includes("不代表实时余票"));
const liujiang=data.items.find(x=>x.id==="zhejiang-museum-liujiang-donation");assert.equal(liujiang.address,"之江文化中心 · 四楼书画馆 A");assert.equal(liujiang.map.poiId,"B0I15SU50Z");
for(const image of ["banshan-jinniu-loop-xhs.webp","banshan-niangniangmiao-stairs-xhs.webp","banshan-taoyuan-c-route-xhs.webp"]){const asset=__dirname+"/images/"+image;assert(fs.existsSync(asset),`missing hiking image ${image}`);assert(fs.statSync(asset).size>100000,`small hiking image ${image}`);assert(page.includes("./images/"+image),`unreferenced hiking image ${image}`)}
const fixedMap=__dirname+"/images/banshan-northup-fixed.png";assert(fs.existsSync(fixedMap));assert(fs.statSync(fixedMap).size>100000);assert(page.includes("./images/banshan-northup-fixed.png"));assert(page.includes("data-filter=\"徒步\""));assert(!page.includes("data-top-tab=\"hiking\""));assert(!page.includes("banshan-route-relationship.svg"));assert(page.includes("data-zoom-map"));
for(const image of ["banshan-jinniu-loop-xhs.webp"]){const asset=__dirname+"/images/"+image;assert(fs.existsSync(asset));assert(fs.statSync(asset).size>100000);assert(page.includes("./images/"+image))}assert(!page.includes("hiking-unified-overview.svg"));assert(!page.includes("setInterval(()=>{document.querySelectorAll('.hiking-overview"));
assert(page.includes("原帖第 3/17 图"));assert(page.includes("原帖第 1/9 图"));assert(page.includes("原帖第 1/18 图"));
const jinniuPoints=require("./banshan-jinniu-a-points.json");assert.equal(jinniuPoints.length,123);assert.deepEqual(jinniuPoints[0],[368.33,1106.33]);assert.deepEqual(jinniuPoints.at(-1),[369,880]);assert(page.includes('id="hiking-jinniu-primary"'));assert(page.includes('viewBox="0 0 1080 1932"'));assert(page.includes('banshan-jinniu-a-points.json'));assert(page.includes('B 作者完整原轨迹'));assert(page.includes('西侧前段至望宸阁，原路返回（本站截取）'));assert(page.includes('11.60 km／4:39:26／爬升 543 m'));assert(page.includes('右岔 · 图 5 看图提醒'));assert(!page.includes('class="track-b"'));
const whiteRoute=__dirname+"/images/banshan-white-route-extracted.svg",hanggangOverlay=__dirname+"/images/hanggang-south-route-overlay.svg";assert(fs.existsSync(whiteRoute));assert.equal(require("node:crypto").createHash("sha256").update(fs.readFileSync(whiteRoute)).digest("hex"),"6b549a6d339ec05dea3f4c80b003ed9c8f61264f8e484333c6d1ac7baab4e3c0");assert(page.includes("banshan-white-route-extracted.svg"));assert(page.includes("保留原图朝向"));assert(fs.existsSync(hanggangOverlay));const overlay=fs.readFileSync(hanggangOverlay,"utf8");assert(overlay.includes("viewBox=\"0 0 4723 2725\""));assert(page.includes("hanggang-south-route-overlay.svg"));assert(page.includes("width=\"4723\" height=\"2725\""));assert(page.includes("看游线"));assert(page.includes("看全园"));console.log("hangzhou activity data: ok");

// October 20 official additions: opening time is distinct from performance time.
assert(page.includes("fetch('./data.json?v=hangzhou-weekend-20261124-v78')"));
const mengchuan=data.items.find(x=>x.id==="mengchuan-haobuhao-hangzhou-20261114");assert.equal(mengchuan.dateStart,"2026-11-14");assert(mengchuan.booking.includes("2026-10-20 14:00"));assert(mengchuan.price.includes("未知"));
const luxiansen=data.items.find(x=>x.id==="luxiansen-outdoor-linping-20261031");assert.equal(luxiansen.dateStart,"2026-10-31");assert(luxiansen.price.includes("¥288")&&luxiansen.price.includes("¥388"));assert(!luxiansen.price.includes("¥188"));
const moli=data.items.find(x=>x.id==="1024-moli-ai-community-day-20261024");assert.equal(moli.dateStart,"2026-10-24");assert.equal(moli.kind,"市集");assert(moli.venue.includes("云谷之芯"));assert(moli.booking.includes("二维码"));
const tse=data.items.find(x=>x.id==="nicholas-tse-evolution-hangzhou-20261114-15");assert.equal(tse.dateStart,"2026-11-14");assert.equal(tse.dateEnd,"2026-11-15");assert(tse.schedule.includes("19:00"));assert(tse.booking.includes("13:00")&&tse.booking.includes("13:20"));assert(tse.price.includes("¥1680"));assert(tse.booking.includes("实名要求与商品链接待核"));
const curley=data.items.find(x=>x.id==="curley-g-new-realm-hangzhou-20261121");assert.equal(curley.dateStart,"2026-11-21");assert.equal(curley.schedule,"演出：2026-11-21 19:00（北京时间）");assert(curley.booking.includes("资格条件待核"));assert.equal(curley.price,"票价未知；当前余票未知");assert(curley.sources.some(s=>s[1]==="https://www.sina.cn/news/detail/5353497954091672.html"));
for(const id of ["design-museum-montage","pending-liangzhu-autumn-antique-market"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"archived");assert.equal(x.dateEnd,"2026-10-20")}
const farm=data.items.find(x=>x.id==="nuancun-farmers-market-20261023-25");assert.equal(farm.kind,"市集");assert.equal(farm.dateStart,"2026-10-23");assert.equal(farm.dateEnd,"2026-10-25");assert.equal(farm.status,"archived");assert(farm.sources[1][1].includes("amap.com/search"));
const photo=data.items.find(x=>x.id==="zhejiang-photography-art-exhibition-20260918-1031");assert.equal(photo.kind,"展览");assert.equal(photo.dateEnd,"2026-10-31");assert.equal(photo.price,"免费");assert.equal(photo.booking.startsWith("免预约"),true);assert(photo.schedule.includes("每日开放时间未知"));
const modelFest=data.items.find(x=>x.id==="hangzhou-international-model-culture-festival-20261030-1101");assert.equal(modelFest.dateStart,"2026-10-30");assert.equal(modelFest.dateEnd,"2026-11-01");assert(modelFest.schedule.includes("16:30 停止入场"));assert(modelFest.price.includes("¥80 起"));assert(modelFest.booking.includes("身份证原件与二维码"));
const liangzhuMarket=data.items.find(x=>x.id==="pending-liangzhu-creative-market");assert.equal(liangzhuMarket.status,"archived");assert(liangzhuMarket.booking.includes("线上专区长期销售不等于线下延长"));
const chunhuo=data.items.find(x=>x.id==="chunhuo-chushan-market-20261030-1101");assert.equal(chunhuo.kind,"市集");assert.equal(chunhuo.dateStart,"2026-10-30");assert.equal(chunhuo.dateEnd,"2026-11-01");assert(chunhuo.schedule.includes("11/01 12:00–17:00"));assert(chunhuo.price.includes("待核"));assert(chunhuo.booking.includes("待主办方后续公告核实"));assert.equal(chunhuo.map.poiId,"B023B1FB36");assert.deepEqual(chunhuo.map.location,[120.216803,30.241827]);assert(chunhuo.sources[0][1].includes("hznews.hangzhou.com.cn"));assert(chunhuo.sources[1][1].includes("xjnnet.com"));
const watcha=data.items.find(x=>x.id==="watcha-ai-expo-hangzhou-20261024-25");assert.equal(watcha.kind,"展览");assert.equal(watcha.dateStart,"2026-10-24");assert.equal(watcha.dateEnd,"2026-10-25");assert.equal(watcha.status,"archived");assert(watcha.price.includes("金猹奖盛典另付费"));assert(!watcha.map);assert(watcha.sources.at(-1)[1].includes("amap.com/search"));
const villageMarket=data.items.find(x=>x.id==="hangzhou-traditional-village-market-20261023-25");assert.equal(villageMarket.kind,"市集");assert.equal(villageMarket.dateEnd,"2026-10-25");assert.equal(villageMarket.status,"archived");assert(villageMarket.price.includes("未知"));assert(!villageMarket.map);assert(villageMarket.sources.some(s=>s[1].includes("9351904")));
const blood=data.items.find(x=>x.id==="blood-plus-live-hangzhou-20261108");assert.equal(blood.status,"active");assert.equal(blood.schedule,"演出：2026-11-08 19:30–22:30（北京时间）");assert(blood.price.includes("早鸟 ¥66")&&blood.price.includes("双人 ¥150"));assert(blood.sources[0][1].includes("showstart.com/event/311887"));assert(blood.sources[1][1].includes("amap.com/search"));
const yuhangMarket=data.items.find(x=>x.id==="yuhang-haoshi-wuchang-market-20261024-1122");assert.equal(yuhangMarket.status,"active");assert.equal(yuhangMarket.dateEnd,"2026-11-22");assert(yuhangMarket.schedule.includes("连续五个周末"));assert(yuhangMarket.schedule.includes("市集每日16:00–23:00"));assert(yuhangMarket.schedule.includes("周末主题演艺周六、日18:00–21:00"));assert.equal(yuhangMarket.images.length,2);assert(yuhangMarket.schedule.includes("16:00–23:00"));assert.equal(yuhangMarket.venue,"GFC绿城西溪未来里");assert(yuhangMarket.price.includes("免费入场")&&yuhangMarket.price.includes("消费另计"));assert(yuhangMarket.booking.includes("未注明预约要求"));assert(yuhangMarket.sources.some(s=>s[1].includes("tidenews.com.cn/news.html?id=3599383")));assert(yuhangMarket.sources.some(s=>s[1].includes("9350072")));assert(yuhangMarket.imageNote.includes("主办方宣传图"));
const dragonGate=data.items.find(x=>x.id==="new-dragon-gate-inn-hangzhou-202611");assert.equal(dragonGate.kind,"演出");assert.equal(dragonGate.dateStart,null);assert.equal(dragonGate.dateEnd,null);assert(dragonGate.schedule.includes("具体演出日时待官方"));assert(dragonGate.price.includes("未知"));assert(dragonGate.booking.includes("10/24 开票"));assert(!dragonGate.map);assert(dragonGate.sources[0][1].includes("5356789484487348"));
for(const id of ["pending-kaguya","1024-moli-ai-community-day-20261024"])assert.equal(data.items.find(x=>x.id===id).status,"archived");

const hushan=data.items.find(x=>x.id==="hushan-youci-library-salon-20261101");assert(hushan.schedule.includes("15:30")&&hushan.schedule.includes("16:00"));assert.equal(hushan.map.poiId,"B023B0BN0M");const jianlai=data.items.find(x=>x.id==="jianlai-concert-hangzhou-20261211-12");assert.equal(jianlai.dateEnd,"2026-12-12");assert(jianlai.booking.includes("2026-10-26 11:00"));

// October 29 additions: preserve source certainty and distinguish attendance from registration.
assert.equal(data.meta.checkedAt,'2026-11-24');
const career=data.items.find(x=>x.id==='career-persuasiveness-library-20261101');assert.equal(career.kind,'体验');assert.equal(career.dateStart,'2026-11-01');assert.equal(career.dateEnd,'2026-11-01');assert(career.schedule.includes('11/01（周日）10:30–12:00（北京时间）')&&career.schedule.includes('已于 2026-11-01 结束'));assert(career.booking.includes('20人')&&career.booking.includes('品质文化生活圈')&&career.booking.includes('余位未知'));assert(career.price.includes('未注明'));assert.equal(career.map.poiId,'B023B0BN0M');assert.equal(career.images[0].source,'https://www.zjhzlib.cn/hdygjz/8243.htm');
const careerImage=fs.readFileSync(__dirname+'/images/career-persuasiveness-library-20261101.webp');assert(careerImage.length>100000);assert.equal(careerImage.subarray(0,4).toString(),'RIFF');assert.equal(careerImage.subarray(8,12).toString(),'WEBP');
const museumCases=data.items.find(x=>x.id==='hangzhou-museum-city-cases-20261111-20270614');assert.equal(museumCases.kind,'展览');assert.equal(museumCases.dateStart,'2026-11-11');assert.equal(museumCases.dateEnd,'2027-06-14');assert(museumCases.address.includes('北馆二楼临展厅'));assert(museumCases.schedule.includes('每日开放时刻与闭馆安排待馆方确认'));assert(museumCases.price.includes('未知')&&museumCases.booking.includes('未知'));assert(!museumCases.map);assert(museumCases.sources[0][1].includes('9358292.htm'));assert(museumCases.sources[1][1].startsWith('https://www.amap.com/search?query='));assert(!museumCases.images?.length);
for(const id of ['career-persuasiveness-library-20261101','hangzhou-museum-city-cases-20261111-20270614']){const x=data.items.find(x=>x.id===id);assert.equal(x.status,id==='career-persuasiveness-library-20261101'?'archived':'active');assert.equal(x.checkedAt,id==='career-persuasiveness-library-20261101'?'2026-10-30':'2026-10-29');assert(x.booking.includes('未代'));}
console.log('PASS: October 29 source certainty, dates, registration boundaries, map targets, and image provenance');

// October 30: appreciation is not a live performance; monthly previews may change.
for(const [id,date,room] of [['gershwin-porgy-bess-appreciation-library-20261101','2026-11-01','二楼HIFI1室2'],['lp-vinyl-appreciation-library-20261107','2026-11-07','二楼HIFI室1']]){
  const x=data.items.find(x=>x.id===id);assert(x);assert.equal(x.kind,'体验');assert.equal(x.status,date==='2026-11-01'?'archived':'active');assert.equal(x.dateStart,date);assert.equal(x.dateEnd,date);assert.equal(x.checkedAt,'2026-10-30');assert(x.venue.endsWith(room));assert(x.schedule.includes('14:00开始')&&x.schedule.includes('结束时刻未公布'));assert(x.subtitle.includes('非现场演奏会'));assert(x.price.includes('费用未公布'));assert(x.booking.includes('无需报名')&&x.booking.includes('未列独立开票时间')&&x.booking.includes('提前预告'));assert(!x.images?.length);assert.equal(x.map.poiId,'B023B0BN0M');assert(x.map.url.startsWith('https://www.amap.com/place/'));assert.equal(x.sources[0][1],'https://www.zjhzlib.cn/hdyghz/8255.htm');
}
assert(career.title.includes('主题待核'));assert(career.subtitle.includes('10/28')&&career.subtitle.includes('10/29')&&career.subtitle.includes('主题冲突'));assert(career.booking.includes('86535079'));assert(career.sources.some(s=>s[1].endsWith('/8243.htm'))&&career.sources.some(s=>s[1].endsWith('/8255.htm')));assert(career.images[0].caption.includes('不能作最终主题确认'));
assert.equal(hushan.venue,'杭州图书馆（市民中心）三楼研究室九');assert.equal(hushan.checkedAt,'2026-10-30');assert(hushan.summary.includes('录入错误'));assert(hushan.schedule.includes('10/29官方月表列16:00')&&hushan.schedule.includes('15:30'));assert(hushan.booking.includes('86535082'));assert(hushan.sources.some(s=>s[1].endsWith('/8233.htm'))&&hushan.sources.some(s=>s[1].endsWith('/8255.htm')));assert(hushan.images[0].caption.includes('三楼研究室九'));
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(__dirname+'/images/hushan-youci-library-20261101.png')).digest('hex'),'ee431916446b8e65cd65d7097b2cf68ec5120eda94290f13cd9620a5477708da');
console.log('PASS: October 30 music appreciation, preview/fee boundaries, stable same-event conflicts, and corrected Hushan room');

// October 31: retain stable composite ID, distinguish uncertain end dates and admission.
assert(zjam.title.includes('五项已结束'));assert(zjam.summary.includes('10/30 结束'));assert(!zjam.summary.includes('可一次到访'));
const xu=data.items.find(x=>x.id==='zjam-xuboqing-centenary-20261103');assert.equal(xu.dateStart,'2026-11-03');assert.equal(xu.dateEnd,null);assert(xu.schedule.includes('2027-10-15')&&xu.schedule.includes('待馆方复核'));assert(xu.booking.includes('2023')&&xu.price.includes('未知'));assert.equal(xu.map.poiId,'B023B0BMJ6');assert(xu.address.includes('7、8、9'));
const marathon=data.items.find(x=>x.id==='hangzhou-marathon-memory-exhibition-20261029');assert.equal(marathon.dateStart,'2026-10-29');assert.equal(marathon.dateEnd,null);assert(marathon.venue.includes('原冠军楼'));assert(marathon.price.includes('不等于免费'));assert(marathon.booking.includes('未知'));assert(!marathon.map);assert(marathon.sources[1][1].startsWith('https://www.amap.com/search?query='));
for(const x of [xu,marathon]){assert.equal(x.checkedAt,'2026-10-31');assert.equal(x.status,'active');assert(!x.images?.length)}
assert(fs.readFileSync(__dirname+'/index.html','utf8').includes('hangzhou-weekend-20261124-v78'));
console.log('PASS: October 31 museum additions, dated policy, unknown end/admission, and composite archive boundaries');

// November 1: archive only ended dated events, preserving IDs and original source check dates.
for(const id of ["luxiansen-outdoor-linping-20261031", "zhejiang-photography-art-exhibition-20260918-1031", "guqin-xinsheng-library-20261031"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"archived");assert.equal(x.dateEnd,"2026-10-31")}

const adm=data.items.find(x=>x.id==='adm-insight-southwest-20261105-08');assert.equal(adm.kind,'市集');assert.equal(adm.dateStart,'2026-11-05');assert.equal(adm.dateEnd,'2026-11-08');assert.equal(adm.status,'active');assert(adm.venue.includes('1号厂房'));assert(adm.price.includes('未知')&&adm.price.includes('不代表免费'));assert(adm.booking.includes('首次开票时间')&&adm.booking.includes('未知'));assert(!adm.map&&!adm.images?.length);assert(adm.sources[2][1].startsWith('https://www.amap.com/search?query='));
console.log('PASS: November 1 ended events and ADM official preview/unknown ticket boundaries');

// November 2: dated events ended on November 1, not routine Monday closures.
for(const id of ["zhejiang-museum-taipingnian", "hangzhou-international-model-culture-festival-20261030-1101", "chunhuo-chushan-market-20261030-1101", "hushan-youci-library-salon-20261101", "career-persuasiveness-library-20261101", "gershwin-porgy-bess-appreciation-library-20261101"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"archived");assert.equal(x.dateEnd,"2026-11-01");assert.equal(x.archivedAt,"2026-11-02")}
assert.equal(data.meta.weekLabel,"本周 · 11月23日–11月29日");
console.log("PASS: November 2 dated archive and week rollover");

const songci=data.items.find(x=>x.id==="songyun-liusheng-songci-library-20261107");assert.equal(songci.dateStart,"2026-11-07");assert.equal(songci.dateEnd,"2026-11-07");assert(songci.schedule.includes("14:30–16:30"));assert(songci.price.includes("免费")&&songci.booking.includes("当前余位未知"));assert.equal(songci.map.poiId,"B023B0BN0M");assert(songci.images[0].caption.includes("AI生成示意")&&songci.images[0].caption.includes("非现场实拍"));assert.equal(songci.sources[0][1],"https://www.zjhzlib.cn/hdygyy/8259.htm");

// November 3: distinguish XR film, dated ticket availability and refund uncertainty.
const xr=data.items.find(x=>x.id==='wangsulong-romance-city-xr-hangzhou-20261114-1213');assert.equal(xr.kind,'体验');assert.equal(xr.dateStart,'2026-11-14');assert.equal(xr.dateEnd,'2026-12-13');assert(xr.subtitle.includes('非艺人真人到场'));assert(xr.booking.includes('2026-11-02 18:00')&&xr.booking.includes('有冲突'));assert(xr.price.includes('¥138')&&xr.price.includes('其他日期可购状态'));assert.equal(xr.map.poiId,'B0FFHSMO63');assert.equal(xr.map.navigation_target_type,'building');assert(xr.images[0].caption.includes('非现场实拍'));assert(xr.sources.some(s=>s[1]==='https://www.showstart.com/event/314336'));

const football=data.items.find(x=>x.id==='zhejiang-henan-csl-huanglong-20261108');assert.equal(football.kind,'体验');assert.equal(football.dateStart,'2026-11-08');assert(football.schedule.includes('15:30'));assert(football.booking.includes('2026-11-03 14:00')&&football.booking.includes('退改规则未核'));assert(football.price.includes('主场票价、票档与余票未知')&&football.price.includes('不作为本场通用价格'));assert.equal(football.map.poiId,'B023B0283F');assert.equal(data.items.length,162);
console.log('PASS: November 3 new ticket announcements, XR/football distinctions, and ticket-rule boundaries');

// November 4: concrete ADM opening hours and outdoor chrysanthemums; no invented ticket terms.
assert.equal(adm.checkedAt,'2026-11-04');assert(adm.schedule.includes('11:00–20:00')&&adm.schedule.includes('11:00–17:00'));assert(adm.schedule.includes('拟安排'));assert(adm.address.includes('杭氧街33号'));assert(adm.sources.some(s=>s[1].endsWith('content_9366511.htm')));
const chrysanthemum=data.items.find(x=>x.id==='hangzhou-botanical-chrysanthemum-exhibition-20261103-30');assert.equal(chrysanthemum.kind,'展览');assert.equal(chrysanthemum.status,'active');assert.equal(chrysanthemum.dateStart,'2026-11-03');assert.equal(chrysanthemum.dateEnd,'2026-11-30');assert(chrysanthemum.venue.includes('玉泉鱼跃'));assert(chrysanthemum.price.includes('未知')&&chrysanthemum.price.includes('不含夜游'));assert(chrysanthemum.booking.includes('未代购票'));assert(chrysanthemum.summary.includes('主分会场合计'));assert(!chrysanthemum.map&&!chrysanthemum.images?.length);assert(chrysanthemum.sources[2][1].startsWith('https://www.amap.com/search?query='));
assert(!data.items.some(x=>x.status==='active'&&x.dateEnd&&x.dateEnd<'2026-11-04'));
console.log('PASS: November 4 ADM hours, chrysanthemum scope, and unknown admission boundaries');

// November 5: new film ticket notice and agricultural expo public-access boundaries.
const german=data.items.find(x=>x.id==='festival-german-cinema-hangzhou-20261114-23');assert.equal(german.dateStart,'2026-11-14');assert.equal(german.dateEnd,'2026-11-23');assert(german.booking.includes('2026-11-04 12:00'));assert(german.booking.includes('不退不换'));assert(german.price.includes('80元')&&german.price.includes('服务费'));assert(german.schedule.includes('北京'));assert.equal(german.map.poiId,"B0FFM9CQ8J");assert.equal(german.sources[0][1],'https://www.festivalofgermancinema.com/');
const agriculture=data.items.find(x=>x.id==='zhejiang-agricultural-expo-hangzhou-20261113-16');assert.equal(agriculture.dateStart,'2026-11-13');assert.equal(agriculture.dateEnd,'2026-11-16');assert(agriculture.schedule.includes('09:00–18:00')&&agriculture.schedule.includes('17:30')&&agriculture.schedule.includes('一期展厅仅对专业观众'));assert(agriculture.price.includes('免费')&&agriculture.price.includes('另按现场标价'));assert(agriculture.booking.includes('身份证')&&agriculture.booking.includes('未知'));assert.equal(agriculture.map.poiId,'B0HRZ5NQ31');assert(agriculture.address.includes('不代表本届入场闸口'));assert(agriculture.imageNote.includes('往届'));
for(const x of [german,agriculture]){assert.equal(x.checkedAt,x===german?'2026-11-16':'2026-11-05');assert.equal(x.status,x===german?'archived':'active');if(x===agriculture)assert(!x.images?.length)}
console.log('PASS: November 5 film opening time, city-specific schedule, free-entry boundaries and venue mapping');
const hamburg=data.items.find(x=>x.id==='hamburg-neue-philharmonie-linping-20270110');assert.equal(hamburg.dateStart,'2027-01-10');assert.equal(hamburg.dateEnd,'2027-01-10');assert(hamburg.schedule.includes('19:30'));assert(hamburg.booking.includes('2026-11-04 11:18'));assert(hamburg.price.includes('除惠民票外五折')&&hamburg.price.includes('¥50惠民票不再折'));assert.equal(hamburg.map.poiId,'B0HD2ZAPQ2');assert.equal(hamburg.sources[0][1],'https://www.sina.cn/news/detail/5361474257028572.html');
console.log('PASS: January concert stays distinct from November ticket release and discount exclusions');

// November 16 recovery preserves old items, sources and historical check dates.
assert.equal(data.items.length,162);
for(const id of ["fanxiaoxuan-100-hangzhou-20270116", "bwf-world-tour-finals-hangzhou-20261209-13", "aire-wangyitai-hangzhou-20261226", "langlang-hangzhou-20270116", "archery-asia-cup-hangzhou-20261116-21", "karate-world-cup-hangzhou-20261120-22", "heideng-xianshangche-hangzhou-20261128", "fuchun-shengshantu-20261110-1206", "youshihuijin-hangzhou-20261119", "jiamu-hangzhou-20261211-12", "zenless-live-fes-hangzhou-20261127-29", "chentianrun-re01-hangzhou-20261218", "liangchen-guofeng-hangzhou-20261226"]){const x=data.items.find(x=>x.id===id);assert(x);assert(x.sources.length>=2);assert(x.booking.includes("未代"));assert(x.dateEnd>="2026-11-16");}

// November 16 weekend selection: no silent archive loss or pass recommendations.
assert.equal(data.meta.priorWeekendXhsIds.length,34);
const picks=data.meta.priorWeekendXhsIds.map(id=>data.items.find(x=>x.id===id));assert(picks.every(Boolean));assert.equal(picks.filter(x=>x.status==="pending").length,8);
for(const id of ["archery-asia-cup-hangzhou-20261116-21","karate-world-cup-hangzhou-20261120-22","fuchun-shengshantu-20261110-1206","hangzhou-botanical-chrysanthemum-exhibition-20261103-30"]){assert(!data.meta.priorWeekendXhsIds.includes(id));assert(data.items.some(x=>x.id===id));}
assert(german.schedule.includes("16:30《镜的第三乐章》"));assert(german.address.includes("L3-38"));assert(page.includes("weekendPending"));console.log("PASS: 34 weekend cards, 8 clearly pending, German sessions and retained original archives");

const sportsImages=data.items.find(x=>x.id==="tianmuli-afterwork-sports-20261120-29");assert.equal(sportsImages.images.length,2);assert(sportsImages.schedule.includes("11/27–29")&&sportsImages.schedule.includes("不代表"));for(const i of sportsImages.images){assert(i.caption.includes("非现场实拍"));assert(i.source.endsWith("6af6e0590000000018029ab5"));assert(fs.statSync(__dirname+"/"+i.src).size>100000);}console.log("PASS: two real official posters, bounded dates, source attribution; online validation remains separate");

// Caption and source must follow the active slide, including a round trip.
const updateMetaSource=page.match(/function updateGalleryMetadata\(track\)\{[\s\S]*?\}\nfunction bind/)[0].replace(/\nfunction bind$/,'');
const updateMeta=require('node:vm').runInNewContext('('+updateMetaSource+')');
const frames=[{dataset:{source:'https://example.org/first',caption:'主海报'}},{dataset:{source:'https://example.org/second',caption:'开学说明'}}],counter={},sourceLink={};
const track={scrollLeft:0,clientWidth:400,querySelectorAll:()=>frames,parentElement:{querySelector:s=>s==='.gallery-count'?counter:sourceLink}};
for(const [left,count,caption,href] of [[0,'1 / 2','主海报','first'],[400,'2 / 2','开学说明','second'],[0,'1 / 2','主海报','first']]){track.scrollLeft=left;updateMeta(track);assert.equal(counter.textContent,count);assert.equal(sourceLink.textContent,'图片来源：'+caption);assert.equal(sourceLink.href,'https://example.org/'+href)}
assert(page.includes('data-source="${p.source'));
console.log('PASS: carousel counter, per-image caption and source follow next/previous slides');

// November 17 primary-source update keeps stable IDs and evidence boundaries.
for(const id of ["pending-boz-burger-202611","pending-crybaby-202611"]){const x=data.items.find(x=>x.id===id);assert.equal(x.status,"active");assert.equal(x.checkedAt,id==="pending-crybaby-202611"?"2026-11-22":"2026-11-17");assert(x.images.some(p=>p.caption.includes("参考")||p.caption.includes("资料照")))}
const warm=data.items.find(x=>x.id==="liangzhu-nuancun-markets-20261120-22");assert(warm.schedule.includes("10:30–18:30"));assert(warm.schedule.includes("11/21–22 10:00–17:00"));assert(warm.schedule.includes("每日时段据良渚5000+艺创账号原帖"));assert(warm.summary.includes("账号认证未独立核实"));assert(warm.summary.includes("并非本周取消"));assert.equal(warm.checkedAt,"2026-11-21");assert(warm.sources.some(s=>s[1].endsWith("6afab8d8000000001f015c90")));assert(warm.sources.some(s=>s[1].endsWith("6afc3d28000000002b030c93")));assert(warm.images.some(p=>p.caption.includes("指南自制地点示意")&&p.caption.includes("非现场照片")));

const zhang=data.items.find(x=>x.id==="zjam-zhangshijian-centenary-20261101-21");assert.equal(zhang.dateEnd,"2026-11-21");assert(zhang.schedule.includes("16:30"));assert(zhang.subtitle.includes("补录"));assert(zhang.price.includes("收费特展另行公告"));assert(zhang.booking.includes("个人参观无需提前预约"));assert(zhang.booking.includes("2023/9/4")&&zhang.booking.includes("非11/21当日实时核验"));assert(zhang.images.some(p=>p.caption.includes("非本次展览现场或作品")));

const wetland=data.items.find(x=>x.id==="meiyuji-wetland-market-20261120-22");assert.equal(wetland.checkedAt,"2026-11-18");assert(wetland.summary.includes("非两份完全独立证据"));assert(wetland.price.includes("未知"));assert(wetland.booking.includes("室内博物馆"));assert(wetland.sources.some(s=>s[1].endsWith("6af56f48000000002203a574")));assert(wetland.images.some(p=>p.caption.includes("2011年资料照")));

const baobao=data.items.find(x=>x.id==="gongshu-burger-festival-20261119-22");assert.equal(baobao.dateStart,"2026-11-19");assert.equal(baobao.venue,"杭州大悦城户外广场");assert(baobao.summary.includes("起始日期冲突"));assert(baobao.schedule.includes("每天开放时段未知"));assert(baobao.subtitle.includes("非新天地BOZ"));assert(baobao.images.some(p=>p.caption.includes("非本届汉堡节")));

const item44=id=>data.items.find(x=>x.id===id);assert(item44("pending-xiaoyi-birthday-202611").booking.includes("购买周边无需预约"));assert(item44("pending-shenshende-fan-202611").schedule.includes("14:30–18:30"));assert(item44("pending-shenshende-fan-202611").subtitle.includes("周深本人不到场"));assert(item44("pending-shanhun-ruyuan-202611").booking.includes("≥30级"));assert(item44("pending-bairen-dinner-202611").booking.includes("千粉以上"));assert(item44("pending-guofeng-handcraft-202611").schedule.includes("周一、周二休市"));

assert(german.images.some(p=>p.src==="https://www.festivalofgermancinema.com/assets/image/2026/background-mb.jpg"&&p.caption.includes("非杭州活动现场")));

const jyc=data.items.find(x=>x.id==='jiangyuchen-hangzhou-20261219');assert.equal(jyc.dateStart,'2026-12-19');assert(jyc.booking.includes('2026/11/19 12:00'));assert(jyc.price.includes('未'));
const nfjm=data.items.find(x=>x.id==='nanfang-youjiamu-hangzhou-20261125-26');assert.equal(nfjm.dateEnd,'2026-11-26');assert(nfjm.summary.includes('不称今日新官宣'));

const parade=data.items.find(x=>x.id==="anfang-shanzeli-drama-parade-20261121");assert.equal(parade.dateEnd,"2026-11-21");assert(parade.price.includes("未核"));
assert.equal(parade.map.poiId,"B0JDC5VDJB");assert.equal(parade.map.url,"https://www.amap.com/place/B0JDC5VDJB");assert(parade.address.includes("聚才路239号")&&parade.address.includes("非巡游集合点"));

// Reference-photo captions do not override separately verified event evidence.
for(const id of ["pending-boz-burger-202611","pending-cake-giveaway-202611"]){const x=data.items.find(x=>x.id===id);assert(!x.images.some(p=>p.caption.includes("活动仍待核")));assert(x.images.some(p=>p.caption.includes("不是")));}

// November 20: distinct screening dates, phase-specific venue, and safe booking boundaries.
const film = item44('style-kaleidoscope-hangzhou-20261121-22');
assert(film.schedule.includes('11/21（周六）13:00《小城之春》') && film.schedule.includes('11/22（周日）13:00《野草莓》'));
assert.equal(film.map.poiId,'B023B14BCH');assert.equal(film.images.filter(p=>!p.source.includes('xiaohongshu.com/explore/')).length,2);assert(film.price.includes('未能核实'));
const expo = item44('hangzhou-historic-industries-expo-20261120-22');
assert(expo.venue.includes('二期3层')&&expo.schedule.includes('16:30')&&expo.booking.includes('余量未核'));
assert.equal(expo.map.poiId,'B0HRZ5NQ31');assert(expo.images.some(p=>p.caption.includes('非官方海报')));
assert(fs.existsSync(__dirname+'/'+expo.images[0].src));
const phase2 = item44('zhejiang-museum-taipingnian-phase2-20261125');
assert.equal(phase2.dateStart,'2026-11-25');assert.equal(phase2.dateEnd,'2027-02-25');assert.equal(item44('zhejiang-museum-taipingnian').status,'archived');
assert(phase2.booking.includes('不保证')&&!data.meta.priorWeekendXhsIds.includes(phase2.id));
assert.equal(jyc.area,'富阳区');assert(jyc.address.includes('银湖路379号')&&jyc.schedule.includes('未从'));
console.log('PASS: Nov 20 film showtimes, Phase 2 expo access, museum ticket boundary, and venue address');


// The current weekend galleries and swipe previews share the verified Xiaohongshu-only filter.
const weekendVisualCode=page.slice(page.indexOf('const verifiedWeekendXhsImages'),page.indexOf('function card'));
const fallbackPoster=['fallback.jpg','https://example.com/poster','fallback poster'];
const fallbackId='test-fallback';
const regularId='test-non-weekend';
const weekendVisual=new Function('weekendIds','posters','priorWeekendXhsIds',weekendVisualCode+';return {eventImages,eventVisual}')(
  [...data.meta.priorWeekendXhsIds,fallbackId],{[fallbackId]:fallbackPoster,[regularId]:fallbackPoster},[]);
const selectedItems=data.meta.priorWeekendXhsIds.map(id=>data.items.find(item=>item.id===id));
const actualXhsImages=selectedItems.flatMap(x=>weekendVisual.eventImages(x));
assert.equal(actualXhsImages.length,189);
assert.equal(selectedItems.filter(x=>weekendVisual.eventImages(x).length).length,34);
const reviews=require('./image-review.json').items;
for(const item of selectedItems){
  const images=weekendVisual.eventImages(item);
  if(images.length){
    assert(['ready','displayed'].includes(reviews[item.id].status));
    if (reviews[item.id].imageCount !== undefined) assert.equal(reviews[item.id].imageCount,images.length);
    for(const image of images){
      assert.match(image.source,/^https:\/\/www\.xiaohongshu\.com\/explore\/[0-9a-f]{24}$/);
      assert(reviews[item.id].sources.includes(image.source));
      assert(fs.existsSync(require('node:path').resolve(__dirname,image.src)));
    }
    assert.match(weekendVisual.eventVisual(item), /class="event-gallery"/);
    assert.equal((weekendVisual.eventVisual(item,true).match(/<img /g)||[]).length,1);
  }else{
    for(const firstOnly of [false,true]){
      assert.match(weekendVisual.eventVisual(item,firstOnly),/暂无已核实的小红书配图/);
      assert.doesNotMatch(weekendVisual.eventVisual(item,firstOnly),/<img|class="event-gallery"/);
    }
  }
}
const sports=selectedItems.find(x=>x.id==='tianmuli-afterwork-sports-20261120-29');
const unverified={src:'another.jpg',source:sports.images[0].source};
assert.equal(weekendVisual.eventImages({...sports,images:[unverified,...sports.images]}).length,2);
assert.equal(weekendVisual.eventImages({...sports,images:[{...sports.images[0],source:'https://notxiaohongshu.com/explore/6af6e0590000000018029ab5'}]}).length,0);
assert.deepEqual(weekendVisual.eventImages({id:fallbackId}),[]);
assert.equal(weekendVisual.eventImages({id:regularId})[0].src,'fallback.jpg');
assert.deepEqual(weekendVisual.eventImages({id:regularId,images:[unverified]}),[unverified]);
assert(page.includes('visual=eventVisual(x)'));
assert(page.includes('swipeCard.innerHTML=`\${eventVisual(x,true)}'));
console.log('PASS: weekend list and swipe share 189 individually verified Xiaohongshu images; no other image fallback');

// November 21: timed visit corrections, weather, and future events remain separate from weekend picks.
assert.equal(data.meta.checkedAt,'2026-11-24');
assert.match(data.meta.weather.checkedAt,/2026-11-24 核查/);
assert.deepEqual(data.meta.weather.days.map(day=>[day.low,day.high]),[[7,18],[7,17]]);
assert(data.meta.weather.days.every(day=>day.condition.includes("晴")));
assert.match(parade.schedule,/14:00–15:00、17:30–18:30（仅该剧团）/);
assert.match(parade.schedule,/市集时段、巡游集合点和路线未核/);
assert(data.meta.priorWeekendXhsIds.includes(parade.id));
assert.equal(weekendVisual.eventImages(parade).length,9);
assert(weekendVisual.eventImages(parade).every(im=>im.source.endsWith('6b0156050000000018029e5c')&&im.caption.includes('不据画面区分具体时段或剧团')));
assert(['ready','displayed'].includes(reviews[parade.id].status));
const ammonite=item44('zhejiang-natural-ammonite');
assert.match(ammonite.schedule,/09:30–17:00（16:00 停止入馆）/);
assert.match(ammonite.booking,/周末及法定节假日需线上预约.*3 天.*免预约/);
assert.match(expo.address,/参考 A2 口.*现场指引/);
assert.match(expo.booking,/工坊需在同一小程序另查预约.*周末场次、余量及收费未核/);
assert.match(german.summary,/曲院风荷附近沿北山街走到断桥／少年宫/);
assert.match(page,/after-beishanjie.*曲院风荷附近沿北山街走到断桥／少年宫/);
const meetup=item44('agentic-data-stack-meetup-hangzhou-20261128');
assert.equal(meetup.dateStart,'2026-11-28');assert.equal(meetup.dateEnd,meetup.dateStart);
assert.match(meetup.booking,/需审核，余位未公开/);
assert(!data.meta.priorWeekendXhsIds.includes(meetup.id)&&!meetup.images?.length);
assert.equal(meetup.sources[0][1],'https://luma.com/3g0i5hc6');
assert(!weekendVisual.eventImages(meetup).length);
console.log('PASS: Nov 21 updated access, weather, and future meetup outside weekend picks');

const bookMarket=item44('hangzhou-confucius-temple-book-market-20261121-22');
assert(data.meta.priorWeekendXhsIds.includes(bookMarket.id));
assert.equal(bookMarket.map.poiId,'B023B0BG4J');
assert(/全场开闭市时间未核/.test(bookMarket.schedule)&&/仅是童书摊主场次/.test(bookMarket.schedule));
assert(/是否预约未核/.test(bookMarket.booking));
assert(weekendVisual.eventImages(bookMarket).some(img=>img.source.endsWith('6b0139ba000000002a01a7f6')));
const tiantan=item44('bjiff-tiantan-hangzhou-20261128-29');
assert(!data.meta.priorWeekendXhsIds.includes(tiantan.id)&&tiantan.dateStart==='2026-11-28');
assert.equal(tiantan.map.poiId,'B0L2O5VV1C');
assert(/单片具体时刻/.test(tiantan.schedule)&&/库存/.test(tiantan.booking));
assert.equal(german.map.poiId,'B0FFM9CQ8J');
assert(weekendVisual.eventImages(german).some(img=>img.source.endsWith('6adcd206000000003301395c')));
assert(baobao.sources.some(([label,url])=>label.includes('仅在原帖查看')&&url.endsWith('6af3de3600000000160335c7')));
assert(weekendVisual.eventImages(baobao).some(img=>img.source.endsWith('6affe959000000002b02afd6')));
console.log('PASS: book market access, future film listing, exact theater-area map and reference-only notes');

// 周末延长日期与其他市集时段不混用。
assert(warm.schedule.includes('古美术市集：11/20 10:00–18:00、11/21–22 10:00–21:00'));
assert(warm.schedule.includes('好好生活农夫市集：11/20 12:00–18:00、11/21–22 10:30–18:30'));
assert(warm.schedule.includes('自然和风手工市集：11/21–22 10:00–17:00'));
assert(warm.sources.some(([label,url])=>label.includes('11/20 22:11')&&url.endsWith('6b003343000000002b01886d')));

assert(['古美术市集','好好生活农夫市集','自然和风手工市集'].every(name=>weekendVisual.eventImages(warm).some(im=>im.caption.includes(name))), '三个子市集分别有准确活动图片');

const fries=item44('pending-fries-challenge-202611');
assert.equal(fries.title,'薯条免费吃');
assert.equal(fries.status,'active');
assert.match(fries.schedule,/11\/21 17:30.*一楼/);
assert.match(fries.summary,/锤子大赛.*另一个项目/);
assert.match(fries.booking,/实时余量/);
assert.equal(weekendVisual.eventImages(fries).length,3);
console.log('PASS: D32 fries are not a contest');

const crab=item44('pending-crab-race-202611');
assert.match(crab.schedule,/11\/21 13:00.*1F舞台.*本场已结束/);
assert.match(crab.summary,/11\/7.*不采用/);
assert.equal(weekendVisual.eventImages(crab).length,3);
console.log('PASS: Crab race is a confirmed past event');

const tanwan=item44('pending-jinshahu-tanwan-202611');
assert.equal(tanwan.status,'active');
assert.match(tanwan.schedule,/11\/21–22.*开闭时段未核/);
assert.equal(weekendVisual.eventImages(tanwan).length,4);
assert(weekendVisual.eventImages(tanwan)[0].source.endsWith('6afd885b000000002903e69c'));
assert.equal(selectedItems.filter(x=>!weekendVisual.eventImages(x).length).length,0);
console.log('PASS: Tanwan has a distinct direct announcement and every selected card has at least one sourced visual');

// Targeted asset recovery must preserve stable card IDs, provenance, and the actual original image sequence.
const ordinals=images=>images.map(image=>+image.src.match(/-(\d+)\.webp$/)[1]);
const recoveredCry=weekendVisual.eventImages(item44('pending-crybaby-202611'));
assert.deepEqual(ordinals(recoveredCry),[1,2,3,4,5,6,7,8]);
assert(recoveredCry.every(image=>image.source.endsWith('6af7e65e000000001802c98e')));
const recoveredZhang=weekendVisual.eventImages(zhang);
assert.deepEqual(ordinals(recoveredZhang),[1,2,3,6,8,10,11,12,13,14,15,16,17,18]);
assert(recoveredZhang.every(image=>image.source.endsWith('6afefebf0000000009020320')));
const warmImages=weekendVisual.eventImages(warm);
assert.deepEqual(ordinals(warmImages.filter(image=>image.source.endsWith('6afe944b000000002a00dd04'))),[1,2,3]);
assert(warmImages[0].caption.includes('好好生活农夫市集'));
console.log('PASS: targeted XHS recovery preserves original ordinals and lead-image intent');

const recoveredExpo=weekendVisual.eventImages(expo);
assert.deepEqual(ordinals(recoveredExpo),[1,2,3,4,5,6,7,8,9,10,13,14,15,16,17,18]);
assert.match(reviews[expo.id].noteFrames['颗颗原帖已发布组'],/第11张.*无稳定文件；第12张.*未转载/);
assert.deepEqual(ordinals(weekendVisual.eventImages(wetland)),[1,2,4,5,6]);
assert.deepEqual(ordinals(weekendVisual.eventImages(item44('pending-guofeng-handcraft-202611'))),[1,2,3,4,5,6,7,8,9,10]);
console.log('PASS: v75 recovered source ordinals and defers missing or sensitive assets');

assert.deepEqual(ordinals(weekendVisual.eventImages(film)),[3,2,5,6]);
assert.match(weekendVisual.eventImages(film)[2].caption,/票夹.*非私人票据/);

// A frozen featured ID can move into archive on the next Shanghai date; it does not leave the selection.
const rolloverCode=page.slice(page.indexOf('function bucket('),page.indexOf('function applyFilters('))+
  page.slice(page.indexOf('function splitPlayItems('),page.indexOf('function updateGalleryMetadata('));
const swipePoolSource=page.slice(page.indexOf('function weekendSwipePool('),page.indexOf("const key=x=>'hz:'+x.id+':swipe'"));
const rollout=new Function('today','items','weekendIds','$','card','bind','applyFilters',
  rolloverCode+swipePoolSource+';return {render,splitPlayItems,weekendSwipePool,bucket};');
const fixedIds=data.meta.priorWeekendXhsIds;
const oneDay=item44('chenxiaochun-hangzhou-20261121');
const saturdayPending=item44('pending-cake-giveaway-202611');
const sundayStart=item44('kiana-lede-hangzhou-20261122');
const fixedDate=(utc)=>new Date(utc).toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});
for(const [utc,expectedDate,archiveCount] of [
  ['2026-11-21T15:59:59Z','2026-11-21',0],
  ['2026-11-21T16:00:00Z','2026-11-22',14],
  ['2026-11-22T16:00:00Z','2026-11-23',26],
]){
  const today=fixedDate(utc), elements=new Map(), rendered=[];
  assert.equal(today,expectedDate);
  const jq=k=>elements.get(k)||elements.set(k,{innerHTML:'',hidden:false}).get(k);
  const historicalItems=data.items.map(x=>x.id===german.id&&x.archivedAt>today?{...x,status:'active'}:x);
  const api=rollout(today,historicalItems,fixedIds,jq,item=>{rendered.push(item.id);return `<article data-fixture="${item.id}"></article>`;},()=>{},()=>{});
  const groups=api.splitPlayItems(historicalItems,fixedIds);
  assert.equal(groups.archive.filter(x=>fixedIds.includes(x.id)).length,archiveCount);
  api.render();
  assert.equal(rendered.length,data.items.length);
  assert.equal(new Set(rendered).size,data.items.length);
  const has=(group,item)=>jq('#'+group).innerHTML.includes(`data-fixture="${item.id}"`);
  assert.equal(has('archive',oneDay),today!=='2026-11-21');
  assert.equal(has('weekendPicks',oneDay),today==='2026-11-21');
  assert.equal(has('archive',saturdayPending),today!=='2026-11-21');
  assert.equal(has('weekendPending',saturdayPending),today==='2026-11-21');
  assert.equal(has('archive',bookMarket),today==='2026-11-23');
  assert.equal(has('weekendPicks',bookMarket),today!=='2026-11-23');
  assert.equal(has('weekendPicks',sundayStart),today!=='2026-11-23');
  assert.equal(fixedIds.includes(oneDay.id),true);
  assert(weekendVisual.eventImages(oneDay).length>0);
  const swipe=api.weekendSwipePool(historicalItems,fixedIds,today,true,false,api.bucket);
  assert.equal(swipe.some(x=>x===oneDay),today==='2026-11-21');
  assert.equal(swipe.some(x=>x===bookMarket),today!=='2026-11-23');
  if(today==='2026-11-21')assert(swipe.some(x=>x===sundayStart),'Saturday planning includes Sunday without implying it is today');
}
console.log('PASS: Shanghai weekend rollover archives ended cards once and retains Sunday options/images');

const sundayLookup=id=>data.items.find(x=>x.id===id);
const mamian=sundayLookup('hzcac-mamianqun-20261120-20270321');
assert.equal(mamian.dateEnd,'2027-03-21');assert.equal(mamian.map.poiId,'B023B0I02U');assert(mamian.price.includes('免费')&&mamian.schedule.includes('周二闭馆')&&mamian.booking.includes('未核'));
const kcd=sundayLookup('cncf-kcd-hangzhou-20261128');
assert.equal(kcd.dateStart,'2026-11-28');assert.equal(kcd.map.poiId,'B0JGFUQ5DH');assert(kcd.schedule.includes('09:30–17:30')&&kcd.schedule.includes('09:00 签到')&&kcd.address.includes('A6')&&kcd.booking.includes('全天视频号直播')&&kcd.price.includes('未核实')&&kcd.booking.includes('剩余名额未知'));
for(const x of [mamian,kcd]){assert(!data.meta.priorWeekendXhsIds.includes(x.id));assert(!x.images?.length);assert(x.imageNote.includes('暂无已核实的小红书配图'))}
const cryLong=sundayLookup('pending-crybaby-202611');
assert.equal(cryLong.dateEnd,'2027-02-28');assert.equal(cryLong.map.poiId,'B0FFM9CQ8J');assert(cryLong.schedule.includes('2027/01/03'));assert.equal(cryLong.images.filter(x=>x.source.includes('xiaohongshu')).length,8);
console.log('PASS: November 22 separate exhibit and market dates, precise venues, registration uncertainty and image boundaries');

const week77=data.meta.weekendSelection.map(sundayLookup);
assert.equal(week77.length,8);
assert(week77.every(x=>x.status==='active'&&x.dateEnd>='2026-11-28'&&x.dateStart<='2026-11-29'));
assert(week77.find(x=>x.id.startsWith('guozhuang-')).schedule.includes('16:30'));
assert(week77.find(x=>x.id.startsWith('zhejiang-museum-endless')).booking.includes('个人进馆免预约'));
assert(sundayLookup('liangzhu-museum-cong-spectrum').booking.includes('个人免预约'));
const wk77Visual=new Function('weekendIds','posters','priorWeekendXhsIds',weekendVisualCode+';return {eventImages,eventVisual}')(
 data.meta.weekendSelection,{},data.meta.priorWeekendXhsIds);
assert.equal(wk77Visual.eventImages(sundayLookup('liangzhu-museum-cong-spectrum')).length,5);
assert.equal(week77.flatMap(x=>wk77Visual.eventImages(x)).length,2);
assert.equal(data.meta.priorWeekendXhsIds.flatMap(id=>wk77Visual.eventImages(sundayLookup(id))).length,189);
for(const x of week77) assert(reviews[x.id],x.id);
console.log('PASS: Nov 23 weekly selection, closed-window facts, exact venues and historical XHS galleries');

const lowCarbon=sundayLookup('hangzhou-low-carbon-west-lake-art-20261118-1202');
const mural=sundayLookup('qiantang-bay-mural-exchange-20261020-1128');
assert.equal(lowCarbon.map.poiId,'B023B1944R');assert.equal(lowCarbon.dateEnd,'2026-12-02');assert(lowCarbon.price.includes('免费')&&lowCarbon.booking.includes('实体身份证'));
assert.equal(mural.map.poiId,'B0JB3HFDE2');assert.equal(mural.dateEnd,'2026-11-28');assert(mural.price.includes('未公布'));
for(const x of [lowCarbon,mural]){assert.equal(reviews[x.id].status,'unreviewed');assert.equal(wk77Visual.eventImages(x).length,0)}
assert.equal(sundayLookup('festival-german-cinema-hangzhou-20261114-23').status,'archived');
assert(!sundayLookup('bjiff-tiantan-hangzhou-20261128-29').subtitle.includes('下周末'));
assert.equal(data.meta.weather.validThrough,'2026-11-29');
assert.deepEqual(data.meta.weather.days.map(x=>[x.date,x.low,x.high]),[['2026-11-28',7,18],['2026-11-29',7,17]]);
console.log('PASS: Nov 24 art picks, confirmed event logistics, exact pins, weather window and image boundary');
