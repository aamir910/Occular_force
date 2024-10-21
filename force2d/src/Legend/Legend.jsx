import React from 'react';
import { Row, Col, Card, Tag } from 'antd';

const Legend = () => {
  const legendItems = [
    {
      group: 'DISORDER',
      items: [
        { shape: 'triangle', color: 'red', label: 'Autosomal dominant' },
        { shape: 'triangle', color: 'blue', label: 'Autosomal recessive' },
        { shape: 'triangle', color: 'green', label: 'Isolated' },
        { shape: 'triangle', color: 'orange', label: 'Isolated cases' },
        { shape: 'triangle', color: 'purple', label: 'Mitochondrial' },
        { shape: 'triangle', color: 'pink', label: 'Other' },
        { shape: 'triangle', color: 'brown', label: 'X-linked' },
        { shape: 'triangle', color: 'cyan', label: 'X-linked dominant' },
        { shape: 'triangle', color: 'magenta', label: 'X-linked recessive' },
        { shape: 'triangle', color: 'gray', label: 'XLR' },
      ],
    },
    {
      group: 'KNOWN GENE',
      items: [
        { shape: 'circle', color: 'yellow', label: 'KNOWN GENE' },
      ],
    },
    {
      group: 'Repurposing Candidate',
      items: [
        { shape: 'capsule', color: 'blue', label: 'Repurposing Candidate' },
      ],
    },
    {
      group: 'Approved Drug',
      items: [
        { shape: 'capsule', color: 'green', label: 'Approved Drug' },
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
                <svg width="20" height="20" style={{ marginRight: '8px' }}>
                  <polygon points="10,0 0,20 20,20" fill={item.color} />
                </svg>
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
              {/* Label with Tag component */}
              <Tag color={item.color} style={{ marginLeft: '8px' }}>
                {item.label}
              </Tag>
            </div>
          ))}
        </Col>
      ))}
    </Row>
  );
};

export default Legend;
