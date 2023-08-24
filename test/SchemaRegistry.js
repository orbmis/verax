const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('SchemaRegistry', function () {
  let schemaRegistry

  before(async function () {
    schemaRegistry = await ethers.deployContract('SchemaRegistry')
  })

  it('should create and register a new schema', async function () {
    const name = 'SampleSchema'
    const description = 'A sample schema for testing'
    const context = 'SampleContext'
    const schemaString = '{ key: value }'

    await schemaRegistry.createSchema(name, description, context, schemaString)

    const schemaId = await schemaRegistry.getIdFromSchemaString(schemaString)
    const createdSchema = await schemaRegistry.schemas(schemaId)

    expect(createdSchema.name).to.equal(name)
    expect(createdSchema.description).to.equal(description)
    expect(createdSchema.context).to.equal(context)
    expect(createdSchema.schema).to.equal(schemaString)
  })

  it('should not create a schema with missing name', async function () {
    const description = 'A sample schema for testing'
    const context = 'SampleContext'
    const schemaString = '{ ... }'

    await expect(
      schemaRegistry.createSchema('', description, context, schemaString)
    ).to.be.revertedWithCustomError(schemaRegistry, 'SchemaNameMissing')
  })

  it('should not create a schema with missing schema string', async function () {
    const name = 'SampleSchema'
    const description = 'A sample schema for testing'
    const context = 'SampleContext'

    await expect(
      schemaRegistry.createSchema(name, description, context, '')
    ).to.be.revertedWithCustomError(schemaRegistry, 'SchemaStringMissing')
  })

  it('should not create a schema with missing context', async function () {
    const name = 'SampleSchema'
    const description = 'A sample schema for testing'
    const schemaString = '{ name: string }'

    await expect(
      schemaRegistry.createSchema(name, description, '', schemaString)
    ).to.be.revertedWithCustomError(schemaRegistry, 'SchemaContextMissing')
  })

  it('should not create a duplicate schema', async function () {
    const name = 'SampleSchema'
    const description = 'A sample schema for testing'
    const context = 'SampleContext'
    const schemaString = '{ key: value }'

    await expect(
      schemaRegistry.createSchema(name, description, context, schemaString)
    ).to.be.revertedWithCustomError(schemaRegistry, 'SchemaAlreadyExists')
  })

  it('should correctly return the number of registered schemas', async function () {
    const name = 'SampleSchema'
    const description = 'A sample schema for testing'
    const context = 'SampleContext'
    const schemaString = '{ message: bytes }'

    await schemaRegistry.createSchema(name, description, context, schemaString)

    const schemaCount = await schemaRegistry.getSchemasNumber()
    expect(schemaCount).to.equal(2)
  })

  it('should correctly check if a schema is registered', async function () {
    const name = 'SampleSchema'
    const description = 'A sample schema for testing'
    const context = 'SampleContext'
    const schemaString = '{ isAttestedTo: boolean }'

    const schemaId = await schemaRegistry.getIdFromSchemaString(schemaString)

    let result = await schemaRegistry.isRegistered(schemaId)

    expect(result).to.be.false

    await schemaRegistry.createSchema(name, description, context, schemaString)

    result = await schemaRegistry.isRegistered(schemaId)

    expect(result).to.equal(true)
  })

  it('should get the number of schemas that are registered', async function () {
    const numberOfSchemas = await schemaRegistry.getSchemasNumber()
    expect(numberOfSchemas).to.equal(3)
  })

  it('should get the schema ID from a schema string', async function () {
    const schemaId = await schemaRegistry.getIdFromSchemaString('{ key: value }')
    expect(schemaId).to.equal('0x327214cae794082a9e2a74895695f1393f4b0c8c509cafb007c9acbd06d01f26')
  })
})
