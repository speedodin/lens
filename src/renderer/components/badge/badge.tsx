import "./badge.scss";

import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import { autobind } from "../../utils";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  flat?: boolean;
  label?: React.ReactNode;
  isExpanded?: boolean; // always force state to this value
}

@withTooltip
@observer
export class Badge extends React.Component<BadgeProps> {
  @observable _isExpanded = false;
  @observable hasHighlightedText = false;
  @observable.ref elem?: HTMLElement;

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
  }

  @computed get isExpanded() {
    return this.props.isExpanded ?? this._isExpanded;
  }

  @computed get isExpandable() {
    const { flat } = this.props;
    const { scrollWidth, clientWidth, clientHeight, scrollHeight } = this.elem || {};

    return !flat && (clientWidth < scrollWidth || clientHeight < scrollHeight);
  }

  @autobind()
  setRef(elem: HTMLElement) {
    // This needs to be a seperate function, see: https://github.com/facebook/react/issues/11258
    this.elem = elem;
  }

  @autobind()
  onSelectionChange() {
    this.hasHighlightedText ||= document.getSelection().toString().length > 0;
  }

  @autobind()
  onMouseDown() {
    this.onSelectionChange(); // initial "event" fire on mouse down (for clearing old selections)
    document.addEventListener("selectionchange", this.onSelectionChange);
  }

  @autobind()
  onMouseUp() {
    document.removeEventListener("selectionchange", this.onSelectionChange);

    if (!this.hasHighlightedText) {
      this._isExpanded = !this._isExpanded;
    }

    this.hasHighlightedText = false;
  }

  render() {
    const { isExpandable, isExpanded } = this;
    const { className, label, small, flat, children, isExpanded: _, ...elemProps } = this.props;
    const classNames = cssNames("Badge", className, {
      small,
      flat,
      isExpandable,
      isExpanded,
    });

    return (
      <div {...elemProps} className={classNames} onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown} ref={this.setRef}>
        {label}
        {children}
      </div>
    );
  }
}
