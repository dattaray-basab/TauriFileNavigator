import { proxy, subscribe } from "valtio";

// Interface for the toggle state
interface ToggleState {
  isGroupSort: boolean;
}

// Initialize the store with values from localStorage or defaults
const initialState: ToggleState = {
  isGroupSort: localStorage.getItem("groupSort") !== "true", // default to true if not set
};

// Create the store
export const valtioToggleStates = proxy<ToggleState>(initialState);

// Subscribe to changes and persist them to localStorage
subscribe(valtioToggleStates, () => {
  localStorage.setItem("groupSort", String(valtioToggleStates.isGroupSort));
});

// Actions for updating the store
export const toggleActions = {

  toggleGroupSort: () => {
    valtioToggleStates.isGroupSort = !valtioToggleStates.isGroupSort;
  },
  setGroupSort: (value: boolean) => {
    valtioToggleStates.isGroupSort = value;
  },
};
