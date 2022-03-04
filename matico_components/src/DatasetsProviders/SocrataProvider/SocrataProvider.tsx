import React, { Key, useState } from "react";
import {
  Item,
  Picker,
  View,
  Text,
  ActionButton,
  Switch,
  Flex,
  ComboBox,
  Well,
  Link,
  ProgressBar,
  Button,
  Header,
  Heading,
} from "@adobe/react-spectrum";

import {
  DatasetProvider,
  DatasetRecord,
  DatasetProviderComponent,
} from "@maticoapp/matico_components";
import { PortalInfo, usePortals } from "./usePortals";
import { usePortalDatasets } from "./usePortalDatasets";

export const SocrataDatasetExplorer: React.FC<DatasetProviderComponent> = ({
  onSubmit,
}) => {
  const portals = usePortals();

  const [selectedPortalKey, setSelectedPortalKey] =
    useState<null | string>(null);

  const [selectedDatasetId, setSelectedDatasetId] =
    useState<null | string>(null);

  const selectedPortal = portals
    ? portals.find(
        (p: PortalInfo) => p.domain === (selectedPortalKey as string)
      )
    : null;

  const { datasets, loading, progress } = usePortalDatasets(selectedPortal);
  console.log("POrtals", portals);
  console.log("Datasets ", datasets);
  console.log("selected portal ", selectedPortal);

  const selectedDataset = datasets
    ? datasets.find((d) => d.resource.id === selectedDatasetId)
    : null;

  const attemptToLoadDataset = (dataset: any) => {
    const dataUrl = `https://${dataset.metadata.domain}/api/geospatial/${dataset.resource.id}?method=export&format=GeoJSON`;
    onSubmit({
      GeoJSON: {
        url: dataUrl,
        name: dataset.resource.name,
      },
    });
  };


  console.log("selected dataset ",selectedDataset)
  return (
    <Flex direction="column" gap="size-200" padding="size-100">
      {portals && (
        <ComboBox
          label="Select Portal"
          placeholder="Select a socrata portal to get data from"
          width="100%"
          defaultItems={portals.slice(0, 100)}
          selectedKey={selectedPortalKey}
          onSelectionChange={(key) => setSelectedPortalKey(key as string)}
        >
          {(portal) => (
            <Item key={portal.domain}>
              <Text>{portal.domain}</Text>
              <Text slot="description">{portal.count} datasets</Text>
            </Item>
          )}
        </ComboBox>
      )}

      {loading && (
        <ProgressBar label="Getting datasets" width="100%" value={progress} />
      )}
      {datasets && (
        <ComboBox
          defaultItems={datasets}
          width="100%"
          placeholder="Select dataset"
          label="Datasets"
          selectedKey={selectedDatasetId}
          onSelectionChange={setSelectedDatasetId}
        >
          {(dataset) => (
            <Item key={dataset.resource.id}>{dataset.resource.name}</Item>
          )}
        </ComboBox>
      )}

      {selectedDataset && (
        <Well>
          <Flex direction="column">
            <View overflow="hidden auto" maxHeight="size-2000">
              <Text>{selectedDataset.resource.description}</Text>
            </View>
            <Flex marginTop="size-200" justifyContent="space-between">
              <Link>
                <a target="_blank" href={selectedDataset.permalink}>
                  View on portal
                </a>
              </Link>
              <Text>{selectedDataset.owner.display_name}</Text>
            </Flex>
          </Flex>
        </Well>
      )}
      {selectedDataset && (
        <Well>
          <Heading>Columns</Heading>
          <View maxHeight="size-2000" overflow="hidden auto">
          <Flex direction="column" >
            {selectedDataset.resource.columns_name.map(
              (name: string, index: number) => (
                <Flex direction="row">
                  <Text>{name}</Text>
                  <Text>{selectedDataset.resource.columns_datatype[index]} </Text>
                </Flex>
              )
            )}
          </Flex>
        </View>
        </Well>
      )}
      {selectedDataset && (
        <Flex direction="row" justifyContent="end">
          <Button
            onPress={() => attemptToLoadDataset(selectedDataset)}
            variant="cta"
          >
            Load Dataset
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export const SocrataDatasetProvider: DatasetProvider = {
  name: "Socrata Datasets",
  description: "Import a datasets from socrata",
  component: SocrataDatasetExplorer,
};