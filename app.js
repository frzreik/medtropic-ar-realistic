'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const video = $('camera'), viewer = $('showroom'), cameraButton = $('cameraButton'), arButton = $('placeAR');
  const isAndroid=/Android/i.test(navigator.userAgent);
  const isSamsung=/SamsungBrowser/i.test(navigator.userAgent);
  if(isSamsung) viewer.setAttribute('ar-modes','scene-viewer webxr quick-look');
  document.body.dataset.platform=isSamsung?'samsung':isAndroid?'android':'other';
  const requestedProduct=new URLSearchParams(location.search);
  const barPaths = ['100-pure-cocoa','41-vegan-creamy-cashew-chocolate','42-fleur-de-sel-caramel','42-creamy-hazelnut','42-coconut-pineapple-vegan-brightness-with-cashew','57-macadamia-caramel-vegan-dark','70-organic-dark-chocolate-with-cocoa-nibs','70-organic-dark-chocolate','70-organic-dark-chocolate-with-tigernut-and-almond','70-organic-dark-chocolate-with-cinnamon-and-vanilla','80-organic-dark-chocolate','80-organic-dark-chocolate-with-fleur-de-sel','92-organic-dark-chocolate'];
  const barNames = ['100% Pure Cocoa','42% Creamy Cashew','42% Fleur de Sel & Caramel','42% Creamy Hazelnut','42% Coconut & Pineapple','57% Macadamia & Caramel','70% Cocoa Nibs','70% Organic Dark','70% Tigernut & Almond','70% Cinnamon & Vanilla','80% Organic Dark','80% Fleur de Sel','92% Organic Dark'];
  const barIngredients = [['Cocoa mass','Cocoa butter'],['Cocoa','Cashew','Cocoa butter','Raw cane sugar'],['Cocoa','Cashew','Caramel','Sea salt'],['Cocoa','Cashew','Hazelnut','Raw cane sugar'],['Cocoa','Cashew','Coconut','Pineapple'],['Cocoa','Macadamia','Caramel','Raw cane sugar'],['Cocoa','Cocoa nibs','Raw cane sugar'],['Cocoa','Cocoa butter','Raw cane sugar'],['Cocoa','Almond','Tigernut','Raw cane sugar'],['Cocoa','Ceylon cinnamon','Vanilla'],['Cocoa','Cocoa butter','Raw cane sugar'],['Cocoa','Fleur de sel','Raw cane sugar'],['Cocoa','Cocoa butter','Raw cane sugar']];
  const bars = barNames.map((name,i)=>({name,detail:'3D chocolate and ingredient showcase',scale:'Enlarged ingredient display without pedestal',ingredients:barIngredients[i],src:`fairafric_bar_${String(i).padStart(2,'0')}.glb`,url:`https://www.fairafric.com/en/products/${barPaths[i]}`}));
  const tables = [
    {name:'Live-edge walnut table',detail:'2.60 × 1.02 × 0.765 m · photo-derived preview',scale:'Estimated dimensions',src:'enchi_live_edge_table.glb',url:'https://enchifurniture.com/'},
    {name:'Albizia waterfall table',detail:'3.75 × 1.20 × 0.75 m · listed Enchi product',scale:'Listed dimensions',src:'enchi_albizia_waterfall.glb',url:'https://enchifurniture.com/product.html?handle=albizia-waterfall-solid-wood-dining-table'},
    {name:'5 m waterfall concept',detail:'5.00 × 1.20 × 0.75 m · bespoke preview based on Albizia',scale:'Concept dimensions',src:'enchi_bespoke_waterfall_5m.glb',url:'https://enchifurniture.com/product.html?handle=albizia-waterfall-solid-wood-dining-table'},
    {name:'Live-edge low table',detail:'1.23 × 0.61 × 0.35 m · listed Enchi product',scale:'Listed dimensions',src:'enchi_live_edge_low.glb',url:'https://enchifurniture.com/product.html?handle=live-edge-center-table'},
    {name:'Sapele dining table',detail:'5.70 × 1.31 × 0.75 m · listed Enchi product',scale:'Listed dimensions',src:'enchi_sapele_dining.glb',url:'https://enchifurniture.com/product.html?handle=sapele-solid-wood-dining-table'}
  ];
  let collection = null, activeIndex = 0, lastSwitch = 0, wheelDelta = 0;
  const currentProducts = () => collection === 'enchi' ? tables : bars;
  function saveSelection(){
    if(!/^https?:$/.test(location.protocol))return;
    const url=new URL(location.href);url.hash='';
    if(collection){url.searchParams.set('brand',collection);url.searchParams.set('product',String(activeIndex));}
    else {url.searchParams.delete('brand');url.searchParams.delete('product');}
    history.replaceState(null,'',url);
    if(isAndroid){
      const link=$('openChrome');link.hidden=false;
      link.href='intent://'+url.host+url.pathname+url.search+'#Intent;scheme='+url.protocol.slice(0,-1)+';package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(url.href)+';end';
    }
  }
  let stream = null, generation = 0, pending = false, cameraAllowed = false, arActive = false;
  let ready = false, failed = false, pointer = null, pointers = new Set(), modelTimer;
  function positionBanners(){
    const nav=$('brandBanners');
    if(collection||!ready){nav.classList.remove('projected');return;}
    const r=viewer.getBoundingClientRect();
    for(const brand of ['enchi','fairafric']){
      const hotspot=viewer.queryHotspot?.('hotspot-'+brand);if(!hotspot)return;
      const logo=nav.querySelector('.'+brand);
      logo.style.left=Math.max(58,Math.min(innerWidth-58,r.left+hotspot.canvasPosition.x))+'px';
      logo.style.top=Math.max(78,r.top+hotspot.canvasPosition.y-8)+'px';
    }
    nav.classList.add('projected');
  }
  viewer.addEventListener('camera-change',positionBanners);
  window.addEventListener('resize',positionBanners);
  const status = message => { $('cameraStatus').textContent = message; };
  function stopCamera() {
    generation++; pending = false;
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null; video.srcObject = null;
    document.body.dataset.camera = 'paused';
  }
  async function startCamera() {
    if (pending || arActive || document.hidden || stream) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      status('Camera needs HTTPS and a supported browser.');
      $('modeNote').textContent = '3D preview is available';
      cameraButton.hidden = true; return;
    }
    pending = true; const ticket = ++generation;
    status('Allow camera access to see your space.');
    cameraButton.disabled = true;
    try {
      const media = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}}});
      if (ticket !== generation || arActive || document.hidden) { media.getTracks().forEach(t => t.stop()); return; }
      stream = media; video.srcObject = media; cameraAllowed = true;
      await video.play();
      if (ticket !== generation || !stream) return;
      document.body.dataset.camera = 'live';
      const facing = media.getVideoTracks()[0].getSettings().facingMode;
      status(facing === 'user' ? 'Live camera · rear camera unavailable' : 'Live camera');
      $('modeNote').textContent = 'Preview · tap below for full-size floor placement';
      cameraButton.hidden = true;
      media.getVideoTracks()[0].addEventListener('ended', () => {
        if (stream === media && !arActive) {stopCamera(); status('Camera paused. Tap Resume camera.'); cameraButton.textContent='Resume camera'; cameraButton.hidden=false;}
      });
    } catch (error) {
      if (ticket !== generation) return;
      stopCamera();
      const messages = {NotAllowedError:'Camera access is off. Allow it in your browser settings.',NotFoundError:'No camera found. You can still explore in 3D.',NotReadableError:'Camera is busy. Close other camera apps and retry.'};
      status(messages[error.name] || 'Camera couldn’t start. Tap Enable camera to retry.');
      $('modeNote').textContent = '3D preview · camera is not running';
      cameraButton.textContent = 'Enable camera'; cameraButton.hidden = false;
    } finally { if (ticket === generation) pending = false; cameraButton.disabled = false; }
  }
  // Begin before the 3D library has downloaded; permission remains controlled by the browser.
  void startCamera();
  cameraButton.addEventListener('click', () => { void startCamera();});
  $('help').addEventListener('click', () => $('info').showModal());
  $('closeHelp').addEventListener('click', () => $('info').close());
  $('info').addEventListener('click', e => {if(e.target === $('info')) {const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('resetView').addEventListener('click', () => {viewer.cameraOrbit=collection ? (collection==='enchi'?'-32deg 64deg auto':'8deg 76deg auto') : '0deg 68deg auto';viewer.cameraTarget='auto auto auto';viewer.fieldOfView=collection ? '30deg' : '32deg';});
  function selectProduct(index) {
    const products=currentProducts();if(!products.length)return;
    activeIndex=Math.max(0,Math.min(index,products.length-1));const item=products[activeIndex];
    $('productName').textContent=item.name;$('productDetail').textContent=item.detail;
    $('productPosition').textContent=`${activeIndex+1} / ${products.length}`;$('productScale').textContent=item.scale;
    $('productLink').href=item.url;$('productLink').setAttribute('aria-label',collection==='enchi'&&activeIndex===2?'View the Albizia reference product':'View '+item.name+' on the official website');
    ready=false;failed=false;arButton.disabled=true;arButton.textContent='Loading 3D…';$('loading').classList.remove('hide');$('modelError').hidden=true;
    viewer.classList.remove('product-switch');void viewer.offsetWidth;viewer.classList.add('product-switch');
    viewer.cameraOrbit=collection==='fairafric'?'8deg 76deg auto':'-32deg 64deg auto';viewer.cameraTarget='auto auto auto';viewer.fieldOfView='30deg';
    viewer.alt=`${item.name}, ${item.detail}. ${item.scale}.`;
    viewer.src=item.src;
    saveSelection();
    clearTimeout(modelTimer);modelTimer=setTimeout(loadFailed,60000);
    $('hint').textContent='Swipe up or down on the 3D product to browse';
  }
  function moveProduct(direction) {
    if(!collection||!ready||arActive)return;
    const count=currentProducts().length;
    selectProduct((activeIndex+direction+count)%count);
  }
  function openCollection(type) {
    if(type!=='enchi'&&type!=='fairafric')return;
    collection=type;document.body.dataset.view='collection';document.body.dataset.brand=type;$('collection').hidden=false;
    $('brandBanners').classList.remove('projected');
    selectProduct(0);
  }
  function backToShowroom(){
    collection=null;document.body.dataset.view='showroom';delete document.body.dataset.brand;$('collection').hidden=true;
    ready=false;failed=false;arButton.disabled=true;arButton.textContent='Loading 3D…';$('loading').classList.remove('hide');$('modelError').hidden=true;
    viewer.classList.remove('product-switch');viewer.src='medtropic_showroom.glb';viewer.cameraOrbit='0deg 68deg auto';viewer.cameraTarget='auto auto auto';viewer.fieldOfView='32deg';viewer.alt='An enchi table and a separate fairafric display with a clear floor gap.';
    saveSelection();
    $('hint').textContent='Tap either 3D piece to explore';clearTimeout(modelTimer);modelTimer=setTimeout(loadFailed,60000);
  }
  $('backToShowroom').addEventListener('click',backToShowroom);
  viewer.addEventListener('wheel',e=>{
    if(!collection||arActive)return;
    e.preventDefault();e.stopImmediatePropagation();wheelDelta+=e.deltaY;
    if(Math.abs(wheelDelta)>32&&performance.now()-lastSwitch>400){const direction=Math.sign(wheelDelta);wheelDelta=0;lastSwitch=performance.now();moveProduct(direction);}
  },{capture:true,passive:false});
  document.addEventListener('keydown',e=>{
    if(!collection||$('info').open||!['ArrowDown','ArrowUp'].includes(e.key))return;
    e.preventDefault();moveProduct(e.key==='ArrowDown'?1:-1);
  });
  function updateAR() {
    arButton.disabled = !ready;
    arButton.textContent = ready ? (viewer.canActivateAR ? 'Open AR · place on floor' : 'About floor placement') : 'Loading 3D…';
  }
  function loadFailed() {
    failed = true; ready = false; clearTimeout(modelTimer);
    $('loading').classList.add('hide'); $('modelError').hidden=false; arButton.disabled=true; arButton.textContent='3D unavailable';
  }
  viewer.addEventListener('load', () => {
    clearTimeout(modelTimer);ready=true;failed=false;$('loading').classList.add('hide');$('modelError').hidden=true;
    updateAR();
    positionBanners();
  });
  viewer.addEventListener('error', loadFailed);
  $('reloadModel').addEventListener('click', () => {
    $('modelError').hidden=true;$('loading').classList.remove('hide');failed=false;
    // Re-load the same relative asset without reloading or losing camera permission state.
    viewer.src=(collection?currentProducts()[activeIndex].src:'medtropic_showroom.glb')+'?retry='+Date.now();
    modelTimer=setTimeout(loadFailed,60000);
  });
  modelTimer=setTimeout(loadFailed,60000);
  customElements.whenDefined('model-viewer').then(()=>{
    updateAR();
    const brand=requestedProduct.get('brand');
    if(brand==='enchi'||brand==='fairafric'){
      openCollection(brand);const index=Number(requestedProduct.get('product'));
      if(Number.isInteger(index)&&index>0&&index<currentProducts().length)selectProduct(index);
    } else saveSelection();
  });
  arButton.addEventListener('click', () => {
    if (!ready) return;
    if (!viewer.canActivateAR) { $('info').showModal(); return; }
    stopCamera();status('Opening surface AR…');
    // Call in the original tap event so Safari retains transient user activation.
    viewer.activateAR().catch(() => {
      arActive=false;status('AR could not start. Try again in Safari or Chrome.');
      cameraButton.textContent='Resume camera';cameraButton.hidden=false;
    });
    // Native viewers do not emit the WebXR lifecycle. Provide explicit recovery on return.
    cameraButton.textContent='Resume camera';cameraButton.hidden=false;
  });
  viewer.addEventListener('ar-status', event => {
    const state=event.detail.status;
    arActive=state==='session-started'||state==='object-placed';
    if (state==='session-started') {stopCamera();$('arGuide').textContent=collection?'Point at the floor to place this product.':'Point at the floor in front of you. Move slowly to place both pieces.';}
    if (state==='object-placed') $('arGuide').textContent=collection?'Placed · pinch to resize · return to browse':'Placed · pinch to resize both · return to visit a brand';
    if (state==='failed'||state==='not-presenting') {
      arActive=false;
      if(cameraAllowed) void startCamera();
      if(state==='failed') {$('hint').textContent='Surface AR couldn’t start. Try Safari or Chrome.';}
    }
  });
  viewer.addEventListener('ar-tracking', event => {
    $('arGuide').textContent=event.detail.status==='not-tracking'?'Tracking paused. Move slowly toward a well-lit, textured floor.':'Tracking restored · move slowly to explore';
  });
  // Short taps open a brand; vertical gestures on a selected 3D model browse products.
  viewer.addEventListener('pointerdown', e => {
    pointers.add(e.pointerId);
    if (pointers.size===1 && !e.target.closest('a,button')) pointer={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),moved:false};
    else pointer=null;
  });
  viewer.addEventListener('pointermove',e=>{if(pointer&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>9)pointer.moved=true;});
  viewer.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pointer=null;});
  viewer.addEventListener('pointerup', e => {
    const tap=pointer;pointers.delete(e.pointerId);pointer=null;
    if(!ready||failed||arActive||!tap||tap.id!==e.pointerId||e.target.closest('a,button'))return;
    if(collection){
      const dx=e.clientX-tap.x,dy=e.clientY-tap.y;
      if(Math.abs(dy)>42&&Math.abs(dy)>Math.abs(dx)*1.2&&performance.now()-tap.time<1200)moveProduct(dy<0?1:-1);
      return;
    }
    if(tap.moved||performance.now()-tap.time>500)return;
    const material=viewer.materialFromPoint(e.clientX,e.clientY);
    const brand=material?.name?.split(' / ')[0];
    if(!collection&&(brand==='ENCHI'||brand==='FAIRAFRIC')) {
      // Let the browser finish this tap before showing the back button over the model.
      setTimeout(() => { if(!collection) openCollection(brand.toLowerCase()); }, 80);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stopCamera();
    else if(!arActive&&cameraAllowed){void startCamera();}
  });
  window.addEventListener('pagehide',stopCamera);
  window.addEventListener('pageshow',e=>{if(e.persisted&&cameraAllowed&&!arActive){void startCamera();}});
  // The new worker clears only this app's old caches; it never caches failed asset responses.
  if('serviceWorker' in navigator) window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
  });
})();
