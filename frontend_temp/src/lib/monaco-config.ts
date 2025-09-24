// Monaco Editor configuration for CSP compliance
declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (workerId: string, label: string) => {
        postMessage: () => void;
        terminate: () => void;
      };
    };
  }
}

export const monacoConfig = {
  // Configure Monaco Editor to work with CSP
  beforeMount: (monaco: any) => {
    // Set up Monaco Editor environment for CSP
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });

    // Disable web workers completely to avoid CSP issues
    if (typeof window !== 'undefined') {
      window.MonacoEnvironment = {
        getWorker: function (workerId: string, label: string) {
          // Return a mock worker that does nothing
          return {
            postMessage: function() {},
            terminate: function() {}
          };
        }
      };
    }
  }
};
