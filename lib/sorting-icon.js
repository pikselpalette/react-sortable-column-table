// @flow
import * as React from 'react';

const SortingIcon = ({ children, ...rest }: { children?: React.ElementType }) =>
  React.Children.map(children, (child) => {
    if (!child || !child.props) return child;

    return React.cloneElement(
      child,
      { ...rest, ...child.props },
      child.props.children
    );
  });

SortingIcon.defaultProps = {
  children: (
    <span>
      {'<>'}
    </span>
  )
};

export default SortingIcon;
