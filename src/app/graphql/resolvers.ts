import { resolvers as Scalars } from 'graphql-scalars'
import { GraphQLError } from 'graphql'
import { auth } from '#/shared/auth'
import { TweetRepository } from '#/tweet/tweet.repository'
import { DataLoaders } from './shared/data-loaders'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
		tweets: async () => TweetRepository.all(),
	},
	Mutation: {
		signIn: async (_: any, { email, password }: any, context: any) => {
			try {
				const result = await auth.api.signInEmail({
					body: { email, password },
					returnHeaders: true,
				})

				forwardSetCookie(result.headers, context.responseHeaders)

				return result.response.user
			} catch (error: any) {
				if (error.message?.includes('Invalid email or password')) {
					throw new GraphQLError(
						'Email o contraseña inválidos',
						{
							extensions: { code: 'INVALID_CREDENTIALS' },
						},
					)
				}
				throw error
			}
		},

		signOut: async (_: any, __: any, context: any) => {
			const result = await auth.api.signOut({
				headers: context.headers,
				returnHeaders: true,
			})

			forwardSetCookie(result.headers, context.responseHeaders)

			return true
		},
	},
	...Scalars,
})

function forwardSetCookie(source: Headers, target: Headers) {
	for (const cookie of source.getSetCookie())
		target.append('set-cookie', cookie)
}
