import { CORS } from '../dist/index.mjs';
import Futen, { route } from 'futen';
import { describe, test, expect } from 'bun:test';

describe('PLUGINS', () => {
    @route('/')
    class Home {
        public get(): Response {
            const routes = Object.entries(server.routes).map(
                ([routeClass, handler]) => {
                    return {
                        class: routeClass,
                        path: handler.path
                    };
                }
            );
            return Response.json({
                routes
            }, {
                headers: {
                    'Access-Control-Allow-Origin': 'localhost',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }
    }

    const Test = route('/test')(
        class {
            public async post(request: Request): Promise<Response> {
                return Response.json({ object: await request.json() });
            }
        }
    )

    const server = new Futen(
        {
            Home,
            Test
        },
        {
            port: 0
        }
    )
        .plug(CORS, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT, PATCH',
            'Access-Control-Allow-Headers': '*'
        } as const)

    const { port } = server.instance;
    test('should return routes and overriden CORS headers', async () => {
        const response = await fetch(
            new Request(`http://localhost:${port}/`)
        );
        const body = await response.json();
        expect(body).toEqual({
            routes: [
                {
                    class: 'Home',
                    path: '/'
                },
                {
                    class: 'Test',
                    path: '/test'
                }
            ]
        });
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('localhost');
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
        expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });

    test('should return request body', async () => {
        const response = await fetch(
            new Request(`http://localhost:${port}/test`, {
                method: 'post',
                body: JSON.stringify({ hello: 'world' })
            })
        );
        const body = await response.json();
        expect(body).toEqual({ object: { hello: 'world' } });
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, GET, OPTIONS, DELETE, PUT, PATCH');
        expect(response.headers.get('Access-Control-Allow-Headers')).toBe('*');
    });

    test('should return CORS headers from the route', async () => {
        const response = await fetch(
            new Request(`http://localhost:${port}/`)
        );
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('localhost');
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
        expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
});
