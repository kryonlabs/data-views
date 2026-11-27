import * as App from "kryon/app";
import { Session } from "kryon/session";
import { TableRow } from "TableView";
import { TreeItem } from "TreeView";
import { TableView } from "DataViews/tsx/table_view";
import { TreeView } from "DataViews/tsx/tree_view";

let selectedId: s32 = s32(1);
let treeOffset: s32 = s32(0);
let selectedRow: s32 = s32(-1);
let selectedColumn: s32 = s32(-1);
let tableOffset: s32 = s32(0);
let columnWidths: [s32, s32] = [s32(120), s32(110)];

export function Frame(frame: App.Frame): void {
    const session: Session = {slot: frame.slot, epoch: frame.epoch};
    const viewport = frame.viewport;
    const width = (viewport.width - 36) / 2;
    const height = viewport.height - 24;
    const items: [TreeItem, TreeItem, TreeItem] = [
        {id: s32(1), label: "Project", expanded: true, selectable: true},
        {id: s32(2), label: "Source", depth: s32(1), selectable: true, leaf: true},
        {id: s32(3), label: "Assets", depth: s32(1), selectable: true, leaf: true},
    ];
    const tree = <TreeView session={session} items={nativeSlice(items)} props={{key: u64(1), selected_id: selectedId,
        scroll_offset: treeOffset, bounds: {x: viewport.x + 12, y: viewport.y + 12, width: width, height: height}}}/>;
    selectedId = tree.selected_id;
    treeOffset = tree.scroll_offset;

    const headers: [string, string] = ["Item", "Status"];
    const source: [string, string] = ["Source", selectedId === s32(2) ? "Selected" : "Ready"];
    const assets: [string, string] = ["Assets", selectedId === s32(3) ? "Selected" : "Ready"];
    const rows: [TableRow, TableRow] = [{cells: nativeSlice(source)}, {cells: nativeSlice(assets)}];
    const table = <TableView session={session} props={{key: u64(2), columns: nativeSlice(headers), rows: nativeSlice(rows),
        bounds: {x: viewport.x + width + 24, y: viewport.y + 12, width: width, height: height},
        column_widths: nativeSlice(columnWidths), selected_row: selectedRow, selected_column: selectedColumn,
        sort_column: s32(-1), scroll_offset: tableOffset, resizable: true}}/>;
    selectedRow = table.selected_row;
    selectedColumn = table.selected_column;
    tableOffset = table.scroll_offset;
}

export function main(): s32 {
    return App.Run({title: "DataViews"}, Frame);
}
