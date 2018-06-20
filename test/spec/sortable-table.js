/* globals jest */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';
import SortableTable from '../../lib/sortable-table';

Enzyme.configure({ adapter: new Adapter() });

describe('SortableTable', () => {
  const TestComponent = ({ children }) => (<b>{children}</b>);

  let component;
  let instance;
  let mockProps;

  const getChildren = () => (
    <SortableTable.Table>
      <SortableTable.Header>
        <SortableTable.Row>
          <SortableTable.HeaderCell>Dave {sortingIcon()}</SortableTable.HeaderCell>
          <SortableTable.HeaderCell>Jamie {sortingIcon()}</SortableTable.HeaderCell>
          <SortableTable.HeaderCell>Joe {sortingIcon()}</SortableTable.HeaderCell>
          <SortableTable.HeaderCell>No sorting</SortableTable.HeaderCell>
        </SortableTable.Row>
      </SortableTable.Header>
      <SortableTable.Body>
        <SortableTable.Row>
          <SortableTable.Cell>foo</SortableTable.Cell>
          <SortableTable.Cell>bar</SortableTable.Cell>
          <SortableTable.Cell><TestComponent>Bam</TestComponent></SortableTable.Cell>
          <SortableTable.Cell>Action</SortableTable.Cell>
        </SortableTable.Row>
        <SortableTable.Row>
          <SortableTable.Cell>whizz</SortableTable.Cell>
          <SortableTable.Cell>woop</SortableTable.Cell>
          <SortableTable.Cell>binary star system</SortableTable.Cell>
          <SortableTable.Cell>Action</SortableTable.Cell>
        </SortableTable.Row>
      </SortableTable.Body>
    </SortableTable.Table>
  );

  const getRequiredProps = () => ({
    onColumnOrder: jest.fn(),
    children: getChildren()
  });

  const setupComponent = (overrides = {}) => {
    mockProps = {
      ...getRequiredProps(),
      ...overrides
    };

    component = mount((
      <SortableTable {...mockProps} />
    ));
    instance = component.instance();
  };

  const table = () => component.find('table');
  const header = () => table().find('thead');
  const body = () => table().find('tbody');

  const sortingIcon = () => (<SortableTable.SortingIcon />);

  describe('instance', () => {
    beforeEach(setupComponent);

    describe('sortableColumns', () => {
      it('populates the sortableColumns array with columns with sorting icons', () => {
        expect(instance.sortableColumns).toEqual([0, 1, 2]);
      });

      describe('when reordering columns with new props', () => {
        beforeEach(() => {
          component.setProps({
            children: (
              <SortableTable.Table>
                <SortableTable.Header>
                  <SortableTable.Row>
                    <SortableTable.HeaderCell>Dave</SortableTable.HeaderCell>
                    <SortableTable.HeaderCell>Jamie {sortingIcon()}</SortableTable.HeaderCell>
                    <SortableTable.HeaderCell>Joe {sortingIcon()}</SortableTable.HeaderCell>
                    <SortableTable.HeaderCell>No sorting {sortingIcon()}</SortableTable.HeaderCell>
                  </SortableTable.Row>
                </SortableTable.Header>
              </SortableTable.Table>
            )
          });

          component.update();
        });

        it('sets sortableColumns to the new columns with sorting icons', () => {
          expect(instance.sortableColumns).toEqual([1, 2, 3]);
        });
      });
    });

    describe('dragging', () => {
      describe('header cell', () => {
        it('is not draggable', () => {
          header().find('th').at(0).simulate('dragstart');

          expect(instance.oldIndex).toBeUndefined();
        });

        describe('sort icon', () => {
          const getDragEvent = () => ({
            dataTransfer: {
              setDragImage: jest.fn()
            }
          });

          it('is draggable', () => {
            const icon = header()
              .find('th')
              .at(0)
              .find(SortableTable.SortingIcon)

            icon.simulate('dragstart', getDragEvent());

            expect(instance.oldIndex).toBeDefined();
          });

          describe('when dragging', () => {
            let dragEvent;
            let dragColumnCell;

            beforeEach(() => {
              const headerNode =
                instance.element
                  .querySelector('table thead tr th:nth-child(3)');

              Object.defineProperty(headerNode, 'offsetWidth', {
                get: () => 54
              });

              jest.useFakeTimers();
              dragEvent = getDragEvent();
              dragColumnCell = header().find('th').find(SortableTable.SortingIcon).at(2);
              dragColumnCell.simulate('dragstart', dragEvent);
            });

            it('sets the oldIndex to the column being dragged', () => {
              expect(instance.oldIndex).toEqual(2);
            });

            it('sets the ghost image x position to half of the width', () => {
              expect(dragEvent.dataTransfer.setDragImage)
                .toHaveBeenCalledWith(expect.any(Node), 27, expect.any(Number));
            });

            it('sets the ghost image y position to 0', () => {
              expect(dragEvent.dataTransfer.setDragImage)
                .toHaveBeenCalledWith(expect.any(Node), expect.any(Number), 0);
            });

            it('sets the ghost image to the column being dragged', () => {
              expect(dragEvent.dataTransfer.setDragImage).toHaveBeenCalledWith(
                expect.any(Node),
                expect.any(Number),
                expect.any(Number)
              );

              const node = dragEvent.dataTransfer.setDragImage.mock.calls[0][0];
              const headers = node.querySelectorAll('thead tr th');
              expect(headers.length).toEqual(1);
              expect(headers[0].textContent).toContain('Joe');

              const rows = node.querySelectorAll('tbody tr');
              expect(rows.length).toEqual(2);

              for (let i = 0; i < rows.length; i++) {
                expect(rows[i].querySelectorAll('td').length).toEqual(1);
              }

              expect(rows[0].textContent).toEqual('Bam');
              expect(rows[1].textContent).toEqual('binary star system');
            });

            it('appends the ghost image to the body in a wrapper node', () => {
              const nodes = Array.from(document.body.querySelectorAll('div'));
              expect(nodes).toContain(instance.ghostContainer);
            });

            describe('when dropping column back down in same position', () => {
              beforeEach(() => {
                dragColumnCell.simulate('drop');
              });

              it('does not call the onColumnOrder callback', () => {
                expect(mockProps.onColumnOrder).not.toHaveBeenCalled();
              });
            });

            describe('when hovering over an unsortable column', () => {
              let dragOverEvent;
              let columnCell;

              beforeEach(() => {
                dragOverEvent = {
                  preventDefault: jest.fn()
                };

                jest.spyOn(instance, 'setState');

                columnCell = header().find('tr')
                  .at(0)
                  .find('th')
                  .at(3);

                columnCell.simulate('dragover', dragOverEvent);
              });

              it('does not call preventDefault', () => {
                expect(dragOverEvent.preventDefault).not.toHaveBeenCalled();
              });

              it('does not set the reorder state', () => {
                jest.runAllTimers();
                expect(instance.state).toEqual({});
              });

              describe('when dropping on that column', () => {
                beforeEach(() => {
                  columnCell.simulate('drop');
                });

                it('does not call the onColumnOrder callback', () => {
                  expect(mockProps.onColumnOrder).not.toHaveBeenCalled();
                });
              });
            });

            describe('when hovering over another column', () => {
              let dragOverEvent;
              let columnCell;

              beforeEach(() => {
                dragOverEvent = {
                  preventDefault: jest.fn()
                };

                jest.spyOn(instance, 'setState');

                columnCell = header().find('tr')
                  .at(0)
                  .find('th')
                  .at(1);

                columnCell.simulate('dragover', dragOverEvent);
              });

              it('calls preventDefault', () => {
                expect(dragOverEvent.preventDefault).toHaveBeenCalled();
              });

              it('sets the currentIndex', () => {
                expect(instance.currentIndex).toEqual(1);
              });

              describe('when timers complete', () => {
                beforeEach(() => {
                  jest.runAllTimers();
                  component.update();
                });

                it('sets reorder state', () => {
                  expect(instance.state).toEqual({
                    reorder: {
                      oldIndex: 2,
                      newIndex: 1
                    }
                  });
                });

                it('reorders the headers', () => {
                  const headers = header().find('th');

                  expect(headers.length).toEqual(4);
                  expect(headers.at(0)).toIncludeText('Dave');
                  expect(headers.at(1)).toIncludeText('Joe');
                  expect(headers.at(2)).toIncludeText('Jamie');
                  expect(headers.at(3)).toIncludeText('No sorting');
                });

                it('reorders the rows', () => {
                  const rows = body().find('tr');

                  expect(rows.at(0).find('td').at(0)).toHaveText('foo');
                  expect(rows.at(0).find('td').at(1)).toHaveText('Bam');
                  expect(rows.at(0).find('td').at(2)).toHaveText('bar');

                  expect(rows.at(1).find('td').at(0)).toHaveText('whizz');
                  expect(rows.at(1).find('td').at(1)).toHaveText('binary star system');
                  expect(rows.at(1).find('td').at(2)).toHaveText('woop');
                });
              });

              describe('when dropping on that column', () => {
                beforeEach(() => {
                  columnCell.simulate('drop');
                });

                it('calls the onColumnOrder callback', () => {
                  expect(mockProps.onColumnOrder).toHaveBeenCalledWith(2, 1);
                });
              });

              describe('when dropping on an element within', () => {
                beforeEach(() => {
                  columnCell.find(SortableTable.SortingIcon).simulate('drop');
                });

                it('calls the onColumnOrder callback', () => {
                  expect(mockProps.onColumnOrder).toHaveBeenCalledWith(2, 1);
                });
              });

              describe('after rendering', () => {
                beforeEach(() => {
                  instance.columnWidths = [5, 12, 30, 3];
                  jest.runAllTimers();
                  component.update();
                });

                it('renders columns with set column widths', () => {
                  const headers = header().find('th');

                  expect(headers.length).toEqual(4);
                  expect(headers.at(0)).toHaveProp('style', expect.objectContaining({ width: '5px' }));
                  expect(headers.at(1)).toHaveProp('style', expect.objectContaining({ width: '12px' }));
                  expect(headers.at(2)).toHaveProp('style', expect.objectContaining({ width: '30px' }));
                  expect(headers.at(3)).toHaveProp('style', expect.objectContaining({ width: '3px' }));
                });

                it('renders the dragged column with opacity 0.1', () => {
                  const cell =
                    body().find('tr')
                      .at(0)
                      .find('td')
                      .at(1);

                  expect(cell).toHaveProp(
                    'style',
                    expect.objectContaining({ opacity: 0.1 })
                  );
                });

                it('renders other columns with normal opacity', () => {
                  const cell =
                    body().find('tr')
                      .at(0)
                      .find('td')
                      .at(0);

                  expect(cell).toHaveProp(
                    'style',
                    expect.objectContaining({ opacity: 1 })
                  );
                });

                describe('when hovering over the same column again', () => {
                  beforeEach(() => {
                    body().find('tr')
                      .at(0)
                      .find('td')
                      .at(1)
                      .simulate('dragover');
                  });

                  it('does not create another timer', () => {
                    expect(setTimeout.mock.calls.length).toEqual(1);
                  });
                });

                describe('when dragging ends', () => {
                  beforeEach(() => {
                    table().simulate('dragend');
                  });

                  it('unsets the reorder state', () => {
                    expect(instance.state).toEqual({});
                  });

                  it('unsets the currentIndex', () => {
                    expect(instance.currentIndex).toEqual(-1);
                  });

                  it('unsets the columnWidths', () => {
                    expect(instance.columnWidths).toEqual([]);
                  });

                  it('removes the ghost from the body', () => {
                    Array.from(document.body.querySelectorAll('div'))
                      .forEach((node) => {
                        expect(node).not.toEqual(instance.ghostContainer);
                      });
                  });

                  it('renders with column widths as auto', () => {
                    const headers = header().find('th');

                    expect(headers.length).toEqual(4);

                    for (let i = 0; i < headers.length; i++) {
                      expect(headers.at(i)).toHaveProp(
                        'style',
                        expect.objectContaining({ width: undefined })
                      );
                    }
                  });
                });
              });

              describe('when hovering over another column before timer completes', () => {
                beforeEach(() => {
                  body().find('tr')
                    .at(0)
                    .find('td')
                    .at(0)
                    .simulate('dragover');
                });

                it('creates another timer', () => {
                  expect(setTimeout.mock.calls.length).toEqual(2);
                });

                it('calls setState only once', () => {
                  jest.runAllTimers();

                  expect(instance.setState.mock.calls.length).toEqual(1);
                });

                it('calls setState with the latest hovered columns details', () => {
                  jest.runAllTimers();

                  expect(instance.state).toEqual({
                    reorder: {
                      oldIndex: 2,
                      newIndex: 0
                    }
                  });
                });
              });
            });
          });
        });
      });

      describe('body cell', () => {
        it('is not draggable', () => {
          body().find('td').at(0).simulate('dragstart');

          expect(instance.oldIndex).toBeUndefined();
        });
      });
    });

    describe('structure', () => {
      it('renders a table', () => {
        expect(table()).toHaveLength(1);
      });

      it('renders the headers in order', () => {
        const headers = header().find('th');

        expect(headers.length).toEqual(4);
        expect(headers.at(0)).toIncludeText('Dave');
        expect(headers.at(1)).toIncludeText('Jamie');
        expect(headers.at(2)).toIncludeText('Joe');
        expect(headers.at(3)).toIncludeText('No sorting');
      });

      it('renders the correct number of rows', () => {
        const rows = body().find('tr');

        expect(rows.length).toEqual(2);
      });

      it('renders the correct values in the body cells', () => {
        const rows = body().find('tr');

        expect(rows).toHaveLength(2);

        expect(rows.at(0).find('td').at(0)).toHaveText('foo');
      });

      it('renders a column ordering icon where SortingIcon is used', () => {
        const headers = header().find(SortableTable.HeaderCell);

        expect(headers).toHaveLength(4);

        for (let i = 0; i < headers.length; i++) {
          const icon = headers.at(i).find(SortableTable.SortingIcon);

          if (i === 3) {
            expect(icon).toHaveLength(0);
          } else {
            expect(icon).toHaveLength(1);
          }
        }
      });
    });
  });
});
