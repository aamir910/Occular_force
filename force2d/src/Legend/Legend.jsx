import React, { useState } from "react";
import { Row, Col, Checkbox, Input, Button, Tag, Typography } from "antd";

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
  checkedClasses,
  expandedState,
  availableClasses = {},
  availableIds = {},
  onClassChange,
  setExpandedState,
}) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});

  const getExpandedEntriesForItem = (item) => {
    const query = searchQueries[item.class] || "";

    return Object.entries(expandedState)
      .filter(([id, details]) => {
        if (String(details.label).toLowerCase() !== String(item.class).toLowerCase()) {
          return false;
        }
        return id.toLowerCase().includes(query);
      })
      .sort(([idA], [idB]) => idA.localeCompare(idB));
  };

  const handleMainCategoryChange = (className, checked) => {
    if (!availableClasses[className]) return;
    onClassChange?.(className, checked);

    setExpandedState?.((prev) => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([id, details]) => {
        if (String(details.label).toLowerCase() !== String(className).toLowerCase()) {
          return;
        }
        if (!availableIds[id]) {
          return;
        }
        updated[id] = { ...details, visible: checked };
      });
      return updated;
    });
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
      <Col span={24} style={{ marginBottom: "12px" }}>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          Items not in the current graph are disabled. Available items can be checked or unchecked, then click Filter Data.
        </Text>
      </Col>

      {LEGEND_ITEMS.map((group, groupIndex) => (
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
                marginBottom: "10px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Text strong style={{ fontSize: "14px" }}>
                {group.group}
              </Text>
            </div>

            {group.items.map((item, index) => {
              const expandedEntries =
                group.group === "Disease" ? getExpandedEntriesForItem(item) : [];
              const categoryAvailable = !!availableClasses[item.class];
              const checkedCount = expandedEntries.filter(
                ([id, details]) => details.visible && availableIds[id]
              ).length;

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: index === group.items.length - 1 ? 0 : "10px",
                    background: "#fff",
                    borderRadius: "6px",
                    padding: "8px",
                    border: "1px solid #f0f0f0",
                    opacity: categoryAvailable ? 1 : 0.55,
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
                      checked={!!checkedClasses[item.class]}
                      disabled={!categoryAvailable}
                      onChange={(e) => handleMainCategoryChange(item.class, e.target.checked)}
                    />

                    <Text style={{ fontSize: "13px", flex: 1 }}>{item.label}</Text>

                    {group.group === "Disease" && (
                      <Tag style={{ margin: 0, fontSize: "11px" }}>
                        {checkedCount}/{expandedEntries.length}
                      </Tag>
                    )}
                  </div>

                  {group.group === "Disease" && expandedClasses[item.class] && (
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

                      {categoryAvailable && (
                        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                              setExpandedState?.((prev) => {
                                const updated = { ...prev };
                                getExpandedEntriesForItem(item).forEach(([id]) => {
                                  if (availableIds[id]) {
                                    updated[id] = { ...updated[id], visible: true };
                                  }
                                });
                                return updated;
                              });
                              onClassChange?.(item.class, true);
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => {
                              setExpandedState?.((prev) => {
                                const updated = { ...prev };
                                getExpandedEntriesForItem(item).forEach(([id]) => {
                                  if (availableIds[id]) {
                                    updated[id] = { ...updated[id], visible: false };
                                  }
                                });
                                return updated;
                              });
                              onClassChange?.(item.class, false);
                            }}
                          >
                            Unselect All
                          </Button>
                        </div>
                      )}

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
                        {expandedEntries.length === 0 ? (
                          <li>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              No items
                            </Text>
                          </li>
                        ) : (
                          expandedEntries.map(([id, details]) => {
                            const itemAvailable = !!availableIds[id];
                            return (
                              <li
                                key={id}
                                style={{
                                  padding: "5px 0",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                <Checkbox
                                  checked={!!details.visible}
                                  disabled={!itemAvailable}
                                  onChange={(e) =>
                                    setExpandedState?.((prev) => ({
                                      ...prev,
                                      [id]: { ...prev[id], visible: e.target.checked },
                                    }))
                                  }
                                >
                                  <Text style={{ fontSize: "12px" }}>{id}</Text>
                                </Checkbox>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;
