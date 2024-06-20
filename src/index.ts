/* eslint-disable @typescript-eslint/naming-convention */
import type Futen from 'futen';

export type HTTPMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
type Concat<T extends string, U extends string> = `${T}, ${U}` | T | U;
type Combine<T extends string, U extends string = T> = T extends string ? Concat<T, Combine<Exclude<U, T>>> : never;
type MethodsList = Combine<HTTPMethods>;

/**
 * https://developer.mozilla.org/en-US/docs/Glossary/CORS#cors_headers
 */
export type CORSHeaders = Partial<{
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': 'true';
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': MethodsList | '*';
    'Access-Control-Expose-Headers': string;
    'Access-Control-Max-Age': string;
    'Access-Control-Request-Headers': string;
    'Access-Control-Request-Method': string;
    Origin: string;
    'Timing-Allow-Origin': string;
}>;

export function CORS<S extends Futen>(server: S, policies: CORSHeaders): void {
    server.instance.fetch = async function (request: Request): Promise<Response> {
        if (request.method === 'OPTIONS') {
            return new Response('departed', {
                headers: policies
            });
        }
        const response = (await server.fetch()(request, server.instance)) as Response;
        for (const [key, value] of Object.entries(policies)) {
            if (response.headers.has(key)) continue;
            response.headers.set(key, value);
        }
        return response;
    };
}
