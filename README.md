# DataViews

DataViews adds `TableView`, `TreeView` and `Kanban` to
[Kryon](https://github.com/kryonlabs/kryon) applications. Both are retained
Kryon widgets written in Ziran: the table draws a header, rows, cells, and a
keyboard selection over caller-owned data, and the tree shows nested items
with expand, collapse, and keyboard navigation. They use Kryon's styles, so
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

Kanban cells share the vanilla renderer. Keep one `Kanban.Cell` per board and
derive its `Kanban.Config` from `Kanban.Default(key, lane_count)`. The cell owns
its horizontal offset, each column's scrolling and drag state. Call `Begin`,
`Column`, `Card`, `EndColumn` and `Finish` while rendering caller-owned cards.
Column headers and card surfaces, clipping and scrollbar ownership have one
implementation. `Wheel` and `Pointer` operate on that same cell; gestures return
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
