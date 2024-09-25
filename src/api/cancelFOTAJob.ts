import { Type } from '@sinclair/typebox'
import type { FetchError } from './FetchError.js'
import type { ValidationError } from './validatedFetch.js'
import { validatedFetch } from './validatedFetch.js'

export const cancelFOTAJob =
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
	async (
		jobId: string,
	): Promise<{ error: FetchError | ValidationError } | { success: true }> => {
		const maybeSuccess = await validatedFetch(
			{
				endpoint,
				apiKey,
			},
			fetchImplementation,
		)(
			{
				resource: `fota-jobs/${jobId}/cancel`,
				method: 'PUT',
			},
			Type.Any(),
		)

		if ('error' in maybeSuccess) return maybeSuccess
		return { success: true }
	}
