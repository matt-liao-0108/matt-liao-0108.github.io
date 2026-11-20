import * as THREE from './vendor/three.module.min.js';
import { cities } from './data/cities.js?v=20261120-2';
import { createCountryLayer } from './country-layer.js';
import { createWeatherLayer } from './weather.js';

const $ = id => document.getElementById(id);
const dialog = $('city-dialog');
const photoDialog = $('photo-dialog');
const photoStage = $('full-photo-stage');
const liveVideo = $('full-photo-video');
const liveBadge = $('full-photo-live');
let liveSource;
let liveHold;
let livePlayback = 0;
const liveHoldDelay = 400;
const liveMoveTolerance = 12;
liveBadge.title = '播放实况，也可长按照片';

function stopLivePhoto() {
  livePlayback += 1;
  liveVideo.pause();
  liveVideo.hidden = true;
  liveBadge.setAttribute('aria-pressed', 'false');
}

async function playLivePhoto() {
  if (!liveSource) return;
  const attempt = ++livePlayback;
  if (!liveVideo.hasAttribute('src')) liveVideo.src = liveSource;
  liveVideo.muted = false;
  liveVideo.currentTime = 0;
  liveBadge.setAttribute('aria-pressed', 'true');

  try {
    await liveVideo.play();
  } catch (error) {
    if (attempt !== livePlayback || error.name === 'AbortError') return;
    if (error.name === 'NotAllowedError') {
      liveVideo.muted = true;
      try {
        await liveVideo.play();
        return;
      } catch (retryError) {
        if (attempt !== livePlayback || retryError.name === 'AbortError') return;
      }
    }
    stopLivePhoto();
  }
}

function finishLiveHold(event) {
  if (!liveHold || (event && liveHold.pointerId !== event.pointerId)) return;
  if (liveHold.timer !== undefined) clearTimeout(liveHold.timer);
  else stopLivePhoto();
  liveHold = undefined;
}

liveVideo.onplaying = () => { if (!liveVideo.paused) liveVideo.hidden = false; };
liveVideo.onended = stopLivePhoto;

photoStage.onpointerdown = event => {
  if (!liveSource || liveHold || !event.isPrimary || event.button !== 0 || liveBadge.contains(event.target)) return;
  photoStage.setPointerCapture(event.pointerId);
  liveHold = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    timer: setTimeout(() => {
      liveHold.timer = undefined;
      playLivePhoto();
    }, liveHoldDelay)
  };
};
photoStage.onpointermove = event => {
  if (!liveHold || liveHold.timer === undefined || event.pointerId !== liveHold.pointerId) return;
  if (Math.hypot(event.clientX - liveHold.x, event.clientY - liveHold.y) > liveMoveTolerance) finishLiveHold(event);
};
photoStage.onpointerup = finishLiveHold;
photoStage.onpointercancel = finishLiveHold;
photoStage.onlostpointercapture = finishLiveHold;
photoStage.oncontextmenu = event => { if (liveSource) event.preventDefault(); };

liveBadge.onclick = () => {
  if (liveBadge.getAttribute('aria-pressed') === 'true') stopLivePhoto();
  else playLivePhoto();
};
photoDialog.addEventListener('close', () => {
  finishLiveHold();
  stopLivePhoto();
  liveSource = undefined;
  if (!liveVideo.hasAttribute('src')) return;
  liveVideo.removeAttribute('src');
  liveVideo.load();
});

function previewPhoto(src, description, caption, videoSrc) {
  const image = $('full-photo');
  image.src = src;
  image.alt = description;
  liveSource = videoSrc;
  liveBadge.hidden = !liveSource;
  photoStage.classList.toggle('has-live', Boolean(liveSource));
  $('full-photo-caption').textContent = liveSource ? `${caption} · 长按照片播放实况` : caption;
  photoDialog.showModal();
}
$('close-photo').onclick = () => photoDialog.close();
let selected = cities.find(city => city.id === 'sapporo'), activeFilter = 'all', globeApi;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coordinates = c => `${Math.abs(c.lat).toFixed(4)}° ${c.lat < 0 ? 'S' : 'N'} / ${Math.abs(c.lon).toFixed(4)}° ${c.lon < 0 ? 'W' : 'E'}`;
$('year').textContent = new Date().getFullYear();

const countryOrder = ['japan', 'russia', 'thailand'];

