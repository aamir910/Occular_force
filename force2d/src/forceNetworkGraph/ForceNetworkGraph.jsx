import React, { useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';

const ForceNetworkGraph = ({ nodes, links }) => {
  const graphRef = useRef();

  // Prepare graph data format for ForceGraph
  let  graphData = {
    nodes: nodes.map(node => ({
      id: node.id,
      group: node.type,
      class: node.class // Assuming node class is available in the data
    })),
    links: links.map(link => ({ source: link.source, target: link.target })),
  };

let array = nodes.filter(node =>node.id === "OGUCHI DISEASE" )
let array2 = links.filter(node =>node.source === "SAG" )
console.log(graphData ,array,array2, "array")


  // Function to draw different node shapes based on the group and class
  const drawNode = (node, ctx) => {
    const shapeSize = 10;
    ctx.beginPath();

    if (node.group === 'DISORDER') {
      // Draw a triangle for 'DISORDER'
      ctx.moveTo(node.x, node.y - shapeSize);
      ctx.lineTo(node.x - shapeSize, node.y + shapeSize);
      ctx.lineTo(node.x + shapeSize, node.y + shapeSize);
      ctx.closePath();

      // Color by class
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
        case 'X-linked':
          ctx.fillStyle = 'brown';
          break;
        case 'X-linked dominant':
          ctx.fillStyle = 'cyan';
          break;
        case 'X-linked recessive':
          ctx.fillStyle = 'magenta';
          break;
        case 'XLR': // X-linked recessive (shortened as XLR)
          ctx.fillStyle = 'gray';
          break;
        case 'KNOWN GENE':
          ctx.fillStyle = 'yellow';
          break;
        case 'Repurposing Candidate':
          ctx.fillStyle = 'blue';
          break;
        case 'Approved Drug':
          ctx.fillStyle = 'green';
          break;
        default:
          ctx.fillStyle = 'gray'; // Default color for other classes
          break;
      }
      
    } else if (node.group === 'KNOWN GENE') {
      // Draw a circle for 'KNOWN GENE'
      ctx.arc(node.x, node.y, shapeSize, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'yellow';
    } else if (node.group === 'Repurposing Candidate') {
      // Draw a capsule shape (rounded rectangle) for 'Repurposing Candidate'
      ctx.fillStyle = 'blue';
      ctx.fillRect(node.x - shapeSize, node.y - shapeSize / 2, shapeSize * 2, shapeSize);
      ctx.arc(node.x - shapeSize, node.y, shapeSize / 2, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.arc(node.x + shapeSize, node.y, shapeSize / 2, 1.5 * Math.PI, 0.5 * Math.PI);
    } else if (node.group === 'Approved Drug') {
      // Draw a green capsule for 'Approved Drug'
      ctx.fillStyle = 'green';
      ctx.fillRect(node.x - shapeSize, node.y - shapeSize / 2, shapeSize * 2, shapeSize);
      ctx.arc(node.x - shapeSize, node.y, shapeSize / 2, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.arc(node.x + shapeSize, node.y, shapeSize / 2, 1.5 * Math.PI, 0.5 * Math.PI);
    }

    ctx.fill();

    // Draw the node ID text
    ctx.fillStyle = 'black'; // Text color
    ctx.font = '10px Arial'; // Text font
    ctx.fillText(node.id, node.x + shapeSize + 5, node.y); // Adjust position as needed
  };

  // Use d3 force to set link distance
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('link').distance(300); // Set link distance here
    }
  }, [graphData]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeCanvasObject={drawNode}
      linkWidth={2}
      backgroundColor="white"
      nodeRelSize={10}
      enableZoomInteraction={true}
      width={1000}
    />
  );
};

export default ForceNetworkGraph;
