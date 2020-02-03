import React from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import { timeConverter } from '../../Utility/utility';

function tableUI(props) {
  const { historyPanelData, historyIdSelect } = props;
  const columns = [
    {
      title: '负责公司',
      dataIndex: 'company',
      width: 150,
    },
    {
      title: '养护时间',
      dataIndex: 'maintenanceTime',
      width: 150,
    },
    {
      title: '养护状态',
      dataIndex: 'status',
      width: 150,
    },
    {
      title: '承包价格',
      dataIndex: 'price',
      width: 150,
    },
    {
      title: '负责人',
      dataIndex: 'personInCharge',
      width: 150,
    },
    // {
    //   title: '状态描述',
    //   dataIndex: 'description',
    //   width: 150,
    // },
  ];

  let dataSource = historyPanelData.map((data) => {
    if (data.bindingTagId === historyIdSelect) {
      return { ...data, maintenanceTime: timeConverter(data.maintenanceTime), key: data._id };
    }
    return null;
  });
  dataSource = dataSource.filter(n => n);

  const content = (
    dataSource
      ? (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 50 }}
          scroll={{ y: 240 }}
        />
      )
      : <div />
  );

  return (
    <div>
      { content }
    </div>
  );
}

tableUI.propTypes = {
  historyPanelData: PropTypes.arrayOf(PropTypes.shape({})),
  historyIdSelect: PropTypes.string,
};

tableUI.defaultProps = {
  historyPanelData: [],
  historyIdSelect: '',
};

export default tableUI;
