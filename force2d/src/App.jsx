import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Card, Select, Row, Col } from "antd";
import ForceNetworkGraph from "./forceNetworkGraph/ForceNetworkGraph";
import Legend from "./Legend/Legend";
import { Button } from "antd";

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
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [uniqueModes, setUniqueModes] = useState([]);
  const [dropDowndata, SetDropDowndata] = useState([]);
  const { Option } = Select;

  // Fetch Excel file on component mount
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
      extractUniqueClasses(jsonData);
      setOriginalData(jsonData); // Extract unique classes after setting jsonData
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
      const Repurposing_candidate_chembL_ID =
        row["Repurposing candidate chembL_ID"];
      const Approved_drug_chembl_ID = row.Approved_drug_chembl_ID;

      // Filter the row based on checked classes

      //  logic to remvoe the Repurposing Candidate
      if (!checkedClasses["Repurposing Candidate"]) {
        if (repurposingCandidate) {
          return; // Skip if class is checked but gene is missing
        }
      }

      if (checkedClasses[classOfNode]) {
        filteredRows.push(row); // Add the entire row to the filteredRows array
      }

      // Update the state with the filtered rows
      // SetDropDowndata(filteredRows);
      extractUniqueClasses(filteredRows);

      if (checkedClasses[classOfNode]) {
      
if(!checkedClasses["KNOWN GENE"]){
if(!knownGene){
  console.log(knownGene , row , "knownGene is not here ") 
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
}

}
        

        // here is the logic of the approved drug there
        if (checkedClasses["Approved Drug"]) {
if(approvedDrug){

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

          if (disorder && approvedDrug) {
            const linkKey = `${disorder}-${approvedDrug}`;
            if (!linksSet.has(linkKey)) {
              linksSet.add(linkKey);
              links.push({ source: disorder, target: approvedDrug });
            }
          }
        }

        // here is the logic of the known genes there

        if (checkedClasses["KNOWN GENE"]) {

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



          if (repurposingCandidate && !nodesMap.has(repurposingCandidate)) {
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

          if (knownGene && !nodesMap.has(knownGene)) {
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

          if (knownGene && repurposingCandidate) {
            const linkKey = `${knownGene}-${repurposingCandidate}`;
            if (!linksSet.has(linkKey)) {
              linksSet.add(linkKey);
              links.push({ source: knownGene, target: repurposingCandidate });
            }
          }
        }
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  };
  console.log(graphData, "graphdata is here ");
  // Update graphData only when jsonData or checkedClasses change
  useEffect(() => {
    if (jsonData) {
      const newGraphData = createNodesAndLinks(jsonData);
      setGraphData(newGraphData);
    }
  }, [jsonData, checkedClasses]);

  const handleSelectionChange = (value) => {
    setSelectedValues(value);
  };

  const handleClassCheckboxChange = (className, checked) => {
    setCheckedClasses((prevCheckedClasses) => ({
      ...prevCheckedClasses,
      [className]: checked,
    }));
  };

  const applyFilter = () => {
    if (jsonData) {
      if (selectedValues.length !== 0) {
        const filtered = originalData.filter((row) =>
          selectedValues.includes(row["DISORDER"])
        );
        setJsonData(filtered);
        if (filtered.length > 0) {
          // Extract unique 'MODE OF INHERITANCE' values from filtered rows
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

  return (
    <div className="app-container" style={{ padding: "2px", width: "100%" }}>
      <Row gutter={16}>
        {/* Legend with checkboxes */}
        <Col span={4}>
          <Card
            title="Legend"
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}>
            <Legend
              checkedClasses={checkedClasses}
              onClassChange={handleClassCheckboxChange}
              selectedValues={uniqueModes}
              setCheckedClasses={setCheckedClasses}
            />
          </Card>
        </Col>

        {/* 2D Force Network Graph */}
        <Col span={19}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span>Inheritance based categorization</span>
                <div>
                  <Select
                    mode="multiple"
                    placeholder="Select disease"
                    dropdownStyle={{ maxHeight: "300px", overflowY: "auto" }}
                    style={{ minWidth: "200px", maxWidth: "900px" }}
                    onChange={handleSelectionChange}
                    value={selectedValues}
                    maxTagCount={2} // Adjust the number as needed
                    allowClear>
                    {uniqueClasses.map((className) => (
                      <Option key={className} value={className}>
                        {className}
                      </Option>
                    ))}
                  </Select>
                  <Button onClick={applyFilter}>Filter</Button>
                </div>
              </div>
            }
            bordered
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}>
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
                }}>
                No data in current filtration...
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
