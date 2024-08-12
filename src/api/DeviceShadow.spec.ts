import { validateWithTypeBox } from '@hello.nrfcloud.com/proto'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DeviceShadow } from './DeviceShadow.js'

void describe('DeviceShadow type', () => {
	void it('should document the device shadow object', () => {
		const res = validateWithTypeBox(DeviceShadow)({
			id: 'some-device',
			state: {
				version: 42,
				reported: {
					dev: {
						v: {
							imei: '358299840016535',
							iccid: '89450421180216254864',
							modV: 'mfw_nrf91x1_2.0.0-77.beta',
							brdV: 'thingy91x_nrf9161',
							appV: '0.0.0-development',
						},
						ts: 1697102116821,
					},
				},
				metadata: {
					dev: {
						v: {
							imei: { timestamp: 1697102116821 },
							iccid: { timestamp: 1697102116821 },
							modV: { timestamp: 1697102116821 },
							brdV: { timestamp: 1697102116821 },
							appV: { timestamp: 1697102116821 },
						},
						ts: {
							timestamp: 1697102116821,
						},
					},
				},
			},
			$meta: {
				updatedAt: '2023-04-20T07:29:46.467Z',
				createdAt: '2023-04-19T11:49:07.370Z',
			},
		})
		assert.equal('errors' in res, false)
	})
})
