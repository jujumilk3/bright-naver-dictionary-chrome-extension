(function() {
    console.log("[ForceLight] force_light.js loaded.");
  
    // 1) matchMedia 오버라이드 (항상 false)
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      const mqList = originalMatchMedia(query);
      if (query.includes("(prefers-color-scheme: dark)")) {
        mqList.matches = false;
        console.log("[ForceLight] Overrode dark-mode match to false");
      }
      return mqList;
    };
  
    // 2) body.classList.add('is-darkmode') 차단
    const originalAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function(...tokens) {
      // body가 아직 없을 수도 있으므로 체크
      if (this === document.body?.classList && tokens.includes("is-darkmode")) {
        console.log("[ForceLight] Blocked is-darkmode");
        // "is-darkmode" 제거
        tokens = tokens.filter(token => token !== "is-darkmode");
      }
      return originalAdd.apply(this, tokens);
    };
  
    // 3) 혹시 이미 붙었으면 제거 (인라인 스크립트가 더 빨랐을 경우 대비)
    //    body가 아직 없으면 null이므로 optional chaining
    if (document.body?.classList.contains("is-darkmode")) {
      document.body.classList.remove("is-darkmode");
    }
  })();
  