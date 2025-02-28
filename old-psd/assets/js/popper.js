"use strict";
function getBoundingClientRect(e) {
  var t = e.getBoundingClientRect();
  return {
    width: t.width,
    height: t.height,
    top: t.top,
    right: t.right,
    bottom: t.bottom,
    left: t.left,
    x: t.left,
    y: t.top,
  };
}
function getWindow(e) {
  if ("[object Window]" === e.toString()) return e;
  var t = e.ownerDocument;
  return t ? t.defaultView : window;
}
function getWindowScroll(e) {
  var t = getWindow(e);
  return { scrollLeft: t.pageXOffset, scrollTop: t.pageYOffset };
}
function isElement(e) {
  return e instanceof getWindow(e).Element || e instanceof Element;
}
function isHTMLElement(e) {
  return e instanceof getWindow(e).HTMLElement || e instanceof HTMLElement;
}
function getHTMLElementScroll(e) {
  return { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop };
}
function getNodeScroll(e) {
  return (e !== getWindow(e) && isHTMLElement(e)
    ? getHTMLElementScroll
    : getWindowScroll)(e);
}
function getNodeName(e) {
  return e ? (e.nodeName || "").toLowerCase() : null;
}
function getDocumentElement(e) {
  return (isElement(e) ? e.ownerDocument : e.document).documentElement;
}
function getWindowScrollBarX(e) {
  return (
    getBoundingClientRect(getDocumentElement(e)).left +
    getWindowScroll(e).scrollLeft
  );
}
function getComputedStyle(e) {
  return getWindow(e).getComputedStyle(e);
}
function isScrollParent(e) {
  var t = getComputedStyle(e),
    r = t.overflow,
    n = t.overflowX,
    o = t.overflowY;
  return /auto|scroll|overlay|hidden/.test(r + o + n);
}
function getCompositeRect(e, t, r) {
  void 0 === r && (r = !1);
  var n = getDocumentElement(t),
    o = getBoundingClientRect(e),
    i = { scrollLeft: 0, scrollTop: 0 },
    a = { x: 0, y: 0 };
  return (
    r ||
      (("body" === getNodeName(t) && !isScrollParent(n)) ||
        (i = getNodeScroll(t)),
      isHTMLElement(t)
        ? (((a = getBoundingClientRect(t)).x += t.clientLeft),
          (a.y += t.clientTop))
        : n && (a.x = getWindowScrollBarX(n))),
    {
      x: o.left + i.scrollLeft - a.x,
      y: o.top + i.scrollTop - a.y,
      width: o.width,
      height: o.height,
    }
  );
}
function getLayoutRect(e) {
  return {
    x: e.offsetLeft,
    y: e.offsetTop,
    width: e.offsetWidth,
    height: e.offsetHeight,
  };
}
function getParentNode(e) {
  return "html" === getNodeName(e)
    ? e
    : e.assignedSlot || e.parentNode || e.host || getDocumentElement(e);
}
function getScrollParent(e) {
  return 0 <= ["html", "body", "#document"].indexOf(getNodeName(e))
    ? e.ownerDocument.body
    : isHTMLElement(e) && isScrollParent(e)
    ? e
    : getScrollParent(getParentNode(e));
}
function listScrollParents(e, t) {
  void 0 === t && (t = []);
  var r = getScrollParent(e),
    n = "body" === getNodeName(r),
    o = getWindow(r),
    i = n ? [o].concat(o.visualViewport || [], isScrollParent(r) ? r : []) : r,
    a = t.concat(i);
  return n ? a : a.concat(listScrollParents(getParentNode(i)));
}
function isTableElement(e) {
  return 0 <= ["table", "td", "th"].indexOf(getNodeName(e));
}
function getTrueOffsetParent(e) {
  return isHTMLElement(e) && "fixed" !== getComputedStyle(e).position
    ? e.offsetParent
    : null;
}
function getOffsetParent(e) {
  for (
    var t = getWindow(e), r = getTrueOffsetParent(e);
    r && isTableElement(r);

  )
    r = getTrueOffsetParent(r);
  return r &&
    "body" === getNodeName(r) &&
    "static" === getComputedStyle(r).position
    ? t
    : r || t;
}
Object.defineProperty(exports, "__esModule", { value: !0 });
var top = "top",
  bottom = "bottom",
  right = "right",
  left = "left",
  auto = "auto",
  basePlacements = [top, bottom, right, left],
  start = "start",
  end = "end",
  clippingParents = "clippingParents",
  viewport = "viewport",
  popper = "popper",
  reference = "reference",
  variationPlacements = basePlacements.reduce(function (e, t) {
    return e.concat([t + "-" + start, t + "-" + end]);
  }, []),
  placements = [].concat(basePlacements, [auto]).reduce(function (e, t) {
    return e.concat([t, t + "-" + start, t + "-" + end]);
  }, []),
  beforeRead = "beforeRead",
  read = "read",
  afterRead = "afterRead",
  beforeMain = "beforeMain",
  main = "main",
  afterMain = "afterMain",
  beforeWrite = "beforeWrite",
  write = "write",
  afterWrite = "afterWrite",
  modifierPhases = [
    beforeRead,
    read,
    afterRead,
    beforeMain,
    main,
    afterMain,
    beforeWrite,
    write,
    afterWrite,
  ];
