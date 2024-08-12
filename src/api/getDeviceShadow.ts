import { Type, type Static } from '@sinclair/typebox'
import { DeviceShadow } from './DeviceShadow.js'
import type { FetchError } from './FetchError.js'
import type { ValidationError } from './validatedFetch.js'
import { validatedFetch } from './validatedFetch.js'

const DeviceShadows = Type.Array(DeviceShadow)

/**
 * @see https://api.nrfcloud.com/v1#tag/All-Devices/operation/ListDevices
 */
const ListDevices = Type.Object({
	items: DeviceShadows,
	total: Type.Optional(Type.Number({ minimum: 0 })),
	pageNextToken: Type.Optional(Type.String({ minLength: 1 })),
})

export const getDeviceShadow = (
	{
		endpoint,
		apiKey,
	}: {
		endpoint: URL
		apiKey: string
	},
	fetchImplementation?: typeof fetch,
): ((
	devices: string[],
) => Promise<
	| { shadows: Static<typeof DeviceShadows> }
	| { error: FetchError | ValidationError }
>) => {
	const vf = validatedFetch({ endpoint, apiKey }, fetchImplementation)

	return async (devices) => {
		const params = {
			includeState: true,
			includeStateMeta: true,
			pageLimit: 100,
			deviceIds: devices.join(','),
		}
		const queryString = Object.entries(params)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map((kv) => kv.map(encodeURIComponent).join('='))
			.join('&')
		const url = `devices?${queryString}`

		const maybeResult = await vf({ resource: url }, ListDevices)
		if ('error' in maybeResult) {
			return { error: maybeResult.error }
		}

		return { shadows: maybeResult.result.items }
	}
}
