# DataViews

DataViews adds `TableView` and `TreeView` to
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
```

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
