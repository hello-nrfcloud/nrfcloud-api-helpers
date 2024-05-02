import { Type, type Static } from '@sinclair/typebox'

/**
 * @link https://api.nrfcloud.com/v1/#tag/All-Devices/operation/ListDevices
 */
export const DeviceShadow = Type.Object({
	id: Type.String(),
	$meta: Type.Object({
		createdAt: Type.String({
			minLength: 1,
			examples: ['2019-08-24T14:15:22Z'],
		}),
		updatedAt: Type.String({
			minLength: 1,
			examples: ['2019-08-24T14:15:22Z'],
		}),
	}),
	state: Type.Object({
		reported: Type.Record(Type.String({ minLength: 1 }), Type.Any()),
		desired: Type.Optional(
			Type.Record(Type.String({ minLength: 1 }), Type.Any()),
		),
		version: Type.Number(),
	}),
})

export type DeviceShadowType = Static<typeof DeviceShadow>