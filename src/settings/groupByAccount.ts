import { getAccountsFromAllSettings } from './getAllAccounts.js'

export const groupByAccount = (
	allSettings: Record<string, string>,
): Record<string, Record<string, string>> => {
	const accounts = getAccountsFromAllSettings(allSettings)

	return [...accounts].reduce(
		(allAccountSettings, account) => ({
			...allAccountSettings,
			[account]: Object.entries(allSettings)
				.filter(([k]) => k.startsWith(`${account}/`))
				.map<[string, string]>(([k, v]) => [
					k.replace(new RegExp(`^${account}/`), ''),
					v,
				])
				.reduce((s, [k, v]) => ({ ...s, [k]: v }), {}),
		}),
		{},
	)
}
