import { 
  FastifyInstance, 
  FastifyRequest, 
  FastifyReply, 
  FastifyPluginAsync, 
  RouteHandlerMethod, 
  RouteShorthandOptions, 
  RouteShorthandMethod,
  RouteShorthandOptionsWithHandler,
  FastifySchema,
  RouteGenericInterface
} from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    // HTTP methods with proper typing
    get(path: string, handler: RouteHandlerMethod): void;
    
    post<RouteGeneric extends RouteGenericInterface = RouteGenericInterface>(
      path: string,
      opts: RouteShorthandOptions & {
        schema?: FastifySchema;
      },
      handler: RouteHandlerMethod
    ): void;
    
    post<RouteGeneric extends RouteGenericInterface = RouteGenericInterface>(
      path: string,
      handler: RouteHandlerMethod
    ): void;
  }

  interface FastifyRequest {
    log: {
      error: (message: string, ...args: any[]) => void;
    };
  }
}

export {};
