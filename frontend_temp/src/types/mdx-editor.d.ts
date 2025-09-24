declare module '@mdxeditor/editor' {
  import { FC } from 'react';

  export interface MDXEditorProps {
    markdown: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    className?: string;
    contentEditableClassName?: string;
    plugins?: any[];
  }

  export const MDXEditor: FC<MDXEditorProps>;
  export const headingsPlugin: () => any;
  export const listsPlugin: () => any;
  export const quotePlugin: () => any;
  export const thematicBreakPlugin: () => any;
  export const markdownShortcutPlugin: () => any;
}
