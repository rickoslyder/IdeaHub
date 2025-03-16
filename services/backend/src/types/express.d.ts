// Custom type declarations for Express in ESM mode
declare module "express" {
  import { IncomingMessage, ServerResponse } from "http";
  import { EventEmitter } from "events";

  // Express function
  function e(): e.Application;

  namespace e {
    interface Request extends IncomingMessage {
      body: any;
      params: any;
      query: any;
      [key: string]: any;
    }

    interface Response extends ServerResponse {
      json(body: any): Response;
      status(code: number): Response;
      send(body: any): Response;
      [key: string]: any;
    }

    interface Application extends EventEmitter {
      use: any;
      get: any;
      post: any;
      put: any;
      delete: any;
      listen: any;
      [key: string]: any;
    }

    interface Router {
      use: any;
      get: any;
      post: any;
      put: any;
      delete: any;
      [key: string]: any;
    }

    function Router(): Router;
    function json(): any;
    function urlencoded(options: any): any;
    function static(root: string, options?: any): any;
  }

  export = e;
}
