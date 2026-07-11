import { resolvers as Scalars } from 'graphql-scalars'
import { TweetRepository } from '#/tweet/tweet.repository'
import { DataLoaders } from './shared/data-loaders'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
		tweets: async () => TweetRepository.all(),
	},
	// Mutation: {
	// 	// TODO
	// },
	...Scalars,
})
