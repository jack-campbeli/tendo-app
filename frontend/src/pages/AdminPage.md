# Documentation for AdminPage.jsx

## 1. Component Overview

The AdminPage.jsx component serves to allow admin users to create and pubish medical forms. The admin is able to name the form as well as add and delete any amount of components of the form. The form is modular and highly customizable.

## 2. State Management (`useState`)

For each piece of state, describe it:

- `formName`: The name of the form that is yet to be created. Needs to be a state because the user can update it at any time before finalizing the form.
- `fields`: An array of JS objects that contain a label, type, a requirement flag, and a unique id to allow the array to be indexed and mutated easily.
- `currentField`: The JS object of the field that is yet to be created. Needs to be a state because the user can change any of the attributes at any time before finalizing the field.
- `savedFormId`: The ID of the most recently saved form. When a form is created this value is updated and displays to the user.
- `isLoading`: Boolean of whether the API is loading.
- `error`: The current error. If a try-catch statement fails, error is set and is displayed.

## 3. Key User Actions (Tracing the Data Flow)

Describe the sequence of events for these actions, from user click to UI update.

### Action: Adding a New Field

1. User types in the "Field Label" input. What happens during the `onChange` event?
   1. The 'label' feature of the 'currentField' state hook is updated to be the event targets value i.e e.target.value.
2. User clicks the "Add Field" button. What does the `handleAddField` function do step-by-step?
   1. Verify there is a field label
   2. Create a JS object, newField, with all of the features of currentField + a unique ID
   3. Add NewField to the end of the array of fields
   4. Reset currentField and error statehook
3. How is the `fields` array updated? Why is `[...fields, newField]` used instead of `fields.push(newField)`?
   1. The fields array is updated using the spread operator. JS makes it easy to add a new elements to arrays because '...fields' represents all elements currently in fields: allowing newField to be slotted in at the end of the new array created.
4. What happens to the component's UI after `setFields` is called?
   1. The UI should reset/updated because setFields is a statehook which signals to React to updated the UI.

### Action: Saving the Form

1. User clicks the "Save Form" button. What does the `handleSaveForm` function do first?
   1. Validate there is a form name and that there is a least one field.
2. How is the `formData` object prepared for the API call? Explain the line: `fields: fields.map(({ id, ...field }) => field)`.
   1. For each field in fields, the 'id' feature is separated from the remaining features through use of the spread operator. The remaining features are then added back into the new array that is created from the .map() function.
3. Explain the `fetch` call. What do `await`, `JSON.stringify`, and the `method: 'POST'` mean?
   1. The fetch function makes a http request to the requested url.
   2. The 'await' tag requires fetch() to return a response until it is allowed to continue.
   3. JSON.stringify converts the fields JS object into a JSON formatted string.
   4. The POST method tells the fetch() method that it is making a POST request.
4. What happens when the backend responds successfully? How does the `savedFormId` state get updated?
   1. If the backend responds successfully, the JSON response is converted back into a JS object and its feature form_id is assigned to the 'SavedFormId' state hook.
5. How does the UI change to show the success message? Explain the conditional rendering (`{savedFormId ? ... : ...}`).
   1. If savedFormId exists, that which follows the ? is displayed, else that which follows the colon is displayed. Since savedFormId is a state hook, this UI can update dynamically.

## 4. Styling

- How is this component styled?
  - A separate CSS file is used.
- How are the styles from the CSS file connected to the JSX elements?
  - JSX elements are given class names that match the CSS styling in the AdminPage.css file.

## 5. API Communication

- What is the purpose of the `handleSaveForm` function?
  - The purpose of the function, handleSaveForm, is to send the sequence of response fields to the backend to be stored and saved.
- What data is sent to the backend API?
  - The sequence of response fields of the current form.
- What response does the backend send back?
  - The backend returns a 200 OK response and the ID of the form that it had received.
- How does the frontend handle both successful and failed API calls?
  - It handles succesful and failed API calls using try-except conditional logic.

## 6. Field Management Functions

- `handleAddField`: What does this function do? What validation does it perform?
  - First, the function validates that a label had been selected before creation.
  - The function simply adds the current field that is being created into the array of fields in the form. Once the field is added, the currentfield statehook is then reset.
- `handleRemoveField`: How does this function remove a field from the list?
  - The function simply filters out the field that has the same fieldId as the input to the function and reassigns the Fields state hook to the new, filtered array.
