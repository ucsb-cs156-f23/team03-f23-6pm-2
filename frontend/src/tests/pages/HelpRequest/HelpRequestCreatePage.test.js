import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("HelpRequestCreatePage tests", () => {

    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        jest.clearAllMocks();
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    const queryClient = new QueryClient();
    test("renders without crashing", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HelpRequestCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("on submit, makes request to backend, and redirects to /helprequests", async () => {

        const queryClient = new QueryClient();
        const request = {
            id: 1,
            requesterEmail: "jgaucho@ucsb.edu",
            teamId: "1",
            teamOrBreakoutRoom: "team2",
            requestTime: "2021-03-10T00:00:00.000Z",
            explanation: "I need help",
            solved: false
        };

        axiosMock.onPost("/api/helprequests/post").reply(202, request);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <HelpRequestCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByLabelText("Email")).toBeInTheDocument();
        });

        const requesterEmailInput = screen.getByLabelText("Email");
        expect(requesterEmailInput).toBeInTheDocument();

        const teamIdInput = screen.getByLabelText("team id");
        expect(teamIdInput).toBeInTheDocument();

        const teamOrBreakoutRoomInput = screen.getByLabelText("Team Or Breakout Room");
        expect(teamOrBreakoutRoomInput).toBeInTheDocument();

        const requestTimeInput = screen.getByLabelText("Request Time (iso format)");
        expect(requestTimeInput).toBeInTheDocument();

        const explanationInput = screen.getByLabelText("Explanation");
        expect(explanationInput).toBeInTheDocument();

        const solvedInput = screen.getByLabelText("Solved");
        expect(solvedInput).toBeInTheDocument();

        const createButton = screen.getByText("Create");
        expect(createButton).toBeInTheDocument();

        fireEvent.change(requesterEmailInput, { target: { value: 'jgaucho1@ucsb.edu' } })
        fireEvent.change(teamIdInput, { target: { value: 'team-2' } })
        fireEvent.change(teamOrBreakoutRoomInput, { target: { value: '3' } })
        fireEvent.change(requestTimeInput, { target: { value: '2021-11-13T12:00' } })
        fireEvent.change(explanationInput, { target: { value: 'I need help.' } })
        fireEvent.change(solvedInput, { target: { value: 'true' } })
        fireEvent.click(createButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(0));

        expect(axiosMock.history.post[0].params).toEqual({
            requesterEmail: "jgaucho1@ucsb.edu",
            teamId: "team-2",
            teamOrBreakoutRoom: "3",
            requestTime: "2021-11-13T12:00",
            explanation: "I need help.",
            solved: "true"
        });

        // assert - check that the toast was called with the expected message
        expect(mockToast).toBeCalledWith("New HelpRequest Created - id: 1 requesterEmail: jgaucho@ucsb.edu");
        expect(mockNavigate).toBeCalledWith({ "to": "/helprequests" });

    });
});