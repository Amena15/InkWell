import * as React from 'react';

declare module 'react' {
  // This ensures consistent ReactNode typing across the app
  type ReactNode = React.ReactNode;
}
