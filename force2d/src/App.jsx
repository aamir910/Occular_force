import React, { useEffect, useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Card, Select, Row, Col, Button, Modal } from "antd";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import Legend from "./Legend/Legend";

const DEFAULT_SELECTED_DISORDERS = [
  "ALAGILLE SYNDROME",
  "ALPERS SYNDROME",
  "ALLAN-HERNDON-DUDLEY SYNDROME",
];

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkedClasses, setCheckedClasses] = useState({
    "Autosomal recessive": false,
    "X-linked dominant": false,
    Other: false,
    "Isolated cases": false,
    "Autosomal dominant": false,
    "X-linked recessive": false,
    Mitochondrial: false,
    "-": false,
    Isolated: false,
    "KNOWN GENE": false,
    "Repurposing Candidate": false,
    "Approved Drug": false,
  });

  const [expandedState, setExpandedState] = useState({});
  const [availableClasses, setAvailableClasses] = useState({
    "Autosomal recessive": false,
    "X-linked dominant": false,
    Other: false,
    "Isolated cases": false,
    "Autosomal dominant": false,
    "X-linked recessive": false,
    Mitochondrial: false,
    "-": false,
    Isolated: false,
    "KNOWN GENE": false,
    "Repurposing Candidate": false,
    "Approved Drug": false,
  });
  const [availableIds, setAvailableIds] = useState({});
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedDisorders, setSelectedDisorders] = useState(DEFAULT_SELECTED_DISORDERS);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const rowRef = useRef(null);
  const hasInitialFilterApplied = useRef(false);
  const { Option } = Select;

  useEffect(() => {
    fetchExcelFile();
  }, []);

  const fetchExcelFile = async () => {
    try {
      const response = await fetch("/OccularDB_Zia.xlsx");
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(jsonData, "jsonData");
      setJsonData(jsonData);
      extractUniqueClasses(jsonData);
      setOriginalData(jsonData);
    } catch (error) {
      console.error("Error reading the Excel file:", error);
    }
  };

  const extractUniqueClasses = (data) => {
    const classes = new Set();
    data.forEach((row) => {
      const classOfNode = row["DISORDER"];
      if (classOfNode) {
        classes.add(classOfNode);
      }
    });
    setUniqueClasses(Array.from(classes).sort((a, b) => a.localeCompare(b)));
    setSelectedDisorders((prev) => {
      const validDefaults = DEFAULT_SELECTED_DISORDERS.filter((disorder) => classes.has(disorder));
      if (validDefaults.length > 0) {
        return validDefaults;
      }
      return prev;
    });
  };

  const buildExpandedStateFromData = (data) => {
    const initialState = {};

    data.forEach((row) => {
      const disorder = row.DISORDER;
      if (disorder && !initialState[disorder]) {
        initialState[disorder] = {
          visible: false,
          label: row["MODE OF INHERITANCE"],
          type: "DISORDER",
        };
      }
    });

    return initialState;
  };

  const createNodesAndLinks = (
    data,
    {
      includeKnownGene = true,
      includeRepurposing = true,
      includeApprovedDrug = true,
    } = {}
  ) => {
    const nodesMap = new Map();
    const linksSet = new Set();
    const links = [];

    data.forEach((row) => {
      const disorder = row.DISORDER;
      const knownGene = row["KNOWN GENES OR CHROMOSOMAL ABNORMALITY INVOLVED"];
      const repurposingCandidate = row["Repurposing candidate name"];
      const approvedDrug = row["Approved_drug_name"];
      const classOfNode = row["MODE OF INHERITANCE"];
      const EFO_Ids_Mondo = row.EFO_Ids_Mondo;
      const ORPHanet_ID = row.ORPHanet_ID;
      const EYE_FINDING = row["EYE FINDING"];
      const Repurposing_candidate_chembL_ID = row["Repurposing candidate chembL_ID"];
      const Approved_drug_chembl_ID = row.Approved_drug_chembl_ID;

      if (disorder && !nodesMap.has(disorder)) {
        nodesMap.set(disorder, {
          id: disorder,
          type: "DISORDER",
          class: classOfNode,
          EFO_Ids_Mondo: EFO_Ids_Mondo,
          ORPHanet_ID: ORPHanet_ID,
          EYE_FINDING: EYE_FINDING,
          Modeofinheritance: "",
          Repurposing_candidate_chembL_ID: "",
          Approved_drug_chembl_ID: "",
          linkType: `${knownGene}`,
        });
      }

      if (includeKnownGene && knownGene) {
        if (!nodesMap.has(knownGene)) {
          nodesMap.set(knownGene, {
            id: knownGene,
            type: "KNOWN GENE",
            class: "KNOWN GENE",
            EFO_Ids_Mondo: "",
            ORPHanet_ID: "",
            EYE_FINDING: "",
            Modeofinheritance: classOfNode,
            Repurposing_candidate_chembL_ID: "",
            Approved_drug_chembl_ID: "",
          });
        }
        if (disorder && knownGene) {
          const linkKey = `${disorder}-${knownGene}`;
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({ source: disorder, target: knownGene });
          }
        }
      }

      if (includeRepurposing && repurposingCandidate) {
        if (!nodesMap.has(repurposingCandidate)) {
          nodesMap.set(repurposingCandidate, {
            id: repurposingCandidate,
            type: "Repurposing Candidate",
            class: "Repurposing Candidate",
            EFO_Ids_Mondo: "",
            ORPHanet_ID: "",
            EYE_FINDING: "",
            Modeofinheritance: "",
            Repurposing_candidate_chembL_ID: Repurposing_candidate_chembL_ID,
            Approved_drug_chembl_ID: "",
          });
        }
        if (knownGene && repurposingCandidate) {
          const linkKey = `${knownGene}-${repurposingCandidate}`;
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({ source: knownGene, target: repurposingCandidate });
          }
        }
      }

      if (includeApprovedDrug && approvedDrug) {
        if (!nodesMap.has(approvedDrug)) {
          nodesMap.set(approvedDrug, {
            id: approvedDrug,
            type: "Approved Drug",
            class: "Approved Drug",
            EFO_Ids_Mondo: "",
            ORPHanet_ID: "",
            EYE_FINDING: "",
            Approved_drug_chembl_ID: Approved_drug_chembl_ID,
          });
        }
        if (disorder && approvedDrug) {
          const linkKey = `${disorder}-${approvedDrug}`;
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({ source: disorder, target: approvedDrug });
          }
        }
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  };

  const syncLegendFromGraph = useCallback((graph) => {
    const presentIds = new Set((graph?.nodes || []).map((node) => node.id));
    const presentClasses = new Set(
      (graph?.nodes || []).map((node) => String(node.class))
    );

    setAvailableClasses((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = presentClasses.has(String(key));
      });
      presentClasses.forEach((cls) => {
        next[cls] = true;
      });
      return next;
    });

    setAvailableIds(() => {
      const next = {};
      presentIds.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    setCheckedClasses((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = presentClasses.has(String(key));
      });
      return next;
    });

    setExpandedState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = {
          ...next[id],
          visible: presentIds.has(id),
        };
      });
      return next;
    });
  }, []);

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prev) => ({
      ...prev,
      [className]: checked,
    }));
  };

  const applyFilters = useCallback(() => {
    if (!jsonData) return;

    if (selectedDisorders.length === 0) {
      setGraphData({ nodes: [], links: [] });
      syncLegendFromGraph({ nodes: [], links: [] });
      return;
    }

    const hasLegendChecks = Object.values(checkedClasses).some(Boolean);

    const filteredData = jsonData.filter((row) => {
      if (!selectedDisorders.includes(row.DISORDER)) {
        return false;
      }

      if (!hasLegendChecks) {
        return true;
      }

      const classOfNode = row["MODE OF INHERITANCE"];
      const disorder = row.DISORDER;
      const hasRepurposingCandidate = !!row["Repurposing candidate name"];

      if (classOfNode && !checkedClasses[classOfNode]) {
        return false;
      }

      if (!checkedClasses["Repurposing Candidate"] && hasRepurposingCandidate) {
        return false;
      }

      if (disorder && expandedState[disorder] !== undefined && !expandedState[disorder].visible) {
        return false;
      }

      return true;
    });

    // When legend checks exist, also respect treatment toggles in node building
    const newGraphData = createNodesAndLinks(filteredData, {
      includeKnownGene: !hasLegendChecks || !!checkedClasses["KNOWN GENE"],
      includeRepurposing: !hasLegendChecks || !!checkedClasses["Repurposing Candidate"],
      includeApprovedDrug: !hasLegendChecks || !!checkedClasses["Approved Drug"],
    });
    setGraphData(newGraphData);
    syncLegendFromGraph(newGraphData);
  }, [jsonData, selectedDisorders, checkedClasses, expandedState, syncLegendFromGraph]);

  useEffect(() => {
    if (jsonData) {
      setExpandedState(buildExpandedStateFromData(jsonData));
    }
  }, [jsonData]);

  useEffect(() => {
    if (jsonData && selectedDisorders.length > 0 && !hasInitialFilterApplied.current) {
      hasInitialFilterApplied.current = true;
      applyFilters();
    }
  }, [jsonData, selectedDisorders, applyFilters]);

  const handleDisorderSelectionChange = (value) => {
    setSelectedDisorders(value);
    if (hasInitialFilterApplied.current) {
      setGraphData({ nodes: [], links: [] });
      syncLegendFromGraph({ nodes: [], links: [] });
    }
  };

  const handleOpenBox = () => {
    setIsBoxOpen(true);
  };

  const handleCloseBox = () => {
    setIsBoxOpen(false);
  };

  const exportToExcel = () => {
    if (jsonData) {
      const selectedClasses = Object.entries(checkedClasses)
        .filter(([_, checked]) => checked)
        .map(([className]) => className);

      const selectedExpandedItems = Object.entries(expandedState)
        .filter(([_, details]) => details.visible)
        .map(([id]) => id);

      const filteredData = jsonData.filter((row) => {
        const classOfNode = row["MODE OF INHERITANCE"];
        const disorder = row.DISORDER;
        const hasRepurposingCandidate = !!row["Repurposing candidate name"];

        if (!selectedClasses.includes(classOfNode)) {
          return false;
        }

        if (!selectedClasses.includes("Repurposing Candidate") && hasRepurposingCandidate) {
          return false;
        }

        if (disorder && expandedState[disorder] !== undefined) {
          return selectedExpandedItems.includes(disorder);
        }

        return true;
      });

      if (filteredData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, worksheet, "Filtered_Inheritance");
        XLSX.writeFile(book, "Filtered_Inheritance_data.xlsx");
      } else {
        console.log("No filtered data to export.");
      }
    } else {
      console.log("No data available to export.");
    }
  };

  const exportGraphImage = async (format) => {
    if (rowRef.current) {
      const canvas = await html2canvas(rowRef.current);
      let filename, dataURL;

      switch (format) {
        case "png":
          filename = "graph_screenshot.png";
          dataURL = canvas.toDataURL("image/png");
          break;
        case "jpg":
          filename = "graph_screenshot.jpg";
          dataURL = canvas.toDataURL("image/jpeg");
          break;
        case "svg": {
          filename = "graph_screenshot.svg";
          const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="${canvas.toDataURL("image/png")}"/></svg>`;
          const blob = new Blob([svgData], { type: "image/svg+xml" });
          saveAs(blob, filename);
          return;
        }
        default:
          return;
      }

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataURL;
      link.click();
    } else {
      console.log("Row element not found.");
    }
  };

  return (
    <div className="app-container" style={{ padding: "2px", width: "100%" }}>
      <Row gutter={16} ref={rowRef}>
        <Col span={5} style={{ minWidth: "16%" }}>
          <Card
            title="Legend Filters"
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <Legend
              checkedClasses={checkedClasses}
              expandedState={expandedState}
              availableClasses={availableClasses}
              availableIds={availableIds}
              onClassChange={handleClassCheckboxChange}
              setExpandedState={setExpandedState}
            />
          </Card>
        </Col>

        <Col span={18} style={{ minWidth: "65%" }}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Inheritance based categorization</span>
                <Button type="primary" onClick={handleOpenBox}>
                  Export
                </Button>
              </div>
            }
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="disorder-filter"
                style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
              >
                Filter by Disorder Name
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Select
                  id="disorder-filter"
                  mode="multiple"
                  showSearch
                  allowClear
                  placeholder="Select one or more disorders"
                  value={selectedDisorders}
                  onChange={handleDisorderSelectionChange}
                  optionFilterProp="children"
                  style={{ flex: 1 }}
                >
                  {uniqueClasses.map((disorder) => (
                    <Option key={disorder} value={disorder}>
                      {disorder}
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  onClick={applyFilters}
                  disabled={selectedDisorders.length === 0}
                >
                  Filter Data
                </Button>
              </div>
            </div>

            {graphData.nodes.length > 0 ? (
              <ForceNetworkGraph nodes={graphData.nodes} links={graphData.links} />
            ) : (
              <p
                style={{
                  paddingRight: "45rem",
                  width: "99%",
                  overflow: "hidden",
                }}
              >
                Select disorders and click Filter Data to view the graph.
              </p>
            )}
          </Card>
        </Col>
      </Row>

      <Modal title="Export Options" open={isBoxOpen} onCancel={handleCloseBox} footer={null}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Button type="primary" size="small" style={{ width: "150px" }} onClick={exportToExcel}>
            Export to Excel
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => exportGraphImage("png")}
          >
            Download as PNG
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => exportGraphImage("jpg")}
          >
            Download as JPG
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => exportGraphImage("svg")}
          >
            Download as SVG
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
