import { Type, type Static } from '@sinclair/typebox'
import type { FetchError } from './FetchError.js'
import type { ValidationError } from './validatedFetch.js'
import { JSONPayload, validatedFetch } from './validatedFetch.js'

export const CreateFOTAJobType = Type.Object(
	{
		jobId: Type.String({
			minLength: 1,
			title: 'ID',
			description: 'Universally unique identifier',
			examples: ['bc631093-7f7c-4c1b-aa63-a68c759bcd5c'],
		}),
	},
	{
		title: 'FOTA Job',
		description:
			'See https://api.nrfcloud.com/#tag/FOTA-Jobs/operation/CreateFOTAJob',
	},
)
export const createFOTAJob =
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
		bundleId,
	}: {
		deviceId: string
		bundleId: string
	}): Promise<
		| { error: FetchError | ValidationError }
		| { result: Static<typeof CreateFOTAJobType> }
	> => {
		const maybeJob = await validatedFetch(
			{
				endpoint,
				apiKey,
			},
			fetchImplementation,
		)(
			{
				resource: 'fota-jobs',
				payload: JSONPayload({
					bundleId,
					autoApply: true,
					deviceIdentifiers: [deviceId],
				}),
			},
			CreateFOTAJobType,
		)

		if ('error' in maybeJob) return maybeJob
		return maybeJob
	}
