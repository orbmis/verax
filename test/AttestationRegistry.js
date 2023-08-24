const { expect } = require('chai')
const { ethers } = require('hardhat')
const { hexZeroPad, hexlify } = require('@ethersproject/bytes')

describe('AttestationRegistry', function () {
  let attestationRegistry
  let portalRegistry
  let schemaRegistry
  let moduleRegistry
  let portalContract
  let owner
  let portal
  let attestationPayload

  before(async function () {
    [owner, portal] = await ethers.getSigners()

    try {
      let ContractFactory = await ethers.getContractFactory("AttestationRegistry")
      attestationRegistry = await ContractFactory.connect(owner).deploy()
      console.log("Contract address:", attestationRegistry.target)
      console.log("Contract deployer:", owner.address)
      console.log("Contract owner:", await attestationRegistry.owner())
    }catch(err) {
      console.log('Error deploying contract: ', err)
    }

    portalRegistry = await ethers.deployContract('PortalRegistry')
    schemaRegistry = await ethers.deployContract('SchemaRegistry')
    moduleRegistry = await ethers.deployContract('ModuleRegistry')
    portalContract = await ethers.deployContract('DefaultPortal')

    // attestationRegistry = await ethers.deployContract('AttestationRegistry')

    portalContract.initialize(
      [],
      moduleRegistry.target,
      attestationRegistry.target,
    )

    const schemaId = await schemaRegistry.getIdFromSchemaString('key: value')

    await schemaRegistry.createSchema(
      'Sample Schema',
      'Schema for testing',
      'Sample Context',
      'key: value'
    )

    await portalRegistry.register(portalContract.target, 'Sample Portal', 'Portal for testing')

    const now = new Date()
    const attestationData = hexlify(ethers.toUtf8Bytes('test'))
    const subject = hexlify(ethers.toUtf8Bytes('test subject'))
    const expirationDate = now.getTime()

    attestationPayload = {
      schemaId,
      subject,
      expirationDate,
      attestationData,
    }
  })

  it('should not allow non-portal to attest', async function () {
    await expect(attestationRegistry.attest(attestationPayload)).to.be.revertedWithCustomError(
      attestationRegistry,
      'OnlyPortal'
    )
  })

  it('should register an attestation', async function () {
    await portalContract.attest(attestationPayload, [])

    const attestationId = hexZeroPad(hexlify(1), 32)

    const registeredAttestation = await attestationRegistry.getAttestation(attestationId)

    expect(registeredAttestation.portal).to.equal(portalContract.target)
    expect(registeredAttestation.schemaId).to.equal(attestationPayload.schemaId)
    expect(registeredAttestation.attestationData).to.equal(attestationPayload.attestationData)
    expect(registeredAttestation.revoked).to.equal(false)
    expect(registeredAttestation.attestationId).to.equal(attestationId)
    expect(registeredAttestation.version).to.equal(0)
  })

  it('should not allow attestations with empty data', async function () {
    const attestationData = hexlify(ethers.toUtf8Bytes(''))
    await expect(
      portalContract.attest({ ...attestationPayload, attestationData }, [])
    ).to.be.revertedWithCustomError(attestationRegistry, 'DataAttestationFieldEmpty')
  })

  it('should not allow attestations with empty subject', async function () {
    const subject = hexlify(ethers.toUtf8Bytes(''))
    await expect(
      portalContract.attest({ ...attestationPayload, subject }, [])
    ).to.be.revertedWithCustomError(attestationRegistry, 'EmptyAttestationSubjectField')
  })

  it('should not allow attestations with unregistered schemas', async function () {
    const schemaId = await schemaRegistry.getIdFromSchemaString('foo: bar')
    await expect(
      portalContract.attest({ ...attestationPayload, schemaId }, [])
    ).to.be.revertedWithCustomError(attestationRegistry, 'SchemaNotRegistered')
  })

  it('should increment the version number', async function () {
    await attestationRegistry.incrementVersionNumber()
    let versionNumber = await attestationRegistry.getVersionNumber()
    expect(versionNumber).to.equal(1)

    await attestationRegistry.incrementVersionNumber()
    versionNumber = await attestationRegistry.getVersionNumber()
    expect(versionNumber).to.equal(2)
  })

  it('should revoke an existing attestation', async function () {
    const attestationId = hexZeroPad(hexlify(1), 32)
    await portalContract.revoke(attestationId)
    const attestation = await attestationRegistry.getAttestation(attestationId)
    expect(attestation.revoked).to.equal(true)
  })

  it('should not revoke an non-existing attestation', async function () {
    const attestationId = hexZeroPad(hexlify(2), 32)
    await expect(portalContract.revoke(attestationId)).to.be.revertedWithCustomError(
      attestationRegistry,
      'AttestationNotAttested'
    )
  })

  it('should not allow a non portal to revoke an attestation', async function () {
    const attestationId = hexZeroPad(hexlify(1), 32)
    await expect(attestationRegistry.revoke(attestationId)).to.be.revertedWithCustomError(
      attestationRegistry,
      'OnlyAttestingPortal'
    )
  })
})
