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
function isObject$1(obj) {
  return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend$1(target, src) {
  if (target === void 0) {
    target = {};
  }
  if (src === void 0) {
    src = {};
  }
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined") target[key] = src[key];
    else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
      extend$1(target[key], src[key]);
    }
  });
}
const ssrDocument = {
  body: {},
  addEventListener() {
  },
  removeEventListener() {
  },
  activeElement: {
    blur() {
    },
    nodeName: ""
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {
      }
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {
      },
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  }
};
function getDocument() {
  const doc = typeof document !== "undefined" ? document : {};
  extend$1(doc, ssrDocument);
  return doc;
}
const ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ""
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  },
  history: {
    replaceState() {
    },
    pushState() {
    },
    go() {
    },
    back() {
    }
  },
  CustomEvent: function CustomEvent2() {
    return this;
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      }
    };
  },
  Image() {
  },
  Date() {
  },
  screen: {},
  setTimeout() {
  },
  clearTimeout() {
  },
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === "undefined") {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id) {
    if (typeof setTimeout === "undefined") {
      return;
    }
    clearTimeout(id);
  }
};
function getWindow() {
  const win = typeof window !== "undefined" ? window : {};
  extend$1(win, ssrWindow);
  return win;
}
function classesToTokens(classes2) {
  if (classes2 === void 0) {
    classes2 = "";
  }
  return classes2.trim().split(" ").filter((c) => !!c.trim());
}
function deleteProps(obj) {
  const object = obj;
  Object.keys(object).forEach((key) => {
    try {
      object[key] = null;
    } catch (e) {
    }
    try {
      delete object[key];
    } catch (e) {
    }
  });
}
function nextTick(callback, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return setTimeout(callback, delay);
}
function now() {
  return Date.now();
}
function getComputedStyle$1(el) {
  const window2 = getWindow();
  let style;
  if (window2.getComputedStyle) {
    style = window2.getComputedStyle(el, null);
  }
  if (!style && el.currentStyle) {
    style = el.currentStyle;
  }
  if (!style) {
    style = el.style;
  }
  return style;
}
function getTranslate(el, axis) {
  if (axis === void 0) {
    axis = "x";
  }
  const window2 = getWindow();
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = getComputedStyle$1(el);
  if (window2.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;
    if (curTransform.split(",").length > 6) {
      curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
    }
    transformMatrix = new window2.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
    matrix = transformMatrix.toString().split(",");
  }
  if (axis === "x") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m41;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
    else curTransform = parseFloat(matrix[4]);
  }
  if (axis === "y") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m42;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
    else curTransform = parseFloat(matrix[5]);
  }
  return curTransform || 0;
}
function isObject(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
}
function isNode(node) {
  if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
    return node instanceof HTMLElement;
  }
  return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend() {
  const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
  const noExtend = ["__proto__", "constructor", "prototype"];
  for (let i = 1; i < arguments.length; i += 1) {
    const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
    if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
      const keysArray = Object.keys(Object(nextSource)).filter((key) => noExtend.indexOf(key) < 0);
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        const nextKey = keysArray[nextIndex];
        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== void 0 && desc.enumerable) {
          if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {};
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return to;
}
function setCSSProperty(el, varName, varValue) {
  el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll(_ref) {
  let {
    swiper,
    targetPosition,
    side
  } = _ref;
  const window2 = getWindow();
  const startPosition = -swiper.translate;
  let startTime = null;
  let time;
  const duration = swiper.params.speed;
  swiper.wrapperEl.style.scrollSnapType = "none";
  window2.cancelAnimationFrame(swiper.cssModeFrameID);
  const dir = targetPosition > startPosition ? "next" : "prev";
  const isOutOfBound = (current, target) => {
    return dir === "next" && current >= target || dir === "prev" && current <= target;
  };
  const animate = () => {
    time = (/* @__PURE__ */ new Date()).getTime();
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
    if (isOutOfBound(currentPosition, targetPosition)) {
      currentPosition = targetPosition;
    }
    swiper.wrapperEl.scrollTo({
      [side]: currentPosition
    });
    if (isOutOfBound(currentPosition, targetPosition)) {
      swiper.wrapperEl.style.overflow = "hidden";
      swiper.wrapperEl.style.scrollSnapType = "";
      setTimeout(() => {
        swiper.wrapperEl.style.overflow = "";
        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });
      });
      window2.cancelAnimationFrame(swiper.cssModeFrameID);
      return;
    }
    swiper.cssModeFrameID = window2.requestAnimationFrame(animate);
  };
  animate();
}
function getSlideTransformEl(slideEl) {
  return slideEl.querySelector(".swiper-slide-transform") || slideEl.shadowRoot && slideEl.shadowRoot.querySelector(".swiper-slide-transform") || slideEl;
}
function elementChildren(element, selector) {
  if (selector === void 0) {
    selector = "";
  }
  const window2 = getWindow();
  const children = [...element.children];
  if (window2.HTMLSlotElement && element instanceof HTMLSlotElement) {
    children.push(...element.assignedElements());
  }
  if (!selector) {
    return children;
  }
  return children.filter((el) => el.matches(selector));
}
function elementIsChildOfSlot(el, slot) {
  const elementsQueue = [slot];
  while (elementsQueue.length > 0) {
    const elementToCheck = elementsQueue.shift();
    if (el === elementToCheck) {
      return true;
    }
    elementsQueue.push(...elementToCheck.children, ...elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : [], ...elementToCheck.assignedElements ? elementToCheck.assignedElements() : []);
  }
}
function elementIsChildOf(el, parent) {
  const window2 = getWindow();
  let isChild = parent.contains(el);
  if (!isChild && window2.HTMLSlotElement && parent instanceof HTMLSlotElement) {
    const children = [...parent.assignedElements()];
    isChild = children.includes(el);
    if (!isChild) {
      isChild = elementIsChildOfSlot(el, parent);
    }
  }
  return isChild;
}
function showWarning(text) {
  try {
    console.warn(text);
    return;
  } catch (err) {
  }
}
function createElement(tag, classes2) {
  if (classes2 === void 0) {
    classes2 = [];
  }
  const el = document.createElement(tag);
  el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
  return el;
}
function elementPrevAll(el, selector) {
  const prevEls = [];
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling;
    if (selector) {
      if (prev.matches(selector)) prevEls.push(prev);
    } else prevEls.push(prev);
    el = prev;
  }
  return prevEls;
}
function elementNextAll(el, selector) {
  const nextEls = [];
  while (el.nextElementSibling) {
    const next = el.nextElementSibling;
    if (selector) {
      if (next.matches(selector)) nextEls.push(next);
    } else nextEls.push(next);
    el = next;
  }
  return nextEls;
}
function elementStyle(el, prop) {
  const window2 = getWindow();
  return window2.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
  let child = el;
  let i;
  if (child) {
    i = 0;
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }
    return i;
  }
  return void 0;
}
function elementParents(el, selector) {
  const parents = [];
  let parent = el.parentElement;
  while (parent) {
    {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}
function elementTransitionEnd(el, callback) {
  function fireCallBack(e) {
    if (e.target !== el) return;
    callback.call(el, e);
    el.removeEventListener("transitionend", fireCallBack);
  }
  if (callback) {
    el.addEventListener("transitionend", fireCallBack);
  }
}
function elementOuterSize(el, size, includeMargins) {
  const window2 = getWindow();
  {
    return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
  }
}
function makeElementsArray(el) {
  return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
let support;
function calcSupport() {
  const window2 = getWindow();
  const document2 = getDocument();
  return {
    smoothScroll: document2.documentElement && document2.documentElement.style && "scrollBehavior" in document2.documentElement.style,
    touch: !!("ontouchstart" in window2 || window2.DocumentTouch && document2 instanceof window2.DocumentTouch)
  };
}
function getSupport() {
  if (!support) {
    support = calcSupport();
  }
  return support;
}
let deviceCached;
function calcDevice(_temp) {
  let {
    userAgent
  } = _temp === void 0 ? {} : _temp;
  const support2 = getSupport();
  const window2 = getWindow();
  const platform = window2.navigator.platform;
  const ua = userAgent || window2.navigator.userAgent;
  const device = {
    ios: false,
    android: false
  };
  const screenWidth = window2.screen.width;
  const screenHeight = window2.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const windows = platform === "Win32";
  let macos = platform === "MacIntel";
  const iPadScreens = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
  if (!ipad && macos && support2.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    if (!ipad) ipad = [0, 1, "13_0_0"];
    macos = false;
  }
  if (android && !windows) {
    device.os = "android";
    device.android = true;
  }
  if (ipad || iphone || ipod) {
    device.os = "ios";
    device.ios = true;
  }
  return device;
}
function getDevice(overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  if (!deviceCached) {
    deviceCached = calcDevice(overrides);
  }
  return deviceCached;
}
let browser;
function calcBrowser() {
  const window2 = getWindow();
  const device = getDevice();
  let needPerspectiveFix = false;
  function isSafari() {
    const ua = window2.navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
  }
  if (isSafari()) {
    const ua = String(window2.navigator.userAgent);
    if (ua.includes("Version/")) {
      const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
    }
  }
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window2.navigator.userAgent);
  const isSafariBrowser = isSafari();
  const need3dFix = isSafariBrowser || isWebView && device.ios;
  return {
    isSafari: needPerspectiveFix || isSafariBrowser,
    needPerspectiveFix,
    need3dFix,
    isWebView
  };
}
function getBrowser() {
  if (!browser) {
    browser = calcBrowser();
  }
  return browser;
}
function Resize(_ref) {
  let {
    swiper,
    on,
    emit
  } = _ref;
  const window2 = getWindow();
  let observer = null;
  let animationFrame = null;
  const resizeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("beforeResize");
    emit("resize");
  };
  const createObserver = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    observer = new ResizeObserver((entries) => {
      animationFrame = window2.requestAnimationFrame(() => {
        const {
          width,
          height
        } = swiper;
        let newWidth = width;
        let newHeight = height;
        entries.forEach((_ref2) => {
          let {
            contentBoxSize,
            contentRect,
            target
          } = _ref2;
          if (target && target !== swiper.el) return;
          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
        });
        if (newWidth !== width || newHeight !== height) {
          resizeHandler();
        }
      });
    });
    observer.observe(swiper.el);
  };
  const removeObserver = () => {
    if (animationFrame) {
      window2.cancelAnimationFrame(animationFrame);
    }
    if (observer && observer.unobserve && swiper.el) {
      observer.unobserve(swiper.el);
      observer = null;
    }
  };
  const orientationChangeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("orientationchange");
  };
  on("init", () => {
    if (swiper.params.resizeObserver && typeof window2.ResizeObserver !== "undefined") {
      createObserver();
      return;
    }
    window2.addEventListener("resize", resizeHandler);
    window2.addEventListener("orientationchange", orientationChangeHandler);
  });
  on("destroy", () => {
    removeObserver();
    window2.removeEventListener("resize", resizeHandler);
    window2.removeEventListener("orientationchange", orientationChangeHandler);
  });
}
function Observer(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const observers = [];
  const window2 = getWindow();
  const attach = function(target, options) {
    if (options === void 0) {
      options = {};
    }
    const ObserverFunc = window2.MutationObserver || window2.WebkitMutationObserver;
    const observer = new ObserverFunc((mutations) => {
      if (swiper.__preventObserver__) return;
      if (mutations.length === 1) {
        emit("observerUpdate", mutations[0]);
        return;
      }
      const observerUpdate = function observerUpdate2() {
        emit("observerUpdate", mutations[0]);
      };
      if (window2.requestAnimationFrame) {
        window2.requestAnimationFrame(observerUpdate);
      } else {
        window2.setTimeout(observerUpdate, 0);
      }
    });
    observer.observe(target, {
      attributes: typeof options.attributes === "undefined" ? true : options.attributes,
      childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
      characterData: typeof options.characterData === "undefined" ? true : options.characterData
    });
    observers.push(observer);
  };
  const init = () => {
    if (!swiper.params.observer) return;
    if (swiper.params.observeParents) {
      const containerParents = elementParents(swiper.hostEl);
      for (let i = 0; i < containerParents.length; i += 1) {
        attach(containerParents[i]);
      }
    }
    attach(swiper.hostEl, {
      childList: swiper.params.observeSlideChildren
    });
    attach(swiper.wrapperEl, {
      attributes: false
    });
  };
  const destroy = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0, observers.length);
  };
  extendParams({
    observer: false,
    observeParents: false,
    observeSlideChildren: false
  });
  on("init", init);
  on("destroy", destroy);
}
var eventsEmitter = {
  on(events2, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    const method = priority ? "unshift" : "push";
    events2.split(" ").forEach((event) => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  },
  once(events2, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    function onceHandler() {
      self.off(events2, onceHandler);
      if (onceHandler.__emitterProxy) {
        delete onceHandler.__emitterProxy;
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      handler.apply(self, args);
    }
    onceHandler.__emitterProxy = handler;
    return self.on(events2, onceHandler, priority);
  },
  onAny(handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    const method = priority ? "unshift" : "push";
    if (self.eventsAnyListeners.indexOf(handler) < 0) {
      self.eventsAnyListeners[method](handler);
    }
    return self;
  },
  offAny(handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsAnyListeners) return self;
    const index = self.eventsAnyListeners.indexOf(handler);
    if (index >= 0) {
      self.eventsAnyListeners.splice(index, 1);
    }
    return self;
  },
  off(events2, handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    events2.split(" ").forEach((event) => {
      if (typeof handler === "undefined") {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  },
  emit() {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    let events2;
    let data;
    let context;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      events2 = args[0];
      data = args.slice(1, args.length);
      context = self;
    } else {
      events2 = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
    }
    data.unshift(context);
    const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
    eventsArray.forEach((event) => {
      if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
        self.eventsAnyListeners.forEach((eventHandler) => {
          eventHandler.apply(context, [event, ...data]);
        });
      }
      if (self.eventsListeners && self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler) => {
          eventHandler.apply(context, data);
        });
      }
    });
    return self;
  }
};
function updateSize() {
  const swiper = this;
  let width;
  let height;
  const el = swiper.el;
  if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) {
    width = swiper.params.width;
  } else {
    width = el.clientWidth;
  }
  if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) {
    height = swiper.params.height;
  } else {
    height = el.clientHeight;
  }
  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
    return;
  }
  width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
  height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
  if (Number.isNaN(width)) width = 0;
  if (Number.isNaN(height)) height = 0;
  Object.assign(swiper, {
    width,
    height,
    size: swiper.isHorizontal() ? width : height
  });
}
function updateSlides() {
  const swiper = this;
  function getDirectionPropertyValue(node, label) {
    return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
  }
  const params = swiper.params;
  const {
    wrapperEl,
    slidesEl,
    size: swiperSize,
    rtlTranslate: rtl,
    wrongRTL
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
  const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
  let snapGrid = [];
  const slidesGrid = [];
  const slidesSizesGrid = [];
  let offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === "function") {
    offsetBefore = params.slidesOffsetBefore.call(swiper);
  }
  let offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === "function") {
    offsetAfter = params.slidesOffsetAfter.call(swiper);
  }
  const previousSnapGridLength = swiper.snapGrid.length;
  const previousSlidesGridLength = swiper.slidesGrid.length;
  let spaceBetween = params.spaceBetween;
  let slidePosition = -offsetBefore;
  let prevSlideSize = 0;
  let index = 0;
  if (typeof swiperSize === "undefined") {
    return;
  }
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  swiper.virtualSize = -spaceBetween;
  slides.forEach((slideEl) => {
    if (rtl) {
      slideEl.style.marginLeft = "";
    } else {
      slideEl.style.marginRight = "";
    }
    slideEl.style.marginBottom = "";
    slideEl.style.marginTop = "";
  });
  if (params.centeredSlides && params.cssMode) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
  }
  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
  if (gridEnabled) {
    swiper.grid.initSlides(slides);
  } else if (swiper.grid) {
    swiper.grid.unsetSlides();
  }
  let slideSize;
  const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
    return typeof params.breakpoints[key].slidesPerView !== "undefined";
  }).length > 0;
  for (let i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    let slide2;
    if (slides[i]) slide2 = slides[i];
    if (gridEnabled) {
      swiper.grid.updateSlide(i, slide2, slides);
    }
    if (slides[i] && elementStyle(slide2, "display") === "none") continue;
    if (params.slidesPerView === "auto") {
      if (shouldResetSlideSize) {
        slides[i].style[swiper.getDirectionLabel("width")] = ``;
      }
      const slideStyles = getComputedStyle(slide2);
      const currentTransform = slide2.style.transform;
      const currentWebKitTransform = slide2.style.webkitTransform;
      if (currentTransform) {
        slide2.style.transform = "none";
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = "none";
      }
      if (params.roundLengths) {
        slideSize = swiper.isHorizontal() ? elementOuterSize(slide2, "width") : elementOuterSize(slide2, "height");
      } else {
        const width = getDirectionPropertyValue(slideStyles, "width");
        const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
        const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
        const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
        const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
        const boxSizing = slideStyles.getPropertyValue("box-sizing");
        if (boxSizing && boxSizing === "border-box") {
          slideSize = width + marginLeft + marginRight;
        } else {
          const {
            clientWidth,
            offsetWidth
          } = slide2;
          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
        }
      }
      if (currentTransform) {
        slide2.style.transform = currentTransform;
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = currentWebKitTransform;
      }
      if (params.roundLengths) slideSize = Math.floor(slideSize);
    } else {
      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
      if (params.roundLengths) slideSize = Math.floor(slideSize);
      if (slides[i]) {
        slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
      }
    }
    if (slides[i]) {
      slides[i].swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);
    if (params.centeredSlides) {
      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
    } else {
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }
    swiper.virtualSize += slideSize + spaceBetween;
    prevSlideSize = slideSize;
    index += 1;
  }
  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
  if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
    wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (params.setWrapperSize) {
    wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (gridEnabled) {
    swiper.grid.updateWrapperSize(slideSize, snapGrid);
  }
  if (!params.centeredSlides) {
    const newSlidesGrid = [];
    for (let i = 0; i < snapGrid.length; i += 1) {
      let slidesGridItem = snapGrid[i];
      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
      if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
        newSlidesGrid.push(slidesGridItem);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      snapGrid.push(swiper.virtualSize - swiperSize);
    }
  }
  if (isVirtual && params.loop) {
    const size = slidesSizesGrid[0] + spaceBetween;
    if (params.slidesPerGroup > 1) {
      const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
      const groupSize = size * params.slidesPerGroup;
      for (let i = 0; i < groups; i += 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
      }
    }
    for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
      if (params.slidesPerGroup === 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
      }
      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
      swiper.virtualSize += size;
    }
  }
  if (snapGrid.length === 0) snapGrid = [0];
  if (spaceBetween !== 0) {
    const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
    slides.filter((_, slideIndex) => {
      if (!params.cssMode || params.loop) return true;
      if (slideIndex === slides.length - 1) {
        return false;
      }
      return true;
    }).forEach((slideEl) => {
      slideEl.style[key] = `${spaceBetween}px`;
    });
  }
  if (params.centeredSlides && params.centeredSlidesBounds) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
    snapGrid = snapGrid.map((snap) => {
      if (snap <= 0) return -offsetBefore;
      if (snap > maxSnap) return maxSnap + offsetAfter;
      return snap;
    });
  }
  if (params.centerInsufficientSlides) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
    if (allSlidesSize + offsetSize < swiperSize) {
      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
      snapGrid.forEach((snap, snapIndex) => {
        snapGrid[snapIndex] = snap - allSlidesOffset;
      });
      slidesGrid.forEach((snap, snapIndex) => {
        slidesGrid[snapIndex] = snap + allSlidesOffset;
      });
    }
  }
  Object.assign(swiper, {
    slides,
    snapGrid,
    slidesGrid,
    slidesSizesGrid
  });
  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
    const addToSnapGrid = -swiper.snapGrid[0];
    const addToSlidesGrid = -swiper.slidesGrid[0];
    swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
    swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
  }
  if (slidesLength !== previousSlidesLength) {
    swiper.emit("slidesLengthChange");
  }
  if (snapGrid.length !== previousSnapGridLength) {
    if (swiper.params.watchOverflow) swiper.checkOverflow();
    swiper.emit("snapGridLengthChange");
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper.emit("slidesGridLengthChange");
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  swiper.emit("slidesUpdated");
  if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
    const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
    if (slidesLength <= params.maxBackfaceHiddenSlides) {
      if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
    } else if (hasClassBackfaceClassAdded) {
      swiper.el.classList.remove(backFaceHiddenClass);
    }
  }
}
function updateAutoHeight(speed) {
  const swiper = this;
  const activeSlides = [];
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  let newHeight = 0;
  let i;
  if (typeof speed === "number") {
    swiper.setTransition(speed);
  } else if (speed === true) {
    swiper.setTransition(swiper.params.speed);
  }
  const getSlideByIndex = (index) => {
    if (isVirtual) {
      return swiper.slides[swiper.getSlideIndexByData(index)];
    }
    return swiper.slides[index];
  };
  if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) {
    if (swiper.params.centeredSlides) {
      (swiper.visibleSlides || []).forEach((slide2) => {
        activeSlides.push(slide2);
      });
    } else {
      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
        const index = swiper.activeIndex + i;
        if (index > swiper.slides.length && !isVirtual) break;
        activeSlides.push(getSlideByIndex(index));
      }
    }
  } else {
    activeSlides.push(getSlideByIndex(swiper.activeIndex));
  }
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== "undefined") {
      const height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }
  if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
  const swiper = this;
  const slides = swiper.slides;
  const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
  for (let i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
  }
}
const toggleSlideClasses$1 = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesProgress(translate2) {
  if (translate2 === void 0) {
    translate2 = this && this.translate || 0;
  }
  const swiper = this;
  const params = swiper.params;
  const {
    slides,
    rtlTranslate: rtl,
    snapGrid
  } = swiper;
  if (slides.length === 0) return;
  if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
  let offsetCenter = -translate2;
  if (rtl) offsetCenter = translate2;
  swiper.visibleSlidesIndexes = [];
  swiper.visibleSlides = [];
  let spaceBetween = params.spaceBetween;
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  for (let i = 0; i < slides.length; i += 1) {
    const slide2 = slides[i];
    let slideOffset = slide2.swiperSlideOffset;
    if (params.cssMode && params.centeredSlides) {
      slideOffset -= slides[0].swiperSlideOffset;
    }
    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const slideBefore = -(offsetCenter - slideOffset);
    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
    if (isVisible) {
      swiper.visibleSlides.push(slide2);
      swiper.visibleSlidesIndexes.push(i);
    }
    toggleSlideClasses$1(slide2, isVisible, params.slideVisibleClass);
    toggleSlideClasses$1(slide2, isFullyVisible, params.slideFullyVisibleClass);
    slide2.progress = rtl ? -slideProgress : slideProgress;
    slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
  }
}
function updateProgress(translate2) {
  const swiper = this;
  if (typeof translate2 === "undefined") {
    const multiplier = swiper.rtlTranslate ? -1 : 1;
    translate2 = swiper && swiper.translate && swiper.translate * multiplier || 0;
  }
  const params = swiper.params;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  let {
    progress,
    isBeginning,
    isEnd,
    progressLoop
  } = swiper;
  const wasBeginning = isBeginning;
  const wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate2 - swiper.minTranslate()) / translatesDiff;
    const isBeginningRounded = Math.abs(translate2 - swiper.minTranslate()) < 1;
    const isEndRounded = Math.abs(translate2 - swiper.maxTranslate()) < 1;
    isBeginning = isBeginningRounded || progress <= 0;
    isEnd = isEndRounded || progress >= 1;
    if (isBeginningRounded) progress = 0;
    if (isEndRounded) progress = 1;
  }
  if (params.loop) {
    const firstSlideIndex = swiper.getSlideIndexByData(0);
    const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
    const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
    const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
    const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
    const translateAbs = Math.abs(translate2);
    if (translateAbs >= firstSlideTranslate) {
      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
    } else {
      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
    }
    if (progressLoop > 1) progressLoop -= 1;
  }
  Object.assign(swiper, {
    progress,
    progressLoop,
    isBeginning,
    isEnd
  });
  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate2);
  if (isBeginning && !wasBeginning) {
    swiper.emit("reachBeginning toEdge");
  }
  if (isEnd && !wasEnd) {
    swiper.emit("reachEnd toEdge");
  }
  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
    swiper.emit("fromEdge");
  }
  swiper.emit("progress", progress);
}
const toggleSlideClasses = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesClasses() {
  const swiper = this;
  const {
    slides,
    params,
    slidesEl,
    activeIndex
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const getFilteredSlide = (selector) => {
    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
  };
  let activeSlide;
  let prevSlide;
  let nextSlide;
  if (isVirtual) {
    if (params.loop) {
      let slideIndex = activeIndex - swiper.virtual.slidesBefore;
      if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
      if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
    } else {
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
    }
  } else {
    if (gridEnabled) {
      activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
      nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
      prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
    } else {
      activeSlide = slides[activeIndex];
    }
  }
  if (activeSlide) {
    if (!gridEnabled) {
      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !nextSlide) {
        nextSlide = slides[0];
      }
      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !prevSlide === 0) {
        prevSlide = slides[slides.length - 1];
      }
    }
  }
  slides.forEach((slideEl) => {
    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
  });
  swiper.emitSlidesClasses();
}
const processLazyPreloader = (swiper, imageEl) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
  const slideEl = imageEl.closest(slideSelector());
  if (slideEl) {
    let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
    if (!lazyEl && swiper.isElement) {
      if (slideEl.shadowRoot) {
        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
      } else {
        requestAnimationFrame(() => {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (lazyEl) lazyEl.remove();
          }
        });
      }
    }
    if (lazyEl) lazyEl.remove();
  }
};
const unlazy = (swiper, index) => {
  if (!swiper.slides[index]) return;
  const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
  if (imageEl) imageEl.removeAttribute("loading");
};
const preload = (swiper) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  let amount = swiper.params.lazyPreloadPrevNext;
  const len = swiper.slides.length;
  if (!len || !amount || amount < 0) return;
  amount = Math.min(amount, len);
  const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
  const activeIndex = swiper.activeIndex;
  if (swiper.params.grid && swiper.params.grid.rows > 1) {
    const activeColumn = activeIndex;
    const preloadColumns = [activeColumn - amount];
    preloadColumns.push(...Array.from({
      length: amount
    }).map((_, i) => {
      return activeColumn + slidesPerView + i;
    }));
    swiper.slides.forEach((slideEl, i) => {
      if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
    });
    return;
  }
  const slideIndexLastInView = activeIndex + slidesPerView - 1;
  if (swiper.params.rewind || swiper.params.loop) {
    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
      const realIndex = (i % len + len) % len;
      if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
    }
  } else {
    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
        unlazy(swiper, i);
      }
    }
  }
};
function getActiveIndexByTranslate(swiper) {
  const {
    slidesGrid,
    params
  } = swiper;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  let activeIndex;
  for (let i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== "undefined") {
      if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
        activeIndex = i;
      } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
        activeIndex = i + 1;
      }
    } else if (translate2 >= slidesGrid[i]) {
      activeIndex = i;
    }
  }
  if (params.normalizeSlideIndex) {
    if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
  }
  return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
  const swiper = this;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  const {
    snapGrid,
    params,
    activeIndex: previousIndex,
    realIndex: previousRealIndex,
    snapIndex: previousSnapIndex
  } = swiper;
  let activeIndex = newActiveIndex;
  let snapIndex;
  const getVirtualRealIndex = (aIndex) => {
    let realIndex2 = aIndex - swiper.virtual.slidesBefore;
    if (realIndex2 < 0) {
      realIndex2 = swiper.virtual.slides.length + realIndex2;
    }
    if (realIndex2 >= swiper.virtual.slides.length) {
      realIndex2 -= swiper.virtual.slides.length;
    }
    return realIndex2;
  };
  if (typeof activeIndex === "undefined") {
    activeIndex = getActiveIndexByTranslate(swiper);
  }
  if (snapGrid.indexOf(translate2) >= 0) {
    snapIndex = snapGrid.indexOf(translate2);
  } else {
    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  if (activeIndex === previousIndex && !swiper.params.loop) {
    if (snapIndex !== previousSnapIndex) {
      swiper.snapIndex = snapIndex;
      swiper.emit("snapIndexChange");
    }
    return;
  }
  if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
    swiper.realIndex = getVirtualRealIndex(activeIndex);
    return;
  }
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  let realIndex;
  if (swiper.virtual && params.virtual.enabled && params.loop) {
    realIndex = getVirtualRealIndex(activeIndex);
  } else if (gridEnabled) {
    const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
    if (Number.isNaN(activeSlideIndex)) {
      activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
    }
    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
  } else if (swiper.slides[activeIndex]) {
    const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
    if (slideIndex) {
      realIndex = parseInt(slideIndex, 10);
    } else {
      realIndex = activeIndex;
    }
  } else {
    realIndex = activeIndex;
  }
  Object.assign(swiper, {
    previousSnapIndex,
    snapIndex,
    previousRealIndex,
    realIndex,
    previousIndex,
    activeIndex
  });
  if (swiper.initialized) {
    preload(swiper);
  }
  swiper.emit("activeIndexChange");
  swiper.emit("snapIndexChange");
  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
    if (previousRealIndex !== realIndex) {
      swiper.emit("realIndexChange");
    }
    swiper.emit("slideChange");
  }
}
function updateClickedSlide(el, path) {
  const swiper = this;
  const params = swiper.params;
  let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
  if (!slide2 && swiper.isElement && path && path.length > 1 && path.includes(el)) {
    [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
      if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
        slide2 = pathEl;
      }
    });
  }
  let slideFound = false;
  let slideIndex;
  if (slide2) {
    for (let i = 0; i < swiper.slides.length; i += 1) {
      if (swiper.slides[i] === slide2) {
        slideFound = true;
        slideIndex = i;
        break;
      }
    }
  }
  if (slide2 && slideFound) {
    swiper.clickedSlide = slide2;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      swiper.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
    } else {
      swiper.clickedIndex = slideIndex;
    }
  } else {
    swiper.clickedSlide = void 0;
    swiper.clickedIndex = void 0;
    return;
  }
  if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) {
    swiper.slideToClickedSlide();
  }
}
var update = {
  updateSize,
  updateSlides,
  updateAutoHeight,
  updateSlidesOffset,
  updateSlidesProgress,
  updateProgress,
  updateSlidesClasses,
  updateActiveIndex,
  updateClickedSlide
};
function getSwiperTranslate(axis) {
  if (axis === void 0) {
    axis = this.isHorizontal() ? "x" : "y";
  }
  const swiper = this;
  const {
    params,
    rtlTranslate: rtl,
    translate: translate2,
    wrapperEl
  } = swiper;
  if (params.virtualTranslate) {
    return rtl ? -translate2 : translate2;
  }
  if (params.cssMode) {
    return translate2;
  }
  let currentTranslate = getTranslate(wrapperEl, axis);
  currentTranslate += swiper.cssOverflowAdjustment();
  if (rtl) currentTranslate = -currentTranslate;
  return currentTranslate || 0;
}
function setTranslate(translate2, byController) {
  const swiper = this;
  const {
    rtlTranslate: rtl,
    params,
    wrapperEl,
    progress
  } = swiper;
  let x = 0;
  let y = 0;
  const z = 0;
  if (swiper.isHorizontal()) {
    x = rtl ? -translate2 : translate2;
  } else {
    y = translate2;
  }
  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  swiper.previousTranslate = swiper.translate;
  swiper.translate = swiper.isHorizontal() ? x : y;
  if (params.cssMode) {
    wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y;
  } else if (!params.virtualTranslate) {
    if (swiper.isHorizontal()) {
      x -= swiper.cssOverflowAdjustment();
    } else {
      y -= swiper.cssOverflowAdjustment();
    }
    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate2 - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== progress) {
    swiper.updateProgress(translate2);
  }
  swiper.emit("setTranslate", swiper.translate, byController);
}
function minTranslate() {
  return -this.snapGrid[0];
}
function maxTranslate() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate2, speed, runCallbacks, translateBounds, internal) {
  if (translate2 === void 0) {
    translate2 = 0;
  }
  if (speed === void 0) {
    speed = this.params.speed;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (translateBounds === void 0) {
    translateBounds = true;
  }
  const swiper = this;
  const {
    params,
    wrapperEl
  } = swiper;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  const minTranslate2 = swiper.minTranslate();
  const maxTranslate2 = swiper.maxTranslate();
  let newTranslate;
  if (translateBounds && translate2 > minTranslate2) newTranslate = minTranslate2;
  else if (translateBounds && translate2 < maxTranslate2) newTranslate = maxTranslate2;
  else newTranslate = translate2;
  swiper.updateProgress(newTranslate);
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    if (speed === 0) {
      wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: -newTranslate,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: -newTranslate,
        behavior: "smooth"
      });
    }
    return true;
  }
  if (speed === 0) {
    swiper.setTransition(0);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionEnd");
    }
  } else {
    swiper.setTransition(speed);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionStart");
    }
    if (!swiper.animating) {
      swiper.animating = true;
      if (!swiper.onTranslateToWrapperTransitionEnd) {
        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper || swiper.destroyed) return;
          if (e.target !== this) return;
          swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
          swiper.onTranslateToWrapperTransitionEnd = null;
          delete swiper.onTranslateToWrapperTransitionEnd;
          swiper.animating = false;
          if (runCallbacks) {
            swiper.emit("transitionEnd");
          }
        };
      }
      swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
    }
  }
  return true;
}
var translate = {
  getTranslate: getSwiperTranslate,
  setTranslate,
  minTranslate,
  maxTranslate,
  translateTo
};
function setTransition(duration, byController) {
  const swiper = this;
  if (!swiper.params.cssMode) {
    swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
    swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
  }
  swiper.emit("setTransition", duration, byController);
}
function transitionEmit(_ref) {
  let {
    swiper,
    runCallbacks,
    direction,
    step
  } = _ref;
  const {
    activeIndex,
    previousIndex
  } = swiper;
  let dir = direction;
  if (!dir) {
    if (activeIndex > previousIndex) dir = "next";
    else if (activeIndex < previousIndex) dir = "prev";
    else dir = "reset";
  }
  swiper.emit(`transition${step}`);
  if (runCallbacks && dir === "reset") {
    swiper.emit(`slideResetTransition${step}`);
  } else if (runCallbacks && activeIndex !== previousIndex) {
    swiper.emit(`slideChangeTransition${step}`);
    if (dir === "next") {
      swiper.emit(`slideNextTransition${step}`);
    } else {
      swiper.emit(`slidePrevTransition${step}`);
    }
  }
}
function transitionStart(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  if (params.cssMode) return;
  if (params.autoHeight) {
    swiper.updateAutoHeight();
  }
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "Start"
  });
}
function transitionEnd(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.animating = false;
  if (params.cssMode) return;
  swiper.setTransition(0);
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "End"
  });
}
var transition = {
  setTransition,
  transitionStart,
  transitionEnd
};
function slideTo(index, speed, runCallbacks, internal, initial) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    index = parseInt(index, 10);
  }
  const swiper = this;
  let slideIndex = index;
  if (slideIndex < 0) slideIndex = 0;
  const {
    params,
    snapGrid,
    slidesGrid,
    previousIndex,
    activeIndex,
    rtlTranslate: rtl,
    wrapperEl,
    enabled
  } = swiper;
  if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  const translate2 = -snapGrid[snapIndex];
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      const normalizedTranslate = -Math.floor(translate2 * 100);
      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
          slideIndex = i;
        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
          slideIndex = i + 1;
        }
      } else if (normalizedTranslate >= normalizedGrid) {
        slideIndex = i;
      }
    }
  }
  if (swiper.initialized && slideIndex !== activeIndex) {
    if (!swiper.allowSlideNext && (rtl ? translate2 > swiper.translate && translate2 > swiper.minTranslate() : translate2 < swiper.translate && translate2 < swiper.minTranslate())) {
      return false;
    }
    if (!swiper.allowSlidePrev && translate2 > swiper.translate && translate2 > swiper.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) {
        return false;
      }
    }
  }
  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
    swiper.emit("beforeSlideChangeStart");
  }
  swiper.updateProgress(translate2);
  let direction;
  if (slideIndex > activeIndex) direction = "next";
  else if (slideIndex < activeIndex) direction = "prev";
  else direction = "reset";
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  const isInitialVirtual = isVirtual && initial;
  if (!isInitialVirtual && (rtl && -translate2 === swiper.translate || !rtl && translate2 === swiper.translate)) {
    swiper.updateActiveIndex(slideIndex);
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== "slide") {
      swiper.setTranslate(translate2);
    }
    if (direction !== "reset") {
      swiper.transitionStart(runCallbacks, direction);
      swiper.transitionEnd(runCallbacks, direction);
    }
    return false;
  }
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    const t = rtl ? translate2 : -translate2;
    if (speed === 0) {
      if (isVirtual) {
        swiper.wrapperEl.style.scrollSnapType = "none";
        swiper._immediateVirtual = true;
      }
      if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
        swiper._cssModeVirtualInitialSet = true;
        requestAnimationFrame(() => {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        });
      } else {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
      }
      if (isVirtual) {
        requestAnimationFrame(() => {
          swiper.wrapperEl.style.scrollSnapType = "";
          swiper._immediateVirtual = false;
        });
      }
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: t,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: t,
        behavior: "smooth"
      });
    }
    return true;
  }
  const browser2 = getBrowser();
  const isSafari = browser2.isSafari;
  if (isVirtual && !initial && isSafari && swiper.isElement) {
    swiper.virtual.update(false, false, slideIndex);
  }
  swiper.setTransition(speed);
  swiper.setTranslate(translate2);
  swiper.updateActiveIndex(slideIndex);
  swiper.updateSlidesClasses();
  swiper.emit("beforeTransitionStart", speed, internal);
  swiper.transitionStart(runCallbacks, direction);
  if (speed === 0) {
    swiper.transitionEnd(runCallbacks, direction);
  } else if (!swiper.animating) {
    swiper.animating = true;
    if (!swiper.onSlideToWrapperTransitionEnd) {
      swiper.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
        if (!swiper || swiper.destroyed) return;
        if (e.target !== this) return;
        swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        swiper.onSlideToWrapperTransitionEnd = null;
        delete swiper.onSlideToWrapperTransitionEnd;
        swiper.transitionEnd(runCallbacks, direction);
      };
    }
    swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
  }
  return true;
}
function slideToLoop(index, speed, runCallbacks, internal) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  let newIndex = index;
  if (swiper.params.loop) {
    if (swiper.virtual && swiper.params.virtual.enabled) {
      newIndex = newIndex + swiper.virtual.slidesBefore;
    } else {
      let targetSlideIndex;
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        targetSlideIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        targetSlideIndex = swiper.getSlideIndexByData(newIndex);
      }
      const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
      const {
        centeredSlides
      } = swiper.params;
      let slidesPerView = swiper.params.slidesPerView;
      if (slidesPerView === "auto") {
        slidesPerView = swiper.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
        if (centeredSlides && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      let needLoopFix = cols - targetSlideIndex < slidesPerView;
      if (centeredSlides) {
        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
      }
      if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) {
        needLoopFix = false;
      }
      if (needLoopFix) {
        const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
        swiper.loopFix({
          direction,
          slideTo: true,
          activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
          slideRealIndex: direction === "next" ? swiper.realIndex : void 0
        });
      }
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        newIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        newIndex = swiper.getSlideIndexByData(newIndex);
      }
    }
  }
  requestAnimationFrame(() => {
    swiper.slideTo(newIndex, speed, runCallbacks, internal);
  });
  return swiper;
}
function slideNext(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    enabled,
    params,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
  }
  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "next"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper.isEnd) {
    return swiper.slideTo(0, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}
function slidePrev(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params,
    snapGrid,
    slidesGrid,
    rtlTranslate,
    enabled,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "prev"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
  }
  const translate2 = rtlTranslate ? swiper.translate : -swiper.translate;
  function normalize(val) {
    if (val < 0) return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate2);
  const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
  const isFreeMode = params.freeMode && params.freeMode.enabled;
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== "undefined") {
      prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== "undefined") {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper.isBeginning) {
    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}
