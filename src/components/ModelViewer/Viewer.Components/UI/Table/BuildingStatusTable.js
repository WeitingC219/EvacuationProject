import React from 'react';
import $ from 'jquery';
import {
  Table, Button, Badge, message,
} from 'antd';
import fakePeopleData from '../../FakeData/PeopleData';
import { timeConverter } from '../../Utility/utility';

class BuildingStatusTable extends React.Component {
  state = {
    showButtonClicked: false,
    selectButtonClicked: false,
    selectPoint: [],
    modelBoundingBox: null,
  }

  componentDidMount = () => {
    const { getModelBoundingBox } = this.props;
    this.setState({ modelBoundingBox: getModelBoundingBox() });
  }

  onShowButtonClick = () => {
    const { showPeopleClicked, removePeopleClicked } = this.props;
    const { showButtonClicked } = this.state;
    if (showButtonClicked) {
      removePeopleClicked();
    } else {
      showPeopleClicked(fakePeopleData);
    }
    this.setState(prevState => ({
      showButtonClicked: !prevState.showButtonClicked,
    }));
  }

  onStartButtonClick = () => {
    const { container } = this.props;
    const { selectButtonClicked } = this.state;
    if (selectButtonClicked) {
      $(container).unbind('click', this.onSelectStartPoint);
    } else {
      $(container).bind('click', this.onSelectStartPoint);
    }
    this.setState(prevState => ({
      selectButtonClicked: !prevState.selectButtonClicked,
    }));
  }

  onFindButtonClick = (e) => {
    const { execute, penalty } = this.props;
    const { selectPoint, modelBoundingBox } = this.state;
    if (selectPoint.length !== 0) {
      execute([
        Math.round((selectPoint[0] - modelBoundingBox[1][0]) * 4),
        Math.round((selectPoint[1] - modelBoundingBox[1][1]) * 4),
      ], [
        Math.round((fakePeopleData[e.target.id].position[0] - modelBoundingBox[1][0]) * 4),
        Math.round((fakePeopleData[e.target.id].position[1] - modelBoundingBox[1][1]) * 4),
      ], 4, modelBoundingBox, penalty);
      // [260, 120], 10000, 10
    } else {
      message.warning('Please Select Start Point!', 1);
    }
  }

  onSelectStartPoint = (event) => {
    const { container, impl } = this.props;
    const screenPoint = {
      x: event.clientX,
      y: event.clientY,
    };

    const viewerPosition = container.getBoundingClientRect();

    const hitTest = impl.hitTest(
      screenPoint.x - viewerPosition.x, screenPoint.y - viewerPosition.y, true,
    );

    if (hitTest) {
      this.setState({
        selectPoint: [
          hitTest.intersectPoint.x,
          hitTest.intersectPoint.y,
          hitTest.intersectPoint.z,
        ],
      });

      this.onStartButtonClick();
    }
  }

  render() {
    const columns = [
      {
        id: 'ID',
        dataIndex: 'id',
        width: 65,
      },
      {
        title: 'Position',
        dataIndex: 'level',
        width: 65,
      },
      {
        title: 'Enter Time',
        dataIndex: 'enterTime',
        width: 110,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 60,
      },
      {
        title: 'Find Path',
        dataIndex: 'findPath',
        width: 60,
      },
    ];

    const data = [];
    for (let i = 0; i < fakePeopleData.length; i += 1) {
      data.push({
        key: i,
        id: fakePeopleData[i]._id,
        level: fakePeopleData[i].level,
        enterTime: timeConverter(fakePeopleData[i].enterTime),
        status: <Badge status={fakePeopleData[i].status === 'Good' ? 'success' : 'error'} text={fakePeopleData[i].status} />,
        findPath: <Button id={i} onClick={this.onFindButtonClick}>Find</Button>,
      });
    }

    const { showButtonClicked, selectButtonClicked } = this.state;

    return (
      <div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50 }}
          scroll={{ y: 240 }}
        />
        <Button type={showButtonClicked ? 'danger' : 'primary'} onClick={this.onShowButtonClick} style={{ top: '-48px', marginRight: '20px' }} ghost>
          {showButtonClicked ? 'Remove People Position' : 'Show People Position'}
        </Button>
        <Button type={selectButtonClicked ? 'danger' : 'primary'} onClick={this.onStartButtonClick} style={{ top: '-48px' }} ghost>
          {selectButtonClicked ? 'Selecting' : 'Select Start Point'}
        </Button>
      </div>
    );
  }
}

export default BuildingStatusTable;
