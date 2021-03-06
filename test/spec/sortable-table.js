/* globals jest */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';
import SortableTable, { SortingIcon } from '../../lib/sortable-table';

Enzyme.configure({ adapter: new Adapter() });

describe('SortableTable', () => {
  const TestComponent = ({ children }) => (<b>{children}</b>);
  const PassThroughComponent = ({ children }) => children;

  let component;
  let instance;
  let mockProps;

  const getChildren = () => (
    <table>
      <thead>
        <tr>
          <th>Dave <SortingIcon /></th>
          <PassThroughComponent>
            <th>Jamie <SortingIcon /></th>
          </PassThroughComponent>
          <th>Joe <SortingIcon /></th>
          <th>No sorting</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ fontWeight: 'bold' }}>foo</td>
          <td>bar</td>
          <td><TestComponent>Bam</TestComponent></td>
          <td>Action</td>
        </tr>
        <tr>
          <td>whizz <SortingIcon /></td>
          <td>woop <SortingIcon /></td>
          <td>binary star system <SortingIcon /></td>
          <td>Action</td>
        </tr>
      </tbody>
    </table>
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

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('when it has a child which should not remount', () => {
    let mountCount;
    let updateCount;

    class TestComponentRemount extends React.Component {
      componentDidMount() { // eslint-disable-line class-methods-use-this
        mountCount++;
      }

      componentDidUpdate() { // eslint-disable-line class-methods-use-this
        updateCount++;
      }

      render() { // eslint-disable-line class-methods-use-this
        return null;
      }
    }

    beforeEach(() => {
      mountCount = 0;
      updateCount = 0;

      setupComponent({
        children: (
          <table>
            <thead>
              <tr>
                <th>
                  <TestComponentRemount />
                </th>
              </tr>
            </thead>
          </table>
        )
      });
    });

    it('mounts a single time', () => {
      expect(mountCount).toEqual(1);
    });

    it('has not updated', () => {
      expect(updateCount).toEqual(0);
    });

    describe('when component re-renders', () => {
      beforeEach(() => {
        component.setProps({
          children: (
            <table>
              <thead>
                <tr>
                  <th>
                    <TestComponentRemount />
                  </th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          )
        });
        component.update();
      });

      it('has not remounted', () => {
        expect(mountCount).toEqual(1);
      });

      it('has updated', () => {
        expect(updateCount).toEqual(1);
      });

      describe('when component re-renders again', () => {
        beforeEach(() => {
          component.setProps({
            children: (
              <table>
                <thead>
                  <tr>
                    <th>
                      <TestComponentRemount />
                    </th>
                    <th>
                      Test
                    </th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            )
          });
          component.update();
        });

        it('has not remounted', () => {
          expect(mountCount).toEqual(1);
        });

        it('has updated', () => {
          expect(updateCount).toEqual(2);
        });
      });
    });
  });

  it('renders correctly with a null child', () => {
    expect(() => {
      mount((
        <SortableTable>
          {null}
          <i>Icon</i>
        </SortableTable>
      ));
    }).not.toThrow();
  });

  it('renders correctly with an untyped row child', () => {
    expect(() => {
      mount((
        <SortableTable>
          <tr>
            Test
          </tr>
        </SortableTable>
      ));
    }).not.toThrow();
  });

  describe('instance', () => {
    beforeEach(setupComponent);

    describe('when a different event hovers over a column', () => {
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

      it('does not call preventDefault', () => {
        expect(dragOverEvent.preventDefault).not.toHaveBeenCalled();
      });

      it('does not set the currentIndex', () => {
        expect(instance.currentIndex).toBeUndefined();
      });

      describe('when dropping on that column', () => {
        beforeEach(() => {
          jest.spyOn(instance, 'tearDownDraggingElements');
          columnCell.simulate('drop');
        });

        it('does not call tearDownDraggingElements', () => {
          expect(instance.tearDownDraggingElements).not.toHaveBeenCalled();
        });
      });
    });

    describe('sortableColumns', () => {
      it('populates the sortableColumns array with columns with sorting icons', () => {
        expect(instance.sortableColumns).toEqual([0, 1, 2]);
      });

      describe('when reordering columns with new props', () => {
        beforeEach(() => {
          component.setProps({
            children: (
              <table>
                <thead>
                  <tr>
                    <th>Dave</th>
                    <th>Jamie <SortingIcon /></th>
                    <th>Joe <SortingIcon /></th>
                    <th>No sorting <SortingIcon /></th>
                  </tr>
                </thead>
              </table>
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

          describe('when in a child', () => {
            it('is draggable', () => {
              const icon = header()
                .find('th')
                .at(1)
                .find(SortingIcon);

              icon.simulate('dragstart', getDragEvent());

              expect(instance.oldIndex).toBeDefined();
            });
          });

          it('is draggable', () => {
            const icon = header()
              .find('th')
              .at(0)
              .find(SortingIcon);

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
              dragColumnCell = header().find('th').find(SortingIcon).at(2);
              dragColumnCell.simulate('dragstart', dragEvent);
            });

            it('combines styles with supplied props styles', () => {
              const cell = body().find('td').at(0);

              expect(cell).toHaveProp('style', {
                opacity: 1,
                fontWeight: 'bold'
              });
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
              expect(rows[1].textContent).toContain('binary star system');
            });

            it('appends the ghost image to the body in a wrapper node', () => {
              const nodes = Array.from(document.body.querySelectorAll('div'));
              expect(nodes).toContain(instance.ghostContainer);
            });

            it('sets the ghostContainer style', () => {
              expect(instance.ghostContainer.style.position).toEqual('absolute');
              expect(instance.ghostContainer.style.left).toEqual('-100000px');
              expect(instance.ghostContainer.style.width).toEqual('54px');
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

                  expect(rows.at(1).find('td').at(0)).toIncludeText('whizz');
                  expect(rows.at(1).find('td').at(1)).toIncludeText('binary star system');
                  expect(rows.at(1).find('td').at(2)).toIncludeText('woop');
                });
              });

              describe('when dropping on that column', () => {
                beforeEach(() => {
                  columnCell.simulate('drop');
                });

                it('calls the onColumnOrder callback', () => {
                  expect(mockProps.onColumnOrder).toHaveBeenCalledWith(2, 1);
                });

                it('sets isDragging to false', () => {
                  expect(instance.isDragging).toBe(false);
                });

                describe('when dragging ends', () => {
                  beforeEach(() => {
                    jest.spyOn(instance, 'setState');
                    table().simulate('dragend');
                  });

                  it('does not call setState again', () => {
                    expect(instance.setState).not.toHaveBeenCalled();
                  });
                });
              });

              describe('when dropping on an element within', () => {
                beforeEach(() => {
                  columnCell.find(SortingIcon).simulate('drop');
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
        const headers = header().find('th');

        expect(headers).toHaveLength(4);

        for (let i = 0; i < headers.length; i++) {
          const icon = headers.at(i).find(SortingIcon);

          if (i === 3) {
            expect(icon).toHaveLength(0);
          } else {
            expect(icon).toHaveLength(1);
          }
        }
      });

      it('renders SortingIcon with the correct props', () => {
        const icon = component.find(SortingIcon).first();

        expect(icon).toHaveProp('draggable', true);
        expect(icon).toHaveProp('style', { cursor: 'grab' });
      });
    });
  });
});
