import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Row, Col } from 'antd'; // Import Ant Design components
import ForceNetworkGraph from './forceNetworkGraph/ForceNetworkGraph'; // Import the graph component
import './App.css';
import Legend from './Legend/Legend';

function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const nodeTypes = ['DISORDER', 'KNOWN GENE', 'Repurposing Candidate', 'Approved Drug'];

  useEffect(() => {
    // Load Excel file from the public folder and extract data
    fetchExcelFile();
  }, []);

  const fetchExcelFile = async () => {
    try {
      const response = await fetch('/OccularDB_Zia.xlsx'); // Update with your actual file name
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process the JSON data to create unique nodes and links
      const { nodes, links } = createNodesAndLinks(jsonData);
      setNodes(nodes);
      setLinks(links);
    } catch (error) {
      console.error('Error reading the Excel file:', error);
    }
  };

  const createNodesAndLinks = (data) => {
    const nodesSet = new Set();
    const links = [];

    data.forEach((row) => {
      const disorder = row.DISORDER;
      const knownGene = row['KNOWN GENES OR CHROMOSOMAL ABNORMALITY INVOLVED'];
      const repurposingCandidate = row['Repurposing candidate name'];
      const approvedDrug = row['Approved_drug_chembl_ID'];
       const classOfNode = row['MODE OF INHERITANCE']


      // Add unique nodes
      if (disorder) nodesSet.add({ id: disorder, type: 'DISORDER', class:classOfNode });
      if (knownGene) nodesSet.add({ id: knownGene, type: 'KNOWN GENE' , class:classOfNode});
      if (repurposingCandidate) nodesSet.add({ id: repurposingCandidate, type: 'Repurposing Candidate'  ,class:classOfNode  });
      if (approvedDrug) nodesSet.add({ id: approvedDrug, type: 'Approved Drug', class:classOfNode });

      // Add links
      if (disorder && knownGene) links.push({ source: disorder, target: knownGene });
      if (disorder && approvedDrug) links.push({ source: disorder, target: approvedDrug });
      if (knownGene && approvedDrug) links.push({ source: knownGene, target: approvedDrug });
    });

    // Convert the Set to an Array for unique nodes
    const uniqueNodes = Array.from(nodesSet);
    return { nodes: uniqueNodes, links };
  };
  
  return (
<div className="app-container" style={{ padding: '20px' }}>
  <Row gutter={16}>
    {/* Legend Card */}
    <Col span={6}>
      <Card title="Legend" bordered={true} style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        {<Legend />}
      </Card>
    </Col>

    {/* 2D Force Network Graph Card */}
    <Col span={18}>
      <Card title="Force Network Graph" bordered={true} style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        {nodes.length > 0 && links.length > 0 ? (
          <ForceNetworkGraph nodes={nodes} links={links} />
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