function order(e) {
  var n = new Map(),
    o = new Set(),
    t = [];
  return (
    e.forEach(function (e) {
      n.set(e.name, e);
    }),
    e.forEach(function (e) {
      o.has(e.name) ||
        !(function r(e) {
          o.add(e.name),
            []
              .concat(e.requires || [], e.requiresIfExists || [])
              .forEach(function (e) {
                if (!o.has(e)) {
                  var t = n.get(e);
                  t && r(t);
                }
              }),
            t.push(e);
        })(e);
    }),
    t
  );
}
function orderModifiers(e) {
  var r = order(e);
  return modifierPhases.reduce(function (e, t) {
    return e.concat(
      r.filter(function (e) {
        return e.phase === t;
      })
    );
  }, []);
}
function debounce(t) {
  var r;
  return function () {
    return (r =
      r ||
      new Promise(function (e) {
        Promise.resolve().then(function () {
          (r = void 0), e(t());
        });
      }));
  };
}
function format(e) {
  for (
    var t = arguments.length, r = new Array(1 < t ? t - 1 : 0), n = 1;
    n < t;
    n++
  )
    r[n - 1] = arguments[n];
  return [].concat(r).reduce(function (e, t) {
    return e.replace(/%s/, t);
  }, e);
}
var INVALID_MODIFIER_ERROR =
    'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s',
  MISSING_DEPENDENCY_ERROR =
    'Popper: modifier "%s" requires "%s", but "%s" modifier is not available',
  VALID_PROPERTIES = [
    "name",
    "enabled",
    "phase",
    "fn",
    "effect",
    "requires",
    "options",
  ];
function validateModifiers(n) {
  n.forEach(function (r) {
    Object.keys(r).forEach(function (e) {
      switch (e) {
        case "name":
          "string" != typeof r.name &&
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                String(r.name),
                '"name"',
                '"string"',
                '"' + String(r.name) + '"'
              )
            );
          break;
        case "enabled":
          "boolean" != typeof r.enabled &&
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                r.name,
                '"enabled"',
                '"boolean"',
                '"' + String(r.enabled) + '"'
              )
            );
        case "phase":
          modifierPhases.indexOf(r.phase) < 0 &&
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                r.name,
                '"phase"',
                "either " + modifierPhases.join(", "),
                '"' + String(r.phase) + '"'
              )
            );
          break;
        case "fn":
          "function" != typeof r.fn &&
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                r.name,
                '"fn"',
                '"function"',
                '"' + String(r.fn) + '"'
              )
            );
          break;
        case "effect":
          "function" != typeof r.effect &&
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                r.name,
                '"effect"',
                '"function"',
                '"' + String(r.fn) + '"'
              )
            );
          break;
        case "requires":
          Array.isArray(r.requires) ||
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                r.name,
                '"requires"',
                '"array"',
                '"' + String(r.requires) + '"'
              )
            );
          break;
        case "requiresIfExists":
          Array.isArray(r.requiresIfExists) ||
            console.error(
              format(
                INVALID_MODIFIER_ERROR,
                r.name,
                '"requiresIfExists"',
                '"array"',
                '"' + String(r.requiresIfExists) + '"'
              )
            );
          break;
        case "options":
        case "data":
          break;
        default:
          console.error(
            'PopperJS: an invalid property has been provided to the "' +
              r.name +
              '" modifier, valid properties are ' +
              VALID_PROPERTIES.map(function (e) {
                return '"' + e + '"';
              }).join(", ") +
              '; but "' +
              e +
              '" was provided.'
          );
      }
      r.requires &&
        r.requires.forEach(function (t) {
          null ==
            n.find(function (e) {
              return e.name === t;
            }) &&
            console.error(
              format(MISSING_DEPENDENCY_ERROR, String(r.name), t, t)
            );
        });
    });
  });
}
function uniqueBy(e, r) {
  var n = new Set();
  return e.filter(function (e) {
    var t = r(e);
    if (!n.has(t)) return n.add(t), !0;
  });
}
function getBasePlacement(e) {
  return e.split("-")[0];
}
function mergeByName(e) {
  var t = e.reduce(function (e, t) {
    var r = e[t.name];
    return (
      (e[t.name] = r
        ? Object.assign({}, r, {}, t, {
            options: Object.assign({}, r.options, {}, t.options),
            data: Object.assign({}, r.data, {}, t.data),
          })
        : t),
      e
    );
  }, {});
  return Object.keys(t).map(function (e) {
    return t[e];
  });
}
var INVALID_ELEMENT_ERROR =
    "Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.",
  INFINITE_LOOP_ERROR =
    "Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.",
  DEFAULT_OPTIONS = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute",
  };
