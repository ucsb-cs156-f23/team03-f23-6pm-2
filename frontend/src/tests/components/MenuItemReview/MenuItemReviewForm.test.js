import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("MenuItemReviewForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["Menu Item ID", "Email", "Stars", "Date (iso format)", "Comments"];
    const testId = "MenuItemReviewForm";

    test("renders correctly", async () => {

        render(
            <Router  >
                <MenuItemReviewForm />
            </Router>
        );
        await screen.findByText(/Menu Item ID/);
        await screen.findByText(/Create/);
    });

    test("renders correctly when passing in a MenuItemReview", async () => {

        render(
            <Router  >
                <MenuItemReviewForm initialContents={menuItemReviewFixtures.oneMenuItemReview} />
            </Router>
        );
        await screen.findByTestId(/MenuItemReviewForm-id/);
        expect(screen.getByText(/Id/)).toBeInTheDocument();
        expect(screen.getByTestId(/MenuItemReviewForm-id/)).toHaveValue("1");
    });

    test("Correct Error messsages on missing input", async () => {

        render(
            <Router  >
                <MenuItemReviewForm />
            </Router>
        );
        await screen.findByTestId("MenuItemReviewForm-submit");
        const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

        fireEvent.click(submitButton);

        await screen.findByText(/Menu Item ID is required./);
        expect(screen.getByText(/Email is required./)).toBeInTheDocument();
        expect(screen.getByText(/Stars are required./)).toBeInTheDocument();
        expect(screen.getByText(/Date is required./)).toBeInTheDocument();

    });

    test("No Error messsages on good input", async () => {

        const mockSubmitAction = jest.fn();


        render(
            <Router  >
                <MenuItemReviewForm submitAction={mockSubmitAction} />
            </Router>
        );
        await screen.findByTestId("MenuItemReviewForm-itemId");

        const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
        const reviewerEmailField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
        const starsField = screen.getByTestId("MenuItemReviewForm-stars");
        const dateReviewedField = screen.getByTestId("MenuItemReviewForm-dateReviewed");
        const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
        const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

        fireEvent.change(itemIdField, { target: { value: '1' } });
        fireEvent.change(reviewerEmailField, { target: { value: 'reviewer1@ucsb.edu' } });
        fireEvent.change(starsField, { target: { value: '1' } });
        fireEvent.change(dateReviewedField, { target: { value: '2023-01-02T12:00:00' } });
        fireEvent.change(commentsField, { target: { value: 'review1' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

        expect(screen.queryByText(/Minimum rating of 1 star/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Maximum rating of 5 stars/)).not.toBeInTheDocument();
        expect(screen.queryByText(/localDateTime must be in ISO format/)).not.toBeInTheDocument();

    });

    test("that navigate(-1) is called when Cancel is clicked 1", async () => {

        render(
            <Router  >
                <MenuItemReviewForm />
            </Router>
        );
        await screen.findByTestId("MenuItemReviewForm-cancel");
        const cancelButton = screen.getByTestId("MenuItemReviewForm-cancel");

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));

    });

    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

    });

    test("renders correctly when passing in initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm initialContents={menuItemReviewFixtures.oneMenuItemReview} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
        expect(screen.getByText(`Id`)).toBeInTheDocument();
    });

    test("that navigate(-1) is called when Cancel is clicked 2", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm />
                </Router>
            </QueryClientProvider>
        );
        expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
        const cancelButton = screen.getByTestId(`${testId}-cancel`);

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });

    test("that the correct validations are performed", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);

        await screen.findByText(/Menu Item ID is required/);
        expect(screen.getByText(/Email is required/)).toBeInTheDocument();
        expect(screen.getByText(/Stars are required/)).toBeInTheDocument();
        expect(screen.getByText(/Date is required/)).toBeInTheDocument();

        const starsInput = screen.getByTestId(`${testId}-stars`);
        fireEvent.change(starsInput, { target: { value: "0" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Minimum rating of 1 star/)).toBeInTheDocument();
        });

        const starsInput1 = screen.getByTestId(`${testId}-stars`);
        fireEvent.change(starsInput1, { target: { value: "6" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Maximum rating of 5 stars/)).toBeInTheDocument();
        });
    });

});