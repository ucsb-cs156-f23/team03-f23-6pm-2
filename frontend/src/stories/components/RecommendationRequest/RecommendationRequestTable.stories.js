import React from 'react';
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { RecommendationRequestFixtures } from 'fixtures/RecommendationRequestFixtures';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import { rest } from "msw";

export default {
    title: 'components/RecommendationRequest/RecommendationRequestTable',
    component: RecommendationRequestTable
};

const Template = (args) => {
    return (
        <RecommendationRequestTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    requests: []
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
    requests: RecommendationRequestFixtures.ThreeRequests,
    currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
    requests: RecommendationRequestFixtures.ThreeRequests,
    currentUser: currentUserFixtures.adminUser,
}

ThreeItemsAdminUser.parameters = {
    msw: [
        rest.delete('/api/recommendationrequests', (req, res, ctx) => {
            window.alert("DELETE: " + JSON.stringify(req.url));
            return res(ctx.status(200),ctx.json({}));
        }),
    ]
};

