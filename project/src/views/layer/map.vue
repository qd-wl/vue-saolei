<template>
	<div class="map">
		<div class="level-desc">{{getLevelDesc}}</div>
		<div class="text-desc" :style="getPlayDescStyle">{{getPlayDesc}}</div>
		<div class="main-map">
			<div class="row" v-for="(row, rowIndex) in mRowList" :key="rowIndex">
				<div class="cell" :style="mStyle" v-for="(row, columnIndex) in mColumnList" :key="columnIndex">
					<div class="cell-content" @click="onClickBlock(rowIndex, columnIndex)" @contextmenu.prevent="onRightClickBlock(rowIndex, columnIndex)">
						<div class="float-block" v-if="!isBlockOpen(rowIndex, columnIndex)">
							<div class="red-flag-s" v-if="isBlockFlag(rowIndex, columnIndex)"></div>
						</div>
						<span class="text-num" :style="getBombNumberStyle(rowIndex, columnIndex)" v-if="isBlockOpen(rowIndex, columnIndex) && getBlockInfo(rowIndex, columnIndex) > 0">
							{{getBlockInfo(rowIndex, columnIndex)}}
						</span>
						<div class="bomb" v-if="isBlockOpen(rowIndex, columnIndex) && isBomb(rowIndex, columnIndex)"></div>
					</div>
				</div>
			</div>
		</div>

		<div class="down-part">
			<div class="bomb-info">
				<div class="bomb-icon"></div>
				<div class="bomb-desc">{{mBombDesc}}</div>
			</div>
			<div class="flag-select" :style="getFlagSelectStyle" @click="onClickFlag">
				<div class="red-flag"></div>
			</div>
		</div>

		<div style="display: flex;">
			<div class="btn-restart" @click="onClickRestart">重新开始</div>
			<div class="btn-next" @click="onClickNext">下一关</div>
		</div>

		<toast ref="refToast"></toast>
	</div>
</template>

