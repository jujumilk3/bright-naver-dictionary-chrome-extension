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

  // DOM이 준비된 뒤 실행(아직 스타일시트가 없다면 에러 날 수 있음)
  document.addEventListener("DOMContentLoaded", () => {
    const sheets = document.styleSheets;

    for (const sheet of sheets) {
      try {
        // 각 styleSheet에 대해 cssRules를 순회
        const rules = sheet.cssRules || sheet.rules;
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          console.log("[DEBUG] Rule type:", rule.type, rule.conditionText);
          // MEDIA_RULE = 4
          if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes('(prefers-color-scheme: dark)')) {
            console.log("[DEBUG] Removing dark mode media rule:", rule.conditionText);
            sheet.deleteRule(i);
            i--;
          }
        }
      } catch (e) {
        // cross-origin, CSP 등의 이유로 접근 불가하면 에러
        // console.error(e);
      }
    }
  });
  

    // 2) 일정 간격으로 검사하는 interval
    const intervalId = setInterval(removeDarkModeIfNeeded, 500); // 0.5초마다

    function removeDarkModeIfNeeded() {
      const body = document.body;
      // 아직 body가 없으면 그냥 return
      if (!body) return;
  
      if (body.classList.contains("is-darkmode")) {
        // 붙어 있으면 제거
        body.classList.remove("is-darkmode");
        console.log("Removed 'is-darkmode' from body.");
      } else {
        // 이미 제거돼서 없는 상태라면, 더 이상 interval 돌 필요 없음
        clearInterval(intervalId);
        console.log("No 'is-darkmode' found. Stopping checks.");
      }
    }
  
  })();
  