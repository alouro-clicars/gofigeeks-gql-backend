import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from '#/auth/auth.schema'

export const tweets = pgTable('tweets', {
	id: uuid('id').primaryKey(),
	content: text('content').notNull(),
	likes: integer('likes').notNull(),
	createdAt: timestamp('created_at').notNull(),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id),
})
