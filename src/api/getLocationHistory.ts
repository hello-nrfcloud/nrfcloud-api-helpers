import { Type, type Static } from '@sinclair/typebox'
import type { ValidationError } from './validatedFetch.js'
import { validatedFetch } from './validatedFetch.js'
import type { FetchError } from './FetchError.js'

export enum LocationHistoryServiceType {
	ANCHOR = 'ANCHOR',
	GNSS = 'GNSS',
	GPS = 'GPS',
	MCELL = 'MCELL',
	MCELL_EVAL = 'MCELL_EVAL',
	SCELL = 'SCELL',
	SCELL_EVAL = 'SCELL_EVAL',
	WIFI = 'WIFI',
	WIFI_EVAL = 'WIFI_EVAL',
}

const LocationHistoryType = Type.Object(
	{
		items: Type.Array(
			Type.Object({
				id: Type.String({
					minLength: 1,
					title: 'ID',
					description: 'Universally unique identifier',
					examples: ['bc631093-7f7c-4c1b-aa63-a68c759bcd5c'],
				}),
				deviceId: Type.String({
					minLength: 1,
					title:
						'This is the canonical device id used in the device certificate, and as the MQTT client id.',
					examples: ['nrf-1234567890123456789000'],
				}),
				serviceType: Type.Enum(LocationHistoryServiceType, {
					title: 'Tracker Service Type',
					description:
						'This is the service used to obtain the location of a device. The "_EVAL" suffix means the location was obtained using an evaluation token. GNSS location is derived on the device and reported back to the cloud. "GPS" type has been deprecated, but will still return for older records.',
					examples: ['location'],
				}),
				insertedAt: Type.String({
					title: 'Insertion Time',
					description:
						'HTML-encoded ISO-8601 date-time string denoting the start or end of a date range. If the string includes only a date, the time is the beginning of the day (00:00:00).',
					examples: ['2021-08-31T20:00:00Z'],
				}),
				lat: Type.String({
					minLength: 1,
					examples: ['63.41999531'],
					description: 'Latitude in degrees',
				}),
				lon: Type.String({
					minLength: 1,
					examples: ['-122.688408'],
					description: 'Longitude in degrees',
				}),
				meta: Type.Record(Type.String({ minLength: 1 }), Type.Any(), {
					title: 'GNSS metatdata',
					description:
						'Metadata sent from device when reporting GNSS location in PVT format. Can include other non-gnss related key/value pairs for easy retrieval later. Only populated for GNSS PVT formatted fixes, empty object otherwise.',
				}),
				uncertainty: Type.RegExp(/^[0-9.]+$/, {
					title: 'Uncertainty',
					description:
						'Radius of the uncertainty circle around the location in meters. Also known as Horizontal Positioning Error (HPE).',
					examples: ['2420', '13.012'],
				}),
				anchors: Type.Optional(
					Type.Array(
						Type.Object({
							macAddress: Type.RegExp(/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i, {
								title: 'Mac Address',
								description:
									'String comprised of 6 hexadecimal pairs, separated by colons or dashes. When used in a positioning request, it must be universally assigned. See this help page for details.',
								examples: ['FE:1E:41:2D:9E:53'],
							}),
							name: Type.Optional(
								Type.RegExp(/^[a-z0-9_ -]{1,32}$/i, {
									title: 'Name',
									description:
										'Limit 32 characters. Only numbers, letters, underscores, dashes, and spaces allowed. All other characters will be removed.',
									examples: ['anchor-1'],
								}),
							),
						}),
					),
				),
			}),
		),
		total: Type.Number({ minimum: 0 }),
		pageNextToken: Type.Optional(Type.String({ minLength: 1 })),
	},
	{
		title: 'Location History',
		description:
			'See https://api.nrfcloud.com/v1#tag/Location-History/operation/GetLocationHistory',
	},
)
export type LocationHistory = Static<typeof LocationHistoryType>

export const getLocationHistory =
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
	async ({
		deviceId,
		pageNextToken,
		start,
		end,
	}: {
		deviceId: string
		pageNextToken?: string
		start?: Date
		end?: Date
	}): Promise<
		| { error: FetchError | ValidationError }
		| { result: Static<typeof LocationHistoryType> }
	> => {
		const query = new URLSearchParams({
			pageLimit: '100',
			deviceId,
		})
		if (start !== undefined) query.set('start', start.toISOString())
		if (end !== undefined) query.set('end', end.toISOString())
		if (pageNextToken !== undefined) query.set('pageNextToken', pageNextToken)
		const maybeHistory = await validatedFetch(
			{
				endpoint,
				apiKey,
			},
			fetchImplementation,
		)(
			{
				resource: 'location/history',
				query,
			},
			LocationHistoryType,
		)

		if ('error' in maybeHistory) return maybeHistory
		return maybeHistory
	}