function renderChips() {
  const host = $('city-chips');
  host.replaceChildren();
  for (const city of visibleCities()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('city-chip');
    button.classList.toggle('active', selected === city);
    button.classList.toggle('together', Boolean(city.together));
    button.textContent = city.name;
    button.setAttribute('aria-label', `探索${city.name}${city.together ? '，一起去过' : ''}，${coordinates(city)}`);
    button.setAttribute('aria-pressed', String(selected === city));
    button.onclick = () => selectCity(city);
    host.append(button);
  }
}
function visibleCities() {
  return countryOrder.flatMap(country => activeFilter === 'all' || activeFilter === country
    ? cities.filter(city => city.country === country) : []);
}
function selectCity(city) {
  selected = city;
  $('preview-image').src = city.image;
  $('preview-image').alt = city.photos?.length ? `${city.name}旅行照片` : `${city.name}相册占位示例照片`;
  $('preview-photo-note').hidden = Boolean(city.photos?.length);
  $('preview-photo').setAttribute('aria-label', `打开${city.name}手记`);
  $('preview-country').textContent = city.region;
  $('preview-title').replaceChildren(document.createTextNode(city.name));
  const en = document.createElement('span'); en.textContent = city.en; $('preview-title').append(en);
  $('preview-coordinates').textContent = coordinates(city);
  $('preview-description').textContent = city.story;
  renderChips();
  globeApi?.focus(city);
}
function switchTab(tab) {
  document.querySelectorAll('[data-tab]').forEach(b => { b.classList.toggle('active', b.dataset.tab === tab); b.setAttribute('aria-pressed', String(b.dataset.tab === tab)); });
  $('memories-panel').hidden = tab !== 'memories'; $('guide-panel').hidden = tab !== 'guide';
}
function openCity() {
  const c = selected;
  const hasTripPhotos = Boolean(c.photos?.length);
  $('city-cover').src = c.image;
  $('city-cover').alt = hasTripPhotos ? `${c.name}旅行照片` : `${c.name}相册占位示例`;
  $('city-cover-note').hidden = hasTripPhotos;
  $('city-placeholder-note').hidden = hasTripPhotos;
  $('city-region').textContent = c.region; $('city-dialog-title').textContent = c.name; $('city-english').textContent = c.en;
  $('city-coordinates').textContent = coordinates(c); $('city-lead').textContent = c.story;
  $('city-landmark').textContent = `星球上的小建筑 · ${c.landmark}`;
  const photos = hasTripPhotos ? c.photos : [c.image, c.country === 'japan' ? 'images/osaka.jpg' : c.country === 'russia' ? 'images/saint-petersburg.jpg' : 'images/bangkok.jpg'];
  $('city-photos').replaceChildren(...photos.map((src, i) => {
    const figure = document.createElement('figure'); const img = document.createElement('img'); img.src = src; img.alt = `${c.name}${hasTripPhotos ? '旅行照片' : '相册占位照片'} ${i + 1}`; img.loading = 'lazy';
    const cap = document.createElement('figcaption'); cap.textContent = hasTripPhotos ? `${c.name} · 旅行实拍` : `旅行相册 ${String(i + 1).padStart(2, '0')} · 示例占位`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-preview';
    const videoSrc = c.livePhotos?.[src];
    button.setAttribute('aria-label', `放大第 ${i + 1} 张照片${videoSrc ? '（实况）' : ''}`);
    button.onclick = () => previewPhoto(src, img.alt, cap.textContent, videoSrc);
    button.append(img);
    if (videoSrc) {
      const badge = document.createElement('span');
      badge.className = 'live-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = 'LIVE';
      button.append(badge);
    }
    figure.append(button, cap);
    return figure;
  }));
  switchTab('memories');
  if (!dialog.open) dialog.showModal();
  $('city-dialog-scroll').scrollTop = 0;
}
const countryFilters = document.querySelectorAll('[data-filter]');
function setCountryFilter(filter) {
  activeFilter = filter;
  countryFilters.forEach(button => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}
countryFilters.forEach(button => button.onclick = () => {
  setCountryFilter(button.dataset.filter);
  if (activeFilter === 'all') renderChips();
  else selectCity(cities.find(city => city.country === activeFilter));
});
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
$('preview-photo').onclick = openCity;
$('close-city').onclick = () => dialog.close();
$('next-city').onclick = () => {
  const list = visibleCities();
  dialog.close();
  selectCity(list[(list.indexOf(selected) + 1) % list.length]);
};
$('open-about').onclick = () => $('about-dialog').showModal();
$('close-about').onclick = () => $('about-dialog').close();
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
$('open-directory').onclick = () => $('cities').scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
$('start-explore').onclick = () => {
  const choices = cities.filter(city => city !== selected);
  if (!choices.length) return;
  const city = choices[Math.floor(Math.random() * choices.length)];
  if (activeFilter !== 'all' && activeFilter !== city.country) setCountryFilter('all');
  selectCity(city);
};
renderChips(); selectCity(selected);

const R = 2;
function ll(lat, lon, radius = R) {
  const p = THREE.MathUtils.degToRad(lat), t = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(p) * Math.sin(t), Math.sin(p), Math.cos(p) * Math.cos(t)).multiplyScalar(radius);
}
function facingCity(lat, lon) {
  const direction = ll(lat, lon, 1);
  const view = new THREE.Matrix4().lookAt(direction, new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
  return new THREE.Quaternion().setFromRotationMatrix(view).invert();
}
const materials = new Map();
function material(color) { if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .92, flatShading: true })); return materials.get(color); }
function part(parent, geo, color, x=0, y=0, z=0) { const m = new THREE.Mesh(geo, material(color)); m.position.set(x,y,z); parent.add(m); return m; }
function box(g,x,y,z,w,h,d,c) { return part(g,new THREE.BoxGeometry(w,h,d),c,x,y,z); }
function cone(g,x,y,z,r,h,c,segments=4) { return part(g,new THREE.ConeGeometry(r,h,segments),c,x,y,z); }
function cyl(g,x,y,z,r1,r2,h,c,n=8) { return part(g,new THREE.CylinderGeometry(r1,r2,h,n),c,x,y,z); }
function ball(g,x,y,z,r,c) { return part(g,new THREE.IcosahedronGeometry(r,0),c,x,y,z); }
function beam(g,a,b,width,color) { const dir = b.clone().sub(a); const m = part(g,new THREE.CylinderGeometry(width,width,dir.length(),5),color); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize()); return m; }

