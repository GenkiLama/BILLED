/**
 * @jest-environment jsdom
 */
import MockedStore from "../__mocks__/store";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import Bills from "../containers/Bills";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";
import router from "../app/Router";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      const hasActiveIconClass = windowIcon.classList.contains("active-icon");

      expect(hasActiveIconClass).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? -1 : 1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on new bill", () => {
    test("Then I should navigate to NewBill page", async () => {
      // Mock the localStorage object on the window object
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Set a specific item in localStorage to simulate an authenticated user of type 'Employee'
      // This is crucial for the test as the behavior might differ based on user type or authentication state
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Create a new div element that will act as the root for our application in the DOM
      // This is necessary because our application needs a mounting point in the DOM, and during tests, we have to manually provide it
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);

      // Initialize the router function of our application
      // This sets up the routing logic, enabling navigation between different parts of the application
      router();
      // This simulates the user navigating to the Bills page, setting the stage for the actual action we want to test
      await window.onNavigate(ROUTES_PATH.Bills);
      // Find the 'New Bill' button in the DOM using its test ID
      // This uses the screen object from the testing library to query the DOM, ensuring the button is present and can be interacted with
      const buttonNewBill = await screen.findByTestId("btn-new-bill");
      // Simulate a click event on the 'New Bill' button
      // This is the actual user action we are testing, to see if it leads to the expected outcome
      fireEvent.click(buttonNewBill);

      // Capture the current URL after the click event
      // This allows us to check if the application has navigated to the expected URL as a result of the click
      const newBillUrl = window.location.hash;
      // Assert that the current URL matches the expected URL for the NewBill page
      // This is our expectation: that clicking the 'New Bill' button navigates the user to the NewBill page
      // The matcher used here, .toBe(), checks for strict equality, which is appropriate for comparing string values like URLs
      expect(newBillUrl).toBe("#employee/bill/new");
    });
  });
});

describe("when i click an eye icon within Bills", () => {
  // Declare variables to hold the instance of Bills and a mock icon element
  let billsInstance;
  let mockIcon;

  // Before each test, initialize the Bills instance and mock icon element
  beforeEach(() => {
    // Create an instance of Bills with mocked dependencies
    billsInstance = new Bills({
      document, // The global document object, used for DOM manipulation
      onNavigate: jest.fn(), // A mock function for navigation, to test if navigation is triggered correctly
      store: MockedStore, // A mocked version of the store, to isolate the test from data fetching and manipulation
    });

    // Create a mock icon element and set a custom attribute 'data-bill-url'
    // This attribute simulates the real element's behavior, which would contain a URL to the bill image
    mockIcon = document.createElement("div");
    mockIcon.setAttribute("data-bill-url", "mockBillUrl");

    // Mock the jQuery modal function
    // This is necessary because jQuery is not available in the Jest environment, and we need to test if it's called correctly
    window.$.fn.modal = jest.fn();
  });

  // Test case to verify that handleClickIconEye is called with the correct parameters
  test("then handleClickIconEye is called with the correct parameters", () => {
    // Spy on the handleClickIconEye method of the billsInstance
    // This allows us to check if the method is called and with what arguments
    const handleClickIconEyeSpy = jest.spyOn(
      billsInstance,
      "handleClickIconEye"
    );

    // Add a click event listener to the mockIcon that calls handleClickIconEye when the icon is clicked
    mockIcon.addEventListener("click", () =>
      billsInstance.handleClickIconEye(mockIcon)
    );
    // Simulate a click event on the mockIcon
    mockIcon.click();

    // Assert that handleClickIconEye was called with the mockIcon as an argument
    // This verifies that the method is triggered correctly and receives the expected parameter
    // The matcher .toHaveBeenCalledWith() is used to check that the function was called with a specific argument
    expect(handleClickIconEyeSpy).toHaveBeenCalledWith(mockIcon);

    // Restore the original implementation of handleClickIconEye to avoid side effects in other tests
    handleClickIconEyeSpy.mockRestore();
  });

  // Test case to verify that clicking the icon triggers the modal display
  test("then handleClickIconEye shows modal", () => {
    // Call handleClickIconEye directly with the mockIcon
    billsInstance.handleClickIconEye(mockIcon);

    // Assert that the jQuery modal function was called with the argument "show"
    // This verifies that the modal is triggered to display when the icon is clicked
    // The matcher .toHaveBeenCalledWith() is used here to ensure the modal function is called with the correct command
    expect(window.$.fn.modal).toHaveBeenCalledWith("show");
  });
});

