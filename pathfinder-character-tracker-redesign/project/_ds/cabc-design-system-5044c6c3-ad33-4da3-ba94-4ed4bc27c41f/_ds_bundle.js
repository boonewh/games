/* @ds-bundle: {"format":3,"namespace":"CABCDesignSystem_5044c6","components":[],"sourceHashes":{"design-canvas.jsx":"5d0e39003628","ui_kits/website/Footer.jsx":"33115f5d6c50","ui_kits/website/Hero.jsx":"6e712c5554c7","ui_kits/website/Navbar.jsx":"9001fbdd1300","ui_kits/website/ProudOfYou.jsx":"e0b82ad1f6d4","ui_kits/website/SportsStrip.jsx":"79ab764439a4","ui_kits/website/WaysToGive.jsx":"d853cd09aae7","ui_kits/website/ui.jsx":"278884acf721","website/heroes.jsx":"96634421a493","website/page-bold.jsx":"a37a6f23cc33","website/page-conservative.jsx":"21ee7e379285","website/sections.jsx":"c0d08dd44ff1"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CABCDesignSystem_5044c6 = window.CABCDesignSystem_5044c6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
/* global React */

window.Footer = function Footer() {
  return React.createElement('footer', {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      padding: '40px 0 28px'
    }
  }, React.createElement(window.Container, {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      gap: 24,
      alignItems: 'center'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: 0.85
    }
  }, 'Follow us here'), React.createElement('a', {
    href: 'https://www.facebook.com/compassabc',
    target: '_blank',
    rel: 'noreferrer',
    'aria-label': 'Facebook',
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      background: '#fff',
      color: 'var(--cabc-green)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      fontSize: 18,
      textDecoration: 'none'
    }
  }, 'f'), React.createElement('a', {
    href: 'https://www.mycompassacademy.com',
    target: '_blank',
    rel: 'noreferrer',
    style: {
      display: 'inline-flex'
    }
  }, React.createElement('img', {
    src: '../../assets/compass-academy-mark.png',
    alt: 'Compass Academy',
    style: {
      width: 44,
      height: 44,
      filter: 'brightness(0) invert(1)'
    }
  }))), React.createElement('div', {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, React.createElement('img', {
    src: '../../assets/cabc-logo.png',
    alt: '',
    style: {
      width: 72,
      height: 72
    }
  }), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: '-0.005em',
      textTransform: 'uppercase',
      color: '#fff'
    }
  }, 'Compass Athletic Booster Club')), React.createElement('div', {
    style: {
      textAlign: 'right',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      lineHeight: 1.6,
      opacity: 0.9
    }
  }, React.createElement('div', {}, '© 2026 CABC · Odessa, TX'), React.createElement('div', {
    style: {
      marginTop: 4
    }
  }, 'Content owned by us and our licensors.'))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
/* global React */
const {
  useState,
  useEffect
} = React;
window.Hero = function Hero() {
  const slides = [{
    src: '../../assets/photo-team-group.jpg',
    label: 'Team huddle'
  }, {
    src: '../../assets/photo-volleyball-champs.jpg',
    label: 'Lady Cougars Volleyball'
  }, {
    src: '../../assets/photo-football.jpg',
    label: 'Cougar Football'
  }, {
    src: '../../assets/photo-cross-country.jpg',
    label: 'Cross Country'
  }];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);
  return React.createElement('section', {
    style: {
      background: 'var(--cabc-blue)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }
  },
  // watermark
  React.createElement('img', {
    src: '../../assets/compass-watermark.svg',
    alt: '',
    style: {
      position: 'absolute',
      right: -120,
      top: -60,
      width: 520,
      height: 520,
      filter: 'brightness(0) invert(1)',
      opacity: 0.08,
      pointerEvents: 'none'
    }
  }), React.createElement(window.Container, {
    style: {
      padding: '64px 32px',
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1.05fr 1fr',
      gap: 48,
      alignItems: 'center'
    }
  }, React.createElement('div', {}, React.createElement(window.Eyebrow, {
    color: 'var(--cabc-green-light)'
  }, 'Compass Academy · Odessa, TX'), React.createElement(window.Display, {
    as: 'h1',
    size: 60,
    color: '#fff',
    style: {
      marginTop: 14,
      lineHeight: 0.98,
      maxWidth: 520
    }
  }, 'Proud of our cougars.'), React.createElement('p', {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 17,
      lineHeight: 1.65,
      marginTop: 20,
      maxWidth: 520,
      color: 'rgba(255,255,255,0.92)'
    }
  }, 'The Compass Athletic Booster Club supports the athletic programs at Compass Academy Charter School — football, volleyball, basketball, golf, tennis, track, cross country, cheer, baseball, and softball — by raising funds for equipment, facilities, and our student-athletes.'), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 28,
      flexWrap: 'wrap'
    }
  }, React.createElement(window.Button, {
    size: 'lg'
  }, 'Become a Member'), React.createElement(window.Button, {
    size: 'lg',
    variant: 'onBlue',
    style: {
      background: 'transparent',
      border: '2px solid #fff',
      color: '#fff'
    }
  }, 'Volunteer'))), React.createElement('div', {
    style: {
      position: 'relative'
    }
  }, React.createElement('div', {
    style: {
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(14,21,48,0.35)',
      aspectRatio: '4 / 3',
      border: '4px solid #fff'
    }
  }, slides.map((s, idx) => React.createElement('img', {
    key: idx,
    src: s.src,
    alt: s.label,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: i === idx ? 1 : 0,
      transition: 'opacity 700ms ease'
    }
  })), React.createElement('div', {
    style: {
      position: 'absolute',
      left: 16,
      bottom: 16,
      background: 'rgba(13,121,66,0.95)',
      color: '#fff',
      padding: '6px 14px',
      borderRadius: 999,
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }
  }, slides[i].label)), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      marginTop: 16
    }
  }, slides.map((_, idx) => React.createElement('button', {
    key: idx,
    onClick: () => setI(idx),
    'aria-label': `Slide ${idx + 1}`,
    style: {
      width: i === idx ? 28 : 10,
      height: 10,
      borderRadius: 999,
      background: i === idx ? 'var(--cabc-green)' : 'rgba(255,255,255,0.4)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 250ms ease',
      padding: 0
    }
  }))))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Navbar.jsx
