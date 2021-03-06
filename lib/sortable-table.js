// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import move from 'lodash-move';
import ProgressiveTable from 'react-progressive-table';
import SortingIcon from './sorting-icon';

/** @memberOf SortableTable */
type Props = {
  children: React.Node,
  onColumnOrder: Function,
  dragOpacity: number,
  ghostRowsLimit: number,
  tr: React.ElementType,
  th: React.ElementType,
  td: React.ElementType
};

/** @memberOf SortableTable */
type State = {
  reorder?: {
    oldIndex: number,
    newIndex: number
  }
};

export { SortingIcon };

export default class SortableTable extends React.Component<Props, State> {
  ghostContainer: HTMLElement;
  element: HTMLElement;
  oldIndex: number;
  currentIndex: number;
  isDragging: boolean = false;

  static waitMs: number = 40;

  static defaultProps = {
    dragOpacity: 0.1,
    ghostRowsLimit: 16,
    tr: 'tr',
    th: 'th',
    td: 'td'
  };

  columnWidths: Array<number> = [];
  sortableColumns: Array<number> = [];
  state = {};

  isColumnBeingDragged(index: number): boolean {
    return index === (this.state.reorder && this.state.reorder.newIndex);
  }

  isColumnSortable(index: number): boolean {
    return this.sortableColumns.includes(index);
  }

  getCellColumnProps(node: React.Element<any>, index: number): Object {
    return {
      ...node.props,
      key: node.key,
      'data-index': index,
      onDragOver: (...args) => [this.handleDragOver, node.props.onDragOver]
        .filter(c => c).forEach(c => c(...args)),
      onDrop: (...args) => [this.handleDrop, node.props.onDrop]
        .filter(c => c).forEach(c => c(...args)),
      style: {
        width: this.columnWidths[index] ? `${this.columnWidths[index]}px` : undefined,
        opacity: this.isColumnBeingDragged(index) ? this.props.dragOpacity : 1,
        ...(node.props.style || {})
      }
    };
  }

  setIndexIfRemainingUnchanged(index: number): void {
    this.currentIndex = index;

    if (!this.isColumnBeingDragged(index)) {
      setTimeout(() => {
        if (index === this.currentIndex && !this.isColumnBeingDragged(index)) {
          this.setState({
            reorder: {
              oldIndex: this.oldIndex,
              newIndex: index
            }
          });
        }
      }, this.constructor.waitMs);
    }
  }

  handleDragOver = (e: SyntheticDragEvent<HTMLElement>) => {
    if (!this.isDragging) return;

    const index = parseInt(e.currentTarget.dataset.index, 10);

    if (this.isColumnSortable(index)) {
      e.preventDefault();
      this.setIndexIfRemainingUnchanged(index);
    }
  };

  handleDrop = (e: SyntheticDragEvent<HTMLElement>) => {
    if (!this.isDragging) return;

    const newIndex = parseInt(e.currentTarget.dataset.index, 10);

    if (this.oldIndex !== newIndex && this.isColumnSortable(newIndex)) {
      this.props.onColumnOrder(this.oldIndex, newIndex);
    }

    this.tearDownDraggingElements();
  };

  tearDownDraggingElements() {
    if (this.ghostContainer) this.ghostContainer.remove();
    if (this.state.reorder) this.setState({ reorder: undefined });
    this.columnWidths = [];
    this.currentIndex = -1;
    this.isDragging = false;
  }

  handleDragEnd = () => this.tearDownDraggingElements();

  handleDragStart = (e: SyntheticDragEvent<HTMLElement>) => {
    this.tearDownDraggingElements();

    this.isDragging = true;

    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.oldIndex = index;

    const columns = this.renderChildren(this.props.children, index);

    this.columnWidths =
      Array.from(this.element.querySelectorAll('table thead tr th'))
        .map(node => node.offsetWidth);

    const width = this.columnWidths[index];

    this.ghostContainer = document.createElement('div');
    this.ghostContainer.style.position = 'absolute';
    this.ghostContainer.style.left = '-100000px';
    this.ghostContainer.style.width = `${width}px`;

    const ghost = document.createElement('div');
    this.ghostContainer.append(ghost);

    ((document.body: any): HTMLBodyElement).append(this.ghostContainer);

    ReactDOM.render(
      (
        <React.Fragment>{columns}</React.Fragment>
      ),
      ghost
    );

    e.dataTransfer.setDragImage(ghost, width / 2, 0);
  }

  setElement = (el: HTMLElement | null) => {
    this.element = ((el: any): HTMLElement);
  };

  renderCell = (node: React.Element<any>, index: number): React.Node => {
    const children = React.Children.map(node.props.children, (child) => {
      if (!child || child.type !== SortingIcon) return child;

      if (!this.sortableColumns.includes(index)) {
        this.sortableColumns.push(index);
      }

      return React.cloneElement(
        child,
        {
          ...child.props,
          'data-index': index,
          style: { cursor: 'grab' },
          draggable: true,
          onDragStart: this.handleDragStart
        }
      );
    });

    return React.cloneElement(
      node,
      this.getCellColumnProps(node, index),
      children
    );
  };

  renderRowChildren = (
    children: React.ChildrenArray<React.Element<any>>,
    index: number
  ): React.Node => React.Children.map(children, (node) => {
    if (!node || !node.type) return node;

    if ([this.props.th, this.props.td].includes(node.type)) {
      return this.renderCell(node, index);
    }

    return React.cloneElement(
      node,
      node.props,
      node.props && this.renderRowChildren(node.props.children, index)
    );
  });

  renderRow = (
    row: React.Element<any>,
    index: number,
    column: number
  ): React.Node => {
    const { children, ...props } = row.props;

    let reorderedChildren = children;

    if (this.state.reorder) {
      const { oldIndex, newIndex } = this.state.reorder;

      reorderedChildren = move(
        React.Children.toArray(reorderedChildren),
        oldIndex,
        newIndex
      );
    }

    return React.cloneElement(
      row,
      props,
      column === -1
        ? React.Children.map(reorderedChildren, this.renderRowChildren)
        : this.renderRowChildren(React.Children.toArray(reorderedChildren)[column], 0)
    );
  };

  renderChildren(children: React.Node, column: number = -1): React.Node {
    return React.Children.map(children, (node, index) => {
      if (!node || !node.props) return node;

      if (this.props.tr === node.type) {
        return this.renderRow(node, index, column);
      }

      return React.cloneElement(
        node,
        node.props,
        node.props && this.renderChildren(node.props.children, column)
      );
    });
  }

  render(): React.Node {
    this.sortableColumns = [];

    return (
      <div ref={this.setElement} onDragEnd={this.handleDragEnd}>
        <ProgressiveTable
          minimumRender={this.props.ghostRowsLimit}
          tr={this.props.tr}
        >
          {this.renderChildren(this.props.children)}
        </ProgressiveTable>
      </div>
    );
  }
}
