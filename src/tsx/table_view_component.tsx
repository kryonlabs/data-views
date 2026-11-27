import * as Native from "TableView";
import { Session } from "kryon/session";

export interface TableViewProps {
    session: Session;
    props: Native.TableViewProps;
}

export function TableView(widget: TableViewProps): Native.TableViewResult {
    return Native.TableView(widget.session, widget.props);
}
