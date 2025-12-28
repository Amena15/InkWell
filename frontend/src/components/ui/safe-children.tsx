import * as React from 'react';

type ReactNode = React.ReactNode;

interface SafeChildrenProps {
  children: ReactNode;
}

export function SafeChildren({ children }: SafeChildrenProps) {
  return <>{children}</>;
}