<script>
	import toast from "../toast.vue";

	export default {
		components: {
			toast,
		},

		data() {
			return {
				mLevel: 30, // 总关卡
				mCurLevel: 1, // 当前关卡
				mRow: 0,
				mColumn: 0,
				mRowList: [],
				mColumnList: [],
				mStyle: ``,
				mLose: false, // 是否输
				mWin: false, // 是否赢
				mMapInfo: [],
				mOpenList: [], // 翻开标志列表
				mFlagList: [], // 插旗标志列表
				mSelectFlag: false, // 是否选中旗子
				mSelectFlagStyle: '',
				mBombDesc: "",
				mBombNum: 0,
				Level_Save_Key: "sao_lei_level",
			}
		},

		computed: {
			getFlagSelectStyle() {
				var style = ``;
				if (this.mSelectFlag) {
					style =
						`border-color: rgb(128, 128, 128) rgb(255, 255, 255) rgb(255, 255, 255) rgb(128, 128, 128); background:rgb(98,183,135)`;
				}
				return style;
			},

			getLevelDesc() {
				var desc = "关卡：";
				desc = desc + this.mCurLevel + " / " + this.mLevel;
				return desc;
			},

			getPlayDesc() {
				var desc = "";
				if (this.mLose) {
					desc = "任务失败，踩雷了！";
				} else if (this.mWin) {
					desc = "任务成功，你真棒！";
				}
				return desc;
			},

			getPlayDescStyle() {
				var style = `color:#0000ff`;
				if (this.mLose) {
					style = `color:#ff0000`;
				} else if (this.mWin) {
					style = `color:#00ff00`;
				}
				return style;
			}
		},

		created() {
			var lever = this.Data.getUserDefaults(this.Level_Save_Key) || 1;
			this.mCurLevel = parseInt(lever);
			this.onClickRestart();
		},

		destroyed() {

		},

		methods: {
			getBombNumberStyle: function(row, column) {
				var style = `color:rgb(0,32,245)`;
				var block = this.getBlockInfo(row, column);
				if (block == 2) {
					style = `color:rgb(53,125,34)`;
				} else if (block >= 3) {
					style = `color:rgb(236,51,35)`;
				}
				return style;
			},

			// 点击块
			onClickBlock: function(row, column) {
				this.log("onClickBlock", row, column);
				if (this.mWin || this.mLose) {
					this.log("game is over");
					return;
				}
				var index = row * this.mColumn + column;
				if (this.mOpenList[index]) {
					this.log("block is open");
					return;
				}
				if (this.mSelectFlag) {
					if (this.mFlagList[index]) {
						// 取消插旗
						this.mFlagList.splice(index, 1, false);
					} else {
						// 插旗
						this.mFlagList.splice(index, 1, true);
					}
					this.mSelectFlag = false;
					this.setBombDesc();
				} else {
					if (this.mFlagList[index]) {
						this.log("block is flag");
						return;
					}
					this.mOpenList.splice(index, 1, true);
					if (this.isBomb(row, column)) {
						// 踩雷了
						this.mLose = true;
					}
					this.autoOpen(row, column);
				}
				this.checkWin();
			},

			// 右键点击
			onRightClickBlock: function(row, column) {
				this.log("onClickBlock", row, column);
				if (this.mWin || this.mLose) {
					this.log("game is over");
					return;
				}
				var index = row * this.mColumn + column;
				if (this.mOpenList[index]) {
					this.log("block is open");
					return;
				}
				if (this.mFlagList[index]) {
					// 取消插旗
					this.mFlagList.splice(index, 1, false);
				} else {
					// 插旗
					this.mFlagList.splice(index, 1, true);
				}
				this.setBombDesc();
				this.checkWin();
			},

			// 自动递归打开周围的块
			autoOpen: function(row, column) {
				var block = this.getBlockInfo(row, column);
				if (block != 0) {
					return;
				}

				var open = function(curRow, curColumn) {
					this.log("open", curRow, curColumn);
					var topRow = curRow - 1; // 上行
					var downRow = curRow + 1; // 下行
					var leftColumn = curColumn - 1; // 左列 
					var rightColumn = curColumn + 1; // 右列

					var call = function(tempRow, tempColumn) {
						if (this.isBlockFlag(tempRow, tempColumn)) {
							return;
						}
						var blockInfo = this.getBlockInfo(tempRow, tempColumn);
						if (blockInfo == 0) {
							if (!this.isBlockOpen(tempRow, tempColumn)) {
								this.openBlock(tempRow, tempColumn);
								return open(tempRow, tempColumn);
							}
						} else if (blockInfo > 0) {
							this.openBlock(tempRow, tempColumn);
						}
					}.bind(this)

					if (topRow >= 0) {
						call(topRow, curColumn);
						if (leftColumn >= 0) {
							call(topRow, leftColumn);
						}
						if (rightColumn < this.mColumn) {
							call(topRow, rightColumn);
						}
					}
					if (downRow <= this.mRow) {
						call(downRow, curColumn);
						if (leftColumn >= 0) {
							call(downRow, leftColumn);
						}
						if (rightColumn < this.mColumn) {
							call(downRow, rightColumn);
						}
					}
					if (leftColumn >= 0) {
						call(curRow, leftColumn);
					}
					if (rightColumn < this.mColumn) {
						call(curRow, rightColumn);
					}
				}.bind(this)
				open(row, column);
			},

			// 检查是否赢了
			checkWin: function() {
				// 每个雷都插了旗子，标示赢
				var result = true;
				for (var i = 0; i < this.mMapInfo.length; i++) {
					var block = this.mMapInfo[i];
					if (block == -1) {
						// 雷
						if (!this.mFlagList[i]) {
							result = false;
							break;
						}
					}
				}
				if (result) {
					// 必须全部点开
					for (var i = 0; i < this.mOpenList.length; i++) {
						if (this.mMapInfo[i] != -1) {
							if (!this.mOpenList[i]) {
								result = false;
								break;
							}
						}
					}
				}
				this.mWin = result;
			},

			// 点击选择旗子
			onClickFlag: function() {
				this.log("onClickFlag");
				this.mSelectFlag = !this.mSelectFlag;
			},

			// 点击重新开始
			onClickRestart: function() {
				if (this.mWin) {
					this.$nextTick(function() {
						this.$refs.refToast.toast("过关了，点击下一关");
					})
					return;
				}

				var result = this.Data.getRowAndColumn(this.mCurLevel);
				this.mRow = result[0];
				this.mColumn = result[1];
				var num = 96 / this.mColumn;
				this.mStyle = `width:${num}vw;height:${num}vw`;
				this.mRowList = [];
				for (var i = 0; i < this.mRow; i++) {
					this.mRowList.push(i);
				}
				this.mColumnList = [];
				for (var i = 0; i < this.mColumn; i++) {
					this.mColumnList.push(i);
				}

				this.mOpenList = [];
				this.mFlagList = [];
				this.mLose = false;
				this.mWin = false;
				var total = this.mRow * this.mColumn;
				for (var i = 0; i < total; i++) {
					this.mOpenList.push(false);
					this.mFlagList.push(false);
				}
				this.mMapInfo = this.Data.getMapInfo(this.mCurLevel);
				this.mSelectFlag = false;
				var bombNum = 0;
				for (var i = 0; i < this.mMapInfo.length; i++) {
					if (this.mMapInfo[i] == -1) {
						bombNum++;
					}
				}
				this.mBombNum = bombNum;
				this.setBombDesc();
			},

			onClickNext: function() {
				this.log("onClickNext");
				if (this.mWin) {
					if (this.mCurLevel >= this.mLevel) {
						this.$refs.refToast.toast("恭喜你通关成功");
						return;
					} else {
						this.mCurLevel = this.mCurLevel + 1;
						this.Data.setUserDefaults(this.Level_Save_Key, this.mCurLevel);
						this.mWin = false;
						this.onClickRestart();
					}
				} else {
					this.$refs.refToast.toast("胜利后才能玩下一关");
				}
			},

			setBombDesc: function() {
				var flagNum = 0;
				for (var i = 0; i < this.mFlagList.length; i++) {
					if (this.mFlagList[i]) {
						flagNum++;
					}
				}
				var desc = flagNum + " / " + this.mBombNum;
				this.mBombDesc = desc;
			},

			// 是不是雷
			isBomb: function(row, column) {
				var info = this.getBlockInfo(row, column);
				return info == -1;
			},

			// 块是否打开
			isBlockOpen: function(row, column) {
				return this.mOpenList[row * this.mColumn + column];
			},

			// 打开块
			openBlock: function(row, column) {
				var index = row * this.mColumn + column;
				this.mOpenList.splice(index, 1, true);
			},

			// 块是否插旗
			isBlockFlag: function(row, column) {
				return this.mFlagList[row * this.mColumn + column];
			},

			// 获取块信息
			getBlockInfo: function(row, column) {
				return this.mMapInfo[row * this.mColumn + column];
			}
		}
	}
