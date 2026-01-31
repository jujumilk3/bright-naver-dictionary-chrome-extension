(function () {
  // 1) matchMedia 오버라이드 — matches를 getter로 확실히 고정
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = function (query) {
    const mqList = originalMatchMedia.call(window, query);
    if (query.includes("prefers-color-scheme: dark")) {
      try {
        Object.defineProperty(mqList, "matches", {
          get: () => false,
          configurable: true,
        });
      } catch (_) {
        mqList.matches = false;
      }

      const noop = () => {};
      mqList.addListener = noop;
      mqList.addEventListener = noop;
    }
    return mqList;
  };

  // 2) body.classList.add / toggle / replace 에서 is-darkmode 차단
  const originalAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function (...tokens) {
    if (this === document.body?.classList) {
      tokens = tokens.filter((t) => t !== "is-darkmode");
      if (tokens.length === 0) return;
    }
    return originalAdd.apply(this, tokens);
  };

  const originalToggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function (token, force) {
    if (this === document.body?.classList && token === "is-darkmode") {
      if (this.contains("is-darkmode")) this.remove("is-darkmode");
      return false;
    }
    return originalToggle.call(this, token, force);
  };

  // 3) body.className 직접 할당 감시
  const bodyDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "className"
  );
  if (bodyDescriptor) {
    Object.defineProperty(HTMLElement.prototype, "className", {
      set(value) {
        if (this === document.body && typeof value === "string") {
          value = value
            .split(/\s+/)
            .filter((c) => c !== "is-darkmode")
            .join(" ");
        }
        bodyDescriptor.set.call(this, value);
      },
      get() {
        return bodyDescriptor.get.call(this);
      },
      configurable: true,
    });
  }

  // 4) color-scheme 강제 light 주입
  function injectLightColorScheme() {
    if (document.getElementById("__force_light_cs")) return;
    const style = document.createElement("style");
    style.id = "__force_light_cs";
    style.textContent =
      ":root, html, body { color-scheme: light !important; }";
    (document.head || document.documentElement).appendChild(style);
  }

  // 5) <meta name="color-scheme"> dark 제거
  function sanitizeColorSchemeMeta() {
    document
      .querySelectorAll('meta[name="color-scheme"]')
      .forEach((meta) => {
        const content = meta.getAttribute("content") || "";
        if (content.includes("dark")) {
          meta.setAttribute("content", "light");
        }
      });
  }

  // 6) 다크모드 CSS 미디어룰 제거 — 모든 스타일시트 대상
  function deleteDarkMediaRules() {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let i = rules.length - 1; i >= 0; i--) {
          const rule = rules[i];
          if (
            rule.type === CSSRule.MEDIA_RULE &&
            rule.conditionText?.includes("prefers-color-scheme: dark")
          ) {
            sheet.deleteRule(i);
          }
        }
      } catch (_) {
        // cross-origin / CSP
      }
    }
  }

  // 7) body에서 is-darkmode 제거 + color-scheme 정리
  function cleanBody() {
    const body = document.body;
    if (!body) return;
    if (body.classList.contains("is-darkmode")) {
      body.classList.remove("is-darkmode");
    }
    if (body.style.colorScheme && body.style.colorScheme !== "light") {
      body.style.colorScheme = "light";
    }
  }

  // 즉시 실행
  cleanBody();
  injectLightColorScheme();

  // 8) MutationObserver — body class 변경 및 동적 스타일시트 감시
  function startObserver() {
    const body = document.body;
    if (!body) return;

    new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "attributes" &&
          m.attributeName === "class" &&
          body.classList.contains("is-darkmode")
        ) {
          body.classList.remove("is-darkmode");
        }
      }
    }).observe(body, { attributes: true, attributeFilter: ["class"] });

    new MutationObserver((mutations) => {
      let needsClean = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (
            node.tagName === "STYLE" ||
            node.tagName === "LINK"
          ) {
            needsClean = true;
          }
          if (
            node.tagName === "META" &&
            node.getAttribute?.("name") === "color-scheme"
          ) {
            sanitizeColorSchemeMeta();
          }
        }
      }
      if (needsClean) {
        setTimeout(deleteDarkMediaRules, 50);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // 9) DOMContentLoaded 시점에 전체 정리
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      cleanBody();
      injectLightColorScheme();
      sanitizeColorSchemeMeta();
      deleteDarkMediaRules();
      startObserver();
    });
  } else {
    cleanBody();
    injectLightColorScheme();
    sanitizeColorSchemeMeta();
    deleteDarkMediaRules();
    startObserver();
  }

  // 10) 안전망 — 늦게 로드되는 스크립트 대비 재정리
  setTimeout(() => {
    cleanBody();
    deleteDarkMediaRules();
    sanitizeColorSchemeMeta();
  }, 1000);

  setTimeout(() => {
    cleanBody();
    deleteDarkMediaRules();
  }, 3000);
})();
