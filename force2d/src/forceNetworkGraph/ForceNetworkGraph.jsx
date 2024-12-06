  import React, { useRef, useEffect, useMemo, useState } from 'react';
  import { ForceGraph2D } from 'react-force-graph';
  import { Table, Button } from 'antd'; // Ant Design components

  const ForceNetworkGraph = ({ nodes, links }) => {
    const graphRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null); // State to manage selected node

    // Prepare graph data format for ForceGraph
    const graphData = useMemo(() => ({
      nodes: nodes.map(node => ({
        id: node.id,
        group: node.type,
        class: node.class,
        EFO_Ids_Mondo: node.EFO_Ids_Mondo,
        ORPHanet_ID: node.ORPHanet_ID,
        EYE_FINDING: node.EYE_FINDING , 
        Mode_of_inheritance: node.Modeofinheritance , 
        Repurposing_candidate_chembL_ID: node.Repurposing_candidate_chembL_ID,
        Approved_drug_chembl_ID: node.Approved_drug_chembl_ID,
      
      })),
      links: links.map(link => ({ source: link.source, target: link.target })),
    }), [nodes, links]);

    // Function to draw different node shapes based on the group and class
    const drawNode = (node, ctx) => {
      const shapeSize = 10;
      ctx.beginPath();

      if (node.group === 'DISORDER') {
        // Draw triangle for 'DISORDER'
        ctx.moveTo(node.x, node.y - shapeSize);
        ctx.lineTo(node.x - shapeSize, node.y + shapeSize);
        ctx.lineTo(node.x + shapeSize, node.y + shapeSize);
        ctx.closePath();
      } else if (node.group === 'KNOWN GENE') {
        // Draw circle for 'KNOWN GENE'
        ctx.arc(node.x, node.y, shapeSize, 0, 2 * Math.PI, false);
      } else if (node.group === 'Repurposing Candidate' || node.group === 'Approved Drug') {
        // Draw capsule shape for 'Repurposing Candidate' and 'Approved Drug'
        ctx.fillRect(node.x - shapeSize, node.y - shapeSize / 2, shapeSize * 2, shapeSize);
        ctx.arc(node.x - shapeSize, node.y, shapeSize / 2, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.arc(node.x + shapeSize, node.y, shapeSize / 2, 1.5 * Math.PI, 0.5 * Math.PI);
      }

      // Fill color based on node class
      switch (node.class) {
        case 'Autosomal dominant':
          ctx.fillStyle = 'red';
          break;
        case 'Autosomal recessive':
          ctx.fillStyle = 'blue';
          break;
        case 'Isolated':
          ctx.fillStyle = 'green';
          break;
        case 'Isolated cases':
          ctx.fillStyle = 'orange';
          break;
        case 'Mitochondrial':
          ctx.fillStyle = 'purple';
          break;
        case 'Other':
          ctx.fillStyle = 'pink';
          break;
        case 'X-linked dominant':
          ctx.fillStyle = 'cyan';
          break;
        case 'X-linked recessive':
          ctx.fillStyle = 'magenta';
          break;
        case '-':
          ctx.fillStyle = 'gray'; // Color for "-"
          break;
        case 'KNOWN GENE':
          ctx.fillStyle = 'yellow'; // Color for circles (KNOWN GENE)
          break;
        case 'Repurposing Candidate':
          ctx.fillStyle = 'blue'; // Color for capsules (Repurposing Candidate)
          break;
        case 'Approved Drug':
          ctx.fillStyle = 'green'; // Color for capsules (Approved Drug)
          break;
        default:
          ctx.fillStyle = 'gray'; // Default color
          break;
      }

      ctx.fill();
  if(node.group === 'KNOWN GENE' || node.group === 'Approved Drug' ){

    // Draw node ID text
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(node.id, node.x + shapeSize + 5, node.y);
  }

    };

    // Handle node click to set selected node
    const handleNodeClick = (node) => {
      console.log(node, "node data here")
      setSelectedNode(node); // Set the selected node for table
    };

    // Set link distance and other forces
    useEffect(() => {
      if (graphRef.current) {
        graphRef.current.d3Force('link').distance(300); // Set link distance
      }
    }, [graphData]);

    return (
      <div style={{ width: "99%", height: "100vh", overflow: "hidden" }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          linkWidth={2}
          backgroundColor="white"
          nodeRelSize={10}
          enableZoomInteraction={true}
          onNodeClick={handleNodeClick} // Handle node click
          // nodeLabel={(node) => {
          //   return `<div style="background-color: black; color: white; padding: 5px; border-radius: 4px;">${node.id}</div>`;
          // }}
        />
        {selectedNode && <DataTable node={selectedNode} onClose={() => setSelectedNode(null)} />}
      </div>
    );
  };

  // DataTable component to display node details

  const DataTable = ({ node, onClose }) => {
    console.log(node);
  
    // Define the columns for the Ant Design table
    const columns = [
      { 
        title: 'Property', 
        dataIndex: 'property', 
        key: 'property',
        render: (text) => text.replace(/_/g, ' ') // Replace underscores with spaces
      },
      { 
        title: 'Value', 
        dataIndex: 'value', 
        key: 'value', 
        render: (text, record) => {
          console.log(record, "record");
          if (['EFO_Ids_Mondo'].includes(record.property)) {
            return <a href={`https://monarchinitiative.org/${text}`} target="_blank" rel="noopener noreferrer">{text}</a>;
          }
          else if (['ORPHanet_ID', 'Mode_of_inheritance'].includes(record.property)){
            const id = text.split(":")[1];
            return <a href={`https://www.orpha.net/en/disease/detail/${id}?name=Orphanet:782${text}`} target="_blank" rel="noopener noreferrer">{text}</a>;
          }
          else if ([ 'Repurposing_candidate_chembL_ID', 'Approved_drug_chembl_ID'  ].includes(record.property)){

            return <a href={`https://www.ebi.ac.uk/chembl/explore/compound/${text}`} target="_blank" rel="noopener noreferrer">{text}</a>;
          }
          return text;
        }
      },
    ];
  
    // Conditionally add data based on the node.group value
    let dataSource = [];
  
    if (node.group === "KNOWN GENE") {
      dataSource = [
        { key: 'Mode_of_inheritance', property: 'Mode_of_inheritance', value: node.Mode_of_inheritance },
      ];
    } else if (node.group === "Repurposing Candidate") {
      dataSource = [
        { key: 'Repurposing_candidate_chembL_ID', property: 'Repurposing_candidate_chembL_ID', value: node.Repurposing_candidate_chembL_ID },
      ];
    } else if (node.group === "Approved Drug") {
      dataSource = [
        { key: 'Approved_drug_chembl_ID', property: 'Approved_drug_chembl_ID', value: node.Approved_drug_chembl_ID },
      ];
    } else {
      // Default properties if no specific group matches
      dataSource = [
        { key: 'EFO_Ids_Mondo', property: 'EFO_Ids_Mondo', value: node.EFO_Ids_Mondo },
        { key: 'ORPHanet_ID', property: 'ORPHanet_ID', value: node.ORPHanet_ID },
        { key: 'EYE_FINDING', property: 'EYE_FINDING', value: node.EYE_FINDING },
      ];
    }
  
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
        zIndex: 10,
        width: 400
      }}>
        <h2>{node.id}</h2>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
        <Button type="primary" onClick={onClose} style={{ marginTop: '10px' }}>Close</Button>
      </div>
    );
  };
  

  export default ForceNetworkGraph;
