import { Type } from '@sinclair/typebox'
import type { FetchError } from './FetchError.js'
import type { ValidationError } from './validatedFetch.js'
import { validatedFetch } from './validatedFetch.js'

export const getCurrentMonthlyCosts =
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
		| {
				error: FetchError | ValidationError
		  }
		| { currentMonthTotalCost: number }
	> => {
		const vf = validatedFetch({ endpoint, apiKey }, fetchImplementation)
		const maybeResult = await vf(
			{ resource: 'account' },
			Type.Object({
				plan: Type.Object({
					currentMonthTotalCost: Type.Number(), // e.g. 2.73
				}),
			}),
		)
		if ('error' in maybeResult) {
			return maybeResult
		}
		const currentMonthTotalCost = maybeResult.result.plan.currentMonthTotalCost

		return { currentMonthTotalCost }
	}
