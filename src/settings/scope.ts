export const NRFCLOUD_ACCOUNT_SCOPE = 'thirdParty'
const nameRx = /^[a-zA-Z0-9_.-]+$/

export const nrfCloudAccount = (account: string): string => {
	if (!nameRx.test(account)) throw new Error(`Invalid account name: ${account}`)
	return account
}
