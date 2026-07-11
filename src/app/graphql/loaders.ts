import { UserRepository } from '#/user/user.repository'

export const loaders = {
	Tweet: {
		author: async (entries: { obj: { authorId: string } }[]) => {
			const ids = entries.map((entry) => entry.obj.authorId)

			const rows = await UserRepository.searchByIds(ids)

			const byId = new Map(rows.map((user) => [user.id, user]))

			return ids.map((id) => byId.get(id))
		},
	},
}
