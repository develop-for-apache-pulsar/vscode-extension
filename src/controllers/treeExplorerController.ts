import {PulsarClusterTreeDataProvider} from "../providers/pulsarClusterTreeDataProvider/explorer";
import {trace} from "../utils/traceDecorator";

export class TreeExplorerController {
  @trace('Refresh Tree Provider')
  public static refreshTreeProvider(treeProvider: PulsarClusterTreeDataProvider): void {
    treeProvider.refresh();
  }
}
