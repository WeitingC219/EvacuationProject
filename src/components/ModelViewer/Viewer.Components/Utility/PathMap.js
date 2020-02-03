export const STATES = {
  BLOCKED: 'blocked',
  CLEAR: 'clear',
  START: 'start',
  END: 'end',
  OPEN: 'open',
  CLOSED: 'closed',
  TENTATIVE: 'tentative',
  PATH: 'path',
};

export const DIRECTIONS = {
  NORTH: 1,
  EAST: 2,
  SOUTH: 4,
  WEST: 8,
  NORTHEAST: 3,
  SOUTHEAST: 6,
  NORTHWEST: 9,
  SOUTHWEST: 12,
  NONE: 0,
  ALL: 15,
};

DIRECTIONS.OPPOSITE = {
  [DIRECTIONS.NORTH]: DIRECTIONS.SOUTH,
  [DIRECTIONS.EAST]: DIRECTIONS.WEST,
  [DIRECTIONS.SOUTH]: DIRECTIONS.NORTH,
  [DIRECTIONS.WEST]: DIRECTIONS.EAST,
  [DIRECTIONS.NORTHEAST]: DIRECTIONS.SOUTHWEST,
  [DIRECTIONS.SOUTHEAST]: DIRECTIONS.NORTHWEST,
  [DIRECTIONS.NORTHWEST]: DIRECTIONS.SOUTHEAST,
  [DIRECTIONS.SOUTHWEST]: DIRECTIONS.NORTHEAST,
};

DIRECTIONS.IN_ORDER = [
  DIRECTIONS.NORTH,
  DIRECTIONS.NORTHEAST,
  DIRECTIONS.EAST,
  DIRECTIONS.SOUTHEAST,
  DIRECTIONS.SOUTH,
  DIRECTIONS.SOUTHWEST,
  DIRECTIONS.WEST,
  DIRECTIONS.NORTHWEST,
];

DIRECTIONS.IN_ORDER_FOUR = [DIRECTIONS.NORTH, DIRECTIONS.EAST, DIRECTIONS.SOUTH, DIRECTIONS.WEST];

export const WALLS = DIRECTIONS;

export class Pos {
  constructor([x, y]) {
    this.x = x;
    this.y = y;
  }

  isEqual(rawPos) {
    const pos = Pos.toPos(rawPos);

    return this.x === pos.x && this.y === pos.y;
  }

  static toXY(pos) {
    if (pos instanceof Pos) {
      return [pos.x, pos.y];
    } if (pos instanceof Array && pos.length === 2) {
      return pos;
    }

    return null;
  }

  inDirection(direction) {
    let dX = 0; let
      dY = 0;
    switch (direction) {
      case DIRECTIONS.NORTH:
        dY = 1;
        break;

      case DIRECTIONS.EAST:
        dX = 1;
        break;

      case DIRECTIONS.SOUTH:
        dY = -1;
        break;

      case DIRECTIONS.WEST:
        dX = -1;
        break;
      case DIRECTIONS.NORTHEAST:
        dX = 1;
        dY = 1;
        break;
      case DIRECTIONS.NORTHWEST:
        dX = -1;
        dY = 1;
        break;
      case DIRECTIONS.SOUTHEAST:
        dX = 1;
        dY = -1;
        break;
      case DIRECTIONS.SOUTHWEST:
        dX = -1;
        dY = -1;
        break;
      default:
    }
    const x = this.x + dX;
    const y = this.y + dY;

    return new Pos([x, y]);
  }

  toXY() {
    return Pos.toXY(this);
  }

  static toPos(pos) {
    if (pos instanceof Pos) {
      return pos;
    } if (pos instanceof Array && pos.length === 2) {
      return new Pos([pos[0], pos[1]]);
    }
    return null;
  }

  manhattanDistance(rawPos) {
    const pos = Pos.toPos(rawPos);

    return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
  }

  euclideanDistance(rawPos) {
    const pos = Pos.toPos(rawPos);

    const distX = this.x - pos.x;
    const distY = this.y - pos.y;

    return Math.sqrt(distX * distX + distY * distY);
  }

