// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { AttestationRegistry } from "../AttestationRegistry.sol";
import { ModuleRegistry } from "../ModuleRegistry.sol";
import { SchemaRegistry } from "../SchemaRegistry.sol";
import { AbstractPortal } from "../interface/AbstractPortal.sol";
import { Attestation, AttestationPayload, Portal } from "../types/Structs.sol";

/**
 * @title Default Portal
 * @author Consensys
 * @notice This contract aims to provide a default portal
 */
contract DefaultPortal is Initializable, AbstractPortal, IERC165 {
  address[] public modules;
  ModuleRegistry public moduleRegistry;
  AttestationRegistry public attestationRegistry;
  SchemaRegistry public schemaRegistry;

  /// @notice Error thown when attempting to initialize the default portal twice
  error PortalAlreadyInitialized();
  /// @notice Error thrown when a schema is not registered in the SchemaRegistry
  error SchemaNotRegistered();
  /// @notice Error thrown when an attempt is made to register an attestation with an empty subject field
  error EmptyAttestationSubjectField();
  /// @notice Error thrown when an attempt is made to register an attestation with an empty data field
  error DataAttestationFieldEmpty();

  /**
   * @notice Contract initialization
   */
  function initialize(
    address[] calldata _modules,
    address _moduleRegistry,
    address _attestationRegistry,
    address _schemaRegistry
  ) public initializer {
    // Store module registry and attestation registry addresses and modules
    attestationRegistry = AttestationRegistry(_attestationRegistry);
    moduleRegistry = ModuleRegistry(_moduleRegistry);
    schemaRegistry = SchemaRegistry(_schemaRegistry);
    modules = _modules;
  }

  /**
   * @notice Get all modules from the default portal clone
   * @return The Modules
   */
  function getModules() external view override returns (address[] memory) {
    return modules;
  }

  /**
   * @notice Get all modules from the default portal clone
   * @return The Modules
   */
  function revoke(bytes32 attestationId) external override returns (bool) {
    attestationRegistry.revoke(attestationId);

    return true;
  }

  /**
   * @notice attest the schema with given attestationPayload and validationPayload
   * @dev Runs all modules for the portal and stores the attestation in AttestationRegistry
   */
  function attest(
    AttestationPayload memory attestationPayload,
    bytes[] memory validationPayload
  ) external payable override {
    moduleRegistry.runModules(modules, validationPayload);
    attestationRegistry.attest(attestationPayload);
  }

  /**
   * @notice Implements supports interface method declaring it is an AbstractPortal
   */
  function supportsInterface(bytes4 interfaceID) public pure override returns (bool) {
    return interfaceID == type(AbstractPortal).interfaceId || interfaceID == type(IERC165).interfaceId;
  }
}
