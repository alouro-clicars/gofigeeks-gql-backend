import { inArray, eq } from 'drizzle-orm'
import { drizzleClient } from '#/shared/drizzle-client'
import { users } from '#/auth/auth.schema'

export class UserRepository {
	static async searchByIds(ids: string[]) {
		return drizzleClient
			.select()
			.from(users)
			.where(inArray(users.id, ids))
	}

	static async searchById(id: string) {
		return drizzleClient
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
			.then((rows) => rows[0] || null)
	}
}