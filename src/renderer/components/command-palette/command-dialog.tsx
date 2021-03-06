
import { Select } from "../select";
import { computed, observable, toJS } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { ClusterStore } from "../../../common/cluster-store";
import { CommandOverlay } from "./command-container";
import { broadcastMessage } from "../../../common/ipc";
import { navigate } from "../../navigation";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";

@observer
export class CommandDialog extends React.Component {
  @observable menuIsOpen = true;

  @computed get options() {
    const context = {
      entity: commandRegistry.activeEntity
    };

    return commandRegistry.getItems().filter((command) => {
      if (command.scope === "entity" && !ClusterStore.getInstance().active) {
        return false;
      }

      if (!command.isActive) {
        return true;
      }

      try {
        return command.isActive(context);
      } catch(e) {
        console.error(e);

        return false;
      }
    }).map((command) => {
      return { value: command.id, label: command.title };
    }).sort((a, b) => a.label > b.label ? 1 : -1);
  }

  private onChange(value: string) {
    const command = commandRegistry.getItems().find((cmd) => cmd.id === value);

    if (!command) {
      return;
    }

    const action = toJS(command.action);

    try {
      CommandOverlay.close();

      if (command.scope === "global") {
        action({
          entity: commandRegistry.activeEntity
        });
      } else if(commandRegistry.activeEntity) {
        navigate(clusterViewURL({
          params: {
            clusterId: commandRegistry.activeEntity.metadata.uid
          }
        }));
        broadcastMessage(`command-palette:run-action:${commandRegistry.activeEntity.metadata.uid}`, command.id);
      }
    } catch(error) {
      console.error("[COMMAND-DIALOG] failed to execute command", command.id, error);
    }
  }

  render() {
    return (
      <Select
        menuPortalTarget={null}
        onChange={(v) => this.onChange(v.value)}
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuIsOpen={this.menuIsOpen}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        data-test-id="command-palette-search"
        placeholder="Type a command or search&hellip;" />
    );
  }
}
