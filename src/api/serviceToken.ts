import { Type } from '@sinclair/typebox'
import { validatedFetch } from './validatedFetch.js'

/**
 * @link https://api.nrfcloud.com/v1/#tag/Account/operation/GetServiceToken
 */
export const ServiceToken = Type.Object({
	token: Type.String(),
})

export const serviceToken =
	(
		fetchImplementation?: typeof fetch,
		onError?: (error: Error) => void,
	): ((args: { apiEndpoint: URL; apiKey: string }) => Promise<string>) =>
	async ({ apiEndpoint, apiKey }) => {
		const vf = validatedFetch(
			{ endpoint: apiEndpoint, apiKey },
			fetchImplementation,
		)
		const maybeResult = await vf(
			{ resource: 'account/service-token' },
			ServiceToken,
		)

		if ('error' in maybeResult) {
			onError?.(maybeResult.error)
			throw maybeResult.error
		}

		return maybeResult.result.token
	}
