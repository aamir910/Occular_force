import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Card, Select, Row, Col, Button, Modal } from "antd";
import html2canvas from "html2canvas";
import { saveAs } from 'file-saver'; // Added for SVG export
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import Legend from "./Legend/Legend";

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [checkedClasses, setCheckedClasses] = useState({
    "Autosomal recessive": true,
    "X-linked dominant": true,
    Other: true,
    "Isolated cases": true,
    "Autosomal dominant": true,
    "X-linked recessive": true,
    Mitochondrial: true,
    "-": true,
    Isolated: true,
    "KNOWN GENE": true,
    "Repurposing Candidate": true,
    "Approved Drug": true,
  });

  const [expandedState, setExpandedState] = useState({});
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [uniqueModes, setUniqueModes] = useState([]);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const rowRef = useRef(null);
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
    setUniqueClasses(Array.from(classes));
  };

  const createNodesAndLinks = (data) => {
    const nodesMap = new Map();
    const linksSet = new Set();
    const links = [];
    const filteredRows = [];

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

      if (classOfNode && disorder && expandedState[disorder] !== undefined) {
        if (!expandedState[disorder].visible) {
          return;
        }
      }

      if (checkedClasses[classOfNode]) {
        filteredRows.push(row); // Add row to filteredRows for export
      }

      if (checkedClasses[classOfNode]) {
        if (!checkedClasses["Repurposing Candidate"] && repurposingCandidate) {
          return;
        }

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

        if (checkedClasses["KNOWN GENE"] && knownGene) {
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

        if (checkedClasses["Repurposing Candidate"] && repurposingCandidate) {
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

        if (checkedClasses["Approved Drug"] && approvedDrug) {
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
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  };

  useEffect(() => {
    if (jsonData) {
      const newGraphData = createNodesAndLinks(jsonData);
      setGraphData(newGraphData);

      const initialState = newGraphData.nodes
        .filter((item) => item.type === "DISORDER")
        .reduce((acc, item) => {
          acc[item.id] = {
            visible: true,
            label: item.class,
          };
          return acc;
        }, {});

      setExpandedState(initialState);
    }
  }, [jsonData]);

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prevCheckedClasses) => ({
      ...prevCheckedClasses,
      [className]: checked,
    }));
  };

  const handleFilterData = ({ selectedClasses, selectedExpandedItems }) => {
    if (jsonData) {
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

      const newGraphData = createNodesAndLinks(filteredData);
      setGraphData(newGraphData);
    }
  };

  const handleSelectionChange = (value) => {
    setSelectedValues(value);
  };

  const applyFilter = () => {
    if (jsonData) {
      if (selectedValues.length !== 0) {
        const filtered = originalData.filter((row) =>
          selectedValues.includes(row["DISORDER"])
        );
        setJsonData(filtered);
        if (filtered.length > 0) {
          const uniqueModesArray = [
            ...new Set(filtered.map((row) => row["MODE OF INHERITANCE"])),
          ];
          setUniqueModes(uniqueModesArray);
        }
      } else {
        setJsonData(originalData);
        setUniqueModes([]);
      }
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
      const filteredData = jsonData.filter((row) => {
        const classOfNode = row["MODE OF INHERITANCE"];
        if (checkedClasses[classOfNode]) {
          if (
            !checkedClasses["Repurposing Candidate"] &&
            row["Repurposing candidate name"]
          ) {
            return false;
          }
          return true;
        }
        return false;
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
      
      switch(format) {
        case 'png':
          filename = 'graph_screenshot.png';
          dataURL = canvas.toDataURL('image/png');
          break;
        case 'jpg':
          filename = 'graph_screenshot.jpg';
          dataURL = canvas.toDataURL('image/jpeg');
          break;
        case 'svg':
          filename = 'graph_screenshot.svg';
          const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="${canvas.toDataURL('image/png')}"/></svg>`;
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          saveAs(blob, filename);
          return;
        default:
          return;
      }
      
      const link = document.createElement('a');
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
        <Col span={5}>
          <Card
            title="Legend"
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <Legend
              checkedClasses={checkedClasses}
              onClassChange={handleClassCheckboxChange}
              selectedValues={uniqueModes}
              setCheckedClasses={setCheckedClasses}
              expandedState={expandedState}
              setExpandedState={setExpandedState}
              onFilterData={handleFilterData}
            />
          </Card>
        </Col>

        <Col span={18}>
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
                  Exports
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
            {graphData.nodes.length > 0 ? (
              <ForceNetworkGraph
                nodes={graphData.nodes}
                links={graphData.links}
              />
            ) : (
              <p
                style={{
                  paddingRight: "45rem",
                  width: "99%",
                  overflow: "hidden",
                }}
              >
                No data in current filtration...
              </p>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Export Options"
        open={isBoxOpen}
        onCancel={handleCloseBox}
        footer={null}
      >
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}
            onClick={() => exportGraphImage('png')}
          >
            Download as PNG
          </Button>
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}
            onClick={() => exportGraphImage('jpg')}
          >
            Download as JPG
          </Button>
          <Button 
            type="primary" 
            size="small"
            style={{ width: '150px' }}
            onClick={() => exportGraphImage('svg')}
          >
            Download as SVG
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;