import * as Board from "DataViews/Kanban";
import { Kanban, KanbanCard, KanbanColumn } from "DataViews/tsx/kanban";
import { Rectangle } from "kryon/geometry";
import { Session } from "kryon/session";

export function Draw(session: Session, state: NativeRef<Board.KanbanCell>,
    config: Board.KanbanConfig, bounds: Rectangle): void {
    <Kanban session={session} state={state} props={config} bounds={bounds} input={{}}
        children={(frame: Board.KanbanFrame): void => {
            for (let lane = s32(0); lane < config.lane_count; lane += s32(1)) {
                <KanbanColumn session={session} state={state} frame={frame} lane={lane}
                    title="Lane" count={s32(6)} content_height={s32(1200)}
                    children={(column: Board.KanbanColumnFrame): void => {
                        let stack = column;
                        for (let row = s32(0); row < s32(6); row += s32(1)) {
                            stack = KanbanCard({session: session, state: state, frame: frame, column: stack,
                                index: lane * s32(6) + row,
                                identity: u64(lane * s32(10) + row + s32(1)), height: 200,
                                children: (_bounds: Rectangle): void => {}});
                        }
                    }}/>
            }
        }}/>
}