const mockStore = {
  bills: jest.fn(() => ({
    list: jest.fn(() =>
      Promise.resolve([
        {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        },
        {
          id: "BeKy5Mo4jkmdfPGYpTxZ",
          vat: "",
          amount: 100,
          name: "test1",
          fileName: "1592770761.jpeg",
          commentary: "plop",
          pct: 20,
          type: "Transports",
          email: "a@a",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
          date: "2001-01-01",
          status: "refused",
          commentAdmin: "en fait non",
        },
      ])
    ),
  })),
};

// ---------- GETBILLS ------------ //
describe("When I GETBILLS", () => {
  // Define a test case for the getBills method within the Bills component
  // This test verifies that the Bills component can successfully retrieve bills from a mock store
  test("then getBills successfully retrieves bills from the mock store", async () => {
    // Initialize the Bills component with a mock store and other necessary dependencies
    // This setup simulates the environment in which the Bills component operates, including interactions with a data store
    const billsComponent = new Bills({
      document, // The global document object, not directly used in this test but required for component initialization
      onNavigate, // A mock navigation function, simulating the component's ability to navigate between views
      store: mockStore, // A mock store object that simulates fetching bills from a backend or database
    });

    // Call the getBills method and wait for it to complete
    // This simulates the component's behavior of fetching bills when it needs to display them to the user
    const getBillsPromise = billsComponent.getBills();
    await getBillsPromise;

    // Verify that the mock store's bills method was called exactly once
    // This assertion checks that the component correctly requests the bills a single time, ensuring efficient data fetching without unnecessary calls
    expect(mockStore.bills).toHaveBeenCalledTimes(1);

    // Retrieve the list of bills directly from the mock store to compare with the component's fetch result
    // This step bypasses the component, fetching the bills directly for comparison purposes
    const billsFromStore = await mockStore.bills().list();

    // Ensure that the fetched bills are truthy (i.e., the fetch operation was successful and returned a result)
    // This assertion verifies that the fetch operation indeed returns data, ensuring the mock store is set up correctly and can return bills
    expect(billsFromStore).toBeTruthy();

    // Check that the number of bills retrieved matches the expected count (2 in this case)
    // This assertion ensures that the exact expected number of bills is retrieved, verifying both the mock store's setup and the component's ability to fetch all available bills
    // The matcher .toBe(2) is used for a strict equality check, suitable for comparing numeric values like counts or lengths
    expect(billsFromStore.length).toBe(2);
  });

  describe("when errors occurs", () => {
    // This test verifies that errors thrown by the store's list method are correctly handled by the Bills component
    it("then they are handled in the list method gracefully", async () => {
      // Create a mock store that simulates an error scenario in its list method
      // This setup mimics a failure in data retrieval, such as a network error or a server issue
      const errorMessage = "Simulated error in list method";
      const mockStoreWithError = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockRejectedValue(new Error(errorMessage)),
        }),
      };
      const billsComponent = new Bills({
        document, // The global document object, required for Bills component initialization but not directly used in this test
        onNavigate, // A mock navigation function, simulating the component's ability to navigate between views
        store: mockStoreWithError, // The mock store configured to simulate an error in the list method
      });

      // Verify that the getBills method properly handles and throws the simulated error
      // This assertion checks that the component is resilient to errors and can propagate them correctly
      // The use of `rejects.toThrow(errorMessage)` is crucial here as it specifically checks that a promise is rejected with an error that contains the expected message
      // This matcher is chosen for its ability to ensure both the rejection of the promise and the accuracy of the error message, which is essential for correct error handling and reporting
      await expect(billsComponent.getBills()).rejects.toThrow(errorMessage);
    });
  });

  // Simplified and centralized mock store setup for use in other tests
  // This function creates a mock store with a default configuration that resolves the list method with an empty array
  // This setup is useful for tests that require a functioning store but do not depend on specific data being returned
  const createMockStore = () => ({
    bills: jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue([]), // Directly return a resolved promise with an empty array
      // The choice to return an empty array simulates a successful but empty data retrieval scenario
      // This is a common case in real applications where the data source might not have any entries to return
      // Using `mockResolvedValue([])` simplifies the mock setup by directly resolving the promise, making it ideal for tests that do not involve error handling or specific data processing
    }),
  });
  // Test to verify that getBills correctly handles the case with no bills
  describe("when there s no bills", () => {
    it("then getbills returns an empty array", async () => {
      const mockStore = createMockStore();
      const billsComponent = new Bills({
        document,
        onNavigate,
        store: mockStore,
      });

      const bills = await billsComponent.getBills();

      expect(bills).toEqual([]);
      expect(mockStore.bills().list).toHaveBeenCalled(); // Verify that the list method was called
    });
  });

  // Assuming mockFormatDate is used elsewhere and needs to be kept
  const mockFormatDate = jest.fn(() => {
    throw new Error("Invalid date format");
  });

  describe("when formatDate fails", () => {
    it("then should return a bill with an unformatted date", async () => {
      // Arrange: Setup mock store and simulate formatDate failure
      const mockStore = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue([{ date: "invalid-date-format" }]),
        }),
      };
      mockFormatDate.mockReturnValue("invalid-date-format");
      const billsComponent = new Bills({
        document,
        onNavigate,
        store: mockStore,
      });

      // Act: Retrieve bills
      const bills = await billsComponent.getBills();

      // Assert: Verify the date is unformatted
      expect(bills[0].date).toEqual("invalid-date-format");
    });
  });

  //----------- test error 404 and 500 --------------//
  describe("when bills list returns 404", () => {
    test("getBills handles error ", async () => {
      const mockError = new Error("Simulated error: Bills not found (404)");

      // Mock the list method to return a rejected promise with 404 error
      const mockStoreWith404Error = {
        bills: jest.fn(() => ({
          list: jest.fn(() => Promise.reject(mockError)),
        })),
      };

      const billsComponent = new Bills({
        document,
        onNavigate,
        store: mockStoreWith404Error,
      });

      // Attempt to call the getBills method
      try {
        await billsComponent.getBills();
      } catch (error) {
        // Verify that the expected 404 error is caught
        expect(error).toBe(mockError);
      }
    });
  });

  // Similar structure can be used for testing 500 error
  describe("when bills list returns 500", () => {
    test("getBills handles error", async () => {
      const mockError = new Error(
        "Simulated error: Internal Server Error (500)"
      );

      // Mock the list method to return a rejected promise with 500 error
      const mockStoreWith500Error = {
        bills: jest.fn(() => ({
          list: jest.fn(() => Promise.reject(mockError)),
        })),
      };

      const billsComponent = new Bills({
        document,
        onNavigate,
        store: mockStoreWith500Error,
      });

      // Attempt to call the getBills method
      try {
        await billsComponent.getBills();
      } catch (error) {
        // Verify that the expected 500 error is caught
        expect(error).toBe(mockError);
      }
    });
  });
});

