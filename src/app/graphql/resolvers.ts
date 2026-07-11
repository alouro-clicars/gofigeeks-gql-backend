import { resolvers as Scalars } from 'graphql-scalars'
import { drizzleClient } from '#/shared/drizzle-client'
import { tweets } from '#/tweet/tweet.schema'
import { DataLoaders } from './shared/data-loaders'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => helloWorld(),
		tweets: async () => searchTweets(),
	},
	// Mutation: {
	// 	// TODO
	// },
	...Scalars,
})

function helloWorld(): string {
	return 'Hello World!'
}

function searchTweets() {
	return drizzleClient.select().from(tweets)
}