  directionTo(rawTo) {
    const to = Pos.toPos(rawTo);

    const dX = to.x - this.x;
    const dY = to.y - this.y;
    if (Math.abs(dX) + Math.abs(dY) === 1) {
      if (dX === 1) {
        return DIRECTIONS.EAST;
      } if (dX === -1) {
        return DIRECTIONS.WEST;
      } if (dY === 1) {
        return DIRECTIONS.SOUTH;
      } if (dY === -1) {
        return DIRECTIONS.NORTH;
      }
    } else if (Math.abs(dX) + Math.abs(dY) === 2) {
      if (dX === 1 && dY === 1) {
        return DIRECTIONS.NORTHEAST;
      } if (dX === -1 && dY === 1) {
        return DIRECTIONS.NORTHWEST;
      } if (dX === 1 && dY === -1) {
        return DIRECTIONS.SOUTHEAST;
      } if (dX === -1 && dY === -1) {
        return DIRECTIONS.SOUTHWEST;
      }
    }

    return DIRECTIONS.NONE;
  }
}

export class PathMap {
  constructor(modelBoundingBox, start, end, wallArray,
    doorsAndWindows, scale, drawThreeObject) {
    this.modelMaxPt = [modelBoundingBox[0][0], modelBoundingBox[0][1]];
    this.modelMinPt = [modelBoundingBox[1][0], modelBoundingBox[1][1]];
    this.width = Math.ceil(modelBoundingBox[0][0] - modelBoundingBox[1][0]);
    this.height = Math.ceil(modelBoundingBox[0][1] - modelBoundingBox[1][1]);
    this.start = start;
    this.end = end;
    this.wallArray = wallArray;
    this.doorsAndWindows = doorsAndWindows;
    this.scale = scale;
    this.drawThreeObject = drawThreeObject;
    this.build();
  }

  build() {
    this.state = Array(this.width * this.scale);
    this.walls = Array(this.width * this.scale);
    this.penalty = Array(this.width * this.scale);

    for (let x = 0; x < this.width * this.scale; x += 1) {
      this.state[x] = Array(this.height * this.scale);
      this.state[x].fill(STATES.CLEAR, 0, this.height * this.scale - 1);

      this.walls[x] = Array(this.height * this.scale);
      this.walls[x].fill(WALLS.NONE, 0, this.height * this.scale - 1);

      this.penalty[x] = Array(this.height * this.scale);
      this.penalty[x].fill(0, 0, this.height * this.scale - 1);
    }

    for (let x = 0; x < this.width * this.scale; x += 1) {
      for (let y = 0; y < this.height * this.scale; y += 1) {
        const pos = new Pos([x, y]);

        if (pos.isEqual(this.start)) {
          this.state[x][y] = STATES.START;
        } else if (pos.isEqual(this.end)) {
          this.state[x][y] = STATES.END;
        }
      }
    }

    this.buildWall();
    this.buildDoor();
  }

  buildWall() {
    const choices = WALLS.IN_ORDER_FOUR;
    this.wallArray.map((elem) => {
      if (elem[0].length !== 0) {
        elem[0].map((el) => {
          const xStart = Math.ceil((el[1][0] - this.modelMinPt[0]) * this.scale); // 大於xMin代表數之最小整數
          const xEnd = Math.floor((el[0][0] - this.modelMinPt[0]) * this.scale); // 小於xMax代表數之最大整數
          const yStart = Math.ceil((el[1][1] - this.modelMinPt[1]) * this.scale); // 大於yMin代表數之最小整數
          const yEnd = Math.floor((el[0][1] - this.modelMinPt[1]) * this.scale); // 小於yMax代表數之最大整數
          for (let i = xStart; i <= xEnd; i += 1) {
            for (let j = yStart; j <= yEnd; j += 1) {
              const pos = new Pos([i, j]);
              this.penalty[i][j] = 10000;
              // this.drawThreeObject([[[
              //   (i) / this.scale + this.modelMinPt[0] - 0.05,
              //   (j) / this.scale + this.modelMinPt[1] - 0.05, 10,
              // ], [
              //   (i) / this.scale + this.modelMinPt[0] + 0.05,
              //   (j) / this.scale + this.modelMinPt[1] + 0.05, 10],
              // ]], 'All');
              choices.map((direction) => {
                this.setWall(pos, direction);
                return true;
              });
            }
          }
          this.setPenalty(
            xStart === 0 || xStart === 1 ? 1 : xStart,
            xEnd === this.width * this.scale - 2 || xEnd === this.width * this.scale - 1
              ? this.width * this.scale - 2 : xEnd,
            yStart === 0 || yStart === 1 ? 1 : yStart,
            yEnd === this.height * this.scale - 2 || yEnd === this.height * this.scale - 1
              ? this.height * this.scale - 2 : yEnd,
            0,
          );
          return true;
        });
      }
      return true;
    });
  }

