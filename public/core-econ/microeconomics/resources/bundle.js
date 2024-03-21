// Map NodeList to Array for forEach polyfill
if (typeof NodeList.prototype.forEach !== "function") {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// classList
(function () {
  if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

  const prototype = Array.prototype;
  const push = prototype.push;
  const splice = prototype.splice;
  const join = prototype.join;

  function DOMTokenList(el) {
    this.el = el;
    // The className needs to be trimmed and split on whitespace
    // to retrieve a list of classes.
    const classes = el.className.replace(/^\s+|\s+$/g, "").split(/\s+/);
    for (let i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }

  DOMTokenList.prototype = {
    add: function (token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
    },
    contains: function (token) {
      return this.el.className.indexOf(token) != -1;
    },
    item: function (index) {
      return this[index] || null;
    },
    remove: function (token) {
      if (!this.contains(token)) return;
      for (var i = 0; i < this.length; i++) {
        if (this[i] == token) break;
      }
      splice.call(this, i, 1);
      this.el.className = this.toString();
    },
    toString: function () {
      return join.call(this, " ");
    },
    toggle: function (token) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return this.contains(token);
    },
  };

  window.DOMTokenList = DOMTokenList;

  function defineElementGetter(obj, prop, getter) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter,
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(Element.prototype, "classList", function () {
    return new DOMTokenList(this);
  });
})();

// Polyfill find, which we use in mcqs.js,
// and which doesn't work in IE and other old browsers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function (predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      const thisArg = arguments[1];

      // 5. Let k be 0.
      let k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
  });
}

// closest()
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    let el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// remove()
// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
if (typeof CharacterData === "function") {
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty("remove")) {
        return;
      }
      Object.defineProperty(item, "remove", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode === null) {
            return;
          }
          this.parentNode.removeChild(this);
        },
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
}

// Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    const toStr = Object.prototype.toString;
    const isCallable = function (fn) {
      return typeof fn === "function" || toStr.call(fn) === "[object Function]";
    };
    const toInteger = function (value) {
      const number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    const maxSafeInteger = Math.pow(2, 53) - 1;
    const toLength = function (value) {
      const len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      const C = this;

      // 2. Let items be ToObject(arrayLike).
      const items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      const mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      let T;
      if (typeof mapFn !== "undefined") {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError("Array.from: when provided, the second argument must be a function");
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      const len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      const A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      let k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      let kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === "undefined" ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  })();
}

// String.prototype.includes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    "use strict";

    if (search instanceof RegExp) {
      throw TypeError("first argument must not be a RegExp");
    }
    if (start === undefined) {
      start = 0;
    }
    return this.indexOf(search, start) !== -1;
  };
}

/* jslint browser */
/* globals window, ActiveXObject, XMLHttpRequest, DOMParser */

// Utility functions

// https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
function ebSlugify(string, indexTerm) {
  "use strict";

  const a = "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·_,:;";
  const b = "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnooooooooprrsssssttuuuuuuuuuwxyyzzz-----";
  const p = new RegExp(a.split("").join("|"), "g");

  if (indexTerm) {
    // For dynamic index terms, we want to take a different approach
    // to ensure unique ids
    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(p, function (c) {
        return b.charAt(a.indexOf(c));
      }) // Replace special characters
      .replace(/&amp/g, "-and-") // Replace & with 'and'
      .replace(/&/g, "-and-") // Replace & with 'and'
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, "") // Trim - from end of text
      .replace(/-\\\\-/g, "--") // Replace \\ with --
      .replace(/[^\w-]+/g, ""); // Remove all non-word characters
  }

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, function (c) {
      return b.charAt(a.indexOf(c));
    }) // Replace special characters
    .replace(/\//g, "-") // Replace any / with - (in non-index strings)
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// Or get the language from a URL parameter
// https://stackoverflow.com/a/901144/1781075
function ebGetParameterByName(name, url) {
  "use strict";
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Check if a page exists
// (Thanks https://stackoverflow.com/a/22097991/1781075)
function ebCheckForPage(url) {
  "use strict";
  let request;
  let pageStatus = false;
  if (window.XMLHttpRequest) {
    request = new XMLHttpRequest();
  } else {
    request = new ActiveXObject("Microsoft.XMLHTTP");
  }
  request.open("GET", url, false);
  request.send(); // this will pause the page while we check for the response
  if (request.status === 404) {
    pageStatus = false;
  } else {
    pageStatus = true;
  }
  return pageStatus;
}

// Check if an element has a particular computed style
function ebHasComputedStyle(element, property, value) {
  "use strict";
  const style = window.getComputedStyle(element);

  // If the element has the property, and no value is specified,
  // return true. If a value is specified, and it matches, return true.
  if (property && style[property]) {
    if (value) {
      if (style[property] === value) {
        return true;
      }
    } else {
      return true;
    }
  }
}

// Check if an element or its ancestors are position: relative.
// Useful when positioning an element absolutely.
// Returns the first relatively positioned parent.
// Effectively equivalent to HTMLElement.offsetParent,
// but returns false, not BODY, if no relative parent.
function ebIsPositionRelative(element) {
  "use strict";

  if (ebHasComputedStyle(element, "position", "relative")) {
    return element;
  } else {
    if (element.tagName !== "BODY") {
      return ebIsPositionRelative(element.parentElement);
    } else {
      return false;
    }
  }
}

// Check if an element or its ancestors are position: fixed.
// Returns the first fixed positioned parent.
function ebIsPositionFixed(element) {
  "use strict";

  if (ebHasComputedStyle(element, "position", "fixed")) {
    return element;
  } else {
    if (element.tagName !== "BODY") {
      return ebIsPositionFixed(element.parentElement);
    } else {
      return false;
    }
  }
}

// Get the nearest preceding sibling or cousin element
function ebNearestPrecedingSibling(element, tagName, iterationTrue) {
  "use strict";

  if (element) {
    // If this is our second pass, and the element matches, return it.
    if (iterationTrue && element.tagName === tagName) {
      return element;

      // Otherwise, if the element's previous sibling matches, return it
    } else if (element.previousElementSibling && element.previousElementSibling.tagName === tagName) {
      return element.previousElementSibling;

      // Otherwise, check the previous element and then its parents' siblings' children
    } else {
      if (element.previousElementSibling) {
        return ebNearestPrecedingSibling(element.previousElementSibling, tagName, true);
      } else {
        if (element.parentNode && element.parentNode.previousElementSibling) {
          return ebNearestPrecedingSibling(element.parentNode.previousElementSibling.lastElementChild, tagName, true);
        } else {
          return false;
        }
      }
    }
  } else {
    return false;
  }
}

// A regex alternative to String.prototype.lastIndexOf().
// Inspired by https://stackoverflow.com/a/21420210/1781075
function ebLastIndexOfRegex(string, regex, fromIndex) {
  "use strict";

  if (fromIndex) {
    string = string.substring(0, fromIndex);
  }

  const match = string.match(regex);

  if (match) {
    return string.lastIndexOf(match[match.length - 1]);
  } else {
    return -1;
  }
}

// Get a truncated string without cutting a word
function ebTruncatedString(string, characters, suffix) {
  "use strict";

  // If the string is longer than the allowed characters,
  // we'll do a careful job of truncating it neatly.
  if (string.length > characters) {
    // Get a truncated string
    let truncatedString = string.slice(0, characters);

    // Where is the last space in the truncated string?
    // We want to elide from that space to get a whole word.
    const indexOfLastSpace = ebLastIndexOfRegex(truncatedString, /\s/gi);
    const elideFrom = indexOfLastSpace;
    truncatedString = truncatedString.slice(0, elideFrom);

    // We don't want certain punctuation marks at the
    // end of our nice, neat string. If the neatened, truncated string
    // ends in one of those characters, chop it off.
    const unwantedTrailingPunctuation = /[:;,]/;
    if (truncatedString.slice(-1).match(unwantedTrailingPunctuation)) {
      truncatedString = truncatedString.slice(0, elideFrom - 1);
    }

    // If a suffix was passed to this functio (e.g. ' …')
    // add it to the end of the string.
    if (suffix) {
      truncatedString = truncatedString + suffix;
    }

    return truncatedString;
  } else {
    return string;
  }
}

// Toggle clickable area for exiting a modal.
// The callback should be a function that toggles
// the visibility of the modal itself.
// It will be called on every click.
let ebCurrentModalZIndex;
function ebToggleClickout(modalElement, callback) {
  "use strict";

  let clickOut;

  if (ebCurrentModalZIndex > 0) {
    ebCurrentModalZIndex += 1;
  } else {
    ebCurrentModalZIndex = 1000;
  }

  // If the clickout is present, and this modal
  // is visible (as opposed to another modal)
  if (document.getElementById("clickOut-" + modalElement.id) && modalElement.getAttribute("data-modal-visible")) {
    // Don't set the z-index in the style attribute,
    // which should let stylesheets determine z-index again
    modalElement.style.zIndex = "";
    modalElement.setAttribute("data-modal-visible", false);

    // Remove the clickOut element
    clickOut = document.getElementById("clickOut-" + modalElement.id);
    clickOut.remove();

    if (callback) {
      callback();
    }
  } else {
    // Bring the modal to the front
    modalElement.style.zIndex = ebCurrentModalZIndex;
    modalElement.setAttribute("data-modal-visible", true);

    // If the modal has a fixed position parent,
    // we also must set the z-index there, since it
    // creates a different stacking context that might
    // fall below our clickOut
    const fixedParent = ebIsPositionFixed(modalElement.parentElement);
    if (fixedParent) {
      fixedParent.style.zIndex = ebCurrentModalZIndex;
    }

    // Add a clickOut element
    clickOut = document.createElement("div");
    clickOut.id = "clickOut-" + modalElement.id;
    clickOut.style.zIndex = ebCurrentModalZIndex - 1;
    clickOut.style.position = "fixed";
    clickOut.style.top = "0";
    clickOut.style.right = "0";
    clickOut.style.bottom = "0";
    clickOut.style.left = "0";
    clickOut.style.backgroundColor = "black";
    clickOut.style.opacity = "0.2";
    document.body.insertAdjacentElement("beforeend", clickOut);

    if (callback) {
      callback();
    }
    // Clicking on the clickOut should remove it
    clickOut.addEventListener(
      "click",
      function () {
        ebToggleClickout(modalElement);

        if (callback) {
          callback();
        }
      },
      { once: true }
    );
  }
}

// This lets us use a function from here in Node (e.g. gulp).
// This must only run in Node, hence the `window` check.
if (typeof window === "undefined") {
  module.exports.ebSlugify = ebSlugify;
}

// Check if Core Wordpress cookie is set
function ebWordpressIsLoggedIn() {
  // wordpress plugin bookmark cookie set
  return document.cookie.indexOf("coreproject_sess") !== -1;
}

// Strip html from text
function ebStripHtml(text) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.body.textContent || "";
}

// Load settings.yml into a settings array.

// Fetch specific values from settings.yml and
// convert them into a Javascript object called settings.
// Note that some YAML keys use hyphens, which are invalid JS.
// So to use them as variables, use square brackets and quotes,
// e.g. search['search-placeholder'].
// NB: The generated settings load in client-side Javascript, so
// do not include any settings that should not be publicly available.

// Make Jekyll metadata available to Liquid

// Create default settings object
var settings = {
  site: {
    baseurl: "",
    output: "web",
    docs: false,
  },
  dynamicIndexing: true,
  web: {
    images: {
      lazyload: true,
      fullscreen: true,
    },
    bookmarks: {
      enabled: true,
      synchronise: false,
      elements: {
        include: ".content [id]",
        exclude: ".expandable-box .toggle",
      },
    },
    accordion: {
      enabled: true,
      level: "h2",
    },
    search: {
      jumpBoxLocation: "mainHeading",
    },
    wordpressUserProfile: true,
  },
  app: {
    bookmarks: {
      enabled: true,
      elements: {
        include: ".content [id]",
        exclude: "",
      },
    },
    accordion: {
      enabled: true,
      level: "h2",
      autoClose: false,
    },
    search: {
      jumpBoxLocation: "mainHeading",
    },
    wordpressUserProfile: true,
  },
};

// Override default settings from Jekyll config

// Web settings

settings.site.baseurl = "/the-economy";

settings.site.output = "web";

settings.dynamicIndexing = true;

// Override default settings from settings.yml

settings.web.images.lazyload = true;

// Override default settings from settings.yml

settings.web.images.fullscreen = true;

settings.web.bookmarks.enabled = true;

settings.web.accordion.enabled = false;

settings.web.accordion.level = "h2";

settings.web.accordion.autoClose = false;

settings.web.search.jumpBoxLocation = "mainHeading";

settings.web.search.wordpressUserProfile = "true";

// App settings

settings.app.accordion.enabled = false;

settings.app.accordion.level = "h3";

settings.app.accordion.autoClose = false;

settings.app.search.jumpBoxLocation = "mainHeading";

// Create default metadata JS object
var metadata = {
  languages: "",
};

// Add languages to the metadata object
metadata.languages = [];

/* globals ebCheckForPage, locales, ebGetParameterByName, searchTerm */

// Load locales.yml into a locales array.

// -------
// Options
// -------

// Localise home pages in place, or redirect to different page?
const redirectHomepages = true;

// -------------------------------------------------------------

// Convert locales.yml into a JSON string.
// Note that some keys use hyphens, which are invalid JS. So to use them
// as variables, use square brackets and quotes, e.g. search['search-placeholder'].
var locales = {
  en: {
    "iso-name": "English",
    "local-name": "English",
    project: {
      organisation: "",
      url: "",
      email: "",
      name: "The Economy 2.0",
      creator: "The CORE team",
      description:
        "A complete introduction to economics and the economy; student-centred and motivated by real-world problems and real-world data.",
      image: "",
      credit: "",
    },
    features: { "copyright-page": "Copyright" },
    nav: {
      home: "Home — *The Economy* 2.0",
      menu: "Contents",
      next: "Next",
      previous: "Previous",
      back: "←",
      "nav-title": "The Economy 2.0",
    },
    links: { "anchor-link": "Link" },
    home: { read: "Read", "html-title": "The Economy" },
    input: {
      submit: "Submit",
      send: "Send",
      show: "Show",
      hide: "Hide",
      close: "Close",
    },
    filter: { placeholder: "Type here…" },
    search: {
      placeholder: "",
      "search-title": "Search",
      "placeholder-searching": "Searching...",
      notice: "",
      "search-results": "Search results",
      "results-for-singular": "result found for",
      "results-for-plural": "results found for",
      "results-for-none": "No results found for",
      "jump-to-first": "Jump to first result ↓",
    },
    contact: {
      placeholder: { name: "Name", email: "Email address", message: "Message" },
    },
    questions: {
      "check-answers-button": "Check my answers",
      "feedback-correct": "Correct!",
      "feedback-incorrect": "Incorrect",
      "feedback-unfinished": "You haven't selected all the correct answers.",
      "mark-correct": "&#10003;",
      "mark-incorrect": "&#10007;",
    },
    quiz: { total: "Total" },
    themes: { "legend-heading": "Themes and capstone units" },
    beta: {
      label: "Beta",
      message:
        "This book is a beta edition. It is in development, and we need your input to improve it. [Please send us feedback here](https://www.core-econ.org/contact-us/).",
      link: "https://www.core-econ.org/contact-us/",
    },
    annotator: {
      "show-sidebar-tooltip-title": "Open annotations",
      "show-sidebar-tooltip-description":
        "Tap here to show the annotations sidebar. Select text to highlight and create notes on this page.",
      "show-annotated-text-tooltip-title": "Highlight annotations",
      "show-annotated-text-tooltip-description": "Tap here to show or hide the annotation highlights on this page.",
    },
    accordion: { "show-all": "Expand all", "close-all": "Close all" },
    figures: {
      "see-owid": "View this data at OWiD",
      "see-more": "Explore this data at",
      "link-to-online-prefix": "To explore all of the slides in this figure, see the online version at ",
      "link-to-online-suffix": ".",
      "options-button": "Graph options",
      "see-interactive-graph": "View interactive graph",
      "see-static-graph": "View static graph",
      "enter-fullscreen": "Fullscreen",
      "exit-fullscreen": "Exit fullscreen",
    },
    video: { "options-button": "Other video options" },
    "cross-references": {
      "pre-page-number": "(page ",
      "post-page-number": ")",
    },
    footer: {
      text: "This ebook is developed by CORE Econ. More information and additional resources for learning and teaching can be found at [www.core-econ.org](https://www.core-econ.org).",
      credit: "Produced by <a href='https://electricbookworks.com'>Electric Book Works</a>",
      version: "Version",
    },
    bookmarks: {
      bookmark: "Bookmark",
      bookmarks: "Bookmarks",
      "bookmarks-tip":
        "Tap or select text, and then tap the bookmark icon to save a bookmark. Bookmarks are saved in your cache. Clearing cached data will remove them.",
      "bookmarks-tip-sync-enabled":
        "Tap or select text, and then tap the bookmark icon to save a bookmark. Unless you're <a class='bookmark-dialog-login' href='/login'>logged in</a>, bookmarks are saved in your browser, and clearing your cache will remove them.",
      "last-location": "Your last visit",
      "last-locations-tip": "The last time you visited, you stopped reading here.",
      "last-location-prompt": "Continue from your last visit?",
      "delete-bookmark": "Delete",
      "delete-all": "Delete all",
      "delete-bookmark-confirm": "Tap again to confirm",
      "delete-all-bookmarks-confirm": "Tap again to confirm",
      "bookmarks-shifted-warning":
        "A bookmark doesn't seem to match its original place exactly. The content on this page may have changed.",
    },
    controls: {
      "dark-mode": "Toggle dark mode",
      "language-select": "Select language",
    },
    pdf: {
      notice: "For instructors' use only. Please do not share with students.",
      cover: "Cover",
    },
    footnotes: {
      "close-footnote": "Close footnote",
      "reversefootnote-alt": "Back to text",
    },
    account: { login: "Log in", "my-account": "My account" },
    copy: { copy: "Copy", copied: "Copied", "copy-failed": "Sorry, try again" },
    share: {
      share: "Share",
      link: "Link",
      email: "Email",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      reddit: "Reddit",
      twitter: "Twitter",
      whatsapp: "WhatsApp",
    },
    "cookie-banner": {
      text: 'The CORE Econ website uses essential cookies to make our website work. You may disable these using your browser settings but this may affect website functionality (such as your access to logged-in resources). We would also like to use analytics cookies to help us improve the functionality of our website and improve your user experience. These analytics cookies will be set only if you accept. We do not sell or otherwise transfer personal data or usage data to any third parties or use it for any other purpose. For more detailed information about the cookies we use, see our <a href="https://www.core-econ.org/privacy-policy/">Privacy policy</a>.',
      essential: "Accept essential cookies only",
      all: "Accept all cookies",
    },
    extensions: { "read-more": "Continue reading" },
  },
};

// Various content localisations

function localiseText(pageLanguage) {
  // Get the current URL, without any query strings or hashes
  const currentURL = window.location.href.split("?")[0].split("#")[0];

  // If this is a home page and we're redirecting to translated HTML,
  // and the language concerned is defined in locales,
  // and the page we're redirecting to exists, redirect.
  // Otherwise return to quit localising.
  if (document.body.classList.contains("home")) {
    // Create a URL to redirect to, and remove possible duplicate slashes
    // (i.e. currentURL may already end with a slash)
    const proposedTranslatedLandingPage = currentURL + "/" + pageLanguage + "/";
    const possibleDoubleSlashString = "//" + pageLanguage;
    const translatedLandingPage = proposedTranslatedLandingPage.replace(possibleDoubleSlashString, "/" + pageLanguage);

    // If the translated landing page actually exists,
    // redirect to it and exit here; do not continue localising.
    if (ebCheckForPage(translatedLandingPage + "index.html")) {
      window.location.replace(translatedLandingPage);
      // And don't continue localising
      return;
    }
  }
  // Localise HTML title element on home page
  const titleElement = document.querySelector("title");
  if (
    titleElement &&
    document.querySelector("body.home") !== "undefined" &&
    locales[pageLanguage].project.name &&
    locales[pageLanguage].project.name !== ""
  ) {
    titleElement.innerHTML = locales[pageLanguage].project.name;
  }

  // Localise masthead
  const mastheadProjectName = document.querySelector(".masthead .masthead-project-name a");
  if (mastheadProjectName && locales[pageLanguage].project.name && locales[pageLanguage].project.name !== "") {
    mastheadProjectName.innerHTML = locales[pageLanguage].project.name;
  }

  // Localise search
  const searchPageHeading = document.querySelector(".search-page .content h1:first-of-type");
  if (
    searchPageHeading &&
    locales[pageLanguage].search["search-title"] &&
    locales[pageLanguage].search["search-title"] !== ""
  ) {
    searchPageHeading.innerHTML = locales[pageLanguage].search["search-title"];
  }

  // Localise search form
  const searchLanguageToLocalise = document.querySelector("#search-language");
  if (searchLanguageToLocalise) {
    searchLanguageToLocalise.setAttribute("value", pageLanguage);
  }

  // Localise search-box placeholder
  const searchInputBox = document.querySelector(".search input.search-box");
  if (searchInputBox) {
    let searchInputBoxPlaceholder = document.querySelector(".search input.search-box").placeholder;
    if (searchInputBoxPlaceholder) {
      searchInputBoxPlaceholder = locales[pageLanguage].search["search-placeholder"];
    }
  }

  // Localise search-box submit button
  const searchSubmitInput = document.querySelector(".search input.search-submit");
  if (searchSubmitInput) {
    searchSubmitInput.setAttribute("value", locales[pageLanguage].search["search-title"]);
  }

  // Localise search form label for screen readers
  const searchFormLabel = document.querySelector(".search label.visuallyhidden");
  if (searchFormLabel) {
    searchFormLabel.innerHTML = locales[pageLanguage].search["search-title"];
  }

  // Localise searching... notice
  const searchProgressPlaceholder = document.querySelector(".search-progress");
  if (searchProgressPlaceholder) {
    searchProgressPlaceholder.innerHTML = locales[pageLanguage].search["placeholder-searching"];
  }

  // Localise Google CSE search snippets
  const googleCSESearchBox = document.querySelector(".search input.search-box");
  if (googleCSESearchBox) {
    googleCSESearchBox.placeholder = locales[pageLanguage].search.placeholder;
  }

  // Add any notices set in locales as search.notice
  if (searchPageHeading && locales[pageLanguage].search.notice && locales[pageLanguage].search.notice !== "") {
    const searchNotice = document.createElement("div");
    searchNotice.classList.add("search-page-notice");
    searchNotice.innerHTML = "<p>" + locales[pageLanguage].search.notice + "</p>";
    searchPageHeading.insertAdjacentElement("afterend", searchNotice);
  }

  // We cannot localise the nav/TOC, since the root search page
  // always uses the parent-language. So we replace the nav
  // on the search page with a back button instead.
  // In case we have a back button (`$nav-bar-back-button-hide; true` in scss)
  // hide that one.
  const searchNavButtonToReplace = document.querySelector('.search-page [href="#nav"]');
  const searchNavDivToReplace = document.querySelector(".search-page #nav");
  const navBackButton = document.querySelector(".nav-back-button");
  if (searchNavButtonToReplace && navBackButton) {
    if (document.referrer !== "" || window.history.length > 0) {
      navBackButton.remove();
      searchNavButtonToReplace.innerHTML = locales[pageLanguage].nav.back;
      searchNavButtonToReplace.addEventListener("click", function (ev) {
        ev.preventDefault();
        // console.log('Going back...');
        window.history.back();
      });
    }
  }
  if (searchNavDivToReplace) {
    searchNavDivToReplace.innerHTML = "";
  }

  // If no results with GSE, translate 'No results' phrase
  window.addEventListener("load", function (event) {
    const noResultsGSE = document.querySelector(".gs-no-results-result .gs-snippet");
    if (noResultsGSE) {
      noResultsGSE.innerHTML = locales[pageLanguage].search["results-for-none"] + " ‘" + searchTerm + "’";
    }
  });

  // Localise questions
  const questionButtons = document.querySelectorAll(".question .check-answer-button");
  function replaceText(button) {
    button.innerHTML = locales[pageLanguage].questions["check-answers-button"];
  }
  if (questionButtons) {
    questionButtons.forEach(replaceText);
  }
}

function ebCheckLanguageAndLocalise() {
  "use strict";

  // Get the language in the query string
  const requestedPagePanguage = ebGetParameterByName("lang");

  // If the URL parameter specifies a language,
  // and that language is defined in locales,
  // and it is not already the page language,
  // localise the page with it.
  if (requestedPagePanguage && locales[requestedPagePanguage]) {
    localiseText(requestedPagePanguage);
  }
}

// Go

// Get the page language and localise accordingly
// (also check xml:lang for epub)

const pageLanguage =
  ebGetParameterByName("lang") || document.documentElement.lang || document.documentElement.getAttribute("xml:lang");

ebCheckLanguageAndLocalise();

// Give a parent elements a class name based on its child
// ------------------------------------------------------
//
// Useful for targeting an element because it contains
// a given child element. Currently not possible with CSS,
// because CSS can't target an element's parent node.
//
// E.g. before, we cannot target this h2 just because
// it contains a .place:
//
// <h2>Rebels in Snow
//     <span class="place">(Hoth)</span>
// </h2>
//
// but, after this script runs, we get:
//
// <h2 class="place-parent">Rebels in Snow
//     <span class="place">(Hoth)</span>
// </h2>
//
// Set the child element's class at Options below.

// Options: use querySelectorAll strings, comma-separated
// - `p > img:only-child`: paragraphs that contain only an image
// - `.slides .figure:nth-child(3):nth-last-child(1)`: slides that contain a summary and only two sub-slides
const ebMarkParentsOfTheseChildren = "p > img:only-child, .slides .figure:nth-child(3):nth-last-child(1)";

// Promote
function ebMarkParent(child, prefix) {
  "use strict";

  // If the child has a classlist, copy those class names
  // to the parent with a '-parent' suffix. This creates elegant classnames for CSS.
  // Then add a class to the parent made from the selector we've used.
  if (child.classList.length > 0) {
    let i;
    for (i = 0; i < child.classList.length; i += 1) {
      child.parentNode.classList.add(child.classList[i] + "-parent");
    }
  }
  child.parentNode.classList.add(prefix + "-parent");
}

// Find the child elements we're after and, if we find any,
// loop through them to mark their parents.
function ebMarkParents(queryStrings) {
  "use strict";

  // Create an array of query strings and loop through it, so that
  // we can treat each query string separately. This lets us use each query
  // string as a fallback prefix for a parent-element class name.
  const queryArray = queryStrings.split(",");
  let i, query, children, prefix, j;
  for (i = 0; i < queryArray.length; i += 1) {
    query = queryArray[i].trim();
    children = document.querySelectorAll(query);
    prefix = query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, "")
      .replace(/^-/, "");

    if (children.length > 0) {
      for (j = 0; j < children.length; j += 1) {
        ebMarkParent(children[j], prefix);
      }
    }
  }
}

ebMarkParents(ebMarkParentsOfTheseChildren);

/* jslint browser */
/* globals ebSlugify */

// Setup tasks on pages

// Options
// -------
const ebElementsToGetIDs = "p, li, dt, dd";

// Assign IDs and fingerprints to the ebElementsToGetIDs, e.g. for bookmarking.
// IDs contain the number of the element in the doc, with an eb- prefix.
// Then we add a data-fingerprint attribute with several components,
// so that we have different ways to mark and recognise an element,
// in future, if we suspect the bookmarks are out,
// and could fall back to the fingerprints to identify a bookmark,
// e.g. after the document has been edited. The fingerprint components
// are separated by dashes, for splitting into arrays in JS,
// constructing a queryselector (e.g. DIV:nth-child(1) > P:nth-child(2)),
// and/or as a fallback by comparing opening and/or closing strings.
// So a fingerprint comprises:
// - The element's ancestor tagNames: DIV-
// - For each ancestor, its sibling index: 0-
// - The element's tagName: P-
// - The element's index among its siblings: 1-
// - Opening [a-z] characters from element's content: itwasthebestoftimesi-
// - Closing [a-z] characters from element's content: greeofcomparisononly

// A utility function to get the index of an element
// among its siblings, where index = 1 (not 0).
// Credit https://stackoverflow.com/a/23528539/1781075
function ebGetSiblingIndex(element) {
  "use strict";
  const parent = element.parentNode;
  const index = Array.prototype.indexOf.call(parent.children, element);
  return index + 1;
}

// Assign fingerprints to all elements with IDs.
// The fingerprint does not contain the ID, because
// the point of the fingerprint is to be a substitute
// for the ID when the ID changes.
function ebAssignFingerprints(element, ancestorTagNames) {
  "use strict";

  // If we're starting off, with no element provided,
  // start with the .content div.
  if (!element) {
    element = document.querySelector(".content");
  }

  // Only fingerprint elements with IDs,
  // and elements that contain elements with IDs
  if (!element.id && element.querySelector("[id]") === null) {
    return;
  }

  // Create en empty string to complete.
  let fingerprint = "";

  // If we've been given an ancestor tagName string, add it,
  // otherwise use the element's parentElement only.
  if (ancestorTagNames) {
    fingerprint += ancestorTagNames;
  } else {
    fingerprint += element.parentElement.tagName + "-" + ebGetSiblingIndex(element.parentElement) + "-";
  }

  // Add the element's own tagName
  fingerprint += element.tagName + "-";

  // Add the element's sibling index
  fingerprint += ebGetSiblingIndex(element) + "-";

  // Remember the tagName string at this point,
  // to pass to child elements.
  const descendantTagNames = fingerprint;

  // Add an opening [a-z] string
  const openingString = ebSlugify(element.innerText.slice(0, 20)).replace(/-/g, "");
  // Add a closing [a-z] string
  const closingString = ebSlugify(element.innerText.slice(-20)).replace(/-/g, "");

  // Add them to the fingerprint
  fingerprint += openingString + "-";
  fingerprint += closingString;

  // Set the data-fingerprint attribute
  element.setAttribute("data-fingerprint", fingerprint);

  // Get the children and fingerprint them, too.
  // We need to convert the HTMLCollection to an array before doing forEach.
  const children = Array.prototype.slice.call(element.children);
  children.forEach(function (child) {
    ebAssignFingerprints(child, descendantTagNames);
  });

  // Flag that fingerprints are assigned
  document.body.setAttribute("data-fingerprints-assigned", "true");
}

function ebAssignIDs(container) {
  "use strict";

  // If no container provided, use the .content div
  if (!container) {
    container = document.querySelector(".content");
  }

  // Count from 1, giving an ID to every element without one
  let elementCounter = 1;
  let idCounter = 1;
  const elementsToID = container.querySelectorAll(ebElementsToGetIDs);

  if (elementsToID.length > 0) {
    elementsToID.forEach(function (element) {
      elementCounter += 1;
      if (!element.id) {
        element.id = "eb-" + idCounter;
        idCounter += 1;
      }
      // Once done, set status, e.g. for the accordion and bookmarking.
      // elementsToID indexes from 0, and elementCounter starts at 1, so
      // we're done when elementCounter > the number of elementsToID.
      if (elementCounter > elementsToID.length) {
        document.body.setAttribute("data-ids-assigned", "true");
        ebAssignFingerprints();
      }
    });
  } else {
    document.body.setAttribute("data-ids-assigned", "true");
    ebAssignFingerprints();
  }
}

// Assign IDs and data-fingerprint attributes
ebAssignIDs();

/*!***************************************************
 * mark.js v8.4.0
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
("use strict");
function _classCallCheck(a, b) {
  if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
}
var _extends =
    Object.assign ||
    function (a) {
      for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d]);
      }
      return a;
    },
  _createClass = (function () {
    function a(a, b) {
      for (var c = 0; c < b.length; c++) {
        var d = b[c];
        (d.enumerable = d.enumerable || !1),
          (d.configurable = !0),
          "value" in d && (d.writable = !0),
          Object.defineProperty(a, d.key, d);
      }
    }
    return function (b, c, d) {
      return c && a(b.prototype, c), d && a(b, d), b;
    };
  })(),
  _typeof =
    "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
      ? function (a) {
          return typeof a;
        }
      : function (a) {
          return a && "function" == typeof Symbol && a.constructor === Symbol ? "symbol" : typeof a;
        };
!(function (a, b, c) {
  "function" == typeof define && define.amd
    ? define([], function () {
        return a(b, c);
      })
    : "object" === ("undefined" == typeof module ? "undefined" : _typeof(module)) && module.exports
    ? (module.exports = a(b, c))
    : a(b, c);
})(
  function (a, b) {
    var c = (function () {
        function c(a) {
          _classCallCheck(this, c), (this.ctx = a);
        }
        return (
          _createClass(c, [
            {
              key: "log",
              value: function a(b) {
                var c = arguments.length <= 1 || void 0 === arguments[1] ? "debug" : arguments[1],
                  a = this.opt.log;
                this.opt.debug &&
                  "object" === ("undefined" == typeof a ? "undefined" : _typeof(a)) &&
                  "function" == typeof a[c] &&
                  a[c]("mark.js: " + b);
              },
            },
            {
              key: "escapeStr",
              value: function (a) {
                return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
              },
            },
            {
              key: "createRegExp",
              value: function (a) {
                return (
                  (a = this.escapeStr(a)),
                  Object.keys(this.opt.synonyms).length && (a = this.createSynonymsRegExp(a)),
                  this.opt.ignoreJoiners && (a = this.setupIgnoreJoinersRegExp(a)),
                  this.opt.diacritics && (a = this.createDiacriticsRegExp(a)),
                  (a = this.createMergedBlanksRegExp(a)),
                  this.opt.ignoreJoiners && (a = this.createIgnoreJoinersRegExp(a)),
                  (a = this.createAccuracyRegExp(a))
                );
              },
            },
            {
              key: "createSynonymsRegExp",
              value: function (a) {
                var b = this.opt.synonyms,
                  c = this.opt.caseSensitive ? "" : "i";
                for (var d in b)
                  if (b.hasOwnProperty(d)) {
                    var e = b[d],
                      f = this.escapeStr(d),
                      g = this.escapeStr(e);
                    a = a.replace(new RegExp("(" + f + "|" + g + ")", "gm" + c), "(" + f + "|" + g + ")");
                  }
                return a;
              },
            },
            {
              key: "setupIgnoreJoinersRegExp",
              value: function (a) {
                return a.replace(/[^(|)]/g, function (a, b, c) {
                  var d = c.charAt(b + 1);
                  return /[(|)]/.test(d) || "" === d ? a : a + "\0";
                });
              },
            },
            {
              key: "createIgnoreJoinersRegExp",
              value: function (a) {
                return a.split("\0").join("[\\u00ad|\\u200b|\\u200c|\\u200d]?");
              },
            },
            {
              key: "createDiacriticsRegExp",
              value: function (a) {
                var b = this.opt.caseSensitive ? "" : "i",
                  c = this.opt.caseSensitive
                    ? [
                        "aàáâãäåāąă",
                        "AÀÁÂÃÄÅĀĄĂ",
                        "cçćč",
                        "CÇĆČ",
                        "dđď",
                        "DĐĎ",
                        "eèéêëěēę",
                        "EÈÉÊËĚĒĘ",
                        "iìíîïī",
                        "IÌÍÎÏĪ",
                        "lł",
                        "LŁ",
                        "nñňń",
                        "NÑŇŃ",
                        "oòóôõöøō",
                        "OÒÓÔÕÖØŌ",
                        "rř",
                        "RŘ",
                        "sšśș",
                        "SŠŚȘ",
                        "tťț",
                        "TŤȚ",
                        "uùúûüůū",
                        "UÙÚÛÜŮŪ",
                        "yÿý",
                        "YŸÝ",
                        "zžżź",
                        "ZŽŻŹ",
                      ]
                    : [
                        "aÀÁÂÃÄÅàáâãäåĀāąĄăĂ",
                        "cÇçćĆčČ",
                        "dđĐďĎ",
                        "eÈÉÊËèéêëěĚĒēęĘ",
                        "iÌÍÎÏìíîïĪī",
                        "lłŁ",
                        "nÑñňŇńŃ",
                        "oÒÓÔÕÖØòóôõöøŌō",
                        "rřŘ",
                        "sŠšśŚșȘ",
                        "tťŤțȚ",
                        "uÙÚÛÜùúûüůŮŪū",
                        "yŸÿýÝ",
                        "zŽžżŻźŹ",
                      ],
                  d = [];
                return (
                  a.split("").forEach(function (e) {
                    c.every(function (c) {
                      if (c.indexOf(e) !== -1) {
                        if (d.indexOf(c) > -1) return !1;
                        (a = a.replace(new RegExp("[" + c + "]", "gm" + b), "[" + c + "]")), d.push(c);
                      }
                      return !0;
                    });
                  }),
                  a
                );
              },
            },
            {
              key: "createMergedBlanksRegExp",
              value: function (a) {
                return a.replace(/[\s]+/gim, "[\\s]*");
              },
            },
            {
              key: "createAccuracyRegExp",
              value: function (a) {
                var b = this,
                  c = this.opt.accuracy,
                  d = "string" == typeof c ? c : c.value,
                  e = "string" == typeof c ? [] : c.limiters,
                  f = "";
                switch (
                  (e.forEach(function (a) {
                    f += "|" + b.escapeStr(a);
                  }),
                  d)
                ) {
                  case "partially":
                  default:
                    return "()(" + a + ")";
                  case "complementary":
                    return "()([^\\s" + f + "]*" + a + "[^\\s" + f + "]*)";
                  case "exactly":
                    return "(^|\\s" + f + ")(" + a + ")(?=$|\\s" + f + ")";
                }
              },
            },
            {
              key: "getSeparatedKeywords",
              value: function (a) {
                var b = this,
                  c = [];
                return (
                  a.forEach(function (a) {
                    b.opt.separateWordSearch
                      ? a.split(" ").forEach(function (a) {
                          a.trim() && c.indexOf(a) === -1 && c.push(a);
                        })
                      : a.trim() && c.indexOf(a) === -1 && c.push(a);
                  }),
                  {
                    keywords: c.sort(function (a, b) {
                      return b.length - a.length;
                    }),
                    length: c.length,
                  }
                );
              },
            },
            {
              key: "getTextNodes",
              value: function (a) {
                var b = this,
                  c = "",
                  d = [];
                this.iterator.forEachNode(
                  NodeFilter.SHOW_TEXT,
                  function (a) {
                    d.push({
                      start: c.length,
                      end: (c += a.textContent).length,
                      node: a,
                    });
                  },
                  function (a) {
                    return b.matchesExclude(a.parentNode, !0) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                  },
                  function () {
                    a({ value: c, nodes: d });
                  }
                );
              },
            },
            {
              key: "matchesExclude",
              value: function (a, b) {
                var c = this.opt.exclude.concat(["script", "style", "title", "head", "html"]);
                return b && (c = c.concat(["*[data-markjs='true']"])), d.matches(a, c);
              },
            },
            {
              key: "wrapRangeInTextNode",
              value: function (a, c, d) {
                var e = this.opt.element ? this.opt.element : "mark",
                  f = a.splitText(c),
                  g = f.splitText(d - c),
                  h = b.createElement(e);
                return (
                  h.setAttribute("data-markjs", "true"),
                  this.opt.className && h.setAttribute("class", this.opt.className),
                  (h.textContent = f.textContent),
                  f.parentNode.replaceChild(h, f),
                  g
                );
              },
            },
            {
              key: "wrapRangeInMappedTextNode",
              value: function (a, b, c, d, e) {
                var f = this;
                a.nodes.every(function (g, h) {
                  var i = a.nodes[h + 1];
                  if ("undefined" == typeof i || i.start > b) {
                    var j = (function () {
                      var i = b - g.start,
                        j = (c > g.end ? g.end : c) - g.start;
                      if (d(g.node)) {
                        g.node = f.wrapRangeInTextNode(g.node, i, j);
                        var k = a.value.substr(0, g.start),
                          l = a.value.substr(j + g.start);
                        if (
                          ((a.value = k + l),
                          a.nodes.forEach(function (b, c) {
                            c >= h &&
                              (a.nodes[c].start > 0 && c !== h && (a.nodes[c].start -= j), (a.nodes[c].end -= j));
                          }),
                          (c -= j),
                          e(g.node.previousSibling, g.start),
                          !(c > g.end))
                        )
                          return { v: !1 };
                        b = g.end;
                      }
                    })();
                    if ("object" === ("undefined" == typeof j ? "undefined" : _typeof(j))) return j.v;
                  }
                  return !0;
                });
              },
            },
            {
              key: "wrapMatches",
              value: function (a, b, c, d, e) {
                var f = this,
                  g = 0 === b ? 0 : b + 1;
                this.getTextNodes(function (b) {
                  b.nodes.forEach(function (b) {
                    b = b.node;
                    for (var e = void 0; null !== (e = a.exec(b.textContent)) && "" !== e[g]; )
                      if (c(e[g], b)) {
                        var h = e.index;
                        if (0 !== g) for (var i = 1; i < g; i++) h += e[i].length;
                        (b = f.wrapRangeInTextNode(b, h, h + e[g].length)), d(b.previousSibling), (a.lastIndex = 0);
                      }
                  }),
                    e();
                });
              },
            },
            {
              key: "wrapMatchesAcrossElements",
              value: function (a, b, c, d, e) {
                var f = this,
                  g = 0 === b ? 0 : b + 1;
                this.getTextNodes(function (b) {
                  for (var h = void 0; null !== (h = a.exec(b.value)) && "" !== h[g]; ) {
                    var i = h.index;
                    if (0 !== g) for (var j = 1; j < g; j++) i += h[j].length;
                    var k = i + h[g].length;
                    f.wrapRangeInMappedTextNode(
                      b,
                      i,
                      k,
                      function (a) {
                        return c(h[g], a);
                      },
                      function (b, c) {
                        (a.lastIndex = c), d(b);
                      }
                    );
                  }
                  e();
                });
              },
            },
            {
              key: "unwrapMatches",
              value: function (a) {
                for (var c = a.parentNode, d = b.createDocumentFragment(); a.firstChild; )
                  d.appendChild(a.removeChild(a.firstChild));
                c.replaceChild(d, a), c.normalize();
              },
            },
            {
              key: "markRegExp",
              value: function (a, b) {
                var c = this;
                (this.opt = b), this.log('Searching with expression "' + a + '"');
                var d = 0,
                  e = "wrapMatches",
                  f = function (a) {
                    d++, c.opt.each(a);
                  };
                this.opt.acrossElements && (e = "wrapMatchesAcrossElements"),
                  this[e](
                    a,
                    this.opt.ignoreGroups,
                    function (a, b) {
                      return c.opt.filter(b, a, d);
                    },
                    f,
                    function () {
                      0 === d && c.opt.noMatch(a), c.opt.done(d);
                    }
                  );
              },
            },
            {
              key: "mark",
              value: function (a, b) {
                var c = this;
                this.opt = b;
                var d = 0,
                  e = "wrapMatches",
                  f = this.getSeparatedKeywords("string" == typeof a ? [a] : a),
                  g = f.keywords,
                  h = f.length,
                  i = this.opt.caseSensitive ? "" : "i",
                  j = function a(b) {
                    var f = new RegExp(c.createRegExp(b), "gm" + i),
                      j = 0;
                    c.log('Searching with expression "' + f + '"'),
                      c[e](
                        f,
                        1,
                        function (a, e) {
                          return c.opt.filter(e, b, d, j);
                        },
                        function (a) {
                          j++, d++, c.opt.each(a);
                        },
                        function () {
                          0 === j && c.opt.noMatch(b), g[h - 1] === b ? c.opt.done(d) : a(g[g.indexOf(b) + 1]);
                        }
                      );
                  };
                this.opt.acrossElements && (e = "wrapMatchesAcrossElements"), 0 === h ? this.opt.done(d) : j(g[0]);
              },
            },
            {
              key: "unmark",
              value: function (a) {
                var b = this;
                this.opt = a;
                var c = this.opt.element ? this.opt.element : "*";
                (c += "[data-markjs]"),
                  this.opt.className && (c += "." + this.opt.className),
                  this.log('Removal selector "' + c + '"'),
                  this.iterator.forEachNode(
                    NodeFilter.SHOW_ELEMENT,
                    function (a) {
                      b.unwrapMatches(a);
                    },
                    function (a) {
                      var e = d.matches(a, c),
                        f = b.matchesExclude(a, !1);
                      return !e || f ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                    },
                    this.opt.done
                  );
              },
            },
            {
              key: "opt",
              set: function (b) {
                this._opt = _extends(
                  {},
                  {
                    element: "",
                    className: "",
                    exclude: [],
                    iframes: !1,
                    separateWordSearch: !0,
                    diacritics: !0,
                    synonyms: {},
                    accuracy: "partially",
                    acrossElements: !1,
                    caseSensitive: !1,
                    ignoreJoiners: !1,
                    ignoreGroups: 0,
                    each: function () {},
                    noMatch: function () {},
                    filter: function () {
                      return !0;
                    },
                    done: function () {},
                    debug: !1,
                    log: a.console,
                  },
                  b
                );
              },
              get: function () {
                return this._opt;
              },
            },
            {
              key: "iterator",
              get: function () {
                return (
                  this._iterator || (this._iterator = new d(this.ctx, this.opt.iframes, this.opt.exclude)),
                  this._iterator
                );
              },
            },
          ]),
          c
        );
      })(),
      d = (function () {
        function a(b) {
          var c = arguments.length <= 1 || void 0 === arguments[1] || arguments[1],
            d = arguments.length <= 2 || void 0 === arguments[2] ? [] : arguments[2];
          _classCallCheck(this, a), (this.ctx = b), (this.iframes = c), (this.exclude = d);
        }
        return (
          _createClass(
            a,
            [
              {
                key: "getContexts",
                value: function () {
                  var a = void 0,
                    b = [];
                  return (
                    (a =
                      "undefined" != typeof this.ctx && this.ctx
                        ? NodeList.prototype.isPrototypeOf(this.ctx)
                          ? Array.prototype.slice.call(this.ctx)
                          : Array.isArray(this.ctx)
                          ? this.ctx
                          : [this.ctx]
                        : []),
                    a.forEach(function (a) {
                      var c =
                        b.filter(function (b) {
                          return b.contains(a);
                        }).length > 0;
                      b.indexOf(a) !== -1 || c || b.push(a);
                    }),
                    b
                  );
                },
              },
              {
                key: "getIframeContents",
                value: function (a, b) {
                  var c = arguments.length <= 2 || void 0 === arguments[2] ? function () {} : arguments[2],
                    d = void 0;
                  try {
                    var e = a.contentWindow;
                    if (((d = e.document), !e || !d)) throw new Error("iframe inaccessible");
                  } catch (a) {
                    c();
                  }
                  d && b(d);
                },
              },
              {
                key: "onIframeReady",
                value: function (a, b, c) {
                  var d = this;
                  try {
                    !(function () {
                      var e = a.contentWindow,
                        f = "about:blank",
                        g = "complete",
                        h = function () {
                          var b = a.getAttribute("src").trim(),
                            c = e.location.href;
                          return c === f && b !== f && b;
                        },
                        i = function () {
                          var e = function e() {
                            try {
                              h() || (a.removeEventListener("load", e), d.getIframeContents(a, b, c));
                            } catch (a) {
                              c();
                            }
                          };
                          a.addEventListener("load", e);
                        };
                      e.document.readyState === g ? (h() ? i() : d.getIframeContents(a, b, c)) : i();
                    })();
                  } catch (a) {
                    c();
                  }
                },
              },
              {
                key: "waitForIframes",
                value: function (a, b) {
                  var c = this,
                    d = 0;
                  this.forEachIframe(
                    a,
                    function () {
                      return !0;
                    },
                    function (a) {
                      d++,
                        c.waitForIframes(a.querySelector("html"), function () {
                          --d || b();
                        });
                    },
                    function (a) {
                      a || b();
                    }
                  );
                },
              },
              {
                key: "forEachIframe",
                value: function (b, c, d) {
                  var e = this,
                    f = arguments.length <= 3 || void 0 === arguments[3] ? function () {} : arguments[3],
                    g = b.querySelectorAll("iframe"),
                    h = g.length,
                    i = 0;
                  g = Array.prototype.slice.call(g);
                  var j = function () {
                    --h <= 0 && f(i);
                  };
                  h || j(),
                    g.forEach(function (b) {
                      a.matches(b, e.exclude)
                        ? j()
                        : e.onIframeReady(
                            b,
                            function (a) {
                              c(b) && (i++, d(a)), j();
                            },
                            j
                          );
                    });
                },
              },
              {
                key: "createIterator",
                value: function (a, c, d) {
                  return b.createNodeIterator(a, c, d, !1);
                },
              },
              {
                key: "createInstanceOnIframe",
                value: function (b) {
                  return new a(b.querySelector("html"), this.iframes);
                },
              },
              {
                key: "compareNodeIframe",
                value: function (a, b, c) {
                  var d = a.compareDocumentPosition(c),
                    e = Node.DOCUMENT_POSITION_PRECEDING;
                  if (d & e) {
                    if (null === b) return !0;
                    var f = b.compareDocumentPosition(c),
                      g = Node.DOCUMENT_POSITION_FOLLOWING;
                    if (f & g) return !0;
                  }
                  return !1;
                },
              },
              {
                key: "getIteratorNode",
                value: function (a) {
                  var b = a.previousNode(),
                    c = void 0;
                  return (c = null === b ? a.nextNode() : a.nextNode() && a.nextNode()), { prevNode: b, node: c };
                },
              },
              {
                key: "checkIframeFilter",
                value: function (a, b, c, d) {
                  var e = !1,
                    f = !1;
                  return (
                    d.forEach(function (a, b) {
                      a.val === c && ((e = b), (f = a.handled));
                    }),
                    this.compareNodeIframe(a, b, c)
                      ? (e !== !1 || f ? e === !1 || f || (d[e].handled = !0) : d.push({ val: c, handled: !0 }), !0)
                      : (e === !1 && d.push({ val: c, handled: !1 }), !1)
                  );
                },
              },
              {
                key: "handleOpenIframes",
                value: function (a, b, c, d) {
                  var e = this;
                  a.forEach(function (a) {
                    a.handled ||
                      e.getIframeContents(a.val, function (a) {
                        e.createInstanceOnIframe(a).forEachNode(b, c, d);
                      });
                  });
                },
              },
              {
                key: "iterateThroughNodes",
                value: function (a, b, c, d, e) {
                  for (
                    var f = this,
                      g = this.createIterator(b, a, d),
                      h = [],
                      i = void 0,
                      j = void 0,
                      k = function () {
                        var a = f.getIteratorNode(g);
                        return (j = a.prevNode), (i = a.node);
                      };
                    k();

                  )
                    this.iframes &&
                      this.forEachIframe(
                        b,
                        function (a) {
                          return f.checkIframeFilter(i, j, a, h);
                        },
                        function (b) {
                          f.createInstanceOnIframe(b).forEachNode(a, c, d);
                        }
                      ),
                      c(i);
                  this.iframes && this.handleOpenIframes(h, a, c, d), e();
                },
              },
              {
                key: "forEachNode",
                value: function (a, b, c) {
                  var d = this,
                    e = arguments.length <= 3 || void 0 === arguments[3] ? function () {} : arguments[3],
                    f = this.getContexts(),
                    g = f.length;
                  g || e(),
                    f.forEach(function (f) {
                      var h = function () {
                        d.iterateThroughNodes(a, f, b, c, function () {
                          --g <= 0 && e();
                        });
                      };
                      d.iframes ? d.waitForIframes(f, h) : h();
                    });
                },
              },
            ],
            [
              {
                key: "matches",
                value: function (a, b) {
                  var c = "string" == typeof b ? [b] : b,
                    d =
                      a.matches ||
                      a.matchesSelector ||
                      a.msMatchesSelector ||
                      a.mozMatchesSelector ||
                      a.oMatchesSelector ||
                      a.webkitMatchesSelector;
                  if (d) {
                    var e = !1;
                    return (
                      c.every(function (b) {
                        return !d.call(a, b) || ((e = !0), !1);
                      }),
                      e
                    );
                  }
                  return !1;
                },
              },
            ]
          ),
          a
        );
      })();
    return (
      (a.Mark = function (a) {
        var b = this,
          d = new c(a);
        return (
          (this.mark = function (a, c) {
            return d.mark(a, c), b;
          }),
          (this.markRegExp = function (a, c) {
            return d.markRegExp(a, c), b;
          }),
          (this.unmark = function (a) {
            return d.unmark(a), b;
          }),
          this
        );
      }),
      a.Mark
    );
  },
  window,
  document
);
/* jslint browser, for */
/* globals window, locales, pageLanguage, Mark,
    ebTruncatedString, MutationObserver */

// get query search term from GET query string
function getQueryVariable(variable) {
  "use strict";
  const query = window.location.search.substring(1);
  const vars = query.split("&");

  let i, pair;
  for (i = 0; i < vars.length; i += 1) {
    pair = vars[i].split("=");

    if (pair[0] === variable) {
      return decodeURIComponent(pair[1].replace(/\+/g, "%20"));
    }
  }
}

// Get some elements
const searchTerm = getQueryVariable("query");
const searchBox = document.querySelectorAll(".search-box");

// Fill the search boxes with the current search term
function fillSearchBox() {
  "use strict";
  if (searchTerm && searchBox) {
    // show the just-searched-term
    let j;
    for (j = 0; j < searchBox.length; j += 1) {
      searchBox[j].setAttribute("value", searchTerm);
    }
  }
}

// Check whether this is a search-page
function isSearchPage() {
  "use strict";
  const searchPageCheck = document.querySelector(".search-page, .content form.search");
  if (searchPageCheck) {
    return true;
  } else {
    return false;
  }
}

function ebSearchTermsOnPage() {
  "use strict";
  let searchTerms = document.querySelectorAll("[data-markjs]");

  // Filter out any results we don't want in the list:
  // - results inside noscript tags (e.g. image filenames)
  // - results in the main #nav menu
  if (searchTerms) {
    searchTerms = Array.from(searchTerms).filter(function (term) {
      if (term.closest("noscript") || term.closest("#nav")) {
        return false;
      } else {
        return true;
      }
    });

    if (searchTerms.length && searchTerms.length > 0) {
      // Create a box with a list inside it
      const wrapper = document.createElement("div");
      wrapper.classList.add("search-results-nav");
      const list = document.createElement("ol");
      list.classList.add("search-results-list");
      wrapper.append(list);

      // Give the box a heading
      const heading = document.createElement("h2");
      let headingPhrase = locales[pageLanguage].search["results-for-singular"];
      if (searchTerms.length > 1) {
        headingPhrase = locales[pageLanguage].search["results-for-plural"];
      }
      heading.innerHTML =
        searchTerms.length +
        " " +
        headingPhrase +
        " " +
        ' <span class="search-results-nav-term">' +
        searchTerm +
        "</span>";
      wrapper.insertAdjacentElement("afterbegin", heading);

      // Add a hide button to the box
      const hideButton = document.createElement("button");
      hideButton.classList.add("search-results-nav-hide");
      hideButton.innerHTML = locales[pageLanguage].input.hide;
      wrapper.insertAdjacentElement("afterbegin", hideButton);
      hideButton.addEventListener("click", function () {
        if (wrapper.getAttribute("data-hidden") === "true") {
          wrapper.setAttribute("data-hidden", "false");
          hideButton.innerHTML = locales[pageLanguage].input.hide;
        } else {
          wrapper.setAttribute("data-hidden", "true");
          hideButton.innerHTML = locales[pageLanguage].input.show;
        }
      });

      // Add a close button to the box,
      // which also hides marked search terms on page.
      const closeButton = document.createElement("button");
      closeButton.title = locales[pageLanguage].input.close;
      closeButton.classList.add("search-results-nav-close");
      closeButton.innerHTML = "✕";
      hideButton.insertAdjacentElement("afterend", closeButton);
      closeButton.addEventListener("click", function () {
        wrapper.remove();
        document.body.setAttribute("data-markjs", "unmark");
      });

      // If the search term is actually multiple search terms
      // (e.g "Florence Nightingale" is florence and nightingale)
      // then we must not add the same link that many times.
      // We need to check if the element we're linking to
      // is already in the search results. This array is for
      // remembering each link we create.
      const links = [];

      // Start a counter for search terms
      let searchTermCounter = 0;

      // Add the search terms to the list
      searchTerms.forEach(function (term) {
        // Get a surrounding text snippet
        // from the first ancestor with an ID,
        // unless it's in a figure with an ID, in which case
        // get us the figure's ID. This is mainly because
        // the accordion can't find elements inside slidelines.
        let parentTextElement;
        const potentialFigureAncestor = term.closest(".figure[id]");
        if (potentialFigureAncestor) {
          parentTextElement = potentialFigureAncestor;
        } else {
          parentTextElement = term.closest("[id]");
        }

        // If the link has not already been used,
        // continue to add it to the list.
        if (parentTextElement && links.indexOf(parentTextElement) === -1) {
          // Add this link to the links array
          links.push(parentTextElement);

          // If there is a snippet, use that to create a link
          // to the relevant snippet
          if (parentTextElement.id) {
            // Truncate the text
            const text = ebTruncatedString(parentTextElement.innerText, 60, " …");

            // Create a link containing the text,
            // and put the link in a list item.
            const link = document.createElement("a");
            link.innerHTML = text;
            link.href = "#" + parentTextElement.id;
            const listItem = document.createElement("li");
            listItem.append(link);
            list.append(listItem);
          }
        }

        searchTermCounter += 1;
        if (searchTermCounter === searchTerms.length) {
          // Flag that result are ready, so that other scripts
          // like accordion.js, can listen for clicks on its links.
          document.body.setAttribute("data-search-results", "active");
        }
      });

      // Add the box to the page
      document.body.append(wrapper);
    }
  } else {
    document.body.setAttribute("data-search-results", "none");
  }
}

function ebMarkSearchTermsOnPage() {
  "use strict";

  // Ask mark.js to mark all the search terms.
  // We mark both the searchTerm and the search-query stem
  const markInstance = new Mark(document.querySelector(".content"));
  if (searchTerm || getQueryVariable("search_stem")) {
    // Create an array containing the search term
    // and the search stem to pass to mark.js
    const arrayToMark = [];

    // Add them to the array if they exist
    if (searchTerm) {
      arrayToMark.push(searchTerm);
    }
    if (getQueryVariable("search_stem")) {
      arrayToMark.push(getQueryVariable("search_stem"));
    }

    // Mark their instances on the page
    markInstance.unmark().mark(arrayToMark);

    // Show the search-results nav
    ebSearchTermsOnPage();
  } else {
    document.body.setAttribute("data-search-results", "none");
  }
}

// Wait for ids to be on the page, and the indexing stuff,
// before marking search terms, so that IDs are stable.
function ebPrepareSearchTermsOnPage() {
  "use strict";

  const searchTermsObserver = new MutationObserver(function (mutations) {
    let readyForSearchTerms = false;
    mutations.forEach(function (mutation) {
      if (mutation.type === "attributes" && readyForSearchTerms === false) {
        if (document.body.getAttribute("data-index-targets") && document.body.getAttribute("data-ids-assigned")) {
          readyForSearchTerms = true;
          ebMarkSearchTermsOnPage();
          searchTermsObserver.disconnect();
        }
      }
    });
  });

  searchTermsObserver.observe(document.body, {
    attributes: true, // listen for attribute changes
  });
}

// Start
if (isSearchPage() === false) {
  ebPrepareSearchTermsOnPage();
} else {
  fillSearchBox();
  document.body.setAttribute("data-search-results", "none");
}

/* jslint browser, for */
/* globals window, ebToggleClickout */

function ebNavKeyboardAccess() {
  "use strict";

  // All of the links that are always visible are keyboard accessible
  const firstOrderLinks = document.querySelectorAll("#nav li.has-children > a");
  firstOrderLinks.forEach(function (link) {
    link.setAttribute("tabindex", "0");
  });

  // Make all of the visually hidden sublinks inacccessible
  const submenuLinks = document.querySelectorAll("#nav li.has-children ol a");
  submenuLinks.forEach(function (link) {
    link.setAttribute("tabindex", "-1");
  });

  // then, when the sublist is visible, make the relevant links accessible
  firstOrderLinks.forEach(function (link) {
    link.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const thisMenu = link.closest("li.has-children");
        thisMenu.querySelector("ol").classList.toggle("visuallyhidden");

        const thisMenusButton = thisMenu.querySelector("button[data-toggle]");
        thisMenusButton.classList.toggle("show-children");

        const theseSubMenuLinks = thisMenu.querySelectorAll("li ol a");
        theseSubMenuLinks.forEach(function (sublink) {
          if (sublink.hasAttribute("tabindex")) {
            sublink.removeAttribute("tabindex");
          } else {
            sublink.setAttribute("tabindex", "-1");
          }
        });
      }
    });
  });

  // need to have the same thing happen when the toggle button is used
  const toggleButtons = document.querySelectorAll("#nav li.has-children.no-link button[data-toggle]");
  toggleButtons.forEach(function (button) {
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const thisMenu = button.closest("li.has-children");
        const theseSubMenuLinks = thisMenu.querySelectorAll("li ol a");

        theseSubMenuLinks.forEach(function (sublink) {
          if (sublink.hasAttribute("tabindex")) {
            sublink.removeAttribute("tabindex");
          } else {
            sublink.setAttribute("tabindex", "-1");
          }
        });
      }
    });
  });
}

function ebNav() {
  "use strict";

  // let Opera Mini use the footer-anchor pattern
  if (navigator.userAgent.indexOf("Opera Mini") === -1) {
    // let newer browsers use js-powered menu
    if (document.querySelector !== "undefined" && window.addEventListener) {
      // set js nav class
      document.documentElement.classList.add("js-nav");

      // set up the variables
      const menuLink = document.querySelector('[href="#nav"]');
      const menu = document.querySelector("#nav");

      // hide the menu until we click the link
      menu.classList.add("visuallyhidden");

      // add a close button
      let closeButton = "<button data-toggle data-nav-close>";
      closeButton += '<span class="visuallyhidden">Close menu</span>';
      closeButton += "</button>";
      menu.insertAdjacentHTML("afterBegin", closeButton);

      // hide the children and add the button for toggling
      const subMenus = document.querySelectorAll("#nav .has-children, #nav .has-children");
      let showChildrenButton = "<button data-toggle data-toggle-nav>";
      showChildrenButton += '<span class="visuallyhidden">Toggle</span>';
      showChildrenButton += "</button>";
      let i;
      for (i = 0; i < subMenus.length; i += 1) {
        subMenus[i].querySelector("ol, ul").classList.add("visuallyhidden");
        subMenus[i].querySelector("a, .docs-list-title").insertAdjacentHTML("afterend", showChildrenButton);
      }

      // Mark parents of active children active too
      const activeChildren = menu.querySelectorAll("li.active");
      let j, equallyActiveParent;
      for (j = 0; j < activeChildren.length; j += 1) {
        equallyActiveParent = activeChildren[j].closest("li:not(.active)");
        if (equallyActiveParent && equallyActiveParent !== "undefined") {
          equallyActiveParent.classList.add("active");
        }
      }

      // show the menu when we click the link
      menuLink.addEventListener(
        "click",
        function (ev) {
          ev.preventDefault();
          ebToggleClickout(menu, function () {
            menu.classList.toggle("visuallyhidden");
            document.documentElement.classList.toggle("js-nav-open");
          });
        },
        true
      );

      // Show the menu using the Enter key
      menuLink.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          ebToggleClickout(menu, function () {
            menu.classList.toggle("visuallyhidden");
            document.documentElement.classList.toggle("js-nav-open");
            document.querySelector("button[data-nav-close]").focus();
          });
        }
      });

      const ebHideMenu = function () {
        menu.classList.add("visuallyhidden");
        document.documentElement.classList.remove("js-nav-open");
        document.querySelector("a.nav-button").focus();
      };

      // Close the nav with the Escape key
      menu.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          // Need to leave language selector alone if it is open
          // Otherwise the user will get unexpected behaviour
          const languageSelector = menu.querySelector(".language-select");
          const eventTarget = event.target;
          if (languageSelector && languageSelector.contains(eventTarget) && eventTarget !== languageSelector) {
            return;
          }
          event.preventDefault();
          ebToggleClickout(menu, function () {
            ebHideMenu();
          });
        }
      });

      // listen for clicks inside the menu
      menu.addEventListener("click", function (ev) {
        const clickedElement = ev.target || ev.srcElement;

        // hide the menu when we click the button
        if (clickedElement.hasAttribute("data-nav-close")) {
          ev.preventDefault();
          ebToggleClickout(menu, function () {
            ebHideMenu();
          });
          return;
        }

        // show the children when we click a .has-children
        if (clickedElement.hasAttribute("data-toggle-nav")) {
          ev.preventDefault();
          clickedElement.classList.toggle("show-children");
          clickedElement.nextElementSibling.classList.toggle("visuallyhidden");
          return;
        }

        // if it's an anchor with an href (an in-page link)
        if (clickedElement.tagName === "A" && clickedElement.getAttribute("href")) {
          ebToggleClickout(menu, function () {
            ebHideMenu();
          });
          return;
        }

        // if it's an anchor without an href (a nav-only link)
        if (clickedElement.tagName === "A") {
          clickedElement.nextElementSibling.classList.toggle("show-children");
          clickedElement.nextElementSibling.nextElementSibling.classList.toggle("visuallyhidden");
        }
      });

      // This enables a back button, e.g. for where we don't have a
      // browser or hardware back button, and we have Jekyll add one.
      // This button is hidden in scss with `$nav-bar-back-button-hide: true;`.
      // If the user has navigated (i.e. there is a document referrer),
      // listen for clicks on our back button and go back when clicked.
      // We check history.length > 2 because new tab plus landing page
      // can constitute 2 entries in the history (varies by browser).
      let navBackButton;
      if (document.referrer !== "" || window.history.length > 2) {
        navBackButton = document.querySelector("a.nav-back-button");
        if (navBackButton) {
          navBackButton.addEventListener("click", function (ev) {
            ev.preventDefault();
            window.history.back();
          });
        }
      } else {
        navBackButton = document.querySelector("a.nav-back-button");
        if (navBackButton) {
          navBackButton.parentNode.removeChild(navBackButton);
        }
      }
    }
  }
}

if (document.querySelector("#nav")) {
  ebNav();
  ebNavKeyboardAccess();
}

/* jslint browser */
/* globals window, IntersectionObserver, ebTrackYoutubeVideoPlay, YT, settings, ebTrackVideoOptionClicks */

function ebVideoInit() {
  "use strict";
  return (
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelector &&
    !!Array.prototype.forEach &&
    document.body.classList &&
    document.addEventListener &&
    document.querySelectorAll(".videowrapper")
  );
}

const ebVideoHosts = {
  youtube: "https://www.youtube.com/embed/",
  vimeo: "https://player.vimeo.com/video/",
};

function ebGetVideoHost(videoElement) {
  "use strict";
  let videoHost;
  const classes = videoElement.classList;

  classes.forEach(function (currentClass) {
    if (Object.keys(ebVideoHosts).includes(currentClass)) {
      videoHost = currentClass;
    }
  });

  return videoHost;
}

function ebVideoSubtitles(videoElement) {
  "use strict";
  let subtitles = videoElement.getAttribute("data-video-subtitles");
  if (subtitles === "true") {
    subtitles = 1;
    return subtitles;
  }
}

function ebVideoLanguage(videoElement) {
  "use strict";
  const language = videoElement.getAttribute("data-video-language");
  return language;
}

function ebVideoGetTitle(videoElement) {
  "use strict";
  const videoTitle = videoElement.getAttribute("data-title");
  return videoTitle;
}

function ebVideoTimestamp(videoElement) {
  "use strict";
  if (videoElement.getAttribute("data-video-timestamp")) {
    const timestamp = videoElement.getAttribute("data-video-timestamp");
    return timestamp;
  }
}

function ebVideoMakeIframe(videoElement, host, videoId, videoLanguage, videoSubtitles, videoTimestamp, videoTitle) {
  "use strict";

  // Get which video host, e.g. YouTube or Vimeo
  const hostURL = ebVideoHosts[host];

  // Set parameters, starting with autoplay off
  let parametersString = "?autoplay=0";

  // Add a language, if any
  if (videoLanguage) {
    if (host === "youtube") {
      parametersString += "&cc_lang_pref=" + videoLanguage;
    }
  }

  // Add subtitles, if any
  if (videoSubtitles) {
    if (host === "youtube") {
      parametersString += "&cc_load_policy=" + videoSubtitles;
    }
  }

  // Add a timestamp, if any
  if (videoTimestamp) {
    if (host === "youtube") {
      parametersString += "&start=" + videoTimestamp;
    }
    if (host === "vimeo") {
      parametersString += "#t=" + videoTimestamp;
    }
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("frameborder", 0);
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("src", hostURL + videoId + parametersString);
  iframe.setAttribute("title", videoTitle);

  videoElement.removeAttribute("data-title");

  return iframe;
}

function onYouTubeIframeAPIReady() {
  // This is called by the youtube iframe API
  // and initiates the YT object
}

function ebVideoUseTheYoutubeIFrameAPI(
  videoId,
  videoLanguage,
  videoSubtitles,
  videoTitle,
  videoTimestamp,
  currentVideo
) {
  function onPlayerStateChange(event) {
    const playerStatus = event.data;
    // Watch for the video to start playing
    if (playerStatus === 1) {
      // call the tracking function from analytics.js
      ebTrackYoutubeVideoPlay(currentVideo);
    }
  }

  let player;
  YT.ready(function () {
    player = new YT.Player(videoId, {
      videoId,
      playerVars: {
        cc_lang_pref: videoLanguage,
        cc_load_policy: videoSubtitles,
        start: videoTimestamp,
        enablejsapi: 1,
      },
      events: {
        onStateChange: onPlayerStateChange.bind(currentVideo),
      },
    });

    // Add a useful title for accessibility
    const iframe = player.getIframe();
    iframe.setAttribute("title", videoTitle);
  });
}

// Only show video options on button click
function ebVideoOptionsDropdown(video) {
  "use strict";

  const videoOptions = video.querySelector(".video-options");
  if (videoOptions) {
    const button = videoOptions.querySelector("button");
    const options = videoOptions.querySelector(".video-options-content");
    options.classList.add("js-video-options-content");
    button.addEventListener("click", function () {
      options.classList.toggle("js-video-options-content-visible");
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        options.classList.toggle("js-video-options-content-visible");
      }
    });
    // Close the dropdown when you press Escape
    videoOptions.addEventListener("keydown", function (event) {
      if (options.classList.contains("js-video-options-content-visible") && event.key === "Escape") {
        options.classList.remove("js-video-options-content-visible");
        button.focus();
      }
    });

    // Call the tracking function from analytics.js
    if (settings.site.output === "web") {
      ebTrackVideoOptionClicks(video);
    }
  }
}

// ebVideoShow is called from accordions.js,
// when a section is opened, for the videos in that section.
function ebVideoShow(section) {
  "use strict";
  // early exit for unsupported browsers
  if (!ebVideoInit()) {
    return;
  }

  let videos = [];
  if (section) {
    videos = section.querySelectorAll(".video");
  } else {
    videos = document.querySelectorAll(".video");
  }

  videos.forEach(function (currentVideo) {
    // first check whether it is necessary to run the video builder
    if (!currentVideo.classList.contains("video-embedded")) {
      const videoHost = ebGetVideoHost(currentVideo);
      const videoId = currentVideo.getAttribute("data-video-id");
      const videoLanguage = ebVideoLanguage(currentVideo);
      const videoSubtitles = ebVideoSubtitles(currentVideo);
      const videoTitle = ebVideoGetTitle(currentVideo);
      const videoTimestamp = ebVideoTimestamp(currentVideo);

      const videowrapper = currentVideo.querySelector(".video-wrapper");
      currentVideo.classList.add("video-embedded");

      // Remove unnecessary anchor element
      if (videowrapper.querySelector("a")) {
        videowrapper.removeChild(videowrapper.querySelector("a"));
      }

      if (videoHost === "youtube" && settings.site.output === "web") {
        // Use the youtube iframe api for youtube videos
        // There is a holder div with id=videoId that will be replaced
        // with an iframe by the API
        ebVideoUseTheYoutubeIFrameAPI(videoId, videoLanguage, videoSubtitles, videoTitle, videoTimestamp, currentVideo);
      } else {
        const iframe = ebVideoMakeIframe(
          currentVideo,
          videoHost,
          videoId,
          videoLanguage,
          videoSubtitles,
          videoTimestamp,
          videoTitle
        );
        videowrapper.appendChild(iframe);
      }

      // Scriptify the options dropdown
      ebVideoOptionsDropdown(currentVideo);
    }
  });
}

// Sometimes the accordion script won't trigger ebVideoShow,
// so we listen for the video on the page as a fallback.
function ebVideoWatch() {
  "use strict";

  // Create an array and then populate it with images.
  let videos = [];
  videos = document.querySelectorAll(".video");

  // If IntersectionObserver is supported,
  // create a new one that will use it on all the videos.
  if (Object.prototype.hasOwnProperty.call(window, "IntersectionObserver")) {
    const ebVideoObserverConfig = {
      rootMargin: "200px", // load when it's 200px from the viewport
    };

    const videoObserver = new IntersectionObserver(function (entries, videoObserver) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const video = entry.target;

          // Show the video iframe
          ebVideoShow(video);

          // Stop observing the image once loaded
          videoObserver.unobserve(video);
        }
      });
    }, ebVideoObserverConfig);

    // Observe each image
    videos.forEach(function (video) {
      videoObserver.observe(video);
    });
  } else {
    // If the browser doesn't support IntersectionObserver,
    // just load all the videos.
    videos.forEach(function (video) {
      ebVideoShow(video);
    });
  }
}

ebVideoShow();
// ebVideoWatch()

/* jslint */
/* globals window, locales, pageLanguage, XMLHttpRequest */

// -----------------------------
// Options
// 1. If you're pining scores to a Wordpress database,
//    enter the name of the cookie it leaves here.
const wordpressCookieName = "coreproject_sess";
// -----------------------------

function ebMCQsInit() {
  "use strict";
  // check for browser support of the features we use
  // and presence of mcqs
  return (
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelector &&
    !!Array.prototype.forEach &&
    window.addEventListener &&
    document.querySelectorAll(".mcq") &&
    !document.querySelector(".table-of-questions")
  );
}

function ebMCQsFindNumberOfCorrectAnswers(questionCode) {
  "use strict";
  // not digits
  const digitsRegex = /\D/;

  // apply the regex
  const matchedDigitsRegex = questionCode.match(digitsRegex);

  // grab the index of the match
  const numberOfCorrectAnswers = matchedDigitsRegex.index;

  return numberOfCorrectAnswers;
}

function ebMCQsPositionOfCorrectAnswer(trimmedQuestionCode) {
  "use strict";
  // vowels * numberOfCorrectAnswers, then consonants * numberOfCorrectAnswers, repeated numberOfCorrectAnswers times
  // vowel regex
  const vowelRegex = /[aeiou]*/;

  // apply the regex
  const matchedVowelRegex = trimmedQuestionCode.match(vowelRegex);

  // get the length of the matched thing
  const positionOfCorrectAnswer = matchedVowelRegex[0].length;

  return positionOfCorrectAnswer;
}

function ebMCQsDobfuscateQuestionCode(questionCode) {
  "use strict";
  // find the first batch of numbers in the string
  const numberOfCorrectAnswers = ebMCQsFindNumberOfCorrectAnswers(questionCode);

  // trim the string
  const questionCodeLength = questionCode.length;
  let trimmedQuestionCode = questionCode.substr(numberOfCorrectAnswers, questionCodeLength);

  // initialise our array
  const correctAnswers = [];

  // loop for the right length: numberOfCorrectAnswers long
  let i, positionOfCorrectAnswer;
  for (i = 0; i < numberOfCorrectAnswers; i += 1) {
    positionOfCorrectAnswer = ebMCQsPositionOfCorrectAnswer(trimmedQuestionCode);
    correctAnswers.push(positionOfCorrectAnswer);

    // trim the bit we've used out of the string
    trimmedQuestionCode = trimmedQuestionCode.substr(positionOfCorrectAnswer * 2, trimmedQuestionCode.length);
  }
  return correctAnswers;
}

function ebMCQsGetCorrectAnswers(question) {
  "use strict";

  // get the correct answers
  const questionCode = question.getAttribute("data-question-code");
  const correctAnswers = ebMCQsDobfuscateQuestionCode(questionCode);

  // set the default correctAnswersObj
  const correctAnswersObj = {};

  // get all the feedbacks for this questions
  const feedbacks = question.querySelectorAll(".mcq-feedback li");

  // set it all false for now
  feedbacks.forEach(function (feedback, index) {
    correctAnswersObj[index + 1] = false;
  });

  // update correctAnswersObj from the correctAnswers array
  correctAnswers.forEach(function (correctAnswer) {
    correctAnswersObj[correctAnswer] = true;
  });

  return correctAnswersObj;
}

function ebMCQsMakeOptionCheckboxes(question) {
  "use strict";
  const dataQuestion = question.getAttribute("data-question");
  // get all the options for this question
  const options = question.querySelectorAll(".mcq-options li");

  // loop over options
  options.forEach(function (option, index) {
    // create a unique id for this mcq option
    const optionLetter = String.fromCharCode(index + 65);
    const id = dataQuestion + "-option-" + optionLetter;

    // make the checkbox
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("data-index", index);
    checkbox.setAttribute("id", id);
    checkbox.setAttribute("name", dataQuestion);

    // make a label to put around the checkbox
    const label = document.createElement("label");
    label.setAttribute("for", id);

    // the label gets the checkbox as a child
    label.appendChild(checkbox);

    // add a span for numbering the options
    const number = document.createElement("span");
    number.classList.add("option-number");
    number.innerHTML = (index + 1).toString() + ". ";

    // wrap the text in a span for styling
    const span = document.createElement("span");
    span.classList.add("option-text");
    span.innerHTML = option.innerHTML;

    // now the label gets the option text
    // label.innerHTML = label.innerHTML + option.innerHTML
    label.appendChild(number);
    label.appendChild(span);

    // remove the now-duplicate option text
    // and put the label inside the option
    option.innerHTML = "";
    option.appendChild(label);

    // make the option non-bookmarkable
    option.setAttribute("data-bookmarkable", "no");
  });
}

function ebMCQsAddButton(question) {
  "use strict";
  // make the button
  const button = document.createElement("button");
  button.innerHTML = locales[pageLanguage].questions["check-answers-button"];
  button.classList.add("check-answer-button");

  // now add it to question, after the options
  const feedback = question.querySelector(".mcq-feedback, .question-feedback");
  feedback.insertAdjacentElement("beforebegin", button);
}

const ebMCQsMakeQuestionAccessible = function (question) {
  // wrap everything inside the div in a fieldset
  const questionContents = question.innerHTML;
  const fieldset = document.createElement("fieldset");

  fieldset.innerHTML = questionContents;
  question.innerHTML = "";
  question.appendChild(fieldset);

  // // get the h3 and wrap the contents of the h3 in a legend
  // const questionHeading = question.querySelector('h3')
  // const questionHeadingContents = questionHeading.innerHTML

  // const legend = document.createElement('legend')
  // legend.innerHTML = questionHeadingContents

  // questionHeading.innerHTML = ''
  // questionHeading.appendChild(legend)
};

function ebMCQsGetAllSelected(mcqsToCheck) {
  "use strict";

  // set the default selectedOptions
  const selectedOptions = {};

  // set it all false for now
  const allTheCheckboxes = mcqsToCheck.querySelectorAll('[type="checkbox"]');
  allTheCheckboxes.forEach(function (selectedCheckbox, index) {
    selectedOptions[index + 1] = false;
  });

  // update for the selected ones
  const selectedCheckboxes = mcqsToCheck.querySelectorAll('[type="checkbox"]:checked');
  selectedCheckboxes.forEach(function (selectedCheckbox) {
    const dataIndex = parseFloat(selectedCheckbox.getAttribute("data-index"));
    selectedOptions[dataIndex + 1] = true;
  });

  return selectedOptions;
}

function ebMCQsHideAllFeedback(mcqsToCheck) {
  "use strict";

  const feedback = mcqsToCheck.querySelector(".mcq-feedback");
  const feedbacks = feedback.querySelectorAll("li");
  feedback.classList.remove("mcq-feedback-shown-inside");

  feedbacks.forEach(function (feedback) {
    // reset the styles
    feedback.classList.remove("mcq-feedback-show");
  });
}

function ebMCQsShowSelectedOptions(mcqsToCheck, selectedOptions) {
  "use strict";

  const feedback = mcqsToCheck.querySelector(".mcq-feedback");
  const feedbacks = feedback.querySelectorAll("li");
  feedback.classList.add("mcq-feedback-shown-inside");

  feedbacks.forEach(function (feedback, index) {
    // if it's been selected, show it
    if (selectedOptions[index + 1]) {
      feedback.classList.add("mcq-feedback-show");
    }

    // make the feedback non-bookmarkable
    feedback.setAttribute("data-bookmarkable", "no");
  });
}

function ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs) {
  "use strict";

  const feedback = mcqsToCheck.querySelector(".mcq-feedback");
  const feedbacks = feedback.querySelectorAll("li");
  feedback.classList.add("mcq-feedback-shown-inside");

  feedbacks.forEach(function (feedback, index) {
    // if it's been selected, and it's incorrect, show it
    if (selectedOptions[index + 1] && selectedOptions[index + 1] !== correctAnswersForThisMCQs[index + 1]) {
      feedback.classList.add("mcq-feedback-show");
    }

    // make the feedback non-bookmarkable
    feedback.setAttribute("data-bookmarkable", "no");
  });
}

function ebMCQsMarkSelectedOptions() {
  "use strict";
  // get all the options
  const questionOptions = document.querySelectorAll(".mcq-options li");

  // loop over them
  questionOptions.forEach(function (questionOption) {
    // listen for clicks on the label and add/remove .selected to the li
    questionOption.addEventListener("click", function () {
      if (this.querySelector('[type="checkbox"]:checked')) {
        this.classList.add("selected");
      } else {
        this.classList.remove("selected");
      }
    });
  });
}

function ebMCQsGetAllCorrectAnswers() {
  "use strict";
  // initialise answer store
  const ebMCQsCorrectAnswersForPage = {};

  // get all the questions
  const questions = document.querySelectorAll(".question");

  // loop over questions
  questions.forEach(function (question) {
    // get the correct answers
    const correctAnswersObj = ebMCQsGetCorrectAnswers(question);

    // get the ID, then put the answer set into the store
    const dataQuestion = question.getAttribute("data-question");
    ebMCQsCorrectAnswersForPage[dataQuestion] = correctAnswersObj;
  });

  return ebMCQsCorrectAnswersForPage;
}

function ebMCQsExactlyRight(correctAnswersForThisMCQs, selectedOptions) {
  "use strict";
  // compare each selectedOption with the correctAnswer
  // if one is wrong, exit with false
  let optionNumber;
  for (optionNumber in selectedOptions) {
    if (selectedOptions[optionNumber] !== correctAnswersForThisMCQs[optionNumber]) {
      return false;
    }
  }

  // if we haven't been kicked out yet, it must be exactly right
  return true;
}

function ebMCQsNotAllTheCorrectAnswers(correctAnswersForThisMCQs, selectedOptions) {
  "use strict";
  let numberOfCorrectAnswers = 0;
  let numberOfSelectedCorrectAnswers = 0;
  let numberOfSelectedIncorrectAnswers = 0;

  // loop through the correct answers
  let key;
  for (key in correctAnswersForThisMCQs) {
    // count correct answers
    if (correctAnswersForThisMCQs[key]) {
      numberOfCorrectAnswers += 1;
    }

    // count selected correct answers
    if (correctAnswersForThisMCQs[key] && selectedOptions[key]) {
      numberOfSelectedCorrectAnswers += 1;
    }

    // count selected incorrect answers
    if (!correctAnswersForThisMCQs[key] && selectedOptions[key]) {
      numberOfSelectedIncorrectAnswers += 1;
    }
  }

  // if we haven't selected all the correct answers
  // and we haven't selected any incorrect answers
  if (numberOfSelectedCorrectAnswers < numberOfCorrectAnswers && numberOfSelectedIncorrectAnswers === 0) {
    return true;
  }

  return false;
}

// get the WordPress ID from a cookie, or return false if we don't have one
function ebMCQsWordPressUserId() {
  "use strict";

  const cookieName = wordpressCookieName;

  // get the cookie, split it into bits
  const cookie = document.cookie.split("; ");

  const WordPressUserIdCookie = cookie.find(function (el) {
    // if it starts with our wordpressCookieName in options above, it's our WP one
    return el.indexOf(cookieName) === 0;
  });

  if (!WordPressUserIdCookie) {
    // we're logged out, anon
    return false;
  }

  // decode it and remove the cookie name
  const decodedCookie = decodeURIComponent(WordPressUserIdCookie).replace(cookieName + "=", "");

  return decodedCookie;
}

// Add the WordPress account button to the nav,
// change the text based on logged in or not
function ebMCQsAddWordPressAccountButton() {
  "use strict";
  // get #nav
  const theNav = document.querySelector("#nav");

  // get the element in the nav that we'll insert before
  const insertBeforeTarget = theNav.querySelector("h2");

  // make the WordPress link to insert into the nav
  const accountLink = document.createElement("a");
  accountLink.innerText = locales[pageLanguage].account.login;
  accountLink.href = "/login/";
  accountLink.classList.add("wordpress-link");

  // add the account link to the nav
  theNav.insertBefore(accountLink, insertBeforeTarget);

  if (ebMCQsWordPressUserId()) {
    // change the button text and href
    accountLink.innerText = locales[pageLanguage].account["my-account"];
    accountLink.href = "/account/";
  }
}

// Send a bit of JSON for eacn question submission
function ebMCQsSendtoWordPress(quizId, score) {
  "use strict";
  // if we don't have a user id, early exit
  const userId = ebMCQsWordPressUserId();
  if (!ebMCQsWordPressUserId()) {
    return;
  }

  // make the object to send
  const data = {
    action: "quiz_score", // existing action name
    book_id: 1,
    quiz_id: quizId,
    user_id: userId,
    score,
  };

  // set url to send json to
  const wordPressURL = "/wp-admin/admin-ajax.php";

  // send the data
  // first build the data structure into a string
  const query = [];
  let key;

  // make an array of 'key=value' with special characters encoded
  for (key in data) {
    query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
  }
  const dataText = query.join("&"); // join the array into 'key=value1&key2=value2...'
  // now send the data
  const req = new XMLHttpRequest(); // create the request
  req.open("POST", wordPressURL, true); // put in the target url here!
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.send(dataText); // so we send the encoded data not the original data structure
}

function ebMCQsButtonClicks() {
  "use strict";
  // get all the buttons
  const answerCheckingButtons = document.querySelectorAll(".check-answer-button");

  // for each button
  answerCheckingButtons.forEach(function (answerCheckingButton) {
    // listen for clicks on the buttons
    answerCheckingButton.addEventListener("click", function () {
      // get the mcq and it's ID
      const mcqsToCheck = this.closest("[data-question]"); // 'this' is the button
      const mcqsToCheckName = mcqsToCheck.getAttribute("data-question");
      // var mcqsToCheckCode = mcqsToCheck.getAttribute('data-question-code'); // not used

      // reset the styles
      ebMCQsHideAllFeedback(mcqsToCheck);

      // get the selected options (the checked ones)
      const selectedOptions = ebMCQsGetAllSelected(mcqsToCheck);

      // get the correct answers for this mcq
      const ebMCQsCorrectAnswersForPage = ebMCQsGetAllCorrectAnswers();
      const correctAnswersForThisMCQs = ebMCQsCorrectAnswersForPage[mcqsToCheckName];

      mcqsToCheck.classList.remove("mcq-incorrect");
      mcqsToCheck.classList.remove("mcq-partially-correct");
      mcqsToCheck.classList.remove("mcq-correct");

      // set score
      let score = 0;

      // if exactly right, mark it so, show options
      if (ebMCQsExactlyRight(correctAnswersForThisMCQs, selectedOptions)) {
        mcqsToCheck.classList.add("mcq-correct");
        ebMCQsShowSelectedOptions(mcqsToCheck, selectedOptions);

        // set score
        score = 1;
      } else if (ebMCQsNotAllTheCorrectAnswers(correctAnswersForThisMCQs, selectedOptions)) {
        mcqsToCheck.classList.add("mcq-partially-correct");
        ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs);
      } else {
        // show the feedback for the incorrect options
        mcqsToCheck.classList.add("mcq-incorrect");
        ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs);
      }

      // now send it all to WordPress
      const quizNumber = mcqsToCheckName.replace("question-", "");
      ebMCQsSendtoWordPress(quizNumber, score);
    });
  });
}

function ebMCQs() {
  "use strict";
  // early exit for lack of browser support or no mcqs
  if (!ebMCQsInit()) {
    return;
  }

  // add the WordPress account button
  // ebMCQsAddWordPressAccountButton()

  // mark the document, to use the class in CSS
  document.documentElement.classList.add("js-mcq");

  // get all the questions
  const questions = document.querySelectorAll(".question");

  // loop over questions
  questions.forEach(function (question) {
    // add the interactive stuff: the checkboxes and the buttons
    ebMCQsMakeOptionCheckboxes(question);
    ebMCQsAddButton(question);
    // add the extra elements needed for accessibility
    ebMCQsMakeQuestionAccessible(question);
  });

  // mark the checked ones more clearly
  ebMCQsMarkSelectedOptions();

  // listen for button clicks and show results
  ebMCQsButtonClicks();
}

ebMCQs();

/* jslint browser */
/* globals locales, pageLanguage */

// Options
// -------
// 1. Which select elements will this script apply to?
const ebSelectLists = document.querySelectorAll("select.select-list");
// 2. Do you want to convert correct answers to plain text?
const ebSelectCorrectToText = true;

// Polyfill for IE (thanks, MDN)
Number.isInteger =
  Number.isInteger ||
  function (value) {
    "use strict";

    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
  };

// Check if an option's code means it is correct or incorrect,
// returning true for correct and false for incorrect.
function ebSelectCheckCode(code) {
  "use strict";

  // Get the fifth character in the code,
  // and try to convert it to a number.
  const keyCharacter = Number(code.charAt(4));

  // If it is a number, this returns true.
  return Number.isInteger(keyCharacter);
}

function ebSelectAddMarker(selectElement, markerContent) {
  "use strict";

  // If a marker already exists from a previous attempt,
  // remove it.
  if (selectElement.nextElementSibling && selectElement.nextElementSibling.classList.contains("select-list-marker")) {
    const oldMarker = selectElement.nextElementSibling;
    oldMarker.remove();
  }

  // Add new marker
  const newMarker = document.createElement("span");
  newMarker.classList.add("select-list-marker");
  newMarker.innerHTML = markerContent;
  selectElement.insertAdjacentElement("afterend", newMarker);
}

// Convert an option to unclickable text
function ebSelectConvertToText(selectElement, optionElement) {
  "use strict";
  selectElement.outerHTML = optionElement.innerHTML;
}

// Mark a selected option as correct or incorrect.
function ebSelectMarkResult(event) {
  "use strict";

  // Get the selected option and its code.
  const selectedOption = event.target.options[event.target.selectedIndex];
  const optionCode = selectedOption.getAttribute("data-select-code");
  const selectList = selectedOption.parentNode;

  // Mark whether the option is correct or incorrect.
  // Since we can't style options, only select elements,
  // we mark the parent select element and add a span after it
  // that we can style.
  if (optionCode && ebSelectCheckCode(optionCode)) {
    selectList.classList.remove("select-option-incorrect");
    selectList.classList.add("select-option-correct");
    ebSelectAddMarker(selectList, locales[pageLanguage].questions["mark-correct"]);
    if (ebSelectCorrectToText === true) {
      ebSelectConvertToText(selectList, selectedOption);
    }
  } else {
    selectList.classList.remove("select-option-correct");
    selectList.classList.add("select-option-incorrect");
    ebSelectAddMarker(selectList, locales[pageLanguage].questions["mark-incorrect"]);
  }
}

// Listen for changes on a select element,
// to mark the result when the user changes the option.
function ebSelectListener(selectElement) {
  "use strict";
  selectElement.addEventListener("change", ebSelectMarkResult, false);
}

// Add a listener to each select element.
function ebSelects(selects) {
  "use strict";

  if (selects.length > 0) {
    let i;
    for (i = 0; i < selects.length; i += 1) {
      ebSelectListener(selects[i]);
    }
  }
}

// Go!
ebSelects(ebSelectLists);

/* jslint browser */
/* globals window */

function ebMakeTablesMoreAccessible(table) {
  // Add scope="col" to any <th> inside <thead>
  const theadElements = table.querySelectorAll("thead");

  if (theadElements) {
    theadElements.forEach(function (theadElement) {
      const thElements = theadElement.querySelectorAll("th");
      if (thElements) {
        thElements.forEach(function (thElement) {
          thElement.setAttribute("scope", "col");
        });
      }
    });
  }

  // Sometimes html tables are added in the markdown without <thead>
  // Safe to assume that any <th> that is in the first <tr> of a table
  // is a column header and needs scope="col"
  // Keeping this separate from the previous query just in case
  const headlessThElements = table.querySelectorAll(":not(thead) > tr:first-of-type > th");

  if (headlessThElements) {
    headlessThElements.forEach(function (headlessThElement) {
      headlessThElement.setAttribute("scope", "col");
    });
  }

  // Add scope="row" to any <th> that has a rowspan attribute
  const rowSpanElements = table.querySelectorAll("th[rowspan]");

  if (rowSpanElements) {
    rowSpanElements.forEach(function (rowSpanElement) {
      rowSpanElement.setAttribute("scope", "row");
    });
  }

  // Instances of <td class="table-row-stub"> need to change to
  // <th class="table-row-stub" scope="row">
  const rowStubElements = table.querySelectorAll(".table-row-stub");
  if (rowStubElements) {
    rowStubElements.forEach(function (rowStubElement) {
      const newRowStubElement = document.createElement("th");
      newRowStubElement.setAttribute("scope", "row");
      newRowStubElement.classList.add("table-row-stub");
      newRowStubElement.innerHTML = rowStubElement.innerHTML;

      rowStubElement.insertAdjacentElement("afterend", newRowStubElement);

      rowStubElement.remove();
    });
  }

  // Empty <th> elements need to be replaced with <td>s for accessibility
  const allTHelements = table.querySelectorAll("th");
  allTHelements.forEach(function (th) {
    if (th.innerText.trim() === "") {
      const newTD = document.createElement("td");
      th.insertAdjacentElement("afterend", newTD);
      th.remove();
    }
  });
}

function ebPositionTable(tableWrapper) {
  "use strict";

  // Get the table
  const table = tableWrapper.querySelector("table");

  // Reset table positioning
  table.style.transform = "none";
  table.classList.remove("scrolling-table");

  // Get widths for responsiveness calculations
  const tableWrapperWidth = tableWrapper.getBoundingClientRect().width;
  const tableWidth = table.getBoundingClientRect().width;
  const bodyWidth = document.body.getBoundingClientRect().width;
  const remainingWidth = bodyWidth - tableWidth;
  const shiftLeftToCenter = (tableWidth - tableWrapperWidth) / 2;

  // Center the table in the screen area
  // if it's wider than the text area, and
  // there is space left and right to shift into.
  if (tableWidth > tableWrapperWidth && remainingWidth > 0) {
    table.style.transform = "translateX(-" + shiftLeftToCenter + "px)";
  }

  // If the table is wider than the viewport,
  // add class `responsive-table` so we can scroll with CSS.
  if (remainingWidth < 0) {
    table.classList.add("scrolling-table");
  }
}

function ebPositionAllTables() {
  "use strict";

  const tableWrappers = document.querySelectorAll(".table-wrapper");

  let i;
  for (i = 0; i < tableWrappers.length; i += 1) {
    ebPositionTable(tableWrappers[i]);
  }
}

// Only resize tables when resizing has stopped for 1s
function ebPositionTablesWhenResizingCompletes() {
  "use strict";
  let resizeTimeout = "";
  clearInterval(resizeTimeout);
  resizeTimeout = setTimeout(ebPositionAllTables, 1000);
}

function ebTables() {
  "use strict";

  const supported =
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelector !== undefined &&
    !!Array.prototype.forEach;

  if (!supported) {
    return;
  }

  const tables = document.querySelectorAll("table");

  tables.forEach(function (table) {
    // make the wrapper and add a class
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper");

    // add the wrapper to the DOM
    table.parentNode.insertBefore(tableWrapper, table);

    // move the table inside the wrapper
    tableWrapper.appendChild(table);

    // make the tables more accessible
    ebMakeTablesMoreAccessible(table);

    // Position the table
    ebPositionTable(tableWrapper);
  });

  // Listen for changes to screen size. If sizes changes,
  // reposition the tables.
  window.addEventListener("resize", ebPositionTablesWhenResizingCompletes);
}

ebTables();

/* jslint browser */
/* globals window, locales, pageLanguage */

function ebFootnotePopups() {
  "use strict";

  // List the features we use
  const featuresSupported =
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelector !== "undefined" &&
    window.addEventListener !== "undefined" &&
    !!Array.prototype.forEach;

  // Get all the .footnote s
  const footnoteLinks = document.querySelectorAll(".footnote");

  // Early exit for unsupported or if there are no footnotes
  if (!featuresSupported || footnoteLinks.length === 0) {
    return;
  }

  // Loop through footnotes
  footnoteLinks.forEach(function (current) {
    // get the target ID
    const targetHash = current.hash;
    const targetID = current.hash.replace("#", "");

    // escape it with double backslashes, for querySelector
    const sanitisedTargetHash = targetHash.replace(":", "\\:");

    // find the li with the ID from the .footnote's href
    const targetReference = document.querySelector(sanitisedTargetHash);

    // make a div.reference
    const footnoteContainer = document.createElement("div");
    footnoteContainer.classList.add("footnote-detail");
    footnoteContainer.classList.add("visuallyhidden");
    footnoteContainer.setAttribute("data-bookmarkable", "no");
    footnoteContainer.setAttribute("role", "doc-footnote");
    footnoteContainer.id = "inline-" + targetID;

    // the a, up to the sup
    const theSup = current.parentNode;
    const theContainingElement = current.parentNode.parentNode;

    // add the reference div
    theContainingElement.appendChild(footnoteContainer);

    // move the li contents inside the div.reference
    footnoteContainer.innerHTML = targetReference.innerHTML;

    // now that we have duplicated the contents of the footnote, remove the
    // duplicated ID to improve accessibility
    const footnoteElements = footnoteContainer.querySelectorAll("[id]");
    footnoteElements.forEach(function (element) {
      if (element.getAttribute("id")) {
        element.removeAttribute("id");
      }
    });

    // The superscript is given role=doc-noteref by kramdown, but this needs
    // to be removed as it is deprecated
    if (theSup.getAttribute("role", "doc-noteref") && theSup.querySelector("a")) {
      theSup.removeAttribute("role", "doc-noteref");
    }

    // show on hover
    theSup.addEventListener("mouseover", function (ev) {
      if (ev.target.classList.contains("footnote")) {
        footnoteContainer.classList.remove("visuallyhidden");
      }
    });
    // Make superscript keyboard focusable
    theSup.setAttribute("tabindex", 0);
    // Make contents of footnote not keyboard focusable initially
    const tabbableElements = footnoteContainer.querySelectorAll("a");
    tabbableElements.forEach(function (el) {
      el.setAttribute("tabindex", "-1");
    });

    // Open footnote when focused and Enter is pressed
    theSup.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        footnoteContainer.classList.toggle("visuallyhidden");
        tabbableElements.forEach(function (el) {
          el.removeAttribute("tabindex");
        });
      }
    });

    // add a class to the parent
    theContainingElement.parentNode.classList.add("contains-footnote");

    // if we mouseleave footnoteContainer, hide it
    // (mouseout also fires on mouseout of children, so we use mouseleave)
    footnoteContainer.addEventListener("mouseleave", function (ev) {
      if (ev.target === this) {
        setTimeout(function () {
          footnoteContainer.classList.add("visuallyhidden");
        }, 1000);
      }
    });
    // Close footnote if Esc key is pressed
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !footnoteContainer.classList.contains("visuallyhidden")) {
        footnoteContainer.classList.add("visuallyhidden");
        tabbableElements.forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
      }
    });

    // Clicking on the reverseFootnote link closes the footnote
    const reverseFootnote = footnoteContainer.querySelector(".reversefootnote");

    // remove the contents since we're using
    // CSS and :before to show a close button marker
    reverseFootnote.innerText = "";

    // Add hidden link text for screen readers
    const closeFootnoteLabel = document.createElement("span");
    closeFootnoteLabel.classList.add("visuallyhidden");
    closeFootnoteLabel.innerText = locales[pageLanguage].footnotes["close-footnote"];
    reverseFootnote.appendChild(closeFootnoteLabel);

    reverseFootnote.addEventListener("click", function (ev) {
      ev.preventDefault();
      footnoteContainer.classList.add("visuallyhidden");
    });

    // remove the href to avoiding jumping down the page
    current.removeAttribute("href");
  });

  // Format the footnotes at the bottom of the page
  const footnoteItems = document.querySelectorAll(".footnotes a.reversefootnote");
  const reverseFootnoteAlt = locales[pageLanguage].footnotes["reversefootnote-alt"];

  function reverseFootnoteSVGElement() {
    const reversefootnoteArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    reversefootnoteArrow.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    reversefootnoteArrow.setAttribute("viewBox", "0 0 28 24.12");
    reversefootnoteArrow.setAttribute("width", "28");
    reversefootnoteArrow.setAttribute("height", "24.12");
    reversefootnoteArrow.setAttribute("class", "reverse-footnote-arrow");
    reversefootnoteArrow.innerHTML =
      "<title>" +
      reverseFootnoteAlt +
      '</title><path d="M2.69 14L8.6 8.09V13h10.28A4.21 4.21 0 0022 11.7a4.24 4.24 0 001.28-3.1A4.24 4.24 0 0022 5.5a4.21 4.21 0 00-3.11-1.29h-.33v-2h.33a6.14 6.14 0 014.54 1.88 6.17 6.17 0 011.86 4.51 6.17 6.17 0 01-1.87 4.53A6.14 6.14 0 0118.88 15H8.6v4.9z" fill="gray"/>';
    return reversefootnoteArrow;
  }

  footnoteItems.forEach(function (reverseFootnoteLink) {
    reverseFootnoteLink.innerHTML = "";
    reverseFootnoteLink.appendChild(reverseFootnoteSVGElement());
  });

  // Kramdown is adding role=doc-endnote to the list items
  // but this is deprecated and needs to be removed

  const footnoteLIs = document.querySelectorAll("div.footnotes li");
  footnoteLIs.forEach(function (li) {
    if (li.getAttribute("role", "doc-endnote")) {
      li.removeAttribute("role", "doc-endnote");
    }
  });
}

ebFootnotePopups();

/* jslint browser */
/* globals window */

const ebSlideSupports = function () {
  "use strict";
  return (
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelector !== "undefined" &&
    window.addEventListener !== "undefined" &&
    window.onhashchange !== "undefined" &&
    !!Array.prototype.forEach &&
    document.querySelectorAll(".slides")
  );
};

const ebSlidesMoveSummaryMeta = function (slidelines) {
  "use strict";

  slidelines.forEach(function (slideline) {
    const summary = slideline.querySelector(".summary");

    let summaryCaption, summarySubCaption, summaryFigureSource;

    // You choose: use the title or the caption for the summary
    const summaryUseTitle = false;
    if (summaryUseTitle === true) {
      // get the summary's .title, .caption and .figure-source
      summaryCaption = summary.querySelector(".title");
      summarySubCaption = summary.querySelector(".caption");
      summaryFigureSource = summary.querySelector(".figure-source");
    } else {
      // get the summary's .caption and .figure-source
      summaryCaption = summary.querySelector(".caption");
      summarySubCaption = "";
      summaryFigureSource = summary.querySelector(".figure-source");
    }

    // create a new div to put them in
    const summaryMeta = document.createElement("div");
    summaryMeta.classList.add("figure-summary-meta");

    // If they exist, move them both to after the slideline
    // (To put the caption and source somewhere else,
    // move them using insertAdjacentHTML, which takes
    // beforebegin, afterbegin, beforeend, or afterend as params.)
    if (summaryCaption !== null && summaryCaption !== "") {
      summaryMeta.insertAdjacentHTML("beforeend", summaryCaption.outerHTML);
    }
    if (summarySubCaption !== null && summarySubCaption !== "") {
      summaryMeta.insertAdjacentHTML("beforeend", summarySubCaption.outerHTML);
    }
    if (summaryFigureSource !== null && summaryFigureSource !== "") {
      summaryMeta.insertAdjacentHTML("beforeend", summaryFigureSource.outerHTML);
    }

    // Put the summary meta at the end of the slideline
    slideline.insertAdjacentHTML("beforeend", summaryMeta.outerHTML);

    // add the summary id to the slideline
    slideline.id = summary.id;

    // remove the summary figure
    slideline.removeChild(summary);
  });
};

function ebTruncateText(text, maxLength) {
  "use strict";
  let string = text;
  if (string.length > maxLength) {
    string = string.substring(0, maxLength) + "…";
  }
  return string;
}

const ebSlidesBuildNav = function (slidelines) {
  "use strict";
  slidelines.forEach(function (slideline) {
    // get all the figures
    const figures = slideline.querySelectorAll(".figure");
    const figuresCount = figures.length;

    // make the slide nav
    let slideNavigationInsert = "";
    slideNavigationInsert += '<nav class="nav-slides';
    if (figuresCount > 4) {
      slideNavigationInsert += " nav-slides-many";
      if (figuresCount > 6) {
        slideNavigationInsert += " nav-slides-many-many";
      }
    }
    slideNavigationInsert += '" ';
    const slidelineID = slideline.getAttribute("id");
    slideNavigationInsert += 'aria-label="' + slidelineID + ' thumbnails"';
    slideNavigationInsert += ">";

    slideNavigationInsert += "<ol>";

    figures.forEach(function (figure) {
      slideNavigationInsert += "<li>";

      // add thumbnail

      // if no image, use the figure title
      if (figure.querySelector(".figure-images img")) {
        slideNavigationInsert += '<a href="#' + figure.id + '" aria-label="' + figure.id + ' thumbnail">';
        const thumb = figure.querySelector(".figure-images img").cloneNode();
        thumb.removeAttribute("srcset");
        thumb.removeAttribute("sizes");
        slideNavigationInsert += thumb.outerHTML;
      } else {
        slideNavigationInsert += '<a href="#' + figure.id + '" class="slide-nav-text-link">';
        // If the user has set text to show in the nav
        let thumbText;

        if (figure.querySelector(".slide-nav-text")) {
          const textPlaceholder = figure.querySelector(".slide-nav-text");
          thumbText = textPlaceholder.innerText;
          // Delete the placeholder element from the figure
          textPlaceholder.remove();
        } else {
          thumbText = figure.querySelector(".figure-body .title").innerText;
          thumbText = ebTruncateText(thumbText, 8);
        }

        slideNavigationInsert += '<span class="slide-thumbnail-text">';
        slideNavigationInsert += thumbText;
        slideNavigationInsert += "</span>";
      }

      slideNavigationInsert += "</a>";
      slideNavigationInsert += "</li>";
    });

    slideNavigationInsert += "</ol>";
    slideNavigationInsert += "</nav>";

    slideline.insertAdjacentHTML("afterbegin", slideNavigationInsert);
  });
};

const ebResetSlides = function (slidelines) {
  "use strict";
  slidelines.forEach(function (slideline) {
    // get all the figures, hide them
    const figures = slideline.querySelectorAll(".figure");

    figures.forEach(function (slideline) {
      slideline.classList.add("visuallyhidden");
    });

    // get the slide nav items, hide them
    const slideNavItems = slideline.previousElementSibling.querySelectorAll(".nav-slides li");
    slideNavItems.forEach(function (slideline) {
      slideline.classList.remove("slide-current");
    });
  });
};

const ebSlidesShowFirstInSlideline = function (slideline) {
  "use strict";
  // find the first figure and show it
  const figures = slideline.querySelectorAll(".figure");
  figures[0].classList.remove("visuallyhidden");
};

const ebSlidesShowFirst = function (slidelines) {
  "use strict";
  slidelines.forEach(function (slideline) {
    ebSlidesShowFirstInSlideline(slideline);
  });
};

const ebSlidesMarkNavUpToCurrent = function (slideline) {
  "use strict";
  const navItems = slideline.querySelectorAll(".nav-slides li");
  let hitCurrent = false;

  navItems.forEach(function (navItem) {
    if (hitCurrent) {
      return;
    }

    if (navItem.classList.contains("slide-current")) {
      hitCurrent = true;
      return;
    }

    navItem.classList.add("slide-current");
  });
};

const ebSlidesShow = function (slidelines) {
  "use strict";

  // check for hash
  if (!window.location.hash) {
    ebSlidesShowFirst(slidelines);
    return;
  }

  let sanitisedTargetHash = decodeURIComponent(window.location.hash.replace(":", "\\:"));
  // check if it starts with a number, after the #
  // (which means querySelector(sanitisedTargetHash) will return an error)
  if (!isNaN(sanitisedTargetHash[1])) {
    ebSlidesShowFirst(slidelines);
    return;
  }

  slidelines.forEach(function (slideline) {
    // check if hash is in this slideline
    if (!slideline.querySelector(sanitisedTargetHash)) {
      ebSlidesShowFirstInSlideline(slideline);
      return;
    } else if (!slideline.querySelector('.nav-slides [href="' + sanitisedTargetHash + '"]')) {
      // The hash might belong to a figure caption or title within the slideline
      // Look for the nearest parent figure div and use its hash to open up the slide
      const element = document.querySelector(sanitisedTargetHash);
      const ancestor = element.closest("div.figure");
      sanitisedTargetHash = "#" + ancestor.getAttribute("id");
    }

    // show the target slideline
    slideline.querySelector(sanitisedTargetHash).classList.remove("visuallyhidden");

    // reset the slide-current
    slideline.querySelectorAll(".nav-slides li").forEach(function (navItem) {
      navItem.classList.remove("slide-current");
    });

    // mark the current one with slide-current
    const selector = '.nav-slides [href="' + sanitisedTargetHash + '"]';
    const targetLinkElement = slideline.querySelector(selector);
    targetLinkElement.setAttribute("tabindex", 0);
    targetLinkElement.focus();

    const targetParent = targetLinkElement.parentNode;
    targetParent.classList.add("slide-current");

    // mark all the ones up to the current one
    ebSlidesMarkNavUpToCurrent(slideline);
  });
};

const ebSlidesKeyDown = function () {
  // listen for key movements
  window.addEventListener("keydown", function (ev) {
    const keyCode = ev.key || ev.which;
    const clickedElement = ev.target || ev.srcElement;

    // first check whether this element is in a slideline
    if (clickedElement.closest(".slides")) {
      if (document.querySelector(".slides " + decodeURIComponent(clickedElement.hash))) {
        // Add a check for RTL
        if (document.documentElement.hasAttribute("dir") && document.documentElement.getAttribute("dir") === "rtl") {
          if (
            (keyCode === "ArrowRight" || keyCode === 39 || keyCode === "ArrowUp" || keyCode === 38) &&
            clickedElement.parentNode.previousElementSibling
          ) {
            ev.preventDefault();
            clickedElement.parentNode.previousElementSibling.querySelector("a").click();
          } else if (
            (keyCode === "ArrowLeft" || keyCode === 37 || keyCode === "ArrowDown" || keyCode === "40") &&
            clickedElement.parentNode.nextElementSibling
          ) {
            ev.preventDefault();
            clickedElement.parentNode.nextElementSibling.querySelector("a").click();
          }
        } else {
          if (
            (keyCode === "ArrowLeft" || keyCode === 37 || keyCode === "ArrowUp" || keyCode === 38) &&
            clickedElement.parentNode.previousElementSibling
          ) {
            ev.preventDefault();
            clickedElement.parentNode.previousElementSibling.querySelector("a").click();
          } else if (
            (keyCode === "ArrowRight" || keyCode === 39 || keyCode === "ArrowDown" || keyCode === "40") &&
            clickedElement.parentNode.nextElementSibling
          ) {
            ev.preventDefault();
            clickedElement.parentNode.nextElementSibling.querySelector("a").click();
          }
        }
      }
    }
  });
};

const ebSlidesAlreadyShown = function () {
  "use strict";

  // get all the nav slide links
  const navSlides = document.querySelectorAll(".nav-slides a");

  navSlides.forEach(function (navSlide) {
    // listen for clicks on each nav slide link
    navSlide.addEventListener("click", function (ev) {
      const itsCurrentlyHidden = document.querySelector(this.getAttribute("href")).classList.contains("visuallyhidden");

      // if it's currently shown, stop the anchor's jump
      if (!itsCurrentlyHidden) {
        ev.preventDefault();
      }
    });
  });
};

const ebSlides = function () {
  "use strict";
  if (!ebSlideSupports()) {
    return;
  }

  // get all the slidelines
  const slidelines = document.querySelectorAll(".slides");

  // move the summary meta
  ebSlidesMoveSummaryMeta(slidelines);

  // build the nav
  ebSlidesBuildNav(slidelines);

  // get, then hide, the figures and slide nav items
  ebResetSlides(slidelines);

  // show slide from hash
  ebSlidesShow(slidelines);

  // prevent jump when clicking already shown slides
  ebSlidesAlreadyShown();

  // listen for hashchanges
  window.addEventListener("hashchange", function () {
    // get, then hide, the figures and slide nav items
    ebResetSlides(slidelines);

    // show slide from hash
    ebSlidesShow(slidelines);
  });

  // listen for keys
  ebSlidesKeyDown();
};

ebSlides();

/* jslint browser */
/* globals locales, pageLanguage */

// Options
// -------
const ebShowHideOptions = {
  elementsToHide: ".show-hide", // a querySelectorAll string
  buttonShowText: locales[pageLanguage].input.show, // will be overriden if set in HTML as data-show-text
  buttonHideText: locales[pageLanguage].input.hide, // will be overriden if set in HTML as data-hide-text
};

// Toggle visuallyhidden
function ebTogglePreviousSiblingVisibility(event) {
  "use strict";

  // Do not trigger listeners on the parent element.
  // This lets us use show-hide in parent containers
  // that have their own listeners.
  event.stopPropagation();

  const button = event.target;
  const elementToHide = button.previousElementSibling;
  if (elementToHide.classList.contains("visuallyhidden")) {
    elementToHide.classList.remove("visuallyhidden");
    button.classList.remove("show-hide-hidden");
    button.classList.add("show-hide-visible");

    // If button text has been set in the HTML, use that,
    // otherwise use our default from ebShowHideOptions above.
    if (elementToHide.getAttribute("data-hide-text")) {
      button.innerHTML = elementToHide.getAttribute("data-hide-text");
    } else {
      button.innerHTML = ebShowHideOptions.buttonHideText;
    }
  } else {
    elementToHide.classList.add("visuallyhidden");
    button.classList.remove("show-hide-visible");
    button.classList.add("show-hide-hidden");

    // If button text has been set in the HTML, use that,
    // otherwise use our default from ebShowHideOptions above.
    if (elementToHide.getAttribute("data-show-text")) {
      button.innerHTML = elementToHide.getAttribute("data-show-text");
    } else {
      button.innerHTML = ebShowHideOptions.buttonShowText;
    }
  }
}

// Add a show/hide button
function ebShowHideAddButton(elementToHide) {
  "use strict";
  const button = document.createElement("button");
  button.classList.add("show-hide");
  button.classList.add("show-hide-hidden");
  elementToHide.insertAdjacentElement("afterend", button);

  // If button text has been set in the HTML, use that,
  // otherwise use our default from ebShowHideOptions above.
  if (elementToHide.getAttribute("data-show-text")) {
    button.innerHTML = elementToHide.getAttribute("data-show-text");
  } else {
    button.innerHTML = ebShowHideOptions.buttonShowText;
  }

  // Add a listener to the button
  button.addEventListener("click", ebTogglePreviousSiblingVisibility, false);
}

// Hide element
function ebShowHideHideInitially(elementToHide) {
  "use strict";
  elementToHide.classList.add("visuallyhidden");
  elementToHide.classList.add("show-hide-content");
}

// Process all show-hides
function ebShowHide() {
  "use strict";
  const ebShowHideElements = document.querySelectorAll(ebShowHideOptions.elementsToHide);
  let i;
  for (i = 0; i < ebShowHideElements.length; i += 1) {
    ebShowHideHideInitially(ebShowHideElements[i]);
    ebShowHideAddButton(ebShowHideElements[i]);
  }
}

// Go!
ebShowHide();

/* jslint browser */
/* globals window, locales, pageLanguage */

// Note: the navigator API for this script requires
// that the page is served over https (or is localhost).
// So this will not work on http connections.
// Ensure your webserver is sending all traffic to https.

// Set default button text.
const ebCopyToClipboardButtonText = locales[pageLanguage].copy.copy;
const ebCopyToClipboardSuccessText = locales[pageLanguage].copy.copied;
const ebCopyToClipboardFailText = locales[pageLanguage].copy["copy-failed"];

// Show that copying was done
function ebCopyButtonFeedback(button, text) {
  "use strict";
  button.innerHTML = text;

  if (text === ebCopyToClipboardSuccessText) {
    button.classList.add("copy-to-clipboard-success");
  }

  window.setTimeout(function () {
    button.innerHTML = ebCopyToClipboardButtonText;
    button.classList.remove("copy-to-clipboard-success");
  }, 2000);
}

// Copy an element's text to the clipboard.
function ebCopyToClipboard(element, button) {
  "use strict";

  // If the element has a data-copy-text attribute,
  // use that text. Otherwise, use its textContent.
  let text = element.textContent;
  if (element.hasAttribute("data-copy-text")) {
    text = element.getAttribute("data-copy-text");
  }

  navigator.clipboard.writeText(text).then(
    function () {
      // success
      ebCopyButtonFeedback(button, ebCopyToClipboardSuccessText);
    },
    function () {
      // failure
      ebCopyButtonFeedback(button, ebCopyToClipboardFailText);
    }
  );
}

// Add a copy button, ready for clicking.
function ebAddCopyButton(element, buttonText) {
  "use strict";

  const button = document.createElement("button");
  button.classList.add("copy-to-clipboard");
  button.setAttribute("type", "button");
  button.innerHTML = buttonText;
  element.insertAdjacentElement("afterend", button);

  button.addEventListener("click", function () {
    ebCopyToClipboard(element, button);
  });
}

// Find all elements that need copy buttons,
// by their 'copy-to-clipboard` class.
function ebAddCopyButtons() {
  "use strict";
  const elementsThatNeedButtons = document.querySelectorAll(".copy-to-clipboard");
  elementsThatNeedButtons.forEach(function (element) {
    if (element.hasAttribute("data-copy-button-text")) {
      ebAddCopyButton(element, element.getAttribute("data-copy-button-text"));
    } else {
      ebAddCopyButton(element, ebCopyToClipboardButtonText);
    }
  });
}

// Go
ebAddCopyButtons();

/* jslint browser */

function ebShareButtonsKeyboardAccess(shareModal, shareButtons) {
  shareButtons.forEach(function (button) {
    button.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        ebShowHideShareModal(shareModal);

        if (!shareModal.classList.contains("share-hidden") && button.classList.contains("share-button")) {
          // Jump focus to the first share link in the modal when it's opened
          const firstLink = shareModal.querySelector(".share-link-content");
          firstLink.focus();
        } else {
          // Jump focus back to controls when modal is closed
          const controlButton = document.querySelector(".share-button");
          controlButton.focus();
        }
      }
    });
  });

  // Close modal when it's open and Escape key is pressed
  shareModal.querySelectorAll(".share-link-content, .share-links-close").forEach(function (item) {
    item.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        ebShowHideShareModal(shareModal);

        // Jump focus back to controls when modal is closed
        const controlButton = document.querySelector(".share-button");
        controlButton.focus();
      }
    });
  });
}

function ebShowHideShareModal(shareModal) {
  shareModal.classList.toggle("share-hidden");
  const buttonIcon = document.querySelector(".share-button svg");
  buttonIcon.classList.toggle("active");
}

function ebShareButtons() {
  "use strict";

  // Move the panel out of controls, so we can
  // position it anywhere on the page with CSS.
  const shareModal = document.getElementById("share-links");

  if (shareModal) {
    document.body.appendChild(shareModal);
  }

  const shareButtons = document.querySelectorAll(".share-button, .share-links-close");

  if (shareButtons && shareModal) {
    shareButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        ebShowHideShareModal(shareModal);
      });
    });

    ebShareButtonsKeyboardAccess(shareModal, shareButtons);
  }
}

// Go
ebShareButtons();

/* jslint browser */
/* global window, MathJax, settings, ebTrackExpandableBoxOpen, locales, pageLanguage */

// --------------------------
// Toggles 'expandable boxes'
// --------------------------

// Empty extension boxes do not need to be expandable
const expandableBoxSelector = ".expandable-box:not(.extension-empty)";

// Extension previews are never hidden and so should be excluded
const expandableBoxContentSelector =
  "h3 ~ *:not(.extension-preview)," +
  "h4 ~ *:not(.extension-preview)," +
  "h5 ~ *:not(.extension-preview)," +
  "h6 ~ *:not(.extension-preview)";

const boxHeaderSelector = "h3 strong, h4 strong, h5 strong, h6 strong";

// Toggle the visibility of the contents of the box
function ebExpandableBoxToggle(event) {
  const target = event.target;
  const box = target.closest(".expandable-box");
  const toggle = box.querySelector("a.toggle");
  const button = box.querySelector(".preview-read-more");

  const expandableBoxContent = box.querySelectorAll(expandableBoxContentSelector);

  if (toggle.classList.contains("closed")) {
    // Analytics tracking of walk-through box opens
    const expandableBoxH3Heading = box.querySelector("h3 strong").childNodes[0].nodeValue.toLowerCase();

    if (expandableBoxH3Heading && box.classList.contains("walk-through") && settings.site.output === "web") {
      // Call the tracking function from analytics.js
      ebTrackExpandableBoxOpen(expandableBoxH3Heading);
    }
  }

  // Switch the class of the toggle button - content changes between '-' and '+'
  toggle.classList.toggle("open");
  toggle.classList.toggle("closed");

  // Toggle the visibility of the box contents
  expandableBoxContent.forEach(function (item) {
    item.classList.toggle("visuallyhidden");
  });

  // Toggle the visibility of the 'Read More' button, if there is one
  if (button) {
    button.classList.toggle("visuallyhidden");
  }
}

// Add 'Read More' button to extension preview to show box contents
function ebExpandableBoxAddPreviewButton(box) {
  // Create the button
  const button = document.createElement("button");
  button.classList.add("preview-read-more");
  button.innerText = locales[pageLanguage].extensions["read-more"];

  // Add the button just before the end of the extension preview
  const preview = box.querySelector(".extension-preview");
  preview.insertAdjacentElement("beforeend", button);

  // Toggle the visibilty of the box contents when the button is clicked
  button.addEventListener("click", function (event) {
    ebExpandableBoxToggle(event);
  });
}

// Add toggle button to `.expandable-box strong`
function ebExpandableBoxAddBoxToggle(box) {
  // Get the h3 strong expandable box header, e.g. 'FIND OUT MORE'
  const boxHeader = box.querySelector(boxHeaderSelector);

  // Add the toggle button
  const boxToggleButton = document.createElement("a");
  boxToggleButton.classList.add("toggle", "closed");
  boxToggleButton.setAttribute("tabindex", "0");

  // Insert the button after the header
  boxHeader.insertAdjacentElement("beforeEnd", boxToggleButton);
  boxHeader.setAttribute("tabindex", "-1");

  // Listen for clicks on .toggle.
  // Remember that accordion.js is listening for clicks, too,
  // currently on .content a, [data-accordion] (i.e. h2s), and #nav [href].
  boxToggleButton.addEventListener(
    "click",
    function (event) {
      ebExpandableBoxToggle(event);
    },
    true
  );

  boxToggleButton.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Enter") {
        ebExpandableBoxToggle(event);
      }
    },
    true
  );
}

// Get all the targets we might link to in expandable boxes.
// The callback should be a function that does something with those targets.
function ebExpandableBoxTargets() {
  // Get all the elements in boxes with IDs which do not start with 'MathJax-'
  const targets = document.querySelectorAll('.expandable-box [id]:not([id^="MathJax-"])');
  return targets;
}

// If an element inside a box is targeted, click the toggle so that it opens.
function ebExpandableBoxClickContainerBoxToggle(element) {
  if (element) {
    const container = element.closest(".expandable-box");

    if (!container) {
      return;
    }

    const toggle = container.querySelector("a.toggle.closed");
    if (toggle) {
      toggle.click();
    }
  }
}

// Expand the box if an element inside it is targeted
function ebExpandableBoxListenForIncomingLinks() {
  const targets = ebExpandableBoxTargets();

  targets.forEach(function (target) {
    target.addEventListener("idTargeted", function () {
      ebExpandableBoxClickContainerBoxToggle(target);
    });
  });
}

// Check the URL for the targets inside boxes
function ebExpandableBoxCheckURLForTargets() {
  const hashInCurrentURL = window.location.hash.split("#")[1];
  const targets = ebExpandableBoxTargets();

  // If the hash is in our list of targets, expand its box
  targets.forEach(function (target) {
    if (target.id === hashInCurrentURL) {
      const targetElement = document.getElementById(hashInCurrentURL);
      ebExpandableBoxClickContainerBoxToggle(targetElement);
    }
  });
}

// Initially hide the contents of each box and add toggles
function ebExpandableBoxInitialiseBoxes() {
  const expandableBoxes = document.querySelectorAll(expandableBoxSelector);

  expandableBoxes.forEach(function (box) {
    const expandableBoxContent = box.querySelectorAll(expandableBoxContentSelector);

    expandableBoxContent.forEach(function (item) {
      item.classList.add("visuallyhidden");
    });

    ebExpandableBoxAddBoxToggle(box);

    // Add Read More button to extension previews
    if (box.querySelector(".extension-preview")) {
      ebExpandableBoxAddPreviewButton(box);
    }
  });
}

// Expandable box startup process
function ebStartExpandableBox() {
  ebExpandableBoxInitialiseBoxes();
  ebExpandableBoxListenForIncomingLinks();
  window.addEventListener("hashchange", ebExpandableBoxCheckURLForTargets(), false);
}

// If MathJax is running, only run all this once the MathJax is typeset.
// Otherwise, MathJaxDisplay divs will appear after the expandable-box contents
// have been hidden.
if (document.querySelector('script#MathJax, script[type^="text/x-mathjax-config"]')) {
  MathJax.Hub.Register.StartupHook("End", ebStartExpandableBox);
} else {
  ebStartExpandableBox();
}

/* jslint browser */
/*
global window, settings, ebLazyLoadImages, videoShow, locales,
pageLanguage, Element, HTMLDocument, Node, MutationObserver
*/

// --------------------------------------------------------------
// Options
//
// 1. Use CSS selectors to list the headings that will
//    define each accordion section, e.g. '#content h2'
const headingLevel = "h2";
const accordionHeads = ".content > " + headingLevel;
// 2. Which heading's section should we show by default?
const defaultAccordionHead = ".content > " + headingLevel + ":first-of-type";
// 3. Auto close last accordion when you open a new one?
const autoCloseAccordionSections = false;
// --------------------------------------------------------------

function ebAccordionInit() {
  "use strict";

  let pageAccordionOff;

  // Check for no-accordion setting on page
  const accordionPageSetting = ebAccordionPageSetting();
  const accordionBookSetting = ebAccordionBookSetting();

  // First, check the book-level setting
  if (accordionBookSetting === false) {
    pageAccordionOff = true;
  } else {
    pageAccordionOff = false;
  }

  // If the accordion is turned off for this page
  if (accordionPageSetting && accordionPageSetting === "none") {
    pageAccordionOff = true;
  }

  // If the accordion is turned on for this page
  if (accordionPageSetting === "true") {
    pageAccordionOff = false;
  }

  return (
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelectorAll !== "undefined" &&
    window.addEventListener !== "undefined" &&
    !!Array.prototype.forEach &&
    !pageAccordionOff
  );
}

function ebAccordionPageSetting() {
  "use strict";

  const accordionPageSetting = document.body.querySelector(".wrapper").getAttribute("data-accordion-page");
  return accordionPageSetting;
}

function ebAccordionBookSetting() {
  "use strict";

  const accordionBookSetting = settings.web.accordion.enabled;
  return accordionBookSetting;
}

function ebAccordionDefaultAccordionHeadID() {
  "use strict";

  let defaultAccordionHeadID;

  // Get the default accordion section's ID
  if (defaultAccordionHead !== "") {
    defaultAccordionHeadID = document.querySelector(defaultAccordionHead).id;
    if (!defaultAccordionHeadID) {
      defaultAccordionHeadID = "defaultAccordionSection";
    }
  }
  return defaultAccordionHeadID;
}

function ebAccordionSetUpSections(sectionHeadings) {
  "use strict";

  // Loop through sectionHeadings, rearranging elements
  // to create an accessible accordion with sections
  // that look like this:

  // <h2>
  //     <button id="header-title..." aria-controls="section-title...">
  //         <span>Section title</span>
  //         <span>+</span>
  //     </button>
  // </h2>
  // <section id="section-title..." aria-labelledby="header-title...">
  //     Section content
  // </section>

  sectionHeadings.forEach(function (sectionHeading) {
    // Get the ID of the heading
    const headingID = sectionHeading.id;

    // Create a button element to put inside the heading
    const headingButton = document.createElement("button");
    headingButton.setAttribute("id", "header-" + headingID);
    headingButton.setAttribute("aria-expanded", "false");
    headingButton.setAttribute("aria-controls", "section-" + headingID);

    // Move the heading text into a span
    const headingSpan = document.createElement("span");
    headingSpan.innerHTML = sectionHeading.innerHTML;
    sectionHeading.innerHTML = "";

    // Move the text span into the button
    headingButton.appendChild(headingSpan);

    // Move the button into the heading
    sectionHeading.appendChild(headingButton);

    // Add a +/- indicator to show open/closed section
    const expandedIndicator = document.createElement("span");
    expandedIndicator.setAttribute("aria-hidden", "true");
    expandedIndicator.innerHTML = "+";

    headingButton.appendChild(expandedIndicator);

    // Create a section element to correspond with the heading
    const contentSection = document.createElement("section");
    contentSection.setAttribute("id", "section-" + headingID);
    contentSection.setAttribute("aria-labelledby", "header-" + headingID);
    contentSection.setAttribute("aria-hidden", "true");

    // Now we have the heading and all its children, and an empty section
    // The heading is still where it should be in the DOM,
    // so we can put the section after it
    sectionHeading.insertAdjacentElement("afterend", contentSection);

    // Add label to section heading so that it's not "empty"
    sectionHeading.setAttribute("aria-labelledby", "header-" + headingID);
  });

  ebAccordionFillSections();
  ebAccordionShowAllButton();
}

function ebAccordionFillSections() {
  "use strict";

  // Grab the individual #contents elements of the page
  const contentItems = document.querySelector(".content").childNodes;

  // Put all the items in an array, selecting only
  // elements and text items that match the mathjax \[ pattern.
  let j;
  const contentItemsForSections = [];
  for (j = 0; j < contentItems.length; j += 1) {
    if (contentItems[j].nodeType === Node.ELEMENT_NODE) {
      contentItemsForSections.push(contentItems[j]);
    } else if (contentItems[j].nodeValue.includes("[")) {
      contentItemsForSections.push(contentItems[j]);
    }
  }

  // We don't know where our first section is yet
  let currentSection = false;

  // Loop through the content to accordify
  contentItemsForSections.forEach(function (contentItem) {
    // If this is an element (not a text or comment node), and
    // if this is a section, update currentSection, then move on
    if (contentItem.nodeType === Node.ELEMENT_NODE) {
      if (contentItem.nodeName === "SECTION" && contentItem.hasAttribute("aria-labelledby")) {
        currentSection = contentItem;
        return;
      }
    }

    // Have we reached the first section yet? If not, move on
    if (!currentSection) {
      return;
    }

    // Leave the headings outside the section
    if (contentItem.nodeName.toLowerCase() === headingLevel) {
      return;
    }

    // Leave the pagination arrows outside the section
    if (contentItem.classList && contentItem.classList.contains("pagination")) {
      return;
    }

    // Otherwise, move the element inside the section
    currentSection.appendChild(contentItem);
  });
}

function ebAccordionCloseSection(heading) {
  // Given a heading element, apply all the changes needed
  // to close the corresponding section

  heading.querySelector("button").setAttribute("aria-expanded", "false");
  heading.querySelector("span[aria-hidden]").innerHTML = "+";

  const section = heading.nextElementSibling;
  section.setAttribute("aria-hidden", "true");
}

function ebAccordionOpenSection(heading) {
  // Given a heading element, apply all the changes needed
  // to open the corresponding section

  heading.querySelector("button").setAttribute("aria-expanded", "true");
  heading.querySelector("span[aria-hidden]").innerHTML = "–";

  const section = heading.nextElementSibling;
  section.setAttribute("aria-hidden", "false");
}

function ebAccordionHideThisSection(targetID) {
  "use strict";

  const heading = document.getElementById(targetID);

  ebAccordionCloseSection(heading);
}

function ebAccordionHideAll() {
  "use strict";

  const headings = document.querySelectorAll(accordionHeads);

  headings.forEach(function (heading) {
    ebAccordionCloseSection(heading);
  });
}

function ebAccordionShowAll() {
  "use strict";

  const headings = document.querySelectorAll(accordionHeads);

  headings.forEach(function (heading) {
    ebAccordionOpenSection(heading);
  });
}

function ebAccordionHideAllExceptThisOne(targetID) {
  "use strict";

  const headings = document.querySelectorAll(accordionHeads);

  headings.forEach(function (heading) {
    // iIf it's the one we just clicked, skip it
    if (heading.id === targetID) {
      return;
    }

    // Otherwise, hide it
    ebAccordionCloseSection(heading);
  });
}

function ebAccordionCheckParent(node) {
  "use strict";

  // If there is no parent, or something went wrong, exit
  if (!node) {
    return false;
  }

  if (!node.parentNode) {
    return false;
  }

  // If the parent is the body element, exit
  if (node.tagName === "BODY") {
    return false;
  }

  // If it is an accordion section, return its ID
  if (node.nodeName === "SECTION") {
    return node.id;
  }

  // If it's an accordion heading, return the ID of the
  // corresponding accordion section
  if (node.nodeName.toLowerCase() === headingLevel) {
    return "section-" + node.id;
  }

  // If it has a parent, check whether that parent is
  // an accordion section, and return its ID
  const nodeParent = node.parentNode;
  const parentIsSection = nodeParent.nodeName === "SECTION";
  if (parentIsSection) {
    return nodeParent.id;
  }

  // Else, recurse upwards
  return ebAccordionCheckParent(nodeParent);
}

function ebAccordionFindSection(targetToCheck) {
  // Find and return containing section

  "use strict";

  // Work recursively up the DOM looking for the section
  return ebAccordionCheckParent(targetToCheck);
}

function ebWhichTarget(targetID) {
  "use strict";

  let targetToCheck;

  if (targetID) {
    // If we're given an ID, use it
    // Decode the targetID URI in case it's not ASCII
    targetID = decodeURIComponent(targetID);

    targetToCheck = document.getElementById(targetID);
  } else {
    // Else use the hash
    let trimmedHash = window.location.hash.replace("#", "");

    // Decode the trimmedHash in case it's not ASCII
    trimmedHash = decodeURIComponent(trimmedHash);

    targetToCheck = document.getElementById(trimmedHash);
  }

  // If the ID doesn't exist, exit
  if (!targetToCheck) {
    return false;
  }

  return targetToCheck;
}

function ebAccordionShow(targetID) {
  "use strict";

  const targetToCheck = ebWhichTarget(targetID);
  if (!targetToCheck) {
    return;
  }

  const sectionID = ebAccordionFindSection(targetToCheck);
  // If we are not linking to a section or something inside it,
  // show the default section
  if (!sectionID) {
    ebAccordionShowDefaultSection();
  }

  // Show and load the contents of the section
  const sectionToShow = document.getElementById(sectionID);
  if (sectionToShow) {
    const heading = sectionToShow.previousElementSibling;

    ebAccordionOpenSection(heading);

    // Lazyload the images inside
    const lazyimages = sectionToShow.querySelectorAll("[data-srcset]");
    if (lazyimages.innerHTML !== undefined) {
      ebLazyLoadImages(lazyimages);
    }

    // If we have a slideline in this section, check if it's a portrait one
    const slidelinesInThisSection = sectionToShow.querySelectorAll(".slides");

    slidelinesInThisSection.forEach(function (slidelineInThisSection) {
      const firstFigureImg = slidelineInThisSection.querySelector(".figure img");

      if (firstFigureImg) {
        firstFigureImg.addEventListener("load", function () {
          const portraitSlideline = firstFigureImg.height > firstFigureImg.width;
          if (portraitSlideline) {
            slidelineInThisSection.querySelector("nav").classList.add("nav-slides-portrait");
          }
        });
      }
    });

    if (typeof videoShow === "function") {
      videoShow(sectionToShow);
    }
  }
}

function ebAccordionListenForAnchorClicks() {
  "use strict";

  // Listen for clicks on *all* the anchors (;_;)
  const allTheAnchors = document.querySelectorAll("#content a[href], .search-results-nav a[href]");
  allTheAnchors.forEach(function (oneOfTheAnchors) {
    // If it's an external link, exit
    if (oneOfTheAnchors.target === "_blank") {
      return;
    }

    oneOfTheAnchors.addEventListener("click", function (event) {
      event.stopPropagation();

      // Declare targetID so JSLint knows it's coming in this function.
      let targetID;

      // Ignore target blank / rel noopener links
      if (event.target.getAttribute("rel") === "noopener") {
        return;
      }

      // Get the target ID by removing any file path and the #
      if (event.target.hasAttribute("href")) {
        targetID = event.target.getAttribute("href").replace(/.*#/, "");
      } else {
        return;
      }

      // Find the target of the link in the DOM
      const targetOfLink = document.getElementById(targetID);

      // Recursively update targetID until we have an accordion section
      targetID = ebAccordionFindSection(targetOfLink);

      // Now open the right closed accordion
      ebAccordionShow(targetID);
      if (autoCloseAccordionSections === true) {
        ebAccordionHideAllExceptThisOne(targetID);
      }
    });
  });
}

function ebAccordionListenForHeadingClicks() {
  "use strict";

  // Expand an accordion section if its heading is clicked
  const headings = document.querySelectorAll(accordionHeads);
  headings.forEach(function (heading) {
    heading.addEventListener("click", function () {
      const button = heading.querySelector("button");
      if (button.getAttribute("aria-expanded") === "true") {
        ebAccordionHideThisSection(heading.id);
      } else {
        ebAccordionShow(heading.id);
      }
    });
  });
}

function ebAccordionListenForNavClicks() {
  "use strict";

  // Also listen for nav clicks
  const navLinks = document.querySelectorAll("#nav [href]");

  navLinks.forEach(function (navLink) {
    navLink.addEventListener("click", function (event) {
      // Get the section and click to open it if it's closed
      const theHeading = document.getElementById(event.target.hash.replace(/.*#/, ""));

      // Simulate anchor click, if it's closed
      if (theHeading) {
        if (theHeading.querySelector("button").getAttribute("aria-expanded") === "false") {
          theHeading.click();
        }
      }
    });
  });
}

function ebAccordionListenForHashChange() {
  "use strict";

  window.addEventListener("hashchange", function (event) {
    // Don't treat this like a normal click on a link
    event.preventDefault();

    // Get the target ID from the hash
    let targetID = window.location.hash;

    targetID = decodeURIComponent(targetID);

    // Get the target of the link
    const targetOfLink = document.getElementById(targetID.replace(/.*#/, ""));

    // Check if it's in the viewport already
    const targetRect = targetOfLink.getBoundingClientRect();

    const targetInViewport =
      targetRect.top >= -targetRect.height &&
      targetRect.left >= -targetRect.width &&
      targetRect.bottom <= targetRect.height + window.innerHeight &&
      targetRect.right <= targetRect.width + window.innerWidth;

    // If it's in a closed section, all dimensions will be = 0
    // If it's in an open section, dimensions will be > 0
    const targetInOpenSection = targetRect.width > 0 && targetRect.height > 0 && targetRect.x > 0 && targetRect.y > 0;

    // Check if it's an accordion
    const targetAccordionStatus = targetOfLink.querySelector("button[aria-expanded]");

    // If it's in the viewport and it's not an accordion header, then exit
    if (targetInViewport && targetInOpenSection && !targetAccordionStatus) {
      return;
    }

    // If it's an accordion and it's closed, open it / jump to it
    if (targetAccordionStatus && targetAccordionStatus.getAttribute("aria-expanded") === "false") {
      targetOfLink.click();
      return;
    }

    // Otherwise, open the appropriate accordion
    const targetAccordionID = ebAccordionFindSection(targetOfLink);

    ebAccordionShow(targetAccordionID);

    if (autoCloseAccordionSections === true) {
      ebAccordionHideAllExceptThisOne(targetAccordionID);
    }

    // Now that the target is visible, scroll to it
    targetOfLink.scrollIntoView();
  });
}

function ebAccordionShowDefaultSection() {
  "use strict";
  ebAccordionHideAllExceptThisOne(ebAccordionDefaultAccordionHeadID());
  ebAccordionShow(ebAccordionDefaultAccordionHeadID());
}

function ebAccordionCloseAllButton() {
  "use strict";
  const button = document.querySelector(".accordion-show-all-button");
  button.innerHTML = locales[pageLanguage].accordion["close-all"];

  // Close all when clicked
  button.addEventListener("click", function () {
    ebAccordionHideAll();
    ebAccordionShowAllButton();
  });
  // Close all when keyboard is used
  button.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      ebAccordionHideAll();
      ebAccordionShowAllButton();
    }
  });
}

function ebAccordionShowAllButton() {
  "use strict";

  let button;
  if (document.querySelector(".accordion-show-all-button")) {
    button = document.querySelector(".accordion-show-all-button");
    button.innerHTML = locales[pageLanguage].accordion["show-all"];
  } else {
    const firstSection = document.querySelector(defaultAccordionHead);

    if (firstSection) {
      // Create a wrapper for the button
      const buttonWrapper = document.createElement("div");
      buttonWrapper.classList.add("accordion-show-all-button-wrapper");
      firstSection.insertAdjacentElement("beforebegin", buttonWrapper);

      // Create the button link
      button = document.createElement("a");
      button.classList.add("accordion-show-all-button");
      button.innerHTML = locales[pageLanguage].accordion["show-all"];
      button.setAttribute("tabindex", "0");
      buttonWrapper.insertAdjacentElement("afterbegin", button);
    }
  }

  if (button instanceof Element || button instanceof HTMLDocument) {
    // Show all when clicked
    button.addEventListener("click", function () {
      ebAccordionShowAll();
      ebAccordionCloseAllButton();
    });
    // Show all when keyboard access is used
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        ebAccordionShowAll();
        ebAccordionCloseAllButton();
      }
    });
  }
}

function ebAccordify() {
  "use strict";

  // Early exit for older browsers
  if (!ebAccordionInit()) {
    return;
  }

  document.body.setAttribute("data-accordion-active", "true");

  // Exit if there aren't any headings
  const sectionHeadings = document.querySelectorAll(accordionHeads);
  if (!sectionHeadings) {
    return;
  }

  // Exit if this isn't a chapter
  const thisIsFrontmatter = document.querySelector(".wrapper").classList.contains("frontmatter-page");
  const thisIsNotAChapter = !document.querySelector(".wrapper").classList.contains("default-page");
  const thisHasNoH2s = document.querySelector(accordionHeads) === null;
  const thisIsEndmatter = document.querySelector(".wrapper").classList.contains("endmatter-page");
  if (thisIsFrontmatter || thisIsNotAChapter || thisHasNoH2s || thisIsEndmatter) {
    // override if accordion is set to true for the page
    const thisPageHasAccordionProperty = document.querySelector(".wrapper[data-accordion-page]");
    if (!thisPageHasAccordionProperty) {
      return;
    }
  }

  ebAccordionSetUpSections(sectionHeadings);

  ebAccordionShowAllButton();

  // If accordion-open-first="false", don't open any sections
  if (document.querySelector(".wrapper").getAttribute("data-accordion-open-first")) {
    if (document.querySelector(".wrapper").getAttribute("data-accordion-open-first") === "false") {
      return;
    }
  }

  // Else if there's no hash, show the first section
  if (!window.location.hash) {
    ebAccordionShowDefaultSection();
    return;
  }

  // Else (there is a hash, so) show that section
  ebAccordionHideAll();
  ebAccordionShow();
}

function ebExpand() {
  "use strict";

  // Check for expand-accordion setting on page
  if (ebAccordionPageSetting() === "expand") {
    ebAccordionShowAll();
  }
}

function ebLoadAccordion() {
  "use strict";
  if (ebAccordionInit()) {
    ebAccordify();
    ebExpand();
    ebAccordionListenForAnchorClicks();
    ebAccordionListenForHeadingClicks();
    ebAccordionListenForNavClicks();
    ebAccordionListenForHashChange();
  }
}

function ebCheckAccordionReady() {
  return (
    document.body.getAttribute("data-accordion-active") !== "true" &&
    (document.body.getAttribute("data-index-targets") !== null || settings.dynamicIndexing === false) &&
    document.body.getAttribute("data-ids-assigned") !== null &&
    document.body.getAttribute("data-search-results") !== null
  );
}

// Wait for data-index-targets to be loaded
// and IDs to be assigned, and any search results to be loaded,
// before applying the accordion.
function ebPrepareForAccordion() {
  "use strict";

  if (ebCheckAccordionReady()) {
    // If the requirements are already met, just go ahead
    ebLoadAccordion();
  } else {
    // Otherwise wait for the requirements
    const accordionObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
          if (ebCheckAccordionReady()) {
            ebLoadAccordion();
          }
        }
      });
    });

    accordionObserver.observe(document.body, {
      attributes: true, // Listen for attribute changes
    });
  }
}

window.onload = ebPrepareForAccordion();

const ebNewTabInit = function () {
  // check for browser support of the features we use
  return navigator.userAgent.indexOf("Opera Mini") === -1 && "querySelector" in document && !!Array.prototype.forEach;
};

// *CSS selectors* to target
const ebNewTabTargets = 'a[href*="//"], .figure-image-link';

const ebNewTab = function () {
  // early exit for lack of browser support
  if (!ebNewTabInit()) return;

  const links = document.querySelectorAll(ebNewTabTargets);

  links.forEach(function (link) {
    // Ignore links where target="_self" has been explicitly set
    if (link.getAttribute("target") !== "_self") {
      link.target = "_blank";
      link.rel = "noopener";
    }
  });
};

ebNewTab();

/* jslint browser */
/* global window */

function ebDefinitionsInit() {
  "use strict";

  // check for browser support of the features we use
  return (
    navigator.userAgent.indexOf("Opera Mini") === -1 &&
    document.querySelector !== undefined &&
    window.addEventListener !== undefined &&
    !!Array.prototype.forEach
  );
}

function ebDefinitionsSlugify(snail) {
  "use strict";

  return snail
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text;
}

function ebDefinitionsMoveDefinitions() {
  "use strict";

  // get all the definition-terms and loop over them
  const definitionTerms = document.querySelectorAll(".definition-term");

  // loop over them
  definitionTerms.forEach(function (definitionTerm) {
    // console.log('Processing definition for ' + definitionTerm.innerHTML);

    // visually hide the old dl, the parent of the definitionTerm
    definitionTerm.parentNode.classList.add("hidden-definition-list");

    // get the definition term
    let definitionTermText = definitionTerm.innerHTML;

    // Detect presence of em spans
    let definitionTermTextIsItalic;
    if (definitionTermText.indexOf("<em>") !== -1) {
      // console.log(definitionTermText + ' contains italics.');
      definitionTermTextIsItalic = true;
    }

    // Create a plain-text version of definitionTermText for matching with dataTermInText
    let termTextForMatching = definitionTermText;
    // 1. Remove em spans created from asterisks in markdown
    if (definitionTermTextIsItalic) {
      termTextForMatching = termTextForMatching.replace(/(<([^>]+)>)/gi, "*");
    }
    // 2. Straighten quotes in the HTML to match data-terms
    termTextForMatching = termTextForMatching.replace("’", "'");
    termTextForMatching = termTextForMatching.replace("‘", "'");
    // console.log('termTextForMatching: ' + termTextForMatching);

    // to check that we even have any terms to define:
    // find a data-term attribute
    const dataTermInText = document.querySelector('[data-term="' + termTextForMatching + '"]');
    // check that we have the term in the text
    if (!dataTermInText) {
      return;
    }

    // now we can add popups to each of them

    // find all the places where we want a popup
    const dataTermsInText = document.querySelectorAll('[data-term="' + termTextForMatching + '"]');

    // for each one, get the description and add the popup
    dataTermsInText.forEach(function (dataTermInText) {
      // if the term contained italics, put the em tags back
      if (definitionTermTextIsItalic) {
        definitionTermText = termTextForMatching.replace(/\*(.+?)\*/gi, "<em>$1</em>");
      }

      // get the description text
      const definitionDescriptionText = definitionTerm.nextElementSibling.innerHTML;

      // add it after the data-term
      const definitionPopup = document.createElement("span");
      definitionPopup.innerHTML =
        '<span class="definition-hover-term">' + definitionTermText + "</span>" + " " + definitionDescriptionText;
      definitionPopup.classList.add("visuallyhidden");
      definitionPopup.classList.add("definition-description-hover");
      definitionPopup.setAttribute("data-bookmarkable", "no");
      // Removing addition of IDs to prevent duplicate IDs on a chapter page
      // to improve accessibility.
      // definitionPopup.id = 'dd-' + ebDefinitionsSlugify(definitionTermText);
      dataTermInText.insertAdjacentElement("afterEnd", definitionPopup);

      // Add a Word Joiner (zero-width non-breaking space) after the definition popup,
      // to ensure that any punctuation after a definition term reflows correctly.
      definitionPopup.insertAdjacentHTML("afterEnd", "&NoBreak;");

      // add the closing X as a link
      const closeButton = document.createElement("button");
      closeButton.classList.add("close");
      closeButton.innerHTML = '<span class="visuallyhidden">close</span>';
      definitionPopup.appendChild(closeButton);
    });
  });
}

function ebDefinitionsKeyboardAccess() {
  "use strict";

  const descriptionSpans = document.querySelectorAll("span.definition-description-hover");
  descriptionSpans.forEach(function (span) {
    const tabbableElements = span.querySelectorAll("em.definition-cross-reference a, button.close");
    tabbableElements.forEach(function (el) {
      el.setAttribute("tabindex", "-1");
    });
  });
}

function ebDefinitionsShowDescriptions() {
  "use strict";

  // get the terms
  const dataTerms = document.querySelectorAll("[data-term]");

  // loop and listen for hover on child description
  dataTerms.forEach(function (dataTerm) {
    // get the child that we want to pop up
    const childPopup = dataTerm.nextElementSibling;

    if (childPopup) {
      // show on click
      dataTerm.addEventListener("click", function () {
        childPopup.classList.remove("visuallyhidden");
      });
      // Make definitions keyboard focusable
      dataTerm.setAttribute("tabindex", 0);

      const tabbableElements = childPopup.querySelectorAll("em.definition-cross-reference a, button.close");
      // Show definition when focused and Enter is pressed
      dataTerm.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          childPopup.classList.toggle("visuallyhidden");
          tabbableElements.forEach(function (el) {
            if (el.hasAttribute("tabindex")) {
              el.removeAttribute("tabindex");
            } else {
              el.setAttribute("tabindex", "-1");
            }
          });
        }
      });
    } else {
      console.debug("A data-term is not loading. Check the definition for: " + dataTerm.innerText);
    }
  });
}

function ebDefinitionsHideDescriptions() {
  "use strict";

  const descriptions = document.querySelectorAll(".definition-description-hover");

  descriptions.forEach(function (description) {
    // if we mouseleave description, hide it
    // (mouseout also fires on mouseout of children, so we use mouseleave)
    description.addEventListener("mouseleave", function () {
      setTimeout(function () {
        description.classList.add("visuallyhidden");
      }, 1000);
    });
    const tabbableElements = description.querySelectorAll("em.definition-cross-reference a, button.close");
    // Close definition when Esc is pressed
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        description.classList.add("visuallyhidden");
        tabbableElements.forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
      }
    });
  });
}

function ebDefinitionsHideDescriptionWithButton() {
  "use strict";

  const closeButtons = document.querySelectorAll(".definition-description-hover button.close");

  // listen for clicks on all close buttons
  closeButtons.forEach(function (closeButton) {
    closeButton.addEventListener("click", function () {
      // ev.preventDefault();
      closeButton.parentNode.classList.add("visuallyhidden");
    });
    closeButton.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        const tabbableElements = closeButton.parentNode.querySelectorAll(
          "em.definition-cross-reference a, button.close"
        );
        tabbableElements.forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
      }
    });
  });
}

const ebDefinitions = function () {
  "use strict";

  // early exit for lack of browser support
  if (!ebDefinitionsInit()) {
    return;
  }

  // move all the definitions next to their terms
  ebDefinitionsMoveDefinitions();

  // listen for hover and things
  ebDefinitionsKeyboardAccess();
  ebDefinitionsShowDescriptions();
  ebDefinitionsHideDescriptions();
  ebDefinitionsHideDescriptionWithButton();
};

ebDefinitions();

// Debugging logs should be stripped automatically
// when JS is minified.
// console.log('Debugging definitions.js');

/* jslint browser */

// Detect long sidenotes and make them 'web'wide
// console.log('Debugging sidenotes.js...');

// Options:
// length: min characters to convert to .web-wide
// elements: which elements are sidenotes? Use CSS selectors
// siblings: which elements can wrap around web-wide sidenotes? Use tag names only.
const options = {
  length: "300",
  elements: ".sidenote, .info",
  siblings: "p, ol, ul, dl, h3, h4, h5",
};

// Get all the sidenotes
function ebSidenoteConverterAllSidenotes() {
  "use strict";
  const sidenotes = document.querySelectorAll(options.elements);
  // console.log('Found ' + sidenotes.length + ' sidenotes.');
  return sidenotes;
}

// Get a sidenote's length
function ebSidenoteConverterSidenoteLength(sidenote) {
  "use strict";
  const length = sidenote.innerText.length;
  return length;
}

// Check if an element is in the list of allowed siblings
function ebSidenoteConverterIsAllowedAsSibling(element) {
  "use strict";

  // console.log('Checking whether ' + element.tagName + ' can wrap this sidenote.');

  // Get the allowed siblings list, remove spaces,
  // convert to uppercase to match tagNames,
  // and split it into an object.
  let allowedSiblings = options.siblings;
  allowedSiblings = allowedSiblings.replace(/\s/g, "");
  allowedSiblings = allowedSiblings.toUpperCase();
  allowedSiblings = allowedSiblings.split(",");

  // Check if the element is in the allowedSiblings object.
  if (Object.values(allowedSiblings).indexOf(element.tagName) > -1) {
    // console.log('Yes, ' + element.tagName + ' can wrap a sidenote.');
    return true;
  }
}

// Add 'web-wide' class
function ebSidenoteConverterAddClass(sidenote) {
  "use strict";
  // console.log('Adding "web-wide" class to sidenote: "' + sidenote.innerText + '"');
  // In some instances, we want to override this behaviour, so let's check for that class
  if (sidenote.classList.contains("no-web-wide")) {
    return sidenote;
  }

  // Also, we don't want web-wide sidenotes to be on the left,
  // so also add the web-sidenote-right class.
  sidenote = sidenote.classList.add("web-wide", "web-sidenote-right");

  return sidenote;
}

// Recursively check the siblings of the sidenote
// to see if they can safely wrap around the sidenote.
function ebSidenoteConverterWrapText(sidenote, element, sidenoteLength, nextElementsLength) {
  "use strict";

  if (element.nextElementSibling) {
    if (ebSidenoteConverterIsAllowedAsSibling(element.nextElementSibling)) {
      // console.log('This next element can wrap a sidenote: ' + element.nextElementSibling.innerText);
      nextElementsLength = nextElementsLength + element.nextElementSibling.innerText.length;
      if (nextElementsLength > sidenoteLength) {
        // console.log('Following elements are long enough.');
        ebSidenoteConverterAddClass(sidenote);
      } else {
        ebSidenoteConverterWrapText(sidenote, element.nextElementSibling, sidenoteLength, nextElementsLength);
      }
    }
  }
}

// The main process
function ebSidenoteConverterProcess() {
  "use strict";
  // console.log('Starting to process sidenotes...');
  let i;
  let sidenoteLength;
  const sidenotes = ebSidenoteConverterAllSidenotes();
  let sidenote;
  for (i = 0; i < sidenotes.length; i += 1) {
    sidenote = sidenotes[i];
    sidenoteLength = ebSidenoteConverterSidenoteLength(sidenote);
    // console.log('Sidenote is ' + sidenoteLength + ' characters long: "' + sidenote.innerText + '"');
    if (sidenoteLength > options.length) {
      // console.log('Sidenote length more than ' + options.length + 'px');
      ebSidenoteConverterWrapText(sidenote, sidenote, sidenoteLength, 0);
    }
  }
}

ebSidenoteConverterProcess();

/* jslint browser */
/* global document */

function ebIframeSwitcher() {
  "use strict";

  const iframeSwitcherButtons = document.querySelectorAll(".load-iframe-button");

  iframeSwitcherButtons.forEach(function (button) {
    button.addEventListener("click", function ebSwitchTheIframe() {
      let slideDiv;
      let slideNav;
      let slideFigures;
      let figureDiv;
      let iframeElement;
      let iframeElements;

      // If the static image is currently showing, switch to iframe
      if (button.classList.contains("js-interactive")) {
        // Make this button invisible
        button.classList.add("visuallyhidden");
        button.setAttribute("tabindex", "-1");

        // Find the static button and make it visible
        const staticButton = button.parentElement.querySelector(".js-static");
        staticButton.classList.remove("visuallyhidden");
        staticButton.setAttribute("tabindex", "0");
        staticButton.focus();

        const iframeLink = button.getAttribute("data-link");

        // Make the new iframe element
        iframeElement = document.createElement("iframe");
        iframeElement.setAttribute("src", iframeLink);
        iframeElement.setAttribute("loading", "lazy");
        // Add class to the iframe for styling
        iframeElement.classList.add("owid-iframe");

        if (button.closest(".slides") !== null) {
          // Sometimes the iframe needs to replace an entire set of slides
          slideDiv = button.closest(".slides");
          // Add a class to the slide div for styling
          slideDiv.classList.add("contains-iframe");
          // Make the slide nav invisible
          slideNav = slideDiv.querySelector(".nav-slides");
          slideNav.classList.add("visuallyhidden");

          // Make the slides themselves invisible with their captions
          slideFigures = slideDiv.querySelectorAll(".figure");
          slideFigures.forEach(function (figure) {
            figure.classList.add("visuallyhidden");
          });

          // Put the iframeElement after the last (invisible) figure
          const lastSlide = slideFigures[slideFigures.length - 1];
          const figureMeta = lastSlide.parentElement.querySelector(".figure-summary-meta");
          figureMeta.parentElement.insertBefore(iframeElement, figureMeta);
        } else {
          // Other times it only needs to replace a standalone figure
          // Get the figure container
          figureDiv = button.closest(".figure").querySelector(".figure-images");
          // Make it invisible
          figureDiv.classList.add("visuallyhidden");
          // Put the iframeElement after the (invisible) figure
          const figureCaption = figureDiv.parentElement.querySelector(".caption");
          figureCaption.parentElement.insertBefore(iframeElement, figureCaption);
        }
      } else {
        // If the iframe is currently showing, switch to static image/slides
        button.classList.add("visuallyhidden");
        button.setAttribute("tabindex", "-1");

        const interactiveButtons = button.parentElement.querySelectorAll(".js-interactive");
        interactiveButtons.forEach(function (interactiveButton) {
          interactiveButton.classList.remove("visuallyhidden");
          interactiveButton.setAttribute("tabindex", "0");
        });

        interactiveButtons[0].focus();

        // If we're dealing with a set of slides
        if (button.closest(".slides") !== null) {
          // Get the iframe element
          iframeElements = button.closest(".slides").querySelectorAll("iframe.owid-iframe");
          iframeElements.forEach(function (iframeElement) {
            // Remove it from the DOM
            iframeElement.remove();
          });

          slideDiv = button.closest(".slides");
          // Remove the styling class
          slideDiv.classList.remove("contains-iframe");
          // Make the slide nav visible again
          slideNav = slideDiv.querySelector(".nav-slides");
          slideNav.classList.remove("visuallyhidden");

          // Find the slide that we were on before and make it visible
          slideFigures = slideDiv.querySelectorAll(".figure");

          const currentSlideItems = slideNav.querySelectorAll("li.slide-current");
          let currentSlideNav = currentSlideItems[currentSlideItems.length - 1];

          if (!currentSlideNav) {
            currentSlideNav = slideNav.querySelector("li");
          }

          const currentSlideNavLink = currentSlideNav.querySelector("a").href;
          const currentSlideID = currentSlideNavLink.split("#")[1];
          const currentSlide = document.getElementById(currentSlideID);
          currentSlide.classList.remove("visuallyhidden");
        } else {
          // If we're dealing with a standalone figure
          // Get the iframe element
          iframeElements = button.closest(".figure").querySelectorAll("iframe.owid-iframe");
          iframeElements.forEach(function (iframeElement) {
            // Remove it from the DOM
            iframeElement.remove();
          });
          // Bring back the figure
          const figure = button.closest(".figure").querySelector(".figure-images");
          figure.classList.remove("visuallyhidden");
        }
      }
    });
  });
}

ebIframeSwitcher();

function ebGraphOptionsDropdown() {
  "use strict";

  const graphOptionsButtons = document.querySelectorAll("button.graph-options");

  graphOptionsButtons.forEach(function (button) {
    const dropdown = button.nextElementSibling;
    const options = dropdown.querySelectorAll("a, button");

    button.addEventListener("click", function () {
      dropdown.classList.toggle("visuallyhidden");
      options.forEach(function (option) {
        // if (option.getAttribute("tabindex") === "-1") {
        if (option.classList.contains("visuallyhidden")) {
          option.setAttribute("tabindex", "-1");
        } else {
          option.setAttribute("tabindex", "0");
        }
      });
    });

    // Keyboard access
    function ebHideDropdown(event) {
      if (event.key === "Escape" && !dropdown.classList.contains("visuallyhidden")) {
        dropdown.classList.add("visuallyhidden");
        options.forEach(function (option) {
          option.setAttribute("tabindex", "-1");
        });
        button.focus();
      }
    }

    button.addEventListener("keydown", ebHideDropdown);
    dropdown.addEventListener("keydown", ebHideDropdown);
  });
}

ebGraphOptionsDropdown();

/* jslint browser */
/* globals window, Storage, localStorage */

// Lets user switch to dark mode,
// and saves their choice to localStorage.

// Check for browser support
function ebDarkMarkSupport() {
  "use strict";
  if (window.localStorage && Storage !== "undefined") {
    return true;
  }
}

// Save user preference to local storage
function ebDarkModeSave(status) {
  "use strict";
  if (window.localStorage && Storage !== "undefined") {
    localStorage.setItem("dark-mode", status);
  }
}

// Turn on dark mode
function ebDarkModeOn() {
  "use strict";
  document.body.classList.add("dark-mode");
  ebDarkModeSave("on");
}

// Turn off dark mode
function ebDarkModeOff() {
  "use strict";
  document.body.classList.remove("dark-mode");
  ebDarkModeSave("off");
}

// Toggle dark mode
function ebDarkModeToggle() {
  "use strict";
  if (localStorage.getItem("dark-mode") === "on") {
    ebDarkModeOff();
  } else {
    ebDarkModeOn();
  }
}

// Check for the saved mode and apply it,
// then listen for clicks to toggle mode
function ebDarkMode() {
  "use strict";

  // Exit if no support
  if (ebDarkMarkSupport() !== true) {
    return;
  }

  // If stored value is on, turn on dark mode
  const status = localStorage.getItem("dark-mode");
  if (status === "on") {
    ebDarkModeOn();
  }

  // Show the button
  const darkModeControl = document.querySelector(".dark-mode-control");

  if (darkModeControl !== null) {
    darkModeControl.classList.remove("visuallyhidden");

    // Listen for clicks on it
    darkModeControl.addEventListener("click", function () {
      ebDarkModeToggle();
    });
    darkModeControl.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        ebDarkModeToggle();
      }
    });
  }
}

// Run the main process
ebDarkMode();

/* jslint browser */
/* globals */

// Manage notifications

function ebNotificationCloseButton(element, index) {
  "use strict";

  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("name", "notification-" + index);
  checkbox.setAttribute("id", "notification-" + index);
  checkbox.classList.add("notification-close-button");
  checkbox.style.display = "none";
  element.appendChild(checkbox);

  // With the box hidden, let user click a label
  const checkboxLabel = document.createElement("label");
  checkboxLabel.innerHTML = "×";
  checkboxLabel.setAttribute("for", "notification-" + index);
  checkboxLabel.style.display = "inline-block";
  checkboxLabel.style.width = "auto";
  checkboxLabel.style.color = "grey";
  checkboxLabel.style.marginLeft = "2em";
  element.appendChild(checkboxLabel);

  // Hide on click
  checkbox.addEventListener("click", function () {
    checkbox.parentNode.style.display = "none";
  });
}

function ebNotificationBoxes() {
  "use strict";
  const notifications = document.querySelectorAll(".notification");
  notifications.forEach(function (notification, index) {
    ebNotificationCloseButton(notification, index);
  });
}

ebNotificationBoxes();

/* jslint browser */

function ebLanguageSelector() {
  "use strict";
  // The language selector needs to be keyboard accessible
  const languageSelector = document.querySelector(".language-select");

  if (languageSelector) {
    languageSelector.addEventListener("keydown", function (event) {
      // Toggle the dropdown with Enter
      if (event.key === "Enter" && languageSelector.contains(event.target)) {
        languageSelector.toggleAttribute("visible");
      }
      // Close the dropdown with Escape
      if (event.key === "Escape" && languageSelector.hasAttribute("visible")) {
        languageSelector.removeAttribute("visible");
        languageSelector.focus();
      }
    });
  }
}

ebLanguageSelector();

/* jslint browser */

function ebFormatTranscripts() {
  "use strict";
  // Rearrange the elements in the transcript files for ease of styling

  // Only transcript files contain the timestamp class
  if (document.querySelector(".timestamp")) {
    const speechParagraphs = document.querySelectorAll(".content p");
    speechParagraphs.forEach(function (para) {
      const timestamp = para.querySelector("em.timestamp");
      const linebreak = document.createElement("br");

      // Encapsulate speaker name and timestamp in a span for CSS
      const wrapperSpan = document.createElement("span");
      wrapperSpan.classList.add("name-and-timestamp");

      // Monologue transcripts don't have speaker names
      if (para.querySelector("strong")) {
        const speakerName = para.querySelector("strong");
        wrapperSpan.appendChild(speakerName);
      }

      wrapperSpan.appendChild(timestamp);
      wrapperSpan.appendChild(linebreak);

      para.prepend(wrapperSpan);
    });
  }
}

ebFormatTranscripts();

/* jslint browser */
/* globals location, MutationObserver */

// Change the content of the notification close button label
function ebChangeCloseButton() {
  "use strict";

  const closeButtons = document.querySelectorAll(".notification.login-prompt label");

  if (closeButtons) {
    closeButtons.forEach(function (button) {
      button.innerHTML = "╳";
    });
  }
}

ebChangeCloseButton();

// Detect whether the reader is logged in to the WP site
function ebLoggedInToWP() {
  "use strict";

  let readerIsLoggedIn = false;
  const cookieName = "coreproject_sess";

  if (document.cookie.includes(cookieName)) {
    // we're logged in to the WP account
    readerIsLoggedIn = true;
  }

  return readerIsLoggedIn;
}

function ebDisplayLoginPrompts() {
  "use strict";

  const sidebarLoginPrompt = document.querySelector(".sidebar-login-prompt");

  // If they are not logged in, show the sidebar prompt on the home page
  if (!ebLoggedInToWP() && "" === "true") {
    if (sidebarLoginPrompt && document.body.classList.contains("home")) {
      sidebarLoginPrompt.classList.remove("visuallyhidden");
    }
  }

  // Then, always show the prompts inside in instructors-preview view
  if ("" === "instructors-preview") {
    if (sidebarLoginPrompt) {
      sidebarLoginPrompt.classList.remove("visuallyhidden");
    }
  }
}

ebDisplayLoginPrompts();

function ebHideSectionContents() {
  "use strict";

  if ("" === "instructors-preview") {
    // If we're in a unit and haven't already done this, get all the sections
    if (
      document.body.classList.contains("default-page") &&
      !document.body.classList.contains("home") &&
      !document.body.classList.contains("instructor-content-hidden")
    ) {
      // Flag that we have done this process to avoid repetition
      document.body.classList.add("instructor-content-hidden");

      // Get all the sections
      const sections = document.querySelectorAll("section > div[data-container='true']");

      sections.forEach(function (section) {
        // Check whether the h2 has class "instructors-only" -- these are
        // the sections that get greyed out in instructors-preview view
        const h2 = section.parentNode.querySelector("h2");
        if (h2.classList.contains("instructors-only")) {
          section.classList.add("obscured-section");

          const button = document.createElement("a");
          button.innerHTML = "Instructor login";
          button.classList.add("instructor-login");

          const redirect = location.pathname.replace("instructors-preview", "instructors");

          button.setAttribute("href", "https://www.core-econ.org/login/?redirect_to=" + redirect);
          button.setAttribute("target", "_self");

          if (section.getAttribute("aria-expanded") === "false") {
            button.classList.add("visuallyhidden");
          }

          section.after(button);

          // When the section is open, show the button
          const sectionObserver = new MutationObserver(function (mutationsList) {
            mutationsList.forEach(function (mutation) {
              if (mutation.type === "attributes" && mutation.attributeName === "aria-expanded") {
                if (section.getAttribute("aria-expanded") === "true") {
                  button.classList.remove("visuallyhidden");
                } else {
                  button.classList.add("visuallyhidden");
                }
              }
            });
          });

          sectionObserver.observe(section, { attributes: true });
        }
      });
    }
  }
}

function ebWaitForAccordion() {
  // Need to wait for the accordion to load, before we manipulating the sections
  "use strict";

  const accordionWaiter = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "attributes") {
        if (document.body.getAttribute("data-accordion-active") === "true") {
          ebHideSectionContents();
        }
      }
    });
  });

  accordionWaiter.observe(document.body, { attributes: true });
}

ebWaitForAccordion();

/**
 * @license
 * Lodash (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash core -o ./dist/lodash.core.js`
 */
(function () {
  function n(n) {
    return H(n) && pn.call(n, "callee") && !yn.call(n, "callee");
  }
  function t(n, t) {
    return n.push.apply(n, t), n;
  }
  function r(n) {
    return function (t) {
      return null == t ? Z : t[n];
    };
  }
  function e(n, t, r, e, u) {
    return (
      u(n, function (n, u, o) {
        r = e ? ((e = false), n) : t(r, n, u, o);
      }),
      r
    );
  }
  function u(n, t) {
    return j(t, function (t) {
      return n[t];
    });
  }
  function o(n) {
    return n instanceof i ? n : new i(n);
  }
  function i(n, t) {
    (this.__wrapped__ = n), (this.__actions__ = []), (this.__chain__ = !!t);
  }
  function c(n, t, r) {
    if (typeof n != "function") throw new TypeError("Expected a function");
    return setTimeout(function () {
      n.apply(Z, r);
    }, t);
  }
  function f(n, t) {
    var r = true;
    return (
      mn(n, function (n, e, u) {
        return (r = !!t(n, e, u));
      }),
      r
    );
  }
  function a(n, t, r) {
    for (var e = -1, u = n.length; ++e < u; ) {
      var o = n[e],
        i = t(o);
      if (null != i && (c === Z ? i === i : r(i, c)))
        var c = i,
          f = o;
    }
    return f;
  }
  function l(n, t) {
    var r = [];
    return (
      mn(n, function (n, e, u) {
        t(n, e, u) && r.push(n);
      }),
      r
    );
  }
  function p(n, r, e, u, o) {
    var i = -1,
      c = n.length;
    for (e || (e = R), o || (o = []); ++i < c; ) {
      var f = n[i];
      0 < r && e(f) ? (1 < r ? p(f, r - 1, e, u, o) : t(o, f)) : u || (o[o.length] = f);
    }
    return o;
  }
  function s(n, t) {
    return n && On(n, t, Dn);
  }
  function h(n, t) {
    return l(t, function (t) {
      return U(n[t]);
    });
  }
  function v(n, t) {
    return n > t;
  }
  function b(n, t, r, e, u) {
    return n === t || (null == n || null == t || (!H(n) && !H(t)) ? n !== n && t !== t : y(n, t, r, e, b, u));
  }
  function y(n, t, r, e, u, o) {
    var i = Nn(n),
      c = Nn(t),
      f = i ? "[object Array]" : hn.call(n),
      a = c ? "[object Array]" : hn.call(t),
      f = "[object Arguments]" == f ? "[object Object]" : f,
      a = "[object Arguments]" == a ? "[object Object]" : a,
      l = "[object Object]" == f,
      c = "[object Object]" == a,
      a = f == a;
    o || (o = []);
    var p = An(o, function (t) {
        return t[0] == n;
      }),
      s = An(o, function (n) {
        return n[0] == t;
      });
    if (p && s) return p[1] == t;
    if ((o.push([n, t]), o.push([t, n]), a && !l)) {
      if (i) r = T(n, t, r, e, u, o);
      else
        n: {
          switch (f) {
            case "[object Boolean]":
            case "[object Date]":
            case "[object Number]":
              r = J(+n, +t);
              break n;
            case "[object Error]":
              r = n.name == t.name && n.message == t.message;
              break n;
            case "[object RegExp]":
            case "[object String]":
              r = n == t + "";
              break n;
          }
          r = false;
        }
      return o.pop(), r;
    }
    return 1 & r || ((i = l && pn.call(n, "__wrapped__")), (f = c && pn.call(t, "__wrapped__")), !i && !f)
      ? !!a && ((r = B(n, t, r, e, u, o)), o.pop(), r)
      : ((i = i ? n.value() : n), (f = f ? t.value() : t), (r = u(i, f, r, e, o)), o.pop(), r);
  }
  function g(n) {
    return typeof n == "function" ? n : null == n ? X : (typeof n == "object" ? d : r)(n);
  }
  function _(n, t) {
    return n < t;
  }
  function j(n, t) {
    var r = -1,
      e = M(n) ? Array(n.length) : [];
    return (
      mn(n, function (n, u, o) {
        e[++r] = t(n, u, o);
      }),
      e
    );
  }
  function d(n) {
    var t = _n(n);
    return function (r) {
      var e = t.length;
      if (null == r) return !e;
      for (r = Object(r); e--; ) {
        var u = t[e];
        if (!(u in r && b(n[u], r[u], 3))) return false;
      }
      return true;
    };
  }
  function m(n, t) {
    return (
      (n = Object(n)),
      C(
        t,
        function (t, r) {
          return r in n && (t[r] = n[r]), t;
        },
        {}
      )
    );
  }
  function O(n) {
    return xn(I(n, void 0, X), n + "");
  }
  function x(n, t, r) {
    var e = -1,
      u = n.length;
    for (
      0 > t && (t = -t > u ? 0 : u + t),
        r = r > u ? u : r,
        0 > r && (r += u),
        u = t > r ? 0 : (r - t) >>> 0,
        t >>>= 0,
        r = Array(u);
      ++e < u;

    )
      r[e] = n[e + t];
    return r;
  }
  function A(n) {
    return x(n, 0, n.length);
  }
  function E(n, t) {
    var r;
    return (
      mn(n, function (n, e, u) {
        return (r = t(n, e, u)), !r;
      }),
      !!r
    );
  }
  function w(n, r) {
    return C(
      r,
      function (n, r) {
        return r.func.apply(r.thisArg, t([n], r.args));
      },
      n
    );
  }
  function k(n, t, r) {
    var e = !r;
    r || (r = {});
    for (var u = -1, o = t.length; ++u < o; ) {
      var i = t[u],
        c = Z;
      if ((c === Z && (c = n[i]), e)) r[i] = c;
      else {
        var f = r,
          a = f[i];
        (pn.call(f, i) && J(a, c) && (c !== Z || i in f)) || (f[i] = c);
      }
    }
    return r;
  }
  function N(n) {
    return O(function (t, r) {
      var e = -1,
        u = r.length,
        o = 1 < u ? r[u - 1] : Z,
        o = 3 < n.length && typeof o == "function" ? (u--, o) : Z;
      for (t = Object(t); ++e < u; ) {
        var i = r[e];
        i && n(t, i, e, o);
      }
      return t;
    });
  }
  function F(n) {
    return function () {
      var t = arguments,
        r = dn(n.prototype),
        t = n.apply(r, t);
      return V(t) ? t : r;
    };
  }
  function S(n, t, r) {
    function e() {
      for (
        var o = -1,
          i = arguments.length,
          c = -1,
          f = r.length,
          a = Array(f + i),
          l = this && this !== on && this instanceof e ? u : n;
        ++c < f;

      )
        a[c] = r[c];
      for (; i--; ) a[c++] = arguments[++o];
      return l.apply(t, a);
    }
    if (typeof n != "function") throw new TypeError("Expected a function");
    var u = F(n);
    return e;
  }
  function T(n, t, r, e, u, o) {
    var i = n.length,
      c = t.length;
    if (i != c && !(1 & r && c > i)) return false;
    for (var c = -1, f = true, a = 2 & r ? [] : Z; ++c < i; ) {
      var l = n[c],
        p = t[c];
      if (void 0 !== Z) {
        f = false;
        break;
      }
      if (a) {
        if (
          !E(t, function (n, t) {
            if (!P(a, t) && (l === n || u(l, n, r, e, o))) return a.push(t);
          })
        ) {
          f = false;
          break;
        }
      } else if (l !== p && !u(l, p, r, e, o)) {
        f = false;
        break;
      }
    }
    return f;
  }
  function B(n, t, r, e, u, o) {
    var i = 1 & r,
      c = Dn(n),
      f = c.length,
      a = Dn(t).length;
    if (f != a && !i) return false;
    for (var l = f; l--; ) {
      var p = c[l];
      if (!(i ? p in t : pn.call(t, p))) return false;
    }
    for (a = true; ++l < f; ) {
      var p = c[l],
        s = n[p],
        h = t[p];
      if (void 0 !== Z || (s !== h && !u(s, h, r, e, o))) {
        a = false;
        break;
      }
      i || (i = "constructor" == p);
    }
    return (
      a &&
        !i &&
        ((r = n.constructor),
        (e = t.constructor),
        r != e &&
          "constructor" in n &&
          "constructor" in t &&
          !(typeof r == "function" && r instanceof r && typeof e == "function" && e instanceof e) &&
          (a = false)),
      a
    );
  }
  function R(t) {
    return Nn(t) || n(t);
  }
  function D(n) {
    var t = [];
    if (null != n) for (var r in Object(n)) t.push(r);
    return t;
  }
  function I(n, t, r) {
    return (
      (t = jn(t === Z ? n.length - 1 : t, 0)),
      function () {
        for (var e = arguments, u = -1, o = jn(e.length - t, 0), i = Array(o); ++u < o; ) i[u] = e[t + u];
        for (u = -1, o = Array(t + 1); ++u < t; ) o[u] = e[u];
        return (o[t] = r(i)), n.apply(this, o);
      }
    );
  }
  function $(n) {
    return (null == n ? 0 : n.length) ? p(n, 1) : [];
  }
  function q(n) {
    return n && n.length ? n[0] : Z;
  }
  function P(n, t, r) {
    var e = null == n ? 0 : n.length;
    (r = typeof r == "number" ? (0 > r ? jn(e + r, 0) : r) : 0), (r = (r || 0) - 1);
    for (var u = t === t; ++r < e; ) {
      var o = n[r];
      if (u ? o === t : o !== o) return r;
    }
    return -1;
  }
  function z(n, t) {
    return mn(n, g(t));
  }
  function C(n, t, r) {
    return e(n, g(t), r, 3 > arguments.length, mn);
  }
  function G(n, t) {
    var r;
    if (typeof t != "function") throw new TypeError("Expected a function");
    return (
      (n = Fn(n)),
      function () {
        return 0 < --n && (r = t.apply(this, arguments)), 1 >= n && (t = Z), r;
      }
    );
  }
  function J(n, t) {
    return n === t || (n !== n && t !== t);
  }
  function M(n) {
    var t;
    return (
      (t = null != n) && ((t = n.length), (t = typeof t == "number" && -1 < t && 0 == t % 1 && 9007199254740991 >= t)),
      t && !U(n)
    );
  }
  function U(n) {
    return (
      !!V(n) &&
      ((n = hn.call(n)),
      "[object Function]" == n ||
        "[object GeneratorFunction]" == n ||
        "[object AsyncFunction]" == n ||
        "[object Proxy]" == n)
    );
  }
  function V(n) {
    var t = typeof n;
    return null != n && ("object" == t || "function" == t);
  }
  function H(n) {
    return null != n && typeof n == "object";
  }
  function K(n) {
    return typeof n == "number" || (H(n) && "[object Number]" == hn.call(n));
  }
  function L(n) {
    return typeof n == "string" || (!Nn(n) && H(n) && "[object String]" == hn.call(n));
  }
  function Q(n) {
    return typeof n == "string" ? n : null == n ? "" : n + "";
  }
  function W(n) {
    return null == n ? [] : u(n, Dn(n));
  }
  function X(n) {
    return n;
  }
  function Y(n, r, e) {
    var u = Dn(r),
      o = h(r, u);
    null != e || (V(r) && (o.length || !u.length)) || ((e = r), (r = n), (n = this), (o = h(r, Dn(r))));
    var i = !(V(e) && "chain" in e && !e.chain),
      c = U(n);
    return (
      mn(o, function (e) {
        var u = r[e];
        (n[e] = u),
          c &&
            (n.prototype[e] = function () {
              var r = this.__chain__;
              if (i || r) {
                var e = n(this.__wrapped__);
                return (
                  (e.__actions__ = A(this.__actions__)).push({
                    func: u,
                    args: arguments,
                    thisArg: n,
                  }),
                  (e.__chain__ = r),
                  e
                );
              }
              return u.apply(n, t([this.value()], arguments));
            });
      }),
      n
    );
  }
  var Z,
    nn = 1 / 0,
    tn = /[&<>"']/g,
    rn = RegExp(tn.source),
    en = /^(?:0|[1-9]\d*)$/,
    un = typeof self == "object" && self && self.Object === Object && self,
    on = (typeof global == "object" && global && global.Object === Object && global) || un || Function("return this")(),
    cn =
      (un = typeof exports == "object" && exports && !exports.nodeType && exports) &&
      typeof module == "object" &&
      module &&
      !module.nodeType &&
      module,
    fn = (function (n) {
      return function (t) {
        return null == n ? Z : n[t];
      };
    })({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }),
    an = Array.prototype,
    ln = Object.prototype,
    pn = ln.hasOwnProperty,
    sn = 0,
    hn = ln.toString,
    vn = on._,
    bn = Object.create,
    yn = ln.propertyIsEnumerable,
    gn = on.isFinite,
    _n = (function (n, t) {
      return function (r) {
        return n(t(r));
      };
    })(Object.keys, Object),
    jn = Math.max,
    dn = (function () {
      function n() {}
      return function (t) {
        return V(t) ? (bn ? bn(t) : ((n.prototype = t), (t = new n()), (n.prototype = Z), t)) : {};
      };
    })();
  (i.prototype = dn(o.prototype)), (i.prototype.constructor = i);
  var mn = (function (n, t) {
      return function (r, e) {
        if (null == r) return r;
        if (!M(r)) return n(r, e);
        for (var u = r.length, o = t ? u : -1, i = Object(r); (t ? o-- : ++o < u) && false !== e(i[o], o, i); );
        return r;
      };
    })(s),
    On = (function (n) {
      return function (t, r, e) {
        var u = -1,
          o = Object(t);
        e = e(t);
        for (var i = e.length; i--; ) {
          var c = e[n ? i : ++u];
          if (false === r(o[c], c, o)) break;
        }
        return t;
      };
    })(),
    xn = X,
    An = (function (n) {
      return function (t, r, e) {
        var u = Object(t);
        if (!M(t)) {
          var o = g(r);
          (t = Dn(t)),
            (r = function (n) {
              return o(u[n], n, u);
            });
        }
        return (r = n(t, r, e)), -1 < r ? u[o ? t[r] : r] : Z;
      };
    })(function (n, t, r) {
      var e = null == n ? 0 : n.length;
      if (!e) return -1;
      (r = null == r ? 0 : Fn(r)), 0 > r && (r = jn(e + r, 0));
      n: {
        for (t = g(t), e = n.length, r += -1; ++r < e; )
          if (t(n[r], r, n)) {
            n = r;
            break n;
          }
        n = -1;
      }
      return n;
    }),
    En = O(function (n, t, r) {
      return S(n, t, r);
    }),
    wn = O(function (n, t) {
      return c(n, 1, t);
    }),
    kn = O(function (n, t, r) {
      return c(n, Sn(t) || 0, r);
    }),
    Nn = Array.isArray,
    Fn = Number,
    Sn = Number,
    Tn = N(function (n, t) {
      k(t, _n(t), n);
    }),
    Bn = N(function (n, t) {
      k(t, D(t), n);
    }),
    Rn = O(function (n, t) {
      n = Object(n);
      var r,
        e = -1,
        u = t.length,
        o = 2 < u ? t[2] : Z;
      if ((r = o)) {
        r = t[0];
        var i = t[1];
        if (V(o)) {
          var c = typeof i;
          if ("number" == c) {
            if ((c = M(o)))
              var c = o.length,
                f = typeof i,
                c = null == c ? 9007199254740991 : c,
                c = !!c && ("number" == f || ("symbol" != f && en.test(i))) && -1 < i && 0 == i % 1 && i < c;
          } else c = "string" == c && i in o;
          r = !!c && J(o[i], r);
        } else r = false;
      }
      for (r && (u = 1); ++e < u; )
        for (o = t[e], r = In(o), i = -1, c = r.length; ++i < c; ) {
          var f = r[i],
            a = n[f];
          (a === Z || (J(a, ln[f]) && !pn.call(n, f))) && (n[f] = o[f]);
        }
      return n;
    }),
    Dn = _n,
    In = D,
    $n = (function (n) {
      return xn(I(n, Z, $), n + "");
    })(function (n, t) {
      return null == n ? {} : m(n, t);
    });
  (o.assignIn = Bn),
    (o.before = G),
    (o.bind = En),
    (o.chain = function (n) {
      return (n = o(n)), (n.__chain__ = true), n;
    }),
    (o.compact = function (n) {
      return l(n, Boolean);
    }),
    (o.concat = function () {
      var n = arguments.length;
      if (!n) return [];
      for (var r = Array(n - 1), e = arguments[0]; n--; ) r[n - 1] = arguments[n];
      return t(Nn(e) ? A(e) : [e], p(r, 1));
    }),
    (o.create = function (n, t) {
      var r = dn(n);
      return null == t ? r : Tn(r, t);
    }),
    (o.defaults = Rn),
    (o.defer = wn),
    (o.delay = kn),
    (o.filter = function (n, t) {
      return l(n, g(t));
    }),
    (o.flatten = $),
    (o.flattenDeep = function (n) {
      return (null == n ? 0 : n.length) ? p(n, nn) : [];
    }),
    (o.iteratee = g),
    (o.keys = Dn),
    (o.map = function (n, t) {
      return j(n, g(t));
    }),
    (o.matches = function (n) {
      return d(Tn({}, n));
    }),
    (o.mixin = Y),
    (o.negate = function (n) {
      if (typeof n != "function") throw new TypeError("Expected a function");
      return function () {
        return !n.apply(this, arguments);
      };
    }),
    (o.once = function (n) {
      return G(2, n);
    }),
    (o.pick = $n),
    (o.slice = function (n, t, r) {
      var e = null == n ? 0 : n.length;
      return (r = r === Z ? e : +r), e ? x(n, null == t ? 0 : +t, r) : [];
    }),
    (o.sortBy = function (n, t) {
      var e = 0;
      return (
        (t = g(t)),
        j(
          j(n, function (n, r, u) {
            return { value: n, index: e++, criteria: t(n, r, u) };
          }).sort(function (n, t) {
            var r;
            n: {
              r = n.criteria;
              var e = t.criteria;
              if (r !== e) {
                var u = r !== Z,
                  o = null === r,
                  i = r === r,
                  c = e !== Z,
                  f = null === e,
                  a = e === e;
                if ((!f && r > e) || (o && c && a) || (!u && a) || !i) {
                  r = 1;
                  break n;
                }
                if ((!o && r < e) || (f && u && i) || (!c && i) || !a) {
                  r = -1;
                  break n;
                }
              }
              r = 0;
            }
            return r || n.index - t.index;
          }),
          r("value")
        )
      );
    }),
    (o.tap = function (n, t) {
      return t(n), n;
    }),
    (o.thru = function (n, t) {
      return t(n);
    }),
    (o.toArray = function (n) {
      return M(n) ? (n.length ? A(n) : []) : W(n);
    }),
    (o.values = W),
    (o.extend = Bn),
    Y(o, o),
    (o.clone = function (n) {
      return V(n) ? (Nn(n) ? A(n) : k(n, _n(n))) : n;
    }),
    (o.escape = function (n) {
      return (n = Q(n)) && rn.test(n) ? n.replace(tn, fn) : n;
    }),
    (o.every = function (n, t, r) {
      return (t = r ? Z : t), f(n, g(t));
    }),
    (o.find = An),
    (o.forEach = z),
    (o.has = function (n, t) {
      return null != n && pn.call(n, t);
    }),
    (o.head = q),
    (o.identity = X),
    (o.indexOf = P),
    (o.isArguments = n),
    (o.isArray = Nn),
    (o.isBoolean = function (n) {
      return true === n || false === n || (H(n) && "[object Boolean]" == hn.call(n));
    }),
    (o.isDate = function (n) {
      return H(n) && "[object Date]" == hn.call(n);
    }),
    (o.isEmpty = function (t) {
      return M(t) && (Nn(t) || L(t) || U(t.splice) || n(t)) ? !t.length : !_n(t).length;
    }),
    (o.isEqual = function (n, t) {
      return b(n, t);
    }),
    (o.isFinite = function (n) {
      return typeof n == "number" && gn(n);
    }),
    (o.isFunction = U),
    (o.isNaN = function (n) {
      return K(n) && n != +n;
    }),
    (o.isNull = function (n) {
      return null === n;
    }),
    (o.isNumber = K),
    (o.isObject = V),
    (o.isRegExp = function (n) {
      return H(n) && "[object RegExp]" == hn.call(n);
    }),
    (o.isString = L),
    (o.isUndefined = function (n) {
      return n === Z;
    }),
    (o.last = function (n) {
      var t = null == n ? 0 : n.length;
      return t ? n[t - 1] : Z;
    }),
    (o.max = function (n) {
      return n && n.length ? a(n, X, v) : Z;
    }),
    (o.min = function (n) {
      return n && n.length ? a(n, X, _) : Z;
    }),
    (o.noConflict = function () {
      return on._ === this && (on._ = vn), this;
    }),
    (o.noop = function () {}),
    (o.reduce = C),
    (o.result = function (n, t, r) {
      return (t = null == n ? Z : n[t]), t === Z && (t = r), U(t) ? t.call(n) : t;
    }),
    (o.size = function (n) {
      return null == n ? 0 : ((n = M(n) ? n : _n(n)), n.length);
    }),
    (o.some = function (n, t, r) {
      return (t = r ? Z : t), E(n, g(t));
    }),
    (o.uniqueId = function (n) {
      var t = ++sn;
      return Q(n) + t;
    }),
    (o.each = z),
    (o.first = q),
    Y(
      o,
      (function () {
        var n = {};
        return (
          s(o, function (t, r) {
            pn.call(o.prototype, r) || (n[r] = t);
          }),
          n
        );
      })(),
      { chain: false }
    ),
    (o.VERSION = "4.17.15"),
    mn("pop join replace reverse split push shift sort splice unshift".split(" "), function (n) {
      var t = (/^(?:replace|split)$/.test(n) ? String.prototype : an)[n],
        r = /^(?:push|sort|unshift)$/.test(n) ? "tap" : "thru",
        e = /^(?:pop|join|replace|shift)$/.test(n);
      o.prototype[n] = function () {
        var n = arguments;
        if (e && !this.__chain__) {
          var u = this.value();
          return t.apply(Nn(u) ? u : [], n);
        }
        return this[r](function (r) {
          return t.apply(Nn(r) ? r : [], n);
        });
      };
    }),
    (o.prototype.toJSON =
      o.prototype.valueOf =
      o.prototype.value =
        function () {
          return w(this.__wrapped__, this.__actions__);
        }),
    typeof define == "function" && typeof define.amd == "object" && define.amd
      ? ((on._ = o),
        define(function () {
          return o;
        }))
      : cn
      ? (((cn.exports = o)._ = o), (un._ = o))
      : (on._ = o);
}).call(this);
function ebComponentShareLinks(href) {
  // Need to edit all of the links in the share menu,
  // so that sharing links include all of the extra parameters
  // and people can share the "component view".

  // This is the URL currently used. We need to replace this
  const shareURL = window.location.origin + window.location.pathname;
  const pageURL = encodeURIComponent(href);

  // Now where do we need to replace this?
  const shareLinks = document.querySelectorAll("a.share-link-content");

  shareLinks.forEach(function (link) {
    let hrefText = link.href;
    hrefText = hrefText.replace(shareURL, pageURL);
    link.href = hrefText;
  });

  // And also in the copy link
  const copyLink = document.querySelector("span.copy-to-clipboard");
  copyLink.setAttribute("data-copy-text", pageURL);
}

function ebComponentAddTitle(href) {
  // Check localStorage for title
  const componentTitle = ebGetComponentParameters(href).title;

  const componentTitleWrapper = document.createElement("div");
  componentTitleWrapper.classList.add("component-title-wrapper");

  const componentTitleDiv = document.createElement("div");
  componentTitleDiv.classList.add("component-title");

  const componentTitleText = document.createElement("p");
  componentTitleText.innerHTML = componentTitle;

  componentTitleDiv.appendChild(componentTitleText);
  componentTitleDiv.appendChild(ebComponentAddCloseButton(href));
  componentTitleWrapper.appendChild(componentTitleDiv);

  const contentDiv = document.querySelector(".content");
  contentDiv.insertAdjacentElement("beforebegin", componentTitleWrapper);
}

function ebComponentAddCloseButton(href) {
  // The button is actually a hyperlink that takes the reader back to the sidenote
  // where they clicked on the component link

  const fromFile = ebGetComponentParameters(href).from;
  const fromID = ebGetComponentParameters(href).id;

  const buttonHref = fromFile + fromID;

  const closeButton = document.createElement("a");
  closeButton.classList.add("component-close-button");
  closeButton.classList.add("button");
  closeButton.innerHTML = "╳";
  closeButton.href = buttonHref;

  return closeButton;
}

function ebComponentNext(thisSection, nextSection) {
  // Create a next arrow

  const nextArrow = document.createElement("a");
  nextArrow.innerHTML = "＞";
  nextArrow.href = window.location.href.replace(thisSection, nextSection);
  nextArrow.href = nextArrow.href.split("#")[0];
  nextArrow.classList.add("component-next");
  nextArrow.setAttribute("aria-label", "Next section");

  return nextArrow;
}

function ebComponentPrevious(thisSection, previousSection) {
  // Create a previous arrow

  const previousArrow = document.createElement("a");
  previousArrow.innerHTML = "＜";
  previousArrow.href = window.location.href.replace(thisSection, previousSection);
  previousArrow.href = previousArrow.href.split("#")[0];
  previousArrow.classList.add("component-previous");
  previousArrow.setAttribute("aria-label", "Previous section");

  return previousArrow;
}

function ebComponentPaginationText(sectionList, thisIndex) {
  const numOfSections = sectionList.length;
  const numOfThisSection = thisIndex + 1;

  const paginationText = document.createElement("p");
  paginationText.innerText = `Section ${numOfThisSection} of ${numOfSections}`;

  return paginationText;
}

function ebComponentPaginationArrows(sectionList, thisSection, thisIndex) {
  const arrowWrapper = document.createElement("div");
  arrowWrapper.classList.add("component-pagination-arrows");

  let previousSection = "";
  let nextSection = "";
  let nextArrow = "";
  let previousArrow = "";

  const paginationText = ebComponentPaginationText(sectionList, thisIndex);

  if (thisIndex !== 0) {
    previousSection = sectionList[thisIndex - 1];
    previousArrow = ebComponentPrevious(thisSection, previousSection);
  }
  if (thisIndex !== sectionList.length - 1) {
    nextSection = sectionList[thisIndex + 1];
    nextArrow = ebComponentNext(thisSection, nextSection);
  }

  if (previousSection) {
    arrowWrapper.appendChild(previousArrow);
  }
  arrowWrapper.appendChild(paginationText);
  if (nextSection) {
    arrowWrapper.appendChild(nextArrow);
  }

  const titleDiv = document.querySelector(".component-title-wrapper");
  titleDiv.insertAdjacentElement("afterend", arrowWrapper);
}

function ebComponentPaginationDots(sectionList, thisSection, thisIndex) {
  // Make a wrapper for the dots
  const dotWrapper = document.createElement("div");
  dotWrapper.classList.add("component-pagination-dots");

  const numOfDots = sectionList.length;

  for (let i = 0; i < numOfDots; i++) {
    const dotHref = window.location.href.replace(thisSection, sectionList[i]);
    const numOfThisDot = i + 1;

    const dotLink = document.createElement("a");
    dotLink.classList.add("dot");
    dotLink.setAttribute("href", dotHref);
    dotLink.setAttribute("title", `Section ${numOfThisDot} of ${numOfDots}`);

    if (i === thisIndex) {
      dotLink.classList.add("dot-filled");
    }

    dotWrapper.appendChild(dotLink);
  }

  const contentDiv = document.querySelector(".content");
  contentDiv.insertAdjacentElement("beforeend", dotWrapper);
}

function ebComponentMultipleSections(href, sectionList) {
  // Get the filename of the current page
  const thisSection = window.location.pathname.split("/").pop().split(".")[0];

  if (sectionList.includes(thisSection)) {
    const thisIndex = sectionList.indexOf(thisSection);

    // Need to add pagination to the bottom of the page
    ebComponentPaginationDots(sectionList, thisSection, thisIndex);

    ebComponentPaginationArrows(sectionList, thisSection, thisIndex);
  }
}

function ebGetComponentLength(href) {
  // Get the sections, determine the extent
  const sectionString = ebGetComponentParameters(href).sections;

  let sectionList;

  if (sectionString) {
    sectionList = sectionString.split(">");
  } else {
    console.error("Error in the sections argument");
  }

  console.log(sectionList);

  ebComponentAddTitle(href);

  if (sectionList.length > 1) {
    // This has multiple sections, add pagination
    ebComponentMultipleSections(href, sectionList);
  }
}

function ebGetComponentParameters(href) {
  const parameterStrings = href.split("?")[1].split("&"); // [component=true, title=Title, from=02, id=component-1, sections=01>02>03]

  const titleString = decodeURIComponent(parameterStrings[1].replace("title=", "")).replace(/\+/gi, " ");
  const fromString = parameterStrings[2].replace("from=", "") + ".html";
  const idString = "#" + parameterStrings[3].replace("id=", "");
  const sectionString = decodeURIComponent(parameterStrings[4].split("#")[0].replace("sections=", ""));

  return {
    title: titleString,
    from: fromString,
    id: idString,
    sections: sectionString,
  };
}

function ebComponentInit() {
  const href = window.location.href;

  if (href.includes("component=")) {
    // Add a component class to the wrapper for styling
    document.querySelector(".wrapper").classList.add("component");
    ebGetComponentLength(href);

    if (document.getElementById("share-links")) {
      ebComponentShareLinks(href);
    }
  }
}

// Go
ebComponentInit();

/* jslint browser */
/* globals locales, pageLanguage, holmes */

// This file allows us to use holmes to filter data lists
// in the book. The filterFactory can be used to create
// a filter instance for each data list, and then if we're
// on a page with that list (index, glossary, etc), an input
// box will be added to the page for filtering.

// NOTE: Currently, only one holmes filter instance can be
// added per page. This will need to be adjusted if needed in
// the future.

const filterFactory = (selector, input, find) => {
  return {
    selector,
    input,
    find,
    addFilter() {
      const dataList = document.querySelector(this.selector);

      if (dataList) {
        runHolmes(this.input, this.find);
      }

      // Add a filter text box to the page
      ebAddFilterInput(this.selector, this.input);
    },
  };
};

const runHolmes = function (input, find) {
  // Holmes
  // https://haroen.me/holmes/

  (function (a, b) {
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = b())
      : "function" == typeof define && define.amd
      ? define(b)
      : (a.holmes = b());
  })(this, function () {
    "use strict";
    var f = "undefined" == typeof window ? global : window,
      g = function (c, a) {
        return -1 !== c.indexOf(a);
      },
      h =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (a) {
              return typeof a;
            }
          : function (a) {
              return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype
                ? "symbol"
                : typeof a;
            },
      a = (function () {
        function a(a) {
          this.value = a;
        }
        function b(b) {
          function c(e, f) {
            try {
              var g = b[e](f),
                h = g.value;
              h instanceof a
                ? Promise.resolve(h.value).then(
                    function (a) {
                      c("next", a);
                    },
                    function (a) {
                      c("throw", a);
                    }
                  )
                : d(g.done ? "return" : "normal", g.value);
            } catch (a) {
              d("throw", a);
            }
          }
          function d(a, b) {
            "return" === a
              ? e.resolve({ value: b, done: !0 })
              : "throw" === a
              ? e.reject(b)
              : e.resolve({ value: b, done: !1 });
            (e = e.next), e ? c(e.key, e.arg) : (f = null);
          }
          var e, f;
          (this._invoke = function (a, b) {
            return new Promise(function (d, g) {
              var h = { key: a, arg: b, resolve: d, reject: g, next: null };
              f ? (f = f.next = h) : ((e = f = h), c(a, b));
            });
          }),
            "function" != typeof b.return && (this.return = void 0);
        }
        return (
          "function" == typeof Symbol &&
            Symbol.asyncIterator &&
            (b.prototype[Symbol.asyncIterator] = function () {
              return this;
            }),
          (b.prototype.next = function (a) {
            return this._invoke("next", a);
          }),
          (b.prototype.throw = function (a) {
            return this._invoke("throw", a);
          }),
          (b.prototype.return = function (a) {
            return this._invoke("return", a);
          }),
          {
            wrap: function (a) {
              return function () {
                return new b(a.apply(this, arguments));
              };
            },
            await: function (b) {
              return new a(b);
            },
          }
        );
      })(),
      i = function (a, b) {
        if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
      },
      b = (function () {
        function a(a, b) {
          for (var c, d = 0; d < b.length; d++)
            (c = b[d]),
              (c.enumerable = c.enumerable || !1),
              (c.configurable = !0),
              "value" in c && (c.writable = !0),
              Object.defineProperty(a, c.key, c);
        }
        return function (b, c, d) {
          return c && a(b.prototype, c), d && a(b, d), b;
        };
      })();
    var j = {
        invalidInput: "The Holmes input was no <input> or contenteditable.",
        optionsObject:
          'The options need to be given inside an object like this:\n\nnew Holmes({\n  find:".result"\n});\n\nsee also https://haroen.me/holmes/doc/holmes.html',
        findOption:
          'A find argument is needed. That should be a querySelectorAll for each of the items you want to match individually. You should have something like:\n\nnew Holmes({\n  find:".result"\n});\n\nsee also https://haroen.me/holmes/doc/holmes.html',
        noInput: "Your Holmes.input didn't match a querySelector",
        impossiblePlaceholder: "The Holmes placeholder couldn't be put; the elements had no parent.",
      },
      c = (function () {
        function f(a) {
          var k = this;
          i(this, f);
          var c = !1;
          if ("object" !== ("undefined" == typeof a ? "undefined" : h(a))) throw new Error(j.optionsObject);
          if ("string" != typeof a.find) throw new Error(j.findOption);
          var d = {
            input: "input[type=search]",
            find: "",
            placeholder: void 0,
            mark: !1,
            class: { visible: void 0, hidden: "hidden" },
            dynamic: !1,
            minCharacters: 0,
            hiddenAttr: !1,
            shouldShow: g,
            onHidden: void 0,
            onVisible: void 0,
            onEmpty: void 0,
            onFound: void 0,
            onInput: void 0,
          };
          (this.options = Object.assign({}, d, a)),
            (this.options.class = Object.assign({}, d.class, a.class)),
            (this.hidden = 0),
            (this.running = !1),
            window.addEventListener("DOMContentLoaded", function () {
              return k.start();
            }),
            (this.search = function () {
              k.running = !0;
              var d = !1;
              (k.searchString = k.inputString()),
                (k.options.minCharacters &&
                  0 !== k.searchString.length &&
                  k.options.minCharacters > k.searchString.length) ||
                  (k.options.dynamic &&
                    ((k.elements = document.querySelectorAll(k.options.find)),
                    (k.elementsLength = k.elements.length),
                    (k.elementsArray = Array.prototype.slice.call(k.elements))),
                  k.options.mark && (k._regex = new RegExp("(" + k.searchString + ")(?![^<]*>)", "gi")),
                  k.elementsArray.forEach(function (a) {
                    k.options.shouldShow(a.textContent.toLowerCase(), k.searchString)
                      ? (k._showElement(a),
                        c && "function" == typeof k.options.onFound && k.options.onFound(k.placeholderNode),
                        (d = !0))
                      : k._hideElement(a);
                  }),
                  "function" == typeof k.options.onInput && k.options.onInput(k.searchString),
                  d
                    ? k.options.placeholder && k._hideElement(k.placeholderNode)
                    : (k.options.placeholder && k._showElement(k.placeholderNode),
                      !1 == c &&
                        ((c = !0), "function" == typeof k.options.onEmpty && k.options.onEmpty(k.placeholderNode))));
            });
        }
        return (
          b(f, [
            {
              key: "_hideElement",
              value: function (b) {
                this.options.class.visible && b.classList.remove(this.options.class.visible),
                  b.classList.contains(this.options.class.hidden) ||
                    (b.classList.add(this.options.class.hidden),
                    this.hidden++,
                    "function" == typeof this.options.onHidden && this.options.onHidden(b)),
                  this.options.hiddenAttr && b.setAttribute("hidden", "true"),
                  this.options.mark && (b.innerHTML = b.innerHTML.replace(/<\/?mark>/g, ""));
              },
            },
            {
              key: "_showElement",
              value: function (b) {
                this.options.class.visible && b.classList.add(this.options.class.visible),
                  b.classList.contains(this.options.class.hidden) &&
                    (b.classList.remove(this.options.class.hidden),
                    this.hidden--,
                    "function" == typeof this.options.onVisible && this.options.onVisible(b)),
                  this.options.hiddenAttr && b.removeAttribute("hidden"),
                  this.options.mark &&
                    ((b.innerHTML = b.innerHTML.replace(/<\/?mark>/g, "")),
                    this.searchString.length && (b.innerHTML = b.innerHTML.replace(this._regex, "<mark>$1</mark>")));
              },
            },
            {
              key: "_inputHandler",
              value: function () {
                console.warn("You can now directly call .search() to refresh the results"), this.search();
              },
            },
            {
              key: "inputString",
              value: function () {
                if (this.input instanceof HTMLInputElement) return this.input.value.toLowerCase();
                if (this.input.isContentEditable) return this.input.textContent.toLowerCase();
                throw new Error(j.invalidInput);
              },
            },
            {
              key: "setInput",
              value: function (b) {
                if (this.input instanceof HTMLInputElement) this.input.value = b;
                else if (this.input.isContentEditable) this.input.textContent = b;
                else throw new Error(j.invalidInput);
              },
            },
            {
              key: "start",
              value: function () {
                var d = document.querySelector(this.options.input);
                if (d instanceof HTMLElement) this.input = d;
                else throw new Error(j.noInput);
                if ("string" == typeof this.options.find) this.elements = document.querySelectorAll(this.options.find);
                else throw new Error(j.findOption);
                if (
                  ((this.elementsLength = this.elements.length),
                  (this.elementsArray = Array.prototype.slice.call(this.elements)),
                  (this.hidden = 0),
                  "string" == typeof this.options.placeholder)
                ) {
                  var a = this.options.placeholder;
                  if (
                    ((this.placeholderNode = document.createElement("div")),
                    (this.placeholderNode.id = "holmes-placeholder"),
                    this._hideElement(this.placeholderNode),
                    (this.placeholderNode.innerHTML = a),
                    this.elements[0].parentNode instanceof Element)
                  )
                    this.elements[0].parentNode.appendChild(this.placeholderNode);
                  else throw new Error(j.impossiblePlaceholder);
                }
                if (this.options.class.visible) {
                  var b = this.options.class.visible;
                  this.elementsArray.forEach(function (c) {
                    c.classList.add(b);
                  });
                }
                this.input.addEventListener("input", this.search);
              },
            },
            {
              key: "stop",
              value: function () {
                var d = this;
                return new Promise(function (a, b) {
                  try {
                    d.input.removeEventListener("input", d.search),
                      d.options.placeholder &&
                        (d.placeholderNode.parentNode
                          ? d.placeholderNode.parentNode.removeChild(d.placeholderNode)
                          : b(new Error(j.impossiblePlaceholder))),
                      d.options.mark &&
                        d.elementsArray.forEach(function (b) {
                          b.innerHTML = b.innerHTML.replace(/<\/?mark>/g, "");
                        }),
                      (d.running = !1),
                      a("This instance of Holmes has been stopped.");
                  } catch (c) {
                    b(c);
                  }
                });
              },
            },
            {
              key: "clear",
              value: function () {
                var c = this;
                this.setInput(""),
                  this.elementsArray.forEach(function (a) {
                    c._showElement(a);
                  }),
                  this.options.placeholder && this._hideElement(this.placeholderNode),
                  (this.hidden = 0);
              },
            },
            {
              key: "count",
              value: function () {
                return {
                  all: this.elementsLength,
                  hidden: this.hidden,
                  visible: this.elementsLength - this.hidden,
                };
              },
            },
          ]),
          f
        );
      })(),
      d = (function (g) {
        var a = function () {
          for (var a, b = arguments.length, c = Array(b), d = 0; d < b; d++) c[d] = arguments[d];
          return (
            (a =
              "undefined" != typeof this && this !== f
                ? g.call.apply(g, [this].concat(c))
                : new (Function.prototype.bind.apply(g, [null].concat(c)))()),
            a
          );
        };
        return (a.__proto__ = g), (a.prototype = g.prototype), a;
      })(c);
    return d;
  });

  // Define Holmes options
  holmes({
    input: input, // default: input[type=search]
    find: find, // querySelectorAll that matches each of the results individually
    class: {
      hidden: "filter-hidden",
    },
  });
};

// Add a filter to the page
function ebAddFilterInput(selector, input) {
  "use strict";

  const dataToFilter = document.querySelector(selector);
  if (dataToFilter) {
    // Create filter input element
    const filterElement = document.createElement("input");
    filterElement.setAttribute("type", "text");
    filterElement.classList.add(input.replace(".", ""));
    filterElement.classList.add("filter-input");
    filterElement.setAttribute("autofocus", "autofocus");

    if (locales[pageLanguage].filter.placeholder) {
      filterElement.setAttribute("placeholder", locales[pageLanguage].filter.placeholder);
    }

    // Insert the filter before the data list
    dataToFilter.insertAdjacentElement("beforebegin", filterElement);
  }
}

// Add glossary filter
// Filter the dt elements in the .glossary list
const glossaryFilter = filterFactory(".glossary", ".glossary-filter", "dt");
glossaryFilter.addFilter();

// Add index filter
// Filter the li element in the .reference-index list
const indexFilter = filterFactory(".reference-index", ".index-filter", "li");
indexFilter.addFilter();

const ebGetProgessValues = function (string) {
  const stringList = string.match(/\d+/g);
  return stringList.map(string => {
    return parseInt(string);
  });
};

const ebCreateProgressBar = function (list) {
  // Make a container
  // This container's width will be set in the CSS
  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progress-bar-container");

  // Make the progress bar
  // This bar's width will be set here using the progress values
  // Its transition will be handled in the CSS
  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  // Give the progress bar the width we want
  const width = Math.round((list[0] / list[1]) * 100);
  progressBar.style.width = `${width}%`;

  // Place in the page
  const mainDiv = document.querySelector('[role="main"]');
  progressBarContainer.appendChild(progressBar);
  mainDiv.insertAdjacentElement("afterbegin", progressBarContainer);
};

const ebProgressBar = function () {
  // First we need to get all the information
  // YAML frontmatter => head.html => data attributes on the wrapper

  const wrapperDiv = document.querySelector(".wrapper");
  if (wrapperDiv && wrapperDiv.hasAttribute("data-page-progress")) {
    const progressString = wrapperDiv.getAttribute("data-page-progress");

    const numberVals = ebGetProgessValues(progressString);

    // Now we have a list [x, y] where x is the number of this section, and
    // y is the total number of sections in the unit

    ebCreateProgressBar(numberVals);
  }
};

ebProgressBar();

// Make sure heading levels are sequential
function ebAccessibleHeadings() {
  const prerequisiteHeadings = document.querySelectorAll(".prerequisites h3");
  if (prerequisiteHeadings) {
    prerequisiteHeadings.forEach(function (h3) {
      const contents = h3.innerHTML;
      const newH2 = document.createElement("h2");
      newH2.innerHTML = contents;
      h3.insertAdjacentElement("afterend", newH2);
      h3.remove();
    });
  }
}

ebAccessibleHeadings();

/* jslint browser */
/* global document, settings */

function ebLoadPardotTracking() {
  piAId = "1016132";
  piCId = "1682";
  piHostname = "pi.pardot.com";

  (function () {
    function async_load() {
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.src = (document.location.protocol == "https:" ? "https://pi" : "http://cdn") + ".pardot.com/pd.js";
      const c = document.getElementsByTagName("script")[0];
      c.parentNode.insertBefore(s, c);
    }

    if (window.attachEvent) {
      window.attachEvent("onload", async_load);
    } else {
      window.addEventListener("load", async_load, false);
    }
  })();
}

function ebCookies() {
  "use strict";

  const cookieBanner = document.querySelector(".cookie-banner");
  if (!cookieBanner) {
    return;
  }
  const cookieBannerBackground = document.querySelector(".cookie-banner-background");
  const acceptButton = cookieBanner.querySelector("button.js-accept");
  const rejectButton = cookieBanner.querySelector("button.js-reject");

  // If we have entered this method, the user has not set preferences and so
  // they need to be shown the banner
  cookieBanner.classList.remove("visuallyhidden");
  cookieBannerBackground.classList.remove("visuallyhidden");

  // Hide the banner if the user hits Escape or the close button
  cookieBanner.addEventListener("keydown", function (event) {
    // This will trickle down to the close button as well
    if (event.key === "Escape") {
      cookieBanner.classList.add("visuallyhidden");
      cookieBannerBackground.classList.add("visuallyhidden");
    }
  });

  // Set expiration date for consent cookie
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const cookieDetails = "expires=" + oneYearFromNow + "; hostOnly=true; path=/";

  // If the user rejects cookies, set the core_tracking cookie to "essential"
  // and hide the banner
  rejectButton.addEventListener("click", function (event) {
    document.cookie = "core_tracking=essential;" + cookieDetails;
    cookieBanner.classList.add("visuallyhidden");
    cookieBannerBackground.classList.add("visuallyhidden");
  });
  rejectButton.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.cookie = "core_tracking=essential;" + cookieDetails;
      cookieBanner.classList.add("visuallyhidden");
      cookieBannerBackground.classList.add("visuallyhidden");
    }
  });

  // If the user accepts cookies, set the core_tracking cookie to "true",
  // load the analytics scripts, and hide the banner
  acceptButton.addEventListener("click", function (event) {
    document.cookie = "core_tracking=all;" + cookieDetails;
    ebLoadPardotTracking();
    cookieBanner.classList.add("visuallyhidden");
    cookieBannerBackground.classList.add("visuallyhidden");
  });
  acceptButton.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.cookie = "core_tracking=all;" + cookieDetails;
      ebLoadPardotTracking();
      cookieBanner.classList.add("visuallyhidden");
      cookieBannerBackground.classList.add("visuallyhidden");
    }
  });
}

function ebCheckForConsentCookie() {
  "use strict";

  let hasCookie = false;

  // Check whether the user has already made a decision about cookies
  if (document.cookie.includes("core_tracking")) {
    hasCookie = true;
    // If they have previously accepted cookies, load the analytics script
    if (document.cookie.includes("core_tracking=all")) {
      ebLoadPardotTracking();
    }
  }
  if (!hasCookie) {
    ebCookies();
  }
}

// Go
ebCheckForConsentCookie();

/* jslint browser */
/* global sessionStorage */

const userDetailUrl = "/?rest_route=/eb/v1/user_details";
const params = {
  headers: {
    "content-type": "application/json; charset=UTF-8",
  },
};

const ebGetWPUserID = function () {
  const cookieName = "coreproject_sess";

  // get the cookie, split it into bits
  const cookie = document.cookie.split("; ");

  const userIdCookie = cookie.find(function (el) {
    // if it starts with coreproject_sess, it's our WP one
    return el.indexOf(cookieName) === 0;
  });

  if (!userIdCookie) {
    return false;
  }

  return decodeURIComponent(userIdCookie).replace(cookieName + "=", "");
};

function ebUserProfileButtonAppendHash(button) {
  let link = button.getAttribute("href");

  // If url already contains a hash we remove that and append the current hash string
  if (link.includes("#")) {
    link = link.split("#")[0];
  }

  button.setAttribute("href", link + encodeURIComponent(window.location.hash));
}

function ebUserProfileAddListeners(profile) {
  const buttons = profile.querySelectorAll(".buttons a");

  buttons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      ebUserProfileButtonAppendHash(button);
    });

    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        ebUserProfileButtonAppendHash(button);
      }
    });
  });
}

async function ebGetUserDetailsFromWP() {
  if (sessionStorage.getItem("user-details")) {
    const wpUserId = ebGetWPUserID();
    const userDetails = JSON.parse(sessionStorage.getItem("user-details"));

    if (wpUserId !== userDetails.ID) {
      // user not logged in or currently loggedin user's id doesn't match cached user details
      // clear the cache item and continue with AJAX call
      sessionStorage.removeItem("user-details");
    } else {
      // user ids match, we can use session cache
      // console.log("Cache hit");
      return Promise.resolve(userDetails);
    }
  }

  return fetch(userDetailUrl, params)
    .then(response => response.json())
    .then(json => {
      if (json && json.ID) {
        sessionStorage.setItem("user-details", JSON.stringify(json));
      }

      return json;
    })
    .catch(error => {});
}

async function ebDisplayUserProfile() {
  const user = await ebGetUserDetailsFromWP();

  const profile = document.querySelector(".menu-user-profile");
  const masthead = profile.closest(".masthead");

  if (user) {
    const displayName = user.display_name.split(" ");
    const initials = displayName.map(name => name[0]).join("");

    const avatar = profile.querySelector(".avatar");

    const accountLink = document.createElement("a");
    accountLink.href = "/account/";
    accountLink.innerText = initials;
    avatar.appendChild(accountLink);

    avatar.classList.remove("visuallyhidden");
    profile.querySelector(".buttons").classList.add("visuallyhidden");
    profile.classList.remove("visuallyhidden");

    // When we're logged in, let the masthead know for CSS reasons
    masthead.classList.add("logged-in");
  } else {
    profile.classList.remove("visuallyhidden");
    profile.querySelector(".buttons").classList.remove("visuallyhidden");
    ebUserProfileAddListeners(profile);
  }
}

ebDisplayUserProfile();

/* global settings, ebWordpressIsLoggedIn, ebGetUserDetailsFromWP, ebToggleClickout */

/*
ACCORDION BEHAVIOUR ON THE LANDING PAGE
*/

async function ebLandingPageAccordionRole(parentClass, parentSection, parentHeading, upArrow, downArrow) {
  if (settings.web.wordpressUserProfile && ebWordpressIsLoggedIn()) {
    const user = await ebGetUserDetailsFromWP();

    if (user.roles) {
      if (user.roles.includes("teacher") && parentClass.includes("flex-section")) {
        // Open up the features section
        ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow);
      } else if (user.roles.includes("student") && parentClass.includes("toc-section")) {
        // Open up the TOC sections
        ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow);
      }
    }
  }
}

function ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow) {
  parentSection.classList.toggle(parentClass + "-open");
  parentSection.classList.toggle(parentClass + "-closed");
  upArrow.classList.toggle("visuallyhidden");
  downArrow.classList.toggle("visuallyhidden");

  const storageKey = "accordion-" + parentHeading.id;

  if (parentSection.classList.contains(parentClass + "-open")) {
    window.localStorage.setItem(storageKey, "open");
  } else {
    window.localStorage.setItem(storageKey, "closed");
  }
}

function ebLandingPageAccordionStart(parentClass, parentSection, parentHeading, upArrow, downArrow) {
  // Look at localStorage to see whether the user left the page in non-default state
  const storageKey = "accordion-" + parentHeading.id;

  if (!window.localStorage.getItem(storageKey)) {
    // If there is no saved value in storage, but user is logged in, open relevant sections
    ebLandingPageAccordionRole(parentClass, parentSection, parentHeading, upArrow, downArrow);
  } else {
    // If the user left a section open last time, open it again
    if (window.localStorage.getItem(storageKey) === "open") {
      ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow);
    }
  }
}

function ebLandingPageAccordion() {
  // Get the accordion buttons on the landing page
  const landingPageAccordionButtons = document.querySelectorAll(".landing-page-accordion-head");

  if (landingPageAccordionButtons) {
    landingPageAccordionButtons.forEach(function (button) {
      //
      const parentSection = button.closest(".landing-page-toc-section, .landing-page-flex-section");
      const parentClass = parentSection.classList.contains("landing-page-toc-section")
        ? "landing-page-toc-section"
        : "landing-page-flex-section";
      const parentHeading = button.closest("h2, h3");
      const upArrow = button.querySelector(".arrow-up");
      const downArrow = button.querySelector(".arrow-down");

      // If the user has visited the page before, get the page looking how they left it
      ebLandingPageAccordionStart(parentClass, parentSection, parentHeading, upArrow, downArrow);

      // Listen for clicks to open and close sections
      button.addEventListener("click", function () {
        ebLandingPageAccordionAction(parentClass, parentSection, parentHeading, upArrow, downArrow);
      });
    });
  }
}

ebLandingPageAccordion();

/*
NAV BEHAVIOUR ON THE LANDING PAGE
*/

function ebLandingPageNavLinks(navElement) {
  const navLinks = navElement.querySelectorAll("a");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      ebToggleClickout(navElement, function () {
        navElement.classList.toggle("invisible");
        ebLandingPageNavToggleAccess(navElement);
      });
    });
  });
}

function ebLandingPageNavToggleAccess(navElement) {
  // Nav elements that are not visible should not be keyboard accessible

  const navItems = navElement.querySelectorAll("input.search-box, a");
  if (navElement.classList.contains("invisible")) {
    navItems.forEach(function (item) {
      item.setAttribute("tabindex", "-1");
    });
  } else {
    navItems.forEach(function (item) {
      item.setAttribute("tabindex", "0");
    });
  }
}

function ebLandingPageNavKeyboardAccess(navButton, navElement) {
  const navButtonSVG = navButton.querySelector("svg");
  const navButtonStyles = window.getComputedStyle(navButtonSVG);

  if (navButtonStyles.display === "none") {
    // WIDE SCREEN
    // Hamburger is inaccessible
    navButton.setAttribute("tabindex", "-1");
    // Nav elements are accessible by default
  } else {
    // NARROW SCREEN
    // Hamburger is accessible
    navButton.setAttribute("tabindex", "0");
    // Nav elements are inaccessible to begin with
    // since nav list is invisible to begin with
    ebLandingPageNavToggleAccess(navElement);

    // Visibility and access to nav items is toggled
    navElement.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        ebToggleClickout(navElement, function () {
          navElement.classList.toggle("invisible");
          ebLandingPageNavToggleAccess(navElement);
        });
      }
    });

    // Listen for clicks on the nav child links
    ebLandingPageNavLinks(navElement);

    // Listen for clicks on the hamburger button
    navButton.addEventListener("click", function () {
      // Toggle the visibility of the nav and the clickout region
      ebToggleClickout(navElement, function () {
        navElement.classList.toggle("invisible");
        ebLandingPageNavToggleAccess(navElement);
      });
    });
  }
}

function ebLandingPageNav() {
  // Check whether we're on the landing page
  if (document.querySelector(".landing-page")) {
    const navButton = document.querySelector("button.masthead-menu");
    const navElement = document.getElementById("landing-page-nav");
    ebLandingPageNavKeyboardAccess(navButton, navElement);
  }
}

ebLandingPageNav();

/* jslint */
/* globals ebCitationReferences */

// The references.yml data is loaded to the page in head-elements,
// and then this script draws on it to replace <cite> elements
// that contain ids with relevant text.

// function to replace id with citation text
function ebCitationLabel(cite) {
  "use strict";
  let i;
  for (i = 0; i < ebCitationReferences.length; i += 1) {
    if (ebCitationReferences[i].ref === cite.textContent) {
      cite.innerHTML = ebCitationReferences[i].text;
    }
  }
}

// function to find all cite elements that contain ids
// (Prince doesn't support innerText, hence textContent.)
function ebFilterCitations(cites) {
  "use strict";
  let i;
  for (i = 0; i < cites.length; i += 1) {
    // If cite element contains no spaces,
    // we can assume it's a references id
    if (!/\s/.test(cites[i].textContent)) {
      ebCitationLabel(cites[i]);
    }
  }
}

// Find cite elements, after checking that the ebCitationReferences
// object has been included on the page.
if (typeof ebCitationReferences === "object") {
  const ebCitationElements = document.querySelectorAll(".source cite");
  ebFilterCitations(ebCitationElements);
}

// BigScreen v2.0.5 - 2015-05-02 - MIT License
!(function (a, b, c) {
  "use strict";
  function d(a) {
    var b = null;
    if ("VIDEO" === a.tagName) b = a;
    else {
      var c = a.getElementsByTagName("video");
      c[0] && (b = c[0]);
    }
    return b;
  }
  function e(a) {
    var b = d(a);
    if (b && b.webkitEnterFullscreen) {
      try {
        b.readyState < b.HAVE_METADATA
          ? (b.addEventListener(
              "loadedmetadata",
              function e() {
                b.removeEventListener("loadedmetadata", e, !1),
                  b.webkitEnterFullscreen(),
                  (l = !!b.getAttribute("controls"));
              },
              !1
            ),
            b.load())
          : (b.webkitEnterFullscreen(), (l = !!b.getAttribute("controls"))),
          (k = b);
      } catch (c) {
        return r("not_supported", a);
      }
      return !0;
    }
    return r(void 0 === j.request ? "not_supported" : "not_enabled", a);
  }
  function f() {
    s.element || (q(), h());
  }
  function g() {
    c && "webkitfullscreenchange" === j.change && window.addEventListener("resize", f, !1);
  }
  function h() {
    c && "webkitfullscreenchange" === j.change && window.removeEventListener("resize", f, !1);
  }
  var i =
      /i(Pad|Phone|Pod)/.test(navigator.userAgent) &&
      parseInt(navigator.userAgent.replace(/^.*OS (\d+)_(\d+).*$/, "$1.$2"), 10) >= 7,
    j = (function () {
      var a = b.createElement("video"),
        c = {
          request: [
            "requestFullscreen",
            "webkitRequestFullscreen",
            "webkitRequestFullScreen",
            "mozRequestFullScreen",
            "msRequestFullscreen",
          ],
          exit: [
            "exitFullscreen",
            "webkitCancelFullScreen",
            "webkitExitFullscreen",
            "mozCancelFullScreen",
            "msExitFullscreen",
          ],
          enabled: ["fullscreenEnabled", "webkitFullscreenEnabled", "mozFullScreenEnabled", "msFullscreenEnabled"],
          element: [
            "fullscreenElement",
            "webkitFullscreenElement",
            "webkitCurrentFullScreenElement",
            "mozFullScreenElement",
            "msFullscreenElement",
          ],
          change: ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"],
          error: ["fullscreenerror", "webkitfullscreenerror", "mozfullscreenerror", "MSFullscreenError"],
        },
        d = {};
      for (var e in c)
        for (var f = 0, g = c[e].length; g > f; f++)
          if (c[e][f] in a || c[e][f] in b || "on" + c[e][f].toLowerCase() in b) {
            d[e] = c[e][f];
            break;
          }
      return d;
    })(),
    k = null,
    l = null,
    m = function () {},
    n = [],
    o = !1;
  navigator.userAgent.indexOf("Android") > -1 &&
    navigator.userAgent.indexOf("Chrome") > -1 &&
    (o = parseInt(navigator.userAgent.replace(/^.*Chrome\/(\d+).*$/, "$1"), 10) || !0);
  var p = function (a) {
      var b = n[n.length - 1];
      b &&
        ((a !== b.element && a !== k) || !b.hasEntered) &&
        ("VIDEO" === a.tagName && (k = a),
        1 === n.length && s.onenter(s.element),
        b.enter.call(b.element, a || b.element),
        (b.hasEntered = !0));
    },
    q = function () {
      !k || l || i || (k.setAttribute("controls", "controls"), k.removeAttribute("controls")), (k = null), (l = null);
      var a = n.pop();
      a &&
        (a.exit.call(a.element),
        s.element ||
          (n.forEach(function (a) {
            a.exit.call(a.element);
          }),
          (n = []),
          s.onexit()));
    },
    r = function (a, b) {
      if (n.length > 0) {
        var c = n.pop();
        (b = b || c.element), c.error.call(b, a), s.onerror(b, a);
      }
    },
    s = {
      request: function (a, d, f, g) {
        if (
          ((a = a || b.body), n.push({ element: a, enter: d || m, exit: f || m, error: g || m }), void 0 === j.request)
        )
          return void e(a);
        if (c && b[j.enabled] === !1) return void e(a);
        if (o !== !1 && 32 > o) return void e(a);
        if (c && void 0 === j.enabled)
          return (
            (j.enabled = "webkitFullscreenEnabled"),
            a[j.request](),
            void setTimeout(function () {
              b[j.element] ? (b[j.enabled] = !0) : ((b[j.enabled] = !1), e(a));
            }, 250)
          );
        try {
          a[j.request](),
            setTimeout(function () {
              b[j.element] || r(c ? "not_enabled" : "not_allowed", a);
            }, 100);
        } catch (h) {
          r("not_enabled", a);
        }
      },
      exit: function () {
        h(), b[j.exit]();
      },
      toggle: function (a, b, c, d) {
        s.element ? s.exit() : s.request(a, b, c, d);
      },
      videoEnabled: function (a) {
        if (s.enabled) return !0;
        a = a || b.body;
        var c = d(a);
        return c && void 0 !== c.webkitSupportsFullscreen
          ? c.readyState < c.HAVE_METADATA
            ? "maybe"
            : c.webkitSupportsFullscreen
          : !1;
      },
      onenter: m,
      onexit: m,
      onchange: m,
      onerror: m,
    };
  try {
    Object.defineProperties(s, {
      element: {
        enumerable: !0,
        get: function () {
          return k && k.webkitDisplayingFullscreen ? k : b[j.element] || null;
        },
      },
      enabled: {
        enumerable: !0,
        get: function () {
          return "webkitCancelFullScreen" !== j.exit || c ? (o !== !1 && 32 > o ? !1 : b[j.enabled] || !1) : !0;
        },
      },
    }),
      j.change &&
        b.addEventListener(
          j.change,
          function (a) {
            if ((s.onchange(s.element), s.element)) {
              var b = n[n.length - 2];
              b && b.element === s.element ? q() : (p(s.element), g());
            } else q();
          },
          !1
        ),
      b.addEventListener(
        "webkitbeginfullscreen",
        function (a) {
          var b = !0;
          if (n.length > 0)
            for (var c = 0, e = n.length; e > c; c++) {
              var f = d(n[c].element);
              if (f === a.srcElement) {
                b = !1;
                break;
              }
            }
          b && n.push({ element: a.srcElement, enter: m, exit: m, error: m }),
            s.onchange(a.srcElement),
            p(a.srcElement);
        },
        !0
      ),
      b.addEventListener(
        "webkitendfullscreen",
        function (a) {
          s.onchange(a.srcElement), q(a.srcElement);
        },
        !0
      ),
      j.error &&
        b.addEventListener(
          j.error,
          function (a) {
            r("not_allowed");
          },
          !1
        );
  } catch (t) {
    (s.element = null), (s.enabled = !1);
  }
  "function" == typeof define && define.amd
    ? define(function () {
        return s;
      })
    : "undefined" != typeof module && module.exports
    ? (module.exports = s)
    : (a.BigScreen = s);
})(this, document, self !== top);

/* jslint browser */
/* globals BigScreen, locales, pageLanguage */

const ebToggleFullscreenImage = function (event) {
  "use strict";

  const button = event.target;
  const figureContainer = button.closest(".figure-images");

  if (BigScreen.enabled) {
    BigScreen.toggle(
      figureContainer,
      function (figureContainer) {
        figureContainer.classList.add("fullscreen");
        button.innerHTML = locales[pageLanguage].figures["exit-fullscreen"];
      },
      function (figureContainer) {
        figureContainer = button.closest(".figure-images");
        figureContainer.classList.remove("fullscreen");
        button.innerHTML = locales[pageLanguage].figures["enter-fullscreen"];
      }
    );
  }
};

function ebFullscreenImages() {
  "use strict";

  // Find the icons
  const fullscreenButtons = document.querySelectorAll(".fullscreen-button");

  // For each icon
  fullscreenButtons.forEach(function (button) {
    button.addEventListener("click", ebToggleFullscreenImage);
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        ebToggleFullscreenImage(event);
      }
    });
  });
}

ebFullscreenImages();

!(function (o, l) {
  var r,
    a,
    s = "createElement",
    g = "getElementsByTagName",
    b = "length",
    E = "style",
    d = "title",
    y = "undefined",
    k = "setAttribute",
    w = "getAttribute",
    x = null,
    A = "__svgInject",
    C = "--inject-",
    S = new RegExp(C + "\\d+", "g"),
    I = "LOAD_FAIL",
    t = "SVG_NOT_SUPPORTED",
    L = "SVG_INVALID",
    v = ["src", "alt", "onload", "onerror"],
    j = l[s]("a"),
    G = typeof SVGRect != y,
    f = { useCache: !0, copyAttributes: !0, makeIdsUnique: !0 },
    N = {
      clipPath: ["clip-path"],
      "color-profile": x,
      cursor: x,
      filter: x,
      linearGradient: ["fill", "stroke"],
      marker: ["marker", "marker-end", "marker-mid", "marker-start"],
      mask: x,
      pattern: ["fill", "stroke"],
      radialGradient: ["fill", "stroke"],
    },
    u = 1,
    c = 2,
    O = 1;
  function T(e) {
    return (r = r || new XMLSerializer()).serializeToString(e);
  }
  function P(e, r) {
    var t,
      n,
      i,
      o,
      a = C + O++,
      f = /url\("?#([a-zA-Z][\w:.-]*)"?\)/g,
      u = e.querySelectorAll("[id]"),
      c = r ? [] : x,
      l = {},
      s = [],
      d = !1;
    if (u[b]) {
      for (i = 0; i < u[b]; i++) (n = u[i].localName) in N && (l[n] = 1);
      for (n in l)
        (N[n] || [n]).forEach(function (e) {
          s.indexOf(e) < 0 && s.push(e);
        });
      s[b] && s.push(E);
      var v,
        p,
        m,
        h = e[g]("*"),
        y = e;
      for (i = -1; y != x; ) {
        if (y.localName == E)
          (m =
            (p = y.textContent) &&
            p.replace(f, function (e, r) {
              return c && (c[r] = 1), "url(#" + r + a + ")";
            })) !== p && (y.textContent = m);
        else if (y.hasAttributes()) {
          for (o = 0; o < s[b]; o++)
            (v = s[o]),
              (m =
                (p = y[w](v)) &&
                p.replace(f, function (e, r) {
                  return c && (c[r] = 1), "url(#" + r + a + ")";
                })) !== p && y[k](v, m);
          ["xlink:href", "href"].forEach(function (e) {
            var r = y[w](e);
            /^\s*#/.test(r) && ((r = r.trim()), y[k](e, r + a), c && (c[r.substring(1)] = 1));
          });
        }
        y = h[++i];
      }
      for (i = 0; i < u[b]; i++) (t = u[i]), (c && !c[t.id]) || ((t.id += a), (d = !0));
    }
    return d;
  }
  function V(e, r, t, n) {
    if (r) {
      r[k]("data-inject-url", t);
      var i = e.parentNode;
      if (i) {
        n.copyAttributes &&
          (function c(e, r) {
            for (var t, n, i, o = e.attributes, a = 0; a < o[b]; a++)
              if (((n = (t = o[a]).name), -1 == v.indexOf(n)))
                if (((i = t.value), n == d)) {
                  var f,
                    u = r.firstElementChild;
                  u && u.localName.toLowerCase() == d
                    ? (f = u)
                    : ((f = l[s + "NS"]("http://www.w3.org/2000/svg", d)), r.insertBefore(f, u)),
                    (f.textContent = i);
                } else r[k](n, i);
          })(e, r);
        var o = n.beforeInject,
          a = (o && o(e, r)) || r;
        i.replaceChild(a, e), (e[A] = u), m(e);
        var f = n.afterInject;
        f && f(e, a);
      }
    } else D(e, n);
  }
  function p() {
    for (var e = {}, r = arguments, t = 0; t < r[b]; t++) {
      var n = r[t];
      for (var i in n) n.hasOwnProperty(i) && (e[i] = n[i]);
    }
    return e;
  }
  function _(e, r) {
    if (r) {
      var t;
      try {
        t = (function i(e) {
          return (a = a || new DOMParser()).parseFromString(e, "text/xml");
        })(e);
      } catch (o) {
        return x;
      }
      return t[g]("parsererror")[b] ? x : t.documentElement;
    }
    var n = l.createElement("div");
    return (n.innerHTML = e), n.firstElementChild;
  }
  function m(e) {
    e.removeAttribute("onload");
  }
  function n(e) {
    console.error("SVGInject: " + e);
  }
  function i(e, r, t) {
    (e[A] = c), t.onFail ? t.onFail(e, r) : n(r);
  }
  function D(e, r) {
    m(e), i(e, L, r);
  }
  function F(e, r) {
    m(e), i(e, t, r);
  }
  function M(e, r) {
    i(e, I, r);
  }
  function q(e) {
    (e.onload = x), (e.onerror = x);
  }
  function R(e) {
    n("no img element");
  }
  var e = (function z(e, r) {
    var t = p(f, r),
      h = {};
    function n(a, f) {
      f = p(t, f);
      var e = function (r) {
        var e = function () {
          var e = f.onAllFinish;
          e && e(), r && r();
        };
        if (a && typeof a[b] != y) {
          var t = 0,
            n = a[b];
          if (0 == n) e();
          else
            for (
              var i = function () {
                  ++t == n && e();
                },
                o = 0;
              o < n;
              o++
            )
              u(a[o], f, i);
        } else u(a, f, e);
      };
      return typeof Promise == y ? e() : new Promise(e);
    }
    function u(u, c, e) {
      if (u) {
        var r = u[A];
        if (r) Array.isArray(r) ? r.push(e) : e();
        else {
          if ((q(u), !G)) return F(u, c), void e();
          var t = c.beforeLoad,
            n = (t && t(u)) || u[w]("src");
          if (!n) return "" === n && M(u, c), void e();
          var i = [];
          u[A] = i;
          var l = function () {
              e(),
                i.forEach(function (e) {
                  e();
                });
            },
            s = (function f(e) {
              return (j.href = e), j.href;
            })(n),
            d = c.useCache,
            v = c.makeIdsUnique,
            p = function (r) {
              d &&
                (h[s].forEach(function (e) {
                  e(r);
                }),
                (h[s] = r));
            };
          if (d) {
            var o,
              a = function (e) {
                if (e === I) M(u, c);
                else if (e === L) D(u, c);
                else {
                  var r,
                    t = e[0],
                    n = e[1],
                    i = e[2];
                  v &&
                    (t === x
                      ? ((t = P((r = _(n, !1)), !1)), (e[0] = t), (e[2] = t && T(r)))
                      : t &&
                        (n = (function o(e) {
                          return e.replace(S, C + O++);
                        })(i))),
                    (r = r || _(n, !1)),
                    V(u, r, s, c);
                }
                l();
              };
            if (typeof (o = h[s]) != y) return void (o.isCallbackQueue ? o.push(a) : a(o));
            ((o = []).isCallbackQueue = !0), (h[s] = o);
          }
          !(function m(e, r, t) {
            if (e) {
              var n = new XMLHttpRequest();
              (n.onreadystatechange = function () {
                if (4 == n.readyState) {
                  var e = n.status;
                  200 == e ? r(n.responseXML, n.responseText.trim()) : 400 <= e ? t() : 0 == e && t();
                }
              }),
                n.open("GET", e, !0),
                n.send();
            }
          })(
            s,
            function (e, r) {
              var t = e instanceof Document ? e.documentElement : _(r, !0),
                n = c.afterLoad;
              if (n) {
                var i = n(t, r) || t;
                if (i) {
                  var o = "string" == typeof i;
                  (r = o ? i : T(t)), (t = o ? _(i, !0) : i);
                }
              }
              if (t instanceof SVGElement) {
                var a = x;
                if ((v && (a = P(t, !1)), d)) {
                  var f = a && T(t);
                  p([a, r, f]);
                }
                V(u, t, s, c);
              } else D(u, c), p(L);
              l();
            },
            function () {
              M(u, c), p(I), l();
            }
          );
        }
      } else R();
    }
    return (
      G &&
        (function i(e) {
          var r = l[g]("head")[0];
          if (r) {
            var t = l[s](E);
            (t.type = "text/css"), t.appendChild(l.createTextNode(e)), r.appendChild(t);
          }
        })('img[onload^="' + e + '("]{visibility:hidden;}'),
      (n.setOptions = function (e) {
        t = p(t, e);
      }),
      (n.create = z),
      (n.err = function (e, r) {
        e ? e[A] != c && (q(e), G ? (m(e), M(e, t)) : F(e, t), r && (m(e), (e.src = r))) : R();
      }),
      (o[e] = n)
    );
  })("SVGInject");
  "object" == typeof module && "object" == typeof module.exports && (module.exports = e);
})(window, document);
/* jslint browser */
/* globals SVGInject */

// This script helps get sensible SVGs into our pages.
// It first injects all SVGs linked as img tags
// into the code of the page itself, so that they
// have access to the page's CSS. This is mostly for fonts.
// Since some SVG styles use different font names
// to the ones in the site's global CSS, this script also
// replaces font names and related attributes in injected SVGs.

// Change font-family names in style attributes
function ebSVGFontFixes(svg) {
  "use strict";

  // Get the elements in the SVG with font-family set
  const ebFontFixElements = svg.querySelectorAll("[font-family], [style]");

  // What fonts do we want to change the names of?
  // Optionally add a new font-weight, e.g. for 'OpenSans-Bold',
  // which should be Open Sans with a bold weight.
  const fontsToChange = [
    {
      oldFontFace: "OpenSans-Regular",
      newFontFace: "Open Sans",
    },
    {
      oldFontFace: "OpenSans-Bold",
      newFontFace: "Open Sans",
      newFontWeight: "bold",
    },
    {
      oldFontFace: "Asap-Medium",
      newFontFace: "Asap",
      newFontWeight: "600",
    },
    {
      oldFontFace: "Asap-Regular",
      newFontFace: "Asap",
    },
    {
      oldFontFace: "Asap-MediumItalic",
      newFontFace: "Asap",
      newFontWeight: "600",
      newFontStyle: "italic",
    },
    {
      oldFontFace: "Asap-Italic",
      newFontFace: "Asap",
      newFontStyle: "italic",
    },
    {
      oldFontFace: "Asap-Bold",
      newFontFace: "Asap",
      newFontWeight: "bold",
    },
    {
      oldFontFace: "SourceSansPro-Regular",
      newFontFace: "Source Sans Pro",
      newFontWeight: "400",
    },
    {
      oldFontFace: "SourceSansPro-Semibold",
      newFontFace: "Source Sans Pro",
      newFontWeight: "600",
    },
    {
      oldFontFace: "SourceSansPro-Bold",
      newFontFace: "Source Sans Pro",
      newFontWeight: "700",
    },
  ];

  // Loop through the elements, making all the font changes
  // that we've listed above.
  let i, j;
  for (i = 0; i < ebFontFixElements.length; i += 1) {
    for (j = 0; j < fontsToChange.length; j += 1) {
      // Change font-family attributes
      if (ebFontFixElements[i].getAttribute("font-family") === fontsToChange[j].oldFontFace) {
        ebFontFixElements[i].setAttribute("font-family", fontsToChange[j].newFontFace);
        if (fontsToChange[j].newFontWeight) {
          ebFontFixElements[i].setAttribute("font-weight", fontsToChange[j].newFontWeight);
        }
        if (fontsToChange[j].newFontStyle) {
          ebFontFixElements[i].setAttribute("font-style", fontsToChange[j].newFontStyle);
        }
      }

      // Change font properties in style attributes
      if (ebFontFixElements[i].style.fontFamily === fontsToChange[j].oldFontFace) {
        ebFontFixElements[i].style.fontFamily = fontsToChange[j].newFontFace;
        if (ebFontFixElements[i].style.fontWeight || fontsToChange[j].newFontWeight) {
          ebFontFixElements[i].style.fontWeight = fontsToChange[j].newFontWeight;
        }
        if (ebFontFixElements[i].style.fontStyle || fontsToChange[j].newFontStyle) {
          ebFontFixElements[i].style.fontStyle = fontsToChange[j].newFontStyle;
        }
      }
    }
  }
}

// SVGInject options (https://github.com/iconfu/svg-inject#svginject)
// - run the font fixes after injecting SVGs
SVGInject.setOptions({
  afterLoad: function (svg) {
    "use strict";
    ebSVGFontFixes(svg);
  },
});

// Run svg-inject.min.js on all images
// that have an 'inject-svg' class.
function ebInjectSVGs() {
  "use strict";
  const ebSVGsToInject = document.querySelectorAll("img.inject-svg:not(.no-inject-svg)");
  let i;
  for (i = 0; i < ebSVGsToInject.length; i += 1) {
    SVGInject(ebSVGsToInject[i]);
  }
}

// Go
ebInjectSVGs();

/* globals settings, SVGInject */

// Check for no-accordion setting on page
const ebLazyLoadImagesCheckPageAccordionOff = function () {
  "use strict";

  let pageAccordionOff;

  const accordionPageSetting = document.body.getAttribute("data-accordion-page");
  const accordionBookSetting = settings.web.accordion.enabled;

  if ((accordionPageSetting && accordionPageSetting === "none") || accordionBookSetting === false) {
    pageAccordionOff = true;
  } else {
    pageAccordionOff = false;
  }

  return pageAccordionOff;
};

const ebLazyLoadImages = function (lazyImages) {
  if (!Array.prototype.forEach) return;

  lazyImages.forEach(function (lazyImage) {
    // if there's a noscript before our image, remove it
    const lazySibling = lazyImage.previousElementSibling;
    if (lazyImage.previousElementSibling) {
      if (lazySibling.tagName.toLowerCase() === "noscript") {
        lazySibling.parentNode.removeChild(lazyImage.previousElementSibling);
      }
    }

    // set the src to data-src, then remove data-src
    const newSrc = lazyImage.getAttribute("data-src");

    // if there's no data-src (e.g. we've already run lazyload) return
    if (!newSrc) return;

    lazyImage.setAttribute("src", newSrc);
    lazyImage.removeAttribute("data-src");

    // if srcset is supported, add it
    if ("srcset" in document.createElement("img") && lazyImage.getAttribute("data-srcset") !== null) {
      const srcset = lazyImage.getAttribute("data-srcset");
      lazyImage.setAttribute("srcset", srcset);
      lazyImage.removeAttribute("data-srcset");
    }

    // If the images are SVGs, now inject them
    if (lazyImage.classList.contains("inject-svg")) {
      SVGInject(lazyImage);
    }
  });
};

if (settings.web.images.lazyload) {
  // if we're not on a unit, lazy load all images
  if ("querySelectorAll" in document) {
    const thisIsNotAChapter = !document.querySelector(".wrapper").classList.contains("default-page");
    const thisIsFrontmatter = document.querySelector(".wrapper").classList.contains("frontmatter-page");
    const thisHasNoH2s = document.querySelector("h2") === null;
    const thisIsEndmatter = document.querySelector(".wrapper").classList.contains("endmatter-page");
    const thisIsALeibniz = document.querySelector(".wrapper").classList.contains("leibniz");
    const pageAccordionOff = ebLazyLoadImagesCheckPageAccordionOff();
    if (
      thisIsNotAChapter ||
      thisIsFrontmatter ||
      thisHasNoH2s ||
      thisIsEndmatter ||
      thisIsALeibniz ||
      pageAccordionOff
    ) {
      const lazyImages = document.querySelectorAll("[data-src]");
      ebLazyLoadImages(lazyImages);
    }
  }
  // if there's a chapter-opener-image, lazyload it
  if ("querySelectorAll" in document) {
    const chapterOpenerImages = document.querySelectorAll(".chapter-opener-image [data-src]");
    if (chapterOpenerImages) {
      ebLazyLoadImages(chapterOpenerImages);
    }
  }
}

// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt Expat
//
// AnchorJS - v4.2.0 - 2019-01-01
// https://github.com/bryanbraun/anchorjs
// Copyright (c) 2019 Bryan Braun; Licensed MIT
//
// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt Expat
!(function (A, e) {
  "use strict";
  "function" == typeof define && define.amd
    ? define([], e)
    : "object" == typeof module && module.exports
    ? (module.exports = e())
    : ((A.AnchorJS = e()), (A.anchors = new A.AnchorJS()));
})(this, function () {
  "use strict";
  return function (A) {
    function f(A) {
      (A.icon = A.hasOwnProperty("icon") ? A.icon : ""),
        (A.visible = A.hasOwnProperty("visible") ? A.visible : "hover"),
        (A.placement = A.hasOwnProperty("placement") ? A.placement : "right"),
        (A.ariaLabel = A.hasOwnProperty("ariaLabel") ? A.ariaLabel : "Anchor"),
        (A.class = A.hasOwnProperty("class") ? A.class : ""),
        (A.base = A.hasOwnProperty("base") ? A.base : ""),
        (A.truncate = A.hasOwnProperty("truncate") ? Math.floor(A.truncate) : 64),
        (A.titleText = A.hasOwnProperty("titleText") ? A.titleText : "");
    }
    function p(A) {
      var e;
      if ("string" == typeof A || A instanceof String) e = [].slice.call(document.querySelectorAll(A));
      else {
        if (!(Array.isArray(A) || A instanceof NodeList))
          throw new Error("The selector provided to AnchorJS was invalid.");
        e = [].slice.call(A);
      }
      return e;
    }
    (this.options = A || {}),
      (this.elements = []),
      f(this.options),
      (this.isTouchDevice = function () {
        return !!("ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch));
      }),
      (this.add = function (A) {
        var e,
          t,
          i,
          n,
          o,
          s,
          a,
          r,
          c,
          h,
          l,
          u,
          d = [];
        if (
          (f(this.options),
          "touch" === (l = this.options.visible) && (l = this.isTouchDevice() ? "always" : "hover"),
          A || (A = "h2, h3, h4, h5, h6"),
          0 === (e = p(A)).length)
        )
          return this;
        for (
          (function () {
            if (null === document.head.querySelector("style.anchorjs")) {
              var A,
                e = document.createElement("style");
              (e.className = "anchorjs"),
                e.appendChild(document.createTextNode("")),
                void 0 === (A = document.head.querySelector('[rel="stylesheet"], style'))
                  ? document.head.appendChild(e)
                  : document.head.insertBefore(e, A),
                e.sheet.insertRule(
                  " .anchorjs-link {   opacity: 0;   text-decoration: none;   -webkit-font-smoothing: antialiased;   -moz-osx-font-smoothing: grayscale; }",
                  e.sheet.cssRules.length
                ),
                e.sheet.insertRule(
                  " *:hover > .anchorjs-link, .anchorjs-link:focus  {   opacity: 1; }",
                  e.sheet.cssRules.length
                ),
                e.sheet.insertRule(
                  " [data-anchorjs-icon]::after {   content: attr(data-anchorjs-icon); }",
                  e.sheet.cssRules.length
                ),
                e.sheet.insertRule(
                  ' @font-face {   font-family: "anchorjs-icons";   src: url(data:n/a;base64,AAEAAAALAIAAAwAwT1MvMg8yG2cAAAE4AAAAYGNtYXDp3gC3AAABpAAAAExnYXNwAAAAEAAAA9wAAAAIZ2x5ZlQCcfwAAAH4AAABCGhlYWQHFvHyAAAAvAAAADZoaGVhBnACFwAAAPQAAAAkaG10eASAADEAAAGYAAAADGxvY2EACACEAAAB8AAAAAhtYXhwAAYAVwAAARgAAAAgbmFtZQGOH9cAAAMAAAAAunBvc3QAAwAAAAADvAAAACAAAQAAAAEAAHzE2p9fDzz1AAkEAAAAAADRecUWAAAAANQA6R8AAAAAAoACwAAAAAgAAgAAAAAAAAABAAADwP/AAAACgAAA/9MCrQABAAAAAAAAAAAAAAAAAAAAAwABAAAAAwBVAAIAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAMCQAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAg//0DwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAAIAAAACgAAxAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADAAAAAIAAgAAgAAACDpy//9//8AAAAg6cv//f///+EWNwADAAEAAAAAAAAAAAAAAAAACACEAAEAAAAAAAAAAAAAAAAxAAACAAQARAKAAsAAKwBUAAABIiYnJjQ3NzY2MzIWFxYUBwcGIicmNDc3NjQnJiYjIgYHBwYUFxYUBwYGIwciJicmNDc3NjIXFhQHBwYUFxYWMzI2Nzc2NCcmNDc2MhcWFAcHBgYjARQGDAUtLXoWOR8fORYtLTgKGwoKCjgaGg0gEhIgDXoaGgkJBQwHdR85Fi0tOAobCgoKOBoaDSASEiANehoaCQkKGwotLXoWOR8BMwUFLYEuehYXFxYugC44CQkKGwo4GkoaDQ0NDXoaShoKGwoFBe8XFi6ALjgJCQobCjgaShoNDQ0NehpKGgobCgoKLYEuehYXAAAADACWAAEAAAAAAAEACAAAAAEAAAAAAAIAAwAIAAEAAAAAAAMACAAAAAEAAAAAAAQACAAAAAEAAAAAAAUAAQALAAEAAAAAAAYACAAAAAMAAQQJAAEAEAAMAAMAAQQJAAIABgAcAAMAAQQJAAMAEAAMAAMAAQQJAAQAEAAMAAMAAQQJAAUAAgAiAAMAAQQJAAYAEAAMYW5jaG9yanM0MDBAAGEAbgBjAGgAbwByAGoAcwA0ADAAMABAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAH//wAP) format("truetype"); }',
                  e.sheet.cssRules.length
                );
            }
          })(),
            t = document.querySelectorAll("[id]"),
            i = [].map.call(t, function (A) {
              return A.id;
            }),
            o = 0;
          o < e.length;
          o++
        )
          if (this.hasAnchorJSLink(e[o])) d.push(o);
          else {
            if (e[o].hasAttribute("id")) n = e[o].getAttribute("id");
            else if (e[o].hasAttribute("data-anchor-id")) n = e[o].getAttribute("data-anchor-id");
            else {
              for (
                c = r = this.urlify(e[o].textContent), a = 0;
                void 0 !== s && (c = r + "-" + a), (a += 1), -1 !== (s = i.indexOf(c));

              );
              (s = void 0), i.push(c), e[o].setAttribute("id", c), (n = c);
            }
            n.replace(/-/g, " "),
              ((h = document.createElement("a")).className = "anchorjs-link " + this.options.class),
              h.setAttribute("aria-label", this.options.ariaLabel),
              h.setAttribute("data-anchorjs-icon", this.options.icon),
              this.options.titleText && (h.title = this.options.titleText),
              (u = document.querySelector("base") ? window.location.pathname + window.location.search : ""),
              (u = this.options.base || u),
              (h.href = u + "#" + n),
              "always" === l && (h.style.opacity = "1"),
              "" === this.options.icon &&
                ((h.style.font = "1em/1 anchorjs-icons"),
                "left" === this.options.placement && (h.style.lineHeight = "inherit")),
              "left" === this.options.placement
                ? ((h.style.position = "absolute"),
                  (h.style.marginLeft = "-1em"),
                  (h.style.paddingRight = "0.5em"),
                  e[o].insertBefore(h, e[o].firstChild))
                : ((h.style.paddingLeft = "0.375em"), e[o].appendChild(h));
          }
        for (o = 0; o < d.length; o++) e.splice(d[o] - o, 1);
        return (this.elements = this.elements.concat(e)), this;
      }),
      (this.remove = function (A) {
        for (var e, t, i = p(A), n = 0; n < i.length; n++)
          (t = i[n].querySelector(".anchorjs-link")) &&
            (-1 !== (e = this.elements.indexOf(i[n])) && this.elements.splice(e, 1), i[n].removeChild(t));
        return this;
      }),
      (this.removeAll = function () {
        this.remove(this.elements);
      }),
      (this.urlify = function (A) {
        return (
          this.options.truncate || f(this.options),
          A.trim()
            .replace(/\'/gi, "")
            .replace(/[& +$,:;=?@"#{}|^~[`%!'<>\]\.\/\(\)\*\\\n\t\b\v]/g, "-")
            .replace(/-{2,}/g, "-")
            .substring(0, this.options.truncate)
            .replace(/^-+|-+$/gm, "")
            .toLowerCase()
        );
      }),
      (this.hasAnchorJSLink = function (A) {
        var e = A.firstChild && -1 < (" " + A.firstChild.className + " ").indexOf(" anchorjs-link "),
          t = A.lastChild && -1 < (" " + A.lastChild.className + " ").indexOf(" anchorjs-link ");
        return e || t || !1;
      });
  };
});
// @license-end
/* jslint browser */
/* globals anchors, pageLanguage, locales */

// Set the options for anchor.min.js,
// which is laoded before this file.
// See https://www.bryanbraun.com/anchorjs/

// Set options
anchors.options = {
  placement: "right", // 'left' disappears outside viewport
  visible: "always", // users should see that this is available
  icon: locales[pageLanguage].links["anchor-link"],
};

// Add anchors to these elements
anchors.add(':not(.landing-page) > div[role="main"] > .content h3');
anchors.add(".frontmatter h2, .endmatter h2");

/* jslint browser */
/* global locales gtag console pageLanguage */

// ----------------
// USEFUL VARIABLES
// ----------------

// Some functions are called in their feature files, so we need to be able to
// define variables inside some functions, but also globally in this file for
// use by the functions that run here. This function and its output object
// present a solution to this.

function defineVariables() {
  const analyticsVariables = {};

  // pageLanguage is declared in locales.js
  analyticsVariables.languageSignifier = pageLanguage.toUpperCase();
  analyticsVariables.bookTitle = locales[pageLanguage].project.name;

  let chapterTitle;
  let titlePieces;
  let chapterNumber;

  if (document.querySelector("h1 strong")) {
    chapterTitle = document.querySelector("h1 strong").innerHTML;
    titlePieces = chapterTitle.split(" ");
    chapterNumber = titlePieces[titlePieces.length - 1];
  } else {
    if (document.querySelector("h1")) {
      chapterTitle = document.querySelector("h1").innerHTML;
    } else if (document.querySelector("h2")) {
      chapterTitle = document.querySelector("h2").innerHTML;
    } else if (document.querySelector("h3")) {
      chapterTitle = document.querySelector("h3").innerHTML;
    } else {
      chapterTitle = "";
    }
  }

  analyticsVariables.chapterTitle = chapterTitle;
  analyticsVariables.chapterNumber = chapterNumber;

  return analyticsVariables;
}

const variables = defineVariables();
const languageSignifier = variables.languageSignifier;
const bookTitle = variables.bookTitle;
const chapterNumber = variables.chapterNumber;

// --------------
// BASE FUNCTIONS
// --------------

// Base function to send info to Google Analytics
function ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel) {
  if (typeof gtag === "function") {
    gtag("event", eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
    });
  }
}

// Base function to send analytics upon triggering an event
function ebTrackEvent(target, event, eventAction, eventCategory, eventLabel) {
  target.addEventListener(event, function () {
    // Inform Google Analytics when this event is triggered
    ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel);
  });
}

// --------------
// VIDEO TRACKING
// --------------

function ebVideoGetVideoDescription(video) {
  const optionLinks = video.querySelectorAll(".video-options-content a");

  let videoDescription;
  let urlPieces;

  if (optionLinks.length > 0) {
    optionLinks.forEach(function (link) {
      if (link.href.indexOf(".mp4") !== -1) {
        urlPieces = link.href.split("/");
        videoDescription = urlPieces[urlPieces.length - 1];
        videoDescription = videoDescription.slice(0, -4);
      }
    });
  } else {
    videoDescription = video.getAttribute("data-title");
  }

  return videoDescription;
}

function ebTrackYoutubeVideoPlay(video) {
  // This one is called in videos.js
  const variables = defineVariables();
  const languageSignifier = variables.languageSignifier;
  const bookTitle = variables.bookTitle;
  const chapterTitle = variables.chapterTitle;
  const chapterNumber = variables.chapterNumber;

  const videoClassList = video.classList;

  const eventAction = "Play video";
  let eventCategory = "Videos - ";
  let eventLabel = null;

  const videoDescription = ebVideoGetVideoDescription(video);

  if (videoClassList.contains("walk-through")) {
    let fullChapterTitle;
    if (document.querySelector("h1")) {
      fullChapterTitle = document.querySelector("h1").innerHTML;
    } else if (document.querySelector("h2")) {
      fullChapterTitle = document.querySelector("h2").innerHTML;
    } else {
      fullChapterTitle = "";
    }
    eventCategory += "Walk-through";

    if (fullChapterTitle.includes("Excel")) {
      eventLabel = bookTitle + " " + languageSignifier + " Excel Project " + chapterNumber + " - " + videoDescription;
    } else if (fullChapterTitle.includes("Google")) {
      eventLabel =
        bookTitle + " " + languageSignifier + " Google Sheets Project " + chapterNumber + " - " + videoDescription;
    } else {
      eventLabel = bookTitle + " " + languageSignifier + " R Project " + chapterNumber + " - " + videoDescription;
    }
  } else if (videoClassList.contains("economist-in-action")) {
    eventCategory += "EiA";
    eventLabel = bookTitle + " " + languageSignifier + " " + chapterTitle + " - " + videoDescription;
  }

  if (eventLabel !== null) {
    ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel);
  }
}

function ebTrackVideoOptionClicks(video) {
  // This one is called in videos.js
  const variables = defineVariables();
  const languageSignifier = variables.languageSignifier;
  const bookTitle = variables.bookTitle;
  const chapterTitle = variables.chapterTitle;

  let eventCategory;
  let eventAction;

  const optionLinks = video.querySelectorAll(".video-options-content a");
  const videoDescription = ebVideoGetVideoDescription(video);

  const eventLabel = bookTitle + " " + languageSignifier + " " + chapterTitle + " - " + videoDescription;

  optionLinks.forEach(function (link) {
    const linkURL = link.href;

    if (linkURL.includes(".mp4")) {
      eventCategory = "Video options - Download";
      eventAction = "Download video";
    } else if (linkURL.includes("bilibili")) {
      eventCategory = "Video options - BiliBili";
      eventAction = "Play video";
    } else if (linkURL.includes(".txt")) {
      eventCategory = "Video options - Transcript";
      eventAction = "Download transcript";
    } else {
      eventCategory = "Video options - Misc";
      eventAction = "Play video";
    }

    ebTrackEvent(link, "click", eventAction, eventCategory, eventLabel);
    ebTrackEvent(link, "contextmenu", eventAction, eventCategory, eventLabel);
  });
}

// ---------------
// BUTTON TRACKING
// ---------------

function ebTrackOwidButtonClicks() {
  const owidButtons = document.querySelectorAll(".figure-more a");

  const eventAction = "Click on OWiD";
  const eventCategory = "Button - OWiD";

  owidButtons.forEach(function (owidButton) {
    const figureNumber = owidButton.parentNode.parentNode.parentNode
      .querySelector(".figure-reference")
      .innerHTML.trim();
    const eventLabel = bookTitle + " " + languageSignifier + " " + figureNumber;

    ebTrackEvent(owidButton, "click", eventAction, eventCategory, eventLabel);
    ebTrackEvent(owidButton, "contextmenu", eventAction, eventCategory, eventLabel);
  });
}

ebTrackOwidButtonClicks();

function ebTrackCheckAnswerButtonClicks() {
  const checkAnswerButtons = document.querySelectorAll(".check-answer-button");

  const eventAction = "Click on Answer";
  const eventCategory = "Button - Check Answer";

  if (checkAnswerButtons) {
    checkAnswerButtons.forEach(function (button) {
      const questionNumber = button.parentNode.querySelector("h3 strong");

      if (questionNumber) {
        const eventLabel = bookTitle + " " + languageSignifier + " " + questionNumber.innerHTML;
        ebTrackEvent(button, "click", eventAction, eventCategory, eventLabel);
      } else {
        console.error("Question does not have a bold number in its heading. See: " + button.parentNode.innerHTML);
      }
    });
  }
}

ebTrackCheckAnswerButtonClicks();

// --------------------------
// EMPIRICAL PROJECT TRACKING
// --------------------------

function ebTrackEmpiricalProjectViews() {
  let fullChapterTitle;
  if (document.querySelector("h1")) {
    fullChapterTitle = document.querySelector("h1").innerHTML;
  } else if (document.querySelector("h2")) {
    fullChapterTitle = document.querySelector("h2").innerHTML;
  } else {
    fullChapterTitle = "";
  }

  const thisIsAProjectPage = document.querySelector("body.project");
  const eventAction = "View project";
  let eventCategory;
  let eventLabel;

  if (thisIsAProjectPage) {
    if (fullChapterTitle.includes("Excel")) {
      eventCategory = "Empirical Project - Excel";
      eventLabel = bookTitle + " " + languageSignifier + " - Excel Project " + chapterNumber;
    } else if (fullChapterTitle.includes("Google")) {
      eventCategory = "Empirical Project - Google Sheets";
      eventLabel = bookTitle + " " + languageSignifier + " - Google Sheets Project " + chapterNumber;
    } else {
      eventCategory = "Empirical Project - R";
      eventLabel = bookTitle + " " + languageSignifier + " - R Project " + chapterNumber;
    }

    ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel);
  }
}

ebTrackEmpiricalProjectViews();

function ebTrackRCodeDownloads() {
  const rDownloadLink = document.querySelector(".js-code-download-link");

  if (rDownloadLink) {
    const eventAction = "Download code";
    const eventCategory = "Code download - R";
    const eventLabel = bookTitle + " " + languageSignifier + " - R Project " + chapterNumber;

    ebTrackEvent(rDownloadLink, "click", eventAction, eventCategory, eventLabel);
    ebTrackEvent(rDownloadLink, "contextmenu", eventAction, eventCategory, eventLabel);
  }
}

ebTrackRCodeDownloads();

function ebTrackExpandableBoxOpen(h3) {
  // This one is called in expandable-box.js

  const eventAction = "Expand walk-through";
  let eventCategory = "";
  let eventLabel = "";

  const headingPieces = h3.split(" ");
  const boxNumber = headingPieces[headingPieces.length - 1];

  if (h3.includes("excel")) {
    eventCategory = "Walk-through - Excel";
    eventLabel = "Excel Walk-through " + boxNumber;
  } else if (h3.includes("google")) {
    eventCategory = "Walk-through - Google Sheets";
    eventLabel = "Google Sheets Walk-through " + boxNumber;
  } else {
    eventCategory = "Walk-through - R";
    eventLabel = "R Walk-through " + boxNumber;
  }

  ebTrackSendEventToGoogle(eventAction, eventCategory, eventLabel);
}

/* jslint browser */
/* globals window, IntersectionObserver, Element, locales, pageLanguage, settings,
    ebSlugify, ebIsPositionRelative, ebNearestPrecedingSibling, ebTruncatedString,
    ebToggleClickout, ebAccordionListenForAnchorClicks, Storage, sessionStorage,
    localStorage, ebWordpressIsLoggedIn, ebStripHtml, MutationObserver */

// This is a script for managing a user's bookmarks.
// This script waits for setup.js to give elements IDs.
// Then it checks local storage for stored bookmarks,
// and does some housekeeping (e.g. deleting old last-location bookmarks).

// It then reads bookmarks from local storage, and marks the
// relevant bookmarked elements on the page with attributes.
// It then creates a list of bookmarks to show to the user.
// It makes it possible for users to select text in elements to bookmark them.
// It listens for new user bookmarks, and updates the bookmark list
// when a user places a new bookmark.
// It also saves a 'last location' bookmark every few seconds.
// It gives each session an ID, which is a 'sessionDate' timestamp.
// This 'sessionDate' is stored in session storage, and with each
// bookmark in local storage. For the 'last location' bookmarks,
// we only show the user the most recent last-location bookmark
// whose sessionDate does *not* match the current session's sessionDate.
// That way, the last location is always the last place the user
// visited in their last/previous session.

// This script also creates a fingerprint index, which is a map,
// stored in session storage, of IDs to element fingerprints.
// Fingerprints are created in setup.js as attributes, and aim to identify
// an element by its position in the DOM and its opening and closing strings,
// so that if its ID changes, we might still find it by its fingerprint.
// Each stored bookmark includes the bookmarked element's fingerprint.
// This script checks whether the ID of a bookmark in localStorage
// matches its fingerprint in session storage. If it doesn't, we know
// that IDs have shifted, and that bookmarked locations may be inaccurate.
// This script does not yet do anything about that inaccuracy.

// In future, we might offer the user the option of updating bookmarks
// using those fingerprints, in order to improve the accuracy of
// their bookmarks, after shifted content has changed elements' IDs.

// --

// Which elements should we make bookmarkable?
function ebBookmarkableElements() {
  "use strict";

  // Include anything in .content with an ID...
  let bookmarkableElements = document.querySelectorAll(settings.web.bookmarks.elements.include);
  // ... but exclude elements with data-bookmarkable="no",
  // or whose ancestors have data-bookmarkable="no",
  // or who are MathJax elements
  // or are footnote references
  // or those specified in settings.web.bookmarks.elements.exclude
  // (We also check for '[data-bookmarkable="no"]' there,
  // bacause settings.web.bookmarks.elements.exclude may be empty.)
  bookmarkableElements = Array.from(bookmarkableElements).filter(function (element) {
    return (
      element.getAttribute("data-bookmarkable") !== "no" &&
      !element.closest('[data-bookmarkable="no"]') &&
      !element.id.startsWith("MathJax-") &&
      !element.id.startsWith("fnref:") &&
      !element.matches('[data-bookmarkable="no"]', settings.web.bookmarks.elements.exclude)
    );
  });

  return bookmarkableElements;
}

// Initialise global variables for general use
let ebCurrentSelectionText;

// Disable bookmarks on browsers that don't support
// what we need to provide them.
function ebBookmarksSupport() {
  "use strict";
  if (
    Object.prototype.hasOwnProperty.call(window, "IntersectionObserver") &&
    window.getSelection &&
    window.getSelection().toString &&
    window.localStorage &&
    Storage !== undefined &&
    document.querySelector(".bookmarks")
  ) {
    return true;
  } else {
    const bookmarking = document.querySelector(".bookmarks");
    if (bookmarking !== null) {
      bookmarking.style.display = "none";
    }
    return false;
  }
}

// Generate and store an index of fingerprints and IDs.
function ebBookmarksCreateFingerprintIndex() {
  "use strict";

  const indexOfBookmarks = {};
  const fingerprintedElements = document.querySelectorAll("[data-fingerprint]");
  fingerprintedElements.forEach(function (element) {
    const elementFingerprint = element.getAttribute("data-fingerprint");
    const elementID = element.id;
    indexOfBookmarks[elementFingerprint] = elementID;
  });
  sessionStorage.setItem("index-of-bookmarks", JSON.stringify(indexOfBookmarks));
}

// Return the indexed ID of an element's fingerprint.
// This is not used now, but may be useful when
// we extend this script to manage IDs that have moved
// after content changes.
function ebBookmarksFingerprintID(elementID) {
  "use strict";

  // If a bookmark's fingerprint isn't in the index,
  // we know that the bookmarked element has moved,
  // because the document has changed.

  // Get the element
  let element;
  if (document.getElementById(elementID)) {
    element = document.getElementById(elementID);
  } else {
    return false;
  }

  // If we have an element to check, the element has a data-fingerprint,
  // and an index exists, return the ID. Otherwise return false.
  if (element.getAttribute("data-fingerprint") && sessionStorage.getItem("index-of-bookmarks")) {
    // Fetch and return the ID for the fingerprint
    const indexOfBookmarks = JSON.parse(sessionStorage.getItem("index-of-bookmarks"));
    const fingerprintToCheck = element.getAttribute("data-fingerprint");
    const indexedID = indexOfBookmarks[fingerprintToCheck];
    if (elementID !== indexedID) {
      window.alert(locales[pageLanguage].bookmarks["bookmarks-shifted-warning"]);
    } else {
      return indexedID;
    }
  } else {
    return false;
  }
}

// Prompt user to go to last location
function ebBookmarksLastLocationPrompt(link) {
  "use strict";

  // We need to detect if the user has only just arrived.
  // Checking the history length is unreliable, because
  // browsers differ. So we use sessionStorage to store
  // whether the user has just arrived.
  let newSession;
  if (sessionStorage.getItem("sessionUnderway")) {
    newSession = false;
  } else {
    newSession = true;
    sessionStorage.setItem("sessionUnderway", true);
  }

  // If there is a link to go to, this is a new session,
  // and the prompt string has been set in locales, then prompt.
  if (link && newSession && locales[pageLanguage].bookmarks["last-location-prompt"]) {
    const prompt = document.createElement("div");
    prompt.classList.add("last-location-prompt");
    prompt.innerHTML = '<a href="' + link + '">' + locales[pageLanguage].bookmarks["last-location-prompt"] + "</a>";
    document.body.appendChild(prompt);

    // Add class to animate by. Wait a few milliseconds
    // so that CSS transitions will work.
    window.setTimeout(function () {
      prompt.classList.add("last-location-prompt-open");
    }, 50);

    // Let users hide the prompt
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&#9587;"; // &#9587; is ╳
    prompt.appendChild(closeButton);

    // Listen for clicks on close
    closeButton.addEventListener("click", function () {
      prompt.remove();
    });
  }
}

// Create a session ID
function ebBookmarksSessionDate() {
  "use strict";
  // If a sessionDate has been set,
  // return the current sessionDate
  if (sessionStorage.getItem("sessionDate")) {
    return sessionStorage.getItem("sessionDate");
  } else {
    // create, set and return the session ID
    const sessionDate = Date.now();
    sessionStorage.setItem("sessionDate", sessionDate);
    return sessionDate;
  }
}

// Clean up last locations of a title
function ebBookmarksCleanLastLocations(bookTitleToClean) {
  "use strict";
  let lastLocations = [];

  // Loop through stored bookmarks and add them to the array.
  Object.keys(localStorage).forEach(function (key) {
    if (key.startsWith("bookmark-") && key.includes("-lastLocation-")) {
      const bookmarkBookTitle = JSON.parse(localStorage.getItem(key)).bookTitle;
      if (bookTitleToClean === bookmarkBookTitle) {
        lastLocations.push(JSON.parse(localStorage.getItem(key)));
      }
    }
  });

  // Only keep the last two elements:
  // the previous session's lastLocation, and this session's one
  lastLocations = lastLocations.slice(Math.max(lastLocations.length - 2, 0));

  // Sort the lastLocations ascending by the number in their sessionDate
  lastLocations.sort(function (a, b) {
    return parseFloat(a.sessionDate) - parseFloat(b.sessionDate);
  });

  // Get the number of lastLocations that are not the current session
  const previousSessionLocations = lastLocations.filter(function (location) {
    return location.sessionDate !== ebBookmarksSessionDate();
  }).length;
  // If there are more than one, drop the first of the lastLocations
  if (previousSessionLocations > 1) {
    lastLocations.splice(0, 1);
  }

  // Remove all localStorage entries for this title except those in lastLocations
  Object.keys(localStorage).forEach(function (key) {
    // Assume we'll discard this item unless it's in lastLocations
    let matches = 0;

    if (key.startsWith("bookmark-") && key.includes("-lastLocation-")) {
      const bookmarkBookTitle = JSON.parse(localStorage.getItem(key)).bookTitle;
      if (bookTitleToClean === bookmarkBookTitle) {
        lastLocations.forEach(function (lastLocation) {
          if (key.includes(lastLocation.sessionDate)) {
            matches += 1;
          }
        });
        if (matches === 0) {
          localStorage.removeItem(key);
        }
      }
    }
  });
}

// Check if bookmark is on the current page
function ebBookmarksCheckForCurrentPage(url) {
  "use strict";

  const pageURL = window.location.href.split("#")[0];
  const bookmarkURL = url.split("#")[0];

  if (pageURL === bookmarkURL) {
    return true;
  }
}

// Mark bookmarks in the document
function ebBookmarksMarkBookmarks(bookmarks) {
  "use strict";

  // Clear existing bookmarks
  const bookmarkedElements = document.querySelectorAll("[data-bookmarked]");
  bookmarkedElements.forEach(function (element) {
    element.removeAttribute("data-bookmarked");
  });

  // Mark bookmarked elements
  bookmarks.forEach(function (bookmark) {
    // If this bookmark is on the current page,
    // mark the relevant bookmarked element.
    if (ebBookmarksCheckForCurrentPage(bookmark.location)) {
      // Find the element by bookmark ID.
      // If the bookmark ID isn't on the page, try the fingerprint.
      // If that doesn't work, mark the first element with an ID.
      // If no element has an ID, return.
      let elementToMark;
      if (document.getElementById(bookmark.id)) {
        elementToMark = document.getElementById(bookmark.id);
      } else if (document.querySelector('[data-fingerprint="' + bookmark.fingerprint + '"')) {
        elementToMark = document.querySelector('[data-fingerprint="' + bookmark.fingerprint + '"');
      } else if (document.querySelector("[id]")) {
        elementToMark = document.querySelector("[id]");
      } else {
        return;
      }

      elementToMark.setAttribute("data-bookmarked", "true");

      // If the element has already been marked as a user bookmark,
      // leave it a user bookmark. They trump last locations.
      if (elementToMark.getAttribute("data-bookmark-type") === "userBookmark") {
        elementToMark.setAttribute("data-bookmark-type", "userBookmark");
      } else {
        elementToMark.setAttribute("data-bookmark-type", bookmark.type);
      }

      ebBookmarksToggleButtonOnElement(elementToMark);
    }
  });
}

// Have user confirm a deletion
function ebBookmarksConfirmDelete(button, bookmark) {
  "use strict";

  // Only run if a delete button exists and a bookmark argument.
  // E.g. if there are no bookmarks after deletion,
  // there is no button, nor its parent element.
  if (button && bookmark && button.parentElement) {
    // Hide the existing button
    button.style.display = "none";
    const confirmButton = document.createElement("button");
    confirmButton.classList = button.classList;
    confirmButton.id = "bookmarkConfirmDelete";
    button.parentElement.appendChild(confirmButton);

    // If we've been passed a bookmark type as a string
    // we want to delete all bookmarks. Otherwise,
    // we want to delete a single bookmark.
    if (typeof bookmark === "string") {
      confirmButton.innerHTML = locales[pageLanguage].bookmarks["delete-all-bookmarks-confirm"];
    } else {
      confirmButton.innerHTML = locales[pageLanguage].bookmarks["delete-bookmark-confirm"];
    }

    // Remove the confirmation after three seconds unclicked
    window.setTimeout(function () {
      confirmButton.remove();
      button.style.display = "inline-block";
    }, 2000);

    function confirmed() {
      confirmButton.remove();
      button.style.display = "inline-block";

      // If we've been passed a bookmark type as a string
      // we want to delete all bookmarks of that type.
      // Otherwise, delete the specific bookmark object.
      if (typeof bookmark === "string") {
        ebBookmarksDeleteAllBookmarks(bookmark);
      } else {
        ebBookmarksDeleteBookmark(bookmark);
      }
    }

    // If the confirmation button is clicked, return the original text
    confirmButton.addEventListener("click", confirmed);
  }
}

// List bookmarks for user
function ebBookmarksListBookmarks(bookmarks) {
  "use strict";

  // Get the bookmarks lists
  const bookmarksList = document.querySelector(".bookmarks-list ul");
  const lastLocationsList = document.querySelector(".last-locations-list ul");

  // Clear the current list
  if (bookmarksList) {
    bookmarksList.innerHTML = "";
  }
  if (lastLocationsList) {
    lastLocationsList.innerHTML = "";
  }

  // A variable to store the first, i.e. most recent, last-location link
  let lastLocationLink;

  // Add all the bookmarks to it
  bookmarks.forEach(function (bookmark) {
    // Clean last locations
    ebBookmarksCleanLastLocations(bookmark.bookTitle);

    // If lastLocation and it's the same session, then
    // quit, because we only want the previous session's last location
    if (bookmark.type === "lastLocation" && bookmark.sessionDate === ebBookmarksSessionDate()) {
      return;
    }

    // Create list item
    const listItem = document.createElement("li");
    listItem.setAttribute("data-bookmark-type", bookmark.type);

    // Add the page title
    if (bookmark.pageTitle) {
      const page = document.createElement("span");
      page.classList.add("bookmark-page");
      page.innerHTML = '<a href="' + bookmark.location + '">' + bookmark.pageTitle + "</a>";
      listItem.appendChild(page);
    }

    // Add the section heading, if any
    if (bookmark.sectionHeading) {
      const sectionHeading = document.createElement("span");
      sectionHeading.classList.add("bookmark-section");
      sectionHeading.innerHTML = '<a href="' + bookmark.location + '">' + bookmark.sectionHeading + "</a>";
      listItem.appendChild(sectionHeading);
    }

    // Add the description
    if (bookmark.description) {
      const description = document.createElement("span");
      description.classList.add("bookmark-description");
      description.innerHTML = bookmark.description;
      listItem.appendChild(description);
    }

    // Add title span with link
    if (bookmark.bookTitle) {
      const title = document.createElement("span");
      title.classList.add("bookmark-title");
      title.innerHTML = '<a href="' + bookmark.location + '">' + bookmark.bookTitle + "</a>";
      listItem.appendChild(title);
    }

    // Format the bookmark date from sessionDate,
    // then add it to the listItem. Leave locale undefined,
    // so that the user gets their default locale's format.
    if (bookmark.sessionDate) {
      const readableSessionDate = new Date(Number(bookmark.sessionDate)).toLocaleDateString(undefined, {
        // weekday: 'long',
        // hour: 'numeric',
        // minute: 'numeric',
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const date = document.createElement("span");
      date.classList.add("bookmark-date");
      date.innerHTML = '<a href="' + bookmark.location + '">' + readableSessionDate + "</a>";
      listItem.appendChild(date);
    }

    // Add a delete button and listen for clicks on it
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("bookmark-delete");
    deleteButton.innerHTML = locales[pageLanguage].bookmarks["delete-bookmark"];
    listItem.appendChild(deleteButton);
    deleteButton.addEventListener("click", function (event) {
      ebBookmarksConfirmDelete(event.target, bookmark);
    });

    // Add the list item to the list
    if (bookmark.type === "lastLocation") {
      lastLocationsList.appendChild(listItem);
    } else {
      bookmarksList.appendChild(listItem);
    }

    // If the lastLocationLink isn't yet set, set it because
    // this iteration in the loop must be the most recent lastLocation.
    if (bookmark.type === "lastLocation" && lastLocationLink === undefined) {
      lastLocationLink = bookmark.location;
    }
  });

  // Add button to delete all bookmarks
  const deleteAllBookmarksListItem = document.createElement("li");
  deleteAllBookmarksListItem.classList.add("bookmarks-delete-all");
  const deleteAllBookmarksButton = document.createElement("button");
  deleteAllBookmarksButton.innerHTML = locales[pageLanguage].bookmarks["delete-all"];
  deleteAllBookmarksListItem.appendChild(deleteAllBookmarksButton);
  bookmarksList.appendChild(deleteAllBookmarksListItem);
  deleteAllBookmarksButton.addEventListener("click", function (event) {
    ebBookmarksConfirmDelete(event.target, "userBookmark");
  });

  // Copy to the last-locations list, too
  const deleteAllBookmarksListItemLastLocations = deleteAllBookmarksListItem.cloneNode(true);
  lastLocationsList.appendChild(deleteAllBookmarksListItemLastLocations);
  deleteAllBookmarksListItemLastLocations.addEventListener("click", function (event) {
    ebBookmarksConfirmDelete(event.target, "lastLocation");
  });

  // Listen for clicks on the new anchor links,
  // if we're using the content accordion.
  if (typeof ebAccordionListenForAnchorClicks === "function") {
    ebAccordionListenForAnchorClicks(".bookmarks-modal a");
  }

  // Prompt the user about their last location
  ebBookmarksLastLocationPrompt(lastLocationLink);
}

// Check if a page has bookmarks
function ebBookmarksCheckForBookmarks() {
  "use strict";

  // Create an empty array to write to
  // when we read the localStorage bookmarks strings
  const bookmarks = [];

  // Loop through stored bookmarks and clean out old ones.
  Object.keys(localStorage).forEach(function (key) {
    if (key.startsWith("bookmark-")) {
      const entry = JSON.parse(localStorage.getItem(key));
      if (entry) {
        const title = entry.bookTitle;
        ebBookmarksCleanLastLocations(title);
      }
    }
  });

  // Now loop through the remaining stored bookmarks and add them to the array.
  Object.keys(localStorage).forEach(function (key) {
    if (key.startsWith("bookmark-")) {
      const bookmark = JSON.parse(localStorage.getItem(key));

      // Add any bookmark that isn't a last-location,
      // only last-locations that are not from the current session.
      if (bookmark.type !== "lastLocation") {
        bookmarks.push(bookmark);
      } else if (bookmark.sessionDate !== ebBookmarksSessionDate()) {
        bookmarks.push(bookmark);
      }
    }
  });

  // Mark them in the document
  ebBookmarksMarkBookmarks(bookmarks);

  // List them for the user
  ebBookmarksListBookmarks(bookmarks);
}

// Delete a bookmark
function ebBookmarksDeleteBookmark(bookmark) {
  "use strict";

  // Delete from local storage
  localStorage.removeItem(bookmark.key);
  // Remove the entry from the list
  ebBookmarksCheckForBookmarks();
}

// Delete all bookmarks
function ebBookmarksDeleteAllBookmarks(type) {
  "use strict";

  // Loop through stored bookmarks and delete
  Object.keys(localStorage).forEach(function (key) {
    if (key.startsWith("bookmark-")) {
      // If a type has been specified, only delete
      // bookmarks of that type. Otherwise,
      // delete all bookmarks of any type.
      const bookmarkType = JSON.parse(localStorage[key]).type;
      if (type) {
        if (type === bookmarkType) {
          localStorage.removeItem(key);
        }
      } else {
        localStorage.removeItem(key);
      }
    }
  });

  // Refresh the bookmarks lists
  ebBookmarksCheckForBookmarks();
}

// Return the ID of a bookmarkable element
function ebBookmarksElementID(element) {
  "use strict";

  // If we're bookmarking a specified element,
  // i.e. an element was passed to this function,
  // use its hash, otherwise use the first
  // visible element in the viewport.
  if (!element) {
    element = document.querySelector('[data-bookmark="onscreen"]');

    // If no bookmarkable elements found on screen exit early
    if (!element) {
      return false;
    }
  }
  if (element.id) {
    return element.id;
  } else if (window.location.hash) {
    // If for some reason the element has no ID,
    // return the hash of the current window location.
    return window.location.hash;
  } else {
    // And in desperation, use the first element
    // with an ID on the page.
    return document.querySelector("[id]").id;
  }
}

// Create and store bookmark
function ebBookmarksSetBookmark(type, element, description) {
  "use strict";

  // Get fallback description text
  if (!description) {
    // Use the opening characters of the text.
    // Note that textContent includes line breaks etc.,
    // so we remove any at the starts and ends of the string
    const descriptionText = element.textContent
      .trim()
      .replace(/^[\n]+/g, "")
      .replace(/[\n]+$/g, "")
      .trim();
    description = ebTruncatedString(descriptionText, 120, " …");
  }

  // Get the page heading and the most recent section heading, if any.
  // If the page starts with an h1, check for an h2.
  // If an h2, check for an h3, up to h4 sections. Otherwise no section heading.
  let pageTitle, sectionHeadingElement, sectionHeading;
  if (document.querySelector("h1")) {
    pageTitle = document.querySelector("h1").textContent.trim();
    if (ebNearestPrecedingSibling(element, "H2")) {
      sectionHeadingElement = ebNearestPrecedingSibling(element, "H2");
      sectionHeading = sectionHeadingElement.textContent;

      // If the sectionHeading contains links (e.g. it's an accordion header)
      // only grab the textContent of the first link
      if (sectionHeadingElement.querySelector("a")) {
        sectionHeadingElement = sectionHeadingElement.querySelector("a");
        sectionHeading = sectionHeadingElement.textContent;
      }
    }
  } else if (document.querySelector("h2")) {
    pageTitle = document.querySelector("h2").textContent.trim();
    if (ebNearestPrecedingSibling(element, "H3")) {
      sectionHeadingElement = ebNearestPrecedingSibling(element, "H3");
      sectionHeading = sectionHeadingElement.textContent;
      if (sectionHeadingElement.querySelector("a")) {
        sectionHeadingElement = sectionHeadingElement.querySelector("a");
        sectionHeading = sectionHeadingElement.textContent;
      }
    }
  } else if (document.querySelector("h3")) {
    pageTitle = document.querySelector("h3").textContent.trim();
    if (ebNearestPrecedingSibling(element, "H4")) {
      sectionHeadingElement = ebNearestPrecedingSibling(element, "H4");
      sectionHeading = sectionHeadingElement.textContent;
      if (sectionHeadingElement.querySelector("a")) {
        sectionHeadingElement = sectionHeadingElement.querySelector("a");
        sectionHeading = sectionHeadingElement.textContent;
      }
    }
  } else {
    pageTitle = document.title.trim();
    sectionHeading = "";
  }

  // Trim the section heading to 50 characters of textContent.
  // Remove from the last space, to end on a full word.
  if (sectionHeading && sectionHeading.length > 50) {
    sectionHeading = ebTruncatedString(sectionHeading, 50, " …");
  }

  // Create a bookmark object
  const bookmark = {
    sessionDate: ebBookmarksSessionDate(),
    type,
    bookTitle: document.querySelector(".wrapper").dataset.title,
    pageTitle,
    sectionHeading,
    description, // potential placeholder for a user-input description
    id: ebBookmarksElementID(element),
    fingerprint: element.getAttribute("data-fingerprint"),
    location: window.location.href.split("#")[0] + "#" + ebBookmarksElementID(element),
  };

  // Set a bookmark named for its type only.
  // So there will only ever be one bookmark of each type saved.
  // To save more bookmarks, make the key more unique.
  // Note that the prefix 'bookmark-' is used in ebBookmarksCheckForBookmarks().
  let bookmarkKey;
  if (bookmark.type === "lastLocation") {
    bookmarkKey = "bookmark-" + ebSlugify(bookmark.bookTitle) + "-" + bookmark.type + "-" + ebBookmarksSessionDate();
  } else {
    bookmarkKey = "bookmark-" + ebSlugify(bookmark.bookTitle) + "-" + bookmark.type + "-" + Date.now(); // this makes each userBookmark unique
  }

  // Add the key to the bookmark object for easy reference
  bookmark.key = bookmarkKey;

  // Save the bookmark
  localStorage.setItem(bookmarkKey, JSON.stringify(bookmark));

  // Refresh the bookmarks list.
  // No need to refresh for a lastLocation,
  // since that only applies to the next visit.
  if (type !== "lastLocation") {
    ebBookmarksCheckForBookmarks();
  }
}

// Mark an element that has been user-bookmarked
function ebBookmarkMarkBookmarkedElement(element) {
  "use strict";

  // Set the new bookmark
  element.setAttribute("data-bookmarked", "true");
}

// Remove a bookmark by clicking its icon
function ebBookmarksRemoveByIconClick(button) {
  "use strict";
  const bookmarkLocation = window.location.href.split("#")[0] + "#" + button.parentElement.id;

  // Loop through stored bookmarks,
  // find this one, and delete it.
  // Note there is no 'confirm delete' step here.
  Object.keys(localStorage).forEach(function (key) {
    if (key.startsWith("bookmark-")) {
      const entry = JSON.parse(localStorage.getItem(key));
      if (entry.location === bookmarkLocation) {
        ebBookmarksDeleteBookmark(entry);
      }
    }
  });
}

// Listen for bookmark clicks
function ebBookmarksListenForClicks(button) {
  "use strict";

  // We use mousedown here to catch both clicks and text selections
  button.addEventListener("mousedown", function (event) {
    // Don't let click on bookmark trigger accordion-close etc.
    event.stopPropagation();

    // If the bookmark is pending, set the bookmark
    if (button.parentElement.classList.contains("bookmark-pending")) {
      ebBookmarksSetBookmark("userBookmark", button.parentNode, ebCurrentSelectionText.trim());
      ebBookmarkMarkBookmarkedElement(button.parentNode);
      button.parentElement.classList.remove("bookmark-pending");
    } else {
      ebBookmarksRemoveByIconClick(button);
    }
  });
}

// Add a bookmark button to bookmarkable elements
function ebBookmarksToggleButtonOnElement(element, positionX, positionY) {
  "use strict";

  // Exit if no element
  if (!element) {
    return;
  }

  // Get the main bookmark icons from the page,
  const bookmarkIcon = document.querySelector(".bookmark-icon");
  const historyIcon = document.querySelector(".history-icon");

  // Get the type of bookmark we're setting
  let bookmarkType = "";
  if (element.getAttribute("data-bookmark-type")) {
    bookmarkType = element.getAttribute("data-bookmark-type");
  }

  // If the user is setting a bookmark, don't use history icon
  if (element.classList.contains("bookmark-pending")) {
    bookmarkType = "userBookmark";
  }

  // If the element has no button, add one.
  let button;
  if (!element.querySelector("button.bookmark-button")) {
    // Copy the icon SVG code to our new button.
    button = document.createElement("button");
    button.classList.add("bookmark-button");

    // Set icon based on bookmark type
    if (bookmarkType === "lastLocation") {
      button.innerHTML = historyIcon.outerHTML;
      button.title = locales[pageLanguage].bookmarks["last-location"];
    } else {
      button.innerHTML = bookmarkIcon.outerHTML;
      button.title = locales[pageLanguage].bookmarks.bookmark;
    }

    // Append the button
    element.insertAdjacentElement("afterbegin", button);

    // Listen for clicks
    ebBookmarksListenForClicks(button);

    // Otherwise, if the element has a last-location icon
    // the user it trying to set a user bookmark, so
    // switch the icon for a user bookmark icon.
  } else if (element.querySelector("button.bookmark-button .history-icon") && bookmarkType === "userBookmark") {
    button = element.querySelector("button.bookmark-button");
    button.innerHTML = bookmarkIcon.outerHTML;

    // Otherwise, if the element needs a user-bookmark button, add it
  } else if (element.querySelector("button.bookmark-button") && bookmarkType === "userBookmark") {
    button = element.querySelector("button.bookmark-button");
    button.innerHTML = bookmarkIcon.outerHTML;

    // Otherwise, if we are placing a bookmark (not jsut
    // showing a pending bookmark icon) add a last-location icon button
  } else if (element.querySelector("button.bookmark-button") && bookmarkType === "") {
    button = element.querySelector("button.bookmark-button");
    button.innerHTML = bookmarkIcon.outerHTML;
  } else {
    button = element.querySelector("button.bookmark-button");
    button.innerHTML = historyIcon.outerHTML;
  }

  // Position the button after the selection,
  // on browsers that support custom properties
  if (positionX !== undefined && positionY !== undefined) {
    // If the vertical height is not zero, we have to deduct
    // the height of the button, to align it with the selected text.
    if (positionY > 0) {
      positionY = positionY - button.offsetHeight;
    }

    // To avoid letting the bookmark appear off screen,
    // don't let the horizontal position exceed the width
    // of its parent. The browser doesn't give us the button
    // width in time for us to use it here. So we have to guess.
    let buttonWidth = "30"; // px
    if (button.clientWidth > 0) {
      buttonWidth = button.clientWidth;
    }
    const maxHorizontalPosition =
      button.parentElement.clientWidth + button.parentElement.getBoundingClientRect().left - buttonWidth;
    if (positionX > maxHorizontalPosition) {
      positionX = maxHorizontalPosition;
    }

    // Add the positions as CSS variables
    let positionUnitX = "";
    let positionUnitY = "";
    if (positionX !== "auto") {
      positionUnitX = "px";
    }
    if (positionY !== "auto") {
      positionUnitY = "px";
    }
    button.setAttribute(
      "style",
      "--bookmark-button-position: absolute;" +
        "--bookmark-button-position-x: " +
        positionX +
        positionUnitX +
        ";" +
        "--bookmark-button-position-y: " +
        positionY +
        positionUnitY +
        ";"
    );
  } else {
    // Remove prior position settings, e.g. on a second click
    button.removeAttribute("style");
  }
}

// Mark elements in the viewport so we can bookmark them
function ebBookmarksMarkVisibleElements(elements) {
  "use strict";

  // Ensure we only use elements with IDs
  const elementsWithIDs = Array.from(elements).filter(function (element) {
    // Reasons not to include an element, e.g.
    // it is a MathJax element.
    return element.id && element.id !== "undefined" && !element.id.startsWith("MathJax-");
  });

  // If IntersectionObserver is supported, create one.
  // In the config, we set rootMargin slightly negative,
  // so that at least a meaningful portion of the element
  // is visible before it gets a bookmark icon.
  const ebBookmarkObserverConfig = {
    rootMargin: "-50px",
  };

  if (Object.prototype.hasOwnProperty.call(window, "IntersectionObserver")) {
    const bookmarkObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-bookmark", "onscreen");
        } else {
          entry.target.setAttribute("data-bookmark", "offscreen");
        }
      });
    }, ebBookmarkObserverConfig);

    // Observe each element
    elementsWithIDs.forEach(function (element) {
      bookmarkObserver.observe(element);
    });
  } else {
    // If the browser doesn't support IntersectionObserver,
    // maybe this will work -- largely untested code this.
    // Test and fix it if we need old IE support.
    const scrollTop = window.scrollTop;
    const windowHeight = window.offsetHeight;
    elementsWithIDs.forEach(function (element) {
      if (
        scrollTop <= element.offsetTop &&
        element.offsetHeight + element.offsetTop < scrollTop + windowHeight &&
        element.dataset["in-view"] === "false"
      ) {
        element.target.setAttribute("data-bookmark", "onscreen");
        ebBookmarksToggleButtonOnElement(element.target);
      } else {
        element.target.setAttribute("data-bookmark", "offscreen");
        ebBookmarksToggleButtonOnElement(element.target);
      }
    });
  }
}

// Listen for user interaction to show bookmark button
function ebBookmarksAddButtons(elements, action) {
  "use strict";

  // If an action is specified e.g. 'click',
  // add the button when an element is clicked.
  if (action) {
    elements.forEach(function (element) {
      element.addEventListener(action, function (event) {
        // Toggle the button on the element, currentTarget,
        // (not necessarily the clicked element, which might be a child).
        ebBookmarksToggleButtonOnElement(event.currentTarget);
      });
    });
  }
}

// Toggle the modal visibility
function ebBookmarksToggleModal(modal) {
  "use strict";

  if (!modal) {
    modal = document.getElementById("bookmarks-modal");
  }

  // Toggle the clickable clickOut area
  ebToggleClickout(modal, function () {
    // If the modal is open, close it
    if (document.querySelector('[data-bookmark-modal="open"]')) {
      modal.style.display = "none";
      modal.setAttribute("data-bookmark-modal", "closed");
      document.querySelector(".bookmarks > .bookmark-icon").focus();

      // Otherwise, show it
    } else {
      // Update login link in bookmark notice to correct redirect address
      const loginLink = modal.querySelector("a.bookmark-dialog-login");

      if (loginLink) {
        if (ebWordpressIsLoggedIn()) {
          // If WP login cookie exist we assume the user is authenticated and strip login link
          loginLink.outerHTML = ebStripHtml(loginLink.innerHTML);
        } else {
          // Update login link with redirect back to current location
          const redirectUrl = `${window.location.origin}/login?redirect_to=${window.location.href}`;
          if (loginLink.href !== redirectUrl) {
            loginLink.href = redirectUrl;
          }
        }
      }

      modal.style.display = "flex";
      modal.setAttribute("data-bookmark-modal", "open");
      // focus on the first focussable element
      modal.querySelector("[tabindex='0']").focus();
    }
  });
}

// Open the modal when the bookmarks button is clicked
function ebBookmarksOpenOnClick() {
  "use strict";
  const button = document.querySelector(".bookmarks > .bookmark-icon");
  if (button !== null) {
    button.addEventListener("click", function () {
      ebBookmarksToggleModal();
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        ebBookmarksToggleModal();
      }
    });
  }
}

// Close the modal with the Escape key
function ebBookmarksCloseWithEscape() {
  "use strict";

  const modal = document.getElementById("bookmarks-modal");

  modal.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      ebBookmarksToggleModal();
    }
  });
}

// In addition to CSS hover, mark clicked lists
function ebBookmarkListsOpenOnClick() {
  "use strict";
  const listHeaders = document.querySelectorAll(".bookmarks-list-header, .last-locations-list-header");
  listHeaders.forEach(function (header) {
    header.addEventListener("click", function () {
      if (document.querySelector(".bookmarks-list-header-open")) {
        // Mark the headers ...
        const openHeader = document.querySelector(".bookmarks-list-header-open");
        openHeader.classList.remove("bookmarks-list-header-open");
        header.classList.add("bookmarks-list-header-open");

        // ... and their parents
        openHeader.parentElement.classList.remove("bookmarks-list-open");
        header.parentElement.classList.add("bookmarks-list-open");

        // Firefox doesn't repaint here, forcing users to reclick.
        // Not sure how to handle that here yet.
      }
    });
    header.addEventListener("keydown", function (event) {
      if (document.querySelector(".bookmarks-list-header-open") && event.key === "Enter") {
        // Mark the headers ...
        const openHeader = document.querySelector(".bookmarks-list-header-open");
        openHeader.classList.remove("bookmarks-list-header-open");
        header.classList.add("bookmarks-list-header-open");

        // ... and their parents
        openHeader.parentElement.classList.remove("bookmarks-list-open");
        header.parentElement.classList.add("bookmarks-list-open");

        // Firefox doesn't repaint here, forcing users to reclick.
        // Not sure how to handle that here yet.
      }
    });
  });

  // Set default view
  const bookmarksListHeader = document.querySelector(".bookmarks-list-header");
  if (bookmarksListHeader !== null) {
    bookmarksListHeader.classList.add("bookmarks-list-header-open");
  }
}

// Always listen for and store user's text selection
function ebBookmarksListenForTextSelection() {
  "use strict";
  document.onselectionchange = function () {
    ebCurrentSelectionText = document.getSelection().toString();

    // If the browser supports anchorNode, use that
    // to get the starting element, otherwise second prize
    // we use the focusNode, where the selection ends
    // (IE supports focusNode but maybe not anchorNode)
    const selectionStartPoint = window.getSelection().anchorNode ? window.getSelection().anchorNode : false;
    const selectionEndPoint = window.getSelection().focusNode;

    // If the user does not click on bookmark icon after selecting a section,
    // assume that they are not interesting in bookmarking that selection.
    if (!selectionEndPoint) {
      return;
    }

    // Check if an excluded element is being clicked/selected
    // If not a DOM Element, assign to parent element
    const clickedElement = selectionEndPoint instanceof Element ? selectionEndPoint : selectionEndPoint.parentElement;

    // Exit if element is excluded in settings.js
    // ebBookmarkableElements() can't be re-used here in its current form,
    // because its approach requires testing the closest parent containing an ID,
    // which we don't want to do here. We also check for '[data-bookmarkable="no"]'
    // because settings.web.bookmarks.elements.exclude may be empty.
    if (clickedElement.matches('[data-bookmarkable="no"]', settings.web.bookmarks.elements.exclude)) {
      return;
    }

    // Try bookmark a valid selection
    let selectedElement = selectionStartPoint || selectionEndPoint;
    // If not a DOM Element, assign to parent element
    selectedElement = selectedElement instanceof Element ? selectedElement : selectedElement.parentElement;
    const bookmarkableElement = selectedElement.closest("[id]");
    // Exit if the element isn't bookmarkable
    if (!ebBookmarkableElements().includes(bookmarkableElement)) {
      return;
    }

    // Mark the element as pending a bookmark, so that
    // in CSS we can show the bookmark button
    if (document.querySelector(".bookmark-pending")) {
      const previousBookmarkableElement = document.querySelector(".bookmark-pending");
      previousBookmarkableElement.classList.remove("bookmark-pending");
    }
    if (bookmarkableElement) {
      bookmarkableElement.classList.add("bookmark-pending");

      // Remove pending icon soon if not clicked
      // and no text is currently selected
      setTimeout(function () {
        if (window.getSelection().isCollapsed) {
          bookmarkableElement.classList.remove("bookmark-pending");
        }
      }, 3000);
    }

    // Add the bookmark button. If no text is selected,
    // add the button in the default position. Otherwise,
    // position it at the end of the text selection.
    if (window.getSelection().isCollapsed) {
      ebBookmarksToggleButtonOnElement(bookmarkableElement, "auto", "auto");
    } else {
      // If the button has a position: relative parent,
      // we want to set its absolute position based on that parent.
      // Otherwise, we can set it relative to the page.
      let positionX, positionY;
      if (ebIsPositionRelative(bookmarkableElement)) {
        const relativeParent = ebIsPositionRelative(bookmarkableElement);
        positionX =
          window.getSelection().getRangeAt(0).getBoundingClientRect().right -
          relativeParent.getBoundingClientRect().left;
        positionY =
          window.getSelection().getRangeAt(0).getBoundingClientRect().bottom -
          relativeParent.getBoundingClientRect().top;
      } else {
        positionX = window.getSelection().getRangeAt(0).getBoundingClientRect().right + window.pageXOffset;
        positionY = window.getSelection().getRangeAt(0).getBoundingClientRect().bottom + window.pageYOffset;
      }

      ebBookmarksToggleButtonOnElement(bookmarkableElement, positionX, positionY);
    }
  };
}

// Set the lastLocation bookmark
function ebBookmarksSetLastLocation() {
  "use strict";

  const lastLocationId = ebBookmarksElementID();
  if (lastLocationId) {
    ebBookmarksSetBookmark("lastLocation", document.getElementById(lastLocationId));
  }
}

// Move the modal HTML to an independent location
function ebBookmarksMoveModal() {
  "use strict";
  const modal = document.getElementById("bookmarks-modal");
  if (modal !== null) {
    document.body.appendChild(modal);
  }
}

// The main process
function ebBookmarksProcess() {
  "use strict";

  // Set the sessionDate
  ebBookmarksSessionDate();

  // Create the fingerprint index
  ebBookmarksCreateFingerprintIndex();

  // Move the modal
  ebBookmarksMoveModal();

  // Show the bookmarks controls
  const bookmarksControls = document.querySelector(".bookmarks");
  if (bookmarksControls !== null) {
    bookmarksControls.classList.remove("visuallyhidden");
  }
  ebBookmarksOpenOnClick();
  ebBookmarkListsOpenOnClick();
  ebBookmarksCloseWithEscape();

  // Mark which elements are available for bookmarking
  ebBookmarksMarkVisibleElements(ebBookmarkableElements());
  ebBookmarksAddButtons(ebBookmarkableElements());

  // Check for bookmarks
  ebBookmarksCheckForBookmarks();

  // Store the last location.
  // We might have done this on beforeunload, when user leaves page,
  // but that isn't supported on many mobile browsers, and may
  // prevent browsers from using in-memory page navigation caches.
  // So we set the lastLocation every 5 seconds.
  window.setInterval(ebBookmarksSetLastLocation, 5000);

  // Listen for text selections for bookmarking
  ebBookmarksListenForTextSelection();
}

// Start bookmarking
function ebBookmarksInit() {
  "use strict";
  // Check for support before running the main process
  if (ebBookmarksSupport()) {
    ebBookmarksProcess();
  }
}

// Wait for IDs and fingerprints to be loaded
// and IDs to be assigned
// before applying the accordion.
function ebPrepareForBookmarks() {
  "use strict";

  const bookmarksObserver = new MutationObserver(function (mutations) {
    let readyForBookmarks = false;
    mutations.forEach(function (mutation) {
      if (mutation.type === "attributes" && readyForBookmarks === false) {
        if (
          document.body.getAttribute("data-ids-assigned") &&
          document.body.getAttribute("data-fingerprints-assigned")
        ) {
          readyForBookmarks = true;
          ebBookmarksInit();
          bookmarksObserver.disconnect();
        }
      }
    });
  });

  bookmarksObserver.observe(document.body, {
    attributes: true, // listen for attribute changes
  });
}

if (settings.web.bookmarks.enabled) {
  window.onload = ebPrepareForBookmarks();
}

var ebIndexTargets = [
  [
    {
      entrySlug: "india",
      entryText: "India",
      entryTree: '["India"]',
      id: "india--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "indian-subcontinent",
      entryText: "Indian subcontinent",
      entryTree: '["Indian subcontinent"]',
      id: "indian-subcontinent--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "bengal",
      entryText: "Bengal",
      entryTree: '["Bengal"]',
      id: "bengal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "ibn-battuta",
      entryText: "Ibn Battuta",
      entryTree: '["Ibn Battuta"]',
      id: "ibn-battuta--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "polo-marco",
      entryText: "Polo, Marco",
      entryTree: '["Polo, Marco"]',
      id: "polo-marco--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "tavernier-jean-baptiste",
      entryText: "Tavernier, Jean Baptiste",
      entryTree: '["Tavernier, Jean Baptiste"]',
      id: "tavernier-jean-baptiste--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "living-standards--in-middle-ages",
      entryText: "in Middle Ages",
      entryTree: '["living standards","","in Middle Ages"]',
      id: "living-standards--in-middle-ages--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "india--living-standards",
      entryText: "living standards",
      entryTree: '["India","","living standards"]',
      id: "india--living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
    {
      entrySlug: "ibn-battuta",
      entryText: "Ibn Battuta",
      entryTree: '["Ibn Battuta"]',
      id: "ibn-battuta--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-01-ibn-battuta.html",
    },
  ],
  [
    {
      entrySlug: "gdp-gross-domestic-product",
      entryText: "GDP (gross domestic product)",
      entryTree: '["GDP (gross domestic product)"]',
      id: "gdp-gross-domestic-product--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "hockey-stick-of-history",
      entryText: "hockey stick of history",
      entryTree: '["hockey stick of history"]',
      id: "hockey-stick-of-history--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "purchasing-power-parity-ppp",
      entryText: "purchasing power parity (PPP)",
      entryTree: '["purchasing power parity (PPP)"]',
      id: "purchasing-power-parity-ppp--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "living-standards",
      entryText: "living standards",
      entryTree: '["living standards"]',
      id: "living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "coyle-diane",
      entryText: "Coyle, Diane",
      entryTree: '["Coyle, Diane"]',
      id: "coyle-diane--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "gdp-gross-domestic-product--and-living-standards",
      entryText: "and living standards",
      entryTree: '["GDP (gross domestic product)","","and living standards"]',
      id: "gdp-gross-domestic-product--and-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "nigeria--hockey-stick",
      entryText: "hockey stick",
      entryTree: '["Nigeria","","hockey stick"]',
      id: "nigeria--hockey-stick--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "nigeria--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["Nigeria","","GDP per capita"]',
      id: "nigeria--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "latin-america--living-standards",
      entryText: "living standards",
      entryTree: '["Latin America","","living standards"]',
      id: "latin-america--living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "china--hockey-stick",
      entryText: "hockey stick",
      entryTree: '["China","","hockey stick"]',
      id: "china--hockey-stick--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "china--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["China","","GDP per capita"]',
      id: "china--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "japan--hockey-stick",
      entryText: "hockey stick",
      entryTree: '["Japan","","hockey stick"]',
      id: "japan--hockey-stick--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "india--hockey-stick",
      entryText: "hockey stick",
      entryTree: '["India","","hockey stick"]',
      id: "india--hockey-stick--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "india--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["India","","GDP per capita"]',
      id: "india--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "united-kingdom--hockey-stick",
      entryText: "hockey stick",
      entryTree: '["United Kingdom","","hockey stick"]',
      id: "united-kingdom--hockey-stick--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "united-kingdom--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["United Kingdom","","GDP per capita"]',
      id: "united-kingdom--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "maddison-angus",
      entryText: "Maddison, Angus",
      entryTree: '["Maddison, Angus"]',
      id: "maddison-angus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "smith-adam--wealth-of-nations",
      entryText: "*Wealth of Nations*",
      entryTree: '["Smith, Adam","","*Wealth of Nations*"]',
      id: "smith-adam--wealth-of-nations--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "smith-adam--the-theory-of-moral-sentiments",
      entryText: "*The Theory of Moral Sentiments*",
      entryTree: '["Smith, Adam","","*The Theory of Moral Sentiments*"]',
      id: "smith-adam--the-theory-of-moral-sentiments--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "smith-adam--invisible-hand-of-the-market",
      entryText: "'invisible hand of the market'",
      entryTree: '["Smith, Adam","","\'invisible hand of the market\'"]',
      id: "smith-adam--invisible-hand-of-the-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "smith-adam",
      entryText: "Smith, Adam",
      entryTree: '["Smith, Adam"]',
      id: "smith-adam--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "self-interest",
      entryText: "self-interest",
      entryTree: '["self-interest"]',
      id: "self-interest--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "division-of-labour",
      entryText: "division of labour",
      entryTree: '["division of labour"]',
      id: "division-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "invisible-hand-of-the-market",
      entryText: "'invisible hand of the market'",
      entryTree: "[\"'invisible hand of the market'\"]",
      id: "invisible-hand-of-the-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "smith-adam",
      entryText: "Smith, Adam",
      entryTree: '["Smith, Adam"]',
      id: "smith-adam--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "wellbeing-measure",
      entryText: "wellbeing measure",
      entryTree: '["wellbeing measure"]',
      id: "wellbeing-measure--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "living-standards--average",
      entryText: "'average'",
      entryTree: '["living standards","","\'average\'"]',
      id: "living-standards--average--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "living-standards",
      entryText: "living standards",
      entryTree: '["living standards"]',
      id: "living-standards--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "income-distribution--and-wellbeing",
      entryText: "and wellbeing",
      entryTree: '["income distribution","","and wellbeing"]',
      id: "income-distribution--and-wellbeing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "output",
      entryText: "output",
      entryTree: '["output"]',
      id: "output--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "natural-resources",
      entryText: "natural resources",
      entryTree: '["natural resources"]',
      id: "natural-resources--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "indonesia--resource-depletion",
      entryText: "resource depletion",
      entryTree: '["Indonesia","","resource depletion"]',
      id: "indonesia--resource-depletion--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
    {
      entrySlug: "indonesia--growth",
      entryText: "growth",
      entryTree: '["Indonesia","","growth"]',
      id: "indonesia--growth--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-02-historys-hockey-stick.html",
    },
  ],
  [
    {
      entrySlug: "environment-and-economy",
      entryText: "environment, and economy",
      entryTree: '["environment, and economy"]',
      id: "environment-and-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "climate-change--fossil-fuels-and",
      entryText: "fossil fuels and",
      entryTree: '["climate change","","fossil fuels and"]',
      id: "climate-change--fossil-fuels-and--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "climate-change",
      entryText: "climate change",
      entryTree: '["climate change"]',
      id: "climate-change--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "mount-tambora-eruption-1815",
      entryText: "Mount Tambora eruption, 1815",
      entryTree: '["Mount Tambora eruption, 1815"]',
      id: "mount-tambora-eruption-1815--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "indonesia--mount-tambora-eruption-1815",
      entryText: "Mount Tambora eruption, 1815",
      entryTree: '["Indonesia","","Mount Tambora eruption, 1815"]',
      id: "indonesia--mount-tambora-eruption-1815--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "greenhouse-gases",
      entryText: "greenhouse gases",
      entryTree: '["greenhouse gases"]',
      id: "greenhouse-gases--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "global-warming",
      entryText: "global warming",
      entryTree: '["global warming"]',
      id: "global-warming--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
    {
      entrySlug: "climate-change",
      entryText: "climate change",
      entryTree: '["climate change"]',
      id: "climate-change--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-03-climate-change.html",
    },
  ],
  [
    {
      entrySlug: "inequality--across-the-world",
      entryText: "across the world",
      entryTree: '["inequality","","across the world"]',
      id: "inequality--across-the-world--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "united-arab-emirates-uae--average-income",
      entryText: "average income",
      entryTree: '["United Arab Emirates (UAE)","","average income"]',
      id: "united-arab-emirates-uae--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "south-sudan--average-income",
      entryText: "average income",
      entryTree: '["South Sudan","","average income"]',
      id: "south-sudan--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "india--average-income",
      entryText: "average income",
      entryTree: '["India","","average income"]',
      id: "india--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "united-kingdom--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["United Kingdom","","GDP per capita"]',
      id: "united-kingdom--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "china--average-income",
      entryText: "average income",
      entryTree: '["China","","average income"]',
      id: "china--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "income--within-country-distribution",
      entryText: "within-country distribution",
      entryTree: '["income","","within-country distribution"]',
      id: "income--within-country-distribution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "income--global-distribution",
      entryText: "global distribution",
      entryTree: '["income","","global distribution"]',
      id: "income--global-distribution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "income--historical-trends",
      entryText: "historical trends",
      entryTree: '["income","","historical trends"]',
      id: "income--historical-trends--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "income--inequality",
      entryText: "inequality",
      entryTree: '["income","","inequality"]',
      id: "income--inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "income--country-comparisons",
      entryText: "country comparisons",
      entryTree: '["income","","country comparisons"]',
      id: "income--country-comparisons--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "purchasing-power-parity-ppp--definition",
      entryText: "definition",
      entryTree: '["purchasing power parity (PPP)","","definition"]',
      id: "purchasing-power-parity-ppp--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "decile--definition",
      entryText: "definition",
      entryTree: '["decile","","definition"]',
      id: "decile--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "norway--equality",
      entryText: "equality",
      entryTree: '["Norway","","equality"]',
      id: "norway--equality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "norway--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["Norway","","GDP per capita"]',
      id: "norway--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "russia--average-income",
      entryText: "average income",
      entryTree: '["Russia","","average income"]',
      id: "russia--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "brazil--average-income",
      entryText: "average income",
      entryTree: '["Brazil","","average income"]',
      id: "brazil--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "south-africa--average-income",
      entryText: "average income",
      entryTree: '["South Africa","","average income"]',
      id: "south-africa--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "indonesia--average-income",
      entryText: "average income",
      entryTree: '["Indonesia","","average income"]',
      id: "indonesia--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "nigeria--average-income",
      entryText: "average income",
      entryTree: '["Nigeria","","average income"]',
      id: "nigeria--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "india--average-income",
      entryText: "average income",
      entryTree: '["India","","average income"]',
      id: "india--average-income--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "venezuela--average-income",
      entryText: "average income",
      entryTree: '["Venezuela","","average income"]',
      id: "venezuela--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "somalia--average-income",
      entryText: "average income",
      entryTree: '["Somalia","","average income"]',
      id: "somalia--average-income--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "richpoor-ratio",
      entryText: "rich/poor ratio",
      entryTree: '["rich/poor ratio"]',
      id: "richpoor-ratio--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
    {
      entrySlug: "living-standards--in-middle-ages",
      entryText: "in Middle Ages",
      entryTree: '["living standards","","in Middle Ages"]',
      id: "living-standards--in-middle-ages--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-04-income-inequality.html",
    },
  ],
  [
    {
      entrySlug: "star-trek",
      entryText: "*Star Trek*",
      entryTree: '["*Star Trek*"]',
      id: "star-trek--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "bacon-francis--new-atlantis",
      entryText: "*New Atlantis*",
      entryTree: '["Bacon, Francis","","*New Atlantis*"]',
      id: "bacon-francis--new-atlantis--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "technological-progress--definition",
      entryText: "definition",
      entryTree: '["technological progress","","definition"]',
      id: "technological-progress--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "technology--definition",
      entryText: "definition",
      entryTree: '["technology","","definition"]',
      id: "technology--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["Industrial Revolution"]',
      id: "industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "lighting-technology",
      entryText: "lighting technology",
      entryTree: '["lighting technology"]',
      id: "lighting-technology--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "landes-david",
      entryText: "Landes, David",
      entryTree: '["Landes, David"]',
      id: "landes-david--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "steam-engine",
      entryText: "steam engine",
      entryTree: '["steam engine"]',
      id: "steam-engine--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "watt-james",
      entryText: "Watt, James",
      entryTree: '["Watt, James"]',
      id: "watt-james--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-05-technological-revolution.html",
    },
  ],
  [
    {
      entrySlug: "italy--preindustrial-labour-force",
      entryText: "preindustrial labour force",
      entryTree: '["Italy","","preindustrial labour force"]',
      id: "italy--preindustrial-labour-force--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "technological-progress--and-living-standards",
      entryText: "and living standards",
      entryTree: '["technological progress","","and living standards"]',
      id: "technological-progress--and-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "living-standards--and-technological-progress",
      entryText: "and technological progress",
      entryTree: '["living standards","","and technological progress"]',
      id: "living-standards--and-technological-progress--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "malthusian-economic-theory--diminishing-product-of-labour",
      entryText: "diminishing product of labour",
      entryTree: '["Malthusian economic theory","","diminishing product of labour"]',
      id: "malthusian-economic-theory--diminishing-product-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "malthus-thomas-robert--an-essay-on-the-principle-of-population",
      entryText: "*An Essay on the Principle of Population*",
      entryTree: '["Malthus, Thomas Robert","","*An Essay on the Principle of Population*"]',
      id: "malthus-thomas-robert--an-essay-on-the-principle-of-population--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "factor-of-production--definition",
      entryText: "definition",
      entryTree: '["factor of production","","definition"]',
      id: "factor-of-production--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "average-product-of-labour--definition",
      entryText: "definition",
      entryTree: '["average product of labour","","definition"]',
      id: "average-product-of-labour--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "production-function",
      entryText: "production function",
      entryTree: '["production function"]',
      id: "production-function--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
    {
      entrySlug: "production-function",
      entryText: "production function",
      entryTree: '["production function"]',
      id: "production-function--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-06-production-function.html",
    },
  ],
  [
    {
      entrySlug: "population--and-malthus",
      entryText: "and Malthus",
      entryTree: '["population","","and Malthus"]',
      id: "population--and-malthus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "living-standards--and-population",
      entryText: "and population",
      entryTree: '["living standards","","and population"]',
      id: "living-standards--and-population--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "poverty-trap",
      entryText: "poverty trap",
      entryTree: '["poverty trap"]',
      id: "poverty-trap--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "malthusian-trap",
      entryText: "Malthusian trap",
      entryTree: '["Malthusian trap"]',
      id: "malthusian-trap--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "cantillon-richard",
      entryText: "Cantillon, Richard",
      entryTree: '["Cantillon, Richard"]',
      id: "cantillon-richard--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "subsistence-level--definition",
      entryText: "definition",
      entryTree: '["subsistence level","","definition"]',
      id: "subsistence-level--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "average-product-of-labour",
      entryText: "average product of labour",
      entryTree: '["average product of labour"]',
      id: "average-product-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "equilibrium--definition",
      entryText: "definition",
      entryTree: '["equilibrium","","definition"]',
      id: "equilibrium--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "malthusian-economic-theory--effect-of-technological-improvement",
      entryText: "effect of technological improvement",
      entryTree: '["Malthusian economic theory","","effect of technological improvement"]',
      id: "malthusian-economic-theory--effect-of-technological-improvement--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "malthuss-law",
      entryText: "Malthus's law",
      entryTree: '["Malthus\'s law"]',
      id: "malthuss-law--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "living-standards--and-population",
      entryText: "and population",
      entryTree: '["living standards","","and population"]',
      id: "living-standards--and-population--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "bubonic-plague",
      entryText: "bubonic plague",
      entryTree: '["bubonic plague"]',
      id: "bubonic-plague--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "plague-pandemic-13th-century",
      entryText: "plague pandemic, 13th century",
      entryTree: '["plague pandemic, 13th century"]',
      id: "plague-pandemic-13th-century--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "black-death",
      entryText: "Black Death",
      entryTree: '["Black Death"]',
      id: "black-death--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "united-kingdom--black-death",
      entryText: "Black Death",
      entryTree: '["United Kingdom","","Black Death"]',
      id: "united-kingdom--black-death--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "malthusian-trap",
      entryText: "Malthusian trap",
      entryTree: '["Malthusian trap"]',
      id: "malthusian-trap--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
    {
      entrySlug: "united-kingdom--productivity",
      entryText: "productivity",
      entryTree: '["United Kingdom","","productivity"]',
      id: "united-kingdom--productivity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-07-malthusian-trap.html",
    },
  ],
  [
    {
      entrySlug: "capitalism--definition",
      entryText: "definition",
      entryTree: '["capitalism","","definition"]',
      id: "capitalism--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "capitalism--as-an-economic-system",
      entryText: "as an economic system",
      entryTree: '["capitalism","","as an economic system"]',
      id: "capitalism--as-an-economic-system--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "capitalism",
      entryText: "capitalism",
      entryTree: '["capitalism"]',
      id: "capitalism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "institutions--definition",
      entryText: "definition",
      entryTree: '["institutions","","definition"]',
      id: "institutions--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "economic-system--definition",
      entryText: "definition",
      entryTree: '["economic system","","definition"]',
      id: "economic-system--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "property--private",
      entryText: "private",
      entryTree: '["property","","private"]',
      id: "property--private--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "markets--and-private-property",
      entryText: "and private property",
      entryTree: '["markets","","and private property"]',
      id: "markets--and-private-property--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "markets--definition",
      entryText: "definition",
      entryTree: '["markets","","definition"]',
      id: "markets--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "competition--and-price-setting",
      entryText: "and price-setting",
      entryTree: '["competition","","and price-setting"]',
      id: "competition--and-price-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "gains--from-exchange",
      entryText: "from exchange",
      entryTree: '["gains","","from exchange"]',
      id: "gains--from-exchange--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "reciprocity",
      entryText: "reciprocity",
      entryTree: '["reciprocity"]',
      id: "reciprocity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "firms--definition",
      entryText: "definition",
      entryTree: '["firms","","definition"]',
      id: "firms--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "labour-market",
      entryText: "labour market",
      entryTree: '["labour market"]',
      id: "labour-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "capital--goods",
      entryText: "goods",
      entryTree: '["capital","","goods"]',
      id: "capital--goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "central-planning--soviet-union",
      entryText: "Soviet Union",
      entryTree: '["central planning","","Soviet Union"]',
      id: "central-planning--soviet-union--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "central-planning",
      entryText: "central planning",
      entryTree: '["central planning"]',
      id: "central-planning--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "east-germany",
      entryText: "East Germany",
      entryTree: '["East Germany"]',
      id: "east-germany--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "soviet-union--central-planning",
      entryText: "central planning",
      entryTree: '["Soviet Union","","central planning"]',
      id: "soviet-union--central-planning--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "slave-economy",
      entryText: "slave economy",
      entryTree: '["slave economy"]',
      id: "slave-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "firms--life-cycle",
      entryText: "life cycle",
      entryTree: '["firms","","life cycle"]',
      id: "firms--life-cycle--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "firms--and-power",
      entryText: "and power",
      entryTree: '["firms","","and power"]',
      id: "firms--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "capitalism--and-power",
      entryText: "and power",
      entryTree: '["capitalism","","and power"]',
      id: "capitalism--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "living-standards--and-capitalism",
      entryText: "and capitalism",
      entryTree: '["living standards","","and capitalism"]',
      id: "living-standards--and-capitalism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "capitalism--and-living-standards",
      entryText: "and living standards",
      entryTree: '["capitalism","","and living standards"]',
      id: "capitalism--and-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "technological-progress--and-competition",
      entryText: "and competition",
      entryTree: '["technological progress","","and competition"]',
      id: "technological-progress--and-competition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "specialization--disadvantages-of",
      entryText: "disadvantages of",
      entryTree: '["specialization","","disadvantages of"]',
      id: "specialization--disadvantages-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "smith-adam--two-views-on-the-division-of-labour",
      entryText: "*Two Views on the Division of Labour*",
      entryTree: '["Smith, Adam","","*Two Views on the Division of Labour*"]',
      id: "smith-adam--two-views-on-the-division-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
    {
      entrySlug: "smith-adam--and-division-of-labour",
      entryText: "and division of labour",
      entryTree: '["Smith, Adam","","and division of labour"]',
      id: "smith-adam--and-division-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-08-capitalist-institutions.html",
    },
  ],
  [
    {
      entrySlug: "agriculture-to-manufacturing-transition",
      entryText: "agriculture to manufacturing transition",
      entryTree: '["agriculture to manufacturing transition"]',
      id: "agriculture-to-manufacturing-transition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "china--agriculture-to-manufacturing-transition",
      entryText: "agriculture to manufacturing transition",
      entryTree: '["China","","agriculture to manufacturing transition"]',
      id: "china--agriculture-to-manufacturing-transition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "india--agriculture-to-manufacturing-transition",
      entryText: "agriculture to manufacturing transition",
      entryTree: '["India","","agriculture to manufacturing transition"]',
      id: "india--agriculture-to-manufacturing-transition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "italy--agriculture-to-manufacturing-transition",
      entryText: "agriculture to manufacturing transition",
      entryTree: '["Italy","","agriculture to manufacturing transition"]',
      id: "italy--agriculture-to-manufacturing-transition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "france--agriculture-to-manufacturing-transition",
      entryText: "agriculture to manufacturing transition",
      entryTree: '["France","","agriculture to manufacturing transition"]',
      id: "france--agriculture-to-manufacturing-transition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "netherlands--agriculture-to-manufacturing-transition",
      entryText: "agriculture to manufacturing transition",
      entryTree: '["Netherlands","","agriculture to manufacturing transition"]',
      id: "netherlands--agriculture-to-manufacturing-transition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "china--agrarian-economy",
      entryText: "agrarian economy",
      entryTree: '["China","","agrarian economy"]',
      id: "china--agrarian-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "india--agrarian-economy",
      entryText: "agrarian economy",
      entryTree: '["India","","agrarian economy"]',
      id: "india--agrarian-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "lewis-arthur",
      entryText: "Lewis, Arthur",
      entryTree: '["Lewis, Arthur"]',
      id: "lewis-arthur--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "lewis-model",
      entryText: "Lewis model",
      entryTree: '["Lewis model"]',
      id: "lewis-model--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
    {
      entrySlug: "lewis-model",
      entryText: "Lewis model",
      entryTree: '["Lewis model"]',
      id: "lewis-model--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-09-structural-transformation.html",
    },
  ],
  [
    {
      entrySlug: "enlightenment",
      entryText: "Enlightenment",
      entryTree: '["Enlightenment"]',
      id: "enlightenment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "causality--definition",
      entryText: "definition",
      entryTree: '["causality","","definition"]',
      id: "causality--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "experiments--behavioural",
      entryText: "behavioural",
      entryTree: '["experiments","","behavioural"]',
      id: "experiments--behavioural--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "experiments--natural",
      entryText: "natural",
      entryTree: '["experiments","","natural"]',
      id: "experiments--natural--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "germany--division-of",
      entryText: "division of",
      entryTree: '["Germany","","division of"]',
      id: "germany--division-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "central-planning--eastern-europe",
      entryText: "Eastern Europe",
      entryTree: '["central planning","","Eastern Europe"]',
      id: "central-planning--eastern-europe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "central-planning--during-second-world-war",
      entryText: "during Second World War",
      entryTree: '["central planning","","during Second World War"]',
      id: "central-planning--during-second-world-war--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "germany--prewar-condition",
      entryText: "prewar condition",
      entryTree: '["Germany","","prewar condition"]',
      id: "germany--prewar-condition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "east-germany",
      entryText: "East Germany",
      entryTree: '["East Germany"]',
      id: "east-germany--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "germany--economic-performance",
      entryText: "economic performance",
      entryTree: '["Germany","","economic performance"]',
      id: "germany--economic-performance--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "germany--berlin-wall",
      entryText: "Berlin Wall",
      entryTree: '["Germany","","Berlin Wall"]',
      id: "germany--berlin-wall--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "spain--economic-performance",
      entryText: "economic performance",
      entryTree: '["Spain","","economic performance"]',
      id: "spain--economic-performance--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "japan--economic-performance",
      entryText: "economic performance",
      entryTree: '["Japan","","economic performance"]',
      id: "japan--economic-performance--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
    {
      entrySlug: "central-planning--during-second-world-war",
      entryText: "during Second World War",
      entryTree: '["central planning","","during Second World War"]',
      id: "central-planning--during-second-world-war--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-10-capitalism-causation.html",
    },
  ],
  [
    {
      entrySlug: "india--textile-industry",
      entryText: "textile industry",
      entryTree: '["India","","textile industry"]',
      id: "india--textile-industry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "india--cotton-trade",
      entryText: "cotton trade",
      entryTree: '["India","","cotton trade"]',
      id: "india--cotton-trade--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "india--british-colonization-of",
      entryText: "British colonization of",
      entryTree: '["India","","British colonization of"]',
      id: "india--british-colonization-of--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "defoe-daniel",
      entryText: "Defoe, Daniel",
      entryTree: '["Defoe, Daniel"]',
      id: "defoe-daniel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "deaton-angus",
      entryText: "Deaton, Angus",
      entryTree: '["Deaton, Angus"]',
      id: "deaton-angus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "india--agrarian-economy",
      entryText: "agrarian economy",
      entryTree: '["India","","agrarian economy"]',
      id: "india--agrarian-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "japan--economic-performance",
      entryText: "economic performance",
      entryTree: '["Japan","","economic performance"]',
      id: "japan--economic-performance--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "india--british-colonization-of",
      entryText: "British colonization of",
      entryTree: '["India","","British colonization of"]',
      id: "india--british-colonization-of--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "china--foreign-intervention",
      entryText: "foreign intervention",
      entryTree: '["China","","foreign intervention"]',
      id: "china--foreign-intervention--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
    {
      entrySlug: "asia--share-of-world-output",
      entryText: "share of world output",
      entryTree: '["Asia","","share of world output"]',
      id: "asia--share-of-world-output--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-11-british-colonization-india.html",
    },
  ],
  [
    {
      entrySlug: "nigeria--institutions",
      entryText: "institutions",
      entryTree: '["Nigeria","","institutions"]',
      id: "nigeria--institutions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "botswana",
      entryText: "Botswana",
      entryTree: '["Botswana"]',
      id: "botswana--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "institutions--and-economic-performance",
      entryText: "and economic performance",
      entryTree: '["institutions","","and economic performance"]',
      id: "institutions--and-economic-performance--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "capitalism--varieties-of",
      entryText: "varieties of",
      entryTree: '["capitalism","","varieties of"]',
      id: "capitalism--varieties-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "south-korea",
      entryText: "South Korea",
      entryTree: '["South Korea"]',
      id: "south-korea--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "developmental-state--definition",
      entryText: "definition",
      entryTree: '["developmental state","","definition"]',
      id: "developmental-state--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "government--and-economic-performance",
      entryText: "and economic performance",
      entryTree: '["government","","and economic performance"]',
      id: "government--and-economic-performance--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "south-korea--gdp",
      entryText: "GDP",
      entryTree: '["South Korea","","GDP"]',
      id: "south-korea--gdp--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "brazil",
      entryText: "Brazil",
      entryTree: '["Brazil"]',
      id: "brazil--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "argentina",
      entryText: "Argentina",
      entryTree: '["Argentina"]',
      id: "argentina--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "soviet-union",
      entryText: "Soviet Union",
      entryTree: '["Soviet Union"]',
      id: "soviet-union--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "east-germany",
      entryText: "East Germany",
      entryTree: '["East Germany"]',
      id: "east-germany--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "central-planning--eastern-europe",
      entryText: "Eastern Europe",
      entryTree: '["central planning","","Eastern Europe"]',
      id: "central-planning--eastern-europe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "capitalism--economic-conditions-for",
      entryText: "economic conditions for",
      entryTree: '["capitalism","","economic conditions for"]',
      id: "capitalism--economic-conditions-for--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "property--private",
      entryText: "private",
      entryTree: '["property","","private"]',
      id: "property--private--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "firms--and-competition",
      entryText: "and competition",
      entryTree: '["firms","","and competition"]',
      id: "firms--and-competition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "government--and-economic-performance",
      entryText: "and economic performance",
      entryTree: '["government","","and economic performance"]',
      id: "government--and-economic-performance--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "capitalism--political-conditions-for",
      entryText: "political conditions for",
      entryTree: '["capitalism","","political conditions for"]',
      id: "capitalism--political-conditions-for--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "democracy--definition",
      entryText: "definition",
      entryTree: '["democracy","","definition"]',
      id: "democracy--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "political-systems--definition",
      entryText: "definition",
      entryTree: '["political systems","","definition"]',
      id: "political-systems--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
    {
      entrySlug: "democracy--varieties-of",
      entryText: "varieties of",
      entryTree: '["democracy","","varieties of"]',
      id: "democracy--varieties-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-12-capitalism-varieties.html",
    },
  ],
  [
    {
      entrySlug: "biosphere",
      entryText: "biosphere",
      entryTree: '["biosphere"]',
      id: "biosphere--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "environment-and-economy",
      entryText: "environment, and economy",
      entryTree: '["environment, and economy"]',
      id: "environment-and-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "economics-definition",
      entryText: "economics, definition",
      entryTree: '["economics, definition"]',
      id: "economics-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "resources--depletion-of",
      entryText: "depletion of",
      entryTree: '["resources","","depletion of"]',
      id: "resources--depletion-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "resources--environmental",
      entryText: "environmental",
      entryTree: '["resources","","environmental"]',
      id: "resources--environmental--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "resources--flows-of",
      entryText: "flows of",
      entryTree: '["resources","","flows of"]',
      id: "resources--flows-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "world-wildlife-fund--living-planet-report-2020",
      entryText: "*Living Planet Report 2020*",
      entryTree: '["World Wildlife Fund","","*Living Planet Report 2020*"]',
      id: "world-wildlife-fund--living-planet-report-2020--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "ecological-footprint-human",
      entryText: "ecological footprint, human",
      entryTree: '["ecological footprint, human"]',
      id: "ecological-footprint-human--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "biodiversity-loss",
      entryText: "biodiversity loss",
      entryTree: '["biodiversity loss"]',
      id: "biodiversity-loss--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "technological-progress--and-environmental-damage",
      entryText: "and environmental damage",
      entryTree: '["technological progress","","and environmental damage"]',
      id: "technological-progress--and-environmental-damage--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "grand-banks-cod-fishery",
      entryText: "Grand Banks cod fishery",
      entryTree: '["Grand Banks cod fishery"]',
      id: "grand-banks-cod-fishery--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "natural-resources",
      entryText: "natural resources",
      entryTree: '["natural resources"]',
      id: "natural-resources--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "pollution--mitigation-attempts",
      entryText: "mitigation attempts",
      entryTree: '["pollution","","mitigation attempts"]',
      id: "pollution--mitigation-attempts--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "emissions--control-of",
      entryText: "control of",
      entryTree: '["emissions","","control of"]',
      id: "emissions--control-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "natural-resources",
      entryText: "natural resources",
      entryTree: '["natural resources"]',
      id: "natural-resources--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "pollution--eastern-europe",
      entryText: "Eastern Europe",
      entryTree: '["pollution","","Eastern Europe"]',
      id: "pollution--eastern-europe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "central-planning--eastern-europe",
      entryText: "Eastern Europe",
      entryTree: '["central planning","","Eastern Europe"]',
      id: "central-planning--eastern-europe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
    {
      entrySlug: "eastern-europe",
      entryText: "Eastern Europe",
      entryTree: '["Eastern Europe"]',
      id: "eastern-europe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "01-prosperity-inequality-13-economics-biosphere.html",
    },
  ],
  [
    {
      entrySlug: "automation-custom-made-suit-case-study",
      entryText: "automation, custom-made suit case study",
      entryTree: '["automation, custom-made suit case study"]',
      id: "automation-custom-made-suit-case-study--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["Industrial Revolution"]',
      id: "industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "automation-custom-made-suit-case-study",
      entryText: "automation, custom-made suit case study",
      entryTree: '["automation, custom-made suit case study"]',
      id: "automation-custom-made-suit-case-study--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "hargreaves-james",
      entryText: "Hargreaves, James",
      entryTree: '["Hargreaves, James"]',
      id: "hargreaves-james--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "spinnng-jenny",
      entryText: "spinnng jenny",
      entryTree: '["spinnng jenny"]',
      id: "spinnng-jenny--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "kay-john",
      entryText: "Kay, John",
      entryTree: '["Kay, John"]',
      id: "kay-john--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "malthusian-trap",
      entryText: "Malthusian trap",
      entryTree: '["Malthusian trap"]',
      id: "malthusian-trap--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "coal",
      entryText: "coal",
      entryTree: '["coal"]',
      id: "coal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "malthusian-trap",
      entryText: "Malthusian trap",
      entryTree: '["Malthusian trap"]',
      id: "malthusian-trap--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "united-kingdom--agrarian-economy",
      entryText: "agrarian economy",
      entryTree: '["United Kingdom","","agrarian economy"]',
      id: "united-kingdom--agrarian-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "ireland-potato-famine",
      entryText: "Ireland, potato famine",
      entryTree: '["Ireland, potato famine"]',
      id: "ireland-potato-famine--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "senior-nassau",
      entryText: "Senior, Nassau",
      entryTree: '["Senior, Nassau"]',
      id: "senior-nassau--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "united-kingdom--living-standards",
      entryText: "living standards",
      entryTree: '["United Kingdom","","living standards"]',
      id: "united-kingdom--living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "united-kingdom--wage-rises",
      entryText: "wage rises",
      entryTree: '["United Kingdom","","wage rises"]',
      id: "united-kingdom--wage-rises--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "technological-progress--and-living-standards",
      entryText: "and living standards",
      entryTree: '["technological progress","","and living standards"]',
      id: "technological-progress--and-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "living-standards--and-technological-progress",
      entryText: "and technological progress",
      entryTree: '["living standards","","and technological progress"]',
      id: "living-standards--and-technological-progress--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
    {
      entrySlug: "wages--real",
      entryText: "real",
      entryTree: '["wages","","real"]',
      id: "wages--real--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-01-kutesmart-tailoring.html",
    },
  ],
  [
    {
      entrySlug: "reservation-option--definition",
      entryText: "definition",
      entryTree: '["reservation option","","definition"]',
      id: "reservation-option--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "opportunity-cost",
      entryText: "opportunity cost",
      entryTree: '["opportunity cost"]',
      id: "opportunity-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "economic-cost-definition",
      entryText: "economic cost, definition",
      entryTree: '["economic cost, definition"]',
      id: "economic-cost-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "economic-rent--definition",
      entryText: "definition",
      entryTree: '["economic rent","","definition"]',
      id: "economic-rent--definition--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "economic-rent--definition",
      entryText: "definition",
      entryTree: '["economic rent","","definition"]',
      id: "economic-rent--definition--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "innovation-rents",
      entryText: "innovation rents",
      entryTree: '["innovation rents"]',
      id: "innovation-rents--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "incentives--definition",
      entryText: "definition",
      entryTree: '["incentives","","definition"]',
      id: "incentives--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "prices--relative",
      entryText: "relative",
      entryTree: '["prices","","relative"]',
      id: "prices--relative--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
    {
      entrySlug: "prices--relative",
      entryText: "relative",
      entryTree: '["prices","","relative"]',
      id: "prices--relative--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-02-economic-decisions.html",
    },
  ],
  [
    {
      entrySlug: "smith-adam--wealth-of-nations",
      entryText: "*Wealth of Nations*",
      entryTree: '["Smith, Adam","","*Wealth of Nations*"]',
      id: "smith-adam--wealth-of-nations--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "smith-adam--wealth-of-nations",
      entryText: "*Wealth of Nations*",
      entryTree: '["Smith, Adam","","*Wealth of Nations*"]',
      id: "smith-adam--wealth-of-nations--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "economies-of-scale",
      entryText: "economies of scale",
      entryTree: '["economies of scale"]',
      id: "economies-of-scale--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "cambodia",
      entryText: "Cambodia",
      entryTree: '["Cambodia"]',
      id: "cambodia--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "singapore",
      entryText: "Singapore",
      entryTree: '["Singapore"]',
      id: "singapore--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "specialization--advantages-of",
      entryText: "advantages of",
      entryTree: '["specialization","","advantages of"]',
      id: "specialization--advantages-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "comparative-advantage--definition",
      entryText: "definition",
      entryTree: '["comparative advantage","","definition"]',
      id: "comparative-advantage--definition--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "absolute-advantage--definition",
      entryText: "definition",
      entryTree: '["absolute advantage","","definition"]',
      id: "absolute-advantage--definition--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "comparative-advantage--definition",
      entryText: "definition",
      entryTree: '["comparative advantage","","definition"]',
      id: "comparative-advantage--definition--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "absolute-advantage--definition",
      entryText: "definition",
      entryTree: '["absolute advantage","","definition"]',
      id: "absolute-advantage--definition--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "specialization--and-markets",
      entryText: "and markets",
      entryTree: '["specialization","","and markets"]',
      id: "specialization--and-markets--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "division-of-labour--firms-and-markets",
      entryText: "firms and markets",
      entryTree: '["division of labour","","firms and markets"]',
      id: "division-of-labour--firms-and-markets--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "division-of-labour--definition",
      entryText: "definition",
      entryTree: '["division of labour","","definition"]',
      id: "division-of-labour--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "smith-adam--wealth-of-nations",
      entryText: "*Wealth of Nations*",
      entryTree: '["Smith, Adam","","*Wealth of Nations*"]',
      id: "smith-adam--wealth-of-nations--iid-3",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
    {
      entrySlug: "smith-adam--wealth-of-nations",
      entryText: "*Wealth of Nations*",
      entryTree: '["Smith, Adam","","*Wealth of Nations*"]',
      id: "smith-adam--wealth-of-nations--iid-4",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-03-comparative-advantage.html",
    },
  ],
  [
    {
      entrySlug: "technology--definition",
      entryText: "definition",
      entryTree: '["technology","","definition"]',
      id: "technology--definition--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "technology--definition",
      entryText: "definition",
      entryTree: '["technology","","definition"]',
      id: "technology--definition--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "production-function",
      entryText: "production function",
      entryTree: '["production function"]',
      id: "production-function--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "factors-of-production",
      entryText: "factors of production",
      entryTree: '["factors of production"]',
      id: "factors-of-production--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "production-function",
      entryText: "production function",
      entryTree: '["production function"]',
      id: "production-function--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "factors-of-production",
      entryText: "factors of production",
      entryTree: '["factors of production"]',
      id: "factors-of-production--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "fixed-proportions-technology-definition",
      entryText: "fixed-proportions technology, definition",
      entryTree: '["fixed-proportions technology, definition"]',
      id: "fixed-proportions-technology-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "returns-to-scale--constant",
      entryText: "constant",
      entryTree: '["returns to scale","","constant"]',
      id: "returns-to-scale--constant--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "average-product-of-labour",
      entryText: "average product of labour",
      entryTree: '["average product of labour"]',
      id: "average-product-of-labour--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
    {
      entrySlug: "average-product-of-labour",
      entryText: "average product of labour",
      entryTree: '["average product of labour"]',
      id: "average-product-of-labour--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-04-firms-technology-production.html",
    },
  ],
  [
    {
      entrySlug: "isocost-line",
      entryText: "isocost line",
      entryTree: '["isocost line"]',
      id: "isocost-line--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-05-technology-costs.html",
    },
    {
      entrySlug: "isocost-line",
      entryText: "isocost line",
      entryTree: '["isocost line"]',
      id: "isocost-line--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-05-technology-costs.html",
    },
  ],
  [
    {
      entrySlug: "isocost-line",
      entryText: "isocost line",
      entryTree: '["isocost line"]',
      id: "isocost-line--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "innovation--and-profits",
      entryText: "and profits",
      entryTree: '["innovation","","and profits"]',
      id: "innovation--and-profits--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "innovation--and-cost-reduction",
      entryText: "and cost reduction",
      entryTree: '["innovation","","and cost reduction"]',
      id: "innovation--and-cost-reduction--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "innovation--and-cost-reduction",
      entryText: "and cost reduction",
      entryTree: '["innovation","","and cost reduction"]',
      id: "innovation--and-cost-reduction--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "entrepreneur-definition",
      entryText: "entrepreneur, definition",
      entryTree: '["entrepreneur, definition"]',
      id: "entrepreneur-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "innovation-rents",
      entryText: "innovation rents",
      entryTree: '["innovation rents"]',
      id: "innovation-rents--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "innovation-rents",
      entryText: "innovation rents",
      entryTree: '["innovation rents"]',
      id: "innovation-rents--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "creative-destruction",
      entryText: "creative destruction",
      entryTree: '["creative destruction"]',
      id: "creative-destruction--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "schumpeter-joseph",
      entryText: "Schumpeter, Joseph",
      entryTree: '["Schumpeter, Joseph"]',
      id: "schumpeter-joseph--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "evolutionary-economics",
      entryText: "evolutionary economics",
      entryTree: '["evolutionary economics"]',
      id: "evolutionary-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
    {
      entrySlug: "schumpeter-joseph",
      entryText: "Schumpeter, Joseph",
      entryTree: '["Schumpeter, Joseph"]',
      id: "schumpeter-joseph--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-06-innovation-profit.html",
    },
  ],
  [
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "industrial-revolution--causes",
      entryText: "causes",
      entryTree: '["Industrial Revolution","","causes"]',
      id: "industrial-revolution--causes--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "technology--labour-saving",
      entryText: "labour-saving",
      entryTree: '["technology","","labour-saving"]',
      id: "technology--labour-saving--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "spinning-jenny",
      entryText: "spinning jenny",
      entryTree: '["spinning jenny"]',
      id: "spinning-jenny--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "wages--and-incentives",
      entryText: "and incentives",
      entryTree: '["wages","","and incentives"]',
      id: "wages--and-incentives--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "technological-progress--and-costs",
      entryText: "and costs",
      entryTree: '["technological progress","","and costs"]',
      id: "technological-progress--and-costs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "industrial-revolution--and-relative-prices",
      entryText: "and relative prices",
      entryTree: '["Industrial Revolution","","and relative prices"]',
      id: "industrial-revolution--and-relative-prices--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
    {
      entrySlug: "technology--divergence-and-convergence",
      entryText: "divergence and convergence",
      entryTree: '["technology","","divergence and convergence"]',
      id: "technology--divergence-and-convergence--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-07-industrial-revolution-technologies.html",
    },
  ],
  [
    {
      entrySlug: "economic-models--malthusian",
      entryText: "Malthusian",
      entryTree: '["economic models","","Malthusian"]',
      id: "economic-models--malthusian--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "malthusian-economic-theory",
      entryText: "Malthusian economic theory",
      entryTree: '["Malthusian economic theory"]',
      id: "malthusian-economic-theory--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "fisher-irving",
      entryText: "Fisher, Irving",
      entryTree: '["Fisher, Irving"]',
      id: "fisher-irving--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "economic-models",
      entryText: "economic models",
      entryTree: '["economic models"]',
      id: "economic-models--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "samuelson-paul",
      entryText: "Samuelson, Paul",
      entryTree: '["Samuelson, Paul"]',
      id: "samuelson-paul--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "equilibrium--definition",
      entryText: "definition",
      entryTree: '["equilibrium","","definition"]',
      id: "equilibrium--definition--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "fisher-irving",
      entryText: "Fisher, Irving",
      entryTree: '["Fisher, Irving"]',
      id: "fisher-irving--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "population--economic-conditions-for",
      entryText: "economic conditions for",
      entryTree: '["population","","economic conditions for"]',
      id: "population--economic-conditions-for--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "equilibrium--definition",
      entryText: "definition",
      entryTree: '["equilibrium","","definition"]',
      id: "equilibrium--definition--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "exogenous-variables",
      entryText: "exogenous variables",
      entryTree: '["exogenous variables"]',
      id: "exogenous-variables--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "endogenous-variables",
      entryText: "endogenous variables",
      entryTree: '["endogenous variables"]',
      id: "endogenous-variables--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "exogenous-variables",
      entryText: "exogenous variables",
      entryTree: '["exogenous variables"]',
      id: "exogenous-variables--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "endogenous-variables",
      entryText: "endogenous variables",
      entryTree: '["endogenous variables"]',
      id: "endogenous-variables--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "ceteris-paribus",
      entryText: "*ceteris paribus*",
      entryTree: '["*ceteris paribus*"]',
      id: "ceteris-paribus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "mathematics",
      entryText: "mathematics",
      entryTree: '["mathematics"]',
      id: "mathematics--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
    {
      entrySlug: "mathematics",
      entryText: "mathematics",
      entryTree: '["mathematics"]',
      id: "mathematics--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-08-economic-models.html",
    },
  ],
  [
    {
      entrySlug: "india--british-colonization-of",
      entryText: "British colonization of",
      entryTree: '["India","","British colonization of"]',
      id: "india--british-colonization-of--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "india--textile-industry",
      entryText: "textile industry",
      entryTree: '["India","","textile industry"]',
      id: "india--textile-industry--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "india--cotton-trade",
      entryText: "cotton trade",
      entryTree: '["India","","cotton trade"]',
      id: "india--cotton-trade--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "industrial-revolution--textile-industry",
      entryText: "textile industry",
      entryTree: '["Industrial Revolution","","textile industry"]',
      id: "industrial-revolution--textile-industry--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "india--british-colonization-of",
      entryText: "British colonization of",
      entryTree: '["India","","British colonization of"]',
      id: "india--british-colonization-of--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "india--textile-industry",
      entryText: "textile industry",
      entryTree: '["India","","textile industry"]',
      id: "india--textile-industry--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "india--cotton-trade",
      entryText: "cotton trade",
      entryTree: '["India","","cotton trade"]',
      id: "india--cotton-trade--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "industrial-revolution--textile-industry",
      entryText: "textile industry",
      entryTree: '["Industrial Revolution","","textile industry"]',
      id: "industrial-revolution--textile-industry--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "steam-engine",
      entryText: "steam engine",
      entryTree: '["steam engine"]',
      id: "steam-engine--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "united-kingdom--colonialism",
      entryText: "colonialism",
      entryTree: '["United Kingdom","","colonialism"]',
      id: "united-kingdom--colonialism--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "sugar",
      entryText: "sugar",
      entryTree: '["sugar"]',
      id: "sugar--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "slave-labour",
      entryText: "slave labour",
      entryTree: '["slave labour"]',
      id: "slave-labour--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "cotton",
      entryText: "cotton",
      entryTree: '["cotton"]',
      id: "cotton--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "united-kingdom--colonialism",
      entryText: "colonialism",
      entryTree: '["United Kingdom","","colonialism"]',
      id: "united-kingdom--colonialism--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "sugar",
      entryText: "sugar",
      entryTree: '["sugar"]',
      id: "sugar--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "slave-labour",
      entryText: "slave labour",
      entryTree: '["slave labour"]',
      id: "slave-labour--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
    {
      entrySlug: "cotton",
      entryText: "cotton",
      entryTree: '["cotton"]',
      id: "cotton--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-09-industrial-revolution-colonies.html",
    },
  ],
  [
    {
      entrySlug: "average-product-of-labour",
      entryText: "average product of labour",
      entryTree: '["average product of labour"]',
      id: "average-product-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "technology--energy-intensive",
      entryText: "energy-intensive",
      entryTree: '["technology","","energy-intensive"]',
      id: "technology--energy-intensive--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "technology--labour-saving",
      entryText: "labour-saving",
      entryTree: '["technology","","labour-saving"]',
      id: "technology--labour-saving--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "technology--and-the-malthusian-trap",
      entryText: "and the Malthusian trap",
      entryTree: '["technology","","and the Malthusian trap"]',
      id: "technology--and-the-malthusian-trap--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "malthusian-trap--escaping",
      entryText: "escaping",
      entryTree: '["Malthusian trap","","escaping"]',
      id: "malthusian-trap--escaping--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "technological-progress--and-living-standards",
      entryText: "and living standards",
      entryTree: '["technological progress","","and living standards"]',
      id: "technological-progress--and-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "technology--and-wage-increases",
      entryText: "and wage increases",
      entryTree: '["technology","","and wage increases"]',
      id: "technology--and-wage-increases--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "technology--and-the-malthusian-trap",
      entryText: "and the Malthusian trap",
      entryTree: '["technology","","and the Malthusian trap"]',
      id: "technology--and-the-malthusian-trap--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
    {
      entrySlug: "malthusian-trap--escaping",
      entryText: "escaping",
      entryTree: '["Malthusian trap","","escaping"]',
      id: "malthusian-trap--escaping--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-10-malthusian-trap.html",
    },
  ],
  [
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "industrial-revolution--and-energy-use",
      entryText: "and energy use",
      entryTree: '["Industrial Revolution","","and energy use"]',
      id: "industrial-revolution--and-energy-use--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "capitalism--and-climate-change",
      entryText: "and climate change",
      entryTree: '["capitalism","","and climate change"]',
      id: "capitalism--and-climate-change--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "climate-change--fossil-fuels-and",
      entryText: "fossil fuels and",
      entryTree: '["climate change","","fossil fuels and"]',
      id: "climate-change--fossil-fuels-and--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "capitalism--and-living-standards",
      entryText: "and living standards",
      entryTree: '["capitalism","","and living standards"]',
      id: "capitalism--and-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "living-standards--and-capitalism",
      entryText: "and capitalism",
      entryTree: '["living standards","","and capitalism"]',
      id: "living-standards--and-capitalism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "biosphere--human-modification",
      entryText: "human modification",
      entryTree: '["biosphere","","human modification"]',
      id: "biosphere--human-modification--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "co2-carbon-dioxide--flow-of",
      entryText: "flow of",
      entryTree: '["CO2 (carbon dioxide)","","flow of"]',
      id: "co2-carbon-dioxide--flow-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "co2-carbon-dioxide--stock-of",
      entryText: "stock of",
      entryTree: '["CO2 (carbon dioxide)","","stock of"]',
      id: "co2-carbon-dioxide--stock-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "co2-carbon-dioxide",
      entryText: "CO2 (carbon dioxide)",
      entryTree: '["CO2 (carbon dioxide)"]',
      id: "co2-carbon-dioxide--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "bathtub-model",
      entryText: "bathtub model",
      entryTree: '["bathtub model"]',
      id: "bathtub-model--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "amazon--deforestation",
      entryText: "deforestation",
      entryTree: '["Amazon","","deforestation"]',
      id: "amazon--deforestation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "indonesia--deforestation",
      entryText: "deforestation",
      entryTree: '["Indonesia","","deforestation"]',
      id: "indonesia--deforestation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "deforestation",
      entryText: "deforestation",
      entryTree: '["deforestation"]',
      id: "deforestation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "greenhouse-gases--and-rising-living-standards",
      entryText: "and rising living standards",
      entryTree: '["greenhouse gases","","and rising living standards"]',
      id: "greenhouse-gases--and-rising-living-standards--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "technological-progress--and-renewable-energy",
      entryText: "and renewable energy",
      entryTree: '["technological progress","","and renewable energy"]',
      id: "technological-progress--and-renewable-energy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "renewable-energy-sources",
      entryText: "renewable energy sources",
      entryTree: '["renewable energy sources"]',
      id: "renewable-energy-sources--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "emissions--reduction-of",
      entryText: "reduction of",
      entryTree: '["emissions","","reduction of"]',
      id: "emissions--reduction-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "solar-energy",
      entryText: "solar energy",
      entryTree: '["solar energy"]',
      id: "solar-energy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "growth--and-environmental-damage",
      entryText: "and environmental damage",
      entryTree: '["growth","","and environmental damage"]',
      id: "growth--and-environmental-damage--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "technological-progress--and-environmental-damage",
      entryText: "and environmental damage",
      entryTree: '["technological progress","","and environmental damage"]',
      id: "technological-progress--and-environmental-damage--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "capitalism--and-climate-change",
      entryText: "and climate change",
      entryTree: '["capitalism","","and climate change"]',
      id: "capitalism--and-climate-change--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "climate-change--fossil-fuels-and",
      entryText: "fossil fuels and",
      entryTree: '["climate change","","fossil fuels and"]',
      id: "climate-change--fossil-fuels-and--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "growth--and-environmental-damage",
      entryText: "and environmental damage",
      entryTree: '["growth","","and environmental damage"]',
      id: "growth--and-environmental-damage--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
    {
      entrySlug: "technological-progress--and-environmental-damage",
      entryText: "and environmental damage",
      entryTree: '["technological progress","","and environmental damage"]',
      id: "technological-progress--and-environmental-damage--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-11-capitalism-climate-change.html",
    },
  ],
  [
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "industrial-revolution--causes",
      entryText: "causes",
      entryTree: '["Industrial Revolution","","causes"]',
      id: "industrial-revolution--causes--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "clark-gregory",
      entryText: "Clark, Gregory",
      entryTree: '["Clark, Gregory"]',
      id: "clark-gregory--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "mokyr-joel",
      entryText: "Mokyr, Joel",
      entryTree: '["Mokyr, Joel"]',
      id: "mokyr-joel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "scientific-revolution",
      entryText: "scientific revolution",
      entryTree: '["scientific revolution"]',
      id: "scientific-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "institutions--political",
      entryText: "political",
      entryTree: '["institutions","","political"]',
      id: "institutions--political--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "rule-of-law",
      entryText: "rule of law",
      entryTree: '["rule of law"]',
      id: "rule-of-law--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "landes-david",
      entryText: "Landes, David",
      entryTree: '["Landes, David"]',
      id: "landes-david--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "japan--introduction-of-capitalism",
      entryText: "introduction of capitalism",
      entryTree: '["Japan","","introduction of capitalism"]',
      id: "japan--introduction-of-capitalism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
    {
      entrySlug: "germany--introduction-of-capitalism",
      entryText: "introduction of capitalism",
      entryTree: '["Germany","","introduction of capitalism"]',
      id: "germany--introduction-of-capitalism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "02-technology-incentives-12-how-good-is-the-model.html",
    },
  ],
  [
    {
      entrySlug: "united-states--wages",
      entryText: "wages",
      entryTree: '["United States","","wages"]',
      id: "united-states--wages--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "wages--historical",
      entryText: "historical",
      entryTree: '["wages","","historical"]',
      id: "wages--historical--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "free-time--versus-income",
      entryText: "versus income",
      entryTree: '["free time","","versus income"]',
      id: "free-time--versus-income--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "wages--and-working-hours",
      entryText: "and working hours",
      entryTree: '["wages","","and working hours"]',
      id: "wages--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "working-hours",
      entryText: "working hours",
      entryTree: '["working hours"]',
      id: "working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "income--global-distribution",
      entryText: "global distribution",
      entryTree: '["income","","global distribution"]',
      id: "income--global-distribution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "income--historical-trends",
      entryText: "historical trends",
      entryTree: '["income","","historical trends"]',
      id: "income--historical-trends--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "netherlands--historic-gdp",
      entryText: "historic GDP",
      entryTree: '["Netherlands","","historic GDP"]',
      id: "netherlands--historic-gdp--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "netherlands--hours-of-work",
      entryText: "hours of work",
      entryTree: '["Netherlands","","hours of work"]',
      id: "netherlands--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "south-korea--hours-of-work",
      entryText: "hours of work",
      entryTree: '["South Korea","","hours of work"]',
      id: "south-korea--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "united-states--gdp-per-capita",
      entryText: "GDP per capita",
      entryTree: '["United States","","GDP per capita"]',
      id: "united-states--gdp-per-capita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "united-states--hours-of-work",
      entryText: "hours of work",
      entryTree: '["United States","","hours of work"]',
      id: "united-states--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "france--hours-of-work",
      entryText: "hours of work",
      entryTree: '["France","","hours of work"]',
      id: "france--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
    {
      entrySlug: "free-time--versus-income",
      entryText: "versus income",
      entryTree: '["free time","","versus income"]',
      id: "free-time--versus-income--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-01-work-fewer-hours.html",
    },
  ],
  [
    {
      entrySlug: "scarcity--definition",
      entryText: "definition",
      entryTree: '["scarcity","","definition"]',
      id: "scarcity--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-02-choice-and-scarcity.html",
    },
    {
      entrySlug: "income--and-hours-of-work",
      entryText: "and hours of work",
      entryTree: '["income","","and hours of work"]',
      id: "income--and-hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-02-choice-and-scarcity.html",
    },
    {
      entrySlug: "consumption--definition",
      entryText: "definition",
      entryTree: '["consumption","","definition"]',
      id: "consumption--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-02-choice-and-scarcity.html",
    },
  ],
  [
    {
      entrySlug: "preferences--definition",
      entryText: "definition",
      entryTree: '["preferences","","definition"]',
      id: "preferences--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "goods--definition",
      entryText: "definition",
      entryTree: '["goods","","definition"]',
      id: "goods--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "utility--definition",
      entryText: "definition",
      entryTree: '["utility","","definition"]',
      id: "utility--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "indifference-curves",
      entryText: "indifference curves",
      entryTree: '["indifference curves"]',
      id: "indifference-curves--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "utility--calculating",
      entryText: "calculating",
      entryTree: '["utility","","calculating"]',
      id: "utility--calculating--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "utility--calculating",
      entryText: "calculating",
      entryTree: '["utility","","calculating"]',
      id: "utility--calculating--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "consumer-goods--definition",
      entryText: "definition",
      entryTree: '["consumer goods","","definition"]',
      id: "consumer-goods--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
    {
      entrySlug: "marginal-rate-of-substitution-mrs",
      entryText: "marginal rate of substitution (MRS)",
      entryTree: '["marginal rate of substitution (MRS)"]',
      id: "marginal-rate-of-substitution-mrs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-03-goods-and-preferences.html",
    },
  ],
  [
    {
      entrySlug: "opportunity-cost--and-feasible-set",
      entryText: "and feasible set",
      entryTree: '["opportunity cost","","and feasible set"]',
      id: "opportunity-cost--and-feasible-set--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-04-feasible-set.html",
    },
    {
      entrySlug: "budget--constraint",
      entryText: "constraint",
      entryTree: '["budget","","constraint"]',
      id: "budget--constraint--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-04-feasible-set.html",
    },
    {
      entrySlug: "feasible-frontier",
      entryText: "feasible frontier",
      entryTree: '["feasible frontier"]',
      id: "feasible-frontier--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-04-feasible-set.html",
    },
    {
      entrySlug: "feasible-set--definition",
      entryText: "definition",
      entryTree: '["feasible set","","definition"]',
      id: "feasible-set--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-04-feasible-set.html",
    },
    {
      entrySlug: "marginal-rate-of-substitution-mrs",
      entryText: "marginal rate of substitution (MRS)",
      entryTree: '["marginal rate of substitution (MRS)"]',
      id: "marginal-rate-of-substitution-mrs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-04-feasible-set.html",
    },
    {
      entrySlug: "marginal-rate-of-transformation-mrt",
      entryText: "marginal rate of transformation (MRT)",
      entryTree: '["marginal rate of transformation (MRT)"]',
      id: "marginal-rate-of-transformation-mrt--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-04-feasible-set.html",
    },
  ],
  [
    {
      entrySlug: "scarcity--and-decision-making",
      entryText: "and decision-making",
      entryTree: '["scarcity","","and decision-making"]',
      id: "scarcity--and-decision-making--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-05-decision-making-scarcity.html",
    },
    {
      entrySlug: "decision-making-and-scarcity",
      entryText: "decision-making and scarcity",
      entryTree: '["decision-making and scarcity"]',
      id: "decision-making-and-scarcity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-05-decision-making-scarcity.html",
    },
    {
      entrySlug: "consumption--and-free-time",
      entryText: "and free time",
      entryTree: '["consumption","","and free time"]',
      id: "consumption--and-free-time--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-05-decision-making-scarcity.html",
    },
    {
      entrySlug: "free-time--and-consumption",
      entryText: "and consumption",
      entryTree: '["free time","","and consumption"]',
      id: "free-time--and-consumption--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-05-decision-making-scarcity.html",
    },
    {
      entrySlug: "constrained-choice-problem",
      entryText: "constrained choice problem",
      entryTree: '["constrained choice problem"]',
      id: "constrained-choice-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-05-decision-making-scarcity.html",
    },
  ],
  [
    {
      entrySlug: "productivity--and-technical-progress",
      entryText: "and technical progress",
      entryTree: '["productivity","","and technical progress"]',
      id: "productivity--and-technical-progress--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "technological-progress--and-working-hours",
      entryText: "and working hours",
      entryTree: '["technological progress","","and working hours"]',
      id: "technological-progress--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "working-hours",
      entryText: "working hours",
      entryTree: '["working hours"]',
      id: "working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "keynes-john-maynard--economic-possibilities-for-our-grandchildren",
      entryText: "'Economic Possibilities for our Grandchildren'",
      entryTree: '["Keynes, John Maynard","","\'Economic Possibilities for our Grandchildren\'"]',
      id: "keynes-john-maynard--economic-possibilities-for-our-grandchildren--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "free-time--versus-income",
      entryText: "versus income",
      entryTree: '["free time","","versus income"]',
      id: "free-time--versus-income--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "income-effect--and-substitution-effect",
      entryText: "and substitution effect",
      entryTree: '["income effect","","and substitution effect"]',
      id: "income-effect--and-substitution-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "income-effect--definition",
      entryText: "definition",
      entryTree: '["income effect","","definition"]',
      id: "income-effect--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "wages--and-incentives",
      entryText: "and incentives",
      entryTree: '["wages","","and incentives"]',
      id: "wages--and-incentives--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "substitution-effect--definition",
      entryText: "definition",
      entryTree: '["substitution effect","","definition"]',
      id: "substitution-effect--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "wages--and-incentives",
      entryText: "and incentives",
      entryTree: '["wages","","and incentives"]',
      id: "wages--and-incentives--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
    {
      entrySlug: "free-time--versus-income",
      entryText: "versus income",
      entryTree: '["free time","","versus income"]',
      id: "free-time--versus-income--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-06-hours-technological-progress.html",
    },
  ],
  [
    {
      entrySlug: "working-hours--substitution-and-income-effect-on",
      entryText: "substitution and income effect on",
      entryTree: '["working hours","","substitution and income effect on"]',
      id: "working-hours--substitution-and-income-effect-on--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
    {
      entrySlug: "income-effect",
      entryText: "income effect",
      entryTree: '["income effect"]',
      id: "income-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
    {
      entrySlug: "substitution-effect--and-income-effect",
      entryText: "and income effect",
      entryTree: '["substitution effect","","and income effect"]',
      id: "substitution-effect--and-income-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
    {
      entrySlug: "income-effect--definition",
      entryText: "definition",
      entryTree: '["income effect","","definition"]',
      id: "income-effect--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
    {
      entrySlug: "substitution-effect",
      entryText: "substitution effect",
      entryTree: '["substitution effect"]',
      id: "substitution-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
    {
      entrySlug: "substitution-effect",
      entryText: "substitution effect",
      entryTree: '["substitution effect"]',
      id: "substitution-effect--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
    {
      entrySlug: "income-effect",
      entryText: "income effect",
      entryTree: '["income effect"]',
      id: "income-effect--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-07-income-substitution-effects.html",
    },
  ],
  [
    {
      entrySlug: "friedman-milton--essays-in-positive-economics",
      entryText: "*Essays in Positive Economics*",
      entryTree: '["Friedman, Milton","","*Essays in Positive Economics*"]',
      id: "friedman-milton--essays-in-positive-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
    {
      entrySlug: "mexico--hours-of-work",
      entryText: "hours of work",
      entryTree: '["Mexico","","hours of work"]',
      id: "mexico--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
    {
      entrySlug: "belgium--hours-of-work",
      entryText: "hours of work",
      entryTree: '["Belgium","","hours of work"]',
      id: "belgium--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
    {
      entrySlug: "france--hours-of-work",
      entryText: "hours of work",
      entryTree: '["France","","hours of work"]',
      id: "france--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
    {
      entrySlug: "south-korea--hours-of-work",
      entryText: "hours of work",
      entryTree: '["South Korea","","hours of work"]',
      id: "south-korea--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
    {
      entrySlug: "working-hours",
      entryText: "working hours",
      entryTree: '["working hours"]',
      id: "working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
    {
      entrySlug: "robbins-lionel",
      entryText: "Robbins, Lionel",
      entryTree: '["Robbins, Lionel"]',
      id: "robbins-lionel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-08-a-good-model.html",
    },
  ],
  [
    {
      entrySlug: "united-kingdom--hours-of-work",
      entryText: "hours of work",
      entryTree: '["United Kingdom","","hours of work"]',
      id: "united-kingdom--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
    {
      entrySlug: "united-states--hours-of-work",
      entryText: "hours of work",
      entryTree: '["United States","","hours of work"]',
      id: "united-states--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
    {
      entrySlug: "industrial-revolution--and-working-hours",
      entryText: "and working hours",
      entryTree: '["Industrial Revolution","","and working hours"]',
      id: "industrial-revolution--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
    {
      entrySlug: "working-hours",
      entryText: "working hours",
      entryTree: '["working hours"]',
      id: "working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
    {
      entrySlug: "technological-progress--and-working-hours",
      entryText: "and working hours",
      entryTree: '["technological progress","","and working hours"]',
      id: "technological-progress--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
    {
      entrySlug: "fogel-robert",
      entryText: "Fogel, Robert",
      entryTree: '["Fogel, Robert"]',
      id: "fogel-robert--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-09-changes-over-time.html",
    },
  ],
  [
    {
      entrySlug: "united-states--hours-of-work",
      entryText: "hours of work",
      entryTree: '["United States","","hours of work"]',
      id: "united-states--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "sweden--hours-of-work",
      entryText: "hours of work",
      entryTree: '["Sweden","","hours of work"]',
      id: "sweden--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "netherlands--hours-of-work",
      entryText: "hours of work",
      entryTree: '["Netherlands","","hours of work"]',
      id: "netherlands--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "veblen-effect",
      entryText: "Veblen effect",
      entryTree: '["Veblen effect"]',
      id: "veblen-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "veblen-thorstein",
      entryText: "Veblen, Thorstein",
      entryTree: '["Veblen, Thorstein"]',
      id: "veblen-thorstein--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "consumption--conspicuous",
      entryText: "conspicuous",
      entryTree: '["consumption","","conspicuous"]',
      id: "consumption--conspicuous--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "conspicuous-consumption",
      entryText: "conspicuous consumption",
      entryTree: '["conspicuous consumption"]',
      id: "conspicuous-consumption--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "inequality--and-working-hours",
      entryText: "and working hours",
      entryTree: '["inequality","","and working hours"]',
      id: "inequality--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "perez-truglia-ricardo",
      entryText: "Perez-Truglia, Ricardo",
      entryTree: '["Perez-Truglia, Ricardo"]',
      id: "perez-truglia-ricardo--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "schor-juliet",
      entryText: "Schor, Juliet",
      entryTree: '["Schor, Juliet"]',
      id: "schor-juliet--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
    {
      entrySlug: "trade-unions--and-working-hours",
      entryText: "and working hours",
      entryTree: '["trade unions","","and working hours"]',
      id: "trade-unions--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
    },
  ],
  [
    {
      entrySlug: "working-hours--and-gender",
      entryText: "and gender",
      entryTree: '["working hours","","and gender"]',
      id: "working-hours--and-gender--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "gender--and-pay-gap",
      entryText: "and pay gap",
      entryTree: '["gender","","and pay gap"]',
      id: "gender--and-pay-gap--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "gender--and-working-hours",
      entryText: "and working hours",
      entryTree: '["gender","","and working hours"]',
      id: "gender--and-working-hours--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "free-time--and-gender",
      entryText: "and gender",
      entryTree: '["free time","","and gender"]',
      id: "free-time--and-gender--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "child-penalty",
      entryText: "'child penalty'",
      entryTree: "[\"'child penalty'\"]",
      id: "child-penalty--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "gender--and-division-of-labour",
      entryText: "and division of labour",
      entryTree: '["gender","","and division of labour"]',
      id: "gender--and-division-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "division-of-labour--gender",
      entryText: "gender",
      entryTree: '["division of labour","","gender"]',
      id: "division-of-labour--gender--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "division-of-labour--household",
      entryText: "household",
      entryTree: '["division of labour","","household"]',
      id: "division-of-labour--household--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
    {
      entrySlug: "unpaid-work",
      entryText: "unpaid work",
      entryTree: '["unpaid work"]',
      id: "unpaid-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-11-gender-working-time.html",
    },
  ],
  [
    {
      entrySlug: "disposable-income--definition",
      entryText: "definition",
      entryTree: '["disposable income","","definition"]',
      id: "disposable-income--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-12-differences-between-countries.html",
    },
    {
      entrySlug: "working-hours--global-differences",
      entryText: "global differences",
      entryTree: '["working hours","","global differences"]',
      id: "working-hours--global-differences--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-12-differences-between-countries.html",
    },
    {
      entrySlug: "consumption--and-free-time",
      entryText: "and free time",
      entryTree: '["consumption","","and free time"]',
      id: "consumption--and-free-time--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-12-differences-between-countries.html",
    },
    {
      entrySlug: "free-time--and-consumption",
      entryText: "and consumption",
      entryTree: '["free time","","and consumption"]',
      id: "free-time--and-consumption--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-12-differences-between-countries.html",
    },
    {
      entrySlug: "netherlands--hours-of-work",
      entryText: "hours of work",
      entryTree: '["Netherlands","","hours of work"]',
      id: "netherlands--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-12-differences-between-countries.html",
    },
    {
      entrySlug: "united-states--hours-of-work",
      entryText: "hours of work",
      entryTree: '["United States","","hours of work"]',
      id: "united-states--hours-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "03-scarcity-wellbeing-12-differences-between-countries.html",
    },
  ],
  [
    {
      entrySlug: "climate-change--global-response-to",
      entryText: "global response to",
      entryTree: '["climate change","","global response to"]',
      id: "climate-change--global-response-to--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "united-nations-intergovernmental-panel-on-climate-change-un-ipcc",
      entryText: "United Nations Intergovernmental Panel on Climate Change (UN IPCC)",
      entryTree: '["United Nations Intergovernmental Panel on Climate Change (UN IPCC)"]',
      id: "united-nations-intergovernmental-panel-on-climate-change-un-ipcc--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "climate-change--fossil-fuels-and",
      entryText: "fossil fuels and",
      entryTree: '["climate change","","fossil fuels and"]',
      id: "climate-change--fossil-fuels-and--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "climate-change--and-economic-activity",
      entryText: "and economic activity",
      entryTree: '["climate change","","and economic activity"]',
      id: "climate-change--and-economic-activity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "stern-review-on-the-economics-of-climate-change",
      entryText: "*Stern Review on the Economics of Climate Change*",
      entryTree: '["*Stern Review on the Economics of Climate Change*"]',
      id: "stern-review-on-the-economics-of-climate-change--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "climate-change--global-response-to",
      entryText: "global response to",
      entryTree: '["climate change","","global response to"]',
      id: "climate-change--global-response-to--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "paris-agreement-2015",
      entryText: "Paris Agreement, 2015",
      entryTree: '["Paris Agreement, 2015"]',
      id: "paris-agreement-2015--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "social-dilemmas--definition",
      entryText: "definition",
      entryTree: '["social dilemmas","","definition"]',
      id: "social-dilemmas--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "social-dilemmas",
      entryText: "social dilemmas",
      entryTree: '["social dilemmas"]',
      id: "social-dilemmas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "tragedy-of-the-commons",
      entryText: "tragedy of the commons",
      entryTree: '["tragedy of the commons"]',
      id: "tragedy-of-the-commons--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "hardin-garrett",
      entryText: "Hardin, Garrett",
      entryTree: '["Hardin, Garrett"]',
      id: "hardin-garrett--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "free-rider--tragedy-of-the-commons",
      entryText: "tragedy of the commons",
      entryTree: '["free-rider","","tragedy of the commons"]',
      id: "free-rider--tragedy-of-the-commons--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "tragedy-of-the-commons",
      entryText: "tragedy of the commons",
      entryTree: '["tragedy of the commons"]',
      id: "tragedy-of-the-commons--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "free-rider--definition",
      entryText: "definition",
      entryTree: '["free-rider","","definition"]',
      id: "free-rider--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "altruism--definition",
      entryText: "definition",
      entryTree: '["altruism","","definition"]',
      id: "altruism--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "climate-change--global-response-to",
      entryText: "global response to",
      entryTree: '["climate change","","global response to"]',
      id: "climate-change--global-response-to--iid-3",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "united-kingdom--landfill-tax",
      entryText: "landfill tax",
      entryTree: '["United Kingdom","","landfill tax"]',
      id: "united-kingdom--landfill-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "climate-change--global-response-to",
      entryText: "global response to",
      entryTree: '["climate change","","global response to"]',
      id: "climate-change--global-response-to--iid-4",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "chlorofluorocarbons-cfcs",
      entryText: "chlorofluorocarbons (CFCs)",
      entryTree: '["chlorofluorocarbons (CFCs)"]',
      id: "chlorofluorocarbons-cfcs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "montreal-protocol",
      entryText: "Montreal Protocol",
      entryTree: '["Montreal Protocol"]',
      id: "montreal-protocol--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
    {
      entrySlug: "social-interactions--definition",
      entryText: "definition",
      entryTree: '["social interactions","","definition"]',
      id: "social-interactions--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-01-climate-negotiations.html",
    },
  ],
  [
    {
      entrySlug: "self-interest",
      entryText: "self-interest",
      entryTree: '["self-interest"]',
      id: "self-interest--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "strategic-interactions--and-social-dilemmas",
      entryText: "and social dilemmas",
      entryTree: '["strategic interactions","","and social dilemmas"]',
      id: "strategic-interactions--and-social-dilemmas--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "social-interactions",
      entryText: "social interactions",
      entryTree: '["social interactions"]',
      id: "social-interactions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "strategic-interactions--and-social-dilemmas",
      entryText: "and social dilemmas",
      entryTree: '["strategic interactions","","and social dilemmas"]',
      id: "strategic-interactions--and-social-dilemmas--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "games--definition",
      entryText: "definition",
      entryTree: '["games","","definition"]',
      id: "games--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "game-theory--definition",
      entryText: "definition",
      entryTree: '["game theory","","definition"]',
      id: "game-theory--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "strategic-interactions--definition",
      entryText: "definition",
      entryTree: '["strategic interactions","","definition"]',
      id: "strategic-interactions--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "strategy--definition",
      entryText: "definition",
      entryTree: '["strategy","","definition"]',
      id: "strategy--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "games--definition",
      entryText: "definition",
      entryTree: '["games","","definition"]',
      id: "games--definition--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "games--simultaneous",
      entryText: "simultaneous",
      entryTree: '["games","","simultaneous"]',
      id: "games--simultaneous--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
    {
      entrySlug: "pay-off",
      entryText: "pay-off",
      entryTree: '["pay-off"]',
      id: "pay-off--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-02-game-theory.html",
    },
  ],
  [
    {
      entrySlug: "nash-equilibrium",
      entryText: "Nash equilibrium",
      entryTree: '["Nash equilibrium"]',
      id: "nash-equilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "pay-off--matrix",
      entryText: "matrix",
      entryTree: '["pay-off","","matrix"]',
      id: "pay-off--matrix--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "strategy--best-response",
      entryText: "best response",
      entryTree: '["strategy","","best response"]',
      id: "strategy--best-response--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "best-response--definition",
      entryText: "definition",
      entryTree: '["best response","","definition"]',
      id: "best-response--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "nash-equilibrium",
      entryText: "Nash equilibrium",
      entryTree: '["Nash equilibrium"]',
      id: "nash-equilibrium--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "prisoners-dilemma",
      entryText: "prisoners' dilemma",
      entryTree: '["prisoners\' dilemma"]',
      id: "prisoners-dilemma--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "invisible-hand-game",
      entryText: "invisible hand game",
      entryTree: '["invisible hand game"]',
      id: "invisible-hand-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "nash-john",
      entryText: "Nash, John",
      entryTree: '["Nash, John"]',
      id: "nash-john--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
    {
      entrySlug: "myerson-roger",
      entryText: "Myerson, Roger",
      entryTree: '["Myerson, Roger"]',
      id: "myerson-roger--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-03-nash-equilibrium.html",
    },
  ],
  [
    {
      entrySlug: "strategic-interactions",
      entryText: "strategic interactions",
      entryTree: '["strategic interactions"]',
      id: "strategic-interactions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "social-dilemmas",
      entryText: "social dilemmas",
      entryTree: '["social dilemmas"]',
      id: "social-dilemmas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "dominant-strategy-equilibrium",
      entryText: "dominant strategy equilibrium",
      entryTree: '["dominant strategy equilibrium"]',
      id: "dominant-strategy-equilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "strategic-interactions",
      entryText: "strategic interactions",
      entryTree: '["strategic interactions"]',
      id: "strategic-interactions--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "pest-control-game",
      entryText: "pest control game",
      entryTree: '["pest control game"]',
      id: "pest-control-game--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "pest-control-game",
      entryText: "pest control game",
      entryTree: '["pest control game"]',
      id: "pest-control-game--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "strategic-interactions--and-social-dilemmas",
      entryText: "and social dilemmas",
      entryTree: '["strategic interactions","","and social dilemmas"]',
      id: "strategic-interactions--and-social-dilemmas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "prisoners-dilemma",
      entryText: "prisoners' dilemma",
      entryTree: '["prisoners\' dilemma"]',
      id: "prisoners-dilemma--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "prisoners-dilemma",
      entryText: "prisoners' dilemma",
      entryTree: '["prisoners\' dilemma"]',
      id: "prisoners-dilemma--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
    {
      entrySlug: "external-effects--definition",
      entryText: "definition",
      entryTree: '["external effects","","definition"]',
      id: "external-effects--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
    },
  ],
  [
    {
      entrySlug: "allocation--definition",
      entryText: "definition",
      entryTree: '["allocation","","definition"]',
      id: "allocation--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "pareto-criterion",
      entryText: "Pareto criterion",
      entryTree: '["Pareto criterion"]',
      id: "pareto-criterion--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "pareto-improvement--definition",
      entryText: "definition",
      entryTree: '["Pareto improvement","","definition"]',
      id: "pareto-improvement--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "paretos-law",
      entryText: "Pareto's law",
      entryTree: '["Pareto\'s law"]',
      id: "paretos-law--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "pareto-vilfredo--manual-of-political-economy",
      entryText: "*Manual of Political Economy*",
      entryTree: '["Pareto, Vilfredo","","*Manual of Political Economy*"]',
      id: "pareto-vilfredo--manual-of-political-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "pest-control-game",
      entryText: "pest control game",
      entryTree: '["pest control game"]',
      id: "pest-control-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "pareto-efficiency",
      entryText: "Pareto efficiency",
      entryTree: '["Pareto efficiency"]',
      id: "pareto-efficiency--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "fairness--definition",
      entryText: "definition",
      entryTree: '["fairness","","definition"]',
      id: "fairness--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
    {
      entrySlug: "invisible-hand-game",
      entryText: "invisible hand game",
      entryTree: '["invisible hand game"]',
      id: "invisible-hand-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-05-pareto-criterion.html",
    },
  ],
  [
    {
      entrySlug: "games--public-good",
      entryText: "public good",
      entryTree: '["games","","public good"]',
      id: "games--public-good--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "public-good-games",
      entryText: "public good games",
      entryTree: '["public good games"]',
      id: "public-good-games--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "ostrom-elinor",
      entryText: "Ostrom, Elinor",
      entryTree: '["Ostrom, Elinor"]',
      id: "ostrom-elinor--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "open-access-resources--definition",
      entryText: "definition",
      entryTree: '["open access resources","","definition"]',
      id: "open-access-resources--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "property--common",
      entryText: "common",
      entryTree: '["property","","common"]',
      id: "property--common--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "prisoners-dilemma--and-altruism",
      entryText: "and altruism",
      entryTree: '["prisoners\' dilemma","","and altruism"]',
      id: "prisoners-dilemma--and-altruism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "romer-paul",
      entryText: "Romer, Paul",
      entryTree: '["Romer, Paul"]',
      id: "romer-paul--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "social-norms--definition",
      entryText: "definition",
      entryTree: '["social norms","","definition"]',
      id: "social-norms--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "coase-ronald",
      entryText: "Coase, Ronald",
      entryTree: '["Coase, Ronald"]',
      id: "coase-ronald--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "smith-vernon",
      entryText: "Smith, Vernon",
      entryTree: '["Smith, Vernon"]',
      id: "smith-vernon--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
    {
      entrySlug: "ostrom-elinor",
      entryText: "Ostrom, Elinor",
      entryTree: '["Ostrom, Elinor"]',
      id: "ostrom-elinor--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-06-public-good-games.html",
    },
  ],
  [
    {
      entrySlug: "prisoners-dilemma--and-altruism",
      entryText: "and altruism",
      entryTree: '["prisoners\' dilemma","","and altruism"]',
      id: "prisoners-dilemma--and-altruism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "altruism--and-prisoners-dilemma",
      entryText: "and prisoners' dilemma",
      entryTree: '["altruism","","and prisoners\' dilemma"]',
      id: "altruism--and-prisoners-dilemma--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "social-preferences--definition",
      entryText: "definition",
      entryTree: '["social preferences","","definition"]',
      id: "social-preferences--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "utility--definition",
      entryText: "definition",
      entryTree: '["utility","","definition"]',
      id: "utility--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "preferences--definition",
      entryText: "definition",
      entryTree: '["preferences","","definition"]',
      id: "preferences--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "altruism--and-indifference-curves",
      entryText: "and indifference curves",
      entryTree: '["altruism","","and indifference curves"]',
      id: "altruism--and-indifference-curves--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "indifference-curves--and-altruism",
      entryText: "and altruism",
      entryTree: '["indifference curves","","and altruism"]',
      id: "indifference-curves--and-altruism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "pest-control-game",
      entryText: "pest control game",
      entryTree: '["pest control game"]',
      id: "pest-control-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "homo-economicus",
      entryText: "*homo economicus*",
      entryTree: '["*homo economicus*"]',
      id: "homo-economicus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "smith-adam--invisible-hand-of-the-market",
      entryText: "'invisible hand of the market",
      entryTree: '["Smith, Adam","","\'invisible hand of the market"]',
      id: "smith-adam--invisible-hand-of-the-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "smith-adam--the-theory-of-moral-sentiments",
      entryText: "*The Theory of Moral Sentiments*",
      entryTree: '["Smith, Adam","","*The Theory of Moral Sentiments*"]',
      id: "smith-adam--the-theory-of-moral-sentiments--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "edgeworth-francis--mathematical-psychics",
      entryText: "*Mathematical Psychics*",
      entryTree: '["Edgeworth, Francis","","*Mathematical Psychics*"]',
      id: "edgeworth-francis--mathematical-psychics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
    {
      entrySlug: "mencken-h-l",
      entryText: "Mencken, H. L.",
      entryTree: '["Mencken, H. L."]',
      id: "mencken-h-l--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-07-social-preferences.html",
    },
  ],
  [
    {
      entrySlug: "pest-control-game",
      entryText: "pest control game",
      entryTree: '["pest control game"]',
      id: "pest-control-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "public-goods--and-free-rider",
      entryText: "and free-rider",
      entryTree: '["public goods","","and free-rider"]',
      id: "public-goods--and-free-rider--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "free-rider--and-public-goods",
      entryText: "and public goods",
      entryTree: '["free-rider","","and public goods"]',
      id: "free-rider--and-public-goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "public-good-experiment",
      entryText: "public good experiment",
      entryTree: '["public good experiment"]',
      id: "public-good-experiment--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "altruism--and-public-good",
      entryText: "and public good",
      entryTree: '["altruism","","and public good"]',
      id: "altruism--and-public-good--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "social-norms--and-public-good",
      entryText: "and public good",
      entryTree: '["social norms","","and public good"]',
      id: "social-norms--and-public-good--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "social-norms--definition",
      entryText: "definition",
      entryTree: '["social norms","","definition"]',
      id: "social-norms--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "reciprocity--definition",
      entryText: "definition",
      entryTree: '["reciprocity","","definition"]',
      id: "reciprocity--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
    {
      entrySlug: "public-good-experiment",
      entryText: "public good experiment",
      entryTree: '["public good experiment"]',
      id: "public-good-experiment--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-08-repeated-interaction.html",
    },
  ],
  [
    {
      entrySlug: "mendel-gregor",
      entryText: "Mendel, Gregor",
      entryTree: '["Mendel, Gregor"]',
      id: "mendel-gregor--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-09-using-experiments.html",
    },
    {
      entrySlug: "social-dilemmas",
      entryText: "social dilemmas",
      entryTree: '["social dilemmas"]',
      id: "social-dilemmas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-09-using-experiments.html",
    },
    {
      entrySlug: "cardenas-juan-camilo",
      entryText: "Cárdenas, Juan Camilo",
      entryTree: '["Cárdenas, Juan Camilo"]',
      id: "cardenas-juan-camilo--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-09-using-experiments.html",
    },
    {
      entrySlug: "crowding-out",
      entryText: "crowding out",
      entryTree: '["crowding out"]',
      id: "crowding-out--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-09-using-experiments.html",
    },
  ],
  [
    {
      entrySlug: "cooperation--definition",
      entryText: "definition",
      entryTree: '["cooperation","","definition"]',
      id: "cooperation--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
    {
      entrySlug: "social-norms--and-behaviour",
      entryText: "and behaviour",
      entryTree: '["social norms","","and behaviour"]',
      id: "social-norms--and-behaviour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
    {
      entrySlug: "social-preferences",
      entryText: "social preferences",
      entryTree: '["social preferences"]',
      id: "social-preferences--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
    {
      entrySlug: "chlorofluorocarbons-cfcs",
      entryText: "chlorofluorocarbons (CFCs)",
      entryTree: '["chlorofluorocarbons (CFCs)"]',
      id: "chlorofluorocarbons-cfcs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
    {
      entrySlug: "montreal-protocol",
      entryText: "Montreal Protocol",
      entryTree: '["Montreal Protocol"]',
      id: "montreal-protocol--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
    {
      entrySlug: "bargaining",
      entryText: "bargaining",
      entryTree: '["bargaining"]',
      id: "bargaining--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
    {
      entrySlug: "conflict-of-interest--definition",
      entryText: "definition",
      entryTree: '["conflict of interest","","definition"]',
      id: "conflict-of-interest--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
    },
  ],
  [
    {
      entrySlug: "economic-rent--definition",
      entryText: "definition",
      entryTree: '["economic rent","","definition"]',
      id: "economic-rent--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "games--ultimatum",
      entryText: "ultimatum",
      entryTree: '["games","","ultimatum"]',
      id: "games--ultimatum--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "take-it-or-leave-it-game",
      entryText: "take-it-or-leave-it game",
      entryTree: '["take-it-or-leave-it game"]',
      id: "take-it-or-leave-it-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "ultimatum-game",
      entryText: "ultimatum game",
      entryTree: '["ultimatum game"]',
      id: "ultimatum-game--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "games--sequential",
      entryText: "sequential",
      entryTree: '["games","","sequential"]',
      id: "games--sequential--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "games--simultaneous",
      entryText: "simultaneous",
      entryTree: '["games","","simultaneous"]',
      id: "games--simultaneous--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "minimum-acceptable-offer--definition",
      entryText: "definition",
      entryTree: '["minimum acceptable offer","","definition"]',
      id: "minimum-acceptable-offer--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "ultimatum-game",
      entryText: "ultimatum game",
      entryTree: '["ultimatum game"]',
      id: "ultimatum-game--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
    {
      entrySlug: "games--public-good",
      entryText: "public good",
      entryTree: '["games","","public good"]',
      id: "games--public-good--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-11-ultimatum-game.html",
    },
  ],
  [
    {
      entrySlug: "self-interest",
      entryText: "self-interest",
      entryTree: '["self-interest"]',
      id: "self-interest--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-12-experimental-results.html",
    },
    {
      entrySlug: "ultimatum-game--examples",
      entryText: "examples",
      entryTree: '["ultimatum game","","examples"]',
      id: "ultimatum-game--examples--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-12-experimental-results.html",
    },
    {
      entrySlug: "ultimatum-game--examples",
      entryText: "examples",
      entryTree: '["ultimatum game","","examples"]',
      id: "ultimatum-game--examples--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-12-experimental-results.html",
    },
    {
      entrySlug: "competition--and-the-ultimatum-game",
      entryText: "and the ultimatum game",
      entryTree: '["competition","","and the ultimatum game"]',
      id: "competition--and-the-ultimatum-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-12-experimental-results.html",
    },
    {
      entrySlug: "pay-off",
      entryText: "pay-off",
      entryTree: '["pay-off"]',
      id: "pay-off--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-12-experimental-results.html",
    },
  ],
  [
    {
      entrySlug: "nash-equilibrium",
      entryText: "Nash equilibrium",
      entryTree: '["Nash equilibrium"]',
      id: "nash-equilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-13-coordination-games.html",
    },
    {
      entrySlug: "coordination-game--definition",
      entryText: "definition",
      entryTree: '["coordination game","","definition"]',
      id: "coordination-game--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-13-coordination-games.html",
    },
    {
      entrySlug: "conflict-of-interest--definition",
      entryText: "definition",
      entryTree: '["conflict of interest","","definition"]',
      id: "conflict-of-interest--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-13-coordination-games.html",
    },
  ],
  [
    {
      entrySlug: "montreal-protocol",
      entryText: "Montreal Protocol",
      entryTree: '["Montreal Protocol"]',
      id: "montreal-protocol--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "climate-change--and-business-as-usual",
      entryText: "and 'business as usual'",
      entryTree: '["climate change","","and \'business as usual\'"]',
      id: "climate-change--and-business-as-usual--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "climate-change--as-social-dilemma",
      entryText: "as social dilemma",
      entryTree: '["climate change","","as social dilemma"]',
      id: "climate-change--as-social-dilemma--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "climate-change--modelling",
      entryText: "modelling",
      entryTree: '["climate change","","modelling"]',
      id: "climate-change--modelling--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "climate-change--and-public-policy",
      entryText: "and public policy",
      entryTree: '["climate change","","and public policy"]',
      id: "climate-change--and-public-policy--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "emissions--reduction-of",
      entryText: "reduction of",
      entryTree: '["emissions","","reduction of"]',
      id: "emissions--reduction-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "emissions--costs-of-limiting",
      entryText: "costs of limiting",
      entryTree: '["emissions","","costs of limiting"]',
      id: "emissions--costs-of-limiting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "nash-equilibrium--and-climate-change",
      entryText: "and climate change",
      entryTree: '["Nash equilibrium","","and climate change"]',
      id: "nash-equilibrium--and-climate-change--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "games--hawk-dove",
      entryText: "hawk-dove",
      entryTree: '["games","","hawk-dove"]',
      id: "games--hawk-dove--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "hawk-dove-game",
      entryText: "hawk-dove game",
      entryTree: '["hawk-dove game"]',
      id: "hawk-dove-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "united-states--carbon-emissions",
      entryText: "carbon emissions",
      entryTree: '["United States","","carbon emissions"]',
      id: "united-states--carbon-emissions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "india--carbon-emissions",
      entryText: "carbon emissions",
      entryTree: '["India","","carbon emissions"]',
      id: "india--carbon-emissions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "china--carbon-emissions",
      entryText: "carbon emissions",
      entryTree: '["China","","carbon emissions"]',
      id: "china--carbon-emissions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "paris-agreement-2015",
      entryText: "Paris Agreement, 2015",
      entryTree: '["Paris Agreement, 2015"]',
      id: "paris-agreement-2015--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
    {
      entrySlug: "climate-change--and-public-policy",
      entryText: "and public policy",
      entryTree: '["climate change","","and public policy"]',
      id: "climate-change--and-public-policy--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "04-strategic-interactions-14-modelling-climate-change.html",
    },
  ],
  [
    {
      entrySlug: "pirate-economics",
      entryText: "pirate economics",
      entryTree: '["pirate economics"]',
      id: "pirate-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-01-pirate-economics.html",
    },
    {
      entrySlug: "piracy",
      entryText: "piracy",
      entryTree: '["piracy"]',
      id: "piracy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-01-pirate-economics.html",
    },
    {
      entrySlug: "royal-rovers-articles",
      entryText: "*Royal Rover's Articles*",
      entryTree: '["*Royal Rover\'s Articles*"]',
      id: "royal-rovers-articles--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-01-pirate-economics.html",
    },
  ],
  [
    {
      entrySlug: "rules-of-the-game",
      entryText: "rules of the game",
      entryTree: '["rules of the game"]',
      id: "rules-of-the-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "institutions--and-power",
      entryText: "and power",
      entryTree: '["institutions","","and power"]',
      id: "institutions--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "institutions--definition",
      entryText: "definition",
      entryTree: '["institutions","","definition"]',
      id: "institutions--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "royal-rovers-articles",
      entryText: "*Royal Rover's Articles*",
      entryTree: '["*Royal Rover\'s Articles*"]',
      id: "royal-rovers-articles--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "incentives--definition",
      entryText: "definition",
      entryTree: '["incentives","","definition"]',
      id: "incentives--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "allocation--definition",
      entryText: "definition",
      entryTree: '["allocation","","definition"]',
      id: "allocation--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "ultimatum-game--definition",
      entryText: "definition",
      entryTree: '["ultimatum game","","definition"]',
      id: "ultimatum-game--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "bargaining-power",
      entryText: "bargaining power",
      entryTree: '["bargaining power"]',
      id: "bargaining-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "power--bargaining",
      entryText: "bargaining",
      entryTree: '["power","","bargaining"]',
      id: "power--bargaining--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "power--structural",
      entryText: "structural",
      entryTree: '["power","","structural"]',
      id: "power--structural--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "power--definition",
      entryText: "definition",
      entryTree: '["power","","definition"]',
      id: "power--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "ultimatum-game",
      entryText: "ultimatum game",
      entryTree: '["ultimatum game"]',
      id: "ultimatum-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
    {
      entrySlug: "productivity--labour",
      entryText: "labour",
      entryTree: '["productivity","","labour"]',
      id: "productivity--labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-02-institutions-and-power.html",
    },
  ],
  [
    {
      entrySlug: "institutions--and-fairness",
      entryText: "and fairness",
      entryTree: '["institutions","","and fairness"]',
      id: "institutions--and-fairness--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-03-evaluating-institutions-outcomes.html",
    },
    {
      entrySlug: "fairness--evaluating",
      entryText: "evaluating",
      entryTree: '["fairness","","evaluating"]',
      id: "fairness--evaluating--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-03-evaluating-institutions-outcomes.html",
    },
    {
      entrySlug: "fairness--procedural-judgements-of",
      entryText: "procedural judgements of",
      entryTree: '["fairness","","procedural judgements of"]',
      id: "fairness--procedural-judgements-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-03-evaluating-institutions-outcomes.html",
    },
    {
      entrySlug: "fairness--substantive-judgements-of",
      entryText: "substantive judgements of",
      entryTree: '["fairness","","substantive judgements of"]',
      id: "fairness--substantive-judgements-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-03-evaluating-institutions-outcomes.html",
    },
    {
      entrySlug: "rawls-john",
      entryText: "Rawls, John",
      entryTree: '["Rawls, John"]',
      id: "rawls-john--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-03-evaluating-institutions-outcomes.html",
    },
  ],
  [
    {
      entrySlug: "preferences--definition",
      entryText: "definition",
      entryTree: '["preferences","","definition"]',
      id: "preferences--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-04-technology-and-preferences.html",
    },
  ],
  [
    {
      entrySlug: "property-rights--definition",
      entryText: "definition",
      entryTree: '["property rights","","definition"]',
      id: "property-rights--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-05-independent-farmer.html",
    },
    {
      entrySlug: "land-ownership",
      entryText: "land ownership",
      entryTree: '["land ownership"]',
      id: "land-ownership--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-05-independent-farmer.html",
    },
  ],
  [
    {
      entrySlug: "united-kingdom--industrial-revolution",
      entryText: "Industrial Revolution",
      entryTree: '["United Kingdom","","Industrial Revolution"]',
      id: "united-kingdom--industrial-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "slave-trade",
      entryText: "slave trade",
      entryTree: '["slave trade"]',
      id: "slave-trade--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "forced-labour",
      entryText: "forced labour",
      entryTree: '["forced labour"]',
      id: "forced-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "united-kingdom--forced-labour-in",
      entryText: "forced labour in",
      entryTree: '["United Kingdom","","forced labour in"]',
      id: "united-kingdom--forced-labour-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "middle-east--forced-labour-in",
      entryText: "forced labour in",
      entryTree: '["Middle East","","forced labour in"]',
      id: "middle-east--forced-labour-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "mauritania",
      entryText: "Mauritania",
      entryTree: '["Mauritania"]',
      id: "mauritania--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "united-states--slavery-in",
      entryText: "slavery in",
      entryTree: '["United States","","slavery in"]',
      id: "united-states--slavery-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "indifference-curves--reservation",
      entryText: "reservation",
      entryTree: '["indifference curves","","reservation"]',
      id: "indifference-curves--reservation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "encomienda",
      entryText: "encomienda",
      entryTree: '["encomienda"]',
      id: "encomienda--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "economic-rent",
      entryText: "economic rent",
      entryTree: '["economic rent"]',
      id: "economic-rent--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "bolivia",
      entryText: "Bolivia",
      entryTree: '["Bolivia"]',
      id: "bolivia--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "peru",
      entryText: "Peru",
      entryTree: '["Peru"]',
      id: "peru--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "huancavelica-mercury-mines",
      entryText: "Huancavelica mercury mines",
      entryTree: '["Huancavelica mercury mines"]',
      id: "huancavelica-mercury-mines--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "potosi-silver-mine",
      entryText: "Potosí silver mine",
      entryTree: '["Potosí silver mine"]',
      id: "potosi-silver-mine--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "inca",
      entryText: "Inca",
      entryTree: '["Inca"]',
      id: "inca--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "mita-system",
      entryText: "*mita* system",
      entryTree: '["*mita* system"]',
      id: "mita-system--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "spain--colonial-forced-labour-policy",
      entryText: "colonial forced labour policy",
      entryTree: '["Spain","","colonial forced labour policy"]',
      id: "spain--colonial-forced-labour-policy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "dell-melissa--the-persistent-effects-of-perus-mining-mita",
      entryText: "'The Persistent Effects of Peru's Mining Mita'",
      entryTree: '["Dell, Melissa","","\'The Persistent Effects of Peru\'s Mining Mita\'"]',
      id: "dell-melissa--the-persistent-effects-of-perus-mining-mita--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "mita-system",
      entryText: "*mita* system",
      entryTree: '["*mita* system"]',
      id: "mita-system--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
    {
      entrySlug: "haciendas",
      entryText: "*haciendas*",
      entryTree: '["*haciendas*"]',
      id: "haciendas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-06-forced-labour.html",
    },
  ],
  [
    {
      entrySlug: "contracts--employment",
      entryText: "employment",
      entryTree: '["contracts","","employment"]',
      id: "contracts--employment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-07-take-it-or-leave-it.html",
    },
    {
      entrySlug: "gains--from-exchange",
      entryText: "from exchange",
      entryTree: '["gains","","from exchange"]',
      id: "gains--from-exchange--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-07-take-it-or-leave-it.html",
    },
    {
      entrySlug: "surplus--joint",
      entryText: "joint",
      entryTree: '["surplus","","joint"]',
      id: "surplus--joint--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-07-take-it-or-leave-it.html",
    },
  ],
  [
    {
      entrySlug: "democracy--bargaining-in",
      entryText: "bargaining in",
      entryTree: '["democracy","","bargaining in"]',
      id: "democracy--bargaining-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-08-bargaining-in-democracy.html",
    },
  ],
  [
    {
      entrySlug: "pareto-efficiency-curve--and-surplus-distribution",
      entryText: "and surplus distribution",
      entryTree: '["Pareto efficiency curve","","and surplus distribution"]',
      id: "pareto-efficiency-curve--and-surplus-distribution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-09-pareto-efficient-sharing.html",
    },
    {
      entrySlug: "pareto-efficiency--and-surplus",
      entryText: "and surplus",
      entryTree: '["Pareto efficiency","","and surplus"]',
      id: "pareto-efficiency--and-surplus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-09-pareto-efficient-sharing.html",
    },
    {
      entrySlug: "pareto-improvement",
      entryText: "Pareto improvement",
      entryTree: '["Pareto improvement"]',
      id: "pareto-improvement--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-09-pareto-efficient-sharing.html",
    },
    {
      entrySlug: "pareto-efficiency-curve--definition",
      entryText: "definition",
      entryTree: '["Pareto efficiency curve","","definition"]',
      id: "pareto-efficiency-curve--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-09-pareto-efficient-sharing.html",
    },
  ],
  [
    {
      entrySlug: "human-capital",
      entryText: "human capital",
      entryTree: '["human capital"]',
      id: "human-capital--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-11-distribution-of-income.html",
    },
    {
      entrySlug: "endowments",
      entryText: "endowments",
      entryTree: '["endowments"]',
      id: "endowments--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-11-distribution-of-income.html",
    },
    {
      entrySlug: "digital-markets--competition-in",
      entryText: "competition in",
      entryTree: '["digital markets","","competition in"]',
      id: "digital-markets--competition-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-11-distribution-of-income.html",
    },
  ],
  [
    {
      entrySlug: "gini-coefficient",
      entryText: "Gini coefficient",
      entryTree: '["Gini coefficient"]',
      id: "gini-coefficient--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "gini-corrado",
      entryText: "Gini, Corrado",
      entryTree: '["Gini, Corrado"]',
      id: "gini-corrado--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "lorenz-curve",
      entryText: "Lorenz curve",
      entryTree: '["Lorenz curve"]',
      id: "lorenz-curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "piracy",
      entryText: "piracy",
      entryTree: '["piracy"]',
      id: "piracy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "pirate-economics",
      entryText: "pirate economics",
      entryTree: '["pirate economics"]',
      id: "pirate-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "income--inequality",
      entryText: "inequality",
      entryTree: '["income","","inequality"]',
      id: "income--inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "inequality",
      entryText: "inequality",
      entryTree: '["inequality"]',
      id: "inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "netherlands--inequality",
      entryText: "inequality",
      entryTree: '["Netherlands","","inequality"]',
      id: "netherlands--inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "south-africa--inequality",
      entryText: "inequality",
      entryTree: '["South Africa","","inequality"]',
      id: "south-africa--inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "united-kingdom--inequality",
      entryText: "inequality",
      entryTree: '["United Kingdom","","inequality"]',
      id: "united-kingdom--inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
    {
      entrySlug: "united-states--inequality",
      entryText: "inequality",
      entryTree: '["United States","","inequality"]',
      id: "united-states--inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-12-measuring-economic-inequality.html",
    },
  ],
  [
    {
      entrySlug: "india--bargadars",
      entryText: "*bargadars*",
      entryTree: '["India","","*bargadars*"]',
      id: "india--bargadars--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-13-redistribute-surplus-raise-efficiency.html",
    },
    {
      entrySlug: "west-bengal",
      entryText: "West Bengal",
      entryTree: '["West Bengal"]',
      id: "west-bengal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-13-redistribute-surplus-raise-efficiency.html",
    },
    {
      entrySlug: "india--bargadars",
      entryText: "*bargadars*",
      entryTree: '["India","","*bargadars*"]',
      id: "india--bargadars--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-13-redistribute-surplus-raise-efficiency.html",
    },
  ],
  [
    {
      entrySlug: "shell-oil-case-niger-delta",
      entryText: "Shell oil case, Niger Delta",
      entryTree: '["Shell oil case, Niger Delta"]',
      id: "shell-oil-case-niger-delta--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "niger",
      entryText: "Niger",
      entryTree: '["Niger"]',
      id: "niger--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "nigeria",
      entryText: "Nigeria",
      entryTree: '["Nigeria"]',
      id: "nigeria--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "royal-dutch-shell",
      entryText: "Royal Dutch Shell",
      entryTree: '["Royal Dutch Shell"]',
      id: "royal-dutch-shell--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "bunker-hill-company",
      entryText: "Bunker Hill Company",
      entryTree: '["Bunker Hill Company"]',
      id: "bunker-hill-company--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "environmental-damage--abatement",
      entryText: "abatement",
      entryTree: '["environmental damage","","abatement"]',
      id: "environmental-damage--abatement--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "shutdown-condition",
      entryText: "*shutdown condition*",
      entryTree: '["*shutdown condition*"]',
      id: "shutdown-condition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "marginal-utility",
      entryText: "marginal utility",
      entryTree: '["marginal utility"]',
      id: "marginal-utility--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
    {
      entrySlug: "bargaining-power--and-pollution",
      entryText: "and pollution",
      entryTree: '["bargaining power","","and pollution"]',
      id: "bargaining-power--and-pollution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "05-the-rules-of-the-game-14-conflicts-and-bargaining.html",
    },
  ],
  [
    {
      entrySlug: "exploding-tyres-case-study",
      entryText: "exploding tyres case study",
      entryTree: '["exploding tyres case study"]',
      id: "exploding-tyres-case-study--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "labour--strife",
      entryText: "strife",
      entryTree: '["labour","","strife"]',
      id: "labour--strife--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "mas-alexandre",
      entryText: "Mas, Alexandre",
      entryTree: '["Mas, Alexandre"]',
      id: "mas-alexandre--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "krueger-alan",
      entryText: "Krueger, Alan",
      entryTree: '["Krueger, Alan"]',
      id: "krueger-alan--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "exploding-tyres-case-study",
      entryText: "exploding tyres case study",
      entryTree: '["exploding tyres case study"]',
      id: "exploding-tyres-case-study--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "workers--resistance-to-wage-cut",
      entryText: "resistance to wage cut",
      entryTree: '["workers","","resistance to wage cut"]',
      id: "workers--resistance-to-wage-cut--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "labour--division-of",
      entryText: "division of",
      entryTree: '["labour","","division of"]',
      id: "labour--division-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "firms--and-human-behaviour",
      entryText: "and human behaviour",
      entryTree: '["firms","","and human behaviour"]',
      id: "firms--and-human-behaviour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "firms--and-division-of-labour",
      entryText: "and division of labour",
      entryTree: '["firms","","and division of labour"]',
      id: "firms--and-division-of-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "comparative-advantage--and-specialization",
      entryText: "and specialization",
      entryTree: '["comparative advantage","","and specialization"]',
      id: "comparative-advantage--and-specialization--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "simon-herbert",
      entryText: "Simon, Herbert",
      entryTree: '["Simon, Herbert"]',
      id: "simon-herbert--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "contracts--employment",
      entryText: "employment",
      entryTree: '["contracts","","employment"]',
      id: "contracts--employment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "hayek-friedrich",
      entryText: "Hayek, Friedrich",
      entryTree: '["Hayek, Friedrich"]',
      id: "hayek-friedrich--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
    {
      entrySlug: "simon-herbert",
      entryText: "Simon, Herbert",
      entryTree: '["Simon, Herbert"]',
      id: "simon-herbert--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-01-exploding-tyres.html",
    },
  ],
  [
    {
      entrySlug: "walmart",
      entryText: "Walmart",
      entryTree: '["Walmart"]',
      id: "walmart--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "firms--structure-of",
      entryText: "structure of",
      entryTree: '["firms","","structure of"]',
      id: "firms--structure-of--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "firms--decision-making-in",
      entryText: "decision-making in",
      entryTree: '["firms","","decision-making in"]',
      id: "firms--decision-making-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "firms--structure-of",
      entryText: "structure of",
      entryTree: '["firms","","structure of"]',
      id: "firms--structure-of--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "asymmetric-information--in-firms",
      entryText: "in firms",
      entryTree: '["asymmetric information","","in firms"]',
      id: "asymmetric-information--in-firms--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "asymmetric-information--definition",
      entryText: "definition",
      entryTree: '["asymmetric information","","definition"]',
      id: "asymmetric-information--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "markets--and-power",
      entryText: "and power",
      entryTree: '["markets","","and power"]',
      id: "markets--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "firms--and-power",
      entryText: "and power",
      entryTree: '["firms","","and power"]',
      id: "firms--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "coase-ronald",
      entryText: "Coase, Ronald",
      entryTree: '["Coase, Ronald"]',
      id: "coase-ronald--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "shaw-george-bernard",
      entryText: "Shaw, George Bernard",
      entryTree: '["Shaw, George Bernard"]',
      id: "shaw-george-bernard--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "marx-karl",
      entryText: "Marx, Karl",
      entryTree: '["Marx, Karl"]',
      id: "marx-karl--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "coase-ronald--the-nature-of-the-firm",
      entryText: "'The Nature of the Firm'",
      entryTree: '["Coase, Ronald","","\'The Nature of the Firm\'"]',
      id: "coase-ronald--the-nature-of-the-firm--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "contracts--employment",
      entryText: "employment",
      entryTree: '["contracts","","employment"]',
      id: "contracts--employment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "employment--contract",
      entryText: "contract",
      entryTree: '["employment","","contract"]',
      id: "employment--contract--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "employment--tenure",
      entryText: "tenure",
      entryTree: '["employment","","tenure"]',
      id: "employment--tenure--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "contracts--incomplete",
      entryText: "incomplete",
      entryTree: '["contracts","","incomplete"]',
      id: "contracts--incomplete--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "incomplete-contracts",
      entryText: "incomplete contracts",
      entryTree: '["incomplete contracts"]',
      id: "incomplete-contracts--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
    {
      entrySlug: "employment--tenure",
      entryText: "tenure",
      entryTree: '["employment","","tenure"]',
      id: "employment--tenure--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-02-firm-structure.html",
    },
  ],
  [
    {
      entrySlug: "firms--decision-making-in",
      entryText: "decision-making in",
      entryTree: '["firms","","decision-making in"]',
      id: "firms--decision-making-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "assets--definition",
      entryText: "definition",
      entryTree: '["assets","","definition"]',
      id: "assets--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "capital--goods",
      entryText: "goods",
      entryTree: '["capital","","goods"]',
      id: "capital--goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "residual-claimant",
      entryText: "residual claimant",
      entryTree: '["residual claimant"]',
      id: "residual-claimant--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "profits--calculation-of",
      entryText: "calculation of",
      entryTree: '["profits","","calculation of"]',
      id: "profits--calculation-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "shares--definition",
      entryText: "definition",
      entryTree: '["shares","","definition"]',
      id: "shares--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "separation-of-ownership-and-control",
      entryText: "separation of ownership and control",
      entryTree: '["separation of ownership and control"]',
      id: "separation-of-ownership-and-control--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "smith-adam--wealth-of-nations",
      entryText: "*Wealth of Nations*",
      entryTree: '["Smith, Adam","","*Wealth of Nations*"]',
      id: "smith-adam--wealth-of-nations--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "shareholders--and-free-rider-problem",
      entryText: "and free-rider problem",
      entryTree: '["shareholders","","and free-rider problem"]',
      id: "shareholders--and-free-rider-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
    {
      entrySlug: "board-of-directors",
      entryText: "board of directors",
      entryTree: '["board of directors"]',
      id: "board-of-directors--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-03-separation-ownership-control.html",
    },
  ],
  [
    {
      entrySlug: "day-labour",
      entryText: "'day labour'",
      entryTree: "[\"'day labour'\"]",
      id: "day-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "labour-market--compared-to-goods-market",
      entryText: "compared to goods market",
      entryTree: '["labour market","","compared to goods market"]',
      id: "labour-market--compared-to-goods-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "assets--relationship-specific",
      entryText: "relationship-specific",
      entryTree: '["assets","","relationship-specific"]',
      id: "assets--relationship-specific--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "assets--firm-specific",
      entryText: "firm-specific",
      entryTree: '["assets","","firm-specific"]',
      id: "assets--firm-specific--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "williamson-oliver",
      entryText: "Williamson, Oliver",
      entryTree: '["Williamson, Oliver"]',
      id: "williamson-oliver--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "matching-market--definition",
      entryText: "definition",
      entryTree: '["matching market","","definition"]',
      id: "matching-market--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "labour-market--matching",
      entryText: "matching",
      entryTree: '["labour market","","matching"]',
      id: "labour-market--matching--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "labour-market--flows",
      entryText: "flows",
      entryTree: '["labour market","","flows"]',
      id: "labour-market--flows--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "unemployment--and-labour-matching",
      entryText: "and labour matching",
      entryTree: '["unemployment","","and labour matching"]',
      id: "unemployment--and-labour-matching--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "labour-force--composition",
      entryText: "composition",
      entryTree: '["labour force","","composition"]',
      id: "labour-force--composition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "labour-market--flows",
      entryText: "flows",
      entryTree: '["labour market","","flows"]',
      id: "labour-market--flows--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
    {
      entrySlug: "european-union--labour-market-flows",
      entryText: "labour market flows",
      entryTree: '["European Union","","labour market flows"]',
      id: "european-union--labour-market-flows--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-04-finding-jobs.html",
    },
  ],
  [
    {
      entrySlug: "wage-setting",
      entryText: "wage setting",
      entryTree: '["wage setting"]',
      id: "wage-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-05-reservation-wage-curve.html",
    },
    {
      entrySlug: "reservation-option",
      entryText: "reservation option",
      entryTree: '["reservation option"]',
      id: "reservation-option--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-05-reservation-wage-curve.html",
    },
    {
      entrySlug: "utility",
      entryText: "utility",
      entryTree: '["utility"]',
      id: "utility--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-05-reservation-wage-curve.html",
    },
    {
      entrySlug: "wages--reservation",
      entryText: "reservation",
      entryTree: '["wages","","reservation"]',
      id: "wages--reservation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-05-reservation-wage-curve.html",
    },
    {
      entrySlug: "reservation-wages--definition",
      entryText: "definition",
      entryTree: '["reservation wages","","definition"]',
      id: "reservation-wages--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-05-reservation-wage-curve.html",
    },
  ],
  [
    {
      entrySlug: "incomplete-contracts--and-employment",
      entryText: "and employment",
      entryTree: '["incomplete contracts","","and employment"]',
      id: "incomplete-contracts--and-employment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "firestone-tyres",
      entryText: "Firestone Tyres",
      entryTree: '["Firestone Tyres"]',
      id: "firestone-tyres--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "contracts--incomplete",
      entryText: "incomplete",
      entryTree: '["contracts","","incomplete"]',
      id: "contracts--incomplete--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "enforceable--definition",
      entryText: "definition",
      entryTree: '["enforceable","","definition"]',
      id: "enforceable--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "principal-agent-problems--in-employment-relationship",
      entryText: "in employment relationship",
      entryTree: '["principal-agent problems","","in employment relationship"]',
      id: "principal-agent-problems--in-employment-relationship--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "principal-agent-problems--definition",
      entryText: "definition",
      entryTree: '["principal-agent problems","","definition"]',
      id: "principal-agent-problems--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "information--verifiable",
      entryText: "verifiable",
      entryTree: '["information","","verifiable"]',
      id: "information--verifiable--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "information--asymmetric",
      entryText: "asymmetric",
      entryTree: '["information","","asymmetric"]',
      id: "information--asymmetric--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "incentives--employees",
      entryText: "employees",
      entryTree: '["incentives","","employees"]',
      id: "incentives--employees--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "incentives--definition",
      entryText: "definition",
      entryTree: '["incentives","","definition"]',
      id: "incentives--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
    {
      entrySlug: "piece-rate--definition",
      entryText: "definition",
      entryTree: '["piece rate","","definition"]',
      id: "piece-rate--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-06-contracts-principals-agents.html",
    },
  ],
  [
    {
      entrySlug: "economic-rent",
      entryText: "economic rent",
      entryTree: '["economic rent"]',
      id: "economic-rent--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "employment-rent",
      entryText: "employment rent",
      entryTree: '["employment rent"]',
      id: "employment-rent--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "marx-karl",
      entryText: "Marx, Karl",
      entryTree: '["Marx, Karl"]',
      id: "marx-karl--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "marx-karl--communist-manifesto",
      entryText: "*Communist Manifesto*",
      entryTree: '["Marx, Karl","","*Communist Manifesto*"]',
      id: "marx-karl--communist-manifesto--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "marx-karl--capital",
      entryText: "*Capital*",
      entryTree: '["Marx, Karl","","*Capital*"]',
      id: "marx-karl--capital--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "marx-karl--capital",
      entryText: "*Capital*",
      entryTree: '["Marx, Karl","","*Capital*"]',
      id: "marx-karl--capital--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "capitalism",
      entryText: "capitalism",
      entryTree: '["capitalism"]',
      id: "capitalism--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "inequality--definition",
      entryText: "definition",
      entryTree: '["inequality","","definition"]',
      id: "inequality--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "marx-karl",
      entryText: "Marx, Karl",
      entryTree: '["Marx, Karl"]',
      id: "marx-karl--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "job-loss--cost-of",
      entryText: "cost of",
      entryTree: '["job loss","","cost of"]',
      id: "job-loss--cost-of--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "employment-rent--calculation-of",
      entryText: "calculation of",
      entryTree: '["employment rent","","calculation of"]',
      id: "employment-rent--calculation-of--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "unemployment--costs-of",
      entryText: "costs of",
      entryTree: '["unemployment","","costs of"]',
      id: "unemployment--costs-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "disutility-of-work",
      entryText: "disutility of work",
      entryTree: '["disutility of work"]',
      id: "disutility-of-work--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "unemployment--duration-of-by-country",
      entryText: "duration of by country",
      entryTree: '["unemployment","","duration of by country"]',
      id: "unemployment--duration-of-by-country--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "job-loss--cost-of",
      entryText: "cost of",
      entryTree: '["job loss","","cost of"]',
      id: "job-loss--cost-of--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
    {
      entrySlug: "employment-rent--calculation-of",
      entryText: "calculation of",
      entryTree: '["employment rent","","calculation of"]',
      id: "employment-rent--calculation-of--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-07-job-loss-cost.html",
    },
  ],
  [
    {
      entrySlug: "unemployment-benefit--definition",
      entryText: "definition",
      entryTree: '["unemployment benefit","","definition"]',
      id: "unemployment-benefit--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-08-rents-reservation-wages.html",
    },
    {
      entrySlug: "reservation-wages--calculating",
      entryText: "calculating",
      entryTree: '["reservation wages","","calculating"]',
      id: "reservation-wages--calculating--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-08-rents-reservation-wages.html",
    },
    {
      entrySlug: "reservation-wages--calculating",
      entryText: "calculating",
      entryTree: '["reservation wages","","calculating"]',
      id: "reservation-wages--calculating--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-08-rents-reservation-wages.html",
    },
  ],
  [
    {
      entrySlug: "labour-discipline-model",
      entryText: "labour discipline model",
      entryTree: '["labour discipline model"]',
      id: "labour-discipline-model--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
    {
      entrySlug: "wage-setting--and-work-effort",
      entryText: "and work effort",
      entryTree: '["wage setting","","and work effort"]',
      id: "wage-setting--and-work-effort--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
    {
      entrySlug: "wage-setting--nash-equilibrium",
      entryText: "Nash equilibrium",
      entryTree: '["wage setting","","Nash equilibrium"]',
      id: "wage-setting--nash-equilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
    {
      entrySlug: "nash-equilibrium--wage-setting",
      entryText: "wage setting",
      entryTree: '["Nash equilibrium","","wage setting"]',
      id: "nash-equilibrium--wage-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
    {
      entrySlug: "wage-setting--and-work-effort",
      entryText: "and work effort",
      entryTree: '["wage setting","","and work effort"]',
      id: "wage-setting--and-work-effort--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
    {
      entrySlug: "no-shirking-condition",
      entryText: "no-shirking condition",
      entryTree: '["no-shirking condition"]',
      id: "no-shirking-condition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
    {
      entrySlug: "no-shirking-wage--definition",
      entryText: "definition",
      entryTree: '["no-shirking wage","","definition"]',
      id: "no-shirking-wage--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-09-labour-discipline-model.html",
    },
  ],
  [
    {
      entrySlug: "reservation-wages",
      entryText: "reservation wages",
      entryTree: '["reservation wages"]',
      id: "reservation-wages--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "labour-discipline-problem",
      entryText: "labour discipline problem",
      entryTree: '["labour discipline problem"]',
      id: "labour-discipline-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "no-shirking-wage",
      entryText: "no-shirking wage",
      entryTree: '["no-shirking wage"]',
      id: "no-shirking-wage--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "employment-rent",
      entryText: "employment rent",
      entryTree: '["employment rent"]',
      id: "employment-rent--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "no-shirking-wage--curve",
      entryText: "curve",
      entryTree: '["no-shirking wage","","curve"]',
      id: "no-shirking-wage--curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "no-shirking-wage--curve",
      entryText: "curve",
      entryTree: '["no-shirking wage","","curve"]',
      id: "no-shirking-wage--curve--iid-2",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "no-shirking-wage--curve",
      entryText: "curve",
      entryTree: '["no-shirking wage","","curve"]',
      id: "no-shirking-wage--curve--iid-3",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "labour-market--power",
      entryText: "power",
      entryTree: '["labour market","","power"]',
      id: "labour-market--power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "firms--wage-setting",
      entryText: "wage setting",
      entryTree: '["firms","","wage setting"]',
      id: "firms--wage-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
    {
      entrySlug: "firms--and-power",
      entryText: "and power",
      entryTree: '["firms","","and power"]',
      id: "firms--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-10-wage-setting-model.html",
    },
  ],
  [
    {
      entrySlug: "search-unemployment",
      entryText: "search unemployment",
      entryTree: '["search unemployment"]',
      id: "search-unemployment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "unemployment--frictional",
      entryText: "frictional",
      entryTree: '["unemployment","","frictional"]',
      id: "unemployment--frictional--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "unemployment--voluntary",
      entryText: "'voluntary'",
      entryTree: '["unemployment","","\'voluntary\'"]',
      id: "unemployment--voluntary--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "unemployment--involuntary",
      entryText: "involuntary",
      entryTree: '["unemployment","","involuntary"]',
      id: "unemployment--involuntary--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "no-shirking-wage--curve",
      entryText: "curve",
      entryTree: '["no-shirking wage","","curve"]',
      id: "no-shirking-wage--curve--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "no-shirking-wage--calculating",
      entryText: "calculating",
      entryTree: '["no-shirking wage","","calculating"]',
      id: "no-shirking-wage--calculating--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "no-shirking-wage--calculating",
      entryText: "calculating",
      entryTree: '["no-shirking wage","","calculating"]',
      id: "no-shirking-wage--calculating--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "wages--and-employment",
      entryText: "and employment",
      entryTree: '["wages","","and employment"]',
      id: "wages--and-employment--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "employment-level--and-wages",
      entryText: "and wages",
      entryTree: '["employment level","","and wages"]',
      id: "employment-level--and-wages--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "no-shirking-wage--curve",
      entryText: "curve",
      entryTree: '["no-shirking wage","","curve"]',
      id: "no-shirking-wage--curve--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "wages--and-unemployment",
      entryText: "and unemployment",
      entryTree: '["wages","","and unemployment"]',
      id: "wages--and-unemployment--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "unemployment--and-wages",
      entryText: "and wages",
      entryTree: '["unemployment","","and wages"]',
      id: "unemployment--and-wages--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "wages--and-unemployment",
      entryText: "and unemployment",
      entryTree: '["wages","","and unemployment"]',
      id: "wages--and-unemployment--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "unemployment--and-wages",
      entryText: "and wages",
      entryTree: '["unemployment","","and wages"]',
      id: "unemployment--and-wages--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "wages--and-employment",
      entryText: "and employment",
      entryTree: '["wages","","and employment"]',
      id: "wages--and-employment--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "global-financial-crisis",
      entryText: "global financial crisis",
      entryTree: '["global financial crisis"]',
      id: "global-financial-crisis--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "lazear-edward",
      entryText: "Lazear, Edward",
      entryTree: '["Lazear, Edward"]',
      id: "lazear-edward--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "recession",
      entryText: "recession",
      entryTree: '["recession"]',
      id: "recession--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "wages--and-recession",
      entryText: "and recession",
      entryTree: '["wages","","and recession"]',
      id: "wages--and-recession--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "bewley-truman",
      entryText: "Bewley, Truman",
      entryTree: '["Bewley, Truman"]',
      id: "bewley-truman--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "recession",
      entryText: "recession",
      entryTree: '["recession"]',
      id: "recession--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
    {
      entrySlug: "wages--and-recession",
      entryText: "and recession",
      entryTree: '["wages","","and recession"]',
      id: "wages--and-recession--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-11-wages-employment-unemployment.html",
    },
  ],
  [
    {
      entrySlug: "power--employers",
      entryText: "employers'",
      entryTree: '["power","","employers\'"]',
      id: "power--employers--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-12-employers-exercise-power.html",
    },
    {
      entrySlug: "robinson-joan",
      entryText: "Robinson, Joan",
      entryTree: '["Robinson, Joan"]',
      id: "robinson-joan--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-12-employers-exercise-power.html",
    },
    {
      entrySlug: "firms--and-power",
      entryText: "and power",
      entryTree: '["firms","","and power"]',
      id: "firms--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-12-employers-exercise-power.html",
    },
    {
      entrySlug: "monopsony-power",
      entryText: "monopsony power",
      entryTree: '["monopsony power"]',
      id: "monopsony-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-12-employers-exercise-power.html",
    },
    {
      entrySlug: "labour-market--power",
      entryText: "power",
      entryTree: '["labour market","","power"]',
      id: "labour-market--power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-12-employers-exercise-power.html",
    },
    {
      entrySlug: "power--employers",
      entryText: "employers'",
      entryTree: '["power","","employers\'"]',
      id: "power--employers--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-12-employers-exercise-power.html",
    },
  ],
  [
    {
      entrySlug: "wages--statutory-minimum",
      entryText: "statutory minimum",
      entryTree: '["wages","","statutory minimum"]',
      id: "wages--statutory-minimum--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-13-minimum-wage.html",
    },
    {
      entrySlug: "employment--and-minimum-wage",
      entryText: "and minimum wage",
      entryTree: '["employment","","and minimum wage"]',
      id: "employment--and-minimum-wage--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-13-minimum-wage.html",
    },
    {
      entrySlug: "minimum-wage--definition",
      entryText: "definition",
      entryTree: '["minimum wage","","definition"]',
      id: "minimum-wage--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-13-minimum-wage.html",
    },
    {
      entrySlug: "employment--and-minimum-wage",
      entryText: "and minimum wage",
      entryTree: '["employment","","and minimum wage"]',
      id: "employment--and-minimum-wage--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-13-minimum-wage.html",
    },
  ],
  [
    {
      entrySlug: "worker-owned-cooperative",
      entryText: "worker-owned cooperative",
      entryTree: '["worker-owned cooperative"]',
      id: "worker-owned-cooperative--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "cooperatives--worker-owned",
      entryText: "worker-owned",
      entryTree: '["cooperatives","","worker-owned"]',
      id: "cooperatives--worker-owned--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "cooperatives",
      entryText: "cooperatives",
      entryTree: '["cooperatives"]',
      id: "cooperatives--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "firms--cooperative",
      entryText: "cooperative",
      entryTree: '["firms","","cooperative"]',
      id: "firms--cooperative--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "john-lewis-partnership",
      entryText: "John Lewis Partnership",
      entryTree: '["John Lewis Partnership"]',
      id: "john-lewis-partnership--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "mill-john-stuart--on-liberty",
      entryText: "*On Liberty*",
      entryTree: '["Mill, John Stuart","","*On Liberty*"]',
      id: "mill-john-stuart--on-liberty--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "mill-john-stuart",
      entryText: "Mill, John Stuart",
      entryTree: '["Mill, John Stuart"]',
      id: "mill-john-stuart--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "mill-john-stuart--the-principles-of-political-economy",
      entryText: "*The Principles of Political Economy*",
      entryTree: '["Mill, John Stuart","","*The Principles of Political Economy*"]',
      id: "mill-john-stuart--the-principles-of-political-economy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
    {
      entrySlug: "mill-john-stuart",
      entryText: "Mill, John Stuart",
      entryTree: '["Mill, John Stuart"]',
      id: "mill-john-stuart--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "06-firm-and-employees-14-business-organization.html",
    },
  ],
  [
    {
      entrySlug: "cohen-jack",
      entryText: "Cohen, Jack",
      entryTree: '["Cohen, Jack"]',
      id: "cohen-jack--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "tesco",
      entryText: "Tesco",
      entryTree: '["Tesco"]',
      id: "tesco--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "market-share--definition",
      entryText: "definition",
      entryTree: '["market share","","definition"]',
      id: "market-share--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "profits--margin",
      entryText: "margin",
      entryTree: '["profits","","margin"]',
      id: "profits--margin--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "profits--definition",
      entryText: "definition",
      entryTree: '["profits","","definition"]',
      id: "profits--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "kamprad-ingvar",
      entryText: "Kamprad, Ingvar",
      entryTree: '["Kamprad, Ingvar"]',
      id: "kamprad-ingvar--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "jobs-steve",
      entryText: "Jobs, Steve",
      entryTree: '["Jobs, Steve"]',
      id: "jobs-steve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "kristiansen-ole-kirk",
      entryText: "Kristiansen, Ole Kirk",
      entryTree: '["Kristiansen, Ole Kirk"]',
      id: "kristiansen-ole-kirk--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "apple",
      entryText: "Apple",
      entryTree: '["Apple"]',
      id: "apple--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "ikea",
      entryText: "IKEA",
      entryTree: '["IKEA"]',
      id: "ikea--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "lego",
      entryText: "Lego",
      entryTree: '["Lego"]',
      id: "lego--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "product--differentiation",
      entryText: "differentiation",
      entryTree: '["product","","differentiation"]',
      id: "product--differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "innovation--and-cost-reduction",
      entryText: "and cost reduction",
      entryTree: '["innovation","","and cost reduction"]',
      id: "innovation--and-cost-reduction--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "outsourcing",
      entryText: "outsourcing",
      entryTree: '["outsourcing"]',
      id: "outsourcing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "firms--and-legal-framework",
      entryText: "and legal framework",
      entryTree: '["firms","","and legal framework"]',
      id: "firms--and-legal-framework--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
    {
      entrySlug: "firms--decision-making-in",
      entryText: "decision-making in",
      entryTree: '["firms","","decision-making in"]',
      id: "firms--decision-making-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-01-winning-brands.html",
    },
  ],
  [
    {
      entrySlug: "breakfast-cereal-case-study",
      entryText: "breakfast cereal case study",
      entryTree: '["breakfast cereal case study"]',
      id: "breakfast-cereal-case-study--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "kelloggs-corn-flakes",
      entryText: "Kellogg's Corn Flakes",
      entryTree: '["Kellogg\'s Corn Flakes"]',
      id: "kelloggs-corn-flakes--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "quaker-oats-puffed-rice",
      entryText: "Quaker Oats Puffed Rice",
      entryTree: '["Quaker Oats Puffed Rice"]',
      id: "quaker-oats-puffed-rice--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "revenue--definition",
      entryText: "definition",
      entryTree: '["revenue","","definition"]',
      id: "revenue--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "profits--calculation-of",
      entryText: "calculation of",
      entryTree: '["profits","","calculation of"]',
      id: "profits--calculation-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "costs--total",
      entryText: "total",
      entryTree: '["costs","","total"]',
      id: "costs--total--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "isoprofit-curves",
      entryText: "isoprofit curves",
      entryTree: '["isoprofit curves"]',
      id: "isoprofit-curves--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "indifference-curves",
      entryText: "indifference curves",
      entryTree: '["indifference curves"]',
      id: "indifference-curves--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "demand--price-elasticity",
      entryText: "price elasticity",
      entryTree: '["demand","","price elasticity"]',
      id: "demand--price-elasticity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "demand-curve--definition",
      entryText: "definition",
      entryTree: '["demand curve","","definition"]',
      id: "demand-curve--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "general-mills-cereal-demand-curve-problem",
      entryText: "General Mills cereal demand curve problem",
      entryTree: '["General Mills cereal demand curve problem"]',
      id: "general-mills-cereal-demand-curve-problem--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "general-mills",
      entryText: "General Mills",
      entryTree: '["General Mills"]',
      id: "general-mills--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "hausman-jerry",
      entryText: "Hausman, Jerry",
      entryTree: '["Hausman, Jerry"]',
      id: "hausman-jerry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "demand-curve--estimating",
      entryText: "estimating",
      entryTree: '["demand curve","","estimating"]',
      id: "demand-curve--estimating--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "constrained-choice-problem",
      entryText: "constrained choice problem",
      entryTree: '["constrained choice problem"]',
      id: "constrained-choice-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "profits--function",
      entryText: "function",
      entryTree: '["profits","","function"]',
      id: "profits--function--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
    {
      entrySlug: "general-mills-cereal-demand-curve-problem",
      entryText: "General Mills cereal demand curve problem",
      entryTree: '["General Mills cereal demand curve problem"]',
      id: "general-mills-cereal-demand-curve-problem--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-02-breakfast-cereal.html",
    },
  ],
  [
    {
      entrySlug: "firms--size",
      entryText: "size",
      entryTree: '["firms","","size"]',
      id: "firms--size--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "economies-of-scale",
      entryText: "economies of scale",
      entryTree: '["economies of scale"]',
      id: "economies-of-scale--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "nestle",
      entryText: "Nestlé",
      entryTree: '["Nestlé"]',
      id: "nestle--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "general-mills",
      entryText: "General Mills",
      entryTree: '["General Mills"]',
      id: "general-mills--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "samsung",
      entryText: "Samsung",
      entryTree: '["Samsung"]',
      id: "samsung--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "meta",
      entryText: "Meta",
      entryTree: '["Meta"]',
      id: "meta--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "facebook",
      entryText: "Facebook",
      entryTree: '["Facebook"]',
      id: "facebook--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "microsoft",
      entryText: "Microsoft",
      entryTree: '["Microsoft"]',
      id: "microsoft--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "apple",
      entryText: "Apple",
      entryTree: '["Apple"]',
      id: "apple--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "amazon",
      entryText: "Amazon",
      entryTree: '["Amazon"]',
      id: "amazon--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "walmart",
      entryText: "Walmart",
      entryTree: '["Walmart"]',
      id: "walmart--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "outsourcing--services",
      entryText: "services",
      entryTree: '["outsourcing","","services"]',
      id: "outsourcing--services--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "kroger",
      entryText: "Kroger",
      entryTree: '["Kroger"]',
      id: "kroger--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "tata-consultancy-services",
      entryText: "Tata Consultancy Services",
      entryTree: '["Tata Consultancy Services"]',
      id: "tata-consultancy-services--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "united-parcel-service-ups",
      entryText: "United Parcel Service (UPS)",
      entryTree: '["United Parcel Service (UPS)"]',
      id: "united-parcel-service-ups--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "deutsche-post",
      entryText: "Deutsche Post",
      entryTree: '["Deutsche Post"]',
      id: "deutsche-post--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "accenture",
      entryText: "Accenture",
      entryTree: '["Accenture"]',
      id: "accenture--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "volkswagen",
      entryText: "Volkswagen",
      entryTree: '["Volkswagen"]',
      id: "volkswagen--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "bargaining-power--definition",
      entryText: "definition",
      entryTree: '["bargaining power","","definition"]',
      id: "bargaining-power--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "bargaining-power--large-firms",
      entryText: "large firms",
      entryTree: '["bargaining power","","large firms"]',
      id: "bargaining-power--large-firms--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "fixed-costs",
      entryText: "fixed costs",
      entryTree: '["fixed costs"]',
      id: "fixed-costs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "production--economies-of-scale",
      entryText: "economies of scale",
      entryTree: '["production","","economies of scale"]',
      id: "production--economies-of-scale--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "economies-of-scale--in-production",
      entryText: "in production",
      entryTree: '["economies of scale","","in production"]',
      id: "economies-of-scale--in-production--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "production--economies-of-scale",
      entryText: "economies of scale",
      entryTree: '["production","","economies of scale"]',
      id: "production--economies-of-scale--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "economies-of-scale--in-production",
      entryText: "in production",
      entryTree: '["economies of scale","","in production"]',
      id: "economies-of-scale--in-production--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "returns-to-scale--constant",
      entryText: "constant",
      entryTree: '["returns to scale","","constant"]',
      id: "returns-to-scale--constant--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "diseconomies--of-scale",
      entryText: "of scale",
      entryTree: '["diseconomies","","of scale"]',
      id: "diseconomies--of-scale--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "returns-to-scale--decreasing",
      entryText: "decreasing",
      entryTree: '["returns to scale","","decreasing"]',
      id: "returns-to-scale--decreasing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "returns-to-scale--increasing",
      entryText: "increasing",
      entryTree: '["returns to scale","","increasing"]',
      id: "returns-to-scale--increasing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "specialization--and-economies-of-scale",
      entryText: "and economies of scale",
      entryTree: '["specialization","","and economies of scale"]',
      id: "specialization--and-economies-of-scale--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "research-and-development-r-and-d",
      entryText: "research and development (R&D)",
      entryTree: '["research and development (R&D)"]',
      id: "research-and-development-r-and-d--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "networks--economies-of-scale",
      entryText: "economies of scale",
      entryTree: '["networks","","economies of scale"]',
      id: "networks--economies-of-scale--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
    {
      entrySlug: "economies-of-scale",
      entryText: "economies of scale",
      entryTree: '["economies of scale"]',
      id: "economies-of-scale--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-03-large-scale-production.html",
    },
  ],
  [
    {
      entrySlug: "cost-function--definition",
      entryText: "definition",
      entryTree: '["cost function","","definition"]',
      id: "cost-function--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "cost-function",
      entryText: "cost function",
      entryTree: '["cost function"]',
      id: "cost-function--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "beautiful-cars-case-study",
      entryText: "Beautiful Cars Case Study",
      entryTree: '["Beautiful Cars Case Study"]',
      id: "beautiful-cars-case-study--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "opportunity-cost--of-capital",
      entryText: "of capital",
      entryTree: '["opportunity cost","","of capital"]',
      id: "opportunity-cost--of-capital--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "opportunity-cost",
      entryText: "opportunity cost",
      entryTree: '["opportunity cost"]',
      id: "opportunity-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "costs--fixed",
      entryText: "fixed",
      entryTree: '["costs","","fixed"]',
      id: "costs--fixed--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "costs--variable",
      entryText: "variable",
      entryTree: '["costs","","variable"]',
      id: "costs--variable--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "costs--average",
      entryText: "average",
      entryTree: '["costs","","average"]',
      id: "costs--average--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "marginal-cost",
      entryText: "marginal cost",
      entryTree: '["marginal cost"]',
      id: "marginal-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "short-run--definition",
      entryText: "definition",
      entryTree: '["short run","","definition"]',
      id: "short-run--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "endogenous--definition",
      entryText: "definition",
      entryTree: '["endogenous","","definition"]',
      id: "endogenous--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "exogenous--definition",
      entryText: "definition",
      entryTree: '["exogenous","","definition"]',
      id: "exogenous--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "beautiful-cars-case-study",
      entryText: "Beautiful Cars Case Study",
      entryTree: '["Beautiful Cars Case Study"]',
      id: "beautiful-cars-case-study--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "long-run--definition",
      entryText: "definition",
      entryTree: '["long run","","definition"]',
      id: "long-run--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "stigler-george",
      entryText: "Stigler, George",
      entryTree: '["Stigler, George"]',
      id: "stigler-george--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "economies-of-scope",
      entryText: "economies of scope",
      entryTree: '["economies of scope"]',
      id: "economies-of-scope--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "koshal-manjulika",
      entryText: "Koshal, Manjulika",
      entryTree: '["Koshal, Manjulika"]',
      id: "koshal-manjulika--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "koshal-rajindar",
      entryText: "Koshal, Rajindar",
      entryTree: '["Koshal, Rajindar"]',
      id: "koshal-rajindar--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "cost-function",
      entryText: "cost function",
      entryTree: '["cost function"]',
      id: "cost-function--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
    {
      entrySlug: "cost-function",
      entryText: "cost function",
      entryTree: '["cost function"]',
      id: "cost-function--iid-3",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-04-beautiful-cars.html",
    },
  ],
  [
    {
      entrySlug: "product--differentiation",
      entryText: "differentiation",
      entryTree: '["product","","differentiation"]',
      id: "product--differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "demand-curve--definition",
      entryText: "definition",
      entryTree: '["demand curve","","definition"]',
      id: "demand-curve--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "willingness-to-pay-wtp--and-demand-curve",
      entryText: "and demand curve",
      entryTree: '["willingness to pay (WTP)","","and demand curve"]',
      id: "willingness-to-pay-wtp--and-demand-curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "willingness-to-pay-wtp--definition",
      entryText: "definition",
      entryTree: '["willingness to pay (WTP)","","definition"]',
      id: "willingness-to-pay-wtp--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "davenant-charles",
      entryText: "Davenant, Charles",
      entryTree: '["Davenant, Charles"]',
      id: "davenant-charles--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "king-gregory",
      entryText: "King, Gregory",
      entryTree: '["King, Gregory"]',
      id: "king-gregory--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "law-of-demand",
      entryText: "Law of Demand",
      entryTree: '["Law of Demand"]',
      id: "law-of-demand--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "demand--price-elasticity",
      entryText: "price elasticity",
      entryTree: '["demand","","price elasticity"]',
      id: "demand--price-elasticity--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "marginal-revenue--and-elasticity-of-demand",
      entryText: "and elasticity of demand",
      entryTree: '["marginal revenue","","and elasticity of demand"]',
      id: "marginal-revenue--and-elasticity-of-demand--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "marginal-revenue--definition",
      entryText: "definition",
      entryTree: '["marginal revenue","","definition"]',
      id: "marginal-revenue--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
    {
      entrySlug: "demand--price-elasticity",
      entryText: "price elasticity",
      entryTree: '["demand","","price elasticity"]',
      id: "demand--price-elasticity--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-05-demand-elasticity-revenue.html",
    },
  ],
  [
    {
      entrySlug: "profits--normal",
      entryText: "normal",
      entryTree: '["profits","","normal"]',
      id: "profits--normal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "profits--economic",
      entryText: "economic",
      entryTree: '["profits","","economic"]',
      id: "profits--economic--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "marginal-rate-of-transformation-mrt",
      entryText: "marginal rate of transformation (MRT)",
      entryTree: '["marginal rate of transformation (MRT)"]',
      id: "marginal-rate-of-transformation-mrt--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "marginal-rate-of-substitution-mrs",
      entryText: "marginal rate of substitution (MRS)",
      entryTree: '["marginal rate of substitution (MRS)"]',
      id: "marginal-rate-of-substitution-mrs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "profits--margin",
      entryText: "margin",
      entryTree: '["profits","","margin"]',
      id: "profits--margin--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "prices--markup",
      entryText: "markup",
      entryTree: '["prices","","markup"]',
      id: "prices--markup--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "price-markup",
      entryText: "price markup",
      entryTree: '["price markup"]',
      id: "price-markup--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "profits--maximization",
      entryText: "maximization",
      entryTree: '["profits","","maximization"]',
      id: "profits--maximization--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
    {
      entrySlug: "profits--maximization",
      entryText: "maximization",
      entryTree: '["profits","","maximization"]',
      id: "profits--maximization--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-06-maximize-profit.html",
    },
  ],
  [
    {
      entrySlug: "surplus--and-pareto-efficiency",
      entryText: "and Pareto efficiency",
      entryTree: '["surplus","","and Pareto efficiency"]',
      id: "surplus--and-pareto-efficiency--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "pareto-efficiency",
      entryText: "Pareto efficiency",
      entryTree: '["Pareto efficiency"]',
      id: "pareto-efficiency--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "gains--from-trade",
      entryText: "from trade",
      entryTree: '["gains","","from trade"]',
      id: "gains--from-trade--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "gains--from-exchange",
      entryText: "from exchange",
      entryTree: '["gains","","from exchange"]',
      id: "gains--from-exchange--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "surplus--joint",
      entryText: "joint",
      entryTree: '["surplus","","joint"]',
      id: "surplus--joint--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "economic-rent--definition",
      entryText: "definition",
      entryTree: '["economic rent","","definition"]',
      id: "economic-rent--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "willingness-to-pay-wtp--and-surplus",
      entryText: "and surplus",
      entryTree: '["willingness to pay (WTP)","","and surplus"]',
      id: "willingness-to-pay-wtp--and-surplus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "surplus--consumer-and-producer",
      entryText: "consumer and producer",
      entryTree: '["surplus","","consumer and producer"]',
      id: "surplus--consumer-and-producer--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "pareto-efficiency--and-surplus",
      entryText: "and surplus",
      entryTree: '["Pareto efficiency","","and surplus"]',
      id: "pareto-efficiency--and-surplus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "deadweight-loss",
      entryText: "deadweight loss",
      entryTree: '["deadweight loss"]',
      id: "deadweight-loss--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "pareto-improvement--definition",
      entryText: "definition",
      entryTree: '["Pareto improvement","","definition"]',
      id: "pareto-improvement--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "prices--discrimination",
      entryText: "discrimination",
      entryTree: '["prices","","discrimination"]',
      id: "prices--discrimination--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "deadweight-loss",
      entryText: "deadweight loss",
      entryTree: '["deadweight loss"]',
      id: "deadweight-loss--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "product--differentiation",
      entryText: "differentiation",
      entryTree: '["product","","differentiation"]',
      id: "product--differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
    {
      entrySlug: "bargaining-power--and-differentiated-goods",
      entryText: "and differentiated goods",
      entryTree: '["bargaining power","","and differentiated goods"]',
      id: "bargaining-power--and-differentiated-goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-07-divided-surplus.html",
    },
  ],
  [
    {
      entrySlug: "cournot-augustin",
      entryText: "Cournot, Augustin",
      entryTree: '["Cournot, Augustin"]',
      id: "cournot-augustin--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "price-setting",
      entryText: "price-setting",
      entryTree: '["price-setting"]',
      id: "price-setting--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "oligopoly-definition",
      entryText: "oligopoly, definition",
      entryTree: '["oligopoly, definition"]',
      id: "oligopoly-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "cournot-augustin--research-on-the-mathematical-principles-of-the-theory-of-wealth",
      entryText: "*Research on the Mathematical Principles of the Theory of Wealth*",
      entryTree: '["Cournot, Augustin","","*Research on the Mathematical Principles of the Theory of Wealth*"]',
      id: "cournot-augustin--research-on-the-mathematical-principles-of-the-theory-of-wealth--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "cournot-augustin",
      entryText: "Cournot, Augustin",
      entryTree: '["Cournot, Augustin"]',
      id: "cournot-augustin--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "power--market",
      entryText: "market",
      entryTree: '["power","","market"]',
      id: "power--market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "substitutes--definition",
      entryText: "definition",
      entryTree: '["substitutes","","definition"]',
      id: "substitutes--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "meta",
      entryText: "Meta",
      entryTree: '["Meta"]',
      id: "meta--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "facebook",
      entryText: "Facebook",
      entryTree: '["Facebook"]',
      id: "facebook--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "amazon",
      entryText: "Amazon",
      entryTree: '["Amazon"]',
      id: "amazon--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "power--monopoly",
      entryText: "monopoly",
      entryTree: '["power","","monopoly"]',
      id: "power--monopoly--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "monopoly--definition",
      entryText: "definition",
      entryTree: '["monopoly","","definition"]',
      id: "monopoly--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "monopoly-board-game",
      entryText: "Monopoly board game",
      entryTree: '["Monopoly board game"]',
      id: "monopoly-board-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "parker-brothers",
      entryText: "Parker Brothers",
      entryTree: '["Parker Brothers"]',
      id: "parker-brothers--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "market-share--definition",
      entryText: "definition",
      entryTree: '["market share","","definition"]',
      id: "market-share--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
    {
      entrySlug: "price-setting",
      entryText: "price-setting",
      entryTree: '["price-setting"]',
      id: "price-setting--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-08-price-setting-competition-market.html",
    },
  ],
  [
    {
      entrySlug: "product--differentiation",
      entryText: "differentiation",
      entryTree: '["product","","differentiation"]',
      id: "product--differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
    {
      entrySlug: "tesla",
      entryText: "Tesla",
      entryTree: '["Tesla"]',
      id: "tesla--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
    {
      entrySlug: "toyota",
      entryText: "Toyota",
      entryTree: '["Toyota"]',
      id: "toyota--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
    {
      entrySlug: "services--and-differentiation",
      entryText: "and differentiation",
      entryTree: '["services","","and differentiation"]',
      id: "services--and-differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
    {
      entrySlug: "advertising",
      entryText: "advertising",
      entryTree: '["advertising"]',
      id: "advertising--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
    {
      entrySlug: "shum-matthew",
      entryText: "Shum, Matthew",
      entryTree: '["Shum, Matthew"]',
      id: "shum-matthew--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
    {
      entrySlug: "brand-loyalty",
      entryText: "brand loyalty",
      entryTree: '["brand loyalty"]',
      id: "brand-loyalty--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-09-firms-differentiate-products.html",
    },
  ],
  [
    {
      entrySlug: "price-setting",
      entryText: "price-setting",
      entryTree: '["price-setting"]',
      id: "price-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-10-strategic-price-setting.html",
    },
    {
      entrySlug: "nash-equilibrium--price-setting",
      entryText: "price-setting",
      entryTree: '["Nash equilibrium","","price-setting"]',
      id: "nash-equilibrium--price-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-10-strategic-price-setting.html",
    },
  ],
  [
    {
      entrySlug: "firms--and-power",
      entryText: "and power",
      entryTree: '["firms","","and power"]',
      id: "firms--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "firms--price-setting",
      entryText: "price-setting",
      entryTree: '["firms","","price-setting"]',
      id: "firms--price-setting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "markets--and-power",
      entryText: "and power",
      entryTree: '["markets","","and power"]',
      id: "markets--and-power--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "product--differentiation",
      entryText: "differentiation",
      entryTree: '["product","","differentiation"]',
      id: "product--differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "monopoly--natural",
      entryText: "natural",
      entryTree: '["monopoly","","natural"]',
      id: "monopoly--natural--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "costs--first-copy",
      entryText: "first copy",
      entryTree: '["costs","","first copy"]',
      id: "costs--first-copy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "google",
      entryText: "Google",
      entryTree: '["Google"]',
      id: "google--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "costs--average",
      entryText: "average",
      entryTree: '["costs","","average"]',
      id: "costs--average--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "economies-of-scale--digital-companies",
      entryText: "digital companies",
      entryTree: '["economies of scale","","digital companies"]',
      id: "economies-of-scale--digital-companies--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "youtube",
      entryText: "YouTube",
      entryTree: '["YouTube"]',
      id: "youtube--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
    {
      entrySlug: "facebook",
      entryText: "Facebook",
      entryTree: '["Facebook"]',
      id: "facebook--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-11-decreasing-long-run-costs.html",
    },
  ],
  [
    {
      entrySlug: "eeckhout-jan",
      entryText: "Eeckhout, Jan",
      entryTree: '["Eeckhout, Jan"]',
      id: "eeckhout-jan--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "government--and-competition-policy",
      entryText: "and competition policy",
      entryTree: '["government","","and competition policy"]',
      id: "government--and-competition-policy--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "competition-policy",
      entryText: "competition policy",
      entryTree: '["competition policy"]',
      id: "competition-policy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "antitrust-policy",
      entryText: "antitrust policy",
      entryTree: '["antitrust policy"]',
      id: "antitrust-policy--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "ferrero",
      entryText: "Ferrero",
      entryTree: '["Ferrero"]',
      id: "ferrero--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "pharmaceuticals-industry",
      entryText: "pharmaceuticals industry",
      entryTree: '["pharmaceuticals industry"]',
      id: "pharmaceuticals-industry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "intellectual-property-rights",
      entryText: "intellectual property rights",
      entryTree: '["intellectual property rights"]',
      id: "intellectual-property-rights--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "research-and-development-r-and-d",
      entryText: "research and development (R&D)",
      entryTree: '["research and development (R&D)"]',
      id: "research-and-development-r-and-d--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "patents--and-r-and-d",
      entryText: "and R&D",
      entryTree: '["patents","","and R&D"]',
      id: "patents--and-r-and-d--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "digital-markets--competition-in",
      entryText: "competition in",
      entryTree: '["digital markets","","competition in"]',
      id: "digital-markets--competition-in--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "microsoft",
      entryText: "Microsoft",
      entryTree: '["Microsoft"]',
      id: "microsoft--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "oil-prices",
      entryText: "oil prices",
      entryTree: '["oil prices"]',
      id: "oil-prices--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "whatsapp",
      entryText: "WhatsApp",
      entryTree: '["WhatsApp"]',
      id: "whatsapp--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "instagram",
      entryText: "Instagram",
      entryTree: '["Instagram"]',
      id: "instagram--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "opec",
      entryText: "OPEC",
      entryTree: '["OPEC"]',
      id: "opec--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "cartel",
      entryText: "cartel",
      entryTree: '["cartel"]',
      id: "cartel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "meta",
      entryText: "Meta",
      entryTree: '["Meta"]',
      id: "meta--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "facebook",
      entryText: "Facebook",
      entryTree: '["Facebook"]',
      id: "facebook--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "google",
      entryText: "Google",
      entryTree: '["Google"]',
      id: "google--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "advertising",
      entryText: "advertising",
      entryTree: '["advertising"]',
      id: "advertising--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "monopoly--natural",
      entryText: "natural",
      entryTree: '["monopoly","","natural"]',
      id: "monopoly--natural--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
    {
      entrySlug: "government--and-competition-policy",
      entryText: "and competition policy",
      entryTree: '["government","","and competition policy"]',
      id: "government--and-competition-policy--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "07-firm-and-customers-12-influencing-market-power.html",
    },
  ],
  [
    {
      entrySlug: "industrial-revolution--textile-industry",
      entryText: "textile industry",
      entryTree: '["Industrial Revolution","","textile industry"]',
      id: "industrial-revolution--textile-industry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "cotton",
      entryText: "cotton",
      entryTree: '["cotton"]',
      id: "cotton--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "slavery--american-south",
      entryText: "American South",
      entryTree: '["slavery","","American South"]',
      id: "slavery--american-south--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "lincoln-abraham",
      entryText: "Lincoln, Abraham",
      entryTree: '["Lincoln, Abraham"]',
      id: "lincoln-abraham--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "united-states--civil-war",
      entryText: "Civil War",
      entryTree: '["United States","","Civil War"]',
      id: "united-states--civil-war--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "blockade-civil-war",
      entryText: "blockade, Civil War",
      entryTree: '["blockade, Civil War"]',
      id: "blockade-civil-war--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "demand--excess",
      entryText: "excess",
      entryTree: '["demand","","excess"]',
      id: "demand--excess--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "slave-labour",
      entryText: "slave labour",
      entryTree: '["slave labour"]',
      id: "slave-labour--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "egypt--cotton-industry",
      entryText: "cotton industry",
      entryTree: '["Egypt","","cotton industry"]',
      id: "egypt--cotton-industry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "india--cotton-trade",
      entryText: "cotton trade",
      entryTree: '["India","","cotton trade"]',
      id: "india--cotton-trade--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "farnie-douglas",
      entryText: "Farnie, Douglas",
      entryTree: '["Farnie, Douglas"]',
      id: "farnie-douglas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "dobson-and-barlow",
      entryText: "Dobson and Barlow",
      entryTree: '["Dobson and Barlow"]',
      id: "dobson-and-barlow--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "united-kingdom--textile-industry",
      entryText: "textile industry",
      entryTree: '["United Kingdom","","textile industry"]',
      id: "united-kingdom--textile-industry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "brazil--cotton-growing",
      entryText: "cotton growing",
      entryTree: '["Brazil","","cotton growing"]',
      id: "brazil--cotton-growing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "self-interest",
      entryText: "self-interest",
      entryTree: '["self-interest"]',
      id: "self-interest--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "walmart",
      entryText: "Walmart",
      entryTree: '["Walmart"]',
      id: "walmart--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "central-planning--soviet-union",
      entryText: "Soviet Union",
      entryTree: '["central planning","","Soviet Union"]',
      id: "central-planning--soviet-union--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "central-planning--eastern-europe",
      entryText: "Eastern Europe",
      entryTree: '["central planning","","Eastern Europe"]',
      id: "central-planning--eastern-europe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "hayek-friedrich",
      entryText: "Hayek, Friedrich",
      entryTree: '["Hayek, Friedrich"]',
      id: "hayek-friedrich--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "schumpeter-joseph",
      entryText: "Schumpeter, Joseph",
      entryTree: '["Schumpeter, Joseph"]',
      id: "schumpeter-joseph--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "united-states--great-depression",
      entryText: "Great Depression",
      entryTree: '["United States","","Great Depression"]',
      id: "united-states--great-depression--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "great-depression",
      entryText: "Great Depression",
      entryTree: '["Great Depression"]',
      id: "great-depression--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "hayek-friedrich--the-road-to-serfdom",
      entryText: "*The Road to Serfdom*",
      entryTree: '["Hayek, Friedrich","","*The Road to Serfdom*"]',
      id: "hayek-friedrich--the-road-to-serfdom--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "germany--central-planning",
      entryText: "central planning",
      entryTree: '["Germany","","central planning"]',
      id: "germany--central-planning--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "japan--wartime-central-planning",
      entryText: "wartime central planning",
      entryTree: '["Japan","","wartime central planning"]',
      id: "japan--wartime-central-planning--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "second-world-war",
      entryText: "Second World War",
      entryTree: '["Second World War"]',
      id: "second-world-war--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "central-planning--definition",
      entryText: "definition",
      entryTree: '["central planning","","definition"]',
      id: "central-planning--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "hayek-friedrich--the-use-of-knowledge-in-society",
      entryText: "*The Use of Knowledge in Society*",
      entryTree: '["Hayek, Friedrich","","*The Use of Knowledge in Society*"]',
      id: "hayek-friedrich--the-use-of-knowledge-in-society--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "central-planning--vs-market-competition",
      entryText: "vs market competition",
      entryTree: '["central planning","","vs market competition"]',
      id: "central-planning--vs-market-competition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
    {
      entrySlug: "hayek-friedrich",
      entryText: "Hayek, Friedrich",
      entryTree: '["Hayek, Friedrich"]',
      id: "hayek-friedrich--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-01-american-civil-war.html",
    },
  ],
  [
    {
      entrySlug: "product--differentiation",
      entryText: "differentiation",
      entryTree: '["product","","differentiation"]',
      id: "product--differentiation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "prices--market-clearing",
      entryText: "market clearing",
      entryTree: '["prices","","market clearing"]',
      id: "prices--market-clearing--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "willingness-to-pay-wtp--definition",
      entryText: "definition",
      entryTree: '["willingness to pay (WTP)","","definition"]',
      id: "willingness-to-pay-wtp--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "willingness-to-pay-wtp--and-demand-curve",
      entryText: "and demand curve",
      entryTree: '["willingness to pay (WTP)","","and demand curve"]',
      id: "willingness-to-pay-wtp--and-demand-curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "prices--reservation",
      entryText: "reservation",
      entryTree: '["prices","","reservation"]',
      id: "prices--reservation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "willingness-to-accept-wta",
      entryText: "willingness to accept (WTA)",
      entryTree: '["willingness to accept (WTA)"]',
      id: "willingness-to-accept-wta--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "supply-curve--definition",
      entryText: "definition",
      entryTree: '["supply curve","","definition"]',
      id: "supply-curve--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "grand-bazaar-istanbul",
      entryText: "Grand Bazaar, Istanbul",
      entryTree: '["Grand Bazaar, Istanbul"]',
      id: "grand-bazaar-istanbul--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "china--silk-road",
      entryText: "Silk Road",
      entryTree: '["China","","Silk Road"]',
      id: "china--silk-road--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "london-city-of",
      entryText: "London, City of",
      entryTree: '["London, City of"]',
      id: "london-city-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "corn-exchanges",
      entryText: "corn exchanges",
      entryTree: '["corn exchanges"]',
      id: "corn-exchanges--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "prices--market-clearing",
      entryText: "market clearing",
      entryTree: '["prices","","market clearing"]',
      id: "prices--market-clearing--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "economics-definition",
      entryText: "economics, definition",
      entryTree: '["economics, definition"]',
      id: "economics-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "marginal-utility--definition",
      entryText: "definition",
      entryTree: '["marginal utility","","definition"]',
      id: "marginal-utility--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "marginal-cost--definition",
      entryText: "definition",
      entryTree: '["marginal cost","","definition"]',
      id: "marginal-cost--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "walras-leon",
      entryText: "Walras, Léon",
      entryTree: '["Walras, Léon"]',
      id: "walras-leon--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "marshall-alfred--principles-of-economics",
      entryText: "*Principles of Economics*",
      entryTree: '["Marshall Alfred","","*Principles of Economics*"]',
      id: "marshall-alfred--principles-of-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "marshall-alfred",
      entryText: "Marshall, Alfred",
      entryTree: '["Marshall, Alfred"]',
      id: "marshall-alfred--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "homo-economicus",
      entryText: "*homo economicus*",
      entryTree: '["*homo economicus*"]',
      id: "homo-economicus--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "ethics",
      entryText: "ethics",
      entryTree: '["ethics"]',
      id: "ethics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "mathematics",
      entryText: "mathematics",
      entryTree: '["mathematics"]',
      id: "mathematics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
    {
      entrySlug: "bowley-a-l",
      entryText: "Bowley, A. L.",
      entryTree: '["Bowley, A. L."]',
      id: "bowley-a-l--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-02-buying-and-selling.html",
    },
  ],
  [
    {
      entrySlug: "price-taking",
      entryText: "price taking",
      entryTree: '["price taking"]',
      id: "price-taking--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
    {
      entrySlug: "equilibrium--competitive",
      entryText: "competitive",
      entryTree: '["equilibrium","","competitive"]',
      id: "equilibrium--competitive--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
    {
      entrySlug: "price-takers--definition",
      entryText: "definition",
      entryTree: '["price-takers","","definition"]',
      id: "price-takers--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
    {
      entrySlug: "price-taking",
      entryText: "price taking",
      entryTree: '["price taking"]',
      id: "price-taking--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
    {
      entrySlug: "smith-vernon",
      entryText: "Smith, Vernon",
      entryTree: '["Smith, Vernon"]',
      id: "smith-vernon--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
    {
      entrySlug: "chamberlin-edward",
      entryText: "Chamberlin, Edward",
      entryTree: '["Chamberlin, Edward"]',
      id: "chamberlin-edward--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
    {
      entrySlug: "equilibrium--competitive",
      entryText: "competitive",
      entryTree: '["equilibrium","","competitive"]',
      id: "equilibrium--competitive--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-03-competitive-equilibrium-price-taking.html",
    },
  ],
  [
    {
      entrySlug: "equilibrium--competitive",
      entryText: "competitive",
      entryTree: '["equilibrium","","competitive"]',
      id: "equilibrium--competitive--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-04-firms-in-competitive-equilibrium.html",
    },
    {
      entrySlug: "firms--price-takers",
      entryText: "price takers",
      entryTree: '["firms","","price takers"]',
      id: "firms--price-takers--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-04-firms-in-competitive-equilibrium.html",
    },
    {
      entrySlug: "marginal-cost--supply-curve",
      entryText: "supply curve",
      entryTree: '["marginal cost","","supply curve"]',
      id: "marginal-cost--supply-curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-04-firms-in-competitive-equilibrium.html",
    },
    {
      entrySlug: "supply-curve--marginal-cost-curve",
      entryText: "marginal cost curve",
      entryTree: '["supply curve","","marginal cost curve"]',
      id: "supply-curve--marginal-cost-curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-04-firms-in-competitive-equilibrium.html",
    },
  ],
  [
    {
      entrySlug: "gains--from-exchange",
      entryText: "from exchange",
      entryTree: '["gains","","from exchange"]',
      id: "gains--from-exchange--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "gains--from-trade",
      entryText: "from trade",
      entryTree: '["gains","","from trade"]',
      id: "gains--from-trade--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "trade--gains-from",
      entryText: "gains from",
      entryTree: '["trade","","gains from"]',
      id: "trade--gains-from--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "waldfogel-joel",
      entryText: "Waldfogel, Joel",
      entryTree: '["Waldfogel, Joel"]',
      id: "waldfogel-joel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "equilibrium--competitive",
      entryText: "competitive",
      entryTree: '["equilibrium","","competitive"]',
      id: "equilibrium--competitive--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "external-effects",
      entryText: "external effects",
      entryTree: '["external effects"]',
      id: "external-effects--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "pareto-efficiency--allocation",
      entryText: "allocation",
      entryTree: '["Pareto efficiency","","allocation"]',
      id: "pareto-efficiency--allocation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "allocation--pareto-efficient",
      entryText: "Pareto efficient",
      entryTree: '["allocation","","Pareto efficient"]',
      id: "allocation--pareto-efficient--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "contracts--complete",
      entryText: "complete",
      entryTree: '["contracts","","complete"]',
      id: "contracts--complete--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "gains--from-trade",
      entryText: "from trade",
      entryTree: '["gains","","from trade"]',
      id: "gains--from-trade--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
    {
      entrySlug: "trade--gains-from",
      entryText: "gains from",
      entryTree: '["trade","","gains from"]',
      id: "trade--gains-from--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-05-gains-from-trade.html",
    },
  ],
  [
    {
      entrySlug: "bolivia",
      entryText: "Bolivia",
      entryTree: '["Bolivia"]',
      id: "bolivia--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "peru",
      entryText: "Peru",
      entryTree: '["Peru"]',
      id: "peru--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "quinoa",
      entryText: "quinoa",
      entryTree: '["quinoa"]',
      id: "quinoa--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "quinoa",
      entryText: "quinoa",
      entryTree: '["quinoa"]',
      id: "quinoa--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "shocks--exogenous",
      entryText: "exogenous",
      entryTree: '["shocks","","exogenous"]',
      id: "shocks--exogenous--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "rent-seeking--equilibrium",
      entryText: "equilibrium",
      entryTree: '["rent-seeking","","equilibrium"]',
      id: "rent-seeking--equilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "rent-seeking--disequilibrium",
      entryText: "disequilibrium",
      entryTree: '["rent-seeking","","disequilibrium"]',
      id: "rent-seeking--disequilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "rent--disequilibrium",
      entryText: "disequilibrium",
      entryTree: '["rent","","disequilibrium"]',
      id: "rent--disequilibrium--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
    {
      entrySlug: "shocks--supply",
      entryText: "supply",
      entryTree: '["shocks","","supply"]',
      id: "shocks--supply--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-06-changes-in-supply-demand.html",
    },
  ],
  [
    {
      entrySlug: "equilibrium--short-run",
      entryText: "short run",
      entryTree: '["equilibrium","","short run"]',
      id: "equilibrium--short-run--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "equilibrium--long-run",
      entryText: "long run",
      entryTree: '["equilibrium","","long run"]',
      id: "equilibrium--long-run--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "long-run--definition",
      entryText: "definition",
      entryTree: '["long run","","definition"]',
      id: "long-run--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "short-run--definition",
      entryText: "definition",
      entryTree: '["short run","","definition"]',
      id: "short-run--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "opportunity-cost--of-capital",
      entryText: "of capital",
      entryTree: '["opportunity cost","","of capital"]',
      id: "opportunity-cost--of-capital--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "costs--of-entry",
      entryText: "of entry",
      entryTree: '["costs","","of entry"]',
      id: "costs--of-entry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "normal-profit--definition",
      entryText: "definition",
      entryTree: '["normal profit","","definition"]',
      id: "normal-profit--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "economic-profit--definition",
      entryText: "definition",
      entryTree: '["economic profit","","definition"]',
      id: "economic-profit--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "equilibrium--short-run",
      entryText: "short run",
      entryTree: '["equilibrium","","short run"]',
      id: "equilibrium--short-run--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "equilibrium--long-run",
      entryText: "long run",
      entryTree: '["equilibrium","","long run"]',
      id: "equilibrium--long-run--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "elasticity--short-run",
      entryText: "short run",
      entryTree: '["elasticity","","short run"]',
      id: "elasticity--short-run--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "elasticity--long-run",
      entryText: "long run",
      entryTree: '["elasticity","","long run"]',
      id: "elasticity--long-run--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "elasticity--short-run",
      entryText: "short run",
      entryTree: '["elasticity","","short run"]',
      id: "elasticity--short-run--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
    {
      entrySlug: "elasticity--long-run",
      entryText: "long run",
      entryTree: '["elasticity","","long run"]',
      id: "elasticity--long-run--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-07-equilibria.html",
    },
  ],
  [
    {
      entrySlug: "opec",
      entryText: "OPEC",
      entryTree: '["OPEC"]',
      id: "opec--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "oil--world-markets",
      entryText: "world markets",
      entryTree: '["oil","","world markets"]',
      id: "oil--world-markets--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "cartel",
      entryText: "cartel",
      entryTree: '["cartel"]',
      id: "cartel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "global-financial-crisis",
      entryText: "global financial crisis",
      entryTree: '["global financial crisis"]',
      id: "global-financial-crisis--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "covid-19--and-fall-in-oil-demand",
      entryText: "and fall in oil demand",
      entryTree: '["COVID-19","","and fall in oil demand"]',
      id: "covid-19--and-fall-in-oil-demand--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "covid-19--economic-effects",
      entryText: "economic effects",
      entryTree: '["COVID-19","","economic effects"]',
      id: "covid-19--economic-effects--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "fossil-fuels",
      entryText: "fossil fuels",
      entryTree: '["fossil fuels"]',
      id: "fossil-fuels--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "renewable-energy-sources--and-decline-in-fossil-fuels",
      entryText: "and decline in fossil fuels",
      entryTree: '["renewable energy sources","","and decline in fossil fuels"]',
      id: "renewable-energy-sources--and-decline-in-fossil-fuels--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "oil--substitutes-for",
      entryText: "substitutes for",
      entryTree: '["oil","","substitutes for"]',
      id: "oil--substitutes-for--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "russiaukraine-war--effect-on-oil-prices",
      entryText: "effect on oil prices",
      entryTree: '["Russia–Ukraine war","","effect on oil prices"]',
      id: "russiaukraine-war--effect-on-oil-prices--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
    {
      entrySlug: "oil--world-markets",
      entryText: "world markets",
      entryTree: '["oil","","world markets"]',
      id: "oil--world-markets--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-08-market-dynamics.html",
    },
  ],
  [
    {
      entrySlug: "cartel",
      entryText: "cartel",
      entryTree: '["cartel"]',
      id: "cartel--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-09-how-competition-works.html",
    },
    {
      entrySlug: "opec",
      entryText: "OPEC",
      entryTree: '["OPEC"]',
      id: "opec--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-09-how-competition-works.html",
    },
    {
      entrySlug: "barriers-to-entry",
      entryText: "barriers to entry",
      entryTree: '["barriers to entry"]',
      id: "barriers-to-entry--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-09-how-competition-works.html",
    },
    {
      entrySlug: "prisoners-dilemma",
      entryText: "prisoners' dilemma",
      entryTree: '["prisoners\' dilemma"]',
      id: "prisoners-dilemma--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-09-how-competition-works.html",
    },
  ],
  [
    {
      entrySlug: "prices--market-clearing",
      entryText: "market clearing",
      entryTree: '["prices","","market clearing"]',
      id: "prices--market-clearing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "law-of-one-price",
      entryText: "law of one price",
      entryTree: '["law of one price"]',
      id: "law-of-one-price--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "equilibrium--competitive",
      entryText: "competitive",
      entryTree: '["equilibrium","","competitive"]',
      id: "equilibrium--competitive--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "competition--perfect",
      entryText: "perfect",
      entryTree: '["competition","","perfect"]',
      id: "competition--perfect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "perfect-competition",
      entryText: "perfect competition",
      entryTree: '["perfect competition"]',
      id: "perfect-competition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "equilibrium--competitive",
      entryText: "competitive",
      entryTree: '["equilibrium","","competitive"]',
      id: "equilibrium--competitive--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "monopoly-board-game",
      entryText: "Monopoly board game",
      entryTree: '["Monopoly board game"]',
      id: "monopoly-board-game--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "competitive-equilibrium-model",
      entryText: "competitive equilibrium model",
      entryTree: '["competitive equilibrium model"]',
      id: "competitive-equilibrium-model--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "walras-leon--elements-of-theoretical-economics",
      entryText: "*Elements of Theoretical Economics*",
      entryTree: '["Walras, Léon","","*Elements of Theoretical Economics*"]',
      id: "walras-leon--elements-of-theoretical-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "walras-leon",
      entryText: "Walras, Léon",
      entryTree: '["Walras, Léon"]',
      id: "walras-leon--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "general-equilibrium-theory",
      entryText: "general equilibrium theory",
      entryTree: '["general equilibrium theory"]',
      id: "general-equilibrium-theory--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "walras-leon",
      entryText: "Walras, Léon",
      entryTree: '["Walras, Léon"]',
      id: "walras-leon--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "russia--bolshevik-revolution",
      entryText: "Bolshevik Revolution",
      entryTree: '["Russia","","Bolshevik Revolution"]',
      id: "russia--bolshevik-revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "russia",
      entryText: "Russia",
      entryTree: '["Russia"]',
      id: "russia--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "hayek-friedrich--the-meaning-of-competition",
      entryText: "*The Meaning of Competition*",
      entryTree: '["Hayek, Friedrich","","*The Meaning of Competition*"]',
      id: "hayek-friedrich--the-meaning-of-competition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "hayek-friedrich",
      entryText: "Hayek, Friedrich",
      entryTree: '["Hayek, Friedrich"]',
      id: "hayek-friedrich--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "research-and-development-r-and-d",
      entryText: "research and development (R&D)",
      entryTree: '["research and development (R&D)"]',
      id: "research-and-development-r-and-d--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "fulton-fish-market",
      entryText: "Fulton Fish Market",
      entryTree: '["Fulton Fish Market"]',
      id: "fulton-fish-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
    {
      entrySlug: "graddy-kathryn",
      entryText: "Graddy, Kathryn",
      entryTree: '["Graddy, Kathryn"]',
      id: "graddy-kathryn--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-10-supply-demand-competitive-equilibrium.html",
    },
  ],
  [
    {
      entrySlug: "fishing-industry",
      entryText: "fishing industry",
      entryTree: '["fishing industry"]',
      id: "fishing-industry--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-11-information-about-prices.html",
    },
    {
      entrySlug: "india--fishing",
      entryText: "fishing",
      entryTree: '["India","","fishing"]',
      id: "india--fishing--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-11-information-about-prices.html",
    },
    {
      entrySlug: "india--fishing",
      entryText: "fishing",
      entryTree: '["India","","fishing"]',
      id: "india--fishing--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-11-information-about-prices.html",
    },
    {
      entrySlug: "law-of-one-price",
      entryText: "law of one price",
      entryTree: '["law of one price"]',
      id: "law-of-one-price--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-11-information-about-prices.html",
    },
    {
      entrySlug: "mobile-phones",
      entryText: "mobile phones",
      entryTree: '["mobile phones"]',
      id: "mobile-phones--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-11-information-about-prices.html",
    },
    {
      entrySlug: "fishing-industry",
      entryText: "fishing industry",
      entryTree: '["fishing industry"]',
      id: "fishing-industry--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-11-information-about-prices.html",
    },
  ],
  [
    {
      entrySlug: "tobacco-taxes-on",
      entryText: "tobacco, taxes on",
      entryTree: '["tobacco, taxes on"]',
      id: "tobacco-taxes-on--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "tax--on-carbon-emissions",
      entryText: "on carbon emissions",
      entryTree: '["tax","","on carbon emissions"]',
      id: "tax--on-carbon-emissions--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "tax--effects-of",
      entryText: "effects of",
      entryTree: '["tax","","effects of"]',
      id: "tax--effects-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "india--salt-tax",
      entryText: "salt tax",
      entryTree: '["India","","salt tax"]',
      id: "india--salt-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "china--salt-tax",
      entryText: "salt tax",
      entryTree: '["China","","salt tax"]',
      id: "china--salt-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "russia--salt-tax",
      entryText: "salt tax",
      entryTree: '["Russia","","salt tax"]',
      id: "russia--salt-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "tax--revenues",
      entryText: "revenues",
      entryTree: '["tax","","revenues"]',
      id: "tax--revenues--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "salt-taxes-on",
      entryText: "salt, taxes on",
      entryTree: '["salt, taxes on"]',
      id: "salt-taxes-on--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "tax",
      entryText: "tax",
      entryTree: '["tax"]',
      id: "tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "tax--incidence",
      entryText: "incidence",
      entryTree: '["tax","","incidence"]',
      id: "tax--incidence--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "tax--and-surpluses",
      entryText: "and surpluses",
      entryTree: '["tax","","and surpluses"]',
      id: "tax--and-surpluses--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "united-states--tea-tax",
      entryText: "tea tax",
      entryTree: '["United States","","tea tax"]',
      id: "united-states--tea-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "india--salt-march",
      entryText: "salt march",
      entryTree: '["India","","salt march"]',
      id: "india--salt-march--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "gandhi-mahatma",
      entryText: "Gandhi, Mahatma",
      entryTree: '["Gandhi, Mahatma"]',
      id: "gandhi-mahatma--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "france--revolution",
      entryText: "revolution",
      entryTree: '["France","","revolution"]',
      id: "france--revolution--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
    {
      entrySlug: "france--salt-tax",
      entryText: "salt tax",
      entryTree: '["France","","salt tax"]',
      id: "france--salt-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-12-effect-of-tax.html",
    },
  ],
  [
    {
      entrySlug: "rent-ceiling",
      entryText: "rent ceiling",
      entryTree: '["rent ceiling"]',
      id: "rent-ceiling--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "rent--controls",
      entryText: "controls",
      entryTree: '["rent","","controls"]',
      id: "rent--controls--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "prices--controlled",
      entryText: "controlled",
      entryTree: '["prices","","controlled"]',
      id: "prices--controlled--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "price-controls",
      entryText: "price controls",
      entryTree: '["price controls"]',
      id: "price-controls--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "rent--housing",
      entryText: "housing",
      entryTree: '["rent","","housing"]',
      id: "rent--housing--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "housing-rents",
      entryText: "housing rents",
      entryTree: '["housing rents"]',
      id: "housing-rents--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "rent--housing",
      entryText: "housing",
      entryTree: '["rent","","housing"]',
      id: "rent--housing--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "housing-rents",
      entryText: "housing rents",
      entryTree: '["housing rents"]',
      id: "housing-rents--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "prices--controlled",
      entryText: "controlled",
      entryTree: '["prices","","controlled"]',
      id: "prices--controlled--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
    {
      entrySlug: "price-controls",
      entryText: "price controls",
      entryTree: '["price controls"]',
      id: "price-controls--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "08-supply-demand-13-price-controls.html",
    },
  ],
  [
    {
      entrySlug: "lending-informal",
      entryText: "lending, informal",
      entryTree: '["lending, informal"]',
      id: "lending-informal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-01-chambar-moneylenders.html",
    },
    {
      entrySlug: "pakistan",
      entryText: "Pakistan",
      entryTree: '["Pakistan"]',
      id: "pakistan--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-01-chambar-moneylenders.html",
    },
    {
      entrySlug: "interest-rates--and-payday-loans",
      entryText: "and 'payday' loans",
      entryTree: '["interest rates","","and \'payday\' loans"]',
      id: "interest-rates--and-payday-loans--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-01-chambar-moneylenders.html",
    },
    {
      entrySlug: "lenders--payday",
      entryText: "'payday'",
      entryTree: '["lenders","","\'payday\'"]',
      id: "lenders--payday--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-01-chambar-moneylenders.html",
    },
    {
      entrySlug: "payday-loans",
      entryText: "payday loans",
      entryTree: '["payday loans"]',
      id: "payday-loans--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-01-chambar-moneylenders.html",
    },
    {
      entrySlug: "borrowers--wealth-of",
      entryText: "wealth of",
      entryTree: '["borrowers","","wealth of"]',
      id: "borrowers--wealth-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-01-chambar-moneylenders.html",
    },
  ],
  [
    {
      entrySlug: "investment--definition",
      entryText: "definition",
      entryTree: '["investment","","definition"]',
      id: "investment--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "negative-wealth",
      entryText: "negative wealth",
      entryTree: '["negative wealth"]',
      id: "negative-wealth--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "wealth--negative",
      entryText: "negative",
      entryTree: '["wealth","","negative"]',
      id: "wealth--negative--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "trademarks",
      entryText: "trademarks",
      entryTree: '["trademarks"]',
      id: "trademarks--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "copyright",
      entryText: "copyright",
      entryTree: '["copyright"]',
      id: "copyright--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "assets--definition",
      entryText: "definition",
      entryTree: '["assets","","definition"]',
      id: "assets--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "intellectual-property-rights",
      entryText: "intellectual property rights",
      entryTree: '["intellectual property rights"]',
      id: "intellectual-property-rights--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "shares--definition",
      entryText: "definition",
      entryTree: '["shares","","definition"]',
      id: "shares--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "wealth--definition",
      entryText: "definition",
      entryTree: '["wealth","","definition"]',
      id: "wealth--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "capital--human",
      entryText: "human",
      entryTree: '["capital","","human"]',
      id: "capital--human--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "human-capital",
      entryText: "human capital",
      entryTree: '["human capital"]',
      id: "human-capital--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "income--definition",
      entryText: "definition",
      entryTree: '["income","","definition"]',
      id: "income--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "earnings--definition",
      entryText: "definition",
      entryTree: '["earnings","","definition"]',
      id: "earnings--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "stock--definition",
      entryText: "definition",
      entryTree: '["stock","","definition"]',
      id: "stock--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "flow--definition",
      entryText: "definition",
      entryTree: '["flow","","definition"]',
      id: "flow--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "bathtub-model",
      entryText: "bathtub model",
      entryTree: '["bathtub model"]',
      id: "bathtub-model--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "depreciation",
      entryText: "depreciation",
      entryTree: '["depreciation"]',
      id: "depreciation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "consumption--definition",
      entryText: "definition",
      entryTree: '["consumption","","definition"]',
      id: "consumption--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "shares",
      entryText: "shares",
      entryTree: '["shares"]',
      id: "shares--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "bonds--definition",
      entryText: "definition",
      entryTree: '["bonds","","definition"]',
      id: "bonds--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "savings--definition",
      entryText: "definition",
      entryTree: '["savings","","definition"]',
      id: "savings--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "government-bonds",
      entryText: "government bonds",
      entryTree: '["government bonds"]',
      id: "government-bonds--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "bonds--government",
      entryText: "government",
      entryTree: '["bonds","","government"]',
      id: "bonds--government--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "borrowers--wealth-of",
      entryText: "wealth of",
      entryTree: '["borrowers","","wealth of"]',
      id: "borrowers--wealth-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "equity--definition",
      entryText: "definition",
      entryTree: '["equity","","definition"]',
      id: "equity--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "united-states--asset-ownership",
      entryText: "asset ownership",
      entryTree: '["United States","","asset ownership"]',
      id: "united-states--asset-ownership--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "united-states--wealth-inequality",
      entryText: "wealth inequality",
      entryTree: '["United States","","wealth inequality"]',
      id: "united-states--wealth-inequality--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "united-states--residential-debt",
      entryText: "residential debt",
      entryTree: '["United States","","residential debt"]',
      id: "united-states--residential-debt--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
    {
      entrySlug: "united-states--home-equity",
      entryText: "home equity",
      entryTree: '["United States","","home equity"]',
      id: "united-states--home-equity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-02-income-and-wealth.html",
    },
  ],
  [
    {
      entrySlug: "preferences--definition",
      entryText: "definition",
      entryTree: '["preferences","","definition"]',
      id: "preferences--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "indifference-curves",
      entryText: "indifference curves",
      entryTree: '["indifference curves"]',
      id: "indifference-curves--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "feasible-set",
      entryText: "feasible set",
      entryTree: '["feasible set"]',
      id: "feasible-set--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "intertemporal-choice-model",
      entryText: "intertemporal choice model",
      entryTree: '["intertemporal choice model"]',
      id: "intertemporal-choice-model--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "endowments",
      entryText: "endowments",
      entryTree: '["endowments"]',
      id: "endowments--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "interest-rates--nominal",
      entryText: "nominal",
      entryTree: '["interest rates","","nominal"]',
      id: "interest-rates--nominal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "interest-rates--real",
      entryText: "real",
      entryTree: '["interest rates","","real"]',
      id: "interest-rates--real--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "interest-rates--definition",
      entryText: "definition",
      entryTree: '["interest rates","","definition"]',
      id: "interest-rates--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "feasible-frontier",
      entryText: "feasible frontier",
      entryTree: '["feasible frontier"]',
      id: "feasible-frontier--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
    {
      entrySlug: "marginal-rate-of-transformation-mrt",
      entryText: "marginal rate of transformation (MRT)",
      entryTree: '["marginal rate of transformation (MRT)"]',
      id: "marginal-rate-of-transformation-mrt--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-03-bringing-consumption-forward.html",
    },
  ],
  [
    {
      entrySlug: "consumption-smoothing",
      entryText: "consumption smoothing",
      entryTree: '["consumption smoothing"]',
      id: "consumption-smoothing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "law-of-satiation-of-wants",
      entryText: "law of satiation of wants",
      entryTree: '["law of satiation of wants"]',
      id: "law-of-satiation-of-wants--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "marginal-utility--diminishing",
      entryText: "diminishing",
      entryTree: '["marginal utility","","diminishing"]',
      id: "marginal-utility--diminishing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "diminishing-marginal-utility--definition",
      entryText: "definition",
      entryTree: '["diminishing marginal utility","","definition"]',
      id: "diminishing-marginal-utility--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "marginal-rate-of-substitution-mrs",
      entryText: "marginal rate of substitution (MRS)",
      entryTree: '["marginal rate of substitution (MRS)"]',
      id: "marginal-rate-of-substitution-mrs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "utility",
      entryText: "utility",
      entryTree: '["utility"]',
      id: "utility--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "impatience--intrinsic",
      entryText: "intrinsic",
      entryTree: '["impatience","","intrinsic"]',
      id: "impatience--intrinsic--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "impatience--situational",
      entryText: "situational",
      entryTree: '["impatience","","situational"]',
      id: "impatience--situational--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "impatience",
      entryText: "impatience",
      entryTree: '["impatience"]',
      id: "impatience--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "impatience--situational",
      entryText: "situational",
      entryTree: '["impatience","","situational"]',
      id: "impatience--situational--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "prudence",
      entryText: "prudence",
      entryTree: '["prudence"]',
      id: "prudence--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "myopia",
      entryText: "myopia",
      entryTree: '["myopia"]',
      id: "myopia--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "impatience--intrinsic",
      entryText: "intrinsic",
      entryTree: '["impatience","","intrinsic"]',
      id: "impatience--intrinsic--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "reservation-indifference-curve",
      entryText: "reservation indifference curve",
      entryTree: '["reservation indifference curve"]',
      id: "reservation-indifference-curve--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "indifference-curves--reservation",
      entryText: "reservation",
      entryTree: '["indifference curves","","reservation"]',
      id: "indifference-curves--reservation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "discount-rate",
      entryText: "discount rate",
      entryTree: '["discount rate"]',
      id: "discount-rate--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "substitution-effect",
      entryText: "substitution effect",
      entryTree: '["substitution effect"]',
      id: "substitution-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
    {
      entrySlug: "income-effect",
      entryText: "income effect",
      entryTree: '["income effect"]',
      id: "income-effect--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-04-reasons-to-borrow.html",
    },
  ],
  [
    {
      entrySlug: "discount-rate",
      entryText: "discount rate",
      entryTree: '["discount rate"]',
      id: "discount-rate--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
    {
      entrySlug: "climate-change--abatement-discount-rates",
      entryText: "abatement discount rates",
      entryTree: '["climate change","","abatement discount rates"]',
      id: "climate-change--abatement-discount-rates--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
    {
      entrySlug: "discounting",
      entryText: "discounting",
      entryTree: '["discounting"]',
      id: "discounting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
    {
      entrySlug: "climate-change--and-discounting",
      entryText: "and discounting",
      entryTree: '["climate change","","and discounting"]',
      id: "climate-change--and-discounting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
    {
      entrySlug: "stern-nicholas",
      entryText: "Stern, Nicholas",
      entryTree: '["Stern, Nicholas"]',
      id: "stern-nicholas--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
    {
      entrySlug: "stern-review-on-the-economics-of-climate-change",
      entryText: "*Stern Review on the Economics of Climate Change*",
      entryTree: '["*Stern Review on the Economics of Climate Change*"]',
      id: "stern-review-on-the-economics-of-climate-change--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
    {
      entrySlug: "nordhaus-william",
      entryText: "Nordhaus, William",
      entryTree: '["Nordhaus, William"]',
      id: "nordhaus-william--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-05-discounting-external-effects.html",
    },
  ],
  [
    {
      entrySlug: "consumption-smoothing--and-storing",
      entryText: "and storing",
      entryTree: '["consumption smoothing","","and storing"]',
      id: "consumption-smoothing--and-storing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-06-lending-and-storing.html",
    },
    {
      entrySlug: "borrowing--and-consumption-smoothing",
      entryText: "and consumption smoothing",
      entryTree: '["borrowing","","and consumption smoothing"]',
      id: "borrowing--and-consumption-smoothing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-06-lending-and-storing.html",
    },
    {
      entrySlug: "consumption-smoothing--and-borrowing",
      entryText: "and borrowing",
      entryTree: '["consumption smoothing","","and borrowing"]',
      id: "consumption-smoothing--and-borrowing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-06-lending-and-storing.html",
    },
  ],
  [
    {
      entrySlug: "investment--and-consumption",
      entryText: "and consumption",
      entryTree: '["investment","","and consumption"]',
      id: "investment--and-consumption--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-07-investing-consumption.html",
    },
    {
      entrySlug: "consumption-smoothing--and-storage",
      entryText: "and storage",
      entryTree: '["consumption smoothing","","and storage"]',
      id: "consumption-smoothing--and-storage--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-07-investing-consumption.html",
    },
    {
      entrySlug: "payday-loans",
      entryText: "payday loans",
      entryTree: '["payday loans"]',
      id: "payday-loans--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-07-investing-consumption.html",
    },
    {
      entrySlug: "investment--and-consumption",
      entryText: "and consumption",
      entryTree: '["investment","","and consumption"]',
      id: "investment--and-consumption--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-07-investing-consumption.html",
    },
  ],
  [
    {
      entrySlug: "conflict-of-interest--definition",
      entryText: "definition",
      entryTree: '["conflict of interest","","definition"]',
      id: "conflict-of-interest--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-08-conflicts-over-gains.html",
    },
  ],
  [
    {
      entrySlug: "principal-agent-problems--credit-market",
      entryText: "credit market",
      entryTree: '["principal-agent problems","","credit market"]',
      id: "principal-agent-problems--credit-market--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "credit-market-excluded--definition",
      entryText: "definition",
      entryTree: '["credit market excluded","","definition"]',
      id: "credit-market-excluded--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "credit-market-constrained--definition",
      entryText: "definition",
      entryTree: '["credit market constrained","","definition"]',
      id: "credit-market-constrained--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "credit-exclusion",
      entryText: "credit exclusion",
      entryTree: '["credit exclusion"]',
      id: "credit-exclusion--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "credit-market-exclusion--united-states",
      entryText: "United States",
      entryTree: '["credit market exclusion","","United States"]',
      id: "credit-market-exclusion--united-states--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "sri-lanka",
      entryText: "Sri Lanka",
      entryTree: '["Sri Lanka"]',
      id: "sri-lanka--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "nigeria",
      entryText: "Nigeria",
      entryTree: '["Nigeria"]',
      id: "nigeria--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "incomplete-contracts",
      entryText: "incomplete contracts",
      entryTree: '["incomplete contracts"]',
      id: "incomplete-contracts--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "equity--definition",
      entryText: "definition",
      entryTree: '["equity","","definition"]',
      id: "equity--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "collateral",
      entryText: "collateral",
      entryTree: '["collateral"]',
      id: "collateral--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "pawnbroking",
      entryText: "pawnbroking",
      entryTree: '["pawnbroking"]',
      id: "pawnbroking--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "principal-agent-problems--in-labour-market",
      entryText: "in labour market",
      entryTree: '["principal-agent problems","","in labour market"]',
      id: "principal-agent-problems--in-labour-market--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "principal-agent-problems--in-labour-market",
      entryText: "in labour market",
      entryTree: '["principal-agent problems","","in labour market"]',
      id: "principal-agent-problems--in-labour-market--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "principal-agent-problems--in-employment-relationship",
      entryText: "in employment relationship",
      entryTree: '["principal-agent problems","","in employment relationship"]',
      id: "principal-agent-problems--in-employment-relationship--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
    {
      entrySlug: "principal-agent-problems--credit-market",
      entryText: "credit market",
      entryTree: '["principal-agent problems","","credit market"]',
      id: "principal-agent-problems--credit-market--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-09-principal-agent-problem.html",
    },
  ],
  [
    {
      entrySlug: "gini-coefficient--borrowers-and-lenders",
      entryText: "borrowers and lenders",
      entryTree: '["Gini coefficient","","borrowers and lenders"]',
      id: "gini-coefficient--borrowers-and-lenders--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-10-inequality-credit-markets.html",
    },
    {
      entrySlug: "inequality--and-credit-market-exclusion",
      entryText: "and credit market exclusion",
      entryTree: '["inequality","","and credit market exclusion"]',
      id: "inequality--and-credit-market-exclusion--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-10-inequality-credit-markets.html",
    },
    {
      entrySlug: "gini-coefficient",
      entryText: "Gini coefficient",
      entryTree: '["Gini coefficient"]',
      id: "gini-coefficient--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-10-inequality-credit-markets.html",
    },
    {
      entrySlug: "inequality--and-credit-market-exclusion",
      entryText: "and credit market exclusion",
      entryTree: '["inequality","","and credit market exclusion"]',
      id: "inequality--and-credit-market-exclusion--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-10-inequality-credit-markets.html",
    },
    {
      entrySlug: "gini-coefficient--borrowers-and-lenders",
      entryText: "borrowers and lenders",
      entryTree: '["Gini coefficient","","borrowers and lenders"]',
      id: "gini-coefficient--borrowers-and-lenders--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-10-inequality-credit-markets.html",
    },
  ],
  [
    {
      entrySlug: "intertemporal-choice-model",
      entryText: "intertemporal choice model",
      entryTree: '["intertemporal choice model"]',
      id: "intertemporal-choice-model--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "hyperbolic-discounting",
      entryText: "hyperbolic discounting",
      entryTree: '["hyperbolic discounting"]',
      id: "hyperbolic-discounting--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "shiller-robert",
      entryText: "Shiller, Robert",
      entryTree: '["Shiller, Robert"]',
      id: "shiller-robert--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "akerlof-george",
      entryText: "Akerlof, George",
      entryTree: '["Akerlof, George"]',
      id: "akerlof-george--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "risk-aversion",
      entryText: "risk aversion",
      entryTree: '["risk aversion"]',
      id: "risk-aversion--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "wealth--and-risk-aversion",
      entryText: "and risk aversion",
      entryTree: '["wealth","","and risk aversion"]',
      id: "wealth--and-risk-aversion--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "risk-aversion--and-wealth-level",
      entryText: "and wealth level",
      entryTree: '["risk aversion","","and wealth level"]',
      id: "risk-aversion--and-wealth-level--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
    {
      entrySlug: "risk-aversion",
      entryText: "risk aversion",
      entryTree: '["risk aversion"]',
      id: "risk-aversion--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-11-good-model.html",
    },
  ],
  [
    {
      entrySlug: "risk-aversion--and-wealth-level",
      entryText: "and wealth level",
      entryTree: '["risk aversion","","and wealth level"]',
      id: "risk-aversion--and-wealth-level--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "investment--vicious-circle",
      entryText: "vicious circle",
      entryTree: '["investment","","vicious circle"]',
      id: "investment--vicious-circle--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "investment--virtuous-circle",
      entryText: "virtuous circle",
      entryTree: '["investment","","virtuous circle"]',
      id: "investment--virtuous-circle--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "poverty-trap",
      entryText: "poverty trap",
      entryTree: '["poverty trap"]',
      id: "poverty-trap--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "risk-aversion--and-wealth-level",
      entryText: "and wealth level",
      entryTree: '["risk aversion","","and wealth level"]',
      id: "risk-aversion--and-wealth-level--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "investment--vicious-circle",
      entryText: "vicious circle",
      entryTree: '["investment","","vicious circle"]',
      id: "investment--vicious-circle--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "investment--virtuous-circle",
      entryText: "virtuous circle",
      entryTree: '["investment","","virtuous circle"]',
      id: "investment--virtuous-circle--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
    {
      entrySlug: "poverty-trap",
      entryText: "poverty trap",
      entryTree: '["poverty trap"]',
      id: "poverty-trap--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-12-poverty-trap.html",
    },
  ],
  [
    {
      entrySlug: "house-prices",
      entryText: "house prices",
      entryTree: '["house prices"]',
      id: "house-prices--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-13-reduce-risk-exposure.html",
    },
    {
      entrySlug: "moral-hazard",
      entryText: "moral hazard",
      entryTree: '["moral hazard"]',
      id: "moral-hazard--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-13-reduce-risk-exposure.html",
    },
    {
      entrySlug: "aggregate-demand",
      entryText: "aggregate demand",
      entryTree: '["aggregate demand"]',
      id: "aggregate-demand--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-13-reduce-risk-exposure.html",
    },
    {
      entrySlug: "house-prices",
      entryText: "house prices",
      entryTree: '["house prices"]',
      id: "house-prices--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-13-reduce-risk-exposure.html",
    },
    {
      entrySlug: "higher-education-funding-of",
      entryText: "higher education, funding of",
      entryTree: '["higher education, funding of"]',
      id: "higher-education-funding-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "09-lenders-borrowers-13-reduce-risk-exposure.html",
    },
  ],
  [
    {
      entrySlug: "pesticides",
      entryText: "pesticides",
      entryTree: '["pesticides"]',
      id: "pesticides--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "chlordecone-poisoning-case-study",
      entryText: "chlordecone poisoning case study",
      entryTree: '["chlordecone poisoning case study"]',
      id: "chlordecone-poisoning-case-study--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "martinique",
      entryText: "Martinique",
      entryTree: '["Martinique"]',
      id: "martinique--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "guadeloupe",
      entryText: "Guadeloupe",
      entryTree: '["Guadeloupe"]',
      id: "guadeloupe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "pareto-efficiency--and-market-failure",
      entryText: "and market failure",
      entryTree: '["Pareto efficiency","","and market failure"]',
      id: "pareto-efficiency--and-market-failure--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "hayek-friedrich",
      entryText: "Hayek, Friedrich",
      entryTree: '["Hayek, Friedrich"]',
      id: "hayek-friedrich--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "smith-adam--invisible-hand-of-the-market",
      entryText: "'invisible hand of the market'",
      entryTree: '["Smith, Adam","","\'invisible hand of the market\'"]',
      id: "smith-adam--invisible-hand-of-the-market--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
    {
      entrySlug: "market-failure",
      entryText: "market failure",
      entryTree: '["market failure"]',
      id: "market-failure--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-01-bananas-fish-cancer.html",
    },
  ],
  [
    {
      entrySlug: "pollution--external-effects",
      entryText: "external effects",
      entryTree: '["pollution","","external effects"]',
      id: "pollution--external-effects--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "pesticides",
      entryText: "pesticides",
      entryTree: '["pesticides"]',
      id: "pesticides--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "pesticide-case-study",
      entryText: "pesticide case study",
      entryTree: '["pesticide case study"]',
      id: "pesticide-case-study--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "external-cost--definition",
      entryText: "definition",
      entryTree: '["external cost","","definition"]',
      id: "external-cost--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "external-effects--of-pollution",
      entryText: "of pollution",
      entryTree: '["external effects","","of pollution"]',
      id: "external-effects--of-pollution--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "external-cost--definition",
      entryText: "definition",
      entryTree: '["external cost","","definition"]',
      id: "external-cost--definition--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "externalities--definition",
      entryText: "definition",
      entryTree: '["externalities","","definition"]',
      id: "externalities--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "external-effect--definition",
      entryText: "definition",
      entryTree: '["external effect","","definition"]',
      id: "external-effect--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "social-cost",
      entryText: "social cost",
      entryTree: '["social cost"]',
      id: "social-cost--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "marginal-social-cost",
      entryText: "marginal social cost",
      entryTree: '["marginal social cost"]',
      id: "marginal-social-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "marginal-private-cost",
      entryText: "marginal private cost",
      entryTree: '["marginal private cost"]',
      id: "marginal-private-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "external-cost--marginal",
      entryText: "marginal",
      entryTree: '["external cost","","marginal"]',
      id: "external-cost--marginal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "marginal-external-cost",
      entryText: "marginal external cost",
      entryTree: '["marginal external cost"]',
      id: "marginal-external-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "social-cost",
      entryText: "social cost",
      entryTree: '["social cost"]',
      id: "social-cost--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "social-benefit--marginal",
      entryText: "marginal",
      entryTree: '["social benefit","","marginal"]',
      id: "social-benefit--marginal--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "marginal-social-benefit",
      entryText: "marginal social benefit",
      entryTree: '["marginal social benefit"]',
      id: "marginal-social-benefit--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "pollution--external-effects",
      entryText: "external effects",
      entryTree: '["pollution","","external effects"]',
      id: "pollution--external-effects--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "pesticides",
      entryText: "pesticides",
      entryTree: '["pesticides"]',
      id: "pesticides--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "external-effects--of-pollution",
      entryText: "of pollution",
      entryTree: '["external effects","","of pollution"]',
      id: "external-effects--of-pollution--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "pesticide-case-study",
      entryText: "pesticide case study",
      entryTree: '["pesticide case study"]',
      id: "pesticide-case-study--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
    {
      entrySlug: "environmental-damage--and-external-costs",
      entryText: "and external costs",
      entryTree: '["environmental damage","","and external costs"]',
      id: "environmental-damage--and-external-costs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-02-pollution-effects.html",
    },
  ],
  [
    {
      entrySlug: "bargaining-power--coasean",
      entryText: "Coasean",
      entryTree: '["bargaining power","","Coasean"]',
      id: "bargaining-power--coasean--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "coase-ronald",
      entryText: "Coase, Ronald",
      entryTree: '["Coase, Ronald"]',
      id: "coase-ronald--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "coasean-bargaining",
      entryText: "Coasean bargaining",
      entryTree: '["Coasean bargaining"]',
      id: "coasean-bargaining--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "bargaining--private",
      entryText: "private",
      entryTree: '["bargaining","","private"]',
      id: "bargaining--private--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "sturges-v-bridgman",
      entryText: "Sturges v Bridgman",
      entryTree: '["Sturges v Bridgman"]',
      id: "sturges-v-bridgman--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "pareto-efficiency--and-bargaining",
      entryText: "and bargaining",
      entryTree: '["Pareto efficiency","","and bargaining"]',
      id: "pareto-efficiency--and-bargaining--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "property-rights--definition",
      entryText: "definition",
      entryTree: '["property rights","","definition"]',
      id: "property-rights--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "reservation-option--definition",
      entryText: "definition",
      entryTree: '["reservation option","","definition"]',
      id: "reservation-option--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "pollution--and-bargaining-power",
      entryText: "and bargaining power",
      entryTree: '["pollution","","and bargaining power"]',
      id: "pollution--and-bargaining-power--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "minimum-acceptable-offer--definition",
      entryText: "definition",
      entryTree: '["minimum acceptable offer","","definition"]',
      id: "minimum-acceptable-offer--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "dupont",
      entryText: "DuPont",
      entryTree: '["DuPont"]',
      id: "dupont--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "transaction-costs",
      entryText: "transaction costs",
      entryTree: '["transaction costs"]',
      id: "transaction-costs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "pollution--and-bargaining-power",
      entryText: "and bargaining power",
      entryTree: '["pollution","","and bargaining power"]',
      id: "pollution--and-bargaining-power--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "coase-ronald--the-nature-of-the-firm",
      entryText: "'The Nature of the Firm'",
      entryTree: '["Coase, Ronald","","\'The Nature of the Firm\'"]',
      id: "coase-ronald--the-nature-of-the-firm--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
    {
      entrySlug: "coase-ronald--the-problem-of-social-cost",
      entryText: "*The Problem of Social Cost*",
      entryTree: '["Coase, Ronald","","*The Problem of Social Cost*"]',
      id: "coase-ronald--the-problem-of-social-cost--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-03-bargaining-property-rights.html",
    },
  ],
  [
    {
      entrySlug: "environmental-damage--social-costs-of",
      entryText: "social costs of",
      entryTree: '["environmental damage","","social costs of"]',
      id: "environmental-damage--social-costs-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "environmental-costs",
      entryText: "environmental costs",
      entryTree: '["environmental costs"]',
      id: "environmental-costs--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "united-nations--rio-declaration",
      entryText: "Rio Declaration",
      entryTree: '["United Nations","","Rio Declaration"]',
      id: "united-nations--rio-declaration--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "polluter-pays-principle",
      entryText: "polluter pays principle",
      entryTree: '["polluter pays principle"]',
      id: "polluter-pays-principle--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "rio-declaration",
      entryText: "Rio Declaration",
      entryTree: '["Rio Declaration"]',
      id: "rio-declaration--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "tax--pigouvian",
      entryText: "Pigouvian",
      entryTree: '["tax","","Pigouvian"]',
      id: "tax--pigouvian--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "pigouvian-tax",
      entryText: "Pigouvian tax",
      entryTree: '["Pigouvian tax"]',
      id: "pigouvian-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "compensation-enforced",
      entryText: "compensation, enforced",
      entryTree: '["compensation, enforced"]',
      id: "compensation-enforced--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "chlordecone-poisoning-case-study",
      entryText: "chlordecone poisoning case study",
      entryTree: '["chlordecone poisoning case study"]',
      id: "chlordecone-poisoning-case-study--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "martinique",
      entryText: "Martinique",
      entryTree: '["Martinique"]',
      id: "martinique--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "guadeloupe",
      entryText: "Guadeloupe",
      entryTree: '["Guadeloupe"]',
      id: "guadeloupe--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "welfare-economics",
      entryText: "welfare economics",
      entryTree: '["welfare economics"]',
      id: "welfare-economics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "pigou-arthur",
      entryText: "Pigou, Arthur",
      entryTree: '["Pigou, Arthur"]',
      id: "pigou-arthur--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "pigou-arthur--the-economics-of-welfare",
      entryText: "*The Economics of Welfare*",
      entryTree: '["Pigou, Arthur","","*The Economics of Welfare*"]',
      id: "pigou-arthur--the-economics-of-welfare--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "pigou-arthur--wealth-and-welfare",
      entryText: "*Wealth and Welfare*",
      entryTree: '["Pigou, Arthur","","*Wealth and Welfare*"]',
      id: "pigou-arthur--wealth-and-welfare--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "keynes-john-maynard--the-general-theory",
      entryText: "*The General Theory*",
      entryTree: '["Keynes, John Maynard","","*The General Theory*"]',
      id: "keynes-john-maynard--the-general-theory--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
    {
      entrySlug: "pigou-arthur--the-theory-of-unemployment",
      entryText: "*The Theory of Unemployment*",
      entryTree: '["Pigou, Arthur","","*The Theory of Unemployment*"]',
      id: "pigou-arthur--the-theory-of-unemployment--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-04-regulation-taxation-compensation.html",
    },
  ],
  [
    {
      entrySlug: "externalities--positive",
      entryText: "positive",
      entryTree: '["externalities","","positive"]',
      id: "externalities--positive--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "external-economies--definition",
      entryText: "definition",
      entryTree: '["external economies","","definition"]',
      id: "external-economies--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "externalities--negative",
      entryText: "negative",
      entryTree: '["externalities","","negative"]',
      id: "externalities--negative--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "diseconomies--external",
      entryText: "external",
      entryTree: '["diseconomies","","external"]',
      id: "diseconomies--external--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "firms--and-negative-externalities",
      entryText: "and negative externalities",
      entryTree: '["firms","","and negative externalities"]',
      id: "firms--and-negative-externalities--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "bunker-hill-company",
      entryText: "Bunker Hill Company",
      entryTree: '["Bunker Hill Company"]',
      id: "bunker-hill-company--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "royal-dutch-shell",
      entryText: "Royal Dutch Shell",
      entryTree: '["Royal Dutch Shell"]',
      id: "royal-dutch-shell--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "chlordecone-poisoning-case-study",
      entryText: "chlordecone poisoning case study",
      entryTree: '["chlordecone poisoning case study"]',
      id: "chlordecone-poisoning-case-study--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "deforestation",
      entryText: "deforestation",
      entryTree: '["deforestation"]',
      id: "deforestation--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "bangladesh",
      entryText: "Bangladesh",
      entryTree: '["Bangladesh"]',
      id: "bangladesh--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "rana-plaza-collapse",
      entryText: "Rana Plaza collapse",
      entryTree: '["Rana Plaza collapse"]',
      id: "rana-plaza-collapse--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "markets--missing",
      entryText: "missing",
      entryTree: '["markets","","missing"]',
      id: "markets--missing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "contracts--definition",
      entryText: "definition",
      entryTree: '["contracts","","definition"]',
      id: "contracts--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "property--private",
      entryText: "private",
      entryTree: '["property","","private"]',
      id: "property--private--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "market-failure--reasons-for",
      entryText: "reasons for",
      entryTree: '["market failure","","reasons for"]',
      id: "market-failure--reasons-for--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "externalities--negative",
      entryText: "negative",
      entryTree: '["externalities","","negative"]',
      id: "externalities--negative--iid-2",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "antibiotics",
      entryText: "antibiotics",
      entryTree: '["antibiotics"]',
      id: "antibiotics--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "world-health-organization",
      entryText: "World Health Organization",
      entryTree: '["World Health Organization"]',
      id: "world-health-organization--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "law-tort",
      entryText: "law, tort",
      entryTree: '["law, tort"]',
      id: "law-tort--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "contracts--incomplete",
      entryText: "incomplete",
      entryTree: '["contracts","","incomplete"]',
      id: "contracts--incomplete--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "information--unverifiable",
      entryText: "unverifiable",
      entryTree: '["information","","unverifiable"]',
      id: "information--unverifiable--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "government-policies--and-pollution-control",
      entryText: "and pollution control",
      entryTree: '["government policies","","and pollution control"]',
      id: "government-policies--and-pollution-control--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "tradable-permits",
      entryText: "tradable permits",
      entryTree: '["tradable permits"]',
      id: "tradable-permits--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "tax--landfill",
      entryText: "landfill",
      entryTree: '["tax","","landfill"]',
      id: "tax--landfill--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "landfill-tax",
      entryText: "landfill tax",
      entryTree: '["landfill tax"]',
      id: "landfill-tax--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "intellectual-property-rights",
      entryText: "intellectual property rights",
      entryTree: '["intellectual property rights"]',
      id: "intellectual-property-rights--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "patents",
      entryText: "patents",
      entryTree: '["patents"]',
      id: "patents--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "copyright",
      entryText: "copyright",
      entryTree: '["copyright"]',
      id: "copyright--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "copyright-laws",
      entryText: "copyright laws",
      entryTree: '["copyright laws"]',
      id: "copyright-laws--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
    {
      entrySlug: "external-benefit",
      entryText: "external benefit",
      entryTree: '["external benefit"]',
      id: "external-benefit--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-05-examples-diagnoses.html",
    },
  ],
  [
    {
      entrySlug: "public-goods",
      entryText: "public goods",
      entryTree: '["public goods"]',
      id: "public-goods--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "public-goods--and-free-rider",
      entryText: "and free-rider",
      entryTree: '["public goods","","and free-rider"]',
      id: "public-goods--and-free-rider--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "non-rivalry--definition",
      entryText: "definition",
      entryTree: '["non-rivalry","","definition"]',
      id: "non-rivalry--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "public-goods--definition",
      entryText: "definition",
      entryTree: '["public goods","","definition"]',
      id: "public-goods--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "knowledge--as-a-public-good",
      entryText: "as a public good",
      entryTree: '["knowledge","","as a public good"]',
      id: "knowledge--as-a-public-good--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "radio-broadcasting-as-public-good",
      entryText: "radio broadcasting, as public good",
      entryTree: '["radio broadcasting, as public good"]',
      id: "radio-broadcasting-as-public-good--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "excludability--definition",
      entryText: "definition",
      entryTree: '["excludability","","definition"]',
      id: "excludability--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "deadweight-loss",
      entryText: "deadweight loss",
      entryTree: '["deadweight loss"]',
      id: "deadweight-loss--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "public-goods",
      entryText: "public goods",
      entryTree: '["public goods"]',
      id: "public-goods--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
    {
      entrySlug: "radio-broadcasting-as-public-good",
      entryText: "radio broadcasting, as public good",
      entryTree: '["radio broadcasting, as public good"]',
      id: "radio-broadcasting-as-public-good--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-06-radio-broadcasting.html",
    },
  ],
  [
    {
      entrySlug: "public-goods",
      entryText: "public goods",
      entryTree: '["public goods"]',
      id: "public-goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "public-goods--excludable",
      entryText: "excludable",
      entryTree: '["public goods","","excludable"]',
      id: "public-goods--excludable--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "excludability",
      entryText: "excludability",
      entryTree: '["excludability"]',
      id: "excludability--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "copyrighted-definition",
      entryText: "copyrighted, definition",
      entryTree: '["copyrighted, definition"]',
      id: "copyrighted-definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "club-goods",
      entryText: "club goods",
      entryTree: '["club goods"]',
      id: "club-goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "goods--artificially-scarce-or-club",
      entryText: "artificially scarce or club",
      entryTree: '["goods","","artificially scarce or club"]',
      id: "goods--artificially-scarce-or-club--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "bads-public-and-private",
      entryText: "bads, public and private",
      entryTree: '["bads, public and private"]',
      id: "bads-public-and-private--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "common-pool-resources",
      entryText: "common pool resources",
      entryTree: '["common pool resources"]',
      id: "common-pool-resources--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "open-access-resources",
      entryText: "open access resources",
      entryTree: '["open access resources"]',
      id: "open-access-resources--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "common-land",
      entryText: "common land",
      entryTree: '["common land"]',
      id: "common-land--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "united-kingdom--common-land-system",
      entryText: "common land system",
      entryTree: '["United Kingdom","","common land system"]',
      id: "united-kingdom--common-land-system--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "common-land",
      entryText: "common land",
      entryTree: '["common land"]',
      id: "common-land--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "tragedy-of-the-commons",
      entryText: "tragedy of the commons",
      entryTree: '["tragedy of the commons"]',
      id: "tragedy-of-the-commons--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "public-goods--congestible",
      entryText: "congestible",
      entryTree: '["public goods","","congestible"]',
      id: "public-goods--congestible--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "goods--private",
      entryText: "private",
      entryTree: '["goods","","private"]',
      id: "goods--private--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "private-goods",
      entryText: "private goods",
      entryTree: '["private goods"]',
      id: "private-goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "public-goods--pure",
      entryText: "pure",
      entryTree: '["public goods","","pure"]',
      id: "public-goods--pure--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
    {
      entrySlug: "patents",
      entryText: "patents",
      entryTree: '["patents"]',
      id: "patents--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-07-open-access-shared-resources.html",
    },
  ],
  [
    {
      entrySlug: "contracts--incomplete",
      entryText: "incomplete",
      entryTree: '["contracts","","incomplete"]',
      id: "contracts--incomplete--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-08-principal-agent-relationships.html",
    },
    {
      entrySlug: "asymmetric-information--definition",
      entryText: "definition",
      entryTree: '["asymmetric information","","definition"]',
      id: "asymmetric-information--definition--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-08-principal-agent-relationships.html",
    },
    {
      entrySlug: "conflict-of-interest",
      entryText: "conflict of interest",
      entryTree: '["conflict of interest"]',
      id: "conflict-of-interest--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-08-principal-agent-relationships.html",
    },
    {
      entrySlug: "moral-hazard",
      entryText: "moral hazard",
      entryTree: '["moral hazard"]',
      id: "moral-hazard--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-08-principal-agent-relationships.html",
    },
    {
      entrySlug: "hidden-action-problems",
      entryText: "hidden action problems",
      entryTree: '["hidden action problems"]',
      id: "hidden-action-problems--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-08-principal-agent-relationships.html",
    },
    {
      entrySlug: "hidden-action-problems",
      entryText: "hidden action problems",
      entryTree: '["hidden action problems"]',
      id: "hidden-action-problems--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-08-principal-agent-relationships.html",
    },
  ],
  [
    {
      entrySlug: "insurance-market--and-hidden-action-problem",
      entryText: "and hidden action problem",
      entryTree: '["insurance market","","and hidden action problem"]',
      id: "insurance-market--and-hidden-action-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "credit-market--and-hidden-action-problem",
      entryText: "and hidden action problem",
      entryTree: '["credit market","","and hidden action problem"]',
      id: "credit-market--and-hidden-action-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "hidden-action-problems",
      entryText: "hidden action problems",
      entryTree: '["hidden action problems"]',
      id: "hidden-action-problems--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "insurance--car",
      entryText: "car",
      entryTree: '["insurance","","car"]',
      id: "insurance--car--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "equity",
      entryText: "equity",
      entryTree: '["equity"]',
      id: "equity--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "collateral",
      entryText: "collateral",
      entryTree: '["collateral"]',
      id: "collateral--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "insurance--excess",
      entryText: "excess",
      entryTree: '["insurance","","excess"]',
      id: "insurance--excess--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "hidden-action-problems",
      entryText: "hidden action problems",
      entryTree: '["hidden action problems"]',
      id: "hidden-action-problems--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
    {
      entrySlug: "grameen-bank",
      entryText: "Grameen Bank",
      entryTree: '["Grameen Bank"]',
      id: "grameen-bank--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-09-insurance-credit-markets.html",
    },
  ],
  [
    {
      entrySlug: "adverse-selection",
      entryText: "adverse selection",
      entryTree: '["adverse selection"]',
      id: "adverse-selection--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "hidden-attributes-problem",
      entryText: "hidden attributes problem",
      entryTree: '["hidden attributes problem"]',
      id: "hidden-attributes-problem--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "shiller-robert",
      entryText: "Shiller, Robert",
      entryTree: '["Shiller, Robert"]',
      id: "shiller-robert--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "akerlof-george",
      entryText: "Akerlof, George",
      entryTree: '["Akerlof, George"]',
      id: "akerlof-george--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "market-for-lemons",
      entryText: "'market for lemons'",
      entryTree: "[\"'market for lemons'\"]",
      id: "market-for-lemons--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "markets--missing",
      entryText: "missing",
      entryTree: '["markets","","missing"]',
      id: "markets--missing--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "insurance--lemons",
      entryText: "lemons",
      entryTree: '["insurance","","lemons"]',
      id: "insurance--lemons--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "insurance--medical",
      entryText: "medical",
      entryTree: '["insurance","","medical"]',
      id: "insurance--medical--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
    {
      entrySlug: "insurance--compulsory",
      entryText: "compulsory",
      entryTree: '["insurance","","compulsory"]',
      id: "insurance--compulsory--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-10-hidden-attributes.html",
    },
  ],
  [
    {
      entrySlug: "simon-herbert",
      entryText: "Simon, Herbert",
      entryTree: '["Simon, Herbert"]',
      id: "simon-herbert--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "markets--limits-to",
      entryText: "limits to",
      entryTree: '["markets","","limits to"]',
      id: "markets--limits-to--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "firms--and-markets",
      entryText: "and markets",
      entryTree: '["firms","","and markets"]',
      id: "firms--and-markets--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "coase-ronald",
      entryText: "Coase, Ronald",
      entryTree: '["Coase, Ronald"]',
      id: "coase-ronald--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "markets--repugnant",
      entryText: "repugnant",
      entryTree: '["markets","","repugnant"]',
      id: "markets--repugnant--iid-1",
      range: "from",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "roth-alvin",
      entryText: "Roth, Alvin",
      entryTree: '["Roth, Alvin"]',
      id: "roth-alvin--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "markets--repugnant",
      entryText: "repugnant",
      entryTree: '["markets","","repugnant"]',
      id: "markets--repugnant--iid-2",
      range: "to",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "markets--moral-limits-of",
      entryText: "moral limits of",
      entryTree: '["markets","","moral limits of"]',
      id: "markets--moral-limits-of--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "sandel-michael",
      entryText: "Sandel, Michael",
      entryTree: '["Sandel, Michael"]',
      id: "sandel-michael--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "walzer-michael",
      entryText: "Walzer, Michael",
      entryTree: '["Walzer, Michael"]',
      id: "walzer-michael--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
    {
      entrySlug: "merit-goods",
      entryText: "merit goods",
      entryTree: '["merit goods"]',
      id: "merit-goods--iid-1",
      range: "",
      bookTitle: "Microeconomics",
      filename: "10-market-successes-failures-11-market-limits.html",
    },
  ],
];
if (typeof window === "undefined") {
  module.exports.webIndexTargets = ebIndexTargets;
}

/* jslint browser */
/* globals Prince, ebSlugify, NodeFilter, Node */

// This script helps create dynamic book indexes.
// It finds all HTML comments that start with
// <!-- index or <!--index and parses each line,
// assuming each line represents an entry in the index.
// It then adds <a> targets to the start of the element
// that follows the comment, using slugs of the line.
// Comment lines that start or end with a hyphen
// start or end ranges of content that contain the
// ongoing presence of a given concept. Those targets
// take 'to' or 'from' classes, which are important
// for the separate process that generates hyperlinks
// in the final book index.

// Notes on development:
// To find comment nodes, TreeWalker is fastest.
// If the browser doesn't support TreeWalker, we iterate
// over the entire DOM ourselves, which is slower.

// This script is not used for PDF and epub outputs.
// PrinceXML does not 'see' HTML comments at all.
// So for PrinceXML output, we prerender the HTML with gulp/cheerio.
// In epub readers, the links don't work from the index
// because the targets would only exist when the target
// page is rendered. Browsers handle this fine, but not ereaders.
// So if you change this script, you may need to make similar
// changes to `renderIndexCommentsAsTargets` in gulpfile.js.

// Options
// -------
// Block-level elements are those tags that will be
// index targets for any index comment that appears
// immediately before them in the DOM. Any other elements
// not included in this list will not be targets.
// Rather, index targets will be inserted inside them
// where the index comment appears in the DOM.
// Note that element names must be uppercase here.
// (Note: our gulp equivalent uses a different logic
// that may be more reliable than this.)
const ebIndexOptions = {
  blockLevelElements: [
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "P",
    "BLOCKQUOTE",
    "OL",
    "UL",
    "TABLE",
    "DL",
    "DIV",
    "SCRIPT",
  ],
};

// Process the comments, inserting anchor-tag targets
// into the DOM, which we'll link to from the book index.
function ebIndexProcessComments(comments) {
  "use strict";

  // Create an array to store IDs, which we'll test
  // for uniqueness when we create anchor tags.
  const entries = [];

  // If there are no comments, note that in the
  // `data-index-targets` attribute.
  if (comments.length < 1) {
    document.body.setAttribute("data-index-targets", "none");
  }

  // Create a counter for tracking this process
  let commentCounter = 0;

  // Process each comment in the `comments` array.
  comments.forEach(function (comment) {
    // Parse each line: add to an array called
    // `commentLines`, because each line in the comment
    // will be a separate index target.
    const commentLines = comment.commentText.split("\n");

    // Process each line, i.e. each index target in the comment.
    commentLines.forEach(function (line) {
      // Remove the opening 'index:' prefix.
      const indexKeywordRegex = /^\s*index:/;
      if (indexKeywordRegex.test(line)) {
        line = line.replace(indexKeywordRegex, "");
      }

      // Strip white space at start and end of line.
      line = line.trim();

      // Exit if the stripped line is now empty.
      if (line === "") {
        return;
      }

      // Split the line into its entry components.
      // It might be a nested entry, where each level
      // of nesting appears after double backslash \\.
      // e.g. software \\ book-production
      const rawEntriesByLevel = line.split("\\");

      // Trim whitespace from each entry
      // https://stackoverflow.com/a/41183617/1781075
      // and remove any leading or trailing hyphens.
      const entriesByLevel = rawEntriesByLevel.map(function (str) {
        return str.trim().replace(/^-+|-+$/, "");
      });

      // Check for starting or ending hyphens.
      // If one exists, flag it as `from` or `to`.
      // Then strip the hyphen.
      // Note, JS's `startsWith` and `endsWith` are not
      // supported in PrinceXML, so we didn't use those
      // in early dev. Prince output is now handled by
      // our alternative gulp/cheerio process. So, we could
      // use them now. But this code isn't broken, so doesn't
      // need fixing.
      let from = false;
      let to = false;

      if (line.substring(0, 1) === "-") {
        to = true;
        line = line.substring(1);
      }
      if (line.substring(line.length - 1) === "-") {
        from = true;
        line = line.substring(0, line.length - 1);
      }

      // Slugify the target text to use in an ID
      // and to check for duplicate instances later.
      // The second argument indicates that we are slugifying an index term.
      const entrySlug = ebSlugify(line, true);

      // Add the slug to the array of entries,
      // where will we count occurrences of this entry.
      entries.push(entrySlug);

      // Create an object that counts occurrences
      // of this entry on the page so far.
      const entryOccurrences = entries.reduce(function (allEntries, entry) {
        if (entry in allEntries) {
          allEntries[entry] += 1;
        } else {
          allEntries[entry] = 1;
        }
        return allEntries;
      }, {});

      // Get the number of occurrences of this entry so far.
      const occurrencesSoFar = entryOccurrences[entrySlug];

      // Use that to add a unique index-ID suffix to the entry slug.
      const id = entrySlug + "--iid-" + occurrencesSoFar;

      // Create a target for each line.
      // Note: we can't use one target element for several index entries,
      // because one element can't have multiple IDs.
      // And we don't try to link index entries to IDs of existing elements
      // because those elements' IDs could change, and sometimes
      // we want our target at a specific point inline in a textnode.

      // Create a target element to link to from the index.
      const target = document.createElement("a");
      target.id = id;
      target.classList.add("index-target");
      target.setAttribute("data-index-entry", entriesByLevel.slice(-1).pop());
      target.setAttribute("data-index-markup", line);

      // If this target starts or ends an indexed range,
      // add the relevant class.
      if (to) {
        target.classList.add("index-target-to");
      }
      if (from) {
        target.classList.add("index-target-from");
      }

      // Set a string that we'll use for the target below.
      // It's easiest to use `outerHTML` for this,
      // but PrinceXML doesn't support `outerHTML`, so
      // if this script ever runs in PrinceXML we have to use
      // `innerHTML`, putting the target in a temporary container.
      // This could be refactored now that we handle Prince
      // output in pre-processing with gulp/cheerio.
      let targetElementString = "";
      if (typeof Prince === "object") {
        // Prince requires that the element contain a string
        // in order for the target to be present at all in the DOM.
        // So we give it a zero-width space character and keep it
        // out of the flow with position: absolute.
        target.innerHTML = "​"; // contains zero-width space character
        target.style.position = "absolute";

        const temporaryContainer = document.createElement("span");
        temporaryContainer.appendChild(target);
        targetElementString = temporaryContainer.innerHTML;
      } else {
        targetElementString = target.outerHTML;
      }

      // If the comment is between elements (e.g. between two paras)
      // then we insert the target as the first child of the next element.
      // (Look out for CSS problems caused by this. You may need CSS tweaks.)
      // Otherwise, if it's *inline* between two text nodes, we insert
      // the target exactly where it appears between those text nodes.
      // This way, a target can appear at any exact point in the text.

      if (comment.targetType === "inline") {
        const positionOfTarget = comment.element.innerHTML.indexOf(comment.targetText);
        const newInnerHTML =
          comment.element.innerHTML.slice(0, positionOfTarget) +
          targetElementString +
          comment.element.innerHTML.slice(positionOfTarget);
        comment.element.innerHTML = newInnerHTML;
      } else {
        comment.element.insertBefore(target, comment.element.firstChild);
      }
    });

    // Add this comment to the counter
    commentCounter += 1;

    // Add an attribute to flag that we're done.
    if (commentCounter === comments.length) {
      document.body.setAttribute("data-index-targets", "loaded");
    }
  });
}

// Get all the comments and add them to an array.
function ebIndexGetComments() {
  "use strict";

  const comments = [];

  let indexedElement, commentValue, nextElementSibling, nextSibling, targetType, targetText;

  // Regex for testing if a comment is an indexing comment
  const isAnIndexComment = /^\s*index:/;

  // Check for TreeWalker support.
  const useTreeWalker = true; // debugging option
  if (document.createTreeWalker && useTreeWalker) {
    // https://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
    // By default, the TreeWalker will show all of the matching DOM nodes that it
    // finds. However, we can use an optional 'filter' method that will inform the
    // DOM traversal.
    function filter(node) {
      if (node.nodeValue === " Load scripts. ") {
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    }

    // IE and other browsers differ in how the filter method is passed into the
    // TreeWalker. Mozilla takes an object with an 'acceptNode' key. IE takes the
    // filter method directly. To work around this difference, we will define the
    // acceptNode function a property of itself.
    filter.acceptNode = filter;

    // NOTE: The last argument [] is a deprecated, optional parameter. However, in
    // IE, the argument is not optional and therefore must be included.
    const treeWalker = document.createTreeWalker(
      document.querySelector(".content"),
      NodeFilter.SHOW_COMMENT,
      filter,
      false
    );

    while (treeWalker.nextNode()) {
      if (isAnIndexComment.test(treeWalker.currentNode.nodeValue)) {
        nextSibling = treeWalker.currentNode.nextSibling;
        nextElementSibling = treeWalker.currentNode.nextElementSibling;

        // If the next sibling elements of the comment is a
        // block element, then this comment contains index entries
        // that should point to the start of the next element.

        // If the next sibling node is a text node, and
        // it actually contains text (isn't just space),
        // then we know that the index target must be inline, i.e.
        // inside a text element like a paragraph.

        if (nextElementSibling !== null && ebIndexOptions.blockLevelElements.includes(nextElementSibling.tagName)) {
          indexedElement = treeWalker.currentNode.nextElementSibling;
          targetType = "element";
          targetText = "";
        } else {
          indexedElement = treeWalker.currentNode.parentElement;
          targetType = "inline";
          targetText = nextSibling.nodeValue;
        }

        commentValue = treeWalker.currentNode.nodeValue;

        comments.push({
          commentText: commentValue,
          element: indexedElement,

          // Do not use shorthand here, because Prince's
          // JS engine will break on it.
          targetText: targetText, // eslint-disable-line
          targetType: targetType, // eslint-disable-line
        });
      }
    }
  } else {
    // 20230117: Not sure whether this exception is necessary - all modern browsers seem
    // to support TreeWalker. Leaving it here just in case though.

    function lookForComments(thisNode) {
      // Polyfill for IE < 9
      if (!Node) {
        let Node = {};
      }
      if (!Node.COMMENT_NODE) {
        Node.COMMENT_NODE = 8;
      }

      for (thisNode = thisNode.firstChild; thisNode; thisNode = thisNode.nextSibling) {
        // If it's a comment node and it is not just whitespace
        if (thisNode.nodeType === Node.COMMENT_NODE && isAnIndexComment.test(thisNode.nodeValue)) {
          nextSibling = thisNode.nextSibling;
          nextElementSibling = thisNode.nextElementSibling;

          if (nextElementSibling !== null && ebIndexOptions.blockLevelElements.includes(nextElementSibling.tagName)) {
            indexedElement = thisNode.nextElementSibling;
            targetType = "element";
            targetText = "";
          } else {
            indexedElement = thisNode.parentElement;
            targetType = "inline";
            targetText = nextSibling.nodeValue;
          }

          commentValue = thisNode.nodeValue;

          comments.push({
            commentText: commentValue,
            element: indexedElement,

            // Do not use shorthand here, because Prince's
            // JS engine will break on it.
            targetText: targetText, // eslint-disable-line
            targetType: targetType, // eslint-disable-line
          });
        } else {
          lookForComments(thisNode);
        }
      }
    }
    lookForComments(document.body);
  }

  ebIndexProcessComments(comments);
}

// Triage before processing comments.
function ebIndexInit() {
  "use strict";

  // Don't run this if the targets are already loaded
  // (e.g. by pre-processing)
  if (document.body.getAttribute("data-index-targets") === "loaded") {
    return;
  }

  ebIndexGetComments();
}

// Go
ebIndexInit();

/* jslint browser */
/* globals ebSlugify, ebIndexTargets */

// Check the page for reference indexes.
// If we find any, look up each list item
// in the book-index-*.js, and add a link.

// Add a link to a specific reference-index entry
function ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry) {
  "use strict";

  const link = document.createElement("a");
  link.href = entry.filename + "#" + entry.id;
  link.innerHTML = pageReferenceSequenceNumber;

  // If the listItem has child lists, insert the link
  // before the first one. Otherwise, append the link.
  if (listItem.querySelector("ul")) {
    listItem.insertBefore(link, listItem.querySelector("ul"));
  } else {
    listItem.appendChild(link);
  }

  // Add a class to flag whether this link starts
  // or ends a reference range.
  if (entry.range === "from" || entry.range === "to") {
    link.classList.add("index-range-" + entry.range);
  } else {
    link.classList.add("index-range-none");
  }
}

// Look up an entry's anchor targets to link to
function ebIndexFindLinks(listItem) {
  "use strict";

  // We're already looping through all `li`s`, even descendants.
  // For each one, contruct its tree from its parent nodes.
  // When we look up this entry in the db, we'll compare
  // the constructed tree with the one stored in the index 'database'.
  const listItemTree = [];

  // If a list item has a parent list item, add its
  // text value to the beginning of the tree array.
  // Iterate up the tree to add each possible parent.

  // Get the text value of an li without its li children
  function getListItemText(li) {
    const listItemClone = li.cloneNode(true);
    listItemClone.querySelectorAll("li").forEach(function (childListItem) {
      childListItem.remove();
    });

    // If page refs have already been added to the li,
    // we don't want those in the text. They appear after
    // a line break, so we regex everything from that \n.
    const text = listItemClone.textContent.trim().replace(/\n.*/, "");
    return text;
  }

  listItemTree.push(getListItemText(listItem));

  function buildTree(listItem) {
    if (listItem.parentElement && listItem.parentElement.closest("li")) {
      listItemTree.unshift(getListItemText(listItem.parentElement.closest("li")));
      buildTree(listItem.parentElement.closest("li"));
    }
  }
  buildTree(listItem);

  // Reconstruct the reference's text value from the tree
  // and save its slug. The second argument indicates that we are slugifying
  // an index term.
  const listItemSlug = ebSlugify(listItemTree.join(" \\ "), true);

  // Get the book title and translation language (if any)
  // for the HTML page we're processing.
  const currentBookTitle = document.querySelector(".wrapper").dataset.title;
  const currentTranslation = document.querySelector(".wrapper").dataset.translation;

  // Look through the index 'database' of targets
  // Each child in the ebIndexTargets array represents
  // the index anchor targets on one HTML page.

  // Set this counter here, so that links are numbered
  // sequentially across target HTML files
  // (e.g. if a range spans two HTML files)
  let pageReferenceSequenceNumber = 1;

  ebIndexTargets.forEach(function (pageEntries) {
    // First, check if the entries for this page
    // of entries are for files in the same book.
    // We just check against the first entry for the page.
    let titleMatches = false;
    let languageMatches = false;
    if (currentBookTitle === pageEntries[0].bookTitle) {
      titleMatches = true;
    }
    // Note, both of these could be null,
    // if this is not a translation.
    // (Note we're being lazy here, so this code might need work.
    // Technically one could be undefined and the other null.
    // The gulp alternative in `renderIndexListReferences` has better logic.)
    if (currentTranslation === pageEntries[0].translationLanguage) {
      languageMatches = true;
    }

    if (titleMatches && languageMatches) {
      // Find this entry's page numbers
      let rangeOpen = false;
      pageEntries.forEach(function (entry) {
        if (entry.entrySlug === listItemSlug) {
          // If a 'from' link has started a reference range, skip
          // adding links till the next 'to' link that closes the range.
          if (entry.range === "from") {
            rangeOpen = true;
            ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry);
            pageReferenceSequenceNumber += 1;
          }
          if (rangeOpen) {
            if (entry.range === "to") {
              ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry);
              pageReferenceSequenceNumber += 1;
              rangeOpen = false;
            }
          } else {
            ebIndexAddLink(listItem, pageReferenceSequenceNumber, entry);
            pageReferenceSequenceNumber += 1;
          }
        }
      });
    }
  });
}

// Get all the indexes on the page, and start processing them.
function ebIndexPopulate() {
  "use strict";

  // Don't do this if the list links are already loaded.
  // This prevents us doing this work if the page has been
  // pre-processed. E.g. by gulp during PDF or epub output.
  if (document.body.getAttribute("data-index-list") === "loaded") {
    return;
  }

  const indexLists = document.querySelectorAll(".reference-index");
  let indexListsProcessed = 0;

  indexLists.forEach(function (indexList) {
    const listItems = indexList.querySelectorAll("li");

    listItems.forEach(function (listItem) {
      ebIndexFindLinks(listItem);
    });

    // Flag when we're done
    if (indexListsProcessed === indexLists.length || indexLists.length === 1) {
      document.body.setAttribute("data-index-list", "loaded");
    }
    indexListsProcessed += 1;
  });
}

// Go
ebIndexPopulate();

/* jslint browser */
/* globals */

// Set a variable. If it exists on the page,
// then the page load didn't trigger any JS errors.
const ebBundleCheck = true;
