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
import * as Board from "DataViews/Kanban";
import { Kanban, KanbanCard, KanbanColumn } from "DataViews/tsx/kanban";
import { PointerSample } from "kryon/tree_input";

let exampleDisabled: boolean = false;
let board: Board.KanbanCell = nativeInit<Board.KanbanCell>({});
let cardLanes: [s32, s32, s32] = [s32(0), s32(1), s32(2)];
let titles: [string, string, string] = ["To do", "Doing", "Done"];
let labels: [string, string, string] = ["Explore", "Try widgets", "Build"];

function DrawLane(session: Session, view: Board.KanbanFrame, lane: s32): void {
    let count = s32(0);
    for (let index = s32(0); index < s32(3); index += s32(1)) {
        if (cardLanes[index] === lane) {
            count += s32(1);
        }
    }
    <KanbanColumn session={session} state={nativeRef(board)} frame={view} lane={lane} title={titles[lane]}
        count={count} content_height={count * s32(64)} children={(column: Board.KanbanColumnFrame): void => {
            let stack: Board.KanbanColumnFrame = column;
            for (let index = s32(0); index < s32(3); index += s32(1)) {
                if (cardLanes[index] === lane) {
                    stack = KanbanCard({session: session, state: nativeRef(board), frame: view, column: stack, index: index,
                        identity: u64(700) + u64(index), height: 64, children: (card: Rectangle): void => {
                            <Text session={session} props={{bounds: {x: card.x + 8, y: card.y + 8,
                                width: card.width - 16, height: card.height - 16}, text: labels[index], size: s32(14)}}/>;
                        }});
                }
            }
        }}/>;
}

function DrawExample(session: Session, bounds: Rectangle, disabled: boolean): void {
    let config = Board.KanbanDefaults(u64(600), s32(3));
    config.min_width = 130;
    config.gap = 10;
    config.background = StyleTokenColor("surface");
    config.card_background = StyleTokenColor("button");
    <Kanban session={session} state={nativeRef(board)} props={config} bounds={bounds} input={{disabled: disabled}}
        children={(view: Board.KanbanFrame): void => {
            for (let lane = s32(0); lane < s32(3); lane += s32(1)) {
                DrawLane(session, view, lane);
            }
        }}/>;
    if (!disabled) {
        const pointer = PointerSample(session);
        const gesture = Board.PointerKanban(nativeRef(board), bounds, s32(3), {x: pointer.x, y: pointer.y},
            pointer.down, pointer.pressed, pointer.released);
        if (gesture.moved && gesture.lane >= s32(0) && gesture.identity >= u64(700) && gesture.identity < u64(703)) {
            cardLanes[s32(gesture.identity) - s32(700)] = gesture.lane;
        }
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
        <Text session={session} props={{bounds: {height: 36}, text: "Kanban", size: s32(23)}}/>
        {DrawStandalone(session, viewport)}
    </Column>;
}

function DrawStandalone(session: Session, viewport: Rectangle): void {
    InstallDataViewStyles(StyleTokenColor("canvas").r < u8(128));
    DrawExample(session, ExampleBounds(viewport), exampleDisabled);
}

export function GalleryFrame(frame: App.Frame): void {
    const session: Session = {slot: frame.slot, epoch: frame.epoch};
    DrawExample(session, ExampleBounds(frame.viewport), exampleDisabled);
}

export function main(): s32 {
    return App.Run({title: "kanban"}, Frame);
}