  buildDoor = () => {
    const choices = WALLS.IN_ORDER_FOUR;
    this.doorsAndWindows.map((elem) => {
      if (elem[0].length !== 0) {
        elem[0].map((el) => {
          const xStart = Math.ceil((el[1][0] - this.modelMinPt[0]) * this.scale);
          const xEnd = Math.floor((el[0][0] - this.modelMinPt[0]) * this.scale);
          const yStart = Math.ceil((el[1][1] - this.modelMinPt[1]) * this.scale);
          const yEnd = Math.floor((el[0][1] - this.modelMinPt[1]) * this.scale);
          const xMiddle = Math.round(
            ((el[1][0] + el[0][0]) / 2 - this.modelMinPt[0]) * this.scale,
          ); // 長邊取中間值
          const yMiddle = Math.round(
            ((el[1][1] + el[0][1]) / 2 - this.modelMinPt[1]) * this.scale,
          ); // 長邊取中間值

          // 長邊那軸只取中間值當可通過路徑
          if (el[0][0] - el[1][0] > el[0][1] - el[1][1]) {
            this.clearPenalty(xStart, xEnd, yStart - 4, yEnd + 4);
            for (let j = yStart; j <= yEnd; j += 1) {
              const pos = new Pos([xMiddle, j]);
              // this.drawThreeObject([[[
              //   (i) / this.scale + this.modelMinPt[0] - 0.2,
              //   (j) / this.scale + this.modelMinPt[1] - 0.2, 10,
              // ], [
              //   (i) / this.scale + this.modelMinPt[0] + 0.2,
              //   (j) / this.scale + this.modelMinPt[1] + 0.2, 10],
              // ]], 'All');
              choices.map((direction) => {
                this.clearWall(pos, direction);
                return true;
              });
            }
          } else {
            this.clearPenalty(xStart - 4, xEnd + 4, yStart, yEnd);
            for (let i = xStart; i <= xEnd; i += 1) {
              const pos = new Pos([i, yMiddle]);
              // this.drawThreeObject([[[
              //   (i) / this.scale + this.modelMinPt[0] - 0.2,
              //   (j) / this.scale + this.modelMinPt[1] - 0.2, 10
              // ], [
              //   (i) / this.scale + this.modelMinPt[0] + 0.2,
              //   (j) / this.scale + this.modelMinPt[1] + 0.2, 10]
              // ]], 'All');
              choices.map((direction) => {
                this.clearWall(pos, direction);
                return true;
              });
            }
          }
          return true;
        });
      }
      return true;
    });
  }

  setPenalty = (xStart, xEnd, yStart, yEnd, count) => {
    if (count === 3) {
      return;
    }
    for (let i = xStart - 1; i <= xEnd + 1; i += 1) {
      this.penalty[i][yStart - 1] = this.penalty[xStart][yStart] / 2;
      this.penalty[i][yEnd + 1] = this.penalty[xStart][yStart] / 2;
    }
    for (let j = yStart - 1; j <= yEnd + 1; j += 1) {
      this.penalty[xStart - 1][j] = this.penalty[xStart][yStart] / 2;
      this.penalty[xEnd + 1][j] = this.penalty[xStart][yStart] / 2;
    }
    this.setPenalty(
      xStart === 1 ? 1 : xStart - 1,
      xEnd === this.width * this.scale - 2 ? this.width * this.scale - 2 : xEnd + 1,
      yStart === 1 ? 1 : yStart - 1,
      yEnd === this.height * this.scale - 2 ? this.height * this.scale - 2 : yEnd + 1,
      count + 1,
    );
  }

