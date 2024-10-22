import React from 'react';
import { Row, Col, Checkbox } from 'antd';

const Legend = ({ checkedClasses, onClassChange }) => {
  const legendItems = [
    {
      group: 'DISORDER',
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
        { shape: 'triangle', color: 'gray', label: 'XLR', class: 'XLR' },
      ],
    },
    {
      group: 'KNOWN GENE',
      items: [
        { shape: 'circle', color: 'yellow', label: 'KNOWN GENE', class: 'KNOWN GENE' },
      ],
    },
    {
      group: 'Repurposing Candidate',
      items: [
        { shape: 'capsule', color: 'blue', label: 'Repurposing Candidate', class: 'Repurposing Candidate' },
      ],
    },
    {
      group: 'Approved Drug',
      items: [
        { shape: 'capsule', color: 'green', label: 'Approved Drug', class: 'Approved Drug' },
      ],
    },
  ];

  return (
    <Row>
      {legendItems.map((group, groupIndex) => (
        <Col key={groupIndex} span={24} style={{ marginBottom: '16px' }}>
          <h5>{group.group}</h5> {/* Group label */}
          {group.items.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              {/* Shape representation */}
              {item.shape === 'triangle' && (
                <>
                  <svg width="20" height="20" style={{ marginRight: '8px' }}>
                    <polygon points="10,0 0,20 20,20" fill={item.color} />
                  </svg>
                  {/* Checkbox only for triangle */}
                  <Checkbox
                    checked={checkedClasses[item.class]} // Check the checkbox based on the prop value
                    onChange={(e) => onClassChange(item.class, e.target.checked)} // Trigger prop function on change
                    style={{ marginLeft: '8px' }}
                  />
                </>
              )}
              {item.shape === 'circle' && (
                <svg width="20" height="20" style={{ marginRight: '8px' }}>
                  <circle cx="10" cy="10" r="10" fill={item.color} />
                </svg>
              )}
              {item.shape === 'capsule' && (
                <svg width="20" height="20" style={{ marginRight: '8px' }}>
                  <rect x="0" y="5" width="20" height="10" rx="5" ry="5" fill={item.color} />
                </svg>
              )}
              {/* Label */}
              <div style={{ marginLeft: '8px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </Col>
      ))}
    </Row>
  );
};

export default Legend;
