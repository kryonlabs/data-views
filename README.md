# DataViews

DataViews adds `TableView`, `TreeView` and `Kanban` to
[Kryon](https://github.com/kryonlabs/kryon) applications. These are retained
Kryon widgets written in Ziran: the table draws a header, rows, cells, and a
keyboard selection over caller-owned data, and the tree shows nested items with keyboard navigation. They use Kryon's styles, so
the `TableView` and `TreeView` rules in any Kryon style pack apply.

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
bundles, and in Go when `go` is installed. It uses the `ziran` launcher and
the Ziran and Kryon commits pinned in `ziran.lock`. To test against local
checkouts, keep this in an ignored `ziran.local.toml`:

```toml
[overrides]
ziran = "../../../ziranlang/ziran"
kryon = "../../kryon"
```
