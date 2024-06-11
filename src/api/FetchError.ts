export class FetchError extends Error {
	public readonly statusCode: number
	constructor(statusCode: number, message: string) {
		super(message)
		this.statusCode = statusCode
		this.name = 'FetchError'
	}
}

export const toFetchError = async (response: Response): Promise<FetchError> =>
	new FetchError(
		response.status,
		parseInt(response.headers.get('content-length') ?? '0', 10) > 0
			? await response.text()
			: 'No content returned from server',
	)
