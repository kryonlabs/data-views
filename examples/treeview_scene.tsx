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
import { TreeItem } from "DataViews/TreeView";
import { TreeView } from "DataViews/tsx/tree_view";

let exampleDisabled: boolean = false;
let selected: s32 = s32(1);
let offset: s32 = s32(0);
let items: [TreeItem, TreeItem, TreeItem, TreeItem, TreeItem] = [
    nativeInit<TreeItem>({label: "Project", id: s32(1), expanded: true, selectable: true}),
    nativeInit<TreeItem>({label: "Source", id: s32(2), depth: s32(1), expanded: true, selectable: true}),
    nativeInit<TreeItem>({label: "app.zi", id: s32(3), depth: s32(2), selectable: true}),
    nativeInit<TreeItem>({label: "Assets", id: s32(4), depth: s32(1), selectable: true}),
    nativeInit<TreeItem>({label: "README", id: s32(5), depth: s32(1), selectable: true}),
];

function DrawExample(session: Session, bounds: Rectangle, key: u64, disabled: boolean): void {
    const result = TreeView({session: session, items: nativeSlice(items), props: {key: key, bounds: bounds,
        selected_id: selected, scroll_offset: offset, row_height: s32(36), disabled: disabled}});
    selected = result.selected_id;
    offset = result.scroll_offset;
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
        <Text session={session} props={{bounds: {height: 36}, text: "TreeView", size: s32(23)}}/>
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
    return App.Run({title: "treeview"}, Frame);
}
