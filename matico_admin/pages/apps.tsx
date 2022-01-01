import type { NextPage } from "next";
import { Layout } from "../components/Layout";
import {
  Divider,
  View,
  Dialog,
  Content,
  Heading,
  Header,
  ButtonGroup,
  Text,
  Button,
  DialogTrigger,
  Form,
  TextField,
  TextArea,
} from "@adobe/react-spectrum";
import { GetServerSideProps } from "next";
import { useApps } from "../hooks/useApps";
import { Link as ALink, ActionButton } from "@adobe/react-spectrum";
import Link from "next/link";

import {
  Cell,
  Column,
  Row,
  TableView,
  TableBody,
  TableHeader,
} from "@adobe/react-spectrum";
import { useState } from "react";
import { NewAppDialog } from "../components/NewAppDialog";

const Apps: NextPage<{ appsInitial: Array<any> }> = () => {
  const { data: apps, error, createApp } = useApps();

  const submit = (details) => {
    console.log("Submitting ", details);
    createApp(details);
  };

  return (
    <Layout>
      <View backgroundColor="gray-200" padding="size-100" gridArea="sidebar">
        <Heading>Apps</Heading>
        <Content>
          <Text>
            These are your apps, they are full blown applications that you can
            build using a GUI
          </Text>
        </Content>
      </View>
      <View gridArea="content">
        <h3>Apps</h3>
        <Divider size="S" />
        {apps && (
          <TableView
            aria-label="Example table with static contents"
            selectionMode="multiple"
            marginY="size-40"
          >
            <TableHeader>
              <Column>Name</Column>
              <Column>Access</Column>
            </TableHeader>
            <TableBody>
              {apps.map((app: any) => (
                <Row>
                  <Cell>
                    <ALink>
                      <Link href={`/apps/${app.id}`}>{app.name}</Link>
                    </ALink>
                  </Cell>
                  <Cell>{app.public ? "Public" : "Private"}</Cell>
                </Row>
              ))}
            </TableBody>
          </TableView>
        )}
        <NewAppDialog
          onSubmit={(data) => {
            console.log("Submit data is ", data);
            submit(data);
          }}
        />
      </View>
      <View backgroundColor="magenta-600" gridArea="footer" />
    </Layout>
  );
};

export default Apps;