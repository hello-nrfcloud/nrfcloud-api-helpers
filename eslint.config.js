import config from '@bifravst/eslint-config-typescript'
export default [...config, { ignores: ['npm/**'] }, { files: ['./.npm/*.ts'] }]
