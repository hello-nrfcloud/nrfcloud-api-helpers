import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { getFOTABundles } from './getFOTABundles.js'

void describe('getFOTABundles()', () => {
	void it('should fetch all FOTA bundles', async () => {
		const mockFetch = mock.fn<() => Promise<Response>>()
		mockFetch.mock.mockImplementationOnce(
			async () =>
				Promise.resolve({
					ok: true,
					json: async () =>
						Promise.resolve({
							items: [
								{
									bundleId: 'APP*0038b655*v1.1.1-debug',
									lastModified: '2023-06-28T09:50:02.000Z',
									size: 418565,
									version: 'v1.1.1-debug',
									type: 'APP',
									filenames: ['hello-nrfcloud-thingy91-debug-v1.1.1-fwupd.bin'],
									name: 'hello.nrfcloud.com v1.1.1-debug',
									description:
										'Firmware Update Image BIN file (thingy91, debug)',
								},
							],
							total: 1,
							pageNextToken:
								'102/B5fGZNAs7vcw8E2i611ID4apx/Du/2/H6nr2UDWk5eoihEeAgh6qoaGcDzAI4M8JCoO4iAAK96TWfuB19ru9c1PrnwiTUdw/sZzwrYSrS433vPjDJNvJUIEmqm9+V3ElM5M1bLmt6GrGa57SymHHK4nN0W+zHhmE97cCCfzJMBXhVTl3TzvBx5rE1KJYf',
						}),
				}) as Promise<Response>,
			0,
		)
		mockFetch.mock.mockImplementationOnce(
			async () =>
				Promise.resolve({
					ok: true,
					json: async () =>
						Promise.resolve({
							items: [
								{
									bundleId: 'APP*0103b0f9*v1.1.2-sol-dbg',
									lastModified: '2023-06-29T14:18:19.000Z',
									size: 426280,
									version: 'v1.1.2-sol-dbg',
									type: 'APP',
									filenames: [
										'hello-nrfcloud-thingy91-sol-dbg-v1.1.2-fwupd.bin',
									],
									name: 'hello.nrfcloud.com v1.1.2-sol-dbg',
									description:
										'Firmware Update Image BIN file (thingy91, solar, debug)',
								},
							],
							total: 1,
						}),
				}) as Promise<Response>,
			1,
		)
		const fetcher = getFOTABundles(
			{
				endpoint: new URL('https://example.com/'),
				apiKey: 'some-key',
			},
			mockFetch as any,
		)

		const res = await fetcher()

		assert.deepEqual(mockFetch.mock.calls[0]?.arguments, [
			`https://example.com/v1/firmwares?pageLimit=100`,
			{
				headers: {
					Accept: 'application/json; charset=utf-8',
					Authorization: 'Bearer some-key',
				},
			},
		])

		assert.deepEqual(mockFetch.mock.calls[1]?.arguments, [
			`https://example.com/v1/firmwares?pageLimit=100&pageNextToken=${encodeURIComponent(`102/B5fGZNAs7vcw8E2i611ID4apx/Du/2/H6nr2UDWk5eoihEeAgh6qoaGcDzAI4M8JCoO4iAAK96TWfuB19ru9c1PrnwiTUdw/sZzwrYSrS433vPjDJNvJUIEmqm9+V3ElM5M1bLmt6GrGa57SymHHK4nN0W+zHhmE97cCCfzJMBXhVTl3TzvBx5rE1KJYf`)}`,
			{
				headers: {
					Accept: 'application/json; charset=utf-8',
					Authorization: 'Bearer some-key',
				},
			},
		])

		assert.deepEqual(res, {
			bundles: [
				{
					bundleId: 'APP*0038b655*v1.1.1-debug',
					lastModified: '2023-06-28T09:50:02.000Z',
					size: 418565,
					version: 'v1.1.1-debug',
					type: 'APP',
					filenames: ['hello-nrfcloud-thingy91-debug-v1.1.1-fwupd.bin'],
					name: 'hello.nrfcloud.com v1.1.1-debug',
					description: 'Firmware Update Image BIN file (thingy91, debug)',
				},
				{
					bundleId: 'APP*0103b0f9*v1.1.2-sol-dbg',
					lastModified: '2023-06-29T14:18:19.000Z',
					size: 426280,
					version: 'v1.1.2-sol-dbg',
					type: 'APP',
					filenames: ['hello-nrfcloud-thingy91-sol-dbg-v1.1.2-fwupd.bin'],
					name: 'hello.nrfcloud.com v1.1.2-sol-dbg',
					description:
						'Firmware Update Image BIN file (thingy91, solar, debug)',
				},
			],
		})
	})
})
