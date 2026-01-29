import { e as ensure_array_like, c as attr_class, b as attr, d as stringify, s as store_get, u as unsubscribe_stores, a as attr_style } from "../../chunks/index2.js";
import { j as selectVisibleDashboardCards, d as dashboardStore, a as activeTabId, i as isEditMode, h as haStore } from "../../chunks/store.js";
import { b as $format } from "../../chunks/runtime.js";
import { D as DeviceCard } from "../../chunks/DeviceCard.js";
import { e as editorStore, a as editorHistory } from "../../chunks/store2.js";
import { e as escape_html } from "../../chunks/context.js";
import "iconify-icon";
function ResizeHandles($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    $$renderer2.push(`<div class="handles-container svelte-1621fsa"><!--[-->`);
    const each_array = ensure_array_like(handles);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let h = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`handle ${stringify(h)}`, "svelte-1621fsa")}${attr("data-handle", h)}></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function CardEditOverlay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { cardId } = $$props;
    let isSelected = store_get($$store_subs ??= {}, "$editorStore", editorStore).selectedCardId === cardId;
    let isCollision = isSelected && store_get($$store_subs ??= {}, "$editorStore", editorStore).collision;
    if (isSelected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("edit-overlay svelte-rjj0c3", void 0, { "collision": isCollision })}>`);
      ResizeHandles($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function GridItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { card, children } = $$props;
    let isDeleted = store_get($$store_subs ??= {}, "$editorStore", editorStore).enabled && !store_get($$store_subs ??= {}, "$editorStore", editorStore).drafts.has(card.id);
    let rect = store_get($$store_subs ??= {}, "$editorStore", editorStore).enabled && store_get($$store_subs ??= {}, "$editorStore", editorStore).drafts.has(card.id) ? store_get($$store_subs ??= {}, "$editorStore", editorStore).drafts.get(card.id) : {
      col: card.position.x,
      row: card.position.y,
      w: card.position.w,
      h: card.position.h
    };
    let style = (() => {
      const innerGap = 8;
      const gridColStart = Math.floor(rect.col) + 1;
      const gridRowStart = Math.floor(rect.row) + 1;
      const gridColSpan = Math.ceil(rect.col + rect.w) - Math.floor(rect.col);
      const gridRowSpan = Math.ceil(rect.row + rect.h) - Math.floor(rect.row);
      let s = `grid-column: ${gridColStart} / span ${gridColSpan}; grid-row: ${gridRowStart} / span ${gridRowSpan};`;
      if (rect.w === 0.5) {
        s += `width: calc(50% - ${innerGap / 2}px);`;
        if (rect.col % 1 > 0.1) {
          s += `justify-self: end;`;
        } else {
          s += `justify-self: start;`;
        }
      } else {
        s += `width: 100%;`;
      }
      if (rect.h === 0.5) {
        s += `height: calc(50% - ${innerGap / 2}px);`;
        if (rect.row % 1 > 0.1) {
          s += `align-self: end;`;
        } else {
          s += `align-self: start;`;
        }
      } else {
        s += `height: 100%;`;
      }
      return s;
    })();
    let isSelected = store_get($$store_subs ??= {}, "$editorStore", editorStore).selectedCardId === card.id;
    let isDragging = isSelected && store_get($$store_subs ??= {}, "$editorStore", editorStore).pointerOp.kind === "drag";
    if (!isDeleted) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("grid-item svelte-1qslh51", void 0, {
        "edit-mode": store_get($$store_subs ??= {}, "$editorStore", editorStore).enabled,
        "dragging": isDragging
      })}${attr_style(style)}${attr("data-card-id", card.id)}><div class="content-wrapper svelte-1qslh51">`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div> `);
      CardEditOverlay($$renderer2, { cardId: card.id });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function GridSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { cols, rows } = $$props;
    let localCols = cols;
    let localRows = rows;
    $$renderer2.push(`<div class="grid-settings svelte-avt70v"><h3 class="svelte-avt70v">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.edit"))}</h3> <div class="control svelte-avt70v"><label for="cols" class="svelte-avt70v">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.grid.columns"))}: ${escape_html(localCols)}</label> <input id="cols" type="range" min="4" max="16" step="1"${attr("value", localCols)} class="svelte-avt70v"/></div> <div class="control svelte-avt70v"><label for="rows" class="svelte-avt70v">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.grid.rows"))}: ${escape_html(localRows)}</label> <input id="rows" type="range" min="3" max="12" step="1"${attr("value", localRows)} class="svelte-avt70v"/></div> <div class="hint svelte-avt70v">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.grid.hint"))}</div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function EditToolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let canUndo = editorHistory.canUndo();
    let canRedo = editorHistory.canRedo();
    let showGridSettings = store_get($$store_subs ??= {}, "$editorStore", editorStore).showGridSettings;
    $$renderer2.push(`<div class="edit-toolbar svelte-14v96qe"><div class="group svelte-14v96qe"><button${attr_class("tool-btn svelte-14v96qe", void 0, { "active": showGridSettings })} title="Grid Settings"><iconify-icon icon="mdi:grid" class="svelte-14v96qe"></iconify-icon></button></div> <div class="divider svelte-14v96qe"></div> <div class="group svelte-14v96qe"><button class="tool-btn svelte-14v96qe"${attr("disabled", !canUndo, true)} title="Undo"><iconify-icon icon="mdi:undo" class="svelte-14v96qe"></iconify-icon></button> <button class="tool-btn svelte-14v96qe"${attr("disabled", !canRedo, true)} title="Redo"><iconify-icon icon="mdi:redo" class="svelte-14v96qe"></iconify-icon></button></div> <div class="divider svelte-14v96qe"></div> <div class="group actions svelte-14v96qe"><button class="tool-btn cancel svelte-14v96qe"><iconify-icon icon="mdi:close" class="svelte-14v96qe"></iconify-icon> <span class="btn-text svelte-14v96qe">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("common.cancel"))}</span></button> <button class="tool-btn primary svelte-14v96qe"><iconify-icon icon="mdi:check" class="svelte-14v96qe"></iconify-icon> <span class="btn-text svelte-14v96qe">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.done"))}</span></button></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function GridOverlay($$renderer, $$props) {
  let { cols, rows, cellW, cellH, gapX, gapY } = $$props;
  let total = cols * rows;
  let style = `
    --cols: ${cols};
    --rows: ${rows};
    --cell-w: ${cellW}px;
    --cell-h: ${cellH}px;
    --gap-x: ${gapX}px;
    --gap-y: ${gapY}px;
  `;
  $$renderer.push(`<div class="grid-overlay svelte-1xu6imp"${attr_style(style)}><!--[-->`);
  const each_array = ensure_array_like({ length: total });
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    each_array[$$index];
    $$renderer.push(`<div class="cell svelte-1xu6imp"></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
function DashboardGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$selectVisibleDashboardCards", selectVisibleDashboardCards);
    let gridConfig = store_get($$store_subs ??= {}, "$dashboardStore", dashboardStore).tabs[store_get($$store_subs ??= {}, "$activeTabId", activeTabId)];
    let columns = gridConfig?.gridColumns ?? 8;
    let rows = gridConfig?.gridRows ?? 6;
    let cards = (() => {
      if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode) && store_get($$store_subs ??= {}, "$editorStore", editorStore).enabled) {
        const list = [];
        store_get($$store_subs ??= {}, "$editorStore", editorStore).drafts.forEach((rect, id) => {
          const entityId = store_get($$store_subs ??= {}, "$editorStore", editorStore).cardEntities.get(id);
          if (entityId) {
            const overrideTpl = store_get($$store_subs ??= {}, "$editorStore", editorStore).templateOverrides.get(id);
            const originalCard = gridConfig.cards.find((c) => c.id === id);
            const finalTemplateId = store_get($$store_subs ??= {}, "$editorStore", editorStore).templateOverrides.has(id) ? overrideTpl : originalCard?.templateId;
            list.push({
              id,
              entityId,
              position: { x: rect.col, y: rect.row, w: rect.w, h: rect.h },
              templateId: finalTemplateId
            });
          }
        });
        return list;
      } else {
        return gridConfig?.cards ?? [];
      }
    })();
    let cellSize = 0;
    let gapX = 10;
    let gapY = 10;
    let gridWidth = 0;
    let gridHeight = 0;
    let marginLeft = 0;
    let marginRight = 0;
    let marginTop = 0;
    let marginBottom = 0;
    store_get($$store_subs ??= {}, "$editorStore", editorStore).enabled;
    function getEntity(id) {
      return store_get($$store_subs ??= {}, "$haStore", haStore).entities.get(id);
    }
    function getTemplate(id) {
      return id ? store_get($$store_subs ??= {}, "$dashboardStore", dashboardStore).templates[id] : void 0;
    }
    let gridStyle = `
    --cols: ${columns};
    --rows: ${rows};
    --cell-size: ${cellSize}px;
    --gap-x: ${gapX}px;
    --gap-y: ${gapY}px;
    --grid-width: ${gridWidth}px;
    --grid-height: ${gridHeight}px;
    --margin-left: ${marginLeft}px;
    --margin-right: ${marginRight}px;
    --margin-top: ${marginTop}px;
    --margin-bottom: ${marginBottom}px;
  `;
    $$renderer2.push(`<div class="dashboard-container svelte-wf2j5s">`);
    if (cards.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="empty-state svelte-wf2j5s"><div class="empty-content svelte-wf2j5s">`);
      if (store_get($$store_subs ??= {}, "$activeTabId", activeTabId) === "welcome" || gridConfig.title === "Welcome") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="welcome-msg svelte-wf2j5s"><h1 class="svelte-wf2j5s">Welcome!</h1> <p class="svelte-wf2j5s">Your dashboard is ready.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<p>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.noDevices"))}</p>`);
      }
      $$renderer2.push(`<!--]--> <button class="btn primary svelte-wf2j5s"><iconify-icon icon="mdi:plus"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("dashboard.addWidget"))}</button></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attr_class("grid-layout svelte-wf2j5s", void 0, {
        "edit-mode": store_get($$store_subs ??= {}, "$isEditMode", isEditMode)
      })}${attr_style(gridStyle, {
        "touch-action": store_get($$store_subs ??= {}, "$isEditMode", isEditMode) ? "none" : "auto"
      })} role="region" aria-label="Dashboard Grid">`);
      if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode)) {
        $$renderer2.push("<!--[-->");
        GridOverlay($$renderer2, {
          cols: columns,
          rows,
          cellW: cellSize,
          cellH: cellSize,
          gapX,
          gapY
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array = ensure_array_like(cards);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let card = each_array[$$index];
        const entity = getEntity(card.entityId);
        if (entity) {
          $$renderer2.push("<!--[-->");
          GridItem($$renderer2, {
            card,
            children: ($$renderer3) => {
              DeviceCard($$renderer3, { entity, template: getTemplate(card.templateId) });
            }
          });
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode)) {
      $$renderer2.push("<!--[-->");
      EditToolbar($$renderer2);
      $$renderer2.push(`<!----> `);
      if (store_get($$store_subs ??= {}, "$editorStore", editorStore).showGridSettings) {
        $$renderer2.push("<!--[-->");
        GridSettings($$renderer2, {
          tabId: store_get($$store_subs ??= {}, "$activeTabId", activeTabId),
          cols: columns,
          rows
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <button class="fab-add svelte-wf2j5s"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("dashboard.addWidget"))}><iconify-icon icon="mdi:plus"></iconify-icon></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="dashboard-page svelte-1uha8ag">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="status-message svelte-1uha8ag"><div class="spinner svelte-1uha8ag"></div> <p class="svelte-1uha8ag">Connecting to Home Assistant...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="status-message error svelte-1uha8ag"><iconify-icon icon="mdi:alert-circle" width="48" class="svelte-1uha8ag"></iconify-icon> <h3 class="svelte-1uha8ag">Connection Error</h3> <p class="svelte-1uha8ag">${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).error)}</p> <a href="/settings" class="btn svelte-1uha8ag">Check Settings</a></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (!store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="status-message warning svelte-1uha8ag"><iconify-icon icon="mdi:lan-disconnect" width="48" class="svelte-1uha8ag"></iconify-icon> <h3 class="svelte-1uha8ag">Not Connected</h3> <p class="svelte-1uha8ag">Please configure your server connection in Settings.</p> <a href="/settings" class="btn svelte-1uha8ag">Go to Settings</a></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          DashboardGrid($$renderer2);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