function areValidElements() {
  for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
    t[r] = arguments[r];
  return !t.some(function (e) {
    return !(e && "function" == typeof e.getBoundingClientRect);
  });
}
function popperGenerator(e) {
  void 0 === e && (e = {});
  var t = e.defaultModifiers,
    s = void 0 === t ? [] : t,
    r = e.defaultOptions,
    f = void 0 === r ? DEFAULT_OPTIONS : r;
  return function (n, o, t) {
    void 0 === t && (t = f);
    var c = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, {}, f),
        modifiersData: {},
        elements: { reference: n, popper: o },
        attributes: {},
        styles: {},
      },
      a = [],
      l = !1,
      d = {
        state: c,
        setOptions: function (e) {
          i(),
            (c.options = Object.assign({}, f, {}, c.options, {}, e)),
            (c.scrollParents = {
              reference: isElement(n)
                ? listScrollParents(n)
                : n.contextElement
                ? listScrollParents(n.contextElement)
                : [],
              popper: listScrollParents(o),
            });
          var t = orderModifiers(
            mergeByName([].concat(s, c.options.modifiers))
          );
          if (
            ((c.orderedModifiers = t.filter(function (e) {
              return e.enabled;
            })),
            "production" !== process.env.NODE_ENV)
          ) {
            if (
              (validateModifiers(
                uniqueBy([].concat(t, c.options.modifiers), function (e) {
                  return e.name;
                })
              ),
              getBasePlacement(c.options.placement) === auto)
            )
              c.orderedModifiers.find(function (e) {
                return "flip" === e.name;
              }) ||
                console.error(
                  [
                    'Popper: "auto" placements require the "flip" modifier be',
                    "present and enabled to work.",
                  ].join(" ")
                );
            var r = getComputedStyle(o);
            [r.marginTop, r.marginRight, r.marginBottom, r.marginLeft].some(
              function (e) {
                return parseFloat(e);
              }
            ) &&
              console.warn(
                [
                  'Popper: CSS "margin" styles cannot be used to apply padding',
                  "between the popper and its reference element or boundary.",
                  "To replicate margin, use the `offset` modifier, as well as",
                  "the `padding` option in the `preventOverflow` and `flip`",
                  "modifiers.",
                ].join(" ")
              );
          }
          return (
            c.orderedModifiers.forEach(function (e) {
              var t = e.name,
                r = e.options,
                n = void 0 === r ? {} : r,
                o = e.effect;
              if ("function" == typeof o) {
                var i = o({ state: c, name: t, instance: d, options: n });
                a.push(i || function () {});
              }
            }),
            d.update()
          );
        },
        forceUpdate: function () {
          if (!l) {
            var e = c.elements,
              t = e.reference,
              r = e.popper;
            if (areValidElements(t, r)) {
              (c.rects = {
                reference: getCompositeRect(
                  t,
                  getOffsetParent(r),
                  "fixed" === c.options.strategy
                ),
                popper: getLayoutRect(r),
              }),
                (c.reset = !1),
                (c.placement = c.options.placement),
                c.orderedModifiers.forEach(function (e) {
                  return (c.modifiersData[e.name] = Object.assign({}, e.data));
                });
              for (var n = 0, o = 0; o < c.orderedModifiers.length; o++) {
                if ("production" !== process.env.NODE_ENV && 100 < (n += 1)) {
                  console.error(INFINITE_LOOP_ERROR);
                  break;
                }
                if (!0 !== c.reset) {
                  var i = c.orderedModifiers[o],
                    a = i.fn,
                    s = i.options,
                    f = void 0 === s ? {} : s,
                    p = i.name;
                  "function" == typeof a &&
                    (c =
                      a({ state: c, options: f, name: p, instance: d }) || c);
                } else (c.reset = !1), (o = -1);
              }
            } else
              "production" !== process.env.NODE_ENV &&
                console.error(INVALID_ELEMENT_ERROR);
          }
        },
        update: debounce(function () {
          return new Promise(function (e) {
            d.forceUpdate(), e(c);
          });
        }),
        destroy: function () {
          i(), (l = !0);
        },
      };
    if (!areValidElements(n, o))
      return (
        "production" !== process.env.NODE_ENV &&
          console.error(INVALID_ELEMENT_ERROR),
        d
      );
    function i() {
      a.forEach(function (e) {
        return e();
      }),
        (a = []);
    }
    return (
      d.setOptions(t).then(function (e) {
        !l && t.onFirstUpdate && t.onFirstUpdate(e);
      }),
      d
    );
  };
}
var passive = { passive: !0 };
function effect(e) {
  var t = e.state,
    r = e.instance,
    n = e.options,
    o = n.scroll,
    i = void 0 === o || o,
    a = n.resize,
    s = void 0 === a || a,
    f = getWindow(t.elements.popper),
    p = [].concat(t.scrollParents.reference, t.scrollParents.popper);
  return (
    i &&
      p.forEach(function (e) {
        e.addEventListener("scroll", r.update, passive);
      }),
    s && f.addEventListener("resize", r.update, passive),
    function () {
      i &&
        p.forEach(function (e) {
          e.removeEventListener("scroll", r.update, passive);
        }),
        s && f.removeEventListener("resize", r.update, passive);
    }
  );
}
var eventListeners = {
  name: "eventListeners",
  enabled: !0,
  phase: "write",
  fn: function () {},
  effect: effect,
  data: {},
};
function getVariation(e) {
  return e.split("-")[1];
}
function getMainAxisFromPlacement(e) {
  return 0 <= ["top", "bottom"].indexOf(e) ? "x" : "y";
}
function computeOffsets(e) {
  var t,
    r = e.reference,
    n = e.element,
    o = e.placement,
    i = o ? getBasePlacement(o) : null,
    a = o ? getVariation(o) : null,
    s = r.x + r.width / 2 - n.width / 2,
    f = r.y + r.height / 2 - n.height / 2;
  switch (i) {
    case top:
      t = { x: s, y: r.y - n.height };
      break;
    case bottom:
      t = { x: s, y: r.y + r.height };
      break;
    case right:
      t = { x: r.x + r.width, y: f };
      break;
    case left:
      t = { x: r.x - n.width, y: f };
      break;
    default:
      t = { x: r.x, y: r.y };
  }
  var p = i ? getMainAxisFromPlacement(i) : null;
  if (null != p) {
    var c = "y" === p ? "height" : "width";
    switch (a) {
      case start:
        t[p] = Math.floor(t[p]) - Math.floor(r[c] / 2 - n[c] / 2);
        break;
      case end:
        t[p] = Math.floor(t[p]) + Math.ceil(r[c] / 2 - n[c] / 2);
    }
  }
  return t;
}
function popperOffsets(e) {
  var t = e.state,
    r = e.name;
  t.modifiersData[r] = computeOffsets({
    reference: t.rects.reference,
    element: t.rects.popper,
    strategy: "absolute",
    placement: t.placement,
  });
}
var popperOffsets$1 = {
    name: "popperOffsets",
    enabled: !0,
    phase: "read",
    fn: popperOffsets,
    data: {},
  },
  unsetSides = { top: "auto", right: "auto", bottom: "auto", left: "auto" };
