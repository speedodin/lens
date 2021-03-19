import { compile } from "path-to-regexp";

export interface IURLParams<P extends object = {}, Q extends object = {}> {
  params?: P;
  query?: Q;
  fragment?: string;
}

export function buildURL<P extends object = {}, Q extends object = {}>(path: string | any) {
  const pathBuilder = compile(String(path));

  return function ({ params, query, fragment }: IURLParams<P, Q> = {}): string {
    const queryParams = query ? new URLSearchParams(Object.entries(query)).toString() : "";
    const parts = [
      pathBuilder(params),
      queryParams && `?${queryParams}`,
      fragment && `#${fragment}`,
    ];

    return parts.filter(Boolean).join("");
  };
}

export function buildURLPositional<P extends object = {}, Q extends object = {}>(path: string | any) {
  const builder = buildURL(path);

  return function(params?: P, query?: Q, fragment?: string): string {
    return builder({ params, query, fragment });
  };
}
