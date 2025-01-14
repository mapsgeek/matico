import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { MaticoPage } from "../MaticoPage/MaticoPage";
import { MaticoDataState } from "../../Contexts/MaticoDataContext/MaticoDataContext";
import { VariableState } from "../../Stores/MaticoVariableSlice";
import { MaticoNavBar } from "../MaticoNavBar/MaticoNavBar";
import { Dashboard } from "@maticoapp/matico_spec";
import { setSpec } from "../../Stores/MaticoSpecSlice";
import { useAppSpec } from "../../Hooks/useAppSpec";
import { useMaticoSelector, useMaticoDispatch } from "../../Hooks/redux";
import { registerDataset } from "Stores/MaticoDatasetSlice";
import { Content, Grid, View } from "@adobe/react-spectrum";

interface MaticoAppPresenterProps {
  spec?: Dashboard;
  basename?: string;
  onStateChange?: (state: VariableState) => void;
  onDataChange?: (data: MaticoDataState) => void
}

export const MaticoAppPresenter: React.FC<MaticoAppPresenterProps> = ({
  spec,
  basename,
  onStateChange,
}) => {
  const dispatch = useMaticoDispatch();

  const firstLoad = useRef(true);

  // If the external spec changes, we want to update here
  // This will also set up the inital spec
  useEffect(() => {
    if (firstLoad.current) {
      dispatch(setSpec(spec));
    } else {
      firstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    spec.datasets.forEach((datasetDetails: { [type: string]: any }) => {
      const [type, details] = Object.entries(datasetDetails)[0];
      dispatch(
        registerDataset({
          ...details,
          type,
        })
      );
    });
  });

  const appSpec = useAppSpec();

  const appState = useMaticoSelector((state) => state.variables);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(appState);
    }
  }, [onStateChange, JSON.stringify(appState)]);

  return (
    <Router basename={basename}>
      {appSpec && (
        <Grid
          areas={["nav main"]}
          gridArea={"viewer"}
          columns={["static-size-900", "calc(100% - static-size-900)"]}
          rows={["flex"]}
          height="100%"
        >
          <View gridArea="nav">
            <MaticoNavBar pages={appSpec.pages} />
          </View>
          <Content gridArea="main">
            <Switch>
              {appSpec.pages.map((page, index) => (
                <Route
                  path={page.path ? page.path : page.name}
                  exact={true}
                  key={page.path}
                >
                  <MaticoPage
                    key={page.path}
                    page={page}
                    editPath={`pages.${index}`}
                  />
                </Route>
              ))}
            </Switch>
          </Content>
        </Grid>
      )}
    </Router>
  );
};