function roundOffsets(e) {
  var t = e.x,
    r = e.y,
    n = window.devicePixelRatio || 1;
  return { x: Math.round(t * n) / n || 0, y: Math.round(r * n) / n || 0 };
}
function mapToStyles(e) {
  var t,
    r = e.popper,
    n = e.popperRect,
    o = e.placement,
    i = e.offsets,
    a = e.position,
    s = e.gpuAcceleration,
    f = e.adaptive,
    p = roundOffsets(i),
    c = p.x,
    l = p.y,
    d = i.hasOwnProperty("x"),
    u = i.hasOwnProperty("y"),
    m = left,
    g = top,
    h = window;
  if (f) {
    var v = getOffsetParent(r);
    v === getWindow(r) && (v = getDocumentElement(r)),
      o === top &&
        ((g = bottom), (l -= v.clientHeight - n.height), (l *= s ? 1 : -1)),
      o === left &&
        ((m = right), (c -= v.clientWidth - n.width), (c *= s ? 1 : -1));
  }
  var b,
    y = Object.assign({ position: a }, f && unsetSides);
  return s
    ? Object.assign(
        {},
        y,
        (((b = {})[g] = u ? "0" : ""),
        (b[m] = d ? "0" : ""),
        (b.transform =
          (h.devicePixelRatio || 1) < 2
            ? "translate(" + c + "px, " + l + "px)"
            : "translate3d(" + c + "px, " + l + "px, 0)"),
        b)
      )
    : Object.assign(
        {},
        y,
        (((t = {})[g] = u ? l + "px" : ""),
        (t[m] = d ? c + "px" : ""),
        (t.transform = ""),
        t)
      );
}
function computeStyles(e) {
  var t = e.state,
    r = e.options,
    n = r.gpuAcceleration,
    o = void 0 === n || n,
    i = r.adaptive,
    a = void 0 === i || i;
  if ("production" !== process.env.NODE_ENV) {
    var s = getComputedStyle(t.elements.popper).transitionProperty || "";
    a &&
      ["transform", "top", "right", "bottom", "left"].some(function (e) {
        return 0 <= s.indexOf(e);
      }) &&
      console.warn(
        [
          "Popper: Detected CSS transitions on at least one of the following",
          'CSS properties: "transform", "top", "right", "bottom", "left".',
          "\n\n",
          'Disable the "computeStyles" modifier\'s `adaptive` option to allow',
          "for smooth transitions, or remove these properties from the CSS",
          "transition declaration on the popper element if only transitioning",
          "opacity or background-color for example.",
          "\n\n",
          "We recommend using the popper element as a wrapper around an inner",
          "element that can have any CSS property transitioned for animations.",
        ].join(" ")
      );
  }
  var f = {
    placement: getBasePlacement(t.placement),
    popper: t.elements.popper,
    popperRect: t.rects.popper,
    gpuAcceleration: o,
  };
  null != t.modifiersData.popperOffsets &&
    (t.styles.popper = Object.assign(
      {},
      t.styles.popper,
      {},
      mapToStyles(
        Object.assign({}, f, {
          offsets: t.modifiersData.popperOffsets,
          position: t.options.strategy,
          adaptive: a,
        })
      )
    )),
    null != t.modifiersData.arrow &&
      (t.styles.arrow = Object.assign(
        {},
        t.styles.arrow,
        {},
        mapToStyles(
          Object.assign({}, f, {
            offsets: t.modifiersData.arrow,
            position: "absolute",
            adaptive: !1,
          })
        )
      )),
    (t.attributes.popper = Object.assign({}, t.attributes.popper, {
      "data-popper-placement": t.placement,
    }));
}
var computeStyles$1 = {
  name: "computeStyles",
  enabled: !0,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {},
};
function applyStyles(e) {
  var o = e.state;
  Object.keys(o.elements).forEach(function (e) {
    var t = o.styles[e] || {},
      r = o.attributes[e] || {},
      n = o.elements[e];
    isHTMLElement(n) &&
      getNodeName(n) &&
      (Object.assign(n.style, t),
      Object.keys(r).forEach(function (e) {
        var t = r[e];
        !1 === t ? n.removeAttribute(e) : n.setAttribute(e, !0 === t ? "" : t);
      }));
  });
}
function effect$1(e) {
  var o = e.state,
    i = {
      popper: {
        position: o.options.strategy,
        left: "0",
        top: "0",
        margin: "0",
      },
      arrow: { position: "absolute" },
      reference: {},
    };
  return (
    Object.assign(o.elements.popper.style, i.popper),
    o.elements.arrow && Object.assign(o.elements.arrow.style, i.arrow),
    function () {
      Object.keys(o.elements).forEach(function (e) {
        var t = o.elements[e],
          r = o.attributes[e] || {},
          n = Object.keys(
            o.styles.hasOwnProperty(e) ? o.styles[e] : i[e]
          ).reduce(function (e, t) {
            return (e[t] = ""), e;
          }, {});
        isHTMLElement(t) &&
          getNodeName(t) &&
          (Object.assign(t.style, n),
          Object.keys(r).forEach(function (e) {
            t.removeAttribute(e);
          }));
      });
    }
  );
}
var applyStyles$1 = {
  name: "applyStyles",
  enabled: !0,
  phase: "write",
  fn: applyStyles,
  effect: effect$1,
  requires: ["computeStyles"],
};
function distanceAndSkiddingToXY(e, t, r) {
  var n = getBasePlacement(e),
    o = 0 <= [left, top].indexOf(n) ? -1 : 1,
    i = "function" == typeof r ? r(Object.assign({}, t, { placement: e })) : r,
    a = i[0],
    s = i[1];
  return (
    (a = a || 0),
    (s = (s || 0) * o),
    0 <= [left, right].indexOf(n) ? { x: s, y: a } : { x: a, y: s }
  );
}
function offset(e) {
  var r = e.state,
    t = e.options,
    n = e.name,
    o = t.offset,
    i = void 0 === o ? [0, 0] : o,
    a = placements.reduce(function (e, t) {
      return (e[t] = distanceAndSkiddingToXY(t, r.rects, i)), e;
    }, {}),
    s = a[r.placement],
    f = s.x,
    p = s.y;
  null != r.modifiersData.popperOffsets &&
    ((r.modifiersData.popperOffsets.x += f),
    (r.modifiersData.popperOffsets.y += p)),
    (r.modifiersData[n] = a);
}
var offset$1 = {
    name: "offset",
    enabled: !0,
    phase: "main",
    requires: ["popperOffsets"],
    fn: offset,
  },
  hash = { left: "right", right: "left", bottom: "top", top: "bottom" };
