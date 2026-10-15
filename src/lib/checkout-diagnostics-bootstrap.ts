// A small, parser-executed script: collecting a failed Next bootstrap cannot
// depend on that same bootstrap or React hydration. Keep ES5 syntax for WebViews.
// All events are enums. Error messages, stack traces, paths and tokens stay out.
export const checkoutDiagnosticsBootstrap = String.raw`
(function () {
  if (window.__livecartCheckoutDiagnostics) return;
  window.__livecartCheckoutDiagnostics = true;
  var state = null, early = [], observer = null, timer = null;
  var allowed = ['checkout_loaded','checkout_ready','server_error_screen','client_error','script_load_error','javascript_error','unhandled_rejection','hydration_timeout','offline','recovered_online'];
  function flush() {
    if (!state || !navigator.onLine || !window.fetch) return;
    var current = state;
    var pending = current.pending.splice(0, 8);
    pending.forEach(function (payload) {
      window.fetch('/cart/diagnostics', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload), keepalive: true, credentials: 'omit',
        referrerPolicy: 'no-referrer'
      }).catch(function () {
        if (state === current && current.pending.length < 8) current.pending.push(payload);
      });
    });
  }
  function report(event, detail) {
    if (!/^\/cart\/[^/]+\/?$/.test(location.pathname)) return;
    if (allowed.indexOf(event) < 0) return;
    if (!state) { if (early.length < 8) early.push({event: event, detail: detail}); return; }
    if (event === 'checkout_ready') { state.ready = true; clearTimeout(timer); }
    if (state.seen[event] || state.count >= 8) return;
    state.seen[event] = true; state.count++;
    var payload = {attemptId: state.id, checkoutReference: state.reference, event: event,
      elapsedMs: Math.min(3600000, Math.max(0, Date.now() - state.started)), online: navigator.onLine};
    if (detail) {
      ['errorType','errorCode','errorSource','asset','line','column'].forEach(function (key) {
        if (detail[key] !== undefined) payload[key] = detail[key];
      });
      payload.phase = state.ready ? 'ready' : 'bootstrap';
    }
    state.pending.push(payload);
    flush();
  }
  function waitForReady() {
    clearTimeout(timer);
    if (state && !state.ready && !document.hidden) timer = setTimeout(function () {
      if (!document.hidden && state && !state.ready) report('hydration_timeout');
    }, 20000);
  }
  function activate() {
    var node = document.querySelector('[data-checkout-attempt]');
    if (!node) return;
    var id = node.getAttribute('data-checkout-attempt');
    if (state && state.id === id) return;
    if (observer) { observer.disconnect(); observer = null; }
    clearTimeout(timer);
    var mode = node.getAttribute('data-checkout-mode');
    state = {id: id, reference: node.getAttribute('data-checkout-reference'), started: Date.now(),
      ready: mode !== 'interactive', count: 0, seen: {}, pending: []};
    report('checkout_loaded');
    if (mode === 'error') report('server_error_screen');
    var queued = early.splice(0, 8); queued.forEach(function (item) { report(item.event, item.detail); });
    if (!navigator.onLine) report('offline');
    waitForReady();
  }
  window.addEventListener('livecart:checkout', function (event) {
    activate(); if (event.detail) report(event.detail.event);
  });
  function errorDetails(error, filename, line, column) {
    var detail = {errorType: 'Other', errorCode: 'other', errorSource: 'unknown'};
    try {
      if (error && ['Error','TypeError','ReferenceError','SyntaxError','RangeError','SecurityError','AbortError'].indexOf(error.name) >= 0) detail.errorType = error.name;
      var message = error && typeof error.message === 'string' ? error.message.slice(0, 1000) : '';
      if (/Cannot read propert|undefined is not an object|null is not an object/i.test(message)) detail.errorCode = 'property_access';
      else if (/is not a function/i.test(message)) detail.errorCode = 'not_callable';
      else if (/Loading chunk|ChunkLoadError|Failed to load chunk/i.test(message)) detail.errorCode = 'chunk_load';
      else if (/Failed to fetch|Load failed|NetworkError/i.test(message)) detail.errorCode = 'network';
      else if (/^Script error\.?$/.test(message)) detail.errorCode = 'script_error';
      if (filename) {
        var source = document.createElement('a'); source.href = filename;
        detail.errorSource = source.host !== location.host ? 'external' : source.pathname.indexOf('/_next/static/') === 0 ? 'app_chunk' : 'inline';
        if (detail.errorSource === 'app_chunk') {
          var asset = /\/([a-f0-9-]{6,80})\.js$/.exec(source.pathname);
          if (asset) detail.asset = asset[1];
          if (typeof line === 'number' && line >= 0 && line <= 10000000 && line % 1 === 0) detail.line = line;
          if (typeof column === 'number' && column >= 0 && column <= 10000000 && column % 1 === 0) detail.column = column;
        }
      }
    } catch (_) {}
    return detail;
  }
  window.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'SCRIPT') {
      var link = document.createElement('a'); link.href = target.src;
      if (link.host === location.host && link.pathname.indexOf('/_next/') === 0) report('script_load_error', errorDetails(null, target.src));
    } else if (event.target === window) report('javascript_error', errorDetails(event.error || {message: event.message}, event.filename, event.lineno, event.colno));
  }, true);
  window.addEventListener('unhandledrejection', function (event) { report('unhandled_rejection', errorDetails(event.reason)); });
  window.addEventListener('offline', function () { report('offline'); });
  window.addEventListener('online', function () { report('recovered_online'); flush(); });
  document.addEventListener('visibilitychange', waitForReady);
  if (/^\/cart\/[^/]+\/?$/.test(location.pathname)) {
    observer = new MutationObserver(activate);
    observer.observe(document.documentElement, {childList: true, subtree: true});
    activate();
  }
})();
`
