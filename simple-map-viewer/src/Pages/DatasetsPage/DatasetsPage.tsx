import React from 'react';
import { DatasetCreationForm } from '../../Components/DatasetCreationForm/DatasetCreationForm';
import { DatasetList } from '../../Components/DatasetList/DatasetList';
import { Styles } from './DatasetsPageStyles';
import { FlexSeperator } from '../../Components/Layout/Layout';
import { Button, ButtonType } from '../../Components/Button/Button';

import {
    Page,
    PageContent,
    DetailsArea,
} from '../../Components/Layout/Layout';

interface DatasetPageProps {}

export const DatasetsPage: React.FC<DatasetPageProps> = ({}) => {
    return (
        <Page>
            <DetailsArea>
                <h1>Datasets</h1>

                <FlexSeperator />
                <Button kind={ButtonType.Primary}>
                    Add Datasets
                </Button>
            </DetailsArea>
            <Styles.DatasetsPage>
                <DatasetList />
                <DatasetCreationForm />
            </Styles.DatasetsPage>
        </Page>
    );
};
