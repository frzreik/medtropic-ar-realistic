'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const video = $('camera'), viewer = $('showroom'), cameraButton = $('cameraButton'), arButton = $('placeAR');
  const urls = {ENCHI:'https://enchifurniture.com/', FAIRAFRIC:'https://www.fairafric.com/en/products/70-organic-dark-chocolate'};
  let stream = null, generation = 0, pending = false, cameraAllowed = false, arActive = false;
  let ready = false, failed = false, pointer = null, pointers = new Set(), modelTimer;
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
  $('resetView').addEventListener('click', () => {viewer.cameraOrbit='-8deg 70deg auto';viewer.cameraTarget='-0.08m 0.72m 0m';viewer.fieldOfView='32deg';});
  function updateAR() {
    arButton.disabled = !ready;
    arButton.textContent = ready ? (viewer.canActivateAR ? 'Place on floor · full size' : 'About floor placement') : 'Loading 3D…';
  }
  function loadFailed() {
    failed = true; ready = false; clearTimeout(modelTimer);
    $('loading').classList.add('hide'); $('modelError').hidden=false; arButton.disabled=true; arButton.textContent='3D unavailable';
    document.querySelectorAll('.brand-tag').forEach(a => {a.hidden=true;});
  }
  viewer.addEventListener('load', () => {
    clearTimeout(modelTimer);ready=true;failed=false;$('loading').classList.add('hide');$('modelError').hidden=true;
    document.querySelectorAll('.brand-tag').forEach(a => {a.hidden=false;}); updateAR();
  });
  viewer.addEventListener('error', loadFailed);
  $('reloadModel').addEventListener('click', () => {
    $('modelError').hidden=true;$('loading').classList.remove('hide');failed=false;
    // Re-load the same relative asset without reloading or losing camera permission state.
    viewer.src='medtropic_showroom.glb?retry='+Date.now();
    modelTimer=setTimeout(loadFailed,60000);
  });
  modelTimer=setTimeout(loadFailed,60000);
  customElements.whenDefined('model-viewer').then(updateAR);
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
    if (state==='session-started') {stopCamera();$('arGuide').textContent='Move slowly to find a floor. Leave room for both pieces.';}
    if (state==='object-placed') $('arGuide').textContent='Placed · walk around to explore · tap a logo to visit';
    if (state==='failed'||state==='not-presenting') {
      arActive=false;
      if(cameraAllowed) void startCamera();
      if(state==='failed') {$('hint').textContent='Surface AR couldn’t start. Try Safari or Chrome.';}
    }
  });
  viewer.addEventListener('ar-tracking', event => {
    $('arGuide').textContent=event.detail.status==='not-tracking'?'Tracking paused. Move slowly toward a well-lit, textured floor.':'Tracking restored · move slowly to explore';
  });
  // Short, single-pointer taps navigate. Orbiting, pinching and UI taps never navigate.
  viewer.addEventListener('pointerdown', e => {
    pointers.add(e.pointerId);
    if (pointers.size===1 && !e.target.closest('a,button')) pointer={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),moved:false};
    else pointer=null;
  });
  viewer.addEventListener('pointermove',e=>{if(pointer&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>9)pointer.moved=true;});
  viewer.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pointer=null;});
  viewer.addEventListener('pointerup', e => {
    const tap=pointer;pointers.delete(e.pointerId);pointer=null;
    if(!ready||failed||arActive||!tap||tap.id!==e.pointerId||tap.moved||performance.now()-tap.time>500||e.target.closest('a,button'))return;
    const material=viewer.materialFromPoint(e.clientX,e.clientY);
    const brand=material?.name?.split(' / ')[0];
    if(urls[brand]) {stopCamera();location.assign(urls[brand]);}
  });
  document.querySelectorAll('.brand-tag').forEach(a=>{
    a.addEventListener('beforexrselect',e=>e.preventDefault());
    a.addEventListener('click',e=>{
      stopCamera();
      if(arActive){e.preventDefault();const href=a.href;
        // End immersive AR before leaving the document; navigation also closes its session.
        location.assign(href);
      }
    });
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