function getOppositePlacement(e) {
  return e.replace(/left|right|bottom|top/g, function (e) {
    return hash[e];
  });
}
var hash$1 = { start: "end", end: "start" };
function getOppositeVariationPlacement(e) {
  return e.replace(/start|end/g, function (e) {
    return hash$1[e];
  });
}
function getViewportRect(e) {
  var t = getWindow(e),
    r = t.visualViewport,
    n = t.innerWidth,
    o = t.innerHeight;
  return (
    r &&
      /iPhone|iPod|iPad/.test(navigator.platform) &&
      ((n = r.width), (o = r.height)),
    { width: n, height: o, x: 0, y: 0 }
  );
}
function getDocumentRect(e) {
  var t = getWindow(e),
    r = getWindowScroll(e),
    n = getCompositeRect(getDocumentElement(e), t);
  return (
    (n.height = Math.max(n.height, t.innerHeight)),
    (n.width = Math.max(n.width, t.innerWidth)),
    (n.x = -r.scrollLeft),
    (n.y = -r.scrollTop),
    n
  );
}
function toNumber(e) {
  return parseFloat(e) || 0;
}
function getBorders(e) {
  var t = isHTMLElement(e) ? getComputedStyle(e) : {};
  return {
    top: toNumber(t.borderTopWidth),
    right: toNumber(t.borderRightWidth),
    bottom: toNumber(t.borderBottomWidth),
    left: toNumber(t.borderLeftWidth),
  };
}
function getDecorations(e) {
  var t = getWindow(e),
    r = getBorders(e),
    n = "html" === getNodeName(e),
    o = getWindowScrollBarX(e),
    i = e.clientWidth + r.right,
    a = e.clientHeight + r.bottom;
  return (
    n && 50 < t.innerHeight - e.clientHeight && (a = t.innerHeight - r.bottom),
    {
      top: n ? 0 : e.clientTop,
      right:
        e.clientLeft > r.left
          ? r.right
          : n
          ? t.innerWidth - i - o
          : e.offsetWidth - i,
      bottom: n ? t.innerHeight - a : e.offsetHeight - a,
      left: n ? o : e.clientLeft,
    }
  );
}
function contains(e, t) {
  var r = Boolean(t.getRootNode && t.getRootNode().host);
  if (e.contains(t)) return !0;
  if (r) {
    var n = t;
    do {
      if (n && e.isSameNode(n)) return !0;
      n = n.parentNode || n.host;
    } while (n);
  }
  return !1;
}
function rectToClientRect(e) {
  return Object.assign({}, e, {
    left: e.x,
    top: e.y,
    right: e.x + e.width,
    bottom: e.y + e.height,
  });
}
function getClientRectFromMixedType(e, t) {
  return t === viewport
    ? rectToClientRect(getViewportRect(e))
    : isHTMLElement(t)
    ? getBoundingClientRect(t)
    : rectToClientRect(getDocumentRect(getDocumentElement(e)));
}
function getClippingParents(e) {
  var t = listScrollParents(e),
    r =
      0 <= ["absolute", "fixed"].indexOf(getComputedStyle(e).position) &&
      isHTMLElement(e)
        ? getOffsetParent(e)
        : e;
  return isElement(r)
    ? t.filter(function (e) {
        return isElement(e) && contains(e, r);
      })
    : [];
}
function getClippingRect(o, e, t) {
  var r = "clippingParents" === e ? getClippingParents(o) : [].concat(e),
    n = [].concat(r, [t]),
    i = n[0],
    a = n.reduce(function (e, t) {
      var r = getClientRectFromMixedType(o, t),
        n = getDecorations(isHTMLElement(t) ? t : getDocumentElement(o));
      return (
        (e.top = Math.max(r.top + n.top, e.top)),
        (e.right = Math.min(r.right - n.right, e.right)),
        (e.bottom = Math.min(r.bottom - n.bottom, e.bottom)),
        (e.left = Math.max(r.left + n.left, e.left)),
        e
      );
    }, getClientRectFromMixedType(o, i));
  return (
    (a.width = a.right - a.left),
    (a.height = a.bottom - a.top),
    (a.x = a.left),
    (a.y = a.top),
    a
  );
}
function getFreshSideObject() {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
function mergePaddingObject(e) {
  return Object.assign({}, getFreshSideObject(), {}, e);
}
function expandToHashMap(r, e) {
  return e.reduce(function (e, t) {
    return (e[t] = r), e;
  }, {});
}
function detectOverflow(e, t) {
  void 0 === t && (t = {});
  var r = t.placement,
    n = void 0 === r ? e.placement : r,
    o = t.boundary,
    i = void 0 === o ? clippingParents : o,
    a = t.rootBoundary,
    s = void 0 === a ? viewport : a,
    f = t.elementContext,
    p = void 0 === f ? popper : f,
    c = t.altBoundary,
    l = void 0 !== c && c,
    d = t.padding,
    u = void 0 === d ? 0 : d,
    m = mergePaddingObject(
      "number" != typeof u ? u : expandToHashMap(u, basePlacements)
    ),
    g = p === popper ? reference : popper,
    h = e.elements.reference,
    v = e.rects.popper,
    b = e.elements[l ? g : p],
    y = getClippingRect(
      isElement(b)
        ? b
        : b.contextElement || getDocumentElement(e.elements.popper),
      i,
      s
    ),
    O = getBoundingClientRect(h),
    w = computeOffsets({
      reference: O,
      element: v,
      strategy: "absolute",
      placement: n,
    }),
    E = rectToClientRect(Object.assign({}, v, {}, w)),
    P = p === popper ? E : O,
    x = {
      top: y.top - P.top + m.top,
      bottom: P.bottom - y.bottom + m.bottom,
      left: y.left - P.left + m.left,
      right: P.right - y.right + m.right,
    },
    R = e.modifiersData.offset;
  if (p === popper && R) {
    var S = R[n];
    Object.keys(x).forEach(function (e) {
      var t = 0 <= [right, bottom].indexOf(e) ? 1 : -1,
        r = 0 <= [top, bottom].indexOf(e) ? "y" : "x";
      x[e] += S[r] * t;
    });
  }
  return x;
}
function computeAutoPlacement(r, e) {
  void 0 === e && (e = {});
  var t = e.placement,
    n = e.boundary,
    o = e.rootBoundary,
    i = e.padding,
    a = e.flipVariations,
    s = e.allowedAutoPlacements,
    f = void 0 === s ? placements : s,
    p = getVariation(t),
    c = (p
      ? a
        ? variationPlacements
        : variationPlacements.filter(function (e) {
            return getVariation(e) === p;
          })
      : basePlacements
    )
      .filter(function (e) {
        return 0 <= f.indexOf(e);
      })
      .reduce(function (e, t) {
        return (
          (e[t] = detectOverflow(r, {
            placement: t,
            boundary: n,
            rootBoundary: o,
            padding: i,
          })[getBasePlacement(t)]),
          e
        );
      }, {});
  return Object.keys(c).sort(function (e, t) {
    return c[e] - c[t];
  });
}
function getExpandedFallbackPlacements(e) {
  if (getBasePlacement(e) === auto) return [];
  var t = getOppositePlacement(e);
  return [
    getOppositeVariationPlacement(e),
    t,
    getOppositeVariationPlacement(t),
  ];
}
function flip(e) {
  var r = e.state,
    t = e.options,
    n = e.name;
  if (!r.modifiersData[n]._skip) {
    for (
      var o = t.mainAxis,
        i = void 0 === o || o,
        a = t.altAxis,
        s = void 0 === a || a,
        f = t.fallbackPlacements,
        p = t.padding,
        c = t.boundary,
        l = t.rootBoundary,
        d = t.altBoundary,
        u = t.flipVariations,
        m = void 0 === u || u,
        g = t.allowedAutoPlacements,
        h = r.options.placement,
        v = getBasePlacement(h),
        b =
          f ||
          (v === h || !m
            ? [getOppositePlacement(h)]
            : getExpandedFallbackPlacements(h)),
        y = [h].concat(b).reduce(function (e, t) {
          return e.concat(
            getBasePlacement(t) === auto
              ? computeAutoPlacement(r, {
                  placement: t,
                  boundary: c,
                  rootBoundary: l,
                  padding: p,
                  flipVariations: m,
                  allowedAutoPlacements: g,
                })
              : t
          );
        }, []),
        O = r.rects.reference,
        w = r.rects.popper,
        E = new Map(),
        P = !0,
        x = y[0],
        R = 0;
      R < y.length;
      R++
    ) {
      var S = y[R],
        M = getBasePlacement(S),
        D = getVariation(S) === start,
        N = 0 <= [top, bottom].indexOf(M),
        T = N ? "width" : "height",
        I = detectOverflow(r, {
          placement: S,
          boundary: c,
          rootBoundary: l,
          altBoundary: d,
          padding: p,
        }),
        L = N ? (D ? right : left) : D ? bottom : top;
      O[T] > w[T] && (L = getOppositePlacement(L));
      var A = getOppositePlacement(L),
        j = [];
      if (
        (i && j.push(I[M] <= 0),
        s && j.push(I[L] <= 0, I[A] <= 0),
        j.every(function (e) {
          return e;
        }))
      ) {
        (x = S), (P = !1);
        break;
      }
      E.set(S, j);
    }
    if (P)
      for (
        var _ = function (r) {
            var e = y.find(function (e) {
              var t = E.get(e);
              if (t)
                return t.slice(0, r).every(function (e) {
                  return e;
                });
            });
            if (e) return (x = e), "break";
          },
          B = m ? 3 : 1;
        0 < B;
        B--
      ) {
        if ("break" === _(B)) break;
      }
    r.placement !== x &&
      ((r.modifiersData[n]._skip = !0), (r.placement = x), (r.reset = !0));
  }
}
var flip$1 = {
  name: "flip",
  enabled: !0,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: { _skip: !1 },
};
function getAltAxis(e) {
  return "x" === e ? "y" : "x";
}
function within(e, t, r) {
  return Math.max(e, Math.min(t, r));
}
function preventOverflow(e) {
  var t = e.state,
    r = e.options,
    n = e.name,
    o = r.mainAxis,
    i = void 0 === o || o,
    a = r.altAxis,
    s = void 0 !== a && a,
    f = r.boundary,
    p = r.rootBoundary,
    c = r.altBoundary,
    l = r.padding,
    d = r.tether,
    u = void 0 === d || d,
    m = r.tetherOffset,
    g = void 0 === m ? 0 : m,
    h = detectOverflow(t, {
      boundary: f,
      rootBoundary: p,
      padding: l,
      altBoundary: c,
    }),
    v = getBasePlacement(t.placement),
    b = getVariation(t.placement),
    y = !b,
    O = getMainAxisFromPlacement(v),
    w = getAltAxis(O),
    E = t.modifiersData.popperOffsets,
    P = t.rects.reference,
    x = t.rects.popper,
    R =
      "function" == typeof g
        ? g(Object.assign({}, t.rects, { placement: t.placement }))
        : g,
    S = { x: 0, y: 0 };
  if (E) {
    if (i) {
      var M = "y" === O ? top : left,
        D = "y" === O ? bottom : right,
        N = "y" === O ? "height" : "width",
        T = E[O],
        I = E[O] + h[M],
        L = E[O] - h[D],
        A = u ? -x[N] / 2 : 0,
        j = b === start ? P[N] : x[N],
        _ = b === start ? -x[N] : -P[N],
        B = t.elements.arrow,
        C = u && B ? getLayoutRect(B) : { width: 0, height: 0 },
        V = t.modifiersData["arrow#persistent"]
          ? t.modifiersData["arrow#persistent"].padding
          : getFreshSideObject(),
        W = V[M],
        k = V[D],
        H = within(0, P[N], C[N]),
        F = y ? P[N] / 2 - A - H - W - R : j - H - W - R,
        q = y ? -P[N] / 2 + A + H + k + R : _ + H + k + R,
        $ = t.elements.arrow && getOffsetParent(t.elements.arrow),
        G = $ ? ("y" === O ? $.clientTop || 0 : $.clientLeft || 0) : 0,
        U = t.modifiersData.offset ? t.modifiersData.offset[t.placement][O] : 0,
        X = E[O] + F - U - G,
        Y = E[O] + q - U,
        z = within(u ? Math.min(I, X) : I, T, u ? Math.max(L, Y) : L);
      (E[O] = z), (S[O] = z - T);
    }
    if (s) {
      var J = "x" === O ? top : left,
        K = "x" === O ? bottom : right,
        Q = E[w],
        Z = within(Q + h[J], Q, Q - h[K]);
      (E[w] = Z), (S[w] = Z - Q);
    }
    t.modifiersData[n] = S;
  }
}
var preventOverflow$1 = {
  name: "preventOverflow",
  enabled: !0,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"],
};
function arrow(e) {
  var t,
    r = e.state,
    n = e.name,
    o = r.elements.arrow,
    i = r.modifiersData.popperOffsets,
    a = getBasePlacement(r.placement),
    s = getMainAxisFromPlacement(a),
    f = 0 <= [left, right].indexOf(a) ? "height" : "width";
  if (o && i) {
    var p = r.modifiersData[n + "#persistent"].padding,
      c = getLayoutRect(o),
      l = "y" === s ? top : left,
      d = "y" === s ? bottom : right,
      u =
        r.rects.reference[f] + r.rects.reference[s] - i[s] - r.rects.popper[f],
      m = i[s] - r.rects.reference[s],
      g = getOffsetParent(o),
      h = g ? ("y" === s ? g.clientHeight || 0 : g.clientWidth || 0) : 0,
      v = u / 2 - m / 2,
      b = p[l],
      y = h - c[f] - p[d],
      O = h / 2 - c[f] / 2 + v,
      w = within(b, O, y),
      E = s;
    r.modifiersData[n] = (((t = {})[E] = w), (t.centerOffset = w - O), t);
  }
}
function effect$2(e) {
  var t = e.state,
    r = e.options,
    n = e.name,
    o = r.element,
    i = void 0 === o ? "[data-popper-arrow]" : o,
    a = r.padding,
    s = void 0 === a ? 0 : a;
  null != i &&
    (("string" == typeof i && !(i = t.elements.popper.querySelector(i))) ||
      ("production" !== process.env.NODE_ENV &&
        (isHTMLElement(i) ||
          console.error(
            [
              'Popper: "arrow" element must be an HTMLElement (not an SVGElement).',
              "To use an SVG arrow, wrap it in an HTMLElement that will be used as",
              "the arrow.",
            ].join(" ")
          )),
      contains(t.elements.popper, i)
        ? ((t.elements.arrow = i),
          (t.modifiersData[n + "#persistent"] = {
            padding: mergePaddingObject(
              "number" != typeof s ? s : expandToHashMap(s, basePlacements)
            ),
          }))
        : "production" !== process.env.NODE_ENV &&
          console.error(
            [
              'Popper: "arrow" modifier\'s `element` must be a child of the popper',
              "element.",
            ].join(" ")
          )));
}
var arrow$1 = {
  name: "arrow",
  enabled: !0,
  phase: "main",
  fn: arrow,
  effect: effect$2,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"],
};
function getSideOffsets(e, t, r) {
  return (
    void 0 === r && (r = { x: 0, y: 0 }),
    {
      top: e.top - t.height - r.y,
      right: e.right - t.width + r.x,
      bottom: e.bottom - t.height + r.y,
      left: e.left - t.width - r.x,
    }
  );
}
function isAnySideFullyClipped(t) {
  return [top, right, bottom, left].some(function (e) {
    return 0 <= t[e];
  });
}
function hide(e) {
  var t = e.state,
    r = e.name,
    n = t.rects.reference,
    o = t.rects.popper,
    i = t.modifiersData.preventOverflow,
    a = detectOverflow(t, { elementContext: "reference" }),
    s = detectOverflow(t, { altBoundary: !0 }),
    f = getSideOffsets(a, n),
    p = getSideOffsets(s, o, i),
    c = isAnySideFullyClipped(f),
    l = isAnySideFullyClipped(p);
  (t.modifiersData[r] = {
    referenceClippingOffsets: f,
    popperEscapeOffsets: p,
    isReferenceHidden: c,
    hasPopperEscaped: l,
  }),
    (t.attributes.popper = Object.assign({}, t.attributes.popper, {
      "data-popper-reference-hidden": c,
      "data-popper-escaped": l,
    }));
}
var hide$1 = {
    name: "hide",
    enabled: !0,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: hide,
  },
  defaultModifiers = [
    eventListeners,
    popperOffsets$1,
    computeStyles$1,
    applyStyles$1,
    offset$1,
    flip$1,
    preventOverflow$1,
    arrow$1,
    hide$1,
  ],
  createPopper = popperGenerator({ defaultModifiers: defaultModifiers });
(exports.createPopper = createPopper),
  (exports.defaultModifiers = defaultModifiers),
  (exports.detectOverflow = detectOverflow),
  (exports.popperGenerator = popperGenerator);
