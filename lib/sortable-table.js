// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import move from 'lodash-move';
import { renderAs } from 'react-render-as';
import ProgressiveTable from 'react-progressive-table';

/** @memberOf SortableTable */
type Props = {
  children: React.Node,
  onColumnOrder: Function,
  dragOpacity: number,
  ghostRowsLimit: number
};

/** @memberOf SortableTable */
type State = {
  reorder?: {
    oldIndex: number,
    newIndex: number
  }
};

const SortingIcon = ({ children, ...rest }: { children?: React.ElementType }) => {
  const child = React.Children.only(children);

  return React.cloneElement(
    child,
    { ...rest, ...child.props },
    child.props.children
  );
};

SortingIcon.defaultProps = {
  children: (
    <span>
      {'<>'}
    </span>
  )
};

export default class SortableTable extends React.Component<Props, State> {
  ghostContainer: HTMLElement;
  element: HTMLElement;
  oldIndex: number;
  currentIndex: number;
  isDragging: boolean = false;

  static Row = renderAs(ProgressiveTable.Row);
  static Cell = renderAs(ProgressiveTable.Cell);
  static HeaderCell = renderAs(ProgressiveTable.HeaderCell);
  static Header = renderAs(ProgressiveTable.Header);
  static Body = renderAs(ProgressiveTable.Body);
  static Table = renderAs(ProgressiveTable.Table);
  static SortingIcon = SortingIcon;

  static waitMs: number = 40;

  static defaultProps = {
    dragOpacity: 0.1,
    ghostRowsLimit: 16
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

  getCellColumnProps(
    node: React.Element<SortableTable.Cell | SortableTable.HeaderCell>,
    index: number
  ): Object {
    return {
      ...node.props,
      key: node.key,
      'data-index': index,
      onDragOver: this.handleDragOver,
      onDrop: this.handleDrop,
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

    if (document.body) {
      document.body.append(this.ghostContainer);
    }

    ReactDOM.render(
      (
        <React.Fragment>{columns}</React.Fragment>
      ),
      ghost
    );

    e.dataTransfer.setDragImage(ghost, width / 2, 0);
  }

  setElement = (el: HTMLElement | null) => {
    if (el) this.element = el;
  };

  renderCell = (
    node: React.Element<SortableTable.Cell | SortableTable.HeaderCell>,
    index: number
  ): React.Element<SortableTable.Cell | SortableTable.HeaderCell> => {
    const children = React.Children.map(node.props.children, (child) => {
      if (!child || child.type !== this.constructor.SortingIcon) return child;

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

  renderRow = (
    row: React.Element<SortableTable.Row>,
    index: number,
    column: number
  ): React.Element<ProgressiveTable.Row> => {
    const { children, ...props } = row.props;

    let reorderedChildren = React.Children.toArray(children);

    if (this.state.reorder) {
      const { oldIndex, newIndex } = this.state.reorder;

      reorderedChildren = move(reorderedChildren, oldIndex, newIndex);
    }

    return (
      <ProgressiveTable.Row {...props}>
        {column === -1
          ? reorderedChildren.map(this.renderCell)
          : this.renderCell(reorderedChildren[column], 0)}
      </ProgressiveTable.Row>
    );
  };

  renderChildren(children: React.Node, column: number = -1): React.Node {
    return React.Children.toArray(children).map((node, index) => {
      if (this.constructor.Row === node.type) {
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
        <ProgressiveTable minimumRender={this.props.ghostRowsLimit}>
          {this.renderChildren(this.props.children)}
        </ProgressiveTable>
      </div>
    );
  }
}
