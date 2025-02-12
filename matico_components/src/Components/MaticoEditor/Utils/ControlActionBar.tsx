import React from "react";
import { useIsEditable } from "Hooks/useIsEditable";
// import {useHover} from '@react-aria/interactions';

import { View, ActionGroup, Item, Text } from "@adobe/react-spectrum";
import Settings from "@spectrum-icons/workflow/Settings";
import Delete from "@spectrum-icons/workflow/Delete";
import styled from "styled-components";
import Move from "@spectrum-icons/workflow/Move";
import Info from "@spectrum-icons/workflow/Info";
import Duplicate from "@spectrum-icons/workflow/Duplicate";
import { useSpecActions } from "Hooks/useSpecActions";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import { reorderAtSpec } from "Stores/MaticoSpecSlice";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";

interface ControlActionBarProps {
  editPath: string;
  editType?: string;
  actions?: string[];
}

const ControlBarContainer = styled.div`
  opacity:0.1;
  transition: 250ms opacity ease-in;
  position:absolute;
  width:100%;
  top:0;
  left:0;
  z-index:20;
  &:hover {
    opacity:1;
  }
`

export const ControlActionBar: React.FC<ControlActionBarProps> = ({
  editPath,
  editType,
  actions=[''],
}) => {
  const edit = useIsEditable();
  const {
    openEditor,
    remove,
    duplicate,
    move,
    reorder
  } = useSpecActions(
    editPath,
    editType,
  );

  if (!edit) return null;
  return (
    <ControlBarContainer>
      <View
        backgroundColor="informative"
        borderColor="default"
        borderWidth="thin"
      >
        <ActionGroup
          isQuiet
          buttonLabelBehavior="hide"
          overflowMode="collapse"
          onAction={(action) => {
              switch (action) {
                case "delete":
                  remove();
                  break;
                case "edit":
                  openEditor()
                  break;
                case "docs":
                  typeof window !== "undefined" && window.open(`https://matico.app/docs/panes/${editPath.split('.').slice(-1)[0]}`, "_blank")
                  break;
                case "duplicate":
                  duplicate();
                  break
                case "reorder-forward":
                  reorder('forward')
                  break;
                case "reorder-backward":
                  reorder('backward')
                  break;
                case "move":
                  console.log('MOVING NOT YET IMPLEMENTED')
                  break;
                default:
                  return;
                  
                }
              }}
          >
          <Item key="move">
              <Move />
              <Text>Move</Text>
          </Item>
          <Item key="edit">
              <Settings />
              <Text>Edit</Text>
          </Item>
          <Item key="duplicate">
              <Duplicate />
              <Text>Duplicate</Text>
          </Item>
          <Item key="docs">
              <Info/>
              <Text>Pane Documentation</Text>
          </Item>
          <Item key="delete">
              <Delete/>
              <Text>Delete</Text>
          </Item>
          <Item key="reorder-backward">
              <ChevronUp />
              <Text>Bring towards Front</Text>
          </Item>
          <Item key="reorder-forward">
              <ChevronDown />
              <Text>Send towards Back</Text>
          </Item>
        </ActionGroup>
      </View>
    </ControlBarContainer>
  );
};
