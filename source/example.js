'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

async function run () {
  await client.index({
    index: 'game-of-thrones',
    id: '1',
    body: {
      character: 'Ned Stark',
      quote: 'Winter is coming.'
    }
  })

  const { body } = await client.get({
    index: 'game-of-thrones',
    id: '1'
  })

  console.log(body)
}

run().catch(console.log)
