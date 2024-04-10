import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { groupByAccount } from './groupByAccount.js'

void describe('groupByAccount()', () => {
	void it('should group settings by account', () =>
		assert.deepEqual(
			groupByAccount({
				'elite/accountDeviceClientId':
					'account-4db55163-7593-4d63-9679-d16fbc2d464f',
				'elite/healthCheckModel': 'PCA20035+solar',
				'acme/mqttEndpoint': 'mqtt.nrfcloud.com',
				'acme/teamId': 'f4ba6ede-7867-43eb-a495-7e0de108f52e',
			}),
			{
				acme: {
					mqttEndpoint: 'mqtt.nrfcloud.com',
					teamId: 'f4ba6ede-7867-43eb-a495-7e0de108f52e',
				},
				elite: {
					accountDeviceClientId: 'account-4db55163-7593-4d63-9679-d16fbc2d464f',
					healthCheckModel: 'PCA20035+solar',
				},
			},
		))
})
