import './env'

import { renderApolloSandbox } from '@graphql-yoga/render-apollo-sandbox'
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { auth } from '#/shared/auth'
import { schema } from './graphql/schema'
import { DataLoaders } from './graphql/shared/data-loaders'

const yoga = createYoga({
	schema,
	async context(ctx) {
		const loaders = DataLoaders.createContext()
		const responseHeaders = new Headers()

		const session = await auth.api.getSession({
			headers: ctx.request.headers,
		})

		return {
			...loaders,
			headers: ctx.request.headers,
			responseHeaders,
			user: session?.user ?? null,
		}
	},
	plugins: [
		{
			onResponse({ serverContext, response, setResponse }: any) {
				const cookies = serverContext.responseHeaders?.getSetCookie() ?? []
				if (!cookies.length) return

				const headers = new Headers(response.headers)
				for (const cookie of cookies) headers.append('set-cookie', cookie)
				setResponse(
					new Response(response.body, {
						status: response.status,
						statusText: response.statusText,
						headers,
					}),
				)
			},
		},
	],
	renderGraphiQL: renderApolloSandbox({
		initialState: {
			includeCookies: true,
		},
	}),
})

const server = createServer(yoga)

server.listen(4000, () => {
	console.info('Server is running on http://localhost:4000/graphql')
})
