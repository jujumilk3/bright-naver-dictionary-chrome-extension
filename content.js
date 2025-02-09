(function() {
    console.log('content.js');

    // 원본 matchMedia를 저장
    const originalMatchMedia = window.matchMedia;
    
    console.log("originalMatchMedia", originalMatchMedia)

        
    // matchMedia 가로채서 래핑
    window.matchMedia = function(query) {
        console.log('[Intercepted matchMedia call]', query);

        // 반환값을 그대로 받아오거나, 필요하다면 조작 가능
        const mqList = originalMatchMedia(query);

        // 결과값 로그
        console.log('[Result]', mqList.matches);

        // 예) 무조건 false로 바꿔치기
        // mqList.matches = false;
        // // .addListener, .addEventListener 등은 필요시 직접 오버라이딩

        return mqList;
    };

	//dark mode
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('dark mode. 이게 실행되나?');
        console.log("window.matchMedia",window.matchMedia)

        console.log("window.media", window.media)
        console.log("window.matchMedia('(prefers-color-scheme: dark)').matches", window.matchMedia('(prefers-color-scheme: dark)').matches)
        console.log(window)
		var body = document.body;
		// body.classList.add("is-darkmode");
	}

    window.matchMedia = function(query) {
        console.log("second matchMedia")
        console.log(query)
        if (query === '(prefers-color-scheme: dark)') {
          // => 다크 모드 쿼리를 항상 false 처리
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener() {},
            removeListener() {},
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() { return false; }
          };
        }
        return originalMatchMedia(query);
      };
    

    // matchMedia를 가로채는 함수
    window.matchMedia = function(query) {
        console.log("the query is")
        console.log(query)
      // 만약 "prefers-color-scheme: dark"를 묻는다면 무조건 false 처리
      if (query === '(prefers-color-scheme: dark)') {
        console.log('prefers-color-scheme: dark');
        return {
          matches: false, // 항상 라이트 모드라고 인식
          media: query,
          onchange: null,
          // 아래 메서드들은 이벤트 등록이 되어도 아무것도 안 하도록 빈 함수 처리
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() { return false; }
        };
      }
      // 그 외 다른 쿼리는 원본 matchMedia 로직 그대로 사용
      return originalMatchMedia(query);
    };
  })();
  