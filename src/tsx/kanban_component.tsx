import * as Native from "Kanban";
import { Box } from "kryon/tsx/box";
import { Rectangle } from "kryon/geometry";
import { ScrollResult } from "kryon/scroll";
import { Session } from "kryon/session";
import { Scroll } from "kryon/tsx/scroll";
import { Text } from "kryon/tsx/text";
import { Wrap } from "kryon/text";
import { Scoped } from "std/callable";

export interface KanbanProps {
    session: Session;
    state: NativeRef<Native.KanbanCell>;
    props: Native.KanbanConfig;
    bounds: Rectangle;
    input: Native.KanbanInput;
    children: Scoped<(frame: Native.KanbanFrame) => void>;
}

export interface KanbanColumnProps {
    session: Session;
    state: NativeRef<Native.KanbanCell>;
    frame: Native.KanbanFrame;
    lane: s32;
    title: string;
    count: s32;
    content_height: s32;
    children: Scoped<(column: Native.KanbanColumnFrame) => void>;
}

export interface KanbanCardProps {
    session: Session;
    state: NativeRef<Native.KanbanCell>;
    frame: Native.KanbanFrame;
    column: Native.KanbanColumnFrame;
    index: s32;
    identity: u64;
    height: float32;
    children: Scoped<(bounds: Rectangle) => void>;
}

// The strip container runs the lanes inside the Scroll component's Scoped
// children; the adapter closes the container scope itself.
export function Kanban(widget: KanbanProps): void {
    const frame = Native.BeginKanban(widget.state, widget.props, widget.bounds, widget.input);
    if (frame.config.lane_count < s32(1)) {
        return;
    }
    const strip = Scroll({session: widget.session, props: Native.KanbanStripProps(widget.state, frame),
        children: (view: ScrollResult): void => {
            widget.children(Native.KanbanFrameApplied(frame, view));
        }});
    Native.KanbanStripApplied(widget.state, frame, strip);
}

export function KanbanColumn(widget: KanbanColumnProps): void {
    const column = Native.KanbanColumn(widget.state, widget.frame, widget.lane, widget.title,
        widget.count, widget.content_height);
    if (!column.visible) {
        return;
    }
    const columnRef = nativeRef(column);
    Box({session: widget.session, props: Native.KanbanColumnBoxProps(columnRef, widget.frame.config)});
    Text({session: widget.session, props: {key: column.title_key, text: Native.KanbanCaption(widget.title, widget.count),
        bounds: column.header, size: widget.frame.config.header_font, wrap: Wrap.TextWrapNone}});
    const view = Scroll({session: widget.session, props: Native.KanbanColumnViewProps(widget.state, widget.frame, columnRef),
        children: (inner: ScrollResult): void => {
            widget.children(Native.KanbanColumnPlaced(column, inner));
        }});
    Native.KanbanColumnApplied(widget.state, widget.frame, columnRef, view);
}

export function KanbanCard(widget: KanbanCardProps): Native.KanbanColumnFrame {
    const slot = Native.KanbanCard(widget.state, widget.frame, widget.column, widget.index, widget.identity, widget.height);
    if (slot.bounds.width > 0 && slot.bounds.height > 0) {
        Box({session: widget.session, props: Native.KanbanCardBoxProps(widget.state, widget.frame, slot.bounds, widget.identity)});
    }
    widget.children(slot.bounds);
    return slot.column;
}
