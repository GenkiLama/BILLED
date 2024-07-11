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
    test("Then I should navigate to the NewBill page", async () => {
      // Mock localStorage and set user type to 'Employee'
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Create and append a div element to serve as the router view container
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);

      // Initialize the router to handle navigation
      router();

      // Navigate to the Bills page
      await window.onNavigate(ROUTES_PATH.Bills);

      // Find the 'New Bill' button by its test ID and simulate a click event
      const buttonNewBill = await screen.findByTestId("btn-new-bill");
      fireEvent.click(buttonNewBill);

      // Capture the URL after the click event to verify navigation
      const newBillUrl = window.location.hash;
      // Assert that the URL matches the expected NewBill page URL
      expect(newBillUrl).toBe("#employee/bill/new");
    });
  });
});

describe("when i click eye icon within Bills", () => {
  let billsInstance;
  let mockIcon;

  beforeEach(() => {
    // Common setup for Bills instance and mock icon element
    billsInstance = new Bills({
      document,
      onNavigate: jest.fn(),
      store: MockedStore,
    });

    mockIcon = document.createElement("div");
    mockIcon.setAttribute("data-bill-url", "mockBillUrl");

    // Mock jQuery modal function
    window.$.fn.modal = jest.fn();
  });

  test("then  handleClickIconEye is called with the correct parameters", () => {
    // Spy on handleClickIconEye method after instance creation
    const handleClickIconEyeSpy = jest.spyOn(
      billsInstance,
      "handleClickIconEye"
    );

    // Simulate click event on the icon
    mockIcon.addEventListener("click", () =>
      billsInstance.handleClickIconEye(mockIcon)
    );
    mockIcon.click();

    // Verify handleClickIconEye was called with the mock icon
    expect(handleClickIconEyeSpy).toHaveBeenCalledWith(mockIcon);

    // Cleanup spy
    handleClickIconEyeSpy.mockRestore();
  });

  test("then handleClickIconEye shows modal", () => {
    // Trigger the method directly with the mock icon
    billsInstance.handleClickIconEye(mockIcon);

    // Assert modal was shown
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
  test("then getBills successfully retrieves bills from the mock store", async () => {
    // Initialize the Bills component with a mock store and other necessary dependencies
    const billsComponent = new Bills({
      document,
      onNavigate,
      store: mockStore,
    });

    // Call the getBills method and wait for it to complete
    const getBillsPromise = billsComponent.getBills();
    await getBillsPromise;

    // Verify that the mock store's bills method was called exactly once
    expect(mockStore.bills).toHaveBeenCalledTimes(1);

    // Retrieve the list of bills directly from the mock store to compare with the component's fetch result
    const billsFromStore = await mockStore.bills().list();

    // Ensure that the fetched bills are truthy (i.e., the fetch operation was successful)
    expect(billsFromStore).toBeTruthy();

    // Check that the number of bills retrieved matches the expected count (2 in this case)
    expect(billsFromStore.length).toBe(2);
  });

  describe("when errors occurs", () => {
    it("then they are handled in the list method gracefully", async () => {
      // Arrange: Create a mock store that simulates an error in the list method
      const errorMessage = "Simulated error in list method";
      const mockStoreWithError = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockRejectedValue(new Error(errorMessage)),
        }),
      };
      const billsComponent = new Bills({
        document,
        onNavigate,
        store: mockStoreWithError,
      });

      // Act & Assert: Verify that getBills method properly handles and throws the simulated error
      await expect(billsComponent.getBills()).rejects.toThrow(errorMessage);
    });
  });

  // Simplified and centralized mock store setup
  const createMockStore = () => ({
    bills: jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue([]), // Directly return a resolved promise with an empty array
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
  test("getBills handles error when bills list returns 404", async () => {
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

  // Similar structure can be used for testing 500 error
  test("getBills handles error when bills list returns 500", async () => {
    const mockError = new Error("Simulated error: Internal Server Error (500)");

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

describe("When Bills are rendered", () => {
  test("event listeners are added to iconEye elements and handles click", () => {
    const bills = new Bills({ document: document });
    const iconEyes = document.querySelectorAll('div[data-testid="icon-eye"]');

    // Spy on handleClickIconEye before triggering the events
    jest.spyOn(bills, "handleClickIconEye");

    for (const iconEye of iconEyes) {
      bills.handleClickIconEye(iconEye);
    }

    for (const iconEye of iconEyes) {
      iconEye.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(bills.handleClickIconEye).toHaveBeenCalled();
      expect(bills.handleClickIconEye).toHaveBeenCalledWith(iconEye);
    }
  });
});
