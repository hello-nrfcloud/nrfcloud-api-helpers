import { SSMClient } from '@aws-sdk/client-ssm'
import { get } from '@bifravst/aws-ssm-settings-helpers'
import { NRFCLOUD_ACCOUNT_SCOPE } from './scope.js'

export const getAllAccounts = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<string[]> => [
	...getAccountsFromAllSettings(
		await get(ssm)({
			stackName,
			scope: NRFCLOUD_ACCOUNT_SCOPE,
		})(),
	),
]

export const getAccountsFromAllSettings = (
	settings: Record<string, string>,
): Set<string> =>
	new Set(Object.keys(settings).map((key) => key.split('/')[0] as string))
