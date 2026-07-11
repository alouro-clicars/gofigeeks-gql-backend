export const tweets = (authorIds: string[]) => [
	{
		id: crypto.randomUUID(),
		content: 'Acabo de terminar mi primera Query en GraphQL 🚀',
		likes: 42,
		createdAt: new Date(),
		authorId: authorIds[0 % authorIds.length],
	},
	{
		id: crypto.randomUUID(),
		content: 'Drizzle ORM + GraphQL Yoga es una combinación genial',
		likes: 17,
		createdAt: new Date(),
		authorId: authorIds[1 % authorIds.length],
	},
	{
		id: crypto.randomUUID(),
		content: 'Aprendiendo sobre resolvers y tipos en GraphQL',
		likes: 8,
		createdAt: new Date(),
		authorId: authorIds[2 % authorIds.length],
	},
]
