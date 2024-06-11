import { Type, type Static } from '@sinclair/typebox'
import { type ValidationError, validatedFetch } from './validatedFetch.js'
import type { FetchError } from './FetchError.js'

/**
 * @link https://api.nrfcloud.com/v1/#tag/Bulk-Ops-Requests/operation/FetchBulkOpsRequest
 */
export const BulkOpsRequestType = Type.Object({
	bulkOpsRequestId: Type.String(), // e.g. '01EZZJVDQJPWT7V4FWNVDHNMM5'
	status: Type.Union([
		Type.Literal('PENDING'),
		Type.Literal('IN_PROGRESS'),
		Type.Literal('FAILED'),
		Type.Literal('SUCCEEDED'),
	]),
})

export const bulkOpsRequests =
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
		bulkOpsId: string,
	): Promise<
		| { error: FetchError | ValidationError }
		| { result: Static<typeof BulkOpsRequestType> }
	> => {
		const vf = validatedFetch({ endpoint, apiKey }, fetchImplementation)
		return vf(
			{
				resource: `bulk-ops-requests/${encodeURIComponent(bulkOpsId)}`,
			},
			BulkOpsRequestType,
		)
	}
