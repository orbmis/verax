const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('PortalRegistry', function () {
  let portalRegistry
  let portalContract
  let schemaRegistry
  let attestationRegistry
  let moduleRegistry
  let router
  let owner

  before(async function () {
    [owner] = await ethers.getSigners()
    schemaRegistry = await ethers.deployContract('SchemaRegistry')
    moduleRegistry = await ethers.deployContract('ModuleRegistry')
    attestationRegistry = await ethers.deployContract('AttestationRegistry')
    portalRegistry = await ethers.deployContract('PortalRegistry')
    portalContract = await ethers.deployContract('DefaultPortal')
    router = await ethers.deployContract('Router')

    await portalRegistry.connect(owner).updateRouter(router.target)
  })

  it('initialize with given regitry contract address', async function () {
    // await portalRegistry.initialize()
    //   moduleRegistry.target,
    //   attestationRegistry.target,
    //   schemaRegistry.target
    // )

    // expect(await portalRegistry.schemaRegistry()).to.equal(schemaRegistry.target)
    // expect(await portalRegistry.moduleRegistry()).to.equal(moduleRegistry.target)
    // expect(await portalRegistry.attestationRegistry()).to.equal(attestationRegistry.target)
  })

  it('should not register a portal with invalid address', async function () {
    const name = 'SamplePortal'
    const description = 'A sample portal for testing'

    await expect(
      portalRegistry.register(ethers.ZeroAddress, name, description)
    ).to.be.revertedWithCustomError(portalRegistry, 'PortalAddressInvalid')
  })

  it('should not register a portal with missing name', async function () {
    const portalAddress = portalContract.target
    const description = 'A sample portal for testing'

    await expect(
      portalRegistry.register(portalAddress, '', description)
    ).to.be.revertedWithCustomError(portalRegistry, 'PortalNameMissing')
  })

  it('should not register a portal with missing description', async function () {
    const portalAddress = portalContract.target
    const name = 'SamplePortal'

    await expect(portalRegistry.register(portalAddress, name, '')).to.be.revertedWithCustomError(
      portalRegistry,
      'PortalDescriptionMissing'
    )
  })

  it('should register a new portal', async function () {
    const portalAddress = portalContract.target
    const name = 'SamplePortal'
    const description = 'A sample portal for testing'

    await portalRegistry.register(portalAddress, name, description)

    const registeredPortal = await portalRegistry.getPortalByAddress(portalAddress)
    expect(registeredPortal.id).to.equal(portalAddress)
    expect(registeredPortal.name).to.equal(name)
    expect(registeredPortal.description).to.equal(description)
  })

  it('should not register an already existing portal', async function () {
    const portalAddress = portalContract.target
    const name = 'SamplePortal'
    const description = 'A sample portal for testing'

    await expect(
      portalRegistry.register(portalAddress, name, description)
    ).to.be.revertedWithCustomError(portalRegistry, 'PortalAlreadyExists')
  })

  it('should return the number of registered portals', async function () {
    expect(await portalRegistry.getPortalsCount()).to.equal(1)
  })

  it('should not return a portal that is not registered', async function () {
    expect(
      await portalRegistry.getPortalByAddress(portalContract.target)
    ).to.be.revertedWithCustomError(portalRegistry, 'PortalNotRegistered')
  })

  it('should deploy the default portal', async function () {
    await portalRegistry.deployDefaultPortal([], 'test portal', 'test description')

    const portalCount = await portalRegistry.getPortalsCount()
    const portalIndex = Number(portalCount - 1n)
    const portal = await portalRegistry.getPortalByIndex(portalIndex)

    expect(portal.name).to.equal('test portal')
    expect(portal.description).to.equal('test description')
  })

  it('should not return a portal that is not registered', async function () {
    await expect(portalRegistry.getPortalByIndex(3)).to.be.revertedWithCustomError(
      portalRegistry,
      'PortalNotRegistered'
    )
  })
})