  setPenaltySingle = (x, y, penalty, radius) => {
    for (let i = -(radius); i <= radius; i += 1) {
      for (let j = -(radius); j <= radius; j += 1) {
        if (x + i >= 0 && x + i < this.width * this.scale
          && y + j >= 0 && y + j < this.height * this.scale) {
          if (Math.sqrt(i * i + j * j) === 0 || Math.sqrt(i * i + j * j) === 1) {
            this.penalty[x + i][y + j] = penalty;
          } else {
            this.penalty[x + i][y + j] = penalty
            / (Math.sqrt(i * i + j * j) * Math.sqrt(i * i + j * j));
          }
        }
      }
    }
  }

  clearPenalty = (xStart, xEnd, yStart, yEnd) => {
    for (let i = xStart; i <= xEnd; i += 1) {
      for (let j = yStart; j <= yEnd; j += 1) {
        this.penalty[i][j] = 0;
      }
    }
  }

  setWall(rawPos, direction) {
    const pos = Pos.toPos(rawPos);

    if (this.isInBounds(pos)) {
      // eslint-disable-next-line no-bitwise
      this.walls[pos.x][pos.y] |= direction;

      const neighbor = pos.inDirection(direction); // get neighboring cell
      if (this.isInBounds(neighbor)) {
        // eslint-disable-next-line no-bitwise
        this.walls[neighbor.x][neighbor.y] |= DIRECTIONS.OPPOSITE[direction];
      }
    }
  }

  clearWall(rawPos, direction) {
    const pos = Pos.toPos(rawPos);

    if (this.isInBounds(pos)) {
      // eslint-disable-next-line no-bitwise
      this.walls[pos.x][pos.y] &= ~direction;

      const neighbor = pos.inDirection(direction); // get neighboring cell
      if (this.isInBounds(neighbor)) {
        // eslint-disable-next-line no-bitwise
        this.walls[neighbor.x][neighbor.y] &= ~DIRECTIONS.OPPOSITE[direction];
      }
    }
  }

  getState(rawPos) {
    const pos = Pos.toPos(rawPos);

    return this.state[pos.x][pos.y];
  }

  getWalls(rawPos) {
    const pos = Pos.toPos(rawPos);

    let extra = 0;
    if (pos.x === 0) {
      // eslint-disable-next-line no-bitwise
      extra |= WALLS.WEST;
    } else if (pos.x === this.width - 1) {
      // eslint-disable-next-line no-bitwise
      extra |= WALLS.EAST;
    }

    if (pos.y === 0) {
      // eslint-disable-next-line no-bitwise
      extra |= WALLS.SOUTH;
    } else if (pos.y === this.height - 1) {
      // eslint-disable-next-line no-bitwise
      extra |= WALLS.NORTH;
    }

    // eslint-disable-next-line no-bitwise
    return this.walls[pos.x][pos.y] | extra;
  }

  getPenalty(rawPos) {
    const pos = Pos.toPos(rawPos);

    return this.penalty[pos.x][pos.y];
  }

  setState(rawPos, newState) {
    const pos = Pos.toPos(rawPos);

    this.state[pos.x][pos.y] = newState;
  }

  isInBounds(pos) {
    return pos.x >= 0 && pos.x < this.width * this.scale
      && pos.y >= 0 && pos.y < this.height * this.scale;
  }

  canMove(rawFromPos, direction) {
    const fromPos = Pos.toPos(rawFromPos);
    const toPos = fromPos.inDirection(direction);

    if (!(this.isInBounds(fromPos) && this.isInBounds(toPos))) {
      return false;
    }

    // eslint-disable-next-line no-bitwise
    if (this.walls[fromPos.x][fromPos.y] & direction) {
      return false;
    }
    return true;
  }

  around(rawPos) {
    const from = Pos.toPos(rawPos);

    const results = [];

    DIRECTIONS.IN_ORDER.map((direction) => {
      if (this.canMove(from, direction)) {
        const neighbor = from.inDirection(direction);
        results.push(neighbor);
      }
      return true;
    });
    // for (const direction of DIRECTIONS.IN_ORDER) {
    //   if (this.canMove(from, direction)) {
    //     const neighbor = from.inDirection(direction);
    //     results.push(neighbor);
    //   }
    // }

    return results;
  }
}
