import React from 'react';
import { Row, Col, Checkbox } from 'antd';

const Legend = ({ checkedClasses, onClassChange }) => {
  const legendItems = [
    {
      group: 'Disease',
      items: [
        { shape: 'triangle', color: 'red', label: 'Autosomal dominant', class: 'Autosomal dominant' },
        { shape: 'triangle', color: 'blue', label: 'Autosomal recessive', class: 'Autosomal recessive' },
        { shape: 'triangle', color: 'green', label: 'Isolated', class: 'Isolated' },
        { shape: 'triangle', color: 'orange', label: 'Isolated cases', class: 'Isolated cases' },
        { shape: 'triangle', color: 'purple', label: 'Mitochondrial', class: 'Mitochondrial' },
        { shape: 'triangle', color: 'pink', label: 'Other', class: 'Other' },
        { shape: 'triangle', color: 'brown', label: 'X-linked', class: 'X-linked' },
        { shape: 'triangle', color: 'cyan', label: 'X-linked dominant', class: 'X-linked dominant' },
        { shape: 'triangle', color: 'magenta', label: 'X-linked recessive', class: 'X-linked recessive' },
       
      ],
    },
    {
      group: '',
      items: [
        { shape: 'circle', color: 'yellow', label: 'Known Gene', class: 'KNOWN GENE' },
      ],
    },
    {
      group: '',
      items: [
        { shape: 'capsule', color: 'blue', label: 'Repurposing candidates', class: 'Repurposing Candidate' },
      ],
    },
    {
      group: '',
      items: [
        { shape: 'capsule', color: 'green', label: 'Approved drugs', class: 'Approved Drug' },
      ],
    },
  ];

  return (
    <Row>   
      {legendItems.map((group, groupIndex) => (
        <Col key={groupIndex} span={24} style={{ marginBottom: '2px' }}>
          <dl style={{ margin: 0, padding: 0 }}> {/* Removed default margin/padding */}
            <dt style={{ fontWeight: 'bold' ,  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'flex-start' ,fontSize:"15px" }}>{group.group}</dt> {/* Group label */}
            {group.items.map((item, index) => (
              <dd
                key={index}
                style={{
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'flex-start' ,
                  marginLeft: 0, // Ensure there's no left indentation
                }}
              >
                {/* Shape representation */}
                {item.shape === 'triangle' && (
                  <>
                    <svg width="20" height="20" style={{ marginRight: '2px' }}>
                      <polygon points="10,0 0,20 20,20" fill={item.color} />
                    </svg>
                    {/* Checkbox only for triangle */}
                    <Checkbox
                      checked={checkedClasses[item.class]} // Check the checkbox based on the prop value
                      onChange={(e) => onClassChange(item.class, e.target.checked)} // Trigger prop function on change
                      style={{ marginLeft: '2px' }}
                    />
                  </>
                )}
                {item.shape === 'circle' && (
                  <svg width="20" height="20" style={{ marginRight: '2px', marginTop:"5px" }}>
                    <circle cx="10" cy="10" r="10" fill={item.color} />
                  </svg>
                )}
                {item.shape === 'capsule' && (
                  <svg width="20" height="20" style={{ marginRight: '2px' }}>
                    <rect x="0" y="5" width="20" height="10" rx="5" ry="5" fill={item.color} />
                  </svg>
                )}
                {/* Label */}
                <div style={{ marginLeft: '3px' }}>
                  {item.label}
                </div>
              </dd>
            ))}
          </dl>
        </Col>
      ))}
    </Row>
  );
};

export default Legend;