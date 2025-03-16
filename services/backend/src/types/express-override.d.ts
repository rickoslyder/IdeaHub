declare module "express" {
  interface IRouterMethods {
    get: any;
    post: any;
    put: any;
    delete: any;
    patch: any;
    options: any;
    head: any;
  }
}
