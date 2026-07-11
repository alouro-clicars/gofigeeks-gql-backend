import { resolvers as Scalars } from 'graphql-scalars'
import { eq } from 'drizzle-orm'
import { drizzleClient } from '#/shared/drizzle-client'
import { tweets } from '#/tweet/tweet.schema'
import { users } from '#/auth/auth.schema'
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
	return drizzleClient
		.select({
			id: tweets.id,
			content: tweets.content,
			likes: tweets.likes,
			createdAt: tweets.createdAt,
			author: users,
		})
		.from(tweets)
		.innerJoin(users, eq(tweets.authorId, users.id))
}