function slideReset(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}
function slideToClosest(speed, runCallbacks, internal, threshold) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (threshold === void 0) {
    threshold = 0.5;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let index = swiper.activeIndex;
  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  if (translate2 >= swiper.snapGrid[snapIndex]) {
    const currentSnap = swiper.snapGrid[snapIndex];
    const nextSnap = swiper.snapGrid[snapIndex + 1];
    if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
      index += swiper.params.slidesPerGroup;
    }
  } else {
    const prevSnap = swiper.snapGrid[snapIndex - 1];
    const currentSnap = swiper.snapGrid[snapIndex];
    if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
      index -= swiper.params.slidesPerGroup;
    }
  }
  index = Math.max(index, 0);
  index = Math.min(index, swiper.slidesGrid.length - 1);
  return swiper.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
  const swiper = this;
  if (swiper.destroyed) return;
  const {
    params,
    slidesEl
  } = swiper;
  const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
  let slideToIndex = swiper.getSlideIndexWhenGrid(swiper.clickedIndex);
  let realIndex;
  const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
  const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  if (params.loop) {
    if (swiper.animating) return;
    realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
    if (params.centeredSlides) {
      swiper.slideToLoop(realIndex);
    } else if (slideToIndex > (isGrid ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1) : swiper.slides.length - slidesPerView)) {
      swiper.loopFix();
      slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
      nextTick(() => {
        swiper.slideTo(slideToIndex);
      });
    } else {
      swiper.slideTo(slideToIndex);
    }
  } else {
    swiper.slideTo(slideToIndex);
  }
}
var slide = {
  slideTo,
  slideToLoop,
  slideNext,
  slidePrev,
  slideReset,
  slideToClosest,
  slideToClickedSlide
};
function loopCreate(slideRealIndex, initial) {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    slides.forEach((el, index) => {
      el.setAttribute("data-swiper-slide-index", index);
    });
  };
  const clearBlankSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
    slides.forEach((el) => {
      el.remove();
    });
    if (slides.length > 0) {
      swiper.recalcSlides();
      swiper.updateSlides();
    }
  };
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
    clearBlankSlides();
  }
  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
  const addBlankSlides = (amountOfSlides) => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
      swiper.slidesEl.append(slideEl);
    }
  };
  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else {
    initSlides();
  }
  swiper.loopFix({
    slideRealIndex,
    direction: params.centeredSlides ? void 0 : "next",
    initial
  });
}
function loopFix(_temp) {
  let {
    slideRealIndex,
    slideTo: slideTo2 = true,
    direction,
    setTranslate: setTranslate2,
    activeSlideIndex,
    initial,
    byController,
    byMousewheel
  } = _temp === void 0 ? {} : _temp;
  const swiper = this;
  if (!swiper.params.loop) return;
  swiper.emit("beforeLoopFix");
  const {
    slides,
    allowSlidePrev,
    allowSlideNext,
    slidesEl,
    params
  } = swiper;
  const {
    centeredSlides,
    initialSlide
  } = params;
  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  if (swiper.virtual && params.virtual.enabled) {
    if (slideTo2) {
      if (!params.centeredSlides && swiper.snapIndex === 0) {
        swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
      } else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) {
        swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
      } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
        swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
      }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    swiper.emit("loopFix");
    return;
  }
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === "auto") {
    slidesPerView = swiper.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (centeredSlides && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }
  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = centeredSlides ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2)) : slidesPerGroup;
  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper.loopedSlides = loopedSlides;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
  } else if (gridEnabled && params.grid.fill === "row") {
    showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
  }
  const prependSlidesIndexes = [];
  const appendSlidesIndexes = [];
  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
  const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !centeredSlides;
  let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
  if (typeof activeSlideIndex === "undefined") {
    activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
  } else {
    activeIndex = activeSlideIndex;
  }
  const isNext = direction === "next" || !direction;
  const isPrev = direction === "prev" || !direction;
  let slidesPrepended = 0;
  let slidesAppended = 0;
  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
  const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
  if (activeColIndexWithShift < loopedSlides) {
    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        const colIndexToPrepend = cols - index - 1;
        for (let i2 = slides.length - 1; i2 >= 0; i2 -= 1) {
          if (slides[i2].column === colIndexToPrepend) prependSlidesIndexes.push(i2);
        }
      } else {
        prependSlidesIndexes.push(cols - index - 1);
      }
    }
  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
    if (isInitialOverflow) {
      slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
    }
    for (let i = 0; i < slidesAppended; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        slides.forEach((slide2, slideIndex) => {
          if (slide2.column === index) appendSlidesIndexes.push(slideIndex);
        });
      } else {
        appendSlidesIndexes.push(index);
      }
    }
  }
  swiper.__preventObserver__ = true;
  requestAnimationFrame(() => {
    swiper.__preventObserver__ = false;
  });
  if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    if (appendSlidesIndexes.includes(activeSlideIndex)) {
      appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
    if (prependSlidesIndexes.includes(activeSlideIndex)) {
      prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
  }
  if (isPrev) {
    prependSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.prepend(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  if (isNext) {
    appendSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.append(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  swiper.recalcSlides();
  if (params.slidesPerView === "auto") {
    swiper.updateSlides();
  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
    swiper.slides.forEach((slide2, slideIndex) => {
      swiper.grid.updateSlide(slideIndex, slide2, swiper.slides);
    });
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  if (slideTo2) {
    if (prependSlidesIndexes.length > 0 && isPrev) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        if (setTranslate2) {
          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
          swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
          swiper.touchEventsData.currentTranslate = swiper.translate;
        }
      }
    } else if (appendSlidesIndexes.length > 0 && isNext) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
        swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
      }
    }
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.controller && swiper.controller.control && !byController) {
    const loopParams = {
      slideRealIndex,
      direction,
      setTranslate: setTranslate2,
      activeSlideIndex,
      byController: true
    };
    if (Array.isArray(swiper.controller.control)) {
      swiper.controller.control.forEach((c) => {
        if (!c.destroyed && c.params.loop) c.loopFix({
          ...loopParams,
          slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
        });
      });
    } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
      swiper.controller.control.loopFix({
        ...loopParams,
        slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo2 : false
      });
    }
  }
  swiper.emit("loopFix");
}
function loopDestroy() {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
  swiper.recalcSlides();
  const newSlidesOrder = [];
  swiper.slides.forEach((slideEl) => {
    const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper.slides.forEach((slideEl) => {
    slideEl.removeAttribute("data-swiper-slide-index");
  });
  newSlidesOrder.forEach((slideEl) => {
    slidesEl.append(slideEl);
  });
  swiper.recalcSlides();
  swiper.slideTo(swiper.realIndex, 0);
}
var loop = {
  loopCreate,
  loopFix,
  loopDestroy
};
function setGrabCursor(moving) {
  const swiper = this;
  if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
  const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  el.style.cursor = "move";
  el.style.cursor = moving ? "grabbing" : "grab";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
function unsetGrabCursor() {
  const swiper = this;
  if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
    return;
  }
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
var grabCursor = {
  setGrabCursor,
  unsetGrabCursor
};
function closestElement(selector, base) {
  if (base === void 0) {
    base = this;
  }
  function __closestFrom(el) {
    if (!el || el === getDocument() || el === getWindow()) return null;
    if (el.assignedSlot) el = el.assignedSlot;
    const found = el.closest(selector);
    if (!found && !el.getRootNode) {
      return null;
    }
    return found || __closestFrom(el.getRootNode().host);
  }
  return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
  const window2 = getWindow();
  const {
    params
  } = swiper;
  const edgeSwipeDetection = params.edgeSwipeDetection;
  const edgeSwipeThreshold = params.edgeSwipeThreshold;
  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window2.innerWidth - edgeSwipeThreshold)) {
    if (edgeSwipeDetection === "prevent") {
      event.preventDefault();
      return true;
    }
    return false;
  }
  return true;
}
function onTouchStart(event) {
  const swiper = this;
  const document2 = getDocument();
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  const data = swiper.touchEventsData;
  if (e.type === "pointerdown") {
    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
      return;
    }
    data.pointerId = e.pointerId;
  } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
    data.touchId = e.targetTouches[0].identifier;
  }
  if (e.type === "touchstart") {
    preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
    return;
  }
  const {
    params,
    touches,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return;
  }
  if (!swiper.animating && params.cssMode && params.loop) {
    swiper.loopFix();
  }
  let targetEl = e.target;
  if (params.touchEventsTarget === "wrapper") {
    if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
  }
  if ("which" in e && e.which === 3) return;
  if ("button" in e && e.button > 0) return;
  if (data.isTouched && data.isMoved) return;
  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
  const eventPath = e.composedPath ? e.composedPath() : e.path;
  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
    targetEl = eventPath[0];
  }
  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
  const isTargetShadow = !!(e.target && e.target.shadowRoot);
  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
    swiper.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!targetEl.closest(params.swipeHandler)) return;
  }
  touches.currentX = e.pageX;
  touches.currentY = e.pageY;
  const startX = touches.currentX;
  const startY = touches.currentY;
  if (!preventEdgeSwipe(swiper, e, startX)) {
    return;
  }
  Object.assign(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: void 0,
    startMoving: void 0
  });
  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = now();
  swiper.allowClick = true;
  swiper.updateSize();
  swiper.swipeDirection = void 0;
  if (params.threshold > 0) data.allowThresholdMove = false;
  let preventDefault = true;
  if (targetEl.matches(data.focusableElements)) {
    preventDefault = false;
    if (targetEl.nodeName === "SELECT") {
      data.isTouched = false;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== targetEl && (e.pointerType === "mouse" || e.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) {
    document2.activeElement.blur();
  }
  const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
    e.preventDefault();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
    swiper.freeMode.onTouchStart();
  }
  swiper.emit("touchStart", e);
}
function onTouchMove(event) {
  const document2 = getDocument();
  const swiper = this;
  const data = swiper.touchEventsData;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && event.pointerType === "mouse") return;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  if (e.type === "pointermove") {
    if (data.touchId !== null) return;
    const id = e.pointerId;
    if (id !== data.pointerId) return;
  }
  let targetTouch;
  if (e.type === "touchmove") {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  } else {
    targetTouch = e;
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      swiper.emit("touchMoveOpposite", e);
    }
    return;
  }
  const pageX = targetTouch.pageX;
  const pageY = targetTouch.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper.allowTouchMove) {
    if (!e.target.matches(data.focusableElements)) {
      swiper.allowClick = false;
    }
    if (data.isTouched) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY
      });
      data.touchStartTime = now();
    }
    return;
  }
  if (params.touchReleaseOnEdges && !params.loop) {
    if (swiper.isVertical()) {
      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) {
      return;
    } else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) {
      return;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== e.target && e.pointerType !== "mouse") {
    document2.activeElement.blur();
  }
  if (document2.activeElement) {
    if (e.target === document2.activeElement && e.target.matches(data.focusableElements)) {
      data.isMoved = true;
      swiper.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper.emit("touchMove", e);
  }
  touches.previousX = touches.currentX;
  touches.previousY = touches.currentY;
  touches.currentX = pageX;
  touches.currentY = pageY;
  const diffX = touches.currentX - touches.startX;
  const diffY = touches.currentY - touches.startY;
  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
  if (typeof data.isScrolling === "undefined") {
    let touchAngle;
    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
      data.isScrolling = false;
    } else {
      if (diffX * diffX + diffY * diffY >= 25) {
        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
      }
    }
  }
  if (data.isScrolling) {
    swiper.emit("touchMoveOpposite", e);
  }
  if (typeof data.startMoving === "undefined") {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper.allowClick = false;
  if (!params.cssMode && e.cancelable) {
    e.preventDefault();
  }
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }
  let diff = swiper.isHorizontal() ? diffX : diffY;
  let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
  if (params.oneWayMovement) {
    diff = Math.abs(diff) * (rtl ? 1 : -1);
    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
  }
  touches.diff = diff;
  diff *= params.touchRatio;
  if (rtl) {
    diff = -diff;
    touchesDiff = -touchesDiff;
  }
  const prevTouchesDirection = swiper.touchesDirection;
  swiper.swipeDirection = diff > 0 ? "prev" : "next";
  swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
  const isLoop = swiper.params.loop && !params.cssMode;
  const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
  if (!data.isMoved) {
    if (isLoop && allowLoopFix) {
      swiper.loopFix({
        direction: swiper.swipeDirection
      });
    }
    data.startTranslate = swiper.getTranslate();
    swiper.setTransition(0);
    if (swiper.animating) {
      const evt = new window.CustomEvent("transitionend", {
        bubbles: true,
        cancelable: true,
        detail: {
          bySwiperTouchMove: true
        }
      });
      swiper.wrapperEl.dispatchEvent(evt);
    }
    data.allowMomentumBounce = false;
    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(true);
    }
    swiper.emit("sliderFirstMove", e);
  }
  (/* @__PURE__ */ new Date()).getTime();
  if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
    Object.assign(touches, {
      startX: pageX,
      startY: pageY,
      currentX: pageX,
      currentY: pageY,
      startTranslate: data.currentTranslate
    });
    data.loopSwapReset = true;
    data.startTranslate = data.currentTranslate;
    return;
  }
  swiper.emit("sliderMove", e);
  data.isMoved = true;
  data.currentTranslate = diff + data.startTranslate;
  let disableParentSwiper = true;
  let resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if (diff > 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
      swiper.loopFix({
        direction: "prev",
        setTranslate: true,
        activeSlideIndex: 0
      });
    }
    if (data.currentTranslate > swiper.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      }
    }
  } else if (diff < 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
      swiper.loopFix({
        direction: "next",
        setTranslate: true,
        activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
      });
    }
    if (data.currentTranslate < swiper.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }
    }
  }
  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }
  if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
    data.currentTranslate = data.startTranslate;
  }
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }
  if (!params.followFinger || params.cssMode) return;
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
    swiper.freeMode.onTouchMove();
  }
  swiper.updateProgress(data.currentTranslate);
  swiper.setTranslate(data.currentTranslate);
}
function onTouchEnd(event) {
  const swiper = this;
  const data = swiper.touchEventsData;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  let targetTouch;
  const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
  if (!isTouchEvent) {
    if (data.touchId !== null) return;
    if (e.pointerId !== data.pointerId) return;
    targetTouch = e;
  } else {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  }
  if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
    const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
    if (!proceed) {
      return;
    }
  }
  data.pointerId = null;
  data.touchId = null;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    slidesGrid,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (data.allowTouchCallbacks) {
    swiper.emit("touchEnd", e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) {
    if (data.isMoved && params.grabCursor) {
      swiper.setGrabCursor(false);
    }
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
    swiper.setGrabCursor(false);
  }
  const touchEndTime = now();
  const timeDiff = touchEndTime - data.touchStartTime;
  if (swiper.allowClick) {
    const pathTree = e.path || e.composedPath && e.composedPath();
    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
    swiper.emit("tap click", e);
    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
      swiper.emit("doubleTap doubleClick", e);
    }
  }
  data.lastClickTime = now();
  nextTick(() => {
    if (!swiper.destroyed) swiper.allowClick = true;
  });
  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;
  data.startMoving = false;
  let currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper.translate : -swiper.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.cssMode) {
    return;
  }
  if (params.freeMode && params.freeMode.enabled) {
    swiper.freeMode.onTouchEnd({
      currentPos
    });
    return;
  }
  const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
  let stopIndex = 0;
  let groupSize = swiper.slidesSizesGrid[0];
  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
    const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (typeof slidesGrid[i + increment2] !== "undefined") {
      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
        stopIndex = i;
        groupSize = slidesGrid[i + increment2] - slidesGrid[i];
      }
    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }
  let rewindFirstIndex = null;
  let rewindLastIndex = null;
  if (params.rewind) {
    if (swiper.isBeginning) {
      rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    } else if (swiper.isEnd) {
      rewindFirstIndex = 0;
    }
  }
  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
  if (timeDiff > params.longSwipesMs) {
    if (!params.longSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === "next") {
      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
      else swiper.slideTo(stopIndex);
    }
    if (swiper.swipeDirection === "prev") {
      if (ratio > 1 - params.longSwipesRatio) {
        swiper.slideTo(stopIndex + increment);
      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
        swiper.slideTo(rewindLastIndex);
      } else {
        swiper.slideTo(stopIndex);
      }
    }
  } else {
    if (!params.shortSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
    if (!isNavButtonTarget) {
      if (swiper.swipeDirection === "next") {
        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
      }
      if (swiper.swipeDirection === "prev") {
        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
      }
    } else if (e.target === swiper.navigation.nextEl) {
      swiper.slideTo(stopIndex + increment);
    } else {
      swiper.slideTo(stopIndex);
    }
  }
}
function onResize() {
  const swiper = this;
  const {
    params,
    el
  } = swiper;
  if (el && el.offsetWidth === 0) return;
  if (params.breakpoints) {
    swiper.setBreakpoint();
  }
  const {
    allowSlideNext,
    allowSlidePrev,
    snapGrid
  } = swiper;
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;
  swiper.updateSize();
  swiper.updateSlides();
  swiper.updateSlidesClasses();
  const isVirtualLoop = isVirtual && params.loop;
  if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
  } else {
    if (swiper.params.loop && !isVirtual) {
      swiper.slideToLoop(swiper.realIndex, 0, false, true);
    } else {
      swiper.slideTo(swiper.activeIndex, 0, false, true);
    }
  }
  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
    clearTimeout(swiper.autoplay.resizeTimeout);
    swiper.autoplay.resizeTimeout = setTimeout(() => {
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.resume();
      }
    }, 500);
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
    swiper.checkOverflow();
  }
}
function onClick(e) {
  const swiper = this;
  if (!swiper.enabled) return;
  if (!swiper.allowClick) {
    if (swiper.params.preventClicks) e.preventDefault();
    if (swiper.params.preventClicksPropagation && swiper.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}
function onScroll() {
  const swiper = this;
  const {
    wrapperEl,
    rtlTranslate,
    enabled
  } = swiper;
  if (!enabled) return;
  swiper.previousTranslate = swiper.translate;
  if (swiper.isHorizontal()) {
    swiper.translate = -wrapperEl.scrollLeft;
  } else {
    swiper.translate = -wrapperEl.scrollTop;
  }
  if (swiper.translate === 0) swiper.translate = 0;
  swiper.updateActiveIndex();
  swiper.updateSlidesClasses();
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== swiper.progress) {
    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
  }
  swiper.emit("setTranslate", swiper.translate, false);
}
function onLoad(e) {
  const swiper = this;
  processLazyPreloader(swiper, e.target);
  if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) {
    return;
  }
  swiper.update();
}
function onDocumentTouchStart() {
  const swiper = this;
  if (swiper.documentTouchHandlerProceeded) return;
  swiper.documentTouchHandlerProceeded = true;
  if (swiper.params.touchReleaseOnEdges) {
    swiper.el.style.touchAction = "auto";
  }
}
const events = (swiper, method) => {
  const document2 = getDocument();
  const {
    params,
    el,
    wrapperEl,
    device
  } = swiper;
  const capture = !!params.nested;
  const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
  const swiperMethod = method;
  if (!el || typeof el === "string") return;
  document2[domMethod]("touchstart", swiper.onDocumentTouchStart, {
    passive: false,
    capture
  });
  el[domMethod]("touchstart", swiper.onTouchStart, {
    passive: false
  });
  el[domMethod]("pointerdown", swiper.onTouchStart, {
    passive: false
  });
  document2[domMethod]("touchmove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("pointermove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("touchend", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerup", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointercancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("touchcancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerout", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerleave", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("contextmenu", swiper.onTouchEnd, {
    passive: true
  });
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]("click", swiper.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]("scroll", swiper.onScroll);
  }
  if (params.updateOnWindowResize) {
    swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
  } else {
    swiper[swiperMethod]("observerUpdate", onResize, true);
  }
  el[domMethod]("load", swiper.onLoad, {
    capture: true
  });
};
function attachEvents() {
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.onTouchStart = onTouchStart.bind(swiper);
  swiper.onTouchMove = onTouchMove.bind(swiper);
  swiper.onTouchEnd = onTouchEnd.bind(swiper);
  swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
  if (params.cssMode) {
    swiper.onScroll = onScroll.bind(swiper);
  }
  swiper.onClick = onClick.bind(swiper);
  swiper.onLoad = onLoad.bind(swiper);
  events(swiper, "on");
}
function detachEvents() {
  const swiper = this;
  events(swiper, "off");
}
var events$1 = {
  attachEvents,
  detachEvents
};
const isGridEnabled = (swiper, params) => {
  return swiper.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
  const swiper = this;
  const {
    realIndex,
    initialized,
    params,
    el
  } = swiper;
  const breakpoints2 = params.breakpoints;
  if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0) return;
  const document2 = getDocument();
  const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
  const breakpointContainer = ["window", "container"].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document2.querySelector(params.breakpointsBase);
  const breakpoint = swiper.getBreakpoint(breakpoints2, breakpointsBase, breakpointContainer);
  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
  const breakpointOnlyParams = breakpoint in breakpoints2 ? breakpoints2[breakpoint] : void 0;
  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
  const wasMultiRow = isGridEnabled(swiper, params);
  const isMultiRow = isGridEnabled(swiper, breakpointParams);
  const wasGrabCursor = swiper.params.grabCursor;
  const isGrabCursor = breakpointParams.grabCursor;
  const wasEnabled = params.enabled;
  if (wasMultiRow && !isMultiRow) {
    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
    swiper.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    el.classList.add(`${params.containerModifierClass}grid`);
    if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
      el.classList.add(`${params.containerModifierClass}grid-column`);
    }
    swiper.emitContainerClasses();
  }
  if (wasGrabCursor && !isGrabCursor) {
    swiper.unsetGrabCursor();
  } else if (!wasGrabCursor && isGrabCursor) {
    swiper.setGrabCursor();
  }
  ["navigation", "pagination", "scrollbar"].forEach((prop) => {
    if (typeof breakpointParams[prop] === "undefined") return;
    const wasModuleEnabled = params[prop] && params[prop].enabled;
    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
    if (wasModuleEnabled && !isModuleEnabled) {
      swiper[prop].disable();
    }
    if (!wasModuleEnabled && isModuleEnabled) {
      swiper[prop].enable();
    }
  });
  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
  const wasLoop = params.loop;
  if (directionChanged && initialized) {
    swiper.changeDirection();
  }
  extend(swiper.params, breakpointParams);
  const isEnabled = swiper.params.enabled;
  const hasLoop = swiper.params.loop;
  Object.assign(swiper, {
    allowTouchMove: swiper.params.allowTouchMove,
    allowSlideNext: swiper.params.allowSlideNext,
    allowSlidePrev: swiper.params.allowSlidePrev
  });
  if (wasEnabled && !isEnabled) {
    swiper.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper.enable();
  }
  swiper.currentBreakpoint = breakpoint;
  swiper.emit("_beforeBreakpoint", breakpointParams);
  if (initialized) {
    if (needsReLoop) {
      swiper.loopDestroy();
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (!wasLoop && hasLoop) {
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (wasLoop && !hasLoop) {
      swiper.loopDestroy();
    }
  }
  swiper.emit("breakpoint", breakpointParams);
}
function getBreakpoint(breakpoints2, base, containerEl) {
  if (base === void 0) {
    base = "window";
  }
  if (!breakpoints2 || base === "container" && !containerEl) return void 0;
  let breakpoint = false;
  const window2 = getWindow();
  const currentHeight = base === "window" ? window2.innerHeight : containerEl.clientHeight;
  const points = Object.keys(breakpoints2).map((point) => {
    if (typeof point === "string" && point.indexOf("@") === 0) {
      const minRatio = parseFloat(point.substr(1));
      const value = currentHeight * minRatio;
      return {
        value,
        point
      };
    }
    return {
      value: point,
      point
    };
  });
  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  for (let i = 0; i < points.length; i += 1) {
    const {
      point,
      value
    } = points[i];
    if (base === "window") {
      if (window2.matchMedia(`(min-width: ${value}px)`).matches) {
        breakpoint = point;
      }
    } else if (value <= containerEl.clientWidth) {
      breakpoint = point;
    }
  }
  return breakpoint || "max";
}
var breakpoints = {
  setBreakpoint,
  getBreakpoint
};
function prepareClasses(entries, prefix) {
  const resultClasses = [];
  entries.forEach((item) => {
    if (typeof item === "object") {
      Object.keys(item).forEach((classNames) => {
        if (item[classNames]) {
          resultClasses.push(prefix + classNames);
        }
      });
    } else if (typeof item === "string") {
      resultClasses.push(prefix + item);
    }
  });
  return resultClasses;
}
function addClasses() {
  const swiper = this;
  const {
    classNames,
    params,
    rtl,
    el,
    device
  } = swiper;
  const suffixes = prepareClasses(["initialized", params.direction, {
    "free-mode": swiper.params.freeMode && params.freeMode.enabled
  }, {
    "autoheight": params.autoHeight
  }, {
    "rtl": rtl
  }, {
    "grid": params.grid && params.grid.rows > 1
  }, {
    "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
  }, {
    "android": device.android
  }, {
    "ios": device.ios
  }, {
    "css-mode": params.cssMode
  }, {
    "centered": params.cssMode && params.centeredSlides
  }, {
    "watch-progress": params.watchSlidesProgress
  }], params.containerModifierClass);
  classNames.push(...suffixes);
  el.classList.add(...classNames);
  swiper.emitContainerClasses();
}
function removeClasses() {
  const swiper = this;
  const {
    el,
    classNames
  } = swiper;
  if (!el || typeof el === "string") return;
  el.classList.remove(...classNames);
  swiper.emitContainerClasses();
}
var classes = {
  addClasses,
  removeClasses
};
function checkOverflow() {
  const swiper = this;
  const {
    isLocked: wasLocked,
    params
  } = swiper;
  const {
    slidesOffsetBefore
  } = params;
  if (slidesOffsetBefore) {
    const lastSlideIndex = swiper.slides.length - 1;
    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
    swiper.isLocked = swiper.size > lastSlideRightEdge;
  } else {
    swiper.isLocked = swiper.snapGrid.length === 1;
  }
  if (params.allowSlideNext === true) {
    swiper.allowSlideNext = !swiper.isLocked;
  }
  if (params.allowSlidePrev === true) {
    swiper.allowSlidePrev = !swiper.isLocked;
  }
  if (wasLocked && wasLocked !== swiper.isLocked) {
    swiper.isEnd = false;
  }
  if (wasLocked !== swiper.isLocked) {
    swiper.emit(swiper.isLocked ? "lock" : "unlock");
  }
}
var checkOverflow$1 = {
  checkOverflow
};
var defaults = {
  init: true,
  direction: "horizontal",
  oneWayMovement: false,
  swiperElementNodeName: "SWIPER-CONTAINER",
  touchEventsTarget: "wrapper",
  initialSlide: 0,
  speed: 300,
  cssMode: false,
  updateOnWindowResize: true,
  resizeObserver: true,
  nested: false,
  createElements: false,
  eventsPrefix: "swiper",
  enabled: true,
  focusableElements: "input, select, option, textarea, button, video, label",
  // Overrides
  width: null,
  height: null,
  //
  preventInteractionOnTransition: false,
  // ssr
  userAgent: null,
  url: null,
  // To support iOS's swipe-to-go-back gesture (when being used in-app).
  edgeSwipeDetection: false,
  edgeSwipeThreshold: 20,
  // Autoheight
  autoHeight: false,
  // Set wrapper width
  setWrapperSize: false,
  // Virtual Translate
  virtualTranslate: false,
  // Effects
  effect: "slide",
  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
  // Breakpoints
  breakpoints: void 0,
  breakpointsBase: "window",
  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerGroupSkip: 0,
  slidesPerGroupAuto: false,
  centeredSlides: false,
  centeredSlidesBounds: false,
  slidesOffsetBefore: 0,
  // in px
  slidesOffsetAfter: 0,
  // in px
  normalizeSlideIndex: true,
  centerInsufficientSlides: false,
  // Disable swiper and hide navigation when container not overflow
  watchOverflow: true,
  // Round length
  roundLengths: false,
  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchMoveStopPropagation: false,
  touchStartPreventDefault: true,
  touchStartForcePreventDefault: false,
  touchReleaseOnEdges: false,
  // Unique Navigation Elements
  uniqueNavElements: true,
  // Resistance
  resistance: true,
  resistanceRatio: 0.85,
  // Progress
  watchSlidesProgress: false,
  // Cursor
  grabCursor: false,
  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,
  // loop
  loop: false,
  loopAddBlankSlides: true,
  loopAdditionalSlides: 0,
  loopPreventsSliding: true,
  // rewind
  rewind: false,
  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null,
  // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: "swiper-no-swiping",
  noSwipingSelector: null,
  // Passive Listeners
  passiveListeners: true,
  maxBackfaceHiddenSlides: 10,
  // NS
  containerModifierClass: "swiper-",
  // NEW
  slideClass: "swiper-slide",
  slideBlankClass: "swiper-slide-blank",
  slideActiveClass: "swiper-slide-active",
  slideVisibleClass: "swiper-slide-visible",
  slideFullyVisibleClass: "swiper-slide-fully-visible",
  slideNextClass: "swiper-slide-next",
  slidePrevClass: "swiper-slide-prev",
  wrapperClass: "swiper-wrapper",
  lazyPreloaderClass: "swiper-lazy-preloader",
  lazyPreloadPrevNext: 0,
  // Callbacks
  runCallbacksOnInit: true,
  // Internals
  _emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
  return function extendParams(obj) {
    if (obj === void 0) {
      obj = {};
    }
    const moduleParamName = Object.keys(obj)[0];
    const moduleParams = obj[moduleParamName];
    if (typeof moduleParams !== "object" || moduleParams === null) {
      extend(allModulesParams, obj);
      return;
    }
    if (params[moduleParamName] === true) {
      params[moduleParamName] = {
        enabled: true
      };
    }
    if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
      params[moduleParamName].auto = true;
    }
    if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
      params[moduleParamName].auto = true;
    }
    if (!(moduleParamName in params && "enabled" in moduleParams)) {
      extend(allModulesParams, obj);
      return;
    }
    if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
      params[moduleParamName].enabled = true;
    }
    if (!params[moduleParamName]) params[moduleParamName] = {
      enabled: false
    };
    extend(allModulesParams, obj);
  };
}
const prototypes = {
  eventsEmitter,
  update,
  translate,
  transition,
  slide,
  loop,
  grabCursor,
  events: events$1,
  breakpoints,
  checkOverflow: checkOverflow$1,
  classes
};
const extendedDefaults = {};
class Swiper {
  constructor() {
    let el;
    let params;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
      params = args[0];
    } else {
      [el, params] = args;
    }
    if (!params) params = {};
    params = extend({}, params);
    if (el && !params.el) params.el = el;
    const document2 = getDocument();
    if (params.el && typeof params.el === "string" && document2.querySelectorAll(params.el).length > 1) {
      const swipers = [];
      document2.querySelectorAll(params.el).forEach((containerEl) => {
        const newParams = extend({}, params, {
          el: containerEl
        });
        swipers.push(new Swiper(newParams));
      });
      return swipers;
    }
    const swiper = this;
    swiper.__swiper__ = true;
    swiper.support = getSupport();
    swiper.device = getDevice({
      userAgent: params.userAgent
    });
    swiper.browser = getBrowser();
    swiper.eventsListeners = {};
    swiper.eventsAnyListeners = [];
    swiper.modules = [...swiper.__modules__];
    if (params.modules && Array.isArray(params.modules)) {
      swiper.modules.push(...params.modules);
    }
    const allModulesParams = {};
    swiper.modules.forEach((mod) => {
      mod({
        params,
        swiper,
        extendParams: moduleExtendParams(params, allModulesParams),
        on: swiper.on.bind(swiper),
        once: swiper.once.bind(swiper),
        off: swiper.off.bind(swiper),
        emit: swiper.emit.bind(swiper)
      });
    });
    const swiperParams = extend({}, defaults, allModulesParams);
    swiper.params = extend({}, swiperParams, extendedDefaults, params);
    swiper.originalParams = extend({}, swiper.params);
    swiper.passedParams = extend({}, params);
    if (swiper.params && swiper.params.on) {
      Object.keys(swiper.params.on).forEach((eventName) => {
        swiper.on(eventName, swiper.params.on[eventName]);
      });
    }
    if (swiper.params && swiper.params.onAny) {
      swiper.onAny(swiper.params.onAny);
    }
    Object.assign(swiper, {
      enabled: swiper.params.enabled,
      el,
      // Classes
      classNames: [],
      // Slides
      slides: [],
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],
      // isDirection
      isHorizontal() {
        return swiper.params.direction === "horizontal";
      },
      isVertical() {
        return swiper.params.direction === "vertical";
      },
      // Indexes
      activeIndex: 0,
      realIndex: 0,
      //
      isBeginning: true,
      isEnd: false,
      // Props
      translate: 0,
      previousTranslate: 0,
      progress: 0,
      velocity: 0,
      animating: false,
      cssOverflowAdjustment() {
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
      },
      // Locks
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,
      // Touch Events
      touchEventsData: {
        isTouched: void 0,
        isMoved: void 0,
        allowTouchCallbacks: void 0,
        touchStartTime: void 0,
        isScrolling: void 0,
        currentTranslate: void 0,
        startTranslate: void 0,
        allowThresholdMove: void 0,
        // Form elements to match
        focusableElements: swiper.params.focusableElements,
        // Last click time
        lastClickTime: 0,
        clickTimeout: void 0,
        // Velocities
        velocities: [],
        allowMomentumBounce: void 0,
        startMoving: void 0,
        pointerId: null,
        touchId: null
      },
      // Clicks
      allowClick: true,
      // Touches
      allowTouchMove: swiper.params.allowTouchMove,
      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      },
      // Images
      imagesToLoad: [],
      imagesLoaded: 0
    });
    swiper.emit("_swiper");
    if (swiper.params.init) {
      swiper.init();
    }
    return swiper;
  }
  getDirectionLabel(property) {
    if (this.isHorizontal()) {
      return property;
    }
    return {
      "width": "height",
      "margin-top": "margin-left",
      "margin-bottom ": "margin-right",
      "margin-left": "margin-top",
      "margin-right": "margin-bottom",
      "padding-left": "padding-top",
      "padding-right": "padding-bottom",
      "marginRight": "marginBottom"
    }[property];
  }
  getSlideIndex(slideEl) {
    const {
      slidesEl,
      params
    } = this;
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const firstSlideIndex = elementIndex(slides[0]);
    return elementIndex(slideEl) - firstSlideIndex;
  }
  getSlideIndexByData(index) {
    return this.getSlideIndex(this.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index));
  }
  getSlideIndexWhenGrid(index) {
    if (this.grid && this.params.grid && this.params.grid.rows > 1) {
      if (this.params.grid.fill === "column") {
        index = Math.floor(index / this.params.grid.rows);
      } else if (this.params.grid.fill === "row") {
        index = index % Math.ceil(this.slides.length / this.params.grid.rows);
      }
    }
    return index;
  }
  recalcSlides() {
    const swiper = this;
    const {
      slidesEl,
      params
    } = swiper;
    swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
  }
  enable() {
    const swiper = this;
    if (swiper.enabled) return;
    swiper.enabled = true;
    if (swiper.params.grabCursor) {
      swiper.setGrabCursor();
    }
    swiper.emit("enable");
  }
  disable() {
    const swiper = this;
    if (!swiper.enabled) return;
    swiper.enabled = false;
    if (swiper.params.grabCursor) {
      swiper.unsetGrabCursor();
    }
    swiper.emit("disable");
  }
  setProgress(progress, speed) {
    const swiper = this;
    progress = Math.min(Math.max(progress, 0), 1);
    const min = swiper.minTranslate();
    const max = swiper.maxTranslate();
    const current = (max - min) * progress + min;
    swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  emitContainerClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const cls = swiper.el.className.split(" ").filter((className) => {
      return className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
    });
    swiper.emit("_containerClasses", cls.join(" "));
  }
  getSlideClasses(slideEl) {
    const swiper = this;
    if (swiper.destroyed) return "";
    return slideEl.className.split(" ").filter((className) => {
      return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0;
    }).join(" ");
  }
  emitSlidesClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const updates = [];
    swiper.slides.forEach((slideEl) => {
      const classNames = swiper.getSlideClasses(slideEl);
      updates.push({
        slideEl,
        classNames
      });
      swiper.emit("_slideClass", slideEl, classNames);
    });
    swiper.emit("_slideClasses", updates);
  }
  slidesPerViewDynamic(view, exact) {
    if (view === void 0) {
      view = "current";
    }
    if (exact === void 0) {
      exact = false;
    }
    const swiper = this;
    const {
      params,
      slides,
      slidesGrid,
      slidesSizesGrid,
      size: swiperSize,
      activeIndex
    } = swiper;
    let spv = 1;
    if (typeof params.slidesPerView === "number") return params.slidesPerView;
    if (params.centeredSlides) {
      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
      let breakLoop;
      for (let i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += Math.ceil(slides[i].swiperSlideSize);
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
      for (let i = activeIndex - 1; i >= 0; i -= 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
    } else {
      if (view === "current") {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
    }
    return spv;
  }
  update() {
    const swiper = this;
    if (!swiper || swiper.destroyed) return;
    const {
      snapGrid,
      params
    } = swiper;
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }
    [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      }
    });
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateProgress();
    swiper.updateSlidesClasses();
    function setTranslate2() {
      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    let translated;
    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
      setTranslate2();
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
        const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
        translated = swiper.slideTo(slides.length - 1, 0, false, true);
      } else {
        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate2();
      }
    }
    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
      swiper.checkOverflow();
    }
    swiper.emit("update");
  }
  changeDirection(newDirection, needUpdate) {
    if (needUpdate === void 0) {
      needUpdate = true;
    }
    const swiper = this;
    const currentDirection = swiper.params.direction;
    if (!newDirection) {
      newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
    }
    if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
      return swiper;
    }
    swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
    swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
    swiper.emitContainerClasses();
    swiper.params.direction = newDirection;
    swiper.slides.forEach((slideEl) => {
      if (newDirection === "vertical") {
        slideEl.style.width = "";
      } else {
        slideEl.style.height = "";
      }
    });
    swiper.emit("changeDirection");
    if (needUpdate) swiper.update();
    return swiper;
  }
  changeLanguageDirection(direction) {
    const swiper = this;
    if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
    swiper.rtl = direction === "rtl";
    swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
    if (swiper.rtl) {
      swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "rtl";
    } else {
      swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "ltr";
    }
    swiper.update();
  }
  mount(element) {
    const swiper = this;
    if (swiper.mounted) return true;
    let el = element || swiper.params.el;
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) {
      return false;
    }
    el.swiper = swiper;
    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
      swiper.isElement = true;
    }
    const getWrapperSelector = () => {
      return `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
    };
    const getWrapper = () => {
      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
        const res = el.shadowRoot.querySelector(getWrapperSelector());
        return res;
      }
      return elementChildren(el, getWrapperSelector())[0];
    };
    let wrapperEl = getWrapper();
    if (!wrapperEl && swiper.params.createElements) {
      wrapperEl = createElement("div", swiper.params.wrapperClass);
      el.append(wrapperEl);
      elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
        wrapperEl.append(slideEl);
      });
    }
    Object.assign(swiper, {
      el,
      wrapperEl,
      slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
      hostEl: swiper.isElement ? el.parentNode.host : el,
      mounted: true,
      // RTL
      rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
      rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
      wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
    });
    return true;
  }
  init(el) {
    const swiper = this;
    if (swiper.initialized) return swiper;
    const mounted = swiper.mount(el);
    if (mounted === false) return swiper;
    swiper.emit("beforeInit");
    if (swiper.params.breakpoints) {
      swiper.setBreakpoint();
    }
    swiper.addClasses();
    swiper.updateSize();
    swiper.updateSlides();
    if (swiper.params.watchOverflow) {
      swiper.checkOverflow();
    }
    if (swiper.params.grabCursor && swiper.enabled) {
      swiper.setGrabCursor();
    }
    if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
      swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
    } else {
      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
    }
    if (swiper.params.loop) {
      swiper.loopCreate(void 0, true);
    }
    swiper.attachEvents();
    const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
    if (swiper.isElement) {
      lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
    }
    lazyElements.forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      } else {
        imageEl.addEventListener("load", (e) => {
          processLazyPreloader(swiper, e.target);
        });
      }
    });
    preload(swiper);
    swiper.initialized = true;
    preload(swiper);
    swiper.emit("init");
    swiper.emit("afterInit");
    return swiper;
  }
  destroy(deleteInstance, cleanStyles) {
    if (deleteInstance === void 0) {
      deleteInstance = true;
    }
    if (cleanStyles === void 0) {
      cleanStyles = true;
    }
    const swiper = this;
    const {
      params,
      el,
      wrapperEl,
      slides
    } = swiper;
    if (typeof swiper.params === "undefined" || swiper.destroyed) {
      return null;
    }
    swiper.emit("beforeDestroy");
    swiper.initialized = false;
    swiper.detachEvents();
    if (params.loop) {
      swiper.loopDestroy();
    }
    if (cleanStyles) {
      swiper.removeClasses();
      if (el && typeof el !== "string") {
        el.removeAttribute("style");
      }
      if (wrapperEl) {
        wrapperEl.removeAttribute("style");
      }
      if (slides && slides.length) {
        slides.forEach((slideEl) => {
          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
          slideEl.removeAttribute("style");
          slideEl.removeAttribute("data-swiper-slide-index");
        });
      }
    }
    swiper.emit("destroy");
    Object.keys(swiper.eventsListeners).forEach((eventName) => {
      swiper.off(eventName);
    });
    if (deleteInstance !== false) {
      if (swiper.el && typeof swiper.el !== "string") {
        swiper.el.swiper = null;
      }
      deleteProps(swiper);
    }
    swiper.destroyed = true;
    return null;
  }
  static extendDefaults(newDefaults) {
    extend(extendedDefaults, newDefaults);
  }
  static get extendedDefaults() {
    return extendedDefaults;
  }
  static get defaults() {
    return defaults;
  }
  static installModule(mod) {
    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
    const modules = Swiper.prototype.__modules__;
    if (typeof mod === "function" && modules.indexOf(mod) < 0) {
      modules.push(mod);
    }
  }
  static use(module) {
    if (Array.isArray(module)) {
      module.forEach((m) => Swiper.installModule(m));
      return Swiper;
    }
    Swiper.installModule(module);
    return Swiper;
  }
}
Object.keys(prototypes).forEach((prototypeGroup) => {
  Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
  });
});
Swiper.use([Resize, Observer]);
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
function Navigation(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  extendParams({
    navigation: {
      nextEl: null,
      prevEl: null,
      hideOnClick: false,
      disabledClass: "swiper-button-disabled",
      hiddenClass: "swiper-button-hidden",
      lockClass: "swiper-button-lock",
      navigationDisabledClass: "swiper-navigation-disabled"
    }
  });
  swiper.navigation = {
    nextEl: null,
    prevEl: null
  };
  function getEl(el) {
    let res;
    if (el && typeof el === "string" && swiper.isElement) {
      res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
      if (res) return res;
    }
    if (el) {
      if (typeof el === "string") res = [...document.querySelectorAll(el)];
      if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
        res = swiper.el.querySelector(el);
      } else if (res && res.length === 1) {
        res = res[0];
      }
    }
    if (el && !res) return el;
    return res;
  }
  function toggleEl(el, disabled) {
    const params = swiper.params.navigation;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (subEl) {
        subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
        if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
        if (swiper.params.watchOverflow && swiper.enabled) {
          subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
        }
      }
    });
  }
  function update2() {
    const {
      nextEl,
      prevEl
    } = swiper.navigation;
    if (swiper.params.loop) {
      toggleEl(prevEl, false);
      toggleEl(nextEl, false);
      return;
    }
    toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
    toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
  }
  function onPrevClick(e) {
    e.preventDefault();
    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slidePrev();
    emit("navigationPrev");
  }
  function onNextClick(e) {
    e.preventDefault();
    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slideNext();
    emit("navigationNext");
  }
  function init() {
    const params = swiper.params.navigation;
    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
      nextEl: "swiper-button-next",
      prevEl: "swiper-button-prev"
    });
    if (!(params.nextEl || params.prevEl)) return;
    let nextEl = getEl(params.nextEl);
    let prevEl = getEl(params.prevEl);
    Object.assign(swiper.navigation, {
      nextEl,
      prevEl
    });
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const initButton = (el, dir) => {
      if (el) {
        el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      }
      if (!swiper.enabled && el) {
        el.classList.add(...params.lockClass.split(" "));
      }
    };
    nextEl.forEach((el) => initButton(el, "next"));
    prevEl.forEach((el) => initButton(el, "prev"));
  }
  function destroy() {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const destroyButton = (el, dir) => {
      el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
    };
    nextEl.forEach((el) => destroyButton(el, "next"));
    prevEl.forEach((el) => destroyButton(el, "prev"));
  }
  on("init", () => {
    if (swiper.params.navigation.enabled === false) {
      disable();
    } else {
      init();
      update2();
    }
  });
  on("toEdge fromEdge lock unlock", () => {
    update2();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    if (swiper.enabled) {
      update2();
      return;
    }
    [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper.params.navigation.lockClass));
  });
  on("click", (_s, e) => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const targetEl = e.target;
    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
    if (swiper.isElement && !targetIsButton) {
      const path = e.path || e.composedPath && e.composedPath();
      if (path) {
        targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
      }
    }
    if (swiper.params.navigation.hideOnClick && !targetIsButton) {
      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
      let isHidden;
      if (nextEl.length) {
        isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      } else if (prevEl.length) {
        isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      }
      if (isHidden === true) {
        emit("navigationShow");
      } else {
        emit("navigationHide");
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper.params.navigation.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
    init();
    update2();
  };
  const disable = () => {
    swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
    destroy();
  };
  Object.assign(swiper.navigation, {
    enable,
    disable,
    update: update2,
    init,
    destroy
  });
}
function Autoplay(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit,
    params
  } = _ref;
  swiper.autoplay = {
    running: false,
    paused: false,
    timeLeft: 0
  };
  extendParams({
    autoplay: {
      enabled: false,
      delay: 3e3,
      waitForTransition: true,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      reverseDirection: false,
      pauseOnMouseEnter: false
    }
  });
  let timeout;
  let raf;
  let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayTimeLeft;
  let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
  let wasPaused;
  let isTouched;
  let pausedByTouch;
  let touchStartTimeout;
  let slideChanged;
  let pausedByInteraction;
  let pausedByPointerEnter;
  function onTransitionEnd(e) {
    if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
    if (e.target !== swiper.wrapperEl) return;
    swiper.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
    if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) {
      return;
    }
    resume();
  }
  const calcTimeLeft = () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.autoplay.paused) {
      wasPaused = true;
    } else if (wasPaused) {
      autoplayDelayCurrent = autoplayTimeLeft;
      wasPaused = false;
    }
    const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
    swiper.autoplay.timeLeft = timeLeft;
    emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
    raf = requestAnimationFrame(() => {
      calcTimeLeft();
    });
  };
  const getSlideDelay = () => {
    let activeSlideEl;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains("swiper-slide-active"));
    } else {
      activeSlideEl = swiper.slides[swiper.activeIndex];
    }
    if (!activeSlideEl) return void 0;
    const currentSlideDelay = parseInt(activeSlideEl.getAttribute("data-swiper-autoplay"), 10);
    return currentSlideDelay;
  };
  const run = (delayForce) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    cancelAnimationFrame(raf);
    calcTimeLeft();
    let delay = typeof delayForce === "undefined" ? swiper.params.autoplay.delay : delayForce;
    autoplayDelayTotal = swiper.params.autoplay.delay;
    autoplayDelayCurrent = swiper.params.autoplay.delay;
    const currentSlideDelay = getSlideDelay();
    if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0 && typeof delayForce === "undefined") {
      delay = currentSlideDelay;
      autoplayDelayTotal = currentSlideDelay;
      autoplayDelayCurrent = currentSlideDelay;
    }
    autoplayTimeLeft = delay;
    const speed = swiper.params.speed;
    const proceed = () => {
      if (!swiper || swiper.destroyed) return;
      if (swiper.params.autoplay.reverseDirection) {
        if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
          swiper.slidePrev(speed, true, true);
          emit("autoplay");
        } else if (!swiper.params.autoplay.stopOnLastSlide) {
          swiper.slideTo(swiper.slides.length - 1, speed, true, true);
          emit("autoplay");
        }
      } else {
        if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
          swiper.slideNext(speed, true, true);
          emit("autoplay");
        } else if (!swiper.params.autoplay.stopOnLastSlide) {
          swiper.slideTo(0, speed, true, true);
          emit("autoplay");
        }
      }
      if (swiper.params.cssMode) {
        autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
        requestAnimationFrame(() => {
          run();
        });
      }
    };
    if (delay > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        proceed();
      }, delay);
    } else {
      requestAnimationFrame(() => {
        proceed();
      });
    }
    return delay;
  };
  const start = () => {
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    swiper.autoplay.running = true;
    run();
    emit("autoplayStart");
  };
  const stop = () => {
    swiper.autoplay.running = false;
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    emit("autoplayStop");
  };
  const pause = (internal, reset) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    clearTimeout(timeout);
    if (!internal) {
      pausedByInteraction = true;
    }
    const proceed = () => {
      emit("autoplayPause");
      if (swiper.params.autoplay.waitForTransition) {
        swiper.wrapperEl.addEventListener("transitionend", onTransitionEnd);
      } else {
        resume();
      }
    };
    swiper.autoplay.paused = true;
    if (reset) {
      if (slideChanged) {
        autoplayTimeLeft = swiper.params.autoplay.delay;
      }
      slideChanged = false;
      proceed();
      return;
    }
    const delay = autoplayTimeLeft || swiper.params.autoplay.delay;
    autoplayTimeLeft = delay - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
    if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
    proceed();
  };
  const resume = () => {
    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    if (pausedByInteraction) {
      pausedByInteraction = false;
      run(autoplayTimeLeft);
    } else {
      run();
    }
    swiper.autoplay.paused = false;
    emit("autoplayResume");
  };
  const onVisibilityChange = () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    const document2 = getDocument();
    if (document2.visibilityState === "hidden") {
      pausedByInteraction = true;
      pause(true);
    }
    if (document2.visibilityState === "visible") {
      resume();
    }
  };
  const onPointerEnter = (e) => {
    if (e.pointerType !== "mouse") return;
    pausedByInteraction = true;
    pausedByPointerEnter = true;
    if (swiper.animating || swiper.autoplay.paused) return;
    pause(true);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    pausedByPointerEnter = false;
    if (swiper.autoplay.paused) {
      resume();
    }
  };
  const attachMouseEvents = () => {
    if (swiper.params.autoplay.pauseOnMouseEnter) {
      swiper.el.addEventListener("pointerenter", onPointerEnter);
      swiper.el.addEventListener("pointerleave", onPointerLeave);
    }
  };
  const detachMouseEvents = () => {
    if (swiper.el && typeof swiper.el !== "string") {
      swiper.el.removeEventListener("pointerenter", onPointerEnter);
      swiper.el.removeEventListener("pointerleave", onPointerLeave);
    }
  };
  const attachDocumentEvents = () => {
    const document2 = getDocument();
    document2.addEventListener("visibilitychange", onVisibilityChange);
  };
  const detachDocumentEvents = () => {
    const document2 = getDocument();
    document2.removeEventListener("visibilitychange", onVisibilityChange);
  };
  on("init", () => {
    if (swiper.params.autoplay.enabled) {
      attachMouseEvents();
      attachDocumentEvents();
      start();
    }
  });
  on("destroy", () => {
    detachMouseEvents();
    detachDocumentEvents();
    if (swiper.autoplay.running) {
      stop();
    }
  });
  on("_freeModeStaticRelease", () => {
    if (pausedByTouch || pausedByInteraction) {
      resume();
    }
  });
  on("_freeModeNoMomentumRelease", () => {
    if (!swiper.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("beforeTransitionStart", (_s, speed, internal) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (internal || !swiper.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("sliderFirstMove", () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.params.autoplay.disableOnInteraction) {
      stop();
      return;
    }
    isTouched = true;
    pausedByTouch = false;
    pausedByInteraction = false;
    touchStartTimeout = setTimeout(() => {
      pausedByInteraction = true;
      pausedByTouch = true;
      pause(true);
    }, 200);
  });
  on("touchEnd", () => {
    if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
    clearTimeout(touchStartTimeout);
    clearTimeout(timeout);
    if (swiper.params.autoplay.disableOnInteraction) {
      pausedByTouch = false;
      isTouched = false;
      return;
    }
    if (pausedByTouch && swiper.params.cssMode) resume();
    pausedByTouch = false;
    isTouched = false;
  });
  on("slideChange", () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    slideChanged = true;
  });
  Object.assign(swiper.autoplay, {
    start,
    stop,
    pause,
    resume
  });
}
function effectInit(params) {
  const {
    effect,
    swiper,
    on,
    setTranslate: setTranslate2,
    setTransition: setTransition2,
    overwriteParams,
    perspective,
    recreateShadows,
    getEffectParams
  } = params;
  on("beforeInit", () => {
    if (swiper.params.effect !== effect) return;
    swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
    if (perspective && perspective()) {
      swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
    }
    const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
    Object.assign(swiper.params, overwriteParamsResult);
    Object.assign(swiper.originalParams, overwriteParamsResult);
  });
  on("setTranslate _virtualUpdated", () => {
    if (swiper.params.effect !== effect) return;
    setTranslate2();
  });
  on("setTransition", (_s, duration) => {
    if (swiper.params.effect !== effect) return;
    setTransition2(duration);
  });
  on("transitionEnd", () => {
    if (swiper.params.effect !== effect) return;
    if (recreateShadows) {
      if (!getEffectParams || !getEffectParams().slideShadows) return;
      swiper.slides.forEach((slideEl) => {
        slideEl.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((shadowEl) => shadowEl.remove());
      });
      recreateShadows();
    }
  });
  let requireUpdateOnVirtual;
  on("virtualUpdate", () => {
    if (swiper.params.effect !== effect) return;
    if (!swiper.slides.length) {
      requireUpdateOnVirtual = true;
    }
    requestAnimationFrame(() => {
      if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
        setTranslate2();
        requireUpdateOnVirtual = false;
      }
    });
  });
}
function effectTarget(effectParams, slideEl) {
  const transformEl = getSlideTransformEl(slideEl);
  if (transformEl !== slideEl) {
    transformEl.style.backfaceVisibility = "hidden";
    transformEl.style["-webkit-backface-visibility"] = "hidden";
  }
  return transformEl;
}
function effectVirtualTransitionEnd(_ref) {
  let {
    swiper,
    duration,
    transformElements
  } = _ref;
  const {
    activeIndex
  } = swiper;
  if (swiper.params.virtualTranslate && duration !== 0) {
    let eventTriggered = false;
    let transitionEndTarget;
    {
      transitionEndTarget = transformElements;
    }
    transitionEndTarget.forEach((el) => {
      elementTransitionEnd(el, () => {
        if (eventTriggered) return;
        if (!swiper || swiper.destroyed) return;
        eventTriggered = true;
        swiper.animating = false;
        const evt = new window.CustomEvent("transitionend", {
          bubbles: true,
          cancelable: true
        });
        swiper.wrapperEl.dispatchEvent(evt);
      });
    });
  }
}
function EffectFade(_ref) {
  let {
    swiper,
    extendParams,
    on
  } = _ref;
  extendParams({
    fadeEffect: {
      crossFade: false
    }
  });
  const setTranslate2 = () => {
    const {
      slides
    } = swiper;
    const params = swiper.params.fadeEffect;
    for (let i = 0; i < slides.length; i += 1) {
      const slideEl = swiper.slides[i];
      const offset = slideEl.swiperSlideOffset;
      let tx = -offset;
      if (!swiper.params.virtualTranslate) tx -= swiper.translate;
      let ty = 0;
      if (!swiper.isHorizontal()) {
        ty = tx;
        tx = 0;
      }
      const slideOpacity = swiper.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(slideEl.progress), 0) : 1 + Math.min(Math.max(slideEl.progress, -1), 0);
      const targetEl = effectTarget(params, slideEl);
      targetEl.style.opacity = slideOpacity;
      targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
    }
  };
  const setTransition2 = (duration) => {
    const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
    transformElements.forEach((el) => {
      el.style.transitionDuration = `${duration}ms`;
    });
    effectVirtualTransitionEnd({
      swiper,
      duration,
      transformElements
    });
  };
  effectInit({
    effect: "fade",
    swiper,
    on,
    setTranslate: setTranslate2,
    setTransition: setTransition2,
    overwriteParams: () => ({
      slidesPerView: 1,
      slidesPerGroup: 1,
      watchSlidesProgress: true,
      spaceBetween: 0,
      virtualTranslate: !swiper.params.cssMode
    })
  });
}
function initSliders() {
  if (document.querySelector(".swiper")) {
    new Swiper(".swiper", {
      // <- Вказуємо склас потрібного слайдера
      // Підключаємо модулі слайдера
      // для конкретного випадку
      modules: [Navigation, EffectFade, Autoplay],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 0,
      //autoHeight: true,
      speed: 800,
      //touchRatio: 0,
      //simulateTouch: false,
      loop: true,
      //preloadImages: false,
      //lazy: true,
      // Ефекти
      effect: "fade",
      // autoplay: {
      // 	delay: 5000,
      // 	disableOnInteraction: false,
      // 	pauseOnMouseEnter: true,
      // },
      // Пагінація
      /*
      pagination: {
      	el: '.swiper-pagination',
      	clickable: true,
      },
      */
      // Скроллбар
      /*
      scrollbar: {
      	el: '.swiper-scrollbar',
      	draggable: true,
      },
      */
      // Кнопки "вліво/вправо"
      navigation: {
        prevEl: ".swiper-button-prev",
        nextEl: ".swiper-button-next"
      },
      /*
      // Брейкпоінти
      breakpoints: {
      	640: {
      		slidesPerView: 1,
      		spaceBetween: 0,
      		autoHeight: true,
      	},
      	768: {
      		slidesPerView: 2,
      		spaceBetween: 20,
      	},
      	992: {
      		slidesPerView: 3,
      		spaceBetween: 20,
      	},
      	1268: {
      		slidesPerView: 4,
      		spaceBetween: 30,
      	},
      },
      */
      // Події
      on: {}
    });
  }
}
document.querySelector("[data-fls-slider]") ? window.addEventListener("load", initSliders) : null;
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
        header.classList.add("header-hide") & header.classList.remove("header-scroll");
      } else {
        header.classList.remove("header-hide") & header.classList.add("header-scroll");
      }
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("header-show") ? header.classList.remove("header-show") : null;
        } else {
          !header.classList.contains("header-show") ? header.classList.add("header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("header-show") ? header.classList.add("header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("header-scroll") ? header.classList.remove("header-scroll") : null;
      if (headerShow) {
        header.classList.contains("header-show") ? header.classList.remove("header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-fls-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
/*!
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
var lGEvents = {
  afterAppendSlide: "lgAfterAppendSlide",
  init: "lgInit",
  hasVideo: "lgHasVideo",
  containerResize: "lgContainerResize",
  updateSlides: "lgUpdateSlides",
  afterAppendSubHtml: "lgAfterAppendSubHtml",
  beforeOpen: "lgBeforeOpen",
  afterOpen: "lgAfterOpen",
  slideItemLoad: "lgSlideItemLoad",
  beforeSlide: "lgBeforeSlide",
  afterSlide: "lgAfterSlide",
  posterClick: "lgPosterClick",
  dragStart: "lgDragStart",
  dragMove: "lgDragMove",
  dragEnd: "lgDragEnd",
  beforeNextSlide: "lgBeforeNextSlide",
  beforePrevSlide: "lgBeforePrevSlide",
  beforeClose: "lgBeforeClose",
  afterClose: "lgAfterClose"
};
var lightGalleryCoreSettings = {
  mode: "lg-slide",
  easing: "ease",
  speed: 400,
  licenseKey: "0000-0000-000-0000",
  height: "100%",
  width: "100%",
  addClass: "",
  startClass: "lg-start-zoom",
  backdropDuration: 300,
  container: "",
  startAnimationDuration: 400,
  zoomFromOrigin: true,
  hideBarsDelay: 0,
  showBarsAfter: 1e4,
  slideDelay: 0,
  supportLegacyBrowser: true,
  allowMediaOverlap: false,
  videoMaxSize: "1280-720",
  loadYouTubePoster: true,
  defaultCaptionHeight: 0,
  ariaLabelledby: "",
  ariaDescribedby: "",
  resetScrollPosition: true,
  hideScrollbar: false,
  closable: true,
  swipeToClose: true,
  closeOnTap: true,
  showCloseIcon: true,
  showMaximizeIcon: false,
  loop: true,
  escKey: true,
  keyPress: true,
  trapFocus: true,
  controls: true,
  slideEndAnimation: true,
  hideControlOnEnd: false,
  mousewheel: false,
  getCaptionFromTitleOrAlt: true,
  appendSubHtmlTo: ".lg-sub-html",
  subHtmlSelectorRelative: false,
  preload: 2,
  numberOfSlideItemsInDom: 10,
  selector: "",
  selectWithin: "",
  nextHtml: "",
  prevHtml: "",
  index: 0,
  iframeWidth: "100%",
  iframeHeight: "100%",
  iframeMaxWidth: "100%",
  iframeMaxHeight: "100%",
  download: true,
  counter: true,
  appendCounterTo: ".lg-toolbar",
  swipeThreshold: 50,
  enableSwipe: true,
  enableDrag: true,
  dynamic: false,
  dynamicEl: [],
  extraProps: [],
  exThumbImage: "",
  isMobile: void 0,
  mobileSettings: {
    controls: false,
    showCloseIcon: false,
    download: false
  },
  plugins: [],
  strings: {
    closeGallery: "Close gallery",
    toggleMaximize: "Toggle maximize",
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
    download: "Download",
    playVideo: "Play video",
    mediaLoadingFailed: "Oops... Failed to load content..."
  }
};
function initLgPolyfills() {
  (function() {
    if (typeof window.CustomEvent === "function")
      return false;
    function CustomEvent3(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: null
      };
      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }
    window.CustomEvent = CustomEvent3;
  })();
  (function() {
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
  })();
}
var lgQuery = (
  /** @class */
  (function() {
    function lgQuery2(selector) {
      this.cssVenderPrefixes = [
        "TransitionDuration",
        "TransitionTimingFunction",
        "Transform",
        "Transition"
      ];
      this.selector = this._getSelector(selector);
      this.firstElement = this._getFirstEl();
      return this;
    }
    lgQuery2.generateUUID = function() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    };
    lgQuery2.prototype._getSelector = function(selector, context) {
      if (context === void 0) {
        context = document;
      }
      if (typeof selector !== "string") {
        return selector;
      }
      context = context || document;
      var fl = selector.substring(0, 1);
      if (fl === "#") {
        return context.querySelector(selector);
      } else {
        return context.querySelectorAll(selector);
      }
    };
    lgQuery2.prototype._each = function(func) {
      if (!this.selector) {
        return this;
      }
      if (this.selector.length !== void 0) {
        [].forEach.call(this.selector, func);
      } else {
        func(this.selector, 0);
      }
      return this;
    };
    lgQuery2.prototype._setCssVendorPrefix = function(el, cssProperty, value) {
      var property = cssProperty.replace(/-([a-z])/gi, function(s, group1) {
        return group1.toUpperCase();
      });
      if (this.cssVenderPrefixes.indexOf(property) !== -1) {
        el.style[property.charAt(0).toLowerCase() + property.slice(1)] = value;
        el.style["webkit" + property] = value;
        el.style["moz" + property] = value;
        el.style["ms" + property] = value;
        el.style["o" + property] = value;
      } else {
        el.style[property] = value;
      }
    };
    lgQuery2.prototype._getFirstEl = function() {
      if (this.selector && this.selector.length !== void 0) {
        return this.selector[0];
      } else {
        return this.selector;
      }
    };
    lgQuery2.prototype.isEventMatched = function(event, eventName) {
      var eventNamespace = eventName.split(".");
      return event.split(".").filter(function(e) {
        return e;
      }).every(function(e) {
        return eventNamespace.indexOf(e) !== -1;
      });
    };
    lgQuery2.prototype.attr = function(attr, value) {
      if (value === void 0) {
        if (!this.firstElement) {
          return "";
        }
        return this.firstElement.getAttribute(attr);
      }
      this._each(function(el) {
        el.setAttribute(attr, value);
      });
      return this;
    };
    lgQuery2.prototype.find = function(selector) {
      return $LG(this._getSelector(selector, this.selector));
    };
    lgQuery2.prototype.first = function() {
      if (this.selector && this.selector.length !== void 0) {
        return $LG(this.selector[0]);
      } else {
        return $LG(this.selector);
      }
    };
    lgQuery2.prototype.eq = function(index) {
      return $LG(this.selector[index]);
    };
    lgQuery2.prototype.parent = function() {
      return $LG(this.selector.parentElement);
    };
    lgQuery2.prototype.get = function() {
      return this._getFirstEl();
    };
    lgQuery2.prototype.removeAttr = function(attributes) {
      var attrs = attributes.split(" ");
      this._each(function(el) {
        attrs.forEach(function(attr) {
          return el.removeAttribute(attr);
        });
      });
      return this;
    };
    lgQuery2.prototype.wrap = function(className) {
      if (!this.firstElement) {
        return this;
      }
      var wrapper = document.createElement("div");
      wrapper.className = className;
      this.firstElement.parentNode.insertBefore(wrapper, this.firstElement);
      this.firstElement.parentNode.removeChild(this.firstElement);
      wrapper.appendChild(this.firstElement);
      return this;
    };
    lgQuery2.prototype.addClass = function(classNames) {
      if (classNames === void 0) {
        classNames = "";
      }
      this._each(function(el) {
        classNames.split(" ").forEach(function(className) {
          if (className) {
            el.classList.add(className);
          }
        });
      });
      return this;
    };
    lgQuery2.prototype.removeClass = function(classNames) {
      this._each(function(el) {
        classNames.split(" ").forEach(function(className) {
          if (className) {
            el.classList.remove(className);
          }
        });
      });
      return this;
    };
    lgQuery2.prototype.hasClass = function(className) {
      if (!this.firstElement) {
        return false;
      }
      return this.firstElement.classList.contains(className);
    };
    lgQuery2.prototype.hasAttribute = function(attribute) {
      if (!this.firstElement) {
        return false;
      }
      return this.firstElement.hasAttribute(attribute);
    };
    lgQuery2.prototype.toggleClass = function(className) {
      if (!this.firstElement) {
        return this;
      }
      if (this.hasClass(className)) {
        this.removeClass(className);
      } else {
        this.addClass(className);
      }
      return this;
    };
    lgQuery2.prototype.css = function(property, value) {
      var _this = this;
      this._each(function(el) {
        _this._setCssVendorPrefix(el, property, value);
      });
      return this;
    };
    lgQuery2.prototype.on = function(events2, listener) {
      var _this = this;
      if (!this.selector) {
        return this;
      }
      events2.split(" ").forEach(function(event) {
        if (!Array.isArray(lgQuery2.eventListeners[event])) {
          lgQuery2.eventListeners[event] = [];
        }
        lgQuery2.eventListeners[event].push(listener);
        _this.selector.addEventListener(event.split(".")[0], listener);
      });
      return this;
    };
    lgQuery2.prototype.once = function(event, listener) {
      var _this = this;
      this.on(event, function() {
        _this.off(event);
        listener(event);
      });
      return this;
    };
    lgQuery2.prototype.off = function(event) {
      var _this = this;
      if (!this.selector) {
        return this;
      }
      Object.keys(lgQuery2.eventListeners).forEach(function(eventName) {
        if (_this.isEventMatched(event, eventName)) {
          lgQuery2.eventListeners[eventName].forEach(function(listener) {
            _this.selector.removeEventListener(eventName.split(".")[0], listener);
          });
          lgQuery2.eventListeners[eventName] = [];
        }
      });
      return this;
    };
    lgQuery2.prototype.trigger = function(event, detail) {
      if (!this.firstElement) {
        return this;
      }
      var customEvent = new CustomEvent(event.split(".")[0], {
        detail: detail || null
      });
      this.firstElement.dispatchEvent(customEvent);
      return this;
    };
    lgQuery2.prototype.load = function(url) {
      var _this = this;
      fetch(url).then(function(res) {
        return res.text();
      }).then(function(html) {
        _this.selector.innerHTML = html;
      });
      return this;
    };
    lgQuery2.prototype.html = function(html) {
      if (html === void 0) {
        if (!this.firstElement) {
          return "";
        }
        return this.firstElement.innerHTML;
      }
      this._each(function(el) {
        el.innerHTML = html;
      });
      return this;
    };
    lgQuery2.prototype.append = function(html) {
      this._each(function(el) {
        if (typeof html === "string") {
          el.insertAdjacentHTML("beforeend", html);
        } else {
          el.appendChild(html);
        }
      });
      return this;
    };
    lgQuery2.prototype.prepend = function(html) {
      this._each(function(el) {
        if (typeof html === "string") {
          el.insertAdjacentHTML("afterbegin", html);
        } else if (html instanceof HTMLElement) {
          el.insertBefore(html.cloneNode(true), el.firstChild);
        }
      });
      return this;
    };
    lgQuery2.prototype.remove = function() {
      this._each(function(el) {
        el.parentNode.removeChild(el);
      });
      return this;
    };
    lgQuery2.prototype.empty = function() {
      this._each(function(el) {
        el.innerHTML = "";
      });
      return this;
    };
    lgQuery2.prototype.scrollTop = function(scrollTop) {
      if (scrollTop !== void 0) {
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop;
        return this;
      } else {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }
    };
    lgQuery2.prototype.scrollLeft = function(scrollLeft) {
      if (scrollLeft !== void 0) {
        document.body.scrollLeft = scrollLeft;
        document.documentElement.scrollLeft = scrollLeft;
        return this;
      } else {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      }
    };
    lgQuery2.prototype.offset = function() {
      if (!this.firstElement) {
        return {
          left: 0,
          top: 0
        };
      }
      var rect = this.firstElement.getBoundingClientRect();
      var bodyMarginLeft = $LG("body").style().marginLeft;
      return {
        left: rect.left - parseFloat(bodyMarginLeft) + this.scrollLeft(),
        top: rect.top + this.scrollTop()
      };
    };
    lgQuery2.prototype.style = function() {
      if (!this.firstElement) {
        return {};
      }
      return this.firstElement.currentStyle || window.getComputedStyle(this.firstElement);
    };
    lgQuery2.prototype.width = function() {
      var style = this.style();
      return this.firstElement.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    };
    lgQuery2.prototype.height = function() {
      var style = this.style();
      return this.firstElement.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    };
    lgQuery2.eventListeners = {};
    return lgQuery2;
  })()
);
function $LG(selector) {
  initLgPolyfills();
  return new lgQuery(selector);
}
var defaultDynamicOptions = [
  "src",
  "sources",
  "subHtml",
  "subHtmlUrl",
  "html",
  "video",
  "poster",
  "slideName",
  "responsive",
  "srcset",
  "sizes",
  "iframe",
  "downloadUrl",
  "download",
  "width",
  "facebookShareUrl",
  "tweetText",
  "iframeTitle",
  "twitterShareUrl",
  "pinterestShareUrl",
  "pinterestText",
  "fbHtml",
  "disqusIdentifier",
  "disqusUrl"
];
function convertToData(attr) {
  if (attr === "href") {
    return "src";
  }
  attr = attr.replace("data-", "");
  attr = attr.charAt(0).toLowerCase() + attr.slice(1);
  attr = attr.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
  return attr;
}
var utils = {
  /**
   * Fetches HTML content from a given URL and inserts it into a specified element.
   *
   * @param url - The URL to fetch the HTML content from.
   * @param element - The DOM element (jQuery object) to insert the HTML content into.
   * @param insertMethod - The method to insert the HTML ('append' or 'replace').
   */
  fetchCaptionFromUrl: function(url, element, insertMethod) {
    fetch(url).then(function(response) {
      return response.text();
    }).then(function(htmlContent) {
      if (insertMethod === "append") {
        var contentDiv = '<div class="lg-sub-html">' + htmlContent + "</div>";
        element.append(contentDiv);
      } else {
        element.html(htmlContent);
      }
    });
  },
  /**
   * get possible width and height from the lgSize attribute. Used for ZoomFromOrigin option
   */
  getSize: function(el, container, spacing, defaultLgSize) {
    if (spacing === void 0) {
      spacing = 0;
    }
    var LGel = $LG(el);
    var lgSize = LGel.attr("data-lg-size") || defaultLgSize;
    if (!lgSize) {
      return;
    }
    var isResponsiveSizes = lgSize.split(",");
    if (isResponsiveSizes[1]) {
      var wWidth = window.innerWidth;
      for (var i = 0; i < isResponsiveSizes.length; i++) {
        var size_1 = isResponsiveSizes[i];
        var responsiveWidth = parseInt(size_1.split("-")[2], 10);
        if (responsiveWidth > wWidth) {
          lgSize = size_1;
          break;
        }
        if (i === isResponsiveSizes.length - 1) {
          lgSize = size_1;
        }
      }
    }
    var size = lgSize.split("-");
    var width = parseInt(size[0], 10);
    var height = parseInt(size[1], 10);
    var cWidth = container.width();
    var cHeight = container.height() - spacing;
    var maxWidth = Math.min(cWidth, width);
    var maxHeight = Math.min(cHeight, height);
    var ratio = Math.min(maxWidth / width, maxHeight / height);
    return { width: width * ratio, height: height * ratio };
  },
  /**
   * @desc Get transform value based on the imageSize. Used for ZoomFromOrigin option
   * @param {jQuery Element}
   * @returns {String} Transform CSS string
   */
  getTransform: function(el, container, top, bottom, imageSize) {
    if (!imageSize) {
      return;
    }
    var LGel = $LG(el).find("img").first();
    if (!LGel.get()) {
      return;
    }
    var containerRect = container.get().getBoundingClientRect();
    var wWidth = containerRect.width;
    var wHeight = container.height() - (top + bottom);
    var elWidth = LGel.width();
    var elHeight = LGel.height();
    var elStyle = LGel.style();
    var x = (wWidth - elWidth) / 2 - LGel.offset().left + (parseFloat(elStyle.paddingLeft) || 0) + (parseFloat(elStyle.borderLeft) || 0) + $LG(window).scrollLeft() + containerRect.left;
    var y = (wHeight - elHeight) / 2 - LGel.offset().top + (parseFloat(elStyle.paddingTop) || 0) + (parseFloat(elStyle.borderTop) || 0) + $LG(window).scrollTop() + top;
    var scX = elWidth / imageSize.width;
    var scY = elHeight / imageSize.height;
    var transform = "translate3d(" + (x *= -1) + "px, " + (y *= -1) + "px, 0) scale3d(" + scX + ", " + scY + ", 1)";
    return transform;
  },
  getIframeMarkup: function(iframeWidth, iframeHeight, iframeMaxWidth, iframeMaxHeight, src, iframeTitle) {
    var title = iframeTitle ? 'title="' + iframeTitle + '"' : "";
    return '<div class="lg-media-cont lg-has-iframe" style="width:' + iframeWidth + "; max-width:" + iframeMaxWidth + "; height: " + iframeHeight + "; max-height:" + iframeMaxHeight + '">\n                    <iframe class="lg-object" frameborder="0" ' + title + ' src="' + src + '"  allowfullscreen="true"></iframe>\n                </div>';
  },
  getImgMarkup: function(index, src, altAttr, srcset, sizes, sources) {
    var srcsetAttr = srcset ? 'srcset="' + srcset + '"' : "";
    var sizesAttr = sizes ? 'sizes="' + sizes + '"' : "";
    var imgMarkup = "<img " + altAttr + " " + srcsetAttr + "  " + sizesAttr + ' class="lg-object lg-image" data-index="' + index + '" src="' + src + '" />';
    var sourceTag = "";
    if (sources) {
      var sourceObj = typeof sources === "string" ? JSON.parse(sources) : sources;
      sourceTag = sourceObj.map(function(source) {
        var attrs = "";
        Object.keys(source).forEach(function(key) {
          attrs += " " + key + '="' + source[key] + '"';
        });
        return "<source " + attrs + "></source>";
      });
    }
    return "" + sourceTag + imgMarkup;
  },
  // Get src from responsive src
  getResponsiveSrc: function(srcItms) {
    var rsWidth = [];
    var rsSrc = [];
    var src = "";
    for (var i = 0; i < srcItms.length; i++) {
      var _src = srcItms[i].split(" ");
      if (_src[0] === "") {
        _src.splice(0, 1);
      }
      rsSrc.push(_src[0]);
      rsWidth.push(_src[1]);
    }
    var wWidth = window.innerWidth;
    for (var j = 0; j < rsWidth.length; j++) {
      if (parseInt(rsWidth[j], 10) > wWidth) {
        src = rsSrc[j];
        break;
      }
    }
    return src;
  },
  isImageLoaded: function(img) {
    if (!img)
      return false;
    if (!img.complete) {
      return false;
    }
    if (img.naturalWidth === 0) {
      return false;
    }
    return true;
  },
  getVideoPosterMarkup: function(_poster, dummyImg, videoContStyle, playVideoString, _isVideo) {
    var videoClass = "";
    if (_isVideo && _isVideo.youtube) {
      videoClass = "lg-has-youtube";
    } else if (_isVideo && _isVideo.vimeo) {
      videoClass = "lg-has-vimeo";
    } else {
      videoClass = "lg-has-html5";
    }
    var _dummy = dummyImg;
    if (typeof dummyImg !== "string") {
      _dummy = dummyImg.outerHTML;
    }
    return '<div class="lg-video-cont ' + videoClass + '" style="' + videoContStyle + '">\n                <div class="lg-video-play-button">\n                <svg\n                    viewBox="0 0 20 20"\n                    preserveAspectRatio="xMidYMid"\n                    focusable="false"\n                    aria-labelledby="' + playVideoString + '"\n                    role="img"\n                    class="lg-video-play-icon"\n                >\n                    <title>' + playVideoString + '</title>\n                    <polygon class="lg-video-play-icon-inner" points="1,0 20,10 1,20"></polygon>\n                </svg>\n                <svg class="lg-video-play-icon-bg" viewBox="0 0 50 50" focusable="false">\n                    <circle cx="50%" cy="50%" r="20"></circle></svg>\n                <svg class="lg-video-play-icon-circle" viewBox="0 0 50 50" focusable="false">\n                    <circle cx="50%" cy="50%" r="20"></circle>\n                </svg>\n            </div>\n            ' + _dummy + '\n            <img class="lg-object lg-video-poster" src="' + _poster + '" />\n        </div>';
  },
  getFocusableElements: function(container) {
    var elements = container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    var visibleElements = [].filter.call(elements, function(element) {
      var style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    return visibleElements;
  },
  /**
   * @desc Create dynamic elements array from gallery items when dynamic option is false
   * It helps to avoid frequent DOM interaction
   * and avoid multiple checks for dynamic elments
   *
   * @returns {Array} dynamicEl
   */
  getDynamicOptions: function(items, extraProps, getCaptionFromTitleOrAlt, exThumbImage) {
    var dynamicElements = [];
    var availableDynamicOptions = __spreadArrays(defaultDynamicOptions, extraProps);
    [].forEach.call(items, function(item) {
      var dynamicEl = {};
      for (var i = 0; i < item.attributes.length; i++) {
        var attr = item.attributes[i];
        if (attr.specified) {
          var dynamicAttr = convertToData(attr.name);
          var label = "";
          if (availableDynamicOptions.indexOf(dynamicAttr) > -1) {
            label = dynamicAttr;
          }
          if (label) {
            dynamicEl[label] = attr.value;
          }
        }
      }
      var currentItem = $LG(item);
      var alt = currentItem.find("img").first().attr("alt");
      var title = currentItem.attr("title");
      var thumb = exThumbImage ? currentItem.attr(exThumbImage) : currentItem.find("img").first().attr("src");
      dynamicEl.thumb = thumb;
      if (getCaptionFromTitleOrAlt && !dynamicEl.subHtml) {
        dynamicEl.subHtml = title || alt || "";
      }
      dynamicEl.alt = alt || title || "";
      dynamicElements.push(dynamicEl);
    });
    return dynamicElements;
  },
  isMobile: function() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  },
  /**
   * @desc Check the given src is video
   * @param {String} src
   * @return {Object} video type
   * Ex:{ youtube  :  ["//www.youtube.com/watch?v=c0asJgSyxcY", "c0asJgSyxcY"] }
   *
   * @todo - this information can be moved to dynamicEl to avoid frequent calls
   */
  isVideo: function(src, isHTML5VIdeo, index) {
    if (!src) {
      if (isHTML5VIdeo) {
        return {
          html5: true
        };
      } else {
        console.error("lightGallery :- data-src is not provided on slide item " + (index + 1) + ". Please make sure the selector property is properly configured. More info - https://www.lightgalleryjs.com/demos/html-markup/");
        return;
      }
    }
    var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com|be-nocookie\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)([\&|?][\S]*)*/i);
    var vimeo = src.match(/\/\/(?:www\.)?(?:player\.)?vimeo.com\/(?:video\/)?([0-9a-z\-_]+)(.*)?/i);
    var wistia = src.match(/https?:\/\/(.+)?(wistia\.com|wi\.st)\/(medias|embed)\/([0-9a-z\-_]+)(.*)/);
    if (youtube) {
      return {
        youtube
      };
    } else if (vimeo) {
      return {
        vimeo
      };
    } else if (wistia) {
      return {
        wistia
      };
    }
  }
};
var lgId = 0;
var LightGallery = (
  /** @class */
  (function() {
    function LightGallery2(element, options) {
      this.lgOpened = false;
      this.index = 0;
      this.plugins = [];
      this.lGalleryOn = false;
      this.lgBusy = false;
      this.currentItemsInDom = [];
      this.prevScrollTop = 0;
      this.bodyPaddingRight = 0;
      this.isDummyImageRemoved = false;
      this.dragOrSwipeEnabled = false;
      this.mediaContainerPosition = {
        top: 0,
        bottom: 0
      };
      if (!element) {
        return this;
      }
      lgId++;
      this.lgId = lgId;
      this.el = element;
      this.LGel = $LG(element);
      this.generateSettings(options);
      this.buildModules();
      if (this.settings.dynamic && this.settings.dynamicEl !== void 0 && !Array.isArray(this.settings.dynamicEl)) {
        throw "When using dynamic mode, you must also define dynamicEl as an Array.";
      }
      this.galleryItems = this.getItems();
      this.normalizeSettings();
      this.init();
      this.validateLicense();
      return this;
    }
    LightGallery2.prototype.generateSettings = function(options) {
      this.settings = __assign(__assign({}, lightGalleryCoreSettings), options);
      if (this.settings.isMobile && typeof this.settings.isMobile === "function" ? this.settings.isMobile() : utils.isMobile()) {
        var mobileSettings = __assign(__assign({}, this.settings.mobileSettings), this.settings.mobileSettings);
        this.settings = __assign(__assign({}, this.settings), mobileSettings);
      }
    };
    LightGallery2.prototype.normalizeSettings = function() {
      if (this.settings.slideEndAnimation) {
        this.settings.hideControlOnEnd = false;
      }
      if (!this.settings.closable) {
        this.settings.swipeToClose = false;
      }
      this.zoomFromOrigin = this.settings.zoomFromOrigin;
      if (this.settings.dynamic) {
        this.zoomFromOrigin = false;
      }
      if (this.settings.container) {
        var container = this.settings.container;
        if (typeof container === "function") {
          this.settings.container = container();
        } else if (typeof container === "string") {
          var el = document.querySelector(container);
          this.settings.container = el !== null && el !== void 0 ? el : document.body;
        }
      } else {
        this.settings.container = document.body;
      }
      this.settings.preload = Math.min(this.settings.preload, this.galleryItems.length);
    };
    LightGallery2.prototype.init = function() {
      var _this = this;
      this.addSlideVideoInfo(this.galleryItems);
      this.buildStructure();
      this.LGel.trigger(lGEvents.init, {
        instance: this
      });
      if (this.settings.keyPress) {
        this.keyPress();
      }
      setTimeout(function() {
        _this.enableDrag();
        _this.enableSwipe();
        _this.triggerPosterClick();
      }, 50);
      this.arrow();
      if (this.settings.mousewheel) {
        this.mousewheel();
      }
      if (!this.settings.dynamic) {
        this.openGalleryOnItemClick();
      }
    };
    LightGallery2.prototype.openGalleryOnItemClick = function() {
      var _this = this;
      var _loop_1 = function(index2) {
        var element = this_1.items[index2];
        var $element = $LG(element);
        var uuid = lgQuery.generateUUID();
        $element.attr("data-lg-id", uuid).on("click.lgcustom-item-" + uuid, function(e) {
          e.preventDefault();
          var currentItemIndex = _this.settings.index || index2;
          _this.openGallery(currentItemIndex, element);
        });
      };
      var this_1 = this;
      for (var index = 0; index < this.items.length; index++) {
        _loop_1(index);
      }
    };
    LightGallery2.prototype.buildModules = function() {
      var _this = this;
      this.settings.plugins.forEach(function(plugin) {
        _this.plugins.push(new plugin(_this, $LG));
      });
    };
    LightGallery2.prototype.validateLicense = function() {
      if (!this.settings.licenseKey) {
        console.error("Please provide a valid license key");
      } else if (this.settings.licenseKey === "0000-0000-000-0000") {
        console.warn("lightGallery: " + this.settings.licenseKey + " license key is not valid for production use");
      }
    };
    LightGallery2.prototype.getSlideItem = function(index) {
      return $LG(this.getSlideItemId(index));
    };
    LightGallery2.prototype.getSlideItemId = function(index) {
      return "#lg-item-" + this.lgId + "-" + index;
    };
    LightGallery2.prototype.getIdName = function(id) {
      return id + "-" + this.lgId;
    };
    LightGallery2.prototype.getElementById = function(id) {
      return $LG("#" + this.getIdName(id));
    };
    LightGallery2.prototype.manageSingleSlideClassName = function() {
      if (this.galleryItems.length < 2) {
        this.outer.addClass("lg-single-item");
      } else {
        this.outer.removeClass("lg-single-item");
      }
    };
    LightGallery2.prototype.buildStructure = function() {
      var _this = this;
      var container = this.$container && this.$container.get();
      if (container) {
        return;
      }
      var controls = "";
      var subHtmlCont = "";
      if (this.settings.controls) {
        controls = '<button type="button" id="' + this.getIdName("lg-prev") + '" aria-label="' + this.settings.strings["previousSlide"] + '" class="lg-prev lg-icon"> ' + this.settings.prevHtml + ' </button>\n                <button type="button" id="' + this.getIdName("lg-next") + '" aria-label="' + this.settings.strings["nextSlide"] + '" class="lg-next lg-icon"> ' + this.settings.nextHtml + " </button>";
      }
      if (this.settings.appendSubHtmlTo !== ".lg-item") {
        subHtmlCont = '<div class="lg-sub-html" role="status" aria-live="polite"></div>';
      }
      var addClasses2 = "";
      if (this.settings.allowMediaOverlap) {
        addClasses2 += "lg-media-overlap ";
      }
      var ariaLabelledby = this.settings.ariaLabelledby ? 'aria-labelledby="' + this.settings.ariaLabelledby + '"' : "";
      var ariaDescribedby = this.settings.ariaDescribedby ? 'aria-describedby="' + this.settings.ariaDescribedby + '"' : "";
      var containerClassName = "lg-container " + this.settings.addClass + " " + (document.body !== this.settings.container ? "lg-inline" : "");
      var closeIcon = this.settings.closable && this.settings.showCloseIcon ? '<button type="button" aria-label="' + this.settings.strings["closeGallery"] + '" id="' + this.getIdName("lg-close") + '" class="lg-close lg-icon"></button>' : "";
      var maximizeIcon = this.settings.showMaximizeIcon ? '<button type="button" aria-label="' + this.settings.strings["toggleMaximize"] + '" id="' + this.getIdName("lg-maximize") + '" class="lg-maximize lg-icon"></button>' : "";
      var template = '\n        <div class="' + containerClassName + '" id="' + this.getIdName("lg-container") + '" tabindex="-1" aria-modal="true" ' + ariaLabelledby + " " + ariaDescribedby + ' role="dialog"\n        >\n            <div id="' + this.getIdName("lg-backdrop") + '" class="lg-backdrop"></div>\n\n            <div id="' + this.getIdName("lg-outer") + '" class="lg-outer lg-use-css3 lg-css3 lg-hide-items ' + addClasses2 + ' ">\n\n              <div id="' + this.getIdName("lg-content") + '" class="lg-content">\n                <div id="' + this.getIdName("lg-inner") + '" class="lg-inner">\n                </div>\n                ' + controls + '\n              </div>\n                <div id="' + this.getIdName("lg-toolbar") + '" class="lg-toolbar lg-group">\n                    ' + maximizeIcon + "\n                    " + closeIcon + "\n                    </div>\n                    " + (this.settings.appendSubHtmlTo === ".lg-outer" ? subHtmlCont : "") + '\n                <div id="' + this.getIdName("lg-components") + '" class="lg-components">\n                    ' + (this.settings.appendSubHtmlTo === ".lg-sub-html" ? subHtmlCont : "") + "\n                </div>\n            </div>\n        </div>\n        ";
      $LG(this.settings.container).append(template);
      if (document.body !== this.settings.container) {
        $LG(this.settings.container).css("position", "relative");
      }
      this.outer = this.getElementById("lg-outer");
      this.$lgComponents = this.getElementById("lg-components");
      this.$backdrop = this.getElementById("lg-backdrop");
      this.$container = this.getElementById("lg-container");
      this.$inner = this.getElementById("lg-inner");
      this.$content = this.getElementById("lg-content");
      this.$toolbar = this.getElementById("lg-toolbar");
      this.$backdrop.css("transition-duration", this.settings.backdropDuration + "ms");
      var outerClassNames = this.settings.mode + " ";
      this.manageSingleSlideClassName();
      if (this.settings.enableDrag) {
        outerClassNames += "lg-grab ";
      }
      this.outer.addClass(outerClassNames);
      this.$inner.css("transition-timing-function", this.settings.easing);
      this.$inner.css("transition-duration", this.settings.speed + "ms");
      if (this.settings.download) {
        this.$toolbar.append('<a id="' + this.getIdName("lg-download") + '" target="_blank" rel="noopener" aria-label="' + this.settings.strings["download"] + '" download class="lg-download lg-icon"></a>');
      }
      this.counter();
      $LG(window).on("resize.lg.global" + this.lgId + " orientationchange.lg.global" + this.lgId, function() {
        _this.refreshOnResize();
      });
      this.hideBars();
      this.manageCloseGallery();
      this.toggleMaximize();
      this.initModules();
    };
    LightGallery2.prototype.refreshOnResize = function() {
      if (this.lgOpened) {
        var currentGalleryItem = this.galleryItems[this.index];
        var __slideVideoInfo = currentGalleryItem.__slideVideoInfo;
        this.mediaContainerPosition = this.getMediaContainerPosition();
        var _a = this.mediaContainerPosition, top_1 = _a.top, bottom = _a.bottom;
        this.currentImageSize = utils.getSize(this.items[this.index], this.outer, top_1 + bottom, __slideVideoInfo && this.settings.videoMaxSize);
        if (__slideVideoInfo) {
          this.resizeVideoSlide(this.index, this.currentImageSize);
        }
        if (this.zoomFromOrigin && !this.isDummyImageRemoved) {
          var imgStyle = this.getDummyImgStyles(this.currentImageSize);
          this.outer.find(".lg-current .lg-dummy-img").first().attr("style", imgStyle);
        }
        this.LGel.trigger(lGEvents.containerResize);
      }
    };
    LightGallery2.prototype.resizeVideoSlide = function(index, imageSize) {
      var lgVideoStyle = this.getVideoContStyle(imageSize);
      var currentSlide = this.getSlideItem(index);
      currentSlide.find(".lg-video-cont").attr("style", lgVideoStyle);
    };
    LightGallery2.prototype.updateSlides = function(items, index) {
      if (this.index > items.length - 1) {
        this.index = items.length - 1;
      }
      if (items.length === 1) {
        this.index = 0;
      }
      if (!items.length) {
        this.closeGallery();
        return;
      }
      var currentSrc = this.galleryItems[index].src;
      this.galleryItems = items;
      this.updateControls();
      this.$inner.empty();
      this.currentItemsInDom = [];
      var _index = 0;
      this.galleryItems.some(function(galleryItem, itemIndex) {
        if (galleryItem.src === currentSrc) {
          _index = itemIndex;
          return true;
        }
        return false;
      });
      this.currentItemsInDom = this.organizeSlideItems(_index, -1);
      this.loadContent(_index, true);
      this.getSlideItem(_index).addClass("lg-current");
      this.index = _index;
      this.updateCurrentCounter(_index);
      this.LGel.trigger(lGEvents.updateSlides);
    };
    LightGallery2.prototype.getItems = function() {
      this.items = [];
      if (!this.settings.dynamic) {
        if (this.settings.selector === "this") {
          this.items.push(this.el);
        } else if (this.settings.selector) {
          if (typeof this.settings.selector === "string") {
            if (this.settings.selectWithin) {
              var selectWithin = $LG(this.settings.selectWithin);
              this.items = selectWithin.find(this.settings.selector).get();
            } else {
              this.items = this.el.querySelectorAll(this.settings.selector);
            }
          } else {
            this.items = this.settings.selector;
          }
        } else {
          this.items = this.el.children;
        }
        return utils.getDynamicOptions(this.items, this.settings.extraProps, this.settings.getCaptionFromTitleOrAlt, this.settings.exThumbImage);
      } else {
        return this.settings.dynamicEl || [];
      }
    };
    LightGallery2.prototype.shouldHideScrollbar = function() {
      return this.settings.hideScrollbar && document.body === this.settings.container;
    };
    LightGallery2.prototype.hideScrollbar = function() {
      if (!this.shouldHideScrollbar()) {
        return;
      }
      this.bodyPaddingRight = parseFloat($LG("body").style().paddingRight);
      var bodyRect = document.documentElement.getBoundingClientRect();
      var scrollbarWidth = window.innerWidth - bodyRect.width;
      $LG(document.body).css("padding-right", scrollbarWidth + this.bodyPaddingRight + "px");
      $LG(document.body).addClass("lg-overlay-open");
    };
    LightGallery2.prototype.resetScrollBar = function() {
      if (!this.shouldHideScrollbar()) {
        return;
      }
      $LG(document.body).css("padding-right", this.bodyPaddingRight + "px");
      $LG(document.body).removeClass("lg-overlay-open");
    };
    LightGallery2.prototype.openGallery = function(index, element) {
      var _this = this;
      if (index === void 0) {
        index = this.settings.index;
      }
      if (this.lgOpened)
        return;
      this.lgOpened = true;
      this.outer.removeClass("lg-hide-items");
      this.hideScrollbar();
      this.$container.addClass("lg-show");
      var itemsToBeInsertedToDom = this.getItemsToBeInsertedToDom(index, index);
      this.currentItemsInDom = itemsToBeInsertedToDom;
      var items = "";
      itemsToBeInsertedToDom.forEach(function(item) {
        items = items + ('<div id="' + item + '" class="lg-item"></div>');
      });
      this.$inner.append(items);
      this.addHtml(index);
      var transform = "";
      this.mediaContainerPosition = this.getMediaContainerPosition();
      var _a = this.mediaContainerPosition, top = _a.top, bottom = _a.bottom;
      if (!this.settings.allowMediaOverlap) {
        this.setMediaContainerPosition(top, bottom);
      }
      var __slideVideoInfo = this.galleryItems[index].__slideVideoInfo;
      if (this.zoomFromOrigin && element) {
        this.currentImageSize = utils.getSize(element, this.outer, top + bottom, __slideVideoInfo && this.settings.videoMaxSize);
        transform = utils.getTransform(element, this.outer, top, bottom, this.currentImageSize);
      }
      if (!this.zoomFromOrigin || !transform) {
        this.outer.addClass(this.settings.startClass);
        this.getSlideItem(index).removeClass("lg-complete");
      }
      var timeout = this.settings.zoomFromOrigin ? 100 : this.settings.backdropDuration;
      setTimeout(function() {
        _this.outer.addClass("lg-components-open");
      }, timeout);
      this.index = index;
      this.LGel.trigger(lGEvents.beforeOpen);
      this.getSlideItem(index).addClass("lg-current");
      this.lGalleryOn = false;
      this.prevScrollTop = $LG(window).scrollTop();
      setTimeout(function() {
        if (_this.zoomFromOrigin && transform) {
          var currentSlide_1 = _this.getSlideItem(index);
          currentSlide_1.css("transform", transform);
          setTimeout(function() {
            currentSlide_1.addClass("lg-start-progress lg-start-end-progress").css("transition-duration", _this.settings.startAnimationDuration + "ms");
            _this.outer.addClass("lg-zoom-from-image");
          });
          setTimeout(function() {
            currentSlide_1.css("transform", "translate3d(0, 0, 0)");
          }, 100);
        }
        setTimeout(function() {
          _this.$backdrop.addClass("in");
          _this.$container.addClass("lg-show-in");
        }, 10);
        setTimeout(function() {
          if (_this.settings.trapFocus && document.body === _this.settings.container) {
            _this.trapFocus();
          }
        }, _this.settings.backdropDuration + 50);
        if (!_this.zoomFromOrigin || !transform) {
          setTimeout(function() {
            _this.outer.addClass("lg-visible");
          }, _this.settings.backdropDuration);
        }
        _this.slide(index, false, false, false);
        _this.LGel.trigger(lGEvents.afterOpen);
      });
      if (document.body === this.settings.container) {
        $LG("html").addClass("lg-on");
      }
    };
    LightGallery2.prototype.getMediaContainerPosition = function() {
      if (this.settings.allowMediaOverlap) {
        return {
          top: 0,
          bottom: 0
        };
      }
      var top = this.$toolbar.get().clientHeight || 0;
      var subHtml = this.outer.find(".lg-components .lg-sub-html").get();
      var captionHeight = this.settings.defaultCaptionHeight || subHtml && subHtml.clientHeight || 0;
      var thumbContainer = this.outer.find(".lg-thumb-outer").get();
      var thumbHeight = thumbContainer ? thumbContainer.clientHeight : 0;
      var bottom = thumbHeight + captionHeight;
      return {
        top,
        bottom
      };
    };
    LightGallery2.prototype.setMediaContainerPosition = function(top, bottom) {
      if (top === void 0) {
        top = 0;
      }
      if (bottom === void 0) {
        bottom = 0;
      }
      this.$content.css("top", top + "px").css("bottom", bottom + "px");
    };
    LightGallery2.prototype.hideBars = function() {
      var _this = this;
      setTimeout(function() {
        _this.outer.removeClass("lg-hide-items");
        if (_this.settings.hideBarsDelay > 0) {
          _this.outer.on("mousemove.lg click.lg touchstart.lg", function() {
            _this.outer.removeClass("lg-hide-items");
            clearTimeout(_this.hideBarTimeout);
            _this.hideBarTimeout = setTimeout(function() {
              _this.outer.addClass("lg-hide-items");
            }, _this.settings.hideBarsDelay);
          });
          _this.outer.trigger("mousemove.lg");
        }
      }, this.settings.showBarsAfter);
    };
    LightGallery2.prototype.initPictureFill = function($img) {
      if (this.settings.supportLegacyBrowser) {
        try {
          picturefill({
            elements: [$img.get()]
          });
        } catch (e) {
          console.warn("lightGallery :- If you want srcset or picture tag to be supported for older browser please include picturefil javascript library in your document.");
        }
      }
    };
    LightGallery2.prototype.counter = function() {
      if (this.settings.counter) {
        var counterHtml = '<div class="lg-counter" role="status" aria-live="polite">\n                <span id="' + this.getIdName("lg-counter-current") + '" class="lg-counter-current">' + (this.index + 1) + ' </span> /\n                <span id="' + this.getIdName("lg-counter-all") + '" class="lg-counter-all">' + this.galleryItems.length + " </span></div>";
        this.outer.find(this.settings.appendCounterTo).append(counterHtml);
      }
    };
    LightGallery2.prototype.addHtml = function(index) {
      var subHtml;
      var subHtmlUrl;
      if (this.galleryItems[index].subHtmlUrl) {
        subHtmlUrl = this.galleryItems[index].subHtmlUrl;
      } else {
        subHtml = this.galleryItems[index].subHtml;
      }
      if (!subHtmlUrl) {
        if (subHtml) {
          var fL = subHtml.substring(0, 1);
          if (fL === "." || fL === "#") {
            try {
              if (this.settings.subHtmlSelectorRelative && !this.settings.dynamic) {
                subHtml = $LG(this.items).eq(index).find(subHtml).first().html();
              } else {
                subHtml = $LG(subHtml).first().html();
              }
            } catch (error) {
              console.warn('Error processing subHtml selector "' + subHtml + '"');
              subHtml = "";
            }
          }
        } else {
          subHtml = "";
        }
      }
      if (this.settings.appendSubHtmlTo !== ".lg-item") {
        if (subHtmlUrl) {
          utils.fetchCaptionFromUrl(subHtmlUrl, this.outer.find(".lg-sub-html"), "replace");
        } else {
          this.outer.find(".lg-sub-html").html(subHtml);
        }
      } else {
        var currentSlide = $LG(this.getSlideItemId(index));
        if (subHtmlUrl) {
          utils.fetchCaptionFromUrl(subHtmlUrl, currentSlide, "append");
        } else {
          currentSlide.append('<div class="lg-sub-html">' + subHtml + "</div>");
        }
      }
      if (typeof subHtml !== "undefined" && subHtml !== null) {
        if (subHtml === "") {
          this.outer.find(this.settings.appendSubHtmlTo).addClass("lg-empty-html");
        } else {
          this.outer.find(this.settings.appendSubHtmlTo).removeClass("lg-empty-html");
        }
      }
      this.LGel.trigger(lGEvents.afterAppendSubHtml, {
        index
      });
    };
    LightGallery2.prototype.preload = function(index) {
      for (var i = 1; i <= this.settings.preload; i++) {
        if (i >= this.galleryItems.length - index) {
          break;
        }
        this.loadContent(index + i, false);
      }
      for (var j = 1; j <= this.settings.preload; j++) {
        if (index - j < 0) {
          break;
        }
        this.loadContent(index - j, false);
      }
    };
    LightGallery2.prototype.getDummyImgStyles = function(imageSize) {
      if (!imageSize)
        return "";
      return "width:" + imageSize.width + "px;\n                margin-left: -" + imageSize.width / 2 + "px;\n                margin-top: -" + imageSize.height / 2 + "px;\n                height:" + imageSize.height + "px";
    };
    LightGallery2.prototype.getVideoContStyle = function(imageSize) {
      if (!imageSize)
        return "";
      return "width:" + imageSize.width + "px;\n                height:" + imageSize.height + "px";
    };
    LightGallery2.prototype.getDummyImageContent = function($currentSlide, index, alt) {
      var $currentItem;
      if (!this.settings.dynamic) {
        $currentItem = $LG(this.items).eq(index);
      }
      if ($currentItem) {
        var _dummyImgSrc = void 0;
        if (!this.settings.exThumbImage) {
          _dummyImgSrc = $currentItem.find("img").first().attr("src");
        } else {
          _dummyImgSrc = $currentItem.attr(this.settings.exThumbImage);
        }
        if (!_dummyImgSrc)
          return "";
        var imgStyle = this.getDummyImgStyles(this.currentImageSize);
        var dummyImgContentImg = document.createElement("img");
        dummyImgContentImg.alt = alt || "";
        dummyImgContentImg.src = _dummyImgSrc;
        dummyImgContentImg.className = "lg-dummy-img";
        dummyImgContentImg.style.cssText = imgStyle;
        $currentSlide.addClass("lg-first-slide");
        this.outer.addClass("lg-first-slide-loading");
        return dummyImgContentImg;
      }
      return "";
    };
    LightGallery2.prototype.setImgMarkup = function(src, $currentSlide, index) {
      var currentGalleryItem = this.galleryItems[index];
      var alt = currentGalleryItem.alt, srcset = currentGalleryItem.srcset, sizes = currentGalleryItem.sizes, sources = currentGalleryItem.sources;
      var imgContent = "";
      var altAttr = alt ? 'alt="' + alt + '"' : "";
      if (this.isFirstSlideWithZoomAnimation()) {
        imgContent = this.getDummyImageContent($currentSlide, index, altAttr);
      } else {
        imgContent = utils.getImgMarkup(index, src, altAttr, srcset, sizes, sources);
      }
      var picture = document.createElement("picture");
      picture.className = "lg-img-wrap";
      $LG(picture).append(imgContent);
      $currentSlide.prepend(picture);
    };
    LightGallery2.prototype.onSlideObjectLoad = function($slide, isHTML5VideoWithoutPoster, onLoad2, onError) {
      var mediaObject = $slide.find(".lg-object").first();
      if (utils.isImageLoaded(mediaObject.get()) || isHTML5VideoWithoutPoster) {
        onLoad2();
      } else {
        mediaObject.on("load.lg error.lg", function() {
          onLoad2 && onLoad2();
        });
        mediaObject.on("error.lg", function() {
          onError && onError();
        });
      }
    };
    LightGallery2.prototype.onLgObjectLoad = function(currentSlide, index, delay, speed, isFirstSlide, isHTML5VideoWithoutPoster) {
      var _this = this;
      this.onSlideObjectLoad(currentSlide, isHTML5VideoWithoutPoster, function() {
        _this.triggerSlideItemLoad(currentSlide, index, delay, speed, isFirstSlide);
      }, function() {
        currentSlide.addClass("lg-complete lg-complete_");
        currentSlide.html('<span class="lg-error-msg">' + _this.settings.strings["mediaLoadingFailed"] + "</span>");
      });
    };
    LightGallery2.prototype.triggerSlideItemLoad = function($currentSlide, index, delay, speed, isFirstSlide) {
      var _this = this;
      var currentGalleryItem = this.galleryItems[index];
      var _speed = isFirstSlide && this.getSlideType(currentGalleryItem) === "video" && !currentGalleryItem.poster ? speed : 0;
      setTimeout(function() {
        $currentSlide.addClass("lg-complete lg-complete_");
        _this.LGel.trigger(lGEvents.slideItemLoad, {
          index,
          delay: delay || 0,
          isFirstSlide
        });
      }, _speed);
    };
    LightGallery2.prototype.isFirstSlideWithZoomAnimation = function() {
      return !!(!this.lGalleryOn && this.zoomFromOrigin && this.currentImageSize);
    };
    LightGallery2.prototype.addSlideVideoInfo = function(items) {
      var _this = this;
      items.forEach(function(element, index) {
        element.__slideVideoInfo = utils.isVideo(element.src, !!element.video, index);
        if (element.__slideVideoInfo && _this.settings.loadYouTubePoster && !element.poster && element.__slideVideoInfo.youtube) {
          element.poster = "//img.youtube.com/vi/" + element.__slideVideoInfo.youtube[1] + "/maxresdefault.jpg";
        }
      });
    };
    LightGallery2.prototype.loadContent = function(index, rec) {
      var _this = this;
      var currentGalleryItem = this.galleryItems[index];
      var $currentSlide = $LG(this.getSlideItemId(index));
      var poster = currentGalleryItem.poster, srcset = currentGalleryItem.srcset, sizes = currentGalleryItem.sizes, sources = currentGalleryItem.sources;
      var src = currentGalleryItem.src;
      var video = currentGalleryItem.video;
      var _html5Video = video && typeof video === "string" ? JSON.parse(video) : video;
      if (currentGalleryItem.responsive) {
        var srcDyItms = currentGalleryItem.responsive.split(",");
        src = utils.getResponsiveSrc(srcDyItms) || src;
      }
      var videoInfo = currentGalleryItem.__slideVideoInfo;
      var lgVideoStyle = "";
      var iframe = !!currentGalleryItem.iframe;
      var isFirstSlide = !this.lGalleryOn;
      var delay = 0;
      if (isFirstSlide) {
        if (this.zoomFromOrigin && this.currentImageSize) {
          delay = this.settings.startAnimationDuration + 10;
        } else {
          delay = this.settings.backdropDuration + 10;
        }
      }
      if (!$currentSlide.hasClass("lg-loaded")) {
        if (videoInfo) {
          var _a = this.mediaContainerPosition, top_2 = _a.top, bottom = _a.bottom;
          var videoSize = utils.getSize(this.items[index], this.outer, top_2 + bottom, videoInfo && this.settings.videoMaxSize);
          lgVideoStyle = this.getVideoContStyle(videoSize);
        }
        if (iframe) {
          var markup = utils.getIframeMarkup(this.settings.iframeWidth, this.settings.iframeHeight, this.settings.iframeMaxWidth, this.settings.iframeMaxHeight, src, currentGalleryItem.iframeTitle);
          $currentSlide.prepend(markup);
        } else if (poster) {
          var dummyImg = "";
          var hasStartAnimation = isFirstSlide && this.zoomFromOrigin && this.currentImageSize;
          if (hasStartAnimation) {
            dummyImg = this.getDummyImageContent($currentSlide, index, "");
          }
          var markup = utils.getVideoPosterMarkup(poster, dummyImg || "", lgVideoStyle, this.settings.strings["playVideo"], videoInfo);
          $currentSlide.prepend(markup);
        } else if (videoInfo) {
          var markup = '<div class="lg-video-cont " style="' + lgVideoStyle + '"></div>';
          $currentSlide.prepend(markup);
        } else {
          this.setImgMarkup(src, $currentSlide, index);
          if (srcset || sources) {
            var $img = $currentSlide.find(".lg-object");
            this.initPictureFill($img);
          }
        }
        if (poster || videoInfo) {
          this.LGel.trigger(lGEvents.hasVideo, {
            index,
            src,
            html5Video: _html5Video,
            hasPoster: !!poster
          });
        }
        this.LGel.trigger(lGEvents.afterAppendSlide, { index });
        if (this.lGalleryOn && this.settings.appendSubHtmlTo === ".lg-item") {
          this.addHtml(index);
        }
      }
      var _speed = 0;
      if (delay && !$LG(document.body).hasClass("lg-from-hash")) {
        _speed = delay;
      }
      if (this.isFirstSlideWithZoomAnimation()) {
        setTimeout(function() {
          $currentSlide.removeClass("lg-start-end-progress lg-start-progress").removeAttr("style");
        }, this.settings.startAnimationDuration + 100);
        if (!$currentSlide.hasClass("lg-loaded")) {
          setTimeout(function() {
            if (_this.getSlideType(currentGalleryItem) === "image") {
              var alt = currentGalleryItem.alt;
              var altAttr = alt ? 'alt="' + alt + '"' : "";
              $currentSlide.find(".lg-img-wrap").append(utils.getImgMarkup(index, src, altAttr, srcset, sizes, currentGalleryItem.sources));
              if (srcset || sources) {
                var $img2 = $currentSlide.find(".lg-object");
                _this.initPictureFill($img2);
              }
            }
            if (_this.getSlideType(currentGalleryItem) === "image" || _this.getSlideType(currentGalleryItem) === "video" && poster) {
              _this.onLgObjectLoad($currentSlide, index, delay, _speed, true, false);
              _this.onSlideObjectLoad($currentSlide, !!(videoInfo && videoInfo.html5 && !poster), function() {
                _this.loadContentOnFirstSlideLoad(index, $currentSlide, _speed);
              }, function() {
                _this.loadContentOnFirstSlideLoad(index, $currentSlide, _speed);
              });
            }
          }, this.settings.startAnimationDuration + 100);
        }
      }
      $currentSlide.addClass("lg-loaded");
      if (!this.isFirstSlideWithZoomAnimation() || this.getSlideType(currentGalleryItem) === "video" && !poster) {
        this.onLgObjectLoad($currentSlide, index, delay, _speed, isFirstSlide, !!(videoInfo && videoInfo.html5 && !poster));
      }
      if ((!this.zoomFromOrigin || !this.currentImageSize) && $currentSlide.hasClass("lg-complete_") && !this.lGalleryOn) {
        setTimeout(function() {
          $currentSlide.addClass("lg-complete");
        }, this.settings.backdropDuration);
      }
      this.lGalleryOn = true;
      if (rec === true) {
        if (!$currentSlide.hasClass("lg-complete_")) {
          $currentSlide.find(".lg-object").first().on("load.lg error.lg", function() {
            _this.preload(index);
          });
        } else {
          this.preload(index);
        }
      }
    };
    LightGallery2.prototype.loadContentOnFirstSlideLoad = function(index, $currentSlide, speed) {
      var _this = this;
      setTimeout(function() {
        $currentSlide.find(".lg-dummy-img").remove();
        $currentSlide.removeClass("lg-first-slide");
        _this.outer.removeClass("lg-first-slide-loading");
        _this.isDummyImageRemoved = true;
        _this.preload(index);
      }, speed + 300);
    };
    LightGallery2.prototype.getItemsToBeInsertedToDom = function(index, prevIndex, numberOfItems) {
      var _this = this;
      if (numberOfItems === void 0) {
        numberOfItems = 0;
      }
      var itemsToBeInsertedToDom = [];
      var possibleNumberOfItems = Math.max(numberOfItems, 3);
      possibleNumberOfItems = Math.min(possibleNumberOfItems, this.galleryItems.length);
      var prevIndexItem = "lg-item-" + this.lgId + "-" + prevIndex;
      if (this.galleryItems.length <= 3) {
        this.galleryItems.forEach(function(_element, index2) {
          itemsToBeInsertedToDom.push("lg-item-" + _this.lgId + "-" + index2);
        });
        return itemsToBeInsertedToDom;
      }
      if (index < (this.galleryItems.length - 1) / 2) {
        for (var idx = index; idx > index - possibleNumberOfItems / 2 && idx >= 0; idx--) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + idx);
        }
        var numberOfExistingItems = itemsToBeInsertedToDom.length;
        for (var idx = 0; idx < possibleNumberOfItems - numberOfExistingItems; idx++) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (index + idx + 1));
        }
      } else {
        for (var idx = index; idx <= this.galleryItems.length - 1 && idx < index + possibleNumberOfItems / 2; idx++) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + idx);
        }
        var numberOfExistingItems = itemsToBeInsertedToDom.length;
        for (var idx = 0; idx < possibleNumberOfItems - numberOfExistingItems; idx++) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (index - idx - 1));
        }
      }
      if (this.settings.loop) {
        if (index === this.galleryItems.length - 1) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-0");
        } else if (index === 0) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (this.galleryItems.length - 1));
        }
      }
      if (itemsToBeInsertedToDom.indexOf(prevIndexItem) === -1) {
        itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + prevIndex);
      }
      return itemsToBeInsertedToDom;
    };
    LightGallery2.prototype.organizeSlideItems = function(index, prevIndex) {
      var _this = this;
      var itemsToBeInsertedToDom = this.getItemsToBeInsertedToDom(index, prevIndex, this.settings.numberOfSlideItemsInDom);
      itemsToBeInsertedToDom.forEach(function(item) {
        if (_this.currentItemsInDom.indexOf(item) === -1) {
          _this.$inner.append('<div id="' + item + '" class="lg-item"></div>');
        }
      });
      this.currentItemsInDom.forEach(function(item) {
        if (itemsToBeInsertedToDom.indexOf(item) === -1) {
          $LG("#" + item).remove();
        }
      });
      return itemsToBeInsertedToDom;
    };
    LightGallery2.prototype.getPreviousSlideIndex = function() {
      var prevIndex = 0;
      try {
        var currentItemId = this.outer.find(".lg-current").first().attr("id");
        prevIndex = parseInt(currentItemId.split("-")[3]) || 0;
      } catch (error) {
        prevIndex = 0;
      }
      return prevIndex;
    };
    LightGallery2.prototype.setDownloadValue = function(index) {
      if (this.settings.download) {
        var currentGalleryItem = this.galleryItems[index];
        var hideDownloadBtn = currentGalleryItem.downloadUrl === false || currentGalleryItem.downloadUrl === "false";
        if (hideDownloadBtn) {
          this.outer.addClass("lg-hide-download");
        } else {
          var $download = this.getElementById("lg-download");
          this.outer.removeClass("lg-hide-download");
          $download.attr("href", currentGalleryItem.downloadUrl || currentGalleryItem.src);
          if (currentGalleryItem.download) {
            $download.attr("download", currentGalleryItem.download);
          }
        }
      }
    };
    LightGallery2.prototype.makeSlideAnimation = function(direction, currentSlideItem, previousSlideItem) {
      var _this = this;
      if (this.lGalleryOn) {
        previousSlideItem.addClass("lg-slide-progress");
      }
      setTimeout(function() {
        _this.outer.addClass("lg-no-trans");
        _this.outer.find(".lg-item").removeClass("lg-prev-slide lg-next-slide");
        if (direction === "prev") {
          currentSlideItem.addClass("lg-prev-slide");
          previousSlideItem.addClass("lg-next-slide");
        } else {
          currentSlideItem.addClass("lg-next-slide");
          previousSlideItem.addClass("lg-prev-slide");
        }
        setTimeout(function() {
          _this.outer.find(".lg-item").removeClass("lg-current");
          currentSlideItem.addClass("lg-current");
          _this.outer.removeClass("lg-no-trans");
        }, 50);
      }, this.lGalleryOn ? this.settings.slideDelay : 0);
    };
    LightGallery2.prototype.slide = function(index, fromTouch, fromThumb, direction) {
      var _this = this;
      var prevIndex = this.getPreviousSlideIndex();
      this.currentItemsInDom = this.organizeSlideItems(index, prevIndex);
      if (this.lGalleryOn && prevIndex === index) {
        return;
      }
      var numberOfGalleryItems = this.galleryItems.length;
      if (!this.lgBusy) {
        if (this.settings.counter) {
          this.updateCurrentCounter(index);
        }
        var currentSlideItem = this.getSlideItem(index);
        var previousSlideItem_1 = this.getSlideItem(prevIndex);
        var currentGalleryItem = this.galleryItems[index];
        var videoInfo = currentGalleryItem.__slideVideoInfo;
        this.outer.attr("data-lg-slide-type", this.getSlideType(currentGalleryItem));
        this.setDownloadValue(index);
        if (videoInfo) {
          var _a = this.mediaContainerPosition, top_3 = _a.top, bottom = _a.bottom;
          var videoSize = utils.getSize(this.items[index], this.outer, top_3 + bottom, videoInfo && this.settings.videoMaxSize);
          this.resizeVideoSlide(index, videoSize);
        }
        this.LGel.trigger(lGEvents.beforeSlide, {
          prevIndex,
          index,
          fromTouch: !!fromTouch,
          fromThumb: !!fromThumb
        });
        this.lgBusy = true;
        clearTimeout(this.hideBarTimeout);
        this.arrowDisable(index);
        if (!direction) {
          if (index < prevIndex) {
            direction = "prev";
          } else if (index > prevIndex) {
            direction = "next";
          }
        }
        if (!fromTouch) {
          this.makeSlideAnimation(direction, currentSlideItem, previousSlideItem_1);
        } else {
          this.outer.find(".lg-item").removeClass("lg-prev-slide lg-current lg-next-slide");
          var touchPrev = void 0;
          var touchNext = void 0;
          if (numberOfGalleryItems > 2) {
            touchPrev = index - 1;
            touchNext = index + 1;
            if (index === 0 && prevIndex === numberOfGalleryItems - 1) {
              touchNext = 0;
              touchPrev = numberOfGalleryItems - 1;
            } else if (index === numberOfGalleryItems - 1 && prevIndex === 0) {
              touchNext = 0;
              touchPrev = numberOfGalleryItems - 1;
            }
          } else {
            touchPrev = 0;
            touchNext = 1;
          }
          if (direction === "prev") {
            this.getSlideItem(touchNext).addClass("lg-next-slide");
          } else {
            this.getSlideItem(touchPrev).addClass("lg-prev-slide");
          }
          currentSlideItem.addClass("lg-current");
        }
        if (!this.lGalleryOn) {
          this.loadContent(index, true);
        } else {
          setTimeout(function() {
            _this.loadContent(index, true);
            if (_this.settings.appendSubHtmlTo !== ".lg-item") {
              _this.addHtml(index);
            }
          }, this.settings.speed + 50 + (fromTouch ? 0 : this.settings.slideDelay));
        }
        setTimeout(function() {
          _this.lgBusy = false;
          previousSlideItem_1.removeClass("lg-slide-progress");
          _this.LGel.trigger(lGEvents.afterSlide, {
            prevIndex,
            index,
            fromTouch,
            fromThumb
          });
        }, (this.lGalleryOn ? this.settings.speed + 100 : 100) + (fromTouch ? 0 : this.settings.slideDelay));
      }
      this.index = index;
    };
    LightGallery2.prototype.updateCurrentCounter = function(index) {
      this.getElementById("lg-counter-current").html(index + 1 + "");
    };
    LightGallery2.prototype.updateCounterTotal = function() {
      this.getElementById("lg-counter-all").html(this.galleryItems.length + "");
    };
    LightGallery2.prototype.getSlideType = function(item) {
      if (item.__slideVideoInfo) {
        return "video";
      } else if (item.iframe) {
        return "iframe";
      } else {
        return "image";
      }
    };
    LightGallery2.prototype.touchMove = function(startCoords, endCoords, e) {
      var distanceX = endCoords.pageX - startCoords.pageX;
      var distanceY = endCoords.pageY - startCoords.pageY;
      var allowSwipe = false;
      if (this.swipeDirection) {
        allowSwipe = true;
      } else {
        if (Math.abs(distanceX) > 15) {
          this.swipeDirection = "horizontal";
          allowSwipe = true;
        } else if (Math.abs(distanceY) > 15) {
          this.swipeDirection = "vertical";
          allowSwipe = true;
        }
      }
      if (!allowSwipe) {
        return;
      }
      var $currentSlide = this.getSlideItem(this.index);
      if (this.swipeDirection === "horizontal") {
        e === null || e === void 0 ? void 0 : e.preventDefault();
        this.outer.addClass("lg-dragging");
        this.setTranslate($currentSlide, distanceX, 0);
        var width = $currentSlide.get().offsetWidth;
        var slideWidthAmount = width * 15 / 100;
        var gutter = slideWidthAmount - Math.abs(distanceX * 10 / 100);
        this.setTranslate(this.outer.find(".lg-prev-slide").first(), -width + distanceX - gutter, 0);
        this.setTranslate(this.outer.find(".lg-next-slide").first(), width + distanceX + gutter, 0);
      } else if (this.swipeDirection === "vertical") {
        if (this.settings.swipeToClose) {
          e === null || e === void 0 ? void 0 : e.preventDefault();
          this.$container.addClass("lg-dragging-vertical");
          var opacity = 1 - Math.abs(distanceY) / window.innerHeight;
          this.$backdrop.css("opacity", opacity);
          var scale = 1 - Math.abs(distanceY) / (window.innerWidth * 2);
          this.setTranslate($currentSlide, 0, distanceY, scale, scale);
          if (Math.abs(distanceY) > 100) {
            this.outer.addClass("lg-hide-items").removeClass("lg-components-open");
          }
        }
      }
    };
    LightGallery2.prototype.touchEnd = function(endCoords, startCoords, event) {
      var _this = this;
      var distance;
      if (this.settings.mode !== "lg-slide") {
        this.outer.addClass("lg-slide");
      }
      setTimeout(function() {
        _this.$container.removeClass("lg-dragging-vertical");
        _this.outer.removeClass("lg-dragging lg-hide-items").addClass("lg-components-open");
        var triggerClick = true;
        if (_this.swipeDirection === "horizontal") {
          distance = endCoords.pageX - startCoords.pageX;
          var distanceAbs = Math.abs(endCoords.pageX - startCoords.pageX);
          if (distance < 0 && distanceAbs > _this.settings.swipeThreshold) {
            _this.goToNextSlide(true);
            triggerClick = false;
          } else if (distance > 0 && distanceAbs > _this.settings.swipeThreshold) {
            _this.goToPrevSlide(true);
            triggerClick = false;
          }
        } else if (_this.swipeDirection === "vertical") {
          distance = Math.abs(endCoords.pageY - startCoords.pageY);
          if (_this.settings.closable && _this.settings.swipeToClose && distance > 100) {
            _this.closeGallery();
            return;
          } else {
            _this.$backdrop.css("opacity", 1);
          }
        }
        _this.outer.find(".lg-item").removeAttr("style");
        if (triggerClick && Math.abs(endCoords.pageX - startCoords.pageX) < 5) {
          var target = $LG(event.target);
          if (_this.isPosterElement(target)) {
            _this.LGel.trigger(lGEvents.posterClick);
          }
        }
        _this.swipeDirection = void 0;
      });
      setTimeout(function() {
        if (!_this.outer.hasClass("lg-dragging") && _this.settings.mode !== "lg-slide") {
          _this.outer.removeClass("lg-slide");
        }
      }, this.settings.speed + 100);
    };
    LightGallery2.prototype.enableSwipe = function() {
      var _this = this;
      var startCoords = {};
      var endCoords = {};
      var isMoved = false;
      var isSwiping = false;
      if (this.settings.enableSwipe) {
        this.$inner.on("touchstart.lg", function(e) {
          _this.dragOrSwipeEnabled = true;
          var $item = _this.getSlideItem(_this.index);
          if (($LG(e.target).hasClass("lg-item") || $item.get().contains(e.target)) && !_this.outer.hasClass("lg-zoomed") && !_this.lgBusy && e.touches.length === 1) {
            isSwiping = true;
            _this.touchAction = "swipe";
            _this.manageSwipeClass();
            startCoords = {
              pageX: e.touches[0].pageX,
              pageY: e.touches[0].pageY
            };
          }
        });
        this.$inner.on("touchmove.lg", function(e) {
          if (isSwiping && _this.touchAction === "swipe" && e.touches.length === 1) {
            endCoords = {
              pageX: e.touches[0].pageX,
              pageY: e.touches[0].pageY
            };
            _this.touchMove(startCoords, endCoords, e);
            isMoved = true;
          }
        });
        this.$inner.on("touchend.lg", function(event) {
          if (_this.touchAction === "swipe") {
            if (isMoved) {
              isMoved = false;
              _this.touchEnd(endCoords, startCoords, event);
            } else if (isSwiping) {
              var target = $LG(event.target);
              if (_this.isPosterElement(target)) {
                _this.LGel.trigger(lGEvents.posterClick);
              }
            }
            _this.touchAction = void 0;
            isSwiping = false;
          }
        });
      }
    };
    LightGallery2.prototype.enableDrag = function() {
      var _this = this;
      var startCoords = {};
      var endCoords = {};
      var isDraging = false;
      var isMoved = false;
      if (this.settings.enableDrag) {
        this.outer.on("mousedown.lg", function(e) {
          _this.dragOrSwipeEnabled = true;
          var $item = _this.getSlideItem(_this.index);
          if ($LG(e.target).hasClass("lg-item") || $item.get().contains(e.target)) {
            if (!_this.outer.hasClass("lg-zoomed") && !_this.lgBusy) {
              e.preventDefault();
              if (!_this.lgBusy) {
                _this.manageSwipeClass();
                startCoords = {
                  pageX: e.pageX,
                  pageY: e.pageY
                };
                isDraging = true;
                _this.outer.get().scrollLeft += 1;
                _this.outer.get().scrollLeft -= 1;
                _this.outer.removeClass("lg-grab").addClass("lg-grabbing");
                _this.LGel.trigger(lGEvents.dragStart);
              }
            }
          }
        });
        $LG(window).on("mousemove.lg.global" + this.lgId, function(e) {
          if (isDraging && _this.lgOpened) {
            isMoved = true;
            endCoords = {
              pageX: e.pageX,
              pageY: e.pageY
            };
            _this.touchMove(startCoords, endCoords);
            _this.LGel.trigger(lGEvents.dragMove);
          }
        });
        $LG(window).on("mouseup.lg.global" + this.lgId, function(event) {
          if (!_this.lgOpened) {
            return;
          }
          var target = $LG(event.target);
          if (isMoved) {
            isMoved = false;
            _this.touchEnd(endCoords, startCoords, event);
            _this.LGel.trigger(lGEvents.dragEnd);
          } else if (_this.isPosterElement(target)) {
            _this.LGel.trigger(lGEvents.posterClick);
          }
          if (isDraging) {
            isDraging = false;
            _this.outer.removeClass("lg-grabbing").addClass("lg-grab");
          }
        });
      }
    };
    LightGallery2.prototype.triggerPosterClick = function() {
      var _this = this;
      this.$inner.on("click.lg", function(event) {
        if (!_this.dragOrSwipeEnabled && _this.isPosterElement($LG(event.target))) {
          _this.LGel.trigger(lGEvents.posterClick);
        }
      });
    };
    LightGallery2.prototype.manageSwipeClass = function() {
      var _touchNext = this.index + 1;
      var _touchPrev = this.index - 1;
      if (this.settings.loop && this.galleryItems.length > 2) {
        if (this.index === 0) {
          _touchPrev = this.galleryItems.length - 1;
        } else if (this.index === this.galleryItems.length - 1) {
          _touchNext = 0;
        }
      }
      this.outer.find(".lg-item").removeClass("lg-next-slide lg-prev-slide");
      if (_touchPrev > -1) {
        this.getSlideItem(_touchPrev).addClass("lg-prev-slide");
      }
      this.getSlideItem(_touchNext).addClass("lg-next-slide");
    };
    LightGallery2.prototype.goToNextSlide = function(fromTouch) {
      var _this = this;
      var _loop = this.settings.loop;
      if (fromTouch && this.galleryItems.length < 3) {
        _loop = false;
      }
      if (!this.lgBusy) {
        if (this.index + 1 < this.galleryItems.length) {
          this.index++;
          this.LGel.trigger(lGEvents.beforeNextSlide, {
            index: this.index
          });
          this.slide(this.index, !!fromTouch, false, "next");
        } else {
          if (_loop) {
            this.index = 0;
            this.LGel.trigger(lGEvents.beforeNextSlide, {
              index: this.index
            });
            this.slide(this.index, !!fromTouch, false, "next");
          } else if (this.settings.slideEndAnimation && !fromTouch) {
            this.outer.addClass("lg-right-end");
            setTimeout(function() {
              _this.outer.removeClass("lg-right-end");
            }, 400);
          }
        }
      }
    };
    LightGallery2.prototype.goToPrevSlide = function(fromTouch) {
      var _this = this;
      var _loop = this.settings.loop;
      if (fromTouch && this.galleryItems.length < 3) {
        _loop = false;
      }
      if (!this.lgBusy) {
        if (this.index > 0) {
          this.index--;
          this.LGel.trigger(lGEvents.beforePrevSlide, {
            index: this.index,
            fromTouch
          });
          this.slide(this.index, !!fromTouch, false, "prev");
        } else {
          if (_loop) {
            this.index = this.galleryItems.length - 1;
            this.LGel.trigger(lGEvents.beforePrevSlide, {
              index: this.index,
              fromTouch
            });
            this.slide(this.index, !!fromTouch, false, "prev");
          } else if (this.settings.slideEndAnimation && !fromTouch) {
            this.outer.addClass("lg-left-end");
            setTimeout(function() {
              _this.outer.removeClass("lg-left-end");
            }, 400);
          }
        }
      }
    };
    LightGallery2.prototype.keyPress = function() {
      var _this = this;
      $LG(window).on("keydown.lg.global" + this.lgId, function(e) {
        if (_this.lgOpened && _this.settings.escKey === true && e.keyCode === 27) {
          e.preventDefault();
          if (_this.settings.allowMediaOverlap && _this.outer.hasClass("lg-can-toggle") && _this.outer.hasClass("lg-components-open")) {
            _this.outer.removeClass("lg-components-open");
          } else {
            _this.closeGallery();
          }
        }
        if (_this.lgOpened && _this.galleryItems.length > 1) {
          if (e.keyCode === 37) {
            e.preventDefault();
            _this.goToPrevSlide();
          }
          if (e.keyCode === 39) {
            e.preventDefault();
            _this.goToNextSlide();
          }
        }
      });
    };
    LightGallery2.prototype.arrow = function() {
      var _this = this;
      this.getElementById("lg-prev").on("click.lg", function() {
        _this.goToPrevSlide();
      });
      this.getElementById("lg-next").on("click.lg", function() {
        _this.goToNextSlide();
      });
    };
    LightGallery2.prototype.arrowDisable = function(index) {
      if (!this.settings.loop && this.settings.hideControlOnEnd) {
        var $prev = this.getElementById("lg-prev");
        var $next = this.getElementById("lg-next");
        if (index + 1 === this.galleryItems.length) {
          $next.attr("disabled", "disabled").addClass("disabled");
        } else {
          $next.removeAttr("disabled").removeClass("disabled");
        }
        if (index === 0) {
          $prev.attr("disabled", "disabled").addClass("disabled");
        } else {
          $prev.removeAttr("disabled").removeClass("disabled");
        }
      }
    };
    LightGallery2.prototype.setTranslate = function($el, xValue, yValue, scaleX, scaleY) {
      if (scaleX === void 0) {
        scaleX = 1;
      }
      if (scaleY === void 0) {
        scaleY = 1;
      }
      $el.css("transform", "translate3d(" + xValue + "px, " + yValue + "px, 0px) scale3d(" + scaleX + ", " + scaleY + ", 1)");
    };
    LightGallery2.prototype.mousewheel = function() {
      var _this = this;
      var lastCall = 0;
      this.outer.on("wheel.lg", function(e) {
        if (!e.deltaY || _this.galleryItems.length < 2) {
          return;
        }
        e.preventDefault();
        var now2 = (/* @__PURE__ */ new Date()).getTime();
        if (now2 - lastCall < 1e3) {
          return;
        }
        lastCall = now2;
        if (e.deltaY > 0) {
          _this.goToNextSlide();
        } else if (e.deltaY < 0) {
          _this.goToPrevSlide();
        }
      });
    };
    LightGallery2.prototype.isSlideElement = function(target) {
      return target.hasClass("lg-outer") || target.hasClass("lg-item") || target.hasClass("lg-img-wrap") || target.hasClass("lg-img-rotate");
    };
    LightGallery2.prototype.isPosterElement = function(target) {
      var playButton = this.getSlideItem(this.index).find(".lg-video-play-button").get();
      return target.hasClass("lg-video-poster") || target.hasClass("lg-video-play-button") || playButton && playButton.contains(target.get());
    };
    LightGallery2.prototype.toggleMaximize = function() {
      var _this = this;
      this.getElementById("lg-maximize").on("click.lg", function() {
        _this.$container.toggleClass("lg-inline");
        _this.refreshOnResize();
      });
    };
    LightGallery2.prototype.invalidateItems = function() {
      for (var index = 0; index < this.items.length; index++) {
        var element = this.items[index];
        var $element = $LG(element);
        $element.off("click.lgcustom-item-" + $element.attr("data-lg-id"));
      }
    };
    LightGallery2.prototype.trapFocus = function() {
      var _this = this;
      this.$container.get().focus({
        preventScroll: true
      });
      $LG(window).on("keydown.lg.global" + this.lgId, function(e) {
        if (!_this.lgOpened) {
          return;
        }
        var isTabPressed = e.key === "Tab" || e.keyCode === 9;
        if (!isTabPressed) {
          return;
        }
        var focusableEls = utils.getFocusableElements(_this.$container.get());
        var firstFocusableEl = focusableEls[0];
        var lastFocusableEl = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      });
    };
    LightGallery2.prototype.manageCloseGallery = function() {
      var _this = this;
      if (!this.settings.closable)
        return;
      var mousedown = false;
      this.getElementById("lg-close").on("click.lg", function() {
        _this.closeGallery();
      });
      if (this.settings.closeOnTap) {
        this.outer.on("mousedown.lg", function(e) {
          var target = $LG(e.target);
          if (_this.isSlideElement(target)) {
            mousedown = true;
          } else {
            mousedown = false;
          }
        });
        this.outer.on("mousemove.lg", function() {
          mousedown = false;
        });
        this.outer.on("mouseup.lg", function(e) {
          var target = $LG(e.target);
          if (_this.isSlideElement(target) && mousedown) {
            if (!_this.outer.hasClass("lg-dragging")) {
              _this.closeGallery();
            }
          }
        });
      }
    };
    LightGallery2.prototype.closeGallery = function(force) {
      var _this = this;
      if (!this.lgOpened || !this.settings.closable && !force) {
        return 0;
      }
      this.LGel.trigger(lGEvents.beforeClose);
      if (this.settings.resetScrollPosition && !this.settings.hideScrollbar) {
        $LG(window).scrollTop(this.prevScrollTop);
      }
      var currentItem = this.items[this.index];
      var transform;
      if (this.zoomFromOrigin && currentItem) {
        var _a = this.mediaContainerPosition, top_4 = _a.top, bottom = _a.bottom;
        var _b = this.galleryItems[this.index], __slideVideoInfo = _b.__slideVideoInfo, poster = _b.poster;
        var imageSize = utils.getSize(currentItem, this.outer, top_4 + bottom, __slideVideoInfo && poster && this.settings.videoMaxSize);
        transform = utils.getTransform(currentItem, this.outer, top_4, bottom, imageSize);
      }
      if (this.zoomFromOrigin && transform) {
        this.outer.addClass("lg-closing lg-zoom-from-image");
        this.getSlideItem(this.index).addClass("lg-start-end-progress").css("transition-duration", this.settings.startAnimationDuration + "ms").css("transform", transform);
      } else {
        this.outer.addClass("lg-hide-items");
        this.outer.removeClass("lg-zoom-from-image");
      }
      this.destroyModules();
      this.lGalleryOn = false;
      this.isDummyImageRemoved = false;
      this.zoomFromOrigin = this.settings.zoomFromOrigin;
      clearTimeout(this.hideBarTimeout);
      this.hideBarTimeout = false;
      $LG("html").removeClass("lg-on");
      this.outer.removeClass("lg-visible lg-components-open");
      this.$backdrop.removeClass("in").css("opacity", 0);
      var removeTimeout = this.zoomFromOrigin && transform ? Math.max(this.settings.startAnimationDuration, this.settings.backdropDuration) : this.settings.backdropDuration;
      this.$container.removeClass("lg-show-in");
      setTimeout(function() {
        if (_this.zoomFromOrigin && transform) {
          _this.outer.removeClass("lg-zoom-from-image");
        }
        _this.$container.removeClass("lg-show");
        _this.resetScrollBar();
        _this.$backdrop.removeAttr("style").css("transition-duration", _this.settings.backdropDuration + "ms");
        _this.outer.removeClass("lg-closing " + _this.settings.startClass);
        _this.getSlideItem(_this.index).removeClass("lg-start-end-progress");
        _this.$inner.empty();
        if (_this.lgOpened) {
          _this.LGel.trigger(lGEvents.afterClose, {
            instance: _this
          });
        }
        if (_this.$container.get()) {
          _this.$container.get().blur();
        }
        _this.lgOpened = false;
      }, removeTimeout + 100);
      return removeTimeout + 100;
    };
    LightGallery2.prototype.initModules = function() {
      this.plugins.forEach(function(module) {
        try {
          module.init();
        } catch (err) {
          console.warn("lightGallery:- make sure lightGallery module is properly initiated");
        }
      });
    };
    LightGallery2.prototype.destroyModules = function(destroy) {
      this.plugins.forEach(function(module) {
        try {
          if (destroy) {
            module.destroy();
          } else {
            module.closeGallery && module.closeGallery();
          }
        } catch (err) {
          console.warn("lightGallery:- make sure lightGallery module is properly destroyed");
        }
      });
    };
    LightGallery2.prototype.refresh = function(galleryItems) {
      if (!this.settings.dynamic) {
        this.invalidateItems();
      }
      if (galleryItems) {
        this.galleryItems = galleryItems;
      } else {
        this.galleryItems = this.getItems();
      }
      this.updateControls();
      this.openGalleryOnItemClick();
      this.LGel.trigger(lGEvents.updateSlides);
    };
    LightGallery2.prototype.updateControls = function() {
      this.addSlideVideoInfo(this.galleryItems);
      this.updateCounterTotal();
      this.manageSingleSlideClassName();
    };
    LightGallery2.prototype.destroyGallery = function() {
      this.destroyModules(true);
      if (!this.settings.dynamic) {
        this.invalidateItems();
      }
      $LG(window).off(".lg.global" + this.lgId);
      this.LGel.off(".lg");
      this.$container.remove();
    };
    LightGallery2.prototype.destroy = function() {
      var closeTimeout = this.closeGallery(true);
      if (closeTimeout) {
        setTimeout(this.destroyGallery.bind(this), closeTimeout);
      } else {
        this.destroyGallery();
      }
      return closeTimeout;
    };
    return LightGallery2;
  })()
);
function lightGallery(el, options) {
  return new LightGallery(el, options);
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lgThumbnail_min$1 = { exports: {} };
/**
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
var lgThumbnail_min = lgThumbnail_min$1.exports;
var hasRequiredLgThumbnail_min;
function requireLgThumbnail_min() {
  if (hasRequiredLgThumbnail_min) return lgThumbnail_min$1.exports;
  hasRequiredLgThumbnail_min = 1;
  (function(module, exports) {
    !(function(t, e) {
      module.exports = e();
    })(lgThumbnail_min, (function() {
      var t = function() {
        return (t = Object.assign || function(t2) {
          for (var e2, i2 = 1, s2 = arguments.length; i2 < s2; i2++) for (var h2 in e2 = arguments[i2]) Object.prototype.hasOwnProperty.call(e2, h2) && (t2[h2] = e2[h2]);
          return t2;
        }).apply(this, arguments);
      }, e = { thumbnail: true, animateThumb: true, currentPagerPosition: "middle", alignThumbnails: "middle", thumbWidth: 100, thumbHeight: "80px", thumbMargin: 5, appendThumbnailsTo: ".lg-components", toggleThumb: false, enableThumbDrag: true, enableThumbSwipe: true, thumbnailSwipeThreshold: 10, loadYouTubeThumbnail: true, youTubeThumbSize: 1, thumbnailPluginStrings: { toggleThumbnails: "Toggle thumbnails" } }, i = "lgContainerResize", s = "lgUpdateSlides", h = "lgBeforeOpen", n = "lgBeforeSlide";
      return (function() {
        function o(t2, e2) {
          return this.thumbOuterWidth = 0, this.thumbTotalWidth = 0, this.translateX = 0, this.thumbClickable = false, this.core = t2, this.$LG = e2, this;
        }
        return o.prototype.init = function() {
          this.settings = t(t({}, e), this.core.settings), this.thumbOuterWidth = 0, this.thumbTotalWidth = this.core.galleryItems.length * (this.settings.thumbWidth + this.settings.thumbMargin), this.translateX = 0, this.setAnimateThumbStyles(), this.core.settings.allowMediaOverlap || (this.settings.toggleThumb = false), this.settings.thumbnail && (this.build(), this.settings.animateThumb ? (this.settings.enableThumbDrag && this.enableThumbDrag(), this.settings.enableThumbSwipe && this.enableThumbSwipe(), this.thumbClickable = false) : this.thumbClickable = true, this.toggleThumbBar(), this.thumbKeyPress());
        }, o.prototype.build = function() {
          var t2 = this;
          this.setThumbMarkup(), this.manageActiveClassOnSlideChange(), this.$lgThumb.first().on("click.lg touchend.lg", (function(e2) {
            var i2 = t2.$LG(e2.target);
            i2.hasAttribute("data-lg-item-id") && setTimeout((function() {
              if (t2.thumbClickable && !t2.core.lgBusy) {
                var e3 = parseInt(i2.attr("data-lg-item-id"));
                t2.core.slide(e3, false, true, false);
              }
            }), 50);
          })), this.core.LGel.on(n + ".thumb", (function(e2) {
            var i2 = e2.detail.index;
            t2.animateThumb(i2);
          })), this.core.LGel.on(h + ".thumb", (function() {
            t2.thumbOuterWidth = t2.core.outer.get().offsetWidth;
          })), this.core.LGel.on(s + ".thumb", (function() {
            t2.rebuildThumbnails();
          })), this.core.LGel.on(i + ".thumb", (function() {
            t2.core.lgOpened && setTimeout((function() {
              t2.thumbOuterWidth = t2.core.outer.get().offsetWidth, t2.animateThumb(t2.core.index), t2.thumbOuterWidth = t2.core.outer.get().offsetWidth;
            }), 50);
          }));
        }, o.prototype.setThumbMarkup = function() {
          var t2 = "lg-thumb-outer ";
          this.settings.alignThumbnails && (t2 += "lg-thumb-align-" + this.settings.alignThumbnails);
          var e2 = '<div class="' + t2 + '">\n        <div class="lg-thumb lg-group">\n        </div>\n        </div>';
          this.core.outer.addClass("lg-has-thumb"), ".lg-components" === this.settings.appendThumbnailsTo ? this.core.$lgComponents.append(e2) : this.core.outer.append(e2), this.$thumbOuter = this.core.outer.find(".lg-thumb-outer").first(), this.$lgThumb = this.core.outer.find(".lg-thumb").first(), this.settings.animateThumb && this.core.outer.find(".lg-thumb").css("transition-duration", this.core.settings.speed + "ms").css("width", this.thumbTotalWidth + "px").css("position", "relative"), this.setThumbItemHtml(this.core.galleryItems);
        }, o.prototype.enableThumbDrag = function() {
          var t2 = this, e2 = { cords: { startX: 0, endX: 0 }, isMoved: false, newTranslateX: 0, startTime: /* @__PURE__ */ new Date(), endTime: /* @__PURE__ */ new Date(), touchMoveTime: 0 }, i2 = false;
          this.$thumbOuter.addClass("lg-grab"), this.core.outer.find(".lg-thumb").first().on("mousedown.lg.thumb", (function(s2) {
            t2.thumbTotalWidth > t2.thumbOuterWidth && (s2.preventDefault(), e2.cords.startX = s2.pageX, e2.startTime = /* @__PURE__ */ new Date(), t2.thumbClickable = false, i2 = true, t2.core.outer.get().scrollLeft += 1, t2.core.outer.get().scrollLeft -= 1, t2.$thumbOuter.removeClass("lg-grab").addClass("lg-grabbing"));
          })), this.$LG(window).on("mousemove.lg.thumb.global" + this.core.lgId, (function(s2) {
            t2.core.lgOpened && i2 && (e2.cords.endX = s2.pageX, e2 = t2.onThumbTouchMove(e2));
          })), this.$LG(window).on("mouseup.lg.thumb.global" + this.core.lgId, (function() {
            t2.core.lgOpened && (e2.isMoved ? e2 = t2.onThumbTouchEnd(e2) : t2.thumbClickable = true, i2 && (i2 = false, t2.$thumbOuter.removeClass("lg-grabbing").addClass("lg-grab")));
          }));
        }, o.prototype.enableThumbSwipe = function() {
          var t2 = this, e2 = { cords: { startX: 0, endX: 0 }, isMoved: false, newTranslateX: 0, startTime: /* @__PURE__ */ new Date(), endTime: /* @__PURE__ */ new Date(), touchMoveTime: 0 };
          this.$lgThumb.on("touchstart.lg", (function(i2) {
            t2.thumbTotalWidth > t2.thumbOuterWidth && (i2.preventDefault(), e2.cords.startX = i2.targetTouches[0].pageX, t2.thumbClickable = false, e2.startTime = /* @__PURE__ */ new Date());
          })), this.$lgThumb.on("touchmove.lg", (function(i2) {
            t2.thumbTotalWidth > t2.thumbOuterWidth && (i2.preventDefault(), e2.cords.endX = i2.targetTouches[0].pageX, e2 = t2.onThumbTouchMove(e2));
          })), this.$lgThumb.on("touchend.lg", (function() {
            e2.isMoved ? e2 = t2.onThumbTouchEnd(e2) : t2.thumbClickable = true;
          }));
        }, o.prototype.rebuildThumbnails = function() {
          var t2 = this;
          this.$thumbOuter.addClass("lg-rebuilding-thumbnails"), setTimeout((function() {
            t2.thumbTotalWidth = t2.core.galleryItems.length * (t2.settings.thumbWidth + t2.settings.thumbMargin), t2.$lgThumb.css("width", t2.thumbTotalWidth + "px"), t2.$lgThumb.empty(), t2.setThumbItemHtml(t2.core.galleryItems), t2.animateThumb(t2.core.index);
          }), 50), setTimeout((function() {
            t2.$thumbOuter.removeClass("lg-rebuilding-thumbnails");
          }), 200);
        }, o.prototype.setTranslate = function(t2) {
          this.$lgThumb.css("transform", "translate3d(-" + t2 + "px, 0px, 0px)");
        }, o.prototype.getPossibleTransformX = function(t2) {
          return t2 > this.thumbTotalWidth - this.thumbOuterWidth && (t2 = this.thumbTotalWidth - this.thumbOuterWidth), t2 < 0 && (t2 = 0), t2;
        }, o.prototype.animateThumb = function(t2) {
          if (this.$lgThumb.css("transition-duration", this.core.settings.speed + "ms"), this.settings.animateThumb) {
            var e2 = 0;
            switch (this.settings.currentPagerPosition) {
              case "left":
                e2 = 0;
                break;
              case "middle":
                e2 = this.thumbOuterWidth / 2 - this.settings.thumbWidth / 2;
                break;
              case "right":
                e2 = this.thumbOuterWidth - this.settings.thumbWidth;
            }
            this.translateX = (this.settings.thumbWidth + this.settings.thumbMargin) * t2 - 1 - e2, this.translateX > this.thumbTotalWidth - this.thumbOuterWidth && (this.translateX = this.thumbTotalWidth - this.thumbOuterWidth), this.translateX < 0 && (this.translateX = 0), this.setTranslate(this.translateX);
          }
        }, o.prototype.onThumbTouchMove = function(t2) {
          return t2.newTranslateX = this.translateX, t2.isMoved = true, t2.touchMoveTime = (/* @__PURE__ */ new Date()).valueOf(), t2.newTranslateX -= t2.cords.endX - t2.cords.startX, t2.newTranslateX = this.getPossibleTransformX(t2.newTranslateX), this.setTranslate(t2.newTranslateX), this.$thumbOuter.addClass("lg-dragging"), t2;
        }, o.prototype.onThumbTouchEnd = function(t2) {
          t2.isMoved = false, t2.endTime = /* @__PURE__ */ new Date(), this.$thumbOuter.removeClass("lg-dragging");
          var e2 = t2.endTime.valueOf() - t2.startTime.valueOf(), i2 = t2.cords.endX - t2.cords.startX, s2 = Math.abs(i2) / e2;
          return s2 > 0.15 && t2.endTime.valueOf() - t2.touchMoveTime < 30 ? ((s2 += 1) > 2 && (s2 += 1), s2 += s2 * (Math.abs(i2) / this.thumbOuterWidth), this.$lgThumb.css("transition-duration", Math.min(s2 - 1, 2) + "settings"), i2 *= s2, this.translateX = this.getPossibleTransformX(this.translateX - i2), this.setTranslate(this.translateX)) : this.translateX = t2.newTranslateX, Math.abs(t2.cords.endX - t2.cords.startX) < this.settings.thumbnailSwipeThreshold && (this.thumbClickable = true), t2;
        }, o.prototype.getThumbHtml = function(t2, e2, i2) {
          var s2, h2 = this.core.galleryItems[e2].__slideVideoInfo || {};
          s2 = h2.youtube && this.settings.loadYouTubeThumbnail ? "//img.youtube.com/vi/" + h2.youtube[1] + "/" + this.settings.youTubeThumbSize + ".jpg" : t2;
          var n2 = document.createElement("div");
          n2.setAttribute("data-lg-item-id", e2 + ""), n2.className = "lg-thumb-item " + (e2 === this.core.index ? "active" : ""), n2.style.cssText = "width: " + this.settings.thumbWidth + "px; height: " + this.settings.thumbHeight + "; margin-right: " + this.settings.thumbMargin + "px;";
          var o2 = document.createElement("img");
          return o2.alt = i2 || "", o2.setAttribute("data-lg-item-id", e2 + ""), o2.src = s2, n2.appendChild(o2), n2;
        }, o.prototype.setThumbItemHtml = function(t2) {
          for (var e2 = 0; e2 < t2.length; e2++) {
            var i2 = this.getThumbHtml(t2[e2].thumb, e2, t2[e2].alt);
            this.$lgThumb.append(i2);
          }
        }, o.prototype.setAnimateThumbStyles = function() {
          this.settings.animateThumb && this.core.outer.addClass("lg-animate-thumb");
        }, o.prototype.manageActiveClassOnSlideChange = function() {
          var t2 = this;
          this.core.LGel.on(n + ".thumb", (function(e2) {
            var i2 = t2.core.outer.find(".lg-thumb-item"), s2 = e2.detail.index;
            i2.removeClass("active"), i2.eq(s2).addClass("active");
          }));
        }, o.prototype.toggleThumbBar = function() {
          var t2 = this;
          this.settings.toggleThumb && (this.core.outer.addClass("lg-can-toggle"), this.core.$toolbar.append('<button type="button" aria-label="' + this.settings.thumbnailPluginStrings.toggleThumbnails + '" class="lg-toggle-thumb lg-icon"></button>'), this.core.outer.find(".lg-toggle-thumb").first().on("click.lg", (function() {
            t2.core.outer.toggleClass("lg-components-open");
          })));
        }, o.prototype.thumbKeyPress = function() {
          var t2 = this;
          this.$LG(window).on("keydown.lg.thumb.global" + this.core.lgId, (function(e2) {
            t2.core.lgOpened && t2.settings.toggleThumb && (38 === e2.keyCode ? (e2.preventDefault(), t2.core.outer.addClass("lg-components-open")) : 40 === e2.keyCode && (e2.preventDefault(), t2.core.outer.removeClass("lg-components-open")));
          }));
        }, o.prototype.destroy = function() {
          this.settings.thumbnail && (this.$LG(window).off(".lg.thumb.global" + this.core.lgId), this.core.LGel.off(".lg.thumb"), this.core.LGel.off(".thumb"), this.$thumbOuter.remove(), this.core.outer.removeClass("lg-has-thumb"));
        }, o;
      })();
    }));
  })(lgThumbnail_min$1);
  return lgThumbnail_min$1.exports;
}
var lgThumbnail_minExports = requireLgThumbnail_min();
const lgThumbnail = /* @__PURE__ */ getDefaultExportFromCjs(lgThumbnail_minExports);
var lgZoom_min$1 = { exports: {} };
/**
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
var lgZoom_min = lgZoom_min$1.exports;
var hasRequiredLgZoom_min;
function requireLgZoom_min() {
  if (hasRequiredLgZoom_min) return lgZoom_min$1.exports;
  hasRequiredLgZoom_min = 1;
  (function(module, exports) {
    !(function(e, t) {
      module.exports = t();
    })(lgZoom_min, (function() {
      var e = function() {
        return (e = Object.assign || function(e2) {
          for (var t2, o2 = 1, i2 = arguments.length; o2 < i2; o2++) for (var s2 in t2 = arguments[o2]) Object.prototype.hasOwnProperty.call(t2, s2) && (e2[s2] = t2[s2]);
          return e2;
        }).apply(this, arguments);
      }, t = { scale: 1, zoom: true, infiniteZoom: true, actualSize: true, showZoomInOutIcons: false, actualSizeIcons: { zoomIn: "lg-zoom-in", zoomOut: "lg-zoom-out" }, enableZoomAfter: 300, zoomPluginStrings: { zoomIn: "Zoom in", zoomOut: "Zoom out", viewActualSize: "View actual size" } }, o = "lgContainerResize", i = "lgBeforeOpen", s = "lgAfterOpen", a = "lgSlideItemLoad", n = "lgAfterSlide", r = "lgRotateLeft", l = "lgRotateRight", c = "lgFlipHorizontal", g = "lgFlipVertical";
      return (function() {
        function h(o2, i2) {
          return this.core = o2, this.$LG = i2, this.settings = e(e({}, t), this.core.settings), this;
        }
        return h.prototype.buildTemplates = function() {
          var e2 = this.settings.showZoomInOutIcons ? '<button id="' + this.core.getIdName("lg-zoom-in") + '" type="button" aria-label="' + this.settings.zoomPluginStrings.zoomIn + '" class="lg-zoom-in lg-icon"></button><button id="' + this.core.getIdName("lg-zoom-out") + '" type="button" aria-label="' + this.settings.zoomPluginStrings.zoomOut + '" class="lg-zoom-out lg-icon"></button>' : "";
          this.settings.actualSize && (e2 += '<button id="' + this.core.getIdName("lg-actual-size") + '" type="button" aria-label="' + this.settings.zoomPluginStrings.viewActualSize + '" class="' + this.settings.actualSizeIcons.zoomIn + ' lg-icon"></button>'), this.core.outer.addClass("lg-use-transition-for-zoom"), this.core.$toolbar.first().append(e2);
        }, h.prototype.enableZoom = function(e2) {
          var t2 = this, o2 = this.settings.enableZoomAfter + e2.detail.delay;
          this.$LG("body").first().hasClass("lg-from-hash") && e2.detail.delay ? o2 = 0 : this.$LG("body").first().removeClass("lg-from-hash"), this.zoomableTimeout = setTimeout((function() {
            t2.isImageSlide(t2.core.index) && (t2.core.getSlideItem(e2.detail.index).addClass("lg-zoomable"), e2.detail.index === t2.core.index && t2.setZoomEssentials());
          }), o2 + 30);
        }, h.prototype.enableZoomOnSlideItemLoad = function() {
          this.core.LGel.on(a + ".zoom", this.enableZoom.bind(this));
        }, h.prototype.getDragCords = function(e2) {
          return { x: e2.pageX, y: e2.pageY };
        }, h.prototype.getSwipeCords = function(e2) {
          return { x: e2.touches[0].pageX, y: e2.touches[0].pageY };
        }, h.prototype.getDragAllowedAxises = function(e2, t2) {
          if (!this.containerRect) return { allowX: false, allowY: false };
          var o2 = this.core.getSlideItem(this.core.index).find(".lg-image").first().get(), i2 = 0, s2 = 0, a2 = o2.getBoundingClientRect();
          e2 ? (i2 = o2.offsetHeight * e2, s2 = o2.offsetWidth * e2) : t2 ? (i2 = a2.height + t2 * a2.height, s2 = a2.width + t2 * a2.width) : (i2 = a2.height, s2 = a2.width);
          var n2 = i2 > this.containerRect.height;
          return { allowX: s2 > this.containerRect.width, allowY: n2 };
        }, h.prototype.setZoomEssentials = function() {
          this.containerRect = this.core.$content.get().getBoundingClientRect();
        }, h.prototype.zoomImage = function(e2, t2, o2, i2) {
          if (this.containerRect && !(Math.abs(t2) <= 0)) {
            var s2, a2, n2 = this.containerRect.width / 2 + this.containerRect.left, r2 = this.containerRect.height / 2 + this.containerRect.top + this.scrollTop;
            1 === e2 && (this.positionChanged = false);
            var l2 = this.getDragAllowedAxises(0, t2), c2 = l2.allowY, g2 = l2.allowX;
            this.positionChanged && (s2 = this.left / (this.scale - t2), a2 = this.top / (this.scale - t2), this.pageX = n2 - s2, this.pageY = r2 - a2, this.positionChanged = false);
            var h2, m, u = this.getPossibleSwipeDragCords(t2), d = n2 - this.pageX, f = r2 - this.pageY;
            if (e2 - t2 > 1) {
              var p = (e2 - t2) / Math.abs(t2);
              h2 = (d = (t2 < 0 ? -d : d) + this.left * (p + (t2 < 0 ? -1 : 1))) / p, m = (f = (t2 < 0 ? -f : f) + this.top * (p + (t2 < 0 ? -1 : 1))) / p;
            } else {
              h2 = d * (p = (e2 - t2) * t2), m = f * p;
            }
            o2 && (g2 ? this.isBeyondPossibleLeft(h2, u.minX) ? h2 = u.minX : this.isBeyondPossibleRight(h2, u.maxX) && (h2 = u.maxX) : e2 > 1 && (h2 < u.minX ? h2 = u.minX : h2 > u.maxX && (h2 = u.maxX)), c2 ? this.isBeyondPossibleTop(m, u.minY) ? m = u.minY : this.isBeyondPossibleBottom(m, u.maxY) && (m = u.maxY) : e2 > 1 && (m < u.minY ? m = u.minY : m > u.maxY && (m = u.maxY))), this.setZoomStyles({ x: h2, y: m, scale: e2 }), this.left = h2, this.top = m, i2 && this.setZoomImageSize();
          }
        }, h.prototype.resetImageTranslate = function(e2) {
          if (this.isImageSlide(e2)) {
            var t2 = this.core.getSlideItem(e2).find(".lg-image").first();
            this.imageReset = false, t2.removeClass("reset-transition reset-transition-y reset-transition-x"), this.core.outer.removeClass("lg-actual-size"), t2.css("width", "auto").css("height", "auto"), setTimeout((function() {
              t2.removeClass("no-transition");
            }), 10);
          }
        }, h.prototype.setZoomImageSize = function() {
          var e2 = this, t2 = this.core.getSlideItem(this.core.index).find(".lg-image").first();
          setTimeout((function() {
            var o2 = e2.getCurrentImageActualSizeScale();
            e2.scale >= o2 && (t2.addClass("no-transition"), e2.imageReset = true);
          }), 500), setTimeout((function() {
            var o2 = e2.getCurrentImageActualSizeScale();
            if (e2.scale >= o2) {
              var i2 = e2.getDragAllowedAxises(e2.scale);
              t2.css("width", t2.get().naturalWidth + "px").css("height", t2.get().naturalHeight + "px"), e2.core.outer.addClass("lg-actual-size"), i2.allowX && i2.allowY ? t2.addClass("reset-transition") : i2.allowX && !i2.allowY ? t2.addClass("reset-transition-x") : !i2.allowX && i2.allowY && t2.addClass("reset-transition-y");
            }
          }), 550);
        }, h.prototype.setZoomStyles = function(e2) {
          var t2 = this.core.getSlideItem(this.core.index).find(".lg-img-wrap").first(), o2 = this.core.getSlideItem(this.core.index).find(".lg-image").first(), i2 = this.core.outer.find(".lg-current .lg-dummy-img").first();
          this.scale = e2.scale, o2.css("transform", "scale3d(" + e2.scale + ", " + e2.scale + ", 1)"), i2.css("transform", "scale3d(" + e2.scale + ", " + e2.scale + ", 1)");
          var s2 = "translate3d(" + e2.x + "px, " + e2.y + "px, 0)";
          t2.css("transform", s2);
        }, h.prototype.setActualSize = function(e2, t2) {
          var o2 = this;
          if (!this.zoomInProgress) {
            this.zoomInProgress = true;
            var i2 = this.core.galleryItems[this.core.index];
            this.resetImageTranslate(e2), setTimeout((function() {
              if (i2.src && !o2.core.outer.hasClass("lg-first-slide-loading")) {
                var e3 = o2.getCurrentImageActualSizeScale(), s2 = o2.scale;
                o2.core.outer.hasClass("lg-zoomed") ? o2.scale = 1 : o2.scale = o2.getScale(e3), o2.setPageCords(t2), o2.beginZoom(o2.scale), o2.zoomImage(o2.scale, o2.scale - s2, true, true);
              }
            }), 50), setTimeout((function() {
              o2.core.outer.removeClass("lg-grabbing").addClass("lg-grab");
            }), 60), setTimeout((function() {
              o2.zoomInProgress = false;
            }), 610);
          }
        }, h.prototype.getNaturalWidth = function(e2) {
          var t2 = this.core.getSlideItem(e2).find(".lg-image").first(), o2 = this.core.galleryItems[e2].width;
          return o2 ? parseFloat(o2) : t2.get().naturalWidth;
        }, h.prototype.getActualSizeScale = function(e2, t2) {
          return e2 >= t2 ? e2 / t2 || 2 : 1;
        }, h.prototype.getCurrentImageActualSizeScale = function() {
          var e2 = this.core.getSlideItem(this.core.index).find(".lg-image").first().get().offsetWidth, t2 = this.getNaturalWidth(this.core.index) || e2;
          return this.getActualSizeScale(t2, e2);
        }, h.prototype.getPageCords = function(e2) {
          var t2 = {};
          if (e2) t2.x = e2.pageX || e2.touches[0].pageX, t2.y = e2.pageY || e2.touches[0].pageY;
          else {
            var o2 = this.core.$content.get().getBoundingClientRect();
            t2.x = o2.width / 2 + o2.left, t2.y = o2.height / 2 + this.scrollTop + o2.top;
          }
          return t2;
        }, h.prototype.setPageCords = function(e2) {
          var t2 = this.getPageCords(e2);
          this.pageX = t2.x, this.pageY = t2.y;
        }, h.prototype.manageActualPixelClassNames = function() {
          this.core.getElementById("lg-actual-size").removeClass(this.settings.actualSizeIcons.zoomIn).addClass(this.settings.actualSizeIcons.zoomOut);
        }, h.prototype.beginZoom = function(e2) {
          return this.core.outer.removeClass("lg-zoom-drag-transition lg-zoom-dragging"), e2 > 1 ? (this.core.outer.addClass("lg-zoomed"), this.manageActualPixelClassNames()) : this.resetZoom(), e2 > 1;
        }, h.prototype.getScale = function(e2) {
          var t2 = this.getCurrentImageActualSizeScale();
          return e2 < 1 ? e2 = 1 : e2 > t2 && (e2 = t2), e2;
        }, h.prototype.init = function() {
          var e2 = this;
          if (this.settings.zoom) {
            this.buildTemplates(), this.enableZoomOnSlideItemLoad();
            var t2 = null;
            this.core.outer.on("dblclick.lg", (function(t3) {
              e2.$LG(t3.target).hasClass("lg-image") && e2.setActualSize(e2.core.index, t3);
            })), this.core.outer.on("touchstart.lg", (function(o2) {
              var i2 = e2.$LG(o2.target);
              1 === o2.touches.length && i2.hasClass("lg-image") && (t2 ? (clearTimeout(t2), t2 = null, o2.preventDefault(), e2.setActualSize(e2.core.index, o2)) : t2 = setTimeout((function() {
                t2 = null;
              }), 300));
            })), this.core.LGel.on(o + ".zoom " + l + ".zoom " + r + ".zoom " + c + ".zoom " + g + ".zoom", (function() {
              if (e2.core.lgOpened && e2.isImageSlide(e2.core.index) && !e2.core.touchAction) {
                var t3 = e2.core.getSlideItem(e2.core.index).find(".lg-img-wrap").first();
                e2.top = 0, e2.left = 0, e2.setZoomEssentials(), e2.setZoomSwipeStyles(t3, { x: 0, y: 0 }), e2.positionChanged = true;
              }
            })), this.$LG(window).on("scroll.lg.zoom.global" + this.core.lgId, (function() {
              e2.core.lgOpened && (e2.scrollTop = e2.$LG(window).scrollTop());
            })), this.core.getElementById("lg-zoom-out").on("click.lg", (function() {
              if (e2.isImageSlide(e2.core.index)) {
                var t3 = 0;
                e2.imageReset && (e2.resetImageTranslate(e2.core.index), t3 = 50), setTimeout((function() {
                  var t4 = e2.scale - e2.settings.scale;
                  t4 < 1 && (t4 = 1), e2.beginZoom(t4), e2.zoomImage(t4, -e2.settings.scale, true, !e2.settings.infiniteZoom);
                }), t3);
              }
            })), this.core.getElementById("lg-zoom-in").on("click.lg", (function() {
              e2.zoomIn();
            })), this.core.getElementById("lg-actual-size").on("click.lg", (function() {
              e2.setActualSize(e2.core.index);
            })), this.core.LGel.on(i + ".zoom", (function() {
              e2.core.outer.find(".lg-item").removeClass("lg-zoomable");
            })), this.core.LGel.on(s + ".zoom", (function() {
              e2.scrollTop = e2.$LG(window).scrollTop(), e2.pageX = e2.core.outer.width() / 2, e2.pageY = e2.core.outer.height() / 2 + e2.scrollTop, e2.scale = 1;
            })), this.core.LGel.on(n + ".zoom", (function(t3) {
              var o2 = t3.detail.prevIndex;
              e2.scale = 1, e2.positionChanged = false, e2.zoomInProgress = false, e2.resetZoom(o2), e2.resetImageTranslate(o2), e2.isImageSlide(e2.core.index) && e2.setZoomEssentials();
            })), this.zoomDrag(), this.pinchZoom(), this.zoomSwipe(), this.zoomableTimeout = false, this.positionChanged = false, this.zoomInProgress = false;
          }
        }, h.prototype.zoomIn = function() {
          if (this.isImageSlide(this.core.index)) {
            var e2 = this.scale + this.settings.scale;
            this.settings.infiniteZoom || (e2 = this.getScale(e2)), this.beginZoom(e2), this.zoomImage(e2, Math.min(this.settings.scale, e2 - this.scale), true, !this.settings.infiniteZoom);
          }
        }, h.prototype.resetZoom = function(e2) {
          this.core.outer.removeClass("lg-zoomed lg-zoom-drag-transition");
          var t2 = this.core.getElementById("lg-actual-size"), o2 = this.core.getSlideItem(void 0 !== e2 ? e2 : this.core.index);
          t2.removeClass(this.settings.actualSizeIcons.zoomOut).addClass(this.settings.actualSizeIcons.zoomIn), o2.find(".lg-img-wrap").first().removeAttr("style"), o2.find(".lg-image").first().removeAttr("style"), this.scale = 1, this.left = 0, this.top = 0, this.setPageCords();
        }, h.prototype.getTouchDistance = function(e2) {
          return Math.sqrt((e2.touches[0].pageX - e2.touches[1].pageX) * (e2.touches[0].pageX - e2.touches[1].pageX) + (e2.touches[0].pageY - e2.touches[1].pageY) * (e2.touches[0].pageY - e2.touches[1].pageY));
        }, h.prototype.pinchZoom = function() {
          var e2 = this, t2 = 0, o2 = false, i2 = 1, s2 = 0, a2 = this.core.getSlideItem(this.core.index);
          this.core.outer.on("touchstart.lg", (function(o3) {
            if (a2 = e2.core.getSlideItem(e2.core.index), e2.isImageSlide(e2.core.index) && 2 === o3.touches.length) {
              if (o3.preventDefault(), e2.core.outer.hasClass("lg-first-slide-loading")) return;
              i2 = e2.scale || 1, e2.core.outer.removeClass("lg-zoom-drag-transition lg-zoom-dragging"), e2.setPageCords(o3), e2.resetImageTranslate(e2.core.index), e2.core.touchAction = "pinch", t2 = e2.getTouchDistance(o3);
            }
          })), this.core.$inner.on("touchmove.lg", (function(n2) {
            if (2 === n2.touches.length && "pinch" === e2.core.touchAction && (e2.$LG(n2.target).hasClass("lg-item") || a2.get().contains(n2.target))) {
              n2.preventDefault();
              var r2 = e2.getTouchDistance(n2), l2 = t2 - r2;
              if (!o2 && Math.abs(l2) > 5 && (o2 = true), o2) {
                s2 = e2.scale;
                var c2 = Math.max(1, i2 + 0.02 * -l2);
                e2.scale = Math.round(100 * (c2 + Number.EPSILON)) / 100;
                var g2 = e2.scale - s2;
                e2.zoomImage(e2.scale, Math.round(100 * (g2 + Number.EPSILON)) / 100, false, false);
              }
            }
          })), this.core.$inner.on("touchend.lg", (function(i3) {
            if ("pinch" === e2.core.touchAction && (e2.$LG(i3.target).hasClass("lg-item") || a2.get().contains(i3.target))) {
              if (o2 = false, t2 = 0, e2.scale <= 1) e2.resetZoom();
              else {
                var s3 = e2.getCurrentImageActualSizeScale();
                if (e2.scale >= s3) {
                  var n2 = s3 - e2.scale;
                  0 === n2 && (n2 = 0.01), e2.zoomImage(s3, n2, false, true);
                }
                e2.manageActualPixelClassNames(), e2.core.outer.addClass("lg-zoomed");
              }
              e2.core.touchAction = void 0;
            }
          }));
        }, h.prototype.touchendZoom = function(e2, t2, o2, i2, s2) {
          var a2 = t2.x - e2.x, n2 = t2.y - e2.y, r2 = Math.abs(a2) / s2 + 1, l2 = Math.abs(n2) / s2 + 1;
          r2 > 2 && (r2 += 1), l2 > 2 && (l2 += 1), a2 *= r2, n2 *= l2;
          var c2 = this.core.getSlideItem(this.core.index).find(".lg-img-wrap").first(), g2 = {};
          g2.x = this.left + a2, g2.y = this.top + n2;
          var h2 = this.getPossibleSwipeDragCords();
          (Math.abs(a2) > 15 || Math.abs(n2) > 15) && (i2 && (this.isBeyondPossibleTop(g2.y, h2.minY) ? g2.y = h2.minY : this.isBeyondPossibleBottom(g2.y, h2.maxY) && (g2.y = h2.maxY)), o2 && (this.isBeyondPossibleLeft(g2.x, h2.minX) ? g2.x = h2.minX : this.isBeyondPossibleRight(g2.x, h2.maxX) && (g2.x = h2.maxX)), i2 ? this.top = g2.y : g2.y = this.top, o2 ? this.left = g2.x : g2.x = this.left, this.setZoomSwipeStyles(c2, g2), this.positionChanged = true);
        }, h.prototype.getZoomSwipeCords = function(e2, t2, o2, i2, s2) {
          var a2 = {};
          if (i2) {
            if (a2.y = this.top + (t2.y - e2.y), this.isBeyondPossibleTop(a2.y, s2.minY)) {
              var n2 = s2.minY - a2.y;
              a2.y = s2.minY - n2 / 6;
            } else if (this.isBeyondPossibleBottom(a2.y, s2.maxY)) {
              var r2 = a2.y - s2.maxY;
              a2.y = s2.maxY + r2 / 6;
            }
          } else a2.y = this.top;
          if (o2) {
            if (a2.x = this.left + (t2.x - e2.x), this.isBeyondPossibleLeft(a2.x, s2.minX)) {
              var l2 = s2.minX - a2.x;
              a2.x = s2.minX - l2 / 6;
            } else if (this.isBeyondPossibleRight(a2.x, s2.maxX)) {
              var c2 = a2.x - s2.maxX;
              a2.x = s2.maxX + c2 / 6;
            }
          } else a2.x = this.left;
          return a2;
        }, h.prototype.isBeyondPossibleLeft = function(e2, t2) {
          return e2 >= t2;
        }, h.prototype.isBeyondPossibleRight = function(e2, t2) {
          return e2 <= t2;
        }, h.prototype.isBeyondPossibleTop = function(e2, t2) {
          return e2 >= t2;
        }, h.prototype.isBeyondPossibleBottom = function(e2, t2) {
          return e2 <= t2;
        }, h.prototype.isImageSlide = function(e2) {
          var t2 = this.core.galleryItems[e2];
          return "image" === this.core.getSlideType(t2);
        }, h.prototype.getPossibleSwipeDragCords = function(e2) {
          var t2 = this.core.getSlideItem(this.core.index).find(".lg-image").first(), o2 = this.core.mediaContainerPosition.bottom, i2 = t2.get().getBoundingClientRect(), s2 = i2.height, a2 = i2.width;
          return e2 && (s2 += e2 * s2, a2 += e2 * a2), { minY: (s2 - this.containerRect.height) / 2, maxY: (this.containerRect.height - s2) / 2 + o2, minX: (a2 - this.containerRect.width) / 2, maxX: (this.containerRect.width - a2) / 2 };
        }, h.prototype.setZoomSwipeStyles = function(e2, t2) {
          e2.css("transform", "translate3d(" + t2.x + "px, " + t2.y + "px, 0)");
        }, h.prototype.zoomSwipe = function() {
          var e2, t2, o2 = this, i2 = {}, s2 = {}, a2 = false, n2 = false, r2 = false, l2 = /* @__PURE__ */ new Date(), c2 = this.core.getSlideItem(this.core.index);
          this.core.$inner.on("touchstart.lg", (function(s3) {
            if (o2.isImageSlide(o2.core.index) && (c2 = o2.core.getSlideItem(o2.core.index), (o2.$LG(s3.target).hasClass("lg-item") || c2.get().contains(s3.target)) && 1 === s3.touches.length && o2.core.outer.hasClass("lg-zoomed"))) {
              s3.preventDefault(), l2 = /* @__PURE__ */ new Date(), o2.core.touchAction = "zoomSwipe", t2 = o2.core.getSlideItem(o2.core.index).find(".lg-img-wrap").first();
              var a3 = o2.getDragAllowedAxises(0);
              r2 = a3.allowY, ((n2 = a3.allowX) || r2) && (i2 = o2.getSwipeCords(s3)), e2 = o2.getPossibleSwipeDragCords(), o2.core.outer.addClass("lg-zoom-dragging lg-zoom-drag-transition");
            }
          })), this.core.$inner.on("touchmove.lg", (function(l3) {
            if (1 === l3.touches.length && "zoomSwipe" === o2.core.touchAction && (o2.$LG(l3.target).hasClass("lg-item") || c2.get().contains(l3.target))) {
              l3.preventDefault(), o2.core.touchAction = "zoomSwipe", s2 = o2.getSwipeCords(l3);
              var g2 = o2.getZoomSwipeCords(i2, s2, n2, r2, e2);
              (Math.abs(s2.x - i2.x) > 15 || Math.abs(s2.y - i2.y) > 15) && (a2 = true, o2.setZoomSwipeStyles(t2, g2));
            }
          })), this.core.$inner.on("touchend.lg", (function(e3) {
            if ("zoomSwipe" === o2.core.touchAction && (o2.$LG(e3.target).hasClass("lg-item") || c2.get().contains(e3.target))) {
              if (e3.preventDefault(), o2.core.touchAction = void 0, o2.core.outer.removeClass("lg-zoom-dragging"), !a2) return;
              a2 = false;
              var t3 = (/* @__PURE__ */ new Date()).valueOf() - l2.valueOf();
              o2.touchendZoom(i2, s2, n2, r2, t3);
            }
          }));
        }, h.prototype.zoomDrag = function() {
          var e2, t2, o2, i2, s2 = this, a2 = {}, n2 = {}, r2 = false, l2 = false, c2 = false, g2 = false;
          this.core.outer.on("mousedown.lg.zoom", (function(t3) {
            if (s2.isImageSlide(s2.core.index)) {
              var n3 = s2.core.getSlideItem(s2.core.index);
              if (s2.$LG(t3.target).hasClass("lg-item") || n3.get().contains(t3.target)) {
                e2 = /* @__PURE__ */ new Date(), i2 = s2.core.getSlideItem(s2.core.index).find(".lg-img-wrap").first();
                var l3 = s2.getDragAllowedAxises(0);
                g2 = l3.allowY, c2 = l3.allowX, s2.core.outer.hasClass("lg-zoomed") && s2.$LG(t3.target).hasClass("lg-object") && (c2 || g2) && (t3.preventDefault(), a2 = s2.getDragCords(t3), o2 = s2.getPossibleSwipeDragCords(), r2 = true, s2.core.outer.removeClass("lg-grab").addClass("lg-grabbing lg-zoom-drag-transition lg-zoom-dragging"));
              }
            }
          })), this.$LG(window).on("mousemove.lg.zoom.global" + this.core.lgId, (function(e3) {
            if (r2) {
              l2 = true, n2 = s2.getDragCords(e3);
              var t3 = s2.getZoomSwipeCords(a2, n2, c2, g2, o2);
              s2.setZoomSwipeStyles(i2, t3);
            }
          })), this.$LG(window).on("mouseup.lg.zoom.global" + this.core.lgId, (function(o3) {
            if (r2) {
              if (t2 = /* @__PURE__ */ new Date(), r2 = false, s2.core.outer.removeClass("lg-zoom-dragging"), l2 && (a2.x !== n2.x || a2.y !== n2.y)) {
                n2 = s2.getDragCords(o3);
                var i3 = t2.valueOf() - e2.valueOf();
                s2.touchendZoom(a2, n2, c2, g2, i3);
              }
              l2 = false;
            }
            s2.core.outer.removeClass("lg-grabbing").addClass("lg-grab");
          }));
        }, h.prototype.closeGallery = function() {
          this.resetZoom(), this.zoomInProgress = false;
        }, h.prototype.destroy = function() {
          this.$LG(window).off(".lg.zoom.global" + this.core.lgId), this.core.LGel.off(".lg.zoom"), this.core.LGel.off(".zoom"), clearTimeout(this.zoomableTimeout), this.zoomableTimeout = false;
        }, h;
      })();
    }));
  })(lgZoom_min$1);
  return lgZoom_min$1.exports;
}
var lgZoom_minExports = requireLgZoom_min();
const lgZoom = /* @__PURE__ */ getDefaultExportFromCjs(lgZoom_minExports);
var lgVideo_min$1 = { exports: {} };
/**
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
var lgVideo_min = lgVideo_min$1.exports;
var hasRequiredLgVideo_min;
function requireLgVideo_min() {
  if (hasRequiredLgVideo_min) return lgVideo_min$1.exports;
  hasRequiredLgVideo_min = 1;
  (function(module, exports) {
    !(function(e, o) {
      module.exports = o();
    })(lgVideo_min, (function() {
      var e = function() {
        return (e = Object.assign || function(e2) {
          for (var o2, i2 = 1, t2 = arguments.length; i2 < t2; i2++) for (var s2 in o2 = arguments[i2]) Object.prototype.hasOwnProperty.call(o2, s2) && (e2[s2] = o2[s2]);
          return e2;
        }).apply(this, arguments);
      }, o = { autoplayFirstVideo: true, youTubePlayerParams: false, vimeoPlayerParams: false, wistiaPlayerParams: false, gotoNextSlideOnVideoEnd: true, autoplayVideoOnSlide: false, videojs: false, videojsTheme: "", videojsOptions: {} }, i = "lgHasVideo", t = "lgSlideItemLoad", s = "lgBeforeSlide", n = "lgAfterSlide", l = "lgPosterClick", r = function(e2) {
        return Object.keys(e2).map((function(o2) {
          return encodeURIComponent(o2) + "=" + encodeURIComponent(e2[o2]);
        })).join("&");
      }, d = function(o2, i2) {
        if (!o2.youtube) return "";
        var t2 = o2.youtube[2] ? o2.youtube[2].slice(1).split("&").map((function(e2) {
          return e2.split("=");
        })).reduce((function(e2, o3) {
          var i3 = o3.map(decodeURIComponent), t3 = i3[0], s3 = i3[1];
          return e2[t3] = s3, e2;
        }), {}) : "", s2 = i2 || {}, n2 = e(e(e({}, { wmode: "opaque", autoplay: 0, mute: 1, enablejsapi: 1 }), s2), t2);
        return "?" + r(n2);
      };
      return (function() {
        function a(i2) {
          return this.core = i2, this.settings = e(e({}, o), this.core.settings), this;
        }
        return a.prototype.init = function() {
          var e2 = this;
          this.core.LGel.on(i + ".video", this.onHasVideo.bind(this)), this.core.LGel.on(l + ".video", (function() {
            var o2 = e2.core.getSlideItem(e2.core.index);
            e2.loadVideoOnPosterClick(o2);
          })), this.core.LGel.on(t + ".video", this.onSlideItemLoad.bind(this)), this.core.LGel.on(s + ".video", this.onBeforeSlide.bind(this)), this.core.LGel.on(n + ".video", this.onAfterSlide.bind(this));
        }, a.prototype.onSlideItemLoad = function(e2) {
          var o2 = this, i2 = e2.detail, t2 = i2.isFirstSlide, s2 = i2.index;
          this.settings.autoplayFirstVideo && t2 && s2 === this.core.index && setTimeout((function() {
            o2.loadAndPlayVideo(s2);
          }), 200), !t2 && this.settings.autoplayVideoOnSlide && s2 === this.core.index && this.loadAndPlayVideo(s2);
        }, a.prototype.onHasVideo = function(e2) {
          var o2 = e2.detail, i2 = o2.index, t2 = o2.src, s2 = o2.html5Video;
          o2.hasPoster || (this.appendVideos(this.core.getSlideItem(i2), { src: t2, addClass: "lg-object", index: i2, html5Video: s2 }), this.gotoNextSlideOnVideoEnd(t2, i2));
        }, a.prototype.onBeforeSlide = function(e2) {
          if (this.core.lGalleryOn) {
            var o2 = e2.detail.prevIndex;
            this.pauseVideo(o2);
          }
        }, a.prototype.onAfterSlide = function(e2) {
          var o2 = this, i2 = e2.detail, t2 = i2.index, s2 = i2.prevIndex, n2 = this.core.getSlideItem(t2);
          this.settings.autoplayVideoOnSlide && t2 !== s2 && n2.hasClass("lg-complete") && setTimeout((function() {
            o2.loadAndPlayVideo(t2);
          }), 100);
        }, a.prototype.loadAndPlayVideo = function(e2) {
          var o2 = this.core.getSlideItem(e2);
          this.core.galleryItems[e2].poster ? this.loadVideoOnPosterClick(o2, true) : this.playVideo(e2);
        }, a.prototype.playVideo = function(e2) {
          this.controlVideo(e2, "play");
        }, a.prototype.pauseVideo = function(e2) {
          this.controlVideo(e2, "pause");
        }, a.prototype.getVideoHtml = function(e2, o2, i2, t2) {
          var s2 = "", n2 = this.core.galleryItems[i2].__slideVideoInfo || {}, l2 = this.core.galleryItems[i2], a2 = l2.title || l2.alt;
          a2 = a2 ? 'title="' + a2 + '"' : "";
          var c = 'allowtransparency="true"\n            frameborder="0"\n            scrolling="no"\n            allowfullscreen\n            mozallowfullscreen\n            webkitallowfullscreen\n            oallowfullscreen\n            msallowfullscreen';
          if (n2.youtube) {
            var u = "lg-youtube" + i2, f = d(n2, this.settings.youTubePlayerParams);
            s2 = '<iframe allow="autoplay" id=' + u + ' class="lg-video-object lg-youtube ' + o2 + '" ' + a2 + ' src="' + (e2.includes("youtube-nocookie.com") ? "//www.youtube-nocookie.com/" : "//www.youtube.com/") + "embed/" + (n2.youtube[1] + f) + '" ' + c + "></iframe>";
          } else if (n2.vimeo) {
            u = "lg-vimeo" + i2;
            var h = (function(e3, o3) {
              if (!o3 || !o3.vimeo) return "";
              var i3 = o3.vimeo[2] || "", t3 = Object.assign({}, { autoplay: 0, muted: 1 }, e3), s3 = t3 && 0 !== Object.keys(t3).length ? r(t3) : "", n3 = ((o3.vimeo[0].split("/").pop() || "").split("?")[0] || "").split("#")[0], l3 = o3.vimeo[1] !== n3;
              l3 && (i3 = i3.replace("/" + n3, ""));
              var d2 = l3 ? "h=" + n3 : "";
              return "?" + d2 + (s3 = d2 ? "&" + s3 : s3) + ("?" == i3[0] ? "&" + i3.slice(1) : i3 || "");
            })(this.settings.vimeoPlayerParams, n2);
            s2 = '<iframe allow="autoplay" id=' + u + ' class="lg-video-object lg-vimeo ' + o2 + '" ' + a2 + ' src="//player.vimeo.com/video/' + (n2.vimeo[1] + h) + '" ' + c + "></iframe>";
          } else if (n2.wistia) {
            var g = "lg-wistia" + i2;
            h = (h = r(this.settings.wistiaPlayerParams)) ? "?" + h : "", s2 = '<iframe allow="autoplay" id="' + g + '" src="//fast.wistia.net/embed/iframe/' + (n2.wistia[4] + h) + '" ' + a2 + ' class="wistia_embed lg-video-object lg-wistia ' + o2 + '" name="wistia_embed" ' + c + "></iframe>";
          } else if (n2.html5) {
            for (var p = "", y = 0; y < t2.source.length; y++) {
              var v = t2.source[y].type, m = v ? 'type="' + v + '"' : "";
              p += '<source src="' + t2.source[y].src + '" ' + m + ">";
            }
            if (t2.tracks) {
              var w = function(e3) {
                var o3 = "", i3 = t2.tracks[e3];
                Object.keys(i3 || {}).forEach((function(e4) {
                  o3 += e4 + '="' + i3[e4] + '" ';
                })), p += "<track " + o3 + ">";
              };
              for (y = 0; y < t2.tracks.length; y++) w(y);
            }
            var V = "", b = t2.attributes || {};
            Object.keys(b || {}).forEach((function(e3) {
              V += e3 + '="' + b[e3] + '" ';
            })), s2 = '<video class="lg-video-object lg-html5 ' + (this.settings.videojs && this.settings.videojsTheme ? this.settings.videojsTheme + " " : "") + " " + (this.settings.videojs ? " video-js" : "") + '" ' + V + ">\n                " + p + "\n                Your browser does not support HTML5 video.\n            </video>";
          }
          return s2;
        }, a.prototype.appendVideos = function(e2, o2) {
          var i2, t2 = this.getVideoHtml(o2.src, o2.addClass, o2.index, o2.html5Video);
          e2.find(".lg-video-cont").append(t2);
          var s2 = e2.find(".lg-video-object").first();
          if (o2.html5Video && s2.on("mousedown.lg.video", (function(e3) {
            e3.stopPropagation();
          })), this.settings.videojs && (null === (i2 = this.core.galleryItems[o2.index].__slideVideoInfo) || void 0 === i2 ? void 0 : i2.html5)) try {
            return videojs(s2.get(), this.settings.videojsOptions);
          } catch (e3) {
            console.error("lightGallery:- Make sure you have included videojs");
          }
        }, a.prototype.gotoNextSlideOnVideoEnd = function(e2, o2) {
          var i2 = this, t2 = this.core.getSlideItem(o2).find(".lg-video-object").first(), s2 = this.core.galleryItems[o2].__slideVideoInfo || {};
          if (this.settings.gotoNextSlideOnVideoEnd) {
            if (s2.html5) t2.on("ended", (function() {
              i2.core.goToNextSlide();
            }));
            else if (s2.vimeo) try {
              new Vimeo.Player(t2.get()).on("ended", (function() {
                i2.core.goToNextSlide();
              }));
            } catch (e3) {
              console.error("lightGallery:- Make sure you have included //github.com/vimeo/player.js");
            }
            else if (s2.wistia) try {
              window._wq = window._wq || [], window._wq.push({ id: t2.attr("id"), onReady: function(e3) {
                e3.bind("end", (function() {
                  i2.core.goToNextSlide();
                }));
              } });
            } catch (e3) {
              console.error("lightGallery:- Make sure you have included //fast.wistia.com/assets/external/E-v1.js");
            }
          }
        }, a.prototype.controlVideo = function(e2, o2) {
          var i2 = this.core.getSlideItem(e2).find(".lg-video-object").first(), t2 = this.core.galleryItems[e2].__slideVideoInfo || {};
          if (i2.get()) {
            if (t2.youtube) try {
              i2.get().contentWindow.postMessage('{"event":"command","func":"' + o2 + 'Video","args":""}', "*");
            } catch (e3) {
              console.error("lightGallery:- " + e3);
            }
            else if (t2.vimeo) try {
              new Vimeo.Player(i2.get())[o2]();
            } catch (e3) {
              console.error("lightGallery:- Make sure you have included //github.com/vimeo/player.js");
            }
            else if (t2.html5) if (this.settings.videojs) try {
              videojs(i2.get())[o2]();
            } catch (e3) {
              console.error("lightGallery:- Make sure you have included videojs");
            }
            else i2.get()[o2]();
            else if (t2.wistia) try {
              window._wq = window._wq || [], window._wq.push({ id: i2.attr("id"), onReady: function(e3) {
                e3[o2]();
              } });
            } catch (e3) {
              console.error("lightGallery:- Make sure you have included //fast.wistia.com/assets/external/E-v1.js");
            }
          }
        }, a.prototype.loadVideoOnPosterClick = function(e2, o2) {
          var i2 = this;
          if (e2.hasClass("lg-video-loaded")) o2 && this.playVideo(this.core.index);
          else if (e2.hasClass("lg-has-video")) this.playVideo(this.core.index);
          else {
            e2.addClass("lg-has-video");
            var t2 = void 0, s2 = this.core.galleryItems[this.core.index].src, n2 = this.core.galleryItems[this.core.index].video;
            n2 && (t2 = "string" == typeof n2 ? JSON.parse(n2) : n2);
            var l2 = this.appendVideos(e2, { src: s2, addClass: "", index: this.core.index, html5Video: t2 });
            this.gotoNextSlideOnVideoEnd(s2, this.core.index);
            var r2 = e2.find(".lg-object").first().get();
            e2.find(".lg-video-cont").first().append(r2), e2.addClass("lg-video-loading"), l2 && l2.ready((function() {
              l2.on("loadedmetadata", (function() {
                i2.onVideoLoadAfterPosterClick(e2, i2.core.index);
              }));
            })), e2.find(".lg-video-object").first().on("load.lg error.lg loadedmetadata.lg", (function() {
              setTimeout((function() {
                i2.onVideoLoadAfterPosterClick(e2, i2.core.index);
              }), 50);
            }));
          }
        }, a.prototype.onVideoLoadAfterPosterClick = function(e2, o2) {
          e2.addClass("lg-video-loaded"), this.playVideo(o2);
        }, a.prototype.destroy = function() {
          this.core.LGel.off(".lg.video"), this.core.LGel.off(".video");
        }, a;
      })();
    }));
  })(lgVideo_min$1);
  return lgVideo_min$1.exports;
}
var lgVideo_minExports = requireLgVideo_min();
const lgVideo = /* @__PURE__ */ getDefaultExportFromCjs(lgVideo_minExports);
const KEY = "7EC452A9-0CFD441C-BD984C7C-17C8456E";
function initLightGallery(selector = "[data-fls-gallery]") {
  const galleries = document.querySelectorAll(selector);
  if (!galleries.length) return;
  let galleryInstances = [];
  galleries.forEach((gallery) => {
    const galleryInstance = lightGallery(gallery, {
      plugins: [lgZoom, lgThumbnail, lgVideo],
      licenseKey: KEY,
      speed: 500,
      selector: "a",
      // важно, иначе не находит ссылки
      videojs: true,
      videojsOptions: { muted: false },
      mobileSettings: {
        controls: false,
        showCloseIcon: true,
        download: false
      }
    });
    let isGalleryOpen = false;
    function closeGalleryOnBack(event) {
      if (isGalleryOpen) {
        galleryInstance.closeGallery();
        isGalleryOpen = false;
        event.preventDefault();
      }
    }
    gallery.addEventListener("lgAfterOpen", () => {
      isGalleryOpen = true;
      history.pushState(null, null, document.URL);
      window.addEventListener("popstate", closeGalleryOnBack);
    });
    gallery.addEventListener("lgAfterClose", () => {
      isGalleryOpen = false;
      history.replaceState(null, null, document.URL);
      window.removeEventListener("popstate", closeGalleryOnBack);
    });
    galleryInstances.push({ gallery, instance: galleryInstance });
  });
  return galleryInstances;
}
window.addEventListener("load", () => {
  initLightGallery();
});
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
      !targetElement.classList.contains("watcher-view") ? targetElement.classList.add("watcher-view") : null;
    } else {
      targetElement.classList.contains("watcher-view") ? targetElement.classList.remove("watcher-view") : null;
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
      function createElement2(parent, key, text, whitespace) {
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
                allElements.push(createElement2(F, "whitespace", " ", preserveWhitespace));
              }
              var splitEl = createElement2(F, key, splitText2);
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
        var parent = opts.target = createElement2();
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
          var container = createElement2(_, "cell-grid");
          while (totalCells--) {
            var cell = createElement2(container, "cell");
            createElement2(cell, "cell-inner");
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