</script>

<style scoped>
	.level-desc {
		margin-bottom: 10px;
		color: #0000ff;
		font-size: 24px;
	}

	.text-desc {
		position: fixed;
		z-index: 100;
		top: 80px;
		margin-bottom: 10px;
		font-size: 30px;
		animation: act 1s infinite;
		font-weight: bold;
	}

	@keyframes act {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.1);
		}

		100% {
			transform: scale(1);
		}
	}

	.map {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.main-map {
		padding-top: 1px;
		padding-left: 1px;
		background: rgb(128, 128, 128);
	}

	.row {
		display: flex;
	}

	.cell {
		display: flex;
		max-width: 60px;
		max-height: 60px;
		cursor: default;
	}

	.cell-content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(100% - 1px);
		height: calc(100% - 1px);
		background: rgb(192, 192, 192);
	}

	.text-num {
		color: #0000ff;
		font-size: 20px;
		font-weight: bold;
	}

	.bomb {
		background: linear-gradient(180deg, #888888, #000000);
		width: 70%;
		height: 70%;
		border-radius: 50%;
	}

	.btn-restart {
		width: 100px;
		height: 45px;
		border-radius: 40px;
		background: linear-gradient(180deg, rgb(65, 168, 99), #2C3E50);
		color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16px;
		cursor: default;
	}

	.btn-restart:hover {
		border: rgb(224, 237, 211) 1px solid;
	}

	.btn-next {
		width: 100px;
		height: 45px;
		border-radius: 40px;
		background: linear-gradient(180deg, rgb(65, 168, 99), #2C3E50);
		color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16px;
		margin-left: 20px;
		cursor: default;
	}

	.btn-next:hover {
		border: rgb(224, 237, 211) 1px solid;
	}

	.float-block {
		width: 100%;
		height: 100%;
		border-width: 3px;
		border-style: solid;
		background: rgb(192, 192, 192);
		border-color: rgb(255, 255, 255) rgb(128, 128, 128) rgb(128, 128, 128) rgb(255, 255, 255);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.flag-select {
		width: 45px;
		height: 45px;
		border-width: 3px;
		border-style: solid;
		background: rgb(192, 192, 192);
		border-color: rgb(255, 255, 255) rgb(128, 128, 128) rgb(128, 128, 128) rgb(255, 255, 255);
	}

	.red-flag {
		width: 20px;
		height: 20px;
		border-width: 10px;
		border-style: solid;
		border-color: transparent rgb(236, 51, 35) transparent transparent;
		margin-top: 5px;
		margin-left: 2px;
	}

	.red-flag:after {
		content: " ";
		margin-left: 10px;
		padding-top: 10px;
		padding-bottom: 2px;
		border-right: #000000 2px solid;
	}

	.red-flag-s {
		width: 0px;
		height: 0px;
		border-width: 8px;
		border-style: solid;
		border-color: transparent rgb(236, 51, 35) transparent transparent;
		margin-top: -12px;
		margin-left: -10px;
	}

	.red-flag-s:after {
		content: " ";
		margin-left: 8px;
		padding-top: 8px;
		border-right: #000000 2px solid;
	}

	.down-part {
		display: flex;
		padding-top: 20px;
		padding-bottom: 20px;
		align-items: center;
		justify-content: center;
	}

	.bomb-info {
		margin-right: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bomb-icon {
		background: linear-gradient(180deg, #888888, #000000);
		width: 36px;
		height: 36px;
		border-radius: 50%;
	}

	.bomb-desc {
		font-size: 20px;
		margin-left: 10px;
		background-image: -webkit-linear-gradient(360deg, green, brown);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
