import React from "react";

const ToggleCategory = ({
  type,
  legendItems,
  checkedClasses,
  setCheckedClasses,
  expandedState,
  setExpandedState,
}) => {
  // Function to select all items in the specified type (both main and expanded)
  const handleSelectAll = () => {
    const updatedClasses = { ...checkedClasses };
    const categoryItems = legendItems.find((group) => group.group === type)?.items || [];

    // Update main category checkboxes
    categoryItems.forEach((item) => {
      updatedClasses[item.class] = true;
    });
    setCheckedClasses(updatedClasses);

    // Update expanded items
    if (expandedState && setExpandedState) {
      const updatedExpandedState = { ...expandedState };
      Object.entries(updatedExpandedState).forEach(([id, details]) => {
        if (categoryItems.some((item) => item.label === details.label)) {
          updatedExpandedState[id] = { ...details, visible: true };
        }
      });
      setExpandedState(updatedExpandedState);
    }
  };

  // Function to unselect all items in the specified type (both main and expanded)
  const handleUnselectAll = () => {
    const updatedClasses = { ...checkedClasses };
    const categoryItems = legendItems.find((group) => group.group === type)?.items || [];

    // Update main category checkboxes
    categoryItems.forEach((item) => {
      updatedClasses[item.class] = false;
    });
    setCheckedClasses(updatedClasses);

    // Update expanded items
    if (expandedState && setExpandedState) {
      const updatedExpandedState = { ...expandedState };
      Object.entries(updatedExpandedState).forEach(([id, details]) => {
        if (categoryItems.some((item) => item.label === details.label)) {
          updatedExpandedState[id] = { ...details, visible: false };
        }
      });
      setExpandedState(updatedExpandedState);
    }
  };

  // Check if all main items in this category are selected
  const allSelected = legendItems
    .find((group) => group.group === type)
    ?.items.every((item) => checkedClasses[item.class]);

  return (
    <a
      onClick={() => {
        if (allSelected) {
          handleUnselectAll();
        } else {
          handleSelectAll();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      {allSelected ? "Unselect all" : "Select all"}
    </a>
  );
};

export default ToggleCategory;