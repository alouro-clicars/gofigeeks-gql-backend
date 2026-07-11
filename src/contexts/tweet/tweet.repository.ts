import { eq } from 'drizzle-orm'
import { drizzleClient } from '#/shared/drizzle-client'
import { tweets } from '#/tweet/tweet.schema'

export class TweetRepository {
	static async all() {
		return drizzleClient
			.select({
				id: tweets.id,
				content: tweets.content,
				likes: tweets.likes,
				createdAt: tweets.createdAt,
				authorId: tweets.authorId,
			})
			.from(tweets)
	}

	static async searchById(id: string) {
		return drizzleClient
			.select({
				id: tweets.id,
				content: tweets.content,
				likes: tweets.likes,
				createdAt: tweets.createdAt,
				authorId: tweets.authorId,
			})
			.from(tweets)
			.where(eq(tweets.id, id))
			.limit(1)
			.then((rows) => rows[0] || null)
	}
}