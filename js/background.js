$(document).ready(background());

function background() {

	function SubType() {
		var doc = document;
		this.cvs = doc.querySelector('#myCanvas');
		//画布 canvas的宽度在 HTML的canvas标签中的定义、以及的在js中的定义，是画布的真实宽高。而在的CSS中设置样式，是将的画布进行拉伸
		//这里是定义画布的真实大小，绘制的时候，以这个大小进行充满
		this.cvs.height = 720;
		this.cvs.width = 1280;

		//确定宽高，避免出现小数点好多位
		//		if(this.cvs.clientHeight>=1000){
		//			this.cvs.height = 1028;
		//		}else if(this.cvs.clientHeight>=500){
		//			this.cvs.height = 800;
		//		}else{
		//			this.cvs.height = 400;
		//		};
		//		if(this.cvs.clientWidth>=1000){
		//			this.cvs.width = 720;
		//		}else if(this.cvs.clientWidth>=500){
		//			this.cvs.width = 450;
		//		}else{
		//			this.cvs.width = 225;
		//		};
		//      this.cvs.height = this.cvs.clientHeight;
		//      this.cvs.width = this.cvs.clientWidth;

		this.ctx = this.cvs.getContext('2d');

		this.imgList = doc.querySelectorAll('.img');
		this.imgIndex = 0;
		this.isAnimating = false;
		this.autoPlayObj = null;
		//      console.log(this.imgList);

		this.imgW = 1920; //图片原始宽/高
		this.imgH = 1080;

		//		this.conW = 800; //画布宽/高
		//		this.conH = 450;
		//		this.conW = 1280; //画布宽/高
		//		this.conH = 720;
		//这个大小控制绘制区域的大小， 当它比画布大小小的时候，就是只绘制了一部分画布的区域
		//画布的进行绘制部分的大小，将其充满整个画布
		this.conW = this.cvs.width;
		this.conH = this.cvs.height;
		//      console.log(this.conW); console.log(this.conH);
		//		this.dw = 25; //画布单元宽/高
		//		this.dh = 25;
		//		this.I = this.conH / this.dh; //单元行/列数
		//		this.J = this.conW / this.dw;

		//另一种方法实现，下确定行列数目，再确定宽高，这样就不会有绘制不完全的情况了
		this.I = 10; //单元行
		this.J = 10; //列数
		this.dw = (this.conW / this.J);
		//		console.log(this.dw);
		this.dh = (this.conH / this.I);
		//		console.log(this.dh);

		this.DW = this.imgW / this.J; //原图单元宽/高
		this.DH = this.imgH / this.I;

		this.randomPoint = [{
			x: 0,
			y: 0
		}, {
			x: this.I - 1,
			y: 0
		}, {
			x: 0,
			y: this.J - 1
		}, {
			x: this.I - 1,
			y: this.J - 1
		}, {
			x: 0,
			y: Math.ceil(this.J / 2)
		}, {
			x: this.I - 1,
			y: Math.ceil(this.J / 2)
		}, {
			x: Math.ceil(this.I / 2),
			y: 0
		}, {
			x: Math.ceil(this.I / 2),
			y: this.J - 1
		}]
	}

	SubType.prototype = {
		init() {

			this.ctx.beginPath();

			for(var i = 0; i < this.I; i++) {
				for(var j = 0; j < this.J; j++) {
					this.handleDraw(this.imgList[this.imgIndex], i, j);
				}
			}

			this.ctx.closePath();
			this.ctx.stroke();

			this.autoPlay();
		},

		start(i, j, callback) {

			if(this.isAnimating) return;

			this.isAnimating = true;

			this.imgIndex++;

			if(this.imgIndex > (this.imgList.length - 1)) this.imgIndex = 0;

			var _this = this,
				dst = 0,
				intervalObj = setInterval(function() {
					var resArr = _this.countAround(i, j, dst);

					resArr.forEach(function(item, index) {
						_this.handleClear(item.x, item.y);
						_this.handleDraw(_this.imgList[_this.imgIndex], item.x, item.y);
					});

					if(!resArr.length) {
						clearInterval(intervalObj);
						_this.isAnimating = false;
						return callback && callback();
					}
					dst++;
				}, 20);
		},

		handleClick(e) {

			var offsetX = e.offsetX,
				offsetY = e.offsetY,
				j = Math.floor(offsetX / this.dw),
				i = Math.floor(offsetY / this.dh),
				_this = this;

			clearInterval(this.autoPlayObj);

			this.start(i, j, function() {
				_this.autoPlay();
			});
		},

		autoPlay() {
			var _this = this;
			this.autoPlayObj = setInterval(function() {
				var randomIndex = Math.floor(Math.random() * _this.randomPoint.length),
					point = _this.randomPoint[randomIndex];
				// console.log(point);
				_this.start(point.x, point.y);
			}, 3000);
		},

		handleDraw(img, i, j) { //负责绘制，i: 单元行号；j: 单元列号
			this.ctx.drawImage(img, this.DW * j, this.DH * i, this.DW, this.DH, this.dw * j, this.dh * i, this.dw, this.dh);
		},

		handleClear(i, j) {
			this.ctx.clearRect(this.dw * j, this.dh * i, this.dw, this.dh);
		},

		countAround(i, j, dst) {
			// console.log(i, j);
			var resArr = [];
			for(var m = (i - dst); m <= (i + dst); m++) {
				for(var n = (j - dst); n <= (j + dst); n++) {
					if((Math.abs(m - i) + Math.abs(n - j) == dst) && (m >= 0 && n >= 0) && (m <= (this.I - 1) && n <= (this.J - 1))) {
						resArr.push({
							x: m,
							y: n
						});
					}
				}
			}
			// console.log(resArr);
			return resArr;
		}
	};

	var app = new SubType();

	app.init();

	app.cvs.onclick = function(e) {
		app.handleClick(e);
	}
}