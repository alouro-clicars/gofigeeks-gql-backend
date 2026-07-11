import '@/env'

import { auth } from '#/shared/auth'
import { drizzleClient } from '#/shared/drizzle-client'
import { reset } from 'drizzle-seed'
import * as authSchema from '../src/contexts/auth/auth.schema'
import * as tweetSchema from '../src/contexts/tweet/tweet.schema'
import { users } from './seed/users'
import { tweets } from './seed/tweets'

console.log('Resetting database...')

await reset(drizzleClient, { ...authSchema, ...tweetSchema })

console.log('Seeding initial users...')

await Promise.all(
	users.map((user) =>
		auth.api.createUser({
			body: {
				email: user.email,
				password: user.password,
				name: user.name,
				role: user.role as any,
				data: { biography: user.biography },
			},
		}),
	),
)

console.log('Seeding initial tweets...')

await drizzleClient.insert(tweetSchema.tweets).values(tweets)

console.log('Seed completed successfully!')
process.exit(0)
