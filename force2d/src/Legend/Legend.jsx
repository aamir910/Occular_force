import React from 'react';
import { Row, Col, Checkbox } from 'antd';

const Legend = ({ checkedClasses, onClassChange, selectedValues }) => {
  const legendItems = [
    {
      group: 'Disease',
      items: [
        { shape: 'triangle', color: 'red', label: 'Autosomal dominant', class: 'Autosomal dominant' },
        { shape: 'triangle', color: 'blue', label: 'Autosomal recessive', class: 'Autosomal recessive' },
        { shape: 'triangle', color: 'green', label: 'Isolated', class: 'Isolated' },
        // { shape: 'triangle', color: 'orange', label: 'Isolated cases', class: 'Isolated cases' },
        { shape: 'triangle', color: 'purple', label: 'Mitochondrial', class: 'Mitochondrial' },
        { shape: 'triangle', color: 'pink', label: 'Other', class: 'Other' },
        { shape: 'triangle', color: 'cyan', label: 'X-linked dominant', class: 'X-linked dominant' },
        { shape: 'triangle', color: 'magenta', label: 'X-linked recessive', class: 'X-linked recessive' },
     
      ],
    },
    {
      group: '',
      items: [
        { shape: 'circle', color: 'yellow', label: 'Known Gene', class: 'KNOWN GENE' },
        { shape: 'capsule', color: 'blue', label: 'Repurposing candidates', class: 'Repurposing Candidate' },
        { shape: 'capsule', color: 'green', label: 'Approved drugs', class: 'Approved Drug' },
      ],
    },
  ];

  const filteredLegendItems = legendItems.map((group) => {
    if (group.group === 'Disease') {
      return {
        ...group,
        items: selectedValues.length === 0
          ? group.items
          : group.items.filter(item => selectedValues.includes(item.label))
      };
    }
    return group;
  });

  return (
    <Row>
      {filteredLegendItems.map((group, groupIndex) => (
        <Col key={groupIndex} span={24} style={{ marginTop: group.group === '' ? '25px' : '0' }}>
          <dl style={{ margin: 0, padding: 0 }}>
            <dt style={{
              fontWeight: 'bold', display: 'flex', alignItems: 'start', justifyContent: 'flex-start', fontSize: "15px",
              marginBottom: group.group === 'Others' ? '10px' : '0'
            }}>
              {group.group || null}
            </dt>
            {group.items.map((item, index) => (
              <dd
                key={index}
                style={{
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'flex-start',
                  marginLeft: 0,
                }}
              >
                {item.shape === 'triangle' && (
                  <>
                    <svg width="20" height="20" style={{ marginRight: '2px' }}>
                      <polygon points="10,0 0,20 20,20" fill={item.color} />
                    </svg>
                    <Checkbox
                      checked={checkedClasses[item.class]}
                      onChange={(e) => onClassChange(item.class, e.target.checked)}
                      style={{ marginLeft: '2px' }}
                    />
                  </>
                )}
                {item.shape === 'circle' && (
                  <svg width="20" height="20" style={{ marginRight: '2px', marginTop: "5px" }}>
                    <circle cx="10" cy="10" r="10" fill={item.color} />
                  </svg>
                )}
                {item.shape === 'capsule' && (
                  <svg width="20" height="20" style={{ marginRight: '2px' }}>
                    <rect x="0" y="5" width="20" height="10" rx="5" ry="5" fill={item.color} />
                  </svg>
                )}
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
