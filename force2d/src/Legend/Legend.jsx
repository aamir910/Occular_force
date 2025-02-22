import React, { useState } from "react";
import { Row, Col, Checkbox, Input, Button } from "antd";
import ToggleCategory from "./ToggleCategory";

const Legend = ({
  expandedState,
  checkedClasses,
  onClassChange,
  selectedValues,
  setCheckedClasses,
  setExpandedState,
  onFilterData, // New prop to pass filtered data to parent
}) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});

  const legendItems = [
    {
      group: "Disease",
      items: [
        { shape: "triangle", color: "red", label: "Autosomal dominant", class: "Autosomal dominant" },
        { shape: "triangle", color: "blue", label: "Autosomal recessive", class: "Autosomal recessive" },
        { shape: "triangle", color: "green", label: "Isolated", class: "Isolated" },
        { shape: "triangle", color: "purple", label: "Mitochondrial", class: "Mitochondrial" },
        { shape: "triangle", color: "pink", label: "Other", class: "Other" },
        { shape: "triangle", color: "cyan", label: "X-linked dominant", class: "X-linked dominant" },
        { shape: "triangle", color: "magenta", label: "X-linked recessive", class: "X-linked recessive" },
      ],
    },
    {
      group: "",
      items: [
        { shape: "circle", color: "yellow", label: "Known Gene", class: "KNOWN GENE" },
        { shape: "capsule", color: "blue", label: "Repurposing candidates", class: "Repurposing Candidate" },
        { shape: "capsule", color: "green", label: "Approved drugs", class: "Approved Drug" },
      ],
    },
  ];

  const toggleExpand = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  // Function to handle filtering when the button is clicked
  const handleFilterData = () => {
    const selectedClasses = Object.entries(checkedClasses)
      .filter(([_, checked]) => checked)
      .map(([className]) => className);

    const selectedExpandedItems = Object.entries(expandedState)
      .filter(([_, details]) => details.visible)
      .map(([id]) => id);

    // Pass the filtered data to the parent component
    onFilterData({
      selectedClasses,
      selectedExpandedItems,
    });
  };

  return (
    <Row
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #f1f1f1",
      }}
    >
      {/* Filter Button at the Top */}
      <Col span={24} style={{ marginBottom: "10px" }}>
        <Button
          type="primary"
          onClick={handleFilterData}
          style={{ width: "70%", maxWidth: "250px" }}
        >
          Filter Data
        </Button>
      </Col>

      {legendItems.map((group, groupIndex) => (
        <Col
          key={groupIndex}
          span={24}
          style={{ marginTop: group.group === "" ? "25px" : "0" }}
        >
          <dl style={{ margin: 0, padding: 0 }}>
            <dt
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "start",
                justifyContent: "flex-start",
                fontSize: "15px",
                marginBottom: group.group === "Others" ? "10px" : "0",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {group.group || null}
                {group.group === "Disease" && (
                  <ToggleCategory
                    type="Disease"
                    legendItems={legendItems}
                    checkedClasses={checkedClasses}
                    setCheckedClasses={setCheckedClasses}
                  />
                )}
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
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "flex-start",
                    marginLeft: 0,
                  }}
                >
                  {group.group === "Disease" && (
                    <div
                      style={{ cursor: "pointer", marginRight: "8px" }}
                      onClick={() => toggleExpand(item.class)}
                    >
                      {expandedClasses[item.class] ? "▼" : "▶"}
                    </div>
                  )}

                  <div style={{ margin: "5px" }}>
                    {item.shape === "triangle" && (
                      <svg width="20" height="20" style={{ marginRight: "2px" }}>
                        <polygon points="10,0 0,20 20,20" fill={item.color} />
                      </svg>
                    )}
                    {item.shape === "circle" && (
                      <svg
                        width="20"
                        height="20"
                        style={{ marginRight: "2px", marginTop: "5px" }}
                      >
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
                  </div>

                  <Checkbox
                    checked={checkedClasses[item.class]}
                    onChange={(e) => onClassChange(item.class, e.target.checked)} // Only update state, no filtering
                    style={{ marginLeft: "2px" }}
                  />
                  <div style={{ marginLeft: "3px" }}>{item.label}</div>
                </div>

                {group.group === "Disease" && expandedClasses[item.class] && (
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "200px" }}>
                    <div style={{ marginTop: "10px", width: "100%" }}>
                      <Input
                        placeholder="Search..."
                        style={{ marginBottom: "10px", maxWidth: "250px" }}
                        value={searchQueries[item.class] || ""}
                        onChange={(e) => {
                          setSearchQueries((prev) => ({
                            ...prev,
                            [item.class]: e.target.value.toLowerCase(),
                          }));
                        }}
                      />

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
                            const currentQuery = searchQueries[item.class] || "";
                            const filteredItems = Object.entries(expandedState)
                              .filter(([id, details]) =>
                                details.label === item.label &&
                                id.toLowerCase().includes(currentQuery)
                              );

                            setExpandedState((prev) => {
                              const newState = { ...prev };
                              filteredItems.forEach(([id]) => {
                                newState[id] = { ...newState[id], visible: true };
                              });
                              return newState;
                            });
                          }}
                        >
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
                            const currentQuery = searchQueries[item.class] || "";
                            const filteredItems = Object.entries(expandedState)
                              .filter(([id, details]) =>
                                details.label === item.label &&
                                id.toLowerCase().includes(currentQuery)
                              );

                            setExpandedState((prev) => {
                              const newState = { ...prev };
                              filteredItems.forEach(([id]) => {
                                newState[id] = { ...newState[id], visible: false };
                              });
                              return newState;
                            });
                          }}
                        >
                          Unselect All
                        </button>
                      </div>

                      <ul
  style={{
    marginTop: "2px",
    maxHeight: "300px",
    overflowY: "auto",
    border: "1px solid #d9d9d9",
    borderRadius: "5px",
    maxWidth: "250px",
    scrollbarWidth: "thin",
  }}
>
  {Object.entries(expandedState)
    .filter(([id, details]) => {
      const currentQuery = searchQueries[item.class] || "";
      return (
        details.label === item.label &&
        id.toLowerCase().includes(currentQuery)
      );
    })
    .sort(([idA], [idB]) => idA.localeCompare(idB))
    .map(([id, details]) => (
      <li
        key={id}
        style={{
          listStyle: "none",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <Checkbox
          checked={details.visible}
          onChange={(e) => {
            setExpandedState((prev) => ({
              ...prev,
              [id]: {
                ...prev[id],
                visible: e.target.checked,
              },
            }));
          }}
        >
          {id}
        </Checkbox>
      </li>
    ))}
</ul>
                    </div>
                  </div>
                )}
              </dd>
            ))}
          </dl>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;