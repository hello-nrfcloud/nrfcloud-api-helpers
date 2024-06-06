import { Type, type Static } from '@sinclair/typebox'
import type { ValidationError } from 'ajv'
import { validatedFetch } from './validatedFetch.js'
import { FwType } from './devices.js'

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
		name: Type.Optional(Type.String({ minLength: 1 })),
		description: Type.Optional(Type.String({ minLength: 1 })),
		createdAt: ts,
		lastUpdatedAt: Type.Optional(ts),
		completedAt: Type.Optional(ts),
		firmware: Type.Optional(
			Type.Object({
				bundleId: Type.String({
					minLength: 1,
					examples: ['APP*439ddbc7*v2.0.0'],
				}),
				fileSize: Type.Number({ minimum: 1, examples: [385068] }),
				firmwareType: Type.Enum(FwType, { title: 'Firmware Type' }),
				host: Type.String({
					minLength: 1,
					examples: ['firmware.nrfcloud.com'],
				}),
				uris: Type.Array(
					Type.String({
						minLength: 1,
						examples: [
							'bbfe6b73-a46a-43ad-94bd-8e4b4a7847ce/APP*439ddbc7*v2.0.0/hello-nrfcloud-thingy91-v2.0.0-fwupd.bin',
						],
					}),
				),
				version: Type.String({ minLength: 1, examples: ['v2.0.0'] }),
			}),
		),
		target: Type.Optional(
			Type.Object({
				deviceIds: Type.Array(
					Type.String({
						minLength: 1,
						title: 'Device ID',
						examples: ['oob-358299840021360'],
					}),
				),
				tags: Type.Array(
					Type.String({ minLength: 1, title: 'Tag', examples: ['nrf9160'] }),
				),
			}),
		),
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
