import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Card, Row, Col, Checkbox } from "antd";
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import "./App.css";
import Legend from "./Legend/Legend";

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [checkedClasses, setCheckedClasses] = useState({
    "Autosomal dominant": true,
    "Autosomal recessive": true,
    Isolated: true,
    "Isolated cases": true,
    Mitochondrial: true,
    Other: true,
    "X-linked": true,
    "X-linked dominant": true,
    "X-linked recessive": true,
    XLR: true,
  });

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
      setJsonData(jsonData);
    } catch (error) {
      console.error("Error reading the Excel file:", error);
    }
  };

  const createNodesAndLinks = (data) => {
    const nodesMap = new Map();
    const linksSet = new Set();
    const links = [];

    data.forEach((row) => {
      const disorder = row.DISORDER;
      const knownGene = row["KNOWN GENES OR CHROMOSOMAL ABNORMALITY INVOLVED"];
      const repurposingCandidate = row["Repurposing candidate name"];
      const approvedDrug = row["Approved_drug_chembl_ID"];
      const classOfNode = row["MODE OF INHERITANCE"];
      const EFO_Ids_Mondo = row.EFO_Ids_Mondo;
      const ORPHanet_ID = row.ORPHanet_ID;
      const EYE_FINDING = row["EYE FINDING"];
      const Repurposing_chembL_ID = row["Repurposing candidate chembL_ID"];
      const Approved_drug_chembl_ID = row.Approved_drug_chembl_ID;

      if (checkedClasses[classOfNode]) {
        if (disorder && !nodesMap.has(disorder)) {
          nodesMap.set(disorder, {
            id: disorder,
            type: "DISORDER",
            class: classOfNode,
            EFO_Ids_Mondo: EFO_Ids_Mondo,
            ORPHanet_ID: ORPHanet_ID,
            EYE_FINDING: EYE_FINDING,
            Modeofinheritance: "",
            Repurposing_chembL_ID: "",
            Approved_drug_chembl_ID: "",
          });
        }
        if (knownGene && !nodesMap.has(knownGene)) {
          nodesMap.set(knownGene, {
            id: knownGene,
            type: "KNOWN GENE",
            class: "KNOWN GENE",
            EFO_Ids_Mondo: "",
            ORPHanet_ID: "",
            EYE_FINDING: "",
            Modeofinheritance: classOfNode,
            Repurposing_chembL_ID: "",
            Approved_drug_chembl_ID: "",
          });
        }
        if (repurposingCandidate && !nodesMap.has(repurposingCandidate)) {
          nodesMap.set(repurposingCandidate, {
            id: repurposingCandidate,
            type: "Repurposing Candidate",
            class: "Repurposing Candidate",
            EFO_Ids_Mondo: "",
            ORPHanet_ID: "",
            EYE_FINDING: "",
            Modeofinheritance: "",
            Repurposing_chembL_ID: Repurposing_chembL_ID,
            Approved_drug_chembl_ID: "",
          });
        }
        if (approvedDrug && !nodesMap.has(approvedDrug)) {
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

        if (disorder && knownGene) {
          const linkKey = `${disorder}-${knownGene}`;
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({ source: disorder, target: knownGene });
          }
        }
        if (disorder && approvedDrug) {
          const linkKey = `${disorder}-${approvedDrug}`;
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({ source: disorder, target: approvedDrug });
          }
        }
        if (knownGene && repurposingCandidate) {
          const linkKey = `${knownGene}-${repurposingCandidate}`;
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({ source: knownGene, target: repurposingCandidate });
          }
        }
      }
    });

    const uniqueNodes = Array.from(nodesMap.values());
    return { nodes: uniqueNodes, links };
  };

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prevCheckedClasses) => ({
      ...prevCheckedClasses,
      [className]: checked,
    }));
  };

  const graphData = jsonData
    ? createNodesAndLinks(jsonData)
    : { nodes: [], links: [] };

  return (
    <div className="app-container" style={{ padding: "2px" }}>
      <Row gutter={16}>
        {/* Legend with checkboxes */}
        <Col span={4}>
          <Card
            title="Legend"
            bordered={true}
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}>
            <Legend
              checkedClasses={checkedClasses}
              onClassChange={handleClassCheckboxChange}
            />
          </Card>
        </Col>

        {/* 2D Force Network Graph */}
        <Col span={20}>
          <Card
            title="Force Network Graph"
            bordered={true}
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}>
            {graphData.nodes.length > 0 && graphData.links.length > 0 ? (
              <ForceNetworkGraph
                nodes={graphData.nodes}
                links={graphData.links}
              />
            ) : (
              <p>Loading graph data...</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
