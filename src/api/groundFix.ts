import { Type, type Static } from '@sinclair/typebox'
import {
	JSONPayload,
	type ValidationError,
	validatedFetch,
} from './validatedFetch.js'
import type { FetchError } from './FetchError.js'

export const lat = Type.Number({
	minimum: -90,
	maximum: 90,
	description: 'Latitude in degrees',
})
export const lng = Type.Number({
	minimum: -180,
	maximum: 180,
	description: 'Longitude in degrees',
})
export const accuracy = Type.Number({
	minimum: 0,
	description: 'HPE (horizontal positioning error) in meters',
})

/**
 * @link https://api.nrfcloud.com/v1/#tag/Ground-Fix
 */
export const GroundFixType = Type.Object({
	lat, // 63.41999531
	lon: lng, // 10.42999506
	uncertainty: accuracy, // 2420
	fulfilledWith: Type.Literal('SCELL'),
})

export const groundFix =
	(
		{
			apiKey,
			endpoint,
		}: {
			apiKey: string
			endpoint: URL
		},
		fetchImplementation?: typeof fetch,
	) =>
	async (cell: {
		mcc: number
		mnc: string
		eci: number
		tac: number
		rsrp?: number
	}): Promise<
		| { error: FetchError | ValidationError }
		| { result: Static<typeof GroundFixType> }
	> => {
		const vf = validatedFetch({ endpoint, apiKey }, fetchImplementation)
		return vf(
			{
				resource: 'location/ground-fix',
				payload: JSONPayload({
					lte: [cell],
				}),
			},
			GroundFixType,
		)
	}
