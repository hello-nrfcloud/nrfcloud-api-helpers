import type { SSMClient } from '@aws-sdk/client-ssm'
import {
	remove as deleteSSMSettings,
	get as getSSMSettings,
	put as putSSMSettings,
} from '@bifravst/aws-ssm-settings-helpers'
import { NRFCLOUD_ACCOUNT_SCOPE, nrfCloudAccount } from './scope.js'

export const defaultApiEndpoint = new URL('https://api.nrfcloud.com')
export const defaultCoAPEndpoint = new URL('coaps://coap.nrfcloud.com')

export type Settings = {
	apiEndpoint: URL
	apiKey: string
	accountDeviceClientCert: string
	accountDevicePrivateKey: string
	accountDeviceClientId: string
	mqttEndpoint: string
	mqttTopicPrefix: string
	coapEndpoint: URL
	coapPort: number
}

export const getSettings = ({
	ssm,
	stackName,
	account,
}: {
	ssm: SSMClient
	stackName: string
	account: string
}): (() => Promise<Settings>) => {
	const settingsReader = getSSMSettings(ssm)({
		stackName,
		scope: NRFCLOUD_ACCOUNT_SCOPE,
		context: nrfCloudAccount(account),
	})
	return async (): Promise<Settings> => validateSettings(await settingsReader())
}

export const getAPISettings = ({
	ssm,
	stackName,
	account,
}: {
	ssm: SSMClient
	stackName: string
	account: string
}): (() => Promise<Pick<Settings, 'apiKey' | 'apiEndpoint'>>) => {
	const settingsReader = getSSMSettings(ssm)({
		stackName,
		scope: NRFCLOUD_ACCOUNT_SCOPE,
		context: nrfCloudAccount(account),
	})
	return async (): Promise<Pick<Settings, 'apiKey' | 'apiEndpoint'>> => {
		const p = await settingsReader()
		const { apiEndpoint, apiKey } = p
		if (apiKey === undefined)
			throw new Error(`No nRF Cloud API key configured!`)

		return {
			apiEndpoint:
				apiEndpoint === undefined ? defaultApiEndpoint : new URL(apiEndpoint),
			apiKey,
		}
	}
}

export const putSettings = ({
	ssm,
	stackName,
	account,
}: {
	ssm: SSMClient
	stackName: string
	account: string
}): ((settings: Partial<Settings>) => Promise<void>) => {
	const settingsWriter = putSSMSettings(ssm)({
		stackName,
		scope: NRFCLOUD_ACCOUNT_SCOPE,
		context: nrfCloudAccount(account),
	})
	return async (settings): Promise<void> => {
		await Promise.all(
			Object.entries(settings).map(async ([k, v]) =>
				settingsWriter({
					property: k,
					value: v.toString(),
				}),
			),
		)
	}
}

export const putSetting = ({
	ssm,
	stackName,
	account,
}: {
	ssm: SSMClient
	stackName: string
	account: string
}): ((
	property: keyof Settings,
	value: string,
	deleteBeforeUpdate: boolean,
) => ReturnType<typeof settingsWriter>) => {
	const settingsWriter = putSSMSettings(ssm)({
		stackName,
		scope: NRFCLOUD_ACCOUNT_SCOPE,
		context: nrfCloudAccount(account),
	})
	return async (property, value, deleteBeforeUpdate) =>
		settingsWriter({
			property,
			value,
			deleteBeforeUpdate,
		})
}

export const deleteSettings = ({
	ssm,
	stackName,
	account,
}: {
	ssm: SSMClient
	stackName: string
	account: string
}): ((property: string) => ReturnType<typeof settingsDeleter>) => {
	const settingsDeleter = deleteSSMSettings(ssm)({
		stackName,
		scope: NRFCLOUD_ACCOUNT_SCOPE,
		context: nrfCloudAccount(account),
	})
	return async (property) => settingsDeleter({ property })
}

export const validateSettings = (p: Record<string, string>): Settings => {
	const {
		apiEndpoint,
		apiKey,
		accountDeviceClientCert,
		accountDevicePrivateKey,
		mqttEndpoint,
		accountDeviceClientId,
		mqttTopicPrefix,
		coapEndpoint,
		coapPort,
	} = p
	if (apiKey === undefined) throw new Error(`No nRF Cloud API key configured!`)
	if (accountDeviceClientCert === undefined)
		throw new Error(`No nRF Cloud account device clientCert configured!`)
	if (accountDevicePrivateKey === undefined)
		throw new Error(`No nRF Cloud account device privateKey configured!`)
	if (accountDeviceClientId === undefined)
		throw new Error(`No nRF Cloud Account Device client ID configured!`)
	if (mqttTopicPrefix === undefined)
		throw new Error(`No nRF Cloud MQTT topic prefix configured!`)
	if (mqttEndpoint === undefined)
		throw new Error(`No nRF Cloud MQTT endpoint configured!`)

	return {
		apiEndpoint:
			apiEndpoint === undefined ? defaultApiEndpoint : new URL(apiEndpoint),
		apiKey,
		mqttEndpoint,
		accountDeviceClientCert,
		accountDevicePrivateKey,
		accountDeviceClientId,
		mqttTopicPrefix,
		coapEndpoint:
			coapEndpoint === undefined ? defaultCoAPEndpoint : new URL(coapEndpoint),
		coapPort: parseInt(coapPort ?? `5684`, 10),
	}
}
