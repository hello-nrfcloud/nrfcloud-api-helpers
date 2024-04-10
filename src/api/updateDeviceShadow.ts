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
	): Promise<MaybeOK> => {
		const res = await (fetchImplementation ?? fetch)(
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
		if (res.ok) return { ok: true }
		return {
			error: new Error(
				`Update device status for ${deviceId} failed: ${res.status} (${await res.text()})`,
			),
		}
	}

export type MaybeOK = { error: Error } | { ok: true }
