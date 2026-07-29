import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Checkbox, Input, Button, Tag, Typography, Empty } from "antd";
import ToggleCategory from "./ToggleCategory";

const { Text } = Typography;

const LEGEND_ITEMS = [
  {
    group: "Disease",
      items: [
        { shape: "triangle", color: "red", label: "Autosomal dominant", class: "Autosomal dominant" },
        { shape: "triangle", color: "blue", label: "Autosomal recessive", class: "Autosomal recessive" },
        { shape: "triangle", color: "green", label: "Isolated", class: "Isolated" },
        { shape: "triangle", color: "orange", label: "Isolated cases", class: "Isolated cases" },
        { shape: "triangle", color: "purple", label: "Mitochondrial", class: "Mitochondrial" },
        { shape: "triangle", color: "pink", label: "Other", class: "Other" },
        { shape: "triangle", color: "cyan", label: "X-linked dominant", class: "X-linked dominant" },
        { shape: "triangle", color: "magenta", label: "X-linked recessive", class: "X-linked recessive" },
        { shape: "triangle", color: "gray", label: "-", class: "-" },
      ],
  },
  {
    group: "Treatment",
    items: [
      { shape: "circle", color: "#FFD700", label: "Known Gene", class: "KNOWN GENE" },
      { shape: "capsule", color: "#4ECDC4", label: "Repurposing candidates", class: "Repurposing Candidate" },
      { shape: "capsule", color: "#96CEB4", label: "Approved drugs", class: "Approved Drug" },
    ],
  },
];

const GROUP_COLORS = {
  Disease: "#e6f4ff",
  Treatment: "#f6ffed",
};

