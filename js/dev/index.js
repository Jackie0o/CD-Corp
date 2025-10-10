(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function addLoadedAttr() {
  if (!document.documentElement.hasAttribute("data-fls-preloader-loading")) {
    window.addEventListener("load", function() {
      setTimeout(function() {
        document.documentElement.setAttribute("data-fls-loaded", "");
      }, 0);
    });
  }
}
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function uniqArray(array) {
  return array.filter((item, index, self) => self.indexOf(item) === index);
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function menuInit() {
  const menuButton = document.querySelector("[data-fls-menu]");
  const menuBody = document.querySelector(".menu__body");
  if (!menuButton || !menuBody) return;
  const isMenuOpen = () => document.documentElement.hasAttribute("data-fls-menu-open");
  function openMenu() {
    if (!isMenuOpen()) {
      bodyLockToggle();
      document.documentElement.setAttribute("data-fls-menu-open", "");
      history.pushState({ flsMenu: true }, "");
    }
  }
  function closeMenu(popHistory = true) {
    if (!isMenuOpen()) return;
    bodyLockToggle();
    document.documentElement.removeAttribute("data-fls-menu-open");
    if (popHistory) {
      history.back();
    }
  }
  document.addEventListener("click", (e) => {
    const clickedBtn = e.target.closest("[data-fls-menu]");
    const clickedInsideMenu = e.target.closest(".menu__body");
    if (bodyLockStatus && clickedBtn) {
      if (isMenuOpen()) closeMenu(true);
      else openMenu();
      return;
    }
    if (isMenuOpen() && !clickedInsideMenu) {
      closeMenu(true);
      return;
    }
  });
  window.addEventListener("popstate", (event) => {
    if (isMenuOpen()) {
      closeMenu(false);
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
function headerScroll() {
  const header = document.querySelector("[data-fls-header-scroll]");
  const headerShow = header.hasAttribute("data-fls-header-scroll-show");
  const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
  const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("scroll", function(e) {
    const scrollTop = window.scrollY;
    clearTimeout(timer);
    if (scrollTop >= startPoint) {
      if (scrollTop > scrollDirection) {
        header.classList.add("--header-hide") & header.classList.remove("--header-scroll");
      } else {
        header.classList.remove("--header-hide") & header.classList.add("--header-scroll");
      }
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
        } else {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("--header-scroll") ? header.classList.remove("--header-scroll") : null;
      if (headerShow) {
        header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-fls-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
class ScrollWatcher {
  constructor(props) {
    let defaultConfig = {
      logging: true
    };
    this.config = Object.assign(defaultConfig, props);
    this.observer;
    !document.documentElement.hasAttribute("data-fls-watch") ? this.scrollWatcherRun() : null;
  }
  // Оновлюємо конструктор
  scrollWatcherUpdate() {
    this.scrollWatcherRun();
  }
  // Запускаємо конструктор
  scrollWatcherRun() {
    document.documentElement.setAttribute("data-fls-watch", "");
    this.scrollWatcherConstructor(document.querySelectorAll("[data-fls-watcher]"));
  }
  // Конструктор спостерігачів
  scrollWatcherConstructor(items) {
    if (items.length) {
      let uniqParams = uniqArray(Array.from(items).map(function(item) {
        if (item.dataset.flsWatcher === "navigator" && !item.dataset.flsWatcherThreshold) {
          let valueOfThreshold;
          if (item.clientHeight > 2) {
            valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
            if (valueOfThreshold > 1) {
              valueOfThreshold = 1;
            }
          } else {
            valueOfThreshold = 1;
          }
          item.setAttribute(
            "data-fls-watcher-threshold",
            valueOfThreshold.toFixed(2)
          );
        }
        return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px"}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
      }));
      uniqParams.forEach((uniqParam) => {
        let uniqParamArray = uniqParam.split("|");
        let paramsWatch = {
          root: uniqParamArray[0],
          margin: uniqParamArray[1],
          threshold: uniqParamArray[2]
        };
        let groupItems = Array.from(items).filter(function(item) {
          let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
          let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px";
          let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
          if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) {
            return item;
          }
        });
        let configWatcher = this.getScrollWatcherConfig(paramsWatch);
        this.scrollWatcherInit(groupItems, configWatcher);
      });
    }
  }
  // Функція створення налаштувань
  getScrollWatcherConfig(paramsWatch) {
    let configWatcher = {};
    if (document.querySelector(paramsWatch.root)) {
      configWatcher.root = document.querySelector(paramsWatch.root);
    } else if (paramsWatch.root !== "null") ;
    configWatcher.rootMargin = paramsWatch.margin;
    if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) {
      return;
    }
    if (paramsWatch.threshold === "prx") {
      paramsWatch.threshold = [];
      for (let i = 0; i <= 1; i += 5e-3) {
        paramsWatch.threshold.push(i);
      }
    } else {
      paramsWatch.threshold = paramsWatch.threshold.split(",");
    }
    configWatcher.threshold = paramsWatch.threshold;
    return configWatcher;
  }
  // Функція створення нового спостерігача зі своїми налаштуваннями
  scrollWatcherCreate(configWatcher) {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        this.scrollWatcherCallback(entry, observer);
      });
    }, configWatcher);
  }
  // Функція ініціалізації спостерігача зі своїми налаштуваннями
  scrollWatcherInit(items, configWatcher) {
    this.scrollWatcherCreate(configWatcher);
    items.forEach((item) => this.observer.observe(item));
  }
  // Функція обробки базових дій точок спрацьовування
  scrollWatcherIntersecting(entry, targetElement) {
    if (entry.isIntersecting) {
      !targetElement.classList.contains("--watcher-view") ? targetElement.classList.add("--watcher-view") : null;
    } else {
      targetElement.classList.contains("--watcher-view") ? targetElement.classList.remove("--watcher-view") : null;
    }
  }
  // Функція відключення стеження за об'єктом
  scrollWatcherOff(targetElement, observer) {
    observer.unobserve(targetElement);
  }
  // Функція обробки спостереження
  scrollWatcherCallback(entry, observer) {
    const targetElement = entry.target;
    this.scrollWatcherIntersecting(entry, targetElement);
    targetElement.hasAttribute("data-fls-watcher-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
    document.dispatchEvent(new CustomEvent("watcherCallback", {
      detail: {
        entry
      }
    }));
  }
}
document.querySelector("[data-fls-watcher]") ? window.addEventListener("load", () => new ScrollWatcher({})) : null;
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : "";
        const noHeader = gotoLink.hasAttribute("data-fls-scrollto-header") ? true : false;
        const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
        const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
        if (window.fullpage) {
          const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fls-fullpage-section]");
          const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
          if (fullpageSectionId !== null) {
            window.fullpage.switchingSection(fullpageSectionId);
            if (document.documentElement.hasAttribute("data-fls-menu-open")) {
              bodyUnlock();
              document.documentElement.removeAttribute("data-fls-menu-open");
            }
          }
        } else {
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const targetElement = entry.target;
      if (targetElement.dataset.flsWatcher === "navigator") {
        document.querySelector(`[data-fls-scrollto].--navigator-active`);
        let navigatorCurrentItem;
        if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
          navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
        } else if (targetElement.classList.length) {
          for (let index = 0; index < targetElement.classList.length; index++) {
            const element = targetElement.classList[index];
            if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
              navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          navigatorCurrentItem ? navigatorCurrentItem.classList.add("--navigator-active") : null;
        } else {
          navigatorCurrentItem ? navigatorCurrentItem.classList.remove("--navigator-active") : null;
        }
      }
    }
  }
  if (getHash()) {
    let goToHash;
    if (document.querySelector(`#${getHash()}`)) {
      goToHash = `#${getHash()}`;
    } else if (document.querySelector(`.${getHash()}`)) {
      goToHash = `.${getHash()}`;
    }
    goToHash ? gotoBlock(goToHash) : null;
  }
}
document.querySelector("[data-fls-scrollto]") ? window.addEventListener("load", pageNavigation) : null;
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var splitting$1 = { exports: {} };
var splitting = splitting$1.exports;
var hasRequiredSplitting;
function requireSplitting() {
  if (hasRequiredSplitting) return splitting$1.exports;
  hasRequiredSplitting = 1;
  (function(module, exports) {
    (function(global, factory) {
      module.exports = factory();
    })(splitting, (function() {
      var root = document;
      var createText = root.createTextNode.bind(root);
      function setProperty(el, varName, value) {
        el.style.setProperty(varName, value);
      }
      function appendChild(el, child) {
        return el.appendChild(child);
      }
      function createElement(parent, key, text, whitespace) {
        var el = root.createElement("span");
        key && (el.className = key);
        if (text) {
          !whitespace && el.setAttribute("data-" + key, text);
          el.textContent = text;
        }
        return parent && appendChild(parent, el) || el;
      }
      function getData(el, key) {
        return el.getAttribute("data-" + key);
      }
      function $(e, parent) {
        return !e || e.length == 0 ? (
          // null or empty string returns empty array
          []
        ) : e.nodeName ? (
          // a single element is wrapped in an array
          [e]
        ) : (
          // selector and NodeList are converted to Element[]
          [].slice.call(e[0].nodeName ? e : (parent || root).querySelectorAll(e))
        );
      }
      function Array2D(len) {
        var a = [];
        for (; len--; ) {
          a[len] = [];
        }
        return a;
      }
      function each(items, consumer) {
        items && items.some(consumer);
      }
      function selectFrom(obj) {
        return function(key) {
          return obj[key];
        };
      }
      function index(element, key, items) {
        var prefix = "--" + key;
        var cssVar = prefix + "-index";
        each(items, function(items2, i) {
          if (Array.isArray(items2)) {
            each(items2, function(item) {
              setProperty(item, cssVar, i);
            });
          } else {
            setProperty(items2, cssVar, i);
          }
        });
        setProperty(element, prefix + "-total", items.length);
      }
      var plugins = {};
      function resolvePlugins(by, parent, deps) {
        var index2 = deps.indexOf(by);
        if (index2 == -1) {
          deps.unshift(by);
          var plugin = plugins[by];
          if (!plugin) {
            throw new Error("plugin not loaded: " + by);
          }
          each(plugin.depends, function(p) {
            resolvePlugins(p, by, deps);
          });
        } else {
          var indexOfParent = deps.indexOf(parent);
          deps.splice(index2, 1);
          deps.splice(indexOfParent, 0, by);
        }
        return deps;
      }
      function createPlugin(by, depends, key, split) {
        return {
          by,
          depends,
          key,
          split
        };
      }
      function resolve(by) {
        return resolvePlugins(by, 0, []).map(selectFrom(plugins));
      }
      function add(opts) {
        plugins[opts.by] = opts;
      }
      function splitText(el, key, splitOn, includePrevious, preserveWhitespace) {
        el.normalize();
        var elements = [];
        var F = document.createDocumentFragment();
        if (includePrevious) {
          elements.push(el.previousSibling);
        }
        var allElements = [];
        $(el.childNodes).some(function(next) {
          if (next.tagName && !next.hasChildNodes()) {
            allElements.push(next);
            return;
          }
          if (next.childNodes && next.childNodes.length) {
            allElements.push(next);
            elements.push.apply(elements, splitText(next, key, splitOn, includePrevious, preserveWhitespace));
            return;
          }
          var wholeText = next.wholeText || "";
          var contents = wholeText.trim();
          if (contents.length) {
            if (wholeText[0] === " ") {
              allElements.push(createText(" "));
            }
            var useSegmenter = splitOn === "" && typeof Intl.Segmenter === "function";
            each(useSegmenter ? Array.from(new Intl.Segmenter().segment(contents)).map(function(x) {
              return x.segment;
            }) : contents.split(splitOn), function(splitText2, i) {
              if (i && preserveWhitespace) {
                allElements.push(createElement(F, "whitespace", " ", preserveWhitespace));
              }
              var splitEl = createElement(F, key, splitText2);
              elements.push(splitEl);
              allElements.push(splitEl);
            });
            if (wholeText[wholeText.length - 1] === " ") {
              allElements.push(createText(" "));
            }
          }
        });
        each(allElements, function(el2) {
          appendChild(F, el2);
        });
        el.innerHTML = "";
        appendChild(el, F);
        return elements;
      }
      var _ = 0;
      function copy(dest, src) {
        for (var k in src) {
          dest[k] = src[k];
        }
        return dest;
      }
      var WORDS = "words";
      var wordPlugin = createPlugin(
        /* by= */
        WORDS,
        /* depends= */
        _,
        /* key= */
        "word",
        /* split= */
        function(el) {
          return splitText(el, "word", /\s+/, 0, 1);
        }
      );
      var CHARS = "chars";
      var charPlugin = createPlugin(
        /* by= */
        CHARS,
        /* depends= */
        [WORDS],
        /* key= */
        "char",
        /* split= */
        function(el, options, ctx) {
          var results = [];
          each(ctx[WORDS], function(word, i) {
            results.push.apply(results, splitText(word, "char", "", options.whitespace && i));
          });
          return results;
        }
      );
      function Splitting2(opts) {
        opts = opts || {};
        var key = opts.key;
        return $(opts.target || "[data-splitting]").map(function(el) {
          var ctx = el["🍌"];
          if (!opts.force && ctx) {
            return ctx;
          }
          ctx = el["🍌"] = { el };
          var by = opts.by || getData(el, "splitting");
          if (!by || by == "true") {
            by = CHARS;
          }
          var items = resolve(by);
          var opts2 = copy({}, opts);
          each(items, function(plugin) {
            if (plugin.split) {
              var pluginBy = plugin.by;
              var key2 = (key ? "-" + key : "") + plugin.key;
              var results = plugin.split(el, opts2, ctx);
              key2 && index(el, key2, results);
              ctx[pluginBy] = results;
              el.classList.add(pluginBy);
            }
          });
          el.classList.add("splitting");
          return ctx;
        });
      }
      function html(opts) {
        opts = opts || {};
        var parent = opts.target = createElement();
        parent.innerHTML = opts.content;
        Splitting2(opts);
        return parent.outerHTML;
      }
      Splitting2.html = html;
      Splitting2.add = add;
      function detectGrid(el, options, side) {
        var items = $(options.matching || el.children, el);
        var c = {};
        each(items, function(w) {
          var val = Math.round(w[side]);
          (c[val] || (c[val] = [])).push(w);
        });
        return Object.keys(c).map(Number).sort(byNumber).map(selectFrom(c));
      }
      function byNumber(a, b) {
        return a - b;
      }
      var linePlugin = createPlugin(
        /* by= */
        "lines",
        /* depends= */
        [WORDS],
        /* key= */
        "line",
        /* split= */
        function(el, options, ctx) {
          return detectGrid(el, { matching: ctx[WORDS] }, "offsetTop");
        }
      );
      var itemPlugin = createPlugin(
        /* by= */
        "items",
        /* depends= */
        _,
        /* key= */
        "item",
        /* split= */
        function(el, options) {
          return $(options.matching || el.children, el);
        }
      );
      var rowPlugin = createPlugin(
        /* by= */
        "rows",
        /* depends= */
        _,
        /* key= */
        "row",
        /* split= */
        function(el, options) {
          return detectGrid(el, options, "offsetTop");
        }
      );
      var columnPlugin = createPlugin(
        /* by= */
        "cols",
        /* depends= */
        _,
        /* key= */
        "col",
        /* split= */
        function(el, options) {
          return detectGrid(el, options, "offsetLeft");
        }
      );
      var gridPlugin = createPlugin(
        /* by= */
        "grid",
        /* depends= */
        ["rows", "cols"]
      );
      var LAYOUT = "layout";
      var layoutPlugin = createPlugin(
        /* by= */
        LAYOUT,
        /* depends= */
        _,
        /* key= */
        _,
        /* split= */
        function(el, opts) {
          var rows = opts.rows = +(opts.rows || getData(el, "rows") || 1);
          var columns = opts.columns = +(opts.columns || getData(el, "columns") || 1);
          opts.image = opts.image || getData(el, "image") || el.currentSrc || el.src;
          if (opts.image) {
            var img = $("img", el)[0];
            opts.image = img && (img.currentSrc || img.src);
          }
          if (opts.image) {
            setProperty(el, "background-image", "url(" + opts.image + ")");
          }
          var totalCells = rows * columns;
          var elements = [];
          var container = createElement(_, "cell-grid");
          while (totalCells--) {
            var cell = createElement(container, "cell");
            createElement(cell, "cell-inner");
            elements.push(cell);
          }
          appendChild(el, container);
          return elements;
        }
      );
      var cellRowPlugin = createPlugin(
        /* by= */
        "cellRows",
        /* depends= */
        [LAYOUT],
        /* key= */
        "row",
        /* split= */
        function(el, opts, ctx) {
          var rowCount = opts.rows;
          var result = Array2D(rowCount);
          each(ctx[LAYOUT], function(cell, i, src) {
            result[Math.floor(i / (src.length / rowCount))].push(cell);
          });
          return result;
        }
      );
      var cellColumnPlugin = createPlugin(
        /* by= */
        "cellColumns",
        /* depends= */
        [LAYOUT],
        /* key= */
        "col",
        /* split= */
        function(el, opts, ctx) {
          var columnCount = opts.columns;
          var result = Array2D(columnCount);
          each(ctx[LAYOUT], function(cell, i) {
            result[i % columnCount].push(cell);
          });
          return result;
        }
      );
      var cellPlugin = createPlugin(
        /* by= */
        "cells",
        /* depends= */
        ["cellRows", "cellColumns"],
        /* key= */
        "cell",
        /* split= */
        function(el, opt, ctx) {
          return ctx[LAYOUT];
        }
      );
      add(wordPlugin);
      add(charPlugin);
      add(linePlugin);
      add(itemPlugin);
      add(rowPlugin);
      add(columnPlugin);
      add(gridPlugin);
      add(layoutPlugin);
      add(cellRowPlugin);
      add(cellColumnPlugin);
      add(cellPlugin);
      return Splitting2;
    }));
  })(splitting$1);
  return splitting$1.exports;
}
var splittingExports = requireSplitting();
const Splitting = /* @__PURE__ */ getDefaultExportFromCjs(splittingExports);
Splitting();
addLoadedAttr();
