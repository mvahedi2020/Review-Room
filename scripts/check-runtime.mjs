import process from 'node:process'
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Review Room requires Node 24 for reproducible tooling.')
if (Object.keys(process.env).some(key => key.startsWith('VITE_'))) throw new Error('This static prototype does not support custom VITE runtime configuration. Remove those settings before building.')
