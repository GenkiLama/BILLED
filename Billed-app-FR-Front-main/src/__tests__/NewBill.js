/**
 * @jest-environment jsdom
 */
import NewBill from "../containers/NewBill.js";
import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then a form should be displayed", () => {
      // Display the NewBill UI in the document body
      document.body.innerHTML = NewBillUI();

      // Use the screen object to query the DOM
      const form = screen.getByTestId("form-new-bill");
      const type = screen.getAllByTestId("expense-type");
      const name = screen.getAllByTestId("expense-name");
      const date = screen.getAllByTestId("datepicker");
      const amount = screen.getAllByTestId("amount");
      const vat = screen.getAllByTestId("vat");
      const pct = screen.getAllByTestId("pct");
      const commentary = screen.getAllByTestId("commentary");
      const file = screen.getAllByTestId("file");
      const sendButton = document.querySelector("#btn-send-bill");

      // Verify that all form elements are present
      expect(form).toBeTruthy();
      expect(type).toBeTruthy();
      expect(name).toBeTruthy();
      expect(date).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(file).toBeTruthy();
      expect(sendButton).toBeTruthy();
    });

    describe("when uploading a correct file", () => {
      // Define a test case to verify user's email is saved during file upload
      test("then i should save the user's email", () => {
        // Mock getElementById to return an empty object
        const mockGetElementById = jest.fn(() => ({}));
        // Mock a function to simulate file upload response
        const createMock = jest
          .fn()
          .mockResolvedValue({ fileUrl: "fileURL", key: "key" });
        // Create a mock file with the correct format
        const goodFormatFile = new File([""], "image.png", {
          type: "image/png",
        });
        // Mock document.querySelector to handle file input and addEventListener
        const documentMock = {
          querySelector: jest.fn((selector) => {
            if (selector === 'input[data-testid="file"]') {
              return { files: [goodFormatFile], addEventListener: jest.fn() };
            }
            return { addEventListener: jest.fn() };
          }),
          getElementById: mockGetElementById,
        };
        // Set user email in localStorage
        localStorage.setItem("user", '{"email" : "user@email.com"}');
        // Mock store to simulate backend calls
        const storeMock = {
          bills: () => ({ create: createMock }),
        };
        // Instantiate NewBill with mocked dependencies
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: jest.fn(),
          store: storeMock,
          localStorage: window.localStorage,
        });
        // Simulate file change event to trigger email saving
        objInstance.handleChangeFile({
          preventDefault: jest.fn(),
          target: { value: "image.png" },
        });
        // Define expected email to verify against
        const expectedEmail = "user@email.com";
        // Extract formData from the mock function call to verify email was saved
        const formData = createMock.mock.calls[0][0].data;
        // Assert that the email saved matches the expected email
        expect(formData.get("email")).toEqual(expectedEmail);
      });
    });

    // Test suite for submitting a new bill
    describe("when submitting a new bill", () => {
      // Test case to verify if the updateBill method is called with the correct data
      test("then should call the updateBill method on the store with correct data", () => {
        // Helper function to create a mock file object
        const createFileMock = () =>
          new File(["img"], "image.png", { type: "image/png" });
        // Helper function to create a mock HTML element with a value and a mock addEventListener
        const createMockElement = (value) => ({
          value,
          addEventListener: jest.fn(),
        });

        // Mock for document.querySelector and getElementById to return predefined objects or functions
        const documentMock = {
          querySelector: jest.fn((selector) => {
            // Object mapping selectors to their mock return values
            const selectors = {
              'input[data-testid="file"]': {
                files: [createFileMock()],
                addEventListener: jest.fn(),
              },
              'select[data-testid="expense-type"]': createMockElement("type"),
              'input[data-testid="expense-name"]': createMockElement("name"),
              'input[data-testid="amount"]': createMockElement("3000"),
              'input[data-testid="datepicker"]': createMockElement("date"),
              'input[data-testid="vat"]': createMockElement("vat"),
              'input[data-testid="pct"]': createMockElement("25"),
              'textarea[data-testid="commentary"]':
                createMockElement("commentary"),
            };
            // Return the mock element for the given selector, or a default mock if not found
            return selectors[selector] || { addEventListener: jest.fn() };
          }),
          getElementById: jest.fn().mockReturnValue({}),
        };

        // Mock for the update method of the store
        const mockUpdate = jest.fn().mockResolvedValue({});
        // Mock store with a bills function returning an object with the update mock
        const storeMock = { bills: () => ({ update: mockUpdate }) };

        // Creating an instance of NewBill with mocked dependencies
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: jest.fn(),
          store: storeMock,
          localStorage: {},
        });
        // Simulating form submission
        objInstance.handleSubmit({
          preventDefault: jest.fn(), // Mocking event.preventDefault
          target: documentMock,
        });

        // Defining the expected data object to be passed to the update method
        const expectedData = {
          email: "user@email.com",
          type: "type",
          name: "name",
          amount: 3000,
          date: "date",
          vat: "vat",
          pct: 25,
          commentary: "commentary",
          fileUrl: null,
          fileName: null,
          status: "pending",
        };

        // Asserting that the update method was called with the expected data
        expect(JSON.parse(mockUpdate.mock.calls[0][0].data)).toMatchObject(
          expectedData
        );
      });
    });
  });
});
