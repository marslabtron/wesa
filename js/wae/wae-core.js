// wae-object.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
        

        function WAESpriteSheet(desc) {
            this.ssid = desc.ssid;
            this.rowCount = desc.rowCount;
            this.colCount = desc.colCount;
            this.cellWidth = desc.cellWidth;
            this.cellHeight = desc.cellHeight;
            this.texture = null;
        }
        
        WAESpriteSheet.prototype.loadTextureFromFile = function (gl, url) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            // Opaque white pixel used as texture before the actual image loads
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([255, 255, 255, 255]);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
            
            // Load actual texture
            const image = new Image();
            image.onload = function() {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);  // Use NEAREST for both texture magnification and minification to keep texture sharp
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  // Do not generate Mipmap or using LINEAR since we need sharp textures
            };
            image.src = url;
        };
        
        WAESpriteSheet.prototype.getCellCount = function () {
            return this.rowCount * this.colCount;
        };
        
        WAESpriteSheet.prototype.getTextureClip = function (cellIndex, cellCount = 1, inverse = false) {
            var rect = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            rect.x1 = clipCellW * (cellIndex % colCount);
            rect.x2 = rect.x1 + clipCellW * cellCount;
            rect.y1 = clipCellH * Math.floor(cellIndex / colCount);
            rect.y2 = rect.y1 + clipCellH;
            return rect;
        };
        
        
        function WAEFrame(desc) {
            this.spriteSheet = desc.spriteSheet;
            this.cellIndex = desc.cellIndex;
            this.cellCount = desc.cellCount;
            this.center = { x: desc.center.x, y: desc.center.y };
            this.width = desc.spriteSheet.cellWidth * desc.cellCount;
            this.height = desc.spriteSheet.cellHeight;
        }
        
        
        function WAEAnimation(desc) {
            this.name = desc.name;
            this.frameCount = desc.frameCount;
            this.isLoop = desc.isLoop;
            this.next = desc.next;
            this.ttl = desc.ttl;
            this.frameList = [];
            this.endTimeList = [];
        }
   
        WAEAnimation.prototype.addFrame = function (index, frame, endTime) {
            this.frameList[index] = frame;
            this.endTimeList[index] = endTime;
        };

        
        function WAEObject(desc) {
            this.oid = desc.oid;
            this.type = desc.type;
            this.name = desc.name;
            this.animList = [];
        }
        
        WAEObject.prototype.addAnimationAt = function (slot, anim) {
            this.animList[slot] = anim;
        };

        
        function WAESprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.team = desc.team;
            this.position = { x: desc.position.x, y: desc.position.y };
            this.zDepth = desc.zDepth;
            this.index = null;
            this.scene = null;
			this.frameNum = 0;
			this.state = 0;
			this.time = 0;
        }
		
		WAESprite.prototype.getCurrentFrame = function () {
			return this.object.animList[this.action].frameList[this.frameNum];
		};
		
		WAESprite.prototype.changeAction = function (newAction) {
			
		};
       
        WAESprite.prototype.update = function () {
			var anim = this.object.animList[this.action];
            var animFrameCount = anim.frameList.length;
			this.time++;
			if (this.time >= anim.endTimeList[this.frameNum]) {
				this.frameNum++;
				if (this.time >= anim.endTimeList(animFrameCount - 1)) {
					this.time = 0;
				}
				if (this.frameNum >= animFrameCount) {
					this.frameNum = 0;
					if (!anim.isLoop) {
						this.changeAction(anim.next);
					}
				}
			}
        };
        
        WAESprite.prototype.addToRenderBatch = function () {
            WAESpriteBatcher.addSpriteToBatch(sprite);
        };
        
        
        function WAEScene() {
            this.spriteList = [];
        }

        WAEScene.prototype.addSprite = function (sprite) {
            var newIndex = null;
            for (var i = 0; i < this.spriteList.length; i++) {
                if (!this.spriteList[i]) {
                    newIndex = i;
                    this.spriteList[i] = sprite;
                }
            }
            if (!newIndex) {
                newIndex = this.spriteList.length;
                this.spriteList[newIndex] = sprite;
            }
            sprite.index = newIndex;
            sprite.scene = this;
        }
        
        WAEScene.prototype.update = function () {
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    this.spriteList[i].update();
                }
            }
        };
        
        WAEScene.prototype.addToRenderBatch = function () {
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    this.spriteList[i].addToRenderBatch();
                }
            }
        };
        
        
        return {
            SpriteSheet: WAESpriteSheet,
            Frame: WAEFrame,
            Animation: WAEAnimation,
            StoredObject: WAEObject,
            Sprite: WAESprite,
            Scene: WAEScene
        };
        
    
    }

);