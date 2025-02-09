(function() {
    // 1) matchMedia 오버라이드 (document_start에서도 문제 없음)
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      const mqList = originalMatchMedia(query);
      if (query.includes("(prefers-color-scheme: dark)")) {
        mqList.matches = false; // 무조건 false
      }
      return mqList;
    };
  
    // 2) DOMTokenList.add 오버라이드 (문제 없음, 프로토타입 수정이므로 body 유무와 무관)
    const originalAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function(...tokens) {
      if (this === document.body?.classList && tokens.includes("is-darkmode")) {
        // body가 존재하고 is-darkmode를 추가하려 할 때 차단
        tokens = tokens.filter(token => token !== "is-darkmode");
      }
      return originalAdd.apply(this, tokens);
    };
  
    // 3) 실제 body 관련 조작은 DOMContentLoaded 이후에
    function removeDarkModeIfNeeded() {
      const body = document.body;
      if (!body) return;
      // 이미 붙어있으면 제거
      if (body.classList.contains("is-darkmode")) {
        body.classList.remove("is-darkmode");
      }
    }
  
    document.addEventListener("DOMContentLoaded", removeDarkModeIfNeeded);
  
    // 혹시 더 일찍 body가 생길 수 있으므로, 10ms 뒤에 한 번 더 확인
    setTimeout(removeDarkModeIfNeeded, 10);
  })();
  