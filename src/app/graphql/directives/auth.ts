import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { defaultFieldResolver } from 'graphql/execution/execute'
import { GraphQLError } from 'graphql'

const directiveName = 'auth'

export function auth() {
	return (schema: any) =>
		mapSchema(schema, {
			[MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
				const authDirective = getDirective(
					schema,
					fieldConfig,
					directiveName,
				)?.[0]

				if (authDirective) {
					const { requires: enabledRoles } = authDirective

					if (enabledRoles) {
						const { resolve = defaultFieldResolver } = fieldConfig

						fieldConfig.resolve = async (source, args, context, info) => {
							if (!context.user) {
								throw new GraphQLError(
									'Debes iniciar sesión para realizar esta acción',
									{
										extensions: { code: 'UNAUTHENTICATED' },
									},
								)
							}

							const userRole = context.user.role?.toUpperCase()

							if (!enabledRoles.includes(userRole)) {
								throw new GraphQLError(
									'No tienes permisos para realizar esta acción',
									{
										extensions: { code: 'FORBIDDEN' },
									},
								)
							}

							return resolve(source, args, context, info)
						}
					}
				}
			},
		})
}
