/* globals jest */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';
import SortingIcon from '../../lib/sorting-icon';

Enzyme.configure({ adapter: new Adapter() });

describe('SortingIcon', () => {
  it('renders a span with <> as default', () => {
    expect(mount((
      <SortingIcon />
    )).find('span')).toHaveText('<>');
  });

  it('renders children if passed children', () => {
    expect(mount((
      <SortingIcon>
        <b>Icon</b>
      </SortingIcon>
    )).find('b')).toHaveText('Icon');
  });

  it('works fine with 2 children', () => {
    expect(() => {
      mount((
        <SortingIcon>
          <b>Icon</b>
          <i>Icon</i>
        </SortingIcon>
      ));
    }).not.toThrow();
  });
});
