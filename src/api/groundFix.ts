import {
	accuracy as TAccuracy,
	lat as TLat,
	lng as TLng,
} from '@hello.nrfcloud.com/proto/hello'
import { Type, type Static } from '@sinclair/typebox'
import {
	JSONPayload,
	ValidationError,
	validatedFetch,
} from './validatedFetch.js'

/**
 * @link https://api.nrfcloud.com/v1/#tag/Ground-Fix
 */
export const GroundFixType = Type.Object({
	lat: TLat, // 63.41999531
	lon: TLng, // 10.42999506
	uncertainty: TAccuracy, // 2420
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
		mcc: string
		mnc: string
		eci: number
		tac: number
		rsrp: number
	}): Promise<
		| { error: Error | ValidationError }
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
