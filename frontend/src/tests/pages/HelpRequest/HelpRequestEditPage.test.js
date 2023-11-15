import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        useParams: () => ({
            id: 17
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("HelpRequestEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <HelpRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Help Request");
            expect(screen.queryByTestId("HelpRequest-requesterEmail")).not.toBeInTheDocument();
            restoreConsole();
        });
    });

    describe("tests where backend is working normally", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
                id: 17,
                requesterEmail: "jgaucho@ucsb.edu",
                teamId: "team-1",
                tableOrBreakoutRoom: "table-1",
                requestTime: "2021-10-13T12:00:00",
                explanation: "I need help with team02",
                solved: false
            });
            axiosMock.onPut('/api/helprequests').reply(200, {
                id: "17",
                requesterEmail: "jgaucho@ucsb.edu",
                teamId: "team-1",
                tableOrBreakoutRoom: "table-1",
                requestTime: "2021-10-13T12:00:00",
                explanation: "I need help with team02",
                solved: "false"
            });
        });

        const queryClient = new QueryClient();
    
        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <HelpRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("HelpRequestForm-id");

            const idField = screen.getByTestId("HelpRequestForm-id");
            const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
            const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
            const tableOrBreakoutRoomField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
            const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
            const explanationField = screen.getByTestId("HelpRequestForm-explanation");
            const solvedField = screen.getByTestId("HelpRequestForm-solved");
            const submitButton = screen.getByTestId("HelpRequestForm-submit");

            expect(idField).toBeInTheDocument();
            expect(idField).toHaveValue("17");
            expect(requesterEmailField).toBeInTheDocument();
            expect(requesterEmailField).toHaveValue("jgaucho@ucsb.edu");
            expect(teamIdField).toBeInTheDocument();
            expect(teamIdField).toHaveValue("team-1");
            expect(tableOrBreakoutRoomField).toBeInTheDocument();
            expect(tableOrBreakoutRoomField).toHaveValue("table-1");
            expect(requestTimeField).toBeInTheDocument();
            expect(requestTimeField).toHaveValue("2021-10-13T12:00");
            expect(explanationField).toBeInTheDocument();
            expect(explanationField).toHaveValue("I need help with team02");
            expect(solvedField).toBeInTheDocument();
            expect(solvedField).toHaveValue("false");

            expect(submitButton).toHaveTextContent("Update");

            fireEvent.change(requesterEmailField, { target: { value: 'jgaucho1@ucsb.edu' } });
            fireEvent.change(teamIdField, { target: { value: 'team-2' } });
            fireEvent.change(tableOrBreakoutRoomField, { target: { value: 'table-2' } });
            fireEvent.change(requestTimeField, { target: { value: '2021-11-13T12:00:00' } });
            fireEvent.change(explanationField, { target: { value: 'I need help with team03' } });
            fireEvent.change(solvedField, { target: { value: 'true' } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Help Request Updated - id: 17 requesterEmail: jgaucho@ucsb.edu");
            
            expect(mockNavigate).toBeCalledWith({ "to": "/helprequests" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                requesterEmail: "jgaucho1@ucsb.edu",
                teamId: "team-2",
                tableOrBreakoutRoom: "table-2",
                requestTime: "2021-11-13T12:00",
                explanation: "I need help with team03",
                solved: "true"
            })); // posted object


        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <HelpRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("HelpRequestForm-id");

            const idField = screen.getByTestId("HelpRequestForm-id");
            const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
            const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
            const tableOrBreakoutRoomField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
            const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
            const explanationField = screen.getByTestId("HelpRequestForm-explanation");
            const solvedField = screen.getByTestId("HelpRequestForm-solved");
            const submitButton = screen.getByTestId("HelpRequestForm-submit");

            expect(idField).toHaveValue("17");
            expect(requesterEmailField).toHaveValue("jgaucho@ucsb.edu");
            expect(teamIdField).toHaveValue("team-1");
            expect(tableOrBreakoutRoomField).toHaveValue("table-1");
            expect(requestTimeField).toHaveValue("2021-10-13T12:00");
            expect(explanationField).toHaveValue("I need help with team02");
            expect(solvedField).toHaveValue("false");

            fireEvent.change(requesterEmailField, { target: { value: 'jgaucho1@ucsb.edu' } });
            fireEvent.change(teamIdField, { target: { value: 'team-2' } });
            fireEvent.change(tableOrBreakoutRoomField, { target: { value: 'table-2' } });
            fireEvent.change(requestTimeField, { target: { value: '2021-11-13T12:00:00' } });
            fireEvent.change(explanationField, { target: { value: 'I need help with team03' } });
            fireEvent.change(solvedField, { target: { value: 'true' } });

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Help Request Updated - id: 17 requesterEmail: jgaucho@ucsb.edu");
            expect(mockNavigate).toBeCalledWith({ "to": "/helprequests" });
        });

       
    });
});
