import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { LazyBrush } from "lazy-brush";
import { Catenary } from "catenary-curve";

import ResizeObserver from "resize-observer-polyfill";

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

const canvasStyle = {
  display: "block",
  position: "absolute"
};

const canvasTypes = [
  {
    name: "interface",
    zIndex: 15
  },
  {
    name: "drawing",
    zIndex: 11
  },
  {
    name: "temp",
    zIndex: 12
  },
  {
    name: "grid",
    zIndex: 10
  }
];

const dimensionsPropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string
]);

export default class DrawingComponentV2 extends PureComponent {
  static propTypes = {
    release : PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchEnd:PropTypes.func,
    onChange: PropTypes.func,
    loadTimeOffset: PropTypes.number,
    lazyRadius: PropTypes.number,
    brushRadius: PropTypes.number,
    brushColor: PropTypes.string,
    catenaryColor: PropTypes.string,
    gridColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    hideGrid: PropTypes.bool,
    canvasWidth: dimensionsPropTypes,
    canvasHeight: dimensionsPropTypes,
    disabled: PropTypes.bool,
    saveData: PropTypes.string,
    immediateLoading: PropTypes.bool,
    hideInterface: PropTypes.bool,
    isDrawing:PropTypes.object,
    brushMode:PropTypes.string
  };

  static defaultProps = {
    release: null,
    onTouchStart: null, // ajout pour gerer les events onTouchStart et onTouchEnd
    onTouchEnd: null,
    onChange: null,
    loadTimeOffset: 5,
    lazyRadius: 12,
    brushRadius: 10,
    brushColor: "#444",
    catenaryColor: "#0a0302",
    gridColor: "rgba(150,150,150,0.17)",
    backgroundColor: "#FFF",
    hideGrid: false,
    canvasWidth: 400,
    canvasHeight: 400,
    disabled: false,
    saveData: "",
    immediateLoading: false,
    hideInterface: false,
    isDrawing : null,
    brushMode : "Draw"
  };

  constructor(props) {
    super(props);
    this.avancement = 0;
    this.canvas = {};
    this.ctx = {};

    this.catenary = new Catenary();

    this.points = [];
    this.lines = [];

    //Permet de stocker les identifiants des TimeOut lancés
    this.timeoutsIds = [];

    this.mouseHasMoved = true;
    this.valuesChanged = true;
    this.isDrawing = false;
    this.isPressing = false;
    //{points:[],brushColor: this.props.brushColor,brushRadius: this.props.brushRadius};
    this.lastPoint = null;
    this.workingPath = {points : [], id : 0}; // stock juste les points et l'id de la workingPath
    this.currentWorkingPathID = 0;
    this.brushMode = props.brushMode;
  }

  componentDidMount() {
    this.lazy = new LazyBrush({
      radius: this.props.lazyRadius * window.devicePixelRatio,
      enabled: true,
      initialPoint: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    });
    this.chainLength = this.props.lazyRadius * window.devicePixelRatio;

    this.canvasObserver = new ResizeObserver((entries, observer) =>
      this.handleCanvasResize(entries, observer)
    );
    this.canvasObserver.observe(this.canvasContainer);

    this.loop();

    window.setTimeout(() => {
      const initX = window.innerWidth / 2;
      const initY = window.innerHeight / 2;
      this.lazy.update(
        { x: initX - this.chainLength / 4, y: initY },
        { both: true }
      );
      this.lazy.update(
        { x: initX + this.chainLength / 4, y: initY },
        { both: false }
      );
      this.mouseHasMoved = true;
      this.valuesChanged = true;
      this.clear();

      // Load saveData from prop if it exists
      if (this.props.saveData) {
        this.loadSaveData(this.props.saveData);
      }
    }, 100);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lazyRadius !== this.props.lazyRadius) {
      // Set new lazyRadius values
      this.chainLength = this.props.lazyRadius * window.devicePixelRatio;
      this.lazy.setRadius(this.props.lazyRadius * window.devicePixelRatio);
    }

