import React, { useEffect } from "react";
import { Dashboard } from "@maticoapp/matico_spec";
import { Provider } from "react-redux";
import { store } from "Stores/MaticoStore";
import { VariableState } from "Stores/MaticoVariableSlice";
import {
  MaticoDataProvider,
  MaticoDataState,
} from "../../Contexts/MaticoDataContext/MaticoDataContext";
import { MaticoAppPresenter } from "../MaticoAppPresenter/MaticoAppPresenter";
import { Grid, Grommet } from "grommet";
import { deepMerge } from "grommet/utils";
import { grommet } from "grommet/themes";
import { MaticoEditor } from "../MaticoEditor/MaticoEditor";

interface MaticoAppInterface {
  spec?: Dashboard;
  onStateChange?: (state: VariableState) => void;
  onDataChange?: (data: MaticoDataState) => void;
  onSpecChange?: (data: Dashboard) => void;
  basename?: string;
  editActive?: boolean | null;
}

const themeTweaks = {
  button: { default: undefined },
};

export const MaticoApp: React.FC<MaticoAppInterface> = ({
  spec,
  onStateChange,
  basename,
  onDataChange,
  onSpecChange,
  editActive = false,
}) => {
  return (
    <Provider store={store}>
      <MaticoDataProvider onStateChange={onDataChange}>
        <Grommet
          theme={deepMerge(themeTweaks, grommet)}
          style={{ width: "100%", height: "100%" }}
        >
          <Grid
            fill
            columns={["flex", editActive ? "25vw" : "0px"]}
            rows={["flex"]}
            areas={[["viewer", "editor"]]}
          >
            <MaticoEditor editActive={editActive} onSpecChange={onSpecChange} />
            <MaticoAppPresenter
              spec={spec}
              basename={basename}
              onStateChange={onStateChange}
            />
          </Grid>
        </Grommet>
      </MaticoDataProvider>
    </Provider>
  );
};
