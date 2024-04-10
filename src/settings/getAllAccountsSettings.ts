import { SSMClient } from '@aws-sdk/client-ssm'
import { get } from '@bifravst/aws-ssm-settings-helpers'
import { NRFCLOUD_ACCOUNT_SCOPE } from './scope.js'
import { groupByAccount } from './groupByAccount.js'
import { validateSettings, type Settings } from './settings.js'

/**
 * Returns settings for all accounts
 */
export const getAllAccountsSettings = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<Record<string, Settings>> =>
	Object.entries(
		groupByAccount(
			await get(ssm)({
				stackName,
				scope: NRFCLOUD_ACCOUNT_SCOPE,
			})(),
		),
	).reduce(
		(allSettings, [account, settings]) => ({
			...allSettings,
			[account]: validateSettings(settings),
		}),
		{},
	)
