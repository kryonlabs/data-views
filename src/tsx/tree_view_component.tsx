import * as Native from "TreeView";
import { Session } from "kryon/session";

export interface TreeViewProps {
    session: Session;
    props: Native.TreeViewProps;
    items: Native.TreeItem[];
}

export function TreeView(widget: TreeViewProps): Native.TreeViewResult {
    return Native.TreeView(widget.session, widget.props, widget.items);
}
