import React, { useState } from "react";
import { Row, Col, Checkbox ,Input  } from "antd";
import ToggleCategory from "./ToggleCategory";

const Legend = ({
  expandedState,
  checkedClasses,
  onClassChange,
  selectedValues,
  setCheckedClasses,
  setExpandedState,
}) => {
  const [expandedClasses, setExpandedClasses] = useState({}); // For expanding/collapsing subgroups
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  console.log(expandedState, "expandedState");
  const legendItems = [
    {
      group: "Disease",
      items: [
        {
          shape: "triangle",
          color: "red",
          label: "Autosomal dominant",
          class: "Autosomal dominant",
        },
        {
          shape: "triangle",
          color: "blue",
          label: "Autosomal recessive",
          class: "Autosomal recessive",
        },
        {
          shape: "triangle",
          color: "green",
          label: "Isolated",
          class: "Isolated",
        },
        {
          shape: "triangle",
          color: "purple",
          label: "Mitochondrial",
          class: "Mitochondrial",
        },
        { shape: "triangle", color: "pink", label: "Other", class: "Other" },
        {
          shape: "triangle",
          color: "cyan",
          label: "X-linked dominant",
          class: "X-linked dominant",
        },
        {
          shape: "triangle",
          color: "magenta",
          label: "X-linked recessive",
          class: "X-linked recessive",
        },
      ],
    },
    {
      group: "",
      items: [
        {
          shape: "circle",
          color: "yellow",
          label: "Known Gene",
          class: "KNOWN GENE",
        },
        {
          shape: "capsule",
          color: "blue",
          label: "Repurposing candidates",
          class: "Repurposing Candidate",
        },
        {
          shape: "capsule",
          color: "green",
          label: "Approved drugs",
          class: "Approved Drug",
        },
      ],
    },
  ];

  // Toggle expansion for a parent class
  const toggleExpand = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  // Update parent and children checkboxes
  const handleParentCheckboxChange = (parentClass, isChecked) => {
    setCheckedClasses((prev) => {
      const updated = { ...prev };
      legendItems.forEach((group) => {
        group.items.forEach((item) => {
          if (item.class === parentClass) {
            updated[item.class] = isChecked;
          }
        });
      });
      return updated;
    });
  };

  return (
    <Row>
      {legendItems.map((group, groupIndex) => (
        <Col
          key={groupIndex}
          span={24}
          style={{ marginTop: group.group === "" ? "25px" : "0" }}>
          <dl style={{ margin: 0, padding: 0 }}>
            <dt
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
                fontSize: "15px",
                marginBottom: group.group === "Others" ? "10px" : "0",
              }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}>
                {group.group || null}
                {group.group === "Disease" ? (
                  <ToggleCategory
                    type="Disease"
                    legendItems={legendItems}
                    checkedClasses={checkedClasses}
                    setCheckedClasses={setCheckedClasses}
                  />
                ) : null}
              </div>
            </dt>
            {group.items.map((item, index) => (
              <dd
                key={index}
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "flex-start",
                  marginLeft: 0,
                }}>
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "flex-start",
                    marginLeft: 0,
                  }}>
                  {/* Expand/Collapse Button */}
                  {group.group === "Disease"?  <div
                    style={{ cursor: "pointer", marginRight: "8px" }}
                    onClick={() => toggleExpand(item.class)}>
                    {expandedClasses[item.class] ? "▼" : "▶"}
                  </div> : null  }
                

                  {/* Shapes (Triangle, Circle, Capsule) */}
                  {item.shape === "triangle" && (
                    <svg width="20" height="20" style={{ marginRight: "2px" }}>
                      <polygon points="10,0 0,20 20,20" fill={item.color} />
                    </svg>
                  )}
                  {item.shape === "circle" && (
                    <svg
                      width="20"
                      height="20"
                      style={{ marginRight: "2px", marginTop: "5px" }}>
                      <circle cx="10" cy="10" r="10" fill={item.color} />
                    </svg>
                  )}
                  {item.shape === "capsule" && (
                    <svg width="20" height="20" style={{ marginRight: "2px" }}>
                      <rect
                        x="0"
                        y="5"
                        width="20"
                        height="10"
                        rx="5"
                        ry="5"
                        fill={item.color}
                      />
                    </svg>
                  )}

                  {/* Parent Checkbox */}
                  <Checkbox
                    checked={checkedClasses[item.class]}
                    onChange={(e) =>
                      handleParentCheckboxChange(item.class, e.target.checked)
                    }
                    style={{ marginLeft: "2px" }}
                  />

                  {/* Parent Label */}
                  <div style={{ marginLeft: "3px" }}>{item.label}</div>
                </div>
{group.group === "Disease" ?
         <div style={{ display: "flex", flexDirection: "column" , maxWidth:"200px" }}>
         {/* Subgroup Rendering */}
         {expandedClasses[item.class] && (
           <div style={{ marginTop: "10px", width: "100%" }}>
             {/* Search Input */}
             <Input
               placeholder="Search..."
               style={{ marginBottom: "10px", maxWidth: "250px" }}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
             />
       
             {/* Select All / Unselect All Buttons */}
             <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
               <button
                 style={{
                   padding: "5px 10px",
                   borderRadius: "5px",
                   backgroundColor: "#1890ff",
                   color: "#fff",
                   border: "none",
                   cursor: "pointer",
                 }}
                 onClick={() => {
                   // Select All
                   const filteredItems = Object.entries(expandedState).filter(
                     ([id, details]) =>
                       details.label === item.label &&
                       id.toLowerCase().includes(searchQuery)
                   );
                   setExpandedState((prevState) => {
                     const updatedState = { ...prevState };
                     filteredItems.forEach(([id]) => {
                       updatedState[id].visible = true; // Set all to visible
                     });
                     return updatedState;
                   });
                 }}>
                 Select All
               </button>
               <button
                 style={{
                   padding: "5px 10px",
                   borderRadius: "5px",
                   backgroundColor: "#ff4d4f",
                   color: "#fff",
                   border: "none",
                   cursor: "pointer",
                 }}
                 onClick={() => {
                   // Unselect All
                   const filteredItems = Object.entries(expandedState).filter(
                     ([id, details]) =>
                       details.label === item.label &&
                       id.toLowerCase().includes(searchQuery)
                   );
                   setExpandedState((prevState) => {
                     const updatedState = { ...prevState };
                     filteredItems.forEach(([id]) => {
                       updatedState[id].visible = false; // Set all to invisible
                     });
                     return updatedState;
                   });
                 }}>
                 Unselect All
               </button>
             </div>
       
             {/* List */}
             <ul
               style={{
                 marginTop: "2px",
                 maxHeight: "300px",
                 overflowY: "auto",
                 border: "1px solid #d9d9d9",
                 borderRadius: "5px",
                 // backgroundColor: "#f9f9f9",
                 maxWidth: "250px",
               }}>
               {Object.entries(expandedState) // Convert top-level object to array of [id, details] pairs
                 .filter(
                   ([id, details]) =>
                     details.label === item.label &&
                     id.toLowerCase().includes(searchQuery) // Filter based on search query
                 )
                 .map(([id, details]) => (
                   <li
                     key={id}
                     style={{
                       listStyle: "none",
                       borderBottom: "1px solid #e8e8e8",
                     }}>
                     <Checkbox
                       checked={details.visible} // Bind to the `visible` property
                       onChange={(e) => {
                         const isChecked = e.target.checked;
       
                         // Update the state using setExpandedState
                         setExpandedState((prevState) => ({
                           ...prevState,
                           [id]: {
                             ...prevState[id],
                             visible: isChecked, // Update the visibility for the specific id
                           },
                         }));
                       }}>
                       {id}
                     </Checkbox>
                   </li>
                 ))}
             </ul>
           </div>
         )}
       </div> : null
}
       


              </dd>
            ))}
          </dl>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;
