function $(id) {
	return document.getElementById(id);
}
var game={
	data:[],//定义一个4x4的二维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,//初始化游戏分数为0
	top:0,//初始化最高分
	state:1,//游戏的状态，进行中：1，结束：0
	RUNNING:1,//设置常量保存运行状态
	GAMEOVER:0,//结束状态
	init:function() {//初始化所有格子div的html代码
		$("gridPanel").style.width=this.CN*116+16+"px";//生成容器的大小
		$("gridPanel").style.height=this.CN*116+16+"px";
		var grids=[];//俩个数组分别保存背景格子和前景格子
		var cells=[];
		for (var r=0;r<this.RN;r++) {
			for (var c=0;c<this.CN;c++){
				grids.push('<div id="g'+r+c+'" class="grid"></div>');//将每个div的html内容以字符串形式保存在数组里面
				cells.push('<div id="c'+r+c+'" class="cell"></div>');
			}
		}
		$("gridPanel").innerHTML=grids.join("")+cells.join("");//无缝拼接数组并写入容器
	},
	start:function() {//游戏开始的方法
		var self=this//留住this！
		this.init();//生成游戏界面
		//将data初始化为RN*CN的二维数组，每个元素初始化为0
		for (var r=0;r<self.RN;r++) {//r从0开始，到<RN结束，遍历每一行
			self.data.push([]);//将data中压入一个空数组
			for(var c=0;c<self.CN;c++) {//遍历每行中的每个位置
				self.data[r][c]=0;//将data中当前位置为0
			}
		}
		$("top").innerHTML=this.getTop();
		$("gameover").style.display="none";//游戏开始隐藏gameover
		this.score=0;//游戏开始时初始化score为0
		this.state=this.RUNNING;//初始化游戏状态为运行
		self.randomNum();//游戏开始生成2个随机2/4
		self.randomNum();
		self.updateView();//游戏开始时刷新界面
		document.onkeydown=function() {//绑定键盘事件：当键盘按下时，自动触发
			if (this.state==this.RUNNING) {//游戏运行才响应键盘事件
				var e=window.event||arguments[0];
				switch(e.keyCode) {
					case 37:self.moveLeft();break;
					case 38:self.moveUp();break;
					case 39:self.moveRight();break;
					case 40:self.moveDown();break;
					case 13:self.start();break;//回车键重新开始
				}
			}
			//console.log(e.keyCode);
		}

		//console.log(self.data.join("\n"));
	},
	setTop:function(value) {//将value写入cookie中的top变量
		var now=new Date();
		now.setFullYear(now.getFullYear()+1);
		document.cookie="top="+value+";expires="+now.toGMTString();
	},
	getTop:function() {
		var top=parseInt(document.cookie.slice(4));
		return isNaN(top)?0:top;
	},
	isGameOver:function() {//定义游戏结束的状态
		for (var r=0;r<this.RN;r++) {//遍历data中的每个元素
			for(var c=0;c<this.CN;c++) {
				if (this.data[r][c]==0) {//如果当前元素不为0
					return false;
				} else if (c<this.CN-1&&this.data[r][c]==this.data[r][c+1]) {//如果当前列不是最右侧列且当前元素等于右侧元素
					return false;
				} else if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]) {//如果当前行不是最后一行且当前元素等于下方元素
					return false;
				}
			}
		}
		return true;//不满足以上三个状态则游戏结束
	},
	randomNum:function() {//在随机位置生成2/4
		for (;;) {//死循环
			var r=Math.floor(Math.random()*this.RN);//生成0到RN-1之间的随机数作为行位置
			var c=Math.floor(Math.random()*this.CN);//生成0到CN-1之间的随机数作为列位置**选出游戏开始时的随机位置
			if (this.data[r][c]==0) {
				this.data[r][c]=Math.random()<=0.5?2:4;//随机生成2或4
				break//一定要加在if里面，生成的数字放入data中了才能退出循环！
			}
		}
	},
	updateView:function() {//数据加载到页面
		for (var r=0;r<this.RN;r++) {//遍历data中的每个元素
			for(var c=0;c<this.CN;c++) {
				var id="c"+r+c;//拼接id
				var div=$(id);//使用$找到指定id的格子div对象，保存在变量div中
				if (this.data[r][c]==0) {
					div.innerHTML="";//设置格子里面地数字
					div.className="cell";//为有数字的格子添加样式
				} else {
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];
				}
			}
		}
		$("score").innerHTML=this.score;//将分数写进页面
		if (this.isGameOver()) {//如果isgameover返回true
			this.state=this.GAMEOVER;//游戏状态设为0
			$("gameover").style.display="block";//显示gameover
			$("finalScore").innerHTML=this.score;//显示分数
			if (this.score>this.getTop()) {
				this.setTop(this.score);
			}
		}
	},
	move:function(iteration) {//定义公用的move方法,并传入迭代
		var before=this.data.toString();//记录移动前的data
		iteration.call(this);//调用不同一定方法中的迭代语句
		var after=this.data.toString();//记录并比较移动操作后的data
		if (before!=after) {//如果data发生改变，生成随机位置的随机数并更新界面
			this.randomNum();
			this.updateView();
		}
	},

	moveLeft:function() {//左移
		this.move(function() {
			for (var r=0;r<this.RN;r++) {//遍历data中的每一行
				this.moveLeftInRow(r);//每遍历一行就调用一次moveLeftInRow，并传入r
			}
		});
	},
	moveLeftInRow:function(r) {//指定一行中的左移
		for (var c=0;c<this.CN-1;c++) {//遍历r行中的每个元素
			var nextc=this.getRightInRow(r,c);//返回指定位置右侧下一个不为0的位置下标
			if (nextc==-1) {//如果没找到，则退出循环
				break;
			} else if (this.data[r][c]==0) {//如果当前元素是0
				this.data[r][c]=this.data[r][nextc];//将nextc位置的值换到当前位置
				this.data[r][nextc]=0;//将nextc位置设置为0
				c--;//c留在原地，抵消循环中的变化
			} else if (this.data[r][c]==this.data[r][nextc]) {//如果当前元素==nextc位置的元素
				this.data[r][c]*=2;//将当前元素值*=2
				this.data[r][nextc]=0;//将nextc位置设置为0
				this.score+=this.data[r][c];//将合并后当前元素的值累加入score
			}
		}
	},
	getRightInRow:function(r,c) {//查找指定位置右侧下一个不为0的位置下标
		for (var nextc=c+1;nextc<this.CN;nextc++) {
			if (this.data[r][nextc]!=0) {
				return nextc;
			}
		}
		return -1;
	},

	moveRight:function() {///右移
		this.move(function() {
			for (var r=0;r<this.RN;r++) {//遍历data中的每一行
				this.moveRightInRow(r);//每遍历一行就调用一次moveRightInRow，并传入r
			}
		});	
	},
	moveRightInRow:function(r) {//指定一行中的左移
		for (var c=this.CN-1;c>0;c--) {//遍历r行中的每个元素
			var nextc=this.getLeftInRow(r,c);//查找指定位置左侧下一个不为0的位置下标
			if (nextc==-1) {
				break;
			} else if (this.data[r][c]==0) {//如果当前元素是0
				this.data[r][c]=this.data[r][nextc];//将nextc位置的值换到当前位置
				this.data[r][nextc]=0;//将nextc位置设置为0
				c++;//c留在原地，抵消循环中的变化
			} else if (this.data[r][c]==this.data[r][nextc]) {//如果当前元素==nextc位置的元素
				this.data[r][c]*=2;//将当前元素值*=2
				this.data[r][nextc]=0;//将nextc位置设置为0
				this.score+=this.data[r][c];//将合并后当前元素的值累加入score
			}
		}
	},
	getLeftInRow:function(r,c) {//查找指定位置左侧下一个不为0的位置下标
		for (var nextc=c-1;nextc>=0;nextc--) {
			if (this.data[r][nextc]!=0) {//如果该元素!=0，则返回该元素下标
				return nextc;
			}
		}
		return -1;
	},

	moveUp:function() {
		this.move(function() {
			for (var c=0;c<this.CN;c++) {//遍历data中的每一列\
				this.moveUpInCol(c);//每遍历一列调用一次moveUpInCol()，并传入参数c
			}
		});
	},
	moveUpInCol:function(c) {//每一列中的移动
		for (var r=0;r<this.RN-1;r++) {//遍历当前列
			var nextr=this.getBottomInCol(r,c);
			if (nextr==-1) {
				break;
			} else if (this.data[r][c]==0) {
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				r--;
			} else if (this.data[r][c]==this.data[nextr][c]) {
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				this.score+=this.data[r][c];//将合并后当前元素的值累加入score
			}
		}
	},
	getBottomInCol:function(r,c) {
		for (var nextr=r+1;nextr<this.RN;nextr++) {
			if (this.data[nextr][c]!=0) {
				return nextr;
			}
		}
		return-1;
	},

	moveDown:function() {
		this.move(function() {
			for (var c=0;c<this.CN;c++) {//遍历data中的每一列\
				this.moveDownInCol(c);//每遍历一列调用一次moveDownInCol()，并传入参数c
			}
		});
	},
	moveDownInCol:function(c) {//每一列中的移动
		for (var r=this.RN-1;r>0;r--) {//遍历当前列
			var nextr=this.getTopInCol(r,c);
			if (nextr==-1) {
				break;
			} else if (this.data[r][c]==0) {
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				r++;
			} else if (this.data[r][c]==this.data[nextr][c]) {
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				this.score+=this.data[r][c];//将合并后当前元素的值累加入score
			}
		}
	},
	getTopInCol:function(r,c) {
		for (var nextr=r-1;nextr>=0;nextr--) {
			if (this.data[nextr][c]!=0) {
				return nextr;
			}
		}
		return-1;
	}
}
window.onload=function() {//页面加载后自动触发
	game.start();
}