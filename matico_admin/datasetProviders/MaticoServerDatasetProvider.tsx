import React, { useState } from "react";
import { useDatasets } from "../hooks/useDatasets";
import { useDatasetData } from "../hooks/useDatasetData";
import {
  Item,
  Picker,
  View,
  Text,
  ActionButton,
  Switch,
} from "@adobe/react-spectrum";

import {
  DatasetProvider,
  DatasetRecord,
  DatasetProviderComponent,
} from "@maticoapp/matico_components";

export const MaticoDatasetExplorer: React.FC<DatasetProviderComponent> = ({
  onSubmit,
}) => {
  const { datasets, datasetError } = useDatasets();
  console.log("matico datasets ", datasets)

  const [selectedDatasetID, setSelectedDatasetID] = useState<any | null>(null);
  const [remote, setRemote] = useState<boolean>(false);

  const selectedDataset = datasets
    ? datasets.find((d: any) => d.id === selectedDatasetID)
    : null;
  const { data, error: dataError } = useDatasetData(selectedDatasetID, 0);

  const submitDataset = () => {
    const spec = remote
      ? {
          MaticoRemote: {
            name: selectedDataset.name,
            description: selectedDataset.description,
            server_url: `${window.location.origin}/api`,
            dataset_id: selectedDataset.id,
          },
        }
      : {
          GeoJSON: {
            url: `${window.location.origin}/api/datasets/${selectedDatasetID}/data?format=geojson`,
            name: selectedDataset.name,
          },
        };
    onSubmit(spec);
  };

  

  return (
    <View>
      {datasets && (
        <Picker
          label="dataset"
          items={datasets}
          selectedKey={selectedDatasetID}
          onSelectionChange={setSelectedDatasetID}
          disabledKeys={datasets.filter(d=>!d.public).map(d=>d.id)}
        >
          {(dataset: any) => <Item key={dataset.id}>{dataset.name}</Item>}
        </Picker>
      )}
      {selectedDataset && (
        <>
          <ActionButton onPress={submitDataset}>Add Datasets</ActionButton>
          <Switch isSelected={remote} onChange={setRemote}>
            Remote
          </Switch>
        </>
      )}
    </View>
  );
};

export const MaticoServerDatasetProvider: DatasetProvider = {
  name: "Matico Datasets",
  description: "Import your datasets from matico",
  component: MaticoDatasetExplorer,
};
