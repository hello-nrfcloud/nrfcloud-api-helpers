import { validateWithTypeBox } from '@hello.nrfcloud.com/proto'
import { type Static, type TSchema } from '@sinclair/typebox'
import type { ValueError } from '@sinclair/typebox/compiler'
import type { FetchError } from './FetchError.js'
import { toFetchError } from './FetchError.js'
import { slashless } from './slashless.js'

export class ValidationError extends Error {
	public errors: ValueError[]
	public readonly isValidationError = true
	constructor(errors: ValueError[]) {
		super(`Validation errors`)
		this.name = 'ValidationError'
		this.errors = errors
	}
}

const validate = <T extends TSchema>(
	SchemaObject: T,
	data: unknown,
): Static<T> => {
	const maybeData = validateWithTypeBox(SchemaObject)(data)

	if ('errors' in maybeData) {
		console.error('Validation failed', { error: maybeData.errors })
		throw new ValidationError(maybeData.errors)
	}

	return maybeData.value
}

const fetchData =
	(fetchImplementation?: typeof fetch) =>
	async (...args: Parameters<typeof fetch>): Promise<unknown> => {
		const response = await (fetchImplementation ?? fetch)(...args)
		if (!response.ok) throw await toFetchError(response)
		if (response.headers?.get('content-length') === '0') return undefined
		return response.json()
	}

export const validatedFetch =
	(
		{ endpoint, apiKey }: { apiKey: string; endpoint: URL },
		fetchImplementation?: typeof fetch,
	) =>
	async <Schema extends TSchema>(
		params: (
			| {
					resource: string
			  }
			| {
					resource: string
					payload: Payload
			  }
			| {
					resource: string
					method: string
			  }
		) & { query?: URLSearchParams },
		schema: Schema,
	): Promise<
		{ error: FetchError | ValidationError } | { result: Static<Schema> }
	> => {
		const { resource, query } = params
		const args: Parameters<typeof fetch>[1] = {
			headers: headers(apiKey),
		}
		if ('payload' in params) {
			const payload = params.payload
			args.method = 'POST'
			args.body = payload.body
			args.headers = { ...(args.headers ?? {}), ['Content-Type']: payload.type }
		} else if ('method' in params) {
			args.method = params.method
		}
		return fetchData(fetchImplementation)(
			`${slashless(endpoint)}/v1/${resource}${query !== undefined ? `?${query.toString()}` : ''}`,
			args,
		)
			.then((res) => ({ result: validate(schema, res) }))
			.catch((error: FetchError): { error: FetchError | ValidationError } => ({
				error,
			}))
	}

const headers = (apiKey: string) => ({
	Authorization: `Bearer ${apiKey}`,
	Accept: 'application/json; charset=utf-8',
})

type Payload = {
	/** The content-type of body */
	type: string
	body: string
}
export const JSONPayload = (payload: Record<string, unknown>): Payload => ({
	type: 'application/json',
	body: JSON.stringify(payload),
})
