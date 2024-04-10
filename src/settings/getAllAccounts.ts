import { SSMClient } from '@aws-sdk/client-ssm'
import { Scopes } from './scope.js'
import { get } from '@bifravst/aws-ssm-settings-helpers'

export const getAllAccounts = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<string[]> => [
	...new Set(
		Object.keys(
			await get(ssm)({
				stackName,
				scope: Scopes.NRFCLOUD_ACCOUNT_PREFIX,
			})(),
		).map((key) => key.split('/')[0] as string),
	),
]