function windowRow(group, positions, height, front, width = .024, length = .035) {
  for (const x of positions) {
    box(group, x, height, front, width, length, .004, '#586b63');
    box(group, x, height - length / 2, front + .002, width + .008, .004, .006, '#dac8a4');
  }
}

function landmark(type) {
  const g=new THREE.Group(), cream='#eee5cc', roof='#6c8a70', red='#b76e52', gold='#d1ae5f';
  cyl(g,0,.015,0,.16,.17,.03,'#b7bf8d',8);
  if (type==='tower') {
    for (const x of [-1,1]) for (const z of [-1,1]) { beam(g,new THREE.Vector3(x*.12,.02,z*.12),new THREE.Vector3(x*.035,.4,z*.035),.012,red); beam(g,new THREE.Vector3(x*.07,.18,z*.07),new THREE.Vector3(-x*.04,.34,z*.04),.006,cream); }
    box(g,0,.21,0,.18,.035,.18,cream); box(g,0,.38,0,.1,.035,.1,red); cyl(g,0,.49,0,.008,.022,.22,red); cyl(g,0,.59,0,.004,.004,.08,cream);
    for (const [height, width] of [[.226,.16],[.388,.085]]) {
      box(g,0,height,width/2,width,.012,.005,'#626e67');
      box(g,0,height,-width/2,width,.012,.005,'#626e67');
    }
    for (const z of [-1, 1]) {
      beam(g,new THREE.Vector3(-.077,.16,z*.077),new THREE.Vector3(.038,.34,z*.038),.005,red);
      beam(g,new THREE.Vector3(.077,.16,z*.077),new THREE.Vector3(-.038,.34,z*.038),.005,red);
    }
  } else if(type==='cathedral') {
    box(g,0,.1,0,.21,.18,.17,red);
    for(const [x,z,h,col] of [[0,0,.36,'#799579'],[-.1,.06,.24,red],[.1,.06,.3,gold],[-.09,-.07,.31,'#779b9b'],[.09,-.07,.25,'#947a93']]) {
      cyl(g,x,h/2,z,.035,.043,h,cream); ball(g,x,h+.035,z,.06,col); cone(g,x,h+.085,z,.035,.09,col,8); cyl(g,x,h+.15,z,.003,.003,.04,gold,4);
      cyl(g,x,h-.012,z,.047,.047,.012,red);
      cyl(g,x,h+.038,z,.055,.055,.008,gold,10);
      box(g,x,h*.65,z+.039,.016,.06,.005,'#7c6051');
    }
  } else if(type==='castle') {
    box(g,0,.06,0,.26,.1,.23,'#a6a68d');
    for(let i=0;i<4;i++){
      const s=.25-i*.045, floor=.14+i*.065;
      box(g,0,floor,0,s*.78,.06,s*.7,cream);
      const m=cone(g,0,floor+.04,0,s*.76,.045,roof); m.rotation.y=Math.PI/4;
      box(g,0,floor+.02,0,s*1.06,.008,s*1.06,'#476857');
      windowRow(g,[-s*.19,0,s*.19],floor,s*.35+.002,s*.11,.025);
    }
    ball(g,0,.42,0,.015,gold);
  } else if(type==='pagoda') {
    for (const [width, height] of [[.25,.09],[.20,.19],[.15,.29]]) {
      box(g,0,height,0,width*.58,.09,width*.58,'#bb5841');
      box(g,0,height+.04,0,width,.012,width,red);
      const tier=cone(g,0,height+.062,0,width/Math.SQRT2,.045,'#455b55',4);
      tier.rotation.y=Math.PI/4;
    }
    cyl(g,0,.38,0,.005,.008,.07,gold,6);
  } else if(type==='clock') {
    box(g,0,.075,0,.26,.13,.15,cream); const m=cone(g,0,.17,0,.19,.1,red);m.scale.z=.65;m.rotation.y=Math.PI/4;
    box(g,0,.21,0,.075,.13,.07,cream); cone(g,0,.31,0,.075,.1,red); const face=cyl(g,0,.255,.037,.021,.021,.004,'#fff7df',12); face.rotation.x=Math.PI/2;
    beam(g,new THREE.Vector3(0,.255,.041),new THREE.Vector3(0,.267,.041),.002,'#53654d');
    beam(g,new THREE.Vector3(0,.255,.041),new THREE.Vector3(.009,.251,.041),.002,'#53654d');
    windowRow(g,[-.085,-.04,.04,.085],.088,.077,.024,.044);
    box(g,0,.058,.078,.027,.065,.006,'#8c7055');
  } else if(type==='observation'||type==='glass') {
    cyl(g,0,.23,0,type==='glass'?.028:.016,.055,.43,type==='glass'?'#91b1b0':cream,type==='glass'?3:6);
    cyl(g,0,.39,0,.095,.07,.055,'#b3c6b8',type==='glass'?3:5); cyl(g,0,.5,0,.004,.004,.12,cream);
    if(type==='glass')for(let i=0;i<7;i++)cyl(g,0,.065+i*.048,0,.045-i*.002,.047-i*.002,.008,cream,3);
    cyl(g,0,.39,0,.087,.087,.019,'#5f858a',type==='glass'?3:5);
    cyl(g,0,.421,0,.095,.095,.009,cream,type==='glass'?3:5);
    cyl(g,0,.36,0,.065,.055,.012,'#829a91',8);
    cyl(g,0,.045,0,.061,.069,.025,'#babfa2',8);
    cyl(g,0,.46,0,.011,.011,.016,roof,6);
  } else if(type==='dome') {
    box(g,0,.1,0,.25,.17,.2,cream); for(const x of [-.1,-.05,0,.05,.1]) cyl(g,x,.12,.115,.009,.009,.17,'#e6d7b2');
    cyl(g,0,.23,0,.065,.07,.12,cream); part(g,new THREE.SphereGeometry(.087,10,6,0,Math.PI*2,0,Math.PI/2),gold,0,.29,0); cyl(g,0,.4,0,.004,.004,.06,gold);
    box(g,0,.211,.09,.23,.02,.095,'#b09e72');
    const pediment=cone(g,0,.239,.113,.118,.046,cream,4);
    pediment.rotation.y=Math.PI/4;
    pediment.scale.z=.36;
    cyl(g,0,.286,0,.085,.085,.012,'#a88443',12);
  } else if(type==='waterfall') {
    box(g,0,.04,0,.27,.02,.23,'#6ba4a6');
    for (const [x,height] of [[-.09,.18],[0,.22],[.09,.17]]) {
      box(g,x,height/2+.04,-.045,.09,height,.12,'#78857b');
      box(g,x,height+.043,-.045,.095,.018,.124,'#f2ebdb');
      box(g,x+.012,height/2+.04,.019,.023,height,.012,'#c6e4e0');
    }
  } else if(type==='garden') {
    box(g,0,.07,0,.22,.09,.16,cream);
    cone(g,0,.16,0,.18,.1,roof);
    cyl(g,.14,.08,0,.01,.01,.14,'#756747');
    ball(g,.14,.17,0,.064,'#79986f');
    box(g,-.075,.033,.106,.12,.009,.065,'#82a6a0');
    box(g,0,.092,.093,.18,.01,.024,'#a5835b');
    windowRow(g,[-.054,0,.054],.085,.081,.024,.032);
  } else if(type==='ship') {
    const hull = box(g,0,.06,0,.25,.07,.11,'#9f6c4d');
    hull.rotation.z = -.16;
    box(g,-.045,.11,0,.09,.06,.08,cream);
    cyl(g,.05,.15,0,.006,.006,.2,'#756747',5);
    const trim=box(g,0,.084,.057,.23,.012,.005,'#5a645c');
    trim.rotation.z=-.16;
    windowRow(g,[-.069,-.024],.12,.042,.014,.018);
  } else if(type==='monument') {
    box(g,0,.05,0,.18,.09,.16,'#b7b69e');box(g,0,.2,0,.08,.24,.055,'#8b9a88');ball(g,0,.35,0,.037,'#8b9a88');box(g,-.045,.24,0,.03,.16,.035,'#8b9a88');
    box(g,0,.106,0,.14,.026,.12,'#c6c4a6');
    box(g,0,.056,.081,.055,.032,.007,'#707766');
    box(g,0,.362,0,.075,.024,.055,'#788978');
    box(g,0,.079,0,.169,.014,.152,'#999d85');
  } else if(type==='temple'||type==='woodtemple') {
    const c=type==='woodtemple'?'#b28a62':cream;
    for(let i=0;i<4;i++)box(g,0,.035+i*.028,0,.3-i*.05,.04,.25-i*.04,c);
    cone(g,0,.25,0,.08,.28,c,8); cone(g,0,.44,0,.025,.15,gold,6);
    for(const x of [-.1,.1])for(const z of [-.08,.08])cone(g,x,.15,z,.038,.22,type==='woodtemple'?red:cream,6);
    for(let i=0;i<4;i++){
      const radius=.068-i*.012;
      cyl(g,0,.155+i*.047,0,radius,radius+.008,.013,type==='woodtemple'?'#8d6649':'#c0a05e',8);
    }
    box(g,0,.07,.135,.032,.078,.018,'#a58864');
  } else {
    for(let i=-1;i<=1;i++) {
      const x=i*.1, shophouse=type==='shophouse';
      const c=shophouse?['#e6c28e','#a6b6a2','#c7a895'][i+1]:'#9eac91';
      box(g,x,.09,0,.09,.17,.13,c);
      const r=cone(g,x,.21,0,.085,.08,shophouse?red:'#687969');r.scale.z=.8;r.rotation.y=Math.PI/4;
      windowRow(g,[x-.019,x+.019],.13,.067,.015,.03);
      box(g,x,.059,.067,.034,.058,.004,'#586a5e');
      box(g,x,.095,.071,.088,.006,.009,cream);
    }
  }
  return g;
}

