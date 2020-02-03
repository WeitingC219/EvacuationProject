import { STATES, Pos, PathMap } from '../../Utility/PathMap';
import PosMap from '../../Utility/PosMap';

const { FibonacciHeap } = require('@tyriar/fibonacci-heap');

const ExtensionId = 'FindPathExtension';

export default class FindPathExtension extends window.Autodesk.Viewing.Extension {
  constructor(viewer) {
    super();
    this.viewer = viewer;
    this.drawPoints = [];
  }

  load() {
    this.viewer.execute = this.execute;
    return true;
  }

  execute = async (startPt, endPt, scale, modelBoundingBox, penaltyArray) => {
    const cells = new PathMap(
      modelBoundingBox,
      new Pos(startPt),
      new Pos(endPt),
      this.viewer.waitForDraw,
      this.viewer.doorsAndWindows,
      scale,
      this.viewer.drawThreeObject,
    );

    // const firePoint = [260, 120]; // 260, 120 // 10000,10
    if (penaltyArray.length !== 0) {
      penaltyArray.map((penalty) => {
        cells.setPenaltySingle(penalty.point[0], penalty.point[1], penalty.value, penalty.radius);
        this.viewer.drawThreeSphere([
          penalty.point[0] / 4 + modelBoundingBox[1][0],
          penalty.point[1] / 4 + modelBoundingBox[1][1]],
        'Good',
        1,
        -6);
        return true;
      });
    }

    this.cells = cells;

    const { includeDiagonals } = false;

    const setCellState = async (pos, state) => {
      cells.setState(pos, state);
    };

    const neighbors = ([x, y]) => cells.around([x, y], includeDiagonals).map(pos => pos.toXY());
    const start = cells.start.toXY();
    const goal = cells.end.toXY();

    const path = await this.findPath({
      start, goal, neighbors, setState: setCellState,
    });

    const pathTransformed = path.map(p => [
      p[0] / scale + modelBoundingBox[1][0],
      p[1] / scale + modelBoundingBox[1][1],
      -6,
    ]);

    if (this.drawPoints !== []) {
      this.viewer.removeThreeObject(this.drawPoints);
      this.drawPoints = [];
    }

    this.drawPoints = this.viewer.drawThreeSpline(pathTransformed);
    // path.map((p) => {
    //   this.viewer.drawThreeObject([[
    //     [p[0] / scale + this.viewer.getModelBoundingBox()[1][0] - 0.2,
    //       p[1] / scale + this.viewer.getModelBoundingBox()[1][1] - 0.2,
    //       -5,
    //     ],
    //     [p[0] / scale + this.viewer.getModelBoundingBox()[1][0] + 0.2,
    //       p[1] / scale + this.viewer.getModelBoundingBox()[1][1] + 0.2,
    //       -5],
    //   ]],
    //   'All');
    //   return true;
    // });

    // console.log(path);
  }

  cost = ([x1, y1], [x2, y2]) => {
    const distX = x1 - x2;
    const distY = y1 - y2;

    return Math.sqrt((distX * distX) + (distY * distY));
  };

  heuristic = ([x1, y1], [x2, y2]) => {
    const distX = Math.abs(x1 - x2);
    const distY = Math.abs(y1 - y2);

    return distX + distY;
  };

  findPath = async function ({
    start,
    goal,
    neighbors,
    setState = async () => {},
  }) {
    const posEqual = ([x1, y1], [x2, y2]) => (x1 === x2) && (y1 === y2);

    const simplifyPath = (path) => {
      const newpath = [];
      let oldDirection = [];
      for (let i = 1; i < path.length; i += 1) {
        const newDirection = [path[i - 1][0] - path[i][0], path[i - 1][1] - path[i][1]];

        if (newDirection[0] !== oldDirection[0] || newDirection[1] !== oldDirection[1]) {
          newpath.push(path[i - 1]);
        }
        if (i === path.length - 1) {
          newpath.push(path[i]);
        }
        oldDirection = newDirection;
      }

      return newpath;
    };

    const reconstructPath = async (cameFrom, current) => {
      const path = [];
      while (cameFrom.has(current)) {
        path.unshift(current);
        await setState(current, STATES.PATH);
        // eslint-disable-next-line no-param-reassign
        current = cameFrom.get(current);
      }

      path.unshift(start);

      return simplifyPath(path);
    };

    const open = new PosMap();
    const closed = new PosMap();
    const cameFrom = new PosMap();

    const fscore = new FibonacciHeap();
    const gscore = new PosMap();

    open.add(start);
    await setState(start, STATES.OPEN);
    fscore.insert(this.cost(start, goal), start);

    gscore.add(start, 0);

    while (!fscore.isEmpty()) {
      const current = fscore.extractMinimum().value;

      if (posEqual(current, goal)) {
        return reconstructPath(cameFrom, current);
      }

      open.remove(current);
      closed.add(current);

      if (!posEqual(current, start)) {
        await setState(current, STATES.CLOSED);
      } else {
        await setState(current, STATES.PATH);
      }

      const neighborCells = neighbors(current);

      for (const neighbor of neighborCells) {
        if (closed.has(neighbor)) {
          continue;
        }

        // // 原本
        // // estimated neighbor gscore, by "Manhattan Distance"
        // const estimatedNeighborGScore = this.heuristic(neighbor, goal);

        // // The distance from start to a neighbor
        // // the "dist_between" function may vary as per the solution requirements.
        // const currentGScore = gscore.get(current, Number.POSITIVE_INFINITY);
        // const tentativeGScore = currentGScore + estimatedNeighborGScore;
        // const neighborGScore = gscore.get(neighbor, Number.POSITIVE_INFINITY);

        // if (!open.has(neighbor)) {
        //   open.add(neighbor);
        //   await setState(neighbor, STATES.OPEN);
        // }

        // if (tentativeGScore >= neighborGScore) {
        //   continue;  // This is not a better path.
        // }

        // // This path is the best until now. Record it!
        // cameFrom.add(neighbor, current);
        // gscore.set(neighbor, tentativeGScore);
        // fscore.insert(tentativeGScore + this.cost(neighbor, goal), neighbor);
        // await setState(neighbor, STATES.TENTATIVE);


        // estimated neighbor gscore, by "Manhattan Distance"
        const estimatedNeighborGScore = this.cost(current, neighbor);

        // The distance from start to a neighbor
        // the "dist_between" function may vary as per the solution requirements.
        const currentGScore = gscore.get(current, Number.POSITIVE_INFINITY);
        const tentativeGScore = currentGScore
          + estimatedNeighborGScore
          + this.cells.getPenalty(neighbor);
        const neighborGScore = gscore.get(neighbor, Number.POSITIVE_INFINITY);

        if (!open.has(neighbor)) {
          open.add(neighbor);
          await setState(neighbor, STATES.OPEN);
        }

        if (tentativeGScore >= neighborGScore) {
          continue;		// This is not a better path.
        }

        // This path is the best until now. Record it!
        cameFrom.add(neighbor, current);
        gscore.set(neighbor, tentativeGScore);
        fscore.insert(tentativeGScore + this.cost(neighbor, goal) / 4, neighbor);
        await setState(neighbor, STATES.TENTATIVE);
      }
    }

    return [];
  };

  //   unload() {
  //     // console.log(`${ExtensionId} unloaded`);

//     return true;
//   }
}

window.Autodesk.Viewing.theExtensionManager.registerExtension(
  ExtensionId, FindPathExtension,
);
