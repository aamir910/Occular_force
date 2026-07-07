import React from "react";

const ToggleCategory = ({
  type,
  legendItems,
  checkedClasses,
  setCheckedClasses,
  expandedState,
  setExpandedState,
}) => {
  const handleSelectAll = () => {
    const updatedClasses = { ...checkedClasses };
    const categoryItems = legendItems.find((group) => group.group === type)?.items || [];

    categoryItems.forEach((item) => {
      updatedClasses[item.class] = true;
    });
    setCheckedClasses(updatedClasses);

    if (expandedState && setExpandedState) {
      const updatedExpandedState = { ...expandedState };
      Object.entries(updatedExpandedState).forEach(([id, details]) => {
        const belongsToCategory = categoryItems.some(
          (item) => String(item.class) === String(details.label)
        );
        if (belongsToCategory) {
          updatedExpandedState[id] = { ...details, visible: true };
        }
      });
      setExpandedState(updatedExpandedState);
    }
  };

  const handleUnselectAll = () => {
    const updatedClasses = { ...checkedClasses };
    const categoryItems = legendItems.find((group) => group.group === type)?.items || [];

    categoryItems.forEach((item) => {
      updatedClasses[item.class] = false;
    });
    setCheckedClasses(updatedClasses);

    if (expandedState && setExpandedState) {
      const updatedExpandedState = { ...expandedState };
      Object.entries(updatedExpandedState).forEach(([id, details]) => {
        const belongsToCategory = categoryItems.some(
          (item) => String(item.class) === String(details.label)
        );
        if (belongsToCategory) {
          updatedExpandedState[id] = { ...details, visible: false };
        }
      });
      setExpandedState(updatedExpandedState);
    }
  };

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
