import * as App from "kryon/app";
import { StyleTokenColor } from "kryon/drawing_props";
import { ExampleBounds, InstallDataViewStyles } from "kryon/examples/optional_scene_styles";
import { Rectangle } from "kryon/geometry";
import { Gap } from "kryon/layout";
import { Session } from "kryon/session";
import { ThemeMetricRole } from "kryon/theme";
import { Box } from "kryon/tsx/box";
import { Column } from "kryon/tsx/layout";
import { Text } from "kryon/tsx/text";
import { TableRow } from "DataViews/TableView";
import { TableView } from "DataViews/tsx/table_view";
import { TableTextOrder } from "table_text_order";

let exampleDisabled: boolean = false;
let order: [s32, s32, s32, s32, s32, s32] = [s32(0), s32(1), s32(2), s32(3), s32(4), s32(5)];
let widths: [s32, s32, s32] = [s32(154), s32(144), s32(134)];
let selection: s32 = s32(-1);
let column: s32 = s32(-1);
let sort: s32 = s32(-1);
let direction: s32 = s32(0);
let offset: s32 = s32(0);

function SortRows(cells: NativeSlice<string>): void {
    if (sort < s32(0) || direction === s32(0)) {
        for (let index = s32(0); index < s32(6); index += s32(1)) {
            order[index] = index;
        }
        return;
    }
    for (let pass = s32(0); pass < s32(5); pass += s32(1)) {
        for (let index = s32(0); index < s32(5) - pass; index += s32(1)) {
            const next = index + s32(1);
            const left = order[index] * s32(3) + sort;
            const right = order[next] * s32(3) + sort;
            if (TableTextOrder(cells[left], cells[right]) * direction > s32(0)) {
                const swap = order[index];
                order[index] = order[next];
                order[next] = swap;
            }
        }
    }
}

function DrawExample(session: Session, bounds: Rectangle, key: u64, disabled: boolean): void {
    const headers: [string, string, string] = ["Example", "Package", "Status"];
    const cells: [string, string, string, string, string, string, string, string, string,
        string, string, string, string, string, string, string, string, string] = [
        "Button", "Kryon", "Ready", "TreeView", "DataViews", "Ready", "Plot", "Plot", "Interactive",
        "Image", "Kryon", "Embedded", "TableView", "DataViews", "Ready", "Kanban", "DataViews", "Draggable",
    ];
    let rows: [TableRow, TableRow, TableRow, TableRow, TableRow, TableRow] = [nativeInit<TableRow>({}), nativeInit<TableRow>({}), nativeInit<TableRow>({}), nativeInit<TableRow>({}), nativeInit<TableRow>({}), nativeInit<TableRow>({})];
    for (let index = s32(0); index < s32(6); index += s32(1)) {
        const start = order[index] * s32(3);
        rows[index] = {cells: nativeSlice(cells, start, start + s32(3))};
    }
    const result = TableView({session: session, props: {key: key, bounds: bounds, columns: nativeSlice(headers), rows: nativeSlice(rows),
        column_widths: nativeSlice(widths), selected_row: selection, selected_column: column, sort_column: sort,
        sort_direction: direction, scroll_offset: offset, row_height: s32(36), header_height: s32(36),
        resizable: true, disabled: disabled}});
    selection = result.selected_row;
    column = result.selected_column;
    offset = result.scroll_offset;
    if (result.sort_column !== sort || result.sort_direction !== direction) {
        sort = result.sort_column;
        direction = result.sort_direction;
        SortRows(nativeSlice(cells));
        selection = s32(-1);
        column = s32(-1);
    }
}

export function SetExampleOptions(disabled: boolean, _reducedMotion: boolean): void {
    exampleDisabled = disabled;
}

export function Frame(frame: App.Frame): void {
    const session: Session = {slot: frame.slot, epoch: frame.epoch};
    const viewport = frame.viewport;
    <Box session={session} props={{bounds: viewport, fill: StyleTokenColor("canvas")}}/>;
    <Column session={session} props={{bounds: viewport, padding: Gap(ThemeMetricRole.ThemeMetricSpace6),
        gap: Gap(ThemeMetricRole.ThemeMetricSpace4), gap_override: true}}>
        <Text session={session} props={{bounds: {height: 36}, text: "TableView", size: s32(23)}}/>
        {DrawStandalone(session, viewport)}
    </Column>;
}

function DrawStandalone(session: Session, viewport: Rectangle): void {
    InstallDataViewStyles(StyleTokenColor("canvas").r < u8(128));
    DrawExample(session, ExampleBounds(viewport), u64(0), exampleDisabled);
}

export function GalleryFrame(frame: App.Frame): void {
    const session: Session = {slot: frame.slot, epoch: frame.epoch};
    DrawExample(session, ExampleBounds(frame.viewport), u64(600), exampleDisabled);
}

export function main(): s32 {
    return App.Run({title: "tableview"}, Frame);
}
