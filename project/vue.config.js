module.exports = {
	lintOnSave: false, // 关闭eslint校验
	productionSourceMap: false, // 关闭map

	// 默认小于10k的图片会转base64,改成1k
	chainWebpack: config => {
		config.module
			.rule('images')
			.use('url-loader')
			.loader('url-loader')
			.tap(options => Object.assign(options, {
				limit: 1000
			}))
	},

	publicPath: '/vue-saolei'
}
