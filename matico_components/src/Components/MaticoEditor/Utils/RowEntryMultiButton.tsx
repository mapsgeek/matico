import React from "react";
import {
  Content,
  Flex,
  ActionButton,
  DialogTrigger,
  Dialog,
  Heading,
  View,
  Button,
  ActionGroup,
  Item,
  Text,
  Well,
} from "@adobe/react-spectrum";
import Edit from "@spectrum-icons/workflow/Edit";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import Delete from "@spectrum-icons/workflow/Delete";
import Copy from "@spectrum-icons/workflow/Copy";
import Duplicate from "@spectrum-icons/workflow/Duplicate";
import Settings from "@spectrum-icons/workflow/Settings";

interface RowEntryMultiButtonProps {
  entryName: string | React.ReactNode;
  index: number;
  setEdit: (index: number) => void;
  changeOrder?: (index: number, direction: "up" | "down") => void;
  deleteEntry?: (index: number) => void;
  duplicateEntry?: (index: number) => void;
}

export const RowEntryMultiButton: React.FC<RowEntryMultiButtonProps> = ({
  // TODO: arial labels
  index,
  entryName,
  setEdit,
  changeOrder,
  deleteEntry,
  duplicateEntry,
}) => (
  <Well marginTop="size-100">
    <Flex direction="row" margin="0" gap="size-50" width="100%" alignContent={"center"}>
      <View maxWidth={"50%"} overflow={"hidden"} flexGrow={1} justifySelf={"left"} alignSelf="center">
        <Text>{entryName}</Text>
      </View>
      <ActionGroup
        isQuiet
        buttonLabelBehavior="hide"
        overflowMode="collapse"
        justifySelf={"end"}
        maxWidth="50%"
        onAction={(action) => {
          switch (action) {
            case "delete":
              deleteEntry(index)
            case "edit":
              setEdit(index);
              break;
            case "duplicate":
              duplicateEntry(index);
              break;
            case "moveUp":
              changeOrder(index, "up");
              break;
            case "moveDown":
              changeOrder(index, "down");
              break;
            default:
              return;
          }
        }}
      >
        <Item key="edit">
          <Settings />
          <Text>Edit</Text>
        </Item>

        {duplicateEntry !== undefined && (
          <Item key="duplicate">
            <Duplicate />
            <Text>Duplicate</Text>
          </Item>
        )}
        {changeOrder !== undefined && (
          <Item key="moveUp">
            <ChevronUp />
            <Text>Bring Forward</Text>
          </Item>
        )}
        {changeOrder !== undefined && (
          <Item key="moveDown">
            <ChevronDown />
            <Text>Send Backward</Text>
          </Item>
        )}
      </ActionGroup>

      {deleteEntry !== undefined && (
        <View justifySelf={"end"}>
          <DialogTrigger
            isDismissable
            type="popover"
            mobileType="tray"
            containerPadding={1}
          >
            <ActionButton isQuiet>
              <Delete />
            </ActionButton>
            {(close) => (
              <Dialog>
                <Heading>Gone, forever?</Heading>
                <Content marginTop="size-100">
                  <Button
                    variant="negative"
                    onPress={() => {
                      deleteEntry(index);
                      close();
                    }}
                  >
                    <Delete /> Delete
                  </Button>
                </Content>
              </Dialog>
            )}
          </DialogTrigger>
        </View>
      )}
    </Flex>
  </Well>
);