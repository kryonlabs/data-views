# DataViews

DataViews adds `TableView`, `TreeView` and `Kanban` to
[Kryon](https://github.com/kryonlabs/kryon) applications. These are retained
Kryon widgets written in Ziran: the table draws a header, rows, cells, and a
keyboard selection over caller-owned data, and the tree shows nested items with keyboard navigation. They use Kryon's styles, so
the `TableView` and `TreeView` rules in any Kryon style pack apply.
Table colors follow the current semantic palette, including scoped
`WidgetPaletteUse` light/dark colors and restoration. Explicit TableView style
rules take precedence; without palette tokens the original default colors apply.

## Use it

```sh
ziran add https://github.com/kryonlabs/data-views.git
```

```zi
using Tables :: #import "data_views/TableView";
using Trees :: #import "data_views/TreeView";
using Kanban :: #import "data_views/Kanban";
```

Call `Tables.TableView(session, props)` with `columns: []string`,
`rows: []TableRow` and each row's `cells: []string`. Keep the returned
selection, scroll offset, sort column and direction for the next frame.
The table clips and virtualizes rows, supports frozen rows and column resizing,
and moves the selected cell with arrow, Home and End keys. Header clicks request
sorting; the app orders its own rows. `column_widths` is a borrowed mutable slice.

For caller-owned multi-row state, set `multi_select = true`, supply
`selection: []bool` with exactly one writable flag per row, and pass
`focused_row` and `anchor` (initialize both to `-1`). Retain the returned
focus, anchor and scroll offset for the next frame. All cells in selected rows
are highlighted; the focused row has an outline independently of selection.
The existing single-cell mode remains the default.

A plain row click replaces selection, Ctrl-click toggles a row, Shift-click
replaces it with the inclusive anchor range, and Ctrl+Shift-click adds that
range. Up/Down/Home/End use the same replacement/range rules; Ctrl alone moves
focus without changing selection or anchor. Shift keeps a fixed anchor; when
there is none, it starts at the previous focus, or the target row. Space
toggles the focused row. Enter replaces selection with that row and reports
`activated_row`, with `activated_column = -1`. Row clicks select only, as in
ListBoxMulti; they do not report activation. In both modes, `clicked_row` and
`clicked_column` report every accepted retained cell click, including a second
click that leaves selection unchanged; both reset to `-1` each call. The caller
can use these events for its double-click policy. `activated_row` reports Enter
keyboard activation; it is not a double-click classifier. Navigation reveals focus; wheel
and scrollbar movement retain their independent scrolling behavior.

`selection` in the result borrows the original mutable slice; no copy or
ownership transfer occurs. Keep rows, labels, column slices and selection alive
through the call, and keep the selection storage alive while using the result.
`selected_count` counts all flags, including offscreen rows.
`selection_changed` reports actual flag mutations; `focus_changed` reports a
focus move during this call. `changed` also includes anchor changes and the
existing sort/resize/cell changes; scrolling and activation alone do not set it.
`selected_row` and `selected_column` remain single-cell state, not a summary of
multi-row selection. A mismatched selection length returns `node = -1` and
`selection_valid = false` without reading or writing the slice; an empty slice
with no rows is valid. Out-of-range focus and anchor normalize to `-1` without
reporting an input change.

Use a stable table `key` (or `id`) between frames. Cell keys remain derived
from row and column indices, so the caller must reorder/remap selection,
focus and anchor together when sorting, filtering or replacing rows.
TableView never sorts or retains borrowed application data.

Kanban cells share the vanilla renderer. Keep one `Kanban.KanbanCell` per board and
derive its `Kanban.KanbanConfig` from `Kanban.KanbanDefaults(key, lane_count)`. The cell owns
its horizontal offset, each column's scrolling and drag state. Call `BeginKanban`,
`KanbanColumn`, `KanbanCard`, `EndKanbanColumn` and `EndKanban` while rendering caller-owned cards.
Column headers and card surfaces, clipping and scrollbar ownership have one
implementation. `WheelKanban` and `PointerKanban` operate on that same cell; gestures return
stable card identities and target lanes, never execute business actions.

Tasks, Social and Jobs can each supply their own columns, details, filters and
approval rules without copying the Kanban renderer. A Tasks status is derived
from its worker; dropping a Social card cannot authorize publishing; reviewing
a Jobs card cannot authorize an application. Those rules stay with the caller.

## Develop

`make check` checks the package and runs the behavior tests as portable
bundles, plus the table behavior and rendered interaction tests as native C
from source and saved checked IR, and in Go when `go` is installed. It uses the `ziran` launcher and
the Ziran and Kryon commits pinned in `ziran.lock`. To test against local
checkouts, keep this in an ignored `ziran.local.toml`:

```toml
[overrides]
ziran = "../../../ziranlang/ziran"
kryon = "../../kryon"
```


Run `build-queue -- make check-table` for the focused table tests or
`build-queue -- make check` for the package suite. The rendered tests use
an in-process raster host that checks clipping and paint operations; they do
not open desktop windows.
