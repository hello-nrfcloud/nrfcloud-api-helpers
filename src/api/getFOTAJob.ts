import { Type, type Static } from '@sinclair/typebox'
import type { ValidationError } from 'ajv'
import { validatedFetch } from './validatedFetch.js'

export enum FOTAJobStatus {
	CREATED = 'CREATED',
	IN_PROGRESS = 'IN_PROGRESS',
	CANCELLED = 'CANCELLED',
	DELETION_IN_PROGRESS = 'DELETION_IN_PROGRESS',
	COMPLETED = 'COMPLETED',
}

const ts = Type.String({
	title: 'Timestamp',
	description: 'ISO-8601 date-time string',
	examples: ['2019-08-24T14:15:22Z'],
})

export const FOTAJobType = Type.Object(
	{
		jobId: Type.String({
			minLength: 1,
			title: 'ID',
			description: 'Universally unique identifier',
			examples: ['bc631093-7f7c-4c1b-aa63-a68c759bcd5c'],
		}),
		status: Type.Enum(FOTAJobStatus, {
			title: 'Status',
			description: 'Current status of the job',
		}),
		statusDetail: Type.Optional(Type.String({ minLength: 1 })),
		createdAt: ts,
		lastUpdatedAt: Type.Optional(ts),
		completedAt: Type.Optional(ts),
	},
	{
		title: 'FOTA Job',
		description:
			'See https://api.nrfcloud.com/#tag/FOTA-Jobs/operation/FetchFOTAJob',
	},
)
export const getFOTAJob =
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
		jobId,
	}: {
		jobId: string
	}): Promise<
		{ error: Error | ValidationError } | { result: Static<typeof FOTAJobType> }
	> => {
		const maybeJob = await validatedFetch(
			{
				endpoint,
				apiKey,
			},
			fetchImplementation,
		)(
			{
				resource: `fota-jobs/${jobId}`,
			},
			FOTAJobType,
		)

		if ('error' in maybeJob) return maybeJob
		return maybeJob
	}
