import React, { useEffect, useState } from "react";
import { Accordion, AccordionPanel, Box, Tab, Tabs } from "grommet";
import { MaticoDatasetsViewer } from "./Utils/MaticoDatasetsViewer";
import { MaticoRawSpecEditor } from "./Panes/MaticoRawSpecEditor";
import { MaticoStateViewer } from "./Panes/MaticoStateViewer";
import { useMaticoDispatch, useMaticoSelector } from "../../Hooks/redux";
import { setEditing } from "../../Stores/MaticoSpecSlice";
import { Editors } from "./Editors";
import { DatasetsEditor } from "./Panes/DatasetsEditor";
import { BreadCrumbs } from "./Utils/BreadCrumbs";
import {Dashboard} from "@maticoapp/matico_spec";
import {DatasetProvider} from "Datasets/DatasetProvider";

export interface MaticoEditorProps{
  editActive: boolean, 
  onSpecChange?: (dashboard:Dashboard) =>void
  datasetProviders?: Array<DatasetProvider>
}

export const MaticoEditor: React.FC<MaticoEditorProps> = ({
  editActive,
  onSpecChange,
  datasetProviders
}) => {
  const dispatch = useMaticoDispatch();
  // eg
  // spec
  // pages.0.sections.0.panes.1.Map
  // Map
  const { spec, currentEditPath, currentEditType } = useMaticoSelector(
    (state) => state.spec
  );
  const [tabIndex, setTabIndex] = useState<number | null>(0);

  useEffect(() => {
    if (spec) {
      localStorage.setItem("code", JSON.stringify(spec));
    }
    if (onSpecChange){
        onSpecChange(spec)
    }
  }, [JSON.stringify(spec)]);

  useEffect(() => {
    dispatch(setEditing(editActive));
  }, [editActive]);

  useEffect(() => {
    if (currentEditPath) {
      setTabIndex(0);
    } else {
      setTabIndex(null);
    }
  }, [currentEditPath]);

  const EditPane = Editors[currentEditType];
  if (!editActive) return null;
  return (
    <Box
      overflow={{ vertical: 'auto'}}
      fill
      border="left"
      background="neutral-3"
    >
      <Accordion
        activeIndex={tabIndex}
        onActive={(tab) => setTabIndex(tab[0])}
        multiple={false}
        flex
        fill
      >
        {currentEditPath && (
          <AccordionPanel label={`Edit ${currentEditType}`}>
            <BreadCrumbs editPath={currentEditPath} />
            <EditPane editPath={currentEditPath} />
          </AccordionPanel>
        )}
        <AccordionPanel label="Datasets">
          <DatasetsEditor datasetProviders={datasetProviders} />
        </AccordionPanel>
        <AccordionPanel label="Spec">
          <MaticoRawSpecEditor />
        </AccordionPanel>
        <AccordionPanel label="State">
          <MaticoStateViewer />
        </AccordionPanel>
      </Accordion>
    </Box>
  );
};