    if (prevProps.saveData !== this.props.saveData) {
      this.loadSaveData(this.props.saveData);
    }

    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      // Signal this.loop function that values changed
      this.valuesChanged = true;
    }
  }

  componentWillUnmount = () => {
    this.canvasObserver.unobserve(this.canvasContainer);
  };


  undo = () => {
    const lines = this.lines.slice(0, -1);
    this.clear();
    this.simulateDrawingLines({ lines, immediate: true });
    this.triggerOnChange();
  };

  getSaveData = () => {
    let lineTmp = null;
    lineTmp = {
      points: (this.workingPath.length != 0) ? this.workingPath : [],
      brushColor: (this.props.brushMode == "Draw")?this.props.brushColor:"#FFFFFF",
      brushRadius: this.props.brushRadius
    };
    this.workingPath = [];
    return JSON.stringify({
      lines: [lineTmp],
      width: this.props.canvasWidth,
      height: this.props.canvasHeight,
      id : this.currentWorkingPathID
    });
  };

  loadSaveData = (saveData, immediate = this.props.immediateLoading, doClear = false) => {
    if (typeof saveData !== "string") {
      throw new Error("saveData needs to be of type string!");
    }
    const { lines, width, height,id } = JSON.parse(saveData);
    if (!lines || typeof lines.push !== "function") {
      throw new Error("saveData.lines needs to be an array!");
    }
    if(doClear) this.clear();
    
    if(this.lastPoint == null) this.lastPoint = lines[0].points[lines[0].points.length -1];
    if(id != null && id == this.currentWorkingPathID && lines[0].points[0] != undefined) lines[0].points.unshift(this.lastPoint);
    this.currentWorkingPathID = id;
    this.lastPoint = lines[0].points[lines[0].points.length -1];

    if (width === this.props.canvasWidth && height === this.props.canvasHeight) {
      this.simulateDrawingLines({lines, immediate});
    } 
    else {
      // we need to rescale the lines based on saved & current dimensions
      const scaleX = this.props.canvasWidth / width;
      const scaleY = this.props.canvasHeight / height;
      const scaleAvg = (scaleX + scaleY) / 2;

      this.simulateDrawingLines({
        lines: lines.map(line => ({
          ...line,
          points: line.points.map(p => ({
            x: p.x * scaleX,
            y: p.y * scaleY
          })),
          brushRadius: line.brushRadius * scaleAvg
        })),
        immediate
      });
    }
  };

  simulateDrawingLines = ({ lines, immediate }) => {
    // Simulate live-drawing of the loaded lines
    let curTime = 0;
    let timeoutGap = immediate ? 0 : this.props.loadTimeOffset;
    timeoutGap = 50;
    lines.forEach(line => {
      const { points, brushColor, brushRadius } = line;
      // Draw all at once if immediate flag is set, instead of using setTimeout
      if (immediate) {
        // Draw the points
        this.drawPoints({
          points,
          brushColor,
          brushRadius
        });
        // Save line with the drawn points
        this.points = points;
        this.saveLine({ brushColor, brushRadius });
        return;
      }

      timeoutGap = 500/points.length;
      // Use timeout to draw
      for (let i = 1; i < points.length; i++) {
        curTime += timeoutGap;
        //le timeout est lancé par une function anonyme, permet de lui faire connaitre son id.
        (function(that){
          var id = window.setTimeout(() => {
            that.drawPoints({
              points: points.slice(0, i + 1),
              brushColor,
              brushRadius
            });
            that.timeoutsIds.splice( that.timeoutsIds.indexOf(id), 1 );
          }, curTime); 
          that.timeoutsIds.push(id);
        })(this);
      }

      curTime += timeoutGap;
      window.setTimeout(() => {
        // Save this line with its props instead of this.props
        this.points = points;
        this.saveLine({ brushColor, brushRadius });
      }, curTime+5);
    });
  };

  triggerOnTouchStart = () => {
    if(this.props.isDrawing != null) this.props.isDrawing.current = true;
  }

  triggerOnTouchEnd = () => {
    if(this.props.release)this.props.release(null);
    if(this.props.isDrawing != null) this.props.isDrawing.current = false;
  }

  handleTouchStart = e => {
    this.triggerOnTouchStart();
    const { x, y } = this.getPointerPos(e);
    this.lazy.update({ x, y }, { both: true });
    this.handleMouseDown(e);
    this.mouseHasMoved = true;
  };

  handleTouchMove = e => {
    e.preventDefault();
    const { x, y } = this.getPointerPos(e);
    this.handlePointerMove(x, y);
  };

  handleTouchEnd = e => {
    this.handleMouseUp(e);
    this.triggerOnTouchEnd();
    const brush = this.lazy.getBrushCoordinates();
    this.lazy.update({ x: brush.x, y: brush.y }, { both: true });
    this.mouseHasMoved = true;
  };

  handleMouseDown = e => {
    e.preventDefault();
    this.triggerOnTouchStart();
    this.isPressing = true;
  };

  handleMouseMove = e => {
    const { x, y } = this.getPointerPos(e);
    this.handlePointerMove(x, y);
  };

  handleMouseUp = e => {
    e.preventDefault();
    this.triggerOnTouchEnd();
    this.isDrawing = false;
    this.isPressing = false;
    this.saveLine();
    this.currentWorkingPathID += 1;
    this.workingPath = [];
  };

  handleCanvasResize = (entries, observer) => {
    const saveData = this.getSaveData();
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      this.setCanvasSize(this.canvas.interface, width, height);
      this.setCanvasSize(this.canvas.drawing, width, height);
      this.setCanvasSize(this.canvas.temp, width, height);
      this.setCanvasSize(this.canvas.grid, width, height);
      this.drawGrid(this.ctx.grid);
      this.loop({ once: true });
    }
    this.loadSaveData(saveData, true);
  };

  setCanvasSize = (canvas, width, height) => {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width;
    canvas.style.height = height;
  };

  getPointerPos = e => {
    const rect = this.canvas.interface.getBoundingClientRect();
    // use cursor pos as default
    let clientX = e.clientX;
    let clientY = e.clientY;
    // use first touch if available
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    // return mouse/touch position inside canvas
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  handlePointerMove = (x, y) => {
    if (this.props.disabled) return;
    const hasChanged = this.lazy.update({ x, y });
    const isDisabled = !this.lazy.isEnabled();
    if (
      (this.isPressing && hasChanged && !this.isDrawing) ||
      (isDisabled && this.isPressing)
    ) {
      // Start drawing and add point
      this.isDrawing = true;
      this.points.push(this.lazy.brush.toObject());
      this.workingPath.push(this.lazy.brush.toObject());
    }
    if (this.isDrawing && (this.lazy.brushHasMoved() || isDisabled)) {
      // Add new point
      this.points.push(this.lazy.brush.toObject());
      this.workingPath.push(this.lazy.brush.toObject());
      // Draw current points
      this.drawPoints({
        points: this.points,
        brushColor: this.props.brushColor,
        brushRadius: this.props.brushRadius
      });
    }
    this.mouseHasMoved = true;
  };

  drawPoints = ({ points, brushColor, brushRadius }) => {
    this.ctx.temp.lineJoin = "round";
    this.ctx.temp.lineCap = "round";
    this.ctx.temp.strokeStyle = (this.props.brushMode == "Draw")?brushColor:"#FFFFFF";  

    this.ctx.temp.clearRect(
      0,
      0,
      this.ctx.temp.canvas.width,
      this.ctx.temp.canvas.height
    );
    this.ctx.temp.lineWidth = brushRadius * 2;

    let p1 = points[0];
    let p2 = points[1];
    
    this.ctx.temp.moveTo(p2.x, p2.y);
    this.ctx.temp.beginPath();

    for (var i = 1, len = points.length; i < len; i++) {
      // we pick the point between pi+1 & pi+2 as the
      // end point and p1 as our control point
      var midPoint = midPointBtw(p1, p2);
      this.ctx.temp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      p1 = points[i];
      p2 = points[i + 1];
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    this.ctx.temp.lineTo(p1.x, p1.y);
    this.ctx.temp.stroke();
  };

  saveLine = ({ brushColor, brushRadius } = {}) => {
    if (this.points.length < 2) return;
    // Save as new line
    this.lines.push({
      points: [...this.points],
      brushColor: (this.props.brushMode == "Draw")? brushColor || this.props.brushColor:"#FFFFFF",
      brushRadius: brushRadius || this.props.brushRadius
    });

    // Reset points array
    this.points.length = 0;

    const width = this.canvas.temp.width;
    const height = this.canvas.temp.height;

    // Copy the line to the drawing canvas
    this.ctx.drawing.drawImage(this.canvas.temp, 0, 0, width, height);

    // Clear the temporary line-drawing canvas
    this.ctx.temp.clearRect(0, 0, width, height);

    this.triggerOnChange();
  };

  triggerOnChange = () => {
    this.props.onChange && this.props.onChange(this);
  };

  clear = () => {
    this.lines = [];
    this.valuesChanged = true;
    this.ctx.drawing.clearRect(
      0,
      0,
      this.canvas.drawing.width,
      this.canvas.drawing.height
    );
    this.ctx.temp.clearRect(
      0,
      0,
      this.canvas.temp.width,
      this.canvas.temp.height
    );
    //On annule tous les Timeouts en cours qui allaient dessiner
    this.timeoutsIds.forEach(element => {
      window.clearTimeout(element);
    });
  };

  loop = ({ once = false } = {}) => {
    if (this.mouseHasMoved || this.valuesChanged) {
      const pointer = this.lazy.getPointerCoordinates();
      const brush = this.lazy.getBrushCoordinates();

      if(!this.props.disabled) this.drawInterface(this.ctx.interface, pointer, brush);
      this.mouseHasMoved = false;
      this.valuesChanged = false;
    }

    if (!once) {
      window.requestAnimationFrame(() => {
        this.loop();
      });
    }
  };

  drawGrid = ctx => {
    if (this.props.hideGrid) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.setLineDash([5, 1]);
    ctx.setLineDash([]);
    ctx.strokeStyle = this.props.gridColor;
    ctx.lineWidth = 0.5;

    const gridSize = 25;

    let countX = 0;
    while (countX < ctx.canvas.width) {
      countX += gridSize;
      ctx.moveTo(countX, 0);
      ctx.lineTo(countX, ctx.canvas.height);
    }
    ctx.stroke();

    let countY = 0;
    while (countY < ctx.canvas.height) {
      countY += gridSize;
      ctx.moveTo(0, countY);
      ctx.lineTo(ctx.canvas.width, countY);
    }
    ctx.stroke();
  };

  drawInterface = (ctx, pointer, brush) => {
    if (this.props.hideInterface) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw brush preview
    ctx.beginPath();
    ctx.fillStyle = this.props.brushColor;
    ctx.arc(brush.x, brush.y, this.props.brushRadius, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw mouse point (the one directly at the cursor)
    ctx.beginPath();
    ctx.fillStyle = this.props.catenaryColor;
    ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw catenary
    if (this.lazy.isEnabled()) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = this.props.catenaryColor;
      this.catenary.drawToCanvas(
        this.ctx.interface,
        brush,
        pointer,
        this.chainLength
      );
      ctx.stroke();
    }

    // Draw brush point (the one in the middle of the brush preview)
    ctx.beginPath();
    ctx.fillStyle = this.props.catenaryColor;
    ctx.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true);
    ctx.fill();
  };

  render() {
    return (
      <div
        className={this.props.className}
        style={{
          display: "block",
          background: this.props.backgroundColor,
          touchAction: "none",
          width: this.props.canvasWidth,
          height: this.props.canvasHeight,
          ...this.props.style
        }}
        ref={container => {
          if (container) {
            this.canvasContainer = container;
          }
        }}
      >
        {canvasTypes.map(({ name, zIndex }) => {
          const isInterface = name === "interface";
          return (
            <canvas
              key={name}
              ref={canvas => {
                if (canvas) {
                  this.canvas[name] = canvas;
                  this.ctx[name] = canvas.getContext("2d");
                }
              }}
              style={{ ...canvasStyle, zIndex }}
              onMouseDown={isInterface ? this.handleMouseDown : undefined}
              onMouseMove={isInterface ? this.handleMouseMove : undefined}
              onMouseUp={isInterface ? this.handleMouseUp : undefined}
              onMouseOut={isInterface ? this.handleMouseUp : undefined}
              onTouchStart={isInterface ? this.handleTouchStart : undefined}
              onTouchMove={isInterface ? this.handleTouchMove : undefined}
              onTouchEnd={isInterface ? this.handleTouchEnd : undefined}
              onTouchCancel={isInterface ? this.handleTouchEnd : undefined}
            />
          );
        })}
      </div>
    );
  }
}
