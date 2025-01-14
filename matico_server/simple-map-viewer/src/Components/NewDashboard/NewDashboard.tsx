import React from 'react';
import { Paper } from '../Layout/Layout';
import { Form } from '../Forms/Forms';
import { Button, ButtonType } from '../Button/Button';
import {createDashboard} from 'api'

import {
    CreateDashboardDTO,
    DefaultMapStyle,
} from 'types';
import { useForm } from 'react-hook-form';

interface NewDashboardProps {
    onCreated?: () => void;
}

export const NewDashboard: React.FC<NewDashboardProps> = ({
    onCreated
}) => {
    const { register, handleSubmit, errors } = useForm();

    const attemptCreateDashboard = (
        newDashboard: CreateDashboardDTO,
    ) => {
        newDashboard.map_style = DefaultMapStyle;
        console.log(newDashboard);
        createDashboard(newDashboard)
            .then((result :any) => {
                if(onCreated){
                    console.log("running on created")
                    onCreated()
                }
                console.log('Gor dashboard ', result.data);
            })
            .catch((e : Error) => {
                console.log('Failed to create dashboard ', e);
            });
    };

    return (
        <Paper>
            <Form onSubmit={handleSubmit(attemptCreateDashboard)}>
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="name"
                    ref={register({ required: true })}
                />
                {errors.name && errors.name.type === 'required' && (
                    <p className="errorMsg">Name is required.</p>
                )}
                <label>Description</label>
                <input
                    type="text"
                    name="description"
                    placeholder="dashboard description"
                    ref={register({ required: true, minLength: 6 })}
                />
                {errors.description &&
                    errors.description.type === 'required' && (
                        <p className="errorMsg">
                            Description is required.
                        </p>
                    )}
                {errors.description &&
                    errors.description.type === 'minLength' && (
                        <p className="errorMsg">
                            Description should be longer.
                        </p>
                    )}
                <label>Public</label>
                <input
                    type="checkbox"
                    name="public"
                    placeholder="dashboard description"
                    ref={register}
                />

                <Button type="submit" kind={ButtonType.Primary}>
                    Create
                </Button>
            </Form>
        </Paper>
    );
};
