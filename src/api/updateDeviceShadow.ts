import { slashless } from './slashless.js'

export const updateDeviceShadow =
	(
		{
			endpoint,
			apiKey,
		}: {
			endpoint: URL
			apiKey: string
		},
		fetchImplementation?: typeof fetch,
	) =>
	async (
		deviceId: string,
		state: {
			desired?: Record<string, any>
			reported?: Record<string, any>
		},
	): Promise<void> => {
		await (fetchImplementation ?? fetch)(
			new URL(
				`${slashless(endpoint)}/v1/devices/${encodeURIComponent(
					deviceId,
				)}/state`,
			),
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify(state),
			},
		)
	}
