import * as React from 'react';

/**
 * A component that renders its children directly without creating an extra DOM node.
 * Useful for wrapping elements to pass props down to a child.
 */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  children?: React.ReactNode;
}>(
  ({ asChild = false, ...props }, ref) => {
    const { children, ...rest } = props;
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...rest,
        ...children.props,
        ref: (node: HTMLElement | null) => {
          // @ts-ignore
          if (ref) ref(node);
          const { ref: childRef } = children as any;
          if (typeof childRef === 'function') {
            childRef(node);
          } else if (childRef) {
            childRef.current = node;
          }
        },
      });
    }

    return React.createElement('div', { ...rest, ref }, children);
  }
);

Slot.displayName = 'Slot';

export { Slot };