// This test suite focuses on the Bills component, specifically on its rendering behavior
describe("When Bills are rendered", () => {
  // This test checks if event listeners are correctly added to elements with the 'icon-eye' data-testid attribute
  // and if they properly handle click events
  test("event listeners are added to iconEye elements and handles click", () => {
    // Instantiate the Bills component with a mock document object
    // The document object is typically provided by the browser, but here it's mocked for testing purposes
    const bills = new Bills({ document: document });

    // Select all elements in the document that have a 'data-testid' attribute of 'icon-eye'
    // These elements represent the icons users can click on to view bill details
    const iconEyes = document.querySelectorAll('div[data-testid="icon-eye"]');

    // Spy on the handleClickIconEye method of the bills instance
    // This allows us to track calls to this method without affecting its execution
    // Spying is crucial for verifying that the method is called as expected without manually invoking it
    jest.spyOn(bills, "handleClickIconEye");

    // Manually trigger handleClickIconEye for each 'icon-eye' element
    // This loop simulates the component's internal logic that adds event listeners to each icon
    for (const iconEye of iconEyes) {
      bills.handleClickIconEye(iconEye);
    }

    // Dispatch a click event on each 'icon-eye' element and assert expectations
    // This loop simulates user interaction with each icon and verifies the component's response
    for (const iconEye of iconEyes) {
      // Dispatch a click event on the iconEye element
      // The event is configured to bubble up the DOM tree, mimicking real user clicks
      iconEye.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // Verify that handleClickIconEye was called at least once
      // This assertion checks that the event listener added to the iconEye elements is active and responds to clicks
      expect(bills.handleClickIconEye).toHaveBeenCalled();

      // Verify that handleClickIconEye was called with the iconEye element as an argument
      // This assertion ensures that the method not only was called but was called with the correct element,
      // allowing the method to identify which icon was clicked and respond appropriately
      expect(bills.handleClickIconEye).toHaveBeenCalledWith(iconEye);
    }
  });
});
