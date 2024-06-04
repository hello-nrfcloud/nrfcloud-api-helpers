import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getLocationHistory } from './getLocationHistory.js'
import APIresponse from './test-data/location.json'
import { aString, arrayMatching, check, objectMatching } from 'tsmatchers'

await describe('getLocationHistory()', async () => {
	await it('return the location history', async () => {
		const res = await getLocationHistory(
			{
				endpoint: new URL('https://example.com/'),
				apiKey: 'some-key',
			},
			() =>
				Promise.resolve({
					ok: true,
					json: async () => Promise.resolve(APIresponse),
				}) as any,
		)({
			deviceId: 'oob-355025930003742',
		})
		assert.equal('error' in res, false)
		check('result' in res && res.result).is(
			objectMatching({
				items: arrayMatching([
					objectMatching({
						id: '3b45f2db-3b0c-4be8-be9a-273f12697fc4',
						deviceId: 'oob-355025930003742',
						serviceType: 'MCELL',
						insertedAt: '2024-06-04T09:54:52.651Z',
						uncertainty: '301',
						lat: '59.92335269',
						lon: '10.68829941',
						meta: {},
					}),
				]),
				total: 100,
				pageNextToken: aString,
			}) as any,
		)
	})
})
