import { Type, type TSchema, type Static } from '@sinclair/typebox'
import { slashless } from './slashless.js'
import { type ValidationError, validatedFetch } from './validatedFetch.js'
import { DeviceShadow } from './DeviceShadow.js'

const Page = <T extends TSchema>(Item: T) =>
	Type.Object({
		total: Type.Integer(),
		items: Type.Array(Item),
	})
const Devices = Page(DeviceShadow)

/**
 * @link https://api.nrfcloud.com/v1/#tag/IP-Devices/operation/ProvisionDevices
 */
const ProvisionDevice = Type.Object({
	bulkOpsRequestId: Type.String(),
})

/**
 * firmware types supported by a device for FOTA
 */
export enum FwType {
	APP = 'APP',
	MODEM = 'MODEM',
	BOOT = 'BOOT',
	SOFTDEVICE = 'SOFTDEVICE',
	BOOTLOADER = 'BOOTLOADER',
	MDM_FULL = 'MDM_FULL',
}

export const devices = (
	{
		endpoint,
		apiKey,
	}: {
		endpoint: URL
		apiKey: string
	},
	fetchImplementation?: typeof fetch,
): {
	list: () => Promise<
		{ error: Error | ValidationError } | { result: Static<typeof Devices> }
	>
	get: (
		id: string,
	) => Promise<
		{ error: Error | ValidationError } | { result: Static<typeof DeviceShadow> }
	>
	updateState: (
		id: string,
		state: {
			desired?: Record<string, any>
			reported?: Record<string, any>
		},
	) => Promise<{ error: Error } | { success: boolean }>
	register: (
		devices: {
			// A globally unique device id (UUIDs are highly recommended)	/^[a-z0-9:_-]{1,128}$/i
			deviceId: string
			// A unique ES256 X.509 certificate in PEM format, wrapped in double quotes (to allow for line breaks in CSV)	/^-{5}BEGIN CERTIFICATE-{5}(\r\n|\r|\n)([^-]+)(\r\n|\r|\n)-{5}END CERTIFICATE-{5}(\r\n|\r|\n)$/
			certPem: string
			// A custom device type (for example humidity-sensor) to help you better recognize or categorize your devices. Include "gateway" in your subType if you want to provision it as a Gateway. This will give the device additional MQTT permissions for gateway-related topics. Otherwise, it is provisioned as a Generic device.	/[a-zA-Z0-9_.,@\/:#-]{0,799}/
			subType?: string
			// A list of pipe-delimited tags to create groups of devices (e.g., warehouse|sensor|east)	Each tag: /^[a-zA-Z0-9_.@:#-]+$/
			tags?: string[]
			/**
			 * A list of pipe-delimited firmware types that each device supports for FOTA (e.g., APP|MODEM)
			 *
			 * Defaults to all supported (APP|MODEM|BOOT|SOFTDEVICE|BOOTLOADER|MDM_FULL)
			 *
			 * @default 'APP|MODEM|BOOT|SOFTDEVICE|BOOTLOADER|MDM_FULL'
			 */
			fwTypes?: FwType[]
		}[],
	) => Promise<{ error: Error } | { bulkOpsRequestId: string }>
} => {
	const headers = {
		Authorization: `Bearer ${apiKey}`,
		Accept: 'application/json; charset=utf-8',
	}
	const vf = validatedFetch({ endpoint, apiKey }, fetchImplementation)
	return {
		// FIXME: implement pagination
		list: async () =>
			vf(
				{
					resource: `devices?${new URLSearchParams({
						pageLimit: '100',
						deviceNameFuzzy: 'oob-',
					}).toString()}`,
				},
				Devices,
			),
		get: async (id) =>
			vf({ resource: `devices/${encodeURIComponent(id)}` }, DeviceShadow),
		updateState: async (id, state) =>
			fetch(
				`${slashless(endpoint)}/v1/devices/${encodeURIComponent(id)}/state`,
				{
					headers: {
						...headers,
						'Content-Type': 'application/json',
					},
					method: 'PATCH',
					body: JSON.stringify(state),
				},
			).then((res) => {
				if (res.status >= 400)
					return { error: new Error(`Update failed: ${res.status}`) }
				return { success: true }
			}),
		register: async (devices) => {
			const bulkRegistrationPayload = devices
				.map(({ deviceId, subType, tags, fwTypes, certPem }) => {
					const deviceFwTypes = fwTypes ?? Object.values(FwType)
					return [
						[
							deviceId,
							subType ?? '',
							(tags ?? []).join('|'),
							deviceFwTypes.join('|'),
							`"${certPem}"`,
						],
					]
				})
				.map((cols) => cols.join(','))
				.join('\n')

			const maybeResult = await vf(
				{
					resource: 'devices',
					payload: {
						body: bulkRegistrationPayload,
						type: 'application/octet-stream',
					},
				},
				ProvisionDevice,
			)

			if ('error' in maybeResult) {
				return {
					error: maybeResult.error,
				}
			}

			return { bulkOpsRequestId: maybeResult.result.bulkOpsRequestId }
		},
	}
}
