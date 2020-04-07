const path = require('path');

module.exports={
	mode:'development',
	entry:'./js/main.js',
	output:{
		path: path.resolve(__dirname,'dest'),
		filename: 'index.min.js'
	},
	//处理规则
	module:{
		rules:[
			{	
				test:/\.css$/i,
				use:[
					'style-loader',
					'css-loader',
					//'postcss-loader'
					{
						loader : 'postcss-loader',
						//代替webpack.config.js
						options : {
							plugins: [require('autoprefixer')]
						}
					}
				]
			},{
				test:/\.js$/i,
				use: 'babel-loader'
			}
		]
	}
}
