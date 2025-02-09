console.log("background.js");

chrome.webNavigation.onCommitted.addListener((details) => {
    console.log("background.js: onCommitted", details);
    // frameId === 0 이면 최상위 프레임(메인문서)
    // 서브 프레임(iframe) 등은 무시
    if (details.frameId === 0 && details.url.includes("dict.naver.com")) {
      // 원하는 사이트에 접속하는 순간, 우리가 만든 스크립트를 주입
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["force_light.js"],  // 주입할 파일
        // 이벤트가 발생한 "메인" 세계에 주입할지, 확장 전용 "ISOLATED" 세계에 주입할지
        // matchMedia 오버라이드처럼 원본 window를 건드려야 하면 "MAIN" 권장
        world: "MAIN",
        // injectImmediately: true 설정 (매우 초기 시점에 삽입, Chrome 104+ 지원)
        injectImmediately: true
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("executeScript error:", chrome.runtime.lastError.message);
        } else {
          console.log("[SW] force_light.js injected successfully");
        }
      });
    }
  });
  
// background.js (service worker)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log("[SW] onHistoryStateUpdated fired:", details.url);
    
    if (details.frameId === 0 && details.url.includes("dict.naver.com")) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["force_light.js"],
        world: "MAIN",
        injectImmediately: true
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("executeScript error:", chrome.runtime.lastError.message);
        } else {
          console.log("[SW] force_light.js injected again (historyStateUpdated)");
        }
      });
    }
  });
  