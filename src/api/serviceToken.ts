import { Type } from '@sinclair/typebox'
import { type ValidationError, validatedFetch } from './validatedFetch.js'
import type { FetchError } from './FetchError.js'

/**
 * @link https://api.nrfcloud.com/v1/#tag/Account/operation/GetServiceToken
 */
export const ServiceToken = Type.Object({
	token: Type.String(),
})

export const serviceToken =
	(
		{
			apiKey,
			endpoint,
		}: {
			apiKey: string
			endpoint: URL
		},
		fetchImplementation?: typeof fetch,
	): (() => Promise<
		{ error: FetchError | ValidationError } | { token: string }
	>) =>
	async () => {
		const vf = validatedFetch({ endpoint, apiKey }, fetchImplementation)
		const maybeResult = await vf(
			{ resource: 'account/service-token' },
			ServiceToken,
		)

		if ('error' in maybeResult) {
			return maybeResult
		}

		return maybeResult.result
	}
