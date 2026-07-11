import { randomUUID } from 'node:crypto'
import { GraphQLError } from 'graphql'
import { supabaseClient, supabaseBucket } from '#/shared/supabase-client'

export async function storeFile(file: any): Promise<string> {
	const path = `${randomUUID()}-${file.name}`
	const buffer = Buffer.from(await file.arrayBuffer())

	const { error } = await supabaseClient.storage
		.from(supabaseBucket)
		.upload(path, buffer, {
			contentType: file.type || 'application/octet-stream',
		})

	if (error) {
		throw new GraphQLError(`Failed to upload file: ${error.message}`)
	}

	const { data } = supabaseClient.storage
		.from(supabaseBucket)
		.getPublicUrl(path)

	return data.publicUrl
}
