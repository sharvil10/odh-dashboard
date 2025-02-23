/* eslint-disable camelcase */
import {
  mockDashboardConfig,
  mockK8sResourceList,
  mockRouteK8sResourceModelRegistry,
} from '~/__mocks__';
import { mockComponents } from '~/__mocks__/mockComponents';
import { mockModelRegistry } from '~/__mocks__/mockModelRegistry';
import { ModelRegistryModel, RouteModel } from '~/__tests__/cypress/cypress/utils/models';
import { MODEL_REGISTRY_API_VERSION } from '~/concepts/modelRegistry/const';
import { modelVersionDetails } from '~/__tests__/cypress/cypress/pages/modelRegistry/modelVersionDetails';
import { mockRegisteredModel } from '~/__mocks__/mockRegisteredModel';
import { mockModelVersion } from '~/__mocks__/mockModelVersion';
import { mockModelVersionList } from '~/__mocks__/mockModelVersionList';
import { mockModelArtifactList } from '~/__mocks__/mockModelArtifactList';
import { verifyRelativeURL } from '~/__tests__/cypress/cypress/utils/url';
import { ModelRegistryMetadataType } from '~/concepts/modelRegistry/types';

const initIntercepts = () => {
  cy.interceptOdh(
    'GET /api/config',
    mockDashboardConfig({
      disableModelRegistry: false,
    }),
  );
  cy.interceptOdh('GET /api/components', { query: { installed: 'true' } }, mockComponents());

  cy.interceptK8sList(ModelRegistryModel, mockK8sResourceList([mockModelRegistry({})]));

  cy.interceptK8s(ModelRegistryModel, mockModelRegistry({}));

  cy.interceptK8s(
    RouteModel,
    mockRouteK8sResourceModelRegistry({
      name: 'modelregistry-sample-http',
      namespace: 'odh-model-registries',
    }),
  );

  cy.interceptOdh(
    `GET /api/service/modelregistry/:serviceName/api/model_registry/:apiVersion/registered_models/:registeredModelId`,
    {
      path: {
        serviceName: 'modelregistry-sample',
        apiVersion: MODEL_REGISTRY_API_VERSION,
        registeredModelId: 1,
      },
    },

    mockRegisteredModel({}),
  );

  cy.interceptOdh(
    `GET /api/service/modelregistry/:serviceName/api/model_registry/:apiVersion/registered_models/:registeredModelId/versions`,
    {
      path: {
        serviceName: 'modelregistry-sample',
        apiVersion: MODEL_REGISTRY_API_VERSION,
        registeredModelId: 1,
      },
    },
    mockModelVersionList({
      items: [
        mockModelVersion({ name: 'Version 1', author: 'Author 1', registeredModelId: '1' }),
        mockModelVersion({
          author: 'Author 2',
          registeredModelId: '1',
          id: '2',
          name: 'Version 2',
        }),
      ],
    }),
  );

  cy.interceptOdh(
    `GET /api/service/modelregistry/:serviceName/api/model_registry/:apiVersion/model_versions/:modelVersionId`,
    {
      path: {
        serviceName: 'modelregistry-sample',
        apiVersion: MODEL_REGISTRY_API_VERSION,
        modelVersionId: 1,
      },
    },
    mockModelVersion({
      id: '1',
      name: 'Version 1',
      customProperties: {
        'Testing label': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        Financial: {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: 'non-empty',
        },
        'Financial data': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        'Fraud detection': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        'Long label data to be truncated abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc':
          {
            metadataType: ModelRegistryMetadataType.STRING,
            string_value: '',
          },
        'Machine learning': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        'Next data to be overflow': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        'Label x': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        'Label y': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
        'Label z': {
          metadataType: ModelRegistryMetadataType.STRING,
          string_value: '',
        },
      },
    }),
  );

  cy.interceptOdh(
    `GET /api/service/modelregistry/:serviceName/api/model_registry/:apiVersion/model_versions/:modelVersionId`,
    {
      path: {
        serviceName: 'modelregistry-sample',
        apiVersion: MODEL_REGISTRY_API_VERSION,
        modelVersionId: 2,
      },
    },
    mockModelVersion({ id: '2', name: 'Version 2' }),
  );

  cy.interceptOdh(
    `GET /api/service/modelregistry/:serviceName/api/model_registry/:apiVersion/model_versions/:modelVersionId/artifacts`,
    {
      path: {
        serviceName: 'modelregistry-sample',
        apiVersion: MODEL_REGISTRY_API_VERSION,
        modelVersionId: 1,
      },
    },
    mockModelArtifactList(),
  );
};

describe('Model version details', () => {
  beforeEach(() => {
    initIntercepts();
    modelVersionDetails.visit();
  });

  it('Model version details page header', () => {
    verifyRelativeURL('/modelRegistry/modelregistry-sample/registeredModels/1/versions/1/details');
    cy.findByTestId('app-page-title').should('have.text', 'Version 1');
    cy.findByTestId('breadcrumb-version-name').should('have.text', 'Version 1');
  });

  it('Model version details tab', () => {
    modelVersionDetails.findVersionId().contains('1');
    modelVersionDetails.findDescription().should('have.text', 'Description of model version');
    modelVersionDetails.findMoreLabelsButton().contains('6 more');
    modelVersionDetails.findMoreLabelsButton().click();
    modelVersionDetails.shouldContainsModalLabels([
      'Testing label',
      'Financial',
      'Financial data',
      'Fraud detection',
      'Machine learning',
      'Next data to be overflow',
      'Label x',
      'Label y',
      'Label z',
    ]);
    modelVersionDetails.findStorageLocation().contains('https://huggingface.io/mnist.onnx');
  });

  it('Switching model versions', () => {
    modelVersionDetails.findVersionId().contains('1');
    modelVersionDetails.findModelVersionDropdownButton().click();
    modelVersionDetails.findModelVersionDropdownSearch().fill('Version 2');
    modelVersionDetails.findModelVersionDropdownItem('Version 2').click();
    modelVersionDetails.findVersionId().contains('2');
  });
});
