import { SSMClient } from '@aws-sdk/client-ssm'
import { get } from '@bifravst/aws-ssm-settings-helpers'
import { getAccountsFromAllSettings } from './getAllAccounts.js'
import { validateSettings, type Settings } from './settings.js'
import { NRFCLOUD_ACCOUNT_SCOPE } from './scope.js'

/**
 * Returns settings for all accounts
 */
export const getAllAccountSettings = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<Record<string, Settings>> => {
	const allSettings = await get(ssm)({
		stackName,
		scope: NRFCLOUD_ACCOUNT_SCOPE,
	})()

	const accounts = getAccountsFromAllSettings(allSettings)

	return [...accounts].reduce(
		(allAccountSettings, account) => ({
			...allAccountSettings,
			[account]: validateSettings(
				Object.entries(allSettings)
					.filter(([k]) => k.startsWith(`${account}/`))
					.map<[string, string]>(([k, v]) => [
						k.replace(new RegExp(`^${account}/`), ''),
						v,
					])
					.reduce((s, [k, v]) => ({ ...s, [k]: v }), {}),
			),
		}),
		{},
	)
}

console.log(
	await getAllAccountSettings({
		ssm: new SSMClient(),
		stackName: 'hello-nrfcloud-backend',
	}),
)