- `handleMoveFieldUp` and `handleMoveFieldDown`: How do these functions reorder fields in the list?
  - Both of the functions take in the index of the current feature to be moved.
  - The fields as they are current ordered are spread out and assigned to a new array called newFields.
  - Array destructuring is used to allow the swapping of array elements. (I am still getting used to this because I don't believe Python has this and I am used to having a temp variable to swap elements).
  - Then newFields is assigned to the Fields state hook.

## 7. Conditional Rendering

- When does the component show the form builder interface vs. the success message?
  - If savedFormId is not null, the success message will render, else the form builder will render. When handleStartNewForm is called, a savedFormId is cleared/nulled.
- How does the `savedFormId` state control what the user sees?
  - Same as above.

## 8. Error Handling

- How are validation errors displayed to the user?
  - setError is called during most of the validation steps. If error exists then and error message will displayed. Since its a state hook, the UI will rerender whenever there is a change.
- How are API errors handled and displayed?
  - If there is an issue with the POST request, and error is thrown which diverts to the catch block. The state hook error is then assigned a value and error UI elements are rendered.
  - If there is an issue with the GET request, an

## 9. Key React Concepts Used

- **useState**: How is state managed in this component?
  - useState are special variables with built in setters. Whenever these variables are updated, React gets a signal to update the UI.
- **Event Handlers**: How do user interactions trigger state updates?
  - When inputs or buttons are pressed on the UI, the statehooks setters are called and state hooks are updated accordingly.
- **Array Methods**: How are `map`, `filter`, and spread operator used?
  - map and filter are used to update existing arrays of elements. These functions create new arrays as an output and are often reassigned as the new state hook variable.
  - The spread operator is used to either spread all elements in an array out or isolate a specific element of an array to manipulate.
- **Destructuring**: How is the rest operator (`...field`) used?
  - '...field' represents all elements of the array field that are not explicitly referenced/written out.
- **Async/Await**: How is the API call handled asynchronously?
  - Whenever an API request needs to be made, an async function is used. An async function allows it to return a promise and use the await tag -- to require the fetch function to wait for a response before continuing.

## 10. Questions for Further Learning

- What would happen if we removed the `key` prop from the field list mapping?

  - I'm not actually sure. I think i need more inline comments in this section to clear things up. I assume that is key was removed, there would be issues with fields that have all of the same features but are different.
  - **Correction & Clarification:** You're on the right track! Without a `key`, React gets confused when you add, remove, or reorder items. It uses the `key` to identify which item is which.
  - - **Performance:** It helps React update the list efficiently without re-rendering every single item from scratch.
  - - **Bugs:** Removing it can lead to weird bugs, especially with form inputs inside the list, where state might get mixed up between items. We use `field.id` because it's guaranteed to be unique for each field.

- Why do we need to use the spread operator when updating arrays in React?

  - I don't know for certain but I think that I might be because you have to use the built in setters of the state hook and in order to update the state hook variables you have to set the statehook once again. The spread operator is useful here because it allows you to reference all values in an array cleanly.
  - **Correction & Clarification:** This is a crucial concept in React called **immutability**.
  - - **You must not change state directly.** Using `fields.push()` _mutates_ (changes) the original array. React won't "see" this change and won't re-render the UI.
  - - **You must create a new array.** The spread operator (`[...fields, newField]`) creates a brand new array. When you pass this new array to `setFields`, React compares the old array with the new one, sees that they are different, and triggers a re-render.

- What is the difference between `onChange` and `onClick` events?

  - I'm not sure once again but many its because onClick is used for only buttons and onChange is used in input fields?
  - **Correction & Clarification:** You've got it exactly right!
  - - **`onClick`**: Fires when a user clicks on an element. It can be used on almost any element (`<button>`, `<div>`, `<span>`, etc.).
  - - **`onChange`**: Fires when the _value_ of a form element changes. It's specifically for `<input>`, `<select>`, and `<textarea>` elements.

- How does React know when to re-render the component?
  - When a state hook is changed.
  - **Correction & Clarification:** Correct! Whenever you call a state setter function (like `setFields`, `setFormName`, etc.) with a new value, React schedules a re-render for that component and all of its children. It then calculates the most efficient way to update the actual DOM to match the new state.