async function initGlobe() {
  const canvas=$('globe'), stage=$('globe-stage');
  const hitArea = $('globe-hit-area');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setClearColor(0x000000,0); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.25;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,100);camera.position.set(0,0,12);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight('#fff6e1',1.4)); const sun=new THREE.DirectionalLight('#fff9e9',3.1);sun.position.set(-3,6,5);scene.add(sun);const fill=new THREE.DirectionalLight('#8eb9b2',.5);fill.position.set(4,-1,-3);scene.add(fill);
  const world=new THREE.Group(); scene.add(world); const globe=new THREE.Group();world.add(globe);
  let countryLayer, countryCursor;
  fetch('./data/countries.json')
    .then(response => {
      if (!response.ok) throw new Error(`Country data returned HTTP ${response.status}`);
      return response.json();
    })
    .then(countries => { countryLayer = createCountryLayer(countries, globe, R, ll); })
    .catch(error => console.warn('Country boundaries unavailable', error));
  hitArea.addEventListener('pointermove', event => {
    countryCursor = event.pointerType === 'touch' ? null : { x: event.clientX, y: event.clientY };
  });
  hitArea.addEventListener('pointerleave', () => { countryCursor = null; countryLayer?.clear(); });
  const home = facingCity(32, 100);
  globe.quaternion.copy(home);
  const ocean=new THREE.Mesh(new THREE.IcosahedronGeometry(R,14),new THREE.MeshStandardMaterial({color:'#79b2b3',roughness:1,flatShading:true}));globe.add(ocean);
  const landResponse = await fetch('./data/land.geojson');
  if (!landResponse.ok) throw new Error(`Land data returned HTTP ${landResponse.status}`);
  const geojson = await landResponse.json();
  const polygons=[];
  for(const f of geojson.features){const list=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const rings of list){const ring=rings[0];polygons.push({rings, minX:Math.min(...ring.map(p=>p[0])),maxX:Math.max(...ring.map(p=>p[0])),minY:Math.min(...ring.map(p=>p[1])),maxY:Math.max(...ring.map(p=>p[1]))});}}
  function inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
  function landAt(lat,lon){return polygons.some(p=>lon>=p.minX&&lon<=p.maxX&&lat>=p.minY&&lat<=p.maxY&&inRing(lon,lat,p.rings[0])&&!p.rings.slice(1).some(r=>inRing(lon,lat,r)));}
  // Sample a uniform triangular sphere against geographic polygons; raised flat faces create a paper-model coastline.
  const base=new THREE.IcosahedronGeometry(R*1.009,55), pos=base.attributes.position, verts=[], colors=[], landCenters=[];
  const v=new THREE.Vector3();const landColors=['#b3c28c','#b5c68e','#b7c58f','#b1bf87','#bdca98'];
  for(let i=0;i<pos.count;i+=3){v.set(0,0,0);for(let j=0;j<3;j++)v.add(new THREE.Vector3().fromBufferAttribute(pos,i+j));v.divideScalar(3).normalize();const lat=Math.asin(v.y)*180/Math.PI,lon=Math.atan2(v.x,v.z)*180/Math.PI;if(!landAt(lat,lon))continue; const c=new THREE.Color(landColors[(i/3*17)%landColors.length]);for(let j=0;j<3;j++){verts.push(pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j));colors.push(c.r,c.g,c.b);}if(i%31===0)landCenters.push({lat,lon});}
  base.dispose(); const landGeometry=new THREE.BufferGeometry();landGeometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));landGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));landGeometry.computeVertexNormals();const land=new THREE.Mesh(landGeometry,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,side:THREE.DoubleSide}));globe.add(land);
  function place(obj,lat,lon,r=2.025){obj.position.copy(ll(lat,lon,r));obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),obj.position.clone().normalize());globe.add(obj);return obj;}
  // Quiet scenery distributed over land, keeping the visited-city areas clear.
  let seed=1841;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<90;i++){const loc=landCenters[Math.floor(rand()*landCenters.length)];if(!loc||Math.abs(loc.lat)>73||cities.some(c=>ll(c.lat,c.lon,1).distanceTo(ll(loc.lat,loc.lon,1))<.12))continue;const tree=new THREE.Group();cyl(tree,0,.035,0,.008,.009,.07,'#8e8760',5);ball(tree,0,.095,0,.047,rand()>.5?'#759365':'#8ca26c');if(i%3===0)ball(tree,.023,.075,.01,.03,'#9aac7b');tree.scale.setScalar(.7+rand()*.9);place(tree,loc.lat,loc.lon);}
  for(const [lat,lon] of [[28,79],[45,82],[-12,23],[53,-105],[-25,135],[6,-66]]){const rocks=new THREE.Group();cone(rocks,0,.09,0,.11,.19,'#92a079',5);cone(rocks,.09,.045,.01,.065,.11,'#a1ad83',4);place(rocks,lat,lon);}
  const heartCanvas = document.createElement('canvas');
  heartCanvas.width = heartCanvas.height = 96;
  const heart = heartCanvas.getContext('2d');
  heart.beginPath();
  heart.moveTo(48, 81);
  heart.bezierCurveTo(42, 75, 9, 53, 9, 33);
  heart.bezierCurveTo(9, 11, 35, 8, 48, 28);
  heart.bezierCurveTo(61, 8, 87, 11, 87, 33);
  heart.bezierCurveTo(87, 53, 54, 75, 48, 81);
  heart.closePath();
  heart.fillStyle = '#ca536e';
  heart.strokeStyle = '#fff2ec';
  heart.lineWidth = 6;
  heart.lineJoin = 'round';
  heart.fill();
  heart.stroke();
  const heartTexture = new THREE.CanvasTexture(heartCanvas);
  heartTexture.colorSpace = THREE.SRGBColorSpace;
  const heartMaterial = new THREE.SpriteMaterial({ map: heartTexture, depthWrite: false, toneMapped: false });
  const markers=[];
  for(const c of cities){
    const anchor=new THREE.Group();place(anchor,c.lat,c.lon,2.04);
    const ring=part(anchor,new THREE.RingGeometry(.032,.043,28), '#edb88a',0,.007,0);ring.rotation.x=-Math.PI/2;ring.material=new THREE.MeshBasicMaterial({color:'#d99962',side:THREE.DoubleSide,transparent:true,opacity:.8});
    const pin = new THREE.Group();
    pin.position.y = .047;
    if (c.together) {
      const sprite = new THREE.Sprite(heartMaterial);
      sprite.scale.setScalar(.13);
      pin.add(sprite);
      ring.material.color.set('#ca536e');
    } else {
      const dot = ball(pin,0,0,0,.027,'#d48152');
      dot.material = new THREE.MeshBasicMaterial({color:'#e39b65'});
    }
    anchor.add(pin);
    const model = landmark(c.model);
    // The anchor stays above the surface for the pin. Sink the pedestal into the raised land.
    model.position.y = R * 1.007 - anchor.position.length();
    anchor.add(model);
    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'city-label';
    label.classList.toggle('together', Boolean(c.together));
    if (c.together) label.setAttribute('aria-label', `${c.name}，一起去过`);
    label.hidden = true;
    label.textContent = c.name;
    label.onclick = () => selectCity(c);
    const sub = document.createElement('small');
    sub.textContent = c.en;
    label.append(sub);
    $('globe-labels').append(label);
    markers.push({city:c,anchor,pin,ring,model,label});
  }
  const clouds=[];
  for(const [lat,lon] of [[52,125],[10,63],[-17,113],[58,-40],[-34,-72],[27,-18]]){const cloud=new THREE.Group();for(let i=0;i<5;i++){const m=part(cloud,new THREE.IcosahedronGeometry(.09+i%2*.02,1),'#f1eee1',(i-2)*.065,Math.sin(i)*.015,0);m.scale.set(1,.62,.8);}place(cloud,lat,lon,2.43);clouds.push(cloud);}
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(128,64,0,128,64,64);gradient.addColorStop(0,'rgba(75,97,72,.22)');gradient.addColorStop(1,'rgba(75,97,72,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,128);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.set(0,-2.45,-2);world.add(shadow);
  const weather = createWeatherLayer(stage, cities);
  let target=null, flight=null, auto=!reduced, zoom=1, visible=true, dragging=false, prev=null, moved=0, last=performance.now(), raf;
  const pointers=new Map(); let pinch=0;
  const compactLayout = matchMedia('(max-width: 850px)');
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    const aspect = w / h;
    const size = matchMedia('(max-width: 520px)').matches ? .83 : 1;
    const diameter = 2 * R * size;
    const span = Math.max(compactLayout.matches ? 6 : 5.49, diameter / (.83 * aspect));
    const maxZoom = span * Math.min(.89, .93 * aspect) / diameter;
    zoom = Math.min(zoom, maxZoom);
    renderer.setSize(w, h, false);
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    world.position.set(0,.12,0);
    globe.scale.setScalar(size);
    shadow.scale.setScalar(size);

    // Match the hit area to the orthographic projection, with a small touch margin.
    const pixelsPerUnit = h * zoom / span;
    const hitDiameter = diameter * pixelsPerUnit + 16;
    hitArea.style.width = hitArea.style.height = `${hitDiameter}px`;
    hitArea.style.top = `${h / 2 - world.position.y * pixelsPerUnit}px`;
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();
  const setZoom=delta=>{zoom=THREE.MathUtils.clamp(zoom+delta,.8,1.55);resize();};
  $('zoom-in').onclick=()=>setZoom(.1);$('zoom-out').onclick=()=>setZoom(-.1);
  function setAuto(enabled) {
    auto = enabled;
    $('toggle-rotation').setAttribute('aria-pressed', String(auto));
    $('toggle-rotation').setAttribute('aria-label', auto ? '暂停自动旋转' : '开启自动旋转');
  }
  const stopAuto = () => setAuto(false);
  setAuto(auto);
  function cancelFlight() { target = null; flight = null; }
  $('toggle-rotation').onclick = () => { cancelFlight(); setAuto(!auto); };
  $('reset-globe').onclick=()=>{flight=null;target=home.clone();stopAuto();zoom=1;resize();};
  globeApi = {
    focus(city) {
      target = null;
      const destination = facingCity(city.lat, city.lon);
      flight = { from: globe.quaternion.clone(), destination, start: performance.now(),
        duration: reduced ? 0 : THREE.MathUtils.clamp(210 + globe.quaternion.angleTo(destination) * 140, 240, 650) };
      weather.showCity(city);
      stopAuto();
    }
  };
  hitArea.tabIndex=0; hitArea.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();cancelFlight();stopAuto();const axis=e.key.includes('Left')||e.key.includes('Right')?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0);globe.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,e.key==='ArrowLeft'||e.key==='ArrowUp'?.12:-.12));}if(e.key==='+'||e.key==='=')setZoom(.1);if(e.key==='-')setZoom(-.1);});
  hitArea.addEventListener('pointerdown',e=>{if(e.button!==0)return;hitArea.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragging=true;prev={x:e.clientX,y:e.clientY};moved=pointers.size>1?100:0;cancelFlight();stopAuto();if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}});
  hitArea.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()];const distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);setZoom((distance-pinch)*.002);pinch=distance;moved=100;return;}if(!dragging)return;const dx=e.clientX-prev.x,dy=e.clientY-prev.y;moved+=Math.abs(dx)+Math.abs(dy);globe.quaternion.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(dy*.005,dx*.005,0,'XYZ')));prev={x:e.clientX,y:e.clientY};});
  function up(e) {
    if (!pointers.has(e.pointerId)) return;
    const click = moved < 7 && pointers.size === 1;
    pointers.delete(e.pointerId);
    dragging = pointers.size > 0;
    if (dragging) { prev = [...pointers.values()][0]; moved = 100; }
    if (!click) return;
    const rect = canvas.getBoundingClientRect();
    let nearest;
    let bestDistance = e.pointerType === 'touch' ? 24 : 18;
    for (const marker of markers) {
      if (!marker.screenPoint) continue;
      const distance = Math.hypot(e.clientX - rect.left - marker.screenPoint.x, e.clientY - rect.top - marker.screenPoint.y);
      if (distance < bestDistance) { nearest = marker; bestDistance = distance; }
    }
    if (nearest) selectCity(nearest.city);
  }
  hitArea.addEventListener('pointerup',up);hitArea.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);dragging=false;moved=100;});hitArea.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);if(!pointers.size)dragging=false;});
  hitArea.addEventListener('wheel',e=>{e.preventDefault();setZoom(-e.deltaY*.0007);},{passive:false});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();hitArea.hidden=true;$('globe-fallback').hidden=false;cancelAnimationFrame(raf);});
  hitArea.hidden = false;
  function frame(now){if(!visible){last=now;raf=requestAnimationFrame(frame);return;}const dt=Math.min((now-last)/1000,.05);last=now;if(target&&!dragging){if(reduced){globe.quaternion.copy(target);target=null;}else{globe.quaternion.slerp(target,1-Math.exp(-5*dt));if(globe.quaternion.angleTo(target)<.001)target=null;}}
    if (flight && !dragging && now >= flight.start) {
      const progress = flight.duration ? Math.min(1, (now - flight.start) / flight.duration) : 1;
      globe.quaternion.slerpQuaternions(flight.from, flight.destination, 1 - (1 - progress) ** 3);
      if (progress === 1) flight = null;
    }
    const labels = $('globe-labels');
    if (auto && !dragging && !document.querySelector('dialog[open]') &&
        !labels.contains(document.activeElement) && !labels.querySelector('button:hover')) {
      globe.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dt*.07));
    }
    globe.updateMatrixWorld(true);const rect=stage.getBoundingClientRect(),placed=[];
    countryLayer?.update(dragging || document.querySelector('dialog[open]') ? null : countryCursor, rect, camera);
    for(const m of [...markers].sort((a,b)=>(b.city.id===selected.id)-(a.city.id===selected.id))){const chosen=m.city.id===selected.id,filtered=activeFilter==='all'||m.city.country===activeFilter;
      // Dense city groups show only a few silhouettes, always revealing the selected landmark.
      m.model.visible=filtered&&(chosen||['tokyo','moscow','bangkok'].includes(m.city.id));
      m.model.scale.setScalar(chosen ? .91 : .61);
      m.pin.scale.setScalar(chosen?1.5:1);const pulse=reduced?1:1+Math.sin(now*.0025)*.18;m.ring.scale.setScalar(chosen?pulse*1.5:1);m.anchor.visible=filtered;
      const position = m.pin.getWorldPosition(new THREE.Vector3());
      const front = position.z > world.position.z + .2;
      if (!front || !filtered) {
        m.screenPoint = null;
        m.label.hidden = true;
        continue;
      }
      position.project(camera);
      const x = (position.x * .5 + .5) * rect.width;
      const y = (-position.y * .5 + .5) * rect.height;
      m.screenPoint = { x, y };
      const lx = x + (chosen ? -48 : 12);
      const ly = y + (chosen ? -44 : -17);
      const clash = placed.some(p => Math.abs(p.x-lx)<115 && Math.abs(p.y-ly)<37);
      const show = chosen || (!clash && rect.width > 380);
      m.label.hidden = !show;
      if (show) {
        m.label.classList.toggle('selected', chosen);
        m.label.style.transform = `translate(${lx}px,${ly}px)`;
        placed.push({ x: lx, y: ly });
      }
    }
    weather.position(markers, selected);
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;});
  weather.showCity(selected);
  $('loading').classList.add('done');setTimeout(()=>$('loading').hidden=true,600);requestAnimationFrame(frame);
}
initGlobe().catch(error=>{console.error('Globe initialization failed',error);$('loading').hidden=true;$('globe-fallback').hidden=false;document.querySelectorAll('.globe-controls button').forEach(b=>b.disabled=true);});