const Legend = ({
  expandedState,
  checkedClasses,
  onClassChange,
  setCheckedClasses,
  setExpandedState,
  selectedDisorders = [],
  jsonData = null,
}) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [indeterminateState, setIndeterminateState] = useState({});

  const scopedRows = useMemo(() => {
    if (!jsonData || selectedDisorders.length === 0) {
      return [];
    }
    return jsonData.filter((row) => selectedDisorders.includes(row.DISORDER));
  }, [jsonData, selectedDisorders]);

  const filteredLegendItems = useMemo(() => {
    if (selectedDisorders.length === 0) {
      return [];
    }

    return LEGEND_ITEMS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (group.group === "Disease") {
          return Object.values(expandedState).some(
            (details) =>
              String(details.label).toLowerCase() === String(item.class).toLowerCase()
          );
        }

        if (item.class === "KNOWN GENE") {
          return scopedRows.some((row) => row["KNOWN GENES OR CHROMOSOMAL ABNORMALITY INVOLVED"]);
        }
        if (item.class === "Repurposing Candidate") {
          return scopedRows.some((row) => row["Repurposing candidate name"]);
        }
        if (item.class === "Approved Drug") {
          return scopedRows.some((row) => row["Approved_drug_name"]);
        }
        return false;
      }),
    })).filter((group) => group.items.length > 0);
  }, [expandedState, selectedDisorders, scopedRows]);

  const getExpandedEntriesForItem = (item) => {
    const query = searchQueries[item.class] || "";

    return Object.entries(expandedState)
      .filter(([id, details]) => {
        if (String(details.label).toLowerCase() !== String(item.class).toLowerCase()) {
          return false;
        }
        if (details.type === "DISORDER" && !selectedDisorders.includes(id)) {
          return false;
        }
        return id.toLowerCase().includes(query);
      })
      .sort(([idA], [idB]) => idA.localeCompare(idB));
  };

  useEffect(() => {
    if (!expandedState || !checkedClasses || filteredLegendItems.length === 0) return;

    const updatedCheckedClasses = { ...checkedClasses };
    const updatedIndeterminateState = {};

    filteredLegendItems.forEach((group) => {
      group.items.forEach((item) => {
        if (group.group !== "Disease") {
          return;
        }

        const relatedExpandedItems = Object.entries(expandedState).filter(
          ([id, details]) => {
            if (String(details.label).toLowerCase() !== String(item.class).toLowerCase()) {
              return false;
            }
            if (details.type === "DISORDER") {
              return selectedDisorders.includes(id);
            }
            return true;
          }
        );

        if (relatedExpandedItems.length > 0) {
          const allExpandedChecked = relatedExpandedItems.every(
            ([_, details]) => details.visible
          );
          const anyExpandedChecked = relatedExpandedItems.some(
            ([_, details]) => details.visible
          );

          if (allExpandedChecked) {
            updatedCheckedClasses[item.class] = true;
            updatedIndeterminateState[item.class] = false;
          } else if (anyExpandedChecked) {
            updatedCheckedClasses[item.class] = true;
            updatedIndeterminateState[item.class] = true;
          } else {
            updatedCheckedClasses[item.class] = false;
            updatedIndeterminateState[item.class] = false;
          }
        }
      });
    });

    if (JSON.stringify(updatedCheckedClasses) !== JSON.stringify(checkedClasses)) {
      setCheckedClasses(updatedCheckedClasses);
    }
    setIndeterminateState(updatedIndeterminateState);
  }, [expandedState, checkedClasses, filteredLegendItems, selectedDisorders, setCheckedClasses]);

  const handleMainCategoryChange = (className, checked) => {
    onClassChange(className, checked);

    let targetItem = null;
    filteredLegendItems.forEach((group) => {
      group.items.forEach((item) => {
        if (item.class === className) {
          targetItem = item;
        }
      });
    });

    if (targetItem) {
      setExpandedState((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([id, details]) => {
          if (String(details.label).toLowerCase() !== String(targetItem.class).toLowerCase()) {
            return;
          }
          if (details.type === "DISORDER" && !selectedDisorders.includes(id)) {
            return;
          }
          updated[id] = { ...details, visible: checked };
        });
        return updated;
      });
      setIndeterminateState((prev) => ({ ...prev, [className]: false }));
    }
  };

  const toggleExpand = (className) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  const renderShape = (item) => {
    if (item.shape === "triangle") {
      return (
        <svg width="18" height="18">
          <polygon points="9,0 0,18 18,18" fill={item.color} />
        </svg>
      );
    }
    if (item.shape === "circle") {
      return (
        <svg width="18" height="18">
          <circle cx="9" cy="9" r="9" fill={item.color} />
        </svg>
      );
    }
    return (
      <div
        style={{
          width: "28px",
          height: "14px",
          backgroundColor: item.color,
          borderRadius: "9999px",
        }}
      />
    );
  };

  return (
    <Row
      style={{
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #f1f1f1",
      }}
    >
      {selectedDisorders.length === 0 ? (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Select disorders in the dropdown to see related filters"
          />
        </Col>
      ) : filteredLegendItems.length === 0 ? (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No filter categories found for the selected disorders"
          />
        </Col>
      ) : (
        filteredLegendItems.map((group, groupIndex) => (
          <Col key={groupIndex} span={24} style={{ marginBottom: "14px" }}>
            <div
              style={{
                background: GROUP_COLORS[group.group] || "#fafafa",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Text strong style={{ fontSize: "14px" }}>
                  {group.group}
                </Text>
                {group.group === "Disease" && (
                  <ToggleCategory
                    type={group.group}
                    legendItems={filteredLegendItems}
                    checkedClasses={checkedClasses}
                    setCheckedClasses={setCheckedClasses}
                    expandedState={expandedState}
                    setExpandedState={setExpandedState}
                  />
                )}
              </div>

              {group.items.map((item, index) => {
                const expandedEntries =
                  group.group === "Disease" ? getExpandedEntriesForItem(item) : [];

                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: index === group.items.length - 1 ? 0 : "10px",
                      background: "#fff",
                      borderRadius: "6px",
                      padding: "8px",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {group.group === "Disease" && (
                        <div
                          style={{
                            cursor: "pointer",
                            fontSize: "11px",
                            color: "#8c8c8c",
                            width: "14px",
                          }}
                          onClick={() => toggleExpand(item.class)}
                        >
                          {expandedClasses[item.class] ? "▼" : "▶"}
                        </div>
                      )}

                      {renderShape(item)}

                      <Checkbox
                        checked={checkedClasses[item.class]}
                        indeterminate={indeterminateState[item.class]}
                        onChange={(e) => handleMainCategoryChange(item.class, e.target.checked)}
                      />

                      <Text style={{ fontSize: "13px", flex: 1 }}>{item.label}</Text>

                      {group.group === "Disease" && (
                        <Tag style={{ margin: 0, fontSize: "11px" }}>{expandedEntries.length}</Tag>
                      )}
                    </div>

                    {group.group === "Disease" &&
                      expandedClasses[item.class] &&
                      expandedEntries.length > 0 && (
                        <div style={{ marginTop: "10px", marginLeft: "30px" }}>
                          <Input
                            placeholder="Search..."
                            size="small"
                            value={searchQueries[item.class] || ""}
                            onChange={(e) =>
                              setSearchQueries((prev) => ({
                                ...prev,
                                [item.class]: e.target.value.toLowerCase(),
                              }))
                            }
                            style={{ marginBottom: "8px" }}
                            allowClear
                          />

                          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => {
                                const filtered = getExpandedEntriesForItem(item);
                                setExpandedState((prev) => {
                                  const updated = { ...prev };
                                  filtered.forEach(([id]) => {
                                    updated[id].visible = true;
                                  });
                                  return updated;
                                });
                              }}
                            >
                              Select All
                            </Button>
                            <Button
                              size="small"
                              danger
                              onClick={() => {
                                const filtered = getExpandedEntriesForItem(item);
                                setExpandedState((prev) => {
                                  const updated = { ...prev };
                                  filtered.forEach(([id]) => {
                                    updated[id].visible = false;
                                  });
                                  return updated;
                                });
                              }}
                            >
                              Unselect All
                            </Button>
                          </div>

                          <ul
                            style={{
                              maxHeight: "220px",
                              overflowY: "auto",
                              border: "1px solid #e8e8e8",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              listStyle: "none",
                              margin: 0,
                              background: "#fafafa",
                            }}
                          >
                            {expandedEntries.map(([id, details]) => (
                              <li
                                key={id}
                                style={{
                                  padding: "5px 0",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                <Checkbox
                                  checked={details.visible}
                                  onChange={(e) =>
                                    setExpandedState((prev) => ({
                                      ...prev,
                                      [id]: { ...prev[id], visible: e.target.checked },
                                    }))
                                  }
                                >
                                  <Text style={{ fontSize: "12px" }}>{id}</Text>
                                </Checkbox>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </Col>
        ))
      )}
    </Row>
  );
};

export default Legend;
