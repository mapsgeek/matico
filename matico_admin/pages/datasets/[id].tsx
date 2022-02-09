import type { NextPage } from "next";
import { Layout } from "../../components/Layout";
import {
  Divider,
  Flex,
  Grid,
  Heading,
  Item,
  TabList,
  TabPanels,
  Tabs,
  View,
  Text,
  Link,
  IllustratedMessage,
  Content,
} from "@adobe/react-spectrum";
import { GetServerSideProps } from "next";
import { useDataset } from "../../hooks/useDatasets";
import NotFound from "@spectrum-icons/illustrations/NotFound";
import { useDatasetColumns } from "../../hooks/useDatasetColumns";
import { useDatasetData } from "../../hooks/useDatasetData";
import { MapView } from "../../components/MapView";
import TableEdit from "@spectrum-icons/workflow/TableEdit";
import { SyncHistory } from "../../components/SyncHistory";
import dynamic from "next/dynamic";
import { QueryEditorProps } from "../../components/QueryEditor";
import { useEffect, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { Source, SourceType } from "../../utils/api";
import {useExtent} from "../../hooks/useExtent";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return { props: { datasetId: query.id } };
};

const Dataset: NextPage<{ datasetId: string }> = ({ datasetId }) => {
  const source: Source = {
    type: SourceType.Dataset,
    id: datasetId,
  };
  const { data: dataset, error: datasetError } = useDataset(datasetId);
  const { data: columns, error: columnsError } = useDatasetColumns(source);
  const [selectedFeatureId, setSelectedFeatureId] =
    useState<string | null>(null);
  const [visCol, setVisCol] = useState<string | null>(null);

  const [query, setQuery] = useState<null | string>(null);

  useEffect(() => {
    if (query === null && dataset) {
      setQuery(`select * from ${dataset?.table_name}`);
    }
  }, [dataset, query]);

  const mapUrl = `http://localhost:8000/api/tiler/dataset/${datasetId}/{z}/{x}/{y}`;
  const { data, error: dataError } = useDatasetData(datasetId, 0, 30);

  const {extent, extentError} = useExtent(source)

  const QueryEditor = dynamic<QueryEditorProps>(
    () =>
      (import("../../components/QueryEditor") as any).then(
        (imp: any) => imp.QueryEditor
      ),
    { ssr: false }
  );

  return (
    <Layout hasSidebar={true}>
      <View
        backgroundColor="gray-200"
        padding="size-200"
        gridArea="sidebar"
        height="100%"
      >
        <Heading level={2}>{dataset ? dataset.name : "Loading..."}</Heading>
        {dataset && dataset.sync_dataset && (
          <Flex height="100%" direction="column">
            <View>
              <Heading level={4}>Description</Heading>
              <Divider size="S" />
              <Text>{dataset.description}</Text>
            </View>
            <View flex={1} />
            <View>
              <Heading level={4}>Sync Status</Heading>
              <Divider size="S" />
              <SyncHistory datasetId={datasetId} />
              <Text>
                Sycing form{" "}
                <Link>
                  <a href={dataset.sync_url}>{dataset.sync_url}</a>
                </Link>
              </Text>
            </View>
          </Flex>
        )}
      </View>
      <View gridArea="content" padding="size-200" width="100%" height="100%">
        {dataset && (
          <>
            <Grid
              areas={["table map", "focus focus"]}
              columns={["1fr", "1fr"]}
              rows={["60%", "40%"]}
              width="100%"
              height="100%"
              gap="size-200"
            >
              {dataset && (
                <DataTable
                  source={source}
                  filters={[]}
                  visCol={visCol}
                  onVizualizeCol={setVisCol}
                />
              )}
              <View gridArea="map">
                <MapView 
                visCol={visCol} 
                source={source} 
                 extent={extent?.extent}

              />
              </View>
              <Tabs gridArea="focus" orientation="vertical" width="100%" height="100%">
                <TabList>
                  <Item key="query">Query</Item>
                  <Item key="feature">
                    <TableEdit />
                  </Item>
                </TabList>
                <TabPanels>
                  <Item key="query">
                    <QueryEditor
                      key={"query_pane"}
                      query={query}
                      onQueryChange={setQuery}
                    />
                  </Item>
                  <Item key="feature">
                    <IllustratedMessage>
                      <NotFound />
                      <Heading>No feature selected</Heading>
                      <Content>
                        Select a table row or click on map feature to view or
                        edit
                      </Content>
                    </IllustratedMessage>
                  </Item>
                </TabPanels>
              </Tabs>
            </Grid>
          </>
        )}
      </View>
    </Layout>
  );
};

export default Dataset;
