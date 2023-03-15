(function () {
  const controller = {
    direction: "",

    left() {
      if (this.direction == "right") {
        this._stopRight();
      }
      if (this.direction == "jump") {
        this._stopJump();
      }
      if (this.direction != "left") {
        this._goLeft();
        this.direction = "left";
      }
    },

    right() {
      if (this.direction == "left") {
        this._stopLeft();
      }
      if (this.direction == "jump") {
        this._stopJump();
      }
      if (this.direction != "right") {
        this._goRight();
        this.direction = "right";
      }
    },

    jump() {
      if (this.direction == "left") {
        this._stopLeft();
      }
      if (this.direction == "right") {
        this._stopRight();
      }
      if (this.direction != "jump") {
        this.direction = "jump";
        this._goJump();
      } else {
        this._stopJump();
        this._goJump();
      }
    },

    stop() {
      if (this.direction == "left") {
        this._stopLeft();
      }
      if (this.direction == "right") {
        this._stopRight();
      }
      if (this.direction == "jump") {
        this._stopJump();
      }
      this.direction = "";
    },

    toggleTheWorld() {
      document.dispatchEvent(new KeyboardEvent('keypress', { keyCode: 66 }));
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 66 }));
      document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 66 }));
    },

    _goJump() {
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 88 }));
      document.dispatchEvent(new KeyboardEvent('keypress', { keyCode: 88 }));
    },

    _stopJump() {
      document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 88 }));
    },

    _goRight() {
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 }));
      document.dispatchEvent(new KeyboardEvent('keypress', { keyCode: 39 }));
    },

    _stopRight() {
      document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 39 }));
    },

    _goLeft() {
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 37 }));
      document.dispatchEvent(new KeyboardEvent('keypress', { keyCode: 37 }));
    },

    _stopLeft() {
      document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 37 }));
    }
  };


  async function main() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 300,
        height: 300
      }
    });
    // 成功返回promise对象，接收一个mediaStream参数与video标签进行对接
    const video = document.getElementById("video");
    video.srcObject = mediaStream;
    video.play();
    let offsetX = 0, offsetY = 0;
    video.ondragend = (event) => {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
      let left = video.style.left;
      left = left.substring(0,left.indexOf("p"));
      left = parseInt(left);
      left += offsetX;
      video.style.left = `${left}px`;

      let bottom = video.style.bottom;
      
      bottom = bottom.substring(0,bottom.indexOf("p"));
      bottom = parseInt(bottom);
      
      bottom -= offsetY;
      video.style.bottom = `${bottom}px`;
    }

    // Load the MediaPipe handpose model.
    const model = await handpose.load();
    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a
    // hand prediction from the MediaPipe graph.

    const tip = document.getElementById("text");

    while (true) {
      controller.toggleTheWorld();
      const predictions = await model.estimateHands(video);
      controller.toggleTheWorld();
      if (predictions.length == 1) {
        const wrist = predictions[0].landmarks[0];
        const middle_finger_tip = predictions[0].landmarks[12];
        const dis = distance(wrist, middle_finger_tip);
        if (dis > 10000) {
          deltax = wrist[0] - middle_finger_tip[0];
          deltay = wrist[1] - middle_finger_tip[1];
          if (deltax < -100) {
            controller.left();
          } else if (deltax > 100) {
            controller.right();
          } else if (deltay > 100) {
            controller.jump();
          } else {
            controller.stop();
          }
        } else {
          controller.stop();
        }
        if (tip.innerText != "perform well") tip.innerText = "perform well";
      } else {
        if (tip.innerText != "show your hand") tip.innerText = "show your hand";
        controller.stop();
      }

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      })
    }
  }

  function distance(pos, pos2) {
    return Math.pow(pos[0] - pos2[0], 2) + Math.pow(pos[1] - pos2[1], 2);
  }
  main();
})()