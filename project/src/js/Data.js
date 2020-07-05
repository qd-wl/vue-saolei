import Vue from 'vue'
var vue = Vue.prototype

const Data = {

	init: function() {

	},

	random: function(min, max) {
		var range = max - min;
		var rand = Math.random();
		return (min + Math.round(rand * range));
	},

	setUserDefaults: function(key, value) {
		try {
			var storage = window.localStorage;
			storage.setItem(key, value);
		} catch (e) {

		}
	},

	getUserDefaults: function(key) {
		var result = "";
		try {
			var storage = window.localStorage;
			result = storage.getItem(key) || "";
		} catch (e) {

		}
		return result;
	},

	// 获取行列数
	getRowAndColumn: function(level = 1) {
		var row = 0;
		var column = 0;
		if (level < 10) {
			row = 7;
			column = 5;
		} else if (level >= 10 && level < 20) {
			row = 10;
			column = 9;
		} else if (level >= 20) {
			row = 14;
			column = 10;
		}
		return [row, column];
	},

	// level:关卡
	// 返回infoList; -1:雷 其它数字:代表周围的雷数
	getMapInfo: function(level = 1) {
		var result = this.getRowAndColumn(level);
		var row = result[0]; // 行数
		var column = result[1]; // 列数
		var factor = 5; // 雷数系数
		if (level < 10) {
			factor = 6;
		} else if (level >= 10 && level < 20) {
			factor = 6;
		} else if (level > 20) {
			factor = 5;
		}
		var mapList = [];
		var mapInfo = [];
		var totalBlock = row * column; // 块数
		for (var i = 0; i < totalBlock; i++) {
			mapList.push(0);
		}
		var bombNum = Math.floor(totalBlock / factor); // 雷数量
		var setNum = 0;
		while (true) {
			if (setNum >= bombNum) {
				break;
			}
			var random = this.random(0, totalBlock - 1);
			if (!mapList[random]) {
				mapList[random] = 1;
				setNum++;
			}
		}

		for (var i = 0; i < row; i++) {
			for (var j = 0; j < column; j++) {
				if (mapList[i * column + j]) {
					mapInfo[i * column + j] = -1; // 标示雷
				} else {
					var bombNum = 0; // 周围雷数
					var curRow = i; // 当前行
					var curColumn = j; // 当前列
					var topRow = i - 1; // 上行
					var downRow = i + 1; // 下行
					var leftColumn = j - 1; // 左列 
					var rightColumn = j + 1; // 右列
					if (topRow >= 0) {
						if (mapList[topRow * column + curColumn]) {
							bombNum++; // 正上
						}
						if (leftColumn >= 0) {
							if (mapList[topRow * column + leftColumn]) {
								bombNum++; // 左上
							}
						}
						if (rightColumn < column) {
							if (mapList[topRow * column + rightColumn]) {
								bombNum++; // 右上
							}
						}
					}
					if (downRow <= row) {
						if (mapList[downRow * column + curColumn]) {
							bombNum++; // 正下
						}
						if (leftColumn >= 0) {
							if (mapList[downRow * column + leftColumn]) {
								bombNum++; // 左下
							}
						}
						if (rightColumn < column) {
							if (mapList[downRow * column + rightColumn]) {
								bombNum++; // 右下
							}
						}
					}
					if (leftColumn >= 0) {
						if (mapList[curRow * column + leftColumn]) {
							bombNum++; // 正左
						}
					}
					if (rightColumn < column) {
						if (mapList[curRow * column + rightColumn]) {
							bombNum++; // 正右
						}
					}
					mapInfo[i * column + j] = bombNum;
				}
			}
		}

		return mapInfo;
	}
};

export default Data
