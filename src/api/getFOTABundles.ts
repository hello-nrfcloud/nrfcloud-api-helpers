import { Type, type Static } from '@sinclair/typebox'
import type { ValidationError } from 'ajv'
import { validatedFetch } from './validatedFetch.js'
import { FwType } from './devices.js'

export const FOTABundle = Type.Object({
	bundleId: Type.String({
		minLength: 1,
		description: 'The ID of the bundle',
		examples: ['APP*20a4b75a*v1.1.1-debug'],
	}),
	lastModified: Type.Optional(
		Type.String({
			title: 'Timestamp',
			description: 'ISO-8601 date-time string',
			examples: ['2019-08-24T14:15:22Z'],
		}),
	),
	size: Type.Number({
		minimum: 0,
		description: 'Size of the bundle in bytes',
		examples: [418565],
	}),
	version: Type.String({ minLength: 1, examples: ['v1.1.1-debug'] }),
	type: Type.Enum(FwType, { title: 'Firmware Type' }),
	filenames: Type.Array(
		Type.String({
			minLength: 1,
			examples: ['hello-nrfcloud-thingy91-debug-v1.1.1-fwupd.bin'],
		}),
		{ description: 'The files in the bundle.' },
	),
	name: Type.Optional(
		Type.String({
			minLength: 1,
			title: 'Name',
			description: 'The name of the bundle',
			examples: ['hello.nrfcloud.com v1.1.1-debug'],
		}),
	),
	description: Type.Optional(
		Type.String({
			minLength: 1,
			title: 'Description',
			description: 'The description of the bundle',
			examples: ['Firmware Update Image BIN file (thingy91, debug)'],
		}),
	),
})

const FirmwaresType = Type.Object(
	{
		items: Type.Array(FOTABundle),
		total: Type.Integer({
			minimum: 0,
			description:
				'Reflects the total results returned by the query, which may be less than the total number of items available. If the response contains a pageNextToken value, you can supply the pageNextToken in the next request to get more results. The maximum value of total is the page limit of the request, or ten pages if no page limit is provided.',
		}),
		pageNextToken: Type.Optional(
			Type.String({
				minLength: 1,
				description:
					'Token used to retrieve the next page of items in the list. Present in a response only if the total available results exceeds the specified limit on a page. This token does not change between requests. When supplying as a request parameter, use URL-encoding.',
			}),
		),
	},
	{
		title: 'Firmware bundles',
		description:
			'Returns the list of firmware bundles. See https://api.nrfcloud.com/v1#tag/Firmware-Bundles/operation/ListFirmware',
	},
)

export const getFOTABundles =
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
	async (): Promise<
		| { error: Error | ValidationError }
		| { bundles: Array<Static<typeof FOTABundle>> }
	> => {
		const vf = validatedFetch(
			{
				endpoint,
				apiKey,
			},
			fetchImplementation,
		)
		return paginateFirmwares(vf)
	}

const paginateFirmwares = async (
	vf: ReturnType<typeof validatedFetch>,
	bundles: Array<Static<typeof FOTABundle>> = [],
	pageNextToken: string | undefined = undefined,
): Promise<
	| { error: Error | ValidationError }
	| { bundles: Array<Static<typeof FOTABundle>> }
> => {
	const query = new URLSearchParams({ pageLimit: '100' })
	if (pageNextToken !== undefined) query.set('pageNextToken', pageNextToken)
	const maybeBundles = await vf(
		{
			resource: `firmwares`,
			query,
		},
		FirmwaresType,
	)
	if ('error' in maybeBundles) return maybeBundles
	if (maybeBundles.result.pageNextToken !== undefined)
		return paginateFirmwares(
			vf,
			[...bundles, ...maybeBundles.result.items],
			maybeBundles.result.pageNextToken,
		)
	return { bundles: [...bundles, ...maybeBundles.result.items] }
}
