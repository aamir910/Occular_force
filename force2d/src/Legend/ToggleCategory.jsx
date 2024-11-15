import React from 'react';
import { Button } from 'antd';

const ToggleCategory = ({ type, legendItems, checkedClasses, setCheckedClasses }) => {
  // Function to select all items in the specified type
  const handleSelectAll = () => {
    const updatedClasses = { ...checkedClasses };
    legendItems
      .find((group) => group.group === type)
      ?.items.forEach((item) => {
        updatedClasses[item.class] = true; // Set all to true
      });
    setCheckedClasses(updatedClasses);
  };

  // Function to unselect all items in the specified type
  const handleUnselectAll = () => {
    const updatedClasses = { ...checkedClasses };
    legendItems
      .find((group) => group.group === type)
      ?.items.forEach((item) => {
        updatedClasses[item.class] = false; // Set all to false
      });
    setCheckedClasses(updatedClasses);
  };
  const allSelected = legendItems
  .find((group) => group.group === type)
  ?.items.every((item) => checkedClasses[item.class]);
  return (
    <a
      onClick={() => {
        // Toggle behavior: if at least one item is unchecked, select all; otherwise, unselect all
 
        if (allSelected) {
          handleUnselectAll();
        } else {
          handleSelectAll();
        }
      }}
    >
             {allSelected ? "UnSelect all":"Select all"  }
    </a>
  );
};

export default ToggleCategory;