try { (() => {
/* global React */

window.Navbar = function Navbar({
  active = 'HOME',
  onNav
}) {
  const items = ['HOME', 'SCHOLARSHIPS', 'BOARD MEETING', 'ABOUT US', 'EVENTS', 'SCHEDULES', 'TICKETS', 'VOLUNTEER', 'MORE'];
  return React.createElement('header', {
    style: {
      background: 'var(--cabc-blue)',
      color: '#fff',
      paddingTop: 14,
      paddingBottom: 14,
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }
  }, React.createElement(window.Container, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, React.createElement('img', {
    src: '../../assets/cabc-logo.png',
    alt: 'CABC',
    style: {
      width: 64,
      height: 64,
      background: '#fff',
      borderRadius: 999,
      padding: 2
    }
  }), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: '-0.005em',
      color: '#fff',
      textTransform: 'uppercase',
      lineHeight: 1
    }
  }, 'Compass Athletic Booster Club'), React.createElement('div', {
    style: {
      flex: 1
    }
  }), React.createElement(window.Button, {
    size: 'sm',
    variant: 'onBlue',
    icon: ' →'
  }, 'Shop')), React.createElement(window.Container, {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 10,
      marginTop: 12,
      flexWrap: 'wrap'
    }
  }, items.map(label => React.createElement('a', {
    key: label,
    href: '#',
    onClick: e => {
      e.preventDefault();
      onNav && onNav(label);
    },
    style: {
      fontFamily: 'var(--font-label)',
      fontWeight: 600,
      fontSize: 13,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#fff',
      textDecoration: 'none',
      padding: '6px 14px',
      borderRadius: 999,
      background: active === label ? 'var(--cabc-green)' : 'transparent',
      transition: 'background 150ms ease'
    },
    onMouseEnter: e => {
      if (active !== label) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
    },
    onMouseLeave: e => {
      if (active !== label) e.currentTarget.style.background = 'transparent';
    }
  }, label))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Navbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProudOfYou.jsx
try { (() => {
/* global React */
const {
  useState
} = React;
window.ProudOfYou = function ProudOfYou() {
  const photos = ['../../assets/photo-team-group.jpg', '../../assets/photo-volleyball-champs.jpg', '../../assets/photo-cross-country.jpg', '../../assets/photo-football.jpg', '../../assets/photo-golf.jpg', '../../assets/photo-tennis.jpg', '../../assets/photo-mascot.jpg'];
  const [start, setStart] = useState(0);
  const visible = 4;
  const view = Array.from({
    length: visible
  }, (_, i) => photos[(start + i) % photos.length]);
  return React.createElement('section', {
    style: {
      position: 'relative',
      padding: '90px 0 70px',
      overflow: 'hidden',
      background: '#fff'
    }
  }, React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${photos[1]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(28px) grayscale(0.3)',
      opacity: 0.55,
      transform: 'scale(1.1)'
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(255,255,255,0.55)'
    }
  }), React.createElement(window.Container, {
    style: {
      position: 'relative'
    }
  }, React.createElement('div', {
    style: {
      textAlign: 'center',
      marginBottom: 40
    }
  }, React.createElement(window.Display, {
    as: 'h2',
    size: 64
  }, 'We are proud of you')), React.createElement('div', {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, React.createElement('button', {
    onClick: () => setStart((start - 1 + photos.length) % photos.length),
    'aria-label': 'Previous',
    style: arrowStyle()
  }, '‹'), React.createElement('div', {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: `repeat(${visible}, 1fr)`,
      gap: 18
    }
  }, view.map((src, i) => React.createElement('div', {
    key: start + '-' + i,
    style: {
      aspectRatio: '1 / 1',
      borderRadius: 999,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 12px 32px rgba(14,21,48,0.18)',
      border: '4px solid #fff'
    }
  }, React.createElement('img', {
    src,
    alt: '',
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })))), React.createElement('button', {
    onClick: () => setStart((start + 1) % photos.length),
    'aria-label': 'Next',
    style: arrowStyle()
  }, '›')), React.createElement('div', {
    style: {
      textAlign: 'center',
      marginTop: 36
    }
  }, React.createElement('p', {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--ink-2)',
      margin: '0 0 16px'
    }
  }, 'Share your pictures with us and we will share them here!'), React.createElement(window.Button, {
    size: 'md',
    icon: ''
  }, '+ Upload files'))));
};
function arrowStyle() {
  return {
    width: 48,
    height: 48,
    borderRadius: 999,
    background: 'var(--cabc-blue)',
    color: '#fff',
    border: 'none',
    fontSize: 28,
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(14,21,48,0.18)'
  };
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProudOfYou.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SportsStrip.jsx
try { (() => {
/* global React */

window.SportsStrip = function SportsStrip() {
  const sports = ['Football', 'Volleyball', 'Basketball', 'Golf', 'Tennis', 'Track', 'Cross Country', 'Cheer', 'Baseball', 'Softball'];
  return React.createElement('section', {
    style: {
      background: 'var(--paper-2)',
      borderTop: '1px solid var(--hairline)',
      borderBottom: '1px solid var(--hairline)'
    }
  }, React.createElement(window.Container, {
    style: {
      padding: '36px 32px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--cabc-blue)',
      textTransform: 'uppercase',
      letterSpacing: '-0.005em'
    }
  }, 'We support all 10 sports —'), sports.map((s, i) => React.createElement('span', {
    key: s,
    style: {
      fontFamily: 'var(--font-label)',
      fontWeight: 600,
      fontSize: 13,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--ink-2)',
      position: 'relative',
      paddingRight: 14
    }
  }, s, i < sports.length - 1 ? React.createElement('span', {
    style: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--cabc-green)'
    }
  }, '·') : null)))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SportsStrip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/WaysToGive.jsx
try { (() => {
/* global React */

window.WaysToGive = function WaysToGive() {
  const items = [{
    eyebrow: 'Sign up',
    title: 'Become a Member',
    copy: 'Annual memberships fund equipment, travel, and post-season banquets across all 10 sports.',
    cta: 'Join CABC',
    variant: 'blue',
    photo: '../../assets/photo-volleyball-champs.jpg'
  }, {
    eyebrow: 'Lend a hand',
    title: 'Volunteer',
    copy: 'Help at the gate, the concession stand at the Cougars Den, the watermelon feed, and game-day setup.',
    cta: 'Volunteer',
    variant: 'green',
    photo: '../../assets/photo-cross-country.jpg'
  }, {
    eyebrow: 'Give back',
    title: 'Donate',
    copy: 'Every dollar goes straight to our student-athletes, coaches, and training staff.',
    cta: 'Donate via Venmo',
    variant: 'soft',
    photo: '../../assets/photo-football.jpg'
  }];
  const card = (it, idx) => {
    const styles = {
      blue: {
        bg: 'var(--cabc-blue)',
        fg: '#fff',
        cta: 'onBlue'
      },
      green: {
        bg: 'var(--cabc-green)',
        fg: '#fff',
        cta: 'primaryDark'
      },
      soft: {
        bg: '#fff',
        fg: 'var(--ink)',
        cta: 'primary'
      }
    }[it.variant];
    return React.createElement('article', {
      key: idx,
      style: {
        background: styles.bg,
        color: styles.fg,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 6px 18px rgba(14,21,48,0.10)',
        border: it.variant === 'soft' ? '1px solid var(--hairline)' : 'none'
      }
    }, React.createElement('div', {
      style: {
        height: 180,
        backgroundImage: `url(${it.photo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }), React.createElement('div', {
      style: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flex: 1
      }
    }, React.createElement(window.Eyebrow, {
      color: it.variant === 'blue' ? 'var(--cabc-green-light)' : it.variant === 'green' ? 'rgba(255,255,255,0.85)' : 'var(--cabc-green)'
    }, it.eyebrow), React.createElement(window.Display, {
      as: 'h3',
      size: 30,
      color: styles.fg
    }, it.title), React.createElement('p', {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        lineHeight: 1.6,
        margin: 0,
        color: it.variant === 'soft' ? 'var(--fg-2)' : 'rgba(255,255,255,0.92)',
        flex: 1
      }
    }, it.copy), React.createElement('div', {
      style: {
        marginTop: 8
      }
    }, React.createElement(window.Button, {
      size: 'md',
      variant: styles.cta,
      style: it.variant === 'blue' ? {
        background: '#fff',
        color: 'var(--cabc-blue)'
      } : null
    }, it.cta))));
  };
  return React.createElement('section', {
    style: {
      background: '#fff',
      padding: '80px 0'
    }
  }, React.createElement(window.Container, {}, React.createElement('div', {
    style: {
      textAlign: 'center',
      marginBottom: 36
    }
  }, React.createElement(window.Eyebrow, {}, 'Get Involved'), React.createElement(window.Display, {
    as: 'h2',
    size: 56,
    style: {
      marginTop: 8
    }
  }, 'Three ways to back our cougars.')), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24
    }
  }, items.map(card))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/WaysToGive.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ui.jsx
try { (() => {
/* global React */
const {
  useState,
  useEffect
} = React;

// ---------- Primitives ----------
window.Container = function Container({
  children,
  style
}) {
  return React.createElement('div', {
    style: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '0 32px',
      ...style
    }
  }, children);
};
window.Eyebrow = function Eyebrow({
  children,
  color
}) {
  return React.createElement('div', {
    style: {
      fontFamily: 'var(--font-label)',
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: color || 'var(--cabc-green)'
    }
  }, children);
};
window.Display = function Display({
  as = 'h2',
  size = 48,
  children,
  color,
  style
}) {
  return React.createElement(as, {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.05,
      letterSpacing: '-0.005em',
      textTransform: 'uppercase',
      color: color || 'var(--cabc-blue)',
      margin: 0,
      ...style
    }
  }, children);
};
window.Button = function Button({
  children,
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  onClick,
  style,
  icon
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-label)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: 999,
    transition: 'background 150ms ease, transform 100ms ease'
  };
  const sizes = {
    sm: {
      padding: '10px 20px',
      fontSize: 12
    },
    md: {
      padding: '14px 28px',
      fontSize: 14
    },
    lg: {
      padding: '16px 34px',
      fontSize: 15
    }
  };
  const variants = {
    primary: {
      background: 'var(--cabc-green)',
      color: '#fff'
    },
    primaryDark: {
      background: 'var(--cabc-green-dark)',
      color: '#fff'
    },
    blue: {
      background: 'var(--cabc-blue)',
      color: '#fff'
    },
    outline: {
      background: 'transparent',
      color: 'var(--cabc-blue)',
      border: '2px solid var(--cabc-blue)',
      padding: '12px 26px'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--cabc-blue)'
    },
    onBlue: {
      background: 'var(--cabc-green)',
      color: '#fff'
    }
  };
  const props = {
    onClick,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...style
    },
    onMouseDown: e => {
      e.currentTarget.style.transform = 'scale(0.98)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };
  if (as === 'a') return React.createElement('a', {
    ...props,
    href
  }, children, icon);
  return React.createElement('button', props, children, icon);
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ui.jsx", error: String((e && e.message) || e) }); }

// website/heroes.jsx
try { (() => {
/* global React */
// ============================================================
// Three hero variations for CABC homepage.
// Each is self-contained and can be rendered in a 1280x720 frame.
// They share the same Navbar; they differ in hero treatment.
// ============================================================

const photos = ['../assets/photo-team-group.jpg', '../assets/photo-volleyball-champs.jpg', '../assets/photo-football.jpg', '../assets/photo-cross-country.jpg', '../assets/photo-mascot.jpg'];

// ---------- Shared mini-nav (compact for previews) ----------
window.MiniNav = function MiniNav() {
  const items = ['HOME', 'EVENTS', 'SCHEDULES', 'TICKETS', 'VOLUNTEER', 'GET INVOLVED'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'var(--cabc-blue)',
      color: '#fff',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/cabc-logo.png",
    alt: "",
    style: {
      width: 48,
      height: 48,
      background: '#fff',
      borderRadius: 999,
      padding: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 18,
      textTransform: 'uppercase',
      letterSpacing: '-0.005em'
    }
  }, "Compass Athletic Booster Club"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 18
    }
  }, items.map((label, i) => /*#__PURE__*/React.createElement("a", {
    key: label,
    href: "#",
    style: {
      fontFamily: 'var(--font-label)',
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: '0.12em',
      color: '#fff',
      textDecoration: 'none',
      padding: '6px 12px',
      borderRadius: 999,
      background: i === 0 ? 'var(--cabc-green)' : 'transparent'
    }
  }, label))), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      padding: '8px 18px',
      borderRadius: 999,
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: '0.1em',
      cursor: 'pointer'
    }
  }, "SHOP \u2192"));
};

// ============================================================
// HERO A — "Combined": photo slider + about copy in one section.
//   What I built originally. Conservative reading of the existing site.
// ============================================================
window.HeroA = function HeroA() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % photos.length), 4500);
    return () => clearInterval(t);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(window.MiniNav, null), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cabc-blue)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/compass-watermark.svg",
    alt: "",
    style: {
      position: 'absolute',
      right: -100,
      top: -60,
      width: 460,
      height: 460,
      filter: 'brightness(0) invert(1)',
      opacity: 0.08
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1.05fr 1fr',
      gap: 40,
      padding: '0 48px',
      width: '100%',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--cabc-green-light)'
    }
  }, "Compass Academy \xB7 Odessa, TX"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 64,
      lineHeight: 0.95,
      color: '#fff',
      textTransform: 'uppercase',
      margin: '12px 0 0',
      letterSpacing: '-0.005em'
    }
  }, "Proud of our cougars."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.6,
      marginTop: 18,
      maxWidth: 460,
      color: 'rgba(255,255,255,0.92)'
    }
  }, "The Compass Athletic Booster Club supports football, volleyball, basketball, golf, tennis, track, cross country, cheer, baseball, and softball \u2014 raising funds for equipment, facilities, and our student-athletes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '12px 22px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Become a Member"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'transparent',
      color: '#fff',
      border: '2px solid #fff',
      borderRadius: 999,
      padding: '10px 22px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Volunteer"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      border: '4px solid #fff',
      boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
      aspectRatio: '4/3'
    }
  }, photos.map((src, idx) => /*#__PURE__*/React.createElement("img", {
    key: idx,
    src: src,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: i === idx ? 1 : 0,
      transition: 'opacity 700ms ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 12,
      bottom: 12,
      display: 'flex',
      gap: 6
    }
  }, photos.map((_, idx) => /*#__PURE__*/React.createElement("span", {
    key: idx,
    style: {
      width: i === idx ? 22 : 8,
      height: 8,
      borderRadius: 999,
      background: i === idx ? 'var(--cabc-green)' : 'rgba(255,255,255,0.6)',
      transition: 'all 250ms'
    }
  })))))));
};

// ============================================================
// HERO B — "Stadium": full-bleed photo, headline overlay, no body copy.
//   Cinematic. Big-game-night energy. About copy lives in its own section below.
// ============================================================
window.HeroB = function HeroB() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % photos.length), 4500);
    return () => clearInterval(t);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(window.MiniNav, null), /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      flex: 1,
      overflow: 'hidden',
      background: '#000'
    }
  }, photos.map((src, idx) => /*#__PURE__*/React.createElement("img", {
    key: idx,
    src: src,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: i === idx ? 1 : 0,
      transition: 'opacity 900ms ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(33,63,152,0.65) 0%, rgba(14,21,48,0.45) 50%, rgba(6,60,33,0.85) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '0 48px 56px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: '#fff',
      opacity: 0.9
    }
  }, "Compass Athletic Booster Club"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 96,
      lineHeight: 0.92,
      color: '#fff',
      textTransform: 'uppercase',
      margin: '8px 0 0',
      letterSpacing: '-0.01em',
      maxWidth: 920,
      textShadow: '0 4px 24px rgba(0,0,0,0.5)'
    }
  }, "For the love of our cougars."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 24,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '14px 28px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Become a Member"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.5)',
      borderRadius: 999,
      padding: '13px 24px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "See Schedules"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 6
    }
  }, photos.map((_, idx) => /*#__PURE__*/React.createElement("button", {
    key: idx,
    onClick: () => setI(idx),
    "aria-label": `Slide ${idx + 1}`,
    style: {
      width: i === idx ? 28 : 10,
      height: 10,
      borderRadius: 999,
      background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 250ms',
      padding: 0
    }
  })))))));
};

// ============================================================
// HERO C — "Scoreboard": split panels, headline + about copy + next-up game card.
//   Editorial / informational. Surfaces a game schedule in the hero itself.
// ============================================================
window.HeroC = function HeroC() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(window.MiniNav, null), /*#__PURE__*/React.createElement("section", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1.15fr 1fr',
      background: 'var(--cabc-blue)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '36px 44px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/compass-watermark.svg",
    alt: "",
    style: {
      position: 'absolute',
      left: -80,
      bottom: -80,
      width: 360,
      height: 360,
      filter: 'brightness(0) invert(1)',
      opacity: 0.08
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 11,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--cabc-green-light)'
    }
  }, "Est. for the cougars \xB7 Odessa, TX"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 58,
      lineHeight: 0.95,
      color: '#fff',
      textTransform: 'uppercase',
      margin: '10px 0 0',
      letterSpacing: '-0.005em'
    }
  }, "Hand-in-hand with academic excellence."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.6,
      marginTop: 16,
      maxWidth: 480,
      color: 'rgba(255,255,255,0.92)'
    }
  }, "The Compass Athletic Booster Club raises funds for equipment, facilities, and our student-athletes across all 10 sports \u2014 supporting strong moral character alongside academic excellence."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '12px 22px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Become a Member"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: '#fff',
      color: 'var(--cabc-blue)',
      border: 'none',
      borderRadius: 999,
      padding: '12px 22px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Volunteer")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: photos[1],
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, transparent 50%, rgba(6,60,33,0.4) 100%)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      padding: '20px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: 0.85
    }
  }, "Up Next"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 22,
      textTransform: 'uppercase',
      letterSpacing: '-0.005em',
      marginTop: 2
    }
  }, "Cougars vs. Trinity"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      opacity: 0.9,
      marginTop: 2
    }
  }, "Fri Sep 5 \xB7 7:00 PM \xB7 Cougar Field")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      background: '#fff',
      color: 'var(--cabc-green)',
      border: 'none',
      borderRadius: 999,
      padding: '10px 18px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Tickets")))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "website/heroes.jsx", error: String((e && e.message) || e) }); }

// website/page-bold.jsx
try { (() => {
/* global React */
// Bold full page — Hero B (cinematic) + a stat ribbon + dark Ways to Give + magazine gallery.
// Adds visual rhythm with a dark "Why we matter" section and a tilted achievement ribbon.

window.StatRibbon = function StatRibbon() {
  const stats = [{
    num: '10',
    label: 'Sports supported'
  }, {
    num: '300+',
    label: 'Student-athletes'
  }, {
    num: '7',
    label: 'District titles since \u201920'
  }, {
    num: '100%',
    label: 'Goes to the kids'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      padding: '36px 48px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24
    }
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.25)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 64,
      lineHeight: 1,
      letterSpacing: '-0.01em'
    }
  }, s.num), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginTop: 8,
      opacity: 0.9
    }
  }, s.label)))));
};
window.AboutDark = function AboutDark() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cabc-blue)',
      color: '#fff',
      padding: '90px 48px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/compass-watermark.svg",
    alt: "",
    style: {
      position: 'absolute',
      left: -120,
      top: -100,
      width: 540,
      height: 540,
      filter: 'brightness(0) invert(1)',
      opacity: 0.07
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
      aspectRatio: '4/3',
      border: '4px solid #fff'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/photo-team-group.jpg",
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--cabc-green-light)'
    }
  }, "Who we are"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 60,
      lineHeight: 0.95,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '-0.005em',
      margin: '10px 0 18px'
    }
  }, "Hand-in-hand with academic excellence."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 17,
      lineHeight: 1.7,
      margin: 0,
      color: 'rgba(255,255,255,0.92)'
    }
  }, "The Compass Athletic Booster Club supports the athletic programs at Compass \u2014 football, volleyball, basketball, golf, tennis, track, cross country, cheer, baseball, and softball. We support the financial needs of our student-athletes, coaches, and training staff and facilities."), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 24,
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '14px 28px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Read More"))));
};
window.MagazineGallery = function MagazineGallery() {
  const tiles = [{
    src: '../assets/photo-volleyball-champs.jpg',
    label: 'Volleyball',
    tag: 'District Champs'
  }, {
    src: '../assets/photo-football.jpg',
    label: 'Football',
    tag: 'Green & White Game'
  }, {
    src: '../assets/photo-cross-country.jpg',
    label: 'Cross Country',
    tag: 'Lady Cougars'
  }, {
    src: '../assets/photo-golf.jpg',
    label: 'Golf',
    tag: 'Cougar Golf'
  }, {
    src: '../assets/photo-tennis.jpg',
    label: 'Tennis',
    tag: 'Singles'
  }, {
    src: '../assets/photo-mascot.jpg',
    label: 'Game Day',
    tag: 'Cougar Mascot'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: '#0B1740',
      color: '#fff',
      padding: '90px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--cabc-green-light)'
    }
  }, "This week at Compass"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 64,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '-0.005em',
      margin: '8px 0 0'
    }
  }, "Proud of you.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr',
      gridTemplateRows: 'repeat(2, 220px)',
      gap: 16
    }
  }, tiles.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      gridColumn: i === 0 ? 'span 1' : 'auto',
      gridRow: i === 0 ? 'span 2' : 'auto',
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: t.src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 14,
      bottom: 12,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 10,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: 0.85
    }
  }, t.tag), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 22,
      textTransform: 'uppercase',
      letterSpacing: '-0.005em'
    }
  }, t.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'transparent',
      color: '#fff',
      border: '2px solid #fff',
      borderRadius: 999,
      padding: '12px 26px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "+ Upload your photos"))));
};
window.PageBold = function PageBold() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.HeroB, null), /*#__PURE__*/React.createElement(window.StatRibbon, null), /*#__PURE__*/React.createElement(window.AboutDark, null), /*#__PURE__*/React.createElement(window.SectionSports, null), /*#__PURE__*/React.createElement(window.SectionWaysToGive, null), /*#__PURE__*/React.createElement(window.MagazineGallery, null), /*#__PURE__*/React.createElement(window.SectionFooter, null));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "website/page-bold.jsx", error: String((e && e.message) || e) }); }

// website/page-conservative.jsx
try { (() => {
/* global React */
// Conservative full page — uses Hero A and existing sections.

window.PageConservative = function PageConservative() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.HeroA, null), /*#__PURE__*/React.createElement(window.SectionSports, null), /*#__PURE__*/React.createElement(window.SectionAbout, null), /*#__PURE__*/React.createElement(window.SectionWaysToGive, null), /*#__PURE__*/React.createElement(window.SectionProudOfYou, null), /*#__PURE__*/React.createElement(window.SectionFooter, null));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "website/page-conservative.jsx", error: String((e && e.message) || e) }); }

// website/sections.jsx
try { (() => {
/* global React */
// Shared sections used across the Conservative + Bold full-page treatments.

window.SectionAbout = function SectionAbout({
  tone = 'light'
}) {
  const isDark = tone === 'dark';
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: isDark ? 'var(--cabc-blue)' : '#fff',
      color: isDark ? '#fff' : 'var(--ink)',
      padding: '72px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: isDark ? 'var(--cabc-green-light)' : 'var(--cabc-green)'
    }
  }, "Who we are"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 52,
      lineHeight: 1.0,
      textTransform: 'uppercase',
      letterSpacing: '-0.005em',
      margin: '10px 0 18px',
      color: isDark ? '#fff' : 'var(--cabc-blue)'
    }
  }, "Strong moral character, hand-in-hand with academic excellence."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 16,
      lineHeight: 1.7,
      margin: 0,
      opacity: isDark ? 0.92 : 1,
      maxWidth: 520
    }
  }, "The Compass Athletic Booster Club was established to support the athletic programs at Compass \u2014 football, volleyball, basketball, golf, tennis, track, cross country, cheer, baseball, and softball. We support the financial needs of our student-athletes, coaches, and training staff and facilities."), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 22,
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '13px 26px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Read More")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(14,21,48,0.18)',
      aspectRatio: '4/3'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/photo-team-group.jpg",
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }))));
};
window.SectionSports = function SectionSports() {
  const sports = ['Football', 'Volleyball', 'Basketball', 'Golf', 'Tennis', 'Track', 'Cross Country', 'Cheer', 'Baseball', 'Softball'];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--paper-2)',
      borderTop: '1px solid var(--hairline)',
      borderBottom: '1px solid var(--hairline)',
      padding: '32px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--cabc-blue)',
      textTransform: 'uppercase',
      letterSpacing: '-0.005em'
    }
  }, "10 sports, one cougar nation \u2014"), sports.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      fontFamily: 'var(--font-label)',
      fontWeight: 600,
      fontSize: 13,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--ink-2)',
      position: 'relative',
      paddingRight: 12
    }
  }, s, i < sports.length - 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 0,
      color: 'var(--cabc-green)'
    }
  }, "\xB7")))));
};
window.SectionWaysToGive = function SectionWaysToGive({
  tone = 'light'
}) {
  const items = [{
    eyebrow: 'Sign up',
    title: 'Become a Member',
    copy: 'Annual memberships fund equipment, travel, and post-season banquets across all 10 sports.',
    cta: 'Join CABC',
    variant: 'blue',
    photo: '../assets/photo-volleyball-champs.jpg'
  }, {
    eyebrow: 'Lend a hand',
    title: 'Volunteer',
    copy: 'Help at the gate, the Cougars Den, the watermelon feed, and game-day setup.',
    cta: 'Volunteer',
    variant: 'green',
    photo: '../assets/photo-cross-country.jpg'
  }, {
    eyebrow: 'Give back',
    title: 'Donate',
    copy: 'Every dollar goes straight to our student-athletes, coaches, and training staff.',
    cta: 'Donate via Venmo',
    variant: 'soft',
    photo: '../assets/photo-football.jpg'
  }];
  const styles = {
    blue: {
      bg: 'var(--cabc-blue)',
      fg: '#fff'
    },
    green: {
      bg: 'var(--cabc-green)',
      fg: '#fff'
    },
    soft: {
      bg: '#fff',
      fg: 'var(--ink)'
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: tone === 'dark' ? '#0B1740' : '#fff',
      padding: '80px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--cabc-green)'
    }
  }, "Get Involved"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 56,
      textTransform: 'uppercase',
      letterSpacing: '-0.005em',
      margin: '8px 0 0',
      color: tone === 'dark' ? '#fff' : 'var(--cabc-blue)'
    }
  }, "Three ways to back our cougars.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24
    }
  }, items.map((it, idx) => {
    const s = styles[it.variant];
    return /*#__PURE__*/React.createElement("article", {
      key: idx,
      style: {
        background: s.bg,
        color: s.fg,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 6px 18px rgba(14,21,48,0.10)',
        border: it.variant === 'soft' ? '1px solid var(--hairline)' : 'none',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 180,
        backgroundImage: `url(${it.photo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-label)',
        fontSize: 12,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: it.variant === 'blue' ? 'var(--cabc-green-light)' : it.variant === 'green' ? 'rgba(255,255,255,0.85)' : 'var(--cabc-green)'
      }
    }, it.eyebrow), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: 30,
        textTransform: 'uppercase',
        letterSpacing: '-0.005em',
        margin: 0,
        color: s.fg
      }
    }, it.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        lineHeight: 1.6,
        margin: 0,
        color: it.variant === 'soft' ? 'var(--fg-2)' : 'rgba(255,255,255,0.92)',
        flex: 1
      }
    }, it.copy), /*#__PURE__*/React.createElement("button", {
      style: {
        marginTop: 8,
        alignSelf: 'flex-start',
        background: it.variant === 'blue' ? '#fff' : it.variant === 'green' ? 'var(--cabc-green-dark)' : 'var(--cabc-green)',
        color: it.variant === 'blue' ? 'var(--cabc-blue)' : '#fff',
        border: 'none',
        borderRadius: 999,
        padding: '12px 22px',
        fontFamily: 'var(--font-label)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: 'pointer'
      }
    }, it.cta)));
  }))));
};
window.SectionProudOfYou = function SectionProudOfYou() {
  const photos = ['../assets/photo-team-group.jpg', '../assets/photo-volleyball-champs.jpg', '../assets/photo-cross-country.jpg', '../assets/photo-football.jpg', '../assets/photo-golf.jpg', '../assets/photo-tennis.jpg', '../assets/photo-mascot.jpg'];
  const [start, setStart] = React.useState(0);
  const visible = 4;
  const view = Array.from({
    length: visible
  }, (_, i) => photos[(start + i) % photos.length]);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      padding: '90px 48px 70px',
      overflow: 'hidden',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${photos[1]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(28px) grayscale(0.3)',
      opacity: 0.5,
      transform: 'scale(1.1)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(255,255,255,0.55)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 1200,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 64,
      color: 'var(--cabc-blue)',
      textTransform: 'uppercase',
      letterSpacing: '-0.005em',
      margin: 0
    }
  }, "We are proud of you")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setStart((start - 1 + photos.length) % photos.length),
    "aria-label": "Prev",
    style: {
      width: 48,
      height: 48,
      borderRadius: 999,
      background: 'var(--cabc-blue)',
      color: '#fff',
      border: 'none',
      fontSize: 24,
      cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(14,21,48,0.18)'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: `repeat(${visible}, 1fr)`,
      gap: 18
    }
  }, view.map((src, i) => /*#__PURE__*/React.createElement("div", {
    key: start + '-' + i,
    style: {
      aspectRatio: '1/1',
      borderRadius: 999,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 12px 32px rgba(14,21,48,0.18)',
      border: '4px solid #fff'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setStart((start + 1) % photos.length),
    "aria-label": "Next",
    style: {
      width: 48,
      height: 48,
      borderRadius: 999,
      background: 'var(--cabc-blue)',
      color: '#fff',
      border: 'none',
      fontSize: 24,
      cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(14,21,48,0.18)'
    }
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 30
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--ink-2)',
      margin: '0 0 14px'
    }
  }, "Share your pictures with us and we will share them here!"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '14px 28px',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "+ Upload files"))));
};
window.SectionFooter = function SectionFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--cabc-green)',
      color: '#fff',
      padding: '40px 48px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      gap: 24,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-label)',
      fontSize: 12,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: 0.85
    }
  }, "Follow us here"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Facebook",
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      background: '#fff',
      color: 'var(--cabc-green)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      fontSize: 18,
      textDecoration: 'none'
    }
  }, "f"), /*#__PURE__*/React.createElement("img", {
    src: "../assets/compass-academy-mark.png",
    alt: "",
    style: {
      width: 44,
      height: 44,
      filter: 'brightness(0) invert(1)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../assets/cabc-logo.png",
    alt: "",
    style: {
      width: 64,
      height: 64
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 16,
      textTransform: 'uppercase',
      letterSpacing: '-0.005em'
    }
  }, "Compass Athletic Booster Club")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      lineHeight: 1.6,
      opacity: 0.9
    }
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 CABC \xB7 Odessa, TX"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, "Content owned by us and our licensors."))));
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "website/sections.jsx", error: String((e && e.message) || e) }); }

})();
