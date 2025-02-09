(function() {
    console.log('content.js');

    // 원본 matchMedia를 저장
    const originalMatchMedia = window.matchMedia;
    
    console.log("originalMatchMedia", originalMatchMedia)

        
    // matchMedia 가로채서 래핑
    window.matchMedia = function(query) {
        console.log('[Intercepted matchMedia call]', query);

        // 우선 원본을 한 번 호출 (필요하면 로깅이나 디버깅용)
        const mqList = originalMatchMedia(query);
        console.log('[Original matches]', mqList.matches);

        // 만약 '(prefers-color-scheme: dark)'라면 무조건 false로
        if (query.includes('(prefers-color-scheme: dark)')) {
        // mqList.matches 값을 강제로 false로 덮어쓴다
        mqList.matches = false;
        console.log('→ Forced "dark" query to false');
        }
        return mqList;
    };

  // DOMTokenList.prototype.add의 원본을 저장
  const originalAdd = DOMTokenList.prototype.add;

  console.log("originalAdd", originalAdd)
  // add 메서드를 오버라이드
  DOMTokenList.prototype.add = function(...tokens) {
    console.log('[Intercepted DOMTokenList.add call]', tokens);
    // body.classList에 'is-darkmode' 추가 시도를 가로챈다
    if (this === document.body.classList && tokens.includes("is-darkmode")) {
      console.log('[PreventDarkMode] Blocked adding "is-darkmode" to body.classList');
      // "is-darkmode"를 제거한 나머지 토큰만 실제로 추가
      tokens = tokens.filter(token => token !== "is-darkmode");
    }

    // 원본 메서드를 호출 (남은 토큰들만 추가)
    return originalAdd.apply(this, tokens);
  };    

	// //dark mode
	// if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //     console.log('dark mode. 이게 실행되나?');
    //     console.log("window.matchMedia",window.matchMedia)

    //     console.log("window.media", window.media)
    //     console.log("window.matchMedia('(prefers-color-scheme: dark)').matches", window.matchMedia('(prefers-color-scheme: dark)').matches)
    //     console.log(window)
	// 	var body = document.body;
	// 	// body.classList.add("is-darkmode");
	// }

    // window.matchMedia = function(query) {
    //     console.log("second matchMedia")
    //     console.log(query)
    //     if (query === '(prefers-color-scheme: dark)') {
    //       // => 다크 모드 쿼리를 항상 false 처리
    //       return {
    //         matches: false,
    //         media: query,
    //         onchange: null,
    //         addListener() {},
    //         removeListener() {},
    //         addEventListener() {},
    //         removeEventListener() {},
    //         dispatchEvent() { return false; }
    //       };
    //     }
    //     return originalMatchMedia(query);
    //   };
    

    // // matchMedia를 가로채는 함수
    // window.matchMedia = function(query) {
    //     console.log("the query is")
    //     console.log(query)
    //   // 만약 "prefers-color-scheme: dark"를 묻는다면 무조건 false 처리
    //   if (query === '(prefers-color-scheme: dark)') {
    //     console.log('prefers-color-scheme: dark');
    //     return {
    //       matches: false, // 항상 라이트 모드라고 인식
    //       media: query,
    //       onchange: null,
    //       // 아래 메서드들은 이벤트 등록이 되어도 아무것도 안 하도록 빈 함수 처리
    //       addListener() {},
    //       removeListener() {},
    //       addEventListener() {},
    //       removeEventListener() {},
    //       dispatchEvent() { return false; }
    //     };
    //   }
    //   // 그 외 다른 쿼리는 원본 matchMedia 로직 그대로 사용
    //   return originalMatchMedia(query);
    // };
  })();
  